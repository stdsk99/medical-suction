/* ===== ตั้งค่าแอป วิชาคลินิก: การใช้เครื่องดูดทางการแพทย์อย่างปลอดภัย =====
   ใช้ไฟล์ร่วมกับแอปซ่อม (../css, ../js/score.js, ../js/auth.js, ../js/cert.js, ../js/dia.js)
   app   : ต้องตรงกับ APPS ใน apps-script/Code.gs และ courses.js ของเว็บหลัก
   store : คำนำหน้าคีย์ localStorage ของแอปนี้ */
window.APP_CONFIG = {
  app: "suction-clin",
  store: "suc",
  appName: "Medical Suction Clinical Use",
  portal: "/medtechcenter/",
  sheetUrl: "https://script.google.com/macros/s/AKfycbzLcs08L6W0fnHHZ5tCq8JjkXFPcux3G3_WT1t3vUC8zSo-oQKoACC3xHc67-h-yy6KTw/exec",
  token: "pump-2569",
  course: "ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",
  emptyHint: "ยังไม่มีคะแนน เริ่มจากบทที่ 1 แล้วทำแบบทดสอบท้ายบทให้ผ่านทีละบท",
  reportEmail: "theptharo2019@gmail.com",

  cert: {
    org: ["ศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์"],
    title: "การใช้เครื่องดูดทางการแพทย์อย่างปลอดภัย (Medical Suction Clinical Use)",
    subject: "ของศูนย์การเรียนรู้เทคโนโลยีทางการแพทย์",
    signer: "รศ.ดร.ณัฐดนัย สิงห์คลีวรรณ",
    signerPos: "ผู้จัดทำสื่อการเรียนรู้",
    ref: "SUC"
  },

  /* เกณฑ์ผ่าน (ต้องตรงกับ APPS['suction-clin'].crit ใน Code.gs) */
  criteria: { readLessons: 9, lessonPct: 80, simPct: 80, quizPct: 80, finalN: 20 }
};
