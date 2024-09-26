import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarButton } from '@components/feature/SidebarButton';
import { useUser } from '@components/common/UserContext';
import styles from '@components/feature/Feature.module.css';

import logoExplain from '@/assets/images/logo_explain.png';
import domain from '@/assets/images/sidebar_domain.png';
import detect from '@/assets/images/sidebar_detect.png';
import history from '@/assets/images/sidebar_history.png';
import user from '@/assets/images/sidebar_user.png';
import logout from '@/assets/images/sidebar_logout.png';

const propId = 0;

const buttonProps = [
  {
    id: propId,
    imgSrc: domain,
    name: '품목 선택',
    goto: '/domain',
  },
  {
    id: propId + 1,
    imgSrc: detect,
    name: '불량 검출',
    goto: '/detect',
  },
  {
    id: propId + 2,
    imgSrc: history,
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
    imgSrc: user,
    name: '회원 정보',
    goto: '/user',
  },
  {
    id: propId + 4,
    imgSrc: logout,
    name: '로그아웃',
    goto: '/',
  },
];

export const Sidebar = () => {
  const nav = useNavigate();
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const { user } = useUser();

  function crossLine(width: number) {
    return (
      <div
        className={`border-solid border-[#999999] border-b-2 m-2 w-[${width}%]`}
      />
    );
  }

  function handleSelect(index: number) {
    setSelectedButtonIndex(index);
  }

  function gotoMain() {
    nav('/domain');
  }

  return (
    <>
      <div className={styles.sidebar}>
        <button
          onClick={() => {
            handleSelect(0);
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

        {crossLine(80)}

        <p>{user.nickname}님 안녕하세요!</p>

        {crossLine(80)}

        <ol>
          {buttonProps.map((prop) => {
            return prop.id !== propId - 1 ? (
              <li key={prop.id} onClick={() => handleSelect(prop.id)}>
                <SidebarButton
                  imgSrc={prop.imgSrc}
                  name={prop.name}
                  goto={prop.goto}
                  isSelected={selectedButtonIndex === prop.id}
                />
              </li>
            ) : (
              crossLine(100)
            );
          })}
        </ol>
      </div>
    </>
  );
};
