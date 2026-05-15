import { useNavigate } from 'react-router-dom';
import { clearAuthSessions } from '../../utils/auth.js';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSessions();

    // 로그아웃 후 메인 화면으로 이동합니다.
    navigate('/');
  };

  return (
    <header className="top-header">
      <button className="logout-button" type="button" onClick={handleLogout}>
        로그아웃
      </button>
    </header>
  );
}
