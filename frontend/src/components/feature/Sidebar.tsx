import styles from '@components/feature/Feature.module.css';
import { SidebarButton } from './SidebarButton';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  name: string;
  nickname: string;
  password: string;
}

const buttonProps = [
  {
    imgName: 'sidebar_domain.png',
    name: '품목 선택',
    goto: 'domain',
  },
  {
    imgName: 'sidebar_detect.png',
    name: '불량 검출',
    goto: 'detect',
  },
  {
    imgName: 'sidebar_history.png',
    name: '전체기록 조회',
    goto: 'history',
  },
  null,
  {
    imgName: 'sidebar_user.png',
    name: '회원 정보',
    goto: 'user',
  },
  {
    imgName: 'sidebar_logout.png',
    name: '로그아웃',
    goto: '/',
  },
];

export const Sidebar = () => {
  const nav = useNavigate();
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [userNickname, setUserNickname] = useState('');

  function crossLine(width: number) {
    return (
      <div
        className={`border-solid border-[#999999] border-b-[1px] m-2 w-[${width}%]`}
      />
    );
  }

  function handleSelect(index: number) {
    setSelectedButtonIndex(index);
  }

  function gotoMain() {
    nav('domain');
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken: User = jwtDecode(token!);
    setUserNickname(decodedToken.nickname);
  }, []);

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
            <div className="flex flex-[1] justify-end items-center">
              <p className="font-bold text-5xl">SFD</p>
            </div>
            <div className="flex flex-[1] flex-col mr-2">
              {/* <div className="self-start ml-3.5">Smart</div>
              <div className="">Factory</div>
              <div className="self-end mr-3">Detector</div> */}
              <img
                src="src/assets/images/logo_explain.png"
                alt="logo_explain"
              />
            </div>
          </div>
        </button>

        {crossLine(80)}

        <p>{userNickname}님 안녕하세요!</p>

        {crossLine(80)}

        <ol>
          {buttonProps.map((prop, index) => {
            return prop !== null ? (
              <li key={index} onClick={() => handleSelect(index)}>
                <SidebarButton
                  imgName={prop.imgName}
                  name={prop.name}
                  goto={prop.goto}
                  isSelected={selectedButtonIndex === index}
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
