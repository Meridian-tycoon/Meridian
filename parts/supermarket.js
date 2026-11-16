/* Meridian: walk-in 3D supermarket (lazy part, Mark 2026-11-16; fixtures & build mode 2026-11-16). Loaded by smEnter in index.html.
   Runs with a direct eval inside the game's main closure, so it sees S, CITIES, smS, smOpen, smClose, SMW, SM_TIER, SM_FX, SM_DIM, SM_COLD, smFxR, smFits, smFxAdd/Move/Sell, smSlotSet, smPull, smBuy, smCap, smGF, GIC, G, ofBox, ofMat, loadThree, toast, fmt.
   Layout: entrance and checkouts at the +z end (checkout lanes leave a 3 m walkway in the middle), fixtures from S.smkt[city].lay, fresh counters on the back wall, office PC in the back-right corner.
   Controls: W/S or up/down walk, A/D turn, drag to turn, joystick on touch, E use (PC / shelf picker), B build mode, Esc closes the top-most thing (manage window, picker, build tool, build mode, store).
   Build mode: overview camera, click a palette fixture then click the floor to buy it; click a fixture to pick it up and click to drop it; R rotate; Del sell (50% back). */
(function(){
const W={on:false,el:null,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:0,yaw:Math.PI},keys:{},joy:null,drag:null,raf:0,last:0,city:null,obst:[],hw:7,hd:6,pc:null,near:null,sig:"",sigT:0,btn:null,world:null,bm:null,gh:null,pk:null,kd:null,mouse:null};
function css(){if(document.getElementById("sm3-css"))return;const s=document.createElement("style");s.id="sm3-css";s.textContent=`
.sm3{position:fixed;inset:0;z-index:2147483000;background:#0b0f14;font:13px system-ui,sans-serif;color:#e2e8f0;overflow:hidden;touch-action:none;user-select:none}
.sm3 canvas{display:block;width:100%;height:100%;outline:none}
.sm3-top{position:absolute;top:0;left:0;right:0;padding:10px;background:linear-gradient(#020617d9,#02061700);display:flex;gap:8px;align-items:center}
.sm3-top div{flex:1;text-shadow:0 1px 3px #000}.sm3-top b{display:block;color:#fbbf24;font-size:15px}.sm3-top small{display:inline-block;margin-top:2px;padding:2px 8px;border-radius:999px;background:#0f172acc;color:#f1f5f9;text-shadow:none;font-weight:600}
.sm3-btn{appearance:none;background:#b45309;color:#fff;border:0;border-radius:999px;padding:9px 14px;font:600 13px system-ui;cursor:pointer}.sm3-btn.g{background:#334155;color:#fff}.sm3-btn.on{background:#16a34a}
.sm3-help{position:absolute;left:10px;top:58px;font-size:11px;color:#f1f5f9;background:#020617a6;padding:3px 8px;border-radius:6px;pointer-events:none}
.sm3-joy{position:absolute;left:22px;bottom:26px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none;display:none}
.sm3-joy i{position:absolute;left:36px;top:36px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.8);pointer-events:none}.sm3.touch .sm3-joy{display:block}.sm3.touch .sm3-help{display:none}
.sm3-act{position:absolute;left:50%;bottom:22px;transform:translateX(-50%)}
@media(max-width:700px){.sm3-top{flex-wrap:wrap;gap:6px;padding:8px}.sm3-top div{flex:1 1 100%;min-width:0}.sm3-top b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}.sm3-top small{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px}.sm3-top .sm3-btn{flex:1 1 0;padding:7px 6px;font-size:12px;white-space:nowrap}.sm3-help{top:auto;bottom:8px;right:10px;left:10px;text-align:center;font-size:10px}.sm3.bm .sm3-help{display:none}.sm3-pk{top:104px}}
.sm3-pal{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:#0f172aee;border:1px solid #334155;border-radius:12px;padding:8px 10px;display:none;max-width:calc(100% - 24px)}
.sm3.bm .sm3-pal{display:block}.sm3.bm .sm3-act,.sm3.bm .sm3-joy{display:none}
.sm3-pal .r{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.sm3-pal button{font:600 12px system-ui;padding:6px 9px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:#f1f5f9;cursor:pointer}
.sm3-pal button.sel{background:#16a34a;border-color:#4ade80;color:#fff}.sm3-pal button:disabled{opacity:.45;cursor:default}.sm3-pal small{display:block;color:#cbd5e1;text-align:center;margin-top:5px}.sm3-pal .hv{color:#fbbf24}
.sm3-pk{position:absolute;right:12px;top:64px;bottom:12px;width:400px;max-width:calc(100% - 24px);background:#0f172af2;border:1px solid #334155;border-radius:12px;display:none;flex-direction:column;color:#e2e8f0}
.sm3-pk.on{display:flex}.sm3-pk header{display:flex;align-items:center;gap:8px;padding:10px;border-bottom:1px solid #334155}.sm3-pk header b{flex:1;color:#fbbf24}
.sm3-pk .bd{overflow:auto;padding:10px;flex:1}.sm3-pk button{font:600 12px system-ui;padding:5px 9px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:#f1f5f9;cursor:pointer}.sm3-pk button.g{background:#16a34a;border-color:#16a34a;color:#fff}.sm3-pk button:disabled{opacity:.45;cursor:default}
.sm3-pk table{width:100%;border-collapse:collapse;font-size:12px}.sm3-pk td{padding:3px 4px;border-top:1px solid #1e293b}.sm3-pk tr.cur td{background:#14532d}.sm3-pk small{color:#94a3b8}.sm3-pk .w{color:#fb923c}.sm3-pk .row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}`;document.head.appendChild(s)}
function tex(T,lines,o){o=o||{};const cv=document.createElement("canvas"),w=o.w||256,h=o.h||96;cv.width=w;cv.height=h;const g=cv.getContext("2d");g.fillStyle=o.bg||"#14532d";g.fillRect(0,0,w,h);g.fillStyle=o.fg||"#fff";g.textAlign="center";g.textBaseline="middle";
  lines.forEach((t,i)=>{g.font=(i?"":"bold ")+Math.round((o.fs||40)*(i?.6:1))+"px system-ui,sans-serif";g.fillText(t,w/2,h*(i+1)/(lines.length+1))});const tx=new T.CanvasTexture(cv);return tx}
function sign(T,g,lines,w,h,x,y,z,ry,o){const mat=new T.MeshBasicMaterial({map:tex(T,lines,o)}),geo=new T.PlaneGeometry(w,h);for(const r of [0,Math.PI]){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=(ry||0)+r;g.add(m)}}
function person(T,col){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x1f2937,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x1f2937,.1,0,0);ofBox(T,g,.42,.55,.26,col,0,.5,0);
  const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),ofMat(T,0xf1c27d));hd.position.set(0,1.22,0);g.add(hd);g.userData.legs=[l,r];return g}
