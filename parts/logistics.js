/* Meridian: Logistics center walk-in warehouse (lazy part). Loaded the first time a player walks into a logistics center (lcEnter in index.html).
   Runs with a direct eval inside the game's main closure, so it sees S, LCO, lcLayout, ofBox, loadThree and the rest. Keep it one expression that returns the API.
   Layout: x runs across the hall (bays), z runs down its length. The entrance, loading dock and central computer are at the +z end; rack rows go towards -z,
   one row per level, so the building gets longer with every upgrade. Controls match the bunker: W/S forward/back, A/D strafe, arrows or drag to turn, E use. */
(function(){
const BW=2.6,BAYS=LCBAYS,HW=BAYS*BW/2+4.5,ROWP=4.8,RACKD=1.3,RACKH=4.5,DOCK=12,MAXR=80,LVH=1.45;
const W={el:null,on:false,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:0,yaw:0},keys:{},joy:null,near:null,panel:null,raf:0,last:0,city:null,rows:0,len:0,beacon:null,find:null};
const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const rowZ=r=>-(r*ROWP)-ROWP/2;            // centre line of rack row r
const bayX=b=>-BAYS*BW/2+BW/2+b*BW;          // centre of bay b
const zEnd=()=>DOCK;                          // the entrance wall
const zBack=()=>-(W.rows*ROWP)-2;             // the back wall
function css(){if(document.getElementById("lc3-css"))return;const s=document.createElement("style");s.id="lc3-css";s.textContent=`
.lc3{position:fixed;inset:0;z-index:2147483000;background:#0b0f14;font:13px system-ui,sans-serif;color:#e2e8f0;overflow:hidden;touch-action:none;user-select:none}
.lc3 canvas{display:block;width:100%;height:100%;outline:none}
.lc3-top{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:8px;align-items:center;pointer-events:none}.lc3-top>*{pointer-events:auto}
.lc3-top div{flex:1;pointer-events:none;text-shadow:0 1px 3px #000}.lc3-top b{display:block;color:#fbbf24;letter-spacing:.05em;font-size:15px}.lc3-top small{color:#cbd5e1;font:600 12px ui-monospace,monospace}
.lc3-btn{appearance:none;background:#b45309;color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 13px system-ui;cursor:pointer}.lc3-btn.g{background:#334155}
.lc3-help{position:absolute;left:10px;top:58px;font-size:11px;color:#e2e8f0cc;text-shadow:0 1px 3px #000;pointer-events:none}
.lc3-load{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;color:#fbbf24}
.lc3-joy{position:absolute;left:22px;bottom:26px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none;display:none}
.lc3-joy i{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.8);pointer-events:none}.lc3.touch .lc3-joy{display:block}.lc3.touch .lc3-help{display:none}
.lc3-act{position:absolute;left:50%;bottom:22px;transform:translateX(-50%)}
.lc3-pan{position:absolute;right:12px;top:58px;bottom:12px;width:min(640px,calc(100% - 24px));background:#0f172aee;border:1px solid #334155;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 30px #000a}
.lc3-pan header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #334155;font:700 14px ui-monospace,monospace;color:#86efac}.lc3-pan header span{flex:1}
.lc3-pan .bd{overflow:auto;padding:8px 12px;flex:1}.lc3-pan input{width:100%;box-sizing:border-box;padding:7px 9px;border-radius:6px;border:1px solid #334155;background:#020617;color:#e2e8f0;font:inherit;margin-bottom:8px}
.lc3-pan table{width:100%;border-collapse:collapse;font:12px ui-monospace,monospace}.lc3-pan th{text-align:left;color:#94a3b8;font-weight:600;padding:5px 4px;border-bottom:1px solid #334155;position:sticky;top:0;background:#0f172a}
.lc3-pan td{padding:6px 4px;border-bottom:1px solid #1e293b;vertical-align:middle}.lc3-pan td.n{color:#f8fafc;font-family:system-ui;font-size:13px}.lc3-pan .mini{appearance:none;border:0;border-radius:6px;padding:5px 8px;background:#1d4ed8;color:#fff;font:600 11px system-ui;cursor:pointer;margin-left:4px}
.lc3-pan .sum{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-bottom:8px}.lc3-pan .sum div{background:#1e293b;border-radius:8px;padding:7px 9px}.lc3-pan .sum small{display:block;color:#94a3b8;font-size:11px}.lc3-pan .sum b{font:700 14px ui-monospace,monospace;color:#fde68a}
.lc3-find{position:absolute;left:50%;top:58px;transform:translateX(-50%);background:#14532dee;border:1px solid #22c55e;color:#dcfce7;border-radius:999px;padding:7px 14px;font-weight:600;pointer-events:none;white-space:nowrap}`;document.head.appendChild(s)}
function L0(){return W.city!=null?LCO(W.city):null}
function open(cid){if(W.on)return;const c=CITIES[cid],L=c&&LCO(cid);if(!L)return toast("No logistics center here");css();W.on=true;W.city=cid;
  const el=W.el=document.createElement("div");el.className="lc3";el.setAttribute("role","dialog");el.setAttribute("aria-label","Logistics center in "+c.name);
  if(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window)el.classList.add("touch");
  el.innerHTML=`<div class="lc3-load">Opening the logistics center…</div><div class="lc3-top"><div><b>📦 LOGISTICS CENTER · ${esc(c.name.toUpperCase())}</b><small id="lc3-sub"></small></div><button class="lc3-btn g" data-lc="pc">🖥 Inventory</button><button class="lc3-btn" data-lc="close">Exit</button></div>
  <div class="lc3-help">W/S forward/back · A/D strafe · ←/→ or drag to turn · Shift run · E use · Esc exit</div><div class="lc3-joy"><i></i></div><div class="lc3-act"><button class="lc3-btn" data-lc="use" hidden></button></div><div class="lc3-find" hidden></div>`;
  document.body.appendChild(el);W.btn=el.querySelector('[data-lc="use"]');W.keys={};W.joy=null;W.near=null;W.panel=null;W.find=null;
  const joy=el.querySelector(".lc3-joy"),kn=joy.firstChild,jr=56;let jid=null;
  const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";W.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
  const je=()=>{jid=null;W.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.tabIndex=-1;el.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select"))return;const k=e.key.toLowerCase();if(k==="e"||k==="enter"){use();e.preventDefault();return}if(k==="escape"){if(W.panel)panel(false);else close();return}W.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});
  el.addEventListener("keyup",e=>{W.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-lc]");if(!b)return;const a=b.dataset.lc;
    if(a==="close")close();else if(a==="use")use();else if(a==="pc")panel(!W.panel);else if(a==="xp")panel(false);
    else if(a==="find")findG(b.dataset.g,false);else if(a==="go")findG(b.dataset.g,true)});
  el.addEventListener("input",e=>{if(e.target.id==="lc3-q")fillTable()});
  loadThree().then(T=>{if(!W.on||W.el!==el)return;build(T);W.raf=requestAnimationFrame(loop);if(W.cv)W.cv.focus()}).catch(()=>{close();toast("Couldn't load the 3D logistics center. Check your connection and try again.")})}
function close(){if(!W.on)return;W.on=false;cancelAnimationFrame(W.raf);W.raf=0;
  if(W.scene)W.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})});
  if(W.ren){W.ren.dispose();try{W.ren.forceContextLoss()}catch(e){}}W.ren=W.scene=W.cam=W.av=W.beacon=null;if(W.el)W.el.remove();W.el=null;try{save()}catch(e){}}
