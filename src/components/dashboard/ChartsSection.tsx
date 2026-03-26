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

  const formatCurrency = formatCurrencyCompact;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
    </div>
  );
};
