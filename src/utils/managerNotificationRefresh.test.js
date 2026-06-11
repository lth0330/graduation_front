import test from 'node:test';
import assert from 'node:assert/strict';
import { loadManagerNotificationResources } from './managerNotificationRefresh.js';

test('관리자 알림 조회가 성공하면 번호판 검토 조회가 실패해도 알림 목록은 유지한다', async () => {
  const result = await loadManagerNotificationResources({
    getNotifications: async () => [{ notificationNo: 1, title: '알림' }],
    getPlateCorrectionReviews: async () => {
      throw new Error('plate review api failed');
    },
    mapNotification: (notification) => ({ id: notification.notificationNo, title: notification.title }),
    mapPlateCorrectionReview: (review) => review,
  });

  assert.deepEqual(result.managerNotifications, [{ id: 1, title: '알림' }]);
  assert.deepEqual(result.plateCorrectionReviews, []);
  assert.equal(result.managerNotificationsError, '');
  assert.equal(result.plateCorrectionReviewsError, '번호판 확인 필요 목록을 불러오지 못했습니다.');
});

test('번호판 검토 조회가 성공하면 관리자 알림 조회가 실패해도 검토 목록은 유지한다', async () => {
  const result = await loadManagerNotificationResources({
    getNotifications: async () => {
      throw new Error('notification api failed');
    },
    getPlateCorrectionReviews: async () => [{ reviewId: 7, matchedPlate: '12가3456' }],
    mapNotification: (notification) => notification,
    mapPlateCorrectionReview: (review) => ({ id: review.reviewId, matchedPlate: review.matchedPlate }),
  });

  assert.deepEqual(result.managerNotifications, []);
  assert.deepEqual(result.plateCorrectionReviews, [{ id: 7, matchedPlate: '12가3456' }]);
  assert.equal(result.managerNotificationsError, '관리자 알림 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.');
  assert.equal(result.plateCorrectionReviewsError, '');
});
