import styles from '@components/feature/Feature.module.css';
import { SidebarButton } from './SidebarButton';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosSecurity } from '../common/util';

const propId = 0;

const buttonProps = [
  {
    id: propId,
    imgName: 'sidebar_domain.png',
    name: '품목 선택',
    goto: '/domain',
  },
  {
    id: propId + 1,
    imgName: 'sidebar_detect.png',
    name: '불량 검출',
    goto: '/detect',
  },
  {
    id: propId + 2,
    imgName: 'sidebar_history.png',
    name: '전체기록 조회',
    goto: '/history',
  },
  {
    id: propId - 1,
    imgName: '',
    name: '',
    goto: '',
  },
  {
    id: propId + 3,
    imgName: 'sidebar_user.png',
    name: '회원 정보',
    goto: '/user',
  },
  {
    id: propId + 4,
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

  useEffect(() => {
    axiosSecurity.get(`/user/info`).then((response: any) => {
      setUserNickname(response.data.nickname);
    });
  }, [setUserNickname]);

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
          {buttonProps.map((prop) => {
            return prop.id !== propId - 1 ? (
              <li key={prop.id} onClick={() => handleSelect(prop.id)}>
                <SidebarButton
                  imgName={prop.imgName}
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
