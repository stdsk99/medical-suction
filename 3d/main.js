/* ===== เครื่องดูดทางการแพทย์แบบ 3 มิติ =====
   หน่วย = เซนติเมตร (ประมาณ) แกน Y ขึ้น ด้านหน้าเครื่องหันไป +Z
   ทุกชิ้นสร้างจากรูปทรงพื้นฐาน เป็นเครื่องจำลองทั่วไป ไม่ได้ใช้โมเดลของผู้ผลิต
   โครงหน้า (กล้อง ป้ายชื่อ แผงด้านขวา โหมดฝึก) ดัดแปลงจากหน้า 3D ของวิชาตู้อบ */
import * as THREE from "three";
import { OrbitControls } from "./lib/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "./lib/CSS2DRenderer.js";

const MODE = "tech";
const PARTS = Object.assign({}, window.PARTS || {}, window.EXTRA3D || {});
const GROUPS = window.GROUPS3D || [];
const NARROW = matchMedia("(max-width:900px), (orientation:portrait) and (max-width:1200px)");
const MOBILE = NARROW.matches;
const R = 34;   // รัศมีโดยประมาณของฉาก ใช้จัดกล้องให้พอดีจอ

/* ---------- renderer / scene ---------- */
const stage = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
stage.prepend(renderer.domElement);
const labelR = new CSS2DRenderer();
labelR.domElement.className = "labels";
stage.appendChild(labelR.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.minDistance = 25; controls.maxDistance = 300;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(60, 120, 90); scene.add(sun);
const fillL = new THREE.DirectionalLight(0xdfe8ff, 0.6); fillL.position.set(-80, 50, -60); scene.add(fillL);
{
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, "rgba(30,40,55,.32)"); gr.addColorStop(1, "rgba(30,40,55,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(-6, 0.05, 0); scene.add(m);
}

/* ---------- วัสดุ ---------- */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.05 }, o));
const M = {
  shell: mat(0xeef0f4), panel: mat(0xdfe7e6), dark: mat(0x3a4250), black: mat(0x1f242b), rubber: mat(0x2b3138, { roughness: 0.9 }),
  steel: mat(0xb8c0c9, { metalness: 0.7, roughness: 0.3 }), pcb: mat(0x1f7a46, { roughness: 0.6 }), chip: mat(0x22262c),
  motor: mat(0x8d99a8, { metalness: 0.5, roughness: 0.35 }), head: mat(0xf2f2ee), diaph: mat(0x0f7a6c),
  muffler: mat(0x6b7684, { roughness: 0.8 }), batt: mat(0x2b3a55), term: mat(0xc0392b), termN: mat(0x1f242b),
  fuse: mat(0xe9eef3, { metalness: 0.3 }), led: mat(0x2fbf71, { emissive: 0x0a3a1e }), ledY: mat(0x9a8a3a), ledR: mat(0x7a3a3a),
  face: mat(0xffffff), needle: mat(0xe8590c), knob: mat(0x2b3138),
  tube: new THREE.MeshStandardMaterial({ color: 0x9cc3dd, transparent: true, opacity: 0.75, roughness: 0.2 }),
  can: new THREE.MeshStandardMaterial({ color: 0xd6eeff, transparent: true, opacity: 0.28, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide }),
  lid: mat(0xe7ecef), fluid: new THREE.MeshStandardMaterial({ color: 0xe0bf5a, transparent: true, opacity: 0.85, roughness: 0.3 }),
  ball: mat(0xffffff, { roughness: 0.3 }), filt: mat(0xffffff, { roughness: 0.4 }), mem: mat(0x0f7a6c),
  adp: mat(0x2b3138), cable: mat(0x1f242b, { roughness: 0.7 }), cover: mat(0xeef0f4)
};

/* ---------- ตัวช่วยสร้างรูปทรง ---------- */
function box(w, h, d, m, x = 0, y = 0, z = 0, parent) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent, seg = 28) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function grp(parent, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
function tag(obj, id) { obj.traverse(o => { if (o.isMesh) o.userData.part = id; }); }
function tube(points, r, m, parent) {
  const c = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const o = new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 10, false), m); if (parent) parent.add(o); return o;
}
const nodes = [];
function reg(node, explode = [0, 0, 0]) {
  node.userData.base = { p: node.position.clone(), r: node.rotation.clone() };
  node.userData.ex = new THREE.Vector3(...explode); node.userData.fx = [];
  nodes.push(node); return node;
}
const partRoot = {}, labelAt = {};

