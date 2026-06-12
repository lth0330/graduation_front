import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildParkingPlacementFromRange,
  getParkingSpotAreaLabel,
  getParkingSpotDisplayText,
  getParkingRangeFromPlacement,
  isParkingImageInspectableArea,
  isParkingImageInspectableStatus,
  isValidParkingRange,
} from './parkingLayout.js';

test('행/열 범위를 백엔드 배치값으로 변환한다', () => {
  const placement = buildParkingPlacementFromRange({
    rowStart: '1',
    rowEnd: '3',
    columnStart: '1',
    columnEnd: '1',
  });

  assert.deepEqual(placement, {
    layoutRow: 1,
    layoutColumn: 1,
    layoutWidth: 1,
    layoutHeight: 3,
  });
});

test('기존 배치값을 화면 입력 범위로 변환한다', () => {
  const range = getParkingRangeFromPlacement({
    layoutRow: 2,
    layoutColumn: 3,
    layoutWidth: 2,
    layoutHeight: 1,
  });

  assert.deepEqual(range, {
    rowStart: '2',
    rowEnd: '2',
    columnStart: '3',
    columnEnd: '4',
  });
});

test('끝 행이나 끝 열이 시작보다 작으면 잘못된 범위로 본다', () => {
  assert.equal(
    isValidParkingRange({
      rowStart: '3',
      rowEnd: '1',
      columnStart: '1',
      columnEnd: '1',
    }),
    false,
  );
});

test('주차 중이고 차량번호가 있으면 주차칸 번호와 차량번호를 함께 표시한다', () => {
  assert.equal(
    getParkingSpotDisplayText({
      areaNumber: 'a-b1-001',
      status: 'occupied',
      currentCarNumber: '12가3456',
    }),
    '001\n12가3456',
  );
});

test('주차 중이어도 차량번호가 없으면 구역 번호를 표시한다', () => {
  assert.equal(
    getParkingSpotDisplayText({
      areaNumber: 'a-b1-001',
      status: 'occupied',
      currentCarNumber: '',
    }),
    '001',
  );
});

test('주차칸 화면 라벨은 마지막 하이픈 구간만 표시한다', () => {
  assert.equal(getParkingSpotAreaLabel('a-b1-001'), '001');
  assert.equal(getParkingSpotAreaLabel('A1'), 'A1');
});

test('오류와 unknown 상태는 이미지 확인 대상으로 본다', () => {
  assert.equal(isParkingImageInspectableStatus('error'), true);
  assert.equal(isParkingImageInspectableStatus('unknown'), true);
  assert.equal(isParkingImageInspectableStatus('occupied'), false);
});

test('번호판이 UNKNOWN인 주차칸은 이미지 확인 대상으로 본다', () => {
  assert.equal(
    isParkingImageInspectableArea({
      status: 'occupied',
      currentCarNumber: 'UNKNOWN',
    }),
    true,
  );

  assert.equal(
    isParkingImageInspectableArea({
      status: 'occupied',
      currentCarNumber: '12가3456',
    }),
    false,
  );
});

test('빈 주차칸은 이전 UNKNOWN 번호판이나 이미지가 남아도 이미지 확인 대상으로 보지 않는다', () => {
  assert.equal(
    isParkingImageInspectableArea({
      status: 'empty',
      currentCarNumber: 'UNKNOWN',
      errorImage: '/uploads/parking-snapshots/old.jpg',
    }),
    false,
  );
});
