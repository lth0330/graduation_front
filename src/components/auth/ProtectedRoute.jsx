import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  clearAuthSessions,
  getTokenExpirationTime,
  getValidAuthSession,
  setAuthMessage,
} from '../../utils/auth.js';

export default function ProtectedRoute({ role, redirectTo = '/login', children }) {
  const user = getValidAuthSession(role);

  useEffect(() => {
    if (!user?.accessToken) {
      return undefined;
    }

    const remainingTime = getTokenExpirationTime(user.accessToken) - Date.now();

    // 화면이 열려 있는 중에도 JWT 만료 시간이 지나면 자동으로 로그아웃시킵니다.
    // API 요청이 실패하기 전 사용자에게 다시 로그인하도록 유도하는 역할입니다.
    if (remainingTime <= 0) {
      clearAuthSessions();
      setAuthMessage('로그인이 만료되었습니다. 다시 로그인하세요.');
      window.location.replace(redirectTo);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      clearAuthSessions();
      setAuthMessage('로그인이 만료되었습니다. 다시 로그인하세요.');
      window.location.replace(redirectTo);
    }, remainingTime);

    return () => window.clearTimeout(timerId);
  }, [redirectTo, user]);

  // 로그인 정보가 없거나 role이 맞지 않으면 보호된 화면을 보여주지 않습니다.
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
