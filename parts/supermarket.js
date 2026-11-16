/* Meridian: walk-in 3D supermarket (lazy part, Mark 2026-11-16). Loaded by smEnter in index.html.
   Runs with a direct eval inside the game's main closure, so it sees S, CITIES, smS, smOpen, SM_TIER, SM_ADD, GIC, G, ofBox, ofMat, loadThree, toast.
   Layout: entrance and checkouts at the +z end, aisles run along z, fresh counters (bakery, deli, freezer) on the back wall, office PC in the back-right corner.
   The hall grows with the store tier; shelves show what is stocked; one checkout and cashier per hired cashier (max 12).
   Controls: W/S or up/down walk, A/D or left/right turn, drag to turn, joystick on touch, E use, Esc exit. */
(function(){
const W={on:false,el:null,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:0,yaw:Math.PI},keys:{},joy:null,drag:null,raf:0,last:0,city:null,obst:[],hw:7,hd:6,pc:null,near:null,sig:"",sigT:0,btn:null,world:null};
const DIM=[[14,12],[20,16],[28,22]];
function css(){if(document.getElementById("sm3-css"))return;const s=document.createElement("style");s.id="sm3-css";s.textContent=`
.sm3{position:fixed;inset:0;z-index:2147483000;background:#0b0f14;font:13px system-ui,sans-serif;color:#e2e8f0;overflow:hidden;touch-action:none;user-select:none}
.sm3 canvas{display:block;width:100%;height:100%;outline:none}
.sm3-top{position:absolute;top:0;left:0;right:0;padding:10px;background:linear-gradient(#020617d9,#02061700);display:flex;gap:8px;align-items:center}
.sm3-top div{flex:1;text-shadow:0 1px 3px #000}.sm3-top b{display:block;color:#fbbf24;font-size:15px}.sm3-top small{color:#cbd5e1}
.sm3-btn{appearance:none;background:#b45309;color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 13px system-ui;cursor:pointer}.sm3-btn.g{background:#334155;color:#fff}
.sm3-help{position:absolute;left:10px;top:58px;font-size:11px;color:#f1f5f9;background:#020617a6;padding:3px 8px;border-radius:6px;pointer-events:none}
.sm3-joy{position:absolute;left:22px;bottom:26px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none;display:none}
.sm3-joy i{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.8);pointer-events:none}.sm3.touch .sm3-joy{display:block}.sm3.touch .sm3-help{display:none}
.sm3-act{position:absolute;left:50%;bottom:22px;transform:translateX(-50%)}`;document.head.appendChild(s)}
function tex(T,lines,o){o=o||{};const cv=document.createElement("canvas"),w=o.w||256,h=o.h||96;cv.width=w;cv.height=h;const g=cv.getContext("2d");g.fillStyle=o.bg||"#14532d";g.fillRect(0,0,w,h);g.fillStyle=o.fg||"#fff";g.textAlign="center";g.textBaseline="middle";
  lines.forEach((t,i)=>{g.font=(i?"":"bold ")+Math.round((o.fs||40)*(i?.6:1))+"px system-ui,sans-serif";g.fillText(t,w/2,h*(i+1)/(lines.length+1))});const tx=new T.CanvasTexture(cv);return tx}
function sign(T,g,lines,w,h,x,y,z,ry,o){const mat=new T.MeshBasicMaterial({map:tex(T,lines,o)}),geo=new T.PlaneGeometry(w,h);for(const r of [0,Math.PI]){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=(ry||0)+r;g.add(m)}}
function person(T,col){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x1f2937,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x1f2937,.1,0,0);ofBox(T,g,.42,.55,.26,col,0,.5,0);
  const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),ofMat(T,0xf1c27d));hd.position.set(0,1.22,0);g.add(hd);g.userData.legs=[l,r];return g}
