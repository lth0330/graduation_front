import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApartmentManager } from '../../api/apartmentManagerApi.js';
import { loginWebAdmin } from '../../api/webAdminApi.js';
import {
  authRoles,
  consumeAuthMessage,
  getCurrentAuthRole,
  saveAuthSession,
} from '../../utils/auth.js';
import Button from '../../components/common/Button.jsx';
import FormField from '../../components/forms/FormField.jsx';
import TextInput from '../../components/forms/TextInput.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ loginId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const currentRole = getCurrentAuthRole();

    if (currentRole === authRoles.WEB_ADMIN) {
      navigate('/web-admin', { replace: true });
      return;
    }

    if (currentRole === authRoles.APARTMENT_MANAGER) {
      navigate('/apartment-admin', { replace: true });
      return;
    }

    const authMessage = consumeAuthMessage();

    if (authMessage) {
      setLoginError(authMessage);
    }
  }, [navigate]);

  const handleChange = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
    setLoginError('');
  };

  const handleLogin = async (role) => {
    const nextErrors = {};

    if (!form.loginId.trim()) {
      nextErrors.loginId = '아이디는 필수 입력값입니다.';
    }

    if (!form.password.trim()) {
      nextErrors.password = '비밀번호는 필수 입력값입니다.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (role === 'webAdmin') {
      try {
        setIsLoggingIn(true);
        const webAdmin = await loginWebAdmin({
          wId: form.loginId,
          wPwd: form.password,
        });

        saveAuthSession(authRoles.WEB_ADMIN, webAdmin);
        navigate('/web-admin');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setLoginError('서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
        }
      } finally {
        setIsLoggingIn(false);
      }
      return;
    }

    if (role === 'apartmentAdmin') {
      try {
        setIsLoggingIn(true);
        const apartmentManager = await loginApartmentManager({
          loginId: form.loginId,
          password: form.password,
        });

        if (apartmentManager.approvalStatus !== 'APPROVED') {
          setLoginError('승인 완료된 아파트 관리자만 로그인할 수 있습니다.');
          return;
        }

        saveAuthSession(authRoles.APARTMENT_MANAGER, apartmentManager);
        navigate('/apartment-admin');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setLoginError('서버와 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
        }
      } finally {
        setIsLoggingIn(false);
      }
      return;
    }

    setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
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
        <h1>관리자 로그인</h1>
        <p>로그인 후 계정 역할에 따라 웹 관리자 또는 아파트 관리자 화면으로 이동합니다.</p>
        <div className="auth-flow-card">
          <strong>로그인 후 이동 흐름</strong>
          <span>웹 관리자 → 웹 관리자 대시보드</span>
          <span>아파트 관리자 → 아파트 관리자 대시보드</span>
        </div>
      </section>

      <section className="auth-panel">
        <span className="screen-label">Common Login</span>
        <h2>관리자 로그인</h2>
        {loginError && <div className="error-box">{loginError}</div>}
        <FormField label="아이디" error={errors.loginId}>
          <TextInput
            error={Boolean(errors.loginId)}
            placeholder="아이디를 입력하세요"
            value={form.loginId}
            onChange={(event) => handleChange('loginId', event.target.value)}
          />
        </FormField>
        <FormField label="비밀번호" error={errors.password}>
          <TextInput
            error={Boolean(errors.password)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            value={form.password}
            onChange={(event) => handleChange('password', event.target.value)}
          />
        </FormField>

        <Button fullWidth disabled={isLoggingIn} onClick={() => handleLogin('webAdmin')}>
          {isLoggingIn ? '로그인 중...' : '웹 관리자로 로그인'}
        </Button>
        <Button fullWidth variant="secondary" disabled={isLoggingIn} onClick={() => handleLogin('apartmentAdmin')}>
          아파트 관리자로 로그인
        </Button>

        <p className="auth-link-text">
          아파트 관리자 계정이 없나요?{' '}
          <Link to="/signup-request">회원가입 신청</Link>
        </p>
        <div className="auth-notice">테스트 계정: admin / 1234, qwe123 / qwer1234</div>
      </section>
    </main>
  );
}
