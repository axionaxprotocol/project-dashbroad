import type { ProjectData } from '../types';

export function exportProjectsCsv(projects: ProjectData[], filename = 'projects.csv') {
  const headers = [
    'Project Name',
    'Customer',
    'Quotation No.',
    'Year',
    'Status',
    'Engineer',
    'Install Team',
    'Order Value',
    'Progress (%)',
    'Billing Phase1',
    'Billing Phase2',
    'Billing Phase3',
    'Billing Phase4',
    'Order Date',
    'Deadline',
  ];

  const rows = projects.map(p => [
    p.projectName,
    p.customer,
    p.quotationNumber,
    p.year,
    p.status,
    p.engineer,
    p.installTeam,
    p.orderValue,
    p.progress,
    p.billing.phase1.paid ? 'Paid' : 'Unpaid',
    p.billing.phase2.paid ? 'Paid' : 'Unpaid',
    p.billing.phase3.paid ? 'Paid' : 'Unpaid',
    p.billing.phase4.paid ? 'Paid' : 'Unpaid',
    p.orderDate,
    p.deadline ?? '',
  ]);

  const escape = (val: unknown) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
