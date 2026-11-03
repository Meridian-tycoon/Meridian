/* Meridian: walkable 3D office (lazy part). Loaded the first time a player walks into an HQ office or the presidential office, by ofLoad() in index.html.
   It holds the three.js scene: building the room, staff and visitors, the loop, placing furniture, the shop panel and keyboard/touch input.
   It is run with a direct eval inside the game's main closure, so it sees every game variable (S, OFC, OFFICE_ITEMS, PRES_ITEMS, toast, ...) exactly as if it were still inline.
   Keep it a single expression that returns the functions index.html calls. */
(function(){
/* tiny low-poly helpers: origin is the floor, item front faces +z */
const ofMat=(T,col,o)=>new T.MeshStandardMaterial({color:col,roughness:o&&o.r!=null?o.r:.75,metalness:o&&o.m||0,emissive:o&&o.e||0,emissiveIntensity:o&&o.ei!=null?o.ei:1,transparent:!!(o&&o.op),opacity:o&&o.op||1,flatShading:true});
function ofBox(T,g,w,h,d,col,x,y,z,o){const m=new T.Mesh(new T.BoxGeometry(w,h,d),ofMat(T,col,o));m.position.set(x,y+h/2,z);g.add(m);return m}
function ofCyl(T,g,rt,rb,h,col,x,y,z,o){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,o&&o.seg||10),ofMat(T,col,o));m.position.set(x,y+h/2,z);g.add(m);return m}
function ofSph(T,g,r,col,x,y,z,o){const m=new T.Mesh(new T.SphereGeometry(r,10,7),ofMat(T,col,o));m.position.set(x,y,z);g.add(m);return m}
function ofScreenTex(T,title,lines){const cv=document.createElement("canvas");cv.width=512;cv.height=288;const g=cv.getContext("2d");
  g.fillStyle="#0b1220";g.fillRect(0,0,512,288);g.fillStyle="#38bdf8";g.font="bold 30px sans-serif";g.fillText(title,22,46);
  g.fillStyle="#e2e8f0";g.font="22px monospace";lines.forEach((s,i)=>g.fillText(s,22,92+i*32));
  for(let i=0;i<10;i++){const h=24+((i*37+7*i*i)%80);g.fillStyle=i%3?"#22c55e":"#38bdf8";g.fillRect(300+i*19,270-h,13,h)}
  const tx=new T.CanvasTexture(cv);return tx}
function ofDashTex(T){let t={inc:0,nw:0};try{t=totals()}catch(e){}
  return ofScreenTex(T,(OFC.city?OFC.city.name.toUpperCase()+" ":"")+"HQ",["Cash "+fmt(S.cash),"Per hr "+fmt(t.inc),"Worth "+fmt(t.nw),"HQs "+Object.keys(S.hq).filter(k=>S.hq[k]).length])}

const OFCCSS=`#ofc{--ofbg:#c7d6e6;--ofink:#0f172a;--ofsm:#166534;--ofsh:0 1px 3px rgba(255,255,255,.85);--ofhelp:rgba(15,23,42,.75);--obbg:rgba(255,255,255,.88);--obink:#0f172a;--ojoy:rgba(15,23,42,.12);--ojoyb:rgba(15,23,42,.35);--ojoyi:rgba(15,23,42,.7);--opbg:#f8fafc;--opink:#0f172a;--ophd:#fff;--opline:#e2e8f0;--opline2:#eef2f7;--opsoft:#eef2f7;--opsel:#0f172a;--opselink:#fff;--opmut:#64748b;--opbtn:#0f172a;--opbtnink:#fff;--oload:#334155;--ofshadow:0 4px 14px rgba(15,23,42,.18)}
:root[data-theme="dark"] #ofc{--ofbg:#1e2430;--ofink:#f8fafc;--ofsm:#bbf7d0;--ofsh:0 1px 3px rgba(0,0,0,.6);--ofhelp:rgba(255,255,255,.75);--obbg:rgba(15,23,42,.72);--obink:#fff;--ojoy:rgba(255,255,255,.14);--ojoyb:rgba(255,255,255,.35);--ojoyi:rgba(255,255,255,.8);--opbg:#141d30;--opink:#e6ebf5;--ophd:#1c2840;--opline:#2a3750;--opline2:#223049;--opsoft:#25324d;--opsel:#e6ebf5;--opselink:#0b1220;--opmut:#9aa8bd;--opbtn:#2a3a5c;--opbtnink:#fff;--oload:#cbd5e1;--ofshadow:0 4px 14px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.2) inset}
#ofc{position:fixed;inset:0;z-index:30;background:var(--ofbg);color:var(--ofink);font-family:Figtree,ui-sans-serif,system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
#ofc canvas{display:block;width:100%;height:100%;outline:none}
#ofc .ob{appearance:none;border:0;border-radius:999px;padding:9px 14px;font:600 13px/1 inherit;font-family:inherit;color:var(--obink);background:var(--obbg);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;box-shadow:var(--ofshadow);white-space:nowrap}
#ofc .ob:disabled{opacity:.45;cursor:default}#ofc .ob.pri{background:#2563eb;color:#fff}#ofc .ob.ok{background:#16a34a;color:#fff}#ofc .ob.bad{background:#dc2626;color:#fff}
#ofc .otop{position:absolute;top:max(10px,env(safe-area-inset-top,0px));left:10px;right:10px;display:flex;gap:6px;align-items:center;pointer-events:none}
#ofc .otop>*{pointer-events:auto}#ofc .ottl{flex:1;min-width:0;pointer-events:none;text-shadow:var(--ofsh)}#ofc .ottl b{display:block;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ofc .ottl small{font:600 12px ui-monospace,monospace;color:var(--ofsm)}
#ofc .ohelp{position:absolute;left:10px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 46px);font-size:11px;color:var(--ofhelp);text-shadow:var(--ofsh);pointer-events:none}
#ofc .opr{position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 20px);background:var(--obbg);color:var(--obink);padding:8px 10px;border-radius:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
#ofc .opr span{font-size:13px;font-weight:600;padding:0 4px}#ofc .opr .ob{padding:8px 12px}
#ofc .ojoy{position:absolute;left:22px;bottom:calc(26px + env(safe-area-inset-bottom,0px));width:112px;height:112px;border-radius:50%;background:var(--ojoy);border:2px solid var(--ojoyb);touch-action:none;display:none}
#ofc .ojoy i{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:var(--ojoyi);pointer-events:none}
#ofc.touch .ojoy{display:block}#ofc.touch .opr{left:auto;right:10px;transform:none;bottom:calc(150px + env(safe-area-inset-bottom,0px));justify-content:flex-end}#ofc.touch .ohelp{display:none}
#ofc .opn{position:absolute;right:10px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 48px);bottom:10px;width:min(360px,calc(100% - 20px));background:var(--opbg);color:var(--opink);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.4);display:flex;flex-direction:column;overflow:hidden}
#ofc .opn header{display:flex;gap:4px;padding:10px;border-bottom:1px solid var(--opline);background:var(--ophd);align-items:center;position:static;backdrop-filter:none}
#ofc .opn header button{appearance:none;border:0;background:var(--opsoft);color:var(--opink);border-radius:999px;padding:7px 11px;font:600 12px inherit;font-family:inherit;cursor:pointer}#ofc .opn header button[aria-selected=true]{background:var(--opsel);color:var(--opselink)}
#ofc .opn .obody{overflow:auto;padding:8px 10px;flex:1}
#ofc .oit{display:grid;grid-template-columns:34px 1fr auto;gap:2px 10px;align-items:center;padding:8px 2px;border-bottom:1px solid var(--opline2)}
#ofc .oit i{font-style:normal;font-size:24px;grid-row:1/3;text-align:center}#ofc .oit b{font-size:13px}#ofc .oit small{font-size:11px;color:var(--opmut);grid-column:2}#ofc .opn .ob{background:var(--opbtn);color:var(--opbtnink);box-shadow:none}#ofc .opn .ob.pri{background:#2563eb;color:#fff}#ofc .opn .ob.ok{background:#16a34a;color:#fff}#ofc .opn .ob.bad{background:#dc2626;color:#fff}
#ofc .oit .ob{grid-row:1/3;grid-column:3;padding:7px 11px;box-shadow:none}#ofc .opn .oit .ob.lt{background:var(--opsoft);color:var(--opink)}
#ofc .osw{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 14px}#ofc .osw button{appearance:none;width:52px;height:52px;border-radius:12px;border:3px solid transparent;cursor:pointer;font:600 9px inherit;font-family:inherit;display:flex;align-items:flex-end;justify-content:center;padding:3px;color:#fff;text-shadow:0 1px 2px #000}
#ofc .osw button[aria-pressed=true]{border-color:#2563eb;box-shadow:0 0 0 2px var(--opbg) inset}
#ofc .osec{font:700 11px inherit;font-family:inherit;letter-spacing:.06em;text-transform:uppercase;color:var(--opmut);margin:8px 0 2px}
#ofc .oload{position:absolute;inset:0;display:grid;place-items:center;font-size:15px;color:var(--oload)}
body.ofc #toast{position:fixed;z-index:45}body.ofc-pc #sheet{z-index:35}
#ofc .opc{display:none}body.ofc-pc #ofc .opc,body.ofc-gov #ofc .opc{display:inline-block}body.ofc-gov #phone{z-index:40}body.ofc-gov #ofc .opr,body.ofc-gov #ofc .ojoy{visibility:hidden}
@media (max-width:600px){#ofc .ob{padding:8px 11px;font-size:12px}#ofc .ohide{display:none}#ofc .otop.pres{flex-wrap:wrap}#ofc .otop.pres .ottl{flex:1 1 100%}#ofc .otop.pres~.ohelp{display:none}}`;

/* ---------- enter / exit ---------- */
function ofEnter(hc,pres){if(OFC.on||(!hc&&!pres))return;OFC.on=true;OFC.mode=pres?"pres":"hq";OFC.city=pres?null:hc;OFC.key=pres?PRES_KEY:hc.id;OFC.fix=pres?presFixtures():ofHqFixtures();OFC.wz=pres?presWallZones():[];ofData(OFC.key);
  OFC.prev={tab,sel,open:sheet.classList.contains("open")};
  if(!document.getElementById("ofc-css")){const st=document.createElement("style");st.id="ofc-css";st.textContent=OFCCSS;document.head.appendChild(st)}
  const el=document.createElement("div");el.id="ofc";el.setAttribute("role","dialog");el.setAttribute("aria-label",pres?"Presidential office":`${hc.name} HQ office`);
  if(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window)el.classList.add("touch");
  el.innerHTML=`<div class="oload">Loading your office…</div><div class="otop${pres?" pres":""}"><div class="ottl"><b>${pres?`${pol().c} · Presidential Office`:`${hc.name} HQ · Office`}</b><small id="ofc-cash"></small></div>
    <button class="ob opc ok" data-of="pcclose">Back to office</button><button class="ob pri" data-of="shop">🛒 Shop</button>${pres?"":`<button class="ob" data-of="ofsnd" aria-label="Office sounds" title="Office sounds on/off">${ofOfSndOn()?"🔊":"🔇"}</button>`}${pres?"":`<button class="ob" data-of="classic"><span class="ohide">Classic </span>HQ view</button>`}<button class="ob bad" data-of="exit" aria-label="Exit office">✕ Exit</button></div>
    <div class="ohelp">W/S forward/back · A/D strafe · ←/→ or drag to turn · E use · Esc exit</div><div class="ojoy"><i></i></div><div class="opr" hidden></div><div class="opn" hidden></div>`;
  document.body.appendChild(el);document.body.classList.add("ofc");OFC.el=el;OFC.keys={};OFC.joy=null;OFC.place=null;OFC.panel=null;OFC.near=null;OFC.nearSig="";
  OFC.p=pres?{x:0,z:2.4,yaw:0,f:0}:{x:0,z:1.2,yaw:0,f:0};ofCash();ofBindUI();
  loadThree().then(T=>{if(!OFC.on||OFC.el!==el)return;ofBuild(T)}).catch(()=>{if(!OFC.on)return;ofExit(true);toast(pres?"Couldn't load the 3D office. Opening the government app instead.":"Couldn't load the 3D office. Showing the classic HQ view.")})}
/* the 3D scene follows html[data-theme]: bright day in light, night sky and dimmer lights in dark */
function ofSceneTheme(){if(!OFC.scene||!OFC.lt)return;const dk=document.documentElement.getAttribute("data-theme")!=="light",k=OFC.lt;OFC.scene.background.setHex(dk?0x111827:0xbcd3ea);k.hl.intensity=dk?.42:.55;k.dl.intensity=dk?.32:.55;k.al.intensity=dk?.14:.18;if(OFC.life)ofLifeTheme()}
new MutationObserver(()=>{if(typeof OFC!=="undefined"&&OFC.on)ofSceneTheme()}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
function ofExit(classic){if(!OFC.on)return;if(OFC.life){try{if(OFC.life.ac)OFC.life.ac.close()}catch(e){}OFC.life=null}OFC.win=null;try{pcClose()}catch(e){}OFC.on=false;cancelAnimationFrame(OFC.raf);OFC.raf=0;
  if(OFC.scene){OFC.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})})}
  if(OFC.ren){OFC.ren.dispose();try{OFC.ren.forceContextLoss()}catch(e){}}
  OFC.ren=OFC.scene=OFC.cam=null;OFC.objs=[];OFC.place=null;if(OFC.el)OFC.el.remove();OFC.el=null;
  document.body.classList.remove("ofc","ofc-pc","ofc-gov");if(typeof DX!=="undefined"&&DX.open)dxClose();save();hud();
  const pv=OFC.prev||{};const hc=OFC.city;if(OFC.mode==="pres")presLeft(classic);
  if(classic&&hc){tab="hq";const c=pv.sel&&hasHQ(pv.sel)&&hqCity(pv.sel.country)===hc?pv.sel:hc;openCity(c);return}
  if(pv.sel){tab=pv.tab||"biz";sel=pv.sel;mode="city";renderSheet();if(pv.open)sheet.classList.add("open");else closeSheet()}else closeSheet();draw()}

