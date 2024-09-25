import styles from '@/pages/Pages.module.css';
import { LineChart } from '@components/feature/LineChart';

import clock from '@/assets/images/clock.png';
import earth from '@/assets/images/earth.png';
import bulb from '@/assets/images/craked_bulb.png';
import { BarChart } from '../components/feature/BarChart';
import { useEffect, useState } from 'react';

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
    type: 'pitted surface',
    count: 10,
  },
  {
    type: 'inclusion',
    count: 14,
  },
  {
    type: 'crazing',
    count: 3,
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
    <>
      <div className="flex flex-col">
        {/* 윗줄 */}
        <div className="flex flex-row ">
          {/* 카메라 띄우기 */}
          <div className={`${styles.boxLayout} flex-[5]`}>
            {/* 카메라 컴포넌트 */}
            <div className="flex justify-center items-center w-auto h-40 rounded-lg m-4">
              <div className="text-3xl text-center border-dashed border-[#999999] border-2 p-10 rounded-lg">
                비디오 영역
              </div>
            </div>

            <p className="mx-4 my-1">
              <span className="mr-1 text-[#E32626]">●</span>
              <span>실시간 불량 탐지</span>
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
          </div>

          {/* 불량 사진 띄우기 */}
          <div className={`${styles.boxLayout} flex-[4]`}>
            {/* 불량사진 컴포넌트 */}
            <div className="flex justify-center items-center w-auto h-40 rounded-lg m-4">
              {!defectImg ? (
                <div className="text-3xl text-center border-dashed border-[#999999] border-2 p-8 rounded-lg">
                  탐지된 불량 데이터가 <br /> 없습니다!
                </div>
              ) : (
                <img src="" alt="defect" />
              )}
            </div>

            <p className="text-[#E32626] mx-4 my-1">! Defect Detected</p>
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
        <div className="flex flex-row">
          {/* 시간 당 불량 개수 통계 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 통계 그래프 영역 */}
            <div className={styles.lineChart}>
              <LineChart data={data_line} />
            </div>

            {/* 텍스트 영역 */}
            <p className="mx-4 my-1">■ 시간 당 불량 개수 통계</p>
            <div className="table">
              <ul className={`${styles.tableRow} ml-2`}>
                <li>↑</li>
                <li>vertical</li>
                <li>불량 개수</li>
              </ul>
              <ul className={`${styles.tableRow} ml-2`}>
                <li>→</li>
                <li>horizontal</li>
                <li>탐지 시간</li>
              </ul>
            </div>
          </div>

          {/* 불량 종류 통계 */}
          <div className={`${styles.boxLayout} flex-[1]`}>
            {/* 통계 그래프 영역 */}
            <div className={styles.barChart}>
              <BarChart data={data_bar} />
            </div>

            {/* 텍스트 영역 */}
            <p className="mx-4 my-1">▲ 불량 종류 통계</p>
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
        </div>
      </div>
    </>
  );
};
