/* ===== วิดเจ็ตในบทเรียนวิชาคลินิกเครื่องดูด =====
   ใช้ <div data-w="ชื่อ"></div> ในเนื้อหาบท  clin.js จะเรียก Widgets[ชื่อ](el) เมื่อเปิดบท
   flow  : ภาพตัดเครื่อง กดดูการทำงานแต่ละสถานะ (บทที่ 1)
   setp  : ฝึกตั้งแรงดันโดยอุดปลายสาย ตามวัยผู้ป่วย (บทที่ 3 และ 6)
   cath  : คำนวณขนาดสายดูดจากขนาดท่อช่วยหายใจ (บทที่ 6) */
(function(){
  const W={};
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let n=0;

  /* ---------- 1) เครื่องทำงานอย่างไร ---------- */
  W.flow = el=>{
    const id="cw"+(++n);
    const ST=[
      ["ปิดเครื่อง", {off:true, mmHg:0, fill:8}, "เครื่องดับ ไม่มีแรงดูด เข็มเกจอยู่ที่ 0"],
      ["เปิด ยังไม่อุดสาย", {run:true, mmHg:30, fill:8, hi:"pump"}, "ปั๊มดูดลมออกจากขวดตลอดเวลา แต่ปลายสายเปิดอยู่ ลมจากห้องไหลเข้าแทน เกจจึงขึ้นน้อย ค่าที่เห็นตอนนี้ยังไม่ใช่แรงดันที่ตั้งไว้"],
      ["อุดปลายสาย", {run:true, mmHg:120, fill:8, hi:["gauge","regulator"]}, "เมื่ออุดปลายสาย ลมเข้าไม่ได้ ความดันในขวดลดลงจนถึงค่าที่ตัวปรับแรงดันตั้งไว้ เกจจึงแสดงแรงดันดูดสูงสุดที่จะเกิดที่ปลายสาย ใช้วิธีนี้ตรวจแรงดันก่อนดูดทุกครั้ง"],
      ["กำลังดูดเสมหะ", {run:true, liq:true, mmHg:110, fill:35, hi:"canister"}, "เสมหะไหลตามสายเข้าขวดเก็บ ของเหลวตกค้างในขวด ส่วนลมผ่านไส้กรองแบคทีเรียไปที่ปั๊มแล้วออกทางช่องระบายลม"],
      ["ขวดเต็ม", {run:true, float:true, mmHg:300, fill:100, hi:["canister","float"]}, "ของเหลวยกลูกลอยขึ้นปิดทางลม ดูดต่อไม่ได้ทั้งที่เครื่องยังทำงานและเกจอาจขึ้นสูง เป็นกลไกกันของเหลวเข้าเครื่อง ต้องหยุดและเปลี่ยน/เทขวด"],
      ["ไส้กรองเปียก", {run:true, wet:true, mmHg:60, fill:60, hi:"filter"}, "ไส้กรองที่เปียกหรือตันทำให้แรงดูดลดลง และบอกว่าอาจมีของเหลวผ่านเข้าไปใกล้ตัวเครื่อง ต้องเปลี่ยนไส้กรองและแจ้งตรวจเครื่องหากสงสัยว่าของเหลวเข้าเครื่อง"]
    ];
    el.innerHTML=`<div class="wbox"><div class="chips" data-b>${ST.map((s,i)=>`<button data-i="${i}">${esc(s[0])}</button>`).join("")}</div>
      <figure class="wfig">${window.SXDIA?SXDIA.svg({id}):""}</figure><p class="wtxt" data-t></p></div>`;
    const svg=el.querySelector("svg"), t=el.querySelector("[data-t]");
    const go=i=>{ el.querySelectorAll("[data-i]").forEach(b=>b.classList.toggle("primary",+b.dataset.i===i)); if(svg) SXDIA.state(svg, ST[i][1]); t.textContent=ST[i][2]; };
    el.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>go(+b.dataset.i));
    go(1);
  };

  /* ---------- 2) ฝึกตั้งแรงดันโดยอุดปลายสาย ---------- */
  const AGE=[
    ["ทารกแรกเกิด", 60, 80], ["ทารก", 80, 100], ["เด็ก", 100, 120], ["ผู้ใหญ่", 100, 150]
  ];
  W.setp = el=>{
    const id="cw"+(++n);
    let age=3, reg=220, occ=false;
    el.innerHTML=`<div class="wbox"><div class="tools"><span class="muted small">ผู้ป่วย:</span><span class="seg" data-a>${AGE.map((a,i)=>`<button data-i="${i}">${a[0]}</button>`).join("")}</span></div>
      <div class="wgrid"><figure class="wfig">${window.SXDIA?SXDIA.svg({id, labels:false}):""}</figure>
      <div><label class="small">หมุนตัวปรับแรงดัน <input type="range" min="0" max="300" step="10" data-r style="width:100%"></label>
      <div class="tools"><button data-o>อุดปลายสาย (พับสาย)</button></div><div data-m></div></div></div></div>`;
    const svg=el.querySelector("svg"), r=el.querySelector("[data-r]"), m=el.querySelector("[data-m]"), ob=el.querySelector("[data-o]");
    r.value=reg;
    const draw=()=>{
      const a=AGE[age], read=occ?reg:Math.round(reg*0.15);
      el.querySelectorAll("[data-a] button").forEach(b=>b.classList.toggle("primary",+b.dataset.i===age));
      ob.textContent=occ?"ปล่อยปลายสาย":"อุดปลายสาย (พับสาย)"; ob.classList.toggle("primary",occ);
      if(svg) SXDIA.state(svg,{run:true, mmHg:read, fill:8, hi:["gauge","regulator"], sweep:false});
      const ok=read>=a[1]&&read<=a[2];
      m.innerHTML=!occ?`<div class="msg">เกจอ่านได้ ${read} mmHg ขณะปลายสายเปิด ค่านี้ยังไม่ใช่แรงดันที่ตั้งไว้ ให้อุดปลายสายก่อนอ่าน</div>`
        : `<div class="msg ${ok?"ok":"bad"}">ขณะอุดปลายสาย เกจอ่านได้ ${read} mmHg · ช่วงตัวอย่างสำหรับ${a[0]} ${a[1]}–${a[2]} mmHg · ${ok?"✓ อยู่ในช่วง ปล่อยปลายสายแล้วเริ่มดูดได้":read>a[2]?"สูงเกินไป หมุนลดลง":"ต่ำเกินไป หมุนเพิ่ม"}</div>`;
    };
    r.oninput=()=>{ reg=+r.value; draw(); };
    ob.onclick=()=>{ occ=!occ; draw(); };
    el.querySelectorAll("[data-a] button").forEach(b=>b.onclick=()=>{ age=+b.dataset.i; draw(); });
    draw();
  };

  /* ---------- 3) ขนาดสายดูดจากขนาดท่อ ---------- */
  W.cath = el=>{
    const FR=[5,6,8,10,12,14,16];
    el.innerHTML=`<div class="wbox"><div class="tools"><label class="small">ขนาดท่อ (เส้นผ่านศูนย์กลางภายใน, mm) <select data-s>${[2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5].map(v=>`<option ${v===7.5?"selected":""}>${v.toFixed(1)}</option>`).join("")}</select></label>
      <span class="seg" data-g><button data-i="0">ทารก (&lt; 70%)</button><button data-i="1">เด็กและผู้ใหญ่ (&lt; 50%)</button></span></div><div data-m></div></div>`;
    let g=1; const s=el.querySelector("[data-s]"), m=el.querySelector("[data-m]");
    const draw=()=>{
      const d=+s.value, fr=d*3, lim=g?0.5:0.7, mx=fr*lim, pick=FR.filter(f=>f<mx-1e-9).pop();
      el.querySelectorAll("[data-g] button").forEach(b=>b.classList.toggle("primary",+b.dataset.i===g));
      m.innerHTML=`<table class="ltbl"><tr><td>ท่อ ${d.toFixed(1)} mm เทียบเป็นเฟรนช์</td><td>${d.toFixed(1)} × 3 = ${fr.toFixed(1)} Fr</td></tr>
        <tr><td>สายดูดต้องเล็กกว่า ${g?"ครึ่งหนึ่ง":"70%"} ของท่อ</td><td>${fr.toFixed(1)} × ${lim} = ${mx.toFixed(1)} Fr</td></tr>
        <tr><td><b>สายมาตรฐานที่ใหญ่ที่สุดที่เล็กกว่าค่านี้</b></td><td><b>${pick?pick+" Fr":"ไม่มีในชุดตัวอย่าง ปรึกษาหน่วยงาน"}</b></td></tr></table>
        <p class="muted small">คิดจากเส้นผ่านศูนย์กลาง (1 mm = 3 Fr) เป็นตัวอย่างการคำนวณ ให้ใช้ตารางขนาดสายของหน่วยงานเป็นหลัก</p>`;
    };
    s.onchange=draw; el.querySelectorAll("[data-g] button").forEach(b=>b.onclick=()=>{ g=+b.dataset.i; draw(); });
    draw();
  };

  window.Widgets = W;
})();
