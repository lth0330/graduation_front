import { useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '문의 ID' },
  { key: 'title', header: '제목' },
  { key: 'category', header: '카테고리' },
  { key: 'status', header: '답변 상태', render: (row) => <Badge status={row.status} /> },
  { key: 'createdAt', header: '작성일' },
];

export default function InquiryHistory() {
  const { managerInquiries } = useApartmentManager();
  const [keyword, setKeyword] = useState('');
  const filteredInquiries = filterByKeyword(managerInquiries, keyword, ['id', 'title', 'category']);

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle title="문의 내역 확인" description="웹 관리자에게 등록한 문의와 답변 상태를 확인합니다." />

      <SectionCard title="문의 목록">
        <SearchBar placeholder="문의 제목, 카테고리 검색" value={keyword} onChange={setKeyword} />
        <DataTable columns={columns} rows={filteredInquiries} emptyMessage="조건에 맞는 문의 내역이 없습니다." />
        <Pagination currentPage={1} totalPages={2} />
      </SectionCard>
    </AdminLayout>
  );
}