/* ========== ตัวเครื่อง (x −17..17, y 0..22, z −11..11) ========== */
const dev = grp(scene);
const baseG = grp(dev); partRoot.housing = baseG;
box(34, 2, 22, M.shell, 0, 1, 0, baseG);                                    // ฐาน
[[-14, 9], [14, 9], [-14, -9], [14, -9]].forEach(([x, z]) => cyl(1.4, 1.6, 1, M.rubber, x, -0.4, z, baseG));
box(34, 22, 1.2, M.panel, 0, 11, 10.4, baseG);                              // แผงหน้า
box(34, 10, 1, M.shell, 0, 6, -10.5, baseG);                                // ผนังหลังส่วนล่าง
tag(baseG, "housing");
/* ฝาเครื่อง (ถอดได้) */
const coverG = reg(grp(dev), [0, 18, 0]);
const coverParts = [box(34, 1.2, 21, M.cover, 0, 21.4, -0.6, coverG), box(1.2, 20, 21, M.cover, -16.4, 11.5, -0.6, coverG), box(1.2, 20, 21, M.cover, 16.4, 11.5, -0.6, coverG), box(34, 11, 1.2, M.cover, 0, 16.5, -10.6, coverG)];
[-8, -4, 0, 4, 8].forEach(x => box(1.6, 6, 0.4, M.dark, x + 4, 16, -11.3, coverG));   // ช่องลมออก
tag(coverG, "housing"); labelAt.housing = [coverG, [12, 24, 0]];

/* --- แผงควบคุม: เกจ ลูกบิด ไฟ สวิตช์ --- */
const gaugeG = grp(dev, -7, 14, 11.1); partRoot.gauge = gaugeG;
cyl(5, 5, 1, M.dark, 0, 0, 0, gaugeG).rotation.x = Math.PI / 2;
cyl(4.4, 4.4, 1.1, M.face, 0, 0, 0.1, gaugeG).rotation.x = Math.PI / 2;
const needle = box(0.35, 3.6, 0.2, M.needle, 0, 0, 0.8); const needleG = grp(gaugeG, 0, 0, 0); needleG.add(needle); needle.position.set(0, 1.6, 0.8);
tag(gaugeG, "gauge"); labelAt.gauge = [gaugeG, [0, 6.5, 1]];
const knobG = grp(dev, 4, 14, 11.1); partRoot.regulator = knobG;
cyl(2.6, 2.8, 2, M.knob, 0, 0, 0.6, knobG).rotation.x = Math.PI / 2;
box(0.5, 2, 0.4, M.face, 0, 1, 1.7, knobG);
tag(knobG, "regulator"); labelAt.regulator = [knobG, [0, 4.5, 1]];
const ledG = grp(dev, 12, 14, 11.1);
const LED = [cyl(0.7, 0.7, 0.6, M.led, 0, 3, 0.2, ledG), cyl(0.7, 0.7, 0.6, M.ledY, 0, 0.5, 0.2, ledG), cyl(0.7, 0.7, 0.6, M.ledR, 0, -2, 0.2, ledG)];
LED.forEach(l => l.rotation.x = Math.PI / 2);
box(3, 2, 0.8, M.black, 0, -6, 0.3, ledG);
tag(ledG, "board");

/* --- ปั๊มไดอะแฟรม + มอเตอร์ --- */
const pumpG = reg(grp(dev, -2, 8, -2), [0, 16, -6]); partRoot.pump = pumpG;
cyl(4, 4, 10, M.motor, -2, 0, 0, pumpG).rotation.z = Math.PI / 2;
box(6, 8, 8, M.head, 6, 0, 0, pumpG);
const diaph = cyl(3, 3, 0.4, M.diaph, 9.2, 0, 0, pumpG); diaph.rotation.z = Math.PI / 2;
box(14, 1, 9, M.rubber, 1, -4.4, 0, pumpG);
box(1.6, 1, 1.2, M.term, -6, 4, 1, pumpG);            // ตัวตัดความร้อน
tag(pumpG, "pump"); labelAt.pump = [pumpG, [0, 7, 0]];
const rotor = box(0.6, 7, 0.6, M.dark, -7.2, 0, 0); pumpG.add(rotor);

