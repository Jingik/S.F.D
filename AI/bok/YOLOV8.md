# YOLO

## 버전별 출시 시점

- YOLOv1 : 2016년에 발표된 최초 버전으로, 실시간 객체 검출을 위한 딥러닝 기반의 네트워크
- YOLOv2 : 2017년에 발표된 두 번째 버전으로, 성능을 개선하고 속도를 높인 것이 특징
- YOLOv3 : 2018년에 발표된 세 번째 버전으로, 네트워크 구조와 학습 방법을 개선하여 객체 검출의 정확도와 속도를 모두 개선
- YOLOv4 : 2020년 4월에 발표된 네 번째 버전으로, SPP와 PAN 등의 기술이 적용되어 더욱 정확한 객체 검출과 더 높은 속도를 제공
- YOLOv5 : 2020년 6월에 발표된 버전으로 YOLOv4와 비교하여 객체 검출 정확도에서 10% 이상 향상되었으며, 더 빠른 속도와 더 작은 모델 크기를 가짐
- YOLOv7 : 2022년 7월 발표된 버전으로, 훈련 과정의 최적화에 집중하여 훈련 cost를 강화화는 최적화된 모듈과 최적 기법인 trainable bag-of-freebies를 제안
- YOLOv6 : 2022년 9월 발표된 버전으로, 여러 방법을 이용하여 알고리즘의 효율을 높이고, 특히 시스템에 탑재하기 위한 Quantization과 distillation 방식도 일부 도입하여 성능 향상
- YOLOv8 : 2023년 1월 발표된 버전으로, YOLO 모델을 위한 완전히 새로운 리포지토리를 출시하여 개체 감지, 인스턴스 세분화 및 이미지 분류 모델을 train하기 위한 통합 프레임워크 로 구축됨

## YOLOv1

- First YOLO

  - S x S 크기의 Grid Cell로 Input Image를 분리하고, Cell마다 B개의 Bounding boxes, confidence score, Class probabilities를 예측한다.
    Final Output : S x S x ( B \* 5 + C ) [ S : Num of Cell, B : Num of Bounding boxes, C : Num of Classes]

- Overlap Problem과 NMS (None Maximum Suppression)

  - 각각의 Grid Cell마다 B개의 Bounding Box가 생성되는데, 인접한 Cell이 같은 객체를 예측하는 Bounding Box를 생성하는 문제가 발생한다.
  - 이를 해결하기 위해 confidence score와 IOU를 계산하여 가장 높은 confidence score의 Bounding Box를 선택하고 선택한 Bounding Box와 IOU가 큰 나머지 Bounding Box를 삭제하는 개념이다.

- Architecture
  - 24개의 Conv layer와 2개의 FC layer로 구성되어 있다. Darknet network라고 부르며 ImageNet dataset으로 Pre-trained된 network를 사용한다.
  - 1x1 Conv layer와 3x3 Conv layer의 교차를 통해 Parameter 감소시킨다.
- 특징
  - 각 Grid cell은 하나의 Class만을 예측한다.
  - 인접한 Cell들이 동일한 객체에 대한 Bounding Box를 생성할 수 있다.
  - Background Error가 낮다.
  - 당시 SOTA들에 비해 Real-Time 부분에서 가장 좋은 성능을 보였다.
    ![alt text](./YOLO_img/image.png)

## YOLOv2

### 기존 v1에 비해 바뀐 점

- Architecture

  - 기존의 Darknet을 개선한 Darknet19을 제안하였다.
  - 기존 network의 마지막 Fully Connected Layer를 삭제하여 1✕1 Convolution Layer로 대체했다.
  - Global Average Pooling을 사용해 파라미터를 줄여 속도 향상

- Anchor Box 도입으로 인한 학습 안정화
  - YOLOv1에서는 Grid 당 2개의 B-Box 좌표를 예측하는 방식이었다면 YOLOv2에서는 Grid 당 5개의 Anchor Box를 찾는다.
  - Anchor Box
    - 여러 개의 크기와 비율로 미리 정의된 형태를 가진 경계 박스(B-Box)로서 사용자가 개수와 형태를 임의로 지정 가능하다. YOLO B-box Regression은 B-box 좌표를 직접 예측하나, YOLO v2에서는 미리 지정된 Anchor box의 offset(size,ratio)을 예측하기 때문에 문제가 훨씬 간단해진다
