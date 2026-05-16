import apiClient from './axiosInstance.js';

export async function signupApartmentManager(signupForm) {
  const formData = new FormData();

  formData.append('loginId', signupForm.loginId);
  formData.append('password', signupForm.password);
  formData.append('email', signupForm.email);
  formData.append('phone', signupForm.phone);
  formData.append('name', signupForm.name);
  formData.append('apartmentName', signupForm.apartmentName);
  formData.append('address', signupForm.address);
  formData.append('careerImageFile', signupForm.careerImage);

  const response = await apiClient.post('/api/apartment-managers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function loginApartmentManager({ loginId, password }) {
  const response = await apiClient.post('/api/apartment-managers/login', {
    loginId,
    password,
  });

  return response.data;
}

export async function getApartmentManagerMyPage(managerNo) {
  const response = await apiClient.get(`/api/apartment-managers/${managerNo}/my-page`);

  return response.data;
}

export async function getResidentSignupRequests(apartmentNo) {
  const response = await apiClient.get('/api/resident-signup-requests', {
    params: { apartmentNo },
  });

  return response.data;
}

export async function approveResidentSignupRequest(residentNo) {
  const response = await apiClient.patch(`/api/resident-signup-requests/${residentNo}/approve`);

  return response.data;
}

export async function rejectResidentSignupRequest(residentNo, rejectReason) {
  const response = await apiClient.patch(`/api/resident-signup-requests/${residentNo}/reject`, {
    rejectReason,
  });

  return response.data;
}

export async function getResidents(apartmentNo) {
  const response = await apiClient.get('/api/residents', {
    params: { apartmentNo },
  });

  return response.data;
}

export async function createResident(resident) {
  const response = await apiClient.post('/api/residents', resident);

  return response.data;
}

export async function updateResident(residentNo, resident) {
  const response = await apiClient.put(`/api/residents/${residentNo}`, resident);

  return response.data;
}

export async function deleteResident(residentNo) {
  await apiClient.delete(`/api/residents/${residentNo}`);
}

export async function getVehicles(apartmentNo) {
  const response = await apiClient.get('/api/vehicles', {
    params: { apartmentNo },
  });

  return response.data;
}

export async function createVehicle(vehicle) {
  const response = await apiClient.post('/api/vehicles', vehicle);

  return response.data;
}

export async function updateVehicle(vehicleNo, vehicle) {
  const response = await apiClient.put(`/api/vehicles/${vehicleNo}`, vehicle);

  return response.data;
}

export async function deleteVehicle(vehicleNo) {
  await apiClient.delete(`/api/vehicles/${vehicleNo}`);
}