/* --- muffler --- */
const mufG = reg(grp(dev, 11, 8, -7), [12, 10, -8]); partRoot.muffler = mufG;
cyl(2.2, 2.2, 6, M.muffler, 0, 0, 0, mufG).rotation.z = Math.PI / 2;
tag(mufG, "muffler"); labelAt.muffler = [mufG, [0, 4, 0]];

/* --- แผงวงจร (มีฟิวส์ F1 F2) --- */
const boardG = reg(grp(dev, -8, 2.6, 5), [-6, 12, 10]); partRoot.board = boardG;
box(14, 0.8, 8, M.pcb, 0, 0, 0, boardG);
box(4, 1, 3, M.chip, -2, 0.9, 0, boardG);
const fuses = [cyl(0.5, 0.5, 2.4, M.fuse, 4.5, 0.9, -2, boardG), cyl(0.5, 0.5, 2.4, M.fuse, 4.5, 0.9, 1, boardG)];
fuses.forEach(f => f.rotation.z = Math.PI / 2);
tag(boardG, "board"); labelAt.board = [boardG, [0, 3, 0]];

/* --- แบตเตอรี่ --- */
const battG = reg(grp(dev, 10, 5.5, 4.5), [14, 14, 6]); partRoot.battery = battG;
box(11, 7, 6, M.batt, 0, 0, 0, battG); box(1.2, 0.8, 1.2, M.term, -3.5, 3.9, 0, battG); box(1.2, 0.8, 1.2, M.termN, 3.5, 3.9, 0, battG);
tag(battG, "battery"); labelAt.battery = [battG, [0, 5.5, 0]];

/* --- ท่อภายใน: ทางเข้าเครื่อง → ท่อร่วม → ปั๊ม / เกจ / ตัวปรับแรงดัน · ปั๊ม → muffler --- */
const pipes = grp(dev);
tube([[-14, 22, 2.5], [-14, 17, 2], [-4, 17, 2], [2, 17, 2], [4, 12, -2]], 0.55, M.tube, pipes);
tube([[-7, 17, 2], [-7, 14, 9]], 0.4, M.tube, pipes);
tube([[2, 17, 2], [4, 14, 9]], 0.4, M.tube, pipes);
tube([[7, 8, -2], [8, 8, -4], [8.2, 8, -6]], 0.5, M.tube, pipes);
tag(pipes, "pump");

/* --- อะแดปเตอร์และสาย DC (ด้านหลัง) --- */
const pwrG = grp(scene, -4, 2, -24); partRoot.power = pwrG;
box(10, 3.4, 6, M.adp, 0, 0, 0, pwrG);
tube([[0, 0, 3], [0, 0, 8], [-6, 2, 14], [-10, 4, 13], [-12, 4, 11]], 0.4, M.cable, pwrG);
tag(pwrG, "power"); labelAt.power = [pwrG, [0, 3.5, 0]];

