import apiClient from './axiosInstance.js';

export async function loginWebAdmin({ wId, wPwd }) {
  const response = await apiClient.post('/api/web-admin/login', {
    wId,
    wPwd,
  });

  return response.data;
}

export async function getSignupRequests() {
  const response = await apiClient.get('/api/web-admin/signup-requests');

  return response.data;
}

export async function approveSignupRequest(managerNo) {
  const response = await apiClient.patch(`/api/web-admin/signup-requests/${managerNo}/approve`);

  return response.data;
}

export async function rejectSignupRequest(managerNo, rejectReason) {
  const response = await apiClient.patch(`/api/web-admin/signup-requests/${managerNo}/reject`, {
    rejectReason,
  });

  return response.data;
}
