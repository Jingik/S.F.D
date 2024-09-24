""" ImageNet Training Script

This is intended to be a lean and easily modifiable ImageNet training script that reproduces ImageNet
training results with some of the latest networks and training techniques. It favours canonical PyTorch
and standard Python style over trying to be able to 'do it all.' That said, it offers quite a few speed
and training result improvements over the usual PyTorch example scripts. Repurpose as you see fit.

This script was started from an early version of the PyTorch ImageNet example
(https://github.com/pytorch/examples/tree/master/imagenet)

NVIDIA CUDA specific speedups adopted from NVIDIA Apex examples
(https://github.com/NVIDIA/apex/tree/master/examples/imagenet)

Hacked together by / Copyright 2020 Ross Wightman (https://github.com/rwightman)
"""
import argparse
import datetime
import numpy as np
import time
import torch
import torch.backends.cudnn as cudnn
from torch.utils.tensorboard import SummaryWriter
import json
import os
# GPU 설정 (가장 먼저 설정해야 함)
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"  # GPU 장치 순서 설정
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

from pathlib import Path

from timm.data import Mixup
from timm.models import create_model
from timm.loss import LabelSmoothingCrossEntropy, SoftTargetCrossEntropy
from timm.scheduler import create_scheduler
from timm.optim import create_optimizer
from timm.utils import NativeScaler, get_state_dict, ModelEma

from models import *

from util.samplers import RASampler
from util import utils as utils
from util.optimizer import SophiaG
from util.engine import train_one_epoch, evaluate
from util.losses import DistillationLoss

from datasets import build_dataset
from datasets.threeaugment import new_data_aug_generator

from estimate_model import Predictor, Plot_ROC, OptAUC

torch.set_num_threads(1)  # CPU 스레드 수 제한
torch.set_num_interop_threads(1)  # 인터럽트 스레드 수 제한


# GPU 사용 여부 확인 및 강제 설정
if not torch.cuda.is_available():
    raise SystemExit("CUDA is not available. This program requires a GPU to run.")  # GPU가 없으면 프로그램 종료
else:
    print(f"Using GPU device: {torch.cuda.get_device_name(0)}")  # 사용 중인 GPU 이름 출력
    print(f"Available GPUs: {torch.cuda.device_count()}")  # 사용 가능한 GPU 개수 출력