/* canvas text as a sprite or a flat sign */
function texOf(T,lines,o){o=o||{};const cv=document.createElement("canvas"),w=o.w||512,h=o.h||128;cv.width=w;cv.height=h;const g=cv.getContext("2d");g.fillStyle=o.bg||"#111827";g.fillRect(0,0,w,h);
  if(o.border){g.strokeStyle=o.border;g.lineWidth=8;g.strokeRect(4,4,w-8,h-8)}g.fillStyle=o.fg||"#fff";g.textBaseline="middle";g.textAlign=o.align||"center";
  const n=lines.length;lines.forEach((t,i)=>{g.font=(i===0?"bold ":"")+Math.round((o.fs||52)*(i?.62:1))+"px system-ui,sans-serif";g.fillText(t,o.align==="left"?24:w/2,h*(i+1)/(n+1))});
  const tx=new T.CanvasTexture(cv);tx.anisotropy=4;return tx}
/* readable from both sides: two one-sided planes back to back */
function sign(T,g,lines,w,h,x,y,z,ry,o){const mat=new T.MeshBasicMaterial({map:texOf(T,lines,o)}),geo=new T.PlaneGeometry(w,h);let m;for(const r of [0,Math.PI]){m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=(ry||0)+r;g.add(m)}return m}
function person(T,suit){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x111827,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x111827,.1,0,0);ofBox(T,g,.42,.55,.26,suit,0,.5,0);ofBox(T,g,.44,.12,.28,0xfacc15,0,.78,0);
  const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),ofMat(T,0xf1c27d));hd.position.set(0,1.22,0);g.add(hd);ofBox(T,g,.38,.12,.38,0xf59e0b,0,1.3,0);
  const sh=new T.Mesh(new T.CircleGeometry(.34,16),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.25}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;g.add(sh);g.userData.legs=[l,r];return g}
