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
