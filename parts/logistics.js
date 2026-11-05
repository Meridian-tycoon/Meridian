/* Meridian: Logistics center walk-in warehouse (lazy part). Loaded the first time a player walks into a logistics center (lcEnter in index.html).
   Runs with a direct eval inside the game's main closure, so it sees S, LCO, lcLayout, ofBox, loadThree and the rest. Keep it one expression that returns the API.
   Layout: x runs across the hall (bays), z runs down its length. The entrance, loading dock and central computer are at the +z end; rack rows go towards -z,
   one row per level, so the building gets longer with every upgrade. Controls match the bunker: W/S forward/back, A/D strafe, arrows or drag to turn, E use. */
(function(){
const BW=2.6,BAYS=LCBAYS,ROWP=4.8,RACKD=1.3,RACKH=4.5,DOCK=24,MAXR=130,LVH=1.45,RPB=26,BPITCH=BAYS*BW+5;
/* rows A–Z run down the middle block; AA–AZ start a new block on the right, BA–BZ on the left, then further right, further left... (Mark, 2026-11-05) */
const blkX=b=>b?(b%2?1:-1)*Math.ceil(b/2)*BPITCH:0,rowX=r=>blkX(Math.floor(r/RPB));
let HW=BAYS*BW/2+4.5;
const W={zoom:4.6,cd:4.6,fp:false,pitch:0,el:null,on:false,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:0,yaw:0},keys:{},joy:null,near:null,panel:null,raf:0,last:0,city:null,rows:0,len:0,beacon:null,find:null};
const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const rowZ=r=>-((r%RPB)*ROWP)-ROWP/2;            // centre line of rack row r
const bayX=(b,r)=>rowX(r||0)-BAYS*BW/2+BW/2+b*BW;          // centre of bay b
const zEnd=()=>DOCK;                          // the entrance wall
const zBack=()=>-(Math.min(W.rows,RPB)*ROWP)-2;             // the back wall
function css(){if(document.getElementById("lc3-css"))return;const s=document.createElement("style");s.id="lc3-css";s.textContent=`
.lc3{position:fixed;inset:0;z-index:2147483000;background:#0b0f14;font:13px system-ui,sans-serif;color:#e2e8f0;overflow:hidden;touch-action:none;user-select:none}
.lc3 canvas{display:block;width:100%;height:100%;outline:none}
.lc3-top{position:absolute;top:0;left:0;right:0;padding:10px 10px 22px;background:linear-gradient(#020617d9,#02061700);display:flex;gap:8px;align-items:center;pointer-events:none}.lc3-top>*{pointer-events:auto}
.lc3-top div{flex:1;pointer-events:none;text-shadow:0 1px 3px #000}.lc3-top b{display:block;color:#fbbf24;letter-spacing:.05em;font-size:15px}.lc3-top small{color:#cbd5e1;font:600 12px ui-monospace,monospace}
.lc3-btn{appearance:none;background:#b45309;color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 13px system-ui;cursor:pointer}.lc3-btn.g{background:#334155}
.lc3-help{position:absolute;left:10px;top:58px;font-size:11px;color:#f1f5f9;background:#020617a6;padding:3px 8px;border-radius:6px;pointer-events:none}
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
@media(max-width:640px){.lc3-top b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lc3-top small{font-size:10px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lc3-top div{min-width:0}.lc3-btn{padding:7px 10px;font-size:12px}.lc3-pan{top:52px;right:6px;width:calc(100% - 12px)}.lc3-pan .c-t,.lc3-pan .c-w{display:none}.lc3-pan .mini{display:block;margin:2px 0}}
.lc3-sort{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:8px;color:#94a3b8;font-size:12px}.lc3-sort small{flex-basis:100%;font-size:11px}.lc3-pan .mini.g{background:#334155}.lc3-pan .mv td{background:#1e293b}.lc3-pan .mv input{width:56px;margin:0 6px 0 2px;padding:4px 6px;display:inline-block}.lc3-pan .mv select{background:#020617;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:4px;margin:0 6px 0 2px}
.lc3-find{position:absolute;left:50%;top:58px;transform:translateX(-50%);background:#14532dee;border:1px solid #22c55e;color:#dcfce7;border-radius:999px;padding:7px 14px;font-weight:600;pointer-events:none;white-space:nowrap}`;document.head.appendChild(s)}
/* how a product is stored, and a tint for bags and drums */
const KN={carton:"Wrapped pallet",bag:"Bulk bags",drum:"Drums",crate:"Crates"};
function kindOf(g){if(/oil|fuel|chem|gas|petro|water|wine|beer|milk|juice|ethanol|thc|paint|acid|lubric/i.test(g+" "+G[g][0]))return "drum";
  if(G[g][2]==="raw"&&tpu(g)<2)return "bag";if(tpu(g)>=2||/steel|iron|copper|alum|metal|ore|machin|engine|car|aero|arm|weapon|tank|part/i.test(g+" "+G[g][0]))return "crate";return "carton"}
function tintOf(g){const n=(g+" "+G[g][0]).toLowerCase();if(/coal|carbon|oil|crude/.test(n))return 0x3f3f46;if(/fuel|petrol/.test(n))return 0xdc2626;if(/chem|acid/.test(n))return 0xf59e0b;if(/water|milk/.test(n))return 0x2563eb;if(/sand|wheat|corn|grain|rice|flour/.test(n))return 0xf5f0e1;
  if(/ore|iron/.test(n))return 0xd6c7b0;let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return [0xf8fafc,0xe7e5e4,0x16a34a,0x2563eb,0x0f766e][h%5]}
/* procedural textures (canvas), cached per kind; repeat set per use */
const TXC={};
function tx(T,k,rx,ry){let base=TXC[k];if(!base){const cv=document.createElement("canvas"),N=k==="floor"||k==="roof"?512:256;cv.width=cv.height=N;const g=cv.getContext("2d"),R=(a,b)=>a+Math.random()*(b-a);
    const noise=(n,a,col)=>{for(let i=0;i<n;i++){g.fillStyle=col(Math.random());g.globalAlpha=a*Math.random();g.fillRect(R(0,N),R(0,N),R(1,4),R(1,4))}g.globalAlpha=1};
    if(k==="floor"){g.fillStyle="#8d9095";g.fillRect(0,0,N,N);noise(9000,.25,v=>v>.5?"#b7b9bc":"#6b6e73");for(let i=0;i<6;i++){const gr=g.createRadialGradient(R(0,N),R(0,N),5,R(0,N),R(0,N),R(60,160));gr.addColorStop(0,"rgba(60,60,60,.18)");gr.addColorStop(1,"rgba(60,60,60,0)");g.fillStyle=gr;g.fillRect(0,0,N,N)}
      g.strokeStyle="rgba(30,30,30,.18)";g.lineWidth=6;for(let i=0;i<3;i++){g.beginPath();g.moveTo(R(0,N),0);g.bezierCurveTo(R(0,N),N/3,R(0,N),N*2/3,R(0,N),N);g.stroke()}g.fillStyle="#55585c";g.fillRect(0,0,N,3);g.fillRect(0,0,3,N)}
    else if(k==="clad"){for(let x=0;x<N;x++){const v=Math.sin(x/N*Math.PI*2*8);const c=Math.round(196+30*v);g.fillStyle=`rgb(${c},${c+2},${c+6})`;g.fillRect(x,0,1,N)}noise(1500,.08,()=>"#555");g.fillStyle="rgba(0,0,0,.25)";g.fillRect(0,N-2,N,2)}
    else if(k==="roof"){g.fillStyle="#d8dade";g.fillRect(0,0,N,N);for(let x=0;x<N;x+=32){g.fillStyle="#b9bcc2";g.fillRect(x,0,10,N)}g.fillStyle="#9aa0a6";g.fillRect(0,0,N,3)}
    else if(k==="conc"){g.fillStyle="#9b9a96";g.fillRect(0,0,N,N);noise(4000,.3,v=>v>.5?"#b8b7b2":"#7c7b77");g.fillStyle="#6d6c69";g.fillRect(0,0,2,N)}
    else if(k==="door"){g.fillStyle="#cbd5e1";g.fillRect(0,0,N,N);for(let y=0;y<N;y+=N/8){g.fillStyle="#94a3b8";g.fillRect(0,y,N,3);g.fillStyle="#e2e8f0";g.fillRect(0,y+4,N,2)}g.fillStyle="#475569";g.fillRect(N*.15,N*.3,N*.7,N*.07);g.fillStyle="#1e293b";g.fillRect(N*.42,N*.88,N*.16,N*.04)}
    else if(k==="cont"){for(let x=0;x<N;x++){const v=(x%16)<8?235:200;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,0,1,N)}noise(2500,.15,()=>"#5a3a20");g.fillStyle="#444";g.fillRect(0,0,N,8);g.fillRect(0,N-8,N,8);g.fillStyle="#fff";g.font="bold 22px monospace";g.fillText("MRDU "+(100000+((Math.random()*899999)|0)),14,40)}
    else if(k==="pallet"){g.fillStyle="#b9894f";g.fillRect(0,0,N,N);for(let x=0;x<N;x+=N/6){g.fillStyle="#3b2a18";g.fillRect(x+N/7,0,N/40,N)}for(let i=0;i<300;i++){g.strokeStyle="rgba(90,60,30,.25)";g.beginPath();const y=R(0,N);g.moveTo(0,y);g.lineTo(N,y+R(-6,6));g.stroke()}g.fillStyle="#2a1f14";g.fillRect(N*.1,N*.25,N*.25,N*.5);g.fillRect(N*.65,N*.25,N*.25,N*.5)}
    else if(k==="carton"){g.fillStyle="#c49a6c";g.fillRect(0,0,N,N);noise(1500,.15,v=>v>.5?"#d9b48a":"#a67c52");for(let y=0;y<N;y+=N/3){g.fillStyle="rgba(80,55,30,.55)";g.fillRect(0,y,N,2)}for(let x=0;x<N;x+=N/2){g.fillStyle="rgba(80,55,30,.55)";g.fillRect(x,0,2,N)}
      for(let y=0;y<3;y++)for(let x=0;x<2;x++){g.fillStyle="rgba(230,210,170,.7)";g.fillRect(x*N/2+N/4-6,y*N/3,12,N/3);g.fillStyle="#fff";g.fillRect(x*N/2+18,y*N/3+18,40,26);g.fillStyle="#111";g.fillRect(x*N/2+22,y*N/3+24,32,3);g.fillRect(x*N/2+22,y*N/3+31,24,3);g.fillRect(x*N/2+22,y*N/3+38,28,2)}}
    else if(k==="bag"){g.fillStyle="#f4f4f0";g.fillRect(0,0,N,N);for(let i=0;i<N;i+=4){g.fillStyle="rgba(0,0,0,.06)";g.fillRect(i,0,1,N);g.fillRect(0,i,N,1)}g.fillStyle="rgba(0,0,0,.18)";g.fillRect(0,0,N,10);g.fillStyle="#1d4ed8";g.fillRect(N*.3,N*.35,N*.4,N*.25);g.fillStyle="#fff";g.font="bold 20px sans-serif";g.fillText("1000 kg",N*.33,N*.5)}
    else if(k==="drum"){g.fillStyle="#f8fafc";g.fillRect(0,0,N,N);for(const y of [.2,.5,.8]){g.fillStyle="rgba(0,0,0,.35)";g.fillRect(0,N*y-3,N,6)}g.fillStyle="#fff";g.fillRect(N*.1,N*.3,N*.2,N*.14);noise(800,.1,()=>"#444")}
    else if(k==="crate"){g.fillStyle="#c9a26b";g.fillRect(0,0,N,N);for(let y=0;y<N;y+=N/5){g.fillStyle="rgba(70,45,20,.6)";g.fillRect(0,y,N,2)}g.fillStyle="#a37a45";g.fillRect(0,0,N,18);g.fillRect(0,N-18,N,18);g.fillRect(0,0,18,N);g.fillRect(N-18,0,18,N);
      g.save();g.translate(N/2,N/2);g.rotate(Math.PI/4);g.fillRect(-N*.7,-9,N*1.4,18);g.restore();g.fillStyle="#111";g.font="bold 18px monospace";g.fillText("THIS WAY UP ↑",N*.2,N*.75)}
    else if(k==="mesh"){g.clearRect(0,0,N,N);g.strokeStyle="#fff";g.lineWidth=4;for(let i=0;i<=N;i+=N/8){g.beginPath();g.moveTo(i,0);g.lineTo(i,N);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(N,i);g.stroke()}}
    else if(k==="upright"){g.fillStyle="#fff";g.fillRect(0,0,N,N);g.fillStyle="#1e293b";for(let y=8;y<N;y+=N/4)g.fillRect(N*.4,y,N*.2,N*.1)}
    base=TXC[k]=new T.CanvasTexture(cv);base.wrapS=base.wrapT=T.RepeatWrapping;base.encoding=T.sRGBEncoding;base.anisotropy=8}
  const t=base.clone();t.needsUpdate=true;t.repeat.set(rx||1,ry||1);return t}
