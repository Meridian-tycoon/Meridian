/* Meridian: Station Aurora bunker (lazy part). The walkable 3D inside of the Antarctica secret facility, for DEV_UIDS and MODERATORS only.
   Same three.js style and controls as the HQ office (loadThree, ofBox/ofCyl/ofSph helpers): W/S forward/back, A/D strafe, arrows or drag to turn, E use.
   Loaded the first time the bunker opens, from index.html. Run with a direct eval inside the game's main closure, so it sees every game variable.
   Keep it a single expression that returns the functions index.html calls. */
(function(){
/* room: floor x -13..13, z -9..9, 4 m high. Stations are boxes the player walks up to. */
const RW=26,RD=18,RH=4;
const ST=[
 {k:"board",n:"Mission board",x0:-6,x1:6,z0:-9,z1:-8.4},
 {k:"desk",n:"Conference desk",x0:-4.5,x1:4.5,z0:-3.1,z1:.1},
 {k:"pc",n:"Computer 1",x0:-13,x1:-11.9,z0:-6.5,z1:-5.1},{k:"pc",n:"Computer 2",x0:-13,x1:-11.9,z0:-3.5,z1:-2.1},{k:"pc",n:"Computer 3",x0:-13,x1:-11.9,z0:-.5,z1:.9},
 {k:"pc",n:"Computer 4",x0:11.9,x1:13,z0:-6.5,z1:-5.1},{k:"pc",n:"Computer 5",x0:11.9,x1:13,z0:-3.5,z1:-2.1},{k:"pc",n:"Computer 6",x0:11.9,x1:13,z0:-.5,z1:.9},
 {k:"rack",n:"Server racks",x0:-13,x1:-11.8,z0:3,z1:7},{k:"rack",n:"Server racks",x0:11.8,x1:13,z0:3,z1:7},
 {k:"af",n:"Airfield control",x0:9.4,x1:11.6,z0:8.3,z1:9},
 {k:"exit",n:"Exit hatch",x0:-1.2,x1:1.2,z0:8.6,z1:9,walk:1}];
/* desk chairs you can sit in: [x, z, facing] */
const CHAIRS=[];for(let i=0;i<5;i++){CHAIRS.push([-3.6+i*1.8,-3.65,Math.PI],[-3.6+i*1.8,.65,0])}CHAIRS.push([-5.1,-1.5,-Math.PI/2],[5.1,-1.5,Math.PI/2]);
const SITN={k:"stand",n:"Stand up"};
const CRATES=[[-8,7.5,1.4],[-6.4,7.8,1.1],[7.5,7.5,1.4]];
const B={el:null,on:false,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:5.5,yaw:0},keys:{},joy:null,drag:null,near:null,panel:null,raf:0,last:0,others:{},ldr:[]};
/* live presence: bunker/{uid} docs {uid,name,x,y,d,at} (x,y = position + 13/9 so they stay positive); only cleared accounts can read or write them (firestore.rules) */
const BP={un:null,others:[],last:0,lx:0,lz:0};
/* DEV BUILD MODE (Mark's dev account only, devGod()): press B in the bunker to place rooms and props. Saved in S.ant.bld as [type,x,z,rot].
   Pieces: [name,w,h,d,color,y,blocks walking]. Snaps to a 0.5 m grid; walls block walking. */
const BLD=[["Wall",2,3,.2,0x55606c,0,1],["Half wall",2,1.2,.2,0x6b7480,0,1],["Floor tile",2,.05,2,0x3b4a5a,0,0],["Desk",1.6,.8,.8,0x7c5a3a,0,1],["Crate",1,1,1,0x8a6d3b,0,1],["Ceiling light",1.5,.06,.3,0xffffff,3.9,0],["Glass wall",2,3,.08,0x67e8f9,0,1],["Door frame",2,3,.2,0x334155,0,0]];
const bOK=()=>{try{return typeof devGod==="function"&&devGod()}catch(e){return false}};
const bList=()=>{const a=st();if(!Array.isArray(a.bld))a.bld=[];return a.bld};
function bMesh(T,b){const d=BLD[b[0]]||BLD[0],g=new T.Group();
  if(b[0]===7){ofBox(T,g,.2,3,.2,d[4],-.9,0,0);ofBox(T,g,.2,3,.2,d[4],.9,0,0);ofBox(T,g,2,.4,.2,d[4],0,2.6,0)}
  else{const m=ofBox(T,g,d[1],d[2],d[3],d[4],0,d[5],0,b[0]===5?{e:0xe0f2fe,ei:.95}:{r:.9});if(b[0]===6&&m&&m.material){m.material.transparent=true;m.material.opacity=.35}}
  g.position.set(b[1],0,b[2]);g.rotation.y=(b[3]||0)*Math.PI/2;return g}
function bBox(b){const d=BLD[b[0]]||BLD[0],r=(b[3]||0)%2;return{w:r?d[3]:d[1],dd:r?d[1]:d[3]}}
function bRebuild(){const T=B.T;if(!T||!B.scene)return;if(B.bG)B.scene.remove(B.bG);B.bG=new T.Group();for(const b of bList())B.bG.add(bMesh(T,b));B.scene.add(B.bG)}
function bSpot(){const P=B.p,q=v=>Math.round(v*2)/2;return[q(Math.max(-RW/2+1,Math.min(RW/2-1,P.x-Math.sin(P.yaw)*2.2))),q(Math.max(-RD/2+1,Math.min(RD/2-1,P.z-Math.cos(P.yaw)*2.2)))]}
function bGhost(){const T=B.T;if(B.ghost){B.scene.remove(B.ghost);B.ghost=null}if(!B.bm||!T)return;const[x,z]=bSpot();const g=bMesh(T,[B.bt,x,z,B.br]);g.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.45;o.material.emissive&&o.material.emissive.setHex(0x22c55e)}});B.ghost=g;B.gk=B.bt+","+x+","+z+","+B.br;B.scene.add(g)}
function bUI(){const h=B.el&&B.el.querySelector(".bk-bld");if(!h)return;h.hidden=!B.bm;if(!B.bm)return;h.innerHTML=`<b>🏗 BUILD MODE</b> · ${bList().length} pieces<br>${BLD.map((d,i)=>`<button class="bk-btn${i===B.bt?" on":""}" data-bk="bt" data-v="${i}">${i+1} ${d[0]}</button>`).join("")}<br><button class="bk-btn" data-bk="bput">Place (F)</button><button class="bk-btn" data-bk="brot">Rotate (R)</button><button class="bk-btn" data-bk="bdel">Remove nearest (X)</button><button class="bk-btn" data-bk="bundo">Undo (Z)</button><button class="bk-btn" data-bk="bclr">Clear all</button><button class="bk-btn" data-bk="bmode">Done (B)</button>`}
function bAct(a,v){if(!bOK())return;const L=bList();
  if(a==="bmode"){B.bm=!B.bm;B.bt=B.bt||0;B.br=B.br||0}
  else if(a==="bt")B.bt=Math.max(0,Math.min(BLD.length-1,+v||0));
  else if(a==="brot")B.br=((B.br||0)+1)%4;
  else if(a==="bput"){if(L.length>=400)return toast("Build limit is 400 pieces");const[x,z]=bSpot();L.push([B.bt,x,z,B.br]);bRebuild();save()}
  else if(a==="bundo"){if(L.pop()){bRebuild();save()}}
  else if(a==="bdel"){const P=B.p;let bi=-1,bd=3;L.forEach((b,i)=>{const d=Math.hypot(P.x-b[1],P.z-b[2]);if(d<bd){bd=d;bi=i}});if(bi>=0){L.splice(bi,1);bRebuild();save()}else toast("No piece within 3 m")}
  else if(a==="bclr"){if(!L.length||!confirm("Remove all "+L.length+" built pieces?"))return;L.length=0;bRebuild();save()}
  B.gk=null;bGhost();bUI()}
