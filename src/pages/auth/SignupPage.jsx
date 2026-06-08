import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApartmentManager } from '../../api/apartmentManagerApi.js';
import Button from '../../components/common/Button.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';

const KAKAO_POSTCODE_SCRIPT_ID = 'kakao-postcode-script';
const KAKAO_POSTCODE_SCRIPT_URL = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadKakaoPostcodeScript() {
  if (window.kakao?.Postcode || window.daum?.Postcode) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(KAKAO_POSTCODE_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = KAKAO_POSTCODE_SCRIPT_ID;
    script.src = KAKAO_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loginId: '',
    email: '',
    phone: '',
    name: '',
    password: '',
    passwordConfirm: '',
    apartmentName: '',
    address: '',
    careerImage: null,
  });
  const [errors, setErrors] = useState({});
  const [signupError, setSignupError] = useState('');
  const [addressSearchError, setAddressSearchError] = useState('');
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
    setSignupError('');
  };

  const handleAddressSearch = async () => {
    try {
      setIsAddressSearchLoading(true);
      setAddressSearchError('');
      await loadKakaoPostcodeScript();

      const Postcode = window.kakao?.Postcode || window.daum?.Postcode;

      if (!Postcode) {
        throw new Error('Kakao postcode script is not ready.');
      }

      new Postcode({
        oncomplete: (data) => {
          const baseAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          const extraAddressParts = [];

          if (data.userSelectedType === 'R' && data.bname && /[동|로|가]$/g.test(data.bname)) {
            extraAddressParts.push(data.bname);
          }

          if (data.userSelectedType === 'R' && data.buildingName && data.apartment === 'Y') {
            extraAddressParts.push(data.buildingName);
          }

          const extraAddress = extraAddressParts.length > 0 ? ` (${extraAddressParts.join(', ')})` : '';

          handleChange('address', `${baseAddress}${extraAddress}`);
        },
      }).open({ popupTitle: '아파트 주소 검색' });
    } catch (error) {
      setAddressSearchError('주소 검색 창을 열지 못했습니다. 팝업 허용 여부를 확인한 뒤 다시 시도하세요.');
    } finally {
      setIsAddressSearchLoading(false);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9-]+$/;

    if (!form.loginId.trim()) nextErrors.loginId = '아이디를 입력하세요.';
    if (!emailPattern.test(form.email)) nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    if (!form.phone.trim()) nextErrors.phone = '연락처를 입력하세요.';
    if (form.phone.trim() && !phonePattern.test(form.phone)) {
      nextErrors.phone = '연락처는 숫자와 하이픈만 입력하세요.';
    }
    if (!form.name.trim()) nextErrors.name = '관리자 이름을 입력하세요.';
    if (!form.password) nextErrors.password = '비밀번호를 입력하세요.';
    if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.apartmentName.trim()) nextErrors.apartmentName = '아파트 이름을 입력하세요.';
    if (!form.address.trim()) nextErrors.address = '주소 검색 버튼으로 아파트 주소를 선택하세요.';
    if (!form.careerImage) nextErrors.careerImage = '경력 증빙 이미지를 첨부하세요.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSignupError('');

      await signupApartmentManager({
        loginId: form.loginId.trim(),
        password: form.password,
        email: form.email.trim(),
        phone: form.phone.trim(),
        name: form.name.trim(),
        apartmentName: form.apartmentName.trim(),
        address: form.address.trim(),
        careerImage: form.careerImage,
      });

      navigate('/signup-complete');
    } catch (error) {
      if (error.response?.status === 409) {
        setSignupError('이미 사용 중인 아이디 또는 이메일입니다.');
      } else if (error.response?.status === 400) {
        setSignupError('입력값을 다시 확인하세요. 모든 필수 항목을 입력해야 합니다.');
      } else if (error.response?.status === 403) {
        setSignupError('회원가입 요청이 권한 설정에 의해 차단되었습니다. 백엔드를 최신 코드로 재시작하세요.');
      } else {
        setSignupError('회원가입 신청에 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-info">
        <div className="brand auth-brand">
          <div className="brand-mark">P</div>
          <div>
            <strong>Park On</strong>
            <span>아파트 주차 관리 시스템</span>
          </div>
        </div>
        <h1>아파트 관리자 회원가입 신청</h1>
      </section>

      <section className="auth-panel signup-panel">
        <h2>아파트 관리자 회원가입 신청</h2>
        {signupError && <div className="error-box">{signupError}</div>}

        <div className="signup-field-grid">
          <FormField label="아이디" error={errors.loginId}>
            <TextInput
              error={Boolean(errors.loginId)}
              placeholder="사용할 아이디를 입력하세요."
              value={form.loginId}
              onChange={(event) => handleChange('loginId', event.target.value)}
            />
          </FormField>
          <FormField label="이메일" error={errors.email}>
            <TextInput
              error={Boolean(errors.email)}
              placeholder="email@example.com"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
          </FormField>
          <FormField label="연락처" error={errors.phone}>
            <TextInput
              error={Boolean(errors.phone)}
              placeholder="010-1234-5678"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
            />
          </FormField>
          <FormField label="관리자 이름" error={errors.name}>
            <TextInput
              error={Boolean(errors.name)}
              placeholder="이름을 입력하세요."
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
          </FormField>
          <FormField label="비밀번호" error={errors.password}>
            <TextInput
              error={Boolean(errors.password)}
              type="password"
              placeholder="비밀번호를 입력하세요."
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
            />
          </FormField>
          <FormField label="비밀번호 확인" error={errors.passwordConfirm}>
            <TextInput
              error={Boolean(errors.passwordConfirm)}
              type="password"
              placeholder="비밀번호를 다시 입력하세요."
              value={form.passwordConfirm}
              onChange={(event) => handleChange('passwordConfirm', event.target.value)}
            />
          </FormField>
        </div>

        <FormField label="아파트 이름" error={errors.apartmentName}>
          <TextInput
            error={Boolean(errors.apartmentName)}
            placeholder="예: 테스트아파트"
            value={form.apartmentName}
            onChange={(event) => handleChange('apartmentName', event.target.value)}
          />
        </FormField>
        <div className="address-row">
          <FormField label="아파트 주소" error={errors.address}>
            <TextInput
              error={Boolean(errors.address)}
              placeholder="주소 검색 버튼으로 선택하세요."
              value={form.address}
              readOnly
            />
          </FormField>
          <Button variant="secondary" disabled={isAddressSearchLoading} onClick={handleAddressSearch}>
            {isAddressSearchLoading ? '검색 중' : '주소 검색'}
          </Button>
        </div>
        {addressSearchError && <p className="form-error">{addressSearchError}</p>}
        <FormField label="경력 증빙 이미지" error={errors.careerImage}>
          <TextInput
            error={Boolean(errors.careerImage)}
            type="file"
            accept="image/*"
            onChange={(event) => handleChange('careerImage', event.target.files?.[0] || null)}
          />
        </FormField>

        <Button fullWidth disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? '신청 중...' : '신청하기'}
        </Button>
        <Link className="text-link" to="/login">
          로그인 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
