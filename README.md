# Electrical Project Dashboard

Dashboard สำหรับติดตามและจัดการข้อมูลโครงการระบบไฟฟ้าโรงงาน พัฒนาด้วย React + TypeScript + Vite

## ฟีเจอร์หลัก

### 📊 KPI Cards
- **Total Order Value** - มูลค่าโครงการรวมทั้งหมด
- **Collected** - ยอดเก็บเงินแล้ว
- **Pending Billing** - ยอดคงเหลือเบิก
- **Active Projects** - โครงการที่กำลังดำเนินการ
- **Unsubmitted** - เอกสารที่ยังไม่ได้ส่ง

### 📈 Charts (5 กราฟ)
1. **Project Status Distribution** - กราฟวงกลมแสดงสัดส่วนสถานะโครงการ
2. **Contract Value per Team** - กราฟแท่งแสดงมูลค่าโครงการตามทีม
3. **Monthly Revenue Trend** - กราฟเส้นแสดงรายได้รายเดือน (อ้างอิงวันใบสั่งซื้อ)
4. **Billing Status** - กราฟวงกลมแสดง % เก็บเงินแล้ว vs ค้างเบิก
5. **Engineer Performance** - กราฟแท่งแนวนอนเปรียบเทียบมูลค่าโครงการตามวิศวกร

### 📋 DataTable
- แสดงข้อมูลโครงการ 9 คอลัมน์
- **Search** - ค้นหาโครงการ, ลูกค้า, หรือเลขใบเสนอราคา
- **Sort** - เรียงลำดับตาม Project Name, Order Value, Progress
- **Pagination** - แบ่งหน้า 10 รายการต่อหน้า
- **Export CSV** - ดาวน์โหลดข้อมูลที่กรองแล้วเป็น CSV
- **Summary Row** - แถวรวมยอด Order Value
- **Status Badge** - แสดงสถานะด้วยสี (เขียว/น้ำเงิน/เหลือง)
- **Click to View** - คลิกแถวเปิด popup รายละเอียดโครงการ

### 🔍 Filters
- **Year** - กรองตามปี
- **Status** - กรองตามสถานะ
- **Engineer** - กรองตามวิศวกร
- **Team** - กรองตามทีม
- **Date Range** - กรองตามช่วงวันที่ใบสั่งซื้อ
- **Active Progress** - แสดงเฉพาะโครงการที่กำลังดำเนินการ (Progress > 0% และ < 100%)
- **Clear** - ปุ่มล้างตัวกรองทั้งหมด

### 🎨 UI Features
- **Dark Mode** - สลับธีมสว่าง/มืด
- **Toast Notifications** - แจ้งเตือนเมื่อโหลดข้อมูลสำเร็จ/ล้มเหลว
- **Auto Refresh** - อัพเดทข้อมูลอัตโนมัติทุก 5 นาที
- **Responsive Design** - รองรับทุกขนาดหน้าจอ

### 📱 เพิ่ม/อัพเดทข้อมูล
- คลิกปุ่ม **"เพิ่มข้อมูล"** (QR Code) ด้านบนขวา
- สแกน QR Code เพื่อเพิ่ม LINE OA
- พิมพ์คำสั่งผ่าน LINE เพื่อเพิ่มหรืออัพเดทข้อมูลโครงการ

## วิธีติดตั้ง

```bash
# Clone repository
git clone <repository-url>
cd Project Dashbroad

# Install dependencies
npm install

# เริ่ม development server
npm run dev

# Build for production
npm run build
```

## วิธีใช้งาน

### ดูข้อมูลโครงการ
1. Dashboard จะโหลดข้อมูลอัตโนมัติเมื่อเปิดหน้า
2. ใช้ Filters ด้านบนเพื่อกรองข้อมูลตามต้องการ
3. คลิกปุ่ม **Refresh** เพื่อโหลดข้อมูลใหม่

### ค้นหาและดูรายละเอียด
1. ใช้ช่อง **Search** เพื่อค้นหาโครงการ
2. คลิกแถวในตารางเพื่อดูรายละเอียดโครงการ
3. ปิด popup โดยคลิกพื้นหลังหรือกดปุ่ม X

### Export ข้อมูล
1. กรองข้อมูลตามต้องการ
2. คลิกปุ่ม **Export** เพื่อดาวน์โหลด CSV

### เพิ่ม/อัพเดทข้อมูล
1. คลิกปุ่ม **"เพิ่มข้อมูล"** (QR Code)
2. สแกน QR Code เพื่อเพิ่ม LINE OA
3. พิมพ์คำสั่งใน LINE:
   - `เพิ่มโครงการ` - เพิ่มโครงการใหม่
   - `อัพเดท` - อัพเดทข้อมูลโครงการ
4. กรอกข้อมูลตามที่ระบบขอ
5. ระบบจะบันทึกและอัพเดทข้อมูลอัตโนมัติ

## เทคโนโลยีที่ใช้

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **Recharts** - Data Visualization
- **Lucide React** - Icons
- **Google Apps Script** - Backend API

## โครงสร้างโปรเจกต์

```
src/
├── components/
│   ├── dashboard/
│   │   ├── KPICards.tsx
│   │   ├── ChartsSection.tsx
│   │   └── DataTable.tsx
│   ├── layout/
│   │   └── Header.tsx
│   └── ui/
│       ├── Toast.tsx
│       ├── ProjectModal.tsx
│       ├── DarkModeToggle.tsx
│       └── QRCodeModal.tsx
├── services/
│   └── api.ts
├── utils/
│   ├── format.ts
│   └── exportCsv.ts
├── types/
│   └── index.ts
└── App.tsx
```

## License

MIT
