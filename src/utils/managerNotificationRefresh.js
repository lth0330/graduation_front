export const managerNotificationsErrorMessage =
  '관리자 알림 목록을 불러오지 못했습니다. 백엔드 서버 상태를 확인하세요.';

export const plateCorrectionReviewsErrorMessage =
  '번호판 확인 필요 목록을 불러오지 못했습니다.';

export async function loadManagerNotificationResources({
  getNotifications,
  getPlateCorrectionReviews,
  mapNotification,
  mapPlateCorrectionReview,
}) {
  let managerNotifications = [];
  let plateCorrectionReviews = [];
  let managerNotificationsError = '';
  let plateCorrectionReviewsError = '';

  try {
    const notifications = await getNotifications();
    managerNotifications = notifications.map(mapNotification);
  } catch (error) {
    managerNotificationsError = managerNotificationsErrorMessage;
  }

  try {
    const reviews = await getPlateCorrectionReviews();
    plateCorrectionReviews = reviews.map(mapPlateCorrectionReview);
  } catch (error) {
    plateCorrectionReviewsError = plateCorrectionReviewsErrorMessage;
  }

  return {
    managerNotifications,
    plateCorrectionReviews,
    managerNotificationsError,
    plateCorrectionReviewsError,
  };
}
