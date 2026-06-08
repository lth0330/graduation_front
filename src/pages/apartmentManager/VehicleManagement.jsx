import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const columns = [
  { key: 'id', header: '차량 ID' },
  { key: 'carNumber', header: '차량번호' },
  { key: 'carType', header: '차종' },
  { key: 'ownerName', header: '소유자' },
  { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building}동 ${row.unit}호` },
  { key: 'registeredAt', header: '등록일' },
  {
    key: 'edit',
    header: '수정',
    render: (row) => (
      <Link to={`/apartment-manager/vehicles/${row.id}/edit`}>
        <Button variant="secondary" size="small">수정</Button>
      </Link>
    ),
  },
];

export default function VehicleManagement() {
  const { vehicles, isVehiclesLoading, vehiclesError, refreshVehicles } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');

  useAutoRefresh(() => refreshVehicles({ silent: true }), 15000);

  const filteredVehicles = filterByKeyword(vehicles, keyword, [
    'id',
    'carNumber',
    'carType',
    'ownerName',
    'building',
    'unit',
  ]);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredVehicles, 5, [
    keyword,
  ]);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주민 차량 정보 관리"
        description="차량번호, 차종, 소유자, 동/호수 기준으로 차량 정보를 관리합니다."
      />

      <SectionCard title="차량 목록" description="차량 정보를 조회하고 등록 또는 수정 화면으로 이동합니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="차량번호, 차종, 소유자, 동/호수 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <Link to="/apartment-manager/vehicles/new">
            <Button>차량 등록</Button>
          </Link>
        </div>
        {isVehiclesLoading ? (
          <LoadingState message="차량 목록 불러오는 중" />
        ) : vehiclesError ? (
          <>
            <EmptyState title="차량 목록 조회 실패" description={vehiclesError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshVehicles}>
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
              emptyMessage="조건에 맞는 차량이 없습니다."
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