- Fine-grained features 적용

  - 중간 feature맵과 최종 feature맵을 합쳐 이용한다. 즉, 앞 Convolution Layer의 High Resolution Feature Map을 뒷 단의 Convolution Layer의 Low Resolution Feature Map에 추가한다.(중간 feature 맵은 지역적 특성을 잘 반영하기 때문)
  - 즉, High Resolution Feature는 작은 객체에 대한 정보를 함축하고 있기 때문에 작은 객체 검출에 강할 수 있도록 했다.

- Batch Normalization

  - 기존 모델에서 Dropout Layer를 제거하고 Batch Norm을 사용하여 mAP 점수를 2% 향상했다.

- High Resolution Classifier
  - 기존 모델은 224x224 size로 Pre-train하고, 448x448 size를 input으로 사용하여 불안정한 학습이 이루어졌다면, 448x448 size로 Pre-train하는 것으로 변경하여 mAP가 4% 향상되었다.
- Dynamic Anchor box
  - Faster R-CNN에서 Anchor Box의 사이즈와 비율을 미리 정하는 부분에 대한 문제가 제기되어 제안된 개념
  - YOLOv2 에서는 k-means Clustering을 통해 GT와 가장 유사한 Optimal Anchor box를 탐색함으로써 데이터셋 특성에 적합한 Anchor Box를 생성

###

|         특징         |                        YOLOX                         |                        YOLOv8                         |                                                                                                          설명                                                                                                           |
| :------------------: | :--------------------------------------------------: | :---------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|     Anchor 방식      |               Anchor-Free (앵커 프리)                |               Anchor-Based (앵커 기반)                | Anchor는 객체의 위치와 크기를 예측하는 사전 정의된 박스입니다. Anchor-Free는 이러한 박스를 사용하지 않고, Anchor-Based는 이를 사용하여 객체의 위치를 예측합니다. Anchor-Free 방식은 모델을 더 단순하고 빠르게 만듭니다. |
|    Detection Head    |          Decoupled Head (분리된 예측 헤드)           |            Unified Head (통합된 예측 헤드)            |                           Detection Head는 이미지에서 객체를 찾고 분류하는 단계입니다. Decoupled Head는 위치와 분류를 별도로 예측하고, Unified Head는 이를 하나로 통합하여 동시에 예측합니다.                           |
| 백본 구조 (Backbone) |                CSPDarknet (단순 백본)                |               CSP + PANet (개선된 백본)               |                                       백본 구조는 이미지에서 주요 특징을 추출하는 네트워크의 기본 부분입니다. YOLOv8은 최신 기술을 사용하여 더 많은 정보를 효과적으로 추출합니다.                                       |
|     레이블 할당      |      SimOTA Assignment (간단한 샘플 할당 방식)       |   Dynamic Label Assignment (유연한 샘플 할당 방식)    |                                  레이블 할당은 훈련 중 어떤 객체를 찾았는지를 모델에 가르치는 방법입니다. YOLOv8의 Dynamic Label Assignment는 더 정확하고 유연하게 객체를 인식합니다.                                   |
|   데이터 증강 기법   | Mosaic Augmentation, MixUp (다양한 데이터 증강 기법) | Mosaic Augmentation, MixUp 등 (다양한 증강 기법 사용) |                                         데이터 증강은 모델이 더 다양한 상황을 학습하도록 여러 기법을 사용해 데이터를 변형하는 것입니다. 두 모델 모두 다양한 기법을 사용합니다.                                          |
|      훈련 전략       |                    표준 훈련 전략                    |            개선된 훈련 전략 (CIoU 손실 등)            |                                       훈련 전략은 모델을 학습시키는 방법과 손실 함수(정확도를 높이는 수학적 기법)를 의미합니다. YOLOv8은 더 효과적인 최신 훈련 전략을 사용합니다.                                       |
|      모델 크기       |          다양한 크기로 제공 (S, M, L, X 등)          |          다양한 크기로 제공 (S, M, L, X 등)           |                             모델 크기는 네트워크의 복잡도와 크기를 의미하며, 작은 모델은 더 빠르고 덜 정확하고, 큰 모델은 더 느리지만 더 정확합니다. 두 모델 모두 다양한 크기로 제공됩니다.                             |
|         성능         |              높은 속도와 적당한 정확도               |        최적화된 성능 (더 나은 정확도와 효율성)        |                                              성능은 모델의 정확도와 속도를 의미합니다. YOLOX는 빠른 속도를 제공하며, YOLOv8은 더 높은 정확도와 전반적인 성능을 제공합니다.                                              |

