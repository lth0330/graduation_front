export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-nav">
        <a href="#company">회사소개</a>
        <a href="#terms">이용약관</a>
        <a href="#privacy">개인정보처리방침</a>
        <a href="#guide">이용안내</a>
        <div className="footer-social">
          <span>◎</span>
          <span>f</span>
        </div>
      </div>

      <div className="footer-content">
        <section>
          <h2>CALL CENTER</h2>
          <strong className="footer-phone">031-000-0000</strong>
          <p>운영시간 : 09시~18시</p>
          <p>점심시간 : 12시~13시</p>
          <p>토, 일요일 및 공휴일 휴무</p>
        </section>

        <section>
          <h2>COMPANY INFO</h2>
          <p>Company : Park on</p>
          <p>Owner : 프로젝트 관리자</p>
          <p>Business license : 000-00-00000</p>
          <p>Address : 졸업 프로젝트 시연용 서비스</p>
          <p>Mail : help@parkon.co.kr</p>
        </section>

        <section>
          <h2>SERVICE INFO</h2>
          <p>아파트 관리자 승인 후 서비스 이용이 가능합니다.</p>
          <p>주민, 차량, 주차장, 문의 관리를 웹에서 처리합니다.</p>
          <h2 className="footer-subtitle">ADMIN SUPPORT</h2>
          <p>문의 : help@parkon.co.kr</p>
        </section>

        <section>
          <h2>SUPPORT MENU</h2>
          {['공지사항', '관리자 신청 문의', '자주 묻는 질문', '1:1 문의'].map((menu) => (
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