const onl=()=>typeof ON!=="undefined"&&ON.db&&ON.user;
function bpSend(force){if(!onl())return;const n=Date.now(),P=B.p;if(!force&&n-BP.last<(Math.abs(P.x-BP.lx)+Math.abs(P.z-BP.lz)>.05?400:10000))return;BP.last=n;BP.lx=P.x;BP.lz=P.z;
  try{ON.db.collection("bunker").doc(ON.user.uid).set({uid:ON.user.uid,name:String(S.name||"Player").slice(0,20),x:Math.round((P.x+13)*100)/100,y:Math.round((P.z+9)*100)/100,d:Math.round(B.av?B.av.rotation.y*100:0),at:firebase.firestore.FieldValue.serverTimestamp()}).catch(e=>console.warn("bunker",e))}catch(e){}}
function bpListen(){if(!onl()||BP.un)return;try{BP.un=ON.db.collection("bunker").limit(50).onSnapshot(q=>{const now=Date.now(),a=[];q.forEach(d=>{const v=d.data()||{};if(d.id===ON.user.uid)return;const at=v.at&&v.at.toMillis?v.at.toMillis():0;if(now-at>45000)return;a.push({uid:d.id,name:String(v.name||"Player"),x:(+v.x||13)-13,z:(+v.y||14)-9,r:(+v.d||0)/100})});BP.others=a},e=>console.warn("bunker listen",e))}catch(e){}}
function bpStop(){try{if(BP.un)BP.un();BP.un=null;BP.others=[];if(onl())ON.db.collection("bunker").doc(ON.user.uid).delete().catch(()=>{})}catch(e){}}
const st=()=>{S.ant=S.ant||{};const a=S.ant;if(!a.ms)a.ms=[{id:1,t:"Secure the Antarctic perimeter",p:"high",done:0},{id:2,t:"Audit the top 10 player fortunes",p:"normal",done:0},{id:3,t:"Review open wars for rule breaks",p:"normal",done:0}];if(!a.notes)a.notes=[];return a};
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function css(){if(document.getElementById("bk-css"))return;const s=document.createElement("style");s.id="bk-css";s.textContent=`
.bk-win{position:fixed;inset:0;z-index:2147483000;background:#05080c;font:13px system-ui,sans-serif;color:#e2e8f0;overflow:hidden;touch-action:none;user-select:none}
.bk-win canvas{display:block;width:100%;height:100%;outline:none}
.bk-top{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:8px;align-items:center;pointer-events:none}.bk-top>*{pointer-events:auto}
.bk-top div{flex:1;pointer-events:none;text-shadow:0 1px 3px #000}.bk-top b{display:block;color:#67e8f9;letter-spacing:.06em;font-size:15px}.bk-top small{color:#94a3b8;font:600 12px ui-monospace,monospace}
.bk-btn{appearance:none;background:#0e7490;color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 13px system-ui;cursor:pointer}
.bk-bld{position:absolute;left:10px;right:10px;bottom:150px;background:#020617d9;border:1px solid #22c55e;border-radius:12px;padding:8px;font-size:12px;line-height:2}.bk-bld b{color:#4ade80}.bk-bld .bk-btn{padding:5px 9px;margin:2px;font-size:11px;background:#1e293b}.bk-bld .bk-btn.on{background:#16a34a}
.bk-help{position:absolute;left:10px;top:58px;font-size:11px;color:#cbd5e1cc;text-shadow:0 1px 3px #000;pointer-events:none}
.bk-lift{position:absolute;inset:0;display:grid;place-items:center;background:#000;transition:opacity .9s;font:700 18px ui-monospace,monospace;color:#67e8f9;text-shadow:0 2px 8px #000;letter-spacing:.08em;pointer-events:none}
.bk-load{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;color:#67e8f9}
.bk-joy{position:absolute;left:22px;bottom:26px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none;display:none}
.bk-joy i{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.8);pointer-events:none}.bk-win.touch .bk-joy{display:block}.bk-win.touch .bk-help{display:none}
.bk-act{position:absolute;left:50%;bottom:22px;transform:translateX(-50%)}.bk-win.touch .bk-act{left:auto;right:14px;transform:none;bottom:150px}
.bk-pan{position:absolute;right:10px;top:58px;width:min(380px,calc(100% - 20px));max-height:calc(100% - 140px);overflow:auto;background:#0b1220f2;border:1px solid #155e75;border-radius:14px;padding:12px 14px;box-shadow:0 10px 40px #000a}
.bk-pan h3{margin:0 0 8px;color:#67e8f9;font-size:15px;display:flex;justify-content:space-between;align-items:center}.bk-pan h3 button{background:none;border:0;color:#94a3b8;font-size:18px;cursor:pointer}
.bk-row{display:flex;gap:8px;align-items:center;padding:7px 0;border-top:1px solid #1e293b}.bk-row span{flex:1}.bk-row small{color:#94a3b8;display:block}
.bk-pan input,.bk-pan textarea,.bk-pan select{width:100%;box-sizing:border-box;background:#020617;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:7px;font:13px system-ui;margin:4px 0;user-select:text}
.bk-tag{font:700 10px system-ui;padding:2px 6px;border-radius:4px;background:#334155}.bk-tag.high{background:#991b1b}.bk-done{opacity:.5;text-decoration:line-through}
.bk-mono{font:12px ui-monospace,monospace;color:#86efac;white-space:pre-wrap;background:#020617;border-radius:6px;padding:8px;margin:0}
@media (max-width:560px){.bk-pan{top:auto;bottom:10px;max-height:50%}}`;document.head.appendChild(s)}
function open(){if(B.on)return;css();B.on=true;const el=B.el=document.createElement("div");el.className="bk-win";el.setAttribute("role","dialog");el.setAttribute("aria-label",ANT.n+" bunker");
  if(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window)el.classList.add("touch");
  el.innerHTML=`<div class="bk-load">Loading the bunker…</div><div class="bk-top"><div><b>❄ ${esc(ANT.n.toUpperCase())}</b><small id="bk-sub">Classified bunker · ${devGod()?"Developer":"Moderator"} clearance</small></div><button class="bk-btn" data-bk="snd" aria-label="Bunker sound on/off" title="Bunker sound">${st().snd?"🔊":"🔇"}</button><button class="bk-btn" data-bk="close">Exit</button></div><div class="bk-lift" hidden><span>⬇ Lift descending to level −3</span></div>
  <div class="bk-help">W/S forward/back · A/D strafe · ←/→ or drag to turn · E use · Esc exit${bOK()?" · B build mode":""}</div><div class="bk-bld" hidden></div><div class="bk-joy"><i></i></div><div class="bk-act"><button class="bk-btn" data-bk="use" hidden></button></div>`;
  document.body.appendChild(el);B.btn=el.querySelector('[data-bk="use"]');B.p={x:0,z:5.5,yaw:0};B.keys={};B.joy=null;B.near=null;B.panel=null;
  const joy=el.querySelector(".bk-joy"),kn=joy.firstChild,jr=56;let jid=null;
  const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";B.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
  const je=()=>{jid=null;B.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select"))return;const k=e.key.toLowerCase();if(bOK()){const bk={b:"bmode"}[k]||(B.bm&&{f:"bput",r:"brot",x:"bdel",z:"bundo"}[k]);if(bk){bAct(bk);e.preventDefault();return}if(B.bm&&k>="1"&&k<="8"){bAct("bt",+k-1);return}}if(k==="e"||k==="enter"){use();e.preventDefault();return}if(k==="escape"){if(B.panel)panel(null);else close();return}B.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});
  el.addEventListener("keyup",e=>{B.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-bk]");if(!b)return;if(/^b(mode|t|put|rot|del|undo|clr)$/.test(b.dataset.bk)){bAct(b.dataset.bk,b.dataset.v);if(B.cv)B.cv.focus();return}act(b.dataset.bk,b.dataset.v,b)});
  loadThree().then(T=>{if(!B.on||B.el!==el)return;build(T);bpListen();bpSend(1);shListen();logEntry();B.liftEnd=performance.now()+2600;B.lift=1;const lf=el.querySelector(".bk-lift");if(lf){lf.hidden=false;lf.style.opacity=1}if(st().snd)hum(true)}).catch(()=>{close();toast("Couldn't load the 3D bunker. Check your connection and try again.")})}
function close(){if(!B.on)return;B.on=false;cancelAnimationFrame(B.raf);B.raf=0;bpStop();shStop();if(B.ac){try{B.ac.close()}catch(e){}B.ac=null}B.sit=null;
  if(B.scene)B.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})});
  if(B.ren){B.ren.dispose();try{B.ren.forceContextLoss()}catch(e){}}B.ren=B.scene=B.cam=B.av=null;B.others={};if(B.el)B.el.remove();B.el=null;save()}