/* a staged pallet at the dock: a mix of loads waiting for put-away */
function stage(T,room,x,z,i){const k=["carton","bag","crate","carton"][i%4];ofBox(T,room,1.2,.144,1,0xb9894f,x,0,z,{r:.9});
  const m=new T.Mesh(new T.BoxGeometry(1.1,k==="bag"?.95:1.1,.95),new T.MeshStandardMaterial({map:tx(T,k,1,1),roughness:.85}));m.position.set(x,.144+(k==="bag"?.475:.55),z);room.add(m)}
function setFp(on){W.fp=!!on;W.pitch=0;if(W.av)W.av.visible=!W.fp;const b=W.el&&W.el.querySelector('[data-lc="fp"]');if(b)b.textContent=W.fp?"🎥 3rd person":"👁 1st person"}
function zoomBy(dir,amt){if(W.fp){if(dir>0)setFp(false);return}const z=W.zoom*Math.pow(1.18,dir*(amt||1));if(z<1.6){setFp(true);return}W.zoom=Math.max(1.6,Math.min(14,z))}
/* re-arrange stock from the central computer; the racks rebuild straight away */
function arr(a,b){const c=CITIES[W.city],g=b.dataset.g;
  if(a==="up"||a==="dn")lcMove(c,g,a==="up"?-1:1);else if(a==="sort")lcSort(c,b.dataset.k);
  else if(a==="mv"){W.mvg=W.mvg===g?null:g;fillTable();return true}else if(a==="mvx"){W.mvg=null;fillTable();return true}
  else if(a==="pin"){const e=lcPin(c,g,W.panel.querySelector("#lc3-mr").value,W.panel.querySelector("#lc3-mb").value);if(e){W.panel.querySelector("#lc3-me").textContent=e;return true}W.mvg=null;toast(`${G[g][0]} moved`)}
  else if(a==="unpin"){lcUnpin(c,g);W.mvg=null}else return false;
  try{buildRacks(W.T)}catch(e){console.warn(e)}fillTable();sub();return true}