def get_args_parser():
    parser = argparse.ArgumentParser(
        'MobileNetV4 training and evaluation script', add_help=False)  # 인자 파서 설정
    parser.add_argument('--batch-size', default=32, type=int)  # 배치 크기 설정 (기본값: 32)
    parser.add_argument('--epochs', default=50, type=int)  # 학습 에폭 설정 (기본값: 50)
    parser.add_argument('--predict', default=True, type=bool, help='plot ROC curve and confusion matrix')  # 예측 및 시각화 관련 설정
    parser.add_argument('--opt_auc', default=False, type=bool, help='Optimize AUC')  # AUC 최적화 여부 설정

    # 모델 관련 파라미터 설정
    parser.add_argument('--model', default='mobilenetv4_hybrid_large', type=str, metavar='MODEL',
                        choices=['mobilenetv4_small', 'mobilenetv4_medium', 'mobilenetv4_large',
                                 'mobilenetv4_hybrid_medium', 'mobilenetv4_hybrid_large'],
                        help='Name of model to train')  # 사용할 모델 이름 선택
    parser.add_argument('--input-size', default=224, type=int, help='images input size')  # 입력 이미지 크기 설정 (기본값: 224)
    parser.add_argument('--model-ema', action='store_true')  # EMA(지수 이동 평균) 모델 사용 여부 설정
    parser.add_argument('--no-model-ema', action='store_false', dest='model_ema')  # EMA 비활성화 옵션
    parser.set_defaults(model_ema=True)  # 기본적으로 EMA 사용 설정
    parser.add_argument('--model-ema-decay', type=float, default=0.99996, help='')  # EMA decay 값 설정
    parser.add_argument('--model-ema-force-cpu', action='store_true', default=False, help='')  # EMA를 CPU에서만 강제 실행 여부

    # 옵티마이저 관련 파라미터
    parser.add_argument('--opt', default='adamw', type=str, metavar='OPTIMIZER',
                        help='Optimizer (default: "adamw"')  # 사용할 옵티마이저 종류 선택
    parser.add_argument('--opt-eps', default=1e-8, type=float, metavar='EPSILON',
                        help='Optimizer Epsilon (default: 1e-8)')  # 옵티마이저의 epsilon 값 설정
    parser.add_argument('--opt-betas', default=None, type=float, nargs='+', metavar='BETA',
                        help='Optimizer Betas (default: None, use opt default)')  # 옵티마이저의 베타 값 설정
    parser.add_argument('--clip-grad', type=float, default=0.02, metavar='NORM',
                        help='Clip gradient norm (default: None, no clipping)')  # 그래디언트 클리핑 설정
    parser.add_argument('--clip-mode', type=str, default='agc',
                        help='Gradient clipping mode. One of ("norm", "value", "agc")')  # 그래디언트 클리핑 방식 설정
    parser.add_argument('--momentum', type=float, default=0.9, metavar='M',
                        help='SGD momentum (default: 0.9)')  # SGD 모멘텀 설정
    parser.add_argument('--weight-decay', type=float, default=0.025,
                        help='weight decay (default: 0.025)')  # weight decay 설정

    # 학습률 스케줄 관련 파라미터
    parser.add_argument('--sched', default='cosine', type=str, metavar='SCHEDULER',
                        help='LR scheduler (default: "cosine"')  # 학습률 스케줄러 설정
    parser.add_argument('--lr', type=float, default=1e-3, metavar='LR',
                        help='learning rate (default: 1e-3)')  # 학습률 설정
    parser.add_argument('--lr-noise', type=float, nargs='+', default=None, metavar='pct, pct',
                        help='learning rate noise on/off epoch percentages')  # 학습률 노이즈 설정
    parser.add_argument('--lr-noise-pct', type=float, default=0.67, metavar='PERCENT',
                        help='learning rate noise limit percent (default: 0.67)')  # 학습률 노이즈 한계 퍼센트
    parser.add_argument('--lr-noise-std', type=float, default=1.0, metavar='STDDEV',
                        help='learning rate noise std-dev (default: 1.0)')  # 학습률 노이즈 표준편차
    parser.add_argument('--warmup-lr', type=float, default=1e-4, metavar='LR',
                        help='warmup learning rate (default: 1e-4)')  # 웜업 학습률 설정
    parser.add_argument('--min-lr', type=float, default=1e-5, metavar='LR',
                        help='lower lr bound for cyclic schedulers that hit 0 (1e-5)')  # 최소 학습률 설정
    parser.add_argument('--decay-epochs', type=float, default=30, metavar='N',
                        help='epoch interval to decay LR')  # 학습률 감소 주기
    parser.add_argument('--warmup-epochs', type=int, default=5, metavar='N',
                        help='epochs to warmup LR, if scheduler supports')  # 웜업 에폭 설정
    parser.add_argument('--cooldown-epochs', type=int, default=10, metavar='N',
                        help='epochs to cooldown LR at min_lr, after cyclic schedule ends')  # 학습률 쿨다운 기간
    parser.add_argument('--patience-epochs', type=int, default=10, metavar='N',
                        help='patience epochs for Plateau LR scheduler (default: 10')  # Plateau 스케줄러의 patience 설정
    parser.add_argument('--decay-rate', '--dr', type=float, default=0.1, metavar='RATE',
                        help='LR decay rate (default: 0.1)')  # 학습률 감소율 설정

    # 데이터 증강 관련 파라미터
    parser.add_argument('--ThreeAugment', action='store_true')  # ThreeAugment 사용 여부
    parser.add_argument('--color-jitter', type=float, default=0.4, metavar='PCT',
                        help='Color jitter factor (default: 0.4)')  # 색상 왜곡 정도 설정
    parser.add_argument('--aa', type=str, default='rand-m9-mstd0.5-inc1', metavar='NAME',
                        help='Use AutoAugment policy. "v0" or "original". " + \
                             "(default: rand-m9-mstd0.5-inc1)'),  # AutoAugment 정책 사용
    parser.add_argument('--smoothing', type=float, default=0.1,
                        help='Label smoothing (default: 0.1)')  # 라벨 스무딩 설정
    parser.add_argument('--train-interpolation', type=str, default='bicubic',
                        help='Training interpolation (random, bilinear, bicubic default: "bicubic")')  # 학습 시 보간 방법
    parser.add_argument('--repeated-aug', action='store_true')  # 반복 증강 사용 여부
    parser.add_argument('--no-repeated-aug',
                        action='store_false', dest='repeated_aug')  # 반복 증강 미사용
    parser.set_defaults(repeated_aug=True)  # 기본적으로 반복 증강 사용 설정

    # 랜덤 지우기 관련 파라미터
    parser.add_argument('--reprob', type=float, default=0.25, metavar='PCT',
                        help='Random erase prob (default: 0.25)')  # 랜덤 지우기 확률
    parser.add_argument('--remode', type=str, default='pixel',
                        help='Random erase mode (default: "pixel")')  # 랜덤 지우기 모드 설정
    parser.add_argument('--recount', type=int, default=1,
                        help='Random erase count (default: 1)')  # 랜덤 지우기 횟수 설정
    parser.add_argument('--resplit', action='store_true', default=False,
                        help='Do not random erase first (clean) augmentation split')  # 첫 번째 증강 시 랜덤 지우기 미사용

    # Mixup 관련 파라미터
    parser.add_argument('--mixup', type=float, default=0.8,
                        help='mixup alpha, mixup enabled if > 0. (default: 0.8)')  # Mixup alpha 설정
    parser.add_argument('--cutmix', type=float, default=1.0,
                        help='cutmix alpha, cutmix enabled if > 0. (default: 1.0)')  # Cutmix alpha 설정
    parser.add_argument('--cutmix-minmax', type=float, nargs='+', default=None,
                        help='cutmix min/max ratio, overrides alpha and enables cutmix if set (default: None)')  # Cutmix 최소/최대 비율
    parser.add_argument('--mixup-prob', type=float, default=1.0,
                        help='Probability of performing mixup or cutmix when either/both is enabled')  # Mixup/Cutmix 사용 확률
    parser.add_argument('--mixup-switch-prob', type=float, default=0.5,
                        help='Probability of switching to cutmix when both mixup and cutmix enabled')  # Mixup에서 Cutmix로 전환할 확률
    parser.add_argument('--mixup-mode', type=str, default='batch',
                        help='How to apply mixup/cutmix params. Per "batch", "pair", or "elem"')  # Mixup 모드 설정

    # 지식 증류 관련 파라미터
    parser.add_argument('--teacher-model', default='regnety_160', type=str, metavar='MODEL',
                        help='Name of teacher model to train (default: "regnety_160"')  # 지식 증류 시 사용할 teacher 모델
    parser.add_argument('--teacher-path', type=str,
                        default='https://dl.fbaipublicfiles.com/deit/regnety_160-a5fe301d.pth')  # teacher 모델 가중치 경로
    parser.add_argument('--distillation-type', default='none',
                        choices=['none', 'soft', 'hard'], type=str, help="")  # 지식 증류 방식 선택
    parser.add_argument('--distillation-alpha',
                        default=0.5, type=float, help="")  # 지식 증류 alpha 값
    parser.add_argument('--distillation-tau', default=1.0, type=float, help="")  # 지식 증류 tau 값

    # 파인튜닝 관련 파라미터
    parser.add_argument('--finetune', default='',
                        help='finetune from checkpoint')  # 파인튜닝 시 체크포인트 경로
    parser.add_argument('--freeze_layers', type=bool, default=False, help='freeze layers')  # 특정 레이어 고정 여부
    parser.add_argument('--set_bn_eval', action='store_true', default=False,
                        help='set BN layers to eval mode during finetuning.')  # 배치 정규화 레이어를 평가 모드로 설정

    # 데이터셋 관련 파라미터
    parser.add_argument('--data_root', default='./datasets/Nut2', type=str,
                    help='dataset path')  # 데이터셋 경로 설정
    parser.add_argument('--nb_classes', default=2, type=int,
                        help='number classes of your dataset')  # 데이터셋 클래스 수 설정
    parser.add_argument('--data-set', default='Nut', choices=['CIFAR', 'IMNET', 'INAT', 'INAT19'],
                        type=str, help='Image Net dataset path')  # 사용할 데이터셋 선택
    parser.add_argument('--inat-category', default='name',
                        choices=['True', 'False'],
                        type=str, help='semantic granularity')  # 세분화된 카테고리 설정
    parser.add_argument('--output_dir', default='./output',
                        help='path where to save, empty for no saving')  # 출력 파일 저장 경로 설정
    parser.add_argument('--writer_output', default='./',
                        help='path where to save SummaryWriter, empty for no saving')  # SummaryWriter 파일 저장 경로
    parser.add_argument('--device', default='cuda',
                        help='device to use for training / testing')  # 학습/평가 시 사용할 디바이스 설정
    parser.add_argument('--seed', default=0, type=int)  # 시드 값 설정 (재현성을 위해 사용)
    parser.add_argument('--resume', default='', help='resume from checkpoint')  # 체크포인트에서 재개 여부 설정
    parser.add_argument('--start_epoch', default=0, type=int, metavar='N',
                        help='start epoch')  # 시작 에폭 설정
    parser.add_argument('--eval', action='store_true',
                        help='Perform evaluation only')  # 평가만 수행할지 여부 설정
    parser.add_argument('--dist-eval', action='store_true',
                        default=False, help='Enabling distributed evaluation')  # 분산 평가 사용 여부 설정
    parser.add_argument('--num_workers', default=0, type=int)  # 데이터 로딩 시 워커 수 설정
    parser.add_argument('--pin-mem', action='store_true',
                        help='Pin CPU memory in DataLoader for more efficient (sometimes) transfer to GPU.')  # 메모리 고정 설정
    parser.add_argument('--no-pin-mem', action='store_false', dest='pin_mem',
                        help='')  # 메모리 고정 해제 옵션
    parser.set_defaults(pin_mem=True)  # 기본적으로 메모리 고정 사용 설정

    # 학습 관련 파라미터
    parser.add_argument('--world_size', default=1, type=int,
                        help='number of distributed processes')  # 분산 처리의 프로세스 수 설정
    parser.add_argument('--local_rank', default=0, type=int)  # 로컬 랭크 설정
    parser.add_argument('--dist_url', default='env://',
                        help='url used to set up distributed training')  # 분산 학습 설정 URL
    parser.add_argument('--save_freq', default=1, type=int,
                        help='frequency of model saving')  # 모델 저장 빈도 설정
    return parser  # 인자 파서 반환


