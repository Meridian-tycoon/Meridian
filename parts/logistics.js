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
.lco-t{display:flex;gap:6px;margin-bottom:10px}.lco-t .mini{padding:7px 12px}.lco-f{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}.lco-f label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:#94a3b8}.lco-f select,.lco-f input{background:#020617;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:6px;min-width:150px;font:inherit;font-size:13px}.lc3-pan header span{display:flex;align-items:center}
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
/* small warehouse vehicles (jack, forklift, cart); the player rides them */
function veh(T,k){const g=new T.Group(),b=(w,h,d,c,x,y,z)=>ofBox(T,g,w,h,d,c,x,y,z,{r:.5,m:.3}),wh=(x,z,r)=>{const m=ofCyl(T,g,r,r,.18,0x111111,x,r-.09,z,{});m.rotation.z=Math.PI/2};
  if(k==="jack"){b(.7,.5,.9,0xf97316,0,.1,.35);b(.6,.12,.5,0x111827,0,.6,.35);b(.08,1,.08,0x111827,0,.6,.75);b(.5,.08,.08,0x111827,0,1.6,.75);for(const x of [-.2,.2])b(.16,.1,1.2,0x9ca3af,x,.05,-.6);wh(-.3,.6,.1);wh(.3,.6,.1)}
  else if(k==="fork"){b(1.1,.7,1.6,0xf59e0b,0,.25,.1);b(1.15,.45,.45,0x111827,0,.45,.75);b(.5,.5,.5,0x111827,0,.95,.2);for(const x of [-.5,.5])for(const z of [-.5,.55])b(.06,1.1,.06,0xf59e0b,x,1,z);b(1.15,.05,1.2,0x111827,0,2.1,.03);for(const x of [-.38,.38])b(.08,2.2,.1,0x6b7280,x,.1,-.8);for(const x of [-.3,.3])b(.12,.05,1,0x6b7280,x,.1,-1.3);for(const [x,z,r] of [[-.55,-.5,.28],[.55,-.5,.28],[-.5,.6,.22],[.5,.6,.22]])wh(x,z,r)}
  else{b(1.1,.4,1.8,0x0ea5e9,0,.25,0);b(1,.06,1,0xe0f2fe,0,.65,.2);b(.9,.45,.25,0x0f172a,0,.7,.65);for(const x of [-.5,.5])for(const z of [-.75,.75])b(.05,1.2,.05,0x334155,x,.65,z);b(1.15,.06,1.7,0x0ea5e9,0,1.85,0);b(.6,.5,.5,0x1e293b,0,.7,-.5);for(const [x,z] of [[-.5,-.6],[.5,-.6],[-.5,.6],[.5,.6]])wh(x,z,.22)}
  return g}
function ride(k){const L=L0();if(!L)return;L.ride=k&&L.veh.includes(k)?k:"";if(!W.av||!W.T)return;if(W.vm){W.av.remove(W.vm);W.vm=null}
  const on=!!L.ride;W.body.forEach(o=>{if(W.legs.includes(o))o.visible=!on});const y=on?{jack:.45,fork:.55,cart:.6}[L.ride]:0;W.body.forEach(o=>{if(o.userData.y0==null)o.userData.y0=o.position.y;o.position.y=o.userData.y0+(o.geometry&&o.geometry.type==="CircleGeometry"?0:y)});
  if(on){W.vm=veh(W.T,L.ride);W.vm.rotation.y=0;W.av.add(W.vm)}const b=W.el&&W.el.querySelector('[data-lc="ride"]');if(b){b.hidden=!L.veh.length;b.textContent=on?"🚶 Get off":"🚜 Ride"}}
function shopPanel(){if(W.panel){W.panel.remove();W.panel=null}const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);W.shopOn=true;fillShop()}
function fillShop(){const p=W.panel;if(!p||!W.shopOn)return;const c=CITIES[W.city],L=L0(),row=(e,n,d,st,btn)=>`<tr><td style="font-size:22px">${e}</td><td><b>${esc(n)}</b><br><small style="color:#94a3b8">${esc(d)}</small></td><td style="white-space:nowrap">${st}</td><td style="white-space:nowrap">${btn}</td></tr>`;
  const vs=Object.entries(LCVEH).map(([k,v])=>{const own=L.veh.includes(k),pr=lcShopP(c,v.p);return row(v.e,v.n,v.d,own?(L.ride===k?"<b style='color:#4ade80'>Driving</b>":"Owned"):fmt(pr),own?(L.ride===k?`<button class="mini g" data-lc="sride" data-k="">Park it</button>`:`<button class="mini" data-lc="sride" data-k="${k}" style="background:#15803d">Drive</button>`):`<button class="mini" data-lc="sbuy" data-t="veh" data-k="${k}" ${S.cash<pr?"disabled":""}>Buy</button>`)}).join("");
  const us=Object.entries(LCUPG).map(([k,u])=>{const t=L.upg[k]||0,done=t>=u.max,pr=lcShopP(c,u.p,t+1);return row(u.e,u.n+(u.max>1?` · tier ${t}/${u.max}`:""),u.d,done?"<b style='color:#4ade80'>Installed</b>":fmt(pr),done?"":`<button class="mini" data-lc="sbuy" data-t="upg" data-k="${k}" ${S.cash<pr?"disabled":""}>${t?"Upgrade":"Buy"}</button>`)}).join("");
  p.innerHTML=`<header><span>WAREHOUSE SHOP · ${esc(c.name.toUpperCase())}</span><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></header><div class="bd"><div class="sum"><div><small>Cash</small><b>${fmt(S.cash)}</b></div><div><small>Bay size</small><b>${fmtT(lcBay(c))}</b></div><div><small>Capacity</small><b>${fmtT(lcCap(c))}</b></div></div>
   <h4 style="margin:10px 0 4px;color:#cbd5e1">Vehicles</h4><table><tbody>${vs}</tbody></table><h4 style="margin:12px 0 4px;color:#cbd5e1">Warehouse upgrades</h4><table><tbody>${us}</tbody></table><small id="lc3-se" style="color:#fca5a5"></small><p style="color:#94a3b8;font-size:12px">Press R (or the Ride button) to get on or off your vehicle. Light changes show next time you walk in.</p></div>`}
function shopAct(a,b){const c=CITIES[W.city];if(a==="sbuy"){const e=lcBuy(c,b.dataset.t,b.dataset.k);if(e){const m=W.panel.querySelector("#lc3-se");if(m)m.textContent=e;return}
    if(b.dataset.t==="veh")ride(b.dataset.k);else if(b.dataset.k!=="led"){try{buildRacks(W.T)}catch(err){console.warn(err)}}toast("Bought from the warehouse shop");sub()}
  else if(a==="sride"){ride(b.dataset.k);save()}fillShop()}
/* performance (Mark: "super laggy"): the building is thousands of small static meshes, one draw call each.
   Bake every static mesh under root into one mesh per look (same material settings), so the GPU gets a few dozen draw calls instead of 1000+. */
function bake(T,root,skip){root.updateMatrixWorld(true);const B=new Map(),dead=[],inv=new T.Matrix4().copy(root.matrixWorld).invert(),nm=new T.Matrix3(),mt=new T.Matrix4();
  root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||skip.has(o))return;for(let p=o.parent;p&&p!==root;p=p.parent)if(skip.has(p))return;
    const m=o.material,c=m.color?m.color.getHex():0,e=m.emissive?m.emissive.getHex():0,k=[m.type,c,m.roughness,m.metalness,e,m.emissiveIntensity,m.transparent,m.opacity,m.flatShading,m.side,m.map?m.map.uuid:""].join("|");
    let b=B.get(k);if(!b)B.set(k,b={m,p:[],n:[],u:[]});let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();mt.multiplyMatrices(inv,o.matrixWorld);g.applyMatrix4(mt);
    const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;b.p.push(P.array);b.n.push(N?N.array:new Float32Array(P.count*3));b.u.push(U?U.array:new Float32Array(P.count*2));if(o.geometry!==g)g.dispose();dead.push(o)});
  for(const o of dead){o.parent.remove(o);o.geometry.dispose()}
  const cat=a=>{let n=0;for(const x of a)n+=x.length;const r=new Float32Array(n);let i=0;for(const x of a){r.set(x,i);i+=x.length}return r};
  for(const b of B.values()){const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(cat(b.p),3));g.setAttribute("normal",new T.BufferAttribute(cat(b.n),3));g.setAttribute("uv",new T.BufferAttribute(cat(b.u),2));g.computeBoundingSphere();const m=new T.Mesh(g,b.m);m.frustumCulled=false;root.add(m)}}
/* orders panel (central computer): request goods from another center and track every order in or out of this one */
function ordPanel(){panel(false);const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);W.ordOn=true;W.of=W.of||{};fillOrd()}
function fillOrd(){const p=W.panel;if(!p||!W.ordOn)return;const c=CITIES[W.city],F=W.of;F.dir=F.dir==="out"?"out":"in";const out=F.dir==="out";
  /* in: pull from another center into this one. out (Mark): send from this center to any of your other warehouses or centers */
  const others=out?CITIES.filter(x=>x!==c&&(hasWh(x)||LCO(x.id))):Object.keys(S.lc||{}).map(id=>CITIES[id]).filter(x=>x&&x!==c&&LCO(x.id));
  if(!others.includes(CITIES[F.src]))F.src=others[0]?others[0].id:null;const oc=CITIES[F.src],sc=out?c:oc,dc=out?oc:c,Ls=sc&&LCO(sc.id);
  const goods=Ls?Ls.ord.filter(g=>Ls.inv[g]>0):[];if(!goods.includes(F.g))F.g=goods[0]||null;const vs=sc&&dc?lcoVehicles(sc,dc):[];if(!vs.some(v=>v.id===+F.v))F.v=vs[0]?vs[0].id:null;
  const opt=(v,t,sel)=>`<option value="${esc(String(v))}" ${sel?"selected":""}>${esc(t)}</option>`;
  const tog=`<div class="lco-t"><button class="mini${out?" g":""}" data-lc="lcodir" data-k="in">⬇ Request into ${esc(c.name)}</button><button class="mini${out?"":" g"}" data-lc="lcodir" data-k="out">⬆ Send from this warehouse</button></div>`;
  let form;if(!others.length)form=`<p style="color:#94a3b8">${out?"You have no other warehouse or logistics center to send to.":"Open a logistics center in another city to order goods from it."}</p>`;
  else form=`<div class="lco-f"><label>${out?"To":"From"}<select id="lco-src">${others.map(x=>opt(x.id,out?`${x.name} · ${LCO(x.id)?"logistics center":"warehouse"}`:`${x.name} · ${fmtT(lcUsed(x))} stored`,x.id===F.src)).join("")}</select></label>
   <label>Product<select id="lco-g">${goods.length?goods.map(g=>opt(g,`${G[g][0]} · ${gq(Ls.inv[g])} ${out?"here":"there"}`,g===F.g)).join(""):opt("",out?"Nothing stored here":"Nothing stored there",1)}</select></label>
   <label>Amount<input id="lco-q" type="number" min="0" step="any" value="${F.g&&Ls?(F.q||Math.round(Ls.inv[F.g]*100)/100):""}"></label>
   <label>Vehicle<select id="lco-v">${vs.length?vs.map(v=>opt(v.id,`${VEH[v.type].n} #${v.id} · ${gq(capV(v,F.g||"steel"))} per trip`,v.id===+F.v)).join(""):opt("",`No idle truck or plane parked in ${sc.name}`,1)}</select></label>
   <button class="mini" data-lc="lcogo" style="background:#15803d;padding:8px 14px" ${goods.length&&vs.length?"":"disabled"}>${out?"Send":"Request"}</button></div><small id="lco-e" style="color:#fca5a5"></small>
   <p style="color:#94a3b8;font-size:12px;margin:6px 0 0">${out?`Uses a vehicle parked here in ${esc(c.name)}. Goods unload into the logistics center there, or its warehouse if it has none.`:"You can order more than is stored: the vehicle waits at the source until a full load is ready."} It shuttles until the order is filled, then drives home to ${esc(sc.name)} depot. Fuel is paid per trip. Trucks need both cities on the same continent; planes go anywhere.</p>`;
  form=tog+form;
  const mine=lcoList().filter(o=>o.to===c.id||o.from===c.id),ST={run:"Running",done:"Filled",short:"Source ran out",cancel:"Cancelled"};
  const rows=mine.map(o=>{const v=(S.fleet||[]).find(x=>x.id===o.v),pct=Math.min(100,o.done/o.q*100),inb=o.to===c.id,where=!v?"vehicle gone":v.arr?(v.cargo?`loaded, ${fmtDur(v.arr-Date.now())} to ${CITIES[v.dest].name}`:`empty, ${fmtDur(v.arr-Date.now())} to ${CITIES[v.dest].name}`):v.lco===o.id?`parked in ${CITIES[v.city].name}`:"home";
    return `<tr><td>#${o.id}</td><td>${inb?"⬇ from "+esc(CITIES[o.from].name):"⬆ to "+esc(CITIES[o.to].name)}</td><td class="n">${esc(G[o.g][0])}</td><td style="min-width:120px"><div style="background:#1e293b;border-radius:4px;height:8px"><i style="display:block;height:8px;border-radius:4px;width:${pct}%;background:${o.st==="run"?"#22c55e":"#64748b"}"></i></div><small>${gq(Math.min(o.done,o.q))} / ${gq(o.q)} · ${o.trips} trip${o.trips===1?"":"s"}</small></td><td>${v?esc(VEH[v.type].n)+" #"+v.id:"—"}<br><small style="color:#94a3b8">${esc(where)}</small></td><td><b style="color:${o.st==="run"?(o.why?"#fbbf24":"#4ade80"):"#94a3b8"}">${o.why&&o.st==="run"?esc(o.why):ST[o.st]}</b></td><td>${o.st==="run"?`<button class="mini g" data-lc="lcox" data-k="${o.id}">Cancel</button>`:""}</td></tr>`}).join("");
  const oh=`<header><span>ORDERS · ${esc(c.name.toUpperCase())}</span><span><button class="lc3-btn g" data-lc="pc" style="padding:5px 10px;margin-right:6px">🖥 Inventory</button><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></span></header><div class="bd">
   ${form}
   <h4 style="margin:14px 0 6px;color:#cbd5e1">Orders in and out of ${esc(c.name)}</h4>${rows?`<table><thead><tr><th>#</th><th>Route</th><th>Product</th><th>Progress</th><th>Vehicle</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<p style="color:#94a3b8">No orders yet.</p>`}</div>`;
  if(oh===p._h)return;const bd=p.querySelector(".bd"),y=bd?bd.scrollTop:0;p._h=oh;p.innerHTML=oh;const b2=p.querySelector(".bd");if(b2)b2.scrollTop=y}
function ordAct(a,b){const c=CITIES[W.city],P=W.panel;if(a==="lcodir"){W.of.dir=b.dataset.k;W.of.src=null;W.of.q=0}else if(a==="lcogo"){const out=W.of.dir==="out",e=out?lcoNew(CITIES[W.of.src],W.city,P.querySelector("#lco-g").value,P.querySelector("#lco-q").value,P.querySelector("#lco-v").value):lcoNew(c,W.of.src,P.querySelector("#lco-g").value,P.querySelector("#lco-q").value,P.querySelector("#lco-v").value);if(e){P.querySelector("#lco-e").textContent=e;return}W.of.q=0;toast("Order placed")}
  else if(a==="lcox")lcoCancel(+b.dataset.k);if(P)P._h=null;fillOrd()}
