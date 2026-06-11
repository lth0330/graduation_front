import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveVisitorCarStatus } from './visitorCarStatus.js';

test('게이트 통과 전 방문차량은 입차 대기 상태다', () => {
  assert.equal(resolveVisitorCarStatus({ gateEnteredAt: '', parkedAt: '' }), 'waiting');
});

test('게이트 통과 후 실제 주차 전 방문차량은 입차 완료 상태다', () => {
  assert.equal(resolveVisitorCarStatus({ gateEnteredAt: '2026-06-11 09:15', parkedAt: '' }), 'entered');
});

test('실제 주차된 방문차량은 주차 중 상태가 우선이다', () => {
  assert.equal(resolveVisitorCarStatus({
    gateEnteredAt: '2026-06-11 09:15',
    parkedAt: '2026-06-11 09:20',
  }), 'parked');
});
