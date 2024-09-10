import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# 데이터 경로 설정
train_data_dir = './Excellent'
save_dir = './aug'

# ImageDataGenerator를 이용한 데이터 증강 설정
datagen = ImageDataGenerator(
    rotation_range=30,       # 이미지 회전 각도
    width_shift_range=0.1,   # 좌우 이동
    height_shift_range=0.1,  # 상하 이동
    # shear_range=0.1,         # 전단 변환
    zoom_range=0.1,          # 확대/축소
    horizontal_flip=True,    # 수평 뒤집기
    fill_mode='nearest'      # 이미지 변형 시 빈 공간 채우는 방법
)

# 이미지 경로에서 파일 목록 불러오기
image_files = os.listdir(train_data_dir)

# 증강된 이미지를 저장할 폴더가 없다면 생성
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

# 총 7091장의 이미지를 만들기 위한 설정
total_images_needed = 7091
images_per_original = total_images_needed // len(image_files) + 1  # 각 이미지 당 증강할 횟수

generated_images = 0

# 각 이미지에 대해 증강 실행
for img_file in image_files:
    img_path = os.path.join(train_data_dir, img_file)
    img = tf.keras.preprocessing.image.load_img(img_path)  # 이미지 로드
    x = tf.keras.preprocessing.image.img_to_array(img)     # numpy 배열로 변환
    x = x.reshape((1,) + x.shape)  # (1, height, width, channels) 형태로 변환

    # 이미지 증강 및 저장
    i = 0
    for batch in datagen.flow(x, batch_size=1, save_to_dir=save_dir, save_prefix='aug', save_format='jpeg'):
        i += 1
        generated_images += 1
        if i >= images_per_original or generated_images >= total_images_needed:
            break

    if generated_images >= total_images_needed:
        break

print(f"총 {generated_images}장의 증강된 이미지가 생성되었습니다.")