/* ---------- scene ---------- */
function ofBuild(T){OFC.T=T;const el=OFC.el,ld=el.querySelector(".oload");
  let ren;try{ren=new T.WebGLRenderer({antialias:(devicePixelRatio||1)<1.5,powerPreference:"low-power"})}catch(e){ofExit(true);toast(OFC.mode==="pres"?"3D isn't available on this device. Opening the government app instead.":"3D isn't available on this device. Showing the classic HQ view.");return}
  ren.setPixelRatio(Math.min(1.5,devicePixelRatio||1));OFC.ren=ren;const cv=ren.domElement;cv.tabIndex=0;cv.setAttribute("aria-label","3D office. W A S D to move.");el.insertBefore(cv,el.firstChild);OFC.cv=cv;if(ld)ld.remove();
  const sc=new T.Scene();sc.background=new T.Color(0xbcd3ea);OFC.scene=sc;OFC.cam=new T.PerspectiveCamera(60,1,.1,80);
  const hl=new T.HemisphereLight(0xffffff,0x6b6258,.55),dl=new T.DirectionalLight(0xfff4e0,.55),al=new T.AmbientLight(0xffffff,.18);dl.position.set(-4,9,-8);sc.add(hl);sc.add(dl);sc.add(al);OFC.lt={hl,dl,al};ofSceneTheme();
  if(OFC.mode==="pres")presRoom(T,sc);else{
  const R=OFC_ROOM,d=ofData(OFC.key),room=new T.Group();sc.add(room);OFC.room=room;
  OFC.floorM=ofBox(T,room,R.w,.1,R.d,OFC_FLOORS[d.floor][1],0,-.1,0,{r:.9}).material;
  const wm=ofMat(T,OFC_WALLS[d.wall][1],{r:.95});OFC.wallM=wm;
  const wall=(w,h,dd,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,dd),wm);m.position.set(x,y+h/2,z);room.add(m);return m};
  // back wall with a window band
  wall(R.w,.9,.2,0,0,-R.d/2-.1);wall(R.w,.5,.2,0,R.h-.5,-R.d/2-.1);
  for(let i=0;i<=6;i++)wall(i%3?.12:.4,R.h-1.4,.2,-R.w/2+.2+i*(R.w-.4)/6,.9,-R.d/2-.1);
  OFC.win=ofBox(T,room,R.w,R.h-1.4,.04,0xcfe8ff,0,.9,-R.d/2-.16,{e:0x9cc9f5,ei:.55,r:.1});
  const sky=new T.Group();for(let i=0;i<14;i++){const h=1.2+((i*53)%9)*.35;ofBox(T,sky,.9,h,.6,[0x7a8ba3,0x8fa3bb,0x6b7c93][i%3],-7.5+i*1.15,.9+Math.max(0,1.6-h*.3)-.6,-R.d/2-1.2,{e:0x4a5d78,ei:.25})}room.add(sky);
  wall(.2,R.h,R.d,-R.w/2-.1,0,0);wall(.2,R.h,R.d,R.w/2+.1,0,0);
  wall(R.w/2-1,R.h,.2,-R.w/4-.5,0,R.d/2+.1);wall(R.w/2-1,R.h,.2,R.w/4+.5,0,R.d/2+.1);wall(2,R.h-2.3,.2,0,2.3,R.d/2+.1);
  ofBox(T,room,1.9,2.25,.1,0x5b412b,0,0,R.d/2+.02);ofBox(T,room,.05,.05,.12,0xd4af37,.75,1.05,R.d/2-.04,{m:.8});
  ofBox(T,room,R.w,.12,.05,0x4b5563,0,0,-R.d/2+.02);ofBox(T,room,.05,.12,R.d,0x4b5563,-R.w/2+.02,0,0);ofBox(T,room,.05,.12,R.d,0x4b5563,R.w/2-.02,0,0);
  // company sign on the left wall
  const sg=document.createElement("canvas");sg.width=512;sg.height=128;const g2=sg.getContext("2d");g2.fillStyle="#0f172a";g2.fillRect(0,0,512,128);g2.fillStyle="#f8fafc";g2.font="bold 54px sans-serif";g2.textAlign="center";g2.fillText((OFC.city.name+" HQ").toUpperCase().slice(0,16),256,84);
  const sign=new T.Mesh(new T.PlaneGeometry(3.2,.8),new T.MeshBasicMaterial({map:new T.CanvasTexture(sg)}));sign.position.set(-R.w/2+.01,2.1,0);sign.rotation.y=Math.PI/2;room.add(sign);
  // ceiling light panels (emissive only, no real lights: cheap on phones)
  for(const x of [-4,0,4])for(const z of [-3,1.5])ofBox(T,room,1.4,.04,.5,0xffffff,x,R.h-.04,z,{e:0xffffff,ei:.9});
  // shop kiosk (fixed fixture)
  const k=new T.Group();ofBox(T,k,.8,.95,.6,0x1e3a8a,0,0,0,{m:.3,r:.4});ofBox(T,k,.7,.5,.06,0x0f172a,0,.95,-.05);
  const kt=ofScreenTex(T,"SHOP",["Press E","to buy items"]);const ks=new T.Mesh(new T.PlaneGeometry(.64,.38),new T.MeshBasicMaterial({map:kt}));ks.position.set(0,1.2,-.01);k.add(ks);
  ofBox(T,k,.9,.12,.7,0xfbbf24,0,1.5,0,{e:0xf59e0b,ei:.5});k.position.set(OFC_KIOSK.x,0,OFC_KIOSK.z);k.rotation.y=-3*Math.PI/4;room.add(k);
  try{ofUpBuild(T,room,wm,d)}catch(e){console.warn("ofUp",e)}}
  ofStaffBuild();if(OFC.mode==="hq")try{ofLifeBuild(T)}catch(e){console.warn("ofLife",e)}
  // avatar
  const av=new T.Group(),suit=0x1e3a8a;const legL=ofBox(T,av,.13,.5,.15,0x111827,-.1,0,0),legR=ofBox(T,av,.13,.5,.15,0x111827,.1,0,0);
  ofBox(T,av,.42,.55,.26,suit,0,.5,0);ofBox(T,av,.1,.3,.02,0xffffff,0,.72,-.13);ofBox(T,av,.04,.24,.02,0xdc2626,0,.74,-.145);ofSph(T,av,.17,0xf1c27d,0,1.22,0);ofBox(T,av,.36,.07,.36,0x3f2a1d,0,1.32,.02);
  const sh=new T.Mesh(new T.CircleGeometry(.34,16),new T.MeshBasicMaterial({color:0,transparent:true,opacity:.22}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;av.add(sh);
  sc.add(av);OFC.av=av;OFC.legs=[legL,legR];OFC.walkT=0;
  ofRebuildItems();ofResize();OFC.last=performance.now();OFC.raf=requestAnimationFrame(ofLoop);cv.focus({preventScroll:true})}
function ofFloor(f){const P=OFC.p;if(OFC.place||OFC.mode!=="hq")return;P.f=f?1:0;P.x=-5.5;P.z=4.6;P.yaw=-Math.PI/2;OFC.near=null;OFC.arm=null;ofPrompt();toast(f?"⬆ Second floor: boss office and six more desks":"⬇ Ground floor")}
function ofUpBuild(T,room,wm,d){const R=OFC_ROOM,FH=OFC_FH,st=OFC_ST,b=OFC_BOSS,hw=R.w/2,hz=R.d/2,U=new T.Group();U.position.y=FH;room.add(U);OFC.up=U;
  const wall=(w,h,dd,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,dd),wm);m.position.set(x,y+h/2,z);U.add(m);return m},fc=OFC_FLOORS[d.floor][1];
  // stairs on the ground floor: 12 solid steps climbing from the front wall towards the back
  const sx=(st.x0+st.x1)/2,sw=st.x1-st.x0-.2;for(let i=0;i<12;i++)ofBox(T,room,sw,(i+1)*FH/12,.19,i%2?0x8b6b4a:0x7a5c3e,sx,0,st.z1-.15-i*.19,{r:.8});
  ofBox(T,room,.06,1,.06,0x334155,st.x1-.05,0,st.z1-.1);ofBox(T,room,.06,.06,st.z1-st.z0,0x334155,st.x1-.05,1,(st.z0+st.z1)/2);
  // upstairs floor with an opening over the stairs (its slab is also the ground floor's ceiling)
  ofBox(T,U,hw*2-(st.x1+hw),.2,R.d,fc,(st.x1+hw)/2,-.2,0,{r:.9});ofBox(T,U,st.x1+hw,.2,st.z0+hz,fc,(-hw+st.x1)/2,-.2,(-hz+st.z0)/2,{r:.9});
  ofBox(T,room,R.w,.02,R.d,0xf1f5f9,0,FH-.22,0,{r:.95}); // ceiling paint under the slab
  // railing on the open side of the stairwell
  for(let z=st.z0+.05;z<=st.z1;z+=.6)ofBox(T,U,.05,1,.05,0x334155,st.x1,0,z);ofBox(T,U,.06,.06,st.z1-st.z0,0x334155,st.x1,1,(st.z0+st.z1)/2);
  // walls: back wall with windows, sides, solid front
  wall(R.w,.9,.2,0,0,-hz-.1);wall(R.w,.5,.2,0,R.h-.5,-hz-.1);for(let i=0;i<=6;i++)wall(i%3?.12:.4,R.h-1.4,.2,-hw+.2+i*(R.w-.4)/6,.9,-hz-.1);
  ofBox(T,U,R.w,R.h-1.4,.04,0xcfe8ff,0,.9,-hz-.16,{e:0x9cc9f5,ei:.55,r:.1});
  wall(.2,R.h,R.d,-hw-.1,0,0);wall(.2,R.h,R.d,hw+.1,0,0);wall(R.w,R.h,.2,0,0,hz+.1);
  for(const x of [-4,0,4])for(const z of [-3,1.5])ofBox(T,U,1.4,.04,.5,0xffffff,x,R.h-.04,z,{e:0xffffff,ei:.9});
  const sg=document.createElement("canvas");sg.width=512;sg.height=128;const g2=sg.getContext("2d");g2.fillStyle="#0f172a";g2.fillRect(0,0,512,128);g2.fillStyle="#f8fafc";g2.font="bold 50px sans-serif";g2.textAlign="center";g2.fillText("2ND FLOOR",256,84);
  const sign=new T.Mesh(new T.PlaneGeometry(2.4,.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(sg)}));sign.position.set(-hw+.01,2.1,-1.5);sign.rotation.y=Math.PI/2;U.add(sign);
  // boss office: glass walls with a door gap, big desk, chair, sofa, bookshelf, rug, plant
  const gl={op:.28,e:0x93c5fd,ei:.15,r:.1,m:.2},GL=0xbfdbfe;
  ofBox(T,U,b.d0-b.x0,R.h,.06,GL,(b.x0+b.d0)/2,0,b.z1,gl);ofBox(T,U,b.x1-b.d1,R.h,.06,GL,(b.d1+b.x1)/2,0,b.z1,gl);ofBox(T,U,.06,R.h,b.z1-b.z0,GL,b.x0,0,(b.z0+b.z1)/2,gl);
  ofBox(T,U,b.d1-b.d0,R.h-2.3,.08,0x334155,(b.d0+b.d1)/2,2.3,b.z1);for(const x of [b.x0,b.d0,b.d1,b.x1])ofBox(T,U,.08,R.h,.08,0x334155,x,0,b.z1);
  const bp=document.createElement("canvas");bp.width=256;bp.height=64;const g3=bp.getContext("2d");g3.fillStyle="#0f172a";g3.fillRect(0,0,256,64);g3.fillStyle="#fbbf24";g3.font="bold 30px sans-serif";g3.textAlign="center";g3.fillText("CEO",128,44);
  const bs=new T.Mesh(new T.PlaneGeometry(1,.25),new T.MeshBasicMaterial({map:new T.CanvasTexture(bp)}));bs.position.set((b.d0+b.d1)/2,2.6,b.z1+.05);U.add(bs);
  ofBox(T,U,5.4,.02,3.6,0x7f1d1d,5,0,-3.8,{r:1});
  ofBox(T,U,2.2,.08,1,0x3f2a1d,5,.74,-4.1,{r:.5});ofBox(T,U,2.1,.7,.08,0x2b1d14,5,0,-3.65);ofBox(T,U,.08,.74,.9,0x2b1d14,3.95,0,-4.1);ofBox(T,U,.08,.74,.9,0x2b1d14,6.05,0,-4.1);
  ofBox(T,U,.6,.36,.04,0x111827,4.6,.82,-4.4);ofBox(T,U,.52,.28,.02,0x60a5fa,4.6,.86,-4.38,{e:0x3b82f6,ei:.6});ofBox(T,U,.5,.06,.12,0xd4af37,5.6,.82,-3.75,{m:.8,r:.3});
  ofBox(T,U,.7,.5,.65,0x111827,5,0,-5.1);ofBox(T,U,.7,.8,.12,0x111827,5,.5,-5.4);
  ofBox(T,U,1.2,.42,.9,0x1e293b,7.25,0,-2.6);ofBox(T,U,1.2,.4,.2,0x1e293b,7.25,.42,-2.1);ofBox(T,U,.2,.6,.9,0x1e293b,7.75,0,-2.6);
  ofBox(T,U,1.9,2.4,.4,0x5b412b,3.2,0,-5.75);for(let y=.5;y<2.3;y+=.45)for(let i=0;i<6;i++)ofBox(T,U,.18,.32,.28,[0xb91c1c,0x1d4ed8,0x15803d,0xca8a04][(i+Math.round(y*10))%4],2.55+i*.26,y,-5.7);
  ofCyl(T,U,.22,.18,.45,0x78350f,7.5,0,-5.5);ofSph(T,U,.4,0x15803d,7.5,.85,-5.5)}
function ofBuildItem(o){const T=OFC.T,def=ofD()[o.type],g=def.build(T);g.position.set(o.x,o.y||0,o.z);g.rotation.y=(o.rot||0)*Math.PI/2;g.userData.item=o;return g}
function ofRebuildItems(){const T=OFC.T;if(!T||!OFC.scene)return;for(const g of OFC.objs){OFC.scene.remove(g);g.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(x.material.map)x.material.map.dispose();x.material.dispose()}})}
  OFC.objs=[];const d=ofData(OFC.key);for(const o of d.items){o.y=ofSurfY(o,d.items);const g=ofBuildItem(o);OFC.scene.add(g);OFC.objs.push(g)}ofObstacles()}
