import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '신청 ID' },
  { key: 'loginId', header: '아이디' },
  { key: 'email', header: '이메일' },
  { key: 'apartmentName', header: '아파트 이름' },
  { key: 'status', header: '신청 상태', render: (row) => <Badge status={row.status} /> },
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

export default function SignupApprovalList() {
  const { signupRequests, isSignupRequestsLoading, signupRequestsError, refreshSignupRequests } = useWebAdmin();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const searchedRequests = filterByKeyword(signupRequests, keyword, ['id', 'loginId', 'email', 'apartmentName']);
  const filteredRequests =
    selectedStatus === 'all'
      ? searchedRequests
      : searchedRequests.filter((request) => request.status === selectedStatus);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredRequests, 5, [
    keyword,
    selectedStatus,
  ]);

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="웹 관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="가입 승인 관리"
        description="아파트 관리자 회원가입 신청을 검색하고 승인 상태를 확인합니다."
      />

      <SectionCard title="신청 목록 테이블" description="신청 정보를 확인하고 상세 화면에서 승인 또는 거절을 처리합니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="아이디, 이메일, 아파트 이름 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
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
          </div>
        </div>
        {isSignupRequestsLoading ? (
          <LoadingState message="가입 신청 목록 불러오는 중" />
        ) : signupRequestsError ? (
          <EmptyState title="목록 조회 실패" description={signupRequestsError} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pagedRows}
              startIndex={startIndex}
              emptyMessage="조건에 맞는 가입 신청이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
        {signupRequestsError && (
          <div className="detail-actions">
            <Button variant="secondary" onClick={refreshSignupRequests}>
              다시 불러오기
            </Button>
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
