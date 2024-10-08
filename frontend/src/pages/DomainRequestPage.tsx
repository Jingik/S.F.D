import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosSecurity } from '@components/common/util';
import styles from '@/pages/Pages.module.css';

export const DomainRequestPage = () => {
  const [domainName, setDomainName] = useState('');
  const [normalImgs, setNormalImgs] = useState<any[]>([]);
  const [abnormalImgs, setAbnormalImgs] = useState<any[]>([]);
  const nav = useNavigate();

  function handleDomainName(e: any) {
    setDomainName(e.target.value);
  }

  // 정상 사진 핸들
  function handleNormalPicture(e: any) {
    const fileList = e.target.files;
    const validFiles: any[] = [];
    let isValid = true;

    Array.from(fileList).forEach((file: any, index: number) => {
      // 파일 확장자 추출
      const extension = file.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        // 파일명을 domainName_index.[확장자]로 변경
        const newFileName = `${domainName}_normal_${index
          .toString()
          .padStart(3, '0')}.${extension}`;

        // Blob으로 새 파일 객체 생성 (name 속성 변경)
        const renamedFile = new File([file], newFileName, { type: file.type });

        // 유효한 파일로 추가
        validFiles.push(renamedFile);
      } else {
        alert('이미지 파일(jpg, jpeg, png)만 업로드 할 수 있습니다...!');
        // 유효하지 않은 파일이 있으면 플래그 설정
        isValid = false;
      }
    });

    if (isValid) {
      // 유효한 파일이 있을 경우에만 상태 업데이트
      setNormalImgs(validFiles);
    } else {
      // 유효하지 않은 파일이 있을 경우 상태 초기화
      setNormalImgs([]);
      // input 필드 초기화
      e.target.value = '';
    }
  }

  // 비정상 사진 핸들
  function handleAbnormalPicture(e: any) {
    const fileList = e.target.files;
    const validFiles: any[] = [];
    let isValid = true;

    Array.from(fileList).forEach((file: any, index: number) => {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        const newFileName = `${domainName}_abnormal_${index
          .toString()
          .padStart(3, '0')}.${extension}`;

        const renamedFile = new File([file], newFileName, { type: file.type });

        validFiles.push(renamedFile);
      } else {
        alert('이미지 파일(jpg, jpeg, png)만 업로드 할 수 있습니다...!');
        isValid = false;
      }
    });

    if (isValid) {
      setAbnormalImgs(validFiles);
    } else {
      setAbnormalImgs([]);
      e.target.value = '';
    }
  }

  // 전송하기 버튼
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalFormData = new FormData();
    const abnormalFormData = new FormData();

    // 파일을 FormData에 추가
    normalImgs.forEach((file) => {
      // 변경된 파일명으로 추가
      normalFormData.append('files', file);
    });
    abnormalImgs.forEach((file) => {
      abnormalFormData.append('files', file);
    });

    const sendData = {
      domain: domainName,
      normal: normalFormData,
      abnormal: abnormalFormData,
    };

    try {
      await axiosSecurity.post('/domain/request', sendData);
      alert('도메인 추가를 요청했습니다!');
      nav('/domain');
    } catch (e) {
      alert('파일 전송 중 문제가 생겼습니다...');
      console.error(e);
    }
  }

  return (
    <div className="h-full">
      <div className="m-6 flex justify-between">
        <p className="text-3xl font-bold">📝 새 카테고리 요청</p>
        <button className="text-[#999999]" onClick={() => nav('/..')}>
          돌아가기
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {/* 입력영역 */}
        <div className="h-full">
          <div className="my-4">
            <label htmlFor="domainName">품목명</label>
            <input
              type="text"
              id="domainName"
              placeholder="품목명"
              className={styles.input}
              onChange={handleDomainName}
              required
            />
          </div>

          <div className="my-4">
            <label htmlFor="normalPicture">정상 사진</label>
            <input
              type="file"
              id="normalPicture"
              className={`${styles.input}`}
              onChange={handleNormalPicture}
              accept="image/jpeg, image/png, image/jpg"
              multiple
              required
            />
            <ul>
              {normalImgs.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>

          <div className="my-4">
            <label htmlFor="abnormalPicture">불량 사진</label>
            <input
              type="file"
              id="abnormalPicture"
              className={styles.input}
              onChange={handleAbnormalPicture}
              accept="image/jpeg, image/png, image/jpg"
              multiple
              required
            />
            <ul>
              {abnormalImgs.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          className={`${styles.button} text-[#333333] font-bold bg-[#FFE600]`}
        >
          요청하기
        </button>
      </form>
    </div>
  );
};
