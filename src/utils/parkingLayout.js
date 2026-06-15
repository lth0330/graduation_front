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
  // DB에 배치 정보가 없을 때는 index 기준 기본 위치를 만들어 화면이 비어 보이지 않게 합니다.
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
  // 화면에서 입력한 시작/끝 좌표를 DB가 저장하는 시작점+크기 형태로 변환합니다.
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
  // 행/열 시작값과 끝값이 모두 양수이고, 끝값이 시작값보다 작지 않은지 확인합니다.
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

function isDoubleLaneParkingArea(area) {
  // 앱에서는 aisle, 웹/백엔드에서는 double_lane을 사용할 수 있어 두 값을 모두 통로 주차로 처리합니다.
  return ['double_lane', 'aisle'].includes(String(area?.zoneType || area?.type || '').toLowerCase());
}

export function getParkingSpotDisplayText(area) {
  const currentCarNumber = String(area.currentCarNumber || '').trim();
  const baseAreaLabel = getParkingSpotAreaLabel(area.areaNumber);
  const areaLabel = isDoubleLaneParkingArea(area) ? `통로 ${baseAreaLabel}` : baseAreaLabel;

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

  // OCR 실패, UNKNOWN 번호판, 저장된 오류 이미지가 있으면 관리자가 이미지로 확인할 수 있는 주차면입니다.
  return (
    isParkingImageInspectableStatus(area?.status) ||
    isUnknownCarNumber(area?.currentCarNumber) ||
    Boolean(area?.errorImage)
  );
}
