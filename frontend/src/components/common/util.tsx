import axios from 'axios';

export const SFD_URL = import.meta.env.PROD
  ? 'https://j11b103.p.ssafy.io/api' // 프로덕션 환경
  : 'http://j11b103.p.ssafy.io:8080/api'; // 개발 환경

// axios 모듈화
export const axiosSecurity = axios.create({
  baseURL: SFD_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
axiosSecurity.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('token')!);
    if (token) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 추가 (401 처리 및 토큰 갱신)
axiosSecurity.interceptors.response.use(
  // 정상 응답일 때는 그대로 반환
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // 401 에러가 발생하고, 원래 요청이 이미 다시 시도된 것이 아니면
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 재시도를 방지하기 위해 플래그 설정
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새로운 Access Token 발급 요청
        const refreshToken = JSON.parse(
          localStorage.getItem('token')!,
        )?.refreshToken;
        const response = await axios.post(`${SFD_URL}/auth/refresh`, {
          refreshToken,
        });

        // 새로운 토큰 저장
        localStorage.setItem('token', JSON.stringify(response.data));

        // 새로운 Access Token으로 요청 헤더 업데이트 후 재시도
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosSecurity(originalRequest);
      } catch (refreshError) {
        // refresh 요청이 실패하면 로그아웃 처리나 추가적인 에러 처리
        console.error('Token refresh failed', refreshError);
        localStorage.removeItem('token');
        // 필요시 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// --------------------------------------------------------------------------------

// 공백 제거
export const removeWhitespace = (text: string) => {
  const regex = /\s/g;
  return text.replace(regex, '');
};

// email 형식 확인
export const validateEmail = (email: string) => {
  const regex =
    /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regex.test(email);
};

// password 형식 확인
export const validatePassword = (password: string) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*[~!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
  return regex.test(password);
};

// 전화번호 형식 확인
export const validatePhoneNumber = (phoneNumber: string) => {
  const regex = /^\d{3}\d{3,4}\d{4}$/;
  return regex.test(phoneNumber);
};
