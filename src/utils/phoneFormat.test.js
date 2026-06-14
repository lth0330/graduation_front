import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneNumber } from './phoneFormat.js';

test('11자리 휴대폰 번호를 하이픈 포함 형식으로 표시한다', () => {
  assert.equal(formatPhoneNumber('01012345678'), '010-1234-5678');
});

test('이미 하이픈이 있는 휴대폰 번호도 같은 형식으로 표시한다', () => {
  assert.equal(formatPhoneNumber('010-1234-5678'), '010-1234-5678');
});

test('번호가 비어 있으면 대체 문구를 반환한다', () => {
  assert.equal(formatPhoneNumber('', '-'), '-');
});
