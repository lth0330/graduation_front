const NORMAL_ZONE_TYPE = 'normal';
const DOUBLE_LANE_ZONE_TYPE = 'double_lane';
const OCCUPIED_STATUS = 'occupied';

export function isGateOccupancyParkingArea(parkingArea) {
  const zoneType = parkingArea?.zoneType || NORMAL_ZONE_TYPE;
  return zoneType !== DOUBLE_LANE_ZONE_TYPE;
}

export function calculateGateOccupancy(parkingAreas = []) {
  const gateParkingAreas = parkingAreas.filter(isGateOccupancyParkingArea);
  const totalSpaces = gateParkingAreas.length;
  const usedSpaces = gateParkingAreas.filter((parkingArea) => parkingArea.status === OCCUPIED_STATUS).length;
  const availableSpaces = totalSpaces - usedSpaces;
  const occupancyRate = totalSpaces > 0 ? usedSpaces / totalSpaces : 0;
  const occupancyRateLabel = totalSpaces > 0 ? `${Math.round(occupancyRate * 100)}%` : '-';

  return {
    totalSpaces,
    usedSpaces,
    availableSpaces,
    occupancyRate,
    occupancyRateLabel,
  };
}
