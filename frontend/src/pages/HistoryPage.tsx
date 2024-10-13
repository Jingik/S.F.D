import { useEffect, useState } from 'react';
import { axiosSecurity } from '@components/common/util';
import styles from '@/pages/Pages.module.css';

import { BarChart } from '@components/feature/BarChart';
import { LineChart } from '@components/feature/LineChart';
import { DatePickerCustom } from '@components/feature/DatePickerCustom';

import clock from '@/assets/images/clock.png';
import bulb from '@/assets/images/craked_bulb.png';

interface TableData {
  id: number;
  type: string;
  date: string;
  time: string;
  confidence: number;
}

export const HistoryPage = () => {
  const [lineData, setLineData] = useState([
    {
      id: 'count',
      color: '#ffffff',
      data: [
        {
          x: '',
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
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [selectedButtonId, setSelectedButtonId] = useState(-1);
  const [date, setDate] = useState(new Date());
  const [defectImg, setDefectImg] = useState({
    imgSrc: '',
    date: '',
    time: '',
    type: '',
  });

  // 표 버튼 클릭했을 때
  function handleClick(data: any) {
    setSelectedButtonId(data.id);

    setDefectImg({
      imgSrc: data.imgSrc,
      date: data.date,
      time: data.time,
      type: data.type,
    });
  }

  // datepicker 클릭하고 날짜 선택 시
  function handleDatePicker(e: any) {
    setSelectedButtonId(-1);
    setDate(e);
  }

  useEffect(() => {
    const offset = date.getTimezoneOffset() * 60000;
    const dateOffset = new Date(date.getTime() - offset);
    const dateData = Number.parseInt(dateOffset.toISOString().substring(8, 10));

    async function fetchData() {
      // 데이터 요청
      async function requestData() {
        let response: any;

        try {
          response = await axiosSecurity.get('/records/recent');
        } catch (e) {
          console.error('데이터 요청 오류: ' + e);
        }

        console.log(response);

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
            return data.defective;
          });

        setLineData(() => {
          return [
            {
              id: 'count',
              color: '#ffffff',
              data: [
                {
                  x: `${dateData - 4}`,
                  y: newTableData.filter(
                    (data: any) =>
                      data.date.substring(8, 10) ===
                      String(dateData - 4).padStart(2, '0'),
                  ).length,
                },
                {
                  x: `${dateData - 3}`,
                  y: newTableData.filter(
                    (data: any) =>
                      data.date.substring(8, 10) ===
                      String(dateData - 3).padStart(2, '0'),
                  ).length,
                },
                {
                  x: `${dateData - 2}`,
                  y: newTableData.filter(
                    (data: any) =>
                      data.date.substring(8, 10) ===
                      String(dateData - 2).padStart(2, '0'),
                  ).length,
                },
                {
                  x: `${dateData - 1}`,
                  y: newTableData.filter(
                    (data: any) =>
                      data.date.substring(8, 10) ===
                      String(dateData - 1).padStart(2, '0'),
                  ).length,
                },
                {
                  x: `${dateData}`,
                  y: newTableData.filter(
                    (data: any) =>
                      data.date.substring(8, 10) ===
                      String(dateData).padStart(2, '0'),
                  ).length,
                },
              ],
            },
          ];
        });

        setTableData(
          newTableData.filter((data: any) => {
            return (
              data.date.substring(8, 10) === String(dateData).padStart(2, '0')
            );
          }),
        );

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

      await requestData();
    }

    fetchData();
  }, [date]);

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
              <li>총 불량 개수</li>
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
              <li>선택한 날짜로부터 4일 전까지의 탐지 날짜</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 오른줄 */}
      <div className={`${styles.boxLayout} flex-[1]`}>
        <div className="flex flex-col w-full h-full">
          {/* 불량 사진 탐색 */}
          <div className="h-[50%] flex flex-col">
            {/* 텍스트 영역 */}
            <div className="flex flex-row justify-between items-end">
              <p className="mt-4 ml-4">● 불량 사진 탐색</p>
              <p className="mr-4 text-[#999999] text-xs">
                불량 유형 또는 시간 선택
              </p>
            </div>

            {/* 날짜선택(date picker) 컴포넌트 */}
            <div className="flex justify-center mt-2">
              <DatePickerCustom setDate={handleDatePicker} />
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
                {tableData.length === 0 ? (
                  <tr>
                    <td>
                      <button
                        className={
                          selectedButtonId === -1
                            ? styles.tableButtonSelectedLeft
                            : ''
                        }
                      >
                        데이터가
                      </button>
                    </td>
                    <td>
                      <button
                        className={
                          selectedButtonId === -1
                            ? styles.tableButtonSelectedRight
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
                              ? styles.tableButtonSelectedLeft
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
                              ? styles.tableButtonSelectedRight
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

          {/* 불량사진 영역 */}
          <div className="h-[50%] flex flex-col">
            {/* 사진 영역 */}
            {selectedButtonId === -1 ? (
              <div
                className={`${styles.mediaContainer} ${styles.mediaContainerNone}`}
              >
                선택된 불량 사진이 없습니다!
              </div>
            ) : defectImg.imgSrc ? (
              <img
                src={defectImg.imgSrc}
                alt="defectImg"
                className={`${styles.imgSetting} ${styles.mediaContainer}`}
              />
            ) : (
              <div className={`${styles.mediaContainer}`}>
                잘못된 불량 데이터 사진 형식입니다!
              </div>
            )}

            {/* 텍스트 영역 */}
            <div className="table mb-4">
              <ul className={styles.tableRow}>
                <li>
                  <img src={clock} alt="clock" />
                </li>
                <li>captured at</li>
                <li>
                  {selectedButtonId === -1
                    ? '선택된 불량 시간이 없습니다!'
                    : `${defectImg.date} | ${defectImg.time}`}
                </li>
              </ul>
              <ul className={styles.tableRow}>
                <li>
                  <img src={bulb} alt="bulb" />
                </li>
                <li>type</li>
                <li>
                  {selectedButtonId === -1
                    ? '선택된 불량 시간이 없습니다!'
                    : defectImg.type}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
