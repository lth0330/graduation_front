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

export async function markAllManagerNotificationsAsRead() {
  const response = await apiClient.patch('/api/manager-notifications/read-all');

  return response.data;
}

export async function deleteManagerNotification(notificationNo) {
  const response = await apiClient.delete(`/api/manager-notifications/${notificationNo}`);

  return response.data;
}

export async function deleteAllManagerNotifications() {
  const response = await apiClient.delete('/api/manager-notifications');

  return response.data;
}
