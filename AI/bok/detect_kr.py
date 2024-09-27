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

# 윈도우 모드에서 실행
import pathlib
pathlib.PosixPath = pathlib.WindowsPath


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


@smart_inference_mode()  # 자동으로 모델의 추론 모드를 관리
def run(
    weights=ROOT / "yolov5s.pt",  # 모델 경로 또는 Triton URL
    source=ROOT / "data/images",  # 입력 데이터 (파일/디렉토리/URL/글로브 패턴/웹캠 등)
    data=ROOT / "data/coco128.yaml",  # 데이터셋 yaml 파일 경로
    imgsz=(640, 640),  # 추론 이미지 크기 (높이, 너비)
    conf_thres=0.25,  # 신뢰도 임계값
    iou_thres=0.45,  # NMS IoU 임계값
    max_det=1000,  # 이미지당 최대 탐지 개수
    device="",  # 사용할 디바이스 (예: 'cuda:0' 또는 'cpu')
    view_img=False,  # 결과 보기 옵션
    save_txt=False,  # 결과를 텍스트로 저장 옵션
    save_format=0,  # 좌표 저장 형식 (0: YOLO, 1: Pascal-VOC)
    save_csv=False,  # 결과를 CSV로 저장 옵션
    save_conf=False,  # 신뢰도 저장 여부
    save_crop=True,  # 예측 박스 크롭 저장 여부
    nosave=False,  # 이미지/비디오 저장하지 않기 옵션
    classes=None,  # 특정 클래스 필터링 옵션
    agnostic_nms=False,  # 클래스 무관 NMS 실행 여부
    augment=False,  # 증강 추론 여부
    visualize=False,  # 특징 시각화 여부
    update=False,  # 모든 모델 업데이트 여부
    project=ROOT / "runs/detect",  # 결과를 저장할 프로젝트/이름
    name="exp",  # 저장할 실험 이름
    exist_ok=False,  # 기존 프로젝트/이름 덮어쓰기 여부
    line_thickness=3,  # 바운딩 박스 두께 (픽셀 단위)
    hide_labels=False,  # 레이블 숨기기 여부
    hide_conf=False,  # 신뢰도 숨기기 여부
    half=False,  # FP16 하프-프리시전 추론 사용 여부
    dnn=False,  # ONNX 추론 시 OpenCV DNN 사용 여부
    vid_stride=1,  # 비디오 프레임 간격
):

    detected_num = 0  # 탐지된 객체 수 초기화
    """
    YOLOv5 객체 탐지를 실행하는 함수.
    
    다양한 소스(이미지, 비디오, 디렉토리, 스트림 등)에서 탐지를 수행합니다.

    Args:
        weights: 모델 가중치 파일 경로 또는 Triton URL
        source: 입력 데이터 경로 또는 URL
        data: 데이터셋 yaml 경로
        imgsz: 추론에 사용할 이미지 크기
        conf_thres: 탐지 신뢰도 임계값
        iou_thres: NMS(Non-Max Suppression)에서 사용할 IoU 임계값
        max_det: 이미지당 최대 탐지 개수
        device: 사용할 디바이스 (GPU 또는 CPU)
        기타 옵션들 (결과 저장 여부, 신뢰도 표시 여부 등)

    """
    source = str(source)
    save_img = not nosave and not source.endswith(".txt")  # 텍스트 파일이 아닌 경우 이미지 저장
    is_file = Path(source).suffix[1:] in (IMG_FORMATS + VID_FORMATS)  # 입력이 이미지 또는 비디오 파일인지 확인
    is_url = source.lower().startswith(("rtsp://", "rtmp://", "http://", "https://"))  # URL 형태인지 확인
    webcam = source.isnumeric() or source.endswith(".streams") or (is_url and not is_file)  # 웹캠인지 확인
    screenshot = source.lower().startswith("screen")  # 스크린샷인지 확인
    if is_url and is_file:
        source = check_file(source)  # 파일 다운로드
    failed = False
    # 디렉토리 설정
    save_dir = increment_path(Path(project) / name, exist_ok=exist_ok)  # 결과를 저장할 디렉토리 설정
    (save_dir / "labels" if save_txt else save_dir).mkdir(parents=True, exist_ok=True)  # 디렉토리 생성

    # 모델 로드
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names, pt = model.stride, model.names, model.pt
    imgsz = check_img_size(imgsz, s=stride)  # 이미지 크기 확인

    # 데이터 로더 설정
    bs = 1  # 배치 크기
    if webcam:
        view_img = check_imshow(warn=True)
        dataset = LoadStreams(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
        bs = len(dataset)
    elif screenshot:
        dataset = LoadScreenshots(source, img_size=imgsz, stride=stride, auto=pt)
    else:
        dataset = LoadImages(source, img_size=imgsz, stride=stride, auto=pt, vid_stride=vid_stride)
    vid_path, vid_writer = [None] * bs, [None] * bs

    # 추론 실행
    model.warmup(imgsz=(1 if pt or model.triton else bs, 3, *imgsz))  # 모델 워밍업
    seen, windows, dt = 0, [], (Profile(device=device), Profile(device=device), Profile(device=device))  # 프로파일링
    for path, im, im0s, vid_cap, s in dataset:
        with dt[0]:
            im = torch.from_numpy(im).to(model.device)  # 이미지를 텐서로 변환 후 장치에 올리기
            im = im.half() if model.fp16 else im.float()  # uint8 -> fp16/32 변환
            im /= 255  # 0 - 255를 0.0 - 1.0으로 스케일링
            if len(im.shape) == 3:
                im = im[None]  # 배치 차원 추가
            if model.xml and im.shape[0] > 1:
                ims = torch.chunk(im, im.shape[0], 0)

        # 추론 실행
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
        
        # NMS 실행
        with dt[2]:
            pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)

        # 탐지 결과 처리
        for i, det in enumerate(pred):  # 이미지당 결과
            seen += 1
            if webcam:  # 배치 크기가 1 이상일 경우
                p, im0, frame = path[i], im0s[i].copy(), dataset.count
                s += f"{i}: "
            else:
                p, im0, frame = path, im0s.copy(), getattr(dataset, "frame", 0)

            p = Path(p)  # 경로로 변환
            save_path = str(save_dir / p.name)  # 결과 이미지 저장 경로 설정
            txt_path = str(save_dir / "labels" / p.stem) + ("" if dataset.mode == "image" else f"_{frame}")  # 텍스트 경로
            s += "{:g}x{:g} ".format(*im.shape[2:])  # 이미지 크기 정보 추가
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # 정규화 비율 계산
            imc = im0.copy() if save_crop else im0  # 크롭 옵션에 따른 이미지 복사
            annotator = Annotator(im0, line_width=line_thickness, example=str(names))  # 결과 이미지에 주석 추가
            if len(det):  # 탐지된 객체가 있는 경우
                LOGGER.info(f"Detected {len(det)} objects in {p} Previous Object: {detected_num}")
                # 탐지된 바운딩 박스를 이미지 크기에 맞게 스케일링
                det[:, :4] = scale_boxes(im.shape[2:], det[:, :4], im0.shape).round()

                # 탐지 결과 출력
                for c in det[:, 5].unique():
                    n = (det[:, 5] == c).sum()  # 클래스별 탐지 개수
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # 결과 문자열에 추가

                # 탐지된 객체를 기준으로 이미지 크롭 및 저장
                if detected_num < len(det) or failed:
                    result = det[det[:, 1].argsort()]
                    *xyxy, conf, cls = result[0]
                    if conf > 0.8 and int(xyxy[1].numpy()) > 50:  # 신뢰도가 0.8 이상인 경우 크롭 실행
                        LOGGER.info(f"Cropped {names[int(cls)]} {xyxy}")
                        current_time = datetime.now()
                        formatted_time = current_time.strftime("%Y%m%d%H%M%S") + f"{current_time.microsecond // 1000:03d}"

                        file_path = save_dir / "tmp" / names[int(cls)] / f"sfd001_{formatted_time}.jpg"
                        save_one_box(xyxy, imc, gain=1.2, pad=100, file=file_path, BGR=True)
                        
                        request_cropped_img(None, file_path)  # 잘라낸 이미지를 서버로 전송
                        failed = False
                    else:
                        failed = True

                # 탐지 결과를 텍스트 파일로 저장
                for *xyxy, conf, cls in reversed(det):
                    c = int(cls)  # 클래스 인덱스
                    label = names[c] if hide_conf else f"{names[c]}"
                    confidence = float(conf)
                    confidence_str = f"{confidence:.2f}"

                    xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4))).view(-1).tolist()

                    if save_csv:
                        write_to_csv(p.name, label, confidence_str)

                    if save_txt:  # 텍스트 파일에 저장
                        if save_format == 0:
                            coords = (
                                (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()
                            )  # YOLO 형식 좌표 저장
                        else:
                            coords = (torch.tensor(xyxy).view(1, 4) / gn).view(-1).tolist()  # Pascal-VOC 형식 좌표 저장
                        line = (cls, *coords, conf) if save_conf else (cls, *coords)  # 저장 형식
                        with open(f"{txt_path}.txt", "a") as f:
                            f.write(("%g " * len(line)).rstrip() % line + "\n")

                # 이미지에 바운딩 박스 추가
                if save_img or save_crop or view_img:
                    c = int(cls)
                    label = None if hide_labels else (names[c] if hide_conf else f"{names[c]} {conf:.2f}")
                    annotator.box_label(xyxy, label, color=colors(c, True))

            detected_num = len(det)  # 탐지된 객체 수 업데이트

            # 결과 스트리밍
            im0 = annotator.result()
            if view_img:
                if platform.system() == "Linux" and p not in windows:
                    windows.append(p)
                    cv2.namedWindow(str(p), cv2.WINDOW_NORMAL | cv2.WINDOW_KEEPRATIO)  # 창 크기 조정 허용 (리눅스)
                    cv2.resizeWindow(str(p), im0.shape[1], im0.shape[0])
                cv2.imshow(str(p), im0)
                cv2.waitKey(1)  # 1 밀리초 대기

            # 결과 저장 (탐지된 이미지/비디오 저장)
            if save_img:
                if dataset.mode == "image":
                    cv2.imwrite(save_path, im0)
                else:  # 'video' 또는 'stream'
                    if vid_path[i] != save_path:  # 새 비디오
                        vid_path[i] = save_path
                        if isinstance(vid_writer[i], cv2.VideoWriter):
                            vid_writer[i].release()  # 이전 비디오 라이터 해제
                        if vid_cap:  # 비디오
                            fps = vid_cap.get(cv2.CAP_PROP_FPS)
                            w = int(vid_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                            h = int(vid_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        else:  # 스트림
                            fps, w, h = 30, im0.shape[1], im0.shape[0]
                        save_path = str(Path(save_path).with_suffix(".mp4"))  # mp4 형식으로 저장
                        vid_writer[i] = cv2.VideoWriter(save_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
                    vid_writer[i].write(im0)

        # 추론 시간 출력
        LOGGER.info(f"{s}{'' if len(det) else '(no detections), '}{dt[1].dt * 1E3:.1f}ms")

    # 최종 결과 출력
    t = tuple(x.t / seen * 1e3 for x in dt)  # 이미지당 속도 계산
    LOGGER.info(f"Speed: %.1fms pre-process, %.1fms inference, %.1fms NMS per image at shape {(1, 3, *imgsz)}" % t)
    if save_txt or save_img:
        s = f"\n{len(list(save_dir.glob('labels/*.txt')))} labels saved to {save_dir / 'labels'}" if save_txt else ""
        LOGGER.info(f"Results saved to {colorstr('bold', save_dir)}{s}")
    if update:
        strip_optimizer(weights[0])  # 모델 업데이트


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