function L0(){return W.city!=null?LCO(W.city):null}
function open(cid){if(W.on)return;const c=CITIES[cid],L=c&&LCO(cid);if(!L)return toast("No logistics center here");css();W.on=true;W.city=cid;
  const el=W.el=document.createElement("div");el.className="lc3";el.setAttribute("role","dialog");el.setAttribute("aria-label","Logistics center in "+c.name);
  if(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window)el.classList.add("touch");
  el.innerHTML=`<div class="lc3-load">Opening the logistics center…</div><div class="lc3-top"><div><b>📦 LOGISTICS CENTER · ${esc(c.name.toUpperCase())}</b><small id="lc3-sub"></small></div><button class="lc3-btn g" data-lc="pc">🖥 Inventory</button><button class="lc3-btn g" data-lc="fp" title="First-person view (V)">👁 1st person</button><button class="lc3-btn g" data-lc="zin" title="Zoom in (+ or mouse wheel)" aria-label="Zoom in">＋</button><button class="lc3-btn g" data-lc="zout" title="Zoom out (−)" aria-label="Zoom out">－</button><button class="lc3-btn" data-lc="close">Exit</button></div>
  <div class="lc3-help">W/S forward/back · A/D strafe · ←/→ or drag to turn · wheel/± zoom · V first person · Shift run · E use · Esc exit</div><div class="lc3-joy"><i></i></div><div class="lc3-act"><button class="lc3-btn" data-lc="use" hidden></button></div><div class="lc3-find" hidden></div>`;
  document.body.appendChild(el);W.btn=el.querySelector('[data-lc="use"]');W.keys={};W.joy=null;W.near=null;W.panel=null;W.find=null;
  const joy=el.querySelector(".lc3-joy"),kn=joy.firstChild,jr=56;let jid=null;
  const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";W.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
  const je=()=>{jid=null;W.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.tabIndex=-1;el.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select")){if(e.key==="Escape")panel(false);return}const k=e.key.toLowerCase();if(k==="v"){setFp(!W.fp);return}if(k==="+"||k==="="){zoomBy(-1);return}if(k==="-"||k==="_"){zoomBy(1);return}if(k==="e"||k==="enter"){use();e.preventDefault();return}if(k==="escape"){if(W.panel)panel(false);else close();return}W.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});
  el.addEventListener("keyup",e=>{W.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-lc]");if(!b)return;const a=b.dataset.lc;
    if(a==="close")close();else if(a==="use")use();else if(a==="pc")panel(!W.panel);else if(a==="xp")panel(false);
    else if(a==="fp")setFp(!W.fp);else if(a==="zin")zoomBy(-1);else if(a==="zout")zoomBy(1);else if(a==="find")findG(b.dataset.g,false);else if(arr(a,b))return;else if(a==="go")findG(b.dataset.g,true)});
  el.addEventListener("input",e=>{if(e.target.id==="lc3-q")fillTable()});
  loadThree().then(T=>{if(!W.on||W.el!==el)return;build(T);W.raf=requestAnimationFrame(loop);if(W.cv)W.cv.focus()}).catch(()=>{close();toast("Couldn't load the 3D logistics center. Check your connection and try again.")})}
function close(){if(!W.on)return;W.on=false;cancelAnimationFrame(W.raf);W.raf=0;
  if(W.scene)W.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})});
  if(W.ren){W.ren.dispose();try{W.ren.forceContextLoss()}catch(e){}}for(const k in TXC){TXC[k].dispose();delete TXC[k]}W.ren=W.scene=W.cam=W.av=W.beacon=null;W._w=W._h=0;if(W.el)W.el.remove();W.el=null;try{save()}catch(e){}}
/* canvas text as a sprite or a flat sign */
function texOf(T,lines,o){o=o||{};const cv=document.createElement("canvas"),w=o.w||512,h=o.h||128;cv.width=w;cv.height=h;const g=cv.getContext("2d");g.fillStyle=o.bg||"#111827";g.fillRect(0,0,w,h);
  if(o.border){g.strokeStyle=o.border;g.lineWidth=8;g.strokeRect(4,4,w-8,h-8)}g.fillStyle=o.fg||"#fff";g.textBaseline="middle";g.textAlign=o.align||"center";
  const n=lines.length;lines.forEach((t,i)=>{g.font=(i===0?"bold ":"")+Math.round((o.fs||52)*(i?.62:1))+"px system-ui,sans-serif";g.fillText(t,o.align==="left"?24:w/2,h*(i+1)/(n+1))});
  const tx=new T.CanvasTexture(cv);tx.anisotropy=4;tx.encoding=T.sRGBEncoding;return tx}
