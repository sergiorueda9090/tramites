import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

export const useTable = (initialData = [], options = {}) => {
  const {
    initialPage = 0,
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialSortField = null,
    initialSortOrder = 'asc',
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  }, []);

  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('asc');
      }
    },
    [sortField]
  );

  const sortedData = useMemo(() => {
    if (!sortField || !initialData.length) return initialData;

    return [...initialData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [initialData, sortField, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(initialData.length / pageSize);
  }, [initialData.length, pageSize]);

  const resetTable = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortField(initialSortField);
    setSortOrder(initialSortOrder);
  }, [initialPage, initialPageSize, initialSortField, initialSortOrder]);

  return {
    // State
    page,
    pageSize,
    sortField,
    sortOrder,
    // Computed
    sortedData,
    paginatedData,
    totalPages,
    totalRows: initialData.length,
    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    resetTable,
    // Setters
    setPage,
    setPageSize,
    setSortField,
    setSortOrder,
  };
};

export default useTable;
