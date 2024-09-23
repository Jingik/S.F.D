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
        'MobileNetV4 training and evaluation script', add_help=False)  # argparse로 인자 파서 설정
    parser.add_argument('--batch-size', default=32, type=int)  # 배치 크기 설정
    parser.add_argument('--epochs', default=50, type=int)  # 학습 에폭 설정
    parser.add_argument('--predict', default=True, type=bool, help='plot ROC curve and confusion matrix')  # 예측 관련 설정
    parser.add_argument('--opt_auc', default=False, type=bool, help='Optimize AUC')  # AUC 최적화 여부 설정

    # Model parameters (모델 관련 파라미터)
    parser.add_argument('--model', default='mobilenetv4_hybrid_large', type=str, metavar='MODEL',
                        choices=['mobilenetv4_small', 'mobilenetv4_medium', 'mobilenetv4_large',
                                 'mobilenetv4_hybrid_medium', 'mobilenetv4_hybrid_large'],
                        help='Name of model to train')  # 사용할 모델 이름 선택
    parser.add_argument('--input-size', default=224, type=int, help='images input size')  # 입력 이미지 크기 설정
    parser.add_argument('--model-ema', action='store_true')  # EMA 모델 사용 여부 설정
    parser.add_argument('--no-model-ema', action='store_false', dest='model_ema')  # EMA 비활성화 옵션
    parser.set_defaults(model_ema=True)  # 기본적으로 EMA 사용 설정
    parser.add_argument('--model-ema-decay', type=float, default=0.99996, help='')  # EMA decay 값 설정
    parser.add_argument('--model-ema-force-cpu', action='store_true', default=False, help='')  # EMA를 CPU에서 강제 사용 여부

    # Optimizer parameters (최적화 관련 파라미터)
    parser.add_argument('--opt', default='adamw', type=str, metavar='OPTIMIZER',
                        help='Optimizer (default: "adamw"')  # 사용할 최적화 알고리즘
    parser.add_argument('--opt-eps', default=1e-8, type=float, metavar='EPSILON',
                        help='Optimizer Epsilon (default: 1e-8)')  # 옵티마이저의 epsilon 값
    parser.add_argument('--opt-betas', default=None, type=float, nargs='+', metavar='BETA',
                        help='Optimizer Betas (default: None, use opt default)')  # 옵티마이저의 beta 값
    parser.add_argument('--clip-grad', type=float, default=0.02, metavar='NORM',
                        help='Clip gradient norm (default: None, no clipping)')  # 그래디언트 클리핑 설정
    parser.add_argument('--clip-mode', type=str, default='agc',
                        help='Gradient clipping mode. One of ("norm", "value", "agc")')  # 그래디언트 클리핑 방식 설정
    parser.add_argument('--momentum', type=float, default=0.9, metavar='M',
                        help='SGD momentum (default: 0.9)')  # 모멘텀 설정
    parser.add_argument('--weight-decay', type=float, default=0.025,
                        help='weight decay (default: 0.025)')  # weight decay 설정

    # Learning rate schedule parameters (학습률 스케줄 관련 설정)
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
                        help='lower lr bound for cyclic schedulers that hit 0 (1e-5)')  # 최소 학습률
    parser.add_argument('--decay-epochs', type=float, default=30, metavar='N',
                        help='epoch interval to decay LR')  # 학습률 감소 주기 설정
    parser.add_argument('--warmup-epochs', type=int, default=5, metavar='N',
                        help='epochs to warmup LR, if scheduler supports')  # 학습률 웜업 기간 설정
    parser.add_argument('--cooldown-epochs', type=int, default=10, metavar='N',
                        help='epochs to cooldown LR at min_lr, after cyclic schedule ends')  # 학습률 쿨다운 기간
    parser.add_argument('--patience-epochs', type=int, default=10, metavar='N',
                        help='patience epochs for Plateau LR scheduler (default: 10')  # Plateau 스케줄러에서 patience 설정
    parser.add_argument('--decay-rate', '--dr', type=float, default=0.1, metavar='RATE',
                        help='LR decay rate (default: 0.1)')  # 학습률 감소율

    # Augmentation parameters (데이터 증강 파라미터)
    parser.add_argument('--ThreeAugment', action='store_true')  # ThreeAugment 사용 여부
    parser.add_argument('--color-jitter', type=float, default=0.4, metavar='PCT',
                        help='Color jitter factor (default: 0.4)')  # 색상 왜곡 설정
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

    # Random Erase params (랜덤 지우기 관련 파라미터)
    parser.add_argument('--reprob', type=float, default=0.25, metavar='PCT',
                        help='Random erase prob (default: 0.25)')  # 랜덤 지우기 확률
    parser.add_argument('--remode', type=str, default='pixel',
                        help='Random erase mode (default: "pixel")')  # 랜덤 지우기 모드 설정
    parser.add_argument('--recount', type=int, default=1,
                        help='Random erase count (default: 1)')  # 랜덤 지우기 횟수
    parser.add_argument('--resplit', action='store_true', default=False,
                        help='Do not random erase first (clean) augmentation split')  # 첫 번째 증강 시 랜덤 지우기 미사용

    # Mixup params (Mixup 관련 파라미터)
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

    # Distillation parameters (지식 증류 관련 파라미터)
    parser.add_argument('--teacher-model', default='regnety_160', type=str, metavar='MODEL',
                        help='Name of teacher model to train (default: "regnety_160"')  # 지식 증류 시 사용할 teacher 모델
    parser.add_argument('--teacher-path', type=str,
                        default='https://dl.fbaipublicfiles.com/deit/regnety_160-a5fe301d.pth')  # teacher 모델 가중치 경로
    parser.add_argument('--distillation-type', default='none',
                        choices=['none', 'soft', 'hard'], type=str, help="")  # 지식 증류 방식 선택
    parser.add_argument('--distillation-alpha',
                        default=0.5, type=float, help="")  # 지식 증류 alpha 값
    parser.add_argument('--distillation-tau', default=1.0, type=float, help="")  # 지식 증류 tau 값

    # Finetuning params (파인튜닝 관련 파라미터)
    parser.add_argument('--finetune', default='',
                        help='finetune from checkpoint')  # 파인튜닝 시 체크포인트 경로
    parser.add_argument('--freeze_layers', type=bool, default=False, help='freeze layers')  # 특정 레이어 고정 여부
    parser.add_argument('--set_bn_eval', action='store_true', default=False,
                        help='set BN layers to eval mode during finetuning.')  # 배치 정규화 레이어를 평가 모드로 설정

    # Dataset parameters (데이터셋 관련 파라미터)
    parser.add_argument('--data_root', default='./datasets/Nut2', type=str,
                    help='dataset path')  # 데이터셋 경로 설정
    
    parser.add_argument('--nb_classes', default=2, type=int,
                        help='number classes of your dataset')  # 데이터셋 클래스 수
    parser.add_argument('--data-set', default='Nut', choices=['CIFAR', 'IMNET', 'INAT', 'INAT19'],
                        type=str, help='Image Net dataset path')  # 데이터셋 선택
    parser.add_argument('--inat-category', default='name',
                        choices=['True', 'False'],
                        type=str, help='semantic granularity')  # 세분화된 카테고리 설정
    parser.add_argument('--output_dir', default='./output',
                        help='path where to save, empty for no saving')  # 출력 파일 저장 경로
    parser.add_argument('--writer_output', default='./',
                        help='path where to save SummaryWriter, empty for no saving')  # SummaryWriter 저장 경로
    parser.add_argument('--device', default='cuda',
                        help='device to use for training / testing')  # 사용할 디바이스 설정
    parser.add_argument('--seed', default=0, type=int)  # 시드 값 설정
    parser.add_argument('--resume', default='', help='resume from checkpoint')  # 체크포인트에서 재개 여부
    parser.add_argument('--start_epoch', default=0, type=int, metavar='N',
                        help='start epoch')  # 시작 에폭
    parser.add_argument('--eval', action='store_true',
                        help='Perform evaluation only')  # 평가만 수행할지 여부
    parser.add_argument('--dist-eval', action='store_true',
                        default=False, help='Enabling distributed evaluation')  # 분산 평가 사용 여부
    parser.add_argument('--num_workers', default=0, type=int)  # 데이터 로딩 시 워커 수 설정
    parser.add_argument('--pin-mem', action='store_true',
                        help='Pin CPU memory in DataLoader for more efficient (sometimes) transfer to GPU.')  # 메모리 고정 여부
    parser.add_argument('--no-pin-mem', action='store_false', dest='pin_mem',
                        help='')  # 메모리 고정 해제 옵션
    parser.set_defaults(pin_mem=True)  # 기본적으로 메모리 고정 사용

    # training parameters (학습 관련 파라미터)
    parser.add_argument('--world_size', default=1, type=int,
                        help='number of distributed processes')  # 분산 처리 수
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


