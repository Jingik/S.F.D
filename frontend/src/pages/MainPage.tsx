import { useNavigate } from 'react-router-dom';
import styles from '@/pages/Pages.module.css';
import SFD_gif from '@/assets/images/SFD_gif.gif';

export function MainPage() {
  const nav = useNavigate();

  return (
    <>
      <div className="flex flex-col items-center">
        {/* 상단 회원 메뉴 */}
        <div className="flex flex-row justify-center border-solid border-[#999999] border-b-2 w-[80%]">
          <button
            className={styles.topTextButton}
            onClick={() => nav('/login')}
          >
            로그인
          </button>
          <button
            className={styles.topTextButton}
            onClick={() => nav('/register')}
          >
            회원가입
          </button>
        </div>

        {/* SFD gif */}
        <div className="m-4 w-[80%]">
          <img src={SFD_gif} alt="SFD_gif" />
        </div>

        {/* 안내 문구 */}
        <div className="m-2 text-2xl">
          <p>종류 상관 없는 스마트팩토리</p>
        </div>
      </div>
    </>
  );
}
