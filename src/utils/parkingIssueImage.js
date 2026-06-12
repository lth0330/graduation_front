const imageNotificationTypes = ['ocr_error', 'abnormal_parking'];

export function isActiveParkingHistory(history) {
  if (!history) {
    return false;
  }

  const status = String(history.status || '').trim().toUpperCase();
  const exitTime = String(history.exitTime || '').trim();

  return status !== 'EXITED' && !exitTime;
}

export function findAreaIssueNotification(area, notifications) {
  const areaNumber = String(area?.areaNumber || '').trim();

  if (!areaNumber) {
    return null;
  }

  return notifications.find((notification) => {
    if (
      notification.read ||
      !imageNotificationTypes.includes(notification.notificationType) ||
      notification.referenceType !== 'parking_history'
    ) {
      return false;
    }

    if (notification.parkingHistory && !isActiveParkingHistory(notification.parkingHistory)) {
      return false;
    }

    const historyZone = String(notification.parkingHistory?.zone || '').trim();
    if (historyZone) {
      return historyZone === areaNumber;
    }

    const searchableText = [
      notification.title,
      notification.message,
    ]
      .filter(Boolean)
      .join(' ');

    return searchableText.includes(areaNumber);
  }) || null;
}

export function mergeAreaWithNotificationDetail(area, notificationDetail) {
  const parkingHistory = notificationDetail?.parkingHistory;

  if (!isActiveParkingHistory(parkingHistory)) {
    return area;
  }

  const areaNumber = String(area?.areaNumber || '').trim();
  const historyZone = String(parkingHistory?.zone || '').trim();
  const isSameAreaHistory = Boolean(parkingHistory) && (!historyZone || historyZone === areaNumber);

  if (!isSameAreaHistory) {
    return area;
  }

  return {
    ...area,
    relatedNotificationNo: notificationDetail?.notificationNo || area.relatedNotificationNo,
    errorImage: area.errorImage || parkingHistory.imagePath || '',
    errorMessage: notificationDetail?.message || area.errorMessage,
    errorPlate: parkingHistory.plate || area.currentCarNumber,
    errorEntryTime: parkingHistory.entryTime || '',
  };
}
