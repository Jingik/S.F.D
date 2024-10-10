import { useEffect, useState } from 'react';
import { useUser } from '@components/common/UserContext';
import {
  SFD_URL,
  axiosSecurity,
  removeWhitespace,
} from '@components/common/util';
import styles from '@/pages/Pages.module.css';
import { Outlet, useNavigate } from 'react-router-dom';

export const UserInfoPage = () => {
  const nav = useNavigate();
  const { user } = useUser();
  const [pw, setPw] = useState('');
  const [isDisable, setIsDisable] = useState(true);
  const [buttonColor, setButtonColor] = useState('#148EE6');

  const isVerified = location.pathname === '/user';

  // 비밀번호 입력 체크
  function onChangePw(e: any) {
    const trimPassWord = removeWhitespace(e.target.value);
    setPw(trimPassWord);
  }

  // 버튼 활성화 & 비활성화 감지
  useEffect(() => {
    function checkDisable() {
      if (pw !== '') {
        setIsDisable(false);
      } else {
        setIsDisable(true);
      }
    }

    checkDisable();
  }, [pw]);

  useEffect(() => {
    setButtonColor(isDisable ? '#AAAAAA' : '#148EE6');
  }, [isDisable]);

  // 서버로 회원 정보 보내기
  async function sendUser() {
    const userData = {
      email: user.email,
      password: pw,
    };

    try {
      const response = await axiosSecurity.post(
        `${SFD_URL}/auth/login`,
        userData,
      );
      localStorage.setItem('token', JSON.stringify(response.data));
      setPw('');
      nav('edit');
    } catch (error) {
      console.error(error);
      alert('비밀번호를 확인해주세요!');
      return;
    }
  }

  // 폼 보내기
  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisable) return;
    sendUser();
  };

  return isVerified ? (
    <div className={styles.boxLayout}>
      <div className="m-6">
        <div className="text-3xl font-bold mb-2">😃 회원 정보 수정</div>
        <div className="text-lg ml-12">
          회원 정보를 수정하려면 비밀번호를 입력해주세요!
        </div>
      </div>

      {/* 비밀번호 입력 영역 */}
      <form onSubmit={onSubmitEdit} className="w-full">
        <div className="flex flex-col w-full justify-center items-center overflow-y-auto">
          {/* 비밀번호 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">비밀번호</p>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className={styles.input}
              onChange={onChangePw}
              value={pw}
              placeholder="비밀번호"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-center">
          <button
            className={styles.button}
            style={{ backgroundColor: buttonColor }}
            disabled={isDisable}
          >
            확인
          </button>
        </div>
      </form>
    </div>
  ) : (
    <Outlet />
  );
};
