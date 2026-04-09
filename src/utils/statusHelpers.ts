export type DeadlineStatus = 'overdue' | 'soon' | 'normal';

export const getDeadlineStatus = (deadline?: string, progress?: number): DeadlineStatus => {
  if (!deadline || deadline.trim() === '' || progress === 100) return 'normal';
  const now = new Date();
  const dl = new Date(deadline);
  const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 14) return 'soon';
  return 'normal';
};

export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'เปิดใบสั่งซื้อ/เซ็นสัญญา':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'ส่งพิจารณาแล้ว':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'ยังไม่ได้ส่งเอกสาร':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};
