import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateGateOccupancy } from './gateOccupancy.js';

test('차단기 사용률은 통로 주차칸을 제외한 일반 주차칸 기준으로 계산한다', () => {
  const result = calculateGateOccupancy([
    { zoneType: 'normal', status: 'occupied' },
    { zoneType: 'normal', status: 'occupied' },
    { zoneType: 'normal', status: 'occupied' },
    { zoneType: 'normal', status: 'occupied' },
    { zoneType: 'normal', status: 'occupied' },
    { zoneType: 'normal', status: 'empty' },
    { zoneType: 'double_lane', status: 'occupied' },
    { zoneType: 'double_lane', status: 'occupied' },
    { zoneType: 'double_lane', status: 'empty' },
  ]);

  assert.deepEqual(result, {
    totalSpaces: 6,
    usedSpaces: 5,
    availableSpaces: 1,
    occupancyRate: 5 / 6,
    occupancyRateLabel: '83%',
  });
});

test('zoneType이 비어 있으면 기존 데이터 호환을 위해 일반 주차칸으로 계산한다', () => {
  const result = calculateGateOccupancy([
    { zoneType: '', status: 'occupied' },
    { status: 'empty' },
    { zoneType: 'double_lane', status: 'occupied' },
  ]);

  assert.equal(result.totalSpaces, 2);
  assert.equal(result.usedSpaces, 1);
  assert.equal(result.availableSpaces, 1);
});
