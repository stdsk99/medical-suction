/* ===== โมดูล 8: การทดสอบหลังซ่อม (ดัดแปลงจากวิชาตู้อบ) ===== */
(function(){
  const D = window.PM;
  const root = document.getElementById("pm");
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const rnd = (a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
  const r1 = x=>Math.round(x*10)/10, r2=x=>Math.round(x*100)/100;
  let cur = "vac";

  /* ---------- โจทย์ฝึก: สร้างแบบสุ่ม (เกณฑ์ตัวอย่างของเครื่องจำลอง) ---------- */
  const ri=(a,b)=>Math.round(rnd(a,b));
  const GEN = {
    vac(){
      const t=pick(["max","time"]);
      if(t==="max"){ const v=Math.random()<.55?ri(505,560):ri(300,490), p=v>=500;
        return {q:`อุดปลายสาย เปิดลูกบิดสุด เข็มนิ่งที่ ${v} mmHg ภายใน 12 วินาที ผ่านเกณฑ์หรือไม่`, pass:p,
          ex:`เกณฑ์ ≥ 500 mmHg ภายใน 20 วินาที → ${p?"ผ่าน":"ไม่ผ่าน ทดสอบการรั่วแบบอุดทีละช่วงต่อ"}`}; }
      const s=Math.random()<.55?ri(6,19):ri(22,45), p=s<=20;
      return {q:`อุดปลายสาย เปิดลูกบิดสุด เข็มขึ้นถึง 520 mmHg ใช้เวลา ${s} วินาที ผ่านหรือไม่`, pass:p,
        ex:`เกณฑ์ ≤ 20 วินาที → ${p?"ผ่าน":"ไม่ผ่าน ถึงช้าแปลว่ามีการรั่วหรือปั๊มอ่อน"}`};
    },
    leak(){
      const c=pick([
        {a:[230,540,545], w:"ขวด ฝา หรือ o-ring", k:"PATIENT บนฝาขวด"},
        {a:[540,545,548], w:"", k:""},
        {a:[220,225,545], w:"ขวด ฝา o-ring หรือไส้กรอง", k:""},
        {a:[330,335,338], w:"ในตัวเครื่อง (ปั๊ม muffler ท่อภายใน)", k:""}]);
      const [tip,lid,inl]=c.a, p=Math.max(...c.a)-Math.min(...c.a)<=20 && Math.min(...c.a)>=500;
      let where = p?"ไม่มีจุดรั่ว":(tip<lid-20?"สายผู้ป่วย":(lid<inl-20?"ขวด ฝา o-ring หรือไส้กรอง":"ในตัวเครื่อง (ปั๊ม muffler ท่อภายใน)"));
      return {q:`อุดทีละช่วง: ปลายสาย ${tip} · ช่อง PATIENT บนฝาขวด ${lid} · ทางเข้าเครื่อง ${inl} mmHg ผ่านการทดสอบการรั่วหรือไม่`, pass:p,
        ex:`${p?"ทุกช่วงต่างกันไม่เกิน 20 mmHg และ ≥ 500 → ผ่าน":"ไม่ผ่าน จุดที่ต้องตรวจ: "+where}`};
    },
    gauge(){
      const ref=pick([100,200,300,400,500]), e=Math.random()<.55?ri(-30,30):(Math.random()<.5?-1:1)*ri(42,75), disp=ref+e, d=disp-ref, pass=Math.abs(d)<=38;
      return {q:`เกจอ้างอิงอ่านได้ ${ref} mmHg เกจของเครื่องอ่าน ${disp} mmHg (เกจเต็มสเกล 760) ค่าต่างเท่าไร และผ่านหรือไม่`,
        num:{label:"ค่าต่าง = เกจเครื่อง − อ้างอิง (mmHg)", ans:d, tol:0.5}, pass,
        ex:`${disp} − ${ref} = ${d>0?"+":""}${d} mmHg เกณฑ์ ±5% × 760 = ±38 mmHg → ${pass?"ผ่าน":"ไม่ผ่าน "+(d>0?"เกจอ่านสูงกว่าจริง ผู้ป่วยจะได้แรงดันต่ำกว่าที่ตั้ง":"เกจอ่านต่ำกว่าจริง ผู้ป่วยจะได้แรงดันสูงกว่าที่ตั้ง เสี่ยงบาดเจ็บ")}`};
    },
    flow(){
      const v=Math.random()<.55?ri(25,34):ri(10,24), p=v>=25;
      return {q:`เปิดลูกบิดสุด ต่อ flowmeter ที่ปลายสาย อ่านได้ ${v} L/min ผ่านเกณฑ์เครื่องจำลองหรือไม่`, pass:p,
        ex:`เกณฑ์ ≥ 25 L/min → ${p?"ผ่าน":"ไม่ผ่าน ถ้าแรงดันสูงสุดต่ำด้วย สงสัยไดอะแฟรมหรือวาล์วในหัวปั๊ม ถ้าแรงดันสูงสุดปกติ สงสัยทางลมตีบหรือไส้กรองอุด"}`};
    },
    overflow(){
      const c=pick([
        {s:"ดูดน้ำจนถึงขีดเต็ม การดูดหยุดเอง น้ำอยู่ต่ำกว่าช่อง VACUUM และไส้กรองยังแห้ง",p:true,e:"ผ่าน ระบบกันล้นทำงาน"},
        {s:"ดูดน้ำจนเต็มขวดแล้วยังดูดต่อ น้ำขึ้นถึงช่อง VACUUM",p:false,e:"ไม่ผ่าน งดใช้ ตรวจว่ามีลูกลอยและกรงไม่แตก"},
        {s:"การดูดหยุดตั้งแต่น้ำอยู่ราวครึ่งขวด เทน้ำออกแล้วยังดูดไม่ขึ้น",p:false,e:"ไม่ผ่าน ลูกลอยติดค้างด้านบน ทำความสะอาดหรือเปลี่ยนฝา"},
        {s:"การดูดหยุดที่ขีดเต็ม แต่พบว่าไส้กรองมีรอยเปียก",p:false,e:"ไม่ผ่าน ไส้กรองเปียกต้องเปลี่ยน และตรวจว่าลูกลอยปิดสนิทหรือไม่"}]);
      return {q:c.s+" ผ่านหรือไม่", pass:c.p, ex:c.e};
    },
    batt(){
      const t=pick(["time","volt"]);
      if(t==="time"){ const m=Math.random()<.55?ri(20,40):ri(4,18), p=m>=20;
        return {q:`ชาร์จเต็มแล้วเดินเครื่องจากแบตที่แรงดันสูงสุด ไฟแดงติดเมื่อนาทีที่ ${m} ผ่าน battery test หรือไม่`, pass:p,
          ex:`เกณฑ์ ≥ 20 นาทีโดยไฟแดงไม่ติด → ${p?"ผ่าน":"ไม่ผ่าน เปลี่ยนแบต แล้วทดสอบซ้ำหลังชาร์จเต็ม"}`}; }
      const v=r1(Math.random()<.55?rnd(11.6,12.6):rnd(9.8,11.3)), p=v>=11.5;
      return {q:`ระหว่าง battery test วัดแรงดันแบตขณะมอเตอร์ทำงานได้ ${v} V (ไม่มีโหลด 12.7 V) ผ่านหรือไม่`, pass:p,
        ex:`เกณฑ์ขณะทำงาน ≥ 11.5 V → ${p?"ผ่าน":"ไม่ผ่าน แรงดันตกมากเมื่อมีโหลด แบตมีความต้านทานภายในสูง"}`};
    },
    esa(){
      const t=pick(["c2","c1","ap"]);
      if(t==="c2"){ const v=Math.round(pick([rnd(5,90),rnd(110,260)])), p=v<=100;
        return {q:`เครื่องดูด Class II (อะแดปเตอร์ฉนวนสองชั้น) วัด equipment leakage ได้ ${v} µA ผ่านเกณฑ์ IEC 62353 หรือไม่`, pass:p, ex:`เกณฑ์ Class II ≤ 100 µA → ${p?"ผ่าน":"ไม่ผ่าน ตรวจอะแดปเตอร์และฉนวน"}`}; }
      if(t==="c1"){ const v=r2(pick([rnd(0.05,0.28),rnd(0.32,0.8)])), p=v<=0.3;
        return {q:`เครื่องดูดรุ่นสายไฟสามขา (Class I) ความต้านทานสายดินป้องกันวัดได้ ${v} Ω ผ่านหรือไม่`, pass:p, ex:`เกณฑ์ ≤ 0.3 Ω → ${p?"ผ่าน":"ไม่ผ่าน ตรวจสายไฟ ขาดิน และจุดต่อดินในเครื่อง"}`}; }
      const v=Math.round(pick([rnd(5,4000),rnd(5200,8000)])), p=v<=5000;
      return {q:`ส่วนสัมผัสผู้ป่วยชนิด BF วัด applied part leakage ได้ ${v} µA ผ่านหรือไม่`, pass:p, ex:`เกณฑ์ BF ≤ 5,000 µA → ${p?"ผ่าน":"ไม่ผ่าน"}`};
    }
  };

  function practice(id){
    const box=root.querySelector("#pm-pr"), N=5; let i=0, ok=0, q=null, step=0;
    function next(){
      if(i>=N){ box.innerHTML=`<div class="score ${ok>=4?"ok":ok>=3?"mid":"bad"}"><div class="big">${ok}/${N}</div><div>ตอบถูก</div></div><div class="tools"><button class="primary" id="pr-again">ฝึกอีกชุด</button></div>`;
        window.Score&&Score.record({key:"pm:"+id, mod:"8-ทดสอบหลังซ่อม", item:"ฝึกตัดสินผล: "+D.find(x=>x.id===id).n, score:ok, max:N});
        box.querySelector("#pr-again").onclick=()=>practice(id); return; }
      q=GEN[id](); step=q.num?0:1; draw();
    }
    function draw(fb){
      box.innerHTML=`<div class="kicker">ข้อ ${i+1} / ${N}</div><p class="pq">${esc(q.q)}</p>
        ${q.num?`<label class="nlab">${esc(q.num.label)}<input id="pr-n" type="number" step="0.01" inputmode="decimal" ${step>0?"disabled":""}></label>`:""}
        ${step===0?`<div class="tools"><button class="primary" id="pr-c">ตรวจตัวเลข</button></div>`:
          `<div class="tools"><button class="pf" data-v="1">✓ ผ่าน</button><button class="pf" data-v="0">✗ ไม่ผ่าน</button></div>`}
        <div id="pr-fb">${fb||""}</div>`;
      const c=box.querySelector("#pr-c");
      if(c) c.onclick=()=>{ const v=parseFloat(box.querySelector("#pr-n").value);
        if(isNaN(v)){ box.querySelector("#pr-fb").innerHTML=`<div class="msg bad">กรอกตัวเลขก่อน</div>`; return; }
        q.numOk=Math.abs(v-q.num.ans)<=q.num.tol; step=1;
        draw(`<div class="msg ${q.numOk?"ok":"bad"}">${q.numOk?"ตัวเลขถูกต้อง":"ยังไม่ถูก คำตอบคือ "+q.num.ans} · ต่อไปตัดสินว่าผ่านหรือไม่</div>`);
        box.querySelector("#pr-n").value=v; };
      box.querySelectorAll(".pf").forEach(b=>b.onclick=()=>{
        const good=(b.dataset.v==="1")===q.pass && (q.num?q.numOk:true);
        if(good) ok++;
        box.querySelectorAll(".pf").forEach(x=>x.disabled=true);
        box.querySelector("#pr-fb").innerHTML=`<div class="fb ${good?"good":"bad"}"><b>${good?"✓ ถูกต้อง":"✗ ยังไม่ถูก"}</b><p>${esc(q.ex)}</p><button class="primary" id="pr-nx">${i+1<N?"ข้อต่อไป →":"ดูผล"}</button></div>`;
        box.querySelector("#pr-nx").onclick=()=>{i++;next();};
      });
    }
    next();
  }

  /* ---------- เครื่องคำนวณ ---------- */
  function calc(id){
    if(id==="gauge") return `<div class="calc"><h3>เครื่องตัดสินผล</h3>
      <div class="cgrid"><label>เต็มสเกลเกจ (mmHg)<input id="c-fs" type="number" value="760" inputmode="decimal"></label>
      <label>เกจอ้างอิง (mmHg)<input id="c-r" type="number" value="300" inputmode="decimal"></label>
      <label>เกจเครื่อง (mmHg)<input id="c-v" type="number" value="320" inputmode="decimal"></label></div><div id="c-o" class="cout"></div></div>`;
    if(id==="leak") return `<div class="calc"><h3>ตัวช่วยหาจุดรั่ว</h3>
      <div class="cgrid"><label>อุดปลายสาย<input id="c-a" type="number" value="230" inputmode="decimal"></label>
      <label>อุดช่อง PATIENT บนฝาขวด<input id="c-b" type="number" value="235" inputmode="decimal"></label>
      <label>อุดทางเข้าเครื่อง<input id="c-c" type="number" value="545" inputmode="decimal"></label></div><div id="c-o" class="cout"></div></div>`;
    return "";
  }
  function bindCalc(id){
    const $=s=>root.querySelector(s), o=$("#c-o"); if(!o) return;
    const run=()=>{
      if(id==="gauge"){ const fs=+$("#c-fs").value||760, r=+$("#c-r").value, v=+$("#c-v").value, d=v-r, lim=Math.round(fs*0.05), p=Math.abs(d)<=lim;
        o.innerHTML=`ค่าต่าง <b>${d>0?"+":""}${d} mmHg</b> · เกณฑ์ ±${lim} mmHg <span class="pfb ${p?"ok":"bad"}">${p?"ผ่าน":"ไม่ผ่าน"}</span>`; }
      if(id==="leak"){ const a=+$("#c-a").value, b=+$("#c-b").value, c=+$("#c-c").value, ok=Math.max(a,b,c)-Math.min(a,b,c)<=20&&Math.min(a,b,c)>=500;
        const w=ok?"ไม่มีจุดรั่ว":a<b-20?"สายผู้ป่วย":b<c-20?"ขวด ฝา o-ring หรือไส้กรอง":"ในตัวเครื่อง (ปั๊ม muffler ท่อภายใน)";
        o.innerHTML=`<span class="pfb ${ok?"ok":"bad"}">${ok?"ผ่าน":"ไม่ผ่าน"}</span> จุดที่ต้องตรวจ: <b>${w}</b>`; }
    };
    root.querySelectorAll(".calc input").forEach(i=>i.addEventListener("input",run)); run();
  }

  /* ---------- แบบบันทึกผล PM ---------- */
  function form(){
    return `<details class="grp"><summary>แบบบันทึกผลการทดสอบ (คัดลอกไปใช้ได้)</summary><div class="acts" style="display:block">
      <div class="cgrid"><label>เลขครุภัณฑ์<input id="f-id"></label><label>ยี่ห้อ/รุ่น<input id="f-md"></label><label>หน่วยงาน<input id="f-w"></label><label>ผู้ทดสอบ<input id="f-by"></label></div>
      ${D.map(t=>`<label class="fchk"><span>${esc(t.n)}</span><select data-t="${t.id}"><option value="">ไม่ได้ทำ</option><option>ผ่าน</option><option>ไม่ผ่าน</option></select><input data-v="${t.id}" placeholder="ค่าที่วัดได้"></label>`).join("")}
      <div class="tools"><button class="primary" id="f-cp">สร้างข้อความบันทึก</button></div><div id="f-o"></div></div></details>`;
  }
  function bindForm(){
    const b=root.querySelector("#f-cp"); if(!b) return;
    b.onclick=async()=>{
      const v=s=>root.querySelector(s).value.trim();
      const rows=D.map(t=>{const r=root.querySelector(`[data-t="${t.id}"]`).value, m=root.querySelector(`[data-v="${t.id}"]`).value.trim(); return r?`- ${t.n}: ${r}${m?" ("+m+")":""}`:null;}).filter(Boolean);
      const all=rows.length&&rows.every(r=>r.includes(": ผ่าน"));
      const txt=`บันทึกการทดสอบเครื่องดูดทางการแพทย์ (Medical suction)\nวันที่: ${new Date().toLocaleDateString("th-TH")}\nเลขครุภัณฑ์: ${v("#f-id")||"-"} · รุ่น: ${v("#f-md")||"-"} · หน่วยงาน: ${v("#f-w")||"-"}\n${rows.join("\n")||"- ยังไม่ได้เลือกผล"}\nสรุป: ${all?"ผ่าน พร้อมใช้งาน":"ไม่ผ่าน/ไม่ครบ ห้ามใช้งาน"}\nผู้ทดสอบ: ${v("#f-by")||"-"}`;
      const ta=document.createElement("textarea"); ta.className="copybox"; ta.value=txt; root.querySelector("#f-o").replaceChildren(ta);
      try{ await navigator.clipboard.writeText(txt); b.textContent="คัดลอกแล้ว ✓"; }catch(e){ ta.select(); }
    };
  }

  function render(){
    const t=D.find(x=>x.id===cur);
    root.innerHTML=`<h1>โมดูล 8 · การทดสอบหลังซ่อม</h1>
      <p class="muted">ทุกงานซ่อมต้องจบด้วยการทดสอบที่ตรงกับสิ่งที่ซ่อม ก่อนส่งเครื่องกลับไปใช้กับผู้ป่วย เลือกหัวข้อการทดสอบ อ่านวิธีและเกณฑ์ แล้วฝึกตัดสินผลทางขวา (ฝึกได้ไม่จำกัด ไม่นับคะแนนผ่าน) จากนั้นไปแท็บ “ลำดับขั้นตอนงาน”</p>
      <div class="chips pmtabs">${D.map(x=>`<button data-id="${x.id}" data-seen="test|${x.id}" class="${x.id===cur?"on":""}">${esc(x.n)}</button>`).join("")}</div>
      <div class="pmgrid">
        <div>
          <h2>${esc(t.th)}</h2><p>${esc(t.why)}</p>
          <h3>อุปกรณ์</h3><ul>${t.tools.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          <h3>ขั้นตอน</h3><ol>${t.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
          ${t.limits?`<h3>${esc(t.limTitle||"เกณฑ์")}</h3><table class="lim">${t.limits.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>`:""}
          <div class="formula">${esc(t.formula).replace(/\n/g,"<br>")}</div>
          <h3>ข้อควรระวัง</h3><ul>${t.tips.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          ${calc(cur)}
        </div>
        <aside class="logbox"><h2>ฝึกตัดสินผล</h2><div id="pm-pr"></div></aside>
      </div>
      ${form()}`;
    if(window.Seen) Seen.mark("test", cur, root);
    root.querySelectorAll(".pmtabs button").forEach(b=>b.onclick=()=>{cur=b.dataset.id;render();});
    bindCalc(cur); bindForm(); practice(cur);
  }

  window.Views=window.Views||{}; window.Views.pm={show:()=>{ if(!root.innerHTML) render(); }};
})();
