import { Navigate, Route, Routes } from 'react-router-dom';
import MainPage from './pages/public/MainPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import SignupCompletePage from './pages/auth/SignupCompletePage.jsx';
import WebAdminDashboard from './pages/webAdmin/WebAdminDashboard.jsx';
import SignupApprovalList from './pages/webAdmin/SignupApprovalList.jsx';
import SignupApprovalDetail from './pages/webAdmin/SignupApprovalDetail.jsx';
import ApartmentManagerManagement from './pages/webAdmin/ApartmentManagerManagement.jsx';
import WebAdminInquiryList from './pages/webAdmin/WebAdminInquiryList.jsx';
import WebAdminInquiryDetail from './pages/webAdmin/WebAdminInquiryDetail.jsx';
import ApartmentDashboard from './pages/apartmentManager/ApartmentDashboard.jsx';
import MyPage from './pages/apartmentManager/MyPage.jsx';
import ResidentRequestList from './pages/apartmentManager/ResidentRequestList.jsx';
import ResidentRequestDetail from './pages/apartmentManager/ResidentRequestDetail.jsx';
import ResidentManagement from './pages/apartmentManager/ResidentManagement.jsx';
import ResidentEdit from './pages/apartmentManager/ResidentEdit.jsx';
import VehicleManagement from './pages/apartmentManager/VehicleManagement.jsx';
import VehicleForm from './pages/apartmentManager/VehicleForm.jsx';
import ParkingLotManagement from './pages/apartmentManager/ParkingLotManagement.jsx';
import ParkingAreaManagement from './pages/apartmentManager/ParkingAreaManagement.jsx';
import ParkingStatusGrid from './pages/apartmentManager/ParkingStatusGrid.jsx';
import InquiryWrite from './pages/apartmentManager/InquiryWrite.jsx';
import InquiryHistory from './pages/apartmentManager/InquiryHistory.jsx';
import ResidentInquiryList from './pages/apartmentManager/ResidentInquiryList.jsx';
import ResidentInquiryDetail from './pages/apartmentManager/ResidentInquiryDetail.jsx';
import { WebAdminProvider } from './contexts/WebAdminContext.jsx';
import { ApartmentManagerProvider } from './contexts/ApartmentManagerContext.jsx';

export default function App() {
  return (
    <WebAdminProvider>
      <ApartmentManagerProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup-request" element={<SignupPage />} />
          <Route path="/signup-complete" element={<SignupCompletePage />} />
          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/apartment-signup" element={<Navigate to="/signup-request" replace />} />

          <Route path="/web-admin" element={<WebAdminDashboard />} />
          <Route path="/web-admin/dashboard" element={<Navigate to="/web-admin" replace />} />
          <Route path="/web-admin/signup-approvals" element={<SignupApprovalList />} />
          <Route path="/web-admin/signup-approvals/:id" element={<SignupApprovalDetail />} />
          <Route path="/web-admin/apartment-managers" element={<ApartmentManagerManagement />} />
          <Route path="/web-admin/inquiries" element={<WebAdminInquiryList />} />
          <Route path="/web-admin/inquiries/:id" element={<WebAdminInquiryDetail />} />

          <Route path="/apartment-admin" element={<ApartmentDashboard />} />
          <Route path="/apartment-manager/dashboard" element={<Navigate to="/apartment-admin" replace />} />
          <Route path="/apartment-manager/my-page" element={<MyPage />} />
          <Route path="/apartment-manager/resident-requests" element={<ResidentRequestList />} />
          <Route path="/apartment-manager/resident-requests/:id" element={<ResidentRequestDetail />} />
          <Route path="/apartment-manager/residents" element={<ResidentManagement />} />
          <Route path="/apartment-manager/residents/:id/edit" element={<ResidentEdit />} />
          <Route path="/apartment-manager/vehicles" element={<VehicleManagement />} />
          <Route path="/apartment-manager/vehicles/new" element={<VehicleForm />} />
          <Route path="/apartment-manager/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/apartment-manager/parking-lots" element={<ParkingLotManagement />} />
          <Route path="/apartment-manager/parking-areas" element={<ParkingAreaManagement />} />
          <Route path="/apartment-manager/parking-status" element={<ParkingStatusGrid />} />
          <Route path="/apartment-manager/inquiry-write" element={<InquiryWrite />} />
          <Route path="/apartment-manager/inquiry-history" element={<InquiryHistory />} />
          <Route path="/apartment-manager/resident-inquiries" element={<ResidentInquiryList />} />
          <Route path="/apartment-manager/resident-inquiries/:id" element={<ResidentInquiryDetail />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ApartmentManagerProvider>
    </WebAdminProvider>
  );
}
