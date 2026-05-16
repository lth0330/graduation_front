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
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '주민 ID' },
  { key: 'name', header: '이름' },
  { key: 'loginId', header: '아이디' },
  { key: 'email', header: '이메일' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building}동 ${row.unit}호` },
  { key: 'vehicleCount', header: '차량 수', render: (row) => `${row.vehicleCount}대` },
  { key: 'status', header: '상태', render: () => <Badge status="approved">승인 완료</Badge> },
  {
    key: 'edit',
    header: '수정',
    render: (row) => (
      <Link to={`/apartment-manager/residents/${row.id}/edit`}>
        <Button variant="secondary" size="small">수정</Button>
      </Link>
    ),
  },
];

export default function ResidentManagement() {
  const { residents, isResidentsLoading, residentsError, refreshResidents } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const searchedResidents = filterByKeyword(residents, keyword, ['id', 'name', 'loginId', 'email', 'building', 'unit']);
  const filteredResidents = selectedStatus === 'all' || selectedStatus === 'approved' ? searchedResidents : [];
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredResidents, 5, [
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
        title="승인 주민 정보 관리"
        description="승인된 주민 정보를 조회, 수정, 삭제합니다."
      />

      <SectionCard title="승인된 주민 목록" description="수정 화면에서 주민 정보를 변경하거나 삭제할 수 있습니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="이름, 아이디, 이메일, 동/호수 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
            <SelectBox
              aria-label="주민 상태 분류"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="approved">승인 완료</option>
            </SelectBox>
          </div>
          <Link to="/apartment-manager/residents/new">
            <Button>주민 등록</Button>
          </Link>
        </div>
        {isResidentsLoading ? (
          <LoadingState message="주민 목록 불러오는 중" />
        ) : residentsError ? (
          <>
            <EmptyState title="주민 목록 조회 실패" description={residentsError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshResidents}>
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
              emptyMessage="조건에 맞는 주민이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
