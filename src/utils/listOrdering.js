const defaultDateKeys = [
  'createdAt',
  'requestedAt',
  'registeredAt',
  'joinedAt',
  'gateEnteredAt',
  'parkedAt',
  'answeredAt',
  'approvedAt',
];

const defaultIdKeys = [
  'id',
  'notificationNo',
  'residentNo',
  'vehicleNo',
  'visitorCarNo',
  'inquiryNo',
  'managerNo',
  'reviewId',
];

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).replace(' ', 'T');
  const time = Date.parse(normalized);
  return Number.isNaN(time) ? null : time;
}

function findNewestDate(row, dateKeys) {
  for (const key of dateKeys) {
    const time = parseDateValue(row?.[key]);
    if (time !== null) {
      return time;
    }
  }
  return null;
}

function findNumericId(row, idKeys) {
  for (const key of idKeys) {
    const value = Number(row?.[key]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

export function sortByNewest(rows, options = {}) {
  const dateKeys = options.dateKeys || defaultDateKeys;
  const idKeys = options.idKeys || defaultIdKeys;

  return [...rows].sort((left, right) => {
    const leftDate = findNewestDate(left, dateKeys);
    const rightDate = findNewestDate(right, dateKeys);

    if (leftDate !== null && rightDate !== null && leftDate !== rightDate) {
      return rightDate - leftDate;
    }
    if (leftDate !== null && rightDate === null) {
      return -1;
    }
    if (leftDate === null && rightDate !== null) {
      return 1;
    }

    return findNumericId(right, idKeys) - findNumericId(left, idKeys);
  });
}