const gcol=g=>{let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return new (W.T.Color)().setHSL((h%360)/360,.65,.5).getHex()};
const city=()=>CITIES[W.city];
const sigOf=t=>[t.tier,t.st.cash,Object.keys(t.add).filter(k=>t.add[k]).join(","),t.lay.map(f=>[f.i,f.k,f.x,f.z,f.r,f.g.join("/")].join(",")).join(";"),t.ls.map(g=>g+":"+Math.round(4*Math.min(1,(t.sh[g]||0)/Math.max(1,smCap(city(),t))))).join(",")].join("|");
/* local fixture coords (length along z at rotation 0) to world, matching Three's rotation.y=-r*PI/2 */
function l2w(f,lx,lz){const th=-f.r*Math.PI/2,c=Math.cos(th),s=Math.sin(th);return [f.x+lx*c+lz*s,f.z-lx*s+lz*c]}
/* where the player stands to use each slot */
function slotPts(f){const d=SM_FX[f.k],a=d.w/2+.55;if(f.k==="shelf"||f.k==="fridge")return [[[-a,0]],[[a,0]]];if(f.k==="endcap")return [[[0,d.d/2+.55],[a,0],[-a,0]]];return [[[-a,-d.d/4],[a,-d.d/4]],[[-a,d.d/4],[a,d.d/4]]]}
const gname=g=>`${GIC[g]||""} ${G[g][0]}`;
function slotSign(T,fg,c,t,f,s,x,y,z,ry,w){const g=f.g[s];if(!g)return sign(T,fg,["EMPTY SLOT","Press E to stock"],w||1.3,.45,x,y,z,ry,{bg:"#475569"});
  const q=t.sh[g]||0,bad=smGF(t,g)<.9&&SM_COLD[g]&&SM_FX[f.k].cold!==SM_COLD[g];sign(T,fg,[gname(g),bad?`⚠ needs ${SM_COLD[g]==="f"?"fridge":"freezer"}`:q>=.5?`${Math.floor(q)} in stock`:"EMPTY"],w||1.3,.45,x,y,z,ry,{bg:bad?"#c2410c":q>=.5?(f.k==="endcap"?"#a16207":"#1e3a8a"):"#7f1d1d"})}
