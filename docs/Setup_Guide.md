# คู่มือการติดตั้งระบบ Dashboard และ LINE Webhook (PO Automation)

คู่มือนี้จะอธิบายขั้นตอนการเชื่อมต่อแบบ End-to-End ตั้งแต่การส่งข้อความลงในกลุ่ม LINE จนถึงการดึงข้อมูลมาแสดงผลบน Dashboard ที่เป็น React (Vite)

---

## 🟢 ส่วนที่ 1: การเตรียมฐานข้อมูลบน Google Sheets
1. ไปที่ [Google Sheets](https://sheets.google.com) และสร้าง Spreadsheets ใหม่ (เช่น `Project Sale 2026`)
2. เปลี่ยนชื่อ Sheet ด้านล่างให้เป็น **`Sheet1`** (หรือชื่ออื่นที่ต้องการ แต่ต้องตรงกับตัวแปร `SHEET_NAME` ในโค้ด Google Apps Script)
3. ใส่หัวข้อ (Header) ในแถวที่ 1 ตั้งแต่คอลัมน์ A ถึง S (ดัดแปลงได้ตามโปรเจกต์) เช่น:
   - A: ID (เอาไว้ใส่ UUID)
   - B: ProjectName
   - C: Customer
   - D: QUO
   - E: Year
   - F: Status
   - G: Engineer
   - H: InstallTeam
   - I: OrderValue
   - J: Progress
   - K: OrderDate
   - L: Phase1Amount
   - M: Phase1Paid
   - N: Phase2Amount
   - O: Phase2Paid ...ไปเรื่อยๆ จนถึง Phase 4

---

## 🟢 ส่วนที่ 2: การสร้าง LINE Bot (Messaging API)
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/) และ Login
2. สร้าง Provider ใหม่ หรือเลือก Provider ที่มีอยู่
3. กด **Create a new channel** แล้วเลือก **Messaging API**
4. กรอกข้อมูลรายละเอียดของ Bot ให้ครบถ้วนแล้วกดยืนยันการสร้าง
5. ไปที่แท็บ **Messaging API** 
   - เลื่อนลงมาหาระบบ "Allow bot to join group chats" -> ให้แก้ไขเป็น **Enabled**
   - เลื่อนลงมาที่ปุ่ม **Issue** ตรง `Channel access token (long-lived)` กด Issue เพื่อสร้าง Token ไปใช้ในขั้นตอนที่ 4
6. เลื่อนขึ้นมาหา Line Official Account Manager (เพื่อไปตั้งค่าปิด Auto-reply) 
   - ให้ไปตั้งค่า "ข้อความตอบกลับอัตโนมัติ (Auto-response messages)" เป็น **ปิด**
   - ตั้งค่า Webhook เป็น **เปิด**

---

