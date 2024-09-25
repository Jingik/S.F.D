import { useState } from 'react';
import styles from '@/pages/Pages.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import SFDLogo from '@/assets/images/SFD_logo.png';

export const LoginPage = () => {
  const [email, onChangeEmail] = useState('');
  const [pw, onChangePw] = useState('');

  const nav = useNavigate();

  // 로그인 시도할 때
  function handleLogin() {
    if (email === '') {
      alert('이메일을 입력하세요!');
      return;
    }

    if (pw === '') {
      alert('비밀번호를 입력하세요!');
      return;
    }

    // 임시 로그인 처리
    if (email === 'ssafy@ssafy.com' && pw === 'ssafy') {
      localStorage.setItem('token', '{ userId: 김싸피 }');
      nav('/domain');
      return;
    }

    const user = {
      email: email,
      password: pw,
    };

    axios
      .post('http://j11b103.p.ssafy.io:8080/api/user/login', user)
      .then((response: any) => {
        // 성공 시 토큰을 로컬스토리지에 저장
        localStorage.setItem('token', JSON.stringify(response.data));
        nav('/domain');
      })
      .catch((e: any) => {
        console.error('로그인 실패: ' + e);
        alert('로그인에 실패했습니다...');
      });
  }

  function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      {/* 제목 영역 */}
      <div className="flex justify-center items-center m-10">
        <button onClick={() => nav('/')}>
          <img src={SFDLogo} alt="SFD" />
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p className="text-4xl font-extrabold m-4">로그인</p>
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
          <button className="flex justify-center items-center w-[40%] rounded-lg bg-[#148EE6] text-white text-xl font-semibold p-4 m-3">
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