function drawFx(T,fg,f,c,t){const d=SM_FX[f.k],cap=Math.max(1,smCap(c,t)),fr=g=>g?Math.min(1,(t.sh[g]||0)/cap):0;
  if(f.k==="shelf"){ofBox(T,fg,.7,1.9,d.d,0xcbd5e1,0,0,0,{m:.3,r:.4});
    [-1,1].forEach((sd,s)=>{const g=f.g[s],n=Math.round(fr(g)*8),col=g?gcol(g):0;for(let sh=0;sh<3;sh++){ofBox(T,fg,.05,.03,d.d-.1,0x94a3b8,sd*.38,.35+sh*.55,0);for(let k=0;k<n;k++)ofBox(T,fg,.22,.3,.18,col,sd*.42,.38+sh*.55,-d.d/2+.25+k*(d.d-.5)/8)}slotSign(T,fg,c,t,f,s,sd*.75,2.1,0,sd*Math.PI/2)})}
  else if(f.k==="fridge"){ofBox(T,fg,.8,2.1,d.d,0xe2e8f0,0,0,0,{m:.4,r:.3});ofBox(T,fg,.82,.15,d.d+.02,0x0ea5e9,0,2.1,0,{e:0x38bdf8,ei:.6});
    [-1,1].forEach((sd,s)=>{const g=f.g[s],n=Math.round(fr(g)*6),col=g?gcol(g):0;for(let sh=0;sh<4;sh++)for(let k=0;k<n;k++)ofBox(T,fg,.16,.22,.16,col,sd*.43,.25+sh*.45,-d.d/2+.25+k*(d.d-.5)/6);
      ofBox(T,fg,.03,1.85,d.d-.1,0xbae6fd,sd*.53,.15,0,{op:.3,e:0x7dd3fc,ei:.2});slotSign(T,fg,c,t,f,s,sd*.62,2.5,0,sd*Math.PI/2)})}
  else if(f.k==="freezer"){ofBox(T,fg,d.w,.45,d.d,0xf1f5f9,0,0,0);for(const sd of [-1,1]){ofBox(T,fg,.06,.4,d.d,0xe2e8f0,sd*(d.w/2-.03),.45,0);ofBox(T,fg,d.w,.4,.06,0xe2e8f0,0,.45,sd*(d.d/2-.03))}
    ofBox(T,fg,d.w-.1,.03,d.d-.1,0x7dd3fc,0,.85,0,{op:.35,e:0x38bdf8,ei:.5});
    [-1,1].forEach((sd,s)=>{const g=f.g[s],n=Math.round(fr(g)*8),col=g?gcol(g):0;for(let k=0;k<n;k++)ofBox(T,fg,.2,.14,.2,col,-.3+(k%3)*.3,.46+Math.floor(k/3)*.14,sd*d.d/4+((k%2)-.5)*.3);slotSign(T,fg,c,t,f,s,0,1.45,sd*d.d/4,0,.95)})}
  else if(f.k==="endcap"){ofBox(T,fg,d.w,.5,d.d,0xb91c1c,0,0,0);ofBox(T,fg,d.w-.15,.45,d.d-.3,0xdc2626,0,.5,-.1);ofBox(T,fg,d.w-.3,.45,d.d-.55,0xef4444,0,.95,-.2);
    const g=f.g[0],n=Math.round(fr(g)*9),col=g?gcol(g):0;for(let k=0;k<n;k++){const lv=Math.floor(k/3);ofBox(T,fg,.2,.26,.18,col,-.25+(k%3)*.25,.5+lv*.45,.3-lv*.12)}slotSign(T,fg,c,t,f,0,0,1.9,0,0,1.2)}
  else if(f.k==="produce"){ofBox(T,fg,d.w,.7,d.d,0x92400e,0,0,0);
    [-1,1].forEach((sd,s)=>{const g=f.g[s],n=Math.round(fr(g)*8),col=g?gcol(g):0;ofBox(T,fg,d.w-.2,.12,d.d/2-.15,0xa16207,0,.7,sd*d.d/4);for(let k=0;k<n;k++)ofSph(T,fg,.11,col,-.5+(k%4)*.33,.92+Math.floor(k/4)*.15,sd*d.d/4+(k%2?.12:-.12));slotSign(T,fg,c,t,f,s,0,1.6,sd*d.d/4,0,1.1)})}}
