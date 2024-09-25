import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// 로그인 안한 상태에서 진입금지인 곳 만들기
export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const nav = useNavigate();

  useEffect(() => {
    if (!token) {
      nav('/login');
    }
  }, [token, nav]);

  // 로그인 상태일 때만 Outlet 렌더링
  return token ? <Outlet /> : null;
};

// 로그인 된 상태에서 Home, Login, Register 페이지 진입하려고 했을 때, 무조건 메인패이자로 진입하도록 함
export const PublicRoute = () => {
  const token = localStorage.getItem('token');
  const nav = useNavigate();

  useEffect(() => {
    if (token) {
      nav('/domain');
    }
  }, [token, nav]);

  // 로그인 안했을 때만 Outlet 렌더링
  return <Outlet />;
};