## 🟢 ส่วนที่ 3: ขอ API Key จาก Google Gemini
1. ไปที่เว็บไซต์ [Google AI Studio](https://aistudio.google.com/) Login ด้วย Google Account เดียวกับที่ใช้สร้าง Sheets
2. กดปุ่ม **Get API key** ที่เมนูด้านซ้าย
3. กดปุ่ม `Create API key` (หรือสร้างผ่าน Project เก่า)
4. คัดลอก API Key ออกมาเก็บไว้ เตรียมใช้ในขั้นตอนที่ 4

---

## 🟢 ส่วนที่ 4: เชื่อมต่อ Google Apps Script (GAS)
1. กลับมาที่หน้า Google Sheets ของคุณที่สร้างไว้ในหัวข้อที่ 1
2. คลิกเมนู **ส่วนขยาย (Extensions)** > **Apps Script**
3. ลบโค้ดเก่าทิ้งทั้งหมด แล้วก็อปปี้โค้ดจากไฟล์ `docs/GAS_Webhook.js` ไปวางทับลงไป
4. แก้ไขบรรทัดที่ 14-16 นำข้อมูลจากขั้นตอนที่ 2 และ 3 มาใส่:
   ```javascript
   const LINE_CHANNEL_ACCESS_TOKEN = 'เอา Channel Access Token จากขั้นตอนที่ 2 มาใส่';
   const GEMINI_API_KEY = 'เอา Gemini API Key จากขั้นตอนที่ 3 มาใส่';
   const SHEET_NAME = 'Sheet1';
   ```
5. กดปุ่ม **Deploy (เริ่มใช้งาน)** ที่มุมขวาบน ➡️ เลือกลูกศรลง **New deployment (การทำให้ใช้งานได้รายการใหม่)**
6. กดที่ไอคอนตั้งค่ารูปเฟือง (⚙️) ข้างๆ หัวข้อ Select type ➡️ เลือก **Web app**
7. ตั้งค่าการ Deploy ตามนี้:
   - Execute as: **Me (อีเมลของคุณ)** 
   - Who has access: **Anyone (ทุกคน)** *(สำคัญมาก ต้องเป็น Anyone เพื่อให้ LINE และ Web Dashboard วิ่งเข้ามาคุยได้)*
8. กดปุ่ม **Deploy** (หากมีการขอสิทธิ์ Access ให้กดยอมรับและ Allow ให้สิทธิ์)
9. คัดลอก URL ของ Web app ที่ได้ (รูปแบบ `https://script.google.com/macros/s/.../exec`) มาเก็บไว้ 

---

## 🟢 ส่วนที่ 5: นำ URL ไปผูกกลับเข้ากับระบบ

**เชื่อม Webhook URL กลับไปที่ LINE**
1. กลับไปที่หน้า [LINE Developers Console](https://developers.line.biz/console/) ที่หน้าที่เราเปิด Webhook ไว้
2. ไปที่แท็บ **Messaging API**
3. หัวข้อ Webhook settings เปิด `Use webhook` และนำ Web app URL จากขั้นตอนที่ 4 (ด้านบน) มาใส่ในช่อง `Webhook URL` แล้วกด **Update**
4. สามารถกดปุ่ม `Verify` เพื่อทดสอบว่าเชื่อมต่อติดหรือไม่ (ควรขึ้น Success)

**เชื่อม URL กลับไปที่ React Dashboard**
1. ไปที่โปรเจกต์ Dashboard ของคุณ
2. สร้างไฟล์เปล่าๆ ชื่อ `.env` ให้อยู่ระดับเดียวกับ `package.json`
3. พิมพ์ตัวแปรสภาพแวดล้อมลงไป โดยใส่ Web app URL ลงไปแบบนี้:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/xxxx/exec
   ```
4. เซฟไฟล์ `.env` แล้วเปิดเซิร์ฟเวอร์ดูใหม่ (`npm run dev`)

---

## 🎯 วิธีการใช้งานและทดสอบระบบ
1. เพิ่ม LINE Bot ของคุณเข้าไปใน **"กลุ่มห้องแชท"** ที่เซลส์มักจะแจ้งงาน
2. ให้เซลส์หรือทีมงานพิมพ์ข้อความเข้าไปในกลุ่ม เช่น:
   > *"มีโปรเจกต์ใหม่: ระบบไฟฟ้าโรงงานเฟส 1
   > ลูกค้าคือ บริษัท เอ บี ซี จำกัด 
   > ใบเสนอราคา QUO-25-001 ปี 2025 สถานะเปิดใบสั่งซื้อ/เซ็นสัญญา 
   > วิศวกร ออดี้ ทีมช่างเกรียง ยอด 1500000 ความคืบหน้า 0%"*
3. ข้อความนี้จะถูกส่งไปยัง Google Apps Script (Webhook) ➡️ แล้ว GAS จะส่งให้ Gemini ➡️ สกัดข้อมูล ➡️ ไปเขียนลง Google Sheets อัตโนมัติ!
4. บนหน้าเว็บ **React Dashboard** หากกดปุ่ม **Refresh** (มุมขวาบน) รีแอคท์จะดึงข้อมูลที่ถูกเพิ่มใหม่ใน Google Sheets ขึ้นมาโชว์ในกราฟและตารางทันที!