/* ---------- warehouse life (Mark, 2026-11-05): workers, forklifts, trucks at the docks, sound, live racks, day and night, forklift jobs ---------- */
const NIGHT=[21,6];
function localHour(){const c=CITIES[W.city],d=new Date();return ((d.getUTCHours()+d.getUTCMinutes()/60+c.lon/15)%24+24)%24}
const isNight=()=>{const h=localHour();return h>=NIGHT[0]||h<NIGHT[1]};
function rackSig(){const c=CITIES[W.city],L=L0(),B=lcBay(c)/4;return L.lv+"|"+L.ord.map(g=>g+":"+Math.ceil(L.inv[g]*tpu(g)/B)+":"+(L.pin[g]??"")).join(",")}
/* a spot workers can walk to: inside the building, not inside a rack, desk or crate */
function freeSpot(){for(let i=0;i<40;i++){const x=(Math.random()*2-1)*(HW-2),z=zBack()+2+Math.random()*(zEnd()-zBack()-5);if(!blocked(x,z))return {x,z}}return {x:0,z:zEnd()-6}}
const laneX=x=>{let best=null;for(let b=0;b<W.nb;b++)for(const s of [-1,1]){const lx=blkX(b)+s*(BAYS*BW/2+1.7);if(best==null||Math.abs(lx-x)<Math.abs(best-x))best=lx}return best};
function route(w){const t=freeSpot(),lx=laneX(w.x);w.path=Math.abs(t.z-w.z)>2?[{x:lx,z:w.z},{x:lx,z:t.z},t]:[t];w.wait=0}
/* keep the people on the floor in step with the payroll: up to 16 shown (a third on forklifts, max 4), plus the manager */
const lcLite=()=>matchMedia("(pointer:coarse)").matches||(navigator.deviceMemory||8)<=4;
function crew(){const T=W.T,sc=W.scene,L=L0();if(!T||!sc||!W.wk)return;const n=Math.min(lcLite()?6:16,L.staff||0),nf=Math.min(4,Math.floor(n/3)),nr=Math.min(lcLite()?2:6,((L.upg||{}).robo||0)*2);
  const drop=g=>{sc.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose()})},of=f=>W.wk.filter(f),trim=(f,k)=>{const h=of(f);while(h.length>k){const w=h.pop();drop(w.g);W.wk.splice(W.wk.indexOf(w),1)}};
  trim(w=>!w.rb,n);trim(w=>w.rb,nr);
  while(of(w=>w.rb).length<nr){const g=new T.Group();ofBox(T,g,.8,.45,.8,0x94a3b8,0,.08,0,{r:.4,m:.6});ofBox(T,g,.14,1,.14,0x334155,0,.53,0,{});ofBox(T,g,.5,.08,.5,0x475569,0,1.5,-.1,{});ofBox(T,g,.34,.12,.34,0x22d3ee,0,.53,0,{e:0x22d3ee});const s=freeSpot();g.position.set(s.x,0,s.z);sc.add(g);const w={g,legs:null,fork:false,rb:true,x:s.x,z:s.z,sp:2.6,ph:0,beep:0};route(w);W.wk.push(w)}
  // overhead conveyor over the centre aisle, boxes ride along it
  if((L.upg||{}).conv&&!W.conv){const g=new T.Group(),z0=zBack()+2,z1=zEnd()-4,len=z1-z0;ofBox(T,g,1.1,.18,len,0x1f2937,0,8.4,z0+len/2,{});for(const x of[-.6,.6])ofBox(T,g,.08,.3,len,0xfacc15,x,8.35,z0+len/2,{});const bx=[];for(let i=0;i<10;i++){const b=new T.Group();ofBox(T,b,.8,.7,.8,0xd6a35c,0,0,0,{r:.85});b.position.set(0,8.58,z0+i*len/10);g.add(b);bx.push(b)}sc.add(g);W.conv={g,bx,z0,len}}
  while(of(w=>!w.rb).length<n){const fork=of(w=>w.fork).length<nf,g=new T.Group(),p=person(T,fork?0x334155:0xea580c);g.add(p);let legs=p.userData.legs;
    if(fork){const v=veh(T,"fork");g.add(v);p.position.y=.55;legs.forEach(l=>l.visible=false);legs=null}
    const s=freeSpot();g.position.set(s.x,0,s.z);sc.add(g);const w={g,legs,fork,x:s.x,z:s.z,sp:fork?3.2:1.5+Math.random()*.4,ph:Math.random()*6,beep:0};route(w);W.wk.push(w)}
  // the manager waits by the reception office door
  if(L.mgr&&!W.mgrM){const m=person(T,0x1e3a8a);m.position.set(W.mgrP.x,0,W.mgrP.z);m.rotation.y=-Math.PI/2;sc.add(m);W.mgrM=m}else if(!L.mgr&&W.mgrM){drop(W.mgrM);W.mgrM=null}}
function life(T,sc){const c=CITIES[W.city],L=L0();W.wk=[];W.sig=rackSig();W.tk=null;W.tkT=performance.now()+4000;W.nk=isNight()?1:0;
  W.mgrP={x:HW-7.5,z:zEnd()-11.5};W.mgrM=null;W.conv=null;crew();
  sign(T,W.room,["STAFF OFFICE",L.mgr?"Manager on duty":"Hire a manager here"],2.2,.6,HW-7.6,2.6,zEnd()-12.6,0,{bg:"#1e3a8a",fg:"#fff",w:512,h:150});
  // job board on the right wall by the docks
  W.jobP={x:HW-1.4,z:zEnd()-10.5};sign(T,W.room,["📋 FORKLIFT JOBS","Press E for a job · pallets ship for real"],2.6,1.1,HW-.3,2.2,zEnd()-10.5,-Math.PI/2,{bg:"#facc15",fg:"#111",w:640,h:240,fs:44});
  // delivery truck that backs into the docks
  const tk=mkTruck(T);
  tk.visible=false;sc.add(tk);W.tk={g:tk,st:"idle",dock:0,t:0};lifeLights(true)}
function mkTruck(T){
  const tk=new T.Group(),b=(w,h,d,col,x,y,z)=>ofBox(T,tk,w,h,d,col,x,y,z,{r:.6,m:.2});b(2.5,2.7,12,0xf8fafc,0,1.2,6.2);b(2.5,.25,12,0x334155,0,.95,6.2);b(2.4,2.4,2.6,[0xb91c1c,0x1d4ed8,0x15803d][Math.floor(Math.random()*3)],0,.9,13.9);b(2.2,.9,.1,0x0f172a,0,2.2,15.25);
  for(const z of [1.5,2.8,13.2,14.6])for(const x of [-1.05,1.05]){const wh=ofCyl(T,tk,.48,.48,.35,0x111111,x,.48-.175,z,{});wh.rotation.z=Math.PI/2}
  return tk}
/* smooth day/night: k=1 at night */
function lifeLights(snap,dt){const k=W.nk=snap?(isNight()?1:0):W.nk+((isNight()?1:0)-W.nk)*Math.min(1,(dt||.016)*.8);if(W.hemi)W.hemi.intensity=W.hemi.userData.i0*(1-.55*k);if(W.dl)W.dl.intensity=W.dl.userData.i0*(1-.8*k);
  const bg=new W.T.Color(0x2a2f36).lerp(new W.T.Color(0x0b1020),k);if(W.scene){W.scene.background=bg;if(W.scene.fog)W.scene.fog.color=bg}if(W.skyM)W.skyM.color.set(0xe0f2fe).lerp(new W.T.Color(0x111827),k)}
function lifeStep(dt,t){if(!W.wk)return;const P=W.p,night=isNight();if(W.conv)for(const b of W.conv.bx){b.position.z+=dt*1.6;if(b.position.z>W.conv.z0+W.conv.len)b.position.z-=W.conv.len}
  W.wk.forEach((w,i)=>{w.g.visible=!night||i%2===0;if(!w.g.visible)return;
    if(w.wait>0){w.wait-=dt;if(w.legs){w.legs[0].rotation.x=0;w.legs[1].rotation.x=0}if(w.wait<=0&&w.fork&&w.fx!=null){w.back=1.2;w.beep=0}return}
    // forklift backs out of a stop before driving on; the alarm only sounds while it reverses
    if(w.back>0){w.back-=dt;const st=1.2*dt;w.x-=w.fx*st;w.z-=w.fz*st;w.g.position.set(w.x,0,w.z);if((w.beep-=dt)<0){w.beep=.5;const dd=Math.hypot(w.x-P.x,w.z-P.z);if(dd<14)snd("beep",1-dd/14)}if(w.back<=0)route(w);return}
    const p=w.path[0];if(!p){route(w);return}const dx=p.x-w.x,dz=p.z-w.z,d=Math.hypot(dx,dz);
    if(d<.15){w.path.shift();if(!w.path.length){w.wait=2+Math.random()*5;}return}
    const st=Math.min(d,w.sp*dt);w.x+=dx/d*st;w.z+=dz/d*st;w.g.position.set(w.x,0,w.z);w.g.rotation.y=Math.atan2(-dx,-dz);w.fx=dx/d;w.fz=dz/d;
    if(w.legs){w.ph+=dt*9;const sw=Math.sin(w.ph)*.5;w.legs[0].rotation.x=sw;w.legs[1].rotation.x=-sw}});
  // truck cycle: idle → reversing in → docked (door up) → pulling out
  const K=W.tk;if(K){const z1=zEnd(),door=W.doors&&W.doors[K.dock],now=performance.now();
    if(K.st==="idle"&&now>W.tkT&&!(L0().ship||[]).length){K.dock=W.jobDock!=null?W.jobDock:Math.floor(Math.random()*3);W.jobDock=null;K.st="in";K.z=z1+40;K.g.visible=true}
    if(K.st==="in"){K.z=Math.max(z1+.25,K.z-dt*5);if((K.bp=(K.bp||0)-dt)<0){K.bp=.6;const dd=Math.hypot(-7.5+K.dock*7.5-P.x,K.z-P.z);if(dd<30)snd("rev",.9*(1-dd/30))}if(K.z<=z1+.25){K.st="dock";K.t=now+15000}}
    else if(K.st==="dock"){if(now>K.t||(L0().ship||[]).length)K.st="out"}
    else if(K.st==="out"){K.z+=dt*6;if(K.z>z1+42){K.st="idle";K.g.visible=false;W.tkT=now+12000+Math.random()*20000}}
    if(K.st!=="idle"){K.g.position.set(-7.5+K.dock*7.5,0,K.z);const open=K.st==="dock"?1:K.st==="in"?Math.max(0,1-(K.z-z1)/12):Math.max(0,1-(K.z-z1)/6);
      if(door){door.scale.y=1-.85*open;door.position.y=3.3+4.2*.425*open}}
    W.doors&&W.doors.forEach((d,i)=>{if(K.st==="idle"||i!==K.dock){d.scale.y=1;d.position.y=3.3}})}
  if(W.job){const J=W.job,tg=J.st==="pick"?{x:bayX(J.bay,J.row),z:rowZ(J.row)+RACKD/2+1.3}:{x:-7.5+J.dock*7.5,z:zEnd()-2.2};W.beacon.visible=true;W.beacon.position.set(tg.x,J.st==="pick"?RACKH+1.4:3.2,tg.z);W.beacon.rotation.y+=dt*2;J.tg=tg}
  thiefStep(dt,night);shipStep();lifeLights(false,dt)}
/* contract trucks: a forklift brings each pallet from its bay down the aisle to the dock and drives it into the truck.
   Everything is worked out from the shipment's clock, so it matches the timer even if you walk in halfway through. */
function shipStep(){const L=L0(),T=W.T;if(!L||!T||!W.scene)return;const n=Date.now(),z1=zEnd(),live=(L.ship||[]).filter(x=>x.st!=="road"||n<x.dep+20000);W.sv=W.sv||{};
  for(const k in W.sv)if(!live.some(x=>String(x.id)===k)){const v=W.sv[k];W.scene.remove(v.g);W.scene.remove(v.tk);delete W.sv[k];const d=W.doors&&W.doors[v.dock];if(d){d.scale.y=1;d.position.y=3.3}}
  for(const x of live){let v=W.sv[x.id];if(!v){const g=new T.Group(),p=person(T,0x0f766e);g.add(veh(T,"fork"));p.position.y=.55;p.userData.legs.forEach(l=>l.visible=false);g.add(p);
      const pl=new T.Group();ofBox(T,pl,1.2,.144,1,0xb9894f,0,0,0,{r:.9});ofBox(T,pl,1.1,.9,.95,gcol(x.g,0),0,.144,0,{r:.85});pl.position.set(0,.35,-1.6);g.add(pl);
      const tk=mkTruck(T),load=new T.Group();tk.add(load);W.scene.add(g);W.scene.add(tk);v=W.sv[x.id]={g,pl,tk,load,dock:x.dock,shown:0}}
    const dx=-7.5+x.dock*7.5,d=W.doors&&W.doors[x.dock];
    // truck: parked at the dock until you press Deliver, then pulls away
    const out=x.st==="road"?Math.max(0,n-x.dep)/1000:0;v.tk.position.set(dx,0,z1+.25+out*out*1.5);v.tk.visible=out<20;
    if(d){const o=out>0?Math.max(0,1-out/3):1;d.scale.y=1-.85*o;d.position.y=3.3+4.2*.425*o}
    while(v.shown<x.lp){const k=v.shown++,b=new T.Group();ofBox(T,b,1.1,1,.95,gcol(x.g,0),0,0,0,{r:.85});b.position.set((k%2?.6:-.6),1.2,2+Math.floor(k/2)*1.2);v.load.add(b)}
    // forklift: parks by the dock when loaded or waiting for stock
    if(x.st!=="load"||x.wt){v.g.visible=x.st==="load";v.g.position.set(dx+2.2,0,z1-3);v.pl.visible=false;continue}v.g.visible=true;
    const f=Math.min(1,Math.max(0,(n-x.pt)/x.pal));
    const A={x:bayX(x.bay,x.row),z:rowZ(x.row)+RACKD/2+1.3},lx=laneX(A.x),P=[A,{x:lx,z:A.z},{x:lx,z:z1-5},{x:dx,z:z1-3},{x:dx,z:z1+1.5}];
    // 0-.35 drive back to the rack (reverse path), .35-.45 lift, .45-.9 drive out to the truck, .9-1 set it down
    let path,t,carry;if(f<.35){path=P.slice().reverse();t=f/.35;carry=false}else if(f<.45){path=[A];t=0;carry=true}else{path=P;t=Math.min(1,(f-.45)/.45);carry=f<.9}
    const seg=[];let tot=0;for(let j=1;j<path.length;j++){const l=Math.hypot(path[j].x-path[j-1].x,path[j].z-path[j-1].z);seg.push(l);tot+=l}
    let r=t*tot,j=0;while(j<seg.length&&r>seg[j]){r-=seg[j];j++}const p0=path[Math.min(j,path.length-1)],p1=path[Math.min(j+1,path.length-1)],u=seg[j]?r/seg[j]:0;
    const px_=p0.x+(p1.x-p0.x)*u,pz=p0.z+(p1.z-p0.z)*u;v.g.position.set(px_,0,pz);if(Math.hypot(p1.x-p0.x,p1.z-p0.z)>.01)v.g.rotation.y=Math.atan2(-(p1.x-p0.x),-(p1.z-p0.z));
    v.pl.visible=carry;v.pl.position.y=f>=.35&&f<.45?.35+(1-(f-.35)/.1)*1.2:.35;}}
