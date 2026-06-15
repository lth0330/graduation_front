import axios from 'axios';
import { clearAuthSessions, getAccessTokenForRequest, setAuthMessage } from '../utils/auth.js';

const apiClient = axios.create({
  // 모든 API 함수가 공통으로 사용하는 백엔드 주소입니다.
  // .env에 VITE_API_BASE_URL이 있으면 배포 서버를, 없으면 로컬 Spring Boot를 사용합니다.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // 요청 URL을 기준으로 웹 관리자 토큰과 아파트 관리자 토큰 중 필요한 토큰을 자동 선택합니다.
  // 화면 코드에서 매번 Authorization 헤더를 직접 붙이지 않게 하기 위한 공통 처리입니다.
  const accessToken = getAccessTokenForRequest(config.url);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    // 토큰을 보낸 요청이 401을 받으면 세션 만료로 보고 저장된 로그인 정보를 정리합니다.
    // 이렇게 해야 만료된 토큰으로 계속 API를 호출하는 무한 오류를 막을 수 있습니다.
    if (hadAuthHeader && error.response?.status === 401) {
      clearAuthSessions();
      setAuthMessage('로그인이 만료되었습니다. 다시 로그인하세요.');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
