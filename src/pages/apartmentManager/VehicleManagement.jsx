import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
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
  const { vehicles } = useApartmentManager();
  const [keyword, setKeyword] = useState('');
  const filteredVehicles = filterByKeyword(vehicles, keyword, [
    'id',
    'carNumber',
    'carType',
    'ownerName',
    'building',
    'unit',
  ]);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주민 차량 정보 관리"
        description="차량번호, 차종, 소유자, 동/호수 기준으로 차량 정보를 관리합니다."
      />

      <SectionCard title="차량 목록" description="등록/수정/삭제 버튼은 다음 단계에서 구현합니다.">
        <div className="section-toolbar">
          <SearchBar placeholder="차량번호, 차종, 소유자, 동/호수 검색" value={keyword} onChange={setKeyword} />
          <Link to="/apartment-manager/vehicles/new">
            <Button>차량 등록</Button>
          </Link>
        </div>
        <DataTable columns={columns} rows={filteredVehicles} emptyMessage="조건에 맞는 차량이 없습니다." />
        <Pagination currentPage={1} totalPages={4} />
      </SectionCard>
    </AdminLayout>
  );
}
