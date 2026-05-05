import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import Toast from '../../components/feedback/Toast.jsx';
import FormField from '../../components/forms/FormField.jsx';
import SelectBox from '../../components/forms/SelectBox.jsx';
import TextArea from '../../components/forms/TextArea.jsx';
import TextInput from '../../components/forms/TextInput.jsx';
import PageTitle from '../../components/common/PageTitle.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useApartmentManager } from '../../contexts/ApartmentManagerContext.jsx';
import { apartmentManagerMenus } from '../../data/navigation.js';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const {
    findVehicleById,
    residents,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    isDuplicateCarNumber,
  } = useApartmentManager();
  const vehicle = isEditMode ? findVehicleById(id) : null;
  const firstResident = residents[0];
  const initialForm = useMemo(
    () => ({
      carNumber: vehicle?.carNumber || '',
      carType: vehicle?.carType || '',
      ownerId: vehicle?.ownerId || firstResident?.id || '',
      note: vehicle?.note || '',
    }),
    [vehicle, firstResident],
  );
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isEditMode && !vehicle) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="차량 등록 및 수정" description="요청한 차량 정보를 찾을 수 없습니다." />
        <SectionCard title="데이터 없음">
          <Link className="text-link" to="/apartment-manager/vehicles">
            목록으로 돌아가기
          </Link>
        </SectionCard>
      </AdminLayout>
    );
  }

  const selectedResident = residents.find((resident) => resident.id === form.ownerId);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: '',
      }));
    }
  };

  const buildVehiclePayload = () => ({
    carNumber: form.carNumber.trim(),
    carType: form.carType.trim(),
    ownerId: selectedResident.id,
    ownerName: selectedResident.name,
    building: selectedResident.building,
    unit: selectedResident.unit,
    note: form.note.trim(),
  });

  const validateForm = () => {
    const nextErrors = {};

    if (!form.carNumber.trim()) {
      nextErrors.carNumber = '차량번호를 입력하세요.';
    } else if (isDuplicateCarNumber(form.carNumber.trim(), vehicle?.id)) {
      nextErrors.carNumber = '이미 등록된 차량번호입니다.';
    }

    if (!form.carType.trim()) {
      nextErrors.carType = '차종을 입력하세요.';
    }

    if (!selectedResident) {
      nextErrors.ownerId = '소유자를 선택하세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const payload = buildVehiclePayload();

    if (isEditMode) {
      updateVehicle(vehicle.id, payload);
      setToastMessage('차량 정보가 저장되었습니다.');
      return;
    }

    const createdVehicle = createVehicle(payload);
    setToastMessage('차량이 등록되었습니다.');
    navigate(`/apartment-manager/vehicles/${createdVehicle.id}/edit`);
  };

  const handleDelete = () => {
    deleteVehicle(vehicle.id);
    setIsDeleteModalOpen(false);
    navigate('/apartment-manager/vehicles');
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="한빛아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title={isEditMode ? '차량 정보 수정' : '차량 등록'}
        description="차량번호와 소유자 정보를 확인한 뒤 저장합니다."
      />

      <SectionCard title="차량 정보 입력" description="차량번호 중복 여부는 저장 시 검증합니다.">
        <div className="form-grid">
          <FormField label="차량번호">
            <TextInput
              error={Boolean(errors.carNumber)}
              placeholder="예: 12가 3456"
              value={form.carNumber}
              onChange={(event) => handleChange('carNumber', event.target.value)}
            />
            {errors.carNumber && <small className="form-error">{errors.carNumber}</small>}
          </FormField>
          <FormField label="차종">
            <TextInput
              error={Boolean(errors.carType)}
              placeholder="예: SUV, 세단, 전기차"
              value={form.carType}
              onChange={(event) => handleChange('carType', event.target.value)}
            />
            {errors.carType && <small className="form-error">{errors.carType}</small>}
          </FormField>
          <FormField label="소유자" error={errors.ownerId}>
            <SelectBox
              error={Boolean(errors.ownerId)}
              value={form.ownerId}
              onChange={(event) => handleChange('ownerId', event.target.value)}
            >
              {residents.map((resident) => (
                <option value={resident.id} key={resident.id}>
                  {resident.name} · {resident.building}동 {resident.unit}호
                </option>
              ))}
            </SelectBox>
          </FormField>
          <FormField label="동/호수">
            <TextInput
              value={
                selectedResident ? `${selectedResident.building}동 ${selectedResident.unit}호` : '소유자를 선택하세요'
              }
              readOnly
            />
          </FormField>
        </div>

        <div className="answer-form">
          <FormField label="비고">
            <TextArea
              placeholder="차량 관련 참고사항을 입력하세요."
              value={form.note}
              onChange={(event) => handleChange('note', event.target.value)}
            />
          </FormField>
        </div>

        <div className="detail-actions">
          <Link to="/apartment-manager/vehicles">
            <Button variant="secondary">취소</Button>
          </Link>
          {isEditMode && (
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
              삭제
            </Button>
          )}
          <Button onClick={handleSave}>저장</Button>
        </div>
      </SectionCard>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="정말 삭제하시겠습니까?"
        description="삭제된 차량 정보는 복구할 수 없습니다."
        confirmLabel="삭제"
        danger
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
