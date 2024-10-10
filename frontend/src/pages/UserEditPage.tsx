import { useEffect, useState } from 'react';
import { useUser } from '@components/common/UserContext';
import {
  SFD_URL,
  axiosSecurity,
  removeWhitespace,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from '@components/common/util';
import axios from 'axios';
import styles from '@/pages/Pages.module.css';

export const UserEditPage = () => {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState(user.email);
  const [emailMessage, setEmailMessage] = useState('');
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(user.nickname);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [phoneNumberMessage, setPhoneNumberMessage] = useState('');
  const [pw, setPw] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [isDisable, setIsDisable] = useState(true);
  const [buttonColor, setButtonColor] = useState('#148EE6');

  async function onChangeEmail(e: any) {
    const trimEmail = removeWhitespace(e.target.value);
    setEmail(trimEmail);

    if (trimEmail === user.email) {
      setEmailMessage('');
      return;
    }

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

    if (trimPassWord === '') {
      setPwMessage('');
      return;
    }

    setPwMessage(
      validatePassword(trimPassWord)
        ? '적합한 비밀번호입니다.'
        : '영어 대소문자, 숫자, 특수문자 포함 8자 이상',
    );
  }

  // 전화번호 입력 체크
  function onChangePhoneNumer(e: any) {
    const trimCheckPhoneNumber = removeWhitespace(e.target.value);
    setPhoneNumber(trimCheckPhoneNumber);

    if (trimCheckPhoneNumber === user.phoneNumber) {
      setPhoneNumberMessage('');
      return;
    }

    setPhoneNumberMessage(() =>
      validatePhoneNumber(trimCheckPhoneNumber)
        ? '올바른 전화번호 형식입니다.'
        : '"-"를 제외하고 숫자만 입력해주세요!',
    );
  }

  // 회원가입 버튼 활성화 & 비활성화 감지
  useEffect(() => {
    // 회원가입 버튼 활성화 & 비활성화
    function checkDisable() {
      if (
        email !== '' &&
        emailMessage !== '이메일 형식을 확인해주세요!' &&
        emailMessage !== '중복된 이메일입니다!' &&
        name !== '' &&
        nickname !== '' &&
        phoneNumber !== '' &&
        phoneNumberMessage !== '"-"를 제외하고 숫자만 입력해주세요!' &&
        pwMessage !== '영어 대소문자, 숫자, 특수문자 포함 8자 이상'
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
  ]);

  useEffect(() => {
    setButtonColor(isDisable ? '#AAAAAA' : '#148EE6');
  }, [isDisable]);

  // 서버로 회원 정보 보내기
  function sendRegister() {
    let user: any;

    if (pw === '') {
      user = {
        email: email,
        name: name,
        nickname: nickname,
      };
    } else {
      user = {
        email: email,
        password: pw,
        name: name,
        nickname: nickname,
      };
    }

    axiosSecurity
      .put(`${SFD_URL}/user/update`, user)
      .then((response: any) => {
        console.log(response);
        setUser({
          nickname: response.data.nickname,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          name: response.data.name,
        });
        alert('회원 정보가 수정되었습니다!');
      })
      .catch((e: any) => {
        console.error('회원 정보 수정 에러발생: ' + e);
        alert('정보 수정에 문제가 생겼습니다...');
        return;
      });
  }

  // 정보수정
  const onSubmitEdit = async (e: React.FormEvent) => {
    // 폼 제출 시 새로고침 되는 것을 방지
    e.preventDefault();
    if (isDisable) return;
    sendRegister();
  };

  return (
    <div className={styles.boxLayout}>
      <div className="m-6">
        <div className="text-3xl font-bold mb-2">😃 회원 정보 수정</div>
        <div className="text-lg ml-12">
          정보를 수정하려면 내용을 변경해주세요!
        </div>
      </div>

      {/* 회원정보 입력 영역 */}
      <form onSubmit={onSubmitEdit} className="w-full">
        <div className="flex flex-col w-full justify-center items-center overflow-y-auto">
          {/* 이메일 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">이메일</p>
            <input
              type="email"
              name="email"
              autoComplete="email"
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
              name="name"
              autoComplete="name"
              className={styles.input}
              onChange={(e: any) => setName(e.target.value)}
              value={name}
              placeholder="이름"
              disabled
            />
            <p className="flex self-end text-xs text-[#E32626] p-1">{}</p>
          </div>

          {/* 별명 */}
          <div className="flex flex-col">
            <p className="flex self-start text-lg p-1">별명</p>
            <input
              type="text"
              name="nickname"
              autoComplete="cc-name"
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
              name="tel"
              autoComplete="tel"
              className={styles.input}
              onChange={onChangePhoneNumer}
              value={phoneNumber}
              placeholder="01012345678"
              disabled
            />
            <p
              className={
                phoneNumberMessage === '올바른 전화번호 형식입니다.'
                  ? 'flex self-end text-xs text-[#47C93C] p-1'
                  : 'flex self-end text-xs text-[#E32626] p-1'
              }
            >
              {phoneNumberMessage}
            </p>
          </div>

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
            <p
              className={
                pwMessage === '적합한 비밀번호입니다.'
                  ? 'flex self-end text-xs text-[#47C93C] p-1'
                  : 'flex self-end text-xs text-[#E32626] p-1'
              }
            >
              {pwMessage}
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
            정보 수정
          </button>
        </div>
      </form>
    </div>
  );
};
