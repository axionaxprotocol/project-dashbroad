import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { QRCodeModal } from './components/ui/QRCodeModal';
import type { Filters } from './components/layout/Header';
import { KPICards } from './components/dashboard/KPICards';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { DataTable } from './components/dashboard/DataTable';
import { ToastContainer } from './components/ui/Toast';
import { ProjectModal } from './components/ui/ProjectModal';
import type { ProjectData } from './types';
import { useProjects } from './hooks/useProjects';
import { useProjectFilter } from './hooks/useProjectFilter';
import { useToast } from './hooks/useToast';
import { KPI_SCROLL_OFFSET } from './constants';

function App() {
  const [filters, setFilters] = useState<Filters>({
    year: '',
    status: '',
    engineer: '',
    team: '',
    activeOnly: false,
    dateFrom: '',
    dateTo: ''
  });

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const { projects, isRefreshing, isLoading, loadData } = useProjects();
  const { toasts, addToast, dismissToast } = useToast();
  const filteredProjects = useProjectFilter(projects, filters);

  const handleRefresh = useCallback(async () => {
    try {
      await loadData();
      addToast('success', `โหลดข้อมูลสำเร็จ (${projects.length} โครงการ)`);
    } catch (error) {
      addToast('error', 'โหลดข้อมูลล้มเหลว กรุณาลองใหม่');
    }
  }, [loadData, addToast, projects.length]);


  const handleKpiClick = useCallback((kpiId: string) => {
    if (kpiId === 'active') {
      setFilters(prev => ({
        ...prev,
        activeOnly: !prev.activeOnly
      }));
      window.scrollTo({ top: KPI_SCROLL_OFFSET, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Header 
        projects={projects}
        filters={filters}
        onFilterChange={setFilters} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onQRClick={() => setShowQRModal(true)}
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
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
      <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