function build(){const T=W.T,c=city(),t=smS(c),tr=SM_TIER[t.tier],[w,d]=SM_DIM[t.tier]||SM_DIM[0],hw=W.hw=w/2,hd=W.hd=d/2;
  if(W.world){W.scene.remove(W.world);W.world.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){if(m.map)m.map.dispose();m.dispose()}})}
  const g=W.world=new T.Group();W.scene.add(g);W.obst=[];const ob=(x0,x1,z0,z1)=>W.obst.push({x0,x1,z0,z1});
  ofBox(T,g,w,.05,d,0xe5e7eb,0,-.05,0,{r:.5});W.ceil=[ofBox(T,g,w,.05,d,0xf8fafc,0,3.6,0)];
  ofBox(T,g,w,3.6,.2,0xfef3c7,0,0,-hd);ofBox(T,g,.2,3.6,d,0xfef3c7,-hw,0,0);ofBox(T,g,.2,3.6,d,0xfef3c7,hw,0,0);
  ofBox(T,g,(w-3)/2,3.6,.2,0xfef3c7,-(w+3)/4,0,hd);ofBox(T,g,(w-3)/2,3.6,.2,0xfef3c7,(w+3)/4,0,hd);ofBox(T,g,3,.6,.2,0xfef3c7,0,3,hd);
  sign(T,g,[`🛒 ${tr.n.toUpperCase()}`,c.name],4,1.2,0,2.6,hd-.15,0,{bg:"#166534",w:384,h:128});
  for(let x=-hw+2;x<hw;x+=4)for(let z=-hd+2;z<hd;z+=4)W.ceil.push(ofBox(T,g,1.6,.04,.3,0xffffff,x,3.52,z,{e:0xffffff,ei:.9}));
  // checkouts: one lane per cashier, split left/right of a 3 m walkway from the door so the middle is never blocked
  const nc=Math.max(0,Math.min(12,t.st.cash|0)),zc=hd-3,lw=1.6,per=Math.max(1,Math.floor((hw-2.3)/lw)),shown=Math.min(nc,per*2);
  for(let i=0;i<shown;i++){const sd=i%2?1:-1,j=Math.floor(i/2),x=sd*(1.5+lw/2+j*lw);ofBox(T,g,.6,.9,1.6,0x334155,x,0,zc);ofBox(T,g,.5,.3,.3,0x0f172a,x,.9,zc-.4);const p=person(T,0x16a34a);p.position.set(x-.55,0,zc);p.rotation.y=Math.PI/2;g.add(p);ob(x-.35,x+.35,zc-.85,zc+.85)}
  if(!nc)sign(T,g,["No cashiers","Hire some on the PC"],2.4,.9,-3,1.6,zc,0,{bg:"#7f1d1d"});
  // floor marking for the fixture-free front strip
  ofBox(T,g,w-.4,.01,.08,0xfbbf24,0,0,hd-4.2);
  // fixtures
  for(const f of t.lay){const fg=new T.Group();fg.position.set(f.x,0,f.z);fg.rotation.y=-f.r*Math.PI/2;g.add(fg);drawFx(T,fg,f,c,t);const r=smFxR(f);ob(r.x0,r.x1,r.z0,r.z1)}
  // back-wall counters
  const bx=[-hw/2,0,hw/2],ad=[["bakery","🥖 BAKERY",0xd97706],["deli","🧀 DELI",0xbe123c],["freezer","🧊 FROZEN",0x0ea5e9]];
  ad.forEach(([k,n,col],i)=>{if(!t.add[k])return;const x=bx[i],z=-hd+.8;if(k==="freezer"){ofBox(T,g,3,1,1,0xe0f2fe,x,0,z);ofBox(T,g,3,.05,1,0x7dd3fc,x,1,z,{op:.5,e:0x38bdf8,ei:.6})}else{ofBox(T,g,3,1,1,col,x,0,z);ofBox(T,g,3,.5,1,0xffffff,x,1,z,{op:.35})
    const p=person(T,0xffffff);p.position.set(x,0,z-.9);g.add(p)}sign(T,g,[n],2.4,.6,x,2.6,-hd+.15,0,{bg:"#"+col.toString(16).padStart(6,"0")});ob(x-1.6,x+1.6,-hd,z+.6)});
  // office PC in the back-right corner
  const px=hw-1.2,pz=-hd+2.2;ofBox(T,g,1.4,.75,.8,0x6b4a33,px,0,pz);const scr=new T.Mesh(new T.PlaneGeometry(.7,.42),new T.MeshBasicMaterial({map:tex(T,["🖥 STORE PC","Manage"],{bg:"#0b1220",fg:"#38bdf8"})}));scr.position.set(px,1.05,pz+.1);g.add(scr);ofBox(T,g,.72,.44,.04,0x111827,px,.83,pz+.06);ob(px-.75,px+.75,pz-.45,pz+.45);W.pc={x:px,z:pz+1};
  for(let i=0;i<(t.st.stock|0)&&i<8;i++){const p=person(T,0xea580c);p.position.set(-hw+1+((i*3.1)%(w-2)),0,-hd+3+((i*2.3)%Math.max(1,d-8)));p.userData.wk=1;p.userData.ph=i;g.add(p)}
  for(let i=0;i<(t.st.sec|0)&&i<4;i++){const p=person(T,0x111827);p.position.set(i%2?hw-1:-hw+1,0,zc+1.2);g.add(p)}
  W.sig=sigOf(t)}
