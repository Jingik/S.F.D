import argparse
import torch
import os
from pathlib import Path
from timm.models import create_model
from torchvision import transforms
from PIL import Image
import csv
from timm.models import create_model
# GPU 설정 (가장 먼저 설정해야 함)
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

torch.set_num_threads(1)
torch.set_num_interop_threads(1)


def get_args_parser():
    parser = argparse.ArgumentParser(description="MobileNetV4 prediction")
    
    # Model parameters
    parser.add_argument('--batch-size', default=32, type=int)
    parser.add_argument('--model', default='mobilenetv4_hybrid_large', type=str, help='model name')
    parser.add_argument('--nb_classes', default=2, type=int, help='number of classes')
    parser.add_argument('--device', default='cuda', help='device to use for training/testing')
    
    # Paths
    parser.add_argument('--data_root', default='./datasets/test', type=str, help='dataset path containing images')
    parser.add_argument('--output_dir', default='./output', help='path where to save model or predictions')
    
    # Other options
    parser.add_argument('--num_workers', default=4, type=int, help='number of workers for data loading')
    
    return parser


def load_image(image_path, transform, device):
    """이미지 로드 및 전처리"""
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)  # 배치를 위해 차원을 추가
    return image.to(device)


def predict(args):
    # device 설정
    device = torch.device(args.device)
    
    # 이미지 전처리 과정 정의 (모델에 맞는 전처리 적용)
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    # 모델 생성
    model = create_model(args.model, num_classes=args.nb_classes)
    
    # 저장된 모델 가중치 로드
    ckpt_path = os.path.join(args.output_dir, f'{args.model}_epoch_49.pth')
    if not os.path.exists(ckpt_path):
        raise FileNotFoundError(f"No checkpoint found at {ckpt_path}")
    
    checkpoint = torch.load(ckpt_path, map_location='cpu')
    model.load_state_dict(checkpoint['model'], strict=False)

    
    # 모델을 평가 모드로 설정
    model.to(device)
    model.eval()
    
    # 클래스 인덱스에 해당하는 실제 클래스 이름 (여기서는 임의로 0, 1로 설정)
    class_names = ['Class 0', 'Class 1']
    
    # 테스트할 이미지 폴더 경로 설정
    image_dir = Path(args.data_root)
    image_paths = list(image_dir.glob('*.jpg')) + list(image_dir.glob('*.png'))  # jpg, png 파일 읽기
    
    # 예측 결과를 CSV 파일로 저장
    results_file = os.path.join(args.output_dir, 'prediction_results.csv')
    with open(results_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Image", "Predicted Class"])

        # 이미지 파일을 하나씩 처리하여 예측
        for i, image_path in enumerate(image_paths):
            # 이미지 로드 및 전처리
            image = load_image(image_path, transform, device)
            
            with torch.no_grad():
                outputs = model(image)
                _, predicted = torch.max(outputs, 1)
            
            # 예측한 클래스 출력
            predicted_class = class_names[predicted.item()]
            print(f"Image {image_path.name}: Predicted Class = {predicted_class}")
            
            # CSV 파일에 저장
            writer.writerow([image_path.name, predicted_class])

    print(f"Prediction results saved to {results_file}")


if __name__ == '__main__':
    parser = get_args_parser()
    args = parser.parse_args()

    if args.output_dir:
        Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    
    # 예측 함수 실행
    predict(args)