const gcol=g=>{let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return new (W.T.Color)().setHSL((h%360)/360,.65,.5).getHex()};
const sigOf=t=>[t.tier,t.st.cash,Object.keys(t.add).filter(k=>t.add[k]).join(","),t.ls.map(g=>g+":"+Math.round(4*Math.min(1,(t.sh[g]||0)/Math.max(1,smCap(CITIES[W.city],t))))).join(",")].join("|");
function build(){const T=W.T,c=CITIES[W.city],t=smS(c),tr=SM_TIER[t.tier],[w,d]=DIM[t.tier]||DIM[0],hw=W.hw=w/2,hd=W.hd=d/2;
  if(W.world){W.scene.remove(W.world);W.world.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){if(m.map)m.map.dispose();m.dispose()}})}
  const g=W.world=new T.Group();W.scene.add(g);W.obst=[];const ob=(x0,x1,z0,z1)=>W.obst.push({x0,x1,z0,z1});
  ofBox(T,g,w,.05,d,0xe5e7eb,0,-.05,0,{r:.5});ofBox(T,g,w,.05,d,0xf8fafc,0,3.6,0);
  ofBox(T,g,w,3.6,.2,0xfef3c7,0,0,-hd);ofBox(T,g,.2,3.6,d,0xfef3c7,-hd*0+-hw,0,0);ofBox(T,g,.2,3.6,d,0xfef3c7,hw,0,0);
  ofBox(T,g,(w-3)/2,3.6,.2,0xfef3c7,-(w+3)/4,0,hd);ofBox(T,g,(w-3)/2,3.6,.2,0xfef3c7,(w+3)/4,0,hd);ofBox(T,g,3,.6,.2,0xfef3c7,0,3,hd);
  sign(T,g,[`🛒 ${tr.n.toUpperCase()}`,c.name],4,1.2,0,2.6,hd-.15,0,{bg:"#166534",w:384,h:128});
  for(let x=-hw+2;x<hw;x+=4)for(let z=-hd+2;z<hd;z+=4)ofBox(T,g,1.6,.04,.3,0xffffff,x,3.52,z,{e:0xffffff,ei:.9});
  // checkouts: one lane per cashier (max 12) across the front
  const nc=Math.max(0,Math.min(12,t.st.cash|0)),lanes=Math.max(1,nc),lw=Math.min(2.2,(w-4)/lanes),zc=hd-3;
  for(let i=0;i<nc;i++){const x=-((lanes-1)*lw)/2+i*lw;ofBox(T,g,.6,.9,1.6,0x334155,x,0,zc);ofBox(T,g,.5,.3,.3,0x0f172a,x,.9,zc-.4);const p=person(T,0x16a34a);p.position.set(x-.55,0,zc);p.rotation.y=Math.PI/2;g.add(p);ob(x-.35,x+.35,zc-.85,zc+.85)}
  if(!nc)sign(T,g,["No cashiers","Hire some on the PC"],2.4,.9,0,1.6,zc,0,{bg:"#7f1d1d"});
  // aisles: shelf units along z, 2 goods per side per unit
  const ls=t.ls.slice(),na=Math.max(1,Math.ceil(ls.length/4)),az0=-hd+3.2,az1=zc-2.2,alen=Math.max(2,az1-az0),cols=Math.max(1,Math.min(na,Math.floor((w-2)/2.6))),rowsN=Math.ceil(na/cols),ulen=alen/rowsN-.8;
  let gi=0;for(let a=0;a<na;a++){const ci=a%cols,ri=Math.floor(a/cols),x=-((cols-1)*2.6)/2+ci*2.6,z=az0+ri*(ulen+.8)+ulen/2;ofBox(T,g,.7,1.9,ulen,0xcbd5e1,x,0,z,{m:.3,r:.4});ob(x-.45,x+.45,z-ulen/2,z+ulen/2);
    for(const sd of [-1,1])for(const half of [-1,1]){const gd=ls[gi++];if(!gd)continue;const q=Math.min(1,(t.sh[gd]||0)/Math.max(1,smCap(c,t))),zz=z+half*ulen/4,col=gcol(gd);
      for(let sh=0;sh<3;sh++){ofBox(T,g,.05,.03,ulen/2-.1,0x94a3b8,x+sd*.38,.35+sh*.55,zz);const n=Math.round(q*6);for(let k=0;k<n;k++)ofBox(T,g,.22,.3,.18,col,x+sd*.42,.38+sh*.55,zz-ulen/4+.2+k*(ulen/2-.3)/6)}
      sign(T,g,[`${GIC[gd]||""} ${G[gd][0]}`,q>0?`${Math.floor(t.sh[gd]||0)} in stock`:"EMPTY"],1.4,.5,x+sd*.75,2.1,zz,sd*Math.PI/2,{bg:q>0?"#1e3a8a":"#7f1d1d"})}}
  // back-wall counters
  const bx=[-hw/2,0,hw/2],ad=[["bakery","🥖 BAKERY",0xd97706],["deli","🧀 DELI",0xbe123c],["freezer","🧊 FROZEN",0x0ea5e9]];
  ad.forEach(([k,n,col],i)=>{if(!t.add[k])return;const x=bx[i],z=-hd+.8;if(k==="freezer"){ofBox(T,g,3,1,1,0xe0f2fe,x,0,z);ofBox(T,g,3,.05,1,0x7dd3fc,x,1,z,{op:.5,e:0x38bdf8,ei:.6})}else{ofBox(T,g,3,1,1,col,x,0,z);ofBox(T,g,3,.5,1,0xffffff,x,1,z,{op:.35})
    const p=person(T,0xffffff);p.position.set(x,0,z-.9);g.add(p)}sign(T,g,[n],2.4,.6,x,2.6,-hd+.15,0,{bg:"#"+col.toString(16).padStart(6,"0")});ob(x-1.6,x+1.6,-hd,z+.6)});
  // office PC in the back-right corner
  const px=hw-1.2,pz=-hd+2.2;ofBox(T,g,1.4,.75,.8,0x6b4a33,px,0,pz);const scr=new T.Mesh(new T.PlaneGeometry(.7,.42),new T.MeshBasicMaterial({map:tex(T,["🖥 STORE PC","Manage"],{bg:"#0b1220",fg:"#38bdf8"})}));scr.position.set(px,1.05,pz+.1);g.add(scr);ofBox(T,g,.72,.44,.04,0x111827,px,.83,pz+.06);ob(px-.75,px+.75,pz-.45,pz+.45);W.pc={x:px,z:pz+1};
  for(let i=0;i<(t.st.stock|0)&&i<8;i++){const p=person(T,0xea580c);p.position.set(-hw+1+((i*3.1)%(w-2)),0,az0+((i*2.3)%alen));p.userData.wk=1;p.userData.ph=i;g.add(p)}
  for(let i=0;i<(t.st.sec|0)&&i<4;i++){const p=person(T,0x111827);p.position.set(i%2?hw-1:-hw+1,0,zc+1.2);g.add(p)}
  W.sig=sigOf(t)}