function blocked(x,z){if(Math.abs(x)>W.hw-.3||z<-W.hd+.3||z>W.hd+.5)return true;if(z>W.hd-.3&&Math.abs(x)>1.4)return true;for(const o of W.obst)if(x>o.x0-.25&&x<o.x1+.25&&z>o.z0-.25&&z<o.z1+.25)return true;return false}
function nearest(){const P=W.p;let best=null,bd=1.4;if(W.pc){const d=Math.hypot(P.x-W.pc.x,P.z-W.pc.z);if(d<1.5){best={k:"pc",n:"🖥 Use the store PC"};bd=d}}
  const t=smS(city());for(const f of t.lay)slotPts(f).forEach((ps,s)=>{for(const [lx,lz] of ps){const [x,z]=l2w(f,lx,lz),d=Math.hypot(P.x-x,P.z-z);if(d<bd){bd=d;const g=f.g[s];best={k:"slot",f:f.i,s,n:g?`🏷 ${G[g][0]}: restock or change`:`🏷 Empty ${SM_FX[f.k].n.toLowerCase()} slot: choose a good`}}}});
  if(!best&&P.z>W.hd-1)return {k:"exit",n:"🚪 Leave the store"};return best}
function use(){const n=W.near;if(!n||W.bm)return;if(n.k==="pc")smOpen(city());else if(n.k==="slot")pkOpen(n.f,n.s);else close()}
const smwOpen=()=>SMW.el&&SMW.el.style.display!=="none";
/* ---------- shelf picker ---------- */
function pkOpen(f,s){W.pk={f,s};W.keys={};pkRender()}
function pkClose(){W.pk=null;const p=W.el&&W.el.querySelector(".sm3-pk");if(p)p.classList.remove("on");if(W.el)W.el.focus()}
function pkRender(){const p=W.el&&W.el.querySelector(".sm3-pk");if(!p)return;if(!W.pk){p.classList.remove("on");return}const c=city(),t=smS(c),f=t.lay.find(o=>o.i===W.pk.f);if(!f){pkClose();return}
  const s=W.pk.s,d=SM_FX[f.k],g=f.g[s],cap=smCap(c,t),inv=S.inv[c.id]||{},mp=x=>G[x][1]*cityF(c,x)*((S.px[c.id]||{})[x]||1)*1.15,fav=smFav(c);
  let h=`<header><b>${d.ic} ${d.n}${d.sl>1?` · slot ${s+1} of ${d.sl}`:""}</b><button data-pk="x">Close (Esc)</button></header><div class="bd">`;
  if(g){const q=t.sh[g]||0,need=Math.max(0,Math.floor(cap-q));h+=`<div><b style="font-size:15px">${gname(g)}</b> · shelf ${Math.floor(q)}/${cap} · depot ${Math.floor(inv[g]||0)}</div>
    <div class="row"><button class="g" data-pk="pull"${inv[g]>0&&need>0?"":" disabled"}>📦 Fill from depot</button><button data-pk="buy"${need>0?"":" disabled"}>🛒 Buy ${need} at market ≈ ${fmtc(mp(g)*need)}</button><button data-pk="clr">Clear slot</button></div>
    <small>Sales strength here: ${Math.round(smGF(t,g)*100)}%${smGF(t,g)<.9?` <span class="w">· put it in a ${SM_COLD[g]==="f"?"fridge":"freezer chest"} for full sales</span>`:""}</small><hr style="border-color:#334155">`}
  h+=`<small>Choose what this slot sells. End-caps +15%, produce stands +10% for fruit/veg/bread, fixtures near the entrance +6%. Dairy needs a fridge, meat and burgers a freezer chest, or they sell at 60%.</small><table>`;
  const rank=x=>{const cd=SM_COLD[x];return cd?(d.cold===cd?0:2):(d.cold?2:1)};
  for(const x of SMG.slice().sort((a,b)=>rank(a)-rank(b))){const cd=SM_COLD[x],warn=cd&&d.cold!==cd,on=t.ls.includes(x);
    h+=`<tr${x===g?' class="cur"':""}><td>${gname(x)}${fav.includes(x)?" ⭐":""}${warn?` <span class="w">needs ${cd==="f"?"fridge":"freezer"}</span>`:""}${on&&x!==g?" <small>· on another shelf</small>":""}</td><td><small>depot ${Math.floor(inv[x]||0)} · ${fmtc(mp(x))}</small></td><td>${x===g?"<small>here</small>":`<button data-pk="set" data-g="${x}">Put here</button>`}</td></tr>`}
  p.innerHTML=h+`</table></div>`;p.classList.add("on")}
function pkAct(a,g){const c=city(),t=smS(c);if(!W.pk)return;const f=t.lay.find(o=>o.i===W.pk.f);if(!f)return pkClose();const cur=f.g[W.pk.s];let m="";
  if(a==="x")return pkClose();
  if(a==="set")m=smSlotSet(c,f.i,W.pk.s,g).m||`${G[g][0]} goes on this shelf`;
  else if(a==="clr")m=smSlotSet(c,f.i,W.pk.s,null).m||"Slot cleared";
  else if(a==="pull"&&cur){const n=smPull(c,t,cur);m=n?`Moved ${Math.round(n)} from your depot`:"Nothing in your depot";smSave()}
  else if(a==="buy"&&cur){const v=smBuy(c,t,cur,0);m=v<0?"Not enough cash":v?`Bought stock for ${fmtc(v)}`:"Shelf is already full";smSave()}
  if(m)toast(m);pkRender();if(W.T)build()}