/* readable from both sides: two one-sided planes back to back */
function sign(T,g,lines,w,h,x,y,z,ry,o){const mat=new T.MeshBasicMaterial({map:texOf(T,lines,o)}),geo=new T.PlaneGeometry(w,h);let m;for(const r of [0,Math.PI]){m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=(ry||0)+r;g.add(m)}return m}
function person(T,suit){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x111827,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x111827,.1,0,0);ofBox(T,g,.42,.55,.26,suit,0,.5,0);ofBox(T,g,.44,.12,.28,0xfacc15,0,.78,0);
  const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),ofMat(T,0xf1c27d));hd.position.set(0,1.22,0);g.add(hd);ofBox(T,g,.38,.12,.38,0xf59e0b,0,1.3,0);
  const sh=new T.Mesh(new T.CircleGeometry(.34,16),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.25}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;g.add(sh);g.userData.legs=[l,r];return g}
const GCOL={raw:[0xb45309,0x1d4ed8,0x15803d,0xb91c1c,0x7c3aed,0x0e7490],mid:[0x92400e,0xa16207,0x854d0e],fin:[0xd6a35c,0xc08a4a,0xe0b878]};
function gcol(g,i){const t=G[g][2],a=GCOL[t==="raw"?"raw":t==="mid"?"mid":"fin"];let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return a[(h+i)%a.length]}
function build(T){W.T=T;const el=W.el,L=L0(),c=CITIES[W.city];let ren;try{ren=new T.WebGLRenderer({antialias:(devicePixelRatio||1)<1.5,powerPreference:"low-power"})}catch(e){close();toast("3D isn't available on this device.");return}
  ren.setPixelRatio(Math.min(1.5,devicePixelRatio||1));W.ren=ren;W._w=W._h=0;const cv=ren.domElement;cv.tabIndex=0;cv.setAttribute("aria-label","3D logistics center. W A S D to move, E to use.");el.insertBefore(cv,el.firstChild);W.cv=cv;const ld=el.querySelector(".lc3-load");if(ld)ld.remove();
  /* drag to look (horizontal turns; vertical tilts in first person); two fingers pinch to zoom; wheel zooms */
  const pts=new Map();let pinch=0;cv.addEventListener("pointerdown",e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.focus();if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}});
  cv.addEventListener("pointermove",e=>{const o=pts.get(e.pointerId);if(!o)return;if(pts.size===2){o.x=e.clientX;o.y=e.clientY;const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch){W.zoom=Math.max(1.6,Math.min(14,W.zoom*pinch/d));if(W.fp&&pinch/d>1.15)setFp(false)}pinch=d;return}
    W.p.yaw-=(e.clientX-o.x)*.006;if(W.fp)W.pitch=Math.max(-1.1,Math.min(1.1,W.pitch-(e.clientY-o.y)*.005));o.x=e.clientX;o.y=e.clientY});
  const du=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=0};cv.addEventListener("pointerup",du);cv.addEventListener("pointercancel",du);
  cv.addEventListener("wheel",e=>{e.preventDefault();zoomBy(e.deltaY>0?1:-1,Math.min(3,Math.abs(e.deltaY)/100))},{passive:false});
  ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=1.05;ren.outputEncoding=T.sRGBEncoding;
  const sc=new T.Scene();sc.background=new T.Color(0x2a2f36);W.scene=sc;W.cam=new T.PerspectiveCamera(62,1,.1,400);
  sc.add(new T.HemisphereLight(0xfff4e0,0x5b5f66,1.05));const dl=new T.DirectionalLight(0xfff1d6,.55);dl.position.set(8,30,14);sc.add(dl);sc.add(new T.AmbientLight(0xffffff,.12));
  W.rows=Math.min(MAXR,L.lv);W.nb=Math.ceil(W.rows/RPB)||1;{let m=0;for(let b=0;b<W.nb;b++)m=Math.max(m,Math.abs(blkX(b)));HW=BAYS*BW/2+4.5+m}const z1=zEnd(),z0=zBack(),len=z1-z0,zm=(z1+z0)/2;W.len=len;sc.fog=new T.Fog(0x2a2f36,40,Math.max(70,Math.min(180,len+30)));
  const room=new T.Group();sc.add(room);W.room=room;const WH=10;
  // polished concrete slab with saw-cut joints, worn patches and tyre marks; painted walkway and aisle lines
  const fm=new T.MeshStandardMaterial({map:tx(T,"floor",HW*2/6,len/6),roughness:.55,metalness:.05});const fl0=new T.Mesh(new T.PlaneGeometry(HW*2,len),fm);fl0.rotation.x=-Math.PI/2;fl0.position.set(0,0,zm);room.add(fl0);
  for(let b=0;b<W.nb;b++)for(const x of [-BAYS*BW/2-1.7,BAYS*BW/2+1.7])ofBox(T,room,.1,.008,len-1,0xeab308,blkX(b)+x,0,zm,{r:.8});
  ofBox(T,room,HW*2-1,.008,.1,0xeab308,0,0,-.5,{r:.8});ofBox(T,room,HW*2-1,.008,.1,0xeab308,0,0,z1-11,{r:.8});
  for(let i=0;i<12;i++)ofBox(T,room,.5,.009,1.6,0xf8fafc,-3+i*.55,0,-1.3,{r:.8}); // pedestrian crossing
  ofBox(T,room,1.4,.009,len-14,0x15803d,-HW+1.1,0,zm-6,{r:.9}); // green walkway along the wall
  // insulated corrugated-steel cladding over a concrete plinth, steel portal frames, roof trusses, skylights and high-bay lamps
  const clad=new T.MeshStandardMaterial({map:tx(T,"clad",len/3,WH/3),roughness:.6,metalness:.35}),cladE=new T.MeshStandardMaterial({map:tx(T,"clad",HW*2/3,WH/3),roughness:.6,metalness:.35}),plinth=new T.MeshStandardMaterial({map:tx(T,"conc",len/4,1),roughness:.95});
  const wall=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);room.add(o);return o};
  wall(.3,WH,len,-HW-.15,0,zm,clad);wall(.3,WH,len,HW+.15,0,zm,clad);wall(HW*2+.6,WH,.3,0,0,z0-.15,cladE);wall(HW*2+.6,WH,.3,0,0,z1+.15,cladE);
  for(const x of [-HW+.05,HW-.05])wall(.25,1.2,len,x,0,zm,plinth);wall(HW*2,1.2,.25,0,0,z0+.05,plinth);
  const steel=new T.MeshStandardMaterial({color:0x7b8794,roughness:.45,metalness:.7}),stl=(w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),steel);o.position.set(x,y,z);room.add(o);return o};
  for(let z=z0+3;z<z1-1;z+=9){for(const x of [-HW+.35,HW-.35]){stl(.45,WH,.35,x,WH/2,z);ofBox(T,room,.6,1,.6,0xfacc15,x,0,z,{r:.6})}stl(HW*2,.5,.3,0,WH-.6,z);
    for(let i=-6;i<=6;i++){const x=i*HW/6.5;stl(.08,1.6,.08,x,WH-1.4,z);if(i<6){const d=stl(Math.hypot(HW/6.5,1.5),.07,.07,x+HW/13,WH-1.4,z);d.rotation.z=(i%2?1:-1)*Math.atan2(1.5,HW/6.5)}}stl(HW*2,.18,.18,0,WH-2.2,z)}
  const rf=new T.Mesh(new T.PlaneGeometry(HW*2+.6,len+.6),new T.MeshStandardMaterial({map:tx(T,"roof",HW*2/3,len/3),roughness:.8,metalness:.3,side:T.DoubleSide}));rf.rotation.x=Math.PI/2;rf.position.set(0,WH+.02,zm);room.add(rf);
  for(let z=z0+7.5;z<z1-2;z+=9)for(const x of [-9,9]){const s=new T.Mesh(new T.PlaneGeometry(4,2.4),new T.MeshBasicMaterial({color:0xe0f2fe}));s.rotation.x=Math.PI/2;s.position.set(x,WH-.01,z);room.add(s)}
  const lampM=new T.MeshStandardMaterial({color:0x374151,roughness:.4,metalness:.8}),glow=new T.MeshBasicMaterial({color:0xfffbeb});
  for(let z=z0+5;z<z1-1;z+=4.8)for(let b=0;b<W.nb;b++)for(const x of [-BAYS*BW/2-1.7,0,BAYS*BW/2+1.7].map(v=>v+blkX(b))){const c0=new T.Mesh(new T.CylinderGeometry(.08,.5,.45,14,1,true),lampM);c0.position.set(x,WH-2.6,z);room.add(c0);const d=new T.Mesh(new T.CircleGeometry(.45,14),glow);d.rotation.x=Math.PI/2;d.position.set(x,WH-2.83,z);room.add(d);ofBox(T,room,.02,2.4,.02,0x111827,x,WH-2.4,z)}
  // three dock doors with sectional roll-up doors, dock levelers, bumpers and traffic lights
  const doorM=new T.MeshStandardMaterial({map:tx(T,"door",1,1),roughness:.5,metalness:.4});
  for(let i=0;i<3;i++){const dx=-7.5+i*7.5;const dr=new T.Mesh(new T.PlaneGeometry(3.6,4.2),doorM);dr.position.set(dx,2.1+1.2,z1-.01);dr.rotation.y=Math.PI;room.add(dr);
    ofBox(T,room,.25,4.4,.2,0xfacc15,dx-1.95,1.2,z1-.12);ofBox(T,room,.25,4.4,.2,0xfacc15,dx+1.95,1.2,z1-.12);ofBox(T,room,4.1,.3,.25,0x1f2937,dx,5.6,z1-.12);
    ofBox(T,room,3.4,.06,2.2,0x52525b,dx,0,z1-1.2,{r:.5,m:.6});for(const s of [-1.3,1.3])ofBox(T,room,.35,.5,.25,0x111111,dx+s,.9,z1-.15);
    for(const [k,cl] of [[0,0xef4444],[1,0x22c55e]])ofCyl(T,room,.09,.09,.04,cl,dx+2.4,3.3-k*.25,z1-.15,{e:cl,ei:i===1?k:1-k}).rotation.x=Math.PI/2;
    sign(T,room,["DOCK "+(i+1)],1.6,.45,dx,6.1,z1-.2,Math.PI,{bg:"#facc15",fg:"#111"})}
  sign(T,room,[c.name.toUpperCase()+" LOGISTICS CENTER","Level "+L.lv+" · "+fmtT(lcCap(c))+" capacity · "+W.rows+" aisles"],10,1.5,0,8.1,z1-.2,Math.PI,{w:1024,h:180,bg:"#0f172a",fg:"#f8fafc",border:"#f59e0b",fs:54});
  sign(T,room,["⚠ FORKLIFTS OPERATE IN THIS AREA","Hi-vis vests required · Speed limit 8 km/h"],5,.9,HW-.2,3.2,z1-8,-Math.PI/2,{w:768,h:150,bg:"#facc15",fg:"#111",fs:40});
  // dock staging: wrapped pallets waiting to be put away, a pallet jack, a forklift and a few shipping containers in the yard bay
  const cont=(x,z,col,y)=>{const m=new T.MeshStandardMaterial({map:tx(T,"cont",1,1),color:col,roughness:.55,metalness:.45}),o=new T.Mesh(new T.BoxGeometry(6.06,2.59,2.44),m);o.position.set(x,(y||0)+1.3,z);room.add(o)};
  cont(-HW+4,z1-4.4,0xb91c1c);cont(-HW+4,z1-4.4,0x1d4ed8,2.6);cont(HW-4,z1-4.4,0x15803d);
  for(let i=0;i<4;i++)stage(T,room,-3.5+i*1.5,z1-3.2,i);for(let i=0;i<6;i++)stage(T,room,-HW+4+i*1.5,z1-9,i+1);for(let i=0;i<5;i++)stage(T,room,HW-11+i*1.5,z1-9,i+2);
  // reception office: glass-walled cabin with a counter, beside the receiving lanes
  {const ox=HW-5,oz=z1-15.5;ofBox(T,room,7,.1,6,0x94a3b8,ox,0,oz,{r:.6});for(const [w,d,x,z] of [[7,.08,0,-3],[.08,6,-3.5,0],[.08,6,3.5,0]])ofBox(T,room,w,3,d,0xbfdbfe,ox+x,0,oz+z,{op:.25,r:.1,m:.2});ofBox(T,room,7.1,.15,6.1,0x334155,ox,3,oz,{r:.5});ofBox(T,room,3,.1,.1,0x334155,ox-2,0,oz+3,{});ofBox(T,room,2.2,1.05,.7,0x475569,ox,0,oz+2.4,{r:.5});ofBox(T,room,2.3,.06,.8,0xe2e8f0,ox,1.05,oz+2.4,{r:.4});sign(T,room,["RECEIVING OFFICE"],2.6,.45,ox,3.45,oz+3.05,0,{bg:"#1e3a8a",fg:"#fff"})}
  const fk=new T.Group(),or=new T.MeshStandardMaterial({color:0xf59e0b,roughness:.45,metalness:.3}),blk=new T.MeshStandardMaterial({color:0x111827,roughness:.6}),put=(g,m,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
  put(fk,or,1.2,.9,1.9,0,.75,0);put(fk,blk,1.25,.5,.5,0,.65,.85);put(fk,blk,.5,.6,.5,0,1.3,.2);put(fk,or,.07,1.1,.07,-.55,1.85,.6);put(fk,or,.07,1.1,.07,.55,1.85,.6);put(fk,or,.07,1.1,.07,-.55,1.85,-.45);put(fk,or,.07,1.1,.07,.55,1.85,-.45);put(fk,blk,1.25,.05,1.2,0,2.4,.08);
  for(const x of [-.42,.42])put(fk,steel,.08,2.6,.1,x,1.4,-1.05);put(fk,steel,1,.1,.1,0,2.6,-1.05);for(const x of [-.35,.35])put(fk,steel,.12,.05,1.15,x,.12,-1.65);
  for(const [x,z,r] of [[-.6,-.6,.3],[.6,-.6,.3],[-.55,.65,.22],[.55,.65,.22]]){const w=new T.Mesh(new T.CylinderGeometry(r,r,.25,16),blk);w.rotation.z=Math.PI/2;w.position.set(x,r,z);fk.add(w)}
  fk.position.set(5,0,z1-7.5);fk.rotation.y=.4;room.add(fk);
  // central computer system: desk, three screens, sign
  const pc=new T.Group();ofBox(T,pc,3.2,.85,1.1,0x334155,0,0,0);ofBox(T,pc,3.3,.06,1.2,0x1e293b,0,.85,0);
  W.scr=[];for(let i=-1;i<=1;i++){ofBox(T,pc,.08,.4,.08,0x111827,i*1.05,.9,.2);const m=new T.Mesh(new T.PlaneGeometry(.95,.6),new T.MeshBasicMaterial({map:screenTex(T,i+1)}));m.position.set(i*1.05,1.62,.18);m.rotation.y=i*-.25;m.rotation.x=0;pc.add(m);W.scr.push(m);ofBox(T,pc,1,.66,.04,0x0f172a,i*1.05,1.29,.15).rotation.y=i*-.25}
  ofBox(T,pc,.6,.04,.25,0x111827,0,.88,-.25);pc.position.set(0,0,z1-15);room.add(pc);W.pcz=z1-15;
  sign(T,room,["CENTRAL INVENTORY"],2.6,.5,0,2.75,z1-15.1,0,{bg:"#14532d",fg:"#dcfce7"});
  buildRacks(T);
  const av=W.av=person(T,0x1f2937);W.legs=av.userData.legs;sc.add(av);W.p={x:0,z:z1-6,yaw:0};W.cd=W.zoom;setFp(W.fp);
  const bc=W.beacon=new T.Mesh(new T.ConeGeometry(.5,1.1,16),new T.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.85}));bc.rotation.x=Math.PI;bc.visible=false;sc.add(bc);
  sub()}
