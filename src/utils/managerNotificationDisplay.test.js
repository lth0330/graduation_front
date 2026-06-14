import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatManagerNotificationCreatedAt,
  formatManagerNotificationMessage,
} from './managerNotificationDisplay.js';

test('관리자 알림 생성일은 날짜와 시간을 함께 표시한다', () => {
  assert.equal(formatManagerNotificationCreatedAt('2026-06-14T09:08:07'), '2026-06-14 09:08');
  assert.equal(formatManagerNotificationCreatedAt('2026-06-14 09:08:07'), '2026-06-14 09:08');
});

test('관리자 알림 내용에서는 시간과 이미지 경로를 표시하지 않는다', () => {
  assert.equal(
    formatManagerNotificationMessage(
      '차단기 또는 주차 인식 결과 확인이 필요합니다. 시간: 2026-06-14 09:08:07. 차량번호: 12가3456. 이미지: /uploads/parking-snapshots/test.jpg',
    ),
    '차단기 또는 주차 인식 결과 확인이 필요합니다. 차량번호: 12가3456.',
  );
});

test('관리자 알림 내용이 길면 목록에서 볼 핵심만 남긴다', () => {
  assert.equal(
    formatManagerNotificationMessage(
      'a-b1-009 구역 OCR 12가3456가 등록 차량 후보 [12가3458,12가3459,12가3460]와 유사합니다. 관리자 확인 후 확정하세요. 거리값: 1.',
    ),
    'a-b1-009 구역 OCR 12가3456가 등록 차량 후보 [12가3458,12가3459,12가3460]와 유사합니다.',
  );
});
