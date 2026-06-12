import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findAreaIssueNotification,
  isActiveParkingHistory,
  mergeAreaWithNotificationDetail,
} from './parkingIssueImage.js';

test('출차 완료된 주차 이력은 현재 오류 이미지 후보로 보지 않는다', () => {
  assert.equal(isActiveParkingHistory({ status: 'EXITED', exitTime: '2026-06-12T10:00:00' }), false);
  assert.equal(isActiveParkingHistory({ status: 'PARKED', exitTime: '' }), true);
});

test('같은 구역의 예전 읽지 않은 알림이라도 출차 이력이면 선택하지 않는다', () => {
  const notification = findAreaIssueNotification(
    { areaNumber: 'a-b1-003' },
    [
      {
        notificationType: 'ocr_error',
        referenceType: 'parking_history',
        read: false,
        parkingHistory: {
          zone: 'a-b1-003',
          status: 'EXITED',
          exitTime: '2026-06-12T10:00:00',
          imagePath: '/uploads/parking-snapshots/old.jpg',
        },
      },
    ],
  );

  assert.equal(notification, null);
});

test('알림 상세가 종료된 이력이면 기존 주차칸 이미지에 병합하지 않는다', () => {
  const area = {
    id: '3',
    areaNumber: 'a-b1-003',
    currentCarNumber: 'UNKNOWN',
    errorImage: '',
  };

  const merged = mergeAreaWithNotificationDetail(area, {
    notificationNo: 9,
    message: '이전 오류',
    parkingHistory: {
      zone: 'a-b1-003',
      status: 'EXITED',
      exitTime: '2026-06-12T10:00:00',
      imagePath: '/uploads/parking-snapshots/old.jpg',
    },
  });

  assert.deepEqual(merged, area);
});

test('진행 중인 이력의 이미지만 현재 주차칸 이미지로 병합한다', () => {
  const merged = mergeAreaWithNotificationDetail(
    {
      id: '3',
      areaNumber: 'a-b1-003',
      currentCarNumber: 'UNKNOWN',
      errorImage: '',
    },
    {
      notificationNo: 10,
      message: '새 오류',
      parkingHistory: {
        zone: 'a-b1-003',
        status: 'PARKED',
        exitTime: '',
        plate: 'UNKNOWN',
        entryTime: '2026-06-12T11:00:00',
        imagePath: '/uploads/parking-snapshots/new.jpg',
      },
    },
  );

  assert.equal(merged.errorImage, '/uploads/parking-snapshots/new.jpg');
  assert.equal(merged.relatedNotificationNo, 10);
  assert.equal(merged.errorEntryTime, '2026-06-12T11:00:00');
});
