import Button from '../common/Button.jsx';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const movePage = (page) => {
    if (!onPageChange || page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  };

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <Button
        variant="secondary"
        size="small"
        disabled={currentPage === 1}
        onClick={() => movePage(currentPage - 1)}
      >
        이전
      </Button>
      {pages.map((page) => (
        <button
          className={`page-button ${page === currentPage ? 'active' : ''}`}
          type="button"
          key={page}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => movePage(page)}
        >
          {page}
        </button>
      ))}
      <Button
        variant="secondary"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => movePage(currentPage + 1)}
      >
        다음
      </Button>
    </nav>
  );
}
