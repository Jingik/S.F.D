import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from '@/pages/Pages.module.css';
import { axiosSecurity } from '../components/common/util';

export const SelectDomainPage = () => {
  const [isSelected, setIsSelected] = useState(NaN);
  const nav = useNavigate();
  const location = useLocation();

  const isDomainPage = location.pathname === '/domain';

  const domainList = ['너트', '각설탕', '지우개'];

  function handleClick(index: number) {
    setIsSelected(index);
  }

  function submitDomain() {
    // axiosSecurity.post('/domain', { domain: domainList[isSelected] });
    nav('/detect');
  }

  return (
    <div className={`${styles.boxLayout} h-full`}>
      {isDomainPage ? (
        <>
          {/* 윗부분 */}
          <div className="flex justify-between">
            <p className="m-6 text-3xl font-bold">
              □ 불량을 검출할 품목명 선택
            </p>
            <button
              className="m-6 text-[#999999] items-end"
              onClick={() => nav('request')}
            >
              + 새 품목 추가 요청
            </button>
          </div>

          {/* 목록 */}
          <div className="m-6 h-[80%] overflow-y-auto">
            <ol>
              {domainList.map((domain, index) => (
                <li key={index} className="">
                  <button
                    className={
                      isSelected === index
                        ? 'p-2 bg-[#A4D69F] text-white font-bold rounded-md'
                        : 'p-2'
                    }
                    onClick={() => handleClick(index)}
                  >
                    {domain}
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
