import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
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

export default function ApartmentDashboard() {
  const { residentSignupRequests, residents, vehicles, parkingLots } = useApartmentManager();
  const pendingResidentRequests = residentSignupRequests.filter((request) => request.status === 'pending');
  const totalSpaces = parkingLots.reduce((sum, parkingLot) => sum + parkingLot.totalSpaces, 0);
  const usedSpaces = parkingLots.reduce((sum, parkingLot) => sum + parkingLot.usedSpaces, 0);
  const parkingUsageRate = totalSpaces > 0 ? Math.round((usedSpaces / totalSpaces) * 100) : 0;
  const recentResidentRequests = residentSignupRequests.slice(0, 4);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="아파트 관리자 대시보드"
        description="주민, 차량, 주차장, 문의 상태를 한 화면에서 확인합니다."
      />

      <div className="metric-grid">
        <MetricCard label="전체 주민 수" value={residents.length} helper={`${pendingResidentRequests.length}건 승인 대기`} />
        <MetricCard label="등록 차량 수" value={vehicles.length} helper="현재 등록된 차량" />
        <MetricCard label="주차 사용률" value={`${parkingUsageRate}%`} helper={`사용 ${usedSpaces}면 / 전체 ${totalSpaces}면`} />
      </div>

      <SectionCard title="최근 주민 가입 신청 목록" description="승인 대기 또는 처리 완료된 최근 주민 신청입니다.">
        <DataTable
          columns={recentResidentRequestColumns}
          rows={recentResidentRequests}
          emptyMessage="최근 주민 가입 신청이 없습니다."
        />
      </SectionCard>
    </AdminLayout>
  );
}