const ofFoot=o=>{const s=ofD()[o.type]?ofD()[o.type].size:o.size,odd=(o.rot||0)%2;const w=odd?s[1]:s[0],dd=odd?s[0]:s[1];return{x0:o.x-w/2,x1:o.x+w/2,z0:o.z-dd/2,z1:o.z+dd/2}};
const ofOver=(a,b,m)=>a.x0<b.x1-(m||0)&&a.x1>b.x0+(m||0)&&a.z0<b.z1-(m||0)&&a.z1>b.z0+(m||0);
/* surface under a small item (e.g. computer on a desk) */
function ofSurf(o,items){if(!ofD()[o.type].small)return null;for(const s of items){if(s===o||!ofD()[s.type].top)continue;const f=ofFoot(s);if(o.x>f.x0&&o.x<f.x1&&o.z>f.z0&&o.z<f.z1)return s}return null}
function ofSurfY(o,items){const s=ofSurf(o,items);return s?ofD()[s.type].top:0}
function ofStaffSig(){if(!ofIsStaffOffice())return"";try{return OFD.map((d,i)=>{const q=ofStaffPos(i);return(!ofLive(d)?"L":ofHas(d[0])?ofS().d[d[0]].nm:"-")+q.x+","+q.z+","+q.r+","+q.f}).join("|")}catch(e){return""}}
function ofStaffDesk(T,i,h,ghost){const d=OFD[i],g=new T.Group();
  ofBox(T,g,1.3,.06,.7,0x8b6b4a,0,.72,.15,{r:.7});ofBox(T,g,.06,.72,.6,0x5b412b,-.6,0,.15);ofBox(T,g,.06,.72,.6,0x5b412b,.6,0,.15);
  ofBox(T,g,.4,.28,.04,0x111827,0,.78,.1);ofBox(T,g,.3,.2,.02,h?0x60a5fa:0x334155,0,.82,.12,{e:h?0x3b82f6:0,ei:h?.6:0});
  g.userData={i,k:d[0]};if(h){const p=new T.Group();p.position.set(0,0,-.55);g.add(p);g.userData.p=p;ofBox(T,p,.13,.5,.15,0x111827,-.1,0,0);ofBox(T,p,.13,.5,.15,0x111827,.1,0,0);ofBox(T,p,.42,.55,.26,ofStaffCol[i],0,.5,0);ofBox(T,p,.1,.3,.02,0xffffff,0,.72,.13);ofSph(T,p,.17,0xf1c27d,0,1.22,0);ofBox(T,p,.36,.07,.36,0x3f2a1d,0,1.32,-.02)}
  if(!ghost){const cv=document.createElement("canvas");cv.width=256;cv.height=64;const c=cv.getContext("2d");c.fillStyle="rgba(15,23,42,.85)";c.fillRect(0,0,256,64);c.fillStyle="#f8fafc";c.textAlign="center";c.font="bold 22px sans-serif";c.fillText((h?h.nm:"Vacant").slice(0,18),128,28);c.font="16px sans-serif";c.fillStyle="#93c5fd";c.fillText(d[1]+" Head of "+d[2],128,52);
    const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false}));sp.scale.set(1.5,.375,1);sp.position.set(0,h?2:1.4,-.2);sp.renderOrder=5;g.add(sp)}
  return g}
function ofStaffBuild(){const T=OFC.T;if(!T||!OFC.scene||OFC.mode!=="hq")return;if(OFC.staff){OFC.scene.remove(OFC.staff);OFC.staff.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(x.material.map)x.material.map.dispose();x.material.dispose()}})}
  OFC.staff=null;OFC.ssig=ofStaffSig();if(!OFC.ssig)return;const G=new T.Group();OFC.scene.add(G);OFC.staff=G;OFC.fix=ofHqFixtures();ofObstacles();
  OFD.forEach((d,i)=>{if(!ofLive(d)){G.add(new T.Group());return}const q=ofStaffPos(i),g=ofStaffDesk(T,i,ofHas(d[0])?ofS().d[d[0]]:null,false);g.position.set(q.x,q.f*OFC_FH,q.z);g.userData.f=q.f;g.rotation.y=q.r*Math.PI/2;G.add(g)})}
/* heads turn to face you when you come near, breathe, and show their daily report in a speech bubble */
function ofStaffAnim(dt){const T=OFC.T,P=OFC.p,t=performance.now()/1000;let near=null,nd=3.6;
  for(const g of OFC.staff.children){const u=g.userData,p=u.p;if(!p||!g.visible||u.away||(u.f|0)!==(P.f|0))continue;const wx=g.position.x+Math.sin(g.rotation.y)*-.55,wz=g.position.z+Math.cos(g.rotation.y)*-.55,dx=P.x-wx,dz=P.z-wz,dd=Math.hypot(dx,dz);
    const want=dd<4?Math.atan2(dx,dz)-g.rotation.y:0;let df=((want-p.rotation.y+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;p.rotation.y+=df*Math.min(1,dt*4);
    p.position.y=Math.sin(t*2+u.i)*.012;if(dd<nd){nd=dd;near=g}}
  for(const g of OFC.staff.children){const u=g.userData;if(g!==near){if(u.bub)u.bub.visible=false;continue}
    if(!u.bub||Date.now()-u.bt>5000){const h=ofS().d[u.k];if(!h)continue;let tx="";try{tx=ofLine(u.k,h)}catch(e){}
      const cv=document.createElement("canvas");cv.width=512;cv.height=128;const c=cv.getContext("2d");c.fillStyle="rgba(255,255,255,.95)";c.fillRect(0,0,512,112);c.beginPath();c.moveTo(240,112);c.lineTo(256,128);c.lineTo(272,112);c.fill();
      c.fillStyle="#0f172a";c.font="20px sans-serif";c.textAlign="center";const w=tx.split(" "),ln=[""];for(const x of w){if(c.measureText(ln[ln.length-1]+" "+x).width>480&&ln.length<4)ln.push(x);else ln[ln.length-1]+=(ln[ln.length-1]?" ":"")+x}
      ln.slice(0,4).forEach((l,j)=>c.fillText(l,256,28+j*24));
      if(u.bub){u.bub.material.map.dispose();u.bub.material.map=new T.CanvasTexture(cv);u.bub.material.needsUpdate=true}else{u.bub=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false}));u.bub.scale.set(3.2,.8,1);u.bub.position.set(0,2.8,-.55);u.bub.renderOrder=6;g.add(u.bub)}u.bt=Date.now()}
    if(u.bub)u.bub.visible=true}}
/* moving a department desk: same ghost + confirm flow as furniture, position kept in S.off.pos */
function ofStaffMove(o){const T=OFC.T,P=OFC.p,i=OFD.findIndex(x=>x[0]===o.k);if(!T||i<0)return;const g=ofStaffDesk(T,i,ofHas(o.k)?ofS().d[o.k]:null,true);
  g.traverse(x=>{if(x.material){x.material=x.material.clone();x.material.transparent=true;x.material.opacity=.6;x.material.depthWrite=false}});
  const pad=new T.Mesh(new T.PlaneGeometry(1.7,1.6),new T.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.35,depthWrite:false}));pad.rotation.x=-Math.PI/2;pad.position.y=.02;g.add(pad);OFC.scene.add(g);
  if(OFC.staff&&OFC.staff.children[i])OFC.staff.children[i].visible=false;OFC.place={type:"_staff",k:o.k,i,g,pad,rot:ofStaffPos(i).r,ok:false,x:0,z:0,y:0};OFC.near=null;ofPrompt();ofGhostStep()}
function ofStaffGhost(){const pl=OFC.place,P=OFC.p,R=OFC_ROOM,sn=v=>Math.round(v*4)/4,dist=1.9;pl.x=sn(P.x-Math.sin(P.yaw)*dist);pl.z=sn(P.z-Math.cos(P.yaw)*dist);
  const f=ofStaffFoot(pl.x,pl.z,pl.rot),d=ofData(OFC.key),F=P.f|0;pl.f=F;let ok=f.x0>=-R.w/2-.001&&f.x1<=R.w/2+.001&&f.z0>=-R.d/2-.001&&f.z1<=R.d/2+.001;
  if(ok&&F&&ofUpObst().some(q=>ofOver(f,q)))ok=false;
  if(ok&&!F)for(const s of d.items){const sd=ofD()[s.type];if(sd.walk||sd.wall||(sd.small&&ofSurf(s,d.items)))continue;if(ofOver(f,ofFoot(s),.01)){ok=false;break}}
  if(ok&&OFC.fix.some(q=>(q.f|0)===F&&(q.type==="_staff"?q.obj.k!==pl.k&&ofOver(f,q):ofOver(f,q))))ok=false;
  if(ok&&ofBlockedBy(f,P))ok=false;
  pl.ok=ok;pl.g.position.set(pl.x,F*OFC_FH+.005,pl.z);pl.g.rotation.y=pl.rot*Math.PI/2;pl.pad.material.color.setHex(ok?0x22c55e:0xef4444);
  const b=OFC.el.querySelector('[data-of="confirm"]');if(b&&b.disabled===ok)b.disabled=!ok}
const ofBlockedBy=(f,P)=>{const cx=Math.max(f.x0,Math.min(P.x,f.x1)),cz=Math.max(f.z0,Math.min(P.z,f.z1));return Math.hypot(P.x-cx,P.z-cz)<.32};
function ofStaffConfirm(){const pl=OFC.place;if(!pl.ok){toast("Can't put the desk there. Find a clear spot.");return}const o=ofS();o.pos=o.pos&&typeof o.pos==="object"?o.pos:{};o.pos[pl.k]={x:pl.x,z:pl.z,r:pl.rot,f:pl.f|0};ofEndGhost();OFC.ssig="";ofStaffBuild();save();toast("Desk moved")}
function ofObstacles(){const d=ofData(OFC.key),R=OFC_ROOM;OFC.obst=[];for(const o of d.items){const def=ofD()[o.type];if(def.walk||def.wall||(def.small&&ofSurf(o,d.items)))continue;OFC.obst.push(ofFoot(o))}
  OFC.obst2=OFC.mode==="hq"?ofUpObst():[];for(const f of OFC.fix)(f.f?OFC.obst2:OFC.obst).push({x0:f.x0,x1:f.x1,z0:f.z0,z1:f.z1});if(OFC.life&&OFC.life.obst)OFC.obst.push(...OFC.life.obst)}
function ofBlocked(x,z){const R=OFC_ROOM,r=.3;if(x<-R.w/2+r||x>R.w/2-r||z<-R.d/2+r||z>R.d/2-r)return true;
  for(const b of (OFC.p.f?OFC.obst2||[]:OFC.obst)){const cx=Math.max(b.x0,Math.min(x,b.x1)),cz=Math.max(b.z0,Math.min(z,b.z1));if((x-cx)**2+(z-cz)**2<r*r)return true}return false}

/* ---------- living HQ (hq mode only): walking staff, visitors, day/night, wall TV, office sounds, plants + dog, celebrations, manager moods ---------- */
const OFL={cof:{x:7.45,z:-1.2},wat:{x:7.45,z:1.3},rec:{x:0,z:3.6},door:{x:0,z:5.7},tv:{x:7.97,z:-3.6},
  chat:["Coffee's strong today","Did you see the stock price?","Busy week, huh","The boss looks happy","Big shipment came in","Lunch at noon?","New client called","Who took my stapler?","Nice tie","Numbers look good"],
  vis:[["📦","Courier","Package for the boss! Tip from the sender"],["🤝","Client","I'd like to sign a small deal"],["🎤","Reporter","Quick interview for the business page?"],["💼","Investor","I'm putting a little money in"]]};
const ofRk=()=>Math.max(0,Math.min(9,+S.rank||0));
const ofTod=()=>(Date.now()%DAYMS)/DAYMS*24;
function ofPerson(T,col,hair){const p=new T.Group(),L=ofBox(T,p,.13,.5,.15,0x111827,-.1,0,0),R=ofBox(T,p,.13,.5,.15,0x111827,.1,0,0);ofBox(T,p,.42,.55,.26,col,0,.5,0);ofSph(T,p,.17,0xf1c27d,0,1.22,0);ofBox(T,p,.36,.07,.36,hair==null?0x3f2a1d:hair,0,1.32,0);p.userData.legs=[L,R];return p}
function ofBub(T,txt,w){const cv=document.createElement("canvas");cv.width=512;cv.height=96;const c=cv.getContext("2d");c.fillStyle="rgba(255,255,255,.95)";c.fillRect(0,0,512,84);c.beginPath();c.moveTo(240,84);c.lineTo(256,96);c.lineTo(272,84);c.fill();
  c.fillStyle="#0f172a";c.font="26px sans-serif";c.textAlign="center";c.fillText(String(txt).slice(0,40),256,52);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false}));s.scale.set(w||2.4,.45,1);s.renderOrder=7;return s}
function ofBubSet(o,txt,y){const T=OFC.T;if(o.userData.bub){o.remove(o.userData.bub);o.userData.bub.material.map.dispose();o.userData.bub.material.dispose();o.userData.bub=null}if(!txt)return;const b=ofBub(T,txt);b.position.y=y||2;o.add(b);o.userData.bub=b}
function ofTvDraw(){const L=OFC.life;if(!L||!L.tvc)return;const c=L.tvc.getContext("2d"),W=512,H=288;c.fillStyle="#0b1220";c.fillRect(0,0,W,H);c.fillStyle="#dc2626";c.fillRect(0,0,W,40);c.fillStyle="#fff";c.font="bold 24px sans-serif";c.textAlign="left";c.fillText("MERIDIAN NEWS · LIVE",14,28);
  let y=74;c.font="bold 22px sans-serif";c.fillStyle="#fbbf24";
  try{const tk=ipoTk();if(tk){const o=S.ipo;c.fillText(`${tk} ${fmt(+o.ipx||0)} / share`,14,y)}else c.fillText(`Net worth ${fmt(totals().nw)}`,14,y)}catch(e){}
  y+=30;c.fillStyle="#86efac";try{c.fillText(`Income ${fmt(totals().inc)}/day · Cash ${fmt(S.cash)}`,14,y)}catch(e){}
  y+=34;c.font="19px sans-serif";c.fillStyle="#fca5a5";const wl=(S.wars||[]).filter(w=>w&&w.l>0).slice(0,2);c.fillText(wl.length?"⚔ "+wl.map(w=>`${w.a}–${w.b}`).join(" · "):"🕊 No wars right now",14,y);
  y+=30;c.fillStyle="#e2e8f0";const nw=[...(S.news||[]).map(n=>n&&n.t),...(S.log||[])].filter(Boolean);const items=nw.slice(0,8);
  const i=items.length?Math.floor(Date.now()/6000)%items.length:0;const ln=items.length?String(items[i]).replace(/<[^>]*>/g,""):"Quiet day in the markets";
  const words=ln.split(" "),out=[""];for(const w of words){if(c.measureText(out[out.length-1]+" "+w).width>484&&out.length<3)out.push(w);else out[out.length-1]+=(out[out.length-1]?" ":"")+w}
  out.slice(0,3).forEach((l,j)=>c.fillText(l,14,y+j*26));
  c.fillStyle="#1e293b";c.fillRect(0,H-30,W,30);c.fillStyle="#94a3b8";c.font="16px sans-serif";const h=ofTod();c.fillText(`${String(Math.floor(h)).padStart(2,"0")}:${String(Math.floor(h%1*60)).padStart(2,"0")} · ${RANKS[ofRk()]?RANKS[ofRk()][1]:""}`,14,H-10);
  L.tvt.needsUpdate=true}
