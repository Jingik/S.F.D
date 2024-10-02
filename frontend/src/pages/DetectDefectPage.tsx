import { useEffect, useState } from 'react';
import styles from '@/pages/Pages.module.css';
import { LineChart } from '@components/feature/LineChart';
import { BarChart } from '../components/feature/BarChart';

import clock from '@/assets/images/clock.png';
import earth from '@/assets/images/earth.png';
import bulb from '@/assets/images/craked_bulb.png';

// 임시 데이터
const time = 16;

const data_line = [
  {
    id: 'count',
    color: '#ffffff',
    data: [
      {
        x: `${time}`,
        y: 1,
      },
      {
        x: `${time + 1}`,
        y: 1,
      },
      {
        x: `${time + 2}`,
        y: 2,
      },
      {
        x: `${time + 3}`,
        y: 2,
      },
      {
        x: `${time + 4}`,
        y: 0,
      },
    ],
  },
];

const data_bar = [
  {
    type: 'scratch',
    count: 23,
  },
  {
    type: 'inclusion',
    count: 14,
  },
  {
    type: 'fracture',
    count: 0,
  },
  {
    type: 'strain',
    count: 7,
  },
];

export const DetectDefectPage = () => {
  const [defectImg, setDefectImg] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);

  // 페이지 진입 시의 날짜 및 시간 설정 (한번만 실행)
  useEffect(() => {
    const day = new Date();
    const year = day.getFullYear().toString().substring(2);
    const month = (day.getMonth() + 1).toString().padStart(2, '0');
    const date = day.getDate().toString().padStart(2, '0');
    const hour = day.getHours().toString().padStart(2, '0');
    const minute = day.getMinutes().toString().padStart(2, '0');
    const seconds = day.getSeconds().toString().padStart(2, '0');

    setStartDate(`${year}-${month}-${date}`);
    setStartTime(`${hour}:${minute}:${seconds}`);
  }, []);

  // 실시간으로 현재 날짜와 시간 업데이트
  useEffect(() => {
    let animationFrameId: any;

    const updateCurrentTime = () => {
      const now = new Date();
      const year = now.getFullYear().toString().substring(2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const date = now.getDate().toString().padStart(2, '0');
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      setTodayDate(`${year}-${month}-${date}`);
      setCurrentTime(`${hour}:${minute}:${seconds}`);

      // 계속해서 requestAnimationFrame을 호출하여 시간 업데이트
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    };

    // 처음 호출
    animationFrameId = requestAnimationFrame(updateCurrentTime);

    // 컴포넌트 언마운트 시 requestAnimationFrame 중단
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-row w-full h-full">
      {/* 왼쪽줄 */}
      <div className="flex flex-col mb-4 w-full h-full">
        {/* 불량 사진 띄우기 */}
        <div className={`${styles.boxLayout}`}>
          <p className="m-4 mb-1">
            {/* 깜빡이도록 커스텀 */}
            <span className={`${styles.twinkle} mr-1 text-[#E32626]`}>●</span>
            <span className={`${styles.blink}`}>실시간 불량 탐지</span>
          </p>
          <div className="table">
            <ul className={styles.tableRow}>
              <li>
                <img src={clock} alt="clock" />
              </li>
              <li>started at</li>
              <li>
                {startDate} | {startTime}
              </li>
            </ul>
            <ul className={styles.tableRow}>
              <li>
                <img src={earth} alt="earth" />
              </li>
              <li>current time</li>
              <li>
                {todayDate} | {currentTime}
              </li>
            </ul>
          </div>

          {/* 불량사진 컴포넌트 */}
          <div className={styles.mediaContainer}>
            {!defectImg ? (
              '탐지된 불량이 없습니다!'
            ) : (
              <img src="" alt="defect" />
            )}
          </div>

          {/* 사진 설명 텍스트 */}
          <div className="table">
            <ul className={styles.tableRow}>
              <li>
                <img src={clock} alt="clock" />
              </li>
              <li>captured at</li>
              <li>{!defectImg ? '탐지된 불량이 없습니다!' : '탐지 시간'}</li>
            </ul>
            <ul className={styles.tableRow}>
              <li>
                <img src={bulb} alt="bulb" />
              </li>
              <li>type</li>
              <li>{!defectImg ? '탐지된 불량이 없습니다!' : '불량 종류'}</li>
            </ul>
          </div>

          {/* 해당 시간의 불량 선택 표 컴포넌트 */}
          <table className={styles.tableSet}>
            <thead>
              <tr className="border-solid border-[#1c93e9] border-b-2">
                <th>불량 유형</th>
                <th>검출 시간</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <button
                    className={
                      selectedButtonIndex === -1
                        ? ''
                        : 'bg-[#156ba9] rounded-tl-lg rounded-bl-lg'
                    }
                  >
                    데이터가
                  </button>
                </td>
                <td>
                  <button
                    className={
                      selectedButtonIndex === -1
                        ? ''
                        : 'bg-[#156ba9] rounded-tr-lg rounded-br-lg'
                    }
                  >
                    없습니다
                  </button>
                </td>
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
                    className={selectedButtonIndex === index ? 'selected' : ''}
                    onClick={() => handleClick(index)}
                  >
                    <td>{data.type}</td>
                    <td>{data.detectedTime}</td>
                  </button>
                </tr>
                  )) 
                }*/}
            </tbody>
          </table>
        </div>
      </div>

      {/* 오른쪽줄 */}
      <div className={`flex flex-col w-full h-full`}>
        <div className={`${styles.boxLayout} mb-4`}>
          <p className={`m-4 ${styles.blink}`}>■ 시간 당 불량 개수 통계</p>
          {/* 통계 그래프 영역 */}
          <div className={`${styles.lineChart} ${styles.borderLine}`}>
            <LineChart data={data_line} />
          </div>

          <div className="table m-2">
            <ul className={`${styles.tableRow}`}>
              <li>↑</li>
              <li>vertical</li>
              <li>불량 개수</li>
            </ul>
            <ul className={`${styles.tableRow}`}>
              <li>→</li>
              <li>horizontal</li>
              <li>탐지 시간</li>
            </ul>
          </div>
        </div>

        {/* 불량 종류 통계 */}
        <div className={`${styles.boxLayout}`}>
          {/* 통계 그래프 영역 */}
          <p className={`m-4 ${styles.blink}`}>▲ 불량 종류 통계</p>
          <div className={`${styles.barChart} ${styles.borderBar}`}>
            <BarChart data={data_bar} />
          </div>

          {/* 텍스트 영역 */}
          <div className="table m-2">
            <ul className={`${styles.tableRow}`}>
              <li>↑</li>
              <li>vertical</li>
              <li>불량 개수</li>
            </ul>
            <ul className={`${styles.tableRow}`}>
              <li>→</li>
              <li>horizontal</li>
              <li>불량 종류</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
