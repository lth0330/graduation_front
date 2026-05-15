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

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