function blocked(x,z){if(Math.abs(x)>W.hw-.3||z<-W.hd+.3||z>W.hd+.5)return true;if(z>W.hd-.3&&Math.abs(x)>1.4)return true;for(const o of W.obst)if(x>o.x0-.25&&x<o.x1+.25&&z>o.z0-.25&&z<o.z1+.25)return true;return false}
function nearest(){const P=W.p;if(W.pc&&Math.hypot(P.x-W.pc.x,P.z-W.pc.z)<1.5)return {k:"pc",n:"🖥 Use the store PC"};if(P.z>W.hd-1)return {k:"exit",n:"🚪 Leave the store"};return null}
function use(){const n=W.near;if(!n)return;if(n.k==="pc")smOpen(CITIES[W.city]);else close()}
function loop(ts){if(!W.on)return;W.raf=requestAnimationFrame(loop);const dt=Math.min(.05,(ts-(W.last||ts))/1000);W.last=ts;const P=W.p,K=W.keys;
  if(SMW.el&&SMW.el.style.display!=="none")return;
  let f=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0),tn=(K.a||K.arrowleft?1:0)-(K.d||K.arrowright?1:0);if(W.joy){f=-W.joy.y;tn=-W.joy.x}
  P.yaw+=tn*dt*2.4;const sp=(K.shift?6:3.2)*f*dt;if(sp){const nx=P.x-Math.sin(P.yaw)*sp,nz=P.z-Math.cos(P.yaw)*sp;if(!blocked(nx,P.z))P.x=nx;if(!blocked(P.x,nz))P.z=nz}
  const mv=Math.abs(f)>.05;W.walkT=mv?W.walkT+dt*10:0;const sw=Math.sin(W.walkT)*.5;W.legs[0].rotation.x=sw;W.legs[1].rotation.x=-sw;W.av.position.set(P.x,0,P.z);W.av.rotation.y=P.yaw+Math.PI;
  W.cam.position.set(P.x+Math.sin(P.yaw)*4.2,2.9,P.z+Math.cos(P.yaw)*4.2);W.cam.lookAt(P.x,1.1,P.z);
  if(W.world)W.world.children.forEach(o=>{if(o.userData&&o.userData.wk){const u=ts/1000+o.userData.ph;o.position.z+=Math.sin(u*.6)*.01;const l=o.userData.legs;l[0].rotation.x=Math.sin(u*6)*.4;l[1].rotation.x=-l[0].rotation.x}});
  const n=nearest();if((n&&n.n)!==(W.near&&W.near.n)){W.near=n;W.btn.hidden=!n;if(n)W.btn.textContent=n.n+" (E)"}
  if(ts-W.sigT>2000){W.sigT=ts;const t=smS(CITIES[W.city]);const sb=W.el.querySelector("#sm3-sub");if(sb)sb.textContent=`${smIn(t).length}/${SM_TIER[t.tier].slots} goods in stock · ${fmt(profit(BIZ.find(x=>x.k==="smkt"),CITIES[W.city],smLv(CITIES[W.city])))}/hr`;if(sigOf(t)!==W.sig)build()}
  const cv=W.ren.domElement,wd=W.el.clientWidth,ht=W.el.clientHeight;if(cv.width!==Math.round(wd*W.ren.getPixelRatio())||cv.height!==Math.round(ht*W.ren.getPixelRatio())){W.ren.setSize(wd,ht,false);W.cam.aspect=wd/ht;W.cam.updateProjectionMatrix()}
  W.ren.render(W.scene,W.cam)}
