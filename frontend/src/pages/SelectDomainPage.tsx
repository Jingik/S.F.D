import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/pages/Pages.module.css';

export const SelectDomainPage = () => {
  const [isSelected, setIsSelected] = useState(false);
  const [buttonColor, setButtonColor] = useState('#999999');
  const nav = useNavigate();

  const domainList = ['너트', '각설탕', '지우개'];

  return (
    <div className={`${styles.boxLayout} h-full`}>
      {/* 윗부분 */}
      <div className="flex justify-between">
        <p className="m-6 text-3xl font-bold">□ 불량을 검출할 품목명 선택</p>
        <button className="m-6 text-[#999999] items-end">
          + 새 품목 추가 요청
        </button>
      </div>

      {/* 목록 */}
      <div className="m-6 overflow-y-auto">
        <ol>
          {domainList.map((domain, index) => (
            <li key={index}>
              <button className="">{domain}</button>
            </li>
          ))}
        </ol>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center mb-4">
        <button
          className={styles.button}
          style={{ backgroundColor: buttonColor }}
          onClick={() => nav('/detect')}
          disabled={!isSelected}
        >
          불량 검사하기
        </button>
      </div>
    </div>
  );
};
