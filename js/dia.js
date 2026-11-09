/* ===== ภาพตัดเครื่องดูดจำลอง (ใช้ร่วมกันทุกโมดูล) =====
   SXDIA.svg({id, cls, labels})  คืน SVG ภาพตัดเครื่อง ชิ้นส่วนอยู่ใน <g class="part" data-id="…">
   SXDIA.state(svg, v)           ตั้งสถานะภาพ
     run:true       ปั๊มทำงาน ลมไหล     liq:true   มีเสมหะไหลในสายผู้ป่วย
     fill:0–100     ระดับของเหลวในขวด   float:true ลูกลอยปิดทาง (ดูดหยุด)
     wet:true       ไส้กรองเปียก/อุดตัน  leak:"lid"|"tube"|"pump"  จุดรั่ว (มีเสียงลมรั่ว)
     muffler:true   muffler อุดตัน       weak:true  ปั๊มอ่อนแรง (ลมไหลช้า)
     ac:false       ไม่มีไฟภายนอก (ไฟเขียวดับ)   chg:true ไฟเหลือง (กำลังชาร์จ)   low:true ไฟแดง (แบตต่ำ)
     off:true       เครื่องดับทั้งหมด     hot:true   มอเตอร์ร้อน
     mmHg:ตัวเลข   เข็มเกจ   hi:"id" หรือ ["id",…]  เน้นชิ้นส่วน
   ชิ้นส่วน: tubing canister float filter regulator gauge pump muffler board battery power */
