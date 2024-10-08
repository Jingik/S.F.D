import { useEffect, useState } from 'react';
import { LineChart } from '@components/feature/LineChart';
import { BarChart } from '@components/feature/BarChart';
import { axiosSecurity, SFD_URL } from '@components/common/util';
import styles from '@/pages/Pages.module.css';

import clock from '@/assets/images/clock.png';
import earth from '@/assets/images/earth.png';
import bulb from '@/assets/images/craked_bulb.png';
import { useLocation } from 'react-router-dom';

export const DetectDefectPage = () => {
  const [lineData, setLineData] = useState([
    {
      id: 'count',
      color: '#ffffff',
      data: [
        {
          x: '0',
          y: 0,
        },
      ],
    },
  ]);
  const [barData, setBarData] = useState([{}]);
  const [barCounts, setBarCounts] = useState({
    scratches: 0,
    rusting: 0,
    fracture: 0,
    deformation: 0,
    undefined: 0,
  });
  const [tableData, setTableData] = useState([
    {
      id: 0,
      type: '',
      date: '',
      time: '',
      confidence: 0,
    },
  ]);
  const [timeCounts, setTimeCounts] = useState<{ [key: string]: number }>({});
  const [defectImg, setDefectImg] = useState({
    imgSrc: '',
    date: '',
    time: '',
    type: '',
  });
  const [startDate, setStartDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [lengthId, setLengthId] = useState(0);
  const [selectedButtonId, setSelectedButtonId] = useState(0);

  // 표 버튼 클릭했을 때
  function handleClick(data: any) {
    // console.log(data);
    setSelectedButtonId(data.id);

    setDefectImg({
      imgSrc: data.imgSrc,
      date: data.date,
      time: data.time,
      type: data.type,
    });
  }

  // SSE 연결
  const location = useLocation();
  useEffect(() => {
    // BE와 세션 연결
    const sseEvents = new EventSource(
      `http://j11b103.p.ssafy.io:8080/api/session/connect`,
      {
        withCredentials: true,
      },
    );

    // 연결 됐을 때
    sseEvents.onopen = function () {
      console.log('SSE 연결되었습니다!');
    };

    // 에러일 때
    sseEvents.onerror = function (error: any) {
      console.error('SSE 연결에 문제가 생겼습니다...' + JSON.stringify(error));
    };

    // 서버에서 "object-detected" 이벤트를 수신
    sseEvents.addEventListener('object-detected', function (event: any) {
      const data = JSON.parse(event.data);
      console.log(data);

      const newData = {
        id: lengthId,
        type: data.defectType,
        defective: data.defective,
        date: data.detectionDate.substring(0, 10),
        time: data.detectionDate.substring(11, 19),
        confidence: data.confidenceRate,
        imgSrc: data.objectUrl,
        scanner: data.scannerSerialNumber,
      };

      setTableData((prev) => [newData, ...prev]);
      setLengthId((prev) => prev + 1);
    });

    // 컴포넌트가 언마운트될 때 SSE 해제 및 세션 종료 요청
    return () => {
      // 세션 종료 요청
      const handleSessionDisconnect = async () => {
        try {
          const response = await axiosSecurity.get(
            '/session/disconnect',
            {},
            {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true,
            },
          );

          if (response.status === 200) {
            // console.log('세션이 성공적으로 종료되었습니다.');
          } else {
            console.error('세션 종료에 실패했습니다.', response.status);
          }
        } catch (error) {
          console.error('세션 종료 요청 중 오류가 발생했습니다.', error);
        }
      };

      handleSessionDisconnect();
      sseEvents.close();
      console.log('SSE 연결 해제');
    };
  }, [location, lengthId]);

  // 페이지 진입 시의 날짜 및 시간 설정 (한번만 실행)
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const dateOffset = new Date(today.getTime() - offset);
    const day = dateOffset.toISOString();

    const year = day.substring(2, 4);
    const month = day.substring(5, 7);
    const date = day.substring(8, 10);
    const hour = day.substring(11, 13);
    const minute = day.substring(14, 16);
    const seconds = day.substring(17, 19);

    setStartDate(`${year}-${month}-${date}`);
    setStartTime(`${hour}:${minute}:${seconds}`);

    // 실시간으로 현재 날짜와 시간 업데이트
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

    // 처음 호출하여 시간 업데이트
    animationFrameId = requestAnimationFrame(updateCurrentTime);

    // 컴포넌트 언마운트 시 requestAnimationFrame 중단
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 데이터 요청 및 가공
  useEffect(() => {
    async function fetchData() {
      // 데이터 요청
      async function requestData() {
        let response: any;

        try {
          response = await axiosSecurity.get('/records/recent', {
            date: startDate,
          });
        } catch (e) {
          console.error('데이터 요청 오류: ' + e);
        }

        // console.log(response.data);

        setLengthId(response.data.length);

        const newTableData = response.data
          .map((data: any, index: number) => {
            return {
              id: index,
              type: data.defectType,
              defective: data.defective,
              date: data.detectionDate.substring(0, 10),
              time: data.detectionDate.substring(11, 19),
              confidence: data.confidenceRate,
              imgSrc: data.objectUrl,
              scanner: data.scannerSerialNumber,
            };
          })
          .filter((data: any) => {
            const isSame = data.date.substring(2, 10) === startDate;

            return isSame && data.defective;
          });

        setTableData(newTableData.reverse());

        // 막대그래프에서의 불량 종류의 개수 세기
        const newbarCounts = {
          scratches: 0,
          rusting: 0,
          fracture: 0,
          deformation: 0,
          undefined: 0,
        };

        const defectTypeMapping = {
          scratches: '스크래치',
          rusting: '녹',
          fracture: '균열',
          deformation: '변형',
          undefined: '탐색 불가',
        };

        newTableData.forEach((data: any) => {
          const englishType = (
            Object.keys(defectTypeMapping) as (keyof typeof defectTypeMapping)[]
          ).find((key) => defectTypeMapping[key] === data.type);

          if (englishType) {
            newbarCounts[englishType]++;
          } else {
            newbarCounts.undefined++;
          }
        });
        setBarCounts(newbarCounts);
      }

      // 페이지 진입 시 데이터 요청
      await requestData();
    }
    fetchData();
  }, [startTime, startDate]);

  // tableData에 있는 시간들 모조리 lineChart의 x축에 맞게 count추가
  useEffect(() => {
    if (tableData.length === 0 || tableData[0].type === '') {
      return;
    }

    const timeCountsObj: { [key: string]: number } = {};

    tableData.forEach((data: any) => {
      const hour = data.time.substring(0, 2);

      if (timeCountsObj[hour]) {
        timeCountsObj[hour]++;
      } else {
        timeCountsObj[hour] = 1;
      }
    });

    setTimeCounts(timeCountsObj);

    handleClick(tableData[0]);
  }, [tableData]);

  // timeCounts가 업데이트될 때마다 로그 찍기 및 lineData 업데이트
  useEffect(() => {
    if (Object.keys(timeCounts).length === 0) {
      setLineData([
        {
          id: 'count',
          color: '#ffffff',
          data: [{ x: '0', y: 0 }],
        },
      ]);
      return;
    }

    const timeDataArray = Object.keys(timeCounts).map((hour) => ({
      x: hour,
      y: timeCounts[hour],
    }));

    timeDataArray.sort((a: any, b: any) => {
      if (a.x < b.x) {
        return -1;
      } else if (a.x > b.x) {
        return 1;
      } else {
        return 0;
      }
    });

    setLineData([
      {
        id: 'count',
        color: '#ffffff',
        data: timeDataArray,
      },
    ]);
  }, [timeCounts]);

  useEffect(() => {
    // 상태 변경 후 barData를 동기화
    setBarData([
      { type: '스크래치', count: barCounts.scratches },
      { type: '녹', count: barCounts.rusting },
      { type: '균열', count: barCounts.fracture },
      { type: '변형', count: barCounts.deformation },
      { type: '탐색 불가', count: barCounts.undefined },
    ]);
  }, [barCounts]);

  return (
    <div className="flex flex-row w-full h-full">
      {/* 왼쪽줄 */}
      <div className="flex flex-col mb-4 w-full h-full">
        {/* 불량 사진 띄우기 */}
        <div className={`${styles.boxLayout}`}>
          <div className="h-[50%] flex flex-col">
            <p className={`${styles.twinkle} m-4 mb-1`}>
              <span className={`mr-1 text-[#E32626]`}>●</span>
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
                <li className={styles.blinkSeconds}>
                  {todayDate} | {currentTime}
                </li>
              </ul>
            </div>

            {/* 불량사진 컴포넌트 */}
            {defectImg.imgSrc === '' ? (
              <div
                className={`${styles.mediaContainer} ${styles.mediaContainerNone}`}
              >
                탐지된 불량이 없습니다!
              </div>
            ) : (
              <img
                src={defectImg.imgSrc}
                alt="defectImg"
                className={`${styles.mediaContainer} ${styles.borderImg} ${styles.imgSetting}`}
              />
            )}
          </div>

          {/* 하단 영역 */}
          <div className="h-[50%] flex flex-col">
            {/* 사진 설명 텍스트 */}
            <div className="table">
              <ul className={styles.tableRow}>
                <li>
                  <img src={clock} alt="clock" />
                </li>
                <li>captured at</li>
                <li>
                  {defectImg.imgSrc === ''
                    ? '탐지된 불량이 없습니다!'
                    : defectImg.time}
                </li>
              </ul>
              <ul className={styles.tableRow}>
                <li>
                  <img src={bulb} alt="bulb" />
                </li>
                <li>type</li>
                <li>
                  {defectImg.imgSrc === ''
                    ? '탐지된 불량이 없습니다!'
                    : defectImg.type}
                </li>
              </ul>
            </div>

            {/* 해당 시간의 불량 선택 표 컴포넌트 */}
            <table className={`${styles.tableSet} ${styles.borderTable}`}>
              <thead>
                <tr className="border-solid border-[#1c93e9] border-b-2">
                  <th>불량 유형</th>
                  <th>검출 시간</th>
                </tr>
              </thead>

              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td>
                      <button
                        className={
                          selectedButtonId === 0
                            ? 'bg-[#156ba9] rounded-tl-lg rounded-bl-lg'
                            : ''
                        }
                      >
                        데이터가
                      </button>
                    </td>
                    <td>
                      <button
                        className={
                          selectedButtonId === 0
                            ? 'bg-[#156ba9] rounded-tr-lg rounded-br-lg'
                            : ''
                        }
                      >
                        없습니다
                      </button>
                    </td>
                  </tr>
                ) : (
                  tableData.map((data: any) => (
                    <tr key={data.id}>
                      <td>
                        <button
                          onClick={() => handleClick(data)}
                          className={
                            selectedButtonId === data.id
                              ? 'bg-[#156ba9] rounded-tl-lg rounded-bl-lg'
                              : ''
                          }
                        >
                          {data.type}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleClick(data)}
                          className={
                            selectedButtonId === data.id
                              ? 'bg-[#156ba9] rounded-tr-lg rounded-br-lg'
                              : ''
                          }
                        >
                          {data.time}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 오른쪽줄 */}
      <div className={`flex flex-col w-full h-full`}>
        <div className={`${styles.boxLayout} mb-4`}>
          <p className={`m-4 ${styles.blink}`}>■ 시간 당 불량 개수 통계</p>
          {/* 통계 그래프 영역 */}
          <div className={`${styles.lineChart} ${styles.borderLine}`}>
            <LineChart data={lineData} />
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
            <BarChart data={barData} />
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