function open(cid){if(W.on)return;const c=CITIES[cid];if(!c||!smLv(c))return toast("No supermarket here");css();W.on=true;W.city=cid;document.body.classList.add("lc3-on");
  const el=W.el=document.createElement("div");el.className="sm3";el.setAttribute("role","dialog");el.setAttribute("aria-label","Supermarket in "+c.name);if(matchMedia("(pointer:coarse)").matches)el.classList.add("touch");
  el.innerHTML=`<div class="sm3-top"><div><b>🛒 SUPERMARKET · ${smEsc(c.name.toUpperCase())}</b><small id="sm3-sub"></small></div><button class="sm3-btn g" data-s3="pc">🖥 Manage</button><button class="sm3-btn" data-s3="x">Exit</button></div>
  <div class="sm3-help">W/S walk · A/D or ←/→ turn · drag to turn · Shift run · E use · Esc exit</div><div class="sm3-joy"><i></i></div><div class="sm3-act"><button class="sm3-btn" data-s3="use" hidden></button></div>`;
  document.body.appendChild(el);W.btn=el.querySelector('[data-s3="use"]');W.keys={};W.near=null;W.p={x:0,z:DIM[smS(c).tier][1]/2-1.2,yaw:0};
  const joy=el.querySelector(".sm3-joy"),kn=joy.firstChild,jr=56;let jid=null;const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";W.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});const je=()=>{jid=null;W.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.tabIndex=-1;el.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k==="escape"){close();return}if(k==="e"||k==="enter"){use();return}W.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});el.addEventListener("keyup",e=>{W.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-s3]");if(!b)return;const a=b.dataset.s3;if(a==="x")close();else if(a==="pc")smOpen(CITIES[W.city]);else if(a==="use")use()});
  el.addEventListener("pointerdown",e=>{if(e.target.tagName==="CANVAS")W.drag={x:e.clientX}});el.addEventListener("pointermove",e=>{if(W.drag){W.p.yaw-=(e.clientX-W.drag.x)*.006;W.drag.x=e.clientX}});const de=()=>W.drag=null;el.addEventListener("pointerup",de);el.addEventListener("pointercancel",de);
  loadThree().then(T=>{if(!W.on||W.el!==el)return;W.T=T;let ren;try{ren=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"})}catch(e){close();toast("3D isn't available on this device. Opening the store panel instead.");smOpen(c);return}
    W.ren=ren;ren.setPixelRatio(Math.min(2,devicePixelRatio||1));el.insertBefore(ren.domElement,el.firstChild);const sc=W.scene=new T.Scene();sc.background=new T.Color(0xdbeafe);W.cam=new T.PerspectiveCamera(60,1,.1,200);
    sc.add(new T.HemisphereLight(0xffffff,0x94a3b8,.9));const dl=new T.DirectionalLight(0xffffff,.5);dl.position.set(5,10,6);sc.add(dl);
    const av=W.av=person(T,0x2563eb);W.legs=av.userData.legs;sc.add(av);build();W.raf=requestAnimationFrame(loop);el.focus()}).catch(()=>{close();toast("Couldn't load the 3D store. Check your connection and try again.")})}
function close(){if(!W.on)return;W.on=false;document.body.classList.remove("lc3-on");cancelAnimationFrame(W.raf);W.raf=0;
  if(W.scene)W.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){if(m.map)m.map.dispose();m.dispose()}});
  if(W.ren){W.ren.dispose();try{W.ren.forceContextLoss()}catch(e){}}W.ren=W.scene=W.cam=W.av=W.world=null;if(W.el)W.el.remove();W.el=null;try{save()}catch(e){}}
return {open,close};
})()
