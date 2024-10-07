import argparse
import csv
import requests
import os
import platform
import sys
from pathlib import Path
import cv2
import torch
from datetime import datetime
from tensorflow import keras
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np

from models.model import ClassificationModel
from omegaconf import OmegaConf
import torch.nn.functional as F
from transforms import Transforms
import torchvision

# 윈도우 모드에서 실행
import pathlib
pathlib.PosixPath = pathlib.WindowsPath

def predict(model, image, config):
    transforms = Transforms(config['dataset']['img_size'])
    test_transform = transforms.val_test_transform()
    img_tensor = test_transform(image).unsqueeze_(0)
    prediction = torch.argmax(F.softmax(model(img_tensor))).item()
    return prediction

# 서버로 크롭된 이미지와 예측 결과를 전송하는 함수
def request_cropped_img_with_prediction(url, image_path, predicted_class):
    # URL이 지정되지 않았을 경우 기본 로컬 서버 주소 사용
    if url is None:
        url = 'http://localhost:5000/upload'

    # 전송할 데이터를 준비
    # 'file' 필드에 이미지 파일을, 'prediction' 필드에 예측 결과를 포함
    with open(image_path, 'rb') as img:
        files = {'file': img}
        data = {'prediction': predicted_class}  # 예측 결과를 같이 보냄
        response = requests.post(url, files=files, data=data)  # 서버로 전송

    # 응답 결과 출력
    print(f"Status code: {response.status_code}")  # 응답 상태 코드 출력
    print(f"Response: {response.json()}")  # 서버에서 받은 응답 내용 출력

# 잘라낸 이미지를 특정 URL로 전송하는 함수
def request_cropped_img(url, image_path):
    if url == None:
        url = 'http://localhost:5000/upload'

    # 파일을 multipart/form-data 형식으로 전송
    with open(image_path, 'rb') as img:
        files = {'file': img}
        response = requests.post(url, files=files)

    # 응답 결과 출력
    print(response.status_code)  # 응답 상태 코드 출력
    print(response.json())       # 응답 내용 출력

# 객체 탐지 이미지를 저장하는 함수
def detect_picture(x, y, w, h, frame):
    print("x:", x, "y:", y, "w:", w, "h:", h)
    print("frame:", frame)
    print("frame.shape:", frame.shape)

    # 좌표를 기반으로 이미지를 자르기
    roi = frame[y:y+h, x:x+w]

    # 잘라낸 영역을 보여주기
    cv2.imshow('ROI', roi)

    # 잘라낸 이미지를 저장
    cv2.imwrite('./saved/tmp/cropped_image' + detected_num + '.jpg', roi)
    print("이미지가 저장되었습니다.")

# 현재 파일의 경로 및 YOLOv5 루트 디렉토리 설정
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # YOLOv5 루트 디렉토리
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # 루트를 PATH에 추가
ROOT = Path(os.path.relpath(ROOT, Path.cwd()))  # 상대 경로로 변환

# 분류모델 로드
cls_checkpoint = torch.load('test_exp/tensorboard_logs_csv_logs/0_1/checkpoints/last.ckpt', map_location=torch.device('cpu'))
cls_config = OmegaConf.load('config.yaml')
cls_model = ClassificationModel(cls_config)
# 모델에 저장된 가중치 로드
cls_model.load_state_dict(cls_checkpoint['state_dict'])
# 모델을 평가 모드로 전환 (학습이 아닌 추론 모드)
cls_model.eval()

# Ultralytics 유틸리티들
from ultralytics.utils.plotting import Annotator, colors, save_one_box

# YOLOv5 관련 모듈 임포트
from models.common import DetectMultiBackend
from utils.dataloaders import IMG_FORMATS, VID_FORMATS, LoadImages, LoadScreenshots, LoadStreams
from utils.general import (
    LOGGER,
    Profile,
    check_file,
    check_img_size,
    check_imshow,
    check_requirements,
    colorstr,
    cv2,
    increment_path,
    non_max_suppression,
    print_args,
    scale_boxes,
    strip_optimizer,
    xyxy2xywh,
)
from utils.torch_utils import select_device, smart_inference_mode


