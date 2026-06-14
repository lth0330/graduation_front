import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readSource = (relativePath) => (
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')
);

const sliceBetween = (source, startText, endText) => {
  const start = source.indexOf(startText);
  assert.notEqual(start, -1, `${startText} not found`);

  const end = source.indexOf(endText, start);
  assert.notEqual(end, -1, `${endText} not found after ${startText}`);

  return source.slice(start, end);
};

const assertNavigatesTo = (source, route) => {
  assert.match(source, new RegExp(`navigate\\('${route.replaceAll('/', '\\/')}'\\)`));
};

test('resident detail save actions return to resident list', () => {
  const source = readSource('../pages/apartmentManager/ResidentEdit.jsx');

  assertNavigatesTo(sliceBetween(source, 'await createResident', 'return;'), '/apartment-manager/residents');
  assertNavigatesTo(sliceBetween(source, 'await updateResident', '} catch'), '/apartment-manager/residents');
  assertNavigatesTo(sliceBetween(source, 'await deleteResident', '} catch'), '/apartment-manager/residents');
});

test('vehicle detail save actions return to vehicle list', () => {
  const source = readSource('../pages/apartmentManager/VehicleForm.jsx');

  assertNavigatesTo(sliceBetween(source, 'await updateVehicle', 'return;'), '/apartment-manager/vehicles');
  assertNavigatesTo(sliceBetween(source, 'await createVehicle', '} catch'), '/apartment-manager/vehicles');
  assertNavigatesTo(sliceBetween(source, 'await deleteVehicle', '} catch'), '/apartment-manager/vehicles');
});

test('approval and inquiry detail actions return to their list pages', () => {
  assertNavigatesTo(readSource('../pages/webAdmin/SignupApprovalDetail.jsx'), '/web-admin/signup-approvals');
  assertNavigatesTo(readSource('../pages/apartmentManager/ResidentRequestDetail.jsx'), '/apartment-manager/resident-requests');
  assertNavigatesTo(readSource('../pages/webAdmin/WebAdminInquiryDetail.jsx'), '/web-admin/inquiries');
  assertNavigatesTo(readSource('../pages/apartmentManager/ResidentInquiryDetail.jsx'), '/apartment-manager/resident-inquiries');
});
