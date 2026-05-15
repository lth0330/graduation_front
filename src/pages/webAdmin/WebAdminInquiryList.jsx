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
import { useWebAdmin } from '../../contexts/WebAdminContext.jsx';
import { webAdminMenus } from '../../data/navigation.js';
import { filterByKeyword } from '../../utils/search.js';

const columns = [
  { key: 'id', header: '문의 ID' },
  { key: 'title', header: '제목' },
  { key: 'writer', header: '작성자' },
  { key: 'apartmentName', header: '아파트 이름' },
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
      <Link to={`/web-admin/inquiries/${row.id}`}>
        <Button variant="secondary" size="small">상세</Button>
      </Link>
    ),
  },
];

export default function WebAdminInquiryList() {
  const {
    webAdminInquiries,
    isWebAdminInquiriesLoading,
    webAdminInquiriesError,
    refreshWebAdminInquiries,
  } = useWebAdmin();
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const searchedInquiries = filterByKeyword(webAdminInquiries, keyword, ['id', 'title', 'writer', 'apartmentName']);
  const filteredInquiries =
    selectedStatus === 'all'
      ? searchedInquiries
      : searchedInquiries.filter((inquiry) => inquiry.status === selectedStatus);

  return (
    <AdminLayout
      roleLabel="웹 관리자"
      consoleTitle="웹 관리자 콘솔"
      userName="최고관리자"
      menus={webAdminMenus}
    >
      <PageTitle
        title="문의 답변 관리"
        description="아파트 관리자의 서비스 신청, 문제 발생, 가격 문의를 확인하고 답변합니다."
      />

      <SectionCard title="문의 목록 테이블" description="답변 상세 화면에서 문의 내용을 확인하고 답변을 등록합니다.">
        <div className="section-toolbar">
          <SearchBar placeholder="제목, 작성자, 아파트 이름 검색" value={keyword} onChange={setKeyword} />
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
        {isWebAdminInquiriesLoading ? (
          <LoadingState message="문의 목록 불러오는 중" />
        ) : webAdminInquiriesError ? (
          <>
            <EmptyState title="문의 목록 조회 실패" description={webAdminInquiriesError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshWebAdminInquiries}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : (
          <>
            <DataTable columns={columns} rows={filteredInquiries} emptyMessage="조건에 맞는 문의가 없습니다." />
            <Pagination currentPage={1} totalPages={1} />
          </>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