function ofLifeBuild(T){if(OFC.mode!=="hq"||!OFC.scene)return;const sc=OFC.scene,G=new T.Group();sc.add(G);const L=OFC.life={g:G,walk:[],vis:null,visT:25+Math.random()*20,dog:null,party:0,cake:null,conf:[],moodT:0,tvT:0,cash:S.cash,inc0:null,mood:{},sndT:0,ambT:3,cl:null};
  // coffee machine + water cooler on the right wall
  const cm=new T.Group();ofBox(T,cm,.7,.9,.5,0x374151,0,0,0);ofBox(T,cm,.45,.55,.4,0x111827,0,.9,0,{m:.5});ofBox(T,cm,.12,.1,.12,0xffffff,0,.95,-.18);ofBox(T,cm,.3,.12,.02,0x22c55e,0,1.25,-.21,{e:0x22c55e,ei:.8});cm.position.set(OFL.cof.x,0,OFL.cof.z);cm.rotation.y=-Math.PI/2;G.add(cm);
  const wc=new T.Group();ofBox(T,wc,.4,.95,.4,0xe5e7eb,0,0,0);ofCyl(T,wc,.17,.17,.45,0x7dd3fc,0,.95,0,{e:0x38bdf8,ei:.3});wc.position.set(OFL.wat.x,0,OFL.wat.z);G.add(wc);
  L.obst=[{x0:7.1,x1:8,z0:-1.55,z1:-.85},{x0:7.2,x1:8,z0:1.05,z1:1.55}];
  // wall TV
  const tc=document.createElement("canvas");tc.width=512;tc.height=288;L.tvc=tc;L.tvt=new T.CanvasTexture(tc);ofBox(T,G,.06,1.45,2.55,0x0f172a,OFL.tv.x,1.35,OFL.tv.z);
  const tv=new T.Mesh(new T.PlaneGeometry(2.4,1.35),new T.MeshBasicMaterial({map:L.tvt}));tv.position.set(OFL.tv.x-.04,2.075,OFL.tv.z);tv.rotation.y=-Math.PI/2;G.add(tv);ofTvDraw();
  // plants and decor grow with your rank
  const lv=ofRk(),spots=[[-7.5,5.5],[7.5,-5.5],[-7.5,-2.8],[-3,5.5],[3,5.5],[-7.5,4.3],[2.6,-5.6],[-2.6,-5.6]];
  for(let i=0;i<Math.min(spots.length,2+lv);i++){const p=new T.Group(),s=.7+lv*.07;ofCyl(T,p,.2,.16,.35,0x9a3412,0,0,0);ofSph(T,p,.3*s,0x16a34a,0,.55*s+.2,0);ofSph(T,p,.22*s,0x22c55e,.12,.8*s+.2,.08);p.position.set(spots[i][0],0,spots[i][1]);G.add(p)}
  if(lv>=2)for(let i=0;i<Math.min(3,lv-1);i++){ofBox(T,G,.05,.8,1.1,0xd4af37,-7.96,1.5,[-4.6,3.2,-2.4][i],{m:.6});ofBox(T,G,.02,.66,.96,[0x60a5fa,0xf472b6,0x34d399][i],-7.93,1.57,[-4.6,3.2,-2.4][i])}
  if(lv>=4){const tr=new T.Group();ofBox(T,tr,.8,1.6,.4,0x5b412b,0,0,0);ofSph(T,tr,.12,0xfbbf24,-.2,1.25,0,{m:.9,e:0xb45309,ei:.3});ofSph(T,tr,.12,0xe5e7eb,.2,1.25,0,{m:.9});ofCyl(T,tr,.09,.12,.3,0xfbbf24,0,.75,0,{m:.9});tr.position.set(-4.8,0,5.7);G.add(tr);L.obst.push({x0:-5.25,x1:-4.35,z0:5.45,z1:6})}
  if(lv>=6){const st=new T.Group();ofCyl(T,st,.45,.5,.6,0xe5e7eb,0,0,0);ofSph(T,st,.32,0xfbbf24,0,1.0,0,{m:.9,e:0xb45309,ei:.25});ofCyl(T,st,.08,.12,.4,0xfbbf24,0,.6,0,{m:.9});st.position.set(4.8,0,5.4);G.add(st);L.obst.push({x0:4.3,x1:5.3,z0:4.9,z1:5.9})}
  // the office dog
  const dg=new T.Group(),fur=0xb45309;ofBox(T,dg,.55,.25,.24,fur,0,.22,0);ofBox(T,dg,.22,.2,.2,fur,.33,.38,0);ofBox(T,dg,.1,.06,.12,0x111827,.46,.42,0);ofBox(T,dg,.05,.1,.05,0x7c2d12,.3,.58,.07);ofBox(T,dg,.05,.1,.05,0x7c2d12,.3,.58,-.07);
  for(const [x,z] of [[-.2,-.08],[-.2,.08],[.2,-.08],[.2,.08]])ofBox(T,dg,.07,.22,.07,fur,x,0,z);const tail=ofBox(T,dg,.18,.05,.05,fur,-.34,.4,0);dg.position.set(-2,0,2);G.add(dg);L.dog={g:dg,tail,t:{x:-2,z:2},w:0};
  // night cleaner (only after 20:00)
  const cl=ofPerson(T,0x64748b,0x6b7280);ofCyl(T,cl,.02,.02,1,0x9ca3af,.3,0,.1);ofBox(T,cl,.3,.03,.12,0x4b5563,.3,0,.1);cl.position.set(-6,0,4);cl.visible=false;G.add(cl);L.cl={g:cl,tgt:null,wait:0,sp:.7};
  // keep the ceiling panels + window to light them by time of day
  L.panels=[];if(OFC.room)OFC.room.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissiveIntensity>=.85&&Math.abs(o.position.y-(OFC_ROOM.h-.04+.02))<.1)L.panels.push(o.material)});
  ofObstacles();ofDayNight(true)}
function ofDayNight(force){const L=OFC.life;if(!L)return;const h=ofTod(),day=h>=7&&h<18?1:h>=5&&h<7?(h-5)/2:h>=18&&h<20?1-(h-18)/2:0;if(!force&&Math.abs(day-(L.day==null?-1:L.day))<.01)return;L.day=day;ofSceneTheme()}
function ofLifeTheme(){const L=OFC.life;if(!L||L.day==null)return;const d=L.day,k=OFC.lt;k.dl.intensity*=.35+.65*d;k.hl.intensity*=.55+.45*d;
  const sky=new OFC.T.Color(0x0b1026).lerp(new OFC.T.Color(OFC.scene.background.getHex()),d);OFC.scene.background.copy(sky);if(OFC.win)OFC.win.material.emissiveIntensity=.08+.47*d;
  for(const m of L.panels)m.emissiveIntensity=d>.8?.45:.95}
function ofWalkTo(w,tg,dt){const g=w.g,dx=tg.x-g.position.x,dz=tg.z-g.position.z,d=Math.hypot(dx,dz);const lg=g.userData.legs;
  if(d<.08){if(lg){lg[0].rotation.x=lg[1].rotation.x=0}return true}const s=Math.min(d,w.sp*dt);g.position.x+=dx/d*s;g.position.z+=dz/d*s;g.rotation.y=Math.atan2(dx,dz);w.wt=(w.wt||0)+dt*8;if(lg){lg[0].rotation.x=Math.sin(w.wt)*.5;lg[1].rotation.x=-Math.sin(w.wt)*.5}return false}
function ofLifeIncome(v){const L=OFC.life;if(!L||!(v>0))return;L.ring=v;ofOfSnd(v>Math.max(5e4,(totals().inc||0)*.05)?"ring":"print")}
function ofOfSndOn(){return!(S.set&&S.set.ofsnd===0)}
function ofOfAc(){if(!ofOfSndOn())return null;const L=OFC.life;if(!L)return null;if(!L.ac){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;L.ac=new AC();L.ag=L.ac.createGain();L.ag.gain.value=.25*(S.set&&S.set.vol!=null?Math.max(.2,+S.set.vol||.5):.5);L.ag.connect(L.ac.destination)}catch(e){return null}}
  if(L.ac.state!=="running"){try{L.ac.resume()}catch(e){}}return L.ac.state==="running"?L.ac:null}
function ofOfTone(f,t,d,g,type){const L=OFC.life,ac=L.ac,o=ac.createOscillator(),v=ac.createGain();o.type=type||"sine";o.frequency.value=f;v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.01);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(L.ag);o.start(t);o.stop(t+d+.05)}
function ofOfSnd(k){const ac=ofOfAc();if(!ac)return;const t=ac.currentTime;
  if(k==="ring"){for(let r=0;r<2;r++)for(let i=0;i<8;i++){ofOfTone(440,t+r*.6+i*.05,.045,.12,"square");ofOfTone(480,t+r*.6+i*.05,.045,.08,"square")}}
  else if(k==="print"){for(let i=0;i<10;i++)ofOfTone(110+(i%2)*30,t+i*.07,.06,.08,"sawtooth")}
  else if(k==="type"){const n=3+Math.random()*6|0;for(let i=0;i<n;i++)ofOfTone(1800+Math.random()*900,t+i*(.08+Math.random()*.08),.02,.025,"triangle")}
  else if(k==="woof"){ofOfTone(320,t,.12,.15,"sawtooth");ofOfTone(260,t+.16,.14,.15,"sawtooth")}
  else if(k==="party"){[0,4,7,12,16].forEach((s,i)=>ofOfTone(523*Math.pow(2,s/12),t+i*.09,.3,.12,"triangle"))}
  else if(k==="bell")ofOfTone(1320,t,.5,.1,"sine")}
function ofSndBtn(){const b=OFC.el&&OFC.el.querySelector('[data-of="ofsnd"]');if(b)b.textContent=ofOfSndOn()?"🔊":"🔇"}
/* a party in the office: falling confetti, a cake on a table, staff cheer */
function ofParty(why){const L=OFC.life,T=OFC.T;if(!L||!T)return;L.party=25;if(!L.cake){const c=new T.Group();ofBox(T,c,1,.72,.7,0xffffff,0,0,0,{r:.6});ofCyl(T,c,.3,.3,.22,0xf9a8d4,0,.72,0);ofCyl(T,c,.22,.22,.16,0xfef3c7,0,.94,0);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ofCyl(T,c,.012,.012,.12,0x60a5fa,Math.cos(a)*.15,1.1,Math.sin(a)*.15);ofSph(T,c,.025,0xfbbf24,Math.cos(a)*.15,1.25,Math.sin(a)*.15,{e:0xf59e0b,ei:1})}
    c.position.set(L.dog?0:0,0,OFL.rec.z-1.2);L.g.add(c);L.cake=c}
  const cols=[0xf59e0b,0xef4444,0x22c55e,0x3b82f6,0xa855f7,0xec4899];for(let i=0;i<70&&L.conf.length<140;i++){const m=new T.Mesh(new T.PlaneGeometry(.07,.04),new T.MeshBasicMaterial({color:cols[i%6],side:2}));m.position.set(OFC.p.x+(Math.random()-.5)*6,2.6+Math.random()*1.5,OFC.p.z+(Math.random()-.5)*5);m.userData.v=.6+Math.random()*.8;m.userData.s=Math.random()*6;L.g.add(m);L.conf.push(m)}
  if(OFC.staff)for(const g of OFC.staff.children)if(g.userData.p)ofBubSet(g.userData.p,"🎉 "+(why||"Congrats boss!"),2.1);ofOfSnd("party")}
function ofMood(){let inc=0,cr=false;try{inc=totals().inc;const hc=new Set(Object.keys(S.hq||{}).map(i=>CITIES[i]&&CITIES[i].country).filter(Boolean));cr=S.cash<0||(S.wars||[]).some(w=>w&&w.l>=4&&(hc.has(w.a)||hc.has(w.b)))}catch(e){}const L=OFC.life;if(L.inc0==null)L.inc0=inc;
  const tr=inc-L.inc0;L.inc0=L.inc0*.7+inc*.3;return cr||inc<0?"😰":tr>Math.abs(inc)*.01?"😄":tr<-Math.abs(inc)*.01?"😟":"🙂"}
function ofMoodSprites(m){const L=OFC.life;if(!OFC.staff||L.mk===m+OFC.ssig)return;L.mk=m+OFC.ssig;for(const g of OFC.staff.children){const u=g.userData;if(!u.p)continue;if(u.mood){u.p.remove(u.mood);u.mood.material.map.dispose();u.mood.material.dispose()}
    const cv=document.createElement("canvas");cv.width=64;cv.height=64;const c=cv.getContext("2d");c.font="48px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(m,32,36);
    const s=new OFC.T.Sprite(new OFC.T.SpriteMaterial({map:new OFC.T.CanvasTexture(cv),depthTest:false}));s.scale.set(.38,.38,1);s.position.set(0,1.62,0);s.renderOrder=6;u.p.add(s);u.mood=s}L.moodE=m}
