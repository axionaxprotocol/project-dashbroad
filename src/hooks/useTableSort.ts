import { useState, useMemo } from 'react';
import type { ProjectData } from '../types';
import { ROWS_PER_PAGE } from '../constants';

type SortField = 'projectName' | 'orderValue' | 'progress';
type SortOrder = 'asc' | 'desc';

export const useTableSort = (projects: ProjectData[], searchTerm: string) => {
  const [sortField, setSortField] = useState<SortField>('projectName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    // 1. Filter by search
    let filtered = projects.filter(p =>
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comparison = valA.localeCompare(valB);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

    return filtered;
  }, [projects, searchTerm, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ROWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredAndSorted.slice(
    (safeCurrentPage - 1) * ROWS_PER_PAGE,
    safeCurrentPage * ROWS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    sortField,
    sortOrder,
    currentPage,
    totalPages,
    paginatedData,
    filteredAndSorted,
    safeCurrentPage,
    handleSort,
    handlePageChange,
    setCurrentPage,
  };
};
