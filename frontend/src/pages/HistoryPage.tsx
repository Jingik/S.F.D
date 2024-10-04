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
      data: [{}],
    },
  ]);
  const [barData, setBarData] = useState([{}]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const [date, setDate] = useState(new Date());
  const [counts, setCounts] = useState({
    scratches: 0,
    rusting: 0,
    fracture: 0,
    deformation: 0,
  });
  const [defectImg, setDefectImg] = useState({
    imgSrc: '',
    date: '',
    time: '',
    type: '',
  });

  // 표 버튼 클릭했을 때
  async function handleClick(data: any) {
    setSelectedButtonIndex(data.id);

    let response: any;

    try {
      response = await axiosSecurity.get(`/getImg/${data.id}`);
    } catch (e) {
      response = {
        data: {
          object_url:
            'https://sfdssafy.s3.amazonaws.com/images/sfd001_20241004111259795.jpg',
          completed_at: '2024-10-04 11:13:01',
        },
      };
    }

    console.log(response);

    setDefectImg({
      imgSrc: response.data.object_url,
      date: data.date,
      time: data.time,
      type: data.type,
    });
  }

  // 불량 종류 개수 세기
  function countType(type: string) {
    setCounts((prevCounts) => ({
      ...prevCounts,
      [type]: prevCounts[type as keyof typeof counts] + 1,
    }));
  }

  useEffect(() => {
    const dateData = Number.parseInt(date.toISOString().substring(8, 10));

    async function fetchData() {
      // 데이터 요청
      async function requestData() {
        console.log(date);

        let response: any;

        // 선택된 날짜로 요청
        try {
          response = await axiosSecurity.get('/defectAllData');
        } catch (e) {
          response = {
            data: [
              {
                id: 9,
                object_detection_id: 27,
                analysis_details: 'deformation',
                timestamp: '2024-10-02 16:01:32',
                confidence: 0.845427393913269,
              },
              {
                id: 10,
                object_detection_id: 28,
                analysis_details: 'deformation',
                timestamp: '2024-10-02 16:01:33',
                confidence: 0.9203153252601624,
              },
            ],
          };
        }

        console.log(response);

        const newTableData = response.data.map((data: any) => {
          return {
            id: data.object_detection_id,
            type: data.analysis_details,
            date: data.timestamp.substring(0, 10),
            time: data.timestamp.substring(11, 19),
            confidence: data.confidence,
          };
        });

        setTableData(newTableData);

        const newCounts = {
          scratches: 0,
          rusting: 0,
          fracture: 0,
          deformation: 0,
        };

        newTableData.forEach((data: any) => {
          newCounts[data.type as keyof typeof newCounts]++;
        });
        setCounts(newCounts);
      }

      await requestData();
      console.log(tableData);

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
    }

    fetchData();
  }, [date]);

  useEffect(() => {
    // 상태 변경 후 barData를 동기화
    setBarData([
      { type: 'scratches', count: counts.scratches },
      { type: 'rusting', count: counts.rusting },
      { type: 'fracture', count: counts.fracture },
      { type: 'deformation', count: counts.deformation },
    ]);
  }, [counts]);

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
              <p className="mt-4 ml-4">● 불량 사진 탐색</p>
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
                {tableData.length === 0 ? (
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
                          onClick={() => handleClick(data)}
                          className={
                            selectedButtonIndex === data.id
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
                            selectedButtonIndex === data.id
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

          {/* 불량사진 영역 */}
          <div className="flex-[1] flex flex-col">
            {/* 사진 영역 */}
            <div className={styles.mediaContainer}>
              {!selectedButtonIndex ? (
                '선택된 불량 사진이 없습니다!'
              ) : (
                <img src={defectImg.imgSrc} />
              )}
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
                    : `${defectImg.date} | ${defectImg.time}`}
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
