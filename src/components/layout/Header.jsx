import { useNavigate } from 'react-router-dom';
import { clearAuthSessions } from '../../utils/auth.js';

export default function Header({ roleLabel, userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSessions();

    // 로그아웃 후 메인 화면으로 이동합니다.
    navigate('/');
  };

  return (
    <header className="top-header">
      <div className="header-summary" aria-label="현재 관리자 정보">
        <span>{roleLabel}</span>
        <strong>{userName || '관리자'}</strong>
      </div>

      <div className="header-actions">
        <span className="header-status">운영 콘솔</span>
        <button className="logout-button" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
