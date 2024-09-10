# 사용법

1. 데이터셋 다운로드

- 폴더 구조

```
root
  |
  ├ dataset
  |   ├ train
  |   ├ valid
  |   └ test
  ├ dataset.yaml
  ├ train.py
  ├ test.py
  └ README.md
```

2. 환경 설정 및 YOLO install

```
pip install ultralytics
```

3. 주의사항

- test.py에서 절대 경로로 경로 입력
- 가중치 등 저장이 다른 YOLO 폴더에 될 수 있음에 주의
- train 종료 시 나타나는 주소로 탐색