/* text label as a sprite (names over players, signs) */
function label(T,txt,col,w){const cv=document.createElement("canvas");cv.width=512;cv.height=96;const g=cv.getContext("2d");g.fillStyle="rgba(2,6,23,.75)";g.fillRect(0,8,512,80);g.fillStyle=col||"#e2e8f0";g.font="bold 46px sans-serif";g.textAlign="center";g.fillText(String(txt).slice(0,18),256,64);
  const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false,transparent:true}));s.scale.set(w||1.6,(w||1.6)*96/512,1);s.renderOrder=5;return s}
function person(T,suit,skin){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x111827,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x111827,.1,0,0);ofBox(T,g,.42,.55,.26,suit,0,.5,0);ofBox(T,g,.1,.3,.02,0xffffff,0,.72,-.13);ofSph(T,g,.17,skin||0xf1c27d,0,1.22,0);ofBox(T,g,.36,.07,.36,0x1f2937,0,1.32,.02);
  const sh=new T.Mesh(new T.CircleGeometry(.34,16),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.25}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;g.add(sh);g.userData.legs=[l,r];return g}
function boardTex(T){const cv=document.createElement("canvas");cv.width=1024;cv.height=320;const g=cv.getContext("2d");g.fillStyle="#04151d";g.fillRect(0,0,1024,320);g.strokeStyle="#0e7490";g.lineWidth=6;g.strokeRect(3,3,1018,314);
  g.fillStyle="#67e8f9";g.font="bold 44px monospace";g.fillText("MISSION BOARD",28,58);const ms=missions().filter(m=>!m.done);g.fillStyle="#94a3b8";g.font="26px monospace";g.fillText(ms.length+" OPEN",820,58);
  g.font="30px monospace";ms.slice(0,5).forEach((m,i)=>{g.fillStyle=m.p==="high"?"#fca5a5":"#e2e8f0";g.fillText((m.p==="high"?"! ":"- ")+m.t.slice(0,52),28,112+i*44)});if(!ms.length){g.fillStyle="#64748b";g.fillText("No open missions",28,120)}
  const t=new T.CanvasTexture(cv);return t}