function ofLifeStep(dt){const L=OFC.life;if(!L)return;const P=OFC.p,t=performance.now()/1000;
  if((L.tvT-=dt)<=0){L.tvT=2;ofTvDraw();ofDayNight()}
  if((L.moodT-=dt)<=0){L.moodT=8;ofMoodSprites(ofMood())}
  if(OFC.staff&&L.moodE==="😰")for(const g of OFC.staff.children)if(g.userData.p)g.userData.p.position.y=Math.abs(Math.sin(t*9+g.userData.i))*.03;
  // money in: phone or printer
  if((L.sndT-=dt)<=0){L.sndT=1.5;const d=S.cash-L.cash;L.cash=S.cash;if(d>Math.max(500,(totals().inc||0)*.002))ofLifeIncome(d)}
  if((L.ambT-=dt)<=0){L.ambT=2+Math.random()*4;ofOfSnd("type")}
  const night=L.day!=null&&L.day<.2;
  // breaks: your own managers leave their desk for coffee or water, chat with whoever is there, then go back
  if(OFC.staff){const hs=OFC.staff.children.filter(g=>g.userData.p),away=hs.filter(g=>g.userData.away);
    if(!night&&away.length<2&&(L.brkT=(L.brkT==null?6:L.brkT)-dt)<=0){L.brkT=8+Math.random()*12;const fr=hs.filter(g=>!g.userData.away);
      if(fr.length){const g=fr[Math.random()*fr.length|0],u=g.userData,p=u.p,sp=Math.random()<.5?OFL.cof:OFL.wat,n=away.filter(o=>o.userData.away.spot===sp).length;
        const v=new OFC.T.Vector3(sp.x-.8,0,sp.z+(n?.75:-.1));g.updateMatrixWorld();g.worldToLocal(v);p.userData.legs=[p.children[0],p.children[1]];
        u.away={g:p,st:"go",path:[{x:.95,z:-.55},{x:.95,z:1.1},{x:v.x,z:v.z}],spot:sp,sp:1.2,wait:0};if(u.bub)u.bub.visible=false}}
    for(const g of away){const A=g.userData.away,p=A.g;
      if(A.st==="go"||A.st==="back"){if(ofWalkTo(A,A.path[0],dt)){A.path.shift();if(!A.path.length){if(A.st==="back"){p.rotation.y=0;p.position.set(0,0,-.55);g.userData.away=null;continue}
          A.st="stay";A.wait=6+Math.random()*5;const mate=away.find(o=>o!==g&&o.userData.away.st==="stay"&&o.userData.away.spot===A.spot),V=OFC.T.Vector3;
          const tw=mate?mate.userData.away.g.getWorldPosition(new V()):new V(A.spot.x,0,A.spot.z),me=p.getWorldPosition(new V());p.rotation.y=Math.atan2(tw.x-me.x,tw.z-me.z)-g.rotation.y;
          ofBubSet(p,(A.spot===OFL.cof?"☕ ":"💧 ")+(mate?OFL.chat[Math.random()*OFL.chat.length|0]:A.spot===OFL.cof?"Coffee time":"Ahh, cold water"),2.1);if(mate)mate.userData.away.wait+=3}}}
      else if(A.st==="stay"&&(A.wait-=dt)<=0){A.st="back";A.path=[{x:.95,z:1.1},{x:.95,z:-.55},{x:0,z:-.55}];ofBubSet(p,null)}}}
  // night cleaner
  const cl=L.cl;cl.g.visible=night;if(night){if(!cl.tgt||ofWalkTo(cl,cl.tgt,dt)){if((cl.wait-=dt)<=0){cl.tgt={x:-7+Math.random()*14,z:-3.5+Math.random()*8};cl.wait=2+Math.random()*3}}if(!cl.g.userData.bub&&Math.hypot(P.x-cl.g.position.x,P.z-cl.g.position.z)<2)ofBubSet(cl.g,"🧹 Working late, boss?",1.9)}
  // the dog wanders and follows you, barks now and then
  const D=L.dog,pd=Math.hypot(P.x-D.g.position.x,P.z-D.g.position.z);D.tail.rotation.y=Math.sin(t*(pd<3?14:5))*.6;
  if(pd<4&&pd>1.1)D.t={x:P.x,z:P.z};else if((D.w-=dt)<=0){D.w=4+Math.random()*6;D.t={x:-6+Math.random()*12,z:-3+Math.random()*8}}
  {const dx=D.t.x-D.g.position.x,dz=D.t.z-D.g.position.z,d=Math.hypot(dx,dz);if(d>(pd<4?1.1:.1)){const s=Math.min(d,(pd<4?2.4:1)*dt);D.g.position.x+=dx/d*s;D.g.position.z+=dz/d*s;D.g.rotation.y=Math.atan2(-dz,dx);D.g.position.y=Math.abs(Math.sin(t*12))*.03}else D.g.position.y=0}
  if(pd<1.6&&!D.barked){D.barked=1;ofOfSnd("woof")}else if(pd>3)D.barked=0;
  // lobby visitors (daytime)
  if(!L.vis){if(!night&&(L.visT-=dt)<=0){const k=OFL.vis[Math.random()*OFL.vis.length|0],T=OFC.T,p=ofPerson(T,[0xa16207,0x1d4ed8,0x9f1239,0x065f46][OFL.vis.indexOf(k)],0x111827);p.position.set(OFL.door.x,0,OFL.door.z);L.g.add(p);
    L.vis={g:p,k,st:"in",life:45,sp:1.2};ofOfSnd("bell")}}
  else{const V=L.vis,g=V.g;V.life-=dt;
    if(V.st==="in"){if(ofWalkTo(V,OFL.rec,dt)){V.st="wait";g.rotation.y=Math.PI;ofBubSet(g,`${V.k[0]} ${V.k[1]}: walk up to me`,2)}}
    else if(V.st==="wait"){const dd=Math.hypot(P.x-g.position.x,P.z-g.position.z);g.rotation.y=Math.atan2(P.x-g.position.x,P.z-g.position.z);
      if(dd<1.5){let v=0;const inc=Math.max(0,(totals().inc)||0);v=Math.round(Math.min(5e6,Math.max(2e3,inc*(V.k[1]==="Reporter"?0:V.k[1]==="Courier"?.01:.03))));
        if(V.k[1]==="Reporter"){ofBubSet(g,"🎤 Great story, thanks!",2);toast("📰 The reporter will feature your company");try{(S.news=S.news||[]).unshift({t:`${(OFC.city&&OFC.city.name)||"Local"} paper interviews the boss of ${ipoName()}`,at:Date.now()})}catch(e){}}
        else{S.cash+=v;S.earned=(S.earned||0)+v;L.cash=S.cash;ofBubSet(g,`${V.k[0]} Deal done: +${fmt(v)}`,2);toast(`${V.k[0]} ${V.k[1]}: ${V.k[2]} · +${fmt(v)}`);ofOfSnd("print");try{hud()}catch(e){}}
        V.st="out";V.life=Math.min(V.life,12)}
      else if(V.life<=0){V.st="out";ofBubSet(g,"Maybe next time",2)}}
    else if(V.st==="out"){if(ofWalkTo(V,OFL.door,dt)||V.life<-20){ofBubSet(g,null);L.g.remove(g);g.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material)x.material.dispose()});L.vis=null;L.visT=40+Math.random()*50}}}
  // celebration
  if(L.party>0){L.party-=dt;for(const m of L.conf){m.position.y-=m.userData.v*dt;m.rotation.x+=dt*5;m.rotation.z+=dt*3;m.position.x+=Math.sin(t*2+m.userData.s)*dt*.3;if(m.position.y<.02)m.position.y=.02}
    if(L.party<=0){for(const m of L.conf){L.g.remove(m);m.geometry.dispose();m.material.dispose()}L.conf=[];if(L.cake){L.g.remove(L.cake);L.cake.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material)x.material.dispose()});L.cake=null}if(OFC.staff)for(const g of OFC.staff.children)if(g.userData.p&&!g.userData.away)ofBubSet(g.userData.p,null)}}}

/* ---------- loop ---------- */
function ofResize(){if(!OFC.ren||!OFC.el)return;const w=OFC.el.clientWidth||innerWidth,h=OFC.el.clientHeight||innerHeight;OFC.ren.setSize(w,h,false);OFC.cam.aspect=w/h;OFC.cam.updateProjectionMatrix()}
function ofLoop(t){if(!OFC.on||!OFC.ren){OFC.raf=0;return}OFC.raf=requestAnimationFrame(ofLoop);if(document.hidden)return;
  const dt=Math.min(.05,Math.max(0,(t-OFC.last)/1000));OFC.last=t;ofStep(dt);OFC.ren.render(OFC.scene,OFC.cam)}
function ofStep(dt){const P=OFC.p,k=OFC.keys,busy=document.body.classList.contains("ofc-pc")||document.body.classList.contains("ofc-gov")||document.body.classList.contains("ofc-desk");
  let f=0,s=0,turn=0;if(!busy){if(k.w||k.arrowup)f+=1;if(k.s||k.arrowdown)f-=1;if(k.d)s+=1;if(k.a)s-=1;if(k.arrowleft)turn+=1;if(k.arrowright)turn-=1;if(OFC.joy){f-=OFC.joy.y;s+=OFC.joy.x}}
  P.yaw+=turn*2.2*dt;const m=Math.hypot(f,s);let moving=false;
  if(m>.05){const sp=(k.shift?5:3.2)*Math.min(1,m)*dt/m,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
    const dx=(fx*f+rx*s)*sp,dz=(fz*f+rz*s)*sp;if(!ofBlocked(P.x+dx,P.z))P.x+=dx;if(!ofBlocked(P.x,P.z+dz))P.z+=dz;moving=true;
    OFC.av.rotation.y=Math.atan2(-(fx*f+rx*s),-(fz*f+rz*s))}
  else if(OFC.place)OFC.av.rotation.y=P.yaw;
  OFC.walkT=moving?OFC.walkT+dt*10:0;const sw=Math.sin(OFC.walkT)*.5;OFC.legs[0].rotation.x=sw;OFC.legs[1].rotation.x=-sw;
  const FY=(P.f|0)*OFC_FH;OFC.av.position.set(P.x,FY+(moving?Math.abs(Math.sin(OFC.walkT))*.04:0),P.z);
  // third-person camera, clamped inside the room
  const R=OFC_ROOM,D=OFC.camD;let cx=P.x+Math.sin(P.yaw)*D,cz=P.z+Math.cos(P.yaw)*D;cx=Math.max(-R.w/2+.25,Math.min(R.w/2-.25,cx));cz=Math.max(-R.d/2+.25,Math.min(R.d/2-.25,cz));
  if(OFC.mode==="hq"&&!P.f){const st=OFC_ST;if(cx<st.x1+.15&&cz>st.z0-.15)cx=st.x1+.15} // keep the camera out of the staircase
  OFC.cam.position.set(cx,OFC.camH+FY,cz);OFC.cam.lookAt(P.x-Math.sin(P.yaw)*1.2,.9+FY,P.z-Math.cos(P.yaw)*1.2);
  if(OFC.mode==="hq"&&ofStaffSig()!==OFC.ssig)ofStaffBuild();
  if(OFC.mode==="hq"){const F=P.f|0;if(OFC.staff)OFC.staff.children.forEach((g,i)=>{if(OFC.place&&OFC.place.i===i)return;const v=(g.userData.f|0)===F;if(g.visible!==v)g.visible=v});if(OFC.life&&OFC.life.g)OFC.life.g.visible=!F} // labels and bubbles draw on top, so hide the other floor's
  if(OFC.staff)ofStaffAnim(dt);
  if(OFC.life)try{ofLifeStep(dt)}catch(e){console.warn("ofLifeStep",e);OFC.life.err=(OFC.life.err||0)+1;if(OFC.life.err>5)OFC.life=null}
  if(OFC.place)ofGhostStep();else ofNearStep();
  if((OFC.fx.cash=(OFC.fx.cash||0)+dt)>.5){OFC.fx.cash=0;ofCash()}
  if(busy&&!sheet.classList.contains("open"))ofPcClose();
  if(OFC.mode==="pres")presTick(dt)}
function ofCash(){const e=document.getElementById("ofc-cash");if(e)e.textContent=fmt(S.cash)}

/* ---------- nearby item + prompt ---------- */
function ofNearStep(){const P=OFC.p,d=ofData(OFC.key);let best=null,bd=1.25;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  const test=(o,f,bias)=>{const cx=Math.max(f.x0,Math.min(P.x,f.x1)),cz=Math.max(f.z0,Math.min(P.z,f.z1));let dd=Math.hypot(P.x-cx,P.z-cz)-(bias||0);const vx=o.x-P.x,vz=o.z-P.z,vl=Math.hypot(vx,vz)||1;dd+=(1-(vx*fx+vz*fz)/vl)*.25;if(dd<bd){bd=dd;best=o}};
  const F=P.f|0;if(!F)for(const o of d.items)if(!ofD()[o.type].walk)test(o,ofFoot(o),ofD()[o.type].small&&ofSurf(o,d.items)?.2:0); // items on a desk win over the desk
  for(const f of OFC.fix)if(f.type&&(f.f|0)===F)test(f.obj||{type:f.type,x:f.x,z:f.z},f);
  if(!best&&!F){for(const o of d.items)if(ofD()[o.type].walk){const f=ofFoot(o);if(P.x>f.x0&&P.x<f.x1&&P.z>f.z0&&P.z<f.z1)best=o}}
  if(best&&ofD()[best.type]&&ofD()[best.type].top&&!ofD()[best.type].use){const on=d.items.find(s=>ofD()[s.type].use&&ofSurf(s,d.items)===best);if(on)best=on} // a desk hands over to the computer on it
  if(best!==OFC.near){OFC.near=best;OFC.arm=null;ofPrompt()}}
function ofPrompt(){const pr=OFC.el&&OFC.el.querySelector(".opr");if(!pr)return;const o=OFC.near,pl=OFC.place;
  if(pl){const def=pl.type==="_staff"?{icon:"🧑‍💼",name:"department desk"}:ofD()[pl.type];pr.hidden=false;pr.innerHTML=`<span>Placing ${def.icon} ${def.name}</span><button class="ob" data-of="rot">⟲ Rotate (R)</button><button class="ob ok" data-of="confirm">✓ Place (Enter)</button><button class="ob bad" data-of="cancel">✕ Cancel</button>`;return}
  if(!o){pr.hidden=true;pr.innerHTML="";return}pr.hidden=false;
  if(o.type==="_kiosk"){pr.innerHTML=`<span>🛒 Office shop</span><button class="ob pri" data-of="use">E / tap to use</button>`;return}
  if(o.type==="_stairs"){pr.innerHTML=OFC.p.f?`<span>⬇ Stairs to the ground floor</span><button class="ob pri" data-of="use">E / tap to go down</button>`:`<span>⬆ Stairs to the 2nd floor</span><button class="ob pri" data-of="use">E / tap to go up</button>`;return}
  if(o.type==="_boss"){pr.innerHTML=`<span>👔 Your desk · boss office</span><button class="ob pri" data-of="use">E / tap to open the HQ dashboard</button>`;return}
  if(o.type==="_staff"){const d=OFD.find(x=>x[0]===o.k),h=ofHas(o.k)?ofS().d[o.k]:null;pr.innerHTML=h?`<span>${d[1]} ${h.nm} · Head of ${d[2]}</span><button class="ob pri" data-of="use">E / tap to talk</button><button class="ob" data-of="move">✥ Move desk (M)</button>`:`<span>${d[1]} Empty desk · Head of ${d[2]}</span><button class="ob pri" data-of="use">E / tap to hire</button><button class="ob" data-of="move">✥ Move desk (M)</button>`;return}
  if(o.type==="_pdesk"||o.type==="_tools"){pr.innerHTML=o.type==="_pdesk"?`<span>🏛 Presidential desk · government</span><button class="ob pri" data-of="use">E / tap to use</button>`:`<span>🧰 Government tools</span><button class="ob pri" data-of="use">E / tap to use</button>`;return}
  const def=ofD()[o.type],sv=ofSellVal(o);
  pr.innerHTML=`<span>${def.icon} ${def.name}</span>${def.use?`<button class="ob pri" data-of="use">E / tap to use</button>`:""}<button class="ob" data-of="move">✥ Move (M)</button><button class="ob" data-of="store">Store</button><button class="ob bad" data-of="sell">${OFC.arm===o?"Tap again to sell":sv?"Sell "+fmt(sv):"Remove"}</button>`}
