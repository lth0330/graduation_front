import { useEffect, useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 5;

export function usePagination(rows, pageSize = DEFAULT_PAGE_SIZE, resetKeys = []) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;

  useEffect(() => {
    setCurrentPage(1);
  }, resetKeys);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(
    () => rows.slice(startIndex, startIndex + pageSize),
    [rows, startIndex, pageSize],
  );

  return {
    currentPage: safeCurrentPage,
    setCurrentPage,
    totalPages,
    pagedRows,
    startIndex,
  };
}
