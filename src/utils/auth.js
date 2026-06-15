const WEB_ADMIN_KEY = 'webAdmin';
const APARTMENT_MANAGER_KEY = 'apartmentManager';
const AUTH_MESSAGE_KEY = 'authMessage';

export const authRoles = {
  WEB_ADMIN: 'WEB_ADMIN',
  APARTMENT_MANAGER: 'APARTMENT_MANAGER',
};

const roleStorageKeyMap = {
  [authRoles.WEB_ADMIN]: WEB_ADMIN_KEY,
  [authRoles.APARTMENT_MANAGER]: APARTMENT_MANAGER_KEY,
};

// 웹 관리자와 아파트 관리자는 동시에 로그인 상태를 유지하지 않습니다.
// 새 로그인을 저장하기 전에 기존 세션을 지워 권한이 섞이는 문제를 방지합니다.
export function clearAuthSessions() {
  sessionStorage.removeItem(WEB_ADMIN_KEY);
  sessionStorage.removeItem(APARTMENT_MANAGER_KEY);
}

export function setAuthMessage(message) {
  sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
}

export function consumeAuthMessage() {
  const message = sessionStorage.getItem(AUTH_MESSAGE_KEY) || '';
  sessionStorage.removeItem(AUTH_MESSAGE_KEY);
  return message;
}

export function saveAuthSession(role, user) {
  clearAuthSessions();
  sessionStorage.setItem(roleStorageKeyMap[role], JSON.stringify(user));
  // Context가 로그인 직후 필요한 목록을 다시 불러올 수 있도록 브라우저 이벤트를 발생시킵니다.
  window.dispatchEvent(new CustomEvent('auth-session-changed', { detail: { role } }));
}

export function getStoredUser(role) {
  const storageKey = roleStorageKeyMap[role];

  if (!storageKey) {
    return null;
  }

  const storedUser = sessionStorage.getItem(storageKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}

export function decodeJwtPayload(token) {
  if (!token) {
    return null;
  }

  try {
    // JWT는 header.payload.signature 구조입니다.
    // 여기서는 payload만 읽어 만료 시간(exp)과 권한(role)을 프론트에서 빠르게 확인합니다.
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(decodedPayload);
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function getTokenExpirationTime(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return 0;
  }

  return payload.exp * 1000;
}

export function getValidAuthSession(role) {
  const user = getStoredUser(role);

  if (!user?.accessToken || isTokenExpired(user.accessToken)) {
    if (user) {
      sessionStorage.removeItem(roleStorageKeyMap[role]);
    }

    return null;
  }

  const payload = decodeJwtPayload(user.accessToken);

  // 저장된 세션의 role과 토큰 내부 role이 다르면 잘못 저장된 세션이므로 제거합니다.
  // 예: 웹 관리자 토큰으로 아파트 관리자 화면에 접근하는 상황을 막습니다.
  if (payload?.role !== role) {
    sessionStorage.removeItem(roleStorageKeyMap[role]);
    return null;
  }

  return user;
}

export function getCurrentAuthSession() {
  return (
    getValidAuthSession(authRoles.WEB_ADMIN) ||
    getValidAuthSession(authRoles.APARTMENT_MANAGER) ||
    null
  );
}

export function getCurrentAuthRole() {
  if (getValidAuthSession(authRoles.WEB_ADMIN)) {
    return authRoles.WEB_ADMIN;
  }

  if (getValidAuthSession(authRoles.APARTMENT_MANAGER)) {
    return authRoles.APARTMENT_MANAGER;
  }

  return '';
}

export function getAccessTokenForRequest(requestUrl = '') {
  const url = String(requestUrl);

  // 로그인, 회원가입 요청은 아직 토큰이 없으므로 Authorization 헤더를 붙이지 않습니다.
  if (
    (url === '/api/apartment-managers' || url === '/api/apartment-managers/') ||
    url === '/api/apartment-managers/login' ||
    url === '/api/web-admin/login'
  ) {
    return '';
  }

  if (url.startsWith('/api/web-admin')) {
    return getValidAuthSession(authRoles.WEB_ADMIN)?.accessToken || '';
  }

  // 아파트 관리자 기능 API는 APARTMENT_MANAGER 토큰만 사용합니다.
  // 백엔드 SecurityConfig의 권한 규칙과 맞춰야 401/403 오류를 줄일 수 있습니다.
  if (
    url.startsWith('/api/resident') ||
    url.startsWith('/api/vehicles') ||
    url.startsWith('/api/visitor-cars') ||
    url.startsWith('/api/parking') ||
    url.startsWith('/api/manager-inquiries') ||
    url.startsWith('/api/manager-notifications') ||
    url.includes('/my-page')
  ) {
    return getValidAuthSession(authRoles.APARTMENT_MANAGER)?.accessToken || '';
  }

  return (
    getValidAuthSession(authRoles.WEB_ADMIN)?.accessToken ||
    getValidAuthSession(authRoles.APARTMENT_MANAGER)?.accessToken ||
    ''
  );
}
