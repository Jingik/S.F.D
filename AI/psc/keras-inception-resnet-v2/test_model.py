import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
import numpy as np
from sklearn.metrics import precision_score, recall_score, confusion_matrix

# 테스트 데이터 제너레이터 설정
test_datagen = ImageDataGenerator(rescale=1.0/255)

# 테스트 데이터 불러오기
test_generator = test_datagen.flow_from_directory(
    '../../datasets/Validation',  # 테스트 데이터 경로
    target_size=(299, 299),       # 이미지 크기
    batch_size=32,
    class_mode='categorical',
    shuffle=False  # 예측값과 실제값을 비교할 때 데이터 순서가 섞이지 않도록 설정
)

# 모델 로드
model = load_model('final_model.h5')

# 모델 평가
loss, accuracy = model.evaluate(test_generator)
print(f'Test Accuracy: {accuracy * 100:.2f}%')

# 예측 수행
predictions = model.predict(test_generator)

# 실제 클래스 (정답 레이블)
true_classes = test_generator.classes
class_labels = list(test_generator.class_indices.keys())  # 클래스 이름

# 예측 클래스
predicted_classes = np.argmax(predictions, axis=1)

# Precision과 Recall 계산
precision = precision_score(true_classes, predicted_classes, average='weighted')
recall = recall_score(true_classes, predicted_classes, average='weighted')
cm = confusion_matrix(true_classes, predicted_classes)

print(cm)
print(f'Precision: {precision * 100:.2f}%')
print(f'Recall: {recall * 100:.2f}%')

# 42/42 [==============================] - 25s 499ms/step - loss: 1.9232 - accuracy: 0.9234
# Test Accuracy: 92.34%
# 42/42 [==============================] - 23s 496ms/step
# [[499  93]
#  [  9 730]]
# Precision: 92.94%
# Recall: 92.34%