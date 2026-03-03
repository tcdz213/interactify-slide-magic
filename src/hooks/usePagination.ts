import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 when items change significantly
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return {
    paginatedItems,
    currentPage: safeCurrentPage,
    totalPages,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalItems: items.length,
  };
}
