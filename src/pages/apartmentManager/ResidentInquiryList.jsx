import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '문의 ID' },
  { key: 'title', header: '제목' },
  { key: 'writer', header: '작성자' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building}동 ${row.unit}호` },
  {
    key: 'status',
    header: '답변 상태',
    render: (row) => <Badge status={row.status}>{row.status === 'answered' ? '답변 완료' : '답변 대기'}</Badge>,
  },
  { key: 'createdAt', header: '작성일' },
  {
    key: 'action',
    header: '상세',
    render: (row) => (
      <Link to={`/apartment-manager/resident-inquiries/${row.id}`}>
        <Button variant="secondary" size="small">상세</Button>
      </Link>
    ),
  },
];

export default function ResidentInquiryList() {
  const {
    residentParkingInquiries,
    isResidentParkingInquiriesLoading,
    residentParkingInquiriesError,
    refreshResidentParkingInquiries,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useAutoRefresh(() => refreshResidentParkingInquiries({ silent: true }), 10000);

  const searchedInquiries = filterByKeyword(residentParkingInquiries, keyword, [
    'id',
    'title',
    'writer',
    'building',
    'unit',
  ]);
  const filteredInquiries =
    selectedStatus === 'all'
      ? searchedInquiries
      : searchedInquiries.filter((inquiry) => inquiry.status === selectedStatus);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredInquiries, 5, [
    keyword,
    selectedStatus,
  ]);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="입주민 문의 관리"
        description="입주민이 보낸 주차 관련 문의를 확인하고 답변합니다."
      />

      <SectionCard title="입주민 문의 목록">
        <div className="section-toolbar">
          <SearchBar
            placeholder="제목, 작성자, 동/호수 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
            <SelectBox
              aria-label="입주민 문의 답변 상태 분류"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="pending">답변 대기</option>
              <option value="answered">답변 완료</option>
            </SelectBox>
          </div>
        </div>

        {isResidentParkingInquiriesLoading ? (
          <LoadingState message="입주민 문의 목록을 불러오는 중" />
        ) : residentParkingInquiriesError ? (
          <>
            <EmptyState title="입주민 문의 조회 실패" description={residentParkingInquiriesError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshResidentParkingInquiries}>
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
              emptyMessage="조건에 맞는 입주민 문의가 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
