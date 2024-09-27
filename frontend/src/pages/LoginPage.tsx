import { useState } from 'react';
import styles from '@/pages/Pages.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { axiosSecurity } from '../components/common/util';
import { useUser } from '@components/common/UserContext';

import SFDLogo from '@/assets/images/SFD_logo.png';

interface User {
  nickname: string;
  email: string;
  phoneNumber: string;
  name: string;
}

export const LoginPage = () => {
  const [email, onChangeEmail] = useState('');
  const [pw, onChangePw] = useState('');
  const { setUser } = useUser();
  const nav = useNavigate();

  // 유저 정보 요청
  async function getUserInfo() {
    try {
      const response = await axiosSecurity.get(`/user/info`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  // 로그인 엔터키로 시도할 때
  function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  // 로그인 시도할 때
  async function handleLogin() {
    if (email === '') {
      alert('이메일을 입력하세요!');
      return;
    }

    if (pw === '') {
      alert('비밀번호를 입력하세요!');
      return;
    }

    // 테스트 코드
    if (email === 'ssafy@ssafy.com' && pw === '1234') {
      localStorage.setItem('token', 'test');
      nav('/domain');
    }

    try {
      const response = await axios.post(
        'http://j11b103.p.ssafy.io:8080/api/auth/login',
        {
          email: email,
          password: pw,
        },
      );
      localStorage.setItem('token', JSON.stringify(response.data));
    } catch (error) {
      console.error('로그인 실패: ' + error);
      console.error('로그인에 실패했습니다...:', error);
      return;
    }

    // 로그인 성공 후 사용자 정보 가져오기
    try {
      const user: User = await getUserInfo();
      // 사용자 정보 설정
      setUser({
        nickname: user.nickname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
      });

      nav('/domain');
    } catch (error) {
      console.error('사용자 정보 설정 실패: ', error);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {/* 제목 영역 */}
      <div className="flex justify-center items-center m-10">
        <button onClick={() => nav('/')}>
          <img src={SFDLogo} alt="SFD" />
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p className="text-4xl font-extrabold mb-10">로그인</p>
      </div>

      <form onSubmit={onSubmitLogin} className="w-full">
        {/* 로그인 입력 영역 */}
        <div className="w-full h-full flex flex-col justify-center items-center">
          <input
            type="email"
            className={`${styles.loginInput} ${styles.upperInput} text-base`}
            onChange={(e: any) => onChangeEmail(e.target.value)}
            value={email}
            placeholder="이메일"
          />
          <input
            type="password"
            className={`${styles.loginInput} ${styles.bottomInput} text-base`}
            onChange={(e: any) => onChangePw(e.target.value)}
            value={pw}
            placeholder="비밀번호"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="w-full h-full flex flex-col justify-center items-center">
          <button className="flex justify-center items-center w-[40%] min-w-[250px] max-w-[400px] rounded-lg bg-[#148EE6] text-white text-xl font-semibold p-4 m-3">
            로그인
          </button>
          <button
            onClick={() => nav('/register')}
            className="text-[#999999] text-sm underline"
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};
