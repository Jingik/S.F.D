from ultralytics import YOLO
import time
import cv2
import os
import matplotlib.pyplot as plt

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

# 파일명 충돌 방지용 함수
def get_unique_filename(directory, filename):
    base, ext = os.path.splitext(filename)
    counter = 1
    unique_filename = filename
    while os.path.exists(os.path.join(directory, unique_filename)):
        unique_filename = f"{base}_{counter}{ext}"
        counter += 1
    return unique_filename

# 모델 경로 설정
model = YOLO("./runs/detect/yolo_custom_training6/weights/best.pt")

# 테스트할 이미지 경로 설정
rusting = '1_2021-11-17-01_12_22-807635_jpg.rf.e2aa5c44e64a19f243fee1250e730791.jpg'
rusting1 = '1_2021-11-17-01_12_22-807635_jpg.rf.e2aa5c44e64a19f243fee1250e730791.jpg'
deformation = '1_2021-11-17-01_10_45-111205_jpg.rf.e42af1923b2246f2feebeb637404ce67.jpg'
deformation1 = 'rn_image_picker_lib_temp_d8497a2.jpg'
deformation2 = 'rn_image_picker_lib_temp_f501bae.jpg'
scratches = '1_2021-11-15-12_39_54-164788_jpg.rf.b299bd7072b9b7c7c94471c376f32b95.jpg'
scratches1 = 'rn_image_picker_lib_temp_83e0b62.jpg'
fracture = '1_2021-11-16-23_54_24-224477_jpg.rf.5b7b68a97eae93677dc521158f46b7db.jpg'
fracture1 = '1_2021-11-16-23_54_24-224477_jpg.rf.5b7b68a97eae93677dc521158f46b7db.jpg'

image_dir1 = './dataset/test/images/'
image_dir = './dataset/test/deformation/images/'
image_name = 'rn_image_picker_lib_temp_f9a08b9.jpg'
image_name1 = deformation
image_path = os.path.join(image_dir1, image_name1)
output_dir = './result'
os.makedirs(output_dir, exist_ok=True)  # output_dir가 없으면 생성

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

    # 이미지 저장 경로 설정 및 충돌 방지 적용
    output_image_filename = get_unique_filename(output_dir, "results.jpg")
    output_image_path = os.path.join(output_dir, output_image_filename)

    # Matplotlib을 사용하여 이미지 저장
    plt.imshow(image)
    plt.axis('off')  # 축 숨기기
    plt.savefig(output_image_path, bbox_inches='tight', pad_inches=0)

    print(f"이미지가 {output_image_path}에 저장되었습니다.")
