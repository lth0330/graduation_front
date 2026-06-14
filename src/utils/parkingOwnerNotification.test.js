import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildParkingOwnerNotificationForm,
  canNotifyParkingAreaOwner,
} from './parkingOwnerNotification.js';

test('주차 중이고 차량번호가 확인된 주차칸만 차주 알림 대상으로 본다', () => {
  assert.equal(canNotifyParkingAreaOwner({ status: 'occupied', currentCarNumber: '12가3456' }), true);
  assert.equal(canNotifyParkingAreaOwner({ status: 'empty', currentCarNumber: '12가3456' }), false);
  assert.equal(canNotifyParkingAreaOwner({ status: 'occupied', currentCarNumber: 'UNKNOWN' }), false);
  assert.equal(canNotifyParkingAreaOwner({ status: 'occupied', currentCarNumber: '' }), false);
});

test('차주 알림 기본 문구에는 차량번호와 세대 정보가 들어간다', () => {
  const form = buildParkingOwnerNotificationForm(
    { areaNumber: 'a-b1-009', currentCarNumber: '12가3456' },
    { name: '홍길동', building: '101', unit: '1001', carNumber: '12가3456' },
  );

  assert.equal(form.title, '차량 이동 요청');
  assert.match(form.message, /101동 1001호 홍길동님/);
  assert.match(form.message, /12가3456/);
  assert.match(form.message, /a-b1-009/);
});
