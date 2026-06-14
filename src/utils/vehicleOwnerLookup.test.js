import test from 'node:test';
import assert from 'node:assert/strict';
import { findVehicleOwnerFromLists } from './vehicleOwnerLookup.js';

test('입주민 차량 목록과 주민 목록으로 차주 정보를 찾는다', () => {
  const owner = findVehicleOwnerFromLists('12가 3456', {
    vehicles: [{ carNumber: '12가3456', ownerId: '7', ownerName: '홍길동', building: '101', unit: '1001' }],
    visitorCars: [],
    residents: [{ residentNo: 7, name: '홍길동', phone: '010-1234-5678', building: '101', unit: '1001' }],
  });

  assert.deepEqual(owner, {
    residentNo: 7,
    name: '홍길동',
    building: '101',
    unit: '1001',
    phone: '010-1234-5678',
    carNumber: '12가3456',
    vehicleType: 'resident',
  });
});

test('입주민 차량에 없으면 방문차량 목록에서 차주 정보를 찾는다', () => {
  const owner = findVehicleOwnerFromLists('33호3030', {
    vehicles: [],
    visitorCars: [{ carNumber: '33호3030', ownerId: '2', ownerName: '이서연', building: '102', unit: '804' }],
    residents: [{ residentNo: 2, name: '이서연', phone: '010-2222-3333', building: '102', unit: '804' }],
  });

  assert.equal(owner.residentNo, 2);
  assert.equal(owner.phone, '010-2222-3333');
  assert.equal(owner.vehicleType, 'visitor');
});

test('차량번호가 목록에 없으면 null을 반환한다', () => {
  const owner = findVehicleOwnerFromLists('99하9999', {
    vehicles: [{ carNumber: '12가3456', ownerId: '7' }],
    visitorCars: [],
    residents: [],
  });

  assert.equal(owner, null);
});