const GCOL={raw:[0xb45309,0x1d4ed8,0x15803d,0xb91c1c,0x7c3aed,0x0e7490],mid:[0x92400e,0xa16207,0x854d0e],fin:[0xd6a35c,0xc08a4a,0xe0b878]};
function gcol(g,i){const t=G[g][2],a=GCOL[t==="raw"?"raw":t==="mid"?"mid":"fin"];let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return a[(h+i)%a.length]}
function build(T){W.T=T;const el=W.el,L=L0(),c=CITIES[W.city];let ren;try{ren=new T.WebGLRenderer({antialias:(devicePixelRatio||1)<1.5,powerPreference:"low-power"})}catch(e){close();toast("3D isn't available on this device.");return}
  ren.setPixelRatio(Math.min(1.5,devicePixelRatio||1));W.ren=ren;const cv=ren.domElement;cv.tabIndex=0;cv.setAttribute("aria-label","3D logistics center. W A S D to move, E to use.");el.insertBefore(cv,el.firstChild);W.cv=cv;const ld=el.querySelector(".lc3-load");if(ld)ld.remove();
  let drag=null;cv.addEventListener("pointerdown",e=>{drag={x:e.clientX,id:e.pointerId};cv.focus()});cv.addEventListener("pointermove",e=>{if(drag&&drag.id===e.pointerId){W.p.yaw-=(e.clientX-drag.x)*.006;drag.x=e.clientX}});const du=()=>{drag=null};cv.addEventListener("pointerup",du);cv.addEventListener("pointercancel",du);
  const sc=new T.Scene();sc.background=new T.Color(0x0b0f14);W.scene=sc;W.cam=new T.PerspectiveCamera(62,1,.1,400);
  sc.add(new T.HemisphereLight(0xfff7ed,0x334155,.75));const dl=new T.DirectionalLight(0xffffff,.35);dl.position.set(6,20,8);sc.add(dl);sc.add(new T.AmbientLight(0xffffff,.18));
  W.rows=Math.min(MAXR,L.lv);const z1=zEnd(),z0=zBack(),len=z1-z0,zm=(z1+z0)/2;W.len=len;sc.fog=new T.Fog(0x0b0f14,30,Math.max(60,Math.min(160,len+20)));
  const room=new T.Group();sc.add(room);W.room=room;
  // concrete floor, yellow aisle lines, painted bay numbers on the floor
  ofBox(T,room,HW*2,.1,len,0x4b5563,0,-.1,zm,{r:.95});
  for(const x of [-BAYS*BW/2-1.6,BAYS*BW/2+1.6])ofBox(T,room,.12,.012,len-1,0xfacc15,x,0,zm,{r:1});
  ofBox(T,room,HW*2-1,.012,.12,0xfacc15,0,0,-.4,{r:1});
  // walls, roof with light strips, roll-up dock doors on the entrance wall
  const wm=ofMat(T,0x9ca3af,{r:.9}),wall=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m||wm);o.position.set(x,y+h/2,z);room.add(o);return o},WH=9;
  wall(.3,WH,len,-HW-.15,0,zm);wall(.3,WH,len,HW+.15,0,zm);wall(HW*2+.6,WH,.3,0,0,z0-.15);wall(HW*2+.6,WH,.3,0,0,z1+.15);
  for(let z=z0+4;z<z1;z+=8)wall(.4,WH,.4,-HW+.2,0,z,ofMat(T,0x1e3a8a)),wall(.4,WH,.4,HW-.2,0,z,ofMat(T,0x1e3a8a));
  const roof=ofMat(T,0x374151,{r:1});wall(HW*2+.6,.3,len+.6,0,WH,zm,roof);
  for(let z=z0+3;z<z1;z+=6)for(const x of [-8,0,8])ofBox(T,room,3.2,.08,.35,0xffffff,x,WH-.1,z,{e:0xfffbeb,ei:1});
  for(let i=0;i<3;i++){const dx=-HW+5+i*7;ofBox(T,room,4.4,4.6,.1,0x64748b,dx,0,z1-.02,{r:.6});for(let j=0;j<12;j++)ofBox(T,room,4.4,.05,.12,0x475569,dx,.3+j*.37,z1-.08);sign(T,room,["DOCK "+(i+1)],2.2,.55,dx,5.1,z1-.1,Math.PI,{bg:"#facc15",fg:"#111"})}
  sign(T,room,["LOGISTICS CENTER · "+c.name.toUpperCase(),"Level "+L.lv+" · "+fmtT(lcCap(c))+" capacity"],10,1.6,0,6.6,z1-.12,Math.PI,{w:1024,h:180,bg:"#0f172a",fg:"#fde68a",border:"#f59e0b",fs:56});
  // loading dock: shipping containers, pallets waiting, a forklift
  const cont=(x,z,col,ry,y)=>{const g=new T.Group();ofBox(T,g,6,2.6,2.4,col,0,0,0,{r:.7});for(let i=-2.7;i<=2.7;i+=.3)ofBox(T,g,.08,2.4,2.46,col-0x111111>0?col-0x111111:col,i,.1,0,{r:.7});ofBox(T,g,.05,2.4,2.2,0x1f2937,3.01,.1,0);g.position.set(x,y||0,z);g.rotation.y=ry||0;room.add(g)};
  cont(-HW+4,z1-4.5,0xb91c1c,0);cont(-HW+4,z1-4.5,0x1d4ed8,0,2.6);cont(HW-4,z1-4.5,0x15803d,0);cont(HW-11,z1-4.6,0xc2410c,0);
  const fl=new T.Group();ofBox(T,fl,1.2,1,2,0xf59e0b,0,.25,0);ofBox(T,fl,1.1,1.2,.08,0x111827,0,1.25,-.4);for(const x of [-.45,.45])ofBox(T,fl,.08,2.6,.08,0x374151,x,.2,-1.05),ofBox(T,fl,.1,.06,1.1,0x9ca3af,x,.1,-1.6);ofBox(T,fl,.9,.06,.9,0x111827,0,2.3,.2);for(const [x,z] of [[-.6,.6],[.6,.6],[-.6,-.6],[.6,-.6]])ofCyl(T,fl,.25,.25,.2,0x111827,x,.05,z);fl.position.set(5,0,z1-7.5);fl.rotation.y=.4;room.add(fl);
  // central computer system: desk, three screens, sign
  const pc=new T.Group();ofBox(T,pc,3.2,.85,1.1,0x334155,0,0,0);ofBox(T,pc,3.3,.06,1.2,0x1e293b,0,.85,0);
  W.scr=[];for(let i=-1;i<=1;i++){ofBox(T,pc,.08,.4,.08,0x111827,i*1.05,.9,.2);const m=new T.Mesh(new T.PlaneGeometry(.95,.6),new T.MeshBasicMaterial({map:screenTex(T,i+1)}));m.position.set(i*1.05,1.62,.18);m.rotation.y=i*-.25;m.rotation.x=0;pc.add(m);W.scr.push(m);ofBox(T,pc,1,.66,.04,0x0f172a,i*1.05,1.29,.15).rotation.y=i*-.25}
  ofBox(T,pc,.6,.04,.25,0x111827,0,.88,-.25);pc.position.set(0,0,z1-9);room.add(pc);W.pcz=z1-9;
  sign(T,room,["CENTRAL INVENTORY"],2.6,.5,0,2.75,z1-9.1,0,{bg:"#14532d",fg:"#dcfce7"});
  buildRacks(T);
  const av=W.av=person(T,0x1f2937);W.legs=av.userData.legs;sc.add(av);W.p={x:0,z:z1-6,yaw:0};
  const bc=W.beacon=new T.Mesh(new T.ConeGeometry(.5,1.1,16),new T.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.85}));bc.rotation.x=Math.PI;bc.visible=false;sc.add(bc);
  sub()}
