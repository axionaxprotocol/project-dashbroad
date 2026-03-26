import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import type { Filters } from './components/layout/Header';
import { KPICards } from './components/dashboard/KPICards';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { DataTable } from './components/dashboard/DataTable';
import { ToastContainer } from './components/ui/Toast';
import type { ToastMessage } from './components/ui/Toast';
import { ProjectModal } from './components/ui/ProjectModal';
import { fetchProjects } from './services/api';
import type { ProjectData } from './types';

function App() {
  const [filters, setFilters] = useState<Filters>({
    year: '',
    status: '',
    engineer: '',
    team: '',
    activeOnly: false
  });

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const addToast = useCallback((type: 'success' | 'error', text: string) => {
    setToasts(prev => [...prev, { id: Date.now(), type, text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsRefreshing(true);
      const data = await fetchProjects();
      setProjects(data);
      if (!isBackground) addToast('success', `โหลดข้อมูลสำเร็จ (${data.length} โครงการ)`);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      if (!isBackground) addToast('error', 'โหลดข้อมูลล้มเหลว กรุณาลองใหม่');
    } finally {
      if (!isBackground) setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // โหลดข้อมูลครั้งแรก
    loadData(false);

    // ตั้งเวลาโหลดข้อมูลอัตโนมัติทุกๆ 5 นาที (300000 ms) แบบไม่กะพริบหน้าจอ
    const intervalId = setInterval(() => {
      loadData(true);
    }, 300000);

    // ลบ interval ทิ้งเมื่อปิดหน้าต่าง เพื่อกัน memory leak
    return () => clearInterval(intervalId);
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const filteredProjects = useMemo(() => {
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
      
      return true;
    });
  }, [projects, filters]);

  const handleKpiClick = (kpiId: string) => {
    if (kpiId === 'active') {
      // Toggle the activeOnly filter when clicking the KPI card
      setFilters(prev => ({
        ...prev,
        activeOnly: !prev.activeOnly
      }));
      // Scroll slightly down to show the table
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Header 
        projects={projects}
        filters={filters}
        onFilterChange={setFilters} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <main className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-20">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80"></div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-64"></div>
          </div>
        ) : (
          <>
            <KPICards projects={filteredProjects} onCardClick={handleKpiClick} />

            <ChartsSection projects={filteredProjects} />

            <DataTable projects={filteredProjects} onRowClick={setSelectedProject} />
          </>
        )}
      </main>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
