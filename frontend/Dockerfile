# 1단계: 빌드 환경 설정
FROM node:18.18.0 AS build

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일만 먼저 복사하여 의존성 설치 캐시 최적화
COPY package.json yarn.lock tsconfig.json /app/

# 패키지 설치 (이 단계는 캐시를 재사용할 수 있음)
RUN yarn install

# 나머지 소스 파일 복사 (소스 코드가 변경될 때만 이 단계 이후로 실행됨)
COPY . /app

# React Native Metro Bundler 서버 시작
CMD ["yarn", "start"]

# 3000번 포트 오픈
EXPOSE 3000

