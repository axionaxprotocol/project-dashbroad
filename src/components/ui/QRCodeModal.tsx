import React from 'react';
import { X, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            เพิ่ม/อัพเดทข้อมูล
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 flex flex-col items-center">
            <div className="w-48 h-48 bg-white rounded-lg p-4 shadow-sm mb-4">
              {/* QR Code Placeholder - ใส่รูป QR Code ของ LINE OA ที่นี่ */}
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center">
                <div className="space-y-2">
                  <QrCode className="w-16 h-16 mx-auto" />
                  <p>วาง QR Code LINE OA ที่นี่</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
              สแกน QR Code เพื่อเพิ่ม LINE OA<br />
              สำหรับเพิ่มและอัพเดทข้อมูลโครงการ
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              วิธีใช้งาน
            </h4>
            <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1.5 list-decimal list-inside">
              <li>สแกน QR Code เพื่อเพิ่มเพื่อน LINE OA</li>
              <li>พิมพ์คำสั่ง <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">เพิ่มโครงการ</code> หรือ <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">อัพเดท</code></li>
              <li>กรอกข้อมูลตามที่ระบบขอ</li>
              <li>ระบบจะบันทึกและอัพเดทข้อมูลอัตโนมัติ</li>
            </ol>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            หรือติดต่อผู้ดูแลระบบโดยตรง
          </div>
        </div>
      </div>
    </div>
  );
};
