const DEFAULT_GRID_COLUMNS = 8;
const DEFAULT_LAYOUT_WIDTH = 2;
const DEFAULT_LAYOUT_HEIGHT = 1;

function toInteger(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) ? numberValue : NaN;
}

function normalizePositiveInteger(value, fallback) {
  const numberValue = toInteger(value);
  return numberValue >= 1 ? numberValue : fallback;
}

export function getParkingPlacement(area, index = 0) {
  return {
    layoutRow: normalizePositiveInteger(area.layoutRow, Math.floor(index / DEFAULT_GRID_COLUMNS) + 1),
    layoutColumn: normalizePositiveInteger(area.layoutColumn, (index % DEFAULT_GRID_COLUMNS) + 1),
    layoutWidth: normalizePositiveInteger(area.layoutWidth, DEFAULT_LAYOUT_WIDTH),
    layoutHeight: normalizePositiveInteger(area.layoutHeight, DEFAULT_LAYOUT_HEIGHT),
  };
}

export function getParkingRangeFromPlacement(placement) {
  const layoutRow = normalizePositiveInteger(placement.layoutRow, 1);
  const layoutColumn = normalizePositiveInteger(placement.layoutColumn, 1);
  const layoutWidth = normalizePositiveInteger(placement.layoutWidth, DEFAULT_LAYOUT_WIDTH);
  const layoutHeight = normalizePositiveInteger(placement.layoutHeight, DEFAULT_LAYOUT_HEIGHT);

  return {
    rowStart: String(layoutRow),
    rowEnd: String(layoutRow + layoutHeight - 1),
    columnStart: String(layoutColumn),
    columnEnd: String(layoutColumn + layoutWidth - 1),
  };
}

export function buildParkingPlacementFromRange(range) {
  const rowStart = toInteger(range.rowStart);
  const rowEnd = toInteger(range.rowEnd);
  const columnStart = toInteger(range.columnStart);
  const columnEnd = toInteger(range.columnEnd);

  return {
    layoutRow: rowStart,
    layoutColumn: columnStart,
    layoutWidth: columnEnd - columnStart + 1,
    layoutHeight: rowEnd - rowStart + 1,
  };
}

export function isValidParkingRange(range) {
  const rowStart = toInteger(range.rowStart);
  const rowEnd = toInteger(range.rowEnd);
  const columnStart = toInteger(range.columnStart);
  const columnEnd = toInteger(range.columnEnd);
  const values = [rowStart, rowEnd, columnStart, columnEnd];

  return values.every((value) => value >= 1) && rowEnd >= rowStart && columnEnd >= columnStart;
}

export function formatParkingRange(area) {
  const range = getParkingRangeFromPlacement(area);
  return `행 ${range.rowStart}~${range.rowEnd} / 열 ${range.columnStart}~${range.columnEnd}`;
}

export function getParkingSpotAreaLabel(areaNumber) {
  const normalizedAreaNumber = String(areaNumber || '').trim();
  const areaParts = normalizedAreaNumber.split('-').filter(Boolean);

  return areaParts.length > 1 ? areaParts[areaParts.length - 1] : normalizedAreaNumber;
}

export function getParkingSpotDisplayText(area) {
  const currentCarNumber = String(area.currentCarNumber || '').trim();
  const areaLabel = getParkingSpotAreaLabel(area.areaNumber);

  if (area.status === 'occupied' && currentCarNumber) {
    return `${areaLabel}\n${currentCarNumber}`;
  }

  return areaLabel;
}

export function isParkingImageInspectableStatus(status) {
  return ['error', 'unknown'].includes(String(status || '').toLowerCase());
}

function isUnknownCarNumber(currentCarNumber) {
  return String(currentCarNumber || '').trim().toUpperCase() === 'UNKNOWN';
}

export function isParkingImageInspectableArea(area) {
  if (String(area?.status || '').toLowerCase() === 'empty') {
    return false;
  }

  return (
    isParkingImageInspectableStatus(area?.status) ||
    isUnknownCarNumber(area?.currentCarNumber) ||
    Boolean(area?.errorImage)
  );
}
