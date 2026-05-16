import apiClient from './axiosInstance.js';

export async function getWebAdminDashboardSummary() {
  const response = await apiClient.get('/api/web-admin/dashboard/summary');

  return response.data;
}

export async function getApartmentManagerDashboardSummary() {
  const response = await apiClient.get('/api/apartment-managers/dashboard/summary');

  return response.data;
}
