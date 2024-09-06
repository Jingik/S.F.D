
import tensorflow as tf
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.inception_resnet_v2 import InceptionResNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam

# 데이터 제너레이터 설정
train_datagen = ImageDataGenerator(
    rescale=1.0/255,          # 모든 이미지의 픽셀 값을 0-1 범위로 스케일링
    shear_range=0.2,          # 이미지에 랜덤 전단 변환 적용
    zoom_range=0.2,           # 이미지에 랜덤 줌 변환 적용
    horizontal_flip=True      # 이미지를 랜덤으로 수평 반전
)

# 학습 데이터 불러오기
train_generator = train_datagen.flow_from_directory(
    '../../datasets/Training',  # 학습 데이터 경로
    target_size=(299, 299),     # 이미지 크기
    batch_size=4,               # 배치 크기
    class_mode='categorical'    # 다중 클래스 분류
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

# 모델 훈련
model.fit(
    train_generator,
    epochs=30,
    callbacks=[checkpoint],
    verbose=1
)

model.save('C:\Users\SSAFY\Desktop\project\S11P22B103\AI\psc\keras-inception-resnet-v2\final_model.h5')
