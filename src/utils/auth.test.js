import assert from 'node:assert/strict';
import test from 'node:test';

import { authRoles, getAccessTokenForRequest } from './auth.js';

// node 환경에는 sessionStorage가 없어서 테스트용으로 만든다.
const storage = new Map();
globalThis.sessionStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

function fakeToken(role) {
  const payload = Buffer.from(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return `header.${payload}.signature`;
}

function loginAs(role, storageKey) {
  storage.clear();
  const accessToken = fakeToken(role);
  storage.set(storageKey, JSON.stringify({ accessToken }));
  return accessToken;
}

test('웹 관리자의 아파트 관리자 목록 조회(GET)에는 웹 관리자 토큰을 붙인다', () => {
  const token = loginAs(authRoles.WEB_ADMIN, 'webAdmin');

  assert.equal(getAccessTokenForRequest('/api/apartment-managers', 'get'), token);
});

test('아파트 관리자 회원가입(POST)에는 토큰을 붙이지 않는다', () => {
  loginAs(authRoles.WEB_ADMIN, 'webAdmin');

  assert.equal(getAccessTokenForRequest('/api/apartment-managers', 'post'), '');
  assert.equal(getAccessTokenForRequest('/api/apartment-managers/login', 'post'), '');
});

test('아파트 관리자 기능 API에는 아파트 관리자 토큰을 붙인다', () => {
  const token = loginAs(authRoles.APARTMENT_MANAGER, 'apartmentManager');

  assert.equal(getAccessTokenForRequest('/api/parking-zones', 'get'), token);
  assert.equal(getAccessTokenForRequest('/api/apartment-managers/1/my-page', 'get'), token);
});