/* ---------- build mode ---------- */
function bmToggle(on){if(on==null)on=!W.bm;if(on&&smwOpen())smClose();pkClose();W.bm=on?{k:null,mv:null,r:0,x:0,z:0,ok:false,hov:null}:null;W.keys={};if(W.el)W.el.classList.toggle("bm",!!on);ghost();palRender()}
function palRender(){const p=W.el&&W.el.querySelector(".sm3-pal");if(!p||!W.bm)return;const c=city(),t=smS(c),tr=SM_TIER[t.tier],full=t.lay.length>=tr.fx,b=W.bm;
  const hv=b.hov!=null&&t.lay.find(o=>o.i===b.hov);
  p.innerHTML=`<div class="r">${Object.entries(SM_FX).map(([k,d])=>`<button data-s3="fx" data-k="${k}" class="${b.k===k?"sel":""}" title="${d.tip}"${full||S.cash<smFxCost(c,k)?" disabled":""}>${d.ic} ${d.n} · ${fmt(smFxCost(c,k))}</button>`).join("")}<button data-s3="bm">✓ Done</button></div>
  <small>${t.lay.length}/${tr.fx} fixtures · ${smSlots(t)} slots${full?" · full: upgrade the store for more":""} · click floor to place · click a fixture to move it · R rotate · Del sell (${Math.round(SM_FX_REFUND*100)}% back) · Esc cancel</small>
  <small class="hv">${b.mv!=null?"Moving: click to drop, Esc to cancel":b.k?`Placing ${SM_FX[b.k].n}: ${SM_FX[b.k].tip}`:hv?`${SM_FX[hv.k].ic} ${SM_FX[hv.k].n}: ${hv.g.map(x=>x?G[x][0]:"empty").join(", ")} · sells for ${fmt(smFxCost(c,hv.k)*SM_FX_REFUND)}`:"&nbsp;"}</small>`}
function ghost(){const T=W.T;if(!T||!W.scene)return;if(!W.gh){W.gh=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.45,depthWrite:false}));W.scene.add(W.gh)}
  const b=W.bm,t=smS(city());let f=null,col=0x22c55e;
  if(b&&(b.k||b.mv!=null)){const k=b.k||((t.lay.find(o=>o.i===b.mv)||{}).k);if(!k){b.mv=null;W.gh.visible=false;return}f={i:b.mv!=null?b.mv:-1,k,x:b.x,z:b.z,r:b.r};b.ok=smFits(t,f);col=b.ok?0x22c55e:0xef4444}
  else if(b&&b.hov!=null){f=t.lay.find(o=>o.i===b.hov);col=0xfacc15}
  if(!f){W.gh.visible=false;return}const r=smFxR(f);W.gh.visible=true;W.gh.material.color.setHex(col);W.gh.scale.set(r.x1-r.x0+.04,2.3,r.z1-r.z0+.04);W.gh.position.set((r.x0+r.x1)/2,1.15,(r.z0+r.z1)/2)}
function floorAt(cx,cy){const T=W.T;if(!T||!W.cam)return null;const rc=W.ren.domElement.getBoundingClientRect(),ry=new T.Raycaster();ry.setFromCamera(new T.Vector2((cx-rc.left)/rc.width*2-1,-(cy-rc.top)/rc.height*2+1),W.cam);
  const p=new T.Vector3();return ry.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),0),p)?p:null}
function bmMove(cx,cy){const b=W.bm;if(!b)return;const p=floorAt(cx,cy);if(!p)return;b.x=Math.round(p.x*2)/2;b.z=Math.round(p.z*2)/2;
  const t=smS(city()),h=t.lay.find(f=>{const r=smFxR(f);return p.x>=r.x0&&p.x<=r.x1&&p.z>=r.z0&&p.z<=r.z1});const nh=h?h.i:null;if(nh!==b.hov){b.hov=nh;palRender()}ghost()}
function bmClick(){const b=W.bm,c=city();if(!b)return;let r=null;
  if(b.k){r=smFxAdd(c,b.k,b.x,b.z,b.r)}
  else if(b.mv!=null){r=smFxMove(c,b.mv,b.x,b.z,b.r);if(r.ok)b.mv=null}
  else if(b.hov!=null){const f=smS(c).lay.find(o=>o.i===b.hov);if(f){b.mv=f.i;b.r=f.r}}
  if(r&&r.m)toast(r.m);build();ghost();palRender()}