/* ========== ชุดขวด (ด้านซ้ายของเครื่อง) ========== */
const canRoot = grp(scene, -26, 0, 3);
const holder = box(2, 14, 8, M.dark, 8, 8, 0, canRoot); tag(holder, "canister");
const canG = reg(grp(canRoot), [-10, 0, 0]); partRoot.canister = canG;
const canBody = cyl(6, 6, 18, M.can, 0, 10, 0, canG); canBody.renderOrder = 2;
cyl(6.05, 6.05, 0.3, M.lid, 0, 1, 0, canG);
const fluid = cyl(5.6, 5.6, 1, M.fluid, 0, 1.6, 0, canG);
const fullRing = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.15, 6, 40), M.needle); fullRing.rotation.x = Math.PI / 2; fullRing.position.y = 16.5; canG.add(fullRing);
tag(canG, "canister"); labelAt.canister = [canG, [-7, 6, 0]];
/* ฝาขวด + กรงลูกลอย (ขยับไปกับขวด และยกขึ้นได้) */
const lidG = reg(grp(canG, 0, 19.6, 0), [0, 10, 0]);
cyl(6.6, 6.6, 2, M.lid, 0, 0, 0, lidG);
cyl(0.9, 0.9, 3, M.lid, -3, 2, 0, lidG);   // ช่อง PATIENT
cyl(0.9, 0.9, 3, M.lid, 3, 2, 0, lidG);    // ช่อง VACUUM
const cage = cyl(1.8, 1.8, 4, new THREE.MeshStandardMaterial({ color: 0x8a96a8, wireframe: true }), 3, -3, 0, lidG);
tag(lidG, "canister");
const floatG = reg(grp(lidG, 3, -3.4, 0), [0, -6, 4]); partRoot.float = floatG;
const ball = new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 14), M.ball); floatG.add(ball);
tag(floatG, "float"); labelAt.float = [floatG, [3.5, 0, 0]];
/* สายผู้ป่วย (ต่อช่อง PATIENT) */
const tubingG = grp(lidG); partRoot.tubing = tubingG;
tube([[-3, 3.4, 0], [-3, 8, 0], [-8, 11, 3], [-16, 6, 8], [-20, 1, 12]], 0.55, M.tube, tubingG);
tag(tubingG, "tubing"); labelAt.tubing = [tubingG, [-14, 9, 6]];
/* ไส้กรอง + สายต่อ (ช่อง VACUUM → ไส้กรอง → ทางเข้าเครื่อง) */
const filtG = reg(grp(scene, -18.5, 26, 3), [0, 8, 6]); partRoot.filter = filtG;
const fb = cyl(1.8, 1.8, 6, M.filt, 0, 0, 0, filtG); fb.rotation.z = Math.PI / 2;
const fm = cyl(1.9, 1.9, 0.5, M.mem, 0, 0, 0, filtG); fm.rotation.z = Math.PI / 2;
tag(filtG, "filter"); labelAt.filter = [filtG, [0, 3, 0]];
const vacTube = tube([[-23, 23, 3], [-23, 25.5, 3], [-22.5, 26, 3], [-21.5, 26, 3]], 0.45, M.tube, scene); tag(vacTube, "filter");
const inTube = tube([[-15.5, 26, 3], [-14.5, 26, 3], [-14, 25, 3], [-14, 22.4, 3]], 0.45, M.tube, scene); tag(inTube, "filter");

/* ---------- การกระทำ (ขยับชิ้นส่วน) ----------
   fx: [โหนด, ระยะเลื่อน [x,y,z], มุมหมุน]  ·  req: ต้องทำการกระทำเหล่านี้ก่อน */
const A = {
  filter:  { on: "ถอดไส้กรองออก", off: "ใส่ไส้กรองกลับ", fx: [[filtG, [0, 6, 8]]] },
  can:     { on: "ปลดขวดออกจากที่ยึด", off: "ใส่ขวดกลับที่ยึด", req: ["filter"], fx: [[canG, [-12, 0, 0]]] },
  lid:     { on: "เปิดฝาขวด", off: "ปิดฝาขวด", req: ["can"], fx: [[lidG, [0, 12, 0]]] },
  float:   { on: "เอาลูกลอยออกจากกรง", off: "ใส่ลูกลอยกลับในกรง", req: ["lid"], fx: [[floatG, [0, -8, 6]]] },
  cover:   { on: "ถอดฝาเครื่อง", off: "ปิดฝาเครื่อง", fx: [[coverG, [0, 20, -6]]] },
  muffler: { on: "ถอด muffler ออก", off: "ใส่ muffler กลับ", req: ["cover"], fx: [[mufG, [8, 8, -4]]] },
  batt:    { on: "ยกแบตเตอรี่ออก", off: "ใส่แบตเตอรี่กลับ", req: ["cover"], fx: [[battG, [10, 12, 4]]] },
  pump:    { on: "ยกชุดปั๊มออก", off: "ใส่ชุดปั๊มกลับ", req: ["cover"], fx: [[pumpG, [0, 16, -2]]] }
};
const PART_ACTIONS = { tubing: [], canister: ["can", "lid"], float: ["float"], filter: ["filter"], regulator: [], gauge: [],
  housing: ["cover"], pump: ["pump"], muffler: ["muffler"], board: ["cover"], battery: ["batt"], power: [] };