@smart_inference_mode()  # 자동으로 모델의 추론 모드를 관리 (inference 모드에서는 더 빠르고 메모리 효율적으로 동작)
def run(
    weights=ROOT / "yolov5s.pt",  # 모델 가중치 파일 경로 또는 Triton URL (YOLOv5 모델 파일)
    source=ROOT / "data/images",  # 입력 데이터 (이미지, 비디오, 디렉토리, 웹캠 등)
    data=ROOT / "data/coco128.yaml",  # 데이터셋 정보가 담긴 yaml 파일 경로
    imgsz=(640, 640),  # 추론에 사용할 이미지 크기 (너비, 높이)
    conf_thres=0.25,  # 신뢰도 임계값 (이 값 이상일 때만 탐지 결과를 출력)
    iou_thres=0.45,  # NMS에서 사용하는 IoU 임계값 (겹치는 박스 중 가장 신뢰도 높은 것만 남기기)
    max_det=1000,  # 이미지당 최대 탐지 개수
    device="",  # 사용할 장치 (GPU 또는 CPU, 예: 'cuda:0' 또는 'cpu')
    view_img=False,  # 결과 이미지를 출력할지 여부
    save_txt=False,  # 결과를 텍스트 파일로 저장할지 여부
    save_format=0,  # 저장할 좌표 형식 (0은 YOLO 형식, 1은 Pascal-VOC 형식)
    save_csv=False,  # 결과를 CSV 파일로 저장할지 여부
    save_conf=False,  # 신뢰도를 저장할지 여부
    save_crop=True,  # 탐지된 객체의 이미지를 크롭해서 저장할지 여부
    nosave=False,  # 이미지나 비디오를 저장하지 않을지 여부
    classes=None,  # 특정 클래스만 탐지할지 설정 (예: --class 0 1 2)
    agnostic_nms=False,  # 클래스에 상관없이 NMS를 적용할지 여부
    augment=False,  # 증강 추론을 사용할지 여부
    visualize=False,  # 시각화 기능을 사용할지 여부
    update=False,  # 모델 가중치를 업데이트할지 여부
    project=ROOT / "runs/detect",  # 결과를 저장할 경로 (프로젝트 폴더)
    name="exp",  # 결과 파일 이름 (실험 이름)
    exist_ok=False,  # 기존 폴더를 덮어쓸지 여부
    line_thickness=3,  # 바운딩 박스의 두께
    hide_labels=False,  # 바운딩 박스에 레이블을 숨길지 여부
    hide_conf=False,  # 신뢰도 표시 여부
    half=False,  # FP16 반정밀도를 사용할지 여부 (속도 개선)
    dnn=False,  # OpenCV DNN 백엔드에서 ONNX 모델을 사용할지 여부
    vid_stride=1,  # 비디오 프레임 간격 설정
):
    
    detected_num = 0  # 탐지된 객체 수를 카운트하는 변수 초기화

    """
    YOLOv5 탐지 알고리즘과 양/불 판정을 실행하는 함수입니다. 다양한 입력 소스(이미지, 비디오, 디렉토리, 웹캠 등)를 처리하며, 
    모델 가중치와 다양한 옵션을 설정하여 탐지와 판정을 수행합니다.

    Args:
        weights: YOLOv5 모델 가중치 파일 경로
        source: 입력 데이터 소스 경로 (파일/디렉토리/URL/웹캠)
        data: 데이터셋 yaml 파일 경로 (탐지할 클래스 정보 포함)
        imgsz: 이미지 크기
        conf_thres: 탐지 신뢰도 임계값
        iou_thres: NMS에서 사용할 IoU 임계값
        max_det: 이미지당 최대 탐지 개수
        device: 사용할 디바이스 (GPU 또는 CPU)
        기타 옵션: 탐지 결과 저장 및 시각화 옵션들
    """

    # 입력 소스를 문자열로 변환
    source = str(source)
    
    # 이미지 저장 여부 결정 (nosave 옵션과 텍스트 파일 여부 확인)
    save_img = not nosave and not source.endswith(".txt")
    
    # 입력 파일이 이미지나 비디오 파일인지 확인
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)
    
    # 입력이 URL 형태인지 확인 (RTSP, HTTP 등)
    is_url = source.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))
    
    # 웹캠에서 데이터를 가져오는지 확인
    webcam = source.isnumeric() or source.endswith(".streams") or (is_url and not is_file)
    
    # 스크린샷을 사용하는지 확인
    screenshot = source.lower().startswith("screen")
    
    # 만약 URL이 파일이면 다운로드
    if is_url and is_file:
        source = check_file(source)
    
    failed = False  # 탐지가 실패했는지 여부 초기화
    
    # 결과를 저장할 디렉토리 경로 설정 (이미 존재하면 덮어쓸지 결정)
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)
    
    # 레이블을 저장할 디렉토리 생성 (필요한 경우)
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)
    
    # YOLOv5 모델 로드
    device = select_device(device)  # 사용할 디바이스 선택 (GPU 또는 CPU)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)  # 모델 초기화
    stride, names, pt = model.stride, model.names, model.pt  # 모델의 stride 및 클래스 이름 불러오기
    imgsz = check_img_size(imgsz, s=stride)  # 이미지 크기 확인 (모델 stride에 맞게 조정)
    
    # 데이터 로더 설정
    bs = 1  # 배치 크기 (이미지당 1개씩 처리)
    
    # 웹캠인 경우 스트림 데이터를 가져옴
    if webcam:
        view_img = check_imshow(warn=True)  # 이미지 뷰어가 가능한지 확인
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    
    # 스크린샷인 경우 데이터를 로드
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)
    
    # 이미지 또는 비디오인 경우 데이터를 로드
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
    
    # 비디오 파일을 저장하기 위한 변수 설정
    vid_path, vid_writer = [None] * bs, [None] * bs
    
    # 모델을 워밍업 (추론 전에 준비 작업 수행)
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))
    
    # 처리한 이미지 수, 윈도우, 프로파일링 변수 초기화
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))
    
    # 데이터를 순회하면서 이미지 또는 비디오 프레임을 처리
    for path, im, im0s, vid_cap, s in dataset:
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)  # 이미지를 텐서로 변환
            im = im.half() if model.fp16 else im.float()  # FP16 또는 FP32로 변환
            im /= 255  # 0-255 범위의 값을 0-1로 스케일링
            
            # 배치 차원이 없는 경우 추가 (단일 이미지 처리 시)
            if len(im.shape) == 3:
                im = im[None]
            
            # 모델이 XML 포맷인지 확인하고 배치로 나누기
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # 모델 추론 실행
        with dt[1]:
            visualize = increment_path(save_dir / Path(path).stem, mkdir=True) if visualize else False
            if model.xml and im.shape[0] > 1:
                pred = None
                for image in ims:
                    if pred is None:
                        pred = model(image, augment=augment, visualize=visualize).unsqueeze(0)
                    else:
                        pred = torch.cat((pred, model(image, augment=augment, visualize=visualize).unsqueeze(0)), dim=0)
                pred = [pred, None]
            else:
                pred = model(im, augment=augment, visualize=visualize)
        
        # Non-Maximum Suppression (NMS) 적용하여 중복된 박스 제거
        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        # 탐지 결과 처리
        for i, det in enumerate(pred):  # 이미지당 탐지 결과
            seen += 1  # 처리한 이미지 수 증가
            if webcam:  # 웹캠인 경우
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s += f"{i}: "
            else:  # 일반 이미지/비디오인 경우
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)  # 파일 경로로 변환
            save_path = str(save_dir / p.name)  # 이미지 저장 경로 설정
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")  # 텍스트 경로 설정
            s += "{:g}x{:g} ".format(*im.shape[2:])  # 이미지 크기 정보 추가
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # 정규화 비율 계산 (이미지 크기)
            imc = im0.copy() if save_crop else im0  # 크롭 이미지를 저장할 경우 원본 이미지를 복사
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))  # 바운딩 박스 주석 추가
            if len(det):  # 탐지된 객체가 있을 때만 처리
                LOGGER.info(f"Detected {len(det)} objects in {p} Previous Object: {detected_num}")
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()  # 탐지 박스를 원본 이미지 크기로 스케일링
                
                # 클래스별로 탐지 개수 출력
                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()  # 해당 클래스의 탐지 개수 계산
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # 탐지된 클래스와 개수를 출력
                
                # 크롭한 이미지 파일을 저장 (탐지된 객체)
                if detected_num < len(det) or failed:
                    result = det[det[:, 1].argsort()]
                    *xyxy, conf, cls = result[0]
                    if conf > 0.8 and int(xyxy[1].numpy()) > 50:  # 신뢰도가 0.8 이상인 경우 크롭
                        LOGGER.info(f"Cropped {names[int(cls)]} {xyxy}")
                        current_time = datetime.now()
                        formatted_time = current_time.strftime("%Y%m%d%H%M%S") + f"{current_time.microsecond // 1000:03d}"
                        
                        file_path = save_dir / "tmp" / names[int(cls)] / f"sfd001_{formatted_time}.jpg"
                        
                        # 크롭된 이미지 저장
                        save_one_box(xyxy, imc, gain=1.2, pad=100, file=file_path, BGR=True)
                        
                        ### 여기부터 분류 모델 적용 ###
                        print('분류 대상 이미지 주소 :', file_path)
                        
                        image = cv2.imread(os.path.join(file_path))
                        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                        
                        # 예측 수행 (TFSMLayer를 함수처럼 호출)
                        prediction = predict(cls_model, image, cls_config)
                        
                        # 예측 결과를 사용해 클래스 결정
                        predicted_class = prediction
                        
                        print(predicted_class, '로 예측')
                        # True/False 폴더로 저장 (분류에 따라)
                        if predicted_class == 0:  # 불량이면 'False' 폴더로
                            output_dir = save_dir / "False" / f"sfd001_{formatted_time}.jpg"
                        else:  # 양품이면 'True' 폴더로
                            output_dir = save_dir / "True" / f"sfd001_{formatted_time}.jpg"

                        # 결과를 해당 폴더로 저장
                        save_one_box(xyxy, imc, gain=1.2, pad=100, file=output_dir, BGR=True)

                        ### 모델 분류 결과 출력 ###
                        LOGGER.info(f"Image classified as {'False' if predicted_class == 0 else 'True'}")
                        ############################
                        # 여기서 서버 통신 로직 작성
                        
                        
                        # request_cropped_img(None, file_path)  # 크롭된 이미지를 서버로 전송
                        failed = False
                    else:
                        failed = True

                # 탐지 결과를 텍스트 파일로 저장
                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)  # 클래스 인덱스
                    label = names[c] if hide_conf else f"{names[c]}"
                    confidence = float(conf)
                    confidence_str = f"{confidence:.2f}"

                    # 박스를 YOLO 형식으로 변환
                    xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4))).view(-1).tolist()

                    if save_txt:  # 텍스트 파일로 저장
                        if save_format == 0:
                            coords = (
                                (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                            )  # YOLO 형식 좌표
                        else:
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()  # Pascal-VOC 형식 좌표
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)  # 라벨 형식
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                # 바운딩 박스를 이미지에 추가
                if save_img or save_crop or view_img:
                    c = int(cls)  # 클래스 인덱스
                    label = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {conf:.2f}")
                    annotator.box_label(xyxy, label, color=colors(c, True))  # 바운딩 박스 및 레이블 추가

            detected_num = len(det)  # 탐지된 객체 수 업데이트

            # 결과를 스트리밍으로 보여줌
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux" and p not in windows:
                    windows.append(p)
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)  # 창 크기 조정 허용 (Linux)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)  # 1밀리초 대기
            
            # 결과 이미지 저장
            if save_img:
                if dataset.mode == "image":  # 이미지 파일인 경우
                    cv2.imwrite(save_path, im0)  # 이미지 파일 저장
                else:  # 비디오 또는 스트림인 경우
                    if vid_path[i] != save_path:  # 새로운 비디오 파일이면
                        vid_path[i] = save_path
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()  # 이전 비디오 라이터 해제
                        if vid_cap:  # 비디오 파일에서 읽어오는 경우
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:  # 스트리밍 데이터인 경우
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        save_path = str(Path(save_path).with_suffix(".mp4"))  # 확장자를 mp4로 강제 설정
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                    vid_writer[i].write(im0)  # 비디오에 프레임 저장

        # 처리 속도 정보 출력 (ms 단위)
        LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1E3:.1f}ms")
    
    # 최종 처리 속도 출력
    t = tuple(x.t / seen * 1e3 for x in dt)  # 이미지당 속도 계산
    LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
    
    # 저장 경로 정보 출력
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    
    # 모델 업데이트 (필요한 경우)
    if update:
        strip_optimizer(weights[0])  # 모델 파일에서 불필요한 부분 제거