function build(T){B.T=T;const el=B.el;let ren;try{ren=new T.WebGLRenderer({antialias:(devicePixelRatio||1)<1.5,powerPreference:"low-power"})}catch(e){close();toast("3D isn't available on this device.");return}
  ren.setPixelRatio(Math.min(1.5,devicePixelRatio||1));B.ren=ren;const cv=ren.domElement;cv.tabIndex=0;cv.setAttribute("aria-label","3D bunker. W A S D to move, E to use.");el.insertBefore(cv,el.firstChild);B.cv=cv;const ld=el.querySelector(".bk-load");if(ld)ld.remove();
  const sc=new T.Scene();sc.background=new T.Color(0x05080c);sc.fog=new T.Fog(0x05080c,14,34);B.scene=sc;B.cam=new T.PerspectiveCamera(60,1,.1,80);
  sc.add(new T.HemisphereLight(0xcffafe,0x1e293b,.55));const dl=new T.DirectionalLight(0xe0f2fe,.35);dl.position.set(3,10,6);sc.add(dl);sc.add(new T.AmbientLight(0xffffff,.16));
  const room=new T.Group();sc.add(room);
  // concrete floor with a cyan-lined conference zone and hazard stripes at the hatch
  ofBox(T,room,RW,.1,RD,0x2a3139,0,-.1,0,{r:.95});for(let i=-12;i<=12;i+=2)ofBox(T,room,.03,.012,RD,0x1f262d,i,0,0,{r:1});for(let j=-8;j<=8;j+=2)ofBox(T,room,RW,.012,.03,0x1f262d,0,0,j,{r:1});
  for(const [w,d,x,z] of [[11,.06,0,-4.6],[11,.06,0,1.6],[.06,6.2,-5.5,-1.5],[.06,6.2,5.5,-1.5]])ofBox(T,room,w,.02,d,0x0e7490,x,0,z,{e:0x0891b2,ei:.8});
  for(let i=0;i<10;i++)ofBox(T,room,.26,.015,.4,i%2?0xfacc15:0x111111,-1.3+i*.29,0,8.2,{r:1});
  // thick concrete walls with ribs, and a steel blast hatch in the front wall
  const wm=ofMat(T,0x46505c,{r:.95}),wall=(w,h,d,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),wm);m.position.set(x,y+h/2,z);room.add(m)};
  wall(RW,RH,.4,0,0,-RD/2-.2);wall(.4,RH,RD,-RW/2-.2,0,0);wall(.4,RH,RD,RW/2+.2,0,0);wall(RW/2-1.3,RH,.4,-RW/4-.65,0,RD/2+.2);wall(RW/2-1.3,RH,.4,RW/4+.65,0,RD/2+.2);wall(2.6,RH-2.6,.4,0,2.6,RD/2+.2);
  for(let x=-12;x<=12;x+=4){ofBox(T,room,.4,RH,.3,0x3a434e,x,0,-RD/2+.1);}for(let z=-6;z<=6;z+=4){ofBox(T,room,.3,RH,.4,0x3a434e,-RW/2+.1,0,z);ofBox(T,room,.3,RH,.4,0x3a434e,RW/2-.1,0,z)}
  ofBox(T,room,RW,.3,RD,0x20262d,0,RH,0,{r:1});
  ofBox(T,room,2.4,2.6,.15,0x64748b,0,0,RD/2+.05,{m:.6,r:.4});ofCyl(T,room,.35,.35,.08,0x94a3b8,0,1.2,RD/2-.05,{m:.7});ofBox(T,room,2.6,.12,.12,0xef4444,0,2.65,RD/2-.05,{e:0xef4444,ei:.9});
  // ceiling light strips (emissive only) and cold blue wall lamps
  for(const x of [-8,0,8])for(const z of [-5,0,5])ofBox(T,room,3,.05,.35,0xffffff,x,RH-.06,z,{e:0xe0f2fe,ei:.95});
  // mission board on the back wall (live texture of open missions)
  ofBox(T,room,12.2,3.2,.2,0x111827,0,.6,-RD/2+.15,{m:.4});B.boardM=new T.MeshBasicMaterial({map:boardTex(T)});const bd=new T.Mesh(new T.PlaneGeometry(11.8,3.7*.98*.95),B.boardM);bd.position.set(0,2.2,-RD/2+.27);room.add(bd);
  // large conference desk with 12 chairs and a hologram globe
  ofBox(T,room,9,.12,3.2,0x3f2a1d,0,.74,-1.5,{r:.6});ofBox(T,room,8.6,.7,2.8,0x2b1d14,0,0,-1.5);ofBox(T,room,8.2,.02,.5,0x0f172a,0,.86,-1.5,{e:0x0e7490,ei:.35});
  for(let i=0;i<5;i++){const x=-3.6+i*1.8;for(const [z,rot] of [[-3.65,0],[.65,Math.PI]]){const c=new T.Group();ofCyl(T,c,.3,.3,.04,0x111827,0,.04,0,{seg:5});ofCyl(T,c,.03,.03,.38,0x9ca3af,0,.06,0);ofBox(T,c,.52,.08,.5,0x1e293b,0,.44,0);ofBox(T,c,.5,.6,.07,0x1e293b,0,.5,.24);c.position.set(x,0,z);c.rotation.y=rot;room.add(c);
    ofBox(T,room,.5,.02,.32,0xcbd5e1,x,.86,z<0?-2.7:-.3)}}
  for(const [x,r] of [[-5.1,-Math.PI/2],[5.1,Math.PI/2]]){const c=new T.Group();ofBox(T,c,.52,.08,.5,0x1e293b,0,.44,0);ofBox(T,c,.5,.6,.07,0x1e293b,0,.5,.24);ofCyl(T,c,.03,.03,.44,0x9ca3af,0,0,0);c.position.set(x,0,-1.5);c.rotation.y=r;room.add(c)}
  B.holo=ofSph(T,room,.42,0x22d3ee,0,1.55,-1.5,{e:0x06b6d4,ei:.9,op:.55});ofCyl(T,room,.35,.45,.1,0x334155,0,.86,-1.5,{m:.6});
  // computers along both side walls: desk, two glowing monitors, a chair
  for(const s of ST)if(s.k==="pc"){const left=s.x0<0,cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2,g=new T.Group();ofBox(T,g,1.4,.06,1,0x334155,0,.72,0);ofBox(T,g,1.3,.7,.9,0x1e293b,0,0,0);
    for(const dx of [-.33,.33]){ofBox(T,g,.6,.4,.04,0x0f172a,dx,.95,-.25);ofBox(T,g,.56,.36,.01,0x0891b2,dx,.97,-.225,{e:0x22d3ee,ei:.8})}ofBox(T,g,.5,.02,.16,0x475569,0,.78,.1);
    g.position.set(cx,0,cz);g.rotation.y=left?Math.PI/2:-Math.PI/2;room.add(g)}
  // server racks with blinking lights
  B.leds=[];for(const s of ST)if(s.k==="rack")for(let i=0;i<3;i++){const g=new T.Group();ofBox(T,g,1.1,2.2,1.2,0x0b1120,0,0,0,{m:.4,r:.4});for(let j=0;j<9;j++)B.leds.push(ofBox(T,g,.04,.04,.02,0x22c55e,.3,.25+j*.21,.61,{e:0x22c55e,ei:1}));g.position.set((s.x0+s.x1)/2,0,s.z0+.65+i*1.3);g.rotation.y=s.x0<0?Math.PI/2:-Math.PI/2;room.add(g)}
  for(const [x,z,w] of CRATES)ofBox(T,room,w,w*.8,w,0x4d5b3a,x,0,z,{r:.9});
  // signs over the zones
  for(const [t,x,z,ry] of [["COMPUTERS",-12.7,-3,Math.PI/2],["COMPUTERS",12.7,-3,-Math.PI/2],["SERVERS",-12.7,5,Math.PI/2],["SERVERS",12.7,5,-Math.PI/2]]){const s=label(T,t,"#67e8f9",2.4);s.position.set(x+(x<0?.3:-.3),3.2,z);room.add(s)}
  {const s=label(T,ANT.n.toUpperCase(),"#a5f3fc",3.2);s.position.set(0,3.25,RD/2-.3);room.add(s)}
  // two windows in the front wall looking out at the Antarctic storm (animated canvas texture)
  {const cv2=document.createElement("canvas");cv2.width=256;cv2.height=128;B.snowC=cv2;B.flakes=[];for(let i=0;i<90;i++)B.flakes.push({x:Math.random()*256,y:Math.random()*128,v:20+Math.random()*50,r:.6+Math.random()*1.6});B.snowT=new T.CanvasTexture(cv2);
    for(const x of [-6.5,6.5]){ofBox(T,room,4.4,1.9,.3,0x1f2937,x,1.25,RD/2-.05,{m:.5});const w=new T.Mesh(new T.PlaneGeometry(4,1.5),new T.MeshBasicMaterial({map:B.snowT}));w.position.set(x,2.2,RD/2-.21);w.rotation.y=Math.PI;room.add(w)}}
  // airfield control desk by the front wall: radar screen + sign
  {const g=new T.Group();ofBox(T,g,2.2,.9,.7,0x1e293b,0,0,0);ofBox(T,g,2,.04,.6,0x334155,0,.9,0);const sc2=ofScreenTex(T,"AIRFIELD",["SR-71 · C-130 · B-2","Press E"]);const m=new T.Mesh(new T.PlaneGeometry(1.4,.8),new T.MeshBasicMaterial({map:sc2}));m.position.set(0,1.45,-.2);g.add(m);
    g.position.set(10.5,0,8.65);g.rotation.y=Math.PI;room.add(g);const l=label(T,"AIRFIELD","#fde68a",2);l.position.set(10.5,2.6,8.7);room.add(l)}
  // me
  const av=person(T,devGod()?0x854d0e:0x1e3a8a);sc.add(av);B.av=av;B.legs=av.userData.legs;
  cv.addEventListener("pointerdown",e=>{B.drag={x:e.clientX,id:e.pointerId};cv.focus()});cv.addEventListener("pointermove",e=>{if(B.drag&&B.drag.id===e.pointerId){B.p.yaw-=(e.clientX-B.drag.x)*.006;B.drag.x=e.clientX}});
  const de=()=>{B.drag=null};cv.addEventListener("pointerup",de);cv.addEventListener("pointercancel",de);
  B.bm=false;B.bt=0;B.br=0;B.ghost=null;B.bG=null;bRebuild();B.last=performance.now();B.raf=requestAnimationFrame(loop);setTimeout(()=>cv.focus(),30)}
