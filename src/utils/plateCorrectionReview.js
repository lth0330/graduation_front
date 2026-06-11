import { getUploadedFileUrl } from './fileUrl.js';

export function getPlateReviewImageUrl(review, baseUrl) {
  return getUploadedFileUrl(review?.parkingHistory?.imagePath, baseUrl);
}

export function normalizePlateInput(plate) {
  return String(plate || '').replace(/\s+/g, '');
}

export function hasPlateReviewCandidates(review) {
  return Array.isArray(review?.candidateList) && review.candidateList.length > 0;
}

export function getPlateReviewManualConfirmLabel(isConfirming) {
  return isConfirming ? '확정 중...' : '입력 번호로 확정';
}
