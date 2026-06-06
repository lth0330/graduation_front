import apiClient from './axiosInstance.js';

export async function getParkingLots(apartmentNo) {
  const response = await apiClient.get('/api/parking-lots', {
    params: { apartmentNo },
  });

  return response.data;
}

export async function createParkingLot(parkingLot) {
  const response = await apiClient.post('/api/parking-lots', parkingLot);

  return response.data;
}

export async function deleteParkingLot(parkingLotNo) {
  await apiClient.delete(`/api/parking-lots/${parkingLotNo}`);
}

export async function getGatePolicy() {
  const response = await apiClient.get('/api/apartment-managers/gate-policy');

  return response.data;
}

export async function updateGatePolicy(policy) {
  const response = await apiClient.patch('/api/apartment-managers/gate-policy', policy);

  return response.data;
}

export async function getParkingZones(parkingLotNo) {
  const response = await apiClient.get('/api/parking-zones', {
    params: { parkingLotNo },
  });

  return response.data;
}

export async function createParkingZone(parkingZone) {
  const response = await apiClient.post('/api/parking-zones', parkingZone);

  return response.data;
}

export async function updateParkingZoneStatus(parkingZoneNo, status, statusChangeReason, zoneType) {
  const response = await apiClient.patch(`/api/parking-zones/${parkingZoneNo}/status`, {
    status,
    statusChangeReason,
    zoneType,
  });

  return response.data;
}

export async function updateParkingZoneLayout(parkingZoneNo, layoutRow, layoutColumn) {
  const response = await apiClient.patch(`/api/parking-zones/${parkingZoneNo}/layout`, {
    layoutRow,
    layoutColumn,
  });

  return response.data;
}

export async function deleteParkingZone(parkingZoneNo) {
  await apiClient.delete(`/api/parking-zones/${parkingZoneNo}`);
}