/* night break-in you can stop (extremely rare, Mark 2026-11-07): about once per 2 hours of night spent inside, never with guards */
function thiefStep(dt,night){const L=L0(),c=CITIES[W.city];if(!L||!W.T)return;const sec=(L.upg||{}).sec||0;
  if(!W.th){if(!night||sec>=2||devGod()||L.alarm===S.day||Math.random()>dt/7200)return;const it=lcLayout(c).items.filter(x=>x.row<Math.min(W.rows,RPB)&&L.inv[x.g]>0&&G[x.g][2]!=="gov")[0];if(!it)return;
    const g=person(W.T,0x111111),x=bayX(it.bay,it.row),z=rowZ(it.row)+RACKD/2+.8;g.position.set(x,0,z);W.scene.add(g);W.th={g,x,z,gd:it.g,t:25};snd("rev",1);toast("🚨 Someone broke in! Find the thief by the racks and press E to sound the alarm");return}
  const H=W.th;H.t-=dt;H.g.rotation.y+=dt*.6;if(H.t>0)return;thiefEnd(false)}
function thiefEnd(caught){const H=W.th,L=L0(),c=CITIES[W.city];if(!H)return;W.th=null;W.scene&&W.scene.remove(H.g);H.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});
  if(caught){L.alarm=S.day;lcLog(c,"Break-in stopped: you sounded the alarm and the thief ran off empty-handed");snd("ok",1);toast("✅ Alarm! The thief ran off with nothing. No more break-ins tonight")}
  else if(L.inv[H.gd]>0){const q=L.inv[H.gd]*.02*(((L.upg||{}).sec)?.5:1),v=q*px(c,H.gd);lcSub(c,H.gd,q);lcRep(L).th+=v;lcLog(c,`Break-in: thief got away with ${gq(q)} ${G[H.gd][0]} (${fmt(v)})`);toast(`🚨 The thief got away with ${gq(q)} ${G[H.gd][0]}`)}save();sub()}
/* sound: synthesized with WebAudio, no files. Hum + forklift beeps + truck reversing alarm. Mute is remembered. */
function sndInit(){if(W.au)return;let m=false;try{m=localStorage.getItem("lc3-mute")==="1"}catch(e){}W.mute=m;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const ctx=new A(),out=ctx.createGain();out.gain.value=m?0:.6;out.connect(ctx.destination);
  const len=ctx.sampleRate*2,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3}
  const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;const lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=220;const hg=ctx.createGain();hg.gain.value=.25;src.connect(lp);lp.connect(hg);hg.connect(out);src.start();W.au={ctx,out}}catch(e){W.au=null}}
function snd(k,v){const A=W.au;if(!A||W.mute||document.hidden)return;try{const c=A.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type="square";o.frequency.value=k==="rev"?1150:k==="ok"?880:1600;
  const L=k==="rev"?.35:k==="ok"?.25:.09;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*v,t+.01);g.gain.setValueAtTime(.05*v,t+L);g.gain.linearRampToValueAtTime(0,t+L+.02);o.connect(g);g.connect(A.out);o.start(t);o.stop(t+L+.05);
  if(k==="beep"){const o2=c.createOscillator(),g2=c.createGain();o2.type="square";o2.frequency.value=1600;g2.gain.setValueAtTime(0,t+.18);g2.gain.linearRampToValueAtTime(.05*v,t+.19);g2.gain.linearRampToValueAtTime(0,t+.29);o2.connect(g2);g2.connect(A.out);o2.start(t+.18);o2.stop(t+.35)}}catch(e){}}
function sndToggle(){W.mute=!W.mute;try{localStorage.setItem("lc3-mute",W.mute?"1":"0")}catch(e){}if(W.au)W.au.out.gain.value=W.mute?0:.6;const b=W.el&&W.el.querySelector('[data-lc="snd"]');if(b)b.textContent=W.mute?"🔇":"🔊"}
/* forklift jobs: take one at the board, pick the pallet at the marked bay, drop it at the marked dock */
function jobTake(){const L=L0();if(W.job)return toast("You already have a job: follow the green marker");if(!L.ride)return toast("Get on a forklift or pallet jack first (R). Buy one at the shop.");
  const c=CITIES[W.city],rows=Math.min(W.rows,RPB),its=lcLayout(c).items.filter(x=>x.row<rows&&L.inv[x.g]>0&&!noSell(x.g)&&(G[x.g][2]!=="gov"||govOK(c))),it=its[Math.floor(Math.random()*its.length)];
  W.job=it?{row:it.row,bay:it.bay,g:it.g,dock:Math.floor(Math.random()*3),st:"pick"}:{row:Math.floor(Math.random()*rows),bay:Math.floor(Math.random()*BAYS),dock:Math.floor(Math.random()*3),st:"pick"};snd("ok",1);toast(`Job: pick a pallet${it?" of "+G[it.g][0]:""} at Row ${lcRowName(W.job.row)} bay ${W.job.bay+1}, drop it at Dock ${W.job.dock+1}${it?". It ships and sells at the local price":""}${lcJobN(L)>=3?`. Pay is lower after 3 jobs a day (${fmt(lcJobPay(c))})`:""}`)}
function jobPick(){const L=L0();if(!L.ride)return toast("You need a vehicle to lift the pallet (R)");const T=W.T,p=new T.Group();ofBox(T,p,1.2,.144,1,0xb9894f,0,0,0,{r:.9});ofBox(T,p,1.1,1,.95,0xd6a35c,0,.144,0,{r:.85});p.position.set(0,.35,-1.6);W.av.add(p);W.carry=p;W.job.st="carry";snd("ok",1);toast(`Pallet loaded. Take it to Dock ${W.job.dock+1}`)}
function jobDrop(){const c=CITIES[W.city];if(W.carry){W.av.remove(W.carry);W.carry.traverse(o=>{if(o.geometry)o.geometry.dispose()});W.carry=null}const jg=W.job.g;W.jobDock=W.job.dock;W.job=null;W.beacon.visible=false;const p=lcJobDone(c,jg);snd("ok",1);setTimeout(()=>snd("ok",1),150);toast(`✅ Job done: +${fmt(p)}`);sub()}
/* staff office panel: hire and fire, wages, effects */
function staffPanel(){panel(false);const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);W.stOn=true;fillStaff()}
function sellPanel(){panel(false);const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);W.slOn=true;fillSell()}
function fillSell(){const p=W.panel;if(!p||!W.slOn)return;const c=CITIES[W.city],L=L0(),gs=L.ord.filter(g=>L.inv[g]>0);let tot=0;
  const rows=gs.map(g=>{const ok=!noSell(g)&&(G[g][2]!=="gov"||govOK(c)),u=px(c,g),m=((S.px[c.id]||{})[g]||1);tot+=ok?L.inv[g]*u:0;const sp=LCSPOIL[g]&&!(L.upg||{}).cold?` <small style="color:#fca5a5">spoils ${LCSPOIL[g]*100}%/day</small>`:"";
    return `<tr><td><b>${esc(G[g][0])}</b>${sp}<br><small style="color:#94a3b8">${gq(L.inv[g])} stored</small></td><td>${fmt(u)}<br><small style="color:${m>=1?"#86efac":"#fca5a5"}">${m>=1?"▲":"▼"} ${Math.round((m-1)*100)}% vs normal</small></td><td style="white-space:nowrap">${ok?`<button class="mini" data-lc="lsell" data-g="${g}" data-f=".25">Sell 25%</button> <button class="mini" data-lc="lsell" data-g="${g}" data-f="1" style="background:#15803d">Sell all</button>`:`<small style="color:#94a3b8">Can't be sold here</small>`}</td></tr>`}).join("");
  p.innerHTML=`<header><span>MARKET SALES · ${esc(c.name.toUpperCase())}</span><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></header><div class="bd">
   <div class="sum"><div><small>Products</small><b>${gs.length}</b></div><div><small>Worth at today's prices</small><b>${fmt(tot)}</b></div><div><small>Cold storage</small><b>${(L.upg||{}).cold?"Yes":"No"}</b></div><div><small>Security</small><b>${["None","CCTV","Guards"][(L.upg||{}).sec||0]}</b></div></div>
   <p style="color:#94a3b8;font-size:12px;margin:0 0 8px">Sells to the ${esc(c.name)} market at the live price. Big sales push the price down, so selling in parts can pay more.</p>
   ${gs.length?`<table><tbody>${rows}</tbody></table>`:`<p style="color:#94a3b8">Nothing stored here yet.</p>`}<small id="lsl-e" style="color:#86efac"></small></div>`}
/* Stats app (Mark, 2026-11-08): last 14 game days per center: income, losses, wages, net, with a bar per day, plus what the staff and machines add */
function ocStats(ids){const inc=R=>(R.sold||0)+(R.ship||0)+(R.job||0),los=R=>(R.sp||0)+(R.th||0),net=R=>inc(R)-los(R)-(R.wg||0);
  return ids.map(id=>{const c=CITIES[id],L=LCO(id),H=(L.hist||[]).slice(-14),U=L.upg||{};let ti=0,tl=0,tw=0;for(const R of H){ti+=inc(R);tl+=los(R);tw+=R.wg||0}
    const mx=Math.max(1,...H.map(R=>Math.abs(net(R)))),kv=(a,b,col)=>`<div class="ocd-kv"><span>${a}</span><b style="color:${col||"#e2e8f0"}">${b}</b></div>`;
    const bars=H.length?`<div style="display:flex;align-items:center;gap:3px;height:70px;margin:6px 0">${H.map(R=>{const v=net(R),h=Math.max(2,Math.round(Math.abs(v)/mx*32));return `<div title="Day ${R.d}: ${fmt(v)}" style="flex:1;display:flex;flex-direction:column;justify-content:center;height:70px"><div style="height:${v>=0?h:0}px;background:#22c55e;border-radius:2px 2px 0 0;margin-top:auto"></div><div style="height:${v<0?h:0}px;background:#ef4444;border-radius:0 0 2px 2px;margin-bottom:auto"></div></div>`}).join("")}</div><small style="color:#94a3b8">Net per day, oldest to newest. Hover a bar for the amount.</small>`:`<small style="color:#94a3b8">Stats start after the first full game day.</small>`;
    return `<div class="ocd-w" style="margin:8px 0"><h4>${esc(c.name)}${String(id)===String(W.city)?" (here)":""} · last ${H.length} day${H.length===1?"":"s"}</h4>${bars}
     ${kv("Income (sales, contracts, jobs)",fmt(ti),"#86efac")}${kv("Spoiled and stolen",tl?"-"+fmt(tl):fmt(0),tl?"#fca5a5":0)}${kv("Wages",tw?"-"+fmt(tw):fmt(0),tw?"#fca5a5":0)}${kv("Net",fmt(ti-tl-tw),ti-tl-tw<0?"#fca5a5":"#86efac")}
     <div style="border-top:1px solid #334155;margin-top:6px;padding-top:6px">${kv("Orders faster by",Math.round(lcSpeed(c)*100)+"%")}${kv("Crew",`${L.staff||0} worker${L.staff===1?"":"s"}${L.mgr?" + manager":""}${L.lead>=0?" · lead "+esc(L.wn[L.lead]):""}`)}${kv("Crew tiredness",Math.round(L.fat||0)+"%",(L.fat||0)>60?"#fbbf24":0)}${kv("Machines",[U.conv?"conveyors":"",U.robo?U.robo*2+" robots":""].filter(Boolean).join(", ")||"none")}</div></div>`}).join("")||`<p style="color:#94a3b8">No logistics centers yet.</p>`}
function fillStaff(){const p=W.panel;if(!p||!W.stOn)return;const c=CITIES[W.city],L=L0(),pr=PRICE[c.size],mx=lcMaxStaff(c);
  p.innerHTML=`<header><span>STAFF OFFICE · ${esc(c.name.toUpperCase())}</span><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></header><div class="bd">
   <div class="sum"><div><small>Workers</small><b>${L.staff||0} / ${mx}</b></div><div><small>Manager</small><b>${L.mgr?"Hired":"None"}</b></div><div><small>Wages</small><b>${fmt(lcWageC(c))}/hr</b></div><div><small>Orders faster by</small><b>${Math.round(lcSpeed(c)*100)}%</b></div></div>
   <table><tbody><tr><td style="font-size:22px">👷</td><td><b>Warehouse workers</b><br><small style="color:#94a3b8">$${LCW.wkMin}-$${LCW.wkMax}/hr each by experience (+$1 every ${LCW.xpDays} days; − Let go lets the newest go). Each one makes center orders turn around 0.6% (Rookie) to 1.4% (Veteran) faster. You see them at work; half work the night shift.</small></td><td style="white-space:nowrap"><button class="mini g" data-lc="hire" data-k="wk" data-d="-1" ${(L.staff||0)?"":"disabled"}>− Let go</button> <button class="mini" data-lc="hire" data-k="wk" data-d="1" ${(L.staff||0)>=mx?"disabled":""}>+ Hire</button></td></tr>
   <tr><td style="font-size:22px">👔</td><td><b>Warehouse manager</b><br><small style="color:#94a3b8">${fmt(LCW.mgr*pr)}/hr. Orders ${LCW.mgrB*100}% faster on top, crew up to ${LCW.max1} (else ${LCW.max0}), forklift jobs pay 50% more. Waits by this office.</small></td><td>${L.mgr?`<button class="mini g" data-lc="hire" data-k="mgr" data-d="-1">Let go</button>`:`<button class="mini" data-lc="hire" data-k="mgr" data-d="1" style="background:#15803d">Hire</button>`}</td></tr></tbody></table>
   <small id="lc3-he" style="color:#fca5a5"></small>
   <div style="display:flex;align-items:center;gap:10px;margin:10px 0"><div style="flex:1"><small>Crew tiredness ${Math.round(L.fat||0)}% (at 100% they work 25% slower)${L.off===(S.day||0)?" · day off today":""}</small><div style="height:8px;background:#1e293b;border-radius:4px;margin-top:4px"><div style="height:8px;width:${Math.round(L.fat||0)}%;background:${(L.fat||0)>60?"#f59e0b":"#22c55e"};border-radius:4px"></div></div></div><button class="mini" data-lc="dayoff" ${(L.staff||0)&&L.off!==(S.day||0)?"":"disabled"}>🌴 Give a day off</button></div>
   ${(L.staff||0)?`<table><tbody>${(L.xp||[]).map((h,i)=>{const lv=lcWkLv(h),ld=L.lead===i;return `<tr><td><b>${esc(L.wn[i]||"Worker")}</b>${ld?' <small style="background:#1d4ed8;border-radius:4px;padding:1px 5px">⭐ Shift lead</small>':""}<br><small style="color:#94a3b8">${LCLV[lv]} · ${Math.floor(Math.max(0,(S.hour||0)-h))} days · $${lcWkPay(h)+(ld?LCW.lead:0)}/hr · +${(LCW.per*(.6+.2*lv)*100).toFixed(1)}% speed</small></td><td style="white-space:nowrap">${ld?`<button class="mini g" data-lc="wkled" data-k="-1">Step down</button>`:`<button class="mini" data-lc="wkled" data-k="${i}">⭐ Make lead</button>`} <button class="mini g" data-lc="wkfire" data-k="${i}">Let go</button></td></tr>`}).join("")}</tbody></table><small style="color:#94a3b8">Workers level up every ${LCW.lvDays} game days: ${LCLV.join(" → ")}. A shift lead earns $${LCW.lead}/hr more, adds ${LCW.leadB*100}% speed and halves how fast the crew tires.</small>`:""}
   <p style="color:#94a3b8;font-size:12px">Forklift jobs done here: <b style="color:#e2e8f0">${L.jobs||0}</b> · each pays ${fmt(lcJobPay(c))}. Take one at the yellow board by the docks. Local time ${String(Math.floor(localHour())).padStart(2,"0")}:${String(Math.floor(localHour()%1*60)).padStart(2,"0")} (${isNight()?"night shift":"day shift"}). </p></div>`}
function L0(){return W.city!=null?LCO(W.city):null}
function open(cid){if(W.on)return;const c=CITIES[cid],L=c&&LCO(cid);if(!L)return toast("No logistics center here");css();W.on=true;W.city=cid;document.body.classList.add("lc3-on");
  const el=W.el=document.createElement("div");el.className="lc3";el.setAttribute("role","dialog");el.setAttribute("aria-label","Logistics center in "+c.name);
  if(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window)el.classList.add("touch");
  el.innerHTML=`<div class="lc3-load">Opening the logistics center…</div><div class="lc3-top"><div><b>📦 LOGISTICS CENTER · ${esc(c.name.toUpperCase())}</b><small id="lc3-sub"></small></div><button class="lc3-btn g" data-lc="pc">🖥 Inventory</button><button class="lc3-btn g" data-lc="ord">📋 Orders</button><button class="lc3-btn g" data-lc="sell">💲 Sell</button><button class="lc3-btn g" data-lc="oinv" hidden title="Furniture you bought at the office shop (I)">🪑 My items</button><button class="lc3-btn g" data-lc="snd" title="Sound on/off" aria-label="Sound on or off">🔊</button><button class="lc3-btn g" data-lc="ride" hidden title="Get on or off your vehicle (R)">🚜 Ride</button><button class="lc3-btn g" data-lc="fp" title="First-person view (V)">👁 1st person</button><button class="lc3-btn g" data-lc="zin" title="Zoom in (+ or mouse wheel)" aria-label="Zoom in">＋</button><button class="lc3-btn g" data-lc="zout" title="Zoom out (−)" aria-label="Zoom out">－</button><button class="lc3-btn" data-lc="close">Exit</button></div>
  <div class="lc3-help">W/S forward/back · A/D strafe · ←/→ or drag to turn · wheel/± zoom · V first person · Shift run · E use/place · T turn item · I my items (office) · R ride · Esc exit</div><div class="lc3-joy"><i></i></div><div class="lc3-act"><button class="lc3-btn" data-lc="use" hidden></button></div><div class="lc3-find" hidden></div>`;
  document.body.appendChild(el);sndInit();{const sb=el.querySelector('[data-lc="snd"]');if(sb)sb.textContent=W.mute?"🔇":"🔊"}W.wk=null;W.conv=null;W.job=null;W.carry=null;W.hold=null;W.ghost=null;W.btn=el.querySelector('[data-lc="use"]');W.keys={};W.joy=null;W.near=null;W.panel=null;W.find=null;
  const joy=el.querySelector(".lc3-joy"),kn=joy.firstChild,jr=56;let jid=null;
  const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=36+dx+"px";kn.style.top=36+dy+"px";W.joy={x:dx/jr,y:dy/jr}};
  joy.addEventListener("pointerdown",e=>{e.stopPropagation();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
  const je=()=>{jid=null;W.joy=null;kn.style.left="36px";kn.style.top="36px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  el.tabIndex=-1;el.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select")){if(e.key==="Escape")panel(false);return}const k=e.key.toLowerCase();if(k==="v"){setFp(!W.fp);return}if(k==="r"){const L=L0();if(L&&L.veh.length){ride(L.ride?"":(W.lastRide&&L.veh.includes(W.lastRide)?W.lastRide:L.veh[L.veh.length-1]));if(L.ride)W.lastRide=L.ride}return}if(k==="+"||k==="="){zoomBy(-1);return}if(k==="-"||k==="_"){zoomBy(1);return}if(k==="i"&&W.up){ofInv();return}if(k==="e"||k==="enter"){use();e.preventDefault();return}if(W.hold&&k==="t"){W.hold.r=((W.hold.r||0)+1)%4;return}if(k==="escape"&&W.hold){ofDrop(false);return}if(k==="escape"){if(W.panel)panel(false);else close();return}W.keys[k]=1;if(k.startsWith("arrow")||k===" ")e.preventDefault()});
  el.addEventListener("keyup",e=>{W.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-lc]");if(!b)return;const a=b.dataset.lc;
    if(a==="oinv")ofInv();else if(a==="close")close();else if(a==="use")use();else if(a==="pc")panel(!W.panel||W.ordOn||W.shopOn);else if(a==="xp")panel(false);
    else if(a==="fp")setFp(!W.fp);else if(a==="sbuy"||a==="sride")shopAct(a,b);else if(a==="lcogo"||a==="lcox"||a==="lcodir")ordAct(a,b);else if(a==="snd")sndToggle();else if(a==="sell")sellPanel();else if(a==="lsell"){const c=CITIES[W.city],L=L0(),g=b.dataset.g,v=lcSell(c,g,(L.inv[g]||0)*+b.dataset.f);fillSell();const m=W.panel&&W.panel.querySelector("#lsl-e");if(m)m.textContent=v?`Sold for ${fmt(v)}`:"";W.sig="";sub()}else if(a==="wkfire"||a==="wkled"||a==="dayoff"){const c=CITIES[W.city];if(a==="wkfire")lcFire(c,+b.dataset.k);else if(a==="wkled")lcPromote(c,+b.dataset.k);else lcDayOff(c);crew();fillStaff();sub()}else if(a==="hire"){const e=lcHire(CITIES[W.city],b.dataset.k,+b.dataset.d);crew();fillStaff();if(e){const m=W.panel&&W.panel.querySelector("#lc3-he");if(m)m.textContent=e}sub()}else if(a==="ord")ordPanel();else if(a==="ride"){const L=L0();ride(L.ride?"":(W.lastRide&&L.veh.includes(W.lastRide)?W.lastRide:L.veh[L.veh.length-1]));if(L.ride)W.lastRide=L.ride}else if(a==="zin")zoomBy(-1);else if(a==="zout")zoomBy(1);else if(a==="find")findG(b.dataset.g,false);else if(/^of(buy|put|rot|mov|pick|tab|sell|sellp)$/.test(a))ofAct(a,b);else if(/^oc(tab|app|min|wx|un|pd)$|^oct(take|give|drop)$/.test(a))ocAct(a,b);else if(arr(a,b))return;else if(a==="go")findG(b.dataset.g,true)});
  el.addEventListener("input",e=>{if(e.target.id==="lc3-q")fillTable();else if(e.target.id==="lco-q")W.of.q=+e.target.value});
  el.addEventListener("change",e=>{const id=e.target.id;if(id==="lco-src"){W.of.src=+e.target.value;W.of.q=0;fillOrd()}else if(id==="lco-g"){W.of.g=e.target.value;W.of.q=0;fillOrd()}else if(id==="lco-v")W.of.v=+e.target.value;else if(id==="oc-c"){W.ocC=e.target.value;fillOc()}});
  loadThree().then(T=>{if(!W.on||W.el!==el)return;build(T);W.raf=requestAnimationFrame(loop);if(W.cv)W.cv.focus()}).catch(()=>{close();toast("Couldn't load the 3D logistics center. Check your connection and try again.")})}