function ofCtx(o){return{city:OFC.city,item:o,toast:m=>toast(m),openComputer:ofPcOpen,openShop:()=>ofPanel("shop"),dash:()=>{if(typeof dxOpen==="function")dxOpen()}}}
function ofUse(){const o=OFC.near;if(!o)return;if(o.type==="_stairs"){ofFloor(OFC.p.f?0:1);return}if(o.type==="_boss"){try{DX.page=null;dxOpen()}catch(e){}return}if(o.type==="_kiosk"||o.type==="_tools"){ofPanel("shop");return}if(o.type==="_pdesk"){presDesk();return}if(o.type==="_staff"){try{DX.page="off";dxOpen()}catch(e){}return}const def=ofD()[o.type];if(def&&def.use)def.use(ofCtx(o))}
/* Computer: the classic HQ city tab (registration, employees, network) slides in above the office */
function ofPcOpen(){const hc=OFC.city;if(!hc)return;document.body.classList.add("ofc-pc");tab="hq";openCity(hc)}
function ofPcClose(){if(!document.body.classList.contains("ofc-pc"))return;document.body.classList.remove("ofc-pc");if(sheet.classList.contains("open"))sheet.classList.remove("open","full");if(OFC.cv)OFC.cv.focus({preventScroll:true})}

/* ---------- placing (ghost preview in front of the player) ---------- */
function ofStartPlace(type,from){if(!OFC.T)return;ofPanel(null);const T=OFC.T,P=OFC.p,g=ofD()[type].build(T);
  g.traverse(x=>{if(x.material){x.material=x.material.clone();x.material.transparent=true;x.material.opacity=.6;x.material.depthWrite=false}});
  const def=ofD()[type],pad=new T.Mesh(new T.PlaneGeometry(def.size[0]+.1,def.size[1]+.1),new T.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.35,depthWrite:false}));pad.rotation.x=-Math.PI/2;pad.position.y=.02;g.add(pad);
  OFC.scene.add(g);const vx=Math.sin(P.yaw),vz=Math.cos(P.yaw);const rot=from&&from.rot!=null?from.rot:((Math.round(Math.atan2(vx,vz)/(Math.PI/2))%4)+4)%4;
  OFC.place={type,g,pad,rot,from:from||null,ok:false,x:0,z:0,y:0};OFC.near=null;ofPrompt();ofGhostStep()}
function ofGhostStep(){if(OFC.place.type==="_staff")return ofStaffGhost();const pl=OFC.place,P=OFC.p,R=OFC_ROOM,def=ofD()[pl.type],d=ofData(OFC.key);
  const dist=1.1+Math.max(def.size[0],def.size[1])/2,sn=v=>Math.round(v*4)/4;pl.x=sn(P.x-Math.sin(P.yaw)*dist);pl.z=sn(P.z-Math.cos(P.yaw)*dist);if(def.wall)presWallSnap(pl,def,P);
  const o={type:pl.type,x:pl.x,z:pl.z,rot:pl.rot},f=ofFoot(o),others=d.items;
  let ok=f.x0>=-R.w/2-.001&&f.x1<=R.w/2+.001&&f.z0>=-R.d/2-.001&&f.z1<=R.d/2+.001;const surf=ofSurf(o,others);
  if(ok&&def.wall){ok=!others.some(s=>ofD()[s.type].wall&&ofOver(f,ofFoot(s),.01))&&!OFC.wz.some(q=>ofOver(f,q))}
  else if(ok&&!def.walk){for(const s of others){const sd=ofD()[s.type];if(sd.walk||sd.wall||s===surf)continue;if(surf&&!(sd.small&&ofSurf(s,others)===surf))continue;if(!surf&&sd.small&&ofSurf(s,others))continue;if(ofOver(f,ofFoot(s),.01)){ok=false;break}}
    if(ok&&OFC.fix.some(q=>!q.f&&ofOver(f,q)))ok=false;
    if(ok&&!surf){const cx=Math.max(f.x0,Math.min(P.x,f.x1)),cz=Math.max(f.z0,Math.min(P.z,f.z1));if(Math.hypot(P.x-cx,P.z-cz)<.32)ok=false}}
  if(ok&&def.walk&&others.some(s=>ofD()[s.type].walk&&ofOver(f,ofFoot(s),.01)))ok=false;
  if(P.f)ok=false; // furniture lives on the ground floor
  pl.ok=ok;pl.y=surf?ofD()[surf.type].top:0;pl.g.position.set(pl.x,pl.y+.005,pl.z);pl.g.rotation.y=pl.rot*Math.PI/2;pl.pad.material.color.setHex(ok?0x22c55e:0xef4444);
  const b=OFC.el.querySelector('[data-of="confirm"]');if(b&&b.disabled===ok)b.disabled=!ok}
function ofEndGhost(){const pl=OFC.place;if(!pl)return;OFC.scene.remove(pl.g);pl.g.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material)x.material.dispose()});OFC.place=null;OFC.near=null;OFC.nearSig="";ofPrompt()}
function ofConfirm(){const pl=OFC.place;if(!pl)return;if(pl.type==="_staff")return ofStaffConfirm();if(!pl.ok){toast("Can't place it there. Find a clear spot.");return}const d=ofData(OFC.key);
  const it={type:pl.type,x:pl.x,z:pl.z,rot:pl.rot};if(pl.from&&pl.from.free)it.free=1;
  if(!pl.from){if(!(d.inv[pl.type]>0)){ofEndGhost();return}d.inv[pl.type]--;if(!d.inv[pl.type])delete d.inv[pl.type];const fi=d.freeInv||{};if(fi[pl.type]>(d.inv[pl.type]||0)){it.free=1;fi[pl.type]--;if(!fi[pl.type])delete fi[pl.type]}}
  d.items.push(it);ofEndGhost();ofRebuildItems();save();toast(`${ofD()[it.type].name} placed`)}
function ofCancel(){const pl=OFC.place;if(!pl)return;if(pl.type==="_staff"){if(OFC.staff&&OFC.staff.children[pl.i])OFC.staff.children[pl.i].visible=true;ofEndGhost();return}const d=ofData(OFC.key);if(pl.from){d.items.push(pl.from);ofRebuildItems();save()}ofEndGhost()}
function ofMove(){const o=OFC.near;if(o&&o.type==="_staff"){ofStaffMove(o);return}if(!o||o.type[0]==="_")return;const d=ofData(OFC.key);const kids=d.items.filter(s=>s!==o&&ofD()[o.type].top&&ofSurf(s,d.items)===o);
  if(kids.length){toast("Clear the items off it first.");return}d.items.splice(d.items.indexOf(o),1);ofRebuildItems();ofStartPlace(o.type,o)}
function ofStore(){const o=OFC.near;if(!o||o.type[0]==="_")return;const d=ofData(OFC.key);if(ofD()[o.type].top&&d.items.some(s=>s!==o&&ofSurf(s,d.items)===o)){toast("Clear the items off it first.");return}
  d.items.splice(d.items.indexOf(o),1);d.inv[o.type]=(d.inv[o.type]||0)+1;
  if(o.free){d.freeInv=d.freeInv||{};d.freeInv[o.type]=(d.freeInv[o.type]||0)+1} // starter items keep their zero sell value while stored
  OFC.near=null;ofRebuildItems();save();ofPrompt();toast(`${ofD()[o.type].name} moved to storage`)}
function ofSell(){const o=OFC.near;if(!o||o.type[0]==="_")return;if(OFC.arm!==o){OFC.arm=o;ofPrompt();setTimeout(()=>{if(OFC.arm===o){OFC.arm=null;ofPrompt()}},3000);return}
  const d=ofData(OFC.key);if(ofD()[o.type].top&&d.items.some(s=>s!==o&&ofSurf(s,d.items)===o)){toast("Clear the items off it first.");OFC.arm=null;return}
  const v=ofSellVal(o);d.items.splice(d.items.indexOf(o),1);S.cash+=v;OFC.arm=null;OFC.near=null;ofRebuildItems();save();hud();ofCash();ofPrompt();toast(v?`Sold ${ofD()[o.type].name} for ${fmt(v)}`:`${ofD()[o.type].name} removed`)}

/* ---------- shop / storage / decor panel ---------- */
function ofPanel(t){const pn=OFC.el&&OFC.el.querySelector(".opn");if(!pn)return;OFC.panel=t;if(!t){pn.hidden=true;pn.innerHTML="";if(OFC.cv)OFC.cv.focus({preventScroll:true});return}OFC.ptab=t;pn.hidden=false;ofPanelRender()}
function ofPanelRender(){const pn=OFC.el&&OFC.el.querySelector(".opn");if(!pn||!OFC.panel)return;const d=ofData(OFC.key),t=OFC.ptab,sc=pn.querySelector(".obody")?pn.querySelector(".obody").scrollTop:0;
  let h=`<header><button data-of="tab" data-t="shop" aria-selected="${t==="shop"}">Shop</button><button data-of="tab" data-t="inv" aria-selected="${t==="inv"}">Storage${Object.values(d.inv).reduce((a,b)=>a+b,0)?" ("+Object.values(d.inv).reduce((a,b)=>a+b,0)+")":""}</button><button data-of="tab" data-t="decor" aria-selected="${t==="decor"}">Decor</button><span style="flex:1"></span><button data-of="pclose" aria-label="Close">✕</button></header><div class="obody">`;
  if(t==="shop"&&OFC.mode==="pres")h+=presShopHtml();
  else if(t==="shop"){h+=`<div class="osec">Cash ${fmt(S.cash)}</div>`;for(const k in OFFICE_ITEMS){const it=ofD()[k];h+=`<div class="oit"><i>${it.icon}</i><b>${it.name}</b><small>${it.desc||""}</small><button class="ob pri" data-of="buy" data-k="${k}" ${S.cash<it.price?"disabled":""}>${fmt(it.price)}</button></div>`}}
  else if(t==="inv"){const ks=Object.keys(d.inv).filter(k=>d.inv[k]>0&&ofD()[k]);if(!ks.length)h+=`<p style="color:var(--opmut);font-size:13px">Storage is empty. Stored and newly bought items wait here.</p>`;
    for(const k of ks){const it=ofD()[k],fr=d.freeInv&&d.freeInv[k]>=d.inv[k];h+=`<div class="oit"><i>${it.icon}</i><b>${it.name} ×${d.inv[k]}</b><small><button class="ob lt" data-of="invsell" data-k="${k}" style="padding:4px 9px;margin-top:3px">${fr?"Remove":"Sell "+fmt(Math.round(it.price*.5))}</button></small><button class="ob pri" data-of="invplace" data-k="${k}">Place</button></div>`}}
  else{h+=`<div class="osec">Floor</div><div class="osw">${ofFloors().map((c,i)=>`<button data-of="floor" data-i="${i}" aria-pressed="${d.floor===i}" style="background:${c[1]}">${c[0]}</button>`).join("")}</div><div class="osec">Walls</div><div class="osw">${ofWalls().map((c,i)=>`<button data-of="wall" data-i="${i}" aria-pressed="${d.wall===i}" style="background:${c[1]}">${c[0]}</button>`).join("")}</div>`}
  pn.innerHTML=h+"</div>";const b=pn.querySelector(".obody");if(b)b.scrollTop=sc}
function ofBuy(k){if(OFC.mode==="pres")return presBuy(k);const it=ofD()[k];if(!it)return;if(S.cash<it.price){toast(`Need ${fmt(it.price)} for that`);return}const d=ofData(OFC.key);
  S.cash-=it.price;d.inv[k]=(d.inv[k]||0)+1;bigMove(`the leader bought ${it.name} for ${fmt(it.price)}`,it.price,1);save();hud();ofCash();toast(`Bought ${it.name}. Walk to a spot and place it.`);ofStartPlace(k)}
function ofInvSell(k){const d=ofData(OFC.key),it=ofD()[k];if(!(d.inv[k]>0))return;const fr=!!(d.freeInv&&d.freeInv[k]>=d.inv[k]);const v=fr?0:Math.round(it.price*.5);
  d.inv[k]--;if(!d.inv[k])delete d.inv[k];if(fr){d.freeInv[k]--;if(!d.freeInv[k])delete d.freeInv[k]}S.cash+=v;save();hud();ofCash();ofPanelRender();toast(v?`Sold ${it.name} for ${fmt(v)}`:`${it.name} removed`)}
function ofInvPlace(k){const d=ofData(OFC.key);if(!(d.inv[k]>0))return;ofStartPlace(k)}
function ofDecor(kind,i){const d=ofData(OFC.key),arr=kind==="floor"?ofFloors():ofWalls();if(!arr[i])return;d[kind]=i;save();
  const m=kind==="floor"?OFC.floorM:OFC.wallM;if(m)m.color.set(arr[i][1]);ofPanelRender()}

/* ---------- input ---------- */
function ofBindUI(){const el=OFC.el;
  el.addEventListener("click",e=>{const b=e.target.closest("[data-of]");if(!b||b.disabled)return;const a=b.dataset.of;
    if(a==="exit")ofExit();else if(a==="ofsnd"){S.set=S.set||{};S.set.ofsnd=ofOfSndOn()?0:1;ofSndBtn();save();toast(ofOfSndOn()?"Office sounds on":"Office sounds off")}else if(a==="classic")ofExit(true);else if(a==="shop"){if(OFC.mode==="pres")presGovClose();ofPanel(OFC.panel?null:"shop")}else if(a==="pclose")ofPanel(null);
    else if(a==="tab"){OFC.ptab=b.dataset.t;ofPanelRender()}else if(a==="buy")ofBuy(b.dataset.k);else if(a==="invsell")ofInvSell(b.dataset.k);else if(a==="invplace")ofInvPlace(b.dataset.k);
    else if(a==="floor"||a==="wall")ofDecor(a,+b.dataset.i);else if(a==="use")ofUse();else if(a==="move")ofMove();else if(a==="store")ofStore();else if(a==="sell")ofSell();
    else if(a==="rot"){if(OFC.place)OFC.place.rot=(OFC.place.rot+1)%4}else if(a==="confirm")ofConfirm();else if(a==="cancel")ofCancel();else if(a==="pcclose"){ofPcClose();if(OFC.mode==="pres")presGovClose()}});
  const joy=el.querySelector(".ojoy"),knob=joy.querySelector("i");let jid=null;
  const jmove=e=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,jr=r.width/2-14;let dx=e.clientX-cx,dy=e.clientY-cy;const l=Math.hypot(dx,dy);if(l>jr){dx*=jr/l;dy*=jr/l}
    knob.style.left=(36+dx)+"px";knob.style.top=(36+dy)+"px";OFC.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e);e.preventDefault()});
  joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jmove(e)});
  const jend=()=>{jid=null;OFC.joy=null;knob.style.left="36px";knob.style.top="36px"};joy.addEventListener("pointerup",jend);joy.addEventListener("pointercancel",jend);
  // drag anywhere else on the 3D view to turn and tilt the camera; wheel zooms
  el.addEventListener("pointerdown",e=>{if(e.target!==OFC.cv)return;OFC.drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{OFC.cv.setPointerCapture(e.pointerId)}catch(_){}OFC.cv.focus({preventScroll:true})});
  el.addEventListener("pointermove",e=>{const dg=OFC.drag;if(!dg||dg.id!==e.pointerId)return;OFC.p.yaw-=(e.clientX-dg.x)*.007;OFC.camH=Math.max(1.4,Math.min(5,OFC.camH+(e.clientY-dg.y)*.01));dg.x=e.clientX;dg.y=e.clientY});
  const dend=e=>{if(OFC.drag&&OFC.drag.id===e.pointerId)OFC.drag=null};el.addEventListener("pointerup",dend);el.addEventListener("pointercancel",dend);
  el.addEventListener("wheel",e=>{if(e.target!==OFC.cv)return;OFC.camD=Math.max(2.5,Math.min(8,OFC.camD+e.deltaY*.004));e.preventDefault()},{passive:false})}
