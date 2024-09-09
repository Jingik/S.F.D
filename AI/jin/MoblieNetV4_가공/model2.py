import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
import timm
from PIL import Image
from tqdm import tqdm  # tqdm 라이브러리 추가
import argparse  # 명령줄 인자 파싱용
from datetime import datetime  # 날짜/시간 모듈

# GPU 설정 (가장 먼저 설정해야 함)
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "0"  # 1번 GPU 사용 설정

# GPU 사용 여부 확인 및 강제 설정
if not torch.cuda.is_available():
    raise SystemExit("CUDA is not available. This program requires a GPU to run.")
else:
    print(f"Using GPU device: {torch.cuda.get_device_name(0)}")
    print(f"Available GPUs: {torch.cuda.device_count()}")

# 1. 손상된 이미지 건너뛰기 함수 정의
def verify_image(path):
    """ 이미지가 손상되었는지 확인하는 함수 """
    try:
        img = Image.open(path)
        img.verify()  # 이미지가 손상되었는지 검증
        return True
    except (IOError, SyntaxError):
        print(f"Skipping corrupted image: {path}")
        return False

# 2. 모델 불러오기 (사전 학습된 MobileNetV4)
def load_pretrained_model(model_name='mobilenetv4_hybrid_large.e600_r384_in1k', num_classes=2):
    # 사전 학습된 모델 불러오기
    model = timm.create_model(model_name, pretrained=True)
    
    # 마지막 레이어를 새로운 데이터셋에 맞게 수정 (예: 2개 클래스)
    model.classifier = nn.Linear(model.classifier.in_features, num_classes)
    
    return model

# 3. 모델 학습 함수 (이어하기 기능 추가)
def train_model(model, model_ema, train_loader, val_loader, criterion, optimizer, lr_scheduler, loss_scaler, num_epochs=10, start_epoch=0, max_accuracy=0, device='cuda', save_dir='./epoch', log_path='./log.txt'):
    model.train()

    # 날짜별 폴더 생성 (폴더 이름은 실행 날짜)
    current_date = datetime.now().strftime('%Y-%m-%d')
    save_dir = os.path.join(save_dir, current_date)  # 날짜 기반 폴더 경로 설정

    # 모델을 저장할 디렉토리가 없으면 생성
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # 로그 파일 경로 설정
    log_path = os.path.join(save_dir, 'log.txt')

    # 로그 파일이 존재하지 않으면 초기화
    if not os.path.exists(log_path):
        with open(log_path, 'w') as log_file:
            log_file.write("Epoch, Train Loss, Val Loss, Accuracy, Model Path\n")

    for epoch in range(start_epoch, num_epochs):
        # 학습 모드 설정
        model.train()
        running_train_loss = 0.0
        loop = tqdm(train_loader, leave=True)
        loop.set_description(f'Epoch [{epoch+1}/{num_epochs}]')

        # 학습 데이터셋에서 손실 계산
        for images, labels in loop:
            images, labels = images.to(device), labels.to(device)

            # Forward 패스
            outputs = model(images)
            loss = criterion(outputs, labels)

            # Backward 패스 및 옵티마이저 업데이트
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            running_train_loss += loss.item()
            loop.set_postfix(loss=running_train_loss/len(train_loader))

        epoch_train_loss = running_train_loss / len(train_loader)

        # 검증 데이터셋에서 손실 및 정확도 계산
        model.eval()  # 평가 모드로 설정
        running_val_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                running_val_loss += loss.item()

                # 정확도 계산
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        epoch_val_loss = running_val_loss / len(val_loader)
        accuracy = 100 * correct / total
        max_accuracy = max(max_accuracy, accuracy)

        # 로그 파일에 기록
        with open(log_path, 'a') as log_file:
            log_file.write(f"{epoch+1}, {epoch_train_loss:.4f}, {epoch_val_loss:.4f}, {accuracy:.2f}, {os.path.join(save_dir, f'epoch_{epoch+1}.pth')}\n")

        # 매 에포크마다 모델, EMA, 스케일러, 학습 상태 저장
        save_path = os.path.join(save_dir, f'epoch_{epoch+1}.pth')
        torch.save({
            'epoch': epoch + 1,  # 다음 에포크 번호 저장
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'lr_scheduler_state_dict': lr_scheduler.state_dict(),
            'best_score': max_accuracy,
            'model_ema': model_ema.state_dict() if model_ema else None,
            'scaler_state_dict': loss_scaler.state_dict(),
        }, save_path)

        print(f"Model for epoch {epoch+1} saved to {save_path}")
        print(f"Epoch [{epoch+1}/{num_epochs}], Train Loss: {epoch_train_loss:.4f}, Val Loss: {epoch_val_loss:.4f}, Accuracy: {accuracy:.2f}%")

# 모델과 옵티마이저 상태 불러오기 함수
def load_checkpoint(model, optimizer, checkpoint_path):
    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        return checkpoint['epoch']  # 마지막 학습된 에포크 반환
    else:
        print("Checkpoint not found, starting training from scratch.")
        return 0  # 처음부터 학습

# 4. 전체 코드 실행
if __name__ == "__main__":
    # 명령줄 인자를 처리하기 위한 argparse 사용
    parser = argparse.ArgumentParser(description="Train a model with optional checkpoint")
    parser.add_argument('--checkpoint', type=str, default=None, help="Path to checkpoint file to resume training")
    args = parser.parse_args()

    # 1. 모델 로드 및 GPU 설정
    num_classes = 2  # 분류할 클래스 수 (여기서는 이진 분류 예시)
    model = load_pretrained_model(num_classes=num_classes)
    device = torch.device("cuda")
    model = model.to(device)
    
    # 2. 데이터 전처리 설정
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # MobileNet 입력 크기에 맞춤
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 3. 학습 및 검증 데이터셋 로드 (ImageFolder, 손상된 이미지 건너뛰기 적용)
    train_dataset = datasets.ImageFolder(root='./datasets/train', transform=transform, is_valid_file=verify_image)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)

    val_dataset = datasets.ImageFolder(root='./datasets/val', transform=transform, is_valid_file=verify_image)
    val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)

    # 4. 손실 함수 및 옵티마이저 설정
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 4.1. 학습률 스케줄러 설정
    lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

    # 4.2. EMA 모델 설정 (필요한 경우)
    model_ema = None

    # 4.3. 손실 스케일러 설정 (mixed precision 학습에 사용)
    loss_scaler = torch.cuda.amp.GradScaler()

    # 5. 명령줄에서 체크포인트 경로 입력받고, 없으면 처음부터 학습 시작
    if args.checkpoint:
        start_epoch = load_checkpoint(model, optimizer, args.checkpoint)
    else:
        start_epoch = 0  # 처음부터 학습

    # 6. 모델 학습 및 평가
    train_model(
        model, 
        model_ema, 
        train_loader, 
        val_loader, 
        criterion, 
        optimizer, 
        lr_scheduler, 
        loss_scaler, 
        num_epochs=30, 
        start_epoch=start_epoch, 
        device=device
    )
