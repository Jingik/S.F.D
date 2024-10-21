# 1단계: 빌드 환경 설정
FROM node:18.18.0 AS build

# 작업 디렉토리 설정
WORKDIR /app

# package 파일 및 yarn.lock 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install

# 나머지 설정 파일 및 소스 코드 복사
COPY tsconfig.json tsconfig.node.json tsconfig.app.json vite.config.ts tailwind.config.js postcss.config.js /app/
COPY .prettierrc.cjs eslint.config.js .gitignore ./

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN yarn build

# 2단계: 실행 환경 설정
FROM nginx:stable-alpine

# 빌드된 React 앱을 Nginx의 정적 파일 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 기본 nginx 설정 파일을 삭제
RUN rm /etc/nginx/conf.d/default.conf

# custom 설정파일을 컨테이너 내부로 복사
COPY nginx.conf /etc/nginx/conf.d

# 컨테이너의 80번 포트를 열어준다
EXPOSE 80

# 컨테이너 실행 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]