function screenTex(T,i){const L=L0(),c=CITIES[W.city],lay=lcLayout(c),cv=document.createElement("canvas");cv.width=512;cv.height=320;const g=cv.getContext("2d");g.fillStyle="#04140b";g.fillRect(0,0,512,320);g.fillStyle="#4ade80";g.font="bold 30px monospace";
  if(i===1){g.fillText("INVENTORY",20,42);g.font="22px monospace";lay.items.slice(0,9).forEach((it,k)=>{g.fillStyle="#bbf7d0";g.fillText(G[it.g][0].slice(0,16),20,80+k*27);g.fillStyle="#fde68a";g.fillText("ROW "+lcRowName(it.row)+"-"+(it.bay+1),350,80+k*27)});if(!lay.items.length){g.fillStyle="#94a3b8";g.fillText("No stock yet",20,90)}}
  else if(i===0){g.fillText("CAPACITY",20,42);const u=lcUsed(c),cp=lcCap(c);g.fillStyle="#1e293b";g.fillRect(20,80,470,36);g.fillStyle=u/cp>.9?"#ef4444":"#22c55e";g.fillRect(20,80,470*Math.min(1,u/cp),36);g.fillStyle="#e2e8f0";g.font="24px monospace";g.fillText(fmtT(u)+" / "+fmtT(cp),20,160);g.fillText("Level "+L.lv+" · "+L.lv+" rows",20,200);g.fillText(lay.items.length+" products",20,240)}
  else{g.fillText("INBOUND",20,42);g.font="22px monospace";const inc=(S.fleet||[]).filter(v=>v.arr&&v.dest===W.city&&v.cargo).slice(0,8);inc.forEach((v,k)=>{g.fillStyle="#bbf7d0";g.fillText((G[v.cargo.g]||[v.cargo.g])[0].slice(0,14)+" "+Math.round(v.cargo.q),20,80+k*27);g.fillStyle="#fde68a";g.fillText(fmtDur(Math.max(0,v.arr-Date.now())),360,80+k*27)});if(!inc.length){g.fillStyle="#94a3b8";g.fillText("Nothing on the way",20,90)}}
  return new T.CanvasTexture(cv)}
