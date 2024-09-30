import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarButton } from '@components/feature/SidebarButton';
import { useUser } from '@components/common/UserContext';
import styles from '@components/feature/Feature.module.css';

import logoExplain from '@/assets/images/logo_explain.png';
import domainImg from '@/assets/images/sidebar_domain.png';
import detectImg from '@/assets/images/sidebar_detect.png';
import historyImg from '@/assets/images/sidebar_history.png';
import userImg from '@/assets/images/sidebar_user.png';
import logoutImg from '@/assets/images/sidebar_logout.png';

export const Sidebar = () => {
  const nav = useNavigate();
  const { user } = useUser();
  const location = useLocation();

  const propId = 0;

  const buttonProps = [
    {
      id: propId,
      imgSrc: domainImg,
      name: '품목 선택',
      goto: '/domain',
    },
    {
      id: propId + 1,
      imgSrc: detectImg,
      name: '불량 검출',
      goto: '/detect',
    },
    {
      id: propId + 2,
      imgSrc: historyImg,
      name: '전체기록 조회',
      goto: '/history',
    },
    {
      id: propId - 1,
      imgSrc: '',
      name: '',
      goto: '',
    },
    {
      id: propId + 3,
      imgSrc: userImg,
      name: '회원 정보',
      goto: '/user',
    },
    {
      id: propId + 4,
      imgSrc: logoutImg,
      name: '로그아웃',
      goto: '/',
    },
  ];

  function crossLine() {
    return (
      <div className={`border-solid border-[#999999] border-b-2 m-2 w-[95%]`} />
    );
  }

  function gotoMain() {
    nav('/domain');
  }

  return (
    <div className={styles.sidebar}>
      <button
        onClick={() => {
          gotoMain();
        }}
        className="w-full m-3"
      >
        <div className="flex flex-row">
          <div className="flex flex-[1] justify-end items-center mr-4">
            <p className="font-bold text-5xl">SFD</p>
          </div>
          <div className="flex flex-[1] flex-col mr-2">
            <img src={logoExplain} alt="logo_explain" />
          </div>
        </div>
      </button>

      <div className="border-solid border-[#999999] border-y-2 m-2 p-4 w-[80%] flex justify-center">
        <p>{user.nickname}님 안녕하세요!</p>
      </div>

      <ol>
        {buttonProps.map((prop) => {
          return prop.id !== propId - 1 ? (
            <li key={prop.id}>
              <SidebarButton
                imgSrc={prop.imgSrc}
                name={prop.name}
                goto={prop.goto}
                isSelected={prop.goto === location.pathname}
              />
            </li>
          ) : (
            crossLine()
          );
        })}
      </ol>
    </div>
  );
};