def parse_opt():
    """
    YOLOv5 탐지를 위한 명령줄 인수 파싱.

    Args:
        --weights (str | list[str]): 모델 가중치 파일 경로 또는 Triton URL
        --source (str): 입력 데이터 소스 (파일/디렉토리/URL/글로브 패턴/웹캠)
        --data (str): 데이터셋 yaml 파일 경로
        --imgsz (list[int]): 이미지 크기
        --conf-thres (float): 신뢰도 임계값
        --iou-thres (float): NMS IOU 임계값
        --max-det (int): 이미지당 최대 탐지 개수
        --device (str): 사용할 디바이스 (GPU 또는 CPU)
        --view-img (bool): 결과를 화면에 표시 여부
        기타 옵션들 (텍스트 저장, 크롭 저장 등)

    Returns:
        argparse.Namespace: 파싱된 명령줄 인수
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", nargs="+", type=str, default=ROOT / "yolov5s.pt", help="모델 가중치 파일 경로")
    parser.add_argument("--source", type=str, default=ROOT / "data/images", help="입력 소스 (파일/디렉토리/URL/웹캠)")
    parser.add_argument("--data", type=str, default=ROOT / "data/coco128.yaml", help="데이터셋 yaml 파일 경로")
    parser.add_argument("--imgsz", "--img", "--img-size", nargs="+", type=int, default=[640], help="추론 이미지 크기 (h,w)")
    parser.add_argument("--conf-thres", type=float, default=0.25, help="신뢰도 임계값")
    parser.add_argument("--iou-thres", type=float, default=0.45, help="NMS IoU 임계값")
    parser.add_argument("--max-det", type=int, default=1000, help="이미지당 최대 탐지 개수")
    parser.add_argument("--device", default="", help="사용할 디바이스 (예: 0 또는 0,1,2,3 또는 cpu)")
    parser.add_argument("--view-img", action="store_true", help="결과 보기")
    parser.add_argument("--save-txt", action="store_true", help="결과를 텍스트로 저장 여부")
    parser.add_argument(
        "--save-format",
        type=int,
        default=0,
        help="YOLO 형식 좌표 저장 또는 Pascal-VOC 형식 좌표 저장 여부",
    )
    parser.add_argument("--save-csv", action="store_true", help="결과를 CSV로 저장 여부")
    parser.add_argument("--save-conf", action="store_true", help="레이블에 신뢰도 저장 여부")
    parser.add_argument("--save-crop", action="store_true", help="크롭 예측 박스 저장 여부")
    parser.add_argument("--nosave", action="store_true", help="이미지/비디오 저장 안함 여부")
    parser.add_argument("--classes", nargs="+", type=int, help="특정 클래스 필터링")
    parser.add_argument("--agnostic-nms", action="store_true", help="클래스 무관 NMS")
    parser.add_argument("--augment", action="store_true", help="증강 추론 여부")
    parser.add_argument("--visualize", action="store_true", help="특징 시각화 여부")
    parser.add_argument("--update", action="store_true", help="모든 모델 업데이트 여부")
    parser.add_argument("--project", default=ROOT / "runs/detect", help="결과 저장 디렉토리")
    parser.add_argument("--name", default="exp", help="결과 저장 이름")
    parser.add_argument("--exist-ok", action="store_true", help="기존 프로젝트/이름 덮어쓰기 여부")
    parser.add_argument("--line-thickness", default=3, type=int, help="바운딩 박스 두께 (픽셀 단위)")
    parser.add_argument("--hide-labels", default=False, action="store_true", help="레이블 숨기기")
    parser.add_argument("--hide-conf", default=False, action="store_true", help="신뢰도 숨기기")
    parser.add_argument("--half", action="store_true", help="FP16 하프-프리시전 사용 여부")
    parser.add_argument("--dnn", action="store_true", help="ONNX 추론 시 OpenCV DNN 사용 여부")
    parser.add_argument("--vid-stride", type=int, default=1, help="비디오 프레임 간격")
    opt = parser.parse_args()
    opt.imgsz *= 2 if len(opt.imgsz) == 1 else 1  # 이미지 크기 조정
    print_args(vars(opt))
    return opt


def main(opt):
    """
    YOLOv5 모델 추론을 실행하는 메인 함수

    Args:
        opt (argparse.Namespace): 명령줄 인수로 파싱된 옵션들

    Note:
        필수 패키지 확인 후 YOLOv5 탐지 실행
    """
    check_requirements(ROOT / "requirements.txt", exclude=("tensorboard", "thop"))  # 필수 패키지 확인
    run(**vars(opt))  # YOLOv5 탐지 실행


if __name__ == "__main__":
    opt = parse_opt()  # 명령줄 옵션 파싱
    main(opt)  # 메인 함수 실행
