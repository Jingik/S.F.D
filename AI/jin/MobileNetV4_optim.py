import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import timm
import torch.optim as optim
import torch.nn as nn
import os
from tqdm import tqdm  # tqdm 라이브러리 임포트

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  

# 데이터 전처리
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),  # 수평 뒤집기
    transforms.RandomRotation(degrees=15),  # 랜덤 회전
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),  # 색상 변형
    transforms.Resize((320, 320)),  # 이미지 크기 조정
    transforms.ToTensor(),          
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  
])


# 데이터셋 로드
train_dataset = datasets.ImageFolder(root='./dataset/train_val', transform=transform)
val_dataset = datasets.ImageFolder(root='./dataset/test', transform=transform)

train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)

# 모델 로드
model = timm.create_model('mobilenetv4_conv_medium.e500_r256_in1k', pretrained=True, num_classes=1)

# GPU 설정
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# 손실 함수 및 옵티마이저 설정
criterion = nn.BCEWithLogitsLoss()
# optimizer = optim.Adam(model.parameters(), lr=0.0005)
optimizer = optim.AdamW(model.parameters(), lr=0.0005, weight_decay=1e-5)


# 학습 함수
def train(model, train_loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    # tqdm을 이용하여 진행 상황 표시
    progress_bar = tqdm(train_loader, desc="Training", leave=False)

    for inputs, labels in progress_bar:
        inputs, labels = inputs.to(device), labels.to(device).float()  # labels를 float로 변환

        optimizer.zero_grad()

        outputs = model(inputs).squeeze()  # (batch_size, 1) -> (batch_size,)
        loss = criterion(outputs, labels)  # BCEWithLogits 사용
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        predicted = (torch.sigmoid(outputs) > 0.5).float()  # Sigmoid 적용 후 이진 분류
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

        # tqdm 진행상황 업데이트
        progress_bar.set_postfix(loss=loss.item(), accuracy=correct / total)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc

# 검증 함수
def validate(model, val_loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    # tqdm을 이용하여 진행 상황 표시
    progress_bar = tqdm(val_loader, desc="Validating", leave=False)

    with torch.no_grad():
        for inputs, labels in progress_bar:
            inputs, labels = inputs.to(device), labels.to(device).float()  # labels를 float로 변환

            outputs = model(inputs).squeeze()  # (batch_size, 1) -> (batch_size,)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            predicted = (torch.sigmoid(outputs) > 0.5).float()  # Sigmoid 적용 후 이진 분류
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

            # tqdm 진행상황 업데이트
            progress_bar.set_postfix(loss=loss.item(), accuracy=correct / total)

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc

# 가중치 저장 디렉토리 생성
if not os.path.exists('weights_bce'):
    os.makedirs('weights_bce')

# Early stopping 기준
patience = 10  # 10 epoch 동안 성능이 향상되지 않으면 중지
best_acc = 0.0
epochs_no_improve = 0

# 학습 및 검증 실행
num_epochs = 30
best_model_path = None

for epoch in range(num_epochs):
    print(f'Epoch {epoch+1}/{num_epochs}')
    train_loss, train_acc = train(model, train_loader, criterion, optimizer, device)
    val_loss, val_acc = validate(model, val_loader, criterion, device)

    # 매 epoch 가중치 저장
    epoch_model_path = f'weights_bce/model_epoch_{epoch+1}.pth'
    torch.save(model.state_dict(), epoch_model_path)
    
    # 가장 좋은 성능을 기록한 가중치 따로 저장
    if val_acc > best_acc:
        best_acc = val_acc
        best_model_path = f'weights_bce/best_model.pth'
        torch.save(model.state_dict(), best_model_path)
        epochs_no_improve = 0  # 성능이 개선되면 초기화
    else:
        epochs_no_improve += 1

    # 실시간으로 결과 출력
    print(f'Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}, '
          f'Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}')
    
    # Early stopping 조건
    if epochs_no_improve == patience:
        print(f'Early stopping at epoch {epoch+1}')
        break
    
print(f'Best model saved at: {best_model_path} with validation accuracy of {best_acc:.4f}')
