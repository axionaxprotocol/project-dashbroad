/**
 * Google Apps Script for LINE Webhook -> Gemini API -> Google Sheets
 * 
 * Instructions:
 * 1. Open your Google Sheet, go to Extensions > Apps Script.
 * 2. Paste this code into Code.gs.
 * 3. Replace LINE_CHANNEL_ACCESS_TOKEN and GEMINI_API_KEY with your actual keys.
 * 4. Replace SHEET_NAME with your specific sheet name (e.g., "Sheet1").
 * 5. Click "Deploy" > "New deployment" > Choose "Web app".
 * 6. Execute as: "Me", Who has access: "Anyone".
 * 7. Copy the Web app URL and put it in your LINE Developers webhook settings.
 * 8. Put the same URL in your React Dashboard's `.env` as `VITE_API_URL`.
 */

const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_TOKEN_HERE';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const SHEET_NAME = 'Sheet1';

// Handle Incoming Webhook from LINE
function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    
    // We only process if it's a message
    if (event.type === 'message') {
      let extractedData = null;

      // If it's a text message (user typing the PO details)
      if (event.message.type === 'text') {
        const userText = event.message.text;
        extractedData = extractDataWithGemini(userText);
      } 
      // If it's an image message (user sending an image of PO)
      else if (event.message.type === 'image') {
        // You would need to fetch the image content via LINE API first, 
        // convert to Base64, and then send it to Gemini Vision.
        // For simplicity, we are logging that we received an image.
        // extractedData = extractDataFromImageWithGemini(imageId);
      }
      
      // If Gemini successfully returns JSON
      if (extractedData) {
        // ดึง ID ของกลุ่ม (หรือ User) เพื่อเอาไว้แทร็คว่ามาจากกลุ่มไหน
        const sourceId = event.source.groupId || event.source.roomId || event.source.userId;
        
        saveToDatabase(extractedData, sourceId);
        replyToLine(event.replyToken, '✅ อัปเดตข้อมูล PO ลงฐานข้อมูลเรียบร้อยแล้ว');
      }
    }
    
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    console.error(error);
    return ContentService.createTextOutput("Error").setMimeType(ContentService.MimeType.TEXT);
  }
}

// Handle request from Dashboard (to display Dashboard data)
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Format the data into JSON array mapping to ProjectData interface
  // Assuming row 1 is headers: [ID, ProjectName, Customer, QUO, Year, Status, Engineer, Team, OrderValue, Progress, OrderDate, Phase1Amount, Phase1Paid, ...]
  const headers = data[0];
  const items = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // This mapping must match your Google Sheets columns precisely
    items.push({
      id: row[0],
      projectName: row[1],
      customer: row[2],
      quotationNumber: row[3],
      year: row[4],
      status: row[5],
      engineer: row[6],
      installTeam: row[7],
      orderValue: row[8],
      progress: row[9] || 0,
      orderDate: (row[10] instanceof Date) ? row[10].toISOString() : String(row[10]),
      deadline: (row[20] instanceof Date) ? row[20].toISOString() : String(row[20] || ''),
      billing: {
        phase1: { amount: parseFloat(row[11]) || 0, paid: row[12] === true || row[12] === 'TRUE' || row[12] === 'Paid' },
        phase2: { amount: row[13], paid: row[14] },
        phase3: { amount: row[15], paid: row[16] },
        phase4: { amount: row[17], paid: row[18] },
      },
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(items))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to call Gemini API to extract unstructured text into clean JSON
function extractDataWithGemini(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `
  คุณคือผู้ช่วยสกัดข้อมูลใบสั่งซื้อ (PO) 
  กรุณาอ่านข้อความต่อไปนี้แล้วสกัดข้อมูลออกมาเป็นรูปแบบ JSON 100% เท่านั้น ห้ามตอบสิ่งอื่น
  โครงสร้าง JSON คือ:
  {
    "projectName": "ชื่อโปรเจกต์ (string)",
    "customer": "ชื่อลูกค้า (string)",
    "quotationNumber": "เลขใบเสนอราคา (string)",
    "year": "2025 หรือ 2026 (string)",
    "status": "เปิดใบสั่งซื้อ/เซ็นสัญญา หรือ ส่งพิจารณาแล้ว หรือ ยังไม่ได้ส่งเอกสาร (string)",
    "engineer": "ออดี้ หรือ โดม หรือ บี หรือ ศศิ (string)",
    "installTeam": "ช่างเกรียง หรือ ช่างเพรียว หรือ ทีม nCNA หรือ แม็ก (string)",
    "orderValue": ยอดมูลค่างาน (number),
    "progress": เปอร์เซ็นต์ความคืบหน้า (number 0-100)
  }
  
  ข้อความ: "${text}"
  `;

  const payload = {
    "contents": [{
      "parts": [{"text": prompt}]
    }],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.candidates && result.candidates.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      return JSON.parse(jsonString);
    }
  } catch (error) {
    console.error("Gemini Error: " + error);
  }
  return null;
}

// Append Data to Google Sheets
function saveToDatabase(data, sourceId = 'Unknown') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  // Example appending logic based on headers described in doGet function
  const row = [
    Utilities.getUuid(), // Generate random ID
    data.projectName,
    data.customer,
    data.quotationNumber,
    data.year,
    data.status,
    data.engineer,
    data.installTeam,
    data.orderValue,
    data.progress,
    new Date(), // Order Date
    // Phase 1-4 dummy data placeholders setup
    0, false, 0, false, 0, false, 0, false,
    sourceId // เพิ่ม Group ID ไว้คอลัมน์สุดท้ายเพื่อเช็คว่ามาจากกลุ่มไหน
  ];
  sheet.appendRow(row);
}

// Reply back to LINE group to confirm
function replyToLine(replyToken, message) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const options = {
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{'type': 'text', 'text': message}]
    })
  };
  UrlFetchApp.fetch(url, options);
}
