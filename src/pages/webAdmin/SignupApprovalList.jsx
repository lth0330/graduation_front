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
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '신청 ID' },
  { key: 'loginId', header: '아이디' },
  { key: 'email', header: '이메일' },
  { key: 'apartmentName', header: '아파트 이름' },
  { key: 'status', header: '신청 상태', render: (row) => <Badge status={row.status} /> },
  { key: 'requestedAt', header: '신청일' },
  {
    key: 'action',
    header: '상세',
    render: (row) => (
      <Link to={`/web-admin/signup-approvals/${row.id}`}>
        <Button variant="secondary" size="small">상세</Button>
      </Link>
    ),
  },
];

export default function SignupApprovalList() {
  const { signupRequests } = useWebAdmin();
  const [keyword, setKeyword] = useState('');
  const filteredRequests = filterByKeyword(signupRequests, keyword, ['id', 'loginId', 'email', 'apartmentName']);

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="최고관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="가입 승인 관리"
        description="아파트 관리자 회원가입 신청을 검색하고 승인 상태를 확인합니다."
      />

      <SectionCard title="신청 목록 테이블" description="상세/승인/거절 기능은 다음 단계에서 연결합니다.">
        <SearchBar placeholder="아이디, 이메일, 아파트 이름 검색" value={keyword} onChange={setKeyword} />
        <DataTable columns={columns} rows={filteredRequests} emptyMessage="조건에 맞는 가입 신청이 없습니다." />
        <Pagination currentPage={1} totalPages={3} />
      </SectionCard>
    </AdminLayout>
  );
}
