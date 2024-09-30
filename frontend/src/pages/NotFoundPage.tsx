import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const nav = useNavigate();

  return (
    <>
      <div>잘못된 페이지 입니다...!</div>
      <button onClick={() => nav('/')}>돌아가기</button>
    </>
  );
};
