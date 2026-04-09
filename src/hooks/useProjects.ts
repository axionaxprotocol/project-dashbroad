import { useState, useCallback, useEffect } from 'react';
import { fetchProjects } from '../services/api';
import type { ProjectData } from '../types';

const AUTO_REFRESH_INTERVAL = 300000; // 5 minutes

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
      throw error;
    } finally {
      if (!isBackground) setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    const intervalId = setInterval(() => {
      loadData(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadData]);

  return { projects, isRefreshing, isLoading, loadData };
};