class RelabelDataset(Dataset):  # 데이터셋 라벨 재지정 클래스
    def __init__(self, dataset):
        self.dataset = dataset

    def __getitem__(self, index):  # 데이터셋의 각 아이템을 불러올 때 라벨 재지정
        img, label = self.dataset[index]
        if label == 1:
            label = 0
        elif label == 2:
            label = 1
        return img, label

    def __len__(self):
        return len(self.dataset)  # 데이터셋 길이 반환

        

def main(args):
    print(args)  # 인자 출력
    utils.init_distributed_mode(args)  # 분산 학습 모드 초기화

    if args.local_rank == 0:  # 로컬 랭크가 0일 때만 SummaryWriter 사용
        writer = SummaryWriter(os.path.join(args.writer_output, 'runs'))

    if args.distillation_type != 'none' and args.finetune and not args.eval:
        raise NotImplementedError(
            "Finetuning with distillation not yet supported")  # 지식 증류와 파인튜닝은 아직 미지원

    device = torch.device(args.device)  # 디바이스 설정

    # 재현성을 위해 시드 설정
    seed = args.seed + utils.get_rank()
    torch.manual_seed(seed)
    np.random.seed(seed)

    cudnn.benchmark = True  # 성능 최적화를 위한 benchmark 활성화

    dataset_train, dataset_val = build_dataset(args=args)  # 데이터셋 빌드
    dataset_train = RelabelDataset(dataset_train)  # 학습 데이터 라벨 재지정
    dataset_val = RelabelDataset(dataset_val)  # 검증 데이터 라벨 재지정

    
    if args.distributed:  # 분산 학습 설정
        num_tasks = utils.get_world_size()
        global_rank = utils.get_rank()
        if args.repeated_aug:
            sampler_train = RASampler(
                dataset_train, num_replicas=num_tasks, rank=global_rank, shuffle=True
            )
        else:
            sampler_train = torch.utils.data.DistributedSampler(
                dataset_train, num_replicas=num_tasks, rank=global_rank, shuffle=True
            )
        if args.dist_eval:
            if len(dataset_val) % num_tasks != 0:
                print('Warning: Enabling distributed evaluation with an eval dataset not divisible by process number. '
                      'This will slightly alter validation results as extra duplicate entries are added to achieve '
                      'equal num of samples per-process.')  # 분산 평가 시 경고 메시지 출력
            sampler_val = torch.utils.data.DistributedSampler(
                dataset_val, num_replicas=num_tasks, rank=global_rank, shuffle=False)
        else:
            sampler_val = torch.utils.data.SequentialSampler(dataset_val)
    else:
        sampler_train = torch.utils.data.RandomSampler(dataset_train)  # 학습용 랜덤 샘플러
        sampler_val = torch.utils.data.SequentialSampler(dataset_val)  # 검증용 순차 샘플러

    data_loader_train = torch.utils.data.DataLoader(
        dataset_train, sampler=sampler_train,
        batch_size=args.batch_size,
        num_workers=args.num_workers,
        pin_memory=args.pin_mem,
        drop_last=True,
    )

    if args.ThreeAugment:  # ThreeAugment 사용 시 데이터 증강 적용
        data_loader_train.dataset.transform = new_data_aug_generator(args)

    data_loader_val = torch.utils.data.DataLoader(
        dataset_val, sampler=sampler_val,
        batch_size=int(1.5 * args.batch_size),
        num_workers=args.num_workers,
        pin_memory=args.pin_mem,
        drop_last=False
    )
