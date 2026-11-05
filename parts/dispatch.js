/* Meridian: fleet dispatch window (lazy part). Loaded the first time the dispatch window opens, from index.html.
   It is run with a direct eval inside the game's main closure, so it sees every game variable exactly as if it were still inline.
   Keep it a single expression that returns the functions index.html calls. */
(function(){
function dvCss(){if(document.getElementById("dv-css"))return;const st=document.createElement("style");st.id="dv-css";st.textContent=`
.dv .lx-btn{min-height:40px}
.dv .lx-btn[aria-disabled="true"]{opacity:.45;cursor:default}
.dv .lx-btn.on{background:#16a34a;color:#fff;border-color:#16a34a}
.mdx-win .mdx-kpis.dv-k{grid-template-columns:repeat(5,minmax(0,1fr))}
.dv-k .mdx-card{padding:14px;min-width:0}
.dv-k span{display:block;font:600 12px Figtree,sans-serif;color:var(--dxmut)}
.dv-k b{display:block;font:800 21px/1.2 Figtree,sans-serif;letter-spacing:-.02em;margin-top:2px;color:var(--dxink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dv-k small{display:block;font:500 11.5px Figtree,sans-serif;color:var(--dxmut2);margin-top:2px}
.dv-k .lx-btn{margin-top:6px;width:100%}
.dv-vd>summary{cursor:pointer;list-style:none}.dv-vd>summary::-webkit-details-marker{display:none}.dv-chev{margin-left:auto;transition:transform .2s}.dv-vd:not([open]) .dv-chev{transform:rotate(-90deg)}
.dv-veh{display:grid;grid-template-columns:minmax(150px,1fr) 2fr 2fr 140px;gap:12px;align-items:center;border-top:1px solid rgba(127,140,200,.3);padding:10px 0}.dv-veh>div>small,.dv-up small{display:block}.dv-up{display:flex;flex-direction:column;gap:3px;min-width:0}.dv-up2{grid-column:span 2}
@media(max-width:700px){.dv-veh{grid-template-columns:1fr}.dv-up2{grid-column:auto}}
.dv-tbl{width:100%;border-collapse:collapse;font:500 13px Figtree,sans-serif}
.dv-tbl th{text-align:left;font-weight:600;color:var(--dxmut);font-size:12px;padding:6px 8px;background:var(--dxsoft);white-space:nowrap}
.dv-tbl th:first-child{border-radius:8px 0 0 8px}.dv-tbl th:last-child{border-radius:0 8px 8px 0;text-align:right}
.dv-tbl td{padding:10px 8px;border-bottom:1px solid var(--dxline);color:var(--dxink3);vertical-align:middle;min-width:0}
.dv-tbl tr:last-child td{border-bottom:0}
.dv-tbl td b{color:var(--dxink);font-weight:700}
.dv-tbl td small{display:block;color:var(--dxmut2);font-size:11.5px;margin-top:1px;overflow-wrap:anywhere}
.dv-tbl .dv-a{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.dv-tbl .lx-bar{width:100%;min-width:90px}
.dv-tbl tr.dv-ed td{background:var(--dxsoft)}
.dv-st{display:inline-block;font:700 11px Figtree,sans-serif;padding:2px 8px;border-radius:999px;background:var(--dxsoft);color:var(--dxink3);white-space:nowrap}
.dv-st.o{background:#e0ecff;color:#1d4ed8}.dv-st.l{background:#fef3c7;color:#b45309}.dv-st.r{background:#f3e8ff;color:#9333ea}.dv-st.p{background:#fee2e2;color:#b91c1c}.dv-st.k{background:#dcfce7;color:#15803d}
.dv-eta{font-variant-numeric:tabular-nums;font-weight:700;color:var(--dxink)}
.dv-edf{display:flex;gap:8px;flex-wrap:wrap;align-items:end}
.dv-edf label{display:grid;gap:4px;font:600 12px Figtree,sans-serif;color:var(--dxmut);flex:1;min-width:120px}
.dv-chk{display:flex!important;align-items:center;gap:8px;font:600 13px Figtree,sans-serif!important;color:var(--dxink2)!important;min-height:40px}
.dv-chk input{width:20px;height:20px}
.dv-cf{border:2px solid var(--dxink);border-radius:14px;padding:12px}
.dv-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:start}
@container (max-width:900px){.mdx-win .mdx-kpis.dv-k{grid-template-columns:repeat(3,minmax(0,1fr))}.dv-two{grid-template-columns:minmax(0,1fr)}}
@container (max-width:700px){.mdx-win .mdx-kpis.dv-k{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.dv-k .mdx-card{padding:12px}.dv-k b{font-size:18px}
 .dv-tbl thead{display:none}.dv-tbl,.dv-tbl tbody{display:block}
 .dv-tbl tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 12px;padding:12px 0;border-bottom:1px solid var(--dxline)}
 .dv-tbl tr:last-child{border-bottom:0}.dv-tbl td{border:0;padding:0}.dv-tbl td.dv-w{grid-column:1/-1}
 .dv-tbl td[data-l]::before{content:attr(data-l);display:block;font:600 11px Figtree,sans-serif;color:var(--dxmut);margin-bottom:1px}
 .dv-tbl .dv-a{justify-content:flex-start}.dv-tbl tr.dv-ed{padding:10px;border-radius:12px;background:var(--dxsoft)}.dv-tbl tr.dv-ed td{background:none}}
`;document.head.appendChild(st)}
function dvOpen(){if(!document.getElementById("mdx-css")){const st=document.createElement("style");st.id="mdx-css";st.textContent=DXCSS;document.head.appendChild(st)}lxCss();dvCss();
  if(!DV.el){const el=DV.el=document.createElement("div");el.className="mdx-win mx-win dv";el.setAttribute("role","dialog");el.setAttribute("aria-label","Deliveries dashboard");document.body.appendChild(el);
    el.addEventListener("click",e=>{const b=e.target.closest("[data-dv]");if(!b||b.disabled)return;try{dvAct(b.dataset.dv,b)}catch(err){console.warn("dv",err)}});
    el.addEventListener("change",e=>{const t=e.target;if(!t.dataset)return;try{if(t.dataset.dvf)dvSetF(t.dataset.dvf,t.type==="checkbox"?t.checked:t.value);else if(t.dataset.dve&&DV.ed){DV.ed[t.dataset.dve]=t.value;dvRender(true)}}catch(err){console.warn("dv",err)}});
    el.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.dvf==="q"){DV.f.q=+t.value||0;const x=el.querySelector("#dv-est");if(x)x.innerHTML=dvEstHtml(dvForm())}else if(t.dataset&&t.dataset.dve==="q"&&DV.ed)DV.ed.q=t.value});mdxMove(el,DV)}
  const vw=innerWidth,vh=innerHeight,el=DV.el;if(vw<560){el.classList.add("mdx-full");Object.assign(el.style,{left:"0px",top:"0px",width:vw+"px",height:vh+"px"})}
  else{el.classList.remove("mdx-full");const w=Math.min(1180,vw-48),h=Math.min(820,vh-48);Object.assign(el.style,mdxAt(DV,w,h),{width:w+"px",height:h+"px"})}
  el.innerHTML=`<div class="mdx-bar"><span class="mdx-logo" style="background:#1d4ed8;font-size:15px">🚚</span><b>Deliveries</b><button class="mdx-th" data-dv="theme" aria-label="Switch light or dark theme" style="margin-left:auto">${themeIco()}</button><button class="mdx-x" data-dv="close" aria-label="Close dashboard">×</button></div>
  <div class="mdx-body"><div class="mdx-in"><div class="mdx-hd"><h2>Deliveries <span>🚚</span></h2><div class="mdx-date"><span class="mdx-live"></span>Live · cash <b id="dv-cash" style="margin-left:4px"></b></div></div><div id="dv-main" style="display:flex;flex-direction:column;gap:16px"></div></div></div>`;
  el.style.display="flex";DV.open=true;DV.note="";DV.arm=null;DV.f.cf=false;dvRender(true);
  clearInterval(DV.iv);DV.iv=setInterval(()=>{if(!DV.open)return clearInterval(DV.iv);if(document.hidden)return;dvRender(false)},1000)}