function screenTex(T,i){const L=L0(),c=CITIES[W.city],lay=lcLayout(c),cv=document.createElement("canvas");cv.width=512;cv.height=320;const g=cv.getContext("2d");g.fillStyle="#04140b";g.fillRect(0,0,512,320);g.fillStyle="#4ade80";g.font="bold 30px monospace";
  if(i===1){g.fillText("INVENTORY",20,42);g.font="22px monospace";lay.items.slice(0,9).forEach((it,k)=>{g.fillStyle="#bbf7d0";g.fillText(G[it.g][0].slice(0,16),20,80+k*27);g.fillStyle="#fde68a";g.fillText("ROW "+lcRowName(it.row)+"-"+(it.bay+1),350,80+k*27)});if(!lay.items.length){g.fillStyle="#94a3b8";g.fillText("No stock yet",20,90)}}
  else if(i===0){g.fillText("CAPACITY",20,42);const u=lcUsed(c),cp=lcCap(c);g.fillStyle="#1e293b";g.fillRect(20,80,470,36);g.fillStyle=u/cp>.9?"#ef4444":"#22c55e";g.fillRect(20,80,470*Math.min(1,u/cp),36);g.fillStyle="#e2e8f0";g.font="24px monospace";g.fillText(fmtT(u)+" / "+fmtT(cp),20,160);g.fillText("Level "+L.lv+" · "+L.lv+" rows",20,200);g.fillText(lay.items.length+" products",20,240)}
  else{g.fillText("INBOUND",20,42);g.font="22px monospace";const inc=(S.fleet||[]).filter(v=>v.arr&&v.dest===W.city&&v.cargo).slice(0,8);inc.forEach((v,k)=>{g.fillStyle="#bbf7d0";g.fillText((G[v.cargo.g]||[v.cargo.g])[0].slice(0,14)+" "+Math.round(v.cargo.q),20,80+k*27);g.fillStyle="#fde68a";g.fillText(fmtDur(Math.max(0,v.arr-Date.now())),360,80+k*27)});if(!inc.length){g.fillStyle="#94a3b8";g.fillText("Nothing on the way",20,90)}}
  const st=new T.CanvasTexture(cv);st.encoding=T.sRGBEncoding;return st}
