import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';

export default function SignupCompletePage() {
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
        <h1>가입 신청 완료</h1>
        <p>웹 관리자의 승인 후 아파트 관리자 계정으로 로그인할 수 있습니다.</p>
        <div className="auth-flow-card signup-flow-card">
          <strong>승인 상태 안내</strong>
          <span>신청 정보 접수</span>
          <span>웹 관리자 승인 대기</span>
          <span>승인 후 로그인 가능</span>
        </div>
      </section>

      <section className="auth-panel complete-panel">
        <div className="complete-icon">✓</div>
        <h2>가입 신청 완료</h2>
        <p className="complete-description">웹 관리자의 승인 후 아파트 관리자 계정으로 로그인할 수 있습니다.</p>
        <Link to="/login">
          <Button fullWidth>로그인 화면으로</Button>
        </Link>
        <div className="auth-notice">승인 상태는 웹 관리자 승인 목록에서 pending 상태로 관리됩니다.</div>
      </section>
    </main>
  );
}