function dvClose(){DV.open=false;clearInterval(DV.iv);DV.ed=null;if(DV.el)DV.el.style.display="none"}
addEventListener("resize",()=>{if(DV.open&&DV.el)dvOpen()});
const dvBusy=()=>!!(DV.el&&document.activeElement&&DV.el.contains(document.activeElement)&&/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName));
function dvRender(force){if(!DV.el)return;const main=DV.el.querySelector("#dv-main");if(!main)return;
  if(DV.arm&&Date.now()-DV.armT>4000)DV.arm=null;
  if(!force&&dvBusy()){dvLive();return}
  let h;try{h=dvPage()}catch(e){console.warn("dv",e);h=`<div class="mdx-card"><div class="mdx-empty">The deliveries page hit a snag (${dxE(e.message)}). Close and reopen it.</div></div>`}
  if(force||h!==main._h){const sb=DV.el.querySelector(".mdx-body"),y=sb?sb.scrollTop:0;main._h=h;main.innerHTML=h;if(sb)sb.scrollTop=y}dvLive()}
function dvLive(){if(!DV.el)return;const now=Date.now();
  DV.el.querySelectorAll("[data-eta]").forEach(x=>{const t=+x.dataset.eta-now;x.textContent=t>0?fmtDur(t).replace(/^0 min$/,"<1 min"):"arriving"});
  DV.el.querySelectorAll("[data-pg]").forEach(x=>{const [d,a]=x.dataset.pg.split(",").map(Number);x.style.width=Math.max(0,Math.min(100,(now-d)/Math.max(1,a-d)*100)).toFixed(1)+"%"});
  const c=DV.el.querySelector("#dv-cash");if(c)c.textContent=fmt(S.cash)}