/* rack rows with pallets and containers. Instanced meshes keep big centers fast. */
function buildRacks(T){if(W.rk){W.room.remove(W.rk);W.rk.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})})}const room=W.rk=new T.Group();W.room.add(room);const c=CITIES[W.city],lay=lcLayout(c),R=W.rows,frame=new T.MeshStandardMaterial({map:tx(T,"upright",1,RACKH*3),color:0x1e40af,roughness:.45,metalness:.4}),beam=new T.MeshStandardMaterial({color:0xea580c,roughness:.4,metalness:.35});
  const upG=new T.BoxGeometry(.09,RACKH,.11),bmG=new T.BoxGeometry(BAYS*BW,.12,.1),dkG=new T.BoxGeometry(BAYS*BW,.04,RACKD);
  const nUp=R*(BAYS+1)*2,nBm=R*3*2,nDk=R*3,up=new T.InstancedMesh(upG,frame,nUp),bm=new T.InstancedMesh(bmG,beam,nBm),dk=new T.InstancedMesh(dkG,new T.MeshStandardMaterial({map:tx(T,"mesh",BAYS*2,1),color:0xd1d5db,roughness:.5,metalness:.6,transparent:true,alphaTest:.4}),nDk);
  const M=new T.Matrix4();let iu=0,ib=0,id=0;
  for(let r=0;r<R;r++){const z=rowZ(r);for(let b=0;b<=BAYS;b++)for(const s of [-1,1]){M.makeTranslation(rowX(r)-BAYS*BW/2+b*BW,RACKH/2,z+s*RACKD/2);up.setMatrixAt(iu++,M)}
    for(let l=0;l<3;l++){const y=.12+l*LVH;for(const s of [-1,1]){M.makeTranslation(rowX(r),y,z+s*RACKD/2);bm.setMatrixAt(ib++,M)}M.makeTranslation(rowX(r),y+.06,z);dk.setMatrixAt(id++,M)}}
  room.add(up,bm,dk);
  // row letter signs hanging at both ends of each row, bay numbers on the beams of row fronts
  for(let r=0;r<R;r++){const z=rowZ(r),n="ROW "+lcRowName(r);for(const x of [-BAYS*BW/2-.9,BAYS*BW/2+.9])sign(T,room,[n],1.5,.6,rowX(r)+x,RACKH+.6,z,x<0?Math.PI/2:-Math.PI/2,{bg:"#facc15",fg:"#111",fs:64,w:256,h:100})}
  for(let r=0;r<R;r+=RPB)for(let b=0;b<BAYS;b++)sign(T,room,[String(b+1)],.5,.32,bayX(b,r),RACKH+.25,rowZ(r)+RACKD/2+.06,0,{bg:"#111827",fg:"#fde68a",w:128,h:80,fs:60});
  // goods: each bay holds two pallet positions per shelf level; fill decides how many levels are used.
  // Cartons are shrink-wrapped, grain/ore/coal sit in bulk bags, liquids in drums, metals and machines in timber crates.
  const P={pal:[],carton:[],wrap:[],bag:[],drum:[],crate:[]};
  for(const B of lay.bays){if(B.row>=R)continue;const kd=kindOf(B.g),lv=Math.max(1,Math.ceil(B.f*3-1e-9)),x=bayX(B.bay,B.row),z=rowZ(B.row),tint=tintOf(B.g);
    for(let l=0;l<lv;l++){const y=.2+l*LVH,part=l===lv-1?Math.max(.34,(B.f*3)-(lv-1)):1;
      for(const dx of [-.62,.62]){if(dx>0&&part<.5)continue;const px0=x+dx;P.pal.push([px0,y,z,1,1,1]);const y1=y+.144;
        if(kd==="carton"){const h=.5+.6*Math.min(1,part);P.carton.push([px0,y1,z,1,h,1]);P.wrap.push([px0,y1,z,1.03,h+.02,1.03])}
        else if(kd==="bag")P.bag.push([px0,y1,z,1,.95,1,tint]);
        else if(kd==="crate")P.crate.push([px0,y1,z,1,.85,1]);
        else for(const [ox,oz] of [[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]])P.drum.push([px0+ox,y1,z+oz,1,1,1,tint])}}}
  const inst=(geo,mat,arr,col)=>{if(!arr.length)return;const m=new T.InstancedMesh(geo,mat,arr.length),C=new T.Color(),Q=new T.Quaternion(),V=new T.Vector3(),Sv=new T.Vector3(),h=geo.parameters.height;
    arr.forEach((a,i)=>{Sv.set(a[3],a[4],a[5]);V.set(a[0],a[1]+h*a[4]/2,a[2]);M.compose(V,Q,Sv);m.setMatrixAt(i,M);if(col){C.setHex(a[6]);m.setColorAt(i,C)}});if(m.instanceColor)m.instanceColor.needsUpdate=true;room.add(m)};
  inst(new T.BoxGeometry(1.2,.144,1.0),new T.MeshStandardMaterial({map:tx(T,"pallet",1,1),roughness:.9}),P.pal);
  inst(new T.BoxGeometry(1.1,1,.95),new T.MeshStandardMaterial({map:tx(T,"carton",1,1),roughness:.85}),P.carton);
  inst(new T.BoxGeometry(1.1,1,.95),new T.MeshStandardMaterial({color:0xe2e8f0,roughness:.15,metalness:.1,transparent:true,opacity:.28,depthWrite:false}),P.wrap);
  inst(new T.BoxGeometry(1.05,1,.92),new T.MeshStandardMaterial({map:tx(T,"bag",1,1),roughness:.95}),P.bag,true);
  inst(new T.CylinderGeometry(.25,.25,.88,16),new T.MeshStandardMaterial({map:tx(T,"drum",1,1),roughness:.4,metalness:.55}),P.drum,true);
  inst(new T.BoxGeometry(1.12,1,.95),new T.MeshStandardMaterial({map:tx(T,"crate",1,1),roughness:.9}),P.crate);
  // rack-end safety barriers and upright protectors
  for(let r=0;r<R;r++)for(const x0 of [-BAYS*BW/2-.35,BAYS*BW/2+.35]){const x=rowX(r)+x0;ofBox(T,room,.12,.9,RACKD+.4,0xfacc15,x,0,rowZ(r),{r:.5});for(let k=0;k<3;k++)ofBox(T,room,.13,.12,RACKD+.42,0x111111,x,.2+k*.28,rowZ(r),{r:.5})}
  // product labels over the first bay of each product
  for(const it of lay.items){if(it.row>=R)continue;sign(T,room,[G[it.g][0],gq(it.q)+" · "+fmtT(it.t)],BW-.2,.62,bayX(it.bay,it.row),RACKH-.35,rowZ(it.row)+RACKD/2+.08,0,{bg:"#f8fafc",fg:"#0f172a",w:384,h:120,fs:42})}
  if(L0().lv>MAXR)sign(T,room,["Rows "+lcRowName(MAXR)+"+ in the annex","See the computer for every location"],8,1.3,0,6.5,zBack()+.3,0,{w:1024,h:180,bg:"#7c2d12",fg:"#fff"})}
