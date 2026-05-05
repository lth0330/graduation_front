import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-panel">
        <span>404</span>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>주소가 잘못되었거나 아직 연결되지 않은 화면입니다.</p>
        <div className="not-found-actions">
          <Link to="/">
            <Button>메인으로</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">로그인으로</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
