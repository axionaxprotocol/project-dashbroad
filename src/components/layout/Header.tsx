import React, { useMemo } from 'react';
import { Filter, RefreshCw, X, QrCode } from 'lucide-react';
import type { ProjectData } from '../../types';
import { DarkModeToggle } from '../ui/DarkModeToggle';

export interface Filters {
  year: string;
  status: string;
  engineer: string;
  team: string;
  activeOnly: boolean;
  dateFrom: string;
  dateTo: string;
}

interface HeaderProps {
  projects: ProjectData[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onQRClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ projects, filters, onFilterChange, onRefresh, isRefreshing = false, onQRClick }) => {
  const { year, status, engineer, team, activeOnly, dateFrom, dateTo } = filters;

  const setYear = (v: string) => onFilterChange({ ...filters, year: v });
  const setStatus = (v: string) => onFilterChange({ ...filters, status: v });
  const setEngineer = (v: string) => onFilterChange({ ...filters, engineer: v });
  const setTeam = (v: string) => onFilterChange({ ...filters, team: v });
  const setActiveOnly = (v: boolean) => onFilterChange({ ...filters, activeOnly: v });
  const setDateFrom = (v: string) => onFilterChange({ ...filters, dateFrom: v });
  const setDateTo = (v: string) => onFilterChange({ ...filters, dateTo: v });

  const uniqueYears = useMemo(() => Array.from(new Set(projects.map(p => String(p.year)))).filter(Boolean).sort(), [projects]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(projects.map(p => p.status))).filter(Boolean).sort(), [projects]);
  const uniqueEngineers = useMemo(() => Array.from(new Set(projects.map(p => p.engineer))).filter(Boolean).sort(), [projects]);
  const uniqueTeams = useMemo(() => Array.from(new Set(projects.map(p => p.installTeam))).filter(Boolean).sort(), [projects]);

  const selectClass = "bg-[#112240] border border-slate-700 text-sm rounded-md px-3 py-1.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-w-0";
  const inputClass = "bg-[#112240] border border-slate-700 text-sm rounded-md px-3 py-1.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-w-0 [color-scheme:dark]";

  return (
    <header className="bg-[#0a192f] text-white shadow-md sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Title + Refresh */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">Electrical Project Dashboard</h1>
              <p className="text-xs text-slate-400">Overview of factory power systems & contracting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onQRClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md px-3 py-1.5 flex items-center gap-2 transition-colors outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              title="สแกน QR Code สำหรับเพิ่ม/อัพเดทข้อมูล"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มข้อมูล</span>
            </button>
            <DarkModeToggle />
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500/50 text-white text-sm rounded-md px-3 py-1.5 flex items-center gap-2 transition-colors outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-t border-slate-700/50 pt-3">
          <select value={year} onChange={e => setYear(e.target.value)} className={selectClass}>
            <option value="">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select value={engineer} onChange={e => setEngineer(e.target.value)} className={selectClass}>
            <option value="">All Engineers</option>
            {uniqueEngineers.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          
          <select value={team} onChange={e => setTeam(e.target.value)} className={selectClass}>
            <option value="">All Teams</option>
            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className={inputClass}
              placeholder="จากวันที่"
              title="จากวันที่"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className={inputClass}
              placeholder="ถึงวันที่"
              title="ถึงวันที่"
            />
          </div>

          <label className="flex items-center gap-1.5 text-sm text-slate-300 cursor-pointer bg-[#112240] px-3 py-1.5 rounded-md border border-slate-700 hover:bg-[#1a365d] transition-colors">
            <input 
              type="checkbox" 
              checked={activeOnly} 
              onChange={e => setActiveOnly(e.target.checked)}
              className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-800"
            />
            <span>Active Progress</span>
          </label>

          {(year || status || engineer || team || activeOnly || dateFrom || dateTo) && (
            <button
              onClick={() => onFilterChange({ year: '', status: '', engineer: '', team: '', activeOnly: false, dateFrom: '', dateTo: '' })}
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white px-2 py-1.5 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
