import { useEffect, useState } from 'react';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import SearchBar from '../../components/forms/SearchBar.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Pagination from '../../components/tables/Pagination.jsx';
import { deleteApartmentManager, getApartmentManagers, updateApartmentManager } from '../../api/webAdminApi.js';
import { webAdminMenus } from '../../data/navigation.js';
import { usePagination } from '../../utils/pagination.js';
import { filterByKeyword } from '../../utils/search.js';

const statusMap = {
  PENDING: 'pending',
  APPROVED: 'active',
  REJECTED: 'inactive',
};

function formatDate(value) {
  if (!value) {
    return '';
  }

  return String(value).slice(0, 10);
}

function mapApartmentManager(apiManager) {
  return {
    id: String(apiManager.managerNo),
    managerNo: apiManager.managerNo,
    loginId: apiManager.loginId,
    email: apiManager.email,
    phone: apiManager.phone || '',
    name: apiManager.name || '',
    address: apiManager.address || '',
    apartmentName: apiManager.apartmentName || '-',
    status: statusMap[apiManager.approvalStatus] || 'inactive',
    approvedAt: formatDate(apiManager.approvedAt),
  };
}

export default function ApartmentManagerManagement() {
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [apartmentManagers, setApartmentManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ loginId: '', email: '', phone: '', name: '', address: '' });
  const [editErrors, setEditErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadApartmentManagers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const managers = await getApartmentManagers();
      setApartmentManagers(managers.map(mapApartmentManager));
    } catch (error) {
      setErrorMessage('아파트 관리자 목록을 불러오지 못했습니다. 백엔드 서버와 로그인 권한을 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApartmentManagers();
  }, []);

  const searchedManagers = filterByKeyword(apartmentManagers, keyword, [
    'id',
    'loginId',
    'email',
    'apartmentName',
  ]);
  const filteredManagers =
    selectedStatus === 'all'
      ? searchedManagers
      : searchedManagers.filter((manager) => manager.status === selectedStatus);
  const { currentPage, setCurrentPage, totalPages, pagedRows, startIndex } = usePagination(filteredManagers, 5, [
    keyword,
    selectedStatus,
  ]);
  const columns = [
    { key: 'id', header: '관리자 ID' },
    { key: 'loginId', header: '아이디' },
    { key: 'email', header: '이메일' },
    { key: 'apartmentName', header: '아파트 이름' },
    { key: 'status', header: '상태', render: (row) => <Badge status={row.status} /> },
    { key: 'approvedAt', header: '승인일' },
    {
      key: 'edit',
      header: '수정',
      render: (row) => (
        <Button variant="secondary" size="small" onClick={() => openEditModal(row)}>
          수정
        </Button>
      ),
    },
    {
      key: 'delete',
      header: '삭제',
      render: (row) => (
        <Button variant="danger" size="small" onClick={() => setDeleteTarget(row)}>
          삭제
        </Button>
      ),
    },
  ];

  const openEditModal = (manager) => {
    setEditTarget(manager);
    setEditForm({
      loginId: manager.loginId || '',
      email: manager.email || '',
      phone: manager.phone || '',
      name: manager.name || '',
      address: manager.address || '',
    });
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditTarget(null);
    setEditForm({ loginId: '', email: '', phone: '', name: '', address: '' });
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setEditErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
  };

  const validateEditForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!editForm.loginId.trim()) nextErrors.loginId = '아이디를 입력하세요.';
    if (!emailPattern.test(editForm.email)) nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    if (!editForm.name.trim()) nextErrors.name = '관리자명을 입력하세요.';

    setEditErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!editTarget || !validateEditForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateApartmentManager(editTarget.managerNo, {
        loginId: editForm.loginId.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        name: editForm.name.trim(),
        address: editForm.address.trim(),
      });
      closeEditModal();
      await loadApartmentManagers();
      setToastType('success');
      setToastMessage('아파트 관리자 정보가 수정되었습니다.');
    } catch (error) {
      setToastType('error');
      if (error.response?.status === 409) {
        setToastMessage('이미 사용 중인 아이디 또는 이메일입니다.');
      } else {
        setToastMessage('아파트 관리자 정보 수정에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteApartmentManager(deleteTarget.managerNo);
      setDeleteTarget(null);
      await loadApartmentManagers();
      setToastType('success');
      setToastMessage('아파트 관리자가 삭제되었습니다.');
    } catch (error) {
      setToastType('error');
      setToastMessage('아파트 관리자 삭제에 실패했습니다. 연결된 데이터가 있는지 확인하세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <SectionCard title="아파트 관리자 목록" description="승인 상태와 아파트 정보를 기준으로 관리자를 조회합니다.">
        <div className="section-toolbar">
          <SearchBar
            placeholder="아이디, 이메일, 아파트 이름 검색"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={() => setKeyword(searchInput)}
          />
          <div className="status-filter">
            <SelectBox
              aria-label="아파트 관리자 상태 분류"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </SelectBox>
          </div>
        </div>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <DataTable
          columns={columns}
          rows={pagedRows}
          startIndex={startIndex}
          emptyMessage="조건에 맞는 관리자가 없습니다."
          loading={isLoading}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </SectionCard>

      {editTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="apartment-manager-edit-title">
            <h2 id="apartment-manager-edit-title">아파트 관리자 수정</h2>
            <p>{editTarget.apartmentName} 관리자의 계정 정보를 수정합니다.</p>

            <div className="form-grid">
              <FormField label="아이디" error={editErrors.loginId}>
                <TextInput
                  error={Boolean(editErrors.loginId)}
                  value={editForm.loginId}
                  onChange={(event) => handleEditChange('loginId', event.target.value)}
                />
              </FormField>
              <FormField label="이메일" error={editErrors.email}>
                <TextInput
                  error={Boolean(editErrors.email)}
                  value={editForm.email}
                  onChange={(event) => handleEditChange('email', event.target.value)}
                />
              </FormField>
              <FormField label="연락처">
                <TextInput value={editForm.phone} onChange={(event) => handleEditChange('phone', event.target.value)} />
              </FormField>
              <FormField label="관리자명" error={editErrors.name}>
                <TextInput
                  error={Boolean(editErrors.name)}
                  value={editForm.name}
                  onChange={(event) => handleEditChange('name', event.target.value)}
                />
              </FormField>
              <FormField label="주소">
                <TextInput value={editForm.address} onChange={(event) => handleEditChange('address', event.target.value)} />
              </FormField>
            </div>

            <div className="modal-actions">
              <Button variant="secondary" disabled={isSubmitting} onClick={closeEditModal}>
                취소
              </Button>
              <Button disabled={isSubmitting} onClick={handleUpdate}>
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="아파트 관리자를 삭제하시겠습니까?"
        description={`${deleteTarget?.loginId || ''} 계정은 삭제 후 복구할 수 없습니다.`}
        confirmLabel="삭제"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
