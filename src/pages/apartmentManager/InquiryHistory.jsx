import { useState } from 'react';
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
  { key: 'category', header: '카테고리' },
  {
    key: 'status',
    header: '답변 상태',
    render: (row) => <Badge status={row.status}>{row.status === 'answered' ? '답변 완료' : '답변 대기'}</Badge>,
  },
  { key: 'createdAt', header: '작성일' },
];

export default function InquiryHistory() {
  const {
    managerInquiries,
    isManagerInquiriesLoading,
    managerInquiriesError,
    refreshManagerInquiries,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useAutoRefresh(() => refreshManagerInquiries({ silent: true }), 15000);

  const searchedInquiries = filterByKeyword(managerInquiries, keyword, ['id', 'title', 'category']);
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
      <PageTitle title="문의 내역 확인" description="웹 관리자에게 등록한 문의와 답변 상태를 확인합니다." />

      <SectionCard title="문의 목록">
        <div className="section-toolbar">
          <SearchBar
            placeholder="문의 제목, 카테고리 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
            <SelectBox
              aria-label="문의 답변 상태 분류"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="pending">답변 대기</option>
              <option value="answered">답변 완료</option>
            </SelectBox>
          </div>
        </div>
        {isManagerInquiriesLoading ? (
          <LoadingState message="문의 내역을 불러오는 중" />
        ) : managerInquiriesError ? (
          <>
            <EmptyState title="문의 내역 조회 실패" description={managerInquiriesError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshManagerInquiries}>
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
              emptyMessage="조건에 맞는 문의 내역이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
