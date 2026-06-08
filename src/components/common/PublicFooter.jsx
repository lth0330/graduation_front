export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-nav">
        <strong>Park On</strong>
        <a href="#service">서비스 소개</a>
        <a href="#features">주요 기능</a>
        <a href="#roles">도입 안내</a>
        <a href="#support">고객센터</a>
      </div>

      <div className="footer-content">
        <section>
          <h2>CONTACT</h2>
          <strong className="footer-phone">project@example.com</strong>
          <p>관리자 신청과 서비스 도입 문의를 받습니다.</p>
          <p>운영시간 09:00 - 18:00</p>
        </section>

        <section>
          <h2>SERVICE</h2>
          <p>아파트 관리자 승인 후 웹 콘솔을 사용할 수 있습니다.</p>
          <p>입주민, 차량, 주차 구역, 문의 업무를 통합 관리합니다.</p>
        </section>

        <section>
          <h2>PROJECT INFO</h2>
          <p>Graduation Project</p>
          <p>Apartment Parking Management System</p>
          <p>Web Admin Console</p>
        </section>

        <section>
          <h2>SUPPORT</h2>
          {['관리자 신청', '서비스 문의', '시연 안내'].map((menu) => (
            <a className="support-link" href="#support" key={menu}>
              {menu}
              <span>&gt;</span>
            </a>
          ))}
        </section>
      </div>
    </footer>
  );
}
