import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterResidentRequestsByStatus,
  getResidentRequestStatusLabel,
} from './residentRequestFilters.js';

const requests = [
  { id: '1', status: 'pending' },
  { id: '2', status: 'approved' },
  { id: '3', status: 'rejected' },
];

test('전체 상태를 선택하면 모든 주민 가입 요청을 유지한다', () => {
  assert.deepEqual(filterResidentRequestsByStatus(requests, 'all'), requests);
});

test('승인 대기 상태만 분리해서 볼 수 있다', () => {
  assert.deepEqual(filterResidentRequestsByStatus(requests, 'pending'), [
    { id: '1', status: 'pending' },
  ]);
});

test('승인 완료 상태만 분리해서 볼 수 있다', () => {
  assert.deepEqual(filterResidentRequestsByStatus(requests, 'approved'), [
    { id: '2', status: 'approved' },
  ]);
});

test('상태 선택값의 화면 표시 이름을 반환한다', () => {
  assert.equal(getResidentRequestStatusLabel('pending'), '승인 대기');
  assert.equal(getResidentRequestStatusLabel('approved'), '승인 완료');
});
