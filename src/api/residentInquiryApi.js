import apiClient from './axiosInstance.js';

export async function getResidentInquiries(apartmentNo) {
  const response = await apiClient.get('/api/resident-inquiries', {
    params: { apartmentNo },
  });

  return response.data;
}

export async function getResidentInquiry(inquiryNo) {
  const response = await apiClient.get(`/api/resident-inquiries/${inquiryNo}`);

  return response.data;
}

export async function answerResidentInquiry(inquiryNo, answer) {
  const response = await apiClient.patch(`/api/resident-inquiries/${inquiryNo}/answer`, {
    answer,
  });

  return response.data;
}