function blocked(x,z,cam){const r=cam?.15:.32;if(x<-HW+r||x>HW-r||z<zBack()+r||z>zEnd()-r)return true;
  for(let i=0;i<W.rows;i++){const zz=rowZ(i);if(Math.abs(z-zz)<RACKD/2+r&&Math.abs(x-rowX(i))<BAYS*BW/2+r)return true}
  if(!cam&&Math.abs(x)<1.7+r&&Math.abs(z-W.pcz)<.6+r)return true;{const ox=HW-5,oz=zEnd()-15.5;if(x>ox-3.5-r&&z>oz-3-r&&z<oz+3+r&&!(z>oz+2.6&&x<ox-1.5)&&(x<ox-3.4+r||z<oz-2.9+r||(z>oz+2.9-r&&x>ox-1.5)||Math.abs(x-ox)<1.1+r&&Math.abs(z-oz-2.4)<.35+r))return true}
  for(const [cx,cz,hw,hd] of [[-HW+4,zEnd()-4.5,3,1.2],[HW-4,zEnd()-4.5,3,1.2],[HW-11,zEnd()-4.6,3,1.2],[5,zEnd()-7.5,1.1,1.1],[-HW+7.75,zEnd()-9,4.5,.6],[HW-8,zEnd()-9,3.8,.6],[-1.25,zEnd()-3.2,2.9,.6]].slice(0,cam?4:7))if(Math.abs(x-cx)<hw+r&&Math.abs(z-cz)<hd+r)return true;return false}