for (const k in A) { const a = A[k]; a.t = 0; a.v = 0; (a.fx || []).forEach(([n, dp, dr]) => n.userData.fx.push([a, dp, dr])); }
function isOn(k) { return !!A[k].t; }
function toggle(k) {
  const a = A[k], turnOn = !a.t;
  if (turnOn) { const miss = (a.req || []).filter(r => !A[r].t); if (miss.length) { toast("ต้อง" + A[miss[0]].on + "ก่อน"); return; } }
  else { const dep = Object.keys(A).find(o => A[o].t && (A[o].req || []).includes(k)); if (dep) { toast("ต้อง" + A[dep].off + "ก่อน"); return; } }
  if (turnOn && running) stopRun("หยุดเครื่องก่อนถอดชิ้นส่วน");
  a.t = turnOn ? 1 : 0; refresh();
  if (window.Task3D) Task3D.onToggle(k, turnOn);
}

/* ---------- เดินเครื่อง: อากาศ (ฟ้า) และเสมหะ (เหลือง) ---------- */
const P = v => new THREE.Vector3(...v);
const airCurve = new THREE.CatmullRomCurve3([[-23, 18, 3], [-23, 23, 3], [-23, 25.5, 3], [-21.5, 26, 3], [-18.5, 26, 3], [-15.5, 26, 3], [-14, 25, 3], [-14, 22, 2.5], [-14, 17, 2],
  [-4, 17, 2], [2, 17, 2], [4, 12, -2], [4, 8, -2], [7, 8, -2], [8.2, 8, -6], [11, 8, -7], [14, 8, -7], [18, 8, -9], [26, 8, -15]].map(P));
const liqCurve = new THREE.CatmullRomCurve3([[-46, 20.6, 15], [-42, 25.6, 11], [-34, 30.6, 6], [-29, 27.6, 3], [-29, 23, 3], [-29, 16, 3], [-28.5, 6, 3]].map(P));
const NA = MOBILE ? 50 : 90, NL = MOBILE ? 18 : 32;
const fGeo = new THREE.BufferGeometry();
fGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NA + NL) * 3), 3));
fGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array((NA + NL) * 3), 3));
const flowPts = new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false }));
flowPts.visible = false; flowPts.renderOrder = 3; scene.add(flowPts);
const fu = Array.from({ length: NA + NL }, (_, i) => i < NA ? i / NA : (i - NA) / NL);
const cAir = new THREE.Color(0x2f6fb0), cLiq = new THREE.Color(0xd8a62a);
let running = false, fillT = 0.06, fillV = 0.06;
function stepFlow(dt) {
  const pos = fGeo.attributes.position.array, col = fGeo.attributes.color.array, blocked = fillV > 0.9;
  for (let i = 0; i < NA + NL; i++) {
    const air = i < NA;
    if (blocked && !air) { pos[i * 3 + 1] = -50; continue; }
    fu[i] = (fu[i] + dt * (air ? (blocked ? 0.03 : 0.12) : 0.18)) % 1;
    let u = fu[i];
    if (air && blocked && u < 0.35) { pos[i * 3 + 1] = -50; continue; }   // ลูกลอยปิด: ไม่มีลมจากขวด
    const p = (air ? airCurve : liqCurve).getPointAt(u);
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    const c = air ? cAir : cLiq; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  fGeo.attributes.position.needsUpdate = true; fGeo.attributes.color.needsUpdate = true;
}
const GMAX = 760; let gaugeV = 0, gaugeT = 0;
function setNeedle(v) { needleG.rotation.z = -(-120 + 240 * v / GMAX) * Math.PI / 180; }

/* ---------- ป้ายชื่อ ---------- */
const SHORT = { tubing: "สายผู้ป่วย", canister: "ขวดเก็บ", float: "ลูกลอยกันล้น", filter: "ไส้กรอง", regulator: "ตัวปรับแรงดัน", gauge: "เกจ",
  housing: "ฝาเครื่อง", pump: "ปั๊มไดอะแฟรม", muffler: "muffler", board: "แผงวงจร + ฟิวส์", battery: "แบตเตอรี่", power: "อะแดปเตอร์" };
const labels = {}, labelObj = {};
for (const id in labelAt) {
  const [node, p] = labelAt[id];
  const el = document.createElement("div"); el.className = "lbl"; el.textContent = SHORT[id] || id;
  el.addEventListener("pointerdown", e => e.stopPropagation());
  el.addEventListener("click", e => { e.stopPropagation(); select(id); });
  const o = new CSS2DObject(el); o.position.set(...p); node.add(o); labels[id] = el; labelObj[id] = o;
}
const INSIDE = { pump: "cover", muffler: "cover", board: "cover", battery: "cover" };
let coverMode = 0;
function labelVis() { for (const id in INSIDE) labelObj[id].visible = selected === id || exV > 0.25 || A[INSIDE[id]].v > 0.5 || coverMode > 0; }

/* ---------- เลือกชิ้นส่วน ---------- */
const selBox = new THREE.BoxHelper(undefined, 0xe8590c); selBox.visible = false; selBox.material.depthTest = false; selBox.renderOrder = 5; scene.add(selBox);
let selected = null;
function select(id) {
  selected = id;
  for (const k in labels) labels[k].classList.toggle("sel", k === id);
  if (id && partRoot[id]) { selBox.setFromObject(partRoot[id]); selBox.visible = true; } else selBox.visible = false;
  renderSide();
}
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) { down = null; return; }
  down = null; const hit = pick(e); select(hit ? hit.object.userData.part : null);
});
renderer.domElement.addEventListener("pointermove", e => { if (e.buttons) return; renderer.domElement.style.cursor = pick(e) ? "pointer" : "grab"; });
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(scene.children, true).filter(h => h.object.isMesh && h.object.visible && h.object.userData.part);
  const solid = hits.find(h => h.object.material !== M.can && !(coverMode === 1 && coverParts.includes(h.object)));
  return solid || hits[0] || null;
}