function close(){if(!W.on)return;if(W.hold)ofDrop(false);W.on=false;document.body.classList.remove("lc3-on");try{if(W.au)W.au.ctx.close()}catch(e){}W.au=null;W.wk=null;W.conv=null;W.job=null;W.carry=null;W.tk=null;W.th=null;W.sv=null;cancelAnimationFrame(W.raf);W.raf=0;
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
  ren.setPixelRatio(Math.min(lcLite()?1:1.5,devicePixelRatio||1));W.ren=ren;W._w=W._h=0;const cv=ren.domElement;cv.tabIndex=0;cv.setAttribute("aria-label","3D logistics center. W A S D to move, E to use.");el.insertBefore(cv,el.firstChild);W.cv=cv;const ld=el.querySelector(".lc3-load");if(ld)ld.remove();
  /* drag to look (horizontal turns; vertical tilts in first person); two fingers pinch to zoom; wheel zooms */
  const pts=new Map();let pinch=0;cv.addEventListener("pointerdown",e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.focus();if(pts.size===2){const [a,b]=[...pts.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}});
  cv.addEventListener("pointermove",e=>{const o=pts.get(e.pointerId);if(!o)return;if(pts.size===2){o.x=e.clientX;o.y=e.clientY;const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch){W.zoom=Math.max(1.6,Math.min(14,W.zoom*pinch/d));if(W.fp&&pinch/d>1.15)setFp(false)}pinch=d;return}
    W.p.yaw-=(e.clientX-o.x)*.006;if(W.fp)W.pitch=Math.max(-1.1,Math.min(1.1,W.pitch-(e.clientY-o.y)*.005));o.x=e.clientX;o.y=e.clientY});
  const du=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=0};cv.addEventListener("pointerup",du);cv.addEventListener("pointercancel",du);
  cv.addEventListener("wheel",e=>{e.preventDefault();zoomBy(e.deltaY>0?1:-1,Math.min(3,Math.abs(e.deltaY)/100))},{passive:false});
  ren.toneMapping=T.ACESFilmicToneMapping;ren.toneMappingExposure=1.05;ren.outputEncoding=T.sRGBEncoding;
  const sc=new T.Scene();sc.background=new T.Color(0x2a2f36);W.scene=sc;W.cam=new T.PerspectiveCamera(62,1,.1,400);
  const led=!!(L.upg&&L.upg.led);W.hemi=new T.HemisphereLight(led?0xf8fbff:0xfff4e0,0x5b5f66,led?1.45:1.05);W.hemi.userData.i0=W.hemi.intensity;sc.add(W.hemi);const dl=W.dl=new T.DirectionalLight(led?0xffffff:0xfff1d6,led?.7:.55);dl.userData.i0=dl.intensity;dl.position.set(8,30,14);sc.add(dl);sc.add(new T.AmbientLight(0xffffff,.12));
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
  wall(.3,WH,len,-HW-.15,0,zm,clad);wall(.3,WH,len,HW+.15,0,zm,clad);wall(HW*2+.6,WH,.3,0,0,z0-.15,cladE);{const ed=[-7.5,0,7.5];let x0=-HW-.3;for(const dx of ed){wall(dx-1.8-x0,WH,.3,(x0+dx-1.8)/2,0,z1+.15,cladE);wall(3.6,1.2,.3,dx,0,z1+.15,cladE);wall(3.6,WH-5.4,.3,dx,5.4,z1+.15,cladE);x0=dx+1.8}wall(HW+.3-x0,WH,.3,(x0+HW+.3)/2,0,z1+.15,cladE)}
  {const ap=new T.Mesh(new T.PlaneGeometry(HW*2+40,40),new T.MeshStandardMaterial({map:tx(T,"conc",12,8),roughness:.95}));ap.rotation.x=-Math.PI/2;ap.position.set(0,-.01,z1+20.3);room.add(ap)}
  for(const x of [-HW+.05,HW-.05])wall(.25,1.2,len,x,0,zm,plinth);wall(HW*2,1.2,.25,0,0,z0+.05,plinth);
  const steel=new T.MeshStandardMaterial({color:0x7b8794,roughness:.45,metalness:.7}),stl=(w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),steel);o.position.set(x,y,z);room.add(o);return o};
  for(let z=z0+3;z<z1-1;z+=9){for(const x of [-HW+.35,HW-.35]){stl(.45,WH,.35,x,WH/2,z);ofBox(T,room,.6,1,.6,0xfacc15,x,0,z,{r:.6})}stl(HW*2,.5,.3,0,WH-.6,z);
    for(let i=-6;i<=6;i++){const x=i*HW/6.5;stl(.08,1.6,.08,x,WH-1.4,z);if(i<6){const d=stl(Math.hypot(HW/6.5,1.5),.07,.07,x+HW/13,WH-1.4,z);d.rotation.z=(i%2?1:-1)*Math.atan2(1.5,HW/6.5)}}stl(HW*2,.18,.18,0,WH-2.2,z)}
  const rf=new T.Mesh(new T.PlaneGeometry(HW*2+.6,len+.6),new T.MeshStandardMaterial({map:tx(T,"roof",HW*2/3,len/3),roughness:.8,metalness:.3,side:T.DoubleSide}));rf.rotation.x=Math.PI/2;rf.position.set(0,WH+.02,zm);room.add(rf);
  for(let z=z0+7.5;z<z1-2;z+=9)for(const x of [-9,9]){const s=new T.Mesh(new T.PlaneGeometry(4,2.4),(W.skyM=W.skyM&&W.skyM.userData.sc===sc?W.skyM:Object.assign(new T.MeshBasicMaterial({color:0xe0f2fe}),{userData:{sc}})));s.rotation.x=Math.PI/2;s.position.set(x,WH-.01,z);room.add(s)}
  const lampM=new T.MeshStandardMaterial({color:0x374151,roughness:.4,metalness:.8}),glow=new T.MeshBasicMaterial({color:0xfffbeb});
  for(let z=z0+5;z<z1-1;z+=4.8)for(let b=0;b<W.nb;b++)for(const x of [-BAYS*BW/2-1.7,0,BAYS*BW/2+1.7].map(v=>v+blkX(b))){const c0=new T.Mesh(new T.CylinderGeometry(.08,.5,.45,14,1,true),lampM);c0.position.set(x,WH-2.6,z);room.add(c0);const d=new T.Mesh(new T.CircleGeometry(.45,14),glow);d.rotation.x=Math.PI/2;d.position.set(x,WH-2.83,z);room.add(d);ofBox(T,room,.02,2.4,.02,0x111827,x,WH-2.4,z)}
  // three dock doors with sectional roll-up doors, dock levelers, bumpers and traffic lights
  const doorM=new T.MeshStandardMaterial({map:tx(T,"door",1,1),roughness:.5,metalness:.4});
  for(let i=0;i<3;i++){const dx=-7.5+i*7.5;const dr=new T.Mesh(new T.PlaneGeometry(3.6,4.2),doorM);dr.position.set(dx,2.1+1.2,z1-.01);dr.rotation.y=Math.PI;room.add(dr);(W.doors||(W.doors=[]))[i]=dr;
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
  offShell(T,room);
  const fk=new T.Group(),or=new T.MeshStandardMaterial({color:0xf59e0b,roughness:.45,metalness:.3}),blk=new T.MeshStandardMaterial({color:0x111827,roughness:.6}),put=(g,m,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
  put(fk,or,1.2,.9,1.9,0,.75,0);put(fk,blk,1.25,.5,.5,0,.65,.85);put(fk,blk,.5,.6,.5,0,1.3,.2);put(fk,or,.07,1.1,.07,-.55,1.85,.6);put(fk,or,.07,1.1,.07,.55,1.85,.6);put(fk,or,.07,1.1,.07,-.55,1.85,-.45);put(fk,or,.07,1.1,.07,.55,1.85,-.45);put(fk,blk,1.25,.05,1.2,0,2.4,.08);
  for(const x of [-.42,.42])put(fk,steel,.08,2.6,.1,x,1.4,-1.05);put(fk,steel,1,.1,.1,0,2.6,-1.05);for(const x of [-.35,.35])put(fk,steel,.12,.05,1.15,x,.12,-1.65);
  for(const [x,z,r] of [[-.6,-.6,.3],[.6,-.6,.3],[-.55,.65,.22],[.55,.65,.22]]){const w=new T.Mesh(new T.CylinderGeometry(r,r,.25,16),blk);w.rotation.z=Math.PI/2;w.position.set(x,r,z);fk.add(w)}
  fk.position.set(5,0,z1-7.5);fk.rotation.y=.4;room.add(fk);
  // warehouse shop: counter, display vehicles and a sign, on the left of the reception area
  {const sx=-HW+3.2,sz=z1-15.5;W.shop={x:sx,z:sz};ofBox(T,room,1,1.05,3,0x7c3aed,sx,0,sz,{r:.5});ofBox(T,room,1.1,.06,3.1,0xe9d5ff,sx,1.05,sz,{r:.4});ofBox(T,room,.3,2.6,4.2,0x334155,-HW+.6,0,sz,{r:.6});
   for(let i=0;i<3;i++)ofBox(T,room,.5,.06,3.8,0x94a3b8,-HW+.95,.9+i*.75,sz,{m:.6});for(let i=0;i<6;i++)ofBox(T,room,.35,.3,.35,[0xf59e0b,0x22c55e,0x3b82f6][i%3],-HW+.95,.96+(i%3)*.75+.15,sz-1.4+(i>>1)*1.2,{});
   sign(T,room,["WAREHOUSE SHOP","Vehicles & upgrades"],2.8,.8,sx,2.9,sz,Math.PI/2,{bg:"#4c1d95",fg:"#f5f3ff",w:640,h:180});
   const d1=veh(T,"jack");d1.position.set(sx+1.8,0,sz-3.2);d1.rotation.y=-.6;room.add(d1);const d2=veh(T,"cart");d2.position.set(sx+1.6,0,sz+3.4);d2.rotation.y=.5;room.add(d2)}
  // central computer system: desk, three screens, sign
  const pc=new T.Group();ofBox(T,pc,3.2,.85,1.1,0x334155,0,0,0);ofBox(T,pc,3.3,.06,1.2,0x1e293b,0,.85,0);
  W.scr=[];for(let i=-1;i<=1;i++){ofBox(T,pc,.08,.4,.08,0x111827,i*1.05,.9,.2);const m=new T.Mesh(new T.PlaneGeometry(.95,.6),new T.MeshBasicMaterial({map:screenTex(T,i+1)}));m.position.set(i*1.05,1.62,.18);m.rotation.y=i*-.25;m.rotation.x=0;pc.add(m);W.scr.push(m);ofBox(T,pc,1,.66,.04,0x0f172a,i*1.05,1.29,.15).rotation.y=i*-.25}
  ofBox(T,pc,.6,.04,.25,0x111827,0,.88,-.25);pc.position.set(0,0,z1-15);room.add(pc);W.pcz=z1-15;
  sign(T,room,["CENTRAL INVENTORY"],2.6,.5,0,2.75,z1-15.1,0,{bg:"#14532d",fg:"#dcfce7"});
  buildRacks(T);try{bake(T,room,new Set([W.rk,...W.scr,...W.doors]))}catch(e){console.warn(e)}life(T,sc);
  const av=W.av=person(T,0x1f2937);W.legs=av.userData.legs;sc.add(av);W.body=av.children.slice();ride(L.ride);W.p={x:0,z:z1-6,yaw:0};W.up=false;offBuild();ofInvBtn();W.cd=W.zoom;setFp(W.fp);
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
  if(L0().lv>MAXR)sign(T,room,["Rows "+lcRowName(MAXR)+"+ in the annex","See the computer for every location"],8,1.3,0,6.5,zBack()+.3,0,{w:1024,h:180,bg:"#7c2d12",fg:"#fff"});try{bake(T,room,new Set())}catch(e){console.warn(e)}}
function blocked(x,z,cam){const r=cam?.15:.32;if(W.up&&!cam){const o=ofs();return x<o.x0+.35||x>o.x1-.35||z<o.z0+.35||z>o.z1-.35}
  if(!cam&&x>HW-12.6-r&&x<HW-6.4&&z>zEnd()-12-r&&z<zEnd()-10.7+r)return true;for(const [cx,cz] of [[HW-9.9,zEnd()-12.2],[HW-9.9,zEnd()-20.8],[HW-9.9,zEnd()-16.5]])if(Math.abs(x-cx)<.15+r&&Math.abs(z-cz)<.15+r)return true;
  if(x<-HW+r||x>HW-r||z<zBack()+r||z>zEnd()-r)return true;
  for(let i=0;i<W.rows;i++){const zz=rowZ(i);if(Math.abs(z-zz)<RACKD/2+r&&Math.abs(x-rowX(i))<BAYS*BW/2+r)return true}
  if(!cam&&Math.abs(x)<1.7+r&&Math.abs(z-W.pcz)<.6+r)return true;if(W.shop&&!cam&&x<W.shop.x+.55+r&&Math.abs(z-W.shop.z)<1.55+r&&x>W.shop.x-.6)return true;if(W.shop&&!cam&&x<-HW+1.2+r&&Math.abs(z-W.shop.z)<2.1+r)return true;{const ox=HW-5,oz=zEnd()-15.5;if(x>ox-3.5-r&&z>oz-3-r&&z<oz+3+r&&!(z>oz+2.6&&x<ox-1.5)&&(x<ox-3.4+r||z<oz-2.9+r||(z>oz+2.9-r&&x>ox-1.5)||Math.abs(x-ox)<1.1+r&&Math.abs(z-oz-2.4)<.35+r))return true}
  for(const [cx,cz,hw,hd] of [[-HW+4,zEnd()-4.5,3,1.2],[HW-4,zEnd()-4.5,3,1.2],[HW-11,zEnd()-4.6,3,1.2],[5,zEnd()-7.5,1.1,1.1],[-HW+7.75,zEnd()-9,4.5,.6],[HW-8,zEnd()-9,3.8,.6],[-1.25,zEnd()-3.2,2.9,.6]].slice(0,cam?4:7))if(Math.abs(x-cx)<hw+r&&Math.abs(z-cz)<hd+r)return true;return false}
function nearest(){const P=W.p;if(W.th&&!W.up&&Math.hypot(P.x-W.th.x,P.z-W.th.z)<2.6)return {k:"alarm",n:"🚨 Sound the alarm"};if(W.hold)return {k:"oplace",n:`✅ Place ${OFI[W.hold.i].n}${ofSpot(W.hold.i).desk?" on the desk":""}`};if(W.up)return offNear();if(Math.hypot(P.x-(HW-13.3),P.z-(zEnd()-11.35))<1.6)return {k:"up",n:"🪜 Go up to your office"};if(W.job&&W.job.tg&&Math.hypot(P.x-W.job.tg.x,P.z-W.job.tg.z)<2.4)return W.job.st==="pick"?{k:"pick",n:"⬆ Lift the pallet"}:{k:"drop",n:"⬇ Drop the pallet"};if(W.jobP&&Math.hypot(P.x-W.jobP.x,P.z-W.jobP.z)<2.2)return {k:"job",n:W.job?"📋 Your job: follow the green marker":"📋 Take a forklift job"};if(W.mgrP&&Math.hypot(P.x-W.mgrP.x,P.z-W.mgrP.z)<2)return {k:"staff",n:L0().mgr?"👔 Talk to the manager":"👔 Staff office: hire staff"};if(W.shop&&Math.abs(P.x-W.shop.x)<2.4&&Math.abs(P.z-W.shop.z)<2.2)return {k:"shop",n:"🛒 Open the warehouse shop"};if(Math.abs(P.x)<2.6&&Math.abs(P.z-W.pcz)<1.6)return {k:"pc",n:"🖥 Use the central computer"};if(P.z>zEnd()-1.4&&Math.abs(P.x)<HW)return {k:"exit",n:"🚪 Leave the building"};return null}
function use(){const n=W.near;if(!n)return;if(n.k==="pc")panel(true);else if(n.k==="shop")shopPanel();else if(n.k==="staff")staffPanel();else if(n.k==="job")jobTake();else if(n.k==="pick")jobPick();else if(n.k==="drop")jobDrop();else if(n.k==="exit")close();else if(n.k==="alarm")thiefEnd(true);else if(n.k==="up")ofGo(true);else if(n.k==="down")ofGo(false);else if(n.k==="osh")ofsPanel("buy");else if(n.k==="oitem")ofsPanel("mine");else if(n.k==="opc")ocPanel();else if(n.k==="oplace")ofDrop(true);else if(n.k==="olook"){setFp(true);W.p.yaw=W.p.z<ofs().z0+1.2?0:Math.PI/2;W.pitch=-.2}}
function sub(){const c=CITIES[W.city],L=L0(),s=W.el&&W.el.querySelector("#lc3-sub");if(s&&L){const h=localHour();s.textContent=`Level ${L.lv} · ${fmtT(lcUsed(c))} / ${fmtT(lcCap(c))} · ${L.ord.length} products · ${isNight()?"🌙":"☀️"} ${String(Math.floor(h)).padStart(2,"0")}:${String(Math.floor(h%1*60)).padStart(2,"0")} · 👷 ${L.staff||0}${L.mgr?" + 👔":""}${lcWarn(c,L)}`}}
function lcWarn(c,L){const U=L.upg||{},w=[];if(!U.cold&&L.ord.some(g=>LCSPOIL[g]&&L.inv[g]>0))w.push("❄️ food spoiling: buy Cold storage");if(!U.sec)w.push("🛡 no security");return w.length?" · ⚠ "+w.join(" · "):""}
function panel(on){W.shopOn=false;W.osOn=false;W.ocOn=false;W.ordOn=false;W.stOn=false;W.slOn=false;if(W.panel){W.panel.remove();W.panel=null}if(!on){if(W.cv)W.cv.focus();return}const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);
  const c=CITIES[W.city],L=L0(),lay=lcLayout(c);let val=0;for(const it of lay.items)val+=it.q*px(c,it.g);
  p.innerHTML=`<header><span>CENTRAL INVENTORY SYSTEM · ${esc(c.name.toUpperCase())}</span><span><button class="lc3-btn g" data-lc="ord" style="padding:5px 10px;margin-right:6px">📋 Orders</button><button class="lc3-btn g" data-lc="sell" style="padding:5px 10px;margin-right:6px">💲 Sell</button><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></span></header><div class="bd">
   <div class="sum"><div><small>Stored</small><b>${fmtT(lcUsed(c))}</b></div><div><small>Capacity</small><b>${fmtT(lcCap(c))}</b></div><div><small>Rows · bays</small><b>${L.lv} · ${L.lv*BAYS}</b></div><div><small>Stock value here</small><b>${fmt(val)}</b></div></div>
   <div class="lc3-sort">Re-arrange: <button class="mini" data-lc="sort" data-k="name">A–Z</button><button class="mini" data-lc="sort" data-k="type">By type</button><button class="mini" data-lc="sort" data-k="weight">Heaviest first</button><small>▲▼ change the fill order · Move puts a product at the row and bay you pick</small></div><input id="lc3-q" placeholder="Search products or a row (e.g. B)" aria-label="Search inventory"><div id="lc3-tb"></div></div>`;fillTable()}
