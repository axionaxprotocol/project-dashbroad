import { useMemo } from 'react';
import type { ProjectData } from '../types';
import type { Filters } from '../components/layout/Header';

export const useProjectFilter = (projects: ProjectData[], filters: Filters) => {
  return useMemo(() => {
    return projects.filter(project => {
      // Cast project values to string for safe comparison with string filters
      if (filters.year && String(project.year) !== filters.year) return false;
      if (filters.status && String(project.status) !== filters.status) return false;
      if (filters.engineer && String(project.engineer) !== filters.engineer) return false;
      if (filters.team && String(project.installTeam) !== filters.team) return false;
      
      // Active Progress logic (Progress > 0 and < 100)
      if (filters.activeOnly) {
        if (project.progress <= 0 || project.progress >= 100) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const orderDate = new Date(project.orderDate);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (orderDate < fromDate) return false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Include the entire end date
          if (orderDate > toDate) return false;
        }
      }

      return true;
    });
  }, [projects, filters]);
};
