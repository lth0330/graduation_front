import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
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
    getVehicleDetail,
    residents,
    vehicles,
    isVehiclesLoading,
    vehiclesError,
    isResidentsLoading,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    isDuplicateCarNumber,
  } = useApartmentManager();
  const listVehicle = isEditMode ? findVehicleById(id) : null;
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [isVehicleDetailLoading, setIsVehicleDetailLoading] = useState(false);
  const [vehicleDetailError, setVehicleDetailError] = useState('');
  const vehicle = vehicleDetail || listVehicle;
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
  const [toastType, setToastType] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let ignore = false;

    const loadVehicleDetail = async () => {
      try {
        setIsVehicleDetailLoading(true);
        setVehicleDetailError('');
        const detail = await getVehicleDetail(id);
        if (!ignore) {
          setVehicleDetail(detail);
        }
      } catch (error) {
        if (!ignore) {
          setVehicleDetailError('차량 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setIsVehicleDetailLoading(false);
        }
      }
    };

    loadVehicleDetail();

    return () => {
      ignore = true;
    };
  }, [id, isEditMode]);

  if (isVehiclesLoading || isResidentsLoading || isVehicleDetailLoading) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title={isEditMode ? '차량 정보 수정' : '차량 등록'} description="차량 정보를 불러오고 있습니다." />
        <SectionCard title="차량 정보">
          <LoadingState message="차량 정보 불러오는 중" />
        </SectionCard>
      </AdminLayout>
    );
  }

  if (vehiclesError || vehicleDetailError) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="차량 등록 및 수정" description="차량 정보를 불러오지 못했습니다." />
        <SectionCard title="조회 실패">
          <EmptyState title="차량 정보 조회 실패" description={vehicleDetailError || vehiclesError} />
          <div className="detail-actions">
            <Link to="/apartment-manager/vehicles">
              <Button variant="secondary">목록으로</Button>
            </Link>
          </div>
        </SectionCard>
      </AdminLayout>
    );
  }

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

  if (!isEditMode && residents.length === 0) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="한빛아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="차량 등록" description="차량을 등록하려면 먼저 승인된 주민이 필요합니다." />
        <SectionCard title="등록 가능한 주민 없음">
          <EmptyState
            title="차량 소유자를 선택할 수 없습니다."
            description="주민 등록 또는 주민 가입 승인을 먼저 진행한 뒤 차량을 등록하세요."
          />
          <div className="detail-actions">
            <Link to="/apartment-manager/residents">
              <Button variant="secondary">주민 관리로 이동</Button>
            </Link>
            <Link to="/apartment-manager/vehicles">
              <Button>차량 목록으로</Button>
            </Link>
          </div>
        </SectionCard>
      </AdminLayout>
    );
  }

  const selectedResident = residents.find((resident) => resident.id === form.ownerId);
  const selectedHouseholdVehicles = selectedResident
    ? vehicles.filter((registeredVehicle) => (
      registeredVehicle.building === selectedResident.building
      && registeredVehicle.unit === selectedResident.unit
      && registeredVehicle.id !== vehicle?.id
    ))
    : [];
  const selectedHouseholdCarLimit = Number(selectedResident?.residentCarLimit ?? 1);

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
    ownerId: isEditMode ? undefined : selectedResident?.id,
    ownerName: selectedResident?.name,
    building: selectedResident?.building,
    unit: selectedResident?.unit,
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

    if (!isEditMode && !selectedResident) {
      nextErrors.ownerId = '소유자를 선택하세요.';
    }
    if (!isEditMode && selectedResident && selectedHouseholdVehicles.length >= selectedHouseholdCarLimit) {
      nextErrors.ownerId = `해당 세대는 입주민 차량을 최대 ${selectedHouseholdCarLimit}대까지 등록할 수 있습니다.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = buildVehiclePayload();

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        await updateVehicle(vehicle.id, payload);
        setVehicleDetail(await getVehicleDetail(vehicle.id));
        setToastType('success');
        setToastMessage('차량 정보가 저장되었습니다.');
        return;
      }

      const createdVehicle = await createVehicle(payload);
      setToastType('success');
      setToastMessage('차량이 등록되었습니다.');
      navigate(`/apartment-manager/vehicles/${createdVehicle.id}/edit`);
    } catch (error) {
      setToastType('error');
      if (error.response?.status === 409) {
        setToastMessage('이미 등록된 차량번호이거나 해당 세대에 차량이 등록되어 있습니다.');
      } else {
        setToastMessage('차량 정보 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteVehicle(vehicle.id);
      setIsDeleteModalOpen(false);
      navigate('/apartment-manager/vehicles');
    } catch (error) {
      setToastType('error');
      setToastMessage('차량 정보 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
        description={isEditMode ? '차량 소유자는 변경하지 않고 차량 정보만 수정합니다.' : '차량번호와 소유자 정보를 확인한 뒤 저장합니다.'}
      />

      <SectionCard
        title="차량 정보 입력"
        description={isEditMode ? '소유자가 잘못된 경우 차량을 삭제한 뒤 올바른 입주민에게 다시 등록합니다.' : '입주민 차량은 세대별 등록 가능 대수 안에서 등록할 수 있습니다.'}
      >
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
          {isEditMode ? (
            <FormField label="소유자">
              <TextInput value={selectedResident?.name || vehicle?.ownerName || '-'} readOnly />
            </FormField>
          ) : (
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
          )}
          <FormField label="동/호수">
            <TextInput
              value={
                selectedResident
                  ? `${selectedResident.building}동 ${selectedResident.unit}호`
                  : isEditMode && vehicle
                    ? `${vehicle.building}동 ${vehicle.unit}호`
                    : '소유자를 선택하세요'
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
            <Button variant="danger" disabled={isSubmitting} onClick={() => setIsDeleteModalOpen(true)}>
              삭제
            </Button>
          )}
          <Button disabled={isSubmitting} onClick={handleSave}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
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
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
