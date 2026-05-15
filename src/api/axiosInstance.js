import axios from 'axios';
import { clearAuthSessions, getAccessTokenForRequest, setAuthMessage } from '../utils/auth.js';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
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

    if (hadAuthHeader && [401, 403].includes(error.response?.status)) {
      clearAuthSessions();
      setAuthMessage('로그인이 만료되었거나 접근 권한이 없습니다. 다시 로그인하세요.');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