function bmKey(k){const b=W.bm,c=city();if(!b)return false;
  if(k==="escape"){if(b.k||b.mv!=null){b.k=null;b.mv=null;ghost();palRender()}else bmToggle(false);return true}
  if(k==="r"){if(b.k||b.mv!=null)b.r=(b.r+1)&3;else if(b.hov!=null){const f=smS(c).lay.find(o=>o.i===b.hov);if(f){const r=smFxMove(c,f.i,f.x,f.z,f.r+1);if(!r.ok)toast("No room to turn it here");build()}}ghost();return true}
  if(k==="delete"||k==="backspace"){const id=b.mv!=null?b.mv:b.hov;if(id!=null){const r=smFxSell(c,id);if(r.m)toast(r.m);b.mv=null;b.hov=null;build();ghost();palRender()}return true}
  return false}
function loop(ts){if(!W.on)return;W.raf=requestAnimationFrame(loop);const dt=Math.min(.05,(ts-(W.last||ts))/1000);W.last=ts;const P=W.p,K=W.keys;
  if(smwOpen())return;if(document.activeElement===document.body)W.el.focus();
  if(!W.pk&&!W.bm){let f=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0),tn=(K.a||K.arrowleft?1:0)-(K.d||K.arrowright?1:0);if(W.joy){f=-W.joy.y;tn=-W.joy.x}
    P.yaw+=tn*dt*2.4;const sp=(K.shift?6:3.2)*f*dt;if(sp){const nx=P.x-Math.sin(P.yaw)*sp,nz=P.z-Math.cos(P.yaw)*sp;if(!blocked(nx,P.z))P.x=nx;if(!blocked(P.x,nz))P.z=nz}
    const mv=Math.abs(f)>.05;W.walkT=mv?W.walkT+dt*10:0}else W.walkT=0;
  const sw=Math.sin(W.walkT)*.5;W.legs[0].rotation.x=sw;W.legs[1].rotation.x=-sw;W.av.position.set(P.x,0,P.z);W.av.rotation.y=P.yaw+Math.PI;
  if(W.ceil)for(const o of W.ceil)o.visible=!W.bm;if(W.bm){const m=Math.max(W.hw,W.hd);W.cam.position.set(0,m*1.55+3,W.hd+m*.75);W.cam.lookAt(0,0,-.5)}
  else{W.cam.position.set(P.x+Math.sin(P.yaw)*4.2,2.9,P.z+Math.cos(P.yaw)*4.2);W.cam.lookAt(P.x,1.1,P.z)}
  if(W.world)W.world.children.forEach(o=>{if(o.userData&&o.userData.wk){const u=ts/1000+o.userData.ph;o.position.z+=Math.sin(u*.6)*.01;const l=o.userData.legs;l[0].rotation.x=Math.sin(u*6)*.4;l[1].rotation.x=-l[0].rotation.x}});
  const n=W.bm||W.pk?null:nearest(),key=x=>x?x.k+x.f+"/"+x.s+x.n:"";if(key(n)!==key(W.near)){W.near=n;W.btn.hidden=!n;if(n)W.btn.textContent=n.n+" (E)"}
  if(ts-W.sigT>2000){W.sigT=ts;const c=city(),t=smS(c);const sb=W.el.querySelector("#sm3-sub");if(sb)sb.textContent=`${smIn(t).length}/${smSlots(t)} slots stocked · ${t.lay.length}/${SM_TIER[t.tier].fx} fixtures · ${fmt(profit(BIZ.find(x=>x.k==="smkt"),c,smLv(c)))}/hr`;if(sigOf(t)!==W.sig){build();ghost()}if(W.bm)palRender()}
  const cv=W.ren.domElement,wd=W.el.clientWidth,ht=W.el.clientHeight;if(cv.width!==Math.round(wd*W.ren.getPixelRatio())||cv.height!==Math.round(ht*W.ren.getPixelRatio())){W.ren.setSize(wd,ht,false);W.cam.aspect=wd/ht;W.cam.updateProjectionMatrix()}
  W.ren.render(W.scene,W.cam)}
