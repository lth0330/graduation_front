import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    apartmentName: '',
    address: '',
    detailAddress: '',
  });
  const [errors, setErrors] = useState({});

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

    if (!form.loginId.trim()) nextErrors.loginId = '아이디를 입력하세요.';
    if (!emailPattern.test(form.email)) nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    if (!form.password) nextErrors.password = '비밀번호를 입력하세요.';
    if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.apartmentName.trim()) nextErrors.apartmentName = '아파트 이름을 입력하세요.';
    if (!form.address.trim()) nextErrors.address = '아파트 주소를 입력하세요.';
    if (!form.detailAddress.trim()) nextErrors.detailAddress = '상세 주소를 입력하세요.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigate('/signup-complete');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-info">
        <div className="brand auth-brand">
          <div className="brand-mark">P</div>
          <div>
            <strong>Park on</strong>
            <span>아파트 주차 관리 시스템</span>
          </div>
        </div>
        <h1>아파트 관리자 회원가입 신청</h1>
        <p>아파트 정보와 관리자 계정 정보를 입력하면 웹 관리자 승인 대기 상태가 됩니다.</p>
        <div className="auth-flow-card signup-flow-card">
          <strong>신청 처리 흐름</strong>
          <span>정보 입력 및 신청</span>
          <span>웹 관리자 승인 대기</span>
          <span>승인 후 로그인 가능</span>
        </div>
      </section>

      <section className="auth-panel signup-panel">
        <span className="screen-label">Apartment Admin Signup</span>
        <h2>아파트 관리자 회원가입 신청</h2>
        <p className="auth-panel-desc">아파트 정보와 관리자 계정 정보를 입력하면 승인 대기 상태로 신청됩니다.</p>

        <div className="signup-field-grid">
          <FormField label="아이디" error={errors.loginId}>
            <TextInput error={Boolean(errors.loginId)} placeholder="사용할 아이디를 입력하세요" value={form.loginId} onChange={(event) => handleChange('loginId', event.target.value)} />
          </FormField>
          <FormField label="이메일" error={errors.email}>
            <TextInput error={Boolean(errors.email)} placeholder="email@example.com" value={form.email} onChange={(event) => handleChange('email', event.target.value)} />
          </FormField>
          <FormField label="비밀번호" error={errors.password}>
            <TextInput error={Boolean(errors.password)} type="password" placeholder="비밀번호를 입력하세요" value={form.password} onChange={(event) => handleChange('password', event.target.value)} />
          </FormField>
          <FormField label="비밀번호 확인" error={errors.passwordConfirm}>
            <TextInput error={Boolean(errors.passwordConfirm)} type="password" placeholder="비밀번호를 다시 입력하세요" value={form.passwordConfirm} onChange={(event) => handleChange('passwordConfirm', event.target.value)} />
          </FormField>
        </div>

        <FormField label="아파트 이름" error={errors.apartmentName}>
          <TextInput error={Boolean(errors.apartmentName)} placeholder="예: 행복아파트" value={form.apartmentName} onChange={(event) => handleChange('apartmentName', event.target.value)} />
        </FormField>
        <div className="address-row">
          <FormField label="아파트 주소" error={errors.address}>
            <TextInput error={Boolean(errors.address)} placeholder="주소 검색 버튼으로 입력" value={form.address} onChange={(event) => handleChange('address', event.target.value)} />
          </FormField>
          <Button variant="secondary">주소 검색</Button>
        </div>
        <FormField label="상세 주소" error={errors.detailAddress}>
          <TextInput error={Boolean(errors.detailAddress)} placeholder="동, 호수 또는 관리사무소 위치를 입력하세요" value={form.detailAddress} onChange={(event) => handleChange('detailAddress', event.target.value)} />
        </FormField>

        <div className="auth-notice">신청 후 바로 로그인할 수 없으며, 웹 관리자 승인 전까지 승인 대기 상태로 표시됩니다.</div>

        <Button fullWidth onClick={handleSubmit}>
          신청하기
        </Button>
        <Link className="text-link" to="/login">
          로그인 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
