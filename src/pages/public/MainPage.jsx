import { Link } from 'react-router-dom';
import PublicFooter from '../../components/common/PublicFooter.jsx';

const features = [
  {
    label: '01',
    title: '입주민 승인',
    description: '가입 신청, 세대 정보, 차량 등록 제한을 한 화면에서 확인합니다.',
  },
  {
    label: '02',
    title: '차량 운영',
    description: '입주민 차량과 방문 차량을 구분해 등록 현황을 관리합니다.',
  },
  {
    label: '03',
    title: '주차 구역',
    description: '주차장, 주차면, 상태 변경 이력을 운영 기준에 맞게 정리합니다.',
  },
  {
    label: '04',
    title: '문의 대응',
    description: '입주민 문의와 관리자 문의 답변 상태를 구분해 처리합니다.',
  },
];

const parkingSlots = ['101', '102', '103', '104', '105', '106', '107', '108'];

export default function MainPage() {
  return (
    <div className="public-page">
      <header className="public-header">
        <Link className="public-logo" to="/">
          <span className="brand-mark">p</span>
          <span>
            <strong>아트파킹</strong>
          </span>
        </Link>

        <nav className="public-nav" aria-label="서비스 소개 메뉴">
          <a href="#service">서비스 소개</a>
          <a href="#features">주요 기능</a>
          <a href="#roles">도입 안내</a>
          <a href="#support">고객센터</a>
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
            <Link className="hero-notice" to="/signup-request">
              <span>공지</span>
              아트파킹 웹사이트가 새롭게 오픈했습니다.
              <strong>›</strong>
            </Link>
            <h1>
              아파트 주차 관리,
              <br />더 스마트하게
            </h1>
            <p>
              입주민은 편리하게, 관리는 효율적으로
              <br />
              아트파킹으로 주차 관리의 모든 순간을 간편하게 만드세요.
            </p>
            <div className="hero-actions">
              <Link className="public-button primary large" to="/login">
                관리자 로그인
              </Link>
              <Link className="public-button secondary large" to="/signup-request">
                서비스 보기
                <span aria-hidden="true">›</span>
              </Link>
            </div>
          </div>

          <div className="hero-product" aria-label="아트파킹 관리자 화면 미리보기">
            <div className="browser-frame">
              <div className="browser-topbar">
                <div className="window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="address-bar">
                  <span>artparking.com</span>
                </div>
                <span className="browser-menu" aria-hidden="true">⋮</span>
              </div>

              <div className="preview-app">
                <aside className="preview-sidebar">
                  <strong>
                    <span className="mini-logo">p</span>
                    아트파킹
                  </strong>
                  {['홈', '차량 관리', '주차 현황', '출입 기록', '공지사항', '설정'].map((menu, index) => (
                    <span className={index === 0 ? 'is-active' : ''} key={menu}>
                      {menu}
                    </span>
                  ))}
                </aside>

                <section className="preview-content">
                  <p className="preview-message">오늘도 안전하고 쾌적한 주차 환경을 만들어가고 있어요.</p>
                  <div className="preview-metrics">
                    <div>
                      <span>총 등록 차량</span>
                      <strong>1,248 대</strong>
                    </div>
                    <div>
                      <span>오늘 입차</span>
                      <strong>245 대</strong>
                    </div>
                    <div>
                      <span>오늘 출차</span>
                      <strong>198 대</strong>
                    </div>
                    <div>
                      <span>주차 가능 대수</span>
                      <strong className="is-blue">312 대</strong>
                    </div>
                  </div>

                  <div className="parking-board">
                    <div className="parking-board-header">
                      <strong>주차 현황</strong>
                      <span>더보기 ›</span>
                    </div>
                    <div className="parking-lane">
                      {parkingSlots.map((slot, index) => (
                        <div className="parking-cell" key={slot}>
                          <span>{slot}</span>
                          {(index === 1 || index === 2 || index === 5 || index === 6 || index === 7) && (
                            <i aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="hero-stats" id="roles">
              <div>
                <span className="stat-icon">▦</span>
                <strong>전국 200+ 단지</strong>
                <p>아파트에서 선택한 서비스</p>
              </div>
              <div>
                <span className="stat-icon">◇</span>
                <strong>99.9% 안정성</strong>
                <p>안정적인 시스템 운영</p>
              </div>
              <div>
                <span className="stat-icon">♙</span>
                <strong>입주민 50,000+ 명</strong>
                <p>더 편리해진 주차 경험</p>
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" id="features">
          <div className="section-heading">
            <span>관리자 업무 흐름</span>
            <h2>하루 운영 순서에 맞춰 확인하고 처리합니다.</h2>
          </div>
          <div className="workflow-grid">
            {features.map((feature) => (
              <article className="workflow-card" key={feature.title}>
                <span>{feature.label}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="role-panel" id="roles">
          <div>
            <strong>웹 관리자</strong>
            <p>아파트 관리자 승인과 관리자 계정 관리를 담당합니다.</p>
          </div>
          <div>
            <strong>아파트 관리자</strong>
            <p>입주민, 차량, 주차장, 문의를 단지 기준으로 관리합니다.</p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
