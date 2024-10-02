# 팀 103 프로젝트 (FE 정리)

##### React 구현: 약 70% 완성

## FE 미완성 페이지

- 카테고리 선택 페이지(SelectDomainPage.tsx)

## 필요한 데이터 형식

### 불량 검출 페이지(DetectDefactPage.tsx)

socket 또는 폴링 방식 통신 중 불량 탐지 시 back에서 불량 종류와 해당 이미지를 보내주면...

- 시간 당 불량 개수 통계

  - front에서 받은 시간(x축)에서 불량 개수(y축)를 +1을 해준다.

- 불량 종류 통계
  - 데이터 받아오면 라이브러리에 맞게 가공해서 띄우기
    ```
    {
    type: 'scratch',
    count: 23,
    },
    ```
    이런 식의 객체들로 배열을 만들어서 띄우는 중이므로
    type과 맞는 x축에 count를 +1해준다.

### 전체 기록 조회 페이지(HistoryPage.tsx)

- 총 불량 종류 통계

  - 요청 시, 지금까지의 총 불량 종류와 개수의 배열 형태 필요
    ```
    [
      {
        type: 'scratch',
        count: 73,
      },
      {
        type: 'pitted surface',
        count: 12,
      },
      {
        type: 'inclusion',
        count: 38,
      },
      {
        type: 'crazing',
        count: 0,
      },
      {
        type: 'fracture',
        count: 30,
      },
      {
        type: 'strain',
        count: 49,
      },
    ];
    ```
    이런 식으로

- 날짜 당 불량 개수 통계

  - 요청 시, 오늘 기준 +-2일을 한 불량 개수를 보내준다.
  - [-2일의 총 개수 ~ 2일의 총 개수] → [2, 4, 5, 8, 3] 이런식으로

- 불량 사진 탐색
  - 날짜별로의 불량 데이터와 사진 필요
    ```
    data: [
      {
        type: 'scratch',
        detectedTime: '19:56:55',
        image: {
          (이미지 데이터 형식)
        }
      },
      ...
    ]
    ```
    표 안의 내용(불량 종류 또는 시간) 클릭 시 사진 출력 및 날짜, 시간, 불량 종류를 옆 영역에 출력

### 회원 정보 페이지(UserInfoPage.tsx)

- 수정된 유저 정보를 주면 해당 유저 관련 정보 수정...
  또는 회원 탈퇴 누를 시 해당 유저 정보 숨김 또는 삭제 필요...

### 카테고리 요청 페이지(DomainRequestPage.tsx)

- 불량 사진 전송할 때 어떤 불량인지도 보내줘야하는지?
