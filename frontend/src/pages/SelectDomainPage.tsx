import styles from '@/pages/Pages.module.css';

export const SelectDomainPage = () => {
  return (
    <>
      <div className={`${styles.boxLayout} h-[41rem]`}>
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
            <li>
              <button>너트</button>
            </li>
            <li>
              <button>각설탕</button>
            </li>
            <li>
              <button>지우개</button>
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};
