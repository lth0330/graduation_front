import apiClient from './axiosInstance.js';

export async function getManagerNotifications() {
  const response = await apiClient.get('/api/manager-notifications');

  return response.data;
}

export async function getManagerNotification(notificationNo) {
  const response = await apiClient.get(`/api/manager-notifications/${notificationNo}`);

  return response.data;
}

export async function markManagerNotificationAsRead(notificationNo) {
  const response = await apiClient.patch(`/api/manager-notifications/${notificationNo}/read`);

  return response.data;
}
