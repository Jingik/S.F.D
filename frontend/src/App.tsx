import { Route, Routes, useLocation } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from '@components/common/ProtectedRoute';
import { UserProvider } from '@components/common/UserContext';

import { Sidebar } from '@components/feature/Sidebar'; // 사이드바

import { MainPage } from '@/pages/MainPage'; // 메인 페이지
import { LoginPage } from '@/pages/LoginPage'; // 로그인 페이지
import { RegisterPage } from '@/pages/RegisterPage'; // 회원가입 페이지
import { SelectDomainPage } from '@/pages/SelectDomainPage'; // 품목 선택 페이지
import { DetectDefectPage } from '@/pages/DetectDefectPage'; // 불량 검출 페이지
import { HistoryPage } from '@/pages/HistoryPage'; // 전체 기록 조회 페이지
import { UserInfoPage } from '@/pages/UserInfoPage'; // 회원 정보 페이지

export function App() {
  const location = useLocation();

  // 홈, 로그인 안한 로그인, 회원가입, 회원정보는 사이드바X
  const hideSidebar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname.startsWith('/user');

  return (
    <UserProvider>
      <div className="flex w-full h-full">
        {!hideSidebar && (
          <div className="flex-[1] h-full flex justify-center">
            <Sidebar />
          </div>
        )}

        <div className="flex-[4] h-full">
          <Routes>
            {/* 로그인 했으면 진입 금지 */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            {/* 로그인 안했으면 진입 금지 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/domain" element={<SelectDomainPage />} />
              <Route path="/detect" element={<DetectDefectPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/user" element={<UserInfoPage />}></Route>
            </Route>
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}