from datetime import timedelta
from datetime import datetime
from pathlib import Path
from torch.utils.data import Dataset


# 데이터셋의 라벨을 재지정하는 클래스
class RelabelDataset(Dataset):  
    def __init__(self, dataset):
        self.dataset = dataset  # 기존 데이터셋을 받아 저장

    # 데이터셋의 index 번째 데이터를 가져올 때 호출되는 함수
    def __getitem__(self, index):  
        img, label = self.dataset[index]  # 데이터셋에서 이미지와 라벨을 가져옴
        # 특정 라벨 값을 변경 (1은 0으로, 2는 1로)
        if label == 1:
            label = 0
        elif label == 2:
            label = 1
        return img, label  # 수정된 라벨과 이미지를 반환

    # 데이터셋의 총 길이를 반환하는 함수
    def __len__(self):  
        return len(self.dataset)  # 데이터셋의 크기를 반환

        

def main(args):
    print(args)  # 명령줄 인자 출력 (사용자가 전달한 설정 확인)
    utils.init_distributed_mode(args)  # 분산 학습 모드 초기화 (분산 학습 환경 설정)

    # 로컬 랭크가 0인 경우에만 로그 저장 및 TensorBoard와 같은 기록을 위해 SummaryWriter 사용
    if args.local_rank == 0:  
        writer = SummaryWriter(os.path.join(args.writer_output, 'runs'))

    # 지식 증류와 파인튜닝이 동시에 활성화되었을 경우 아직 미지원 경고를 띄우고 종료
    if args.distillation_type != 'none' and args.finetune and not args.eval:
        raise NotImplementedError("Finetuning with distillation not yet supported")

    # 학습을 진행할 디바이스 설정 (GPU 또는 CPU)
    device = torch.device(args.device)

    # 재현성 보장을 위한 시드(seed) 설정 (실험의 일관성을 위해)
    seed = args.seed + utils.get_rank()  # 각 프로세스마다 고유 시드 값을 가짐
    torch.manual_seed(seed)  # PyTorch에서 시드 설정
    np.random.seed(seed)  # NumPy에서 시드 설정

    cudnn.benchmark = True  # CUDA 성능 최적화를 위해 cudnn 벤치마크 모드 활성화

    # 학습용 및 검증용 데이터셋 빌드
    dataset_train, dataset_val = build_dataset(args=args)  
    dataset_train = RelabelDataset(dataset_train)  # 학습 데이터셋의 라벨을 재지정
    dataset_val = RelabelDataset(dataset_val)  # 검증 데이터셋의 라벨을 재지정

    # 분산 학습 모드일 경우
    if args.distributed:
        num_tasks = utils.get_world_size()  # 전체 분산 프로세스 수 계산
        global_rank = utils.get_rank()  # 현재 프로세스의 전역 랭크 (분산 학습에서 각 프로세스의 고유 ID)
        
        # 반복 증강 사용 시 RASampler 사용 (학습 데이터셋을 무작위로 샘플링)
        if args.repeated_aug:
            sampler_train = RASampler(dataset_train, num_replicas=num_tasks, rank=global_rank, shuffle=True)
        else:
            sampler_train = torch.utils.data.DistributedSampler(dataset_train, num_replicas=num_tasks, rank=global_rank, shuffle=True)
        
        # 분산 평가가 활성화된 경우
        if args.dist_eval:
            # 데이터셋이 프로세스 수로 나누어 떨어지지 않을 경우 경고 메시지 출력
            if len(dataset_val) % num_tasks != 0:
                print('Warning: Enabling distributed evaluation with an eval dataset not divisible by process number.')
            sampler_val = torch.utils.data.DistributedSampler(dataset_val, num_replicas=num_tasks, rank=global_rank, shuffle=False)
        else:
            sampler_val = torch.utils.data.SequentialSampler(dataset_val)  # 검증 데이터셋을 순차적으로 샘플링
    else:
        sampler_train = torch.utils.data.RandomSampler(dataset_train)  # 학습 데이터셋을 랜덤으로 샘플링
        sampler_val = torch.utils.data.SequentialSampler(dataset_val)  # 검증 데이터셋은 순차적으로 샘플링

    # 학습 데이터 로더 (batch_size, num_workers 등 설정에 맞춰 데이터 로드)
    data_loader_train = torch.utils.data.DataLoader(
        dataset_train, sampler=sampler_train, batch_size=args.batch_size,
        num_workers=args.num_workers, pin_memory=args.pin_mem, drop_last=True
    )

    # ThreeAugment가 활성화된 경우 데이터 증강 적용
    if args.ThreeAugment:
        data_loader_train.dataset.transform = new_data_aug_generator(args)

    # 검증 데이터 로더 설정
    data_loader_val = torch.utils.data.DataLoader(
        dataset_val, sampler=sampler_val, batch_size=int(1.5 * args.batch_size),
        num_workers=args.num_workers, pin_memory=args.pin_mem, drop_last=False
    )

    # 데이터 로더에서 한 번 라벨 출력 (라벨 값이 정상적으로 변경되었는지 확인)
    for images, labels in data_loader_train:
        print(set(labels.tolist()))  # 라벨 값 확인 (처음 한 번만 출력)
        break

    # Mixup 함수 초기화 (Mixup 데이터 증강 기법 사용 여부 확인)
    mixup_fn = None  # 초기화
    mixup_active = args.mixup > 0 or args.cutmix > 0. or args.cutmix_minmax is not None  # Mixup 활성화 여부
    if mixup_active:
        # Mixup 또는 CutMix 활성화 시 해당 옵션에 맞춰 함수 설정
        mixup_fn = Mixup(
            mixup_alpha=args.mixup, cutmix_alpha=args.cutmix, cutmix_minmax=args.cutmix_minmax,
            prob=args.mixup_prob, switch_prob=args.mixup_switch_prob, mode=args.mixup_mode,
            label_smoothing=args.smoothing, num_classes=args.nb_classes
        )

    # 모델 생성
    print(f"Creating model: {args.model}")  # 모델 종류 출력
    print(f"Number of classes: {args.nb_classes}")  # 클래스 수 출력

    # 지정한 MobileNetV4 소형 모델을 생성
    model = mobilenetv4_small(num_classes=args.nb_classes)

    # 파인튜닝을 할 경우 (pretrained 모델에서 학습을 이어받아 수행)
    if args.finetune:
        if args.finetune.startswith('https'):  # 체크포인트가 URL에 있을 경우
            checkpoint = torch.hub.load_state_dict_from_url(args.finetune, map_location='cpu', check_hash=True)
        else:  # 로컬 파일에 있을 경우
            checkpoint = utils.load_model(args.finetune, model)

        checkpoint_model = checkpoint['model']

        # 모델의 'head' 레이어 제거 (해당 레이어는 파인튜닝 시 다시 학습하기 위해 제거)
        for k in list(checkpoint_model.keys()):
            if 'head' in k:
                print(f"Removing key {k} from pretrained checkpoint")
                del checkpoint_model[k]

        # 체크포인트에서 모델 파라미터를 불러와 현재 모델에 로드
        msg = model.load_state_dict(checkpoint_model, strict=False)
        print(msg)

        # 특정 레이어 고정 (일부 레이어는 학습하지 않고 고정시킴)
        if args.freeze_layers:
            for name, para in model.named_parameters():
                if 'head' not in name:  # head 이외의 레이어는 학습하지 않음
                    para.requires_grad_(False)  # 레이어의 파라미터를 고정
                else:
                    print('training {}'.format(name))  # 학습할 레이어 이름 출력

    # 모델을 GPU 또는 CPU로 이동
    model.to(device)

    # EMA 모델 사용 여부에 따른 EMA 설정
    model_ema = None
    if args.model_ema:  # EMA가 활성화된 경우
        model_ema = ModelEma(
            model, decay=args.model_ema_decay, device='cpu' if args.model_ema_force_cpu else '', resume=''
        )

    # 분산 학습을 위해 모델을 DistributedDataParallel로 감쌈
    model_without_ddp = model
    if args.distributed:
        model = torch.nn.parallel.DistributedDataParallel(model, device_ids=[args.gpu])
        model_without_ddp = model.module  # DDP에서는 원래 모델은 .module로 접근

    # 학습 가능한 파라미터의 총 개수 계산 및 출력
    n_parameters = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print('number of params:', n_parameters)  # 파라미터 수 출력

    # 학습률 스케일 조정 (batch size에 맞춰 학습률을 선형으로 스케일링)
    linear_scaled_lr = args.lr * args.batch_size * utils.get_world_size() / 512.0

    # 옵티마이저 생성
    optimizer = create_optimizer(args, model_without_ddp)

    # 스케일러 생성 (AMP 사용을 위해)
    loss_scaler = NativeScaler()

    # 학습률 스케줄러 생성
    lr_scheduler, _ = create_scheduler(args, optimizer)

    # 손실 함수 설정 (라벨 스무딩 사용)
    criterion = LabelSmoothingCrossEntropy()

    # Mixup이 활성화된 경우 SoftTargetCrossEntropy를 손실 함수로 설정
    if args.mixup > 0.:
        criterion = SoftTargetCrossEntropy()
    elif args.smoothing:
        criterion = LabelSmoothingCrossEntropy(smoothing=args.smoothing)
    else:
        criterion = torch.nn.CrossEntropyLoss()  # 기본적으로 CrossEntropyLoss 사용

    # 지식 증류가 활성화된 경우 teacher 모델 생성 및 설정
    teacher_model = None
    if args.distillation_type != 'none':
        assert args.teacher_path, '지식 증류를 사용하려면 teacher 모델의 경로를 지정해야 합니다.'
        print(f"Creating teacher model: {args.teacher_model}")
        teacher_model = create_model(args.teacher_model, pretrained=False, num_classes=args.nb_classes, global_pool='avg')

        # teacher 모델의 체크포인트를 로드
        if args.teacher_path.startswith('https'):
            checkpoint = torch.hub.load_state_dict_from_url(args.teacher_path, map_location='cpu', check_hash=True)
        else:
            checkpoint = torch.load(args.teacher_path, map_location='cpu')

        teacher_model.load_state_dict(checkpoint['model'])
        teacher_model.to(device)
        teacher_model.eval()  # teacher 모델을 평가 모드로 설정

    # DistillationLoss 적용 (지식 증류 사용 시)
    criterion = DistillationLoss(criterion, teacher_model, args.distillation_type, args.distillation_alpha, args.distillation_tau)

    # 최고 정확도 초기화
    max_accuracy = 0.0

    # 출력 경로 설정 및 로그 파일 저장
    output_dir = Path(args.output_dir)
    if args.output_dir and utils.is_main_process():
        with (output_dir / "model.txt").open("a") as f:
            f.write(str(model))
    if args.output_dir and utils.is_main_process():
        with (output_dir / "args.txt").open("a") as f:
            f.write(json.dumps(args.__dict__, indent=2) + "\n")

    # 체크포인트에서 학습 재개
    if args.resume or os.path.exists(f'{args.output_dir}/{args.model}_best_checkpoint.pth'):
        args.resume = f'{args.output_dir}/{args.model}_best_checkpoint.pth'
        if args.resume.startswith('https'):
            checkpoint = torch.hub.load_state_dict_from_url(args.resume, map_location='cpu', check_hash=True)
        else:
            print(f"Loading local checkpoint at {args.resume}")
            checkpoint = torch.load(args.resume, map_location='cpu')

        msg = model_without_ddp.load_state_dict(checkpoint['model'])
        print(msg)

        # 체크포인트에서 옵티마이저, 학습률 스케줄러, 에폭 정보를 로드
        if not args.eval and 'optimizer' in checkpoint and 'lr_scheduler' in checkpoint and 'epoch' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer'])
            for state in optimizer.state.values():
                for k, v in state.items():
                    if isinstance(v, torch.Tensor):  # 옵티마이저 상태 중 텐서 데이터만 GPU로 이동
                        state[k] = v.cuda()

            lr_scheduler.load_state_dict(checkpoint['lr_scheduler'])  # 학습률 스케줄러 상태 복원
            max_accuracy = checkpoint['best_score']  # 체크포인트에서 최고 정확도 불러오기
            print(f'Now max accuracy is {max_accuracy}')
            args.start_epoch = checkpoint['epoch'] + 1  # 다음 에폭에서 시작

            # EMA 모델이 사용되는 경우, EMA 상태 복원
            if args.model_ema:
                utils._load_checkpoint_for_ema(model_ema, checkpoint['model_ema'])

            # AMP 스케일러 상태 복원 (자동 혼합 정밀도 사용 시)
            if 'scaler' in checkpoint:
                loss_scaler.load_state_dict(checkpoint['scaler'])

    # 평가 모드일 경우, 평가만 수행하고 종료
    if args.eval:
        print(f"Evaluating model: {args.model}")
        test_stats = evaluate(data_loader_val, model, device, None, None, args, visualization=False)  # 평가 수행
        print(f"Accuracy of the network on the {len(dataset_val)} test images: {test_stats['acc1']:.1f}%")  # 정확도 출력
        return  # 평가 후 종료

    print(f"Start training for {args.epochs} epochs")  # 학습 시작 메시지 출력
    start_time = time.time()  # 학습 시작 시간 기록

    # 현재 날짜별로 폴더 생성 (날짜별 체크포인트 저장을 위한 경로)
    today = datetime.today().strftime('%Y-%m-%d')  # 오늘 날짜를 폴더명으로 사용
    output_dir = Path(os.path.join(args.output_dir, today))  # 출력 경로 설정
    output_dir.mkdir(parents=True, exist_ok=True)  # 경로가 없을 경우, 생성

    # 각 에폭(epoch)마다 학습과 평가를 반복
    for epoch in range(args.start_epoch, args.epochs):
        if args.distributed:
            data_loader_train.sampler.set_epoch(epoch)  # 분산 학습에서 매 에폭마다 샘플링 재설정

        # 한 에폭 동안 학습 수행
        train_stats = train_one_epoch(
            model, criterion, data_loader_train,
            optimizer, device, epoch, loss_scaler,
            args.clip_grad, args.clip_mode, model_ema, mixup_fn,
            set_training_mode=True,
            set_bn_eval=args.set_bn_eval,
            writer=writer,
            args=args
        )

        lr_scheduler.step(epoch)  # 에폭 종료 후 학습률 스케줄러 업데이트

        # 검증 데이터셋에 대해 모델 평가
        test_stats = evaluate(data_loader_val, model, device, epoch, writer, args, visualization=True)
        print(f"Accuracy of the network on the {len(dataset_val)} test images: {test_stats['acc1']:.1f}%")

        # 각 에폭마다 모델 체크포인트를 저장
        if args.output_dir:
            ckpt_path = os.path.join(output_dir, f'{args.model}_epoch_{epoch}.pth')  # 체크포인트 경로 설정
            checkpoint_paths = [ckpt_path]
            print(f"Saving checkpoint to {ckpt_path}")
            for checkpoint_path in checkpoint_paths:
                # 모델의 현재 상태, 옵티마이저, 스케일러, EMA 등을 저장
                utils.save_on_master({
                    'model': model_without_ddp.state_dict(),  # 모델 파라미터 저장
                    'optimizer': optimizer.state_dict(),  # 옵티마이저 상태 저장
                    'lr_scheduler': lr_scheduler.state_dict(),  # 학습률 스케줄러 상태 저장
                    'epoch': epoch,  # 현재 에폭 저장
                    'best_score': test_stats['acc1'],  # 현재 에폭의 최고 정확도 저장
                    'model_ema': get_state_dict(model_ema),  # EMA 모델 상태 저장
                    'scaler': loss_scaler.state_dict(),  # AMP 스케일러 상태 저장
                    'args': args,  # 현재 설정된 인자 값 저장
                }, checkpoint_path)

        print(f'Max accuracy: {test_stats["acc1"]:.2f}%')  # 현재까지 최고 정확도 출력

        # 학습 및 평가 통계 기록 (각 에폭마다의 결과 저장)
        log_stats = {**{f'train_{k}': v for k, v in train_stats.items()},
                     **{f'test_{k}': v for k, v in test_stats.items()},
                     'epoch': epoch,
                     'n_parameters': n_parameters}  # 모델 파라미터 수도 기록

        # 로그를 파일에 저장 (메인 프로세스에서만 저장)
        if args.output_dir and utils.is_main_process():
            with (output_dir / "log.txt").open("a") as f:
                f.write(json.dumps(log_stats) + "\n")  # JSON 형식으로 저장

    # 학습 종료 시간 계산
    total_time = time.time() - start_time
    total_time_str = str(timedelta(seconds=int(total_time)))  # 시간을 보기 좋은 형식으로 변환
    print(f'Training time {total_time_str}')  # 총 학습 시간 출력

    # ROC 곡선과 혼동 행렬 그리기 (예측을 활성화했을 경우)
    if args.predict and utils.is_main_process():
        model_predict = create_model(args.model, num_classes=args.nb_classes)  # 예측용 모델 생성
        model_predict.to(device)  # 디바이스로 모델 전송
        print('*******************STARTING PREDICT*******************')
        
        # 예측 수행 및 ROC 그리기
        Predictor(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)
        Plot_ROC(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)

        # AUC 최적화가 활성화된 경우, AUC 최적화 수행
        if args.opt_auc:
            OptAUC(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        'MobileNetV4 training and evaluation script', parents=[get_args_parser()])  # 메인 함수에서 인자 파서 생성
    args = parser.parse_args()  # 인자 파싱
    if args.output_dir:  # 출력 경로가 설정된 경우 폴더 생성
        Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    main(args)  # 메인 함수 실행
