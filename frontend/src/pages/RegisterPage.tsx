import { useEffect, useState } from 'react';
import {
  validateEmail,
  removeWhitespace,
  validatePassword,
  axiosSecurity,
} from '@components/common/util';
import styles from '@/pages/Pages.module.css';
import { Button } from '@components/common/Button';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [pw, setPw] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [checkPw, setCheckPw] = useState('');
  const [checkPwMessage, setCheckPwMessage] = useState('');
  const [isDisable, setIsDisable] = useState(true);
  const [buttonColor, setButtonColor] = useState('#148EE6');

  const nav = useNavigate();

  // 이메일 입력 체크
  function onChangeEmail(e: any) {
    const trimEmail = removeWhitespace(e.target.value);
    setEmail(trimEmail);
    setEmailMessage(() => {
      if (!validateEmail(trimEmail)) {
        return '이메일 형식을 확인해주세요';
      }
      if (checkDuplicateEmail(trimEmail)) {
        return '중복된 이메일입니다';
      }
      return '사용 가능한 이메일입니다.';
    });
  }

  // 이메일 중복 체크
  function checkDuplicateEmail(trimEmail: string) {
    axiosSecurity.get('/', { email: trimEmail }).then((response: any) => {
      console.log(response);
      return response.data;
    }).catch((e: any) => {
      console.log('axios error: ' + e);
      return
    });
    return true;
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
      pw === trimCheckPW ? '' : '비밀번호가 일치하지 않습니다.',
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
    pw,
    pwMessage,
    checkPw,
    checkPwMessage,
  ]);

  useEffect(() => {
    setButtonColor(isDisable ? '#AAAAAA' : '#148EE6')
  }, [isDisable])

  // 서버로 회원 정보 보내기
  function sendRegister() {
    const user = {
      email: email,
      name: name,
      nickname: nickname,
      password: pw,
    };

    axiosSecurity
      .post('/', user)
      .then((response: any) => {
        console.log(response);
      })
      .then(nav('login'))
      .catch((e: any) => {
        console.error('회원 정보 보내기 에러발생: ' + e);
      });
  }

  // 회원가입
  const onSubmitRegister = async (e: React.FormEvent) => {
    // 폼 제출 시 새로고침 되는 것을 방지
    e.preventDefault();
    if(isDisable) return;
    sendRegister();
  };

  return (
    <div className='flex flex-col justify-center items-center w-full h-full'>
      {/* 상단 제목 */}
      <p className='text-5xl p-4 font-extrabold'>회원가입</p>
      <p className='text-base p-2'>환영합니다!!</p>

        {/* 회원정보 입력 영역 */}
      <form onSubmit={onSubmitRegister} className='w-full'>
        <div className='flex flex-col w-full justify-center items-center overflow-y-auto'>
          {/* 이메일 */}
          <div className='flex flex-col'>
            <p className='flex self-start text-lg p-1'>
              이메일
            </p>
            <input
              type='email'
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
          <div className='flex flex-col'>
            <p className='flex self-start text-lg p-1'>
              이름
            </p>
            <input
              type='text'
              className={styles.input}
              onChange={(e: any) => setName(e.target.value)}
              value={name}
              placeholder="이름"
            />
            <p className='flex self-end text-xs text-[#E32626] p-1'>
              { }
            </p>
          </div>

          {/* 별명 */}
          <div className='flex flex-col'>
            <p className='flex self-start text-lg p-1'>
              별명
            </p>
            <input
              type='text'
              className={styles.input}
              onChange={(e: any) => 
                setNickname(e.target.value)
              }
              value={nickname}
              placeholder="별명"
            />
            <p className='flex self-end text-xs text-[#E32626] p-1'>
              { }
            </p>
          </div>

          {/* 비밀번호 */}
          <div className='flex flex-col'>
            <p className='flex self-start text-lg p-1'>
              비밀번호
            </p>
            <input
              type='password'
              className={styles.input}
              onChange={onChangePw}
              value={pw}
              placeholder="비밀번호"
            />
            <p className='flex self-end text-xs text-[#E32626] p-1'>
              {pwMessage}
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div className='flex flex-col'>
            <p className='flex self-start text-lg p-1'>
              비밀번호 확인
            </p>
            <input
              type='password'
              className={styles.input}
              onChange={onChangeCheckPw}
              value={checkPw}
              placeholder="비밀번호를 한 번 더 입력해주세요"
            />
            <p className='flex self-end text-xs text-[#E32626] p-1'>
              {checkPwMessage}
            </p>
          </div>
        </div>
        {/* 하단 버튼 */}
        <div className='flex justify-center w-full h-full'>
          <button
            className={styles.button}
            style={{ backgroundColor: buttonColor}}
            disabled={isDisable}
          >
            회원가입
          </button>
          
          <Button name='메인으로' color='#444444' path='/' />
        </div>
      </form>
    </div>
  );
};
