/* ===== ตั้งค่าแอป =====
   app      : รหัสแอปที่ส่งไปพร้อมคะแนน (ต้องตรงกับ APPS ใน apps-script/Code.gs)
   sheetUrl : URL ของ Google Apps Script (Web app) ตัวเดียวกับทุกวิชาในศูนย์การเรียนรู้
   token    : รหัสระบุแอปให้ตรงกับใน Apps Script
   store    : คำนำหน้าคีย์ localStorage ของแอปนี้ (ต้องตรงกับ APP_KEYS ใน js/api.js ของเว็บหลัก)
*/
window.APP_CONFIG = {
  app: "suction",
  appName: "Medical Suction Repair Trainer",
  store: "sut",
  portal: "/medtechcenter/",   // ที่อยู่เว็บหลัก (โดเมนเดียวกัน) สมัคร/เข้าสู่ระบบ/เปลี่ยนรหัสผ่านทำที่นี่ที่เดียว
  sheetUrl: "https://script.google.com/macros/s/AKfycbzLcs08L6W0fnHHZ5tCq8JjkXFPcux3G3_WT1t3vUC8zSo-oQKoACC3xHc67-h-yy6KTw/exec",
  token: "pump-2569",
  course: "ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",

  /* ชื่อโมดูลที่บันทึกไปกับคะแนน */
  acceptTitle: "โมดูล 5 · ตรวจรับเครื่อง (acceptance testing)", pmTitle: "โมดูล 6 · PM ตามรอบ (inspection and preventive maintenance)",
  simMod: "7-จำลองซ่อม", orderMod: "8-ลำดับขั้นตอน", acceptMod: "5-ตรวจรับเครื่อง", pmMod: "6-PM ตามรอบ", quizMod: "สอบรวม",
  emptyHint: "ยังไม่มีคะแนน เริ่มจากโมดูล 1 แล้วทำสอบท้ายโมดูล",

  pdpa: "ข้าพเจ้ายินยอมให้เก็บชื่อ รหัสหรืออีเมล หน่วยงาน และผลการเรียนในระบบนี้ เพื่อใช้บันทึกผลการเรียน ติดตามความก้าวหน้า และออกใบรับรองเท่านั้น ข้อมูลจะไม่ถูกเปิดเผยต่อบุคคลภายนอก และขอให้ลบข้อมูลได้โดยติดต่อผู้ดูแลระบบ",

  /* ใบประกาศ */
  cert: {
    org: ["ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์"],
    title: "การฝึกซ่อมและบำรุงรักษาเครื่องดูดทางการแพทย์ (Medical Suction)",
    subject: "ของศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",
    signer: "รศ.ดร.ณัฐดนัย สิงห์คลีวรรณ",
    signerPos: "ผู้จัดทำสื่อการเรียนรู้",
    ref: "SUT"
  },

  /* เกณฑ์ผ่าน (ต้องตรงกับ APPS.suction.crit ใน apps-script/Code.gs) */
  criteria: {
    learnCases: 10,
    examCases: 10,
    examAvg: 70,
    quizPct: 80,
    orderTasks: 3,
    clinSimPct: 80, acceptPct: 80, pmPct: 80,  // โมดูล 3 การใช้งานสำหรับช่าง · 5 ตรวจรับ · 6 PM ตามรอบ (ใช้ครั้งที่ดีที่สุด)
    modTests: 8,                               // ผ่านสอบท้ายโมดูลครบ 8 โมดูล
    mqPass: {"mq:safety": 100}                 // โมดูล 4 ด่านความปลอดภัย ต้องถูกครบ 5 ข้อ
  }
};