/* rack rows with pallets and containers. Instanced meshes keep big centers fast. */
function buildRacks(T){const room=W.room,c=CITIES[W.city],lay=lcLayout(c),R=W.rows,frame=ofMat(T,0x1d4ed8,{r:.6}),beam=ofMat(T,0xf97316,{r:.6});
  const upG=new T.BoxGeometry(.1,RACKH,.1),bmG=new T.BoxGeometry(BAYS*BW,.12,.1),dkG=new T.BoxGeometry(BAYS*BW,.04,RACKD);
  const nUp=R*(BAYS+1)*2,nBm=R*3*2,nDk=R*3,up=new T.InstancedMesh(upG,frame,nUp),bm=new T.InstancedMesh(bmG,beam,nBm),dk=new T.InstancedMesh(dkG,ofMat(T,0x6b7280),nDk);
  const M=new T.Matrix4();let iu=0,ib=0,id=0;
  for(let r=0;r<R;r++){const z=rowZ(r);for(let b=0;b<=BAYS;b++)for(const s of [-1,1]){M.makeTranslation(-BAYS*BW/2+b*BW,RACKH/2,z+s*RACKD/2);up.setMatrixAt(iu++,M)}
    for(let l=0;l<3;l++){const y=.12+l*LVH;for(const s of [-1,1]){M.makeTranslation(0,y,z+s*RACKD/2);bm.setMatrixAt(ib++,M)}M.makeTranslation(0,y+.06,z);dk.setMatrixAt(id++,M)}}
  room.add(up,bm,dk);
  // row letter signs hanging at both ends of each row, bay numbers on the beams of row fronts
  for(let r=0;r<R;r++){const z=rowZ(r),n="ROW "+lcRowName(r);for(const x of [-BAYS*BW/2-.9,BAYS*BW/2+.9])sign(T,room,[n],1.5,.6,x,RACKH+.6,z,x<0?Math.PI/2:-Math.PI/2,{bg:"#facc15",fg:"#111",fs:64,w:256,h:100})}
  if(R)for(let b=0;b<BAYS;b++)sign(T,room,[String(b+1)],.5,.32,bayX(b),RACKH+.25,rowZ(0)+RACKD/2+.06,0,{bg:"#111827",fg:"#fde68a",w:128,h:80,fs:60});
  // goods: each bay's fill decides how many shelf levels hold stock. Containers for raw/heavy goods, pallets of cartons for the rest.
  const pal=[],box=[],con=[];for(const B of lay.bays){if(B.row>=R)continue;const it=lay.items.find(x=>x.g===B.g),lv=Math.max(1,Math.ceil(B.f*3-1e-9)),x=bayX(B.bay),z=rowZ(B.row);
    for(let l=0;l<lv;l++){const y=.2+l*LVH;if(it.cont)con.push([x,y,z,gcol(B.g,l)]);else{pal.push([x-.6,y,z]);pal.push([x+.6,y,z]);for(const dx of [-.6,.6]){const n=l===lv-1&&B.f*3%1>.01?1+((B.f*3%1)*3|0):3;for(let k=0;k<n;k++)box.push([x+dx,y+.14+k*.36,z,gcol(B.g,k)])}}}}
  const inst=(geo,mat,arr,col)=>{if(!arr.length)return;const m=new T.InstancedMesh(geo,mat,arr.length),C=new T.Color();arr.forEach((a,i)=>{M.makeTranslation(a[0],a[1]+geo.parameters.height/2,a[2]);m.setMatrixAt(i,M);if(col){C.setHex(a[3]);m.setColorAt(i,C)}});if(m.instanceColor)m.instanceColor.needsUpdate=true;room.add(m)};
  inst(new T.BoxGeometry(1.1,.14,1.1),ofMat(T,0xa16207,{r:1}),pal,false);
  inst(new T.BoxGeometry(1,.34,1),new T.MeshStandardMaterial({color:0xffffff,roughness:.9}),box,true);
  inst(new T.BoxGeometry(2.2,1.1,1.1),new T.MeshStandardMaterial({color:0xffffff,roughness:.7,metalness:.2}),con,true);
  inst(new T.BoxGeometry(.06,1.12,1.12),new T.MeshStandardMaterial({color:0x111827,roughness:.6}),con.flatMap(a=>[[a[0]-1.05,a[1],a[2]],[a[0]+1.05,a[1],a[2]],[a[0]-.35,a[1],a[2]],[a[0]+.35,a[1],a[2]]]),false);
  // product labels over the first bay of each product
  for(const it of lay.items){if(it.row>=R)continue;sign(T,room,[G[it.g][0],gq(it.q)+" · "+fmtT(it.t)],BW-.2,.62,bayX(it.bay),RACKH-.35,rowZ(it.row)+RACKD/2+.08,0,{bg:"#f8fafc",fg:"#0f172a",w:384,h:120,fs:42})}
  if(L0().lv>MAXR)sign(T,room,["Rows "+lcRowName(MAXR)+"+ in the annex","See the computer for every location"],8,1.3,0,3,zBack()+.3,0,{w:1024,h:180,bg:"#7c2d12",fg:"#fff"})}