function blocked(x,z){const r=.3;if(x<-RW/2+r||x>RW/2-r||z<-RD/2+r||z>RD/2-r)return true;for(const s of ST)if(!s.walk&&x>s.x0-r&&x<s.x1+r&&z>s.z0-r&&z<s.z1+r)return true;
  for(const [cx,cz,w] of CRATES)if(Math.abs(x-cx)<w/2+r&&Math.abs(z-cz)<w/2+r)return true;
  for(const b of (S.ant&&S.ant.bld)||[]){if(!(BLD[b[0]]||[])[6])continue;const q=bBox(b);if(Math.abs(x-b[1])<q.w/2+r&&Math.abs(z-b[2])<q.dd/2+r)return true}return false}
function nearest(){const P=B.p;if(B.sit)return SITN;let best=null,bd=1.4;for(const s of ST){const cx=Math.max(s.x0,Math.min(P.x,s.x1)),cz=Math.max(s.z0,Math.min(P.z,s.z1)),d=Math.hypot(P.x-cx,P.z-cz);if(d<bd){bd=d;best=s}}
  for(const c of CHAIRS){const d=Math.hypot(P.x-c[0],P.z-c[1]);if(d<.75&&d<bd){bd=d;best={k:"chair",n:"Sit down",c}}}return best}
function loop(t){if(!B.on||!B.ren){B.raf=0;return}B.raf=requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min(.05,Math.max(0,(t-B.last)/1000));B.last=t;step(dt,t);
  const w=B.el.clientWidth,h=B.el.clientHeight;if(B.cv.width!==Math.round(w*B.ren.getPixelRatio())||B._h!==h){B.ren.setSize(w,h,false);B.cam.aspect=w/h;B.cam.updateProjectionMatrix();B._h=h}B.ren.render(B.scene,B.cam)}
