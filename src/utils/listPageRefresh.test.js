import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readSource = (relativePath) => (
  readFileSync(new URL(relativePath, import.meta.url), 'utf8')
);

const assertToolbarRefresh = (relativePath, refreshCall) => {
  const source = readSource(relativePath);
  assert.match(source, new RegExp(`section-toolbar[\\s\\S]*onClick=\\{${refreshCall}\\}`));
};

test('web admin list pages expose a manual refresh action in the toolbar', () => {
  assertToolbarRefresh('../pages/webAdmin/SignupApprovalList.jsx', 'refreshSignupRequests');
  assertToolbarRefresh('../pages/webAdmin/WebAdminInquiryList.jsx', 'refreshWebAdminInquiries');
  assertToolbarRefresh('../pages/webAdmin/ApartmentManagerManagement.jsx', 'loadApartmentManagers');
});

test('apartment manager list pages expose a manual refresh action in the toolbar', () => {
  assertToolbarRefresh('../pages/apartmentManager/ResidentRequestList.jsx', 'refreshResidentSignupRequests');
  assertToolbarRefresh('../pages/apartmentManager/ResidentManagement.jsx', 'refreshResidents');
  assertToolbarRefresh('../pages/apartmentManager/VehicleManagement.jsx', 'refreshVehicles');
  assertToolbarRefresh('../pages/apartmentManager/VisitorCarManagement.jsx', 'refreshVisitorCars');
  assertToolbarRefresh('../pages/apartmentManager/InquiryHistory.jsx', 'refreshManagerInquiries');
  assertToolbarRefresh('../pages/apartmentManager/ResidentInquiryList.jsx', 'refreshResidentParkingInquiries');
  assertToolbarRefresh('../pages/apartmentManager/ManagerNotificationList.jsx', 'refreshManagerNotifications');
  assertToolbarRefresh('../pages/apartmentManager/PlateCorrectionReviewPage.jsx', 'refreshManagerNotifications');
  assertToolbarRefresh('../pages/apartmentManager/ParkingLotManagement.jsx', 'refreshParkingData');
  assertToolbarRefresh('../pages/apartmentManager/ParkingAreaManagement.jsx', 'refreshParkingData');
});
