/* Meridian: Station Aurora bunker (lazy part). The walkable inside of the Antarctica secret facility, for DEV_UIDS and MODERATORS only.
   Loaded the first time the bunker opens, from index.html. Run with a direct eval inside the game's main closure, so it sees every game variable.
   Keep it a single expression that returns the functions index.html calls. */
(function(){
/* room in tiles (1 tile = 1 m). Walls are solid; furniture boxes block walking. */
const W=26,D=18,T=34;
const FURN=[
 {k:"board",x:8,y:.15,w:10,d:.5,c:"#1e293b",n:"Mission board"},
 {k:"desk",x:8.5,y:6.5,w:9,d:3.2,c:"#3f2a1d",n:"Conference desk"},
 {k:"pc",x:.2,y:3,w:1.1,d:1.6,c:"#0f172a",n:"Computer 1"},{k:"pc",x:.2,y:6,w:1.1,d:1.6,c:"#0f172a",n:"Computer 2"},{k:"pc",x:.2,y:9,w:1.1,d:1.6,c:"#0f172a",n:"Computer 3"},
 {k:"pc",x:W-1.3,y:3,w:1.1,d:1.6,c:"#0f172a",n:"Computer 4"},{k:"pc",x:W-1.3,y:6,w:1.1,d:1.6,c:"#0f172a",n:"Computer 5"},{k:"pc",x:W-1.3,y:9,w:1.1,d:1.6,c:"#0f172a",n:"Computer 6"},
 {k:"rack",x:.2,y:13,w:1.4,d:3.5,c:"#111827",n:"Server racks"},{k:"rack",x:W-1.6,y:13,w:1.4,d:3.5,c:"#111827",n:"Server racks"},
 {k:"crate",x:4,y:15.5,w:1.4,d:1.4,c:"#4d5b3a"},{k:"crate",x:5.6,y:15.8,w:1.1,d:1.1,c:"#4d5b3a"},{k:"crate",x:20,y:15.5,w:1.4,d:1.4,c:"#4d5b3a"}];
const CHAIRS=[];for(let i=0;i<5;i++){CHAIRS.push([9.4+i*1.8,5.8],[9.4+i*1.8,10.4])}CHAIRS.push([7.7,8.1],[18.3,8.1]);
const EXIT={x:13,y:D-.4,n:"Exit hatch"};
/* live presence: bunker/{uid} docs {uid,name,x,y,d,at}; only cleared accounts can read or write them (firestore.rules) */
const BP={un:null,others:[],last:0,lx:0,ly:0};
const onl=()=>typeof ON!=="undefined"&&ON.db&&ON.user;
function bpSend(force){if(!onl())return;const n=Date.now();if(!force&&n-BP.last<(Math.abs(B.x-BP.lx)+Math.abs(B.y-BP.ly)>.05?400:10000))return;BP.last=n;BP.lx=B.x;BP.ly=B.y;
  try{ON.db.collection("bunker").doc(ON.user.uid).set({uid:ON.user.uid,name:String(S.name||"Player").slice(0,20),x:Math.round(B.x*100)/100,y:Math.round(B.y*100)/100,d:B.dir,at:firebase.firestore.FieldValue.serverTimestamp()}).catch(e=>console.warn("bunker",e))}catch(e){}}
function bpListen(){if(!onl()||BP.un)return;try{BP.un=ON.db.collection("bunker").limit(50).onSnapshot(q=>{const now=Date.now(),a=[];q.forEach(d=>{const v=d.data()||{};if(d.id===ON.user.uid)return;const at=v.at&&v.at.toMillis?v.at.toMillis():0;if(now-at>45000)return;const o=BP.others.find(x=>x.uid===d.id);a.push({uid:d.id,name:String(v.name||"Player"),x:+v.x||13,y:+v.y||14,d:v.d||1,dx:o?o.dx:+v.x,dy:o?o.dy:+v.y})});BP.others=a},e=>console.warn("bunker listen",e))}catch(e){}}
function bpStop(){try{if(BP.un)BP.un();BP.un=null;BP.others=[];if(onl())ON.db.collection("bunker").doc(ON.user.uid).delete().catch(()=>{})}catch(e){}}
const B={el:null,cv:null,x:13,y:14,dir:1,step:0,keys:{},joy:null,target:null,near:null,raf:0,panel:null,t0:0};
const st=()=>{S.ant=S.ant||{};const a=S.ant;if(!a.ms)a.ms=[{id:1,t:"Secure the Antarctic perimeter",p:"high",done:0},{id:2,t:"Audit the top 10 player fortunes",p:"normal",done:0},{id:3,t:"Review open wars for rule breaks",p:"normal",done:0}];if(!a.notes)a.notes=[];return a};
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function css(){if(document.getElementById("bk-css"))return;const s=document.createElement("style");s.id="bk-css";s.textContent=`
.bk-win{position:fixed;inset:0;z-index:2147483000;background:#05080c;display:flex;flex-direction:column;font:13px system-ui,sans-serif;color:#e2e8f0}
.bk-top{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#0b1220;border-bottom:1px solid #1e3a4a}
.bk-top b{color:#67e8f9;letter-spacing:.06em}.bk-top span{color:#94a3b8;font-size:12px;flex:1}
.bk-top button,.bk-btn{background:#0e7490;color:#fff;border:0;border-radius:6px;padding:7px 12px;font:600 12px system-ui;cursor:pointer}
.bk-stage{position:relative;flex:1;min-height:0}.bk-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;outline:none}
.bk-joy{position:absolute;left:14px;bottom:14px;width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.3);touch-action:none}
.bk-joy i{position:absolute;left:30px;top:30px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.7)}
.bk-act{position:absolute;right:14px;bottom:14px}.bk-hint{position:absolute;left:14px;top:10px;font:600 11px ui-monospace,monospace;color:#a5f3fc;opacity:.85;pointer-events:none}
.bk-pan{position:absolute;right:14px;top:14px;width:min(380px,calc(100% - 28px));max-height:calc(100% - 90px);overflow:auto;background:#0b1220f2;border:1px solid #155e75;border-radius:10px;padding:12px 14px;box-shadow:0 10px 40px #000a}
.bk-pan h3{margin:0 0 8px;color:#67e8f9;font-size:15px;display:flex;justify-content:space-between;align-items:center}.bk-pan h3 button{background:none;border:0;color:#94a3b8;font-size:18px;cursor:pointer}
.bk-row{display:flex;gap:8px;align-items:center;padding:7px 0;border-top:1px solid #1e293b}.bk-row span{flex:1}.bk-row small{color:#94a3b8;display:block}
.bk-pan input,.bk-pan textarea,.bk-pan select{width:100%;box-sizing:border-box;background:#020617;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:7px;font:13px system-ui;margin:4px 0}
.bk-tag{font:700 10px system-ui;padding:2px 6px;border-radius:4px;background:#334155}.bk-tag.high{background:#991b1b}.bk-done{opacity:.5;text-decoration:line-through}
.bk-mono{font:12px ui-monospace,monospace;color:#86efac;white-space:pre-wrap;background:#020617;border-radius:6px;padding:8px;margin:0}
@media (max-width:560px){.bk-pan{top:auto;bottom:120px;max-height:45%}}`;document.head.appendChild(s)}
function open(){css();if(!B.el){const el=B.el=document.createElement("div");el.className="bk-win";el.setAttribute("role","dialog");el.setAttribute("aria-label",ANT.n+" bunker");
  el.innerHTML=`<div class="bk-top"><b>❄ ${esc(ANT.n.toUpperCase())}</b><span>Classified bunker · ${devGod()?"Developer":"Moderator"} clearance</span><button data-bk="close">Exit</button></div>
  <div class="bk-stage"><canvas tabindex="0" aria-label="Bunker. Walk with the arrow keys, WASD, the joystick or by tapping the floor. Press E or the button to use a station."></canvas>
  <div class="bk-joy"><i></i></div><div class="bk-act"><button class="bk-btn" data-bk="use" hidden></button></div><div class="bk-hint">WASD / ARROWS · E TO USE · TAP TO WALK</div></div>`;
  document.body.appendChild(el);B.cv=el.querySelector("canvas");B.btn=el.querySelector('[data-bk="use"]');B.stage=el.querySelector(".bk-stage");
  const joy=el.querySelector(".bk-joy"),kn=joy.firstChild,jr=48;let jid=null;
  const jm=e=>{const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+jr),dy=e.clientY-(r.top+jr);const m=Math.hypot(dx,dy);if(m>jr){dx*=jr/m;dy*=jr/m}kn.style.left=30+dx+"px";kn.style.top=30+dy+"px";B.joy={x:dx/jr,y:dy/jr};B.target=null};
  joy.addEventListener("pointerdown",e=>{jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});joy.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
  const je=()=>{jid=null;B.joy=null;kn.style.left="30px";kn.style.top="30px"};joy.addEventListener("pointerup",je);joy.addEventListener("pointercancel",je);
  B.cv.addEventListener("pointerdown",e=>{const r=B.cv.getBoundingClientRect(),v=view(),wx=(e.clientX-r.left-v.ox)/v.s,wy=(e.clientY-r.top-v.oy)/v.s;if(wx>=0&&wy>=0&&wx<=W&&wy<=D)B.target={x:wx,y:wy};B.cv.focus()});
  el.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select"))return;const k=e.key.toLowerCase();if(k==="e"||k==="enter"){use();e.preventDefault();return}if(k==="escape"){if(B.panel)panel(null);else close();return}B.keys[k]=1;if(k.startsWith("arrow"))e.preventDefault()});
  el.addEventListener("keyup",e=>{B.keys[e.key.toLowerCase()]=0});
  el.addEventListener("click",e=>{const b=e.target.closest("[data-bk]");if(!b)return;act(b.dataset.bk,b.dataset.v,b)})}
  B.el.style.display="flex";B.x=13;B.y=14;B.t0=performance.now();panel(null);if(!B.raf)B.raf=requestAnimationFrame(loop);bpListen();bpSend(1);setTimeout(()=>B.cv&&B.cv.focus(),30)}
function close(){if(B.el)B.el.style.display="none";cancelAnimationFrame(B.raf);B.raf=0;B.keys={};B.joy=null;bpStop();save()}
function view(){const r=B.cv.getBoundingClientRect(),pad=16,s=Math.min((r.width-pad*2)/W,(r.height-pad*2)/D);return{s,ox:(r.width-W*s)/2,oy:(r.height-D*s)/2,w:r.width,h:r.height}}
const hit=(x,y)=>{const R=.32;if(x<R+.25||y<R+.7||x>W-R-.25||y>D-R-.25)return true;for(const f of FURN)if(x>f.x-R&&x<f.x+f.w+R&&y>f.y-R&&y<f.y+f.d+R)return true;return false};
function nearest(){let best=null,bd=1.6;for(const f of FURN){if(!f.n)continue;const cx=Math.max(f.x,Math.min(B.x,f.x+f.w)),cy=Math.max(f.y,Math.min(B.y,f.y+f.d)),d=Math.hypot(B.x-cx,B.y-cy);if(d<bd){bd=d;best=f}}
  if(Math.hypot(B.x-EXIT.x,B.y-EXIT.y)<1.8)best=EXIT;return best}
function loop(t){B.raf=requestAnimationFrame(loop);if(!B.el||B.el.style.display==="none")return;
  let vx=0,vy=0;const K=B.keys;if(K.arrowleft||K.a)vx--;if(K.arrowright||K.d)vx++;if(K.arrowup||K.w)vy--;if(K.arrowdown||K.s)vy++;
  if(B.joy){vx=B.joy.x;vy=B.joy.y}if((vx||vy)&&!B.joy)B.target=null;
  if(B.target&&!vx&&!vy){const dx=B.target.x-B.x,dy=B.target.y-B.y,m=Math.hypot(dx,dy);if(m<.15)B.target=null;else{vx=dx/m;vy=dy/m}}
  const m=Math.hypot(vx,vy);if(m>1){vx/=m;vy/=m}const sp=.085;
  if(m>.05){const nx=B.x+vx*sp,ny=B.y+vy*sp;let moved=false;if(!hit(nx,B.y)){B.x=nx;moved=true}if(!hit(B.x,ny)){B.y=ny;moved=true}if(!moved)B.target=null;B.step+=.2;if(Math.abs(vx)>.2)B.dir=vx>0?1:-1}
  const n=nearest();if(n!==B.near){B.near=n;B.btn.hidden=!n;if(n)B.btn.textContent=n===EXIT?"🛫 Exit hatch":"Use "+n.n}
  bpSend();draw(t)}
function draw(t){const cv=B.cv,v=view(),dpr=Math.min(2,devicePixelRatio||1);if(cv.width!==Math.round(v.w*dpr)){cv.width=Math.round(v.w*dpr);cv.height=Math.round(v.h*dpr)}
  const g=cv.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#05080c";g.fillRect(0,0,v.w,v.h);g.save();g.translate(v.ox,v.oy);const s=v.s,R=(x,y,w,d,c)=>{g.fillStyle=c;g.fillRect(x*s,y*s,w*s,d*s)};
  // concrete floor with grid and hazard strip
  R(0,0,W,D,"#1c232b");g.strokeStyle="#252e38";g.lineWidth=1;for(let i=1;i<W;i++){g.beginPath();g.moveTo(i*s,0);g.lineTo(i*s,D*s);g.stroke()}for(let j=1;j<D;j++){g.beginPath();g.moveTo(0,j*s);g.lineTo(W*s,j*s);g.stroke()}
  R(4,4.2,18,7.6,"#1a2a33");g.strokeStyle="#0e7490";g.lineWidth=2;g.strokeRect(4*s,4.2*s,18*s,7.6*s);
  for(let i=0;i<14;i++){g.fillStyle=i%2?"#facc15":"#111";g.fillRect((EXIT.x-2.5+i*5/14)*s,(D-.9)*s,5/14*s+.5,.25*s)}
  // walls
  g.fillStyle="#3b4652";g.fillRect(-.25*s,-.25*s,(W+.5)*s,.6*s);g.fillRect(-.25*s,-.25*s,.5*s,(D+.5)*s);g.fillRect((W-.25)*s,-.25*s,.5*s,(D+.5)*s);g.fillRect(-.25*s,(D-.25)*s,(W+.5)*s,.5*s);
  R(EXIT.x-1.2,D-.3,2.4,.4,"#64748b");g.fillStyle="#fde68a";g.font=`700 ${Math.max(8,s*.35)}px system-ui`;g.textAlign="center";g.fillText("EXIT",EXIT.x*s,(D-.45)*s);
  // ceiling lights glow
  for(const [lx,ly] of [[6,3],[13,3],[20,3],[6,13],[13,13],[20,13]]){const gr=g.createRadialGradient(lx*s,ly*s,0,lx*s,ly*s,4*s);gr.addColorStop(0,"rgba(103,232,249,.10)");gr.addColorStop(1,"rgba(103,232,249,0)");g.fillStyle=gr;g.fillRect((lx-4)*s,(ly-4)*s,8*s,8*s)}
  // chairs
  for(const [cx,cy] of CHAIRS){g.fillStyle="#111827";g.beginPath();g.arc(cx*s,cy*s,.42*s,0,7);g.fill();g.strokeStyle="#334155";g.stroke()}
  const blink=Math.floor(t/500)%2;
  for(const f of FURN){R(f.x,f.y,f.w,f.d,f.c);g.strokeStyle=B.near===f?"#67e8f9":"#00000088";g.lineWidth=B.near===f?2:1;g.strokeRect(f.x*s,f.y*s,f.w*s,f.d*s);
    if(f.k==="desk"){R(f.x+.25,f.y+.25,f.w-.5,f.d-.5,"#5b3b26");for(let i=0;i<5;i++){R(f.x+.7+i*1.8,f.y+.35,.7,.45,"#cbd5e1");R(f.x+.7+i*1.8,f.y+f.d-.8,.7,.45,"#cbd5e1")}g.fillStyle="#67e8f9";g.globalAlpha=.25+.15*blink;g.beginPath();g.ellipse((f.x+f.w/2)*s,(f.y+f.d/2)*s,1.6*s,.8*s,0,0,7);g.fill();g.globalAlpha=1}
    if(f.k==="board"){R(f.x+.2,f.y+.1,f.w-.4,f.d-.15,"#0f3a4a");const a=st(),ms=a.ms.filter(m=>!m.done).slice(0,4);g.fillStyle="#a5f3fc";g.font=`700 ${Math.max(7,s*.28)}px ui-monospace,monospace`;g.textAlign="left";g.fillText("MISSIONS · "+ms.length+" OPEN",(f.x+.4)*s,(f.y+.42)*s)}
    if(f.k==="pc"){const left=f.x<W/2;R(left?f.x+.65:f.x+.1,f.y+.2,.35,f.d-.4,blink?"#22d3ee":"#0891b2");R(left?f.x+.15:f.x+.55,f.y+.5,.35,f.d-1,"#334155")}
    if(f.k==="rack")for(let i=0;i<6;i++){g.fillStyle=(i+Math.floor(t/300))%3?"#22c55e":"#ef4444";g.fillRect((f.x+.3)*s,(f.y+.3+i*.5)*s,.2*s,.15*s)}}
  // labels
  g.font=`600 ${Math.max(8,s*.32)}px system-ui`;g.textAlign="center";g.fillStyle="#94a3b8";g.fillText("CONFERENCE",13*s,12.4*s);g.fillText("COMPUTERS",1.5*s,2.6*s);g.fillText("COMPUTERS",(W-1.5)*s,2.6*s);
  // other players inside (smoothed toward their last sent spot)
  for(const o of BP.others){o.dx+=(o.x-o.dx)*.15;o.dy+=(o.y-o.dy)*.15;g.fillStyle="#00000066";g.beginPath();g.ellipse(o.dx*s,(o.dy+.25)*s,.35*s,.15*s,0,0,7);g.fill();g.fillStyle=devUid(o.uid)?"#f59e0b":"#0891b2";g.beginPath();g.arc(o.dx*s,(o.dy-.05)*s,.32*s,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=2;g.stroke();g.fillStyle="#fff";g.font=`600 ${Math.max(8,s*.3)}px system-ui`;g.textAlign="center";g.fillText(o.name,o.dx*s,(o.dy-.55)*s)}
  g.fillStyle="#94a3b8";g.textAlign="right";g.font=`600 ${Math.max(8,s*.3)}px system-ui`;g.fillText(onl()?`${BP.others.length+1} INSIDE`:"OFFLINE · SIGN IN TO SEE OTHERS",(W-.6)*s,(D-1.1)*s);
  // player
  const bob=Math.sin(B.step)*.04;g.fillStyle="#00000066";g.beginPath();g.ellipse(B.x*s,(B.y+.25)*s,.35*s,.15*s,0,0,7);g.fill();
  g.fillStyle="#be185d";g.beginPath();g.arc(B.x*s,(B.y-.05+bob)*s,.32*s,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=2;g.stroke();g.fillStyle="#fff";g.beginPath();g.arc((B.x+B.dir*.13)*s,(B.y-.12+bob)*s,.07*s,0,7);g.fill();
  g.restore()}
function use(){const n=B.near;if(!n)return;if(n===EXIT){close();return}panel(n.k)}
function panel(k){if(B.panel&&B.panel.parentNode)B.panel.remove();B.panel=null;if(!k)return;const p=B.panel=document.createElement("div");p.className="bk-pan";B.stage.appendChild(p);fill(k)}
function fill(k){const p=B.panel;if(!p)return;p.dataset.k=k;const a=st(),h3=t=>`<h3>${t}<button data-bk="pclose" aria-label="Close">×</button></h3>`;
  if(k==="board"){p.innerHTML=h3("📋 Mission board")+`<input id="bkmt" placeholder="New mission…" maxlength="80"><div style="display:flex;gap:6px"><select id="bkmp" style="flex:1"><option value="normal">Normal</option><option value="high">High priority</option></select><button class="bk-btn" data-bk="madd">Post</button></div>`
    +(a.ms.length?a.ms.map(m=>`<div class="bk-row"><span class="${m.done?"bk-done":""}">${esc(m.t)}</span><span class="bk-tag ${m.p}" style="flex:0">${m.p==="high"?"HIGH":"NORMAL"}</span><button class="bk-btn" data-bk="mdone" data-v="${m.id}">${m.done?"Reopen":"Done"}</button><button class="bk-btn" style="background:#7f1d1d" data-bk="mdel" data-v="${m.id}" aria-label="Delete">✕</button></div>`).join(""):`<p>No missions yet.</p>`)
    +`<p style="color:#94a3b8;font-size:11px">Missions are saved on this device for now.</p>`}
  else if(k==="pc"){const cs=CITIES.length;let rich="";try{const L=(typeof ON!=="undefined"&&ON.lb)||[];rich=L.slice(0,5).map((x,i)=>`${i+1}. ${x.name||"?"}  ${fmt(x.nw||0)}`).join("\n")}catch(e){}
    let wars=0;try{wars=Object.keys((S.pol&&S.pol.mil&&S.pol.mil.wars)||{}).length}catch(e){}
    p.innerHTML=h3("🖥 Aurora terminal")+`<pre class="bk-mono">&gt; AURORA OS v1.0  [${devGod()?"DEV":"MOD"}]
&gt; uplink ......... OK
&gt; cities tracked .. ${cs}
&gt; your wars ....... ${wars}
&gt; your cash ....... ${fmt(S.cash)}
&gt; moderators ...... ${Object.keys(MODERATORS).length}
${rich?"&gt; top players\n"+esc(rich):"&gt; leaderboard ..... offline"}</pre><p style="color:#94a3b8;font-size:11px">More terminal tools come next.</p>`}
  else if(k==="desk"){p.innerHTML=h3("🪑 Conference desk")+`<p style="margin:0 0 6px;color:#cbd5e1">Briefing notes for the moderator team.</p><textarea id="bkn" rows="3" maxlength="300" placeholder="Write a briefing note…"></textarea><button class="bk-btn" data-bk="nadd">Add note</button>`
    +(a.notes.length?a.notes.slice().reverse().map(n=>`<div class="bk-row"><span>${esc(n.t)}<small>${new Date(n.at).toLocaleString()}</small></span><button class="bk-btn" style="background:#7f1d1d" data-bk="ndel" data-v="${n.at}" aria-label="Delete">✕</button></div>`).join(""):`<p style="color:#94a3b8">No notes yet.</p>`)
    +`<p style="color:#94a3b8;font-size:11px">Notes are saved on this device for now.</p>`}
  else if(k==="rack"){p.innerHTML=h3("🗄 Server racks")+`<pre class="bk-mono">ALL SYSTEMS NOMINAL\nTEMP  -41°C outside · 19°C inside\nPOWER geothermal 100%</pre>`}}
function act(a,v,b){const s=st();
  if(a==="close"){close();return}if(a==="use"){use();return}if(a==="pclose"){panel(null);return}
  if(a==="madd"){const i=B.panel.querySelector("#bkmt"),t=i.value.trim();if(!t)return;s.ms.push({id:s.ms.reduce((m,x)=>Math.max(m,x.id),0)+1,t,p:B.panel.querySelector("#bkmp").value,done:0});save();fill("board");return}
  if(a==="mdone"){const m=s.ms.find(x=>x.id===+v);if(m)m.done=m.done?0:1;save();fill("board");return}
  if(a==="mdel"){s.ms=s.ms.filter(x=>x.id!==+v);save();fill("board");return}
  if(a==="nadd"){const t=B.panel.querySelector("#bkn").value.trim();if(!t)return;s.notes.push({t,at:Date.now()});if(s.notes.length>50)s.notes.shift();save();fill("desk");return}
  if(a==="ndel"){s.notes=s.notes.filter(n=>n.at!==+v);save();fill("desk");return}}
return {open,close,others:()=>BP.others};
})()