function fillTable(){const t=W.panel&&W.panel.querySelector("#lc3-tb");if(!t)return;const c=CITIES[W.city],q=(W.panel.querySelector("#lc3-q").value||"").trim().toLowerCase(),lay=lcLayout(c);
  const rows=lay.items.filter(it=>!q||G[it.g][0].toLowerCase().includes(q)||(q.length<=2&&/^[a-z]+$/.test(q)?lcRowName(it.row).toLowerCase()===q||(it.loc.toLowerCase().match(/row ([a-z]+)/g)||[]).some(r=>r.slice(4)===q):it.loc.toLowerCase().includes(q)));
  t.innerHTML=rows.length?`<table><thead><tr><th>Product</th><th>Qty</th><th class="c-w">Weight</th><th>Location</th><th class="c-t">Type</th><th></th></tr></thead><tbody>${rows.map(it=>`<tr><td class="n">${esc(G[it.g][0])}</td><td>${gq(it.q)}</td><td class="c-w">${fmtT(it.t)}</td><td>${esc(it.loc)}${it.pin?" 📌":""}</td><td class="c-t">${KN[kindOf(it.g)]}</td><td style="white-space:nowrap"><button class="mini g" data-lc="up" data-g="${esc(it.g)}" aria-label="Move up" title="Fill earlier">▲</button><button class="mini g" data-lc="dn" data-g="${esc(it.g)}" aria-label="Move down" title="Fill later">▼</button><button class="mini" data-lc="mv" data-g="${esc(it.g)}" style="background:#7c3aed">Move</button><button class="mini" data-lc="find" data-g="${esc(it.g)}">Find</button><button class="mini" data-lc="go" data-g="${esc(it.g)}" style="background:#15803d">Walk there</button></td></tr>${W.mvg===it.g?`<tr class="mv"><td colspan="6">Move ${esc(G[it.g][0])} to row <input id="lc3-mr" maxlength="3" value="${lcRowName(it.row)}" aria-label="Row letter"> bay <select id="lc3-mb" aria-label="Bay">${Array.from({length:BAYS},(_,i)=>`<option ${i===it.bay?"selected":""}>${i+1}</option>`).join("")}</select><button class="mini" data-lc="pin" data-g="${esc(it.g)}" style="background:#15803d">Place here</button>${it.pin?`<button class="mini g" data-lc="unpin" data-g="${esc(it.g)}">Auto spot</button>`:""}<button class="mini g" data-lc="mvx">Cancel</button><small id="lc3-me" style="color:#fca5a5;margin-left:6px"></small></td></tr>`:""}`).join("")}</tbody></table>`:`<p style="color:#94a3b8">${lay.items.length?"No match.":"The warehouse is empty. Ship goods to "+esc(c.name)+" and they'll be listed here with their row and bay."}</p>`}
function findG(g,go){const c=CITIES[W.city],it=lcLayout(c).items.find(x=>x.g===g);if(!it)return;const x=bayX(it.bay,it.row),z=rowZ(it.row);
  if(it.row>=W.rows){toast(`${G[g][0]} is in ${it.loc} (annex)`);return}
  W.find={x,z,t:performance.now()};W.beacon.visible=true;W.beacon.position.set(x,RACKH+1.4,z);const f=W.el.querySelector(".lc3-find");f.hidden=false;f.textContent=`📍 ${G[g][0]}: ${it.loc}`;
  if(go){const az=z+RACKD/2+1.2;W.up=false;ofInvBtn();W.p={x,z:az,yaw:0};panel(false)}else panel(false)}
