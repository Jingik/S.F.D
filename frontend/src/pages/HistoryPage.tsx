import styles from '@/pages/Pages.module.css';
import { useEffect, useState } from 'react';

import { BarChart } from '@components/feature/BarChart';
import { LineChart } from '@components/feature/LineChart';
import { DatePickerCustom } from '@components/feature/DatePickerCustom';

import clock from '@/assets/images/clock.png';
import bulb from '@/assets/images/craked_bulb.png';
import { axiosSecurity } from '../components/common/util';

export const HistoryPage = () => {
  const [lineData, setLineData] = useState([
    {
      id: 'count',
      color: '#ffffff',
      data: [{}],
    },
  ]);
  const [barData, setBarData] = useState([{}]);
  const [tableData, setTableData] = useState([{}]);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [date, setDate] = useState(new Date());
  const [countSc, setCountSc] = useState(0);
  const [countRu, setCountRu] = useState(0);
  const [countFrac, setCountFrac] = useState(0);
  const [countDefor, setCountDefor] = useState(0);

  function handleClick(index: number) {
    setSelectedButtonIndex(index);
  }

  // 데이터 요청
  async function requestData() {
    console.log(date);

    // 선택된 날짜로 요청
    const response = await axiosSecurity.get('/defectAllData');

    console.log(response);

    response.data.forEach((data: any) => {
      const setObject = {
        id: data.object_detection_id,
        type: data.analysis_details,
        date: data.timestamp.substring(0, 10),
        time: data.timestamp.substring(11, 18),
        confidence: data.confidence,
      };

      setTableData([setObject, ...tableData]);
    });

    console.log(tableData);
  }

  // 불량 종류 개수 세기
  function countType(type: string, count: number) {
    switch (type) {
      case 'scratches':
        return count + 1;
      case 'rusting':
        return count + 1;
      case 'fracture':
        return count + 1;
      case 'deformation':
        return count + 1;
      default:
        console.log('불량 타입이 아닙니다.');
        return 0;
    }
  }

  useEffect(() => {
    requestData();

    const dateData = Number.parseInt(date.toISOString().substring(8, 10));

    // 임시 데이터
    setLineData(() => [
      {
        id: 'count',
        color: '#ffffff',
        data: [
          {
            x: `${dateData - 4}`,
            y: 8,
          },
          {
            x: `${dateData - 3}`,
            y: 25,
          },
          {
            x: `${dateData - 2}`,
            y: 15,
          },
          {
            x: `${dateData - 1}`,
            y: 10,
          },
          {
            x: `${dateData}`,
            y: 19,
          },
        ],
      },
    ]);

    setBarData(() => [
      {
        type: 'scratches',
        count: setCountSc((prev) => countType('scratches', prev)),
      },
      {
        type: 'rusting',
        count: setCountRu((prev) => countType('rusting', prev)),
      },
      {
        type: 'fracture',
        count: setCountFrac((prev) => countType('fracture', prev)),
      },
      {
        type: 'deformation',
        count: setCountDefor((prev) => countType('deformation', prev)),
      },
    ]);
  }, []);

  return (
    <div className="flex flex-row w-full h-full">
      {/* 왼줄 */}
      <div className="flex flex-col flex-[1]">
        {/* 총 불량 개수 통계 */}
        <div className={`${styles.boxLayout} mb-4`}>
          <p className="m-4">▲ 총 불량 개수 통계</p>
          {/* 통계 그래프 영역 */}
          <div className={`${styles.barChart}`}>
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

        {/* 날짜 당 불량 개수 통계 */}
        <div className={`${styles.boxLayout}`}>
          <p className="m-4">■ 날짜 당 불량 개수 통계</p>
          {/* 통계 그래프 영역 */}
          <div className={styles.lineChart}>
            <LineChart data={lineData} />
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
              <li>탐지 날짜</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 오른줄 */}
      <div className={`${styles.boxLayout} flex-[1]`}>
        <div className="flex flex-col w-full h-full">
          {/* 불량 사진 탐색 */}
          <div className="flex-[1] flex flex-col">
            {/* 텍스트 영역 */}
            <div className="flex flex-row justify-between items-end">
              <p className="m-4">● 불량 사진 탐색</p>
              <p className="mr-4 text-[#999999] text-xs">
                불량 유형 또는 시간 선택
              </p>
            </div>

            {/* 날짜선택(date picker) 컴포넌트 */}
            <div className="flex justify-center mt-2">
              <DatePickerCustom setDate={setDate} />
            </div>

            {/* 해당 날짜의 불량 선택 표 컴포넌트 */}
            <table className={styles.tableSet}>
              <thead>
                <tr className="border-solid border-[#1c93e9] border-b-2">
                  <th>불량 유형</th>
                  <th>검출 시간</th>
                </tr>
              </thead>

              <tbody>
                {tableData !== [{}] ? (
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
                ) : (
                  tableData.map((data: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <button
                          onClick={() => handleClick(index)}
                          className={
                            selectedButtonIndex === index
                              ? ''
                              : 'bg-[#156ba9] rounded-tl-lg rounded-bl-lg'
                          }
                        >
                          {data.type}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleClick(index)}
                          className={
                            selectedButtonIndex === index
                              ? ''
                              : 'bg-[#156ba9] rounded-tr-lg rounded-br-lg'
                          }
                        >
                          {data.detectTime}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 불량사진 영역 */}
          <div className="flex-[1] flex flex-col">
            {/* 사진 영역 */}
            <div className={styles.mediaContainer}>
              선택된 불량 사진이 없습니다!
            </div>

            {/* 텍스트 영역 */}
            <div className="table mb-4">
              <ul className={styles.tableRow}>
                <li>
                  <img src={clock} alt="clock" />
                </li>
                <li>captured at</li>
                <li>
                  {!selectedButtonIndex
                    ? '선택된 불량 시간이 없습니다!'
                    : '불량 날짜 | 불량 시간'}
                </li>
              </ul>
              <ul className={styles.tableRow}>
                <li>
                  <img src={bulb} alt="bulb" />
                </li>
                <li>type</li>
                <li>
                  {!selectedButtonIndex
                    ? '선택된 불량 시간이 없습니다!'
                    : '불량 종류'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
