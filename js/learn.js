/* ===== โหมดเรียนรู้: ฉากแอนิเมชันทีละขั้น ===== */
(function(){
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const STAGES = ["อาการ","ตรวจ","วินิจฉัย","ซ่อม","ทดสอบ","สรุป"];
  let muted = false;
  try{ muted = localStorage.getItem("sut-mute")==="1"; }catch(e){}

  /* ---------- ภาพเครื่องดูด (ใช้ร่วมกับโหมดสอบ) ---------- */
  function pumpSVG(){ return SXDIA.svg({cls:"lp"}) + `<div class="sx-cap" aria-live="polite"></div>`; }

  /* ภาพขยายชิ้นส่วน: ชื่อ "ชนิด_สถานะ" เติม " fixed" เพื่อแสดงสภาพหลังแก้ */
  const ZT = {filter:"ภาพขยายไส้กรองแบคทีเรีย", oring:"ภาพขยายฝาขวดและ o-ring", float:"ภาพขยายกรงลูกลอยใต้ฝาขวด", diaph:"ภาพขยายไดอะแฟรมในหัวปั๊ม",
    muffler:"ภาพขยาย muffler", fuse:"ภาพขยายฟิวส์ F1", gauge:"ภาพขยายเกจ (ปิดเครื่อง)", reg:"ภาพขยายช่องอากาศเข้าของตัวปรับแรงดัน", board:"ภาพขยายวงจรชาร์จบนบอร์ด", batt:"ภาพขยายแบตเตอรี่"};
  function zoomSVG(kind){
    const k=kind.split(/[_ ]/)[0]; let b="";
    if(k==="filter") b=`<rect x="20" y="30" width="140" height="44" rx="22" class="zm-f"/><rect x="86" y="32" width="8" height="40" class="zm-wet"/><line x1="90" y1="32" x2="90" y2="72" class="zm-ok zm-new"/>
      <path class="zm-o" d="M0 52 H20 M160 52 H180"/><path class="zm-wet" d="M30 44 q10 -6 20 0 t20 0 v16 q-10 6 -20 0 t-20 0z"/>
      <text x="90" y="92" text-anchor="middle" class="zm-t zm-old zm-bad">เยื่อกรองเปียก อากาศผ่านไม่ได้</text><text x="90" y="92" text-anchor="middle" class="zm-t zm-new">ไส้กรองใหม่ แห้ง ใส่ถูกทิศ</text><text x="90" y="22" text-anchor="middle" class="zm-t">→ ทิศลม →</text>`;
    if(k==="oring") b=`<rect x="20" y="40" width="140" height="22" rx="4" class="zm-f"/><path class="zm-o" d="M24 62 V86 M156 62 V86"/>
      <rect x="24" y="58" width="132" height="5" rx="2.5" class="zm-cr zm-old"/><rect x="24" y="58" width="132" height="5" rx="2.5" class="zm-ok zm-new"/>
      <text x="90" y="30" text-anchor="middle" class="zm-t">ร่อง o-ring ใต้ฝาขวด</text><text x="90" y="100" text-anchor="middle" class="zm-t zm-old zm-bad">ร่องว่าง ไม่มี o-ring</text><text x="90" y="100" text-anchor="middle" class="zm-t zm-new">o-ring ใหม่อยู่ในร่องครบรอบ</text>`;
    if(k==="float") b=`<rect x="20" y="18" width="140" height="14" rx="3" class="zm-f"/><rect x="72" y="32" width="36" height="52" rx="4" class="zm-o" stroke-dasharray="4 3"/>
      <circle cx="90" cy="70" r="12" class="zm-f zm-new"/><text x="90" y="62" text-anchor="middle" class="zm-t zm-old zm-bad">?</text>
      <text x="90" y="100" text-anchor="middle" class="zm-t zm-old zm-bad">กรงว่าง ไม่มีลูกลอย</text><text x="90" y="100" text-anchor="middle" class="zm-t zm-new">ใส่ลูกลอยใหม่ ขยับได้อิสระ</text>`;
    if(k==="diaph") b=`<rect x="20" y="20" width="140" height="64" rx="8" class="zm-f"/><path class="zm-ok" d="M30 52 q30 -22 60 0 q30 22 60 0"/>
      <path class="zm-cr" d="M118 50 l6 -6 l4 8 l6 -6"/><text x="90" y="100" text-anchor="middle" class="zm-t zm-old zm-bad">ไดอะแฟรมฉีกที่ขอบยึด</text><text x="90" y="100" text-anchor="middle" class="zm-t zm-new">ไดอะแฟรมและวาล์วชุดใหม่</text>`;
    if(k==="muffler") b=`<rect x="30" y="30" width="120" height="44" rx="10" class="zm-f"/><g class="zm-dirt"><circle cx="56" cy="46" r="7"/><circle cx="76" cy="58" r="8"/><circle cx="100" cy="44" r="7"/><circle cx="122" cy="58" r="8"/><circle cx="90" cy="60" r="5"/></g>
      <path class="zm-o" d="M10 52 H30 M150 52 H172"/><text x="90" y="96" text-anchor="middle" class="zm-t zm-old zm-bad">คราบจับแน่น อากาศออกไม่สะดวก</text><text x="90" y="96" text-anchor="middle" class="zm-t zm-new">muffler ใหม่</text>`;
    if(k==="fuse") b=`<rect x="30" y="36" width="120" height="32" rx="14" class="zm-f"/><rect x="18" y="34" width="22" height="36" rx="3" class="zm-f"/><rect x="140" y="34" width="22" height="36" rx="3" class="zm-f"/>
      <path class="zm-ok zm-new" d="M40 52 H140"/><path class="zm-o zm-old" d="M40 52 H84 M98 52 H140"/><circle class="zm-dirt zm-old" cx="91" cy="52" r="10"/>
      <text x="90" y="92" text-anchor="middle" class="zm-t zm-old zm-bad">F1 ขาด ไส้ฟิวส์ไหม้</text><text x="90" y="92" text-anchor="middle" class="zm-t zm-new">ฟิวส์ใหม่ขนาดเดิม</text>`;
    if(k==="gauge") b=`<circle cx="90" cy="54" r="40" class="zm-f"/><line x1="90" y1="54" x2="62" y2="28" class="zm-cr zm-old"/><line x1="90" y1="54" x2="58" y2="78" class="zm-ok zm-new"/><circle cx="90" cy="54" r="4"/>
      <text x="56" y="88" class="zm-t">0</text><text x="90" y="104" text-anchor="middle" class="zm-t zm-old zm-bad">ปิดเครื่องแล้วเข็มค้าง 60 mmHg</text><text x="90" y="104" text-anchor="middle" class="zm-t zm-new">เกจใหม่ เข็มอยู่ที่ 0</text>`;
    if(k==="reg") b=`<rect x="40" y="24" width="100" height="56" rx="8" class="zm-f"/><circle cx="90" cy="52" r="12" class="zm-o"/><g class="zm-dirt"><circle cx="84" cy="48" r="5"/><circle cx="95" cy="56" r="5"/><circle cx="92" cy="45" r="3"/></g>
      <text x="90" y="98" text-anchor="middle" class="zm-t zm-old zm-bad">คราบเสมหะแห้งอุดช่องอากาศเข้า</text><text x="90" y="98" text-anchor="middle" class="zm-t zm-new">ทำความสะอาดแล้ว ช่องโล่ง</text>`;
    if(k==="board") b=`<rect x="10" y="20" width="160" height="64" rx="6" fill="#1f6f52" opacity=".85"/><rect x="40" y="36" width="34" height="20" rx="2" fill="#1d2430"/><rect x="100" y="40" width="22" height="14" rx="2" fill="#1d2430"/>
      <circle cx="132" cy="62" r="8" class="zm-dirt zm-old"/><text x="90" y="100" text-anchor="middle" class="zm-t zm-old zm-bad">จุดไหม้ที่วงจรชาร์จ</text><text x="90" y="100" text-anchor="middle" class="zm-t zm-new">บอร์ดใหม่</text>`;
    if(k==="batt") b=`<rect x="34" y="26" width="112" height="56" rx="6" class="zm-f"/><rect x="54" y="18" width="16" height="8"/><rect x="110" y="18" width="16" height="8"/>
      <text x="90" y="52" text-anchor="middle" class="zm-t">SLA 12 V</text><text x="90" y="70" text-anchor="middle" class="zm-t zm-old">ติดตั้งเมื่อ 3 ปีก่อน</text><text x="90" y="70" text-anchor="middle" class="zm-t zm-new">แบตใหม่ ชาร์จเต็ม</text>`;
    return `<svg class="zm zm-${k} ${kind}" viewBox="0 0 180 110" role="img" aria-label="${ZT[k]||""}">${b}</svg>`;
  }

  /* ---------- ใช้สถานะกับภาพ ---------- */
  function applyVis(box, v){
    v = v||{};
    const svg = box.querySelector("svg.sx"); if(!svg) return;
    clearTimeout(box._t1); clearTimeout(box._t2);
    SXDIA.state(svg, v);
    const cap=box.querySelector(".sx-cap"); if(cap) cap.innerHTML=v.cap?`<span>${esc(v.cap)}</span>`:"";
    box.classList.remove("working");
    if(v.later){ box._t2=setTimeout(()=>{ SXDIA.state(svg, Object.assign({}, v, v.later, {later:null})); if(cap&&v.later.cap) cap.innerHTML=`<span>${esc(v.later.cap)}</span>`; if(v.later.beep) beep(); }, v.delay||2400); }
    const ins = box.querySelector(".ins"); if(!ins) return;
    let h="";
    if(v.gauge){ const g=v.gauge, mx=g.max||100, mn=g.min||0;
      h+=`<div class="inst"><div class="inst-n">${esc(g.n)}</div>
      <div class="gauge"><div class="g-fill"></div>${g.th!==undefined?`<div class="g-th" style="left:${Math.min(100,(g.th-mn)/(mx-mn)*100)}%"><span>${esc(g.thl||"เกณฑ์ "+g.th+(g.unit||""))}</span></div>`:""}</div>
      <div class="g-v">0${esc(g.unit||"")}</div></div>`; }
    if(v.meter) h+=`<div class="inst"><div class="inst-n">${esc(v.meter.n)}</div><div class="meter big">${esc(v.meter.v)}</div></div>`;
    if(v.zoom) h+=`<div class="inst"><div class="inst-n">${ZT[v.zoom.split(/[_ ]/)[0]]||""}</div>${zoomSVG(v.zoom)}</div>`;
    ins.innerHTML=h;
    if(v.gauge) animGauge(ins, v.gauge);
  }
  function animGauge(ins,g){
    const f=ins.querySelector(".g-fill"), t=ins.querySelector(".g-v"), mx=g.max||100, mn=g.min||0, u=g.unit||"", dp=g.dp||0;
    const bad = g.bad==="below" ? (x=>x<g.th) : g.bad==="above" ? (x=>x>g.th) : (()=>false);
    const pct = x=>Math.min(100,Math.max(0,(x-mn)/(mx-mn)*100))+"%";
    const fmt = x=>(+x).toFixed(dp);
    const from = g.still ? g.v : (g.from!==undefined?g.from:mn);
    f.style.transition="none"; f.style.width=pct(from);
    f.classList.toggle("bad",bad(from)); t.textContent=fmt(from)+u;
    if(g.still){ f.classList.toggle("bad",bad(g.v)); return; }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      f.style.transition="width 1.6s cubic-bezier(.3,.7,.3,1), background .3s"; f.style.width=pct(g.v);
      const t0=performance.now();
      (function tick(now){ const k=Math.min(1,(now-t0)/1600), e=1-Math.pow(1-k,3), x=from+(g.v-from)*e;
        t.textContent=fmt(x)+u; f.classList.toggle("bad",bad(x)); if(k<1) requestAnimationFrame(tick); })(t0);
    }));
  }

  /* แอนิเมชันพิเศษ แล้วเรียก done เมื่อจบ */
  function runAnim(box, name, done){
    if(name==="work"){
      box.classList.add("working");
      box._t1=setTimeout(()=>{ box.classList.remove("working"); done(); }, 1800);
    }else if(name==="rerun"){
      box._t1=setTimeout(done, 2400);
    }else if(name==="fix"){
      const zm=box.querySelector(".zm"); box.classList.add("working");
      box._t1=setTimeout(()=>{ box.classList.remove("working"); if(zm) zm.classList.add("fixed"); setTimeout(done,500); }, 1600);
    }else done();
  }

  let actx=null;
  function beep(){
    if(muted) return;
    try{
      actx = actx || new (window.AudioContext||window.webkitAudioContext)();
      [0,0.28,0.56].forEach(d=>{
        const o=actx.createOscillator(), g=actx.createGain();
        o.type="square"; o.frequency.value=880; g.gain.value=0.04;
        o.connect(g); g.connect(actx.destination);
        o.start(actx.currentTime+d); o.stop(actx.currentTime+d+0.16);
      });
    }catch(e){}
  }

  /* ---------- ภาพอาการสำหรับโหมดสอบ (ไม่เน้นชิ้นส่วน เพื่อไม่บอกใบ้) ---------- */
  const MINI = {
    "ไม่มีแรงดูด":{run:true, mmHg:520, cap:"มอเตอร์หมุน เกจขึ้น แต่ปลายสายไม่มีแรงดูด"},
    "แรงดูดอ่อน":{run:true, weak:true, mmHg:260, cap:"อุดปลายสาย ลูกบิดสุด แรงดันขึ้นไม่ถึง"},
    "ไม่ชาร์จ ไฟเขียวไม่ติด":{run:false, ac:false, mmHg:0, cap:"เสียบอะแดปเตอร์แล้วไฟเขียวไม่ติด"},
    "ไฟแดงขึ้นเร็ว":{run:true, ac:false, low:true, batt:15, mmHg:300, cap:"ใช้แบตได้ไม่กี่นาที ไฟแดงกะพริบ"},
    "เครื่องหยุดเอง":{run:true, mmHg:420, cap:"เดินเครื่องได้ราว 20 นาทีแล้วหยุดเอง", later:{run:false, hot:true, mmHg:0, cap:"มอเตอร์หยุด ตัวเครื่องร้อน"}, delay:2600},
    "เกจไม่กลับศูนย์":{run:false, mmHg:60, sweep:false, cap:"ปิดเครื่องแล้วเข็มเกจไม่อยู่ที่ 0"},
    "ตั้งแรงดันไม่ได้":{run:true, mmHg:500, cap:"หมุนลูกบิดไปทางลดแล้ว แรงดันยังค้างที่ค่าสูง"},
    "ของเหลวออกทางลมออก":{run:false, fill:100, wet:true, mmHg:0, cap:"ขวดเต็มแต่การดูดไม่หยุด ของเหลวออกทางลมออก"},
    "ไฟเหลืองไม่ติด":{run:false, chg:false, batt:30, mmHg:0, cap:"เสียบไฟชาร์จข้ามคืน ไฟเหลืองไม่ติด"}
  };
  function mini(el, c){
    el.innerHTML = `<div class="lpbox mini">${pumpSVG()}</div>`;
    applyVis(el.querySelector(".lpbox"), MINI[c.alarm]||{run:true, mmHg:300});
  }

  /* ---------- ตัวเล่นฉาก ---------- */
  function start(id, root, hooks){
    const L = window.LEARN.find(x=>x.id===id); if(!L) return;
    const st = {k:0, tries:0, firstOk:0, picked:null, answered:false, log:[]};
    const qs = L.scenes.filter(s=>s.opts).length;

    function stageBar(stage){
      const si=STAGES.indexOf(stage);
      return `<ol class="stepper">${STAGES.map((s,i)=>`<li class="${i<si?"ok":i===si?"on":""}"><span>${i+1}</span>${s}</li>`).join("")}</ol>`;
    }

    function render(){
      const sc = L.scenes[st.k];
      if(!sc){ return summary(); }
      root.innerHTML = `
        <div class="simhead"><button class="ghost" id="ln-back">← รายการเคส</button>
          <div class="meta"><button class="ghost" id="ln-mute" aria-label="เปิด/ปิดเสียง">${muted?"🔇 ปิดเสียง":"🔊 เปิดเสียง"}</button></div></div>
        <h1>${esc(L.n)} <span class="tag">โหมดเรียนรู้</span></h1>
        ${stageBar(sc.stage)}
        <div class="lgrid">
          <div class="lpbox" id="lpbox">${pumpSVG()}<div class="wrk">🔧 กำลังดำเนินการ…</div><div class="ins"></div></div>
          <div class="lstory">
            <div class="kicker">ขั้นที่ ${st.k+1} / ${L.scenes.length} · ${esc(sc.stage)}</div>
            <h2>${esc(sc.title)}</h2>
            <p>${esc(sc.text)}</p>
            ${sc.opts?`<div class="lopts">${sc.opts.map((o,i)=>`<button class="lopt" data-i="${i}">${esc(o.t)}</button>`).join("")}</div>
              <div id="fb"></div>`
            :`<div class="tools"><button class="primary" id="ln-next">${esc(sc.next||"ต่อไป")} →</button></div>`}
          </div>
        </div>`;
      const box=root.querySelector("#lpbox");
      applyVis(box, sc.vis);
      if(sc.vis && sc.vis.beep) beep();
      root.querySelector("#ln-back").onclick=()=>{clearTimeout(box._t1);hooks.onBack();};
      root.querySelector("#ln-mute").onclick=e=>{muted=!muted;try{localStorage.setItem("sut-mute",muted?"1":"0")}catch(_){}
        e.currentTarget.textContent=muted?"🔇 ปิดเสียง":"🔊 เปิดเสียง";};
      const nx=root.querySelector("#ln-next"); if(nx) nx.onclick=()=>{st.k++;st.answered=false;st.tries=0;render();window.scrollTo(0,0);};
      root.querySelectorAll(".lopt").forEach(b=>b.onclick=()=>pick(+b.dataset.i));
    }

    function pick(i){
      const sc=L.scenes[st.k], o=sc.opts[i], box=root.querySelector("#lpbox");
      if(st.answered) return;
      const btns=[...root.querySelectorAll(".lopt")];
      btns.forEach(b=>b.disabled=true);
      btns[i].classList.add("picked");
      const fb=root.querySelector("#fb");
      fb.innerHTML=`<div class="fb wait">กำลังดำเนินการ… ดูภาพเครื่อง</div>`;
      const mob = window.innerWidth<900;
      if(mob) box.scrollIntoView({behavior:"smooth",block:"start"});
      if(o.vis) applyVis(box, o.vis); else applyVis(box, sc.vis);
      if(o.vis && o.vis.beep) beep();
      runAnim(box, o.anim, ()=>{
        if(o.after){ applyVis(box, o.after); if(o.after.beep) beep(); }
        const good = o.ok===true, mid=o.ok==="costly";
        if(good||mid){ st.answered=true; if(st.tries===0&&good) st.firstOk++; st.log.push({t:sc.title, a:(sc.opts.find(x=>x.ok===true)||o).t}); }
        else st.tries++;
        btns[i].classList.add(good?"good":mid?"mid":"bad");
        const last = st.k===L.scenes.length-1;
        fb.innerHTML=`<div class="fb ${good?"good":mid?"mid":"bad"}">
          <b>${good?"✓ ถูกต้อง":mid?"△ ได้ผล แต่ยังไม่ใช่วิธีที่ดีที่สุด":"✗ ยังไม่ใช่"}</b><p>${esc(o.fb)}</p>
          ${good||mid?`<button class="primary" id="ln-go">${last?"ดูสรุป":"ขั้นต่อไป"} →</button>`:`<button id="ln-retry">ลองตัวเลือกอื่น</button>`}</div>`;
        const go=root.querySelector("#ln-go"); if(go) go.onclick=()=>{st.k++;st.answered=false;st.tries=0;render();window.scrollTo(0,0);};
        const rt=root.querySelector("#ln-retry"); if(rt) rt.onclick=()=>{
          applyVis(box, sc.vis); fb.innerHTML="";
          btns.forEach((b,j)=>{ if(!b.classList.contains("bad")) b.disabled=false; b.classList.remove("picked"); });
        };
        if(mob) setTimeout(()=>fb.scrollIntoView({behavior:"smooth",block:"center"}), o.anim||o.vis?900:0);
      });
    }

    function summary(){
      const C = window.SIM.CASES.find(c=>c.id===id);
      window.Score&&Score.record({key:"learn:"+id, mod:(window.APP_CONFIG||{}).simMod?(window.APP_CONFIG.simMod+" (เรียนรู้)"):"3-จำลองซ่อม (เรียนรู้)", item:L.n, score:st.firstOk, max:qs, detail:"ตอบถูกในครั้งแรก"});
      root.innerHTML = `
        <div class="simhead"><button class="ghost" id="ln-back">← รายการเคส</button></div>
        <h1>${esc(L.n)} <span class="tag">โหมดเรียนรู้</span></h1>
        ${stageBar("สรุป")}
        <div class="score ${st.firstOk===qs?"ok":st.firstOk>=qs-2?"mid":"bad"}"><div class="big">${st.firstOk}/${qs}</div><div>ข้อที่ตอบถูกในครั้งแรก</div></div>
        <h2>ลำดับการทำงานที่ถูกต้อง</h2>
        <ol class="recap">${st.log.map(l=>`<li><b>${esc(l.t)}</b><span>${esc(l.a)}</span></li>`).join("")}</ol>
        ${C?`<h2>ข้อคิด</h2><div class="learn"><p>${esc(C.learn)}</p></div>`:""}
        <div class="tools"><button id="ln-again">เรียนเคสนี้ใหม่</button>${C?`<button class="primary" id="ln-exam">ลองทำเคสนี้ในโหมดสอบ →</button>`:""}<button class="ghost" id="ln-list">รายการเคส</button></div>`;
      root.querySelector("#ln-back").onclick=hooks.onBack;
      root.querySelector("#ln-list").onclick=hooks.onBack;
      root.querySelector("#ln-again").onclick=()=>start(id,root,hooks);
      const ex=root.querySelector("#ln-exam"); if(ex) ex.onclick=()=>hooks.onExam(id);
      window.scrollTo(0,0);
    }
    render(); window.scrollTo(0,0);
  }

  window.Learn = {start, mini, has:id=>window.LEARN.some(x=>x.id===id)};
})();
