import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { getApartmentManagerDashboardSummary } from '../../api/dashboardApi.js';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

const recentResidentRequestColumns = [
  { key: 'id', header: '신청 ID' },
  { key: 'name', header: '이름' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building}동 ${row.unit}호` },
  { key: 'carNumber', header: '차량번호' },
  { key: 'status', header: '상태', render: (row) => <Badge status={row.status} /> },
  { key: 'requestedAt', header: '신청일' },
  {
    key: 'action',
    header: '상세',
    render: (row) => (
      <Link to={`/apartment-manager/resident-requests/${row.id}`}>
        <Button variant="secondary" size="small">상세</Button>
      </Link>
    ),
  },
];

const initialSummary = {
  residentCount: 0,
  pendingResidentRequestCount: 0,
  vehicleCount: 0,
  totalParkingSpaces: 0,
  usedParkingSpaces: 0,
  parkingUsageRate: 0,
  pendingResidentInquiryCount: 0,
};

export default function ApartmentDashboard() {
  const { residentSignupRequests } = useApartmentManager();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [summary, setSummary] = useState(initialSummary);
  const [summaryError, setSummaryError] = useState('');
  const filteredResidentRequests =
    selectedStatus === 'all'
      ? residentSignupRequests
      : residentSignupRequests.filter((request) => request.status === selectedStatus);
  const recentResidentRequests = filteredResidentRequests.slice(0, 4);

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummaryError('');
        const dashboardSummary = await getApartmentManagerDashboardSummary();
        setSummary(dashboardSummary);
      } catch (error) {
        setSummaryError('대시보드 통계를 불러오지 못했습니다.');
      }
    }

    loadSummary();
  }, []);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="아파트 관리자 대시보드"
        description="입주민, 차량, 주차장, 문의 상태를 한 화면에서 확인합니다."
      />

      {summaryError && <div className="error-box">{summaryError}</div>}
      <div className="metric-grid">
        <MetricCard
          label="전체 입주민 수"
          value={summary.residentCount}
          helper={`${summary.pendingResidentRequestCount}건 승인 대기`}
        />
        <MetricCard label="등록 차량 수" value={summary.vehicleCount} helper="현재 등록된 차량" />
        <MetricCard
          label="주차장 사용률"
          value={`${summary.parkingUsageRate}%`}
          helper={`사용 ${summary.usedParkingSpaces}면 / 전체 ${summary.totalParkingSpaces}면`}
        />
        <MetricCard label="답변 대기 문의" value={summary.pendingResidentInquiryCount} helper="입주민 문의 처리 필요" />
      </div>

      <SectionCard
        title="최근 입주민 가입 신청 목록"
        description="승인 대기 또는 처리 완료된 최근 입주민 신청입니다."
        headerAction={
          <SelectBox
            aria-label="입주민 가입 신청 상태 분류"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="all">전체</option>
            <option value="pending">승인 대기</option>
            <option value="approved">승인 완료</option>
            <option value="rejected">거절</option>
          </SelectBox>
        }
      >
        <DataTable
          columns={recentResidentRequestColumns}
          rows={recentResidentRequests}
          emptyMessage="최근 입주민 가입 신청이 없습니다."
        />
      </SectionCard>
    </AdminLayout>
  );
}