### 추가 설명

1. Anchor 방식 (Anchor-Free vs. Anchor-Based):

- Anchor는 이미지에서 객체를 찾기 위해 사용하는 사전 정의된 크기의 박스입니다. Anchor-Free 모델은 이러한 박스를 사용하지 않고 직접 객체의 중심점을 예측합니다. 이는 모델을 더 단순하고 빠르게 만듭니다. Anchor-Based 모델은 미리 설정된 여러 크기의 박스를 사용해 더 세밀한 예측을 합니다. 이 방식은 조금 더 복잡하지만, 다양한 크기의 객체를 잘 인식할 수 있습니다.

2. Detection Head (Decoupled Head vs. Unified Head):

- Detection Head는 모델이 이미지에서 객체의 위치와 종류를 예측하는 마지막 단계입니다. Decoupled Head는 객체의 위치와 종류를 별도로 예측하고, Unified Head는 이를 한꺼번에 예측합니다. Decoupled Head 방식은 더 정확한 위치와 종류 예측을 위해 사용되며, Unified Head는 더 빠르고 간결한 예측을 위해 사용됩니다.

3. 백본 구조 (Backbone):

- Backbone은 이미지에서 객체를 인식하는 데 필요한 중요한 특징을 추출하는 모델의 기본 구조입니다. YOLOX와 YOLOv8은 모두 최신 기술을 사용하여 더 나은 성능을 제공하는 백본을 가지고 있습니다. YOLOv8의 경우, 더욱 고급화된 백본 구조를 사용하여 다양한 크기의 객체를 더 잘 인식할 수 있습니다.

4. 레이블 할당 (Label Assignment):

- 레이블 할당은 모델이 훈련 중에 어떤 부분이 객체인지, 어떤 부분이 배경인지를 학습하게 도와주는 과정입니다. YOLOX는 간단한 할당 방식을 사용하지만, YOLOv8은 보다 유연하고 정확하게 객체를 인식하도록 돕는 방식을 사용합니다.

5. 데이터 증강 기법 (Data Augmentation Techniques):

- 데이터 증강은 모델을 학습할 때 다양한 조건에 적응할 수 있도록 데이터를 인위적으로 변형시키는 기법입니다. 예를 들어, 이미지를 회전시키거나 색을 변경하는 방법 등이 있습니다. 두 모델 모두 다양한 데이터 증강 기법을 사용하여 학습을 강화합니다.

6. 훈련 전략 (Training Strategies):

- 훈련 전략은 모델을 최적의 성능으로 학습시키기 위한 여러 방법론을 포함합니다. YOLOv8은 최신의 훈련 전략과 수학적 기법(CIoU 손실 등)을 사용하여 객체를 더 정확하게 예측할 수 있습니다.

7. 모델 크기 (Model Size):

- 모델 크기는 모델의 복잡도와 크기를 나타내며, 더 큰 모델은 더 많은 메모리와 계산 자원을 필요로 하지만 더 높은 정확도를 제공합니다. 두 모델 모두 다양한 크기로 제공되어 사용자의 요구에 맞춰 사용할 수 있습니다.

8. 성능 (Performance):

- 성능은 모델이 얼마나 빠르고 정확하게 객체를 인식하는지를 나타냅니다. YOLOX는 매우 빠른 속도를 제공하면서도 적절한 정확도를 유지하며, YOLOv8은 더 높은 정확도와 최적화된 성능을 제공하여 보다 까다로운 응용 프로그램에 적합합니다.

### CSPDarknet와 CSP + PANet

- CSPDarknet과 CSP + PANet는 모델의 백본(Backbone) 구조와 넥(Neck) 구조를 개선하기 위해 설계된 기술입니다. 백본과 넥은 이미지에서 객체를 효과적으로 검출하기 위해 중요한 특징을 추출하고, 이를 기반으로 객체의 위치와 종류를 예측하는 데 사용됩니다.