function open(cid){if(W.on)return;const c=CITIES[cid];if(!c||!smLv(c))return toast("No supermarket here");css();W.on=true;W.city=cid;W.bm=null;W.pk=null;W.gh=null;document.body.classList.add("lc3-on");
  const el=W.el=document.createElement("div");el.className="sm3";el.setAttribute("role","dialog");el.setAttribute("aria-label","Supermarket in "+c.name);if(matchMedia("(pointer:coarse)").matches)el.classList.add("touch");
  el.innerHTML=`<div class="sm3-top"><div><b>🛒 SUPERMARKET · ${smEsc(c.name.toUpperCase())}</b><small id="sm3-sub"></small></div><button class="sm3-btn g" data-s3="bm">🔨 Build (B)</button><button class="sm3-btn g" data-s3="pc">🖥 Manage</button><button class="sm3-btn" data-s3="x">Exit</button></div>
  <div class="sm3-help">W/S walk · A/D or ←/→ turn · drag to turn · Shift run · E use shelf/PC · B build mode · Esc back</div><div class="sm3-joy"><i></i></div><div class="sm3-act"><button class="sm3-btn" data-s3="use" hidden></button></div><div class="sm3-pal"></div><div class="sm3-pk"></div>`;
  document.body.appendChild(el);W.btn=el.querySelector('[data-s3="use"]');W.keys={};W.near=null;const dm=SM_DIM[smS(c).tier]||SM_DIM[0];W.p={x:0,z:dm[1]/2-1.2,yaw:0};
  const joy=el.querySelector(".sm3-joy"),kn=joy.firstChild,jr=56;let jid=null;const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";W.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});const je=()=>{jid=null;W.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.tabIndex=-1;el.addEventListener("keydown",e=>{const k=e.key.toLowerCase();
    if(k==="escape"){e.preventDefault();if(W.pk)pkClose();else if(W.bm)bmKey(k);else close();return}
    if(W.bm&&bmKey(k)){e.preventDefault();return}
    if(k==="b"&&!e.ctrlKey&&!e.metaKey){bmToggle();return}
    if(W.pk)return;if(k==="e"||k==="enter"){use();return}W.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});el.addEventListener("keyup",e=>{W.keys[e.key.toLowerCase()]=0});
  // Esc while the management window is open over the 3D store closes the window first
  W.kd=e=>{if(e.key==="Escape"&&W.on&&smwOpen()){e.preventDefault();e.stopImmediatePropagation();smClose();if(W.el)W.el.focus()}};window.addEventListener("keydown",W.kd,true);
  el.addEventListener("click",e=>{const p=e.target.closest("[data-pk]");if(p&&!p.disabled){pkAct(p.dataset.pk,p.dataset.g);return}const b=e.target.closest("[data-s3]");if(!b||b.disabled)return;const a=b.dataset.s3;
    if(a==="x")close();else if(a==="pc"){pkClose();smOpen(city())}else if(a==="use")use();else if(a==="bm")bmToggle();else if(a==="fx"&&W.bm){W.bm.k=W.bm.k===b.dataset.k?null:b.dataset.k;W.bm.mv=null;ghost();palRender()}el.focus()});
  el.addEventListener("pointerdown",e=>{if(e.target.tagName!=="CANVAS")return;if(W.bm)W.mouse={x:e.clientX,y:e.clientY};else W.drag={x:e.clientX}});
  el.addEventListener("pointermove",e=>{if(W.bm){if(e.target.tagName==="CANVAS")bmMove(e.clientX,e.clientY);return}if(W.drag){W.p.yaw-=(e.clientX-W.drag.x)*.006;W.drag.x=e.clientX}});
  const de=e=>{W.drag=null;if(W.bm&&W.mouse&&e.type==="pointerup"&&Math.hypot(e.clientX-W.mouse.x,e.clientY-W.mouse.y)<6){bmMove(e.clientX,e.clientY);bmClick()}W.mouse=null};el.addEventListener("pointerup",de);el.addEventListener("pointercancel",de);
  el.addEventListener("contextmenu",e=>{if(W.bm){e.preventDefault();bmKey("escape")}});
  loadThree().then(T=>{if(!W.on||W.el!==el)return;W.T=T;let ren;try{ren=new T.WebGLRenderer({antialias:true,powerPreference:"low-power"})}catch(e){close();toast("3D isn't available on this device. Opening the store panel instead.");smOpen(c);return}
    W.ren=ren;ren.setPixelRatio(Math.min(2,devicePixelRatio||1));el.insertBefore(ren.domElement,el.firstChild);const sc=W.scene=new T.Scene();sc.background=new T.Color(0xdbeafe);W.cam=new T.PerspectiveCamera(60,1,.1,200);
    sc.add(new T.HemisphereLight(0xffffff,0x94a3b8,.9));const dl=new T.DirectionalLight(0xffffff,.5);dl.position.set(5,10,6);sc.add(dl);
    const av=W.av=person(T,0x2563eb);W.legs=av.userData.legs;sc.add(av);build();W.raf=requestAnimationFrame(loop);el.focus()}).catch(()=>{close();toast("Couldn't load the 3D store. Check your connection and try again.")})}
function close(){if(!W.on)return;W.on=false;document.body.classList.remove("lc3-on");cancelAnimationFrame(W.raf);W.raf=0;if(W.kd){window.removeEventListener("keydown",W.kd,true);W.kd=null}W.bm=null;W.pk=null;
  if(W.scene)W.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){if(m.map)m.map.dispose();m.dispose()}});
  if(W.ren){W.ren.dispose();try{W.ren.forceContextLoss()}catch(e){}}W.ren=W.scene=W.cam=W.av=W.world=W.gh=null;if(W.el)W.el.remove();W.el=null;try{save()}catch(e){}}
return {open,close};
})()
