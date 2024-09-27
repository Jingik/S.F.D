import { useEffect, useState } from 'react';
import {
  SFD_URL,
  removeWhitespace,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from '@components/common/util';
import axios from 'axios';
import { Button } from '@components/feature/Button';
import { useNavigate } from 'react-router-dom';

import styles from '@/pages/Pages.module.css';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberMessage, setPhoneNumberMessage] = useState('');
  const [pw, setPw] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [checkPw, setCheckPw] = useState('');
  const [checkPwMessage, setCheckPwMessage] = useState('');
  const [isDisable, setIsDisable] = useState(true);
  const [buttonColor, setButtonColor] = useState('#148EE6');

  const nav = useNavigate();

  async function onChangeEmail(e: any) {
    const trimEmail = removeWhitespace(e.target.value);
    setEmail(trimEmail);

    if (!validateEmail(trimEmail)) {
      setEmailMessage('이메일 형식을 확인해주세요!');
      return;
    }

    const isEmailAvailable = await checkDuplicateEmail(trimEmail);
    setEmailMessage(
      isEmailAvailable ? '중복된 이메일입니다!' : '사용 가능한 이메일입니다.',
    );
  }

  // 이메일 중복 체크
  async function checkDuplicateEmail(email: string): Promise<boolean> {
    try {
      const response = await axios.get(`${SFD_URL}/user/check-email`, {
        params: { email: email },
      });
      return response.data;
    } catch (error) {
      console.log('axios error: ' + error);
      return false;
    }
  }

  // 비밀번호 입력 체크
  function onChangePw(e: any) {
    const trimPassWord = removeWhitespace(e.target.value);
    setPw(trimPassWord);
    setPwMessage(
      validatePassword(trimPassWord)
        ? ''
        : '영어 대소문자, 숫자, 특수문자 포함 8자 이상',
    );
  }

  // 비밀번호 확인 입력 체크
  function onChangeCheckPw(e: any) {
    const trimCheckPW = removeWhitespace(e.target.value);
    setCheckPw(trimCheckPW);
    setCheckPwMessage(() =>
      pw === trimCheckPW ? '' : '비밀번호가 일치하지 않습니다...',
    );
  }

  // 전화번호 입력 체크
  function onChangePhoneNumer(e: any) {
    const trimCheckPhoneNumber = removeWhitespace(e.target.value);
    setPhoneNumber(trimCheckPhoneNumber);
    setPhoneNumberMessage(() =>
      validatePhoneNumber(trimCheckPhoneNumber)
        ? ''
        : '"-"를 제외하고 숫자만 입력해주세요!',
    );
  }

  // 회원가입 버튼 활성화 & 비활성화 감지
  useEffect(() => {
    // 회원가입 버튼 활성화 & 비활성화
    function checkDisable() {
      if (
        emailMessage === '사용 가능한 이메일입니다.' &&
        pwMessage === '' &&
        checkPwMessage === '' &&
        email !== '' &&
        name !== '' &&
        nickname !== '' &&
        phoneNumber !== '' &&
        phoneNumberMessage !== '' &&
        pw !== '' &&
        checkPw !== '' &&
        pw === checkPw
      ) {
        setIsDisable(false);
      } else {
        setIsDisable(true);
      }
    }

    checkDisable();
  }, [
    email,
    emailMessage,
    name,
    nickname,
    phoneNumber,
    phoneNumberMessage,
    pw,
    pwMessage,
    checkPw,
    checkPwMessage,
  ]);

  useEffect(() => {
    setButtonColor(isDisable ? '#AAAAAA' : '#148EE6');
  }, [isDisable]);

  // 서버로 회원 정보 보내기
  function sendRegister() {
    const user = {
      email: email,
      password: pw,
      name: name,
      nickname: nickname,
      phoneNumber: phoneNumber,
    };

    axios
      .post(`${SFD_URL}/user/signup`, user)
      .then((response: any) => {
        console.log(response);
        alert('회원가입이 완료되었습니다!');
        nav('/login');
      })
      .catch((e: any) => {
        console.error('회원 가입 에러발생: ' + e);
        alert('회원가입에 문제가 생겼습니다...');
        return;
      });
  }

  // 회원가입
  const onSubmitRegister = async (e: React.FormEvent) => {
    // 폼 제출 시 새로고침 되는 것을 방지
    e.preventDefault();
    if (isDisable) return;
    sendRegister();
  };

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {/* 상단 제목 */}
      <p className="text-5xl m-6 mt-14 font-extrabold">회원가입</p>
      <p className="text-base m-2">환영합니다!!</p>

      {/* 회원정보 입력 영역 */}
      <form onSubmit={onSubmitRegister} className="w-full">
        <div className="flex flex-col w-full justify-center items-center overflow-y-auto">
          {/* 이메일 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">이메일</p>
            <input
              type="email"
              className={styles.input}
              onChange={onChangeEmail}
              value={email}
              placeholder="이메일"
            />
            <p
              className={
                emailMessage === '사용 가능한 이메일입니다.'
                  ? 'flex self-end text-xs text-[#47C93C] p-1'
                  : 'flex self-end text-xs text-[#E32626] p-1'
              }
            >
              {emailMessage}
            </p>
          </div>

          {/* 이름 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">이름</p>
            <input
              type="text"
              className={styles.input}
              onChange={(e: any) => setName(e.target.value)}
              value={name}
              placeholder="이름"
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">{}</p>
          </div>

          {/* 별명 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">별명</p>
            <input
              type="text"
              className={styles.input}
              onChange={(e: any) => setNickname(e.target.value)}
              value={nickname}
              placeholder="별명"
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">{}</p>
          </div>

          {/* 전화번호 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">전화번호</p>
            <input
              type="tel"
              className={styles.input}
              onChange={onChangePhoneNumer}
              value={phoneNumber}
              placeholder="01012345678"
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">
              {phoneNumberMessage}
            </p>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">비밀번호</p>
            <input
              type="password"
              className={styles.input}
              onChange={onChangePw}
              value={pw}
              placeholder="비밀번호"
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">
              {pwMessage}
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">비밀번호 확인</p>
            <input
              type="password"
              className={styles.input}
              onChange={onChangeCheckPw}
              value={checkPw}
              placeholder="비밀번호를 한 번 더 입력해주세요"
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">
              {checkPwMessage}
            </p>
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className="flex justify-center">
          <button
            className={styles.button}
            style={{ backgroundColor: buttonColor }}
            disabled={isDisable}
          >
            회원가입
          </button>

          <Button name="메인으로" color="#444444" path="/" />
        </div>
      </form>
    </div>
  );
};