# 데이터 로더에서 라벨 출력 확인
    for images, labels in data_loader_train:
        print(set(labels.tolist()))  # 데이터셋에 포함된 라벨 값을 확인
        break




    
    mixup_fn = None  # Mixup 함수 초기화
    mixup_active = args.mixup > 0 or args.cutmix > 0. or args.cutmix_minmax is not None  # Mixup 활성화 여부
    if mixup_active:
        mixup_fn = Mixup(
            mixup_alpha=args.mixup, cutmix_alpha=args.cutmix, cutmix_minmax=args.cutmix_minmax,
            prob=args.mixup_prob, switch_prob=args.mixup_switch_prob, mode=args.mixup_mode,
            label_smoothing=args.smoothing, num_classes=args.nb_classes)  # Mixup 설정

    print(f"Creating model: {args.model}")  # 모델 생성 메시지 출력
    print(f"Number of classes: {args.nb_classes}")  # 클래스 수 출력

    model = mobilenetv4_small(num_classes=args.nb_classes)  # MobileNetV4 소형 모델 생성

    if args.finetune:  # 파인튜닝 옵션이 있을 경우
        if args.finetune.startswith('https'):
            checkpoint = torch.hub.load_state_dict_from_url(
                args.finetune, map_location='cpu', check_hash=True)  # 체크포인트 URL로부터 로드
        else:
            checkpoint = utils.load_model(args.finetune, model)  # 로컬에서 체크포인트 로드

        checkpoint_model = checkpoint['model']
        # 학습할 때 불필요한 키 제거
        for k in list(checkpoint_model.keys()):
            if 'head' in k:
                print(f"Removing key {k} from pretrained checkpoint")
                del checkpoint_model[k]

        msg = model.load_state_dict(checkpoint_model, strict=False)  # 체크포인트에서 모델 상태 불러오기
        print(msg)

        if args.freeze_layers:  # 레이어 고정 여부에 따라 설정
            for name, para in model.named_parameters():
                if 'head' not in name:
                    para.requires_grad_(False)
                else:
                    print('training {}'.format(name))

    model.to(device)  # 모델을 디바이스로 전송

    model_ema = None
    if args.model_ema:  # EMA 모델 사용 시 EMA 설정
        model_ema = ModelEma(
            model,
            decay=args.model_ema_decay,
            device='cpu' if args.model_ema_force_cpu else '',
            resume='')

    model_without_ddp = model
    if args.distributed:  # 분산 학습일 경우
        model = torch.nn.parallel.DistributedDataParallel(
            model, device_ids=[args.gpu])
        model_without_ddp = model.module  # DDP 설정
    n_parameters = sum(p.numel() for p in model.parameters() if p.requires_grad)  # 파라미터 수 계산
    print('number of params:', n_parameters)  # 파라미터 수 출력

    linear_scaled_lr = args.lr * args.batch_size * utils.get_world_size() / 512.0  # 학습률 스케일 조정

    optimizer = create_optimizer(args, model_without_ddp)  # 옵티마이저 생성

    loss_scaler = NativeScaler()  # 스케일러 생성
    lr_scheduler, _ = create_scheduler(args, optimizer)  # 학습률 스케줄러 생성

    criterion = LabelSmoothingCrossEntropy()  # 기본 손실 함수로 라벨 스무딩 적용

    if args.mixup > 0.:  # Mixup 활성화 시 손실 함수 설정
        criterion = SoftTargetCrossEntropy()
    elif args.smoothing:
        criterion = LabelSmoothingCrossEntropy(smoothing=args.smoothing)
    else:
        criterion = torch.nn.CrossEntropyLoss()  # 기본 손실 함수는 CrossEntropyLoss

    teacher_model = None
    if args.distillation_type != 'none':  # 지식 증류가 활성화된 경우 teacher 모델 설정
        assert args.teacher_path, 'need to specify teacher-path when using distillation'  # teacher 모델 경로 필요
        print(f"Creating teacher model: {args.teacher_model}")
        teacher_model = create_model(
            args.teacher_model,
            pretrained=False,
            num_classes=args.nb_classes,
            global_pool='avg',
        )
        if args.teacher_path.startswith('https'):
            checkpoint = torch.hub.load_state_dict_from_url(
                args.teacher_path, map_location='cpu', check_hash=True)  # teacher 모델 체크포인트 로드
        else:
            checkpoint = torch.load(args.teacher_path, map_location='cpu')
        teacher_model.load_state_dict(checkpoint['model'])
        teacher_model.to(device)  # teacher 모델을 디바이스로 전송
        teacher_model.eval()  # teacher 모델 평가 모드 설정

    # DistillationLoss로 감싼 손실 함수
    criterion = DistillationLoss(
        criterion, teacher_model, args.distillation_type, args.distillation_alpha, args.distillation_tau
    )

    max_accuracy = 0.0  # 최대 정확도 초기화

    output_dir = Path(args.output_dir)  # 출력 경로 설정
    if args.output_dir and utils.is_main_process():  # 메인 프로세스에서만 출력 파일 저장
        with (output_dir / "model.txt").open("a") as f:
            f.write(str(model))
    if args.output_dir and utils.is_main_process():
        with (output_dir / "args.txt").open("a") as f:
            f.write(json.dumps(args.__dict__, indent=2) + "\n")
    if args.resume or os.path.exists(f'{args.output_dir}/{args.model}_best_checkpoint.pth'):  # 체크포인트에서 재개
        args.resume = f'{args.output_dir}/{args.model}_best_checkpoint.pth'
        if args.resume.startswith('https'):
            checkpoint = torch.hub.load_state_dict_from_url(
                args.resume, map_location='cpu', check_hash=True)
        else:
            print("Loading local checkpoint at {}".format(args.resume))
            checkpoint = torch.load(args.resume, map_location='cpu')
        msg = model_without_ddp.load_state_dict(checkpoint['model'])
        print(msg)
        if not args.eval and 'optimizer' in checkpoint and 'lr_scheduler' in checkpoint and 'epoch' in checkpoint:

            optimizer.load_state_dict(checkpoint['optimizer'])
            for state in optimizer.state.values():  # 로드된 옵티마이저 파라미터를 CUDA로 전송
                for k, v in state.items():
                    if isinstance(v, torch.Tensor):
                        state[k] = v.cuda()

            lr_scheduler.load_state_dict(checkpoint['lr_scheduler'])
            max_accuracy = checkpoint['best_score']  # 최고 정확도 로드
            print(f'Now max accuracy is {max_accuracy}')
            args.start_epoch = checkpoint['epoch'] + 1  # 시작 에폭 설정
            if args.model_ema:
                utils._load_checkpoint_for_ema(
                    model_ema, checkpoint['model_ema'])
            if 'scaler' in checkpoint:
                loss_scaler.load_state_dict(checkpoint['scaler'])
    if args.eval:  # 평가 모드일 경우
        print(f"Evaluating model: {args.model}")
        print(f'No Visualization')
        test_stats = evaluate(data_loader_val, model, device, None, None, args, visualization=False)  # 평가 수행
        print(
            f"Accuracy of the network on the {len(dataset_val)} test images: {test_stats['acc1']:.1f}%"
        )

    print(f"Start training for {args.epochs} epochs")  # 학습 시작 메시지 출력
    start_time = time.time()  # 학습 시작 시간 기록

    # 날짜별 폴더 생성
    today = datetime.today().strftime('%Y-%m-%d')  # 오늘 날짜
    output_dir = Path(os.path.join(args.output_dir, today))  # 날짜별 폴더 경로
    output_dir.mkdir(parents=True, exist_ok=True)  # 폴더 생성
    
    for epoch in range(args.start_epoch, args.epochs):  # 에폭별 학습 진행
        if args.distributed:
            data_loader_train.sampler.set_epoch(epoch)
    
        train_stats = train_one_epoch(
            model, criterion, data_loader_train,
            optimizer, device, epoch, loss_scaler,
            args.clip_grad, args.clip_mode, model_ema, mixup_fn,
            set_training_mode=True,
            set_bn_eval=args.set_bn_eval,
            writer=writer,
            args=args
        )
    
        lr_scheduler.step(epoch)  # 학습률 스케줄러 업데이트
    
        test_stats = evaluate(data_loader_val, model, device, epoch, writer, args, visualization=True)  # 평가 수행
        print(f"Accuracy of the network on the {len(dataset_val)} test images: {test_stats['acc1']:.1f}%")  # 평가 결과 출력
    
        # 각 에폭마다 모델 저장
        if args.output_dir:
            ckpt_path = os.path.join(output_dir, f'{args.model}_epoch_{epoch}.pth')  # 체크포인트 경로 설정
            checkpoint_paths = [ckpt_path]
            print(f"Saving checkpoint to {ckpt_path}")  # 체크포인트 저장 메시지 출력
            for checkpoint_path in checkpoint_paths:
                utils.save_on_master({
                    'model': model_without_ddp.state_dict(),
                    'optimizer': optimizer.state_dict(),
                    'lr_scheduler': lr_scheduler.state_dict(),
                    'epoch': epoch,
                    'best_score': test_stats['acc1'],  # 각 에폭의 최고 정확도 저장
                    'model_ema': get_state_dict(model_ema),
                    'scaler': loss_scaler.state_dict(),
                    'args': args,
                }, checkpoint_path)
    
        print(f'Max accuracy: {test_stats["acc1"]:.2f}%')  # 각 에폭의 최고 정확도 출력
    
        log_stats = {**{f'train_{k}': v for k, v in train_stats.items()},
                     **{f'test_{k}': v for k, v in test_stats.items()},
                     'epoch': epoch,
                     'n_parameters': n_parameters}
    
        if args.output_dir and utils.is_main_process():  # 메인 프로세스에서만 로그 저장
            with (output_dir / "log.txt").open("a") as f:
                f.write(json.dumps(log_stats) + "\n")
    
    total_time = time.time() - start_time  # 학습 종료 시간 기록
    total_time_str = str(timedelta(seconds=int(total_time)))  # 총 학습 시간 계산
    print('Training time {}'.format(total_time_str))  # 학습 시간 출력


    # ROC 곡선과 혼동 행렬 그리기
    if args.predict and utils.is_main_process():  # 예측 활성화 시
        model_predict = create_model(
            args.model,
            num_classes=args.nb_classes
        )

        model_predict.to(device)  # 예측용 모델을 디바이스로 전송
        print('*******************STARTING PREDICT*******************')
        Predictor(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)  # 예측 수행
        Plot_ROC(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)  # ROC 그리기

        if args.opt_auc:  # AUC 최적화가 활성화된 경우
            OptAUC(model_predict, data_loader_val, f'{args.output_dir}/{args.model}_best_checkpoint.pth', device)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        'MobileNetV4 training and evaluation script', parents=[get_args_parser()])  # 메인 함수에서 인자 파서 생성
    args = parser.parse_args()  # 인자 파싱
    if args.output_dir:  # 출력 경로가 설정된 경우 폴더 생성
        Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    main(args)  # 메인 함수 실행