window.addEventListener("keydown",e=>{if(!OFC.on)return;const tg=e.target;if(tg&&/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))return;const k=e.key.toLowerCase();
  if(k==="escape"){e.stopImmediatePropagation();e.preventDefault();
    if(typeof MX!=="undefined"&&MX.open&&document.body.classList.contains("ofc-desk"))mxClose();else if(typeof DX!=="undefined"&&DX.open)dxClose();else if(document.body.classList.contains("ofc-gov"))presGovClose();else if(document.body.classList.contains("ofc-desk"))pcClose();else if(document.body.classList.contains("ofc-pc"))ofPcClose();else if(document.body.classList.contains("ofc-gov"))presGovClose();else if(OFC.panel)ofPanel(null);else if(OFC.place)ofCancel();else ofExit();return}
  if(document.body.classList.contains("ofc-pc")||document.body.classList.contains("ofc-gov")||document.body.classList.contains("ofc-desk")||(typeof DX!=="undefined"&&DX.open))return;
  const mv=["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"];
  if(mv.includes(k)){OFC.keys[k]=1}
  else if(k==="e"||k==="enter"){if(OFC.place)ofConfirm();else if(!OFC.panel)ofUse();else return}
  else if(k==="r"){if(OFC.place)OFC.place.rot=(OFC.place.rot+1)%4}
  else if(k==="m"){if(!OFC.place)ofMove()}
  else if(k==="b"){ofPanel(OFC.panel?null:"shop")}
  else return;e.stopImmediatePropagation();if(k!=="shift")e.preventDefault()},true);
window.addEventListener("keyup",e=>{if(OFC.on)OFC.keys[e.key.toLowerCase()]=0},true);
window.addEventListener("blur",()=>{OFC.keys={}});
window.addEventListener("resize",()=>{if(OFC.on)ofResize()});

/* ---------- shop (inside the office panel) ---------- */
function presShopHtml(){const d=presData();let h=`<div class="osec">Cash ${fmt(S.cash)}</div>`;
  const fx=Object.keys(PRES_FX).map(k=>`${PRES_FX[k].n}: ${presFx(k)>0?PRES_FX[k].sg+Math.round(presFx(k)*100)+"%":"0%"} (max ${Math.round(PRES_FX[k].cap*100)}%)`);
  h+=`<p style="color:var(--opmut);font-size:12px;margin:2px 0 6px">Tool bonuses apply only while you are Leader.<br>${fx.join("<br>")}</p><div class="osec">Government tools</div>`;
  for(const k in PRES_ITEMS){const it=PRES_ITEMS[k];if(it.kind!=="tool")continue;const own=!!d.tools[k];
    h+=`<div class="oit"><i>${it.icon}</i><b>${it.name}</b><small>${presEffText(it)}. ${it.desc}</small><button class="ob ${own?"":"pri"}" data-of="buy" data-k="${k}" ${own||S.cash<it.price?"disabled":""}>${own?"Owned":fmt(it.price)}</button></div>`}
  h+=`<div class="osec">Decor (appears in the office; move or remove it any time)</div>`;
  for(const k in PRES_ITEMS){const it=PRES_ITEMS[k];if(it.kind!=="decor")continue;
    h+=`<div class="oit"><i>${it.icon}</i><b>${it.name}</b><small>${it.desc}</small><button class="ob pri" data-of="buy" data-k="${k}" ${S.cash<it.price?"disabled":""}>${fmt(it.price)}</button></div>`}
  return h}
function presBuy(k){const it=PRES_ITEMS[k];if(!it)return;if(!polLeader())return toast("Only a Leader can shop for the office");const d=presData();
  if(it.kind==="tool"&&d.tools[k])return toast("You already own that");if(S.cash<it.price)return toast(`Need ${fmt(it.price)} for that`);
  S.cash-=it.price;bigMove(`the leader furnished the presidential office: ${it.name} for ${fmt(it.price)}`,it.price);
  if(it.kind==="tool"){d.tools[k]=1;presToolsBuild();save();hud();ofCash();ofPanelRender();toast(`${it.name} installed: ${presEffText(it)}`);return}
  const o=presAutoPlace(k);
  if(o){d.items.push(o);ofRebuildItems();save();hud();ofCash();ofPanelRender();toast(`Bought ${it.name}. It's already in the office.`);return}
  d.inv[k]=(d.inv[k]||0)+1;save();hud();ofCash();toast(`Bought ${it.name}. No free spot left: place it yourself.`);ofStartPlace(k)}
/* first free set spot for a new purchase (never on top of the player) */
function presSpotOk(o,items){const def=PRES_ITEMS[o.type],R=OFC_ROOM,f=ofFoot(o),P=OFC.p;
  if(!(f.x0>=-R.w/2-.001&&f.x1<=R.w/2+.001&&f.z0>=-R.d/2-.001&&f.z1<=R.d/2+.001))return false;
  if(def.wall)return !items.some(s=>PRES_ITEMS[s.type].wall&&ofOver(f,ofFoot(s),.01))&&!OFC.wz.some(q=>ofOver(f,q));
  if(def.walk)return !items.some(s=>PRES_ITEMS[s.type].walk&&ofOver(f,ofFoot(s),.01));
  if(OFC.fix.some(q=>ofOver(f,q)))return false;
  const cx=Math.max(f.x0,Math.min(P.x,f.x1)),cz=Math.max(f.z0,Math.min(P.z,f.z1));if(Math.hypot(P.x-cx,P.z-cz)<.6)return false;
  return !items.some(s=>{const sd=PRES_ITEMS[s.type];return !sd.walk&&!sd.wall&&ofOver(f,ofFoot(s),.01)})}
function presAutoPlace(k){const d=presData();for(const sp of PRES_ITEMS[k].spots||[]){const o={type:k,x:sp[0],z:sp[1],rot:sp[2]||0};if(presSpotOk(o,d.items))return o}return null}
/* wall items follow the wall the player faces */
function presWallSnap(pl,def,P){const R=OFC_ROOM,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),dp=def.size[1]/2+.01,sn=v=>Math.round(v*4)/4,cl=(v,h)=>Math.max(-h,Math.min(h,v));
  if(Math.abs(fz)>=Math.abs(fx)){pl.z=fz<0?-R.d/2+dp:R.d/2-dp;pl.rot=fz<0?0:2;pl.x=sn(cl(P.x+fx*2,R.w/2-def.size[0]/2))}
  else{pl.x=fx<0?-R.w/2+dp:R.w/2-dp;pl.rot=fx<0?1:3;pl.z=sn(cl(P.z+fz*2,R.d/2-def.size[0]/2))}}

/* ---------- the room ---------- */
function presFixtures(){const mk=(type,x,z,hw,hd)=>({type,x,z,x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,obj:type?{type,x,z}:null}); // obj: one stable object per fixture so the prompt buttons are not rebuilt every frame (taps keep working)
  return[mk("_pdesk",0,-4.15,1.45,1.25),mk("_kiosk",7.6,3.5,.45,.95),mk("_tools",-7.65,-2.2,.45,1.75),
    mk(null,-3.5,-.8,.35,.35),mk(null,3.5,-.8,.35,.35),mk(null,-3.5,3.4,.35,.35),mk(null,3.5,3.4,.35,.35),mk(null,-2.9,-5.3,.2,.2),mk(null,2.9,-5.3,.2,.2)]}
function presWallZones(){const R=OFC_ROOM;return[{x0:-R.w/2,x1:R.w/2,z0:-R.d/2-.1,z1:-R.d/2+.2},{x0:-1.2,x1:1.2,z0:R.d/2-.2,z1:R.d/2+.1}]} // back wall (windows, seal, flags) and the door
function presLeaf(T,g,yaw,col){const f=ofBox(T,g,.07,.03,.55,col,0,.95,0);f.position.set(Math.sin(yaw)*.22,1.0,Math.cos(yaw)*.22);f.rotation.order="YXZ";f.rotation.y=yaw;f.rotation.x=.45;return f}
/* canvas pictures */

function presArtTex(T,kind){const [c,g]=presCv(256,192);
  if(kind==="land"){const s=g.createLinearGradient(0,0,0,192);s.addColorStop(0,"#fdba74");s.addColorStop(.6,"#fde68a");s.addColorStop(1,"#bae6fd");g.fillStyle=s;g.fillRect(0,0,256,192);g.fillStyle="#fef3c7";g.beginPath();g.arc(190,70,22,0,7);g.fill();
    g.fillStyle="#7c9a6d";g.beginPath();g.moveTo(0,130);g.quadraticCurveTo(70,70,150,125);g.quadraticCurveTo(210,150,256,110);g.lineTo(256,192);g.lineTo(0,192);g.fill();g.fillStyle="#4d6b4a";g.beginPath();g.moveTo(0,160);g.quadraticCurveTo(100,110,256,165);g.lineTo(256,192);g.lineTo(0,192);g.fill()}
  else if(kind==="port"){g.fillStyle="#2a2118";g.fillRect(0,0,256,192);g.fillStyle="#3b2f22";g.fillRect(20,12,216,168);g.fillStyle="#1f2937";g.beginPath();g.moveTo(60,192);g.quadraticCurveTo(128,100,196,192);g.fill();g.fillStyle="#e7c9a0";g.beginPath();g.ellipse(128,76,28,36,0,0,7);g.fill();g.fillStyle="#4b3320";g.beginPath();g.ellipse(128,50,31,17,0,0,7);g.fill();g.fillStyle="#f8fafc";g.fillRect(116,112,24,34);g.fillStyle="#b91c1c";g.fillRect(124,114,8,30)}
  else if(kind==="abs"){g.fillStyle="#f5f0e1";g.fillRect(0,0,256,192);const cols=["#dc2626","#1d4ed8","#facc15","#111827","#16a34a"];for(let i=0;i<9;i++){g.fillStyle=cols[i%5];const x=(i*53)%220,y=(i*37)%140;if(i%2)g.fillRect(x,y,50+(i*11)%40,30+(i*7)%50);else{g.beginPath();g.arc(x+30,y+30,20+(i*5)%20,0,7);g.fill()}}g.strokeStyle="#111827";g.lineWidth=5;g.beginPath();g.moveTo(10,170);g.lineTo(246,20);g.stroke()}
  else{g.fillStyle="#120d08";g.fillRect(0,0,256,192);const r=g.createRadialGradient(128,90,10,128,90,120);r.addColorStop(0,"#fcd34d");r.addColorStop(.5,"#92400e");r.addColorStop(1,"#120d08");g.fillStyle=r;g.fillRect(0,0,256,192);g.fillStyle="#1c1008";g.beginPath();g.moveTo(0,192);g.lineTo(0,140);g.lineTo(60,120);g.lineTo(100,140);g.lineTo(150,110);g.lineTo(256,150);g.lineTo(256,192);g.fill();g.fillStyle="#fde68a";g.fillRect(122,70,6,34);g.fillStyle="#f59e0b";g.beginPath();g.arc(125,62,7,0,7);g.fill()}
  return new T.CanvasTexture(c)}
function presFrame(T,w,h,kind){const g=new T.Group(),y=1.2;ofBox(T,g,w+.16,h+.16,.06,0xd4af37,0,y,0,GOLDM);ofBox(T,g,w+.06,h+.06,.07,0x3b2a1a,0,y+.0,0,{r:.6});
  const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:presArtTex(T,kind)}));p.position.set(0,y+h/2,.04);g.add(p);return g}

function presFlagCloth(T,tex,w,h){const geo=new T.PlaneGeometry(w,h,6,3),pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*5)*.04*((pos.getX(i)+w/2)/w));geo.computeVertexNormals();
  return new T.Mesh(geo,new T.MeshLambertMaterial({map:tex,side:T.DoubleSide}))}
function presFlagStand(T,col,kind,hgt,dir,k){k=k||1;const g=new T.Group();ofCyl(T,g,.2*k,.24*k,.08,0x1f2329,0,0,0,{seg:8});ofCyl(T,g,.025,.025,hgt,col,0,.08,0,GOLDM);ofSph(T,g,.05,0xd4af37,0,.08+hgt,0,GOLDM);
  const w=.75*k,cl=presFlagCloth(T,presFlagTex(T,presCountry(),kind==="std"),w,.5*k);cl.position.set((dir||1)*(w/2+.03),hgt-.2*k,0);g.add(cl);return g}
const presCountry=()=>{const p=S.pol;return p&&p.c||"Meridian"};

