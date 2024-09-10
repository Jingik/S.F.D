import tensorflow as tf
from tensorflow.python.client import device_lib

# 로컬 장치 목록 출력
devices = device_lib.list_local_devices()
for device in devices:
    print(device)

# GPU가 감지되었는지 확인
gpus = [device for device in devices if device.device_type == 'GPU']
if gpus:
    print(f"TensorFlow has detected {len(gpus)} GPU(s).")
else:
    print("No GPU detected by TensorFlow.")
