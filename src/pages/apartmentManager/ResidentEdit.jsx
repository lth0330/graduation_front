import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ConfirmModal from '../../components/feedback/ConfirmModal.jsx';
import EmptyState from '../../components/feedback/EmptyState.jsx';
import LoadingState from '../../components/feedback/LoadingState.jsx';
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
  const {
    apartmentManagerProfile,
    findResidentById,
    getResidentDetail,
    isResidentsLoading,
    residentsError,
    createResident,
    updateResident,
    deleteResident,
  } = useApartmentManager();
  const isCreateMode = !id;
  const listResident = findResidentById(id);
  const [residentDetail, setResidentDetail] = useState(null);
  const [isResidentDetailLoading, setIsResidentDetailLoading] = useState(false);
  const [residentDetailError, setResidentDetailError] = useState('');
  const resident = residentDetail || listResident;
  const initialForm = useMemo(
    () => ({
      loginId: '',
      password: '',
      name: resident?.name || '',
      email: resident?.email || '',
      building: resident?.building || '',
      unit: resident?.unit || '',
      phone: resident?.phone || '',
      residentCarLimit: String(resident?.residentCarLimit ?? 1),
      visitorCarLimit: String(resident?.visitorCarLimit ?? 2),
    }),
    [resident],
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
    if (isCreateMode) {
      return;
    }

    let ignore = false;

    const loadResidentDetail = async () => {
      try {
        setIsResidentDetailLoading(true);
        setResidentDetailError('');
        const detail = await getResidentDetail(id);
        if (!ignore) {
          setResidentDetail(detail);
        }
      } catch (error) {
        if (!ignore) {
          setResidentDetailError('주민 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setIsResidentDetailLoading(false);
        }
      }
    };

    loadResidentDetail();

    return () => {
      ignore = true;
    };
  }, [id, isCreateMode]);

  if (!isCreateMode && (isResidentDetailLoading || (isResidentsLoading && !resident))) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 정보 수정" description="주민 정보를 불러오고 있습니다." />
        <SectionCard title="주민 정보">
          <LoadingState message="주민 정보 불러오는 중" />
        </SectionCard>
      </AdminLayout>
    );
  }

  if (!isCreateMode && ((residentDetailError && !resident) || (residentsError && !resident))) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
        menus={apartmentManagerMenus}
      >
        <PageTitle title="주민 정보 수정" description="주민 정보를 불러오지 못했습니다." />
        <SectionCard title="조회 실패">
          <EmptyState title="주민 정보 조회 실패" description={residentDetailError || residentsError} />
          <div className="detail-actions">
            <Link to="/apartment-manager/residents">
              <Button variant="secondary">목록으로</Button>
            </Link>
          </div>
        </SectionCard>
      </AdminLayout>
    );
  }

  if (!isCreateMode && !resident) {
    return (
      <AdminLayout
        roleLabel="아파트 관리자"
        consoleTitle="아파트 관리자 콘솔"
        userName="아파트 관리자"
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
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
  };

  const validateCreateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.loginId.trim()) nextErrors.loginId = '아이디를 입력하세요.';
    if (!form.password) nextErrors.password = '비밀번호를 입력하세요.';
    if (!form.name.trim()) nextErrors.name = '이름을 입력하세요.';
    if (!emailPattern.test(form.email)) nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    if (!form.building.trim()) nextErrors.building = '동을 입력하세요.';
    if (!form.unit.trim()) nextErrors.unit = '호수를 입력하세요.';
    if (Number(form.residentCarLimit) < 0) nextErrors.residentCarLimit = '0 이상의 숫자를 입력하세요.';
    if (Number(form.visitorCarLimit) < 0) nextErrors.visitorCarLimit = '0 이상의 숫자를 입력하세요.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateLimitForm = () => {
    const nextErrors = {};

    if (Number(form.residentCarLimit) < 0) nextErrors.residentCarLimit = '0 이상의 숫자를 입력하세요.';
    if (Number(form.visitorCarLimit) < 0) nextErrors.visitorCarLimit = '0 이상의 숫자를 입력하세요.';

    setErrors((currentErrors) => ({ ...currentErrors, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const parseLimitValue = (value, defaultValue) => {
    if (value === '' || value === null || value === undefined) {
      return defaultValue;
    }
    return Number(value);
  };

  const handleSave = async () => {
    if (isCreateMode && !validateCreateForm()) {
      return;
    }
    if (!validateLimitForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (isCreateMode) {
        await createResident({
          apartmentNo: apartmentManagerProfile.apartmentNo,
          loginId: form.loginId.trim(),
          password: form.password,
          name: form.name.trim(),
          email: form.email.trim(),
          building: form.building.trim(),
          unit: form.unit.trim(),
          phone: form.phone.trim(),
          residentCarLimit: parseLimitValue(form.residentCarLimit, 1),
          visitorCarLimit: parseLimitValue(form.visitorCarLimit, 2),
        });
        navigate('/apartment-manager/residents');
        return;
      }

      await updateResident(resident.id, {
        name: form.name,
        email: form.email,
        building: form.building,
        unit: form.unit,
        phone: form.phone,
        residentCarLimit: parseLimitValue(form.residentCarLimit, 1),
        visitorCarLimit: parseLimitValue(form.visitorCarLimit, 2),
      });
      setResidentDetail(await getResidentDetail(resident.id));
      setToastType('success');
      setToastMessage('주민 정보가 저장되었습니다.');
    } catch (error) {
      setToastType('error');
      if (error.response?.status === 409) {
        setToastMessage('이미 사용 중인 주민 아이디입니다.');
      } else if (error.response?.status === 400) {
        setToastMessage('필수 입력값을 다시 확인하세요.');
      } else {
        setToastMessage(isCreateMode ? '주민 등록에 실패했습니다.' : '주민 정보 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteResident(resident.id);
      setIsDeleteModalOpen(false);
      navigate('/apartment-manager/residents');
    } catch (error) {
      setToastType('error');
      setToastMessage('주민 정보 삭제에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle
        title={isCreateMode ? '주민 직접 등록' : '주민 정보 상세 및 수정'}
        description={isCreateMode ? '아파트 관리자가 주민 계정을 직접 등록합니다.' : '승인된 주민 정보를 확인하고 필요한 항목을 수정합니다.'}
      />

      <SectionCard
        title={isCreateMode ? '주민 등록 정보' : '주민 정보 수정'}
        description={isCreateMode ? '등록한 주민은 승인 완료 상태로 바로 주민 목록에 표시됩니다.' : '아이디와 가입일은 표시용이며, 나머지 정보는 수정 가능합니다.'}
      >
        {!isCreateMode && (
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
              <dt>세대 차량 수</dt>
              <dd>{resident.vehicleCount}대</dd>
            </div>
            <div>
              <dt>세대 차량 제한</dt>
              <dd>{resident.residentCarLimit}대</dd>
            </div>
            <div>
              <dt>방문차량 제한</dt>
              <dd>{resident.visitorCarLimit}대</dd>
            </div>
          </dl>
        )}

        <div className="form-grid">
          {isCreateMode && (
            <>
              <FormField label="아이디" error={errors.loginId}>
                <TextInput
                  error={Boolean(errors.loginId)}
                  value={form.loginId}
                  onChange={(event) => handleChange('loginId', event.target.value)}
                />
              </FormField>
              <FormField label="비밀번호" error={errors.password}>
                <TextInput
                  error={Boolean(errors.password)}
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                />
              </FormField>
            </>
          )}
          <FormField label="이름" error={errors.name}>
            <TextInput
              error={Boolean(errors.name)}
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
          </FormField>
          <FormField label="이메일" error={errors.email}>
            <TextInput
              error={Boolean(errors.email)}
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
          </FormField>
          <FormField label="동" error={errors.building}>
            <TextInput
              error={Boolean(errors.building)}
              value={form.building}
              onChange={(event) => handleChange('building', event.target.value)}
            />
          </FormField>
          <FormField label="호수" error={errors.unit}>
            <TextInput
              error={Boolean(errors.unit)}
              value={form.unit}
              onChange={(event) => handleChange('unit', event.target.value)}
            />
          </FormField>
          <FormField label="연락처">
            <TextInput value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} />
          </FormField>
          <FormField label="세대 입주민 차량 등록 가능 대수" error={errors.residentCarLimit}>
            <TextInput
              error={Boolean(errors.residentCarLimit)}
              type="number"
              min="0"
              value={form.residentCarLimit}
              onChange={(event) => handleChange('residentCarLimit', event.target.value)}
            />
          </FormField>
          <FormField label="방문차량 등록 가능 대수" error={errors.visitorCarLimit}>
            <TextInput
              error={Boolean(errors.visitorCarLimit)}
              type="number"
              min="0"
              value={form.visitorCarLimit}
              onChange={(event) => handleChange('visitorCarLimit', event.target.value)}
            />
          </FormField>
        </div>

        <div className="detail-actions">
          <Link to="/apartment-manager/residents">
            <Button variant="secondary">목록으로</Button>
          </Link>
          {!isCreateMode && (
            <Button variant="danger" disabled={isSubmitting} onClick={() => setIsDeleteModalOpen(true)}>
              삭제
            </Button>
          )}
          <Button disabled={isSubmitting} onClick={handleSave}>
            {isSubmitting ? '저장 중...' : isCreateMode ? '등록' : '저장'}
          </Button>
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
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
