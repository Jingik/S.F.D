import { Route, Routes, useLocation } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from '@components/common/ProtectedRoute';
import { UserProvider } from '@components/common/UserContext';

import { Sidebar } from '@components/feature/Sidebar'; // 사이드바

import { MainPage } from '@/pages/MainPage'; // 메인 페이지
import { LoginPage } from '@/pages/LoginPage'; // 로그인 페이지
import { RegisterPage } from '@/pages/RegisterPage'; // 회원가입 페이지
import { SelectDomainPage } from '@/pages/SelectDomainPage'; // 품목 선택 페이지
import { DomainRequestPage } from '@/pages/DomainRequestPage'; // 품목 요청 페이지
import { DetectDefectPage } from '@/pages/DetectDefectPage'; // 불량 검출 페이지
import { HistoryPage } from '@/pages/HistoryPage'; // 전체 기록 조회 페이지
import { UserInfoPage } from '@/pages/UserInfoPage'; // 회원 정보 페이지
import { UserEditPage } from '@/pages/UserEditPage'; // 회원 정보 수정 페이지
import { NotFoundPage } from '@/pages/NotFoundPage'; // 잘못된 주소 페이지

export function App() {
  const location = useLocation();

  // 홈, 로그인 안한 로그인, 회원가입, 잘못된 페이지는 사이드바X
  const hideSidebar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/notfound' ||
    location.pathname === '*' || // 모든 잘못된 경로에 대해 hideSidebar 활성화
    ![
      '/',
      '/login',
      '/register',
      '/domain',
      '/domain/request',
      '/detect',
      '/history',
      '/user',
      '/user/edit',
    ].includes(location.pathname);
  // 유효한 경로들을 지정하여 그 외에는 사이드바를 숨기도록 처리

  return (
    <UserProvider>
      <div className="flex flex-row">
        {!hideSidebar && (
          <div className="sticky h-[95vh] top-[1rem]">
            <Sidebar />
          </div>
        )}

        <div className="w-full">
          <Routes>
            {/* 로그인 했으면 진입 금지 */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            {/* 로그인 안했으면 진입 금지 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/domain/*" element={<SelectDomainPage />}>
                <Route path="request" element={<DomainRequestPage />} />
              </Route>
              <Route path="/detect" element={<DetectDefectPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/user/*" element={<UserInfoPage />}>
                <Route path="edit" element={<UserEditPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
}
