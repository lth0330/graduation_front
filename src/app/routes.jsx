import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import {
  ApartmentDashboard,
  InquiryHistory,
  InquiryWrite,
  MyPage,
  ParkingAreaManagement,
  ParkingLotManagement,
  ParkingStatusGrid,
  ResidentEdit,
  ResidentInquiryDetail,
  ResidentInquiryList,
  ResidentManagement,
  ResidentRequestDetail,
  ResidentRequestList,
  VehicleForm,
  VehicleManagement,
} from '../pages/apartmentManager/index.js';
import { LoginPage, SignupCompletePage, SignupPage } from '../pages/auth/index.js';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { MainPage } from '../pages/public/index.js';
import {
  ApartmentManagerManagement,
  SignupApprovalDetail,
  SignupApprovalList,
  WebAdminDashboard,
  WebAdminInquiryDetail,
  WebAdminInquiryList,
} from '../pages/webAdmin/index.js';
import { authRoles } from '../utils/auth.js';

const webAdminRoute = (element) => (
  <ProtectedRoute role={authRoles.WEB_ADMIN}>{element}</ProtectedRoute>
);

const apartmentManagerRoute = (element) => (
  <ProtectedRoute role={authRoles.APARTMENT_MANAGER}>{element}</ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: '/', element: <MainPage /> },

  { path: '/login', element: <LoginPage /> },
  { path: '/signup-request', element: <SignupPage /> },
  { path: '/signup-complete', element: <SignupCompletePage /> },
  { path: '/auth/login', element: <Navigate to="/login" replace /> },
  { path: '/auth/apartment-signup', element: <Navigate to="/signup-request" replace /> },

  { path: '/web-admin', element: webAdminRoute(<WebAdminDashboard />) },
  { path: '/web-admin/dashboard', element: <Navigate to="/web-admin" replace /> },
  { path: '/web-admin/signup-approvals', element: webAdminRoute(<SignupApprovalList />) },
  { path: '/web-admin/signup-approvals/:id', element: webAdminRoute(<SignupApprovalDetail />) },
  { path: '/web-admin/apartment-managers', element: webAdminRoute(<ApartmentManagerManagement />) },
  { path: '/web-admin/inquiries', element: webAdminRoute(<WebAdminInquiryList />) },
  { path: '/web-admin/inquiries/:id', element: webAdminRoute(<WebAdminInquiryDetail />) },

  { path: '/apartment-admin', element: apartmentManagerRoute(<ApartmentDashboard />) },
  { path: '/apartment-manager/dashboard', element: <Navigate to="/apartment-admin" replace /> },
  { path: '/apartment-manager/my-page', element: apartmentManagerRoute(<MyPage />) },
  { path: '/apartment-manager/resident-requests', element: apartmentManagerRoute(<ResidentRequestList />) },
  { path: '/apartment-manager/resident-requests/:id', element: apartmentManagerRoute(<ResidentRequestDetail />) },
  { path: '/apartment-manager/residents', element: apartmentManagerRoute(<ResidentManagement />) },
  { path: '/apartment-manager/residents/new', element: apartmentManagerRoute(<ResidentEdit />) },
  { path: '/apartment-manager/residents/:id/edit', element: apartmentManagerRoute(<ResidentEdit />) },
  { path: '/apartment-manager/vehicles', element: apartmentManagerRoute(<VehicleManagement />) },
  { path: '/apartment-manager/vehicles/new', element: apartmentManagerRoute(<VehicleForm />) },
  { path: '/apartment-manager/vehicles/:id/edit', element: apartmentManagerRoute(<VehicleForm />) },
  { path: '/apartment-manager/parking-lots', element: apartmentManagerRoute(<ParkingLotManagement />) },
  { path: '/apartment-manager/parking-areas', element: apartmentManagerRoute(<ParkingAreaManagement />) },
  { path: '/apartment-manager/parking-status', element: apartmentManagerRoute(<ParkingStatusGrid />) },
  { path: '/apartment-manager/inquiry-write', element: apartmentManagerRoute(<InquiryWrite />) },
  { path: '/apartment-manager/inquiry-history', element: apartmentManagerRoute(<InquiryHistory />) },
  { path: '/apartment-manager/resident-inquiries', element: apartmentManagerRoute(<ResidentInquiryList />) },
  { path: '/apartment-manager/resident-inquiries/:id', element: apartmentManagerRoute(<ResidentInquiryDetail />) },
  { path: '*', element: <NotFoundPage /> },
]);