function blocked(x,z){const r=.32;if(x<-HW+r||x>HW-r||z<zBack()+r||z>zEnd()-r)return true;
  for(let i=0;i<W.rows;i++){const zz=rowZ(i);if(Math.abs(z-zz)<RACKD/2+r&&Math.abs(x)<BAYS*BW/2+r)return true}
  if(Math.abs(x)<1.7+r&&Math.abs(z-W.pcz)<.6+r)return true;
  for(const [cx,cz,hw,hd] of [[-HW+4,zEnd()-4.5,3,1.2],[HW-4,zEnd()-4.5,3,1.2],[HW-11,zEnd()-4.6,3,1.2],[5,zEnd()-7.5,1.1,1.1]])if(Math.abs(x-cx)<hw+r&&Math.abs(z-cz)<hd+r)return true;return false}
function nearest(){const P=W.p;if(Math.abs(P.x)<2.6&&Math.abs(P.z-W.pcz)<1.6)return {k:"pc",n:"🖥 Use the central computer"};if(P.z>zEnd()-1.4&&Math.abs(P.x)<HW)return {k:"exit",n:"🚪 Leave the building"};return null}
function use(){const n=W.near;if(!n)return;if(n.k==="pc")panel(true);else if(n.k==="exit")close()}
function sub(){const c=CITIES[W.city],L=L0(),s=W.el&&W.el.querySelector("#lc3-sub");if(s&&L)s.textContent=`Level ${L.lv} · ${fmtT(lcUsed(c))} / ${fmtT(lcCap(c))} · ${L.ord.length} products`}
function panel(on){if(W.panel){W.panel.remove();W.panel=null}if(!on){if(W.cv)W.cv.focus();return}const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);
  const c=CITIES[W.city],L=L0(),lay=lcLayout(c);let val=0;for(const it of lay.items)val+=it.q*px(c,it.g);
  p.innerHTML=`<header><span>CENTRAL INVENTORY SYSTEM · ${esc(c.name.toUpperCase())}</span><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></header><div class="bd">
   <div class="sum"><div><small>Stored</small><b>${fmtT(lcUsed(c))}</b></div><div><small>Capacity</small><b>${fmtT(lcCap(c))}</b></div><div><small>Rows · bays</small><b>${L.lv} · ${L.lv*BAYS}</b></div><div><small>Stock value here</small><b>${fmt(val)}</b></div></div>
   <input id="lc3-q" placeholder="Search products or a row (e.g. B)" aria-label="Search inventory"><div id="lc3-tb"></div></div>`;fillTable()}
