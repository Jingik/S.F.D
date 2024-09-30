import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split
from sklearn.model_selection import train_test_split
from torch.utils.data import Subset
import timm
import numpy as np

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

torch.set_num_threads(1)
torch.set_num_interop_threads(1)

# 데이터셋 경로와 모델 저장 경로를 입력 받습니다
dataset_path = './datasets/Nut2'  # 사용자 데이터셋 경로 (TRUE/FALSE 폴더 포함)
model_save_path = './models_trans'  # 모델 저장 경로.

# 경로가 없으면 생성
if not os.path.exists(model_save_path):
    os.makedirs(model_save_path)

# 1. 데이터 전처리 설정
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 2. 데이터셋 불러오기
full_dataset = datasets.ImageFolder(root=dataset_path, transform=train_transform)

# 데이터셋의 인덱스를 섞어 train/validation/test로 분할
train_idx, val_test_idx = train_test_split(np.arange(len(full_dataset)), test_size=0.3, shuffle=True, stratify=full_dataset.targets)
val_idx, test_idx = train_test_split(val_test_idx, test_size=0.5, shuffle=True, stratify=np.array(full_dataset.targets)[val_test_idx])

# train, validation, test 데이터셋 생성
train_dataset = Subset(full_dataset, train_idx)
val_dataset = Subset(full_dataset, val_idx)
test_dataset = Subset(full_dataset, test_idx)

# 데이터로더 생성
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

# 3. MobileNetV4 모델 불러오기
model = timm.create_model('mobilenetv3_large_100', pretrained=True)

# 모델의 출력 크기를 데이터셋에 맞게 변경
num_classes = len(full_dataset.classes)
model.classifier = nn.Linear(model.classifier.in_features, num_classes)

# 모델을 GPU로 이동 (가능한 경우)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# 4. 손실 함수 및 옵티마이저 설정
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 5. 모델 학습 함수
def train(model, train_loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        
        # 그래디언트 초기화
        optimizer.zero_grad()
        
        # 순전파
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # 역전파 및 옵티마이저 스텝
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
    
    print(f'Train Loss: {running_loss/len(train_loader):.4f}')

# 6. 모델 평가 함수 (validation 및 test 공용)
def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    accuracy = 100 * correct / total
    print(f'Loss: {running_loss/len(loader):.4f}, Accuracy: {accuracy:.2f}%')
    return accuracy

# 7. 학습 루프 - 각 에포크마다 모델 저장
num_epochs = 50
best_accuracy = 0

for epoch in range(num_epochs):
    print(f'Epoch {epoch+1}/{num_epochs}')
    
    # 학습
    train(model, train_loader, criterion, optimizer, device)
    
    # 검증
    print(f'Validation results for Epoch {epoch+1}:')
    accuracy = evaluate(model, val_loader, criterion, device)
    
    # 모델 저장 (에포크마다). .
    model_filename = f'mobilenetv4_epoch_{epoch+1}.pth'
    model_save_full_path = os.path.join(model_save_path, model_filename)
    torch.save(model.state_dict(), model_save_full_path)
    print(f'Model saved at {model_save_full_path}')

# 8. 테스트 데이터셋으로 최종 평가.
print("Final Test Results:")
test_accuracy = evaluate(model, test_loader, criterion, device)