function loop(t){if(!W.on||!W.ren){W.raf=0;return}W.raf=requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min(.1,Math.max(0,(t-W.last)/1000));W.last=t;step(dt,t);
  /* a menu is open: the player can't move, so redraw the hall only ~5 times a second to keep the menu smooth */
  const w=W.el.clientWidth,h=W.el.clientHeight,rs=W._w!==w||W._h!==h;if(W.panel&&!rs&&t-(W.rt||0)<200)return;W.rt=t;if(rs){W.ren.setSize(w,h,false);W.cam.aspect=w/h;W.cam.updateProjectionMatrix();W._w=w;W._h=h}W.ren.render(W.scene,W.cam)}
function step(dt,t){const P=W.p,k=W.keys,busy=!!W.panel,L=L0();let f=0,s=0,turn=0;
  if(!busy){if(k.w||k.arrowup)f+=1;if(k.s||k.arrowdown)f-=1;if(k.d)s+=1;if(k.a)s-=1;if(k.arrowleft)turn+=1;if(k.arrowright)turn-=1;if(W.joy){f-=W.joy.y;s+=W.joy.x}}
  P.yaw+=turn*2.2*dt;const m=Math.hypot(f,s);let moving=false;
  if(m>.05){const vs=L&&L.ride?LCVEH[L.ride].sp:1,sp=(k.shift?7:4)*vs*Math.min(1,m)*dt/m,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),dx=(fx*f+rx*s)*sp,dz=(fz*f+rz*s)*sp;
    if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz;moving=true;W.av.rotation.y=Math.atan2(-(fx*f+rx*s),-(fz*f+rz*s))}
  W.walkT=moving&&!(L&&L.ride)?W.walkT+dt*10:0;const sw=Math.sin(W.walkT)*.5;W.legs[0].rotation.x=sw;W.legs[1].rotation.x=-sw;const UY=W.up?FY:0;W.av.position.set(P.x,UY+(moving?Math.abs(Math.sin(W.walkT))*.04:0),P.z);
  if(W.fp){const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),cp=Math.cos(W.pitch);const ey=UY+1.62+(L&&L.ride?.5:0);W.cam.position.set(P.x,ey,P.z);W.cam.lookAt(P.x+fx*cp,ey+Math.sin(W.pitch),P.z+fz*cp)}
  else{/* march from the player outwards and stop before the first wall, rack or object, so the camera never ends up inside or behind something */
    const sx=Math.sin(P.yaw),sz=Math.cos(P.yaw),hit=(x,z)=>x<-HW+.6||x>HW-.6||z<zBack()+.4||z>zEnd()-.4||(!W.up&&blocked(x,z,1));let D=W.zoom;for(let d=.4;d<=W.zoom;d+=.1)if(hit(P.x+sx*d,P.z+sz*d)){D=Math.max(.5,d-.35);break}
    W.cd=D<W.cd?D:W.cd+(D-W.cd)*Math.min(1,dt*6);const cd=W.cd,cy=Math.min(W.up?9.6:8.5,UY+1.7+cd*.32),cx=P.x+sx*cd,cz=P.z+sz*cd,la=Math.max(.6,1.5-cd*.1);
    W.cam.position.set(cx,cy,cz);W.cam.lookAt(P.x-sx*la,UY+1.1,P.z-sz*la)}
  if(W.find){W.beacon.position.y=RACKH+1.4+Math.sin(t/250)*.25;W.beacon.rotation.y+=dt*2;if(Math.hypot(P.x-W.find.x,P.z-W.find.z)<2.4&&t-W.find.t>1500){W.find=null;W.beacon.visible=false;W.el.querySelector(".lc3-find").hidden=true}}
  ofGhostPos();const n=W.near=nearest();if(W.btn){if(n&&!W.panel){W.btn.hidden=false;if(W.btn.textContent!==n.n+" (E)")W.btn.textContent=n.n+" (E)"}else W.btn.hidden=true}
  try{lifeStep(dt,t)}catch(e){console.warn(e)}if(((t/2000)|0)!==W._st){W._st=(t/2000)|0;sub();{const L=L0();if(W.T&&L&&Math.min(MAXR,L.lv)===W.rows&&!W.panel){const sg=rackSig();if(sg!==W.sig){W.sig=sg;try{buildRacks(W.T)}catch(e){}}}}if(W.ordOn&&!W.el.querySelector('.lco-f :focus'))fillOrd();if(W.scr&&!W.panel)W.scr.forEach((m,i)=>{m.material.map.dispose();m.material.map=screenTex(W.T,i);m.material.needsUpdate=true})}}
/* manager's office: a glass mezzanine above the receiving area, high enough to see down the whole hall (Mark, 2026-11-05).
   Reached by stairs; furniture is bought in the office shop and placed, turned or picked up. A computer opens Contracts and Stock apps.
   State per center: L.of={own:{id:count in storage},pl:[{i,x,z,r}]} with x/z relative to the office centre. */
const FY=4.8;
const OFI={
 desk:{n:"Basic desk",e:"🪵",p:2500,c:"Desks",d:"Simple wooden desk."},deskg:{n:"Glass desk",e:"🔷",p:12000,c:"Desks",d:"Modern glass top on steel legs."},deskx:{n:"Executive desk",e:"🏛",p:25000,c:"Desks",d:"Big walnut desk for the boss."},
 lap:{n:"Laptop",e:"💻",p:1500,c:"Computers",d:"Opens the office computer apps. Put it on a desk."},pc:{n:"Desktop PC",e:"🖥",p:4000,c:"Computers",d:"Tower and monitor. Opens the office computer apps."},pc3:{n:"Triple-screen workstation",e:"🖥",p:18000,c:"Computers",d:"Three screens. Opens the office computer apps."},
 chair:{n:"Office chair",e:"🪑",p:800,c:"Chairs",d:"Swivel chair."},chairx:{n:"Leather boss chair",e:"💺",p:6000,c:"Chairs",d:"High-back leather chair."},sofa:{n:"Sofa",e:"🛋",p:9000,c:"Chairs",d:"Three-seat sofa for visitors."},
 plant:{n:"Potted plant",e:"🪴",p:300,c:"Decorations",d:"A bit of green."},lamp:{n:"Floor lamp",e:"💡",p:600,c:"Decorations",d:"Warm light."},rug:{n:"Rug",e:"🟥",p:1200,c:"Decorations",d:"Soft rug."},shelf:{n:"Bookshelf",e:"📚",p:3500,c:"Decorations",d:"Full of books."},
 paint:{n:"Painting",e:"🖼",p:5000,c:"Decorations",d:"Framed art on a stand."},globe:{n:"Globe",e:"🌍",p:7500,c:"Decorations",d:"Antique world globe."},neon:{n:"Neon sign",e:"✨",p:15000,c:"Decorations",d:"Glowing sign."},
 trophy:{n:"Gold trophy",e:"🏆",p:40000,c:"Decorations",d:"For the tycoon who has everything."},fish:{n:"Aquarium",e:"🐠",p:60000,c:"Decorations",d:"Big tropical fish tank."}};
const OPCS=["lap","pc","pc3"],ODSK=["desk","deskg","deskx"];
function ofs(){const x1=HW-.45,x0=HW-9.9,z1=zEnd()-12.2,z0=zEnd()-20.8;return {x0,x1,z0,z1,cx:(x0+x1)/2,cz:(z0+z1)/2}}
function OF(){const L=L0();if(!L)return null;if(!L.of||typeof L.of!=="object")L.of={};const O=L.of;if(!O.own||typeof O.own!=="object")O.own={};if(!Array.isArray(O.pl))O.pl=[];
  for(const k in O.own)if(!OFI[k]||!(O.own[k]>0))delete O.own[k];O.pl=O.pl.filter(p=>p&&OFI[p.i]&&isFinite(p.x)&&isFinite(p.z));return O}
/* the static shell: slab, steel legs, glass walls, stairs and the shop kiosk (baked with the rest of the room) */
function offShell(T,room){const o=ofs(),w=o.x1-o.x0,d=o.z1-o.z0;
  ofBox(T,room,w+.3,.25,d+.3,0x64748b,o.cx,FY-.25,o.cz,{r:.6,m:.3});ofBox(T,room,w,.02,d,0x8b6b4a,o.cx,FY,o.cz,{r:.7});
  for(const [x,z] of [[o.x0,o.z0],[o.x0,o.z1],[o.x1,o.z0],[o.x1,o.z1],[o.x0,o.cz]])ofBox(T,room,.3,FY-.25,.3,0xfacc15,x,0,z,{r:.5,m:.4});
  const gl=(ww,dd,x,z)=>{ofBox(T,room,ww,1,dd,0x334155,x,FY,z,{r:.5});ofBox(T,room,ww,1.5,dd,0xbfdbfe,x,FY+1,z,{op:.22,r:.1,m:.2});ofBox(T,room,ww+.04,.08,dd+.04,0x1f2937,x,FY+2.5,z,{r:.4})};
  gl(w,.08,o.cx,o.z0);gl(.08,d,o.x0,o.cz);{const dx=HW-6.5,a=o.x0,b=dx-1;gl(b-a,.08,(a+b)/2,o.z1);gl(o.x1-dx-1,.08,(dx+1+o.x1)/2,o.z1)}
  for(let i=0;i<12;i++){const x=HW-12.25+i*.5;ofBox(T,room,.5,(i+1)*.4,1.2,0x475569,x,0,zEnd()-11.35,{r:.6,m:.3})}
  // handrail along the stairs: a sloped bar on posts (the old y-then-x rotation left it flat, floating across the hall)
  {const rl=Math.hypot(5.5,4.4),s=ofBox(T,room,rl,.06,.06,0xfacc15,HW-9.5,3.4,zEnd()-10.75,{r:.4});s.rotation.z=Math.atan2(4.4,5.5);for(let i=0;i<12;i+=3)ofBox(T,room,.05,1,.05,0xfacc15,HW-12.25+i*.5,(i+1)*.4,zEnd()-10.8,{r:.4})}
  ofBox(T,room,.7,1.1,.5,0x7c3aed,o.x1-.45,FY,o.cz,{r:.5});ofBox(T,room,.6,.4,.05,0x0f172a,o.x1-.45,FY+1.15,o.cz-.2,{e:0x4c1d95,ei:.6});
  sign(T,room,["OFFICE SHOP"],1.2,.3,o.x1-.45,FY+1.75,o.cz,-Math.PI/2,{bg:"#4c1d95",fg:"#fff"});
  sign(T,room,["MANAGER'S OFFICE"],3,.5,o.cx,FY+2.85,o.z0-.05,0,{bg:"#0f172a",fg:"#fbbf24",border:"#f59e0b"});
  sign(T,room,["⬆ OFFICE"],1.4,.4,HW-12.9,2.2,zEnd()-11.35,Math.PI/2,{bg:"#facc15",fg:"#111"})}
/* furniture, one small group per placed item (not baked, so it can change) */
function ofItem(T,i){const g=new T.Group(),B=(w,h,d,c,x,y,z,o)=>ofBox(T,g,w,h,d,c,x,y,z,o);
  if(i==="desk"){B(1.4,.05,.7,0x9a6b3f,0,.73,0);for(const [x,z] of [[-.65,-.3],[.65,-.3],[-.65,.3],[.65,.3]])B(.05,.73,.05,0x5b3a1e,x,0,z)}
  else if(i==="deskg"){B(1.5,.03,.75,0xbae6fd,0,.74,0,{op:.5,r:.1});for(const x of [-.7,.7])B(.05,.74,.7,0x94a3b8,x,0,0,{m:.8,r:.3})}
  else if(i==="deskx"){B(2,.08,.9,0x5b3a1e,0,.7,0,{r:.4});B(.5,.7,.85,0x4a2f17,-.72,0,0);B(.5,.7,.85,0x4a2f17,.72,0,0);B(.9,.5,.05,0x4a2f17,0,.2,.42)}
  else if(i==="lap"){B(.36,.02,.25,0x334155,0,0,0,{m:.6});const s=B(.36,.24,.015,0x0f172a,0,.02,-.12,{e:0x1d4ed8,ei:.5});s.rotation.x=-.25}
  else if(i==="pc"){B(.18,.42,.4,0x111827,.45,0,0);B(.06,.18,.06,0x111827,0,0,0);B(.55,.34,.04,0x0f172a,0,.18,0,{e:0x0e7490,ei:.6});B(.4,.02,.14,0x1f2937,0,0,.2)}
  else if(i==="pc3"){for(const k of [-1,0,1]){const m=B(.5,.32,.04,0x0f172a,k*.5,.2,-k*k*.08,{e:0x15803d,ei:.6});m.rotation.y=-k*.35}B(.06,.2,.06,0x111827,0,0,0);B(.45,.02,.15,0x1f2937,0,0,.2)}
  else if(i==="chair"||i==="chairx"){const c=i==="chair"?0x1f2937:0x3f1d0b;ofCyl(T,g,.28,.28,.05,0x111827,0,.05,0);B(.05,.4,.05,0x6b7280,0,.05,0);B(.5,.1,.5,c,0,.45,0);B(.5,i==="chair"?.5:.85,.08,c,0,.55,.24)}
  else if(i==="sofa"){B(2,.4,.85,0x1e3a8a,0,0,0);B(2,.5,.2,0x1e3a8a,0,.4,.33);for(const x of [-.95,.95])B(.15,.6,.85,0x1e40af,x,0,0)}
  else if(i==="plant"){ofCyl(T,g,.2,.15,.35,0xb45309,0,0,0);for(let k=0;k<5;k++){const l=B(.12,.6,.04,0x15803d,Math.sin(k*1.3)*.08,.3,Math.cos(k*1.3)*.08);l.rotation.z=Math.sin(k*2)*.4;l.rotation.y=k}}
  else if(i==="lamp"){ofCyl(T,g,.18,.18,.03,0x111827,0,0,0);B(.03,1.5,.03,0x111827,0,0,0);ofCyl(T,g,.12,.22,.25,0xfef3c7,0,1.45,0,{e:0xfde68a,ei:.8})}
  else if(i==="rug")B(2.4,.015,1.6,0x991b1b,0,0,0,{r:.95});
  else if(i==="shelf"){B(1.1,1.9,.35,0x6b4423,0,0,0);for(let s=0;s<4;s++)for(let b=0;b<7;b++)B(.11,.32,.25,[0xb91c1c,0x1d4ed8,0x15803d,0xca8a04][(s+b)%4],-.4+b*.135,.12+s*.45,.03)}
  else if(i==="paint"){B(.05,1,.05,0x5b3a1e,-.35,0,0);B(.05,1,.05,0x5b3a1e,.35,0,0);B(1,.75,.05,0xca8a04,0,1,0);B(.9,.65,.06,0x0e7490,0,1.05,0);B(.5,.25,.065,0xf97316,.1,1.2,0)}
  else if(i==="globe"){B(.05,.8,.05,0x5b3a1e,0,0,0);const s=new T.Mesh(new T.SphereGeometry(.3,16,12),ofMat(T,0x1d4ed8,{r:.4}));s.position.y=1.1;g.add(s);const r=new T.Mesh(new T.TorusGeometry(.33,.015,6,24),ofMat(T,0xca8a04,{m:.8,r:.3}));r.position.y=1.1;g.add(r)}
  else if(i==="neon"){B(.05,1.2,.05,0x111827,0,0,0);B(1.2,.4,.06,0xec4899,0,1.2,0,{e:0xec4899,ei:1.2})}
  else if(i==="trophy"){B(.4,.9,.4,0x111827,0,0,0);ofCyl(T,g,.06,.12,.12,0xfacc15,0,.9,0,{m:.9,r:.2});ofCyl(T,g,.04,.04,.15,0xfacc15,0,1.02,0,{m:.9,r:.2});ofCyl(T,g,.2,.08,.3,0xfacc15,0,1.17,0,{m:.9,r:.2})}
  else if(i==="fish"){B(1.6,.7,.5,0x111827,0,0,0);B(1.6,.7,.5,0x38bdf8,0,.7,0,{op:.45,r:.05});for(let k=0;k<4;k++)B(.1,.05,.03,[0xf97316,0xfacc15][k%2],-.5+k*.32,.9+(k%2)*.2,.05,{e:0xf97316,ei:.3})}
  return g}
