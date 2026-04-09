import React, { useState } from 'react';
import type { ProjectData } from '../../types';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { exportProjectsCsv } from '../../utils/exportCsv';
import { getDeadlineStatus, getStatusBadgeStyle } from '../../utils/statusHelpers';
import { useTableSort } from '../../hooks/useTableSort';
import { ROWS_PER_PAGE } from '../../constants';

interface DataTableProps {
  projects: ProjectData[];
  onRowClick?: (project: ProjectData) => void;
}


export const DataTable: React.FC<DataTableProps> = ({ projects, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    totalPages,
    paginatedData,
    filteredAndSorted,
    safeCurrentPage,
    handleSort,
    setCurrentPage,
  } = useTableSort(projects, searchTerm);

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
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition-colors min-w-[200px]" onClick={() => handleSort('projectName')}>
                <div className="flex items-center gap-1.5">
                  <span>Project & Customer</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Quotation No.
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Team
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Engineer
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap" onClick={() => handleSort('orderValue')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Order Value</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                Billing
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:bg-slate-100 transition-colors w-[100px]" onClick={() => handleSort('progress')}>
                <div className="flex items-center gap-1.5">
                  <span>Progress</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
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
                  <td className="px-3 py-3">
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate max-w-[250px]" title={project.projectName}>{project.projectName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[250px]" title={project.customer}>{project.customer}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusBadgeStyle(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{project.quotationNumber}</td>
                  <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">{project.installTeam}</td>
                  <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{project.engineer}</td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(project.orderValue)}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-0.5">
                      {renderBillingBadge(1, project.billing.phase1.paid)}
                      {renderBillingBadge(2, project.billing.phase2.paid)}
                      {renderBillingBadge(3, project.billing.phase3.paid)}
                      {renderBillingBadge(4, project.billing.phase4.paid)}
                    </div>
                  </td>
                  <td className="px-3 py-3 w-[100px]">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {project.deadline && project.deadline.trim() !== '' ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        dlStatus === 'overdue' ? 'text-red-600 dark:text-red-400 font-semibold' :
                        dlStatus === 'soon' ? 'text-amber-600 dark:text-amber-400 font-medium' :
                        'text-slate-600 dark:text-slate-400'
                      }`}>
                        {dlStatus !== 'normal' && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{new Date(project.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {dlStatus === 'overdue' && <span className="text-[10px] ml-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">เลยกำหนด</span>}
                        {dlStatus === 'soon' && <span className="text-[10px] ml-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">ใกล้ครบกำหนด</span>}
                      </span>
                    ) : <span className="text-sm text-slate-400 dark:text-slate-500">-</span>}
                  </td>
                </tr>
              );})
            ) : (
              <tr>
                 <td colSpan={9} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
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
                <td colSpan={5}></td>
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