function step(dt,t){const P=B.p,k=B.keys,T=B.T,busy=!!B.panel&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".bk-pan");
  let f=0,s=0,turn=0;if(!busy){if(k.w||k.arrowup)f+=1;if(k.s||k.arrowdown)f-=1;if(k.d)s+=1;if(k.a)s-=1;if(k.arrowleft)turn+=1;if(k.arrowright)turn-=1;if(B.joy){f-=B.joy.y;s+=B.joy.x}}
  if(B.lift>0){B.lift=Math.max(0,(B.liftEnd-performance.now())/2600);f=s=0;const lf=B.el.querySelector(".bk-lift");if(lf&&B.lift<.4)lf.style.opacity=B.lift/.4;if(!B.lift&&lf)lf.hidden=true}
  if(B.sit&&(Math.abs(f)+Math.abs(s)>.3))stand();
  P.yaw+=turn*2.2*dt;const m=B.sit?0:Math.hypot(f,s);let moving=false;
  if(m>.05){const sp=(k.shift?6:3.6)*Math.min(1,m)*dt/m,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);const dx=(fx*f+rx*s)*sp,dz=(fz*f+rz*s)*sp;
    if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz;moving=true;B.av.rotation.y=Math.atan2(-(fx*f+rx*s),-(fz*f+rz*s))}
  B.walkT=moving?B.walkT+dt*10:0;const sw=Math.sin(B.walkT)*.5;B.legs[0].rotation.x=sw;B.legs[1].rotation.x=-sw;B.av.position.set(P.x,moving?Math.abs(Math.sin(B.walkT))*.04:0,P.z);if(B.sit){B.av.position.y=.2;B.av.rotation.y=B.sit[2];B.legs[0].rotation.x=B.legs[1].rotation.x=-1.4}
  const D=4.8;let cx=P.x+Math.sin(P.yaw)*D,cz=P.z+Math.cos(P.yaw)*D;cx=Math.max(-RW/2+.3,Math.min(RW/2-.3,cx));cz=Math.max(-RD/2+.3,Math.min(RD/2-.3,cz));B.cam.position.set(cx,2.9+(B.lift||0)*.8,cz);B.cam.lookAt(P.x-Math.sin(P.yaw)*1.2,.9,P.z-Math.cos(P.yaw)*1.2);
  if(B.holo){B.holo.rotation.y+=dt*.8;B.holo.material.opacity=.45+.15*Math.sin(t/400)}
  if(B.leds&&((t/250)|0)!==B._lt){B._lt=(t/250)|0;B.leds.forEach((l,i)=>{const on=((i*7+B._lt)%5)!==0,c=((i+B._lt)%11)?0x22c55e:0xef4444;l.material.color.setHex(on?c:0x111827);l.material.emissive.setHex(on?c:0)})}
  if(B.snowC&&(B._st=(B._st||0)+dt)>.06){const g=B.snowC.getContext("2d"),gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,"#8fa6bd");gr.addColorStop(.7,"#d9e4ee");gr.addColorStop(1,"#f4f8fb");g.fillStyle=gr;g.fillRect(0,0,256,128);
    g.fillStyle="#fff";for(const f2 of B.flakes){f2.y+=f2.v*B._st;f2.x+=(30+Math.sin(t/900+f2.r)*20)*B._st;if(f2.y>128){f2.y=-2;f2.x=Math.random()*256}if(f2.x>256)f2.x-=256;g.beginPath();g.arc(f2.x,f2.y,f2.r,0,7);g.fill()}B._st=0;B.snowT.needsUpdate=true}
  others(dt);const n=nearest();if(n!==B.near){B.near=n;B.btn.hidden=!n;if(n)B.btn.textContent=n.k==="exit"?"🛫 Exit hatch (E)":n.k==="chair"||n.k==="stand"?`${n.n} (E)`:`Use ${n.n} (E)`}
  if((B._sub=(B._sub||0)+dt)>1){B._sub=0;const e=document.getElementById("bk-sub");if(e)e.textContent=`Classified bunker · ${devGod()?"Developer":"Moderator"} clearance · ${onl()?BP.others.length+1+" inside":"offline: sign in to see others"}`}
  if(B.bm){const[x,z]=bSpot();if(B.gk!==B.bt+","+x+","+z+","+B.br)bGhost()}
  bpSend()}
/* other cleared players: one figure + name tag each, eased toward their last sent spot */
function others(dt){const T=B.T,seen={};for(const o of BP.others){seen[o.uid]=1;let g=B.others[o.uid];
  if(!g){g=person(T,devUid(o.uid)?0x854d0e:0x0e7490,0xe0ac69);const lb=label(T,o.name,devUid(o.uid)?"#fde047":"#a5f3fc",1.4);lb.position.y=1.75;g.add(lb);g.position.set(o.x,0,o.z);g.userData.wt=0;B.scene.add(g);B.others[o.uid]=g}
  const dx=o.x-g.position.x,dz=o.z-g.position.z,mv=Math.hypot(dx,dz)>.03;g.position.x+=dx*Math.min(1,dt*8);g.position.z+=dz*Math.min(1,dt*8);g.rotation.y=o.r;
  g.userData.wt=mv?g.userData.wt+dt*10:0;const sw=Math.sin(g.userData.wt)*.5;g.userData.legs[0].rotation.x=sw;g.userData.legs[1].rotation.x=-sw}
  for(const u in B.others)if(!seen[u]){B.scene.remove(B.others[u]);delete B.others[u]}}
function use(){const n=B.near;if(!n)return;if(n.k==="exit"){close();return}if(n.k==="af"){close();afTab="hangar";PH.open=true;PH.app="ant";phSave();phRender();return}if(n.k==="chair"){B.sit=n.c;B.p.x=n.c[0];B.p.z=n.c[1];B.near=null;return}if(n.k==="stand"){stand();B.near=null;return}panel(n.k)}
function stand(){if(!B.sit)return;const c=B.sit,dx=c[0],dz=c[1]+1.5,m=Math.hypot(dx,dz)||1;B.sit=null;B.p.x=c[0]+dx/m*.7;B.p.z=c[1]+dz/m*.7;B.legs[0].rotation.x=B.legs[1].rotation.x=0}
function panel(k){if(B.panel&&B.panel.parentNode)B.panel.remove();B.panel=null;if(!k){if(B.cv)B.cv.focus();return}const p=B.panel=document.createElement("div");p.className="bk-pan";B.el.appendChild(p);fill(k)}
function refreshBoard(){try{if(B.boardM){B.boardM.map.dispose();B.boardM.map=boardTex(B.T);B.boardM.needsUpdate=true}}catch(e){}}
/* ---------- shared team data (Firestore, cleared accounts only; see bunkerOk() in firestore.rules) ----------
   bmis missions, bnote briefing notes, bchat mod chat (k "m" message, "c" meeting call), blog entry log, balarm intruder alarms, bwarn/{uid} warnings to a player.
   Offline (not signed in) the board and notes fall back to this device's save. */
