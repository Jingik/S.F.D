import os
import torch

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정


import torchvision.transforms as T
from torch.utils.data import DataLoader, Dataset
from PIL import Image
from torchvision.models.detection import FasterRCNN
from torchvision.models.detection.rpn import AnchorGenerator
from swin_transformer_pytorch import SwinTransformer
from torchvision.ops import MultiScaleRoIAlign


# 데이터셋 정의 (이미지와 라벨 로딩)
class CustomDataset(Dataset):
    def __init__(self, image_dir, label_dir, transforms=None):
        self.image_dir = image_dir
        self.label_dir = label_dir
        self.transforms = transforms
        self.image_filenames = sorted(os.listdir(image_dir))  # 이미지 파일 리스트 정렬
    
    def __len__(self):
        return len(self.image_filenames)  # 데이터셋 크기 반환
    
    def __getitem__(self, idx):
        image_filename = self.image_filenames[idx]  # 이미지 파일 이름 선택
        image_path = os.path.join(self.image_dir, image_filename)  # 이미지 경로
        label_path = os.path.join(self.label_dir, image_filename.replace('.jpg', '.txt'))  # 라벨 경로

        # 이미지 로드
        image = Image.open(image_path).convert("RGB")
        
        # 라벨 로드 (YOLO 형식)
        boxes = []
        labels = []
        with open(label_path, 'r') as f:
            for line in f.readlines():
                label_info = line.strip().split()
                class_label = int(label_info[0])
                x_center, y_center, width, height = map(float, label_info[1:])
                
                # YOLO 형식을 픽셀 단위로 변환
                img_width, img_height = image.size
                xmin = (x_center - width / 2) * img_width
                ymin = (y_center - height / 2) * img_height
                xmax = (x_center + width / 2) * img_width
                ymax = (y_center + height / 2) * img_height

                boxes.append([xmin, ymin, xmax, ymax])
                labels.append(class_label)

        boxes = torch.as_tensor(boxes, dtype=torch.float32)
        labels = torch.as_tensor(labels, dtype=torch.int64)

        target = {'boxes': boxes, 'labels': labels}  # 타겟 생성

        if self.transforms:
            image = self.transforms(image)  # 변환 적용

        return image, target  # 이미지와 타겟 반환

# Swin Transformer를 Backbone으로 정의
backbone = SwinTransformer(
    hidden_dim=16,
    layers=(2, 2, 6, 2),
    heads=(1, 2, 4, 8),  # heads 값을 줄임
    channels=3,
    num_classes=0,  # Object detection이므로 num_classes는 0으로 설정
    head_dim=32,
    window_size=5,  # 윈도우 크기를 5로 설정
    downscaling_factors=(1, 1, 1, 1),  # 다운스케일링을 하지 않음
    relative_pos_embedding=True
)

# Swin Transformer에서 나오는 최종 출력 채널 수를 설정합니다. 일반적으로 Swin Transformer의 최종 출력은 768 채널입니다.
backbone.out_channels = 768  # out_channels 설정

# Anchor Generator 설정
rpn_anchor_generator = AnchorGenerator(
    sizes=((32, 64, 128, 256, 512),),
    aspect_ratios=((0.5, 1.0, 2.0),) * len((32, 64, 128, 256, 512))
)

# RoI Pooling 설정
roi_pooler = MultiScaleRoIAlign(
    featmap_names=['0'],  # Feature map name
    output_size=7,
    sampling_ratio=2
)

# Faster R-CNN 모델 구성
model = FasterRCNN(
    backbone,
    num_classes=3,  # 클래스 수 (배경 포함 3개로 설정)
    rpn_anchor_generator=rpn_anchor_generator,
    box_roi_pool=roi_pooler
)

# 데이터 경로 설정
image_dir = "./dataset/train/images"  # 이미지 폴더 경로
label_dir = "./dataset/train/labels"  # 라

# 데이터셋 및 DataLoader 정의
transforms = T.Compose([
    T.Resize((640, 640)),  # 이미지를 640x640으로 리사이즈
    T.ToTensor()           # 이미지를 텐서로 변환
])  
dataset = CustomDataset(image_dir, label_dir, transforms=transforms)
data_loader = DataLoader(dataset, batch_size=1, shuffle=True, collate_fn=lambda x: tuple(zip(*x)))  # DataLoader 생성

# 학습에 필요한 장치 설정 (GPU가 있다면 GPU 사용)
device = torch.device('cuda:0')
model.to(device)  # 모델을 장치에 할당
print(f"사용 중인 GPU ID: {torch.cuda.current_device()}")
print(f"사용 중인 GPU 이름: {torch.cuda.get_device_name(device)}")
# 옵티마이저 설정
optimizer = torch.optim.SGD(model.parameters(), lr=0.005, momentum=0.9, weight_decay=0.0005)

# 학습 루프
num_epochs = 5  # 학습 에폭 수 설정
results_dir = "results"
os.makedirs(results_dir, exist_ok=True)  # 결과 저장 폴더 생성

for epoch in range(num_epochs):
    model.train()  # 모델을 학습 모드로 전환
    epoch_loss = 0
    for images, targets in data_loader:
        images = list(image.to(device) for image in images)  # 이미지를 장치로 전송
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]  # 타겟도 장치로 전송
        
        # 모델에 입력 데이터 전송 및 손실 계산
        loss_dict = model(images, targets)  # 손실 값 계산
        losses = sum(loss for loss in loss_dict.values())  # 총 손실 계산
        
        # 역전파 및 최적화 단계
        optimizer.zero_grad()  # 그래디언트 초기화
        losses.backward()  # 역전파
        optimizer.step()  # 최적화
        
        epoch_loss += losses.item()  # 에폭 손실 누적
        torch.cuda.empty_cache()
    print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {epoch_loss:.4f}')  # 에폭 당 손실 출력
    
    # 매 에폭마다 모델 저장
    model_save_path = os.path.join(results_dir, f"model_epoch_{epoch+1}.pth")
    torch.save(model.state_dict(), model_save_path)  # 모델 저장
    print(f"Model saved at {model_save_path}")

print("Training complete.")  # 학습 완료 메시지 출력
