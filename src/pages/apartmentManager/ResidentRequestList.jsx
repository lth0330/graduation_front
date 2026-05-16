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
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '신청 ID' },
  { key: 'name', header: '이름' },
  { key: 'loginId', header: '아이디' },
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

export default function ResidentRequestList() {
  const {
    residentSignupRequests,
    isResidentRequestsLoading,
    residentRequestsError,
    refreshResidentSignupRequests,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const searchedRequests = filterByKeyword(residentSignupRequests, keyword, [
    'id',
    'name',
    'loginId',
    'building',
    'unit',
    'carNumber',
  ]);
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
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주민 회원가입 신청 관리"
        description="이름, 아이디, 동/호수, 차량번호로 신청 내역을 확인합니다."
      />

      <SectionCard title="주민 가입 신청 목록" description="신청 상세 정보를 확인하고 주민 가입 승인 또는 거절을 처리합니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="이름, 아이디, 동/호수, 차량번호 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
            <SelectBox
              aria-label="주민 가입 신청 상태 분류"
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
        {isResidentRequestsLoading ? (
          <LoadingState message="주민 가입 신청 목록 불러오는 중" />
        ) : residentRequestsError ? (
          <>
            <EmptyState title="주민 신청 조회 실패" description={residentRequestsError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshResidentSignupRequests}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pagedRows}
              startIndex={startIndex}
              emptyMessage="조건에 맞는 주민 신청이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
