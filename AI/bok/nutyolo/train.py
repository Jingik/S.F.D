from ultralytics import YOLO
import os

if __name__ == '__main__':
    # 절대 경로로 dataset.yaml 파일 경로 설정
    data_path = os.path.abspath('./dataset.yaml')

    # YOLOv8 모델 불러오기 (pre-trained weights 사용)
    model = YOLO('yolov8s.pt')  # YOLOv8n은 작은 모델, 성능에 따라 yolov8s.pt, yolov8m.pt 등을 사용할 수 있음

    # 모델 학습 시작
    model.train(
        data=data_path,  # 절대 경로로 데이터셋 정보가 담긴 YAML 파일 경로 설정
        epochs=10,  # 학습할 epoch 수
        imgsz=640,  # 이미지 크기
        batch=16,  # 배치 크기
        name='yolo_custom_training'  # 학습 결과를 저장할 폴더 이름
    )