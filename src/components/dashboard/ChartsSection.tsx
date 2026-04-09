import React, { useMemo } from 'react';
import type { ProjectData } from '../../types';
import { formatCurrencyCompact } from '../../utils/format';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
  LineChart, Line
} from 'recharts';

interface ChartsSectionProps {
  projects: ProjectData[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ projects }) => {
  // 1. Doughnut Chart: Project Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.keys(counts).map(status => ({ name: status, value: counts[status] }));
  }, [projects]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 2. Bar Chart: Workload and Contract Value per Team
  const teamData = useMemo(() => {
    const teams: Record<string, { name: string, activeProjects: number, totalValue: number }> = {};
    projects.forEach(p => {
      if (!teams[p.installTeam]) {
        teams[p.installTeam] = { name: p.installTeam, activeProjects: 0, totalValue: 0 };
      }
      teams[p.installTeam].activeProjects += 1;
      teams[p.installTeam].totalValue += p.orderValue;
    });
    return Object.values(teams);
  }, [projects]);

  // 3. Engineer Performance: Contract Value per Engineer
  const engineerData = useMemo(() => {
    const engineers: Record<string, { name: string, totalValue: number, projectCount: number }> = {};
    projects.forEach(p => {
      if (!engineers[p.engineer]) {
        engineers[p.engineer] = { name: p.engineer, totalValue: 0, projectCount: 0 };
      }
      engineers[p.engineer].totalValue += p.orderValue;
      engineers[p.engineer].projectCount += 1;
    });
    return Object.values(engineers).sort((a, b) => b.totalValue - a.totalValue);
  }, [projects]);

  // 3. Line Chart: Monthly Revenue Trend (อ้างอิง orderDate = วันใบเสนอราคา)
  const revenueData = useMemo(() => {
    const months: Record<string, number> = {};
    projects.forEach(p => {
      if (!p.orderDate || p.orderDate.length < 7) return;
      const key = p.orderDate.substring(0, 7); // YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(key)) return;
      months[key] = (months[key] || 0) + p.orderValue;
    });

    const keys = Object.keys(months).sort();
    if (keys.length === 0) return [];

    // เติมเดือนที่ว่างระหว่าง min-max ให้กราฟต่อเนื่อง
    const filled: { name: string; revenue: number }[] = [];
    const start = new Date(keys[0] + '-01');
    const end = new Date(keys[keys.length - 1] + '-01');
    const cursor = new Date(start);

    const thaiShortMonth = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      const label = `${thaiShortMonth[cursor.getMonth()]} ${(y + 543) % 100}`;
      filled.push({ name: label, revenue: months[key] || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return filled;
  }, [projects]);

  // 4. Billing Status: Collected vs Pending
  const billingData = useMemo(() => {
    const collected = projects.reduce((sum, p) => {
      return sum + Object.values(p.billing).filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
    }, 0);
    const pending = projects.reduce((sum, p) => sum + p.orderValue, 0) - collected;
    return [
      { name: 'เก็บเงินแล้ว', value: collected, color: '#10b981' },
      { name: 'ค้างเบิก', value: pending, color: '#f43f5e' }
    ].filter(d => d.value > 0);
  }, [projects]);

  const formatCurrency = formatCurrencyCompact;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Project Status Distribution</h3>
        <div className="flex-1 min-h-0 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-1.5">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip wrapperClassName="text-sm shadow-md rounded-md border-0" />
                <Legend className="text-xs" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Contract Value per Team</h3>
        <div className="flex-1 min-h-0 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-1.5">
          {teamData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <BarTooltip formatter={(value: any) => formatCurrency(Number(value))} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="totalValue" name="Contract Value" fill="#0f2e53" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Monthly Revenue Trend</h3>
        <div className="flex-1 min-h-0 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-1.5">
           {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <BarTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
           ) : (
             <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
           )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Billing Status</h3>
        <div className="flex-1 min-h-0 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-1.5">
          {billingData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={billingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  labelLine={false}
                >
                  {billingData.map((entry, index) => (
                    <Cell key={`cell-billing-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 px-2">
          {billingData.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{d.name}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(d.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-80 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Engineer Performance</h3>
        <div className="flex-1 min-h-0 border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-1.5">
          {engineerData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineerData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} width={50} />
                <BarTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Bar dataKey="totalValue" name="Contract Value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2 px-1">
          {engineerData.slice(0, 6).map(d => (
            <div key={d.name} className="flex flex-col items-center leading-tight">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{d.name}</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{d.projectCount} โครงการ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
