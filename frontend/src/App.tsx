import '@/App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from '@components/common/ProtectedRoute';


import { Sidebar } from '@components/feature/Sidebar';  // 사이드바

import { MainPage } from './pages/MainPage';  // 메인 페이지
import { LoginPage } from './pages/LoginPage';  // 로그인 페이지
import { RegisterPage } from './pages/RegisterPage';  // 회원가입 페이지


export function App() {
  const location = useLocation();

  // 홈, 로그인 안한 로그인, 회원가입, 회원정보는 사이드바X
  const hideSidebar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register';
  //   location.pathname.startsWith('/user');

  return (
    <>
      {!hideSidebar && <Sidebar />}

      <Routes>
        {/* 로그인 했으면 진입 금지 */}
        <Route element={<PublicRoute />}>
          <Route path='/' element={<MainPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Route>
        {/* 로그인 안했으면 진입 금지 */}
        <Route element={<ProtectedRoute />}>

        </Route>
      </Routes>
    </>
  );
}
