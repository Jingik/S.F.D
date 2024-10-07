import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosSecurity } from '@components/common/util';
import styles from '@/pages/Pages.module.css';

export const DomainRequestPage = () => {
  const [domainName, setDomainName] = useState('');
  const nav = useNavigate();

  function handleDomainName(name: string) {
    setDomainName(name);
  }

  function handleNormalPicture(picture: object) {}

  function handleAbnormalPicture(picture: object) {}

  // 전송하기 버튼
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const sendData = { domain: domainName };

    axiosSecurity.post('/domain/request', sendData);
    nav('/domain');
  }

  return (
    <div className="h-full">
      <div className="m-6 flex justify-between">
        <p className="text-3xl font-bold">📝 새 카테고리 요청</p>
        <button className="text-[#999999]" onClick={() => nav('/..')}>
          돌아가기
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center h-[80%]"
      >
        {/* 입력영역 */}
        <div className="h-full">
          <div className="my-4">
            <label htmlFor="domainName">품목명</label>
            <input
              type="text"
              id="domainName"
              placeholder="품목명"
              className={styles.input}
              onChange={(e) => handleDomainName(e.toString())}
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
