import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const visitorCarStatusLabel = {
  waiting: '입차 대기',
  parked: '주차 중',
};

const visitorCarStatusBadge = {
  waiting: 'pending',
  parked: 'active',
};

const columns = [
  { key: 'id', header: '방문 차량 ID' },
  { key: 'carNumber', header: '차량번호' },
  { key: 'ownerName', header: '신청 입주민' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building || '-'}동 ${row.unit || '-'}호` },
  { key: 'registeredAt', header: '등록일' },
  { key: 'parkedAt', header: '입차일', render: (row) => row.parkedAt || '입차 전' },
  { key: 'expiresAt', header: '만료일', render: (row) => row.expiresAt || '-' },
  {
    key: 'status',
    header: '상태',
    render: (row) => (
      <Badge status={visitorCarStatusBadge[row.status]}>{visitorCarStatusLabel[row.status]}</Badge>
    ),
  },
];

export default function VisitorCarManagement() {
  const {
    visitorCars,
    isVisitorCarsLoading,
    visitorCarsError,
    refreshVisitorCars,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');

  useAutoRefresh(() => refreshVisitorCars({ silent: true }), 10000);

  const filteredVisitorCars = filterByKeyword(visitorCars, keyword, [
    'id',
    'carNumber',
    'ownerName',
    'building',
    'unit',
    'status',
  ]);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(
    filteredVisitorCars,
    5,
    [keyword],
  );

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="서초 아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="방문 차량 관리"
        description="입주민이 앱에서 등록한 방문 차량과 입차/만료 상태를 확인합니다."
      />

      <SectionCard title="방문 차량 목록" description="방문 차량은 앱에서 입주민이 등록하며, 실제 입차 후 24시간 만료 시간이 기록됩니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="차량번호, 신청 입주민, 동/호수 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <Button variant="secondary" onClick={refreshVisitorCars}>
            새로고침
          </Button>
        </div>

        {isVisitorCarsLoading ? (
          <LoadingState message="방문 차량 목록을 불러오는 중" />
        ) : visitorCarsError ? (
          <>
            <EmptyState title="방문 차량 목록 조회 실패" description={visitorCarsError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshVisitorCars}>
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
              emptyMessage="조건에 맞는 방문 차량이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
