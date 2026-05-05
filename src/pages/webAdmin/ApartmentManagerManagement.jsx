import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { webAdminMenus } from '../../data/navigation.js';
import { apartmentManagers } from '../../data/webAdminData.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '관리자 ID' },
  { key: 'loginId', header: '아이디' },
  { key: 'email', header: '이메일' },
  { key: 'apartmentName', header: '아파트 이름' },
  { key: 'status', header: '상태', render: (row) => <Badge status={row.status} /> },
  { key: 'approvedAt', header: '가입 승인일' },
  { key: 'edit', header: '수정', render: () => <Button variant="secondary" size="small">수정</Button> },
  { key: 'delete', header: '삭제', render: () => <Button variant="danger" size="small">삭제</Button> },
];

export default function ApartmentManagerManagement() {
  const [keyword, setKeyword] = useState('');
  const filteredManagers = filterByKeyword(apartmentManagers, keyword, ['id', 'loginId', 'email', 'apartmentName']);

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="최고관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="아파트 관리자 관리"
        description="승인 완료된 아파트 관리자 정보를 조회하고 관리합니다."
      />

      <SectionCard title="아파트 관리자 목록" description="행 클릭 상세, 수정, 삭제 기능은 다음 단계에서 확장합니다.">
        <SearchBar placeholder="아이디, 이메일, 아파트 이름 검색" value={keyword} onChange={setKeyword} />
        <DataTable columns={columns} rows={filteredManagers} emptyMessage="조건에 맞는 관리자가 없습니다." />
        <Pagination currentPage={1} totalPages={2} />
      </SectionCard>
    </AdminLayout>
  );
}
