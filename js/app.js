/* ===== โครงแอปวิชาซ่อมเครื่องดูด: ภาพตัด โมดูล 1–2 คู่มืออาการ (โมดูล 7) ด่านความปลอดภัย (โมดูล 4) และการเปลี่ยนหน้า ===== */
const P = window.PARTS;
const A = window.TROUBLE;
const AN = Object.fromEntries(A.map(a=>[a.id,a]));
const priTh = {h:"งดใช้ทันที",m:"แก้ไขเร็ว",l:"แจ้งเตือน"};
function esc(s){return String(s==null?"":s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}

/* ---------- ภาพตัดในโมดูล 1 และ 2 ---------- */
document.getElementById("fig-ov").innerHTML = SXDIA.svg({id:"svg-ov"}) + `<figcaption>เสมหะถูกดูดตามสายผู้ป่วยลงขวดเก็บ ส่วนอากาศเดินต่อจากฝาขวด ผ่านไส้กรอง เข้าปั๊ม แล้วออกทาง muffler ของเหลวจึงค้างอยู่ในขวด ไม่ผ่านเข้าตัวเครื่อง</figcaption>`;
document.getElementById("fig-cut").innerHTML = SXDIA.svg({id:"svg-cut"}) + `<figcaption>แตะชิ้นส่วนเพื่อดูรายละเอียด เส้นประสีน้ำเงินคือทางอากาศ เส้นสีเหลืองคือเสมหะ</figcaption>`;
const svgOv = document.getElementById("svg-ov"), svgCut = document.getElementById("svg-cut");
SXDIA.state(svgOv, {mmHg:0, sweep:false}); SXDIA.state(svgCut, {mmHg:0, sweep:false});

function runToggle(btn, svg, extra){
  let on=false, full=false;
  const apply=()=>SXDIA.state(svg, Object.assign({run:on, liq:on, mmHg:on?(full?320:150):0, float:full, fill:full?100:on?35:8}, extra?extra():{}));
  btn.onclick=()=>{ on=!on; btn.classList.toggle("on",on); btn.textContent=on?"■ หยุด":"▶ เดินเครื่อง"; apply(); };
  return {setFull(f){ full=f; apply(); }, isOn:()=>on};
}
const ovRun = runToggle(document.getElementById("ov-run"), svgOv, ()=>({hi:svgOv._hi||[]}));
const ovFull = document.getElementById("ov-full");
ovFull.onclick=()=>{ const f=!ovFull.classList.contains("on"); ovFull.classList.toggle("on",f); ovFull.textContent=f?"เทขวดทิ้ง":"เติมขวดจนเต็ม";
  if(f && !ovRun.isOn()) document.getElementById("ov-run").click(); ovRun.setFull(f); };
runToggle(document.getElementById("pt-run"), svgCut, ()=>({hi:selected?[selected]:[]}));

/* ---------- โมดูล 2: แผงชิ้นส่วน ---------- */
const panel=document.getElementById("panel");
const chips=document.getElementById("chips");
Object.entries(P).forEach(([id,o])=>{const b=document.createElement("button");b.textContent=o.th;b.onclick=()=>select(id,true);chips.append(b);});
const chipHTML=chips.outerHTML;
let selected=null;
function select(id,scroll){
  selected=id;
  svgCut.querySelectorAll(".part").forEach(p=>p.classList.toggle("sel",p.dataset.id===id));
  const o=P[id]; if(!o) return;
  const al=(o.a||[]).filter(a=>AN[a]).map(a=>`<a class="pill" href="#repair" data-al="${a}">${esc(AN[a].n)}</a>`).join("");
  panel.innerHTML=`<div class="en">${esc(o.n)}</div><h2>${esc(o.th)}</h2>
    <h3>หน้าที่</h3><p>${esc(o.f)}</p>
    <h3>หลักการทำงาน</h3><p>${esc(o.h)}</p>
    <h3>อาการเสียที่พบบ่อย</h3><ul>${o.x.map(s=>`<li>${esc(s)}</li>`).join("")}</ul>
    <h3>วิธีตรวจเบื้องต้น</h3><ol>${o.c.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>
    ${al?`<h3>อาการที่เกี่ยวข้อง (โมดูล 7)</h3><div>${al}</div>`:""}
    <h3 style="margin-top:18px">ชิ้นส่วนอื่น</h3>${chipHTML}`;
  panel.querySelectorAll("#chips button").forEach((b,i)=>b.onclick=()=>select(Object.keys(P)[i],true));
  panel.querySelectorAll("[data-al]").forEach(a=>a.onclick=()=>{openAlarm=a.dataset.al; repTab("trouble");});
  if(scroll && window.innerWidth<900) panel.scrollIntoView({behavior:"smooth",block:"start"});
}
svgCut.addEventListener("click",e=>{ const p=e.target.closest(".part"); if(p) select(p.dataset.id,true); });
svgOv.addEventListener("click",e=>{ const p=e.target.closest(".part"); if(p && window.Overview && Overview.point) Overview.point(p.dataset.id); });

/* ---------- โมดูล 7: คู่มือวิเคราะห์อาการ ---------- */
let pf="all", openAlarm=null;
const alist=document.getElementById("alist");
function li(arr){return arr.map(s=>`<li>${esc(s)}</li>`).join("");}
document.getElementById("leds").innerHTML = window.LEDS ? `<details class="ov-sec"><summary>ความหมายของไฟสถานะ 3 ดวง</summary><div class="ov-body"><div class="ov-tbl"><table><thead><tr><th>ไฟ</th><th>ติด</th><th>ไม่ติดทั้งที่ควรติด</th></tr></thead><tbody>${
  LEDS.map(l=>`<tr><td><b>${esc(l.n)}</b></td><td>${esc(l.on)}</td><td>${esc(l.off)}</td></tr>`).join("")}</tbody></table></div></div></details>` : "";
function renderAlarms(){
  const q=document.getElementById("q").value.trim().toLowerCase();
  let n=0;
  alist.innerHTML=A.filter(a=>(pf==="all"||a.p===pf)&&(!q||(a.n+a.th+a.u.join()+a.t.join()+(a.r?P[a.r].th:"")).toLowerCase().includes(q))).map(a=>{n++;
    return `<details class="alarm" id="al-${a.id}"${openAlarm===a.id?" open":""}><summary><span class="pri ${a.p}">${priTh[a.p]}</span><span class="t">${esc(a.n)}<small>${esc(a.th)}</small></span></summary>
    <div class="body">
      ${a.u.length?`<h4>สาเหตุจากการใช้งานหรือการประกอบ</h4><ul>${li(a.u)}</ul>`:""}
      ${a.t.length?`<h4>สาเหตุทางเทคนิค</h4><ul>${li(a.t)}</ul>`:""}
      <h4>ลำดับการตรวจ</h4><ol>${li(a.s)}</ol>
      ${a.r?`<a class="pill" href="#parts" data-c="${a.r}">ดูชิ้นส่วน: ${esc(P[a.r].th)}</a>`:""}
    </div></details>`}).join("");
  document.getElementById("aempty").style.display=n?"none":"block";
  alist.querySelectorAll("[data-c]").forEach(a=>a.onclick=()=>{pendingPart=a.dataset.c;});
  if(openAlarm){const el=document.getElementById("al-"+openAlarm);if(el)setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"center"}),50);openAlarm=null;}
}
document.getElementById("q").addEventListener("input",renderAlarms);
document.querySelectorAll("#pf button").forEach(b=>b.onclick=()=>{pf=b.dataset.p;document.querySelectorAll("#pf button").forEach(x=>x.classList.toggle("on",x===b));renderAlarms();});

