import styles from '@/pages/Pages.module.css';

import clock from '@/assets/images/clock.png';
import earth from '@/assets/images/earth.png';
import bulb from '@/assets/images/craked_bulb.png';

export const HistoryPage = () => {
  return (
    <>
      <div className="flex flex-col">
        {/* 윗줄 */}
        <div className="flex flex-row ">
          {/* 카메라 띄우기 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 카메라 컴포넌트 */}
            <p className="mx-4 my-1">▲ 총 불량 종류 통계</p>
            <div className="table">
              <ul className={styles.tableRow}>
                <li>
                  <img src={clock} alt="clock" />
                </li>
                <li>started at</li>
                <li>
                  {} | {}
                </li>
              </ul>
              <ul className={styles.tableRow}>
                <li>
                  <img src={earth} alt="earth" />
                </li>
                <li>current time</li>
                <li>
                  {} | {}
                </li>
              </ul>
            </div>
          </div>

          {/* 불량 사진 띄우기 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 불량사진 컴포넌트 */}
            <p className="mx-4 my-1">■ 날짜 당 불량 개수 통계</p>
            <div className="table">
              <ul className={styles.tableRow}>
                <li>
                  <img src={clock} alt="clock" />
                </li>
                <li>captured at</li>
                <li>
                  {} | {}
                </li>
              </ul>
              <ul className={styles.tableRow}>
                <li>
                  <img src={bulb} alt="bulb" />
                </li>
                <li>type</li>
                <li>{}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 아래줄 */}
        <div className={`${styles.boxLayout} flex-[1]`}>
          <div className="flex flex-row">
            {/* 불량 사진 탐색 */}
            <div className="flex-[1]">
              {/* 텍스트 영역 */}
              <div className="flex flex-row justify-between items-end">
                <p className="mx-4 my-1">● 불량 사진 탐색</p>
                <p className="mr-4 text-[#999999] text-xs">날짜 및 시간 선택</p>
              </div>

              {/* 날짜선택 컴포넌트 */}

              {/* 해당 날짜의 불량 선택 표 컴포넌트 */}
            </div>

            <div className="border-solid border-[#999999] border-r-2 my-4" />

            {/* 불량사진 영역 */}
            <div className="flex-[1]">
              {/* 불량사진 컴포넌트 */}
              <p className="text-[#E32626] mx-4 my-1">탐지된 불량 사진</p>
              <div className="table">
                <ul className={styles.tableRow}>
                  <li>
                    <img src={clock} alt="clock" />
                  </li>
                  <li>captured at</li>
                  <li>
                    {} | {}
                  </li>
                </ul>
                <ul className={styles.tableRow}>
                  <li>
                    <img src={bulb} alt="bulb" />
                  </li>
                  <li>type</li>
                  <li>{}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