const SH={un:[],ms:null,notes:null,chat:[],log:[],alarm:[],look:null,lookQ:"",pctab:"intel",seen:0};
const tsm=v=>v&&v.toMillis?v.toMillis():(+v||0);
const me=()=>({by:ON.user.uid,name:String(S.name||"Player").slice(0,20)});
const now0=()=>firebase.firestore.FieldValue.serverTimestamp();
function shListen(){if(!onl()||SH.un.length)return;const db=ON.db,L=(c,lim,f)=>{try{SH.un.push(db.collection(c).orderBy("at","desc").limit(lim).onSnapshot(q=>{f(q.docs.map(d=>({id:d.id,...d.data()})));if(B.panel)fill(B.panel.dataset.k)},e=>console.warn(c,e)))}catch(e){}};
  L("bmis",60,a=>{SH.ms=a;refreshBoard()});L("bnote",50,a=>{SH.notes=a});L("bchat",60,a=>{SH.chat=a.reverse()});L("blog",40,a=>{SH.log=a});L("balarm",30,a=>{SH.alarm=a})}
function shStop(){SH.un.forEach(u=>{try{u()}catch(e){}});SH.un=[];SH.ms=SH.notes=null}
const missions=()=>SH.ms?SH.ms.map(m=>({id:m.id,t:m.t,p:m.p,done:m.done?1:0,name:m.name})):st().ms;
const notes=()=>SH.notes?SH.notes.map(n=>({id:n.id,t:n.t,at:tsm(n.at),name:n.name})):st().notes.slice().reverse().map(n=>({id:n.at,t:n.t,at:n.at}));
function logEntry(){if(!onl())return;try{ON.db.collection("blog").add({...me(),at:now0()}).catch(()=>{})}catch(e){}}
const ago=t=>{const s=Math.max(0,(Date.now()-t)/1000);return s<60?"just now":s<3600?Math.floor(s/60)+" min ago":s<86400?Math.floor(s/3600)+" h ago":new Date(t).toLocaleDateString()};
const note=t=>`<p style="color:#94a3b8;font-size:11px">${t}</p>`;
function fill(k){const p=B.panel;if(!p)return;const foc=document.activeElement,keep=foc&&p.contains(foc)&&foc.id?{id:foc.id,v:foc.value,s:foc.selectionStart}:null;p.dataset.k=k;
  const h3=t=>`<h3>${t}<button data-bk="pclose" aria-label="Close">×</button></h3>`,shared=onl()?"Shared live with every cleared moderator.":"Offline: saved on this device only. Sign in to share with the team.";
  if(k==="board"){const ms=missions();p.innerHTML=h3("📋 Mission board")+`<input id="bkmt" placeholder="New mission…" maxlength="80"><div style="display:flex;gap:6px"><select id="bkmp" style="flex:1"><option value="normal">Normal</option><option value="high">High priority</option></select><button class="bk-btn" data-bk="madd">Post</button></div>`
    +(ms.length?ms.map(m=>`<div class="bk-row"><span class="${m.done?"bk-done":""}">${esc(m.t)}${m.name?`<small>by ${esc(m.name)}</small>`:""}</span><span class="bk-tag ${m.p}" style="flex:0">${m.p==="high"?"HIGH":"NORMAL"}</span><button class="bk-btn" data-bk="mdone" data-v="${esc(m.id)}">${m.done?"Reopen":"Done"}</button><button class="bk-btn" style="background:#7f1d1d" data-bk="mdel" data-v="${esc(m.id)}" aria-label="Delete">✕</button></div>`).join(""):`<p>No missions yet.</p>`)+note(shared)}
  else if(k==="desk"){const ns=notes(),ch=SH.chat;p.innerHTML=h3("🪑 Conference desk")
    +(onl()?`<div style="display:flex;gap:6px;margin-bottom:6px"><button class="bk-btn" data-bk="call" style="background:#b45309">📣 Call a meeting</button></div>
    <div class="bk-mono" id="bkchat" style="color:#e2e8f0;max-height:180px;overflow:auto">${ch.length?ch.map(c=>c.k==="c"?`<div style="color:#fbbf24">📣 ${esc(c.name)} called a meeting · ${ago(tsm(c.at))}</div>`:`<div><b style="color:${devUid(c.by)?"#fde047":"#67e8f9"}">${esc(c.name)}</b> ${esc(c.t)}</div>`).join(""):"No messages yet."}</div>
    <div style="display:flex;gap:6px"><input id="bkcm" placeholder="Message the mod team…" maxlength="200"><button class="bk-btn" data-bk="csend">Send</button></div>`:note("Sign in to use the moderator chat."))
    +`<p style="margin:10px 0 4px;color:#cbd5e1">Briefing notes</p><textarea id="bkn" rows="2" maxlength="300" placeholder="Write a briefing note…"></textarea><button class="bk-btn" data-bk="nadd">Add note</button>`
    +(ns.length?ns.map(n=>`<div class="bk-row"><span>${esc(n.t)}<small>${n.name?esc(n.name)+" · ":""}${ago(n.at)}</small></span><button class="bk-btn" style="background:#7f1d1d" data-bk="ndel" data-v="${esc(n.id)}" aria-label="Delete">✕</button></div>`).join(""):`<p style="color:#94a3b8">No notes yet.</p>`)+note(shared);
    const cb=p.querySelector("#bkchat");if(cb)cb.scrollTop=cb.scrollHeight}
  else if(k==="pc"){const tb=SH.pctab,tabs=[["intel","Intel"],["look","Player lookup"],["log","Security log"]];let h=h3("🖥 Aurora terminal")+`<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">${tabs.map(([x,n])=>`<button class="bk-btn" data-bk="pctab" data-v="${x}" style="${tb===x?"":"background:#1e293b"}">${n}</button>`).join("")}</div>`;
    if(tb==="intel"){let rich="";try{const L=(typeof ON!=="undefined"&&ON.lb)||[];rich=L.slice(0,5).map((x,i)=>`${i+1}. ${x.name||"?"}  ${fmt(x.nw||0)}`).join("\n")}catch(e){}
      h+=`<pre class="bk-mono">&gt; AURORA OS v2.0  [${devGod()?"DEV":"MOD"}]\n&gt; uplink ......... ${onl()?"OK":"OFFLINE"}\n&gt; inside now ..... ${BP.others.length+1}\n&gt; open missions .. ${missions().filter(m=>!m.done).length}\n&gt; intruder alerts  ${SH.alarm.length}\n&gt; moderators ..... ${Object.keys(MODERATORS).length}\n${rich?"&gt; top players\n"+esc(rich):""}</pre>`}
    else if(tb==="look"){h+=onl()?`<div style="display:flex;gap:6px"><input id="bklq" placeholder="Exact player name" maxlength="20" value="${esc(SH.lookQ)}"><button class="bk-btn" data-bk="look">Search</button></div>`
      +(SH.look==null?note("Search by exact name (case-sensitive)."):SH.look.length?SH.look.map(x=>`<div class="bk-row"><span><b>${esc(x.name)}</b><small>Worth ${fmt(+x.nw||0)}${x.rank?` · rank #${x.rank}`:""}${x.govC?` · governs ${esc(x.govC)}`:""}${x.lastSeen?` · seen ${ago(tsm(x.lastSeen))}`:""}</small></span></div>
        <div style="display:flex;gap:6px"><input id="bkw_${esc(x.id)}" placeholder="Warning message…" maxlength="160"><button class="bk-btn" style="background:#b91c1c" data-bk="warn" data-v="${esc(x.id)}">⚠ Warn</button></div>`).join(""):`<p>No player with that name.</p>`)
      +note("A warning pops up on that player's screen the next time they're online."):note("Sign in to look players up.")}
    else{const ev=[...SH.log.map(x=>({t:tsm(x.at),h:`🚪 <b>${esc(x.name)}</b> entered`})),...SH.alarm.map(x=>({t:tsm(x.at),h:`🚨 <b style="color:#fca5a5">${esc(x.name)}</b> tried to reach the facility`}))].sort((a,b)=>b.t-a.t).slice(0,40);
      h+=onl()?(ev.length?ev.map(e=>`<div class="bk-row"><span>${e.h}<small>${ago(e.t)}</small></span></div>`).join(""):`<p>No entries yet.</p>`):note("Sign in to see the security log.")}
    p.innerHTML=h}
  else if(k==="rack"){p.innerHTML=h3("🗄 Server racks")+`<pre class="bk-mono">ALL SYSTEMS NOMINAL\nTEMP  -41°C outside · 19°C inside\nPOWER geothermal 100%\nUPLINK ${onl()?"ENCRYPTED":"OFFLINE"}</pre>`}
  if(keep){const e=p.querySelector("#"+keep.id);if(e){e.value=keep.v;e.focus();try{e.setSelectionRange(keep.s,keep.s)}catch(x){}}}}
function act(a,v,b){const s=st(),db=onl()?ON.db:null,val=id=>{const e=B.panel&&B.panel.querySelector("#"+id);return e?e.value.trim():""},err=e=>{console.warn("bunker",e);toast("Couldn't save. Check that the latest Firestore rules are published.")};
  if(a==="close"){close();return}if(a==="use"){use();return}if(a==="pclose"){panel(null);return}if(a==="snd"){hum(!B.snd);return}
  if(a==="pctab"){SH.pctab=v;fill("pc");return}
  if(a==="madd"){const t=val("bkmt"),p=B.panel.querySelector("#bkmp").value;if(!t)return;if(db)db.collection("bmis").add({t,p,done:false,...me(),at:now0()}).catch(err);else{s.ms.push({id:s.ms.reduce((m,x)=>Math.max(m,x.id),0)+1,t,p,done:0});save();fill("board");refreshBoard()}B.panel.querySelector("#bkmt").value="";return}
  if(a==="mdone"){if(db){const m=SH.ms.find(x=>x.id===v);if(m)db.collection("bmis").doc(v).update({done:!m.done}).catch(err)}else{const m=s.ms.find(x=>x.id===+v);if(m)m.done=m.done?0:1;save();fill("board");refreshBoard()}return}
  if(a==="mdel"){if(db)db.collection("bmis").doc(v).delete().catch(err);else{s.ms=s.ms.filter(x=>x.id!==+v);save();fill("board");refreshBoard()}return}
  if(a==="nadd"){const t=val("bkn");if(!t)return;if(db)db.collection("bnote").add({t,...me(),at:now0()}).catch(err);else{s.notes.push({t,at:Date.now()});if(s.notes.length>50)s.notes.shift();save();fill("desk")}B.panel.querySelector("#bkn").value="";return}
  if(a==="ndel"){if(db)db.collection("bnote").doc(v).delete().catch(err);else{s.notes=s.notes.filter(n=>n.at!==+v);save();fill("desk")}return}
  if(a==="csend"){const t=val("bkcm");if(!t||!db)return;db.collection("bchat").add({t,k:"m",...me(),at:now0()}).catch(err);B.panel.querySelector("#bkcm").value="";return}
  if(a==="call"){if(!db)return;if(Date.now()-(SH.lastCall||0)<60000)return toast("You just called a meeting");SH.lastCall=Date.now();db.collection("bchat").add({t:"",k:"c",...me(),at:now0()}).then(()=>toast("📣 Meeting called: every cleared moderator gets pinged")).catch(err);return}
  if(a==="look"){const q=val("bklq");SH.lookQ=q;if(!q||!db)return;db.collection("players").where("name","==",q).limit(5).get().then(r=>{SH.look=r.docs.map(d=>({id:d.id,...d.data()}));fill("pc")}).catch(e=>{SH.look=[];fill("pc");console.warn(e)});return}
  if(a==="warn"){const t=val("bkw_"+v);if(!t||!db)return;db.collection("bwarn").doc(v).set({t,...me(),at:now0()}).then(()=>toast("⚠ Warning sent")).catch(err);return}}
/* low bunker hum (WebAudio, no files): off by default, the 🔊 button toggles it */
function hum(on){B.snd=on;const bt=B.el&&B.el.querySelector('[data-bk="snd"]');if(bt)bt.textContent=on?"🔊":"🔇";try{S.ant.snd=on?1:0}catch(e){}
  if(!on){if(B.ac){try{B.ac.close()}catch(e){}B.ac=null}return}if(B.ac)return;try{const ac=B.ac=new (window.AudioContext||window.webkitAudioContext)(),g=ac.createGain();g.gain.value=.05;g.connect(ac.destination);
    const o=ac.createOscillator();o.type="sine";o.frequency.value=55;o.connect(g);o.start();const o2=ac.createOscillator(),g2=ac.createGain();o2.type="triangle";o2.frequency.value=110.5;g2.gain.value=.25;o2.connect(g2);g2.connect(g);o2.start();
    const n=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=n.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3}const ns=ac.createBufferSource(),lp=ac.createBiquadFilter();ns.buffer=n;ns.loop=true;lp.type="lowpass";lp.frequency.value=300;ns.connect(lp);lp.connect(g);ns.start()}catch(e){B.ac=null}}
return {open,close,others:()=>BP.others,_b:()=>B};
})()