const dvCn=id=>CITIES[id]?CITIES[id].name:"?";
const dvGn=g=>G[g]?G[g][0]:String(g);
const dvB=(a,id,t,o)=>{o=o||{};const dis=o.off?` aria-disabled="true" title="${dxE(o.off)}"`:(o.tip?` title="${dxE(o.tip)}"`:"");return `<button class="lx-btn${o.cls?" "+o.cls:""}" data-dv="${a}" data-id="${dxE(id)}"${dis}>${t}</button>`};
function dvRows(){const now=Date.now(),out=[];
  for(const v of S.fleet){const a=v.al;if(!v.arr&&!a&&v.hm==null)continue;
    let ty,tc,plan="",st,sc,load,fuel=0,edit="",rec="",can="";
    if(a&&a.cu){ty=a.ln?"Custom line":"Custom";tc="b";plan=`${dvCn(a.src)} → ${dvCn(a.to)}${a.ln?" · repeats":""}`}
    else if(a&&a.fx){ty="Fetch";tc="y";plan=`for ${dvCn(a.to)} from ${dvCn(a.src)}${a.buy?" (buying)":""}`}
    else if(a){ty="Auto-line";tc="g";plan=`${dvCn(a.home)} → ${dvCn(a.to)}`}
    else if(v.job){ty="Logistics";tc="b";plan="HQ shipment"}
    else if(v.route){ty="Route";tc="g";plan=`${dvCn(v.route.from)} ⇄ ${dvCn(v.route.to)}`}
    else{ty="Manual";tc="";plan=v.hm!=null?`recalled · home ${dvCn(v.hm)}`:"sent from a depot"}
    const ret=(v.cargo&&v.cargo.rc)||(a&&a.st==="back")||(!a&&v.hm!=null)||(a&&!a.fx&&!a.cu&&v.arr&&!v.cargo);
    if(v.arr){if(ret){st="Returning";sc="r"}else if(v.cargo){st="Outbound";sc="o"}else if(a&&(a.fx||a.cu)&&a.st==="go"){st="Loading";sc="l"}else{st="Outbound";sc="o"}}
    else if(a&&a.st==="go"){st=a.why?"Waiting":"Loading";sc=a.why?"p":"l"}else{st="Parked";sc=""}
    load=v.cargo?`${dvGn(v.cargo.g)} × ${lxg(v.cargo.q)}${v.cargo.rc?" (back to depot)":""}`:a&&(a.fx||a.cu)&&a.st==="go"?`${dvGn(a.g)} × ${lxg(a.q)} <small>to load</small>`:"empty";
    if(v.arr){const A=CITIES[v.from],B=CITIES[v.dest];if(A&&B)fuel=vFuel(v.type,distKm(A,B),v.cargo?v.cargo.q*tpu(v.cargo.g):0,A,B)}
    if(v.job){rec=v.cargo&&v.cargo.rc?dvB("x",v.id,"Recall",{off:"Already heading back"}):v.arr?dvB("recall",v.id,"Recall",{tip:"Turn back; the load returns to the depot it came from"}):dvB("x",v.id,"Recall",{off:"Parked"});
      edit=dvB("x",v.id,"Edit",{off:"Edit Logistics shipments in the HQ dashboard → Logistics"});can=dvB("x",v.id,"Cancel",{off:"Cancel this shipment in the HQ dashboard → Logistics"})}
    else{rec=ret?dvB("x",v.id,"Recall",{off:"Already heading home"}):dvB("recall",v.id,"Recall",{tip:a&&(a.cu&&a.ln||!a.cu)?"Turn back now; the line keeps running":"Turn back now; the load returns to the depot it came from"});
      const pre=a&&(a.fx||a.cu)&&a.st==="go"&&!v.cargo;
      edit=pre?dvB("edit",v.id,DV.ed&&DV.ed.k==="v"+v.id?"Close":"Edit"):dvB("x",v.id,"Edit",{off:v.cargo?"Already loaded: recall it instead":a&&!a.fx&&!a.cu?"Auto-line loads at departure: pause its line below instead":v.route?"Edit the route under Lines":ret?"Heading home":"Nothing to change"});
      can=ret&&!v.route?dvB("x",v.id,"Cancel",{off:"Already heading home"}):!a&&!v.route?dvB("x",v.id,"Cancel",{off:"A manual trip can only be recalled"}):dvB("cancel",v.id,DV.arm==="c"+v.id?"Sure?":"Cancel",{cls:"red",tip:a&&a.cu?(a.ln?"Turn back and delete its line":"Turn back; delivery cancelled"):a?"Turn back and pause this Auto-line line":"Turn back and stop the route"})}
    out.push({v,ty,tc,plan,st,sc,load,fuel,rec,edit,can,a})}
  const rk={Outbound:0,Loading:1,Waiting:2,Returning:3,Parked:4};return out.sort((x,y)=>(rk[x.st]-rk[y.st])||((x.v.arr||9e15)-(y.v.arr||9e15)))}
function dvEditRow(v){const a=v.al,e=DV.ed,W=CITIES[a.src],cap=Math.floor(capV(v,a.g));
  const ds=a.cu?CITIES.filter(c=>c!==W&&dvCityOk(c)&&lxVehOK(v,W,c)&&!lxBlock(W,c)).sort((x,y)=>distKm(W,x)-distKm(W,y)):[];
  return `<tr class="dv-ed"><td class="dv-w" colspan="6"><div class="dv-edf"><label>Quantity (max ${lxg(cap)})<input class="lx-in" type="number" min="1" max="${cap}" step="1" data-dve="q" value="${dxE(e.q)}"></label>${a.cu?`<label>Destination<select class="lx-in" data-dve="to">${ds.map(c=>lxOpt(c.id,`${c.name} · ${Math.round(distKm(W,c)).toLocaleString()} km`,e.to)).join("")}</select></label>`:`<label>Destination<input class="lx-in" value="${dxE(dvCn(a.to))}" disabled title="Auto-line picks the destination"></label>`}
    <span style="display:flex;gap:6px">${dvB("edsave",v.id,"Save",{cls:"pri"})}${dvB("edx",v.id,"Close")}</span></div></td></tr>`}
