from ultralytics import YOLO
import time
import cv2
import os
import matplotlib.pyplot as plt

# 모델 경로 설정
model = YOLO("C:/Users/SSAFY/Desktop/YOLO/ultralytics/runs/detect/yolo_custom_training7/weights/best.pt")

# 테스트할 이미지 경로 설정
rusting = '1_2021-11-17-01_12_22-807635_jpg.rf.e2aa5c44e64a19f243fee1250e730791.jpg'
deformation = '1_2021-11-17-01_10_45-111205_jpg.rf.e42af1923b2246f2feebeb637404ce67.jpg'
scratches = '1_2021-11-17-01_12_22-807635_jpg.rf.e2aa5c44e64a19f243fee1250e730791.jpg'
fracture = '1_2021-11-16-23_54_24-224477_jpg.rf.5b7b68a97eae93677dc521158f46b7db.jpg'

image_dir1 = 'C:/Users/SSAFY/Desktop/특화/nutyolo/dataset/test/images/'
image_dir = 'C:/Users/SSAFY/Desktop/특화/nutyolo/dataset/test/deformation/images/'
image_name = 'rn_image_picker_lib_temp_f9a08b9.jpg'
image_name1 = fracture
image_path = os.path.join(image_dir1, image_name1)
# 모델 예측 실행
results = model.predict(
    image_path,
    save=False,  # 결과 이미지를 저장하지 않음
    imgsz=640,  # 이미지 크기
    conf=0.05,  # confidence threshold (0.05 이상의 박스만 출력)
    device="cuda",  # GPU 사용
)

start = time.time()

# 이미지와 결과 정보를 불러옵니다.
for r in results:
    image_path = r.path  # 현재 이미지의 경로
    boxes = r.boxes.xyxy  # 탐지된 바운딩 박스 (xyxy 형식 좌표)
    cls = r.boxes.cls  # 탐지된 클래스 번호
    conf = r.boxes.conf  # 탐지된 박스의 confidence 값
    cls_dict = r.names  # 클래스 ID와 이름 매핑 (예: {0: 'joint', 1: 'side'})

    # 이미지 읽기 및 전처리
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w, c = image.shape

    # 이미지 크기 조정 (출력 크기: 640x640)
    image = cv2.resize(image, (640, 640))

    # 바운딩 박스 그리기
    for box, cls_number, conf in zip(boxes, cls, conf):
        conf_number = float(conf.item())
        cls_number_int = int(cls_number.item())
        cls_name = cls_dict[cls_number_int]  # 클래스 이름
        x1, y1, x2, y2 = box  # 좌표값들
        x1_int, y1_int = int(x1.item()), int(y1.item())
        x2_int, y2_int = int(x2.item()), int(y2.item())
        print(f"좌표: ({x1_int}, {y1_int}, {x2_int}, {y2_int}), 클래스: {cls_name}, 신뢰도: {conf_number:.2f}")

        # 이미지 크기에 맞춰 좌표값 비율 조정
        scale_factor_x = 640 / w
        scale_factor_y = 640 / h
        x1_scale, y1_scale = int(x1_int * scale_factor_x), int(y1_int * scale_factor_y)
        x2_scale, y2_scale = int(x2_int * scale_factor_x), int(y2_int * scale_factor_y)

        # 바운딩 박스를 이미지에 그리기 (0, 255, 0) -> 바운딩 박스 색상
        image = cv2.rectangle(image, (x1_scale, y1_scale), (x2_scale, y2_scale), (0, 255, 0), 2)
        image = cv2.putText(image, f"{cls_name} {conf_number:.2f}", (x1_scale, y1_scale - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2) # 255, 0, 0 글자 색상

    print(f"처리 시간: {time.time() - start:.2f}초")
    
    # Matplotlib을 사용하여 이미지 출력
    plt.imshow(image)
    plt.axis('off')  # 축 숨기기
    plt.show()

