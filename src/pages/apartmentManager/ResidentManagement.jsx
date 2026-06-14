import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';
import useAutoRefresh from '../../hooks/useAutoRefresh.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

function buildDefaultContactForm(resident) {
  return {
    title: '관리자 연락 요청',
    message: `${resident.building}동 ${resident.unit}호 ${resident.name}님, 관리자가 확인이 필요한 사항이 있습니다. 앱 알림 확인 후 관리사무소로 연락해주세요.`,
  };
}

export default function ResidentManagement() {
  const {
    residents,
    isResidentsLoading,
    residentsError,
    refreshResidents,
    sendResidentNotification,
  } = useApartmentManager();
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [contactTarget, setContactTarget] = useState(null);
  const [contactForm, setContactForm] = useState({ title: '', message: '' });
  const [contactError, setContactError] = useState('');
  const [isContactSending, setIsContactSending] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useAutoRefresh(() => refreshResidents({ silent: true }), 15000);

  const searchedResidents = filterByKeyword(residents, keyword, ['id', 'name', 'loginId', 'email', 'building', 'unit']);
  const filteredResidents = selectedStatus === 'all' || selectedStatus === 'approved' ? searchedResidents : [];
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredResidents, 5, [
    keyword,
    selectedStatus,
  ]);

  const openContactModal = (resident) => {
    setContactTarget(resident);
    setContactForm(buildDefaultContactForm(resident));
    setContactError('');
  };

  const closeContactModal = () => {
    if (isContactSending) {
      return;
    }

    setContactTarget(null);
    setContactError('');
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const submitContactNotification = async (event) => {
    event.preventDefault();

    const title = contactForm.title.trim();
    const message = contactForm.message.trim();
    if (!title || !message) {
      setContactError('제목과 내용을 모두 입력하세요.');
      return;
    }

    try {
      setIsContactSending(true);
      setContactError('');
      await sendResidentNotification(contactTarget.residentNo, {
        title,
        message,
        type: 'manager_contact',
      });
      setToastType('success');
      setToastMessage(`${contactTarget.name} 주민에게 알림을 보냈습니다.`);
      setContactTarget(null);
    } catch (error) {
      setToastType('error');
      setToastMessage('주민 알림 발송에 실패했습니다. 백엔드 서버 상태를 확인하세요.');
    } finally {
      setIsContactSending(false);
    }
  };

  const columns = [
    { key: 'id', header: '주민 ID' },
    { key: 'name', header: '이름' },
    { key: 'loginId', header: '아이디' },
    { key: 'email', header: '이메일' },
    { key: 'phone', header: '연락처', render: (row) => row.phone || '-' },
    { key: 'unitInfo', header: '동/호수', render: (row) => `${row.building}동 ${row.unit}호` },
    { key: 'vehicleCount', header: '세대 차량 수', render: (row) => `${row.vehicleCount}대` },
    { key: 'residentCarLimit', header: '세대 차량 제한', render: (row) => `${row.residentCarLimit}대` },
    { key: 'visitorCarLimit', header: '방문차량 제한', render: (row) => `${row.visitorCarLimit}대` },
    { key: 'status', header: '상태', render: () => <Badge status="approved">승인 완료</Badge> },
    {
      key: 'actions',
      header: '관리',
      render: (row) => (
        <div className="table-action-group">
          <Button variant="secondary" size="small" onClick={() => openContactModal(row)}>
            알림
          </Button>
          <Link to={`/apartment-manager/residents/${row.id}/edit`}>
            <Button variant="secondary" size="small">수정</Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
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

      {contactTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="resident-contact-title">
            <h2 id="resident-contact-title">주민 알림 보내기</h2>
            <p>
              {contactTarget.building}동 {contactTarget.unit}호 {contactTarget.name} 주민에게 앱 알림을 보냅니다.
            </p>

            <form className="answer-form" onSubmit={submitContactNotification}>
              <FormField label="연락처" helper="전화 연락이 필요한 경우 이 번호를 사용하세요.">
                <TextInput value={contactTarget.phone || '등록된 연락처 없음'} readOnly />
              </FormField>
              <FormField label="제목">
                <TextInput
                  value={contactForm.title}
                  maxLength={100}
                  disabled={isContactSending}
                  onChange={(event) => handleContactFormChange('title', event.target.value)}
                />
              </FormField>
              <FormField label="내용" error={contactError}>
                <TextArea
                  rows={5}
                  value={contactForm.message}
                  maxLength={500}
                  disabled={isContactSending}
                  onChange={(event) => handleContactFormChange('message', event.target.value)}
                />
              </FormField>
              <div className="modal-actions">
                <Button variant="secondary" disabled={isContactSending} onClick={closeContactModal}>
                  취소
                </Button>
                <Button type="submit" disabled={isContactSending}>
                  {isContactSending ? '발송 중' : '알림 보내기'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
