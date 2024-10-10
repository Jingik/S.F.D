import os
import cv2
import json
from ultralytics import YOLO

# YOLO 모델 로드 (한 번만 로드)
MODEL_PATH = "./runs/detect/yolo_custom_training12/weights/best.pt"
model = YOLO(MODEL_PATH)

# 파일명 충돌 방지용 함수
def get_unique_filename(directory, filename):
    base, ext = os.path.splitext(filename)
    counter = 1
    unique_filename = filename
    while os.path.exists(os.path.join(directory, unique_filename)):
        unique_filename = f"{base}_{counter}{ext}"
        counter += 1
    return unique_filename

# YOLO 모델로 이미지 처리 및 결과를 JSON으로 저장하는 함수
def process_image_with_json(image_path, img_size=640, output_dir='./result'):
    # 결과 저장 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)

    # YOLO 모델 예측
    results = model.predict(image_path, save=False, imgsz=img_size, device="cuda")

    # JSON 저장용 데이터 리스트 (이미지 이름 추가)
    json_data = {
        "image_name": os.path.basename(image_path),
        "detections": []
    }

    # 모든 결과를 처리
    scratches_only = []  # scratches 클래스만 담을 리스트
    all_detections = []  # 모든 탐지된 객체를 담을 리스트
    for r in results:
        image_path = r.path  # 현재 이미지의 경로
        boxes = r.boxes.xyxy  # 탐지된 바운딩 박스 (xyxy 형식 좌표)
        cls = r.boxes.cls  # 탐지된 클래스 번호
        conf = r.boxes.conf  # 탐지된 박스의 confidence 값
        cls_dict = r.names  # 클래스 ID와 이름 매핑 (예: {0: 'joint', 1: 'side'})

        # 이미지 읽기 및 전처리
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: 이미지 경로가 잘못되었습니다: {image_path}")
            return None, None
        
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w, c = image.shape

        # 이미지 크기 조정 (출력 크기: 640x640)
        image = cv2.resize(image, (img_size, img_size))

        # 바운딩 박스 그리기 및 JSON 데이터 수집
        for box, cls_number, conf in zip(boxes, cls, conf):
            conf_number = float(conf.item())  # 신뢰도 값
            cls_number_int = int(cls_number.item())  # 클래스 번호
            cls_name = cls_dict[cls_number_int]  # 클래스 이름
            x1, y1, x2, y2 = box  # 좌표값들
            x1_int, y1_int = int(x1.item()), int(y1.item())
            x2_int, y2_int = int(x2.item()), int(y2.item())

            # 이미지 크기에 맞춰 좌표값 비율 조정
            scale_factor_x = img_size / w
            scale_factor_y = img_size / h
            x1_scale, y1_scale = int(x1_int * scale_factor_x), int(y1_int * scale_factor_y)
            x2_scale, y2_scale = int(x2_int * scale_factor_x), int(y2_int * scale_factor_y)

            # 바운딩 박스 크기 조정 (여유를 주기 위해 5픽셀씩 확장)
            x1_scale = max(x1_scale - 5, 0)
            y1_scale = max(y1_scale - 5, 0)
            x2_scale = min(x2_scale + 5, img_size)
            y2_scale = min(y2_scale + 5, img_size)

            # 바운딩 박스를 이미지에 그리기 (빨간색)
            image = cv2.rectangle(image, (x1_scale, y1_scale), (x2_scale, y2_scale), (0, 0, 255), 2)  # 빨간색 (0, 0, 255)
            # 텍스트 그리기 (파란색)
            image = cv2.putText(image, f"{cls_name} {conf_number:.2f}", (x1_scale, y1_scale - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)  # 글자 색상: 파란색

            # scratches 클래스일 경우 scratches_only 리스트에 추가
            if cls_name == 'scratches':
                scratches_only.append({
                    "class_name": cls_name,
                    "confidence": conf_number,
                })
            # 모든 탐지된 객체는 all_detections에 추가
            all_detections.append({
                "class_name": cls_name,
                "confidence": conf_number,
            })

    # scratches가 발견되었으면 scratches만 JSON으로 저장
    if scratches_only:
        json_data["detections"] = scratches_only
    else:
        # scratches가 없으면 전체 탐지 결과 저장
        json_data["detections"] = all_detections

    # 결과 이미지 파일 저장
    output_image_filename = get_unique_filename(output_dir, f"result_{os.path.basename(image_path)}")
    output_image_path = os.path.join(output_dir, output_image_filename)

    # OpenCV를 사용해 이미지 저장
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # 다시 BGR로 변환하여 저장
    cv2.imwrite(output_image_path, image_bgr)
    
    print(f"이미지가 성공적으로 저장되었습니다: {output_image_path}")

    # JSON 파일 저장
    output_json_filename = get_unique_filename(output_dir, f"result_{os.path.basename(image_path)}.json")
    output_json_path = os.path.join(output_dir, output_json_filename)
    with open(output_json_path, 'w') as json_file:
        json.dump(json_data, json_file, indent=4)

    print(f"JSON 파일이 성공적으로 저장되었습니다: {output_json_path}")

    return output_image_path, output_json_path  # 결과 이미지 및 JSON 파일 경로 반환
