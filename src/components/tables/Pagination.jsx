import Button from '../common/Button.jsx';

export default function Pagination({ currentPage = 1, totalPages = 1 }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <Button variant="secondary" size="small" disabled={currentPage === 1}>
        이전
      </Button>
      {pages.map((page) => (
        <button
          className={`page-button ${page === currentPage ? 'active' : ''}`}
          type="button"
          key={page}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <Button variant="secondary" size="small" disabled={currentPage === totalPages}>
        다음
      </Button>
    </nav>
  );
}
