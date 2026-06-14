function compactCarNumber(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function normalizeResidentNo(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function findResident(residents, residentNo) {
  return residents.find((resident) => Number(resident.residentNo || resident.id) === residentNo);
}

function toOwnerDto(vehicle, resident, vehicleType) {
  const residentNo = normalizeResidentNo(vehicle.ownerId || resident?.residentNo || resident?.id);

  return {
    residentNo,
    name: resident?.name || vehicle.ownerName || '',
    building: resident?.building || vehicle.building || '',
    unit: resident?.unit || vehicle.unit || '',
    phone: resident?.phone || '',
    carNumber: vehicle.carNumber || '',
    vehicleType,
  };
}

export function findVehicleOwnerFromLists(carNumber, { vehicles = [], visitorCars = [], residents = [] } = {}) {
  const targetNumber = compactCarNumber(carNumber);
  if (!targetNumber) {
    return null;
  }

  const residentVehicle = vehicles.find((vehicle) => compactCarNumber(vehicle.carNumber) === targetNumber);
  if (residentVehicle) {
    const residentNo = normalizeResidentNo(residentVehicle.ownerId);
    return toOwnerDto(residentVehicle, findResident(residents, residentNo), 'resident');
  }

  const visitorCar = visitorCars.find((vehicle) => compactCarNumber(vehicle.carNumber) === targetNumber);
  if (visitorCar) {
    const residentNo = normalizeResidentNo(visitorCar.ownerId);
    return toOwnerDto(visitorCar, findResident(residents, residentNo), 'visitor');
  }

  return null;
}
