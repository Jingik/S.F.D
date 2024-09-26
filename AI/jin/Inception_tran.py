import tensorflow as tf
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.inception_resnet_v2 import InceptionResNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
import tensorflow as tf
from tensorflow.keras.callbacks import Callback
from tqdm import tqdm
import torch
import torch.backends.cudnn as cudnn
import os
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"  # 1번 GPU 사용 설정

# torch.set_num_threads(1)
# torch.set_num_interop_threads(1)

print("Num GPUs Available: ", len(tf.config.experimental.list_physical_devices('GPU')))


# 데이터 제너레이터 설정
train_datagen = ImageDataGenerator(
    rescale=1.0/255,          # 모든 이미지의 픽셀 값을 0-1 범위로 스케일링
    shear_range=0.2,          # 이미지에 랜덤 전단 변환 적용
    zoom_range=0.2,           # 이미지에 랜덤 줌 변환 적용
    horizontal_flip=True      # 이미지를 랜덤으로 수평 반전
)

val_test_datagen = ImageDataGenerator(rescale=1.0/255)

# 학습 데이터 불러오기
train_generator = train_datagen.flow_from_directory(
    './dataset/Nut/Train',  # 학습 데이터 경로
    target_size=(299, 299),     # 이미지 크기
    batch_size=2,               # 배치 크기
    class_mode='categorical'    # 다중 클래스 분류
)

# 검증 데이터 불러오기
validation_generator = val_test_datagen.flow_from_directory(
    './dataset/Nut/Val',  # 검증 데이터 경로
    target_size=(299, 299),       # 이미지 크기
    batch_size=1,                 # 배치 크기
    class_mode='categorical'      # 다중 클래스 분류
)

# 테스트 데이터 불러오기
test_generator = val_test_datagen.flow_from_directory(
    './dataset/Nut/Test',  # 테스트 데이터 경로
    target_size=(299, 299),   # 이미지 크기
    batch_size=1,             # 배치 크기
    class_mode='categorical'  # 다중 클래스 분류
)

# 모델 설정 (InceptionResNetV2)
base_model = InceptionResNetV2(weights='imagenet', include_top=False)
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
predictions = Dense(train_generator.num_classes, activation='softmax')(x)

# 모델 컴파일
model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(learning_rate=0.0001), loss='categorical_crossentropy', metrics=['accuracy'])

# 모델 체크포인트
checkpoint = ModelCheckpoint('best_model.h5', monitor='val_accuracy', save_best_only=True, mode='max')

# GPU 메모리 동적 할당 설정
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)



class ProgressBarCallback(Callback):
    def on_epoch_begin(self, epoch, logs=None):
        self.progress_bar = tqdm(total=self.params['epochs'], desc=f'Epoch {epoch + 1}/{self.params["epochs"]}', ncols=100)

    def on_epoch_end(self, epoch, logs=None):
        self.progress_bar.update(1)
        self.progress_bar.close()

    def on_batch_end(self, batch, logs=None):
        pass

# 모델 훈련
progress_bar = ProgressBarCallback()

model.fit(
    train_generator,
    epochs=30,
    validation_data=validation_generator,
    callbacks=[checkpoint, progress_bar],  # ProgressBarCallback 추가
    verbose=1  # 기본 출력 끄기
)


# 모델 저장
# 모델 체크포인트
# checkpoint = ModelCheckpoint('best_model.keras', monitor='val_accuracy', save_best_only=True, mode='max')

# 최종 모델 저장
model.save('././final_model.h5')  # .keras 확장자로 변경


# 테스트 데이터 평가
test_loss, test_accuracy = model.evaluate(test_generator, verbose=1)
print(f'Test loss: {test_loss}')
print(f'Test accuracy: {test_accuracy}')
