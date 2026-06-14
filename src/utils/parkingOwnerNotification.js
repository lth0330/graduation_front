function normalizeText(value) {
  return String(value || '').trim();
}

function isUnknownCarNumber(value) {
  return normalizeText(value).toUpperCase() === 'UNKNOWN';
}

export function canNotifyParkingAreaOwner(area) {
  const currentCarNumber = normalizeText(area?.currentCarNumber);
  return String(area?.status || '').toLowerCase() === 'occupied'
    && Boolean(currentCarNumber)
    && !isUnknownCarNumber(currentCarNumber);
}

export function buildParkingOwnerNotificationForm(area, owner) {
  const carNumber = normalizeText(owner?.carNumber) || normalizeText(area?.currentCarNumber);
  const areaNumber = normalizeText(area?.areaNumber) || '해당 주차칸';
  const residentName = normalizeText(owner?.name) || '주민';
  const unitInfo = owner?.building && owner?.unit ? `${owner.building}동 ${owner.unit}호 ` : '';

  return {
    title: '차량 이동 요청',
    message: `${unitInfo}${residentName}님, ${areaNumber} 주차칸의 ${carNumber} 차량이 다른 차량의 출차를 막고 있습니다. 앱 알림 확인 후 차량 이동 또는 관리사무소 연락을 부탁드립니다.`,
  };
}
