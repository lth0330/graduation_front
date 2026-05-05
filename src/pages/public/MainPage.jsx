import { Link } from 'react-router-dom';
import PublicFooter from '../../components/common/PublicFooter.jsx';

const features = [
  {
    icon: 'R',
    title: '주민 관리',
    description: '가입 신청 승인과 주민 정보를 관리합니다.',
  },
  {
    icon: 'V',
    title: '차량 관리',
    description: '차량 등록, 수정, 삭제 업무를 처리합니다.',
  },
  {
    icon: 'P',
    title: '주차장 관리',
    description: '주차장, 구역, 주차면 상태를 관리합니다.',
  },
  {
    icon: 'Q',
    title: '문의 관리',
    description: '주민과 관리자의 문의 답변을 관리합니다.',
  },
];

export default function MainPage() {
  return (
    <div className="public-page">
      <header className="public-header">
        <Link className="public-logo" to="/">
          <span className="brand-mark">P</span>
          <span>
            <strong>Park on</strong>
            <small>아파트 주차 관리 시스템</small>
          </span>
        </Link>

        <nav className="public-nav" aria-label="서비스 소개 메뉴">
          <a href="#service">서비스 소개</a>
          <a href="#features">주요 기능</a>
          <a href="#roles">사용자 역할</a>
        </nav>

        <div className="public-header-actions">
          <Link className="public-button secondary" to="/login">
            로그인
          </Link>
          <Link className="public-button primary" to="/signup-request">
            관리자 신청
          </Link>
        </div>
      </header>

      <main>
        <section className="public-hero" id="service">
          <div className="hero-copy">
            <span className="hero-badge">Park on 관리자 웹</span>
            <h1>
              아파트 주차 관리를
              <br />한 곳에서 처리하는 시스템
            </h1>
            <p>
              주민 신청, 차량 등록, 주차장 관리, 문의 답변까지 관리자가 반복적으로
              처리하는 업무를 하나의 웹 화면에서 관리합니다.
            </p>
            <div className="hero-actions">
              <Link className="public-button primary large" to="/login">
                로그인하기
              </Link>
              <Link className="public-button secondary large" to="/signup-request">
                아파트 관리자 신청
              </Link>
            </div>
          </div>

          <div className="dashboard-preview" aria-label="관리자 대시보드 미리보기">
            <aside>
              <strong>Park on</strong>
              {['대시보드', '주민 관리', '차량 관리', '주차 상태', '문의 관리'].map((menu) => (
                <span key={menu}>{menu}</span>
              ))}
            </aside>
            <section>
              <h2>운영 현황</h2>
              <p>오늘 처리해야 할 업무를 확인합니다.</p>
              <div className="preview-metrics">
                <div>
                  <span>주민 신청</span>
                  <strong>24</strong>
                </div>
                <div>
                  <span>등록 차량</span>
                  <strong>1,284</strong>
                </div>
                <div>
                  <span>문의</span>
                  <strong>8</strong>
                </div>
              </div>
              <div className="preview-table">
                <span>신청자</span>
                <span>상태</span>
                <span>관리</span>
                <span>김민준</span>
                <span>승인 대기</span>
                <span>상세</span>
              </div>
            </section>
          </div>
        </section>

        <section className="public-section" id="features">
          <h2>주요 기능</h2>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span>{feature.icon}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="role-panel" id="roles">
          <strong>사용자 역할</strong>
          <p>웹 관리자: 아파트 관리자 승인, 관리자 정보 관리, 문의 답변</p>
          <p>아파트 관리자: 주민, 차량, 주차장, 주차 상태, 주민 문의 관리</p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
