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
import { getWebAdminDashboardSummary } from '../../api/dashboardApi.js';
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';

const recentSignupColumns = [
  { key: 'id', header: '신청 ID' },
  { key: 'apartmentName', header: '아파트명' },
  { key: 'applicantName', header: '신청자' },
  { key: 'status', header: '상태', render: (row) => <Badge status={row.status} /> },
  { key: 'requestedAt', header: '신청일' },
  {
    key: 'action',
    header: '상세',
    render: (row) => (
      <Link to={`/web-admin/signup-approvals/${row.id}`}>
        <Button variant="secondary" size="small">상세</Button>
      </Link>
    ),
  },
];

const initialSummary = {
  pendingSignupCount: 0,
  approvedManagerCount: 0,
  pendingInquiryCount: 0,
};

export default function WebAdminDashboard() {
  const { signupRequests } = useWebAdmin();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [summary, setSummary] = useState(initialSummary);
  const [summaryError, setSummaryError] = useState('');
  const filteredSignupRequests =
    selectedStatus === 'all'
      ? signupRequests
      : signupRequests.filter((request) => request.status === selectedStatus);
  const recentSignupRequests = filteredSignupRequests.slice(0, 4);

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummaryError('');
        const dashboardSummary = await getWebAdminDashboardSummary();
        setSummary(dashboardSummary);
      } catch (error) {
        setSummaryError('대시보드 통계를 불러오지 못했습니다.');
      }
    }

    loadSummary();
  }, []);

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="웹 관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="웹 관리자 대시보드"
        description="아파트 관리자 가입 승인과 문의 처리 상태를 한 화면에서 확인합니다."
      />

      {summaryError && <div className="error-box">{summaryError}</div>}
      <div className="metric-grid">
        <MetricCard label="승인 대기 가입 신청" value={summary.pendingSignupCount} helper="처리가 필요한 신청" />
        <MetricCard label="승인 완료 관리자" value={summary.approvedManagerCount} helper="현재 활성 관리자" />
        <MetricCard label="답변 대기 문의" value={summary.pendingInquiryCount} helper="빠른 답변 필요" />
      </div>

      <SectionCard
        title="최근 관리자 가입 신청 목록"
        description="최근 접수된 아파트 관리자 가입 신청입니다."
        headerAction={
          <SelectBox
            aria-label="가입 신청 상태 분류"
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
        <DataTable columns={recentSignupColumns} rows={recentSignupRequests} emptyMessage="최근 가입 신청이 없습니다." />
      </SectionCard>
    </AdminLayout>
  );
}