(function(){
  const GMAX = 760;   // เต็มสเกลเกจ (mmHg)
  function ticks(){
    let s="";
    for(let v=0; v<=GMAX; v+=95){
      const a=(-120+240*v/GMAX)*Math.PI/180, x1=214+Math.sin(a)*25, y1=64-Math.cos(a)*25, x2=214+Math.sin(a)*21, y2=64-Math.cos(a)*21;
      s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return s;
  }
  function svg(o){
    o=o||{};
    const L=o.labels!==false, id=o.id?` id="${o.id}"`:"";
    const t=(x,y,s,a)=>L?`<text class="lbl s" x="${x}" y="${y}"${a?` text-anchor="${a}"`:""}>${s}</text>`:"";
    return `<svg${id} class="dia sx ${o.cls||""}" viewBox="0 0 360 300" role="img" aria-label="ภาพตัดเครื่องดูดจำลอง: สายผู้ป่วยต่อเข้าขวดเก็บที่มีลูกลอยกันล้น ทางลมจากฝาขวดผ่านไส้กรองแบคทีเรียเข้าตัวเครื่อง ในตัวเครื่องมีท่อร่วมต่อเกจ ตัวปรับแรงดัน และปั๊มไดอะแฟรม ลมออกทาง muffler ด้านล่างมีแผงวงจร แบตเตอรี่ ฟิวส์ และอะแดปเตอร์ไฟ">
  <defs><marker id="sxar${o.id||""}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="sx-arh"/></marker></defs>
  <!-- สายผู้ป่วย -->
  <g class="part" data-id="tubing">
    <rect class="hit" x="0" y="26" width="48" height="96" rx="6"/>
    <path class="sx-tube" d="M4 36 H36 V110"/>
    <path class="sx-liq" d="M4 36 H36 V110"/>
    ${t(6,28,"สายผู้ป่วย")}
  </g>
  <!-- ขวดเก็บ -->
  <g class="part" data-id="canister">
    <rect class="hit" x="12" y="60" width="98" height="196" rx="10"/>
    <rect class="sx-can" x="22" y="78" width="78" height="172" rx="10"/>
    <rect class="sx-fluid" x="24" y="230" width="74" height="18" rx="6"/>
    <rect class="sx-lid" x="16" y="64" width="90" height="16" rx="4"/>
    <line class="sx-full" x1="26" y1="104" x2="96" y2="104"/>
    ${t(61,270,"ขวดเก็บ 800 mL","middle")}${t(42,119,"ระดับเต็ม")}
    <g class="sx-leakm lid"><path d="M108 60 q6 -4 10 0 M110 54 q8 -6 14 0"/></g>
  </g>
  <!-- ลูกลอย -->
  <g class="part" data-id="float">
    <rect class="hit" x="64" y="78" width="32" height="38" rx="5"/>
    <rect class="sx-cage" x="70" y="80" width="20" height="30" rx="3"/>
    <circle class="sx-ball" cx="80" cy="102" r="7"/>
  </g>
  <!-- ทางลมฝาขวด → ไส้กรอง -->
  <path class="sx-vtube" d="M80 64 V50 H104 V128 H114"/>
  <path class="sx-air a1" d="M80 64 V50 H104 V128 H114" marker-end="url(#sxar${o.id||""})"/>
  <g class="sx-leakm tube"><path d="M96 46 q4 -6 10 -4 M92 40 q6 -8 14 -4"/></g>
  <!-- ไส้กรอง -->
  <g class="part" data-id="filter">
    <rect class="hit" x="110" y="108" width="54" height="40" rx="8"/>
    <rect class="sx-filt" x="114" y="116" width="44" height="24" rx="12"/>
    <line class="sx-mem" x1="136" y1="118" x2="136" y2="138"/>
    ${t(136,110,"ไส้กรอง","middle")}
  </g>
  <path class="sx-vtube" d="M158 128 H174"/>
  <!-- ตัวเครื่อง -->
  <rect class="sx-body" x="174" y="18" width="176" height="268" rx="14"/>
  <rect class="sx-panel" x="180" y="24" width="164" height="88" rx="9"/>
  <!-- ท่อร่วมภายใน -->
  <path class="sx-vtube in" d="M174 128 H300 M214 128 V94 M270 128 V82 M271 128 V164"/>
  <path class="sx-air a2" d="M158 128 H271 V160" marker-end="url(#sxar${o.id||""})"/>
  <!-- เกจ -->
  <g class="part" data-id="gauge">
    <rect class="hit" x="182" y="30" width="64" height="70" rx="8"/>
    <circle class="sx-gface" cx="214" cy="64" r="30"/>
    <g class="sx-tick">${ticks()}</g>
    <g class="sx-needle"><line x1="214" y1="64" x2="214" y2="42"/><circle cx="214" cy="64" r="3"/></g>
    <text class="sx-gv" x="214" y="86" text-anchor="middle">0</text>
    ${t(214,106,"เกจ mmHg","middle")}
  </g>
  <!-- ตัวปรับแรงดัน -->
  <g class="part" data-id="regulator">
    <rect class="hit" x="246" y="40" width="50" height="58" rx="8"/>
    <circle class="sx-knob" cx="270" cy="64" r="16"/>
    <line class="sx-kptr" x1="270" y1="64" x2="270" y2="51"/>
    ${t(270,96,"ปรับแรงดัน","middle")}
  </g>
  <!-- ไฟสถานะและสวิตช์ -->
  <circle class="sx-led g" cx="328" cy="42" r="4.5"/><circle class="sx-led y" cx="328" cy="60" r="4.5"/><circle class="sx-led r" cx="328" cy="78" r="4.5"/>
  ${L?`<text class="lbl xs" x="320" y="45" text-anchor="end">ไฟ</text><text class="lbl xs" x="320" y="63" text-anchor="end">ชาร์จ</text><text class="lbl xs" x="320" y="81" text-anchor="end">แบตต่ำ</text>`:""}
  <rect class="sx-sw" x="318" y="92" width="20" height="12" rx="3"/>
  <!-- ปั๊ม -->
  <g class="part" data-id="pump">
    <rect class="hit" x="200" y="150" width="96" height="70" rx="8"/>
    <rect class="sx-pumpb" x="204" y="156" width="88" height="58" rx="8"/>
    <circle class="sx-motor" cx="228" cy="185" r="17"/>
    <g class="sx-rot"><line x1="228" y1="185" x2="228" y2="172"/><circle cx="228" cy="174" r="3"/></g>
    <rect class="sx-head" x="254" y="164" width="34" height="42" rx="5"/>
    <path class="sx-diaph" d="M258 185 q6 -8 13 0 q6 8 13 0"/>
    <rect class="sx-tco" x="214" y="203" width="12" height="7" rx="2"/>
    ${t(248,230,"ปั๊มไดอะแฟรม + มอเตอร์","middle")}
    <g class="sx-leakm pump"><path d="M292 160 q6 -4 10 0 M294 154 q8 -6 14 0"/></g>
  </g>
  <!-- muffler -->
  <g class="part" data-id="muffler">
    <rect class="hit" x="294" y="168" width="56" height="36" rx="6"/>
    <path class="sx-vtube in" d="M288 186 H300"/>
    <rect class="sx-muf" x="300" y="176" width="38" height="20" rx="6"/>
    <path class="sx-air a3" d="M288 186 H352" marker-end="url(#sxar${o.id||""})"/>
    ${t(319,170,"muffler","middle")}
  </g>
  <!-- ไฟฟ้า: อะแดปเตอร์ แจ็ก ฟิวส์ -->
  <g class="part" data-id="power">
    <rect class="hit" x="112" y="232" width="92" height="44" rx="6"/>
    <rect class="sx-adp" x="116" y="240" width="46" height="26" rx="5"/>
    <path class="sx-cable" d="M162 253 H176"/>
    <rect class="sx-jack" x="174" y="247" width="8" height="12" rx="2"/>
    <rect class="sx-fuse" x="184" y="238" width="16" height="10" rx="3"/><rect class="sx-fuse" x="184" y="256" width="16" height="10" rx="3"/>
    ${t(137,284,"AC/DC adapter","middle")}${t(192,284,"F1 F2","middle")}
  </g>
  <!-- แผงวงจร -->
  <g class="part" data-id="board">
    <rect class="hit" x="204" y="234" width="70" height="44" rx="6"/>
    <rect class="sx-brd" x="208" y="238" width="62" height="36" rx="5"/>
    <rect class="sx-chip" x="226" y="246" width="26" height="14" rx="2"/>
    ${t(239,284,"แผงวงจร","middle")}
  </g>
  <!-- แบตเตอรี่ -->
  <g class="part" data-id="battery">
    <rect class="hit" x="276" y="234" width="70" height="44" rx="6"/>
    <rect class="sx-bat" x="282" y="240" width="56" height="30" rx="4"/>
    <rect class="sx-bl" x="285" y="243" width="50" height="24" rx="2"/>
    <rect class="sx-bt" x="292" y="236" width="8" height="4"/><rect class="sx-bt" x="320" y="236" width="8" height="4"/>
    ${t(311,284,"แบตเตอรี่ 12 V","middle")}
  </g>
  <g class="sx-hiss"><text x="0" y="0"></text></g>
</svg>`;
  }

  function needle(svg, v){
    v=Math.max(0, Math.min(GMAX, +v||0));
    const n=svg.querySelector(".sx-needle"), t=svg.querySelector(".sx-gv");
    if(n) n.setAttribute("transform", `rotate(${(-120+240*v/GMAX).toFixed(1)} 214 64)`);
    if(t) t.textContent=Math.round(v);
  }
  /* เข็มเกจค่อยๆ ขยับไปยังค่าใหม่ */
  function sweep(svg, to, ms){
    const t=svg.querySelector(".sx-gv"); const from=t?+t.textContent||0:0, t0=performance.now(); ms=ms||1400;
    cancelAnimationFrame(svg._raf);
    (function tick(now){ const k=Math.min(1,(now-t0)/ms), e=1-Math.pow(1-k,3); needle(svg, from+(to-from)*e); if(k<1) svg._raf=requestAnimationFrame(tick); })(t0);
  }
  function state(svg, v){
    v=v||{};
    const on=(c,b)=>svg.classList.toggle(c,!!b);
    on("run", v.run && !v.off); on("liq", v.liq && v.run && !v.float && !v.off); on("full", v.float); on("wet", v.wet);
    on("muf", v.muffler); on("weak", v.weak); on("hot", v.hot); on("off", v.off);
    ["lid","tube","pump"].forEach(k=>on("leak-"+k, v.leak===k && v.run && !v.off));
    on("ac", v.ac!==false && !v.off); on("chg", v.chg && !v.off); on("low", v.low && !v.off);
    const f=svg.querySelector(".sx-fluid");
    if(f){ const p=Math.max(0,Math.min(100, v.fill===undefined?(v.float?100:8):v.fill)), top=248-(248-104)*p/100; f.setAttribute("y",top.toFixed(1)); f.setAttribute("height",Math.max(2,248-top).toFixed(1)); }
    const bl=svg.querySelector(".sx-bl"); if(bl){ const lv=v.batt===undefined?100:v.batt; bl.setAttribute("width",(50*lv/100).toFixed(1)); bl.classList.toggle("lowb", lv<25); }
    const hi=[].concat(v.hi||[]);
    svg.querySelectorAll(".part").forEach(p=>p.classList.toggle("hl", hi.includes(p.dataset.id)));
    if(v.mmHg!==undefined){ if(v.sweep===false) needle(svg, v.mmHg); else sweep(svg, v.off?0:v.mmHg); }
  }
  window.SXDIA = {svg, state, needle, sweep, GMAX};
})();