function offBuild(){const T=W.T;if(!T||!W.scene)return;if(W.offG){W.scene.remove(W.offG);W.offG.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
  const g=W.offG=new T.Group(),O=OF(),o=ofs();W.scene.add(g);if(!O)return;
  for(const p of O.pl){const m=ofItem(T,p.i),x=o.cx+p.x,z=o.cz+p.z;let y=FY;if(OPCS.includes(p.i)&&O.pl.some(q=>ODSK.includes(q.i)&&Math.hypot(q.x-p.x,q.z-p.z)<.95))y+=p.i==="lap"?.78:.76;m.position.set(x,y+(p.i==="rug"?.01:0),z);m.rotation.y=(p.r||0)*Math.PI/2;g.add(m)}}
function ofClamp(x,z){const o=ofs();return {x:Math.max(o.x0+.6,Math.min(o.x1-.6,x))-o.cx,z:Math.max(o.z0+.6,Math.min(o.z1-.6,z))-o.cz}}
function ofGo(up){if(W.hold)ofDrop(false);const o=ofs(),L=L0();W.up=!!up;ofInvBtn();if(up){if(L&&L.ride)ride("");W.p={x:HW-6.5,z:o.z1-.9,yaw:0}}else W.p={x:HW-13.3,z:zEnd()-11.35,yaw:Math.PI/2};panel(false)}
function offNear(){const P=W.p,o=ofs(),O=OF(),hit=O?O.pl.map((p,k)=>({p,k,d:Math.hypot(o.cx+p.x-P.x,o.cz+p.z-P.z)})).filter(a=>a.d<1.6).sort((a,b)=>a.d-b.d):[];
  const pc=hit.find(a=>OPCS.includes(a.p.i));if(pc)return {k:"opc",n:"🖥 Use the office computer"};
  if(Math.hypot(P.x-(o.x1-.45),P.z-o.cz)<1.5)return {k:"osh",n:"🛍 Office shop & my furniture"};
  if(Math.hypot(P.x-(HW-6.5),P.z-o.z1)<1.2)return {k:"down",n:"🪜 Go down the stairs"};
  if(hit.length&&hit[0].d<1.3)return {k:"oitem",n:`${OFI[hit[0].p.i].e} Arrange: ${OFI[hit[0].p.i].n}`};
  if(P.z<o.z0+1.2||P.x<o.x0+1.2)return {k:"olook",n:"👀 Look over the warehouse"};return null}
function ofsPanel(tab){if(W.panel){W.panel.remove();W.panel=null}const p=W.panel=document.createElement("div");p.className="lc3-pan";W.el.appendChild(p);W.osOn=tab||"buy";fillOfs()}
function fillOfs(msg){const p=W.panel;if(!p||!W.osOn)return;const O=OF(),tab=W.osOn,cats=["Desks","Computers","Chairs","Decorations"];let h="";
  if(tab==="buy")for(const c of cats){h+=`<h4 style="margin:10px 0 4px;color:#cbd5e1">${c}</h4><table><tbody>`+Object.entries(OFI).filter(([,v])=>v.c===c).map(([k,v])=>{const n=(O.own[k]||0)+O.pl.filter(q=>q.i===k).length;return `<tr><td style="font-size:22px">${v.e}</td><td><b>${esc(v.n)}</b>${n?` <small style="color:#4ade80">· you have ${n}</small>`:""}<br><small style="color:#94a3b8">${esc(v.d)}</small></td><td style="white-space:nowrap">${fmt(v.p)}</td><td><button class="mini" data-lc="ofbuy" data-k="${k}" ${S.cash<v.p?"disabled":""}>Buy</button></td></tr>`}).join("")+`</tbody></table>`}
  else{const st=Object.entries(O.own);h+=`<h4 style="margin:10px 0 4px;color:#cbd5e1">In storage</h4>`+(st.length?`<table><tbody>${st.map(([k,n])=>`<tr><td style="font-size:22px">${OFI[k].e}</td><td><b>${esc(OFI[k].n)}</b> ×${n}</td><td><button class="mini" data-lc="ofput" data-k="${k}" style="background:#15803d">Place here</button><button class="mini g" data-lc="ofsell" data-k="${k}" title="Sell one for half price">💰 Sell ${fmt(Math.round(OFI[k].p/2))}</button></td></tr>`).join("")}</tbody></table>`:`<p style="color:#94a3b8;font-size:12px">Nothing in storage. Buy furniture in the shop tab.</p>`);
    h+=`<h4 style="margin:12px 0 4px;color:#cbd5e1">In the office</h4>`+(O.pl.length?`<table><tbody>${O.pl.map((q,k)=>`<tr><td style="font-size:22px">${OFI[q.i].e}</td><td><b>${esc(OFI[q.i].n)}</b></td><td style="white-space:nowrap"><button class="mini g" data-lc="ofrot" data-k="${k}" title="Turn 90°">↻ Turn</button><button class="mini" data-lc="ofmov" data-k="${k}" style="background:#7c3aed">Move here</button><button class="mini g" data-lc="ofpick" data-k="${k}">📦 Put back in inventory</button><button class="mini g" data-lc="ofsellp" data-k="${k}" title="Sell it for half price">💰 Sell ${fmt(Math.round(OFI[q.i].p/2))}</button></td></tr>`).join("")}</tbody></table>`:`<p style="color:#94a3b8;font-size:12px">Nothing placed yet.</p>`)}
  p.innerHTML=`<header><span>OFFICE SHOP</span><span><button class="lc3-btn ${tab==="buy"?"":"g"}" data-lc="oftab" data-k="buy" style="padding:5px 10px;margin-right:6px">🛍 Shop</button><button class="lc3-btn ${tab==="mine"?"":"g"}" data-lc="oftab" data-k="mine" style="padding:5px 10px;margin-right:6px">🪑 My furniture</button><button class="lc3-btn g" data-lc="xp" style="padding:5px 10px">Close</button></span></header><div class="bd"><div class="sum"><div><small>Cash</small><b>${fmt(S.cash)}</b></div><div><small>In storage</small><b>${Object.values(O.own).reduce((a,b)=>a+b,0)}</b></div><div><small>Placed</small><b>${O.pl.length}</b></div></div>${msg?`<p style="color:#fca5a5">${esc(msg)}</p>`:""}${h}<p style="color:#94a3b8;font-size:12px">"Place here", "Move here" and Buy pick the item up: walk anywhere in the office and press E to set it down (T turns it, Esc cancels). Computers sit on a desk when they're placed next to one, and open the Contracts and Stock apps.</p></div>`}
/* office inventory: the HUD button (only upstairs) toggles the My furniture tab from anywhere in the office */
function ofInvBtn(){const b=W.el&&W.el.querySelector('[data-lc="oinv"]');if(b)b.hidden=!W.up}
function ofInv(){if(!W.up)return;if(W.panel&&W.osOn==="mine")return panel(false);ofsPanel("mine")}
/* placing mode: the panel closes, the item floats in front of you while you walk; E places it, T turns it, Esc cancels */
function ofYawR(){return Math.round(((W.p.yaw%(2*Math.PI))+2*Math.PI)/(Math.PI/2))%4}
function ofHold(h){const O=OF();if(h.was==null){if(!(O.own[h.i]>0))return;O.own[h.i]--;if(!O.own[h.i])delete O.own[h.i]}panel(false);ofGhost(false);W.hold=h;const g=W.ghost=ofItem(W.T,h.i);g.traverse(m=>{if(m.material){m.material.transparent=true;m.material.opacity=.55}});W.scene.add(g);ofGhostPos();toast(`${OFI[h.i].e} Placing ${OFI[h.i].n}: walk, E to place, T to turn, Esc to cancel`)}
function ofGhost(){if(W.ghost){W.scene.remove(W.ghost);W.ghost.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});W.ghost=null}}
/* where a held item lands: computers snap onto the nearest desk within reach, everything else goes just in front of you */
function ofSpot(i){const p=ofHere(),O=OF();if(!OPCS.includes(i)||!O)return {x:p.x,z:p.z,y:0};let best=null,bd=1.6;for(const q of O.pl)if(ODSK.includes(q.i)){const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){bd=d;best=q}}
  return best?{x:best.x,z:best.z,y:i==="lap"?.78:.76,desk:1}:{x:p.x,z:p.z,y:0}}
function ofGhostPos(){const g=W.ghost,h=W.hold;if(!g||!h)return;const o=ofs(),p=ofSpot(h.i);g.position.set(o.cx+p.x,FY+.01+p.y,o.cz+p.z);g.rotation.y=(h.r||0)*Math.PI/2}
function ofDrop(ok){const h=W.hold,O=OF();if(!h)return;W.hold=null;ofGhost();if(!O)return;if(ok){const p=ofSpot(h.i);O.pl.push({i:h.i,x:p.x,z:p.z,r:h.r||0});toast(`${OFI[h.i].e} ${OFI[h.i].n} placed${p.desk?" on the desk":""}`)}else if(h.was)O.pl.push(h.was);else O.own[h.i]=(O.own[h.i]||0)+1;save();offBuild()}
function ofHere(){const P=W.p;return ofClamp(P.x-Math.sin(P.yaw)*1.1,P.z-Math.cos(P.yaw)*1.1)}
function ofAct(a,b){const O=OF();if(!O)return;const k=b.dataset.k;let msg="";
  if(a==="oftab"){W.osOn=k}
  else if(a==="ofbuy"){const v=OFI[k];if(!v)return;if(S.cash<v.p)msg=`Needs ${fmt(v.p)}`;else{S.cash-=v.p;O.own[k]=(O.own[k]||0)+1;const L=L0();L.spent=(L.spent||0)+v.p;save();toast(`${v.e} Bought: ${v.n}. Walk to a spot and press E to place it.`);return ofHold({i:k,r:ofYawR()})}}
  else if(a==="ofsell"){if(O.own[k]>0){O.own[k]--;if(!O.own[k])delete O.own[k];const v=Math.round(OFI[k].p/2);S.cash+=v;toast(`${OFI[k].e} Sold ${OFI[k].n} for ${fmt(v)}`);save()}}
  else if(a==="ofsellp"){const q=O.pl[+k];if(!q)return;O.pl.splice(+k,1);const v=Math.round(OFI[q.i].p/2);S.cash+=v;toast(`${OFI[q.i].e} Sold ${OFI[q.i].n} for ${fmt(v)}`);save();offBuild()}
  else if(a==="ofput"){if(O.own[k]>0)return ofHold({i:k,r:ofYawR()})}
  else{const q=O.pl[+k];if(!q)return;if(a==="ofrot")q.r=((q.r||0)+1)%4;else if(a==="ofmov"){O.pl.splice(+k,1);save();offBuild();return ofHold({i:q.i,r:q.r||0,was:q})}else if(a==="ofpick"){O.pl.splice(+k,1);O.own[q.i]=(O.own[q.i]||0)+1}save();offBuild()}
  fillOfs(msg)}
/* office computer: a desktop like the president's computer (wallpaper, app icons, live widgets, taskbar, lock screen).
   Apps: Contracts (each center's offers and active contracts, with the Center picker), Stock (every center's stock levels) and Production (opens the production dashboard for any city with sites). Apps open as windows you can drag, minimise and close. */
