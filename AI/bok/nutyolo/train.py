from ultralytics import YOLO
import os
import argparse

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

def get_args_parser():
    # ArgumentParser 설정
    parser = argparse.ArgumentParser(description="YOLOv8 Training Script")

    # 필요한 인자 추가
    parser.add_argument('--data', type=str, default='./dataset.yaml', help='Path to dataset YAML file')
    parser.add_argument('--model_version', type=str, default='l', help="YOLOv8 model version (e.g., 'n', 's', 'm', 'l', 'x')")
    parser.add_argument('--epochs', type=int, default=20, help='Number of epochs to train')
    parser.add_argument('--img_size', type=int, default=640, help='Input image size')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--lrf', type=float, default=0.001, help='Final learning rate')
    parser.add_argument('--cos_lr', action='store_true', help='Use cosine learning rate scheduler')
    parser.add_argument('--experiment_name', type=str, default='yolo_custom_training', help='Name for the experiment')

    return parser

def main(args):
    # 절대 경로로 dataset.yaml 파일 경로 설정
    data_path = os.path.abspath(args.data)

    # YOLOv8 모델 버전 지정 (예: yolov8n.pt, yolov8s.pt, yolov8m.pt 등)
    weights_path = f'yolov8{args.model_version}.pt'

    # YOLOv8 모델 불러오기 (pre-trained weights 사용)
    model = YOLO(weights_path)  # 가중치 경로를 argparse로 받음

    # 모델 학습 시작
    model.train(
        data=data_path,  # 절대 경로로 데이터셋 정보가 담긴 YAML 파일 경로 설정
        epochs=args.epochs,  # 학습할 epoch 수
        imgsz=args.img_size,  # 이미지 크기
        batch=args.batch_size,  # 배치 크기
        lrf=args.lrf,
        cos_lr=args.cos_lr,
        name=args.experiment_name,  # 학습 결과를 저장할 폴더 이름
    )

if __name__ == '__main__':
    # ArgumentParser를 사용하여 인자 파싱
    parser = get_args_parser()
    args = parser.parse_args()

    # main 함수 호출
    main(args)