function dvForm(){const f=DV.f,F={vs:[],ws:[],gs:[],ds:[],v:null,W:null,g:"",N:null,q:0,max:0};
  F.vs=S.fleet.filter(dvIdle);if(!F.vs.length)return F;if(!F.vs.some(v=>v.id===+f.v))f.v=F.vs[0].id;F.v=F.vs.find(v=>v.id===+f.v);const H=CITIES[F.v.city];
  F.ws=CITIES.filter(c=>hasWh(c)&&GK.some(g=>inv0(c,g)>=1)&&lxVehOK(F.v,H,c));if(!F.ws.length)return F;
  if(!F.ws.some(c=>c.id===+f.from))f.from=(F.ws.find(c=>c===H)||F.ws[0]).id;F.W=CITIES[f.from];
  F.gs=GK.filter(g=>inv0(F.W,g)>=1);if(!F.gs.includes(f.g))f.g=F.gs[0];F.g=f.g;
  F.ds=CITIES.filter(c=>c!==F.W&&dvCityOk(c)&&lxVehOK(F.v,F.W,c)&&!lxBlock(F.W,c)).sort((x,y)=>distKm(F.W,x)-distKm(F.W,y));
  if(!F.ds.length)return F;if(!F.ds.some(c=>c.id===+f.to))f.to=F.ds[0].id;F.N=CITIES[f.to];
  F.max=Math.floor(Math.min(capV(F.v,F.g),inv0(F.W,F.g)));if(!(f.q>0))f.q=F.max;F.q=Math.max(1,Math.min(F.max,Math.floor(f.q)));return F}
function dvEstHtml(F){if(!F.N)return "";const q=Math.max(1,Math.min(F.max,Math.floor(DV.f.q||0)||F.max)),z=dvEst(F.v,F.W,F.N,F.g,q,DV.f.rep),warn=+DV.f.q>F.max?`<span class="w">Capped at ${lxg(F.max)} (${inv0(F.W,F.g)<capV(F.v,F.g)?"stock in "+dxE(F.W.name):"vehicle capacity"})</span>`:"";
  return `<div><span>Load</span><b>${dxE(dvGn(F.g))} × ${lxg(q)} · ${fmtT(q*tpu(F.g))}</b></div>${z.go?`<div><span>Drive to ${dxE(F.W.name)} first</span><b>${fmtDur(z.go)} · ${fmt(z.f0)} fuel</b></div>`:""}
  <div><span>Arrives in ${dxE(F.N.name)}</span><b>${fmtDur(z.arr)}</b></div><div><span>${DV.f.rep?`Back in ${dxE(F.W.name)} for the next load`:"Back home"}</span><b>${fmtDur(z.done)}</b></div>
  <div><span>Fuel ${DV.f.rep?"(first round trip)":"(whole trip)"}</span><b>${fmt(z.fuel)}</b></div>${DV.f.rep?`<div><span>Each later round trip</span><b>${fmtDur(z.ms1+z.ms2)} · ${fmt(z.f1+z.f2)} fuel</b></div>`:""}
  <div><span>Worth there</span><b>${fmt(q*px(F.N,F.g))}</b></div>${warn?`<div>${warn}</div>`:""}`}