/* ---------- แผงด้านขวา ---------- */
const side = document.getElementById("side");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function groupOf(id) { const g = GROUPS.find(g => g.ids.includes(id)); return g ? g.t : ""; }
function renderSide() {
  side.parentElement.scrollTop = 0;
  if (!selected) {
    side.innerHTML = `<h2>ชิ้นส่วนทั้งหมด</h2><p class="en">หน้าที่ หลักการ อาการเสีย และวิธีตรวจ</p>
      ${GROUPS.map(g => `<div class="grp">${esc(g.t)}</div><div class="plist">${g.ids.map(id => `<button data-id="${id}">${esc(SHORT[id] || id)}</button>`).join("")}</div>`).join("")}
      <p class="note">กด “เดินเครื่อง” เพื่อดูอากาศ (ฟ้า) และเสมหะ (เหลือง) แล้วกด “เติมขวด” เพื่อดูลูกลอยปิดทางลม ลองถอดตามลำดับจริง: ไส้กรอง → ปลดขวด → เปิดฝาขวด → เอาลูกลอยออก ถ้าข้ามขั้น ระบบจะบอกว่าต้องทำอะไรก่อน</p>`;
    side.querySelectorAll("[data-id]").forEach(b => b.onclick = () => select(b.dataset.id));
    return;
  }
  const Pt = PARTS[selected] || {};
  const acts = (PART_ACTIONS[selected] || []).map(k => {
    const on = isOn(k), a = A[k], lock = !on && (a.req || []).some(r => !A[r].t);
    const need = lock ? `<small>ต้อง${esc(A[(a.req || []).find(r => !A[r].t)].on)}ก่อน</small>` : "";
    return `<button data-a="${k}" class="${on ? "on" : ""}${lock ? " lock" : ""}">${esc(on ? a.off : a.on)}${need}</button>`;
  }).join("");
  side.innerHTML = `<button class="link" id="all">← รายการทั้งหมด</button><br>
    <span class="chip">${esc(groupOf(selected))}</span>
    <h2>${esc(Pt.th || SHORT[selected])}</h2><div class="en">${esc(Pt.n || "")}</div>
    <p>${esc(Pt.f || "")}</p>
    ${acts ? `<h3>สั่งให้ขยับ</h3><div class="acts">${acts}</div>` : ""}
    ${Pt.h ? `<h3>หลักการทำงาน</h3><p>${esc(Pt.h)}</p>` : ""}
    ${Pt.x ? `<h3>อาการเสียที่พบบ่อย</h3><ul>${Pt.x.map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    ${Pt.c ? `<h3>วิธีตรวจเบื้องต้น</h3><ol>${Pt.c.map(s => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}`;
  side.querySelector("#all").onclick = () => select(null);
  side.querySelectorAll("[data-a]").forEach(b => b.onclick = () => toggle(b.dataset.a));
}
function refresh() { if (selected) renderSide(); }

let toastT = 0;
function toast(msg, ok) {
  const t = document.getElementById("toast"); t.textContent = msg; t.className = "toast" + (ok ? " ok" : ""); t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800);
}

/* ---------- แถบเครื่องมือ ---------- */
const VIEWS = { iso: [[42, 62, 62], [-6, 10, 0]], front: [[-6, 14, 90], [-6, 12, 0]], side: [[-90, 18, 0], [-6, 12, 0]], top: [[-6, 100, 10], [-6, 10, 0]] };
let camAnim = null, curView = "iso", barH = 0;
function fitPos(v) {
  const [p, t] = VIEWS[v], tv = new THREE.Vector3(...t), dir = new THREE.Vector3(...p).sub(tv).normalize();
  const h = stage.clientHeight || 1, k = Math.max(0.3, (h - barH) / h);
  const vf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * k), hf = 2 * Math.atan(Math.tan(vf / 2) * stage.clientWidth / (h * k));
  const dist = R / Math.sin(Math.min(vf, hf) / 2) * 1.04;
  return [tv.clone().addScaledVector(dir, dist), tv];
}
function view(v, instant) {
  curView = v; const [p1, t1] = fitPos(v);
  if (instant) { camAnim = null; camera.position.copy(p1); controls.target.copy(t1); }
  else camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1, t1 };
  document.querySelectorAll("#views button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
}
document.querySelectorAll("#views button").forEach(b => b.onclick = () => view(b.dataset.v));
const bLbl = document.getElementById("b-lbl");
bLbl.onclick = () => { const on = bLbl.classList.toggle("on"); labelR.domElement.classList.toggle("off", !on); };
const COVER_MODES = ["ปกติ", "โปร่ง", "ซ่อน"];
const bCover = document.getElementById("b-cover");
const coverGlass = new THREE.MeshStandardMaterial({ color: 0xdfe7ee, transparent: true, opacity: 0.18, depthWrite: false });
bCover.onclick = () => {
  coverMode = (coverMode + 1) % 3;
  coverG.children.forEach(o => { if (!o.isMesh) return; o.visible = coverMode < 2; o.material = coverMode === 1 ? coverGlass : (coverParts.includes(o) ? M.cover : M.dark); });
  labels.housing.style.visibility = coverMode < 2 ? "" : "hidden";
  bCover.textContent = "ฝาเครื่อง: " + COVER_MODES[coverMode]; bCover.classList.toggle("on", coverMode > 0);
};
const bAir = document.getElementById("b-air"), bFill = document.getElementById("b-fill");
function stopRun(msg) { running = false; flowPts.visible = false; gaugeT = 0; bAir.classList.remove("on"); bAir.textContent = "▶ เดินเครื่อง"; if (msg) toast(msg); }
bAir.onclick = () => {
  if (running) return stopRun();
  if (Object.keys(A).some(k => A[k].t)) { toast("ประกอบกลับให้ครบก่อนเดินเครื่อง"); return; }
  running = true; flowPts.visible = true; bAir.classList.add("on"); bAir.textContent = "■ หยุดเครื่อง";
  gaugeT = fillT > 0.9 ? 520 : 150;
  toast("เสมหะ (เหลือง) ไหลตามสายลงขวด · อากาศ (ฟ้า) จากฝาขวด → ไส้กรอง → ท่อร่วม → ปั๊ม → muffler ออกด้านหลัง", true);
};
bFill.onclick = () => {
  const full = fillT < 0.9; fillT = full ? 1 : 0.06; bFill.classList.toggle("on", full); bFill.textContent = full ? "เทขวด" : "เติมขวด";
  if (running) gaugeT = full ? 520 : 150;
  if (full) toast("ของเหลวถึงขีดเต็ม ลูกลอยยกขึ้นปิดช่อง VACUUM การดูดหยุดเอง เกจขึ้นสูงแต่ปลายสายไม่ดูด", true);
};
const exInput = document.getElementById("explode");
let exT = 0, exV = 0;
exInput.oninput = () => { if (window.Task3D && Task3D.active()) { exInput.value = 0; toast("โหมดฝึก: ปิดการแยกชิ้นส่วนอัตโนมัติ"); return; } if (running) stopRun(); exT = exInput.value / 100; };
document.getElementById("b-reset").onclick = () => {
  if (window.Task3D && Task3D.active()) { toast("โหมดฝึก: ประกอบกลับทีละชิ้นด้วยตัวเอง"); return; }
  for (const k in A) A[k].t = 0; exT = 0; exInput.value = 0; refresh();
};

