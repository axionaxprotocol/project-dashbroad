import React from 'react';
import type { ProjectData } from '../../types';
import { CircleDollarSign, Receipt, Briefcase, FileWarning, BadgeCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface KPICardsProps {
  projects: ProjectData[];
  onCardClick?: (kpiType: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ projects, onCardClick }) => {
  const totalOrderValue = projects.reduce((sum, p) => sum + p.orderValue, 0);
  
  const collectedBilling = projects.reduce((sum, p) => {
    return sum + Object.values(p.billing)
      .filter(phase => phase.paid)
      .reduce((acc, phase) => acc + phase.amount, 0);
  }, 0);

  const pendingBilling = totalOrderValue - collectedBilling;

  const activeProjects = projects.filter(p => p.progress > 0 && p.progress < 100).length;
  // TODO: Update 'ยังไม่ได้ส่งเอกสาร' to match your actual data status if it changes
  const unsubmittedDocs = projects.filter(p => p.status === 'ยังไม่ได้ส่งเอกสาร').length;

  const kpis = [
    {
      id: 'total',
      title: 'Total Order Value',
      subtitle: 'ยอดสั่งซื้อรวม',
      value: formatCurrency(totalOrderValue),
      icon: <CircleDollarSign className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      id: 'collected',
      title: 'Collected',
      subtitle: 'เก็บเงินแล้ว',
      value: formatCurrency(collectedBilling),
      icon: <BadgeCheck className="w-8 h-8 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      id: 'pending',
      title: 'Pending Billing',
      subtitle: 'คงเหลือเบิก',
      value: formatCurrency(pendingBilling),
      icon: <Receipt className="w-8 h-8 text-rose-600" />,
      bgColor: 'bg-rose-50',
    },
    {
      id: 'active',
      title: 'Active Projects',
      subtitle: 'โครงการที่กำลังดำเนินการ',
      value: activeProjects.toString(),
      icon: <Briefcase className="w-8 h-8 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      clickable: true
    },
    {
      id: 'unsubmitted',
      title: 'Unsubmitted',
      subtitle: 'ยังไม่ได้ส่งเอกสาร',
      value: unsubmittedDocs.toString(),
      icon: <FileWarning className="w-8 h-8 text-amber-600" />,
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, idx) => (
        <div 
          key={idx} 
          onClick={() => kpi.clickable && onCardClick && onCardClick(kpi.id)}
          className={`bg-white dark:bg-slate-800 px-4 py-3.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all duration-200 
            ${kpi.clickable ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-indigo-400 hover:-translate-y-0.5' : ''}`}
          title={kpi.clickable ? `คลิกเพื่อดูเฉพาะ ${kpi.title}` : undefined}
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{kpi.subtitle}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{kpi.value}</h3>
          </div>
          <div className={`${kpi.bgColor} p-2.5 rounded-full flex-shrink-0 ml-3`}>
            {kpi.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