function dvFormHtml(){const F=dvForm(),f=DV.f;
  if(!F.vs.length)return `<div class="mdx-empty">No free vehicle. Buy one in a depot, or wait for one to come back.</div>`;
  if(!F.ws.length)return `<div class="mdx-empty">None of your depots the free vehicles can reach hold any goods.</div>`;
  if(!F.ds.length)return `<div class="mdx-empty">No other city with your depot or business that this vehicle can reach from ${dxE(F.W.name)}.</div>`;
  if(f.cf){const q=F.q,z=dvEst(F.v,F.W,F.N,F.g,q,f.rep);return `<div class="dv-cf"><div class="lx-sub" style="margin:0 0 8px;color:var(--dxink)">Confirm ${f.rep?"repeating delivery line":"delivery"}</div><div class="lx-pv">
    <div><span>Vehicle</span><b>${dxE(VEH[F.v.type].n)} #${F.v.id} · in ${dxE(dvCn(F.v.city))}</b></div><div><span>Route</span><b>${dxE(F.W.name)} → ${dxE(F.N.name)}</b></div>
    <div><span>Load</span><b>${dxE(dvGn(F.g))} × ${lxg(q)}</b></div><div><span>Arrives in</span><b>${fmtDur(z.arr)}</b></div><div><span>Fuel</span><b>${fmt(z.fuel)}${f.rep?" first round trip":""}</b></div>
    ${f.rep?`<div><span>Repeats</span><b>until you cancel it</b></div>`:""}</div>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${dvB("confirm",0,f.rep?"Confirm line":"Confirm & send",{cls:"pri"})}${dvB("back",0,"Back")}</div></div>`}
  return `<div class="lx-f"><label>Vehicle (free)<select class="lx-in" data-dvf="v">${F.vs.map(v=>lxOpt(v.id,`${VEH[v.type].n} #${v.id} · in ${dvCn(v.city)} · ${fmtT(vCap(v))}`,f.v)).join("")}</select></label>
    <div class="lx-row2"><label>From depot<select class="lx-in" data-dvf="from">${F.ws.map(c=>lxOpt(c.id,c.name,f.from)).join("")}</select></label>
    <label>Goods<select class="lx-in" data-dvf="g">${F.gs.map(g=>lxOpt(g,`${dvGn(g)} · ${lxg(inv0(F.W,g))} in stock`,f.g)).join("")}</select></label></div>
    <div class="lx-row2"><label>To city<select class="lx-in" data-dvf="to">${F.ds.map(c=>lxOpt(c.id,`${c.name} · ${Math.round(distKm(F.W,c)).toLocaleString()} km`,f.to)).join("")}</select></label>
    <label>Quantity (max ${lxg(F.max)})<input class="lx-in" type="number" min="1" max="${F.max}" step="1" data-dvf="q" value="${F.q}"></label></div>
    <label class="dv-chk"><input type="checkbox" data-dvf="rep" ${f.rep?"checked":""}> Repeat until cancelled (runs as a line, also while you are away)</label>
    <div class="lx-pv" id="dv-est">${dvEstHtml(F)}</div>
    <div>${dvB("review",0,"Review delivery",{cls:"pri"})}</div></div>`}
function dvSetF(k,val){const f=DV.f;if(k==="rep")f.rep=!!val;else if(k==="q")f.q=+val||0;else{f[k]=k==="g"?val:+val;if(k!=="to")f.q=0;if(k==="v"){f.from=-1;f.to=-1}if(k==="from"){f.g="";f.to=-1}}f.cf=false;dvRender(true)}
function dvPage(){const now=Date.now(),rows=dvRows(),A=S.fleet.filter(v=>v.al&&v.al.fx&&v.al.st!=="back").length,idle=S.fleet.filter(dvIdle).length;
  let units=0,val=0;for(const v of S.fleet)if(v.arr&&v.cargo&&G[v.cargo.g]){units+=v.cargo.q;const d=CITIES[v.dest];val+=v.cargo.q*(d?px(d,v.cargo.g):G[v.cargo.g][1])}
  const k=(lb,v,ft,extra)=>`<div class="mdx-card"><span>${lb}</span><b>${v}</b><small>${ft}</small>${extra||""}</div>`;
  let h=`<div class="mdx-kpis dv-k">${k("Active deliveries",rows.filter(r=>r.st!=="Parked").length,`${rows.filter(r=>r.st==="Outbound").length} outbound · ${rows.filter(r=>r.st==="Returning").length} returning`)}${k("Vehicles",`${idle} / ${S.fleet.length-idle}`,"idle / busy")}${k("Goods in transit",lxg(units),`worth ${fmt(val)}`)}</div>`;
  if(DV.note&&now-DV.nt<8000)h+=`<div class="lx-note" role="status" style="${/^(Need|No |Not|That|Pick|Trucks|Could)/.test(DV.note)?"color:#b91c1c":""}">${dxE(DV.note)}</div>`;
  h+=`<div class="mdx-card"><div class="mdx-ch"><h3>Active deliveries</h3><span style="margin-left:auto;display:flex;align-items:center;gap:6px;font:600 12px Figtree,sans-serif;color:#2563eb"><span class="mdx-live"></span>Live</span></div>`;
  if(!rows.length)h+=`<div class="mdx-empty">No deliveries under way. Create one below.</div>`;
  else{h+=`<div class="mdx-tblw"><table class="dv-tbl"><thead><tr><th>Vehicle</th><th>From → to</th><th>Load</th><th>Status · ETA</th><th>Fuel</th><th>Actions</th></tr></thead><tbody>`;
    for(const r of rows){const v=r.v,A0=v.arr?CITIES[v.from]:CITIES[v.city],B0=v.arr?CITIES[v.dest]:null;
      h+=`<tr><td data-l="Vehicle"><b>${dxE(VEH[v.type].n)} #${v.id}</b><span class="lx-tag${r.tc?" "+r.tc:""}" style="margin-left:0;margin-top:3px">${r.ty}</span></td>
      <td data-l="From → to"><b>${dxE(A0?A0.name:"?")}${B0?` → ${dxE(B0.name)}`:""}</b><small>${dxE(r.plan)}</small></td>
      <td data-l="Load">${r.load}</td>
      <td data-l="Status · ETA" class="${v.arr?"":""}"><span class="dv-st ${r.sc}">${r.st}</span>${v.arr?` <span class="dv-eta" data-eta="${v.arr}"></span><div class="lx-bar"><i data-pg="${v.dep||v.arr},${v.arr}"></i></div>`:r.a&&r.a.why?`<small>${dxE(r.a.why)}</small>`:""}</td>
      <td data-l="Fuel">${v.arr?(r.fuel<100?fmtc(r.fuel):fmt(r.fuel)):"—"}<small>this leg</small></td>
      <td class="dv-w"><div class="dv-a">${r.rec}${r.edit}${r.can}</div></td></tr>`;
      if(DV.ed&&DV.ed.k==="v"+v.id&&r.a&&(r.a.fx||r.a.cu)&&r.a.st==="go"&&!v.cargo)h+=dvEditRow(v)}
    h+=`</tbody></table></div>`}
  const [alh,cuh]=dvLinesHtml();h+=`</div>${fupHtml()}<div class="dv-two">${cuh}<div class="mdx-card" style="min-width:0"><div class="mdx-ch"><h3>Create a custom delivery</h3></div>${dvFormHtml()}</div></div>`;
  return h}
/* Truck tracker: for every city + good your businesses use, the trucks Auto-line runs vs the trucks the use rate needs
   (load ÷ round trip from the nearest depot city must match units/h). Estimate uses a standard truck when none runs yet. */