const OCAPPS=[["ct","📄","Contracts","#b45309"],["st","📦","Stock","#15803d"],["pd","🏭","Production","#7c3aed"],["rp","📊","Daily report","#0e7490"],["sx","📈","Stats","#be185d"]];
function ocCss(){if(document.getElementById("ocd-css"))return;const st=document.createElement("style");st.id="ocd-css";st.textContent=`
.lc3-pan.ocd{inset:0;width:auto;border-radius:0;border:0;background:#05080f;color:#fff;font-family:Figtree,ui-sans-serif,system-ui,sans-serif;z-index:30}
.ocd .ocd-wall{position:absolute;inset:0;background:radial-gradient(circle at 25% 20%,#1d4ed8 0,transparent 45%),radial-gradient(circle at 80% 85%,#b45309 0,transparent 40%),linear-gradient(160deg,#0b1736,#05080f);}
.ocd .ocd-wall::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}
.ocd .ocd-main{position:relative;flex:1;display:flex;gap:16px;min-height:0;padding:20px 16px 12px}
.ocd .ocd-grid{flex:1;min-width:0;display:grid;grid-template-columns:92px;justify-content:start;align-content:start;gap:8px;overflow:auto}
.ocd .ocd-sec{grid-column:1/-1;font:700 11px Figtree,sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin-top:6px;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.ocd .ocd-app{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px;border:0;border-radius:12px;background:transparent;color:#fff;cursor:pointer;font:600 12px Figtree,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.ocd .ocd-app:hover,.ocd .ocd-app:focus-visible{background:rgba(255,255,255,.14);outline:none}
.ocd .ocd-ic{width:54px;height:54px;border-radius:14px;display:grid;place-items:center;font-size:28px;box-shadow:0 6px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.25)}
.ocd .ocd-wid{width:270px;flex:0 0 270px;display:flex;flex-direction:column;gap:10px;overflow:auto}
.ocd .ocd-w{background:rgba(8,13,28,.72);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:12px 14px}
.ocd .ocd-w h4{margin:0 0 8px;font:700 11px Figtree,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.ocd .ocd-kv{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0}.ocd .ocd-kv b{font-variant-numeric:tabular-nums}
.ocd .ocd-bar{position:relative;display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(8,12,24,.9);backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.1)}
.ocd .ocd-bar>b{font-size:12px;white-space:nowrap}.ocd .ocd-tabs{display:flex;gap:4px;flex:1;min-width:0;overflow-x:auto}
.ocd .ocd-tab{flex:0 0 auto;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;border-radius:8px;padding:6px 10px;font:600 12px Figtree,sans-serif;cursor:pointer}.ocd .ocd-tab.on{background:rgba(96,165,250,.28);border-color:#60a5fa}.ocd .ocd-tab.min{opacity:.55}
.ocd .ocd-clk{font:600 12px ui-monospace,monospace;opacity:.85;white-space:nowrap}.ocd .ocd-x{border:0;border-radius:8px;background:#dc2626;color:#fff;font:700 12px Figtree,sans-serif;padding:7px 10px;cursor:pointer;white-space:nowrap}
.ocd .ocw{position:absolute;z-index:3;width:min(640px,calc(100% - 24px));max-height:calc(100% - 90px);display:flex;flex-direction:column;background:#0b1220;color:#e6ebf5;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12);overflow:hidden}
.ocd .ocw.f{z-index:4}.ocd .ocw .hd{display:flex;align-items:center;gap:8px;padding:9px 12px;background:#141d30;cursor:move;user-select:none;touch-action:none}.ocd .ocw .hd b{flex:1}
.ocd .ocw .hd button{border:0;background:#1c2840;color:#fff;border-radius:7px;width:28px;height:26px;cursor:pointer}.ocd .ocw .bd{overflow:auto;padding:8px 12px}
.ocd .ocd-lock{position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;text-align:center;padding:16px;background:rgba(3,7,18,.62);backdrop-filter:blur(8px)}
.ocd .ocd-lock .t{font:300 64px Figtree,sans-serif}.ocd .ocd-lock .s{font:700 12px ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;opacity:.75}
.ocd .ocd-lock .u{margin-top:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:8px 18px;font:600 14px Figtree,sans-serif}
@media (max-width:760px){.ocd .ocd-wid{display:none}.ocd .ocd-bar>b{display:none}.ocd .ocw{left:12px!important;top:12px!important}}`;document.head.appendChild(st)}
function ocPanel(){if(W.panel){W.panel.remove();W.panel=null}ocCss();const p=W.panel=document.createElement("div");p.className="lc3-pan ocd";W.el.appendChild(p);W.ocOn=true;W.ocC=W.ocC!=null&&S.lc[W.ocC]?W.ocC:W.city;
  W.oc={lock:true,w:{},f:null,pos:Object.assign({ct:[130,20],st:[200,70],pd:[270,120],rp:[340,60],sx:[160,40]},W.oc&&W.oc.pos)};
  let dr=null;p.addEventListener("pointerdown",e=>{const w=e.target.closest(".ocw");if(!w)return;const k=w.dataset.w;if(W.oc.f!==k){W.oc.f=k;p.querySelectorAll(".ocw").forEach(x=>x.classList.toggle("f",x===w))}if(!e.target.closest(".hd")||e.target.closest("button"))return;const r=w.getBoundingClientRect();dr={w,k,x:e.clientX-r.left,y:e.clientY-r.top};w.setPointerCapture(e.pointerId)});
  p.addEventListener("pointermove",e=>{if(!dr)return;const R=p.getBoundingClientRect(),x=Math.max(0,Math.min(R.width-120,e.clientX-R.left-dr.x)),y=Math.max(0,Math.min(R.height-90,e.clientY-R.top-dr.y));dr.w.style.left=x+"px";dr.w.style.top=y+"px";W.oc.pos[dr.k]=[x,y]});
  p.addEventListener("pointerup",()=>{dr=null});clearInterval(W.ocT);W.ocT=setInterval(()=>{if(W.panel!==p){clearInterval(W.ocT);return}const c=p.querySelector(".ocd-clk");if(c)c.textContent=ocClock()},15000);fillOc()}
const ocClock=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
function ocBody(tab){const ids=Object.keys(S.lc||{}).filter(id=>CITIES[id]&&LCO(id));let h="";const n=Date.now();
  if(tab==="sx")return ocStats(ids);
  if(tab==="rp"){const col=(t,R)=>{if(!R)return `<div class="ocd-w"><h4>${t}</h4><small style="color:#94a3b8">No data yet</small></div>`;const net=R.sold+R.ship+R.job-R.sp-R.th-(R.wg||0),kv=(a,b,neg)=>`<div class="ocd-kv"><span>${a}</span><b style="color:${neg&&b>0?"#fca5a5":"#e2e8f0"}">${neg&&b>0?"-":""}${fmt(b)}</b></div>`;
      return `<div class="ocd-w"><h4>${t} (day ${R.d})</h4>${kv("Sold from the center",R.sold)}${kv(`Forklift jobs (${R.jn})`,R.job)}${kv("Pallets shipped",R.ship)}${kv("Food spoiled",R.sp,1)}${kv("Stolen",R.th,1)}${kv("Wages",R.wg||0,1)}<div class="ocd-kv" style="border-top:1px solid #334155;margin-top:4px;padding-top:4px"><span>Net</span><b style="color:${net<0?"#fca5a5":"#86efac"}">${fmt(net)}</b></div></div>`};
    return ids.map(id=>{const L=LCO(id),c=CITIES[id];return `<h4 style="margin:8px 0 4px;color:#cbd5e1">${esc(c.name)}${String(id)===String(W.city)?" (here)":""}${lcWarn(c,L)?`<br><small style="color:#fbbf24">${esc(lcWarn(c,L).slice(3))}</small>`:""}</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${col("Today",L.rep&&L.rep.d===(S.day||0)?L.rep:null)}${col("Yesterday",L.prev)}</div>`}).join("")}
  if(tab==="pd"){const by={};for(const x of S.sites||[]){if(!CITIES[x.city])continue;const o=by[x.city]||(by[x.city]={n:0,cr:0,pa:0});o.n++;if(x.crew)o.cr++;if(x.paused)o.pa++}
    const cs=Object.keys(by).sort((a,b)=>(String(b)===String(W.city))-(String(a)===String(W.city))||by[b].n-by[a].n);
    return cs.length?`<p style="color:#94a3b8;font-size:12px;margin:4px 0 8px">Open the production dashboard for any city where you run production sites.</p><table><tbody>${cs.map(id=>{const o=by[id];return `<tr><td class="n"><b>${esc(CITIES[id].name)}</b>${String(id)===String(W.city)?" (here)":""}<br><small style="color:#94a3b8">${o.n} site${o.n>1?"s":""} · ${o.cr} with crew${o.pa?` · ${o.pa} paused`:""}</small></td><td style="text-align:right"><button class="mini" data-lc="ocpd" data-k="${id}">📊 Open dashboard</button></td></tr>`}).join("")}</tbody></table>`:`<p style="color:#94a3b8;font-size:12px">You don't run any production sites yet. Buy land for farms, mines or factories from a city's Land tab.</p>`}
  if(tab==="ct"){const c=CITIES[W.ocC],K=lcctOf(c),L=LCO(c.id);
    h+=`<div class="lc3-sort">Center: <select id="oc-c" aria-label="Logistics center">${ids.map(id=>`<option value="${id}" ${String(id)===String(W.ocC)?"selected":""}>${esc(CITIES[id].name)}</option>`).join("")}</select> <small>${K.ac.length}/3 active</small></div>`;
    h+=(L.ship&&L.ship.length?`<h4 style="margin:10px 0 4px;color:#cbd5e1">Trucks</h4>`+lcShipRows(c).map(t=>`<div style="font-size:13px;margin:3px 0">${esc(t)}</div>`).join(""):"");h+=`<h4 style="margin:10px 0 4px;color:#cbd5e1">Active contracts</h4>`+(K.ac.length?`<table><tbody>${K.ac.map(o=>{const T=lcctT(o.g),X=lcShipOf(c,o.id),ok=!!X&&X.st==="ready";return `<tr><td><b>${esc(T.n)} #${o.id}</b>: ${esc(G[o.g][0])} ${gq(o.q)}<br><small style="color:#94a3b8">Due in ${fmtDur(o.due-n)} · ${esc(X?lcShipTxt(X):"waiting for a dock")} · you have ${gq(L.inv[o.g]||0)} · miss it: ${lcctDev()?"no penalty (dev)":fmt(Math.round(o.pay*o.pen))}</small></td><td>${fmt(o.pay)}</td><td style="white-space:nowrap"><button class="mini" data-lc="octgive" data-k="${o.id}" ${ok?"":"disabled"} style="background:#15803d">Deliver</button><button class="mini g" data-lc="octdrop" data-k="${o.id}">Cancel</button></td></tr>`}).join("")}</tbody></table>`:`<p style="color:#94a3b8;font-size:12px">No active contracts here.</p>`);
    h+=`<h4 style="margin:12px 0 4px;color:#cbd5e1">Offers today</h4>`+(K.of.length?`<table><tbody>${K.of.map(o=>{const T=lcctT(o.g);return `<tr><td><b>${esc(T.n)}</b>: ${esc(G[o.g][0])} ${gq(o.q)}<br><small style="color:#94a3b8">${Math.round((T.pr-1)*100)}% over the local price · ${T.d} game day${T.d>1?"s":""} · ${Math.round(T.pen*100)}% penalty if missed</small></td><td>${fmt(o.pay)}</td><td><button class="mini" data-lc="octtake" data-k="${o.id}" ${K.ac.length>=3?"disabled":""}>Accept</button></td></tr>`}).join("")}</tbody></table>`:`<p style="color:#94a3b8;font-size:12px">${L.ord.length?"No new offers today. New ones come in every game day.":"Store goods in this center to get contract offers."}</p>`)}
  else{h+=ids.map(id=>{const c=CITIES[id],L=LCO(id),u=lcUsed(c),cp=lcCap(c),pc=Math.min(100,u/cp*100),its=L.ord.filter(g=>L.inv[g]>0);
      return `<div style="margin:10px 0;padding:8px;border:1px solid #334155;border-radius:8px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(c.name)}${String(id)===String(W.city)?" (here)":""}</b><small>Level ${L.lv} · ${fmtT(u)} / ${fmtT(cp)} · ${Math.round(pc)}%</small></div><div style="height:8px;background:#1e293b;border-radius:4px;margin:6px 0"><div style="height:8px;width:${pc}%;background:${pc>90?"#ef4444":pc>70?"#f59e0b":"#22c55e"};border-radius:4px"></div></div>${its.length?`<table><tbody>${its.map(g=>`<tr><td class="n">${esc(G[g][0])}</td><td>${gq(L.inv[g])}</td><td>${fmtT(L.inv[g]*tpu(g))}</td></tr>`).join("")}</tbody></table>`:`<small style="color:#94a3b8">Empty</small>`}</div>`}).join("")}
  return h}
function ocWidgets(){const ids=Object.keys(S.lc||{}).filter(id=>CITIES[id]&&LCO(id)),c=CITIES[W.ocC],K=lcctOf(c);let u=0,cp=0,ac=0;for(const id of ids){u+=lcUsed(CITIES[id]);cp+=lcCap(CITIES[id]);ac+=lcctOf(CITIES[id]).ac.length}
  const due=K.ac.slice().sort((a,b)=>a.due-b.due)[0];
  return `<div class="ocd-w"><h4>Treasury</h4><div class="ocd-kv"><span>Cash</span><b>${fmt(S.cash)}</b></div></div>
  <div class="ocd-w"><h4>${esc(c.name)} center</h4><div class="ocd-kv"><span>Active contracts</span><b>${K.ac.length}/3</b></div><div class="ocd-kv"><span>Offers today</span><b>${K.of.length}</b></div><div class="ocd-kv"><span>Next due</span><b>${due?fmtDur(due.due-Date.now()):"–"}</b></div><div class="ocd-kv"><span>Stored</span><b>${fmtT(lcUsed(c))} / ${fmtT(lcCap(c))}</b></div></div>
  <div class="ocd-w"><h4>Network</h4><div class="ocd-kv"><span>Centers</span><b>${ids.length}</b></div><div class="ocd-kv"><span>All contracts</span><b>${ac}</b></div><div class="ocd-kv"><span>Stored</span><b>${fmtT(u)} / ${fmtT(cp)}</b></div></div>`}
function fillOc(msg){const p=W.panel;if(!p||!W.ocOn||!W.oc)return;const O=W.oc,c=CITIES[W.ocC],keep={};p.querySelectorAll(".ocw").forEach(w=>{const b=w.querySelector(".bd");if(b)keep[w.dataset.w]=b.scrollTop});
  const ap=x=>`<button class="ocd-app" data-lc="ocapp" data-k="${x[0]}"><span class="ocd-ic" style="background:${x[3]}">${x[1]}</span>${x[2]}</button>`;
  const wins=OCAPPS.filter(x=>O.w[x[0]]);
  p.innerHTML=`<div class="ocd-wall"></div><div class="ocd-main"><div class="ocd-grid"><div class="ocd-sec">Logistics · ${esc(c.name)}</div>${OCAPPS.map(ap).join("")}</div><div class="ocd-wid">${ocWidgets()}</div></div>
  ${wins.filter(x=>O.w[x[0]]!=="min").map(x=>{const k=x[0],ps=O.pos[k]||[24,20];return `<div class="ocw${O.f===k?" f":""}" data-w="${k}" style="left:${ps[0]}px;top:${ps[1]}px" role="dialog" aria-label="${x[2]}"><div class="hd"><span>${x[1]}</span><b>${x[2]}</b><button data-lc="ocmin" data-k="${k}" aria-label="Minimise">–</button><button data-lc="ocwx" data-k="${k}" aria-label="Close">✕</button></div><div class="bd">${msg&&O.f===k?`<p style="color:#fca5a5">${esc(msg)}</p>`:""}${ocBody(k)}</div></div>`}).join("")}
  <div class="ocd-bar"><b>🏢 Logistics Office</b><div class="ocd-tabs">${wins.map(x=>`<button class="ocd-tab${O.f===x[0]&&O.w[x[0]]!=="min"?" on":""}${O.w[x[0]]==="min"?" min":""}" data-lc="octab" data-k="${x[0]}">${x[1]} ${x[2]}</button>`).join("")}</div><span class="ocd-clk">${ocClock()}</span><button class="ocd-x" data-lc="xp">Shut down</button></div>
  ${O.lock?`<div class="ocd-lock" data-lc="ocun" role="button" tabindex="0" aria-label="Unlock"><div class="s">${esc(c.name)} · Logistics Center · Office Terminal</div><div class="t">${ocClock()}</div><div>${new Date().toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})}</div><div class="u">🔐 Click to sign in</div></div>`:""}`;
  p.querySelectorAll(".ocw").forEach(w=>{const b=w.querySelector(".bd");if(b&&keep[w.dataset.w])b.scrollTop=keep[w.dataset.w]})}
function ocAct(a,b){const O=W.oc;if(!O)return;const k=b.dataset.k;
  if(a==="ocpd"){const c=CITIES[k];if(c&&typeof pdOpen==="function"){try{pdOpen(c)}finally{const w=document.getElementById("pdw");if(w)w.style.zIndex="2147483001"}}return}
  if(a==="ocun")O.lock=false;
  else if(a==="ocapp"){O.w[k]=1;O.f=k}
  else if(a==="ocmin"){O.w[k]="min";if(O.f===k)O.f=null}
  else if(a==="ocwx"){delete O.w[k];if(O.f===k)O.f=null}
  else if(a==="octab"){if(O.w[k]==="min"||O.f!==k){O.w[k]=1;O.f=k}else{O.w[k]="min";O.f=null}}
  else{O.f="ct";const e=lcctAct(CITIES[W.ocC],a.slice(3),+k);sub();return fillOc(e)}fillOc()}
return {open,close,_w:()=>W};
})()
