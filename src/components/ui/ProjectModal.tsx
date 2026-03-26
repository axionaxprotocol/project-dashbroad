import React, { useEffect } from 'react';
import { X, Calendar, User, Users, FileText, TrendingUp } from 'lucide-react';
import type { ProjectData } from '../../types';
import { formatCurrency } from '../../utils/format';

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!project) return null;

  const billingPhases = [
    { label: 'งวดที่ 1', ...project.billing.phase1 },
    { label: 'งวดที่ 2', ...project.billing.phase2 },
    { label: 'งวดที่ 3', ...project.billing.phase3 },
    { label: 'งวดที่ 4', ...project.billing.phase4 },
  ];

  const totalBilled = billingPhases.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const totalUnbilled = billingPhases.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0a192f] text-white px-5 py-4 rounded-t-2xl flex items-start justify-between">
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-bold leading-tight truncate">{project.projectName}</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{project.customer}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem icon={<FileText className="w-4 h-4" />} label="Quotation" value={project.quotationNumber} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Year" value={project.year} />
            <InfoItem icon={<User className="w-4 h-4" />} label="Engineer" value={project.engineer} />
            <InfoItem icon={<Users className="w-4 h-4" />} label="Team" value={project.installTeam} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Order Date" value={project.orderDate} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Deadline" value={project.deadline || '-'} />
          </div>

          {/* Status & Progress */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-800">{project.status}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Order Value</span>
              <span className="font-bold text-blue-700">{formatCurrency(project.orderValue)}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-slate-800">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Billing Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Billing Breakdown
            </h3>
            <div className="space-y-1.5">
              {billingPhases.map((phase, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-md px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${phase.paid ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className="text-slate-700">{phase.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-800">{formatCurrency(phase.amount)}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${phase.paid ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                      {phase.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mt-2 pt-2 border-t border-slate-200">
              <span className="text-green-700 font-medium">Collected: {formatCurrency(totalBilled)}</span>
              <span className="text-slate-500 font-medium">Remaining: {formatCurrency(totalUnbilled)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-slate-800 font-medium truncate">{value}</p>
    </div>
  </div>
);
