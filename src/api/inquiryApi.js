import apiClient from './axiosInstance.js';

export async function createManagerInquiry(inquiry) {
  const response = await apiClient.post('/api/manager-inquiries', inquiry);

  return response.data;
}

export async function getMyManagerInquiries() {
  const response = await apiClient.get('/api/manager-inquiries/my');

  return response.data;
}

export async function getWebAdminInquiries() {
  const response = await apiClient.get('/api/web-admin/inquiries');

  return response.data;
}

export async function getWebAdminInquiry(inquiryNo) {
  const response = await apiClient.get(`/api/web-admin/inquiries/${inquiryNo}`);

  return response.data;
}

export async function answerWebAdminInquiry(inquiryNo, answer) {
  const response = await apiClient.patch(`/api/web-admin/inquiries/${inquiryNo}/answer`, {
    answer,
  });

  return response.data;
}
