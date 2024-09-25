import styles from '@/pages/Pages.module.css';
import { useState } from 'react';

import { BarChart } from '../components/feature/BarChart';
import { LineChart } from '../components/feature/LineChart';

import clock from '@/assets/images/clock.png';
import bulb from '@/assets/images/craked_bulb.png';
import DatePicker from 'react-datepicker';

// 임시 데이터
const time = 3;

const data_line = [
  {
    id: 'count',
    color: '#ffffff',
    data: [
      {
        x: `${time}`,
        y: 8,
      },
      {
        x: `${time + 1}`,
        y: 25,
      },
      {
        x: `${time + 2}`,
        y: 15,
      },
      {
        x: `${time + 3}`,
        y: 10,
      },
      {
        x: `${time + 4}`,
        y: 19,
      },
    ],
  },
];

const data_bar = [
  {
    type: 'scratch',
    count: 73,
  },
  {
    type: 'pitted surface',
    count: 12,
  },
  {
    type: 'inclusion',
    count: 38,
  },
  {
    type: 'crazing',
    count: 0,
  },
  {
    type: 'fracture',
    count: 30,
  },
  {
    type: 'strain',
    count: 49,
  },
];

export const HistoryPage = () => {
  return (
    <>
      <div className="flex flex-col">
        {/* 윗줄 */}
        <div className="flex flex-row">
          {/* 총 불량 개수 통계 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 통계 그래프 영역 */}
            <div className={styles.barChart}>
              <BarChart data={data_bar} />
            </div>

            {/* 텍스트 영역 */}
            <p className="mx-4 my-1">▲ 총 불량 개수 통계</p>
            <div className="table">
              <ul className={`${styles.tableRow} ml-2`}>
                <li>↑</li>
                <li>vertical</li>
                <li>불량 개수</li>
              </ul>
              <ul className={`${styles.tableRow} ml-2`}>
                <li>→</li>
                <li>horizontal</li>
                <li>불량 종류</li>
              </ul>
            </div>
          </div>

          {/* 날짜 당 불량 개수 통계 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 통계 그래프 영역 */}
            <div className={styles.lineChart}>
              <LineChart data={data_line} />
            </div>

            {/* 텍스트 영역 */}
            <p className="mx-4 my-1">■ 날짜 당 불량 개수 통계</p>
            <div className="table">
              <ul className={`${styles.tableRow} ml-2`}>
                <li>↑</li>
                <li>vertical</li>
                <li>불량 개수</li>
              </ul>
              <ul className={`${styles.tableRow} ml-2`}>
                <li>→</li>
                <li>horizontal</li>
                <li>탐지 날짜</li>
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

              {/* 날짜선택(date picker) 컴포넌트 */}
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="YY-MM-dd"
                />
              </div>

              {/* 해당 날짜의 불량 선택 표 컴포넌트 */}
              <table className={styles.tableSet}>
                <tr className="border-solid border-[#1c93e9] border-b-2">
                  <th>불량 유형</th>
                  <th>검출 시간</th>
                </tr>
                <tr>
                  <button className={isSelected ? 'selected' : ''}>
                    <td>데이터가</td>
                    <td>없습니다</td>
                  </button>
                </tr>
                {/* {
                !Arrays ? (
                <tr>
                  <button className={isSelected ? 'selected' : ''}>
                    <td>데이터가</td>
                    <td>없습니다</td>
                  </button>
                </tr>
                ) : (Arrays.map((data, index) => (
                <tr key={index}>
                  <button
                    className={isSelected ? 'selected' : ''}
                    onClick={handleClick}
                  >
                    <td>{data.type}</td>
                    <td>{data.detectedTime}</td>
                  </button>
                </tr>
                )) */}
              </table>
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
