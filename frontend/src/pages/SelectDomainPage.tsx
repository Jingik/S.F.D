import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import { axiosSecurity } from '@components/common/util';
import styles from '@/pages/Pages.module.css';

import nut from '@/assets/images/domain_nut.jpg';
import lumpSuger from '@/assets/images/domain_lump_suger.jpg';
import eraser from '@/assets/images/domain_eraser.jpg';

export const SelectDomainPage = () => {
  const [isSelected, setIsSelected] = useState(NaN);
  const nav = useNavigate();
  const location = useLocation();

  const isDomainPage = location.pathname === '/domain';

  const domainList = [
    {
      img: nut,
      name: '너트',
    },
    {
      img: lumpSuger,
      name: '각설탕',
    },
    {
      img: eraser,
      name: '지우개',
    },
  ];

  function handleClick(index: number) {
    setIsSelected(index);
  }

  function submitDomain() {
    // axiosSecurity.post('/domain', { domain: domainList[isSelected] });
    nav('/detect');
  }

  return (
    <div className={`${styles.boxLayout}`}>
      {isDomainPage ? (
        <>
          {/* 윗부분 */}
          <div className="flex justify-between">
            <div className="m-6 text-3xl font-bold flex flex-row">
              <p className="mr-2">□</p>
              <p>불량을 검출할 품목명 선택</p>
            </div>
            <button
              className="m-6 text-[#999999] items-end min-w-[8rem]"
              onClick={() => nav('request')}
            >
              + 새 품목 추가 요청
            </button>
          </div>

          {/* 목록 */}
          <div className="m-6 h-[80%] w-auto overflow-y-auto">
            <ol className={`${styles.pageLayout}`}>
              {domainList.map((domain, index) => (
                <li key={index} className="flex-grow flex self-center">
                  <button
                    className={
                      isSelected === index
                        ? `${styles.cardContainerSelected}`
                        : `${styles.cardContainer}`
                    }
                    disabled={index === 0 ? false : true}
                    onClick={() => handleClick(index)}
                  >
                    <div>
                      <img
                        src={domain.img}
                        alt="domainImg"
                        className={`${styles.imgCard}`}
                      />
                      <p className="mt-4">{domain.name}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* 버튼 */}
          <div className="flex justify-center mb-4">
            <button
              className={styles.button}
              style={
                !isNaN(isSelected)
                  ? { backgroundColor: '#47C93C' }
                  : { backgroundColor: '#999999' }
              }
              onClick={submitDomain}
              disabled={isNaN(isSelected)}
            >
              불량 검사하기
            </button>
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};