- CSPDarknet
  - CSPDarknet은 Cross Stage Partial Darknet의 약자로, YOLO 모델의 백본으로 사용됩니다.
  - 이 구조는 Darknet이라는 기존의 CNN(Convolutional Neural Network) 아키텍처를 개선한 것으로, YOLOv3와 같은 모델의 기본 구조입니다.
  - CSPDarknet는 네트워크의 가중치 분산을 최소화하고, 계산 비용을 줄이면서도 정보 흐름을 효율적으로 유지하는 특징을 가지고 있습니다. 이를 통해 모델의 성능을 향상시키고, 더 작은 모델 크기와 더 빠른 처리 속도를 유지할 수 있습니다.
  - **Cross Stage Partial(CSP)** 라는 개념을 도입하여, 네트워크를 두 개의 절반으로 나누어 한쪽은 원본 입력 피처를 유지하고, 다른 한쪽은 여러 변형을 거치도록 합니다. 이렇게 하면 네트워크가 더 많은 특성을 학습하면서도 계산 비용을 줄일 수 있습니다.
- CSP + PANet
  - CSP + PANet는 **Path Aggregation Network(PANet)** 와 CSPDarknet을 결합한 아키텍처입니다.
  - PANet는 Neck 부분에 해당하며, 백본에서 추출한 특징을 결합하고 강화하여 객체 검출 성능을 높이는 역할을 합니다.
  - PANet의 주요 아이디어는 네트워크의 다양한 레벨에서 추출한 특징을 모두 결합해, 여러 스케일의 객체를 더 잘 인식할 수 있도록 하는 것입니다. 이를 통해 작은 객체와 큰 객체를 모두 효과적으로 검출할 수 있습니다.
  - CSP + PANet 구조는 CSPDarknet의 효율성과 PANet의 강력한 특징 결합 능력을 결합하여, 모델이 더 많은 정보와 세부 사항을 학습하도록 돕습니다.

### SimOTA Assignment

- SimOTA Assignment는 YOLOX에서 사용되는 새로운 학습 샘플 할당 전략으로, 객체 검출 모델의 성능을 향상시키기 위해 고안되었습니다.

- SimOTA의 주요 개념
  - SimOTA는 Simulated Optimal Transport Assignment의 약자로, 학습 중에 객체를 검출하기 위한 양성 샘플을 할당하는 방식을 최적화하는 방법입니다.
  - 전통적인 객체 검출 모델에서는 학습 데이터의 각 객체에 대해 양성(positive)과 음성(negative) 샘플을 할당하는 방식이 고정적이거나 단순한 규칙에 기반한 경우가 많았습니다. 하지만 이런 방식은 다양한 상황에서 최적의 결과를 내지 못할 수 있습니다.
  - SimOTA는 이러한 문제를 해결하기 위해, 객체 검출에서 최적의 샘플 할당을 모방하기 위해 최적화 문제를 사용합니다. 이를 통해 모델이 학습 중에 더 효과적으로 객체의 경계 상자와 클래스 레이블을 할당받을 수 있습니다.
- SimOTA의 작동 방식
  - Optimal Transport(OT) 문제를 해결하는 방식으로, 객체 검출에 필요한 양성 샘플을 효율적으로 할당합니다.
  - 학습 중에 각 객체의 중심에 대해 가능한 샘플을 최적화하는 과정에서, 모델은 더 좋은 검출 결과를 위한 양성 샘플을 선택합니다. 이렇게 하면 모델이 실제 검출 작업에서 더 잘 작동할 수 있습니다.
  - SimOTA는 단순한 규칙 기반 샘플 할당보다 더 유연하고 상황에 맞춘 할당을 가능하게 하여, 모델의 전반적인 성능을 크게 향상시킬 수 있습니다.

### 결론

- CSPDarknet와 CSP + PANet은 객체 검출 모델의 백본과 넥 구조를 개선하여, 더 나은 특징 추출과 정보 결합을 가능하게 하고, 다양한 크기의 객체를 효과적으로 검출할 수 있도록 합니다. 한편, SimOTA Assignment는 학습 중에 객체 검출 성능을 극대화하기 위해 최적의 샘플 할당을 수행하는 혁신적인 방식입니다.