function fillTable(){const t=W.panel&&W.panel.querySelector("#lc3-tb");if(!t)return;const c=CITIES[W.city],q=(W.panel.querySelector("#lc3-q").value||"").trim().toLowerCase(),lay=lcLayout(c);
  const rows=lay.items.filter(it=>!q||G[it.g][0].toLowerCase().includes(q)||lcRowName(it.row).toLowerCase()===q||it.loc.toLowerCase().includes(q));
  t.innerHTML=rows.length?`<table><thead><tr><th>Product</th><th>Qty</th><th>Weight</th><th>Location</th><th>Type</th><th></th></tr></thead><tbody>${rows.map(it=>`<tr><td class="n">${esc(G[it.g][0])}</td><td>${gq(it.q)}</td><td>${fmtT(it.t)}</td><td>${esc(it.loc)}</td><td>${it.cont?"Container":"Pallet"}</td><td style="white-space:nowrap"><button class="mini" data-lc="find" data-g="${esc(it.g)}">Find</button><button class="mini" data-lc="go" data-g="${esc(it.g)}" style="background:#15803d">Walk there</button></td></tr>`).join("")}</tbody></table>`:`<p style="color:#94a3b8">${lay.items.length?"No match.":"The warehouse is empty. Ship goods to "+esc(c.name)+" and they'll be listed here with their row and bay."}</p>`}
