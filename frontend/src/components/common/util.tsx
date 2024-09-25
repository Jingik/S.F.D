// axios 모듈화
import axios from 'axios';

// axios 인스턴스 생성
export const axiosSecurity = axios.create({
  baseURL: 'http://j11b103.p.ssafy.io:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = JSON.parse(localStorage.getItem('token')!);
if (token) {
  axiosSecurity.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;
}

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
