import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

export default function ResidentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findResidentById, updateResident, deleteResident } = useApartmentManager();
  const resident = findResidentById(id);
  const initialForm = useMemo(
    () => ({
      name: resident?.name || '',
      email: resident?.email || '',
      building: resident?.building || '',
      unit: resident?.unit || '',
      phone: resident?.phone || '',
    }),
    [resident],
  );
  const [form, setForm] = useState(initialForm);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!resident) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 정보 수정" description="요청한 주민 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/apartment-manager/residents">
            목록으로 돌아가기
          </Link>
        </SectionCard>
      </AdminLayout>
    );
  }

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = () => {
    updateResident(resident.id, form);
    setToastMessage('주민 정보가 저장되었습니다.');
  };

  const handleDelete = () => {
    deleteResident(resident.id);
    setIsDeleteModalOpen(false);
    navigate('/apartment-manager/residents');
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title="주민 정보 상세 및 수정"
        description="승인된 주민 정보를 확인하고 필요한 항목을 수정합니다."
      />

      <SectionCard title="주민 정보 수정" description="아이디와 가입일은 표시용이며, 나머지 정보는 수정 가능합니다.">
        <dl className="detail-list">
          <div>
            <dt>주민 ID</dt>
            <dd>{resident.id}</dd>
          </div>
          <div>
            <dt>아이디</dt>
            <dd>{resident.loginId}</dd>
          </div>
          <div>
            <dt>가입일</dt>
            <dd>{resident.joinedAt}</dd>
          </div>
          <div>
            <dt>등록 차량 수</dt>
            <dd>{resident.vehicleCount}대</dd>
          </div>
        </dl>

        <div className="form-grid">
          <FormField label="이름">
            <TextInput value={form.name} onChange={(event) => handleChange('name', event.target.value)} />
          </FormField>
          <FormField label="이메일">
            <TextInput value={form.email} onChange={(event) => handleChange('email', event.target.value)} />
          </FormField>
          <FormField label="동">
            <TextInput value={form.building} onChange={(event) => handleChange('building', event.target.value)} />
          </FormField>
          <FormField label="호수">
            <TextInput value={form.unit} onChange={(event) => handleChange('unit', event.target.value)} />
          </FormField>
          <FormField label="연락처">
            <TextInput value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} />
          </FormField>
        </div>

        <div className="detail-actions">
          <Link to="/apartment-manager/residents">
            <Button variant="secondary">목록으로</Button>
          </Link>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            삭제
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </SectionCard>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="정말 삭제하시겠습니까?"
        description="삭제된 주민 정보는 복구할 수 없습니다."
        confirmLabel="삭제"
        danger
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
