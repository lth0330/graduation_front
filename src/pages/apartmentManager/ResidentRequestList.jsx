import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
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
  const { residentSignupRequests } = useApartmentManager();
  const [keyword, setKeyword] = useState('');
  const filteredRequests = filterByKeyword(residentSignupRequests, keyword, [
    'id',
    'name',
    'loginId',
    'building',
    'unit',
    'carNumber',
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

      <SectionCard title="주민 가입 신청 목록" description="상세 승인 처리는 다음 단계에서 추가합니다.">
        <SearchBar placeholder="이름, 아이디, 동/호수, 차량번호 검색" value={keyword} onChange={setKeyword} />
        <DataTable columns={columns} rows={filteredRequests} emptyMessage="조건에 맞는 주민 신청이 없습니다." />
        <Pagination currentPage={1} totalPages={3} />
      </SectionCard>
    </AdminLayout>
  );
}
