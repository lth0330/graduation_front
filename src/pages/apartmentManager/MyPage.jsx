import { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
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
import { formatPhoneNumber } from '../../utils/phoneFormat.js';

export default function MyPage() {
  const {
    apartmentManagerProfile,
    isManagerProfileLoading,
    managerProfileError,
    refreshManagerProfile,
    updateManagerProfile,
  } = useApartmentManager();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    setForm({
      name: apartmentManagerProfile.name || '',
      email: apartmentManagerProfile.email || '',
      phone: apartmentManagerProfile.phone || '',
    });
  }, [apartmentManagerProfile]);

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

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      nextErrors.name = '관리자 이름을 입력하세요.';
    }
    if (!emailPattern.test(form.email)) {
      nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancelEdit = () => {
    setForm({
      name: apartmentManagerProfile.name || '',
      email: apartmentManagerProfile.email || '',
      phone: apartmentManagerProfile.phone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateManagerProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setIsEditing(false);
      setToastType('success');
      setToastMessage('관리자 정보가 수정되었습니다.');
    } catch (error) {
      setToastType('error');
      if (error.response?.status === 409) {
        setToastMessage('이미 사용 중인 이메일입니다.');
      } else {
        setToastMessage('관리자 정보 수정에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(apartmentManagerProfile.apartmentPassword);
      setToastType('success');
      setToastMessage('아파트 비밀번호가 복사되었습니다.');
    } catch {
      setToastType('success');
      setToastMessage(`아파트 비밀번호: ${apartmentManagerProfile.apartmentPassword}`);
    }
  };

  return (
    <AdminLayout
      roleLabel="아파트 관리자"
      consoleTitle="아파트 관리자 콘솔"
      userName="아파트 관리자"
      menus={apartmentManagerMenus}
    >
      <PageTitle title="아파트 관리자 정보" description="아파트 관리자 계정과 아파트 인증 정보를 확인합니다." />

      <SectionCard title="기본 정보">
        {isManagerProfileLoading ? (
          <LoadingState message="아파트 관리자 정보 불러오는 중" />
        ) : managerProfileError ? (
          <>
            <EmptyState title="관리자 정보 조회 실패" description={managerProfileError} />
            <div className="detail-actions">
              <Button variant="secondary" onClick={refreshManagerProfile}>
                다시 불러오기
              </Button>
            </div>
          </>
        ) : isEditing ? (
          <>
            <dl className="detail-list">
              <div>
                <dt>관리자 아이디</dt>
                <dd>{apartmentManagerProfile.loginId}</dd>
              </div>
              <div>
                <dt>아파트 이름</dt>
                <dd>{apartmentManagerProfile.apartmentName}</dd>
              </div>
              <div className="detail-wide">
                <dt>아파트 주소</dt>
                <dd>{apartmentManagerProfile.address}</dd>
              </div>
            </dl>

            <div className="form-grid">
              <FormField label="관리자 이름" error={errors.name}>
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
              <FormField label="연락처">
                <TextInput value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} />
              </FormField>
            </div>

            <div className="detail-actions">
              <Button variant="secondary" disabled={isSubmitting} onClick={handleCancelEdit}>
                취소
              </Button>
              <Button disabled={isSubmitting} onClick={handleSaveProfile}>
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <dl className="detail-list">
              <div>
                <dt>관리자 아이디</dt>
                <dd>{apartmentManagerProfile.loginId}</dd>
              </div>
              <div>
                <dt>관리자 이름</dt>
                <dd>{apartmentManagerProfile.name}</dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>{apartmentManagerProfile.email}</dd>
              </div>
              <div>
                <dt>연락처</dt>
                <dd>{formatPhoneNumber(apartmentManagerProfile.phone, '-')}</dd>
              </div>
              <div>
                <dt>아파트 이름</dt>
                <dd>{apartmentManagerProfile.apartmentName}</dd>
              </div>
              <div className="detail-wide">
                <dt>아파트 주소</dt>
                <dd>{apartmentManagerProfile.address}</dd>
              </div>
              <div>
                <dt>아파트 비밀번호</dt>
                <dd className="password-row">
                  <strong>{apartmentManagerProfile.apartmentPassword}</strong>
                  <Button variant="secondary" size="small" onClick={handleCopyPassword}>
                    복사
                  </Button>
                </dd>
              </div>
            </dl>

            <div className="detail-actions">
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                관리자 정보 수정
              </Button>
            </div>
          </>
        )}

        <div className="info-box">
          <strong>주민에게 이 비밀번호를 전달하세요.</strong>
          <p>
            주민은 회원가입 또는 아파트 인증 과정에서 이 6자리 아파트 비밀번호를 입력해야 합니다.
            외부인에게 노출되지 않도록 관리하세요.
          </p>
        </div>

        <div className="info-box muted">
          <strong>사용 위치</strong>
          <p>주민 회원가입 화면 → 아파트 인증 단계 → 아파트 비밀번호 입력</p>
        </div>
      </SectionCard>

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AdminLayout>
  );
}