/* แท็บย่อยในโมดูล 7 และ 8 */
let rpTab="trouble", tsTab="pm";
function repTab(t){ rpTab=t; document.querySelectorAll("#rp-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));
  document.getElementById("trouble-box").hidden=t!=="trouble"; document.getElementById("sim").hidden=t!=="sim";
  if(t==="sim" && window.Sim) Sim.show(); else renderAlarms(); }
function testTab(t){ tsTab=t; document.querySelectorAll("#ts-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));
  document.getElementById("pm").hidden=t!=="pm"; document.getElementById("order").hidden=t!=="order";
  const V=window.Views||{}; if(V[t]) V[t].show(); }
document.querySelectorAll("#rp-tabs button").forEach(b=>b.onclick=()=>{repTab(b.dataset.t);window.scrollTo(0,0);});
document.querySelectorAll("#ts-tabs button").forEach(b=>b.onclick=()=>{testTab(b.dataset.t);window.scrollTo(0,0);});

/* ---------- โมดูล 4: ด่านความปลอดภัย ---------- */
(function(){
  const D=window.SAFETY, root=document.getElementById("safety"); if(!D||!root) return;
  root.innerHTML=`<h1>โมดูล 4 · ด่านความปลอดภัย</h1><p class="muted">${D.intro}</p>
    <div class="sfx">${D.items.map((x,i)=>`<details class="ov-sec"${i===0?" open":""}><summary>${esc(x.t)}</summary><div class="ov-body">${x.b.map(p=>Array.isArray(p)?`<ul>${p.map(s=>`<li>${s}</li>`).join("")}</ul>`:`<p>${p}</p>`).join("")}</div></details>`).join("")}</div>
    <div class="note"><b>ด่านความปลอดภัย:</b> สอบท้ายโมดูลนี้ต้องตอบถูก <b>ครบ 5 ข้อ</b> จึงเปิดโมดูล 5 ได้ สอบซ้ำได้ไม่จำกัด</div>`;
})();

/* ---------- การเปลี่ยนหน้า ---------- */
let pendingPart=null;
function route(){
  const v=(location.hash||"#home").slice(1);
  const names=[...document.querySelectorAll("#nav a")].map(x=>x.dataset.v);
  const name=names.includes(v)?v:"home";
  if(window.MGate){ const g=MGate.guard(name); if(g!==name){ location.replace("#"+g); return; } }
  document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+name));
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.v===name));
  const na=document.querySelector("#nav a.on"); if(na){const nv=document.getElementById("nav"); nv.scrollLeft=na.offsetLeft-nv.clientWidth/2+na.offsetWidth/2;}
  if(name==="repair") repTab(rpTab);
  if(name==="test") testTab(tsTab);
  if(window.Views && window.Views[name]) window.Views[name].show();
  if(name==="parts" && pendingPart){select(pendingPart,false);pendingPart=null;}
  if(window.MGate){ MGate.decorate(); MGate.mount(document.getElementById("v-"+name)); }
  if(!openAlarm) window.scrollTo(0,0);
}
window.addEventListener("hashchange",route);
window.addEventListener("DOMContentLoaded",route);