function presRoom(T,sc){const R=OFC_ROOM,d=ofData(OFC.key),room=new T.Group(),GOLD=0xd4af37,WOOD=0x5a3a24,WOOD2=0x6e4a30,CREAM=0xe9e4d8,hz=R.d/2,hw=R.w/2;sc.add(room);OFC.room=room;
  OFC.floorM=ofBox(T,room,R.w,.1,R.d,PRES_FLOORS[d.floor][1],0,-.1,0,{r:.9}).material;
  const wm=ofMat(T,PRES_WALLS[d.wall][1],{r:.95});OFC.wallM=wm;
  const wall=(w,h,dd,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,dd),wm);m.position.set(x,y+h/2,z);room.add(m);return m};
  // back wall with two tall windows
  wall(R.w,1.05,.2,0,0,-hz-.1);wall(R.w,.35,.2,0,2.85,-hz-.1);for(const x of [-7.4,0,7.4])wall(x?1.2:8.8,1.8,.2,x,1.05,-hz-.1);
  const sky=new T.Group();for(let i=0;i<14;i++){const h=1.2+((i*53)%9)*.35;ofBox(T,sky,.9,h,.6,[0x7a8ba3,0x8fa3bb,0x6b7c93][i%3],-7.5+i*1.15,.9+Math.max(0,1.6-h*.3)-.6,-hz-1.2,{e:0x4a5d78,ei:.25})}room.add(sky);
  for(const sx of [-1,1]){const cx=sx*5.6;ofBox(T,room,2.4,1.8,.04,0xcfe8ff,cx,1.05,-hz-.16,{e:0x9cc9f5,ei:.55,r:.1});
    ofBox(T,room,.05,1.8,.06,GOLD,cx,1.05,-hz,GOLDM);ofBox(T,room,2.5,.05,.06,GOLD,cx,1.95,-hz,GOLDM);ofBox(T,room,.08,1.9,.1,GOLD,cx-1.22,1.0,-hz,GOLDM);ofBox(T,room,.08,1.9,.1,GOLD,cx+1.22,1.0,-hz,GOLDM);ofBox(T,room,2.5,.08,.1,GOLD,cx,2.88,-hz,GOLDM);ofBox(T,room,2.5,.08,.14,GOLD,cx,1.0,-hz+.02,GOLDM);
    for(const s of [-1,1]){const x=cx+s*1.42;ofBox(T,room,.5,2.3,.2,0x7a1f2b,x,.6,-hz+.12);ofBox(T,room,.05,2.3,.22,0x5e1620,x-s*.1,.6,-hz+.12);ofBox(T,room,.05,2.3,.22,0x5e1620,x+s*.1,.6,-hz+.12);ofSph(T,room,.07,GOLD,x-s*.3,1.3,-hz+.24,GOLDM)}
    ofBox(T,room,3.5,.32,.28,0x7a1f2b,cx,2.78,-hz+.14);ofBox(T,room,3.5,.05,.3,GOLD,cx,2.76,-hz+.14,GOLDM);ofBox(T,room,3.5,.05,.3,GOLD,cx,3.08,-hz+.14,GOLDM)}
  wall(.2,R.h,R.d,-hw-.1,0,0);wall(.2,R.h,R.d,hw+.1,0,0);
  wall(R.w/2-1,R.h,.2,-R.w/4-.5,0,hz+.1);wall(R.w/2-1,R.h,.2,R.w/4+.5,0,hz+.1);wall(2,R.h-2.3,.2,0,2.3,hz+.1);
  // double doors with a gold pediment
  ofBox(T,room,.98,2.25,.1,WOOD,-.49,0,hz+.02);ofBox(T,room,.98,2.25,.1,WOOD,.49,0,hz+.02);ofBox(T,room,.86,2.1,.04,WOOD2,-.49,.08,hz-.04);ofBox(T,room,.86,2.1,.04,WOOD2,.49,.08,hz-.04);for(const x of [-.12,.12])ofSph(T,room,.05,GOLD,x,1.05,hz-.08,GOLDM);
  ofBox(T,room,2.3,.1,.14,GOLD,0,2.3,hz-.02,GOLDM);ofBox(T,room,.1,2.3,.14,GOLD,-1.1,0,hz-.02,GOLDM);ofBox(T,room,.1,2.3,.14,GOLD,1.1,0,hz-.02,GOLDM);
  // wood panelling, gold chair rail, crown moulding and skirting on all four walls
  const lines=[[R.w,.06,0,-hz+.03,1],[6.9,.06,-4.55,hz-.03,1],[6.9,.06,4.55,hz-.03,1],[.06,R.d,-hw+.03,0,0],[.06,R.d,hw-.03,0,0]];
  for(const [w,dd,x,z,al] of lines){const o=al?(z<0?1:-1):0; // al: runs along x (back/front); o pushes trim into the room
    ofBox(T,room,w,1.0,dd,WOOD,x,0,z);ofBox(T,room,al?w:.09,.05,al?.09:dd,GOLD,x+(al?0:(x<0?.01:-.01)),1.0,z+o*.01,GOLDM);ofBox(T,room,al?w:.1,.14,al?.1:dd,0x3b2414,x+(al?0:(x<0?.02:-.02)),0,z+o*.02)}
  for(const [w,dd,x,z,al] of [[R.w,.06,0,-hz+.03,1],[R.w,.06,0,hz-.03,1],[.06,R.d,-hw+.03,0,0],[.06,R.d,hw-.03,0,0]]){const o=al?(z<0?1:-1):0,sx=al?0:(x<0?1:-1);
    ofBox(T,room,al?w:.12,.12,al?.12:dd,GOLD,x+sx*.03,R.h-.12,z+o*.03,GOLDM);ofBox(T,room,al?w:.1,.08,al?.1:dd,CREAM,x+sx*.02,R.h-.2,z+o*.02)}
  for(let i=0;i<8;i++){const x=-hw+1+i*2;ofBox(T,room,.1,.84,.03,WOOD2,x,.1,-hz+.07);ofBox(T,room,.1,.84,.03,WOOD2,x,.1,hz-.07)}
  for(let i=0;i<6;i++){const z=-hz+1+i*2;ofBox(T,room,.03,.84,.1,WOOD2,-hw+.07,.1,z);ofBox(T,room,.03,.84,.1,WOOD2,hw-.07,.1,z)}
  // carpet runner and the seal in the floor
  ofBox(T,room,3.4,.012,8.9,0x7f1d1d,0,0,1.6,{r:1});ofBox(T,room,.1,.016,8.9,GOLD,-1.5,0,1.6,{r:1});ofBox(T,room,.1,.016,8.9,GOLD,1.5,0,1.6,{r:1});ofBox(T,room,3.4,.016,.1,GOLD,0,0,6-.1,{r:1});
  const seal=new T.Mesh(new T.CircleGeometry(1.45,32),new T.MeshLambertMaterial({map:new T.CanvasTexture(presSealCv(presCountry(),256))}));seal.rotation.x=-Math.PI/2;seal.position.set(0,.03,.25);room.add(seal);
  // seal on the back wall, gilt frame
  const ws=new T.Mesh(new T.CircleGeometry(.85,32),new T.MeshBasicMaterial({map:new T.CanvasTexture(presSealCv(presCountry(),256))}));ws.position.set(0,2.0,-hz+.09);room.add(ws);
  const rim=new T.Mesh(new T.CylinderGeometry(.93,.93,.05,32),ofMat(T,GOLD,GOLDM));rim.rotation.x=Math.PI/2;rim.position.set(0,2.0,-hz+.04);room.add(rim);
  // flag stands behind the desk: national flag left, presidential standard right
  for(const [x,std] of [[-2.9,0],[2.9,1]]){const f=presFlagStand(T,GOLD,std?"std":"nat",2.7,std?1:-1,1.6);f.position.set(x,0,-5.3);room.add(f)}
  // columns
  for(const [x,z] of [[-3.5,-.8],[3.5,-.8],[-3.5,3.4],[3.5,3.4]]){const c=new T.Group();ofBox(T,c,.8,.16,.8,GOLD,0,0,0,GOLDM);ofBox(T,c,.66,.12,.66,CREAM,0,.16,0);ofCyl(T,c,.26,.3,2.55,CREAM,0,.28,0,{seg:12,r:.6});for(let i=0;i<4;i++)ofBox(T,c,.04,2.4,.04,0xcfc8b8,Math.cos(i*1.57+.4)*.29,.34,Math.sin(i*1.57+.4)*.29);ofBox(T,c,.66,.14,.66,CREAM,0,2.83,0);ofBox(T,c,.8,.2,.8,GOLD,0,2.97,0,GOLDM);c.position.set(x,0,z);room.add(c)}
  // chandelier over the seal
  const ch=new T.Group();ofCyl(T,ch,.015,.015,.3,GOLD,0,2.9,0,GOLDM);ofCyl(T,ch,.3,.3,.03,GOLD,0,2.88,0,GOLDM);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ofSph(T,ch,.04,0xfff3c4,Math.cos(a)*.29,2.93,Math.sin(a)*.29,{e:0xffe9a8,ei:1});}ofSph(T,ch,.08,GOLD,0,2.82,0,GOLDM);ch.position.set(0,0,.25);room.add(ch);
  for(const x of [-5,5])for(const z of [-3,1.5])ofBox(T,room,1.4,.04,.5,0xfff7e0,x,R.h-.04,z,{e:0xffeec2,ei:.8});
  // presidential desk (fixture): modesty panel, drawer pedestals, leather chair, nameplate
  const dk=new T.Group(),W0=0x3b2414;ofBox(T,dk,2.8,.08,1.3,W0,0,.7,0,{r:.4});ofBox(T,dk,2.86,.03,1.36,GOLD,0,.78,0,GOLDM);ofBox(T,dk,.6,.68,1.2,0x4a2c1a,-1.05,.02,0);ofBox(T,dk,.6,.68,1.2,0x4a2c1a,1.05,.02,0);ofBox(T,dk,1.6,.6,.05,0x4a2c1a,0,.1,-.55);ofBox(T,dk,1.5,.5,.03,0x3b2414,0,.12,.58);
  for(const s of [-1,1])for(const y of [.18,.42])ofBox(T,dk,.3,.03,.02,GOLD,s*1.05,y,.62,GOLDM);ofBox(T,dk,1.1,.01,.7,0x14532d,0,.805,.1,{r:.9});
  ofBox(T,dk,.6,.08,.16,GOLD,0,.8,.52,GOLDM);const nm=presCv(256,64);nm[1].fillStyle="#d4af37";nm[1].fillRect(0,0,256,64);nm[1].fillStyle="#3b2414";nm[1].font="bold 32px Georgia,serif";nm[1].textAlign="center";nm[1].fillText(("THE "+GOVCFG.offices[GOVCFG.offices.length-1].n).toUpperCase(),128,42);
  const np=new T.Mesh(new T.PlaneGeometry(.56,.14),new T.MeshBasicMaterial({map:new T.CanvasTexture(nm[0])}));np.position.set(0,.88,.605);np.rotation.x=-.5;dk.add(np);
  ofSph(T,dk,.14,0x1d4ed8,.9,.98,-.2,{r:.5});ofCyl(T,dk,.02,.02,.1,GOLD,.9,.8,-.2,GOLDM);
  ofBox(T,dk,.3,.02,.2,0x1f2937,-.7,.8,.0);ofBox(T,dk,.4,.3,.03,0x0f172a,-.7,.82,-.3);ofBox(T,dk,.36,.24,.01,0x2563eb,-.7,.85,-.28,{e:0x2563eb,ei:.8});
  ofCyl(T,dk,.04,.05,.3,GOLD,.5,.8,-.3,GOLDM);ofCyl(T,dk,.14,.1,.12,0x14532d,.5,1.1,-.3,{e:0x86efac,ei:.5,seg:8});
  const chr=new T.Group();ofCyl(T,chr,.3,.3,.04,0x1f2329,0,.04,0,{seg:6});ofCyl(T,chr,.04,.04,.4,0x9ca3af,0,.08,0);ofBox(T,chr,.62,.12,.58,0x3b2414,0,.46,0,{r:.5});ofBox(T,chr,.6,.9,.12,0x3b2414,0,.55,-.28,{r:.5});ofBox(T,chr,.5,.7,.06,0x7f1d1d,0,.62,-.22,{r:.5});chr.position.set(0,0,-.85);dk.add(chr);
  dk.position.set(0,0,-3.9);room.add(dk);
  // shop cabinet (fixture, right wall)
  const k=new T.Group();ofBox(T,k,1.8,1.0,.6,0x4a2c1a,0,0,0);ofBox(T,k,1.86,.05,.66,GOLD,0,1.0,0,GOLDM);ofBox(T,k,1.7,1.1,.05,0x14532d,0,1.05,-.26);ofBox(T,k,.05,1.1,.5,0x4a2c1a,-.85,1.05,0);ofBox(T,k,.05,1.1,.5,0x4a2c1a,.85,1.05,0);ofBox(T,k,1.76,.06,.56,GOLD,0,2.15,0,GOLDM);ofBox(T,k,1.7,1.1,.02,0xbfdbfe,0,1.05,.25,{op:.2,r:.1});
  for(let i=0;i<4;i++)ofBox(T,k,.28,.36,.2,[0x7f1d1d,0x1e3a8a,0xb45309,0x14532d][i],-.6+i*.4,1.05,0);
  const kt=ofScreenTex(T,"OFFICE SHOP",["Decor, tools","Press E"]);const ks=new T.Mesh(new T.PlaneGeometry(.9,.5),new T.MeshBasicMaterial({map:kt}));ks.position.set(0,1.75,-.22);k.add(ks);
  k.position.set(7.6,0,3.5);k.rotation.y=-Math.PI/2;room.add(k);
  // tool credenza (fixture, left wall); owned tools stand on it
  const cr=new T.Group();ofBox(T,cr,.62,.85,3.5,0x4a2c1a,0,0,0);ofBox(T,cr,.68,.05,3.56,GOLD,0,.85,0,GOLDM);for(let i=0;i<3;i++)ofBox(T,cr,.02,.5,1.0,0x3b2414,.32,.15,-1.1+i*1.1);cr.position.set(-7.65,0,-2.2);room.add(cr);
  presToolsBuild()}
function presToolsBuild(){const T=OFC.T;if(!T||!OFC.scene)return;if(OFC.toolsG){OFC.scene.remove(OFC.toolsG);OFC.toolsG.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){if(x.material.map)x.material.map.dispose();x.material.dispose()}})}
  const g=new T.Group(),d=presData(),ks=Object.keys(PRES_ITEMS).filter(k=>PRES_ITEMS[k].kind==="tool"),n=ks.length;
  ks.forEach((k,i)=>{const own=d.tools[k],z=-3.85+(i+.5)*(3.3/n),p=new T.Group();ofBox(T,p,.3,.04,.28,own?0xd4af37:0x2b2f36,0,0,0,own?GOLDM:{r:.8});
    if(own){const [c,cx]=presCv(64,64);cx.fillStyle="#13306b";cx.fillRect(0,0,64,64);cx.font="40px sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(PRES_ITEMS[k].icon,32,36);
      ofBox(T,p,.04,.26,.22,0x13306b,0,.04,0);const pl=new T.Mesh(new T.PlaneGeometry(.2,.2),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));pl.position.set(.03,.19,0);pl.rotation.y=Math.PI/2;p.add(pl)}
    p.position.set(-7.65,.88,z);g.add(p)});
  OFC.scene.add(g);OFC.toolsG=g}
return {ofEnter,ofExit,ofPanel,ofParty,ofBox,ofCyl,ofSph,ofDashTex,presFlagStand,presFrame,presLeaf};
})()
