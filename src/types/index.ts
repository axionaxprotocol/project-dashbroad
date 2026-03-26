export type Engineer = 'ออดี้' | 'โดม' | 'บี' | 'ศศิ';
export type InstallTeam = 'ช่างเกรียง' | 'ช่างเพรียว' | 'ทีม nCNA' | 'แม็ก';
export type ProjectStatus = 'เปิดใบสั่งซื้อ/เซ็นสัญญา' | 'ส่งพิจารณาแล้ว' | 'ยังไม่ได้ส่งเอกสาร';
export type Year = '2025' | '2026';

export interface BillingPhase {
  amount: number;
  paid: boolean;
}

export interface ProjectData {
  id: string;
  projectName: string;
  customer: string;
  quotationNumber: string;
  year: Year;
  status: ProjectStatus;
  engineer: Engineer;
  installTeam: InstallTeam;
  orderValue: number;
  billing: {
    phase1: BillingPhase;
    phase2: BillingPhase;
    phase3: BillingPhase;
    phase4: BillingPhase;
  };
  progress: number; // 0 to 100
  orderDate: string; // YYYY-MM-DD
  deadline?: string; // Delivery Date
}