## 백본 구조(Backbone)란?

- **백본(Backbone)** 은 객체 검출, 이미지 분류, 세그멘테이션과 같은 컴퓨터 비전 작업에서 이미지로부터 중요한 특징을 추출하는 역할을 하는 신경망의 핵심 부분입니다. 쉽게 말해, 백본은 이미지가 입력되었을 때 그 이미지로부터 필요한 정보를 '뽑아내는' 역할을 하는 네트워크의 첫 번째 부분입니다.

### 백본의 역할

- 특징 추출(Feature Extraction):

  - 이미지에서 객체를 인식하기 위해서는 그 이미지가 어떤 내용을 포함하고 있는지를 잘 이해해야 합니다. 이를 위해 백본은 여러 계층의 **합성곱 신경망(Convolutional Neural Network, CNN)** 을 사용하여 이미지를 여러 단계로 변환하고, 점점 더 추상적이고 복잡한 특징들을 추출합니다.
    초기 레이어에서는 이미지의 엣지(edge), 코너(corner)와 같은 기본적인 특징을 추출하고, 더 깊은 레이어로 갈수록 점점 더 복잡한 형태(예: 얼굴, 손, 자동차 등)를 인식하게 됩니다.

- 전달된 특징 제공:

  - 백본 구조에서 추출된 중요한 특징들은 모델의 나머지 부분, 즉 **넥(Neck)** 와 **헤드(Head)** 로 전달되어, 최종적으로 객체의 위치와 클래스(종류)를 예측하는 데 사용됩니다.
  - 예를 들어, 백본에서 추출된 정보는 Neck에서 다시 가공되고, Head에서 최종적으로 예측 결과를 만들어냅니다.

### 일반적인 백본 네트워크

- 백본은 보통 다음과 같은 표준 신경망 구조를 사용합니다:

- VGG (Visual Geometry Group) 네트워크: 깊이가 깊고 단순한 구조를 가진 CNN으로, 각 계층은 주로 3x3 합성곱 필터로 구성됩니다.
- ResNet (Residual Network): 깊은 네트워크에서 발생하는 학습의 어려움을 해결하기 위해 **잔차 연결(residual connection)** 을 도입한 모델로, 보다 깊고 강력한 특징 추출을 가능하게 합니다.
- MobileNet: 경량화된 구조로, 모바일 및 임베디드 시스템과 같은 환경에서 실시간 성능을 목표로 합니다.
- Darknet: YOLO 시리즈의 초기 모델에서 사용된 백본으로, 객체 검출에 특화된 CNN 구조입니다.
- CSPDarknet: YOLOX에서 사용된 개선된 백본으로, Cross Stage Partial이라는 새로운 구조를 사용하여 모델의 효율성을 높이고 계산 비용을 줄입니다.

### 왜 백본이 중요한가?

- 백본의 선택은 모델의 전체 성능에 큰 영향을 미칩니다. 더 나은 백본은 더 좋은 특징을 추출할 수 있으며, 이는 더 정확한 객체 검출로 이어집니다. 모델이 얼마나 잘 학습하고, 다양한 이미지에서 얼마나 잘 일반화되는지에 중요한 역할을 합니다.

- 정확도와 성능: 복잡한 백본 구조는 더 많은 정보를 학습할 수 있게 하여 높은 정확도를 보장하지만, 계산량이 많아질 수 있습니다.
- 속도와 효율성: 경량화된 백본은 실시간 애플리케이션에서 중요한 높은 처리 속도를 제공할 수 있지만, 특징을 덜 세밀하게 추출할 수 있어 성능이 떨어질 수 있습니다.

### 결론

- **백본 구조(Backbone)** 는 이미지로부터 기본 특징을 추출하는 신경망의 핵심 구성 요소. 객체 검출 모델에서 백본의 선택은 모델의 정확도, 효율성, 속도에 큰 영향을 미침. 따라서 YOLOX와 YOLOv8 같은 최신 모델들은 보다 강력하고 효율적인 백본 구조를 채택하여 성능을 극대화하고자 함.