function findG(g,go){const c=CITIES[W.city],it=lcLayout(c).items.find(x=>x.g===g);if(!it)return;const x=bayX(it.bay),z=rowZ(it.row);
  if(it.row>=W.rows){toast(`${G[g][0]} is in ${it.loc} (annex)`);return}
  W.find={x,z,t:performance.now()};W.beacon.visible=true;W.beacon.position.set(x,RACKH+1.4,z);const f=W.el.querySelector(".lc3-find");f.hidden=false;f.textContent=`📍 ${G[g][0]}: ${it.loc}`;
  if(go){const az=z+RACKD/2+1.2;W.p={x,z:az,yaw:0};panel(false)}else panel(false)}
function loop(t){if(!W.on||!W.ren){W.raf=0;return}W.raf=requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min(.05,Math.max(0,(t-W.last)/1000));W.last=t;step(dt,t);
  const w=W.el.clientWidth,h=W.el.clientHeight;if(W._w!==w||W._h!==h){W.ren.setSize(w,h,false);W.cam.aspect=w/h;W.cam.updateProjectionMatrix();W._w=w;W._h=h}W.ren.render(W.scene,W.cam)}
function step(dt,t){const P=W.p,k=W.keys,busy=!!W.panel;let f=0,s=0,turn=0;
  if(!busy){if(k.w||k.arrowup)f+=1;if(k.s||k.arrowdown)f-=1;if(k.d)s+=1;if(k.a)s-=1;if(k.arrowleft)turn+=1;if(k.arrowright)turn-=1;if(W.joy){f-=W.joy.y;s+=W.joy.x}}
  P.yaw+=turn*2.2*dt;const m=Math.hypot(f,s);let moving=false;
  if(m>.05){const sp=(k.shift?7:4)*Math.min(1,m)*dt/m,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),dx=(fx*f+rx*s)*sp,dz=(fz*f+rz*s)*sp;
    if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz;moving=true;W.av.rotation.y=Math.atan2(-(fx*f+rx*s),-(fz*f+rz*s))}
  W.walkT=moving?W.walkT+dt*10:0;const sw=Math.sin(W.walkT)*.5;W.legs[0].rotation.x=sw;W.legs[1].rotation.x=-sw;W.av.position.set(P.x,moving?Math.abs(Math.sin(W.walkT))*.04:0,P.z);
  const D=4.6;let cx=P.x+Math.sin(P.yaw)*D,cz=P.z+Math.cos(P.yaw)*D;cx=Math.max(-HW+.4,Math.min(HW-.4,cx));cz=Math.max(zBack()+.4,Math.min(zEnd()-.4,cz));
  W.cam.position.set(cx,3.1,cz);W.cam.lookAt(P.x-Math.sin(P.yaw)*1.5,1.1,P.z-Math.cos(P.yaw)*1.5);
  if(W.find){W.beacon.position.y=RACKH+1.4+Math.sin(t/250)*.25;W.beacon.rotation.y+=dt*2;if(Math.hypot(P.x-W.find.x,P.z-W.find.z)<2.4&&t-W.find.t>1500){W.find=null;W.beacon.visible=false;W.el.querySelector(".lc3-find").hidden=true}}
  const n=W.near=nearest();if(W.btn){if(n){W.btn.hidden=false;if(W.btn.textContent!==n.n+" (E)")W.btn.textContent=n.n+" (E)"}else W.btn.hidden=true}
  if(((t/2000)|0)!==W._st){W._st=(t/2000)|0;sub();if(W.scr)W.scr.forEach((m,i)=>{m.material.map.dispose();m.material.map=screenTex(W.T,i);m.material.needsUpdate=true})}}
return {open,close,_w:()=>W};
})()