/* ---------- วนเฟรม ---------- */
const tmpV = new THREE.Vector3();
function applyNodes() {
  for (const n of nodes) {
    const b = n.userData.base;
    n.position.copy(b.p).addScaledVector(n.userData.ex, exV); n.rotation.copy(b.r);
    for (const [a, dp, dr] of n.userData.fx) {
      if (!a.v) continue;
      if (dp) n.position.add(tmpV.set(dp[0], dp[1], dp[2]).multiplyScalar(a.v));
      if (dr) { n.rotation.x += dr[0] * a.v; n.rotation.y += dr[1] * a.v; n.rotation.z += dr[2] * a.v; }
    }
  }
}
const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); labelR.setSize(w, h);
  const tb = document.querySelector(".bar");
  barH = tb && tb.parentElement === stage ? Math.min(tb.offsetHeight + 24, h * 0.4) : 0;
  camera.aspect = w / Math.max(h, 1);
  if (barH) camera.setViewOffset(w, h, 0, barH / 2, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
let lastAspect = 0, refitT = 0;
new ResizeObserver(() => {
  resize();
  if (Math.abs(camera.aspect - lastAspect) > 0.15) { lastAspect = camera.aspect; clearTimeout(refitT); refitT = setTimeout(() => view(curView, true), 60); }
}).observe(stage);
resize(); lastAspect = camera.aspect; view("iso", true);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  for (const k in A) { const a = A[k]; a.v += Math.sign(a.t - a.v) * Math.min(Math.abs(a.t - a.v), dt * 2.2); }
  exV += (exT - exV) * Math.min(1, dt * 6);
  applyNodes(); labelVis();
  /* ของเหลวในขวดและลูกลอย */
  fillV += (fillT - fillV) * Math.min(1, dt * 1.5);
  const hgt = Math.max(0.3, 15 * fillV); fluid.scale.y = hgt; fluid.position.y = 1.2 + hgt / 2;
  ball.position.y = fillV > 0.85 ? Math.min(1.6, (fillV - 0.85) / 0.15 * 1.6) : 0;
  /* ปั๊ม เกจ ไฟ */
  if (running) { rotor.rotation.x += dt * 30; diaph.scale.y = 1 + 0.6 * Math.sin(performance.now() / 40); stepFlow(dt); }
  gaugeV += (gaugeT - gaugeV) * Math.min(1, dt * 2.5); setNeedle(gaugeV);
  if (camAnim) {
    camAnim.t = Math.min(1, camAnim.t + dt * 1.4); const e = ease(camAnim.t);
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, e); controls.target.lerpVectors(camAnim.t0, camAnim.t1, e);
    if (camAnim.t >= 1) camAnim = null;
  }
  controls.update();
  if (selBox.visible && selected) selBox.setFromObject(partRoot[selected]);
  renderer.render(scene, camera); labelR.render(scene, camera);
});

const bar = document.querySelector(".bar");
function layout(narrow) {
  if (narrow) document.querySelector(".main").insertBefore(bar, side.parentElement); else stage.appendChild(bar);
  resize(); view(curView, true);
}
layout(MOBILE);
if (MOBILE) { bLbl.classList.remove("on"); labelR.domElement.classList.add("off"); }
NARROW.addEventListener("change", e => layout(e.matches));
document.getElementById("loading").remove();
renderSide();
if (window.Task3D) Task3D.init({ A, MODE, toast, reset: () => { exT = 0; exInput.value = 0; if (running) stopRun(); select(null); } });
window.__sx3d = { A, toggle, select, view };   // ใช้ทดสอบ