function nearest(){const P=W.p;if(Math.abs(P.x)<2.6&&Math.abs(P.z-W.pcz)<1.6)return {k:"pc",n:"🖥 Use the central computer"};if(P.z>zEnd()-1.4&&Math.abs(P.x)<HW)return {k:"exit",n:"🚪 Leave the building"};return null}
function use(){const n=W.near;if(!n)return;if(n.k==="pc")panel(true);else if(n.k==="exit")close()}
function sub(){const c=CITIES[W.city],L=L0(),s=W.el&&W.el.querySelector("#lc3-sub");if(s&&L)s.textContent=`Level ${L.lv} · ${fmtT(lcUsed(c))} / ${fmtT(lcCap(c))} · ${L.ord.length} products`}
function panel(on){if(W.panel){W.panel.remove();W.panel=null}if(!on){if(W.cv)W.cv.focus();return}const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);
  const c=CITIES[W.city],L=L0(),lay=lcLayout(c);let val=0;for(const it of lay.items)val+=it.q*px(c,it.g);
  p.innerHTML=`<header><span>CENTRAL INVENTORY SYSTEM · ${esc(c.name.toUpperCase())}</span><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></header><div class="bd">
   <div class="sum"><div><small>Stored</small><b>${fmtT(lcUsed(c))}</b></div><div><small>Capacity</small><b>${fmtT(lcCap(c))}</b></div><div><small>Rows · bays</small><b>${L.lv} · ${L.lv*BAYS}</b></div><div><small>Stock value here</small><b>${fmt(val)}</b></div></div>
   <div class="lc3-sort">Re-arrange: <button class="mini" data-lc="sort" data-k="name">A–Z</button><button class="mini" data-lc="sort" data-k="type">By type</button><button class="mini" data-lc="sort" data-k="weight">Heaviest first</button><small>▲▼ change the fill order · Move puts a product at the row and bay you pick</small></div><input id="lc3-q" placeholder="Search products or a row (e.g. B)" aria-label="Search inventory"><div id="lc3-tb"></div></div>`;fillTable()}
function fillTable(){const t=W.panel&&W.panel.querySelector("#lc3-tb");if(!t)return;const c=CITIES[W.city],q=(W.panel.querySelector("#lc3-q").value||"").trim().toLowerCase(),lay=lcLayout(c);
  const rows=lay.items.filter(it=>!q||G[it.g][0].toLowerCase().includes(q)||(q.length<=2&&/^[a-z]+$/.test(q)?lcRowName(it.row).toLowerCase()===q||(it.loc.toLowerCase().match(/row ([a-z]+)/g)||[]).some(r=>r.slice(4)===q):it.loc.toLowerCase().includes(q)));
  t.innerHTML=rows.length?`<table><thead><tr><th>Product</th><th>Qty</th><th class="c-w">Weight</th><th>Location</th><th class="c-t">Type</th><th></th></tr></thead><tbody>${rows.map(it=>`<tr><td class="n">${esc(G[it.g][0])}</td><td>${gq(it.q)}</td><td class="c-w">${fmtT(it.t)}</td><td>${esc(it.loc)}${it.pin?" 📌":""}</td><td class="c-t">${KN[kindOf(it.g)]}</td><td style="white-space:nowrap"><button class="mini g" data-lc="up" data-g="${esc(it.g)}" aria-label="Move up" title="Fill earlier">▲</button><button class="mini g" data-lc="dn" data-g="${esc(it.g)}" aria-label="Move down" title="Fill later">▼</button><button class="mini" data-lc="mv" data-g="${esc(it.g)}" style="background:#7c3aed">Move</button><button class="mini" data-lc="find" data-g="${esc(it.g)}">Find</button><button class="mini" data-lc="go" data-g="${esc(it.g)}" style="background:#15803d">Walk there</button></td></tr>${W.mvg===it.g?`<tr class="mv"><td colspan="6">Move ${esc(G[it.g][0])} to row <input id="lc3-mr" maxlength="3" value="${lcRowName(it.row)}" aria-label="Row letter"> bay <select id="lc3-mb" aria-label="Bay">${Array.from({length:BAYS},(_,i)=>`<option ${i===it.bay?"selected":""}>${i+1}</option>`).join("")}</select><button class="mini" data-lc="pin" data-g="${esc(it.g)}" style="background:#15803d">Place here</button>${it.pin?`<button class="mini g" data-lc="unpin" data-g="${esc(it.g)}">Auto spot</button>`:""}<button class="mini g" data-lc="mvx">Cancel</button><small id="lc3-me" style="color:#fca5a5;margin-left:6px"></small></td></tr>`:""}`).join("")}</tbody></table>`:`<p style="color:#94a3b8">${lay.items.length?"No match.":"The warehouse is empty. Ship goods to "+esc(c.name)+" and they'll be listed here with their row and bay."}</p>`}
function findG(g,go){const c=CITIES[W.city],it=lcLayout(c).items.find(x=>x.g===g);if(!it)return;const x=bayX(it.bay,it.row),z=rowZ(it.row);
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
  if(W.fp){const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),cp=Math.cos(W.pitch);W.cam.position.set(P.x,1.62,P.z);W.cam.lookAt(P.x+fx*cp,1.62+Math.sin(W.pitch),P.z+fz*cp)}
  else{/* march from the player outwards and stop before the first wall, rack or object, so the camera never ends up inside or behind something */
    const sx=Math.sin(P.yaw),sz=Math.cos(P.yaw),hit=(x,z)=>x<-HW+.6||x>HW-.6||z<zBack()+.4||z>zEnd()-.4||blocked(x,z,1);let D=W.zoom;for(let d=.4;d<=W.zoom;d+=.1)if(hit(P.x+sx*d,P.z+sz*d)){D=Math.max(.5,d-.35);break}
    W.cd=D<W.cd?D:W.cd+(D-W.cd)*Math.min(1,dt*6);const cd=W.cd,cy=Math.min(8.5,1.7+cd*.32),cx=P.x+sx*cd,cz=P.z+sz*cd,la=Math.max(.6,1.5-cd*.1);
    W.cam.position.set(cx,cy,cz);W.cam.lookAt(P.x-sx*la,1.1,P.z-sz*la)}
  if(W.find){W.beacon.position.y=RACKH+1.4+Math.sin(t/250)*.25;W.beacon.rotation.y+=dt*2;if(Math.hypot(P.x-W.find.x,P.z-W.find.z)<2.4&&t-W.find.t>1500){W.find=null;W.beacon.visible=false;W.el.querySelector(".lc3-find").hidden=true}}
  const n=W.near=nearest();if(W.btn){if(n&&!W.panel){W.btn.hidden=false;if(W.btn.textContent!==n.n+" (E)")W.btn.textContent=n.n+" (E)"}else W.btn.hidden=true}
  if(((t/2000)|0)!==W._st){W._st=(t/2000)|0;sub();if(W.scr)W.scr.forEach((m,i)=>{m.material.map.dispose();m.material.map=screenTex(W.T,i);m.material.needsUpdate=true})}}
return {open,close,_w:()=>W};
})()
