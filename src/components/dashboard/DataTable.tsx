import React, { useState, useMemo } from 'react';
import type { ProjectData } from '../../types';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { exportProjectsCsv } from '../../utils/exportCsv';

interface DataTableProps {
  projects: ProjectData[];
  onRowClick?: (project: ProjectData) => void;
}

type SortField = 'projectName' | 'orderValue' | 'progress';
type SortOrder = 'asc' | 'desc';

const ROWS_PER_PAGE = 10;

function getDeadlineStatus(deadline?: string, progress?: number): 'overdue' | 'soon' | 'normal' {
  if (!deadline || deadline.trim() === '' || progress === 100) return 'normal';
  const now = new Date();
  const dl = new Date(deadline);
  const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 14) return 'soon';
  return 'normal';
}

export const DataTable: React.FC<DataTableProps> = ({ projects, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const renderBillingBadge = (phase: number, paid: boolean) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mr-1 ${paid ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
      งวด {phase}
    </span>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Project Details</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-56"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => exportProjectsCsv(filteredAndSorted)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer flex-shrink-0"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#f8fafc] dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('projectName')}>
                <div className="flex items-center gap-1">
                  <span>Project & Customer</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Quotation No.
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Team
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap" onClick={() => handleSort('orderValue')}>
                <div className="flex items-center gap-1">
                  <span>Order Value</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Billing
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('progress')}>
                <div className="flex items-center gap-1">
                  <span>Progress</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((project) => {
                const dlStatus = getDeadlineStatus(project.deadline, project.progress);
                return (
                <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => onRowClick?.(project)}>
                  <td className="px-3 py-2.5 max-w-[220px]">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={project.projectName}>{project.projectName}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs truncate" title={project.customer}>{project.customer}</div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{project.quotationNumber}</td>
                  <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">{project.installTeam}</td>
                  <td className="px-3 py-2.5 font-semibold text-blue-700 whitespace-nowrap">{formatCurrency(project.orderValue)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center">
                      {renderBillingBadge(1, project.billing.phase1.paid)}
                      {renderBillingBadge(2, project.billing.phase2.paid)}
                      {renderBillingBadge(3, project.billing.phase3.paid)}
                      {renderBillingBadge(4, project.billing.phase4.paid)}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 w-32">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {project.deadline && project.deadline.trim() !== '' ? (
                      <span className={`inline-flex items-center gap-1 ${
                        dlStatus === 'overdue' ? 'text-red-600 font-semibold' :
                        dlStatus === 'soon' ? 'text-amber-600 font-medium' :
                        'text-slate-600'
                      }`}>
                        {dlStatus !== 'normal' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {new Date(project.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {dlStatus === 'overdue' && <span className="text-[10px] ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded">เลยกำหนด</span>}
                        {dlStatus === 'soon' && <span className="text-[10px] ml-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ใกล้ครบกำหนด</span>}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              );})
            ) : (
              <tr>
                 <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No projects found matching the criteria
                 </td>
              </tr>
            )}
          </tbody>
          {filteredAndSorted.length > 0 && (
            <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-300 dark:border-slate-600">
              <tr>
                <td className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300" colSpan={3}>
                  Total ({filteredAndSorted.length} projects)
                </td>
                <td className="px-3 py-2.5 font-bold text-blue-700 whitespace-nowrap">
                  {formatCurrency(filteredAndSorted.reduce((sum, p) => sum + p.orderValue, 0))}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {filteredAndSorted.length > ROWS_PER_PAGE && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            แสดง {(safeCurrentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ROWS_PER_PAGE, filteredAndSorted.length)} จาก {filteredAndSorted.length} รายการ
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  page === safeCurrentPage
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
