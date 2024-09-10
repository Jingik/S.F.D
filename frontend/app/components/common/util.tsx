// axios 모듈화
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

// axios 인스턴스 생성
export const axiosSecurity = axios.create({
  baseURL: '링크',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 로컬 스토리지에 토큰이 있는 경우 Authorization 헤더 설정
const token = AsyncStorage.getItem('token');
if (token) {
  axiosSecurity.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// email 형식 확인
export const validateEmail = (email: string) => {
  const regex =
    /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
  return regex.test(email);
};

// 공백 제거
export const removeWhitespace = (text: string) => {
  const regex = /\s/g;
  return text.replace(regex, '');
};

// password 형식 확인
export const validatePassword = (password: string) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*[~!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
  return regex.test(password);
};