function dvGapHtml(){const r=dvGap();if(!r.length)return"";const tot=r.reduce((a,x)=>a+(x.more||0),0),idle=S.fleet.filter(v=>dvIdle(v)&&!(S.dvl||[]).some(x=>x.on&&x.v===v.id)).length;
  const u=g=>g==="fuel"?" kL":"";
  return `<div class="mdx-card"><div class="mdx-ch"><h3>Truck tracker</h3><small style="margin-left:auto;font:600 12px system-ui;color:${tot?"#b45309":"#15803d"}">${tot?`${tot} more truck${tot>1?"s":""} needed · ${idle} idle`:"Every business is covered"}</small></div>
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="text-align:left;opacity:.7"><th style="padding:4px 6px">City</th><th style="padding:4px 6px">Goods</th><th style="padding:4px 6px">Use /h</th><th style="padding:4px 6px">Sent /h</th><th style="padding:4px 6px">Trucks</th><th style="padding:4px 6px">Still needed</th></tr></thead><tbody>
  ${r.map(x=>`<tr style="border-top:1px solid #8883"><td style="padding:4px 6px">${x.N.name}</td><td style="padding:4px 6px">${G[x.g][0]}</td><td style="padding:4px 6px">${Math.round(x.rate)}${u(x.g)}</td><td style="padding:4px 6px">${Math.round(x.cov)}${u(x.g)}</td><td style="padding:4px 6px">${x.have}</td><td style="padding:4px 6px;font-weight:700;color:${x.more?"#b45309":"#15803d"}">${x.more==null?"no depot":x.more?"+"+x.more:"✓"}</td></tr>`).join("")}
  </tbody></table></div>${S.aline?"":`<p style="margin:6px 0 0;font-size:12px;opacity:.75">Auto-line is off, so no standing lines run. Turn it on to send trucks.</p>`}</div>`}
function dvLinesHtml(){const R=alRates(),P=S.alPause||{},src=alTick.src||{};let h=`<div class="mdx-card"><div class="mdx-ch"><h3>Auto-line lines</h3><small style="margin-left:auto;font:600 12px Figtree,sans-serif;color:var(--dxmut)">target ${AL_FILL} h of need</small></div>`;
  const ls=[];for(const id in R){const c=CITIES[id];for(const g in R[id])if(R[id][g]>0)ls.push({c,g,r:R[id][g]})}
  if(!ls.length)h+=`<div class="mdx-empty">No Auto-line lines: businesses that draw goods from a depot (or gas stations) create them.</div>`;
  else{h+=`<div class="mdx-tblw"><table class="dv-tbl"><thead><tr><th>Line</th><th>Source</th><th>Target</th><th>Coverage</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
    for(const x of ls){const mk=x.c.id+":"+x.g,have=alHave(x.c,x.g),cov=have/x.r,tr=alTrips(x.c,x.g),ps=!!P[mk];
      const ss=[...new Set(S.fleet.filter(v=>v.al&&!v.al.cu&&v.al.to===x.c.id&&v.al.g===x.g).map(v=>dvCn(v.al.fx?v.al.src:v.al.home)))];
      const st=ps?`<span class="dv-st p">Paused</span>`:!S.aline?`<span class="dv-st">Auto-line off</span>`:tr?`<span class="dv-st o">${tr} trip${tr>1?"s":""}</span>`:cov<AL_LOW?`<span class="dv-st l">Needs stock</span>`:`<span class="dv-st k">Covered</span>`;
      h+=`<tr><td data-l="Line"><b>${dxE(dvGn(x.g))} → ${dxE(x.c.name)}</b><small>uses ${lxg(x.r)}/h</small></td><td data-l="Source">${dxE(ss.length?ss.join(", "):src[mk]||"—")}</td><td data-l="Target">${lxg(x.r*AL_FILL)}</td>
      <td data-l="Coverage"><b>${cov>=99?"99+":cov.toFixed(1)} h</b><div class="lx-bar"><i style="width:${Math.min(100,cov/AL_FILL*100).toFixed(0)}%;background:${cov<AL_CRIT?"#dc2626":cov<AL_LOW?"#d97706":"#16a34a"}"></i></div></td>
      <td data-l="Status">${st}</td><td class="dv-w"><div class="dv-a">${ps?dvB("alres",mk,"Resume"):dvB("alpause",mk,"Pause",{tip:"No new trips; trips under way finish"})}${dvB("alcan",mk,DV.arm==="a"+mk?"Sure?":"Cancel line",{cls:"red",off:ps&&!tr?"Already stopped":"",tip:"Pause it and call back its trips"})}</div></td></tr>`}
    h+=`</tbody></table></div>`}
  const alh=h+`</div>`;h=`<div class="mdx-card" style="min-width:0"><div class="mdx-ch"><h3>Custom lines & routes</h3></div>`;
  const cl=S.dvl||[],rt=S.fleet.filter(v=>v.route);
  if(!cl.length&&!rt.length)h+=`<div class="mdx-empty">No repeating deliveries. Tick "Repeat until cancelled" when you create one.</div>`;
  else{h+=`<div class="mdx-tblw"><table class="dv-tbl"><thead><tr><th>Line</th><th>Load</th><th>Done</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
    for(const x of cl){const v=S.fleet.find(y=>y.id===x.v),k="L"+x.id,run=v&&v.al&&v.al.ln===x.id;
      h+=`<tr><td data-l="Line"><b>${dxE(dvCn(x.src))} → ${dxE(dvCn(x.to))}</b><small>${v?`${dxE(VEH[v.type].n)} #${v.id}`:"no vehicle"} · custom line</small></td><td data-l="Load">${dxE(dvGn(x.g))} × ${lxg(x.q)}</td><td data-l="Done">${x.n||0} trips<small>${lxg(x.qd||0)} delivered</small></td>
      <td data-l="Status">${x.on?`<span class="dv-st ${x.why?"p":"o"}">${x.why?"Waiting":run?"Running":"Starting"}</span>${x.why?`<small>${dxE(x.why)}</small>`:""}`:`<span class="dv-st p">Paused</span>${x.why?`<small>${dxE(x.why)}</small>`:""}`}</td>
      <td class="dv-w"><div class="dv-a">${dvB("ledit",x.id,DV.ed&&DV.ed.k===k?"Close":"Edit")}${x.on?dvB("lpause",x.id,"Pause",{tip:"The trip under way finishes, then the vehicle parks at the source depot"}):dvB("lres",x.id,"Resume")}${dvB("lcan",x.id,DV.arm==="l"+x.id?"Sure?":"Cancel",{cls:"red",tip:"Delete the line; a load on the road is still delivered"})}</div></td></tr>`;
      if(DV.ed&&DV.ed.k===k){const W=CITIES[x.src],ds=CITIES.filter(c=>c!==W&&dvCityOk(c)&&(!v||lxVehOK(v,W,c))).sort((p,q)=>distKm(W,p)-distKm(W,q)),cap=v?Math.floor(capV(v,x.g)):x.q;
        h+=`<tr class="dv-ed"><td class="dv-w" colspan="5"><div class="dv-edf"><label>Quantity per trip (max ${lxg(cap)})<input class="lx-in" type="number" min="1" max="${cap}" data-dve="q" value="${dxE(DV.ed.q)}"></label><label>Destination<select class="lx-in" data-dve="to">${ds.map(c=>lxOpt(c.id,c.name,DV.ed.to)).join("")}</select></label><span style="display:flex;gap:6px">${dvB("lsave",x.id,"Save",{cls:"pri"})}${dvB("edx",0,"Close")}</span></div></td></tr>`}}
    for(const v of rt){const r=v.route,k="R"+v.id;
      h+=`<tr><td data-l="Line"><b>${dxE(dvCn(r.from))} ⇄ ${dxE(dvCn(r.to))}</b><small>${dxE(VEH[v.type].n)} #${v.id} · manual route</small></td><td data-l="Load">${dxE(dvGn(r.g))}${r.back?` <small>back: ${dxE(dvGn(r.back))}</small>`:""}</td><td data-l="Done">—</td>
      <td data-l="Status"><span class="dv-st ${v.arr?"o":"l"}">${v.arr?"On the road":"Waiting for a load"}</span></td>
      <td class="dv-w"><div class="dv-a">${dvB("redit",v.id,DV.ed&&DV.ed.k===k?"Close":"Edit")}${dvB("rcan",v.id,DV.arm==="r"+v.id?"Sure?":"Cancel",{cls:"red",tip:"Stop the route; the vehicle parks after this trip"})}</div></td></tr>`;
      if(DV.ed&&DV.ed.k===k)h+=`<tr class="dv-ed"><td class="dv-w" colspan="5"><div class="dv-edf"><label>Carry out<select class="lx-in" data-dve="g">${GK.map(g=>lxOpt(g,dvGn(g),DV.ed.g)).join("")}</select></label><label>Bring back<select class="lx-in" data-dve="back">${lxOpt("","Nothing",DV.ed.back)}${GK.map(g=>lxOpt(g,dvGn(g),DV.ed.back)).join("")}</select></label><span style="display:flex;gap:6px">${dvB("rsave",v.id,"Save",{cls:"pri"})}${dvB("edx",0,"Close")}</span></div></td></tr>`}
    h+=`</tbody></table></div>`}
  return [alh,h+`</div>`]}
function dvNote(m){DV.note=m;DV.nt=Date.now()}
function dvArm(k){if(DV.arm===k){DV.arm=null;return true}DV.arm=k;DV.armT=Date.now();return false}
function dvAct(a,b){const id=b.dataset.id,now=Date.now(),v=S.fleet.find(x=>String(x.id)===String(id));let done=false;
  if(b.getAttribute("aria-disabled")==="true"){dvNote(b.title||"Not available");dvRender(true);return}
  if(a==="close"){dvClose();return}if(a==="theme"){themeSet(themeGet()==="dark"?"light":"dark");b.innerHTML=themeIco();return}
  if(a!=="cancel"&&a!=="alcan"&&a!=="lcan"&&a!=="rcan")DV.arm=null;
  if(a==="albuy"){S.alNoBuy=!S.alNoBuy;dvNote(S.alNoBuy?"Auto-buy off: Auto-line only moves your own stock.":"Auto-buy on: Auto-line buys at the market when no depot has the goods.");done=true}
  if(a==="fup"){dvNote(fupBuy(+b.dataset.i,b.dataset.k));done=true}
  if(a==="fupmax"){dvNote(fupMax(+b.dataset.i,b.dataset.k));done=true}
  if(a==="vsell"){const v=S.fleet.find(x=>x.id===+b.dataset.i);if(!v||!vSellOk(v))dvNote("That vehicle is busy and can't be sold right now");else if(!b.dataset.arm){b.dataset.arm=1;b.textContent=`Tap again: sell ${fmt(vSellP(v))}`;return}else{const p=vSellP(v);S.fleet=S.fleet.filter(x=>x!==v);S.cash+=p;dvNote(`Sold ${VEH[v.type].n} #${v.id} for ${fmt(p)}`)}done=true}
  
  else if(a==="recall"&&v){const ok=v.job?lxRecall(v):dvRecall(v);dvNote(ok?`${VEH[v.type].n} #${v.id} is heading back${v.cargo?" with its load":""}.`:"That vehicle is already heading back.");done=ok}
  else if(a==="cancel"&&v){if(dvArm("c"+v.id)){const ok=dvCancel(v);dvNote(ok?`Cancelled: ${VEH[v.type].n} #${v.id} is heading back.`:"Nothing to cancel.");done=ok}}
  else if(a==="edit"&&v&&v.al){const k="v"+v.id;DV.ed=DV.ed&&DV.ed.k===k?null:{k,q:Math.round(v.al.q),to:v.al.to}}
  else if(a==="edx")DV.ed=null;
  else if(a==="edsave"&&v&&v.al&&DV.ed){const al=v.al;if(v.cargo||al.st!=="go"){dvNote("Already loaded: it can't be changed now.")}else{const q=Math.floor(+DV.ed.q||0),cap=capV(v,al.g);
      if(!(q>=1)){dvNote("Pick a quantity of 1 or more.")}else{al.q=Math.min(q,Math.floor(cap));if(al.cu){const N=CITIES[+DV.ed.to],W=CITIES[al.src];if(N&&N!==W&&dvCityOk(N)&&lxVehOK(v,W,N)&&!lxBlock(W,N))al.to=N.id}
        DV.ed=null;dvNote(`Updated: ${dvGn(al.g)} × ${lxg(al.q)} for ${dvCn(al.to)}.`);done=true}}}
  else if(a==="alpause"||a==="alres"){if(a==="alpause")S.alPause[id]=1;else delete S.alPause[id];dvNote(a==="alpause"?"Line paused. Trips under way finish.":"Line resumed.");if(a==="alres"&&S.aline)alTick(now);done=true}
  else if(a==="alcan"){if(dvArm("a"+id)){S.alPause[id]=1;const [cid,g]=id.split(":");let n=0;for(const x of S.fleet)if(x.al&&!x.al.cu&&String(x.al.to)===cid&&x.al.g===g&&dvRecall(x))n++;dvNote(`Line stopped${n?`: ${n} trip${n>1?"s":""} called back`:""}. Resume it any time.`);done=true}}
  else if(a==="ledit"){const x=dvLine(+id),k="L"+id;if(x)DV.ed=DV.ed&&DV.ed.k===k?null:{k,q:x.q,to:x.to}}
  else if(a==="lsave"){const x=dvLine(+id),e=DV.ed;if(x&&e){const q=Math.floor(+e.q||0),vv=S.fleet.find(y=>y.id===x.v),N=CITIES[+e.to];if(!(q>=1))dvNote("Pick a quantity of 1 or more.");else{x.q=vv?Math.min(q,Math.floor(capV(vv,x.g))):q;if(N&&N.id!==x.src&&dvCityOk(N))x.to=N.id;
      if(vv&&vv.al&&vv.al.ln===x.id&&vv.al.st==="go"&&!vv.cargo){vv.al.q=x.q;vv.al.to=x.to}DV.ed=null;dvNote("Line updated: applies from the next load.");done=true}}}
  else if(a==="lpause"||a==="lres"){const x=dvLine(+id);if(x){x.on=a==="lres";x.why="";if(x.on)dvLines(now);dvNote(x.on?"Line resumed.":"Line paused: the trip under way finishes, then the vehicle parks.");done=true}}
  else if(a==="lcan"){if(dvArm("l"+id)){S.dvl=S.dvl.filter(x=>x.id!==+id);if(DV.ed&&DV.ed.k==="L"+id)DV.ed=null;dvNote("Line deleted. A load already on the road is still delivered, then the vehicle drives home.");done=true}}
  else if(a==="redit"&&v&&v.route){const k="R"+v.id;DV.ed=DV.ed&&DV.ed.k===k?null:{k,g:v.route.g,back:v.route.back||""}}
  else if(a==="rsave"&&v&&v.route&&DV.ed){if(G[DV.ed.g])v.route.g=DV.ed.g;v.route.back=G[DV.ed.back]?DV.ed.back:"";DV.ed=null;dvNote("Route updated: applies from the next load.");done=true}
  else if(a==="rcan"&&v){if(dvArm("r"+v.id)){v.route=null;dvNote("Route stopped. The vehicle parks after this trip.");done=true}}
  else if(a==="review"){const qi=DV.el.querySelector("[data-dvf=q]");if(qi)DV.f.q=+qi.value||0;const F=dvForm();if(F.N){DV.f.q=F.q;DV.f.cf=true}}
  else if(a==="back")DV.f.cf=false;
  else if(a==="confirm"){const F=dvForm();const err=F.N?dvCreate({v:F.v.id,from:F.W.id,to:F.N.id,g:F.g,q:F.q,rep:DV.f.rep},now):"Pick a destination city.";DV.f.cf=false;
    if(err)dvNote(err);else{dvNote(DV.f.rep?`Line started: ${dvGn(F.g)} ${F.W.name} → ${F.N.name}, repeating.`:`${VEH[F.v.type].n} #${F.v.id} is on its way: ${dvGn(F.g)} × ${lxg(F.q)} to ${F.N.name}.`);DV.f.q=0;DV.f.rep=false;done=true}}
  if(done){save();hud();if(typeof draw==="function")draw();if(sel&&mode==="city"&&tab==="wh"&&sheet.classList.contains("open")&&!shipForm)renderSheet()}
  dvRender(true)}
return {dvOpen,dvClose};
})()
