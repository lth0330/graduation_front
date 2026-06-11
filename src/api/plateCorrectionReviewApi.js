import apiClient from './axiosInstance.js';

export async function getPendingPlateCorrectionReviews() {
  const response = await apiClient.get('/api/plate-correction-reviews/pending');

  return response.data;
}

export async function confirmPlateCorrectionReview(reviewId, plate) {
  const response = await apiClient.patch(`/api/plate-correction-reviews/${reviewId}/confirm`, {
    plate,
  });

  return response.data;
}
