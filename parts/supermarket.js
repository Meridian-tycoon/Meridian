/* Meridian: walk-in 3D supermarket (lazy part, Mark 2026-11-16; fixtures & build mode 2026-11-16). Loaded by smEnter in index.html.
   Runs with a direct eval inside the game's main closure, so it sees S, CITIES, smS, smOpen, smClose, SMW, SM_TIER, SM_FX, SM_DIM, SM_COLD, smFxR, smFits, smFxAdd/Move/Sell, smSlotSet, smPull, smBuy, smCap, smGF, GIC, G, ofBox, ofMat, loadThree, toast, fmt.
   Layout: entrance and checkouts at the +z end (checkout lanes leave a 3 m walkway in the middle), fixtures from S.smkt[city].lay, fresh counters on the back wall, office PC in the back-right corner.
   Controls: W/S or up/down walk, A/D turn, drag to turn, joystick on touch, E use (PC / shelf picker), B build mode, Esc closes the top-most thing (manage window, picker, build tool, build mode, store).
   Build mode: overview camera, click a palette fixture then click the floor to buy it; click a fixture to pick it up and click to drop it; R rotate; Del sell (50% back).
   Look (detail pass 2026-11-17): static geometry is merged into one vertex-coloured mesh per material (bGeo/bMesh), product labels and signs come from two canvas atlases (W.patl, W.atl), shoppers and staff are jointed figures on InstancedMeshes (crowdTick) walking a 0.5 m BFS nav grid; W.q=0 (phones/slow first seconds) means fewer shoppers, single-depth facings and a lower pixel ratio. ~25-31 draw calls for a full hypermarket. */
(function(){
const W={q:1,mats:{},figs:[],staff:[],lanes:[],dO:0,cr:null,doors:null,on:false,el:null,T:null,ren:null,scene:null,cam:null,av:null,legs:null,walkT:0,p:{x:0,z:0,yaw:Math.PI},keys:{},joy:null,drag:null,raf:0,last:0,city:null,obst:[],hw:7,hd:6,pc:null,near:null,sig:"",sigT:0,btn:null,world:null,bm:null,gh:null,pk:null,kd:null,mouse:null};
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
function person(T,col){const g=new T.Group();const l=ofBox(T,g,.13,.5,.15,0x1f2937,-.1,0,0),r=ofBox(T,g,.13,.5,.15,0x1f2937,.1,0,0);ofBox(T,g,.42,.55,.26,col,0,.5,0);
  const hd=new T.Mesh(new T.SphereGeometry(.17,12,10),ofMat(T,0xf1c27d));hd.position.set(0,1.22,0);g.add(hd);g.userData.legs=[l,r];return g}
const gcol=g=>{let h=0;for(const ch of g)h=(h*31+ch.charCodeAt(0))>>>0;return new (W.T.Color)().setHSL((h%360)/360,.65,.5).getHex()};
const city=()=>CITIES[W.city];
/* quality: phones, small screens and low-core machines get fewer shoppers/products and a lower pixel ratio; the loop also drops to low if the first seconds run slow */
const lowEnd=()=>matchMedia("(pointer:coarse)").matches||Math.min(innerWidth,innerHeight)<500||(navigator.hardwareConcurrency||8)<=2;
const sigOf=t=>[t.tier,t.st.cash,t.st.stock|0,t.st.sec|0,S.day<t.pu?1:0,W.q,Object.keys(t.add).filter(k=>t.add[k]).join(","),t.lay.map(f=>[f.i,f.k,f.x,f.z,f.r,f.g.join("/")].join(",")).join(";"),t.ls.map(g=>g+":"+Math.round(8*Math.min(1,(t.sh[g]||0)/Math.max(1,smCap(city(),t))))).join(",")].join("|");
/* local fixture coords (length along z at rotation 0) to world, matching Three's rotation.y=-r*PI/2 */
function l2w(f,lx,lz){const th=-f.r*Math.PI/2,c=Math.cos(th),s=Math.sin(th);return [f.x+lx*c+lz*s,f.z-lx*s+lz*c]}
/* where the player stands to use each slot */
function slotPts(f){const d=SM_FX[f.k],a=d.w/2+.55;if(f.k==="shelf"||f.k==="fridge")return [[[-a,0]],[[a,0]]];if(f.k==="endcap")return [[[0,d.d/2+.55],[a,0],[-a,0]]];return [[[-a,-d.d/4],[a,-d.d/4]],[[-a,d.d/4],[a,d.d/4]]]}
const gname=g=>`${GIC[g]||""} ${G[g][0]}`;
const PI=Math.PI,hx=s=>parseInt(s.slice(1),16);
/* ---------- render kit (2026-11-17 detail pass): every static thing is merged into one vertex-coloured mesh per material,
   labels and signs come from two canvas atlases, so the whole store is a few dozen draw calls ---------- */
const GEO={};
function ug(k){if(GEO[k])return GEO[k];const T=W.T;let g;
  switch(k){case"box":g=new T.BoxGeometry(1,1,1).translate(0,.5,0);break;case"cyl":g=new T.CylinderGeometry(.5,.5,1,10).translate(0,.5,0);break;
  case"cylo":g=new T.CylinderGeometry(.5,.5,1,10,1,true).translate(0,.5,0);break;case"cone":g=new T.CylinderGeometry(.2,.5,1,10).translate(0,.5,0);break;
  case"cup":g=new T.CylinderGeometry(.5,.4,1,8).translate(0,.5,0);break;case"sph":g=new T.SphereGeometry(.5,10,7);break;case"sphl":g=new T.SphereGeometry(.5,6,4);break;
  case"hsph":g=new T.SphereGeometry(.5,10,5,0,PI*2,0,PI/2);break;default:g=new T.PlaneGeometry(1,1)}
  return GEO[k]=g}
function mkB(){const T=W.T;return {T,q:{},st:[new T.Matrix4()],v:new T.Vector3(),s:new T.Vector3(),qt:new T.Quaternion(),e:new T.Euler(0,0,0,"YXZ")}}
function bPush(B,x,y,z,ry,rx){B.e.set(rx||0,ry||0,0);const m=new B.T.Matrix4().makeRotationFromEuler(B.e);m.setPosition(x,y,z);B.st.push(B.st[B.st.length-1].clone().multiply(m))}
const bPop=B=>{B.st.pop()};
function pp(B,k,gk,sx,sy,sz,x,y,z,col,o){const m=new B.T.Matrix4();B.e.set(o&&o.rx||0,o&&o.ry||0,o&&o.rz||0);B.qt.setFromEuler(B.e);m.compose(B.v.set(x,y,z),B.qt,B.s.set(sx,sy,sz)).premultiply(B.st[B.st.length-1]);(B.q[k]||(B.q[k]=[])).push({g:gk,m,c:col,uv:o&&o.uv})}
const bx=(B,w,h,d,col,x,y,z,k,o)=>pp(B,k||"s","box",w,h,d,x,y,z,col,o);
const cy=(B,r,h,col,x,y,z,k,o,gk)=>pp(B,k||"s",gk||"cyl",r*2,h,r*2,x,y,z,col,o);
const sp=(B,rx,ry,rz,col,x,y,z,k,gk)=>pp(B,k||"s",gk||"sph",rx*2,ry*2,rz*2,x,y,z,col);
function sg(B,lines,w,h,x,y,z,ry,o,two){ry=ry||0;const uv=lab(W.atl,lines,o||{},w/h);pp(B,"t","pl",w,h,1,x,y,z,0xffffff,{ry,uv});if(two)pp(B,"t","pl",w,h,1,x,y,z,0xffffff,{ry:ry+PI,uv})}
/* merge one bucket into a BufferGeometry (positions/normals baked, vertex colours, atlas UVs) */
function bGeo(B,k){const T=W.T,ps=B.q[k]||[];let nv=0,ni=0;for(const p of ps){const g=ug(p.g);nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count}
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni),nm=new T.Matrix3(),c=new T.Color();let vo=0,io=0;
  for(const p of ps){const g=ug(p.g),Pa=g.attributes.position.array,Na=g.attributes.normal.array,Ua=g.attributes.uv.array,n=g.attributes.position.count,e=p.m.elements,ne=nm.getNormalMatrix(p.m).elements,u=p.uv;c.setHex(p.c);
    for(let i=0;i<n;i++){const a=i*3,o=(vo+i)*3,x=Pa[a],y=Pa[a+1],z=Pa[a+2];pos[o]=e[0]*x+e[4]*y+e[8]*z+e[12];pos[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13];pos[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
      const nx=Na[a],ny=Na[a+1],nz=Na[a+2];let X=ne[0]*nx+ne[3]*ny+ne[6]*nz,Y=ne[1]*nx+ne[4]*ny+ne[7]*nz,Z=ne[2]*nx+ne[5]*ny+ne[8]*nz;const l=Math.hypot(X,Y,Z)||1;nor[o]=X/l;nor[o+1]=Y/l;nor[o+2]=Z/l;
      col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;const U=Ua[i*2],V=Ua[i*2+1],q=(vo+i)*2;if(u){uv[q]=u[0]+U*(u[2]-u[0]);uv[q+1]=u[1]+V*(u[3]-u[1])}else{uv[q]=U;uv[q+1]=V}}
    if(g.index){const I=g.index.array;for(let i=0;i<I.length;i++)idx[io+i]=I[i]+vo;io+=I.length}else{for(let i=0;i<n;i++)idx[io+i]=vo+i;io+=n}vo+=n}
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(pos,3));geo.setAttribute("normal",new T.BufferAttribute(nor,3));geo.setAttribute("color",new T.BufferAttribute(col,3));geo.setAttribute("uv",new T.BufferAttribute(uv,2));geo.setIndex(new T.BufferAttribute(idx,1));geo.computeBoundingSphere();return geo}
function bMesh(B,parent,list){for(const k in B.q){if(!B.q[k].length)continue;const m=new W.T.Mesh(bGeo(B,k),mat(k));parent.add(m);if(list)list.push(m)}}
function mat(k){const M=W.mats,T=W.T;if(M[k])return M[k];let m;const vc={vertexColors:true};
  switch(k){case"s":m=new T.MeshStandardMaterial({...vc,roughness:.62});break;case"m":m=new T.MeshStandardMaterial({...vc,roughness:.3,metalness:.55});break;
  case"e":m=new T.MeshBasicMaterial(vc);break;case"g":m=new T.MeshStandardMaterial({...vc,roughness:.05,metalness:.2,transparent:true,opacity:.3,depthWrite:false});break;
  case"f":m=new T.MeshStandardMaterial({...vc,map:frostTex(),roughness:.15,transparent:true,depthWrite:false});break;
  case"l":m=new T.MeshStandardMaterial({...vc,map:W.patl.tex,roughness:.45});break;case"t":m=new T.MeshBasicMaterial({...vc,map:W.atl.tex});break;
  case"b":{const t=W.beltT=cvTex(64,64,g=>{g.fillStyle="#1f2937";g.fillRect(0,0,64,64);g.fillStyle="#4b5563";for(let y=0;y<64;y+=8)g.fillRect(0,y,64,3)});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,5);m=new T.MeshStandardMaterial({...vc,map:t,roughness:.85});break}
  case"floor":m=new T.MeshStandardMaterial({map:floorTex(),roughness:.32,metalness:.05});break;case"street":m=new T.MeshBasicMaterial({map:streetTex()});break;
  default:m=new T.MeshStandardMaterial({color:0xffffff,roughness:.8})}return M[k]=m}
function cvTex(w,h,fn){const cv=document.createElement("canvas");cv.width=w;cv.height=h;fn(cv.getContext("2d"),w,h);return new W.T.CanvasTexture(cv)}
const frostTex=()=>cvTex(128,128,g=>{g.fillStyle="rgba(235,248,255,.14)";g.fillRect(0,0,128,128);const gr=g.createRadialGradient(64,64,26,64,64,96);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(1,"rgba(255,255,255,.8)");g.fillStyle=gr;g.fillRect(0,0,128,128);
  for(let i=0;i<260;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.4})`;g.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*2,1+Math.random()*2)}g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=4;g.beginPath();g.moveTo(18,8);g.lineTo(60,70);g.moveTo(34,6);g.lineTo(70,58);g.stroke()});
function floorTex(){const t=cvTex(256,256,g=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){g.fillStyle=(i+j)%2?"#e7e5e4":"#f5f5f4";g.fillRect(i*128,j*128,128,128)}
  for(let k=0;k<900;k++){g.fillStyle=`rgba(${Math.random()<.5?"120,113,108":"255,255,255"},${Math.random()*.2})`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}
  g.strokeStyle="#a8a29e";g.lineWidth=3;for(let k=0;k<=2;k++){g.beginPath();g.moveTo(k*128,0);g.lineTo(k*128,256);g.moveTo(0,k*128);g.lineTo(256,k*128);g.stroke()}});t.wrapS=t.wrapT=W.T.RepeatWrapping;t.anisotropy=8;return t}
const streetTex=()=>cvTex(2048,512,g=>{const gr=g.createLinearGradient(0,0,0,420);gr.addColorStop(0,"#60a5fa");gr.addColorStop(1,"#e0f2fe");g.fillStyle=gr;g.fillRect(0,0,2048,512);
  const bc=["#94a3b8","#cbd5e1","#a8a29e","#d6d3d1","#78716c","#e7e5e4","#64748b","#fca5a5","#fde68a"];let x=0,k=0;while(x<2048){const bw=180+(k*53%200),bh=230+(k*97%200);g.fillStyle=bc[k%bc.length];g.fillRect(x,450-bh,bw,bh);g.fillStyle="#475569";g.fillRect(x,450-bh,bw,8);
    g.fillStyle="rgba(30,58,138,.5)";for(let yy=450-bh+22;yy<390;yy+=40)for(let xx=x+16;xx<x+bw-30;xx+=34)g.fillRect(xx,yy,20,24);g.fillStyle=bc[(k+3)%bc.length];g.fillRect(x+bw*.3,400,bw*.4,50);x+=bw+10;k++}
  for(let i=0;i<10;i++){const tx=90+i*205;g.fillStyle="#78350f";g.fillRect(tx-5,400,10,55);g.fillStyle="#15803d";g.beginPath();g.arc(tx,385,34,0,7);g.fill()}
  g.fillStyle="#9ca3af";g.fillRect(0,450,2048,14);g.fillStyle="#374151";g.fillRect(0,464,2048,48);
  const cc=["#dc2626","#2563eb","#f8fafc","#facc15","#111827","#16a34a"];for(let i=0;i<8;i++){const cx=60+i*250+(i*37%60),cyy=478;g.fillStyle=cc[i%6];g.fillRect(cx,cyy-22,140,30);g.fillRect(cx+30,cyy-46,78,26);g.fillStyle="#bae6fd";g.fillRect(cx+36,cyy-42,30,18);g.fillRect(cx+72,cyy-42,30,18);g.fillStyle="#111";g.beginPath();g.arc(cx+30,cyy+8,11,0,7);g.arc(cx+110,cyy+8,11,0,7);g.fill()}});
/* canvas atlas with a shelf packer; lab() returns [u0,v0,u1,v1] */
function atlas(sz){const cv=document.createElement("canvas");cv.width=cv.height=sz;const A={cv,g:cv.getContext("2d"),sz,x:0,y:0,rh:0,memo:{},tex:null};A.tex=new W.T.CanvasTexture(cv);A.tex.anisotropy=4;return A}
function atlReset(A){A.g.clearRect(0,0,A.sz,A.sz);A.x=A.y=A.rh=0;A.memo={}}
function fitFont(g,t,wt,fs,maxw){g.font=`${wt} ${fs}px system-ui,"Segoe UI Emoji","Apple Color Emoji",sans-serif`;const m=g.measureText(t).width;if(m>maxw){fs=Math.max(8,Math.floor(fs*maxw/m));g.font=`${wt} ${fs}px system-ui,"Segoe UI Emoji","Apple Color Emoji",sans-serif`}}
function lab(A,lines,o,asp){const key=lines.join("\n")+"|"+(o.bg||"")+(o.fg||"")+(o.ph||"")+"|"+Math.round(asp*10)+(o.prod?"p":"");if(A.memo[key])return A.memo[key];
  const h=o.ph||96,w=Math.max(16,Math.min(A.sz,Math.round(h*asp)));if(A.x+w>A.sz){A.x=0;A.y+=A.rh;A.rh=0}if(A.y+h>A.sz)return [0,0,1/A.sz,1/A.sz];
  const g=A.g,x=A.x,y=A.y;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.textAlign="center";g.textBaseline="middle";
  if(o.prod){g.fillStyle=o.bg;g.fillRect(x,y,w,h);g.fillStyle=o.fg;g.fillRect(x,y+h*.78,w,h*.22);g.globalAlpha=.22;g.beginPath();g.arc(x+w*.24,y+h*.4,h*.36,0,7);g.fill();g.globalAlpha=1;
    fitFont(g,o.ic,"",Math.round(h*.46),w*.4);g.fillText(o.ic,x+w*.24,y+h*.42);g.fillStyle=o.fg;fitFont(g,o.nm,900,Math.round(h*.24),w*.5);g.fillText(o.nm,x+w*.71,y+h*.4);
    g.fillStyle=o.bg;g.font=`800 ${Math.round(h*.13)}px system-ui,sans-serif`;g.fillText(o.br||"MERIDIAN",x+w/2,y+h*.89)}
  else{g.fillStyle=o.bg||"#14532d";g.fillRect(x,y,w,h);g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=Math.max(2,h*.04);g.strokeRect(x+g.lineWidth,y+g.lineWidth,w-g.lineWidth*2,h-g.lineWidth*2);g.fillStyle=o.fg||"#fff";const n=lines.length;
    lines.forEach((t,i)=>{fitFont(g,t,i?600:800,Math.round(h*(n===1?.58:i?.5/n:.9/n)),w*.9);g.fillText(t,x+w/2,y+h*(n===1?.53:(i+.85)/(n+.7)))})}
  g.restore();A.x+=w+2;A.rh=Math.max(A.rh,h+2);A.dirty=1;const S2=A.sz,e=1.5;return A.memo[key]=[(x+e)/S2,1-(y+h-e)/S2,(x+w-e)/S2,1-(y+e)/S2]}
/* ---------- products: one procedural model per good, labelled from the product atlas ---------- */
const GC={softdrinks:["#dc2626","#fde047"],water:["#0ea5e9","#ffffff"],juice:["#f97316","#fef08a"],wine:["#7f1d1d","#fde68a"],canned:["#15803d","#ffffff"],cbeans:["#ea580c","#ffffff"],ccorn:["#eab308","#14532d"],cmeat:["#9f1239","#ffffff"],cbeef:["#7c2d12","#ffffff"],soup:["#b91c1c","#ffffff"],
  pasta:["#1d4ed8","#fde047"],rice:["#f5f5f4","#b91c1c"],flour:["#fafaf9","#1e3a8a"],sugar:["#e0f2fe","#0c4a6e"],salt:["#1e40af","#ffffff"],coffee:["#3f2a1d","#fbbf24"],snacks:["#facc15","#b91c1c"],eggs:["#d6c7a1","#78350f"],milk:["#eff6ff","#1d4ed8"],cheese:["#fde047","#7c2d12"],
  butter:["#fef3c7","#b45309"],yoghurt:["#fdf2f8","#be185d"],beef:["#7f1d1d","#ffffff"],pork:["#f9a8d4","#831843"],chicken:["#fde68a","#7c2d12"],burgers:["#991b1b","#fde047"],bread:["#d97706","#ffffff"],fruit:["#16a34a","#ffffff"],veg:["#65a30d","#ffffff"],
  detergent:["#7c3aed","#ffffff"],tpaper:["#f8fafc","#0369a1"],soap:["#ec4899","#ffffff"],paper:["#f1f5f9","#334155"],clothes:["#475569","#ffffff"],batteries:["#111827","#facc15"]};
const PT={softdrinks:"bot",water:"bot",juice:"crt",wine:"wine",canned:"can",cbeans:"can",ccorn:"can",cmeat:"can",cbeef:"can",soup:"can",pasta:"pbx",rice:"bag",flour:"bag",sugar:"bag",coffee:"bag",salt:"salt",snacks:"chip",eggs:"egg",milk:"jug",cheese:"chz",butter:"but",yoghurt:"yog",
  beef:"tray",pork:"tray",chicken:"tray",burgers:"tray",bread:"loaf",fruit:"pile",veg:"pile",detergent:"det",tpaper:"tp",soap:"soap",paper:"ream",clothes:"clo",batteries:"bat"};
const FP={bot:[.09,.09],wine:[.085,.085],crt:[.09,.09],can:[.085,.085],pbx:[.13,.07],bag:[.13,.085],salt:[.09,.09],chip:[.17,.07],egg:[.17,.11],jug:[.115,.115],chz:[.2,.2],but:[.12,.075],yog:[.1,.1],tray:[.22,.16],loaf:[.13,.25],pile:[.2,.2],det:[.16,.1],tp:[.22,.22],soap:[.1,.07],ream:[.23,.31],clo:[.3,.25],bat:[.1,.05],box:[.12,.08]};
function plab(g){const cc=GC[g]||["#64748b","#ffffff"];return lab(W.patl,[g],{prod:1,bg:cc[0],fg:cc[1],ic:GIC[g]||"🛒",nm:(G[g]?G[g][0]:g).toUpperCase(),br:W.brand,ph:128},2)}
const rnd=(a,b,c)=>((Math.imul(a|0,73856093)^Math.imul(b|0,19349663)^Math.imul(c|0,83492791))>>>0)%1000/1000;
function prod(B,g,x,y,z,v){const ty=PT[g]||"box",cc=GC[g]||["#64748b","#ffffff"],bg=hx(cc[0]),fc=hx(cc[1]),u=plab(g),L={uv:u,ry:PI},U={uv:u};bPush(B,x,y,z,0);
  switch(ty){
  case"bot":{const wa=g==="water",k=wa?"g":"s",bc=wa?0x7dd3fc:[0x7f1d1d,0x166534,0xea580c][v%3];cy(B,.04,.18,bc,0,0,0,k);pp(B,k,"cone",.08,.05,.08,0,.18,0,bc);cy(B,.016,.04,bc,0,.23,0,k);cy(B,.019,.022,wa?0x1d4ed8:fc,0,.265,0);cy(B,.0415,.08,0xffffff,0,.05,0,"l",L,"cylo");break}
  case"wine":cy(B,.036,.2,0x14532d,0,0,0);pp(B,"s","cone",.072,.04,.072,0,.2,0,0x14532d);cy(B,.013,.07,0x14532d,0,.24,0);cy(B,.015,.04,bg,0,.29,0);cy(B,.037,.075,0xffffff,0,.05,0,"l",L,"cylo");break;
  case"crt":bx(B,.08,.2,.08,0xffffff,0,0,0,"l",U);bx(B,.08,.03,.012,0xf8fafc,0,.2,0);cy(B,.012,.015,fc,0,.2,.022);break;
  case"can":for(let k=0;k<2;k++){cy(B,.038,.105,0xffffff,0,k*.11,0,"l",L,"cylo");cy(B,.036,.006,0xd1d5db,0,k*.11+.104,0,"m")}break;
  case"pbx":bx(B,.12,.19,.06,0xffffff,0,0,0,"l",U);break;
  case"bag":bx(B,.12,.18,.075,0xffffff,0,0,0,"l",U);bx(B,.12,.035,.035,bg,0,.18,0);break;
  case"salt":cy(B,.038,.12,0xffffff,0,0,0,"l",L,"cylo");cy(B,.037,.015,0xf8fafc,0,.12,0);break;
  case"chip":bx(B,.15,.19,.05,0xffffff,0,.012,0,"l",U);bx(B,.155,.018,.025,0xd1d5db,0,0,0,"m");bx(B,.155,.018,.025,0xd1d5db,0,.2,0,"m");break;
  case"egg":for(let k=0;k<2;k++){bx(B,.16,.06,.1,0xd6c7a1,0,k*.068,0);pp(B,"l","pl",.15,.09,1,0,k*.068+.0605,0,0xffffff,{rx:-PI/2,uv:u})}break;
  case"jug":bx(B,.1,.17,.1,0xf8fafc,0,0,0);bx(B,.103,.08,.103,0xffffff,0,.03,0,"l",U);bx(B,.07,.03,.07,0xf8fafc,0,.17,0);cy(B,.018,.025,fc,0,.2,0);bx(B,.018,.09,.03,0xf1f5f9,.035,.1,-.055);break;
  case"det":bx(B,.14,.23,.08,bg,0,0,0);bx(B,.142,.11,.082,0xffffff,0,.05,0,"l",U);cy(B,.022,.035,0xf8fafc,-.035,.23,0);bx(B,.03,.07,.035,bg,.04,.21,0);break;
  case"chz":for(let k=0;k<(v%2?2:1);k++){cy(B,.095,.07,0xfacc15,0,k*.072,0);cy(B,.097,.03,v%3?0xb91c1c:0xca8a04,0,k*.072+.02,0,"s",null,"cylo");pp(B,"l","pl",.12,.06,1,0,k*.072+.071,0,0xffffff,{rx:-PI/2,uv:u})}break;
  case"but":for(let k=0;k<2;k++)bx(B,.11,.045,.065,0xffffff,0,k*.047,0,"l",U);break;
  case"yog":for(let a=0;a<2;a++)for(let b=0;b<2;b++){const X=(a-.5)*.045,Z=(b-.5)*.045;cy(B,.021,.07,0xfdf2f8,X,0,Z,"s",null,"cup");pp(B,"l","pl",.04,.04,1,X,.0705,Z,0xffffff,{rx:-PI/2,uv:u})}break;
  case"tray":{const mc={beef:0xb91c1c,pork:0xfda4af,chicken:0xf2c6a0,burgers:0x7c2d12}[g];for(let k=0;k<2;k++){const yy=k*.055;bx(B,.2,.025,.14,g==="chicken"?0x1e3a8a:0x111827,0,yy,0);
      if(g==="burgers"){cy(B,.042,.02,mc,-.045,yy+.02,0);cy(B,.042,.02,mc,.045,yy+.02,0)}else sp(B,.08,.018,.055,mc,0,yy+.03,0,"s","sphl");bx(B,.2,.004,.14,0xe0f2fe,0,yy+.045,0,"g");pp(B,"l","pl",.07,.04,1,.05,yy+.05,.03,0xffffff,{rx:-PI/2,uv:u})}break}
  case"loaf":sp(B,.06,.055,.12,0xb45309,0,.05,0);bx(B,.12,.07,.2,0xffffff,0,0,0,"l",U);break;
  case"pile":{const cs=g==="fruit"?[0xdc2626,0xf97316,0xfacc15,0x84cc16]:[0x16a34a,0xef4444,0xf97316,0x7c3aed],col=cs[v%4],r=.045;[[-.05,-.04],[.05,-.04],[0,.045]].forEach(([a,b])=>sp(B,r,r*.92,r,col,a,r,b,"s","sphl"));sp(B,r,r*.92,r,col,0,r*2.6,0,"s","sphl");break}
  case"tp":for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let k=0;k<2;k++)cy(B,.05,.1,0xffffff,(a-.5)*.1,k*.1,(b-.5)*.1);pp(B,"l","pl",.2,.1,1,0,.1,.101,0xffffff,U);break;
  case"soap":for(let k=0;k<3;k++)bx(B,.085,.025,.055,0xffffff,0,k*.026,0,"l",U);break;
  case"ream":for(let k=0;k<3;k++)bx(B,.21,.055,.29,0xffffff,0,k*.056,0,"l",U);break;
  case"clo":{const cl=[0x1d4ed8,0xdc2626,0xf8fafc,0x16a34a,0x111827,0xfacc15];for(let k=0;k<4;k++)bx(B,.28,.04,.23,cl[(v+k)%6],0,k*.041,0);break}
  case"bat":for(let k=0;k<2;k++)bx(B,.09,.13,.018,0xffffff,0,0,(k-.5)*.022,"l",U);break;
  default:bx(B,.11,.15,.07,0xffffff,0,0,0,"l",U)}
  bPop(B)}
/* facings along frame x (front edge at z=0, depth toward -z); how many are filled follows the stock fraction */
function fillRow(B,g,len,dep,fr,seed,dmax){if(!g||fr<=0)return;const [fw,fd]=FP[PT[g]||"box"],nf=Math.max(1,Math.floor(len/fw)),nd=Math.max(1,Math.min(dmax,Math.floor(dep/fd))),pad=(len-nf*fw)/2;
  for(let i=0;i<nf;i++){if(rnd(seed,i,1)>fr*1.08)continue;const x=-len/2+pad+fw*(i+.5);for(let j=0;j<nd;j++){if(j&&rnd(seed,i,j+7)>fr*1.15)break;prod(B,g,x,0,-fd*(j+.5),(seed+i*7+j)>>>0)}}}
function pile(B,g,w,dp,fr,seed,va){if(!g||fr<=0)return;if(g!=="fruit"&&g!=="veg")return fillRow(B,g,w,dp,fr,seed,9);const big=g==="veg"&&!va,r=big?.075:.05,cols=g==="fruit"?(va?[0xf97316,0xfb923c]:[0xdc2626,0xb91c1c]):(va?[0xef4444,0xdc2626]:[0x65a30d,0x4d7c0f]);
  const nx=Math.floor(w/(2*r)),nz=Math.floor(dp/(2*r));for(let L=0;L<2;L++){if(L&&fr<.5)break;for(let i=0;i<nx-L;i++)for(let j=0;j<nz-L;j++){if(rnd(seed+L,i,j)>fr*1.1)continue;sp(B,r,r*.9,r,cols[(i+j)%2],-w/2+r*(2*i+1+L),r*(1+L*1.5),-dp+r*(2*j+1+L),"s","sphl")}}}
const price=(c,t,g)=>fmtc(G[g][1]*cityF(c,g)*((S.px[c.id]||{})[g]||1)*SM_MK[t.mk].p/100);
function slotSign(B,c,t,f,s,x,y,z,ry,w,two){const g=f.g[s];let L,bg;if(!g){L=["EMPTY SLOT","Press E to stock"];bg="#475569"}
  else{const q=t.sh[g]||0,bad=smGF(t,g)<.9&&SM_COLD[g]&&SM_FX[f.k].cold!==SM_COLD[g];L=[gname(g),bad?`⚠ needs ${SM_COLD[g]==="f"?"fridge":"freezer"}`:q>=.5?`${Math.floor(q)} in stock`:"EMPTY"];bg=bad?"#c2410c":q>=.5?(f.k==="endcap"?"#a16207":"#1e3a8a"):"#7f1d1d"}
  sg(B,L,w||1.2,.38,x,y,z,ry,{bg},two)}
function drawFx(B,f,c,t,hi,promo){const d=SM_FX[f.k],cap=Math.max(1,smCap(c,t)),dm=hi?2:1,seed=f.i*131+7,
    fr=g=>{if(!g)return 0;const r=Math.min(1,(t.sh[g]||0)/cap);return r<=0?0:Math.max(.1,Math.round(r*8)/8)},tagOf=g=>g?lab(W.atl,[price(c,t,g)],{bg:"#fde047",fg:"#111827",ph:48},2.2):null;
  if(f.k==="shelf"){const L=d.d-.08;bx(B,.9,.12,d.d,0x1e293b,0,0,0);bx(B,.05,1.8,d.d,0xe2e8f0,0,.12,0);for(const z of [-1,1])bx(B,.9,1.95,.05,0x94a3b8,0,0,z*(d.d/2-.025),"m");bx(B,.92,.06,d.d+.02,0xf8fafc,0,1.93,0);
    [-1,1].forEach((sd,s)=>{const g=f.g[s],q=fr(g),tag=tagOf(g);[.12,.55,.98,1.41].forEach((y,li)=>{if(li)bx(B,.4,.025,L,0xcbd5e1,sd*.225,y-.025,0,"m");bx(B,.015,.05,L,g?0x1e3a8a:0x475569,sd*.448,y-.05,0);
        if(tag)for(let z=-L/2+.35;z<L/2;z+=.75)pp(B,"t","pl",.1,.045,1,sd*.457,y-.025,z,0xffffff,{ry:sd*PI/2,uv:tag});bPush(B,sd*.44,y,0,sd*PI/2);fillRow(B,g,L-.06,.38,q,seed+s*17+li*5,dm);bPop(B)});
      slotSign(B,c,t,f,s,sd*.47,2.2,0,sd*PI/2,1.15)})}
  else if(f.k==="fridge"){const L=d.d-.1,nd=3,dw=d.d/nd;bx(B,.9,.15,d.d,0x334155,0,0,0);bx(B,.9,.28,d.d,0xf8fafc,0,1.95,0);for(const z of [-1,1])bx(B,.9,2.1,.06,0xe2e8f0,0,0,z*(d.d/2-.03));bx(B,.06,1.8,L,0xe0f2fe,0,.15,0,"e");
    [-1,1].forEach((sd,s)=>{const g=f.g[s],q=fr(g),tag=tagOf(g);bx(B,.02,.07,d.d,0x38bdf8,sd*.455,2.08,0,"e");
      [.2,.62,1.04,1.46].forEach((y,li)=>{bx(B,.38,.02,L,0x94a3b8,sd*.23,y-.02,0,"m");if(tag)pp(B,"t","pl",.1,.045,1,sd*.43,y-.03,-L/2+.3+li*.5,0xffffff,{ry:sd*PI/2,uv:tag});bPush(B,sd*.41,y,0,sd*PI/2);fillRow(B,g,L-.06,.36,q,seed+s*17+li*5,dm);bPop(B)});
      for(let k=0;k<nd;k++){const z=-d.d/2+dw*(k+.5);bx(B,.025,1.76,dw-.06,0xe0f2fe,sd*.44,.17,z,"f");bx(B,.025,.55,.025,0xcbd5e1,sd*.465,.85,z+dw/2-.12,"m")}
      for(let k=0;k<=nd;k++){bx(B,.04,1.8,.05,0x94a3b8,sd*.44,.15,-d.d/2+dw*k,"m");if(hi)bx(B,.01,1.7,.02,0xf0f9ff,sd*.415,.2,-d.d/2+dw*k+(k===nd?-.04:.04),"e")}
      slotSign(B,c,t,f,s,sd*.46,2.45,0,sd*PI/2,1.15)})}
  else if(f.k==="freezer"){bx(B,d.w,.45,d.d,0xf8fafc,0,0,0);bx(B,d.w+.02,.07,d.d+.02,0x0284c7,0,.32,0);for(const sd of [-1,1]){bx(B,.06,.42,d.d,0xf1f5f9,sd*(d.w/2-.03),.45,0);bx(B,d.w,.42,.06,0xf1f5f9,0,.45,sd*(d.d/2-.03))}
    bx(B,d.w-.12,.01,d.d-.12,0xbae6fd,0,.45,0,"e");bx(B,.04,.4,d.d-.12,0xe0f2fe,0,.45,0,"e");bx(B,d.w,.025,.04,0x94a3b8,0,.87,0,"m");
    [-1,1].forEach((sd,s)=>{const g=f.g[s],q=fr(g);bPush(B,0,.46,sd*(d.d/2-.07),sd>0?0:PI);fillRow(B,g,d.w-.16,d.d/2-.1,q,seed+s*17,hi?9:3);bPop(B);
      bx(B,d.w-.06,.02,d.d/2-.05,0xe0f2fe,0,.86,sd*d.d/4,"f");cy(B,.01,.5,0x64748b,0,.87,sd*d.d/4,"m");slotSign(B,c,t,f,s,0,1.55,sd*d.d/4,0,.95,true)})}
  else if(f.k==="endcap"){const g=f.g[0],q=fr(g);bx(B,d.w,.5,d.d,0xb91c1c,0,0,0);bx(B,d.w-.1,.42,d.d-.3,0xdc2626,0,.5,-.15);bx(B,d.w-.2,.42,d.d-.6,0xef4444,0,.92,-.3);bx(B,d.w,1.9,.05,0x991b1b,0,0,-d.d/2+.025);
    [[.5,d.d/2],[.92,d.d/2-.3],[1.34,d.d/2-.6]].forEach(([y,z],k)=>{bPush(B,0,y,z-.02,0);fillRow(B,g,d.w-.12-k*.1,.26,q,seed+k,dm);bPop(B)});
    sg(B,promo?["🔥 FLYER DEAL","This week only"]:["⭐ SPECIAL","Great value"],d.w-.04,.38,0,1.62,-d.d/2+.06,0,{bg:promo?"#dc2626":"#facc15",fg:promo?"#fef08a":"#7f1d1d"});slotSign(B,c,t,f,0,0,2.12,-d.d/2+.06,0,1.1)}
  else if(f.k==="produce"){bx(B,d.w,.55,d.d,0x78350f,0,0,0);bx(B,d.w+.04,.04,d.d+.04,0x92400e,0,.55,0);
    [-1,1].forEach((sd,s)=>{const g=f.g[s],q=fr(g);bPush(B,0,.6,sd*d.d/4,sd>0?0:PI);
      [-.4,.4].forEach((cx,k)=>{bPush(B,cx,.05,.02,0,.22);bx(B,.72,.02,.62,0xa16207,0,0,0);for(const yy of [.02,.09]){bx(B,.72,.05,.02,0xb45309,0,yy,.3);bx(B,.72,.05,.02,0xb45309,0,yy,-.3);bx(B,.02,.05,.62,0xb45309,.35,yy,0);bx(B,.02,.05,.62,0xb45309,-.35,yy,0)}
        bPush(B,0,.02,.29,0);pile(B,g,.68,.58,q,seed+s*17+k*3,k);bPop(B);bPop(B)});
      if(g)pp(B,"t","pl",.16,.07,1,0,.12,.4,0xffffff,{rx:-.5,uv:tagOf(g)});bPop(B);slotSign(B,c,t,f,s,0,1.5,sd*d.d/4,0,1.1,true);cy(B,.01,.7,0x64748b,0,.6,sd*d.d/4,"m")})}}
/* shopping trolley (origin on the floor, handle toward -z) and hand basket */
function cartParts(B,full){const M=0xcbd5e1;for(const [a,b] of [[-.2,-.3],[.2,-.3],[-.2,.3],[.2,.3]])cy(B,.05,.04,0x111827,a+.02,.05,b,"s",{rz:PI/2});
  bx(B,.03,.03,.72,M,-.21,.1,0);bx(B,.03,.03,.72,M,.21,.1,0);bx(B,.42,.015,.6,0x94a3b8,0,.14,0);for(const a of [-.24,.24])bx(B,.025,.36,.025,M,a,.1,-.36);bx(B,.54,.015,.78,M,0,.46,0);
  for(let k=0;k<4;k++){const y=.5+k*.11;bx(B,.012,.012,.8,M,-.27,y,0);bx(B,.012,.012,.8,M,.27,y,0);bx(B,.55,.012,.012,M,0,y,.4);bx(B,.55,.012,.012,M,0,y,-.4)}
  for(const z of [-.4,-.13,.13,.4])for(const a of [-.27,.27])bx(B,.012,.38,.012,M,a,.46,z);for(const a of [-.14,.14]){bx(B,.012,.38,.012,M,a,.46,.4);bx(B,.012,.38,.012,M,a,.46,-.4)}
  bx(B,.6,.035,.035,0xdc2626,0,.93,-.45);for(const a of [-.26,.26])bx(B,.02,.1,.06,M,a,.84,-.43);
  if(full){bx(B,.16,.2,.1,0xf97316,-.12,.47,.1);bx(B,.12,.14,.16,0x2563eb,.12,.47,-.15);cy(B,.04,.26,0x16a34a,.1,.47,.2);bx(B,.14,.1,.2,0xfacc15,-.1,.47,-.2);sp(B,.05,.05,.05,0xdc2626,.05,.53,0)}}
function basketParts(B){const R=0xdc2626;bx(B,.38,.015,.26,R,0,0,0);bx(B,.38,.18,.012,R,0,0,.13);bx(B,.38,.18,.012,R,0,0,-.13);bx(B,.012,.18,.26,R,.19,0,0);bx(B,.012,.18,.26,R,-.19,0,0);bx(B,.3,.02,.02,0x111827,0,.36,0);bx(B,.02,.2,.02,0x111827,-.14,.17,0);bx(B,.02,.2,.02,0x111827,.14,.17,0);
  bx(B,.12,.1,.08,0x16a34a,-.08,.015,0);cy(B,.035,.16,0xf59e0b,.09,.015,0)}
function checkout(B,x,z,n,t,ins){bPush(B,x,0,z,0);bx(B,.6,.7,1.6,0x1e293b,0,0,0);bx(B,.62,.1,1.62,0x16a34a,0,.7,0);bx(B,.64,.04,1.64,0xcbd5e1,0,.8,0,"m");
  bx(B,.44,.025,.95,0xffffff,0,.84,-.3,"b");for(const zz of [-.78,.18])cy(B,.03,.46,0x94a3b8,.23,.84,zz,"m",{rz:PI/2});bx(B,.04,.04,.3,0xfacc15,.14,.865,-.45);
  bx(B,.32,.012,.22,0x7f1d1d,0,.84,.3,"e");bx(B,.32,.2,.05,0x111827,0,.84,.44);bx(B,.26,.12,.01,0xef4444,0,.88,.41,"e");
  cy(B,.015,.22,0x334155,.25,.84,.12);bx(B,.09,.14,.045,0x111827,.25,1.04,.12,"s",{rx:-.4});bx(B,.06,.05,.005,0x22c55e,.25,1.1,.15,"e",{rx:-.4});
  cy(B,.02,.2,0x334155,-.2,.84,.25);bx(B,.04,.22,.32,0x111827,-.2,1.04,.25);bx(B,.006,.18,.27,0x38bdf8,-.225,1.06,.25,"e");bx(B,.36,.1,.36,0x0f172a,-.12,.84,-.15);
  bx(B,.56,.03,.5,0x94a3b8,0,.7,.62,"m");for(const a of [-.16,.14]){bx(B,.2,.24,.13,a<0?0xf8fafc:0x16a34a,a,.73,.66);bx(B,.12,.06,.01,0x111827,a,.97,.66)}
  ins.slice(0,3).forEach((g,k)=>prod(B,g,0,.855,-.7+k*.24,k));
  cy(B,.025,1.65,0x94a3b8,.28,.82,.74,"m");bx(B,.36,.36,.04,0x14532d,.28,2.47,.74);sg(B,[`${n}`],.32,.32,.28,2.65,.762,0,{bg:"#16a34a"});sg(B,[`${n}`],.32,.32,.28,2.65,.718,PI,{bg:"#16a34a"});bPop(B)}
/* ---------- build the store ---------- */
function build(){const T=W.T,c=city(),t=smS(c),tr=SM_TIER[t.tier],[w,d]=SM_DIM[t.tier]||SM_DIM[0],hw=W.hw=w/2,hd=W.hd=d/2,hi=W.q>0,promo=S.day<t.pu,ins=smIn(t);
  if(W.world){W.scene.remove(W.world);W.world.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  const g=W.world=new T.Group();W.scene.add(g);W.obst=[];const ob=(x0,x1,z0,z1)=>W.obst.push({x0,x1,z0,z1});
  atlReset(W.atl);W.brand=(S.name||"Meridian").toUpperCase().slice(0,18);const B=mkB(),C=mkB();W.staff=[];W.ceil=[];
  // floor, pavement and the street outside the front windows
  const fm=mat("floor");fm.map.repeat.set(w,d);const fl=new T.Mesh(new T.PlaneGeometry(w,d),fm);fl.rotation.x=-PI/2;g.add(fl);
  bx(B,w+30,.04,12,0x9ca3af,0,-.06,hd+6);bx(B,w+30,.14,.3,0xd6d3d1,0,-.06,hd+11.8);const sW=w+34,st=new T.Mesh(new T.PlaneGeometry(sW,sW/4),mat("street"));st.position.set(0,sW/8-.4,hd+12);st.rotation.y=PI;g.add(st);
  // walls: warm white, dark skirting, teal accent band
  const WC=0xf5efe3,SK=0x475569,AC=0x0f766e;bx(B,w,3.6,.2,WC,0,0,-hd);bx(B,.2,3.6,d,WC,-hw,0,0);bx(B,.2,3.6,d,WC,hw,0,0);
  bx(B,w,.14,.24,SK,0,0,-hd);bx(B,.24,.14,d,SK,-hw,0,0);bx(B,.24,.14,d,SK,hw,0,0);bx(B,w,.22,.23,AC,0,2.3,-hd);bx(B,.23,.22,d,AC,-hw,2.3,0);bx(B,.23,.22,d,AC,hw,2.3,0);
  // front: low wall, big windows with mullions, door frame and the brand sign
  const sw=(w-3)/2;for(const s of [-1,1]){const cx=s*(1.5+sw/2);bx(B,sw,.6,.2,WC,cx,0,hd);bx(B,sw,.6,.2,WC,cx,3,hd);bx(B,sw,2.4,.04,0xbfdbfe,cx,.6,hd,"g");bx(B,sw,.05,.16,0x64748b,cx,.58,hd,"m");
    for(let x=1.5;x<hw+.01;x+=1.5)bx(B,.08,2.4,.14,0x64748b,s*Math.min(x,hw-.06),.6,hd,"m")}
  bx(B,3,.6,.2,WC,0,3,hd);for(const s of [-1,1])bx(B,.12,3,.2,0x64748b,s*1.5,0,hd,"m");bx(B,3.2,.14,.22,0x475569,0,2.86,hd-.12,"m");bx(B,.12,.05,.06,0xef4444,0,2.8,hd-.24,"e");
  bx(B,6.4,1.3,.12,0x14532d,0,3.4,hd+.16);sg(B,[`🛒 ${W.brand}`,tr.n.toUpperCase()],6,1.1,0,4.05,hd+.23,0,{bg:"#166534",fg:"#fef08a",ph:128});
  sg(B,[`${W.brand} ${tr.n.toUpperCase()}`,`${c.name} · thanks for shopping with us`],2.9,.5,0,3.3,hd-.11,PI,{bg:"#166534"});sg(B,["📹 CCTV in operation"],.9,.24,-2.2,2.1,hd-.11,PI,{bg:"#facc15",fg:"#111827"});
  // sliding doors (moved every frame in loop)
  W.doors=[];for(const s of [-1,1]){const D=mkB(),dg=new T.Group();bx(D,1.5,.06,.06,0x94a3b8,0,0,0,"m");bx(D,1.5,.06,.06,0x94a3b8,0,2.6,0,"m");bx(D,.06,2.66,.06,0x94a3b8,-.72,0,0,"m");bx(D,.06,2.66,.06,0x94a3b8,.72,0,0,"m");bx(D,1.38,2.54,.02,0xe0f2fe,0,.06,0,"g");
    pp(D,"t","pl",.5,.24,1,0,1.35,-.02,0xffffff,{ry:PI,uv:lab(W.atl,[s<0?"⇠ AUTO":"AUTO ⇢"],{bg:"#16a34a"},2.1)});pp(D,"t","pl",.5,.24,1,0,1.35,.02,0xffffff,{uv:lab(W.atl,["WELCOME"],{bg:"#16a34a"},2.1)});
    bMesh(D,dg);dg.position.set(s*.75,0,hd-.08);g.add(dg);W.doors.push(dg)}
  // ceiling, light troffers, security domes (all hidden in build mode)
  bx(C,w,.05,d,0xf1f5f9,0,3.6,0);for(let z=-hd+1.6;z<hd-.4;z+=2.6)for(let x=-hw+1.8;x<hw-1;x+=3.4){bx(C,2.5,.05,.34,0x94a3b8,x,3.53,z,"m");bx(C,2.4,.02,.26,0xffffff,x,3.515,z,"e")}
  for(const [x,z] of [[-hw+1,-hd+1],[hw-1,-hd+1],[-hw+1,hd-1.2],[hw-1,hd-1.2],[0,0]]){cy(C,.12,.04,0xf1f5f9,x,3.55,z);pp(C,"s","hsph",.2,.16,.2,x,3.56,z,0x0f172a,{rx:PI})}
  for(const s of [-1,1]){bPush(B,s*(hw-.25),2.95,-hd+.25,s<0?PI*.75:-PI*.75,0);bx(B,.06,.2,.06,0xe5e7eb,0,0,-.1);bx(B,.12,.1,.28,0xf8fafc,0,.12,0,"s",{rx:.3});cy(B,.035,.03,0x0f172a,0,.15,.15,"s",{rx:PI/2+.3});bx(B,.02,.02,.02,0xef4444,.04,.2,-.05,"e");bPop(B)}
  // checkouts: one lane per cashier, split left/right of a 3 m walkway from the door
  const nc=Math.max(0,Math.min(12,t.st.cash|0)),zc=W.zc=hd-3,lw=1.6,per=Math.max(1,Math.floor((hw-2.3)/lw)),shown=Math.min(nc,per*2);W.lanes=[];
  for(let i=0;i<shown;i++){const sd=i%2?1:-1,j=Math.floor(i/2),x=sd*(1.5+lw/2+j*lw);W.lanes.push({x,q:[]});checkout(B,x,zc,i+1,t,ins.length?ins.slice(i%ins.length).concat(ins):[]);ob(x-.35,x+.35,zc-.85,zc+.85);W.staff.push(mkFig({x:x-.55,z:zc+.1,yaw:PI/2,sh:0x16a34a,pa:0x1f2937,lane:i}))}
  if(!nc)sg(B,["No cashiers","Hire some on the PC"],2.4,.9,-3,1.6,zc,0,{bg:"#7f1d1d"},true);
  bx(B,w-.4,.01,.08,0xfbbf24,0,0,hd-4.2);
  // cart corral by the door, ATM, wet-floor sign
  const ncar=Math.max(2,Math.min(hi?6:3,Math.floor((hw-3.4)/.28)));for(let k=0;k<ncar;k++){bPush(B,2.4+k*.26,0,hd-.75,-PI/2);cartParts(B,false);bPop(B)}
  const cr1=2.4+ncar*.26+.5;for(const zz of [hd-1.15,hd-.35])bx(B,cr1-1.9,.04,.04,0x94a3b8,(cr1+1.9)/2,.85,zz,"m");for(const x of [1.95,cr1])for(const zz of [hd-1.15,hd-.35])cy(B,.025,.9,0x64748b,x,0,zz,"m");
  sg(B,["🛒 Trolleys"],.7,.22,1.95,1.05,hd-.75,-PI/2,{bg:"#1d4ed8"},true);ob(1.9,cr1+.1,hd-1.2,hd-.3);
  bPush(B,-hw+.45,0,hd-1.35,PI/2);bx(B,.6,1.55,.5,0x334155,0,0,0);bx(B,.62,.2,.52,0x1d4ed8,0,1.55,0);sg(B,["🏧 ATM","Cash 24/7"],.56,.18,0,1.65,.27,0,{bg:"#1d4ed8"});bx(B,.38,.28,.02,0x38bdf8,0,1.08,.26,"e",{rx:-.15});
  bx(B,.3,.04,.18,0x94a3b8,0,.92,.3,"m");bx(B,.12,.02,.02,0x22c55e,.16,1.0,.26,"e");bx(B,.2,.03,.02,0x111827,0,.75,.26);bPop(B);ob(-hw,-hw+.8,hd-1.7,hd-1);
  // fixtures from the saved layout
  for(const f of t.lay){bPush(B,f.x,0,f.z,-f.r*PI/2);drawFx(B,f,c,t,hi,promo);bPop(B);const r=smFxR(f);ob(r.x0,r.x1,r.z0,r.z1)}
  const AC2=["#1d4ed8","#0f766e","#7c3aed","#b45309","#be123c","#0369a1"];t.lay.filter(f=>f.k==="shelf"||f.k==="fridge"||f.k==="freezer").sort((a,b)=>a.x-b.x||a.z-b.z).forEach((f,i)=>{bPush(C,f.x,0,f.z,-f.r*PI/2);
    for(const a of [-.55,.55])cy(C,.008,.06,0x64748b,a,3.5,0,"m");sg(C,[`AISLE ${i+1}`,f.g.filter(Boolean).map(x=>G[x][0]).join(" · ")||"Empty"],1.3,.4,0,3.3,0,0,{bg:AC2[i%AC2.length]},true);bPop(C)});
  // section banners on the walls
  const ban=(L,col,x,z,ry,bw)=>sg(B,L,bw||3,.7,x,2.95,z,ry,{bg:col});ban(["🍎 PRODUCE","Fresh fruit & veg"],"#15803d",-hw+.12,hd*.15,PI/2);ban(["🥛 DAIRY","Milk · cheese · yoghurt"],"#1d4ed8",-hw+.12,-hd*.45,PI/2);
  ban(["🧴 HOUSEHOLD","Cleaning · paper · soap"],"#7c3aed",hw-.12,-hd*.05,-PI/2,3.4);ban(["🥖 BAKERY","Baked every morning"],"#b45309",-hw/2,-hd+.12,0);ban(["🧊 FROZEN","Meat · burgers · ice"],"#0369a1",hw/2,-hd+.12,0);
  if(t.add.deli)ban(["🧀 DELI","Cut to order"],"#be123c",0,-hd+.12,0,2.4);
  // fresh counters on the back wall
  const bx3=[-hw/2,0,hw/2];
  if(t.add.bakery){const x0=bx3[0],z0=-hd;for(const a of [-.4,.4])for(const b of [.2,.68])bx(B,.04,1.9,.04,0x78350f,x0-1.05+a,0,z0+b);
    for(const [k,y] of [.35,.75,1.15,1.55].entries()){bPush(B,x0-1.05,y,z0+.44,0,.25);bx(B,.84,.03,.5,0xa16207,0,0,0);for(let i=0;i<4;i++){if(k%2){cy(B,.03,.5,0xd97706,.25,.03+(i%2)*.06,-.15+i*.1,"s",{rz:PI/2})}else{sp(B,.08,.05,.13,0xb45309,-.3+i*.2,.06,0);bx(B,.02,.012,.1,0xfde68a,-.3+i*.2,.1,0)}}bPop(B)}
    bx(B,2.2,.9,.8,0xd97706,x0+.4,0,z0+1.0);bx(B,2.24,.04,.84,0x78350f,x0+.4,.9,z0+1.0);bx(B,2.1,.38,.5,0xffffff,x0+.4,.94,z0+1.12,"g");bx(B,2.08,.02,.48,0xfef3c7,x0+.4,.95,z0+1.12,"e");
    for(let i=0;i<12;i++)sp(B,.055,.028,.055,[0xf472b6,0x92400e,0xfbbf24][i%3],x0-.55+(i%6)*.38,1.0,z0+1.0+Math.floor(i/6)*.22,"s","sphl");
    cy(B,.15,.25,0xa16207,x0+1.3,.94,z0+.75);for(let i=0;i<4;i++)cy(B,.025,.55,0xd97706,x0+1.24+i*.04,1.0,z0+.73+(i%2)*.04,"s",{rx:.1*(i-1.5)});
    W.staff.push(mkFig({x:x0+.4,z:z0+.4,yaw:0,sh:0xf8fafc,pa:0x334155,md:"work"}));ob(x0-1.6,x0+1.6,z0,z0+1.45)}
  if(t.add.deli){const x0=bx3[1],z0=-hd;bx(B,3,.75,.85,0xbe123c,x0,0,z0+1.05);bx(B,2.9,.03,.75,0xfef3c7,x0,.75,z0+1.05,"e");
    for(let i=0;i<7;i++){const xx=x0-1.25+i*.42;if(i%3===0){cy(B,.12,.1,0xfacc15,xx,.78,z0+1.05);bx(B,.12,.08,.1,0xfde047,xx+.1,.78,z0+1.25,"s",{ry:.5})}else if(i%3===1){for(let k=0;k<3;k++)cy(B,.03,.3,k%2?0x7f1d1d:0x9f1239,xx-.1+k*.08,.81,z0+1.05,"s",{rx:PI/2})}else{sp(B,.14,.07,.1,0xfda4af,xx,.84,z0+1.0);bx(B,.3,.02,.18,0x111827,xx,.78,z0+1.25)}}
    bx(B,2.95,.5,.02,0xe0f2fe,x0,.75,z0+1.47,"g",{rx:-.35});bx(B,2.95,.02,.55,0xe0f2fe,x0,1.22,z0+1.0,"g");bx(B,3,.05,.25,0xcbd5e1,x0,1.18,z0+.62,"m");bx(B,.3,.08,.25,0xe5e7eb,x0+1.1,1.23,z0+.62,"m");bx(B,.12,.05,.01,0x22c55e,x0+1.1,1.27,z0+.75,"e");
    bx(B,2.6,.03,.22,0x78350f,x0,1.7,z0+.22);for(let i=0;i<6;i++){sp(B,.07,.12,.07,i%2?0xb45309:0x7f1d1d,x0-1.1+i*.44,1.55,z0+.22);cy(B,.004,.12,0x111827,x0-1.1+i*.44,1.62,z0+.22)}
    sg(B,["🎟 Take a number"],.7,.22,x0-1.75,1.3,z0+1.2,0,{bg:"#be123c"});cy(B,.02,1.2,0xdc2626,x0-1.75,0,z0+1.1);W.staff.push(mkFig({x:x0,z:z0+.45,yaw:0,sh:0xf8fafc,pa:0x1f2937,md:"work"}));ob(x0-1.6,x0+1.6,z0,z0+1.45)}
  if(t.add.freezer){const x0=bx3[2],z0=-hd;for(const s of [-1,1]){const xc=x0+s*.75;bx(B,1.4,.8,.9,0xf8fafc,xc,0,z0+.9);bx(B,1.42,.08,.92,0x0284c7,xc,.6,z0+.9);bx(B,1.3,.01,.8,0xbae6fd,xc,.8,z0+.9,"e");
      for(let i=0;i<10;i++){const xx=xc-.5+(i%5)*.25,zz=z0+.72+Math.floor(i/5)*.36;if(s<0)cy(B,.07,.12,[0xf9a8d4,0x92400e,0xfef3c7][i%3],xx,.81,zz);else bx(B,.22,.04,.3,[0xdc2626,0x1d4ed8][i%2],xx,.81,zz)}
      bx(B,1.36,.025,.86,0xe0f2fe,xc,.98,z0+.9,"f");bx(B,1.4,.18,.04,0xcbd5e1,xc,.8,z0+1.33,"m")}ob(x0-1.6,x0+1.6,z0,z0+1.45)}
  // office PC in the back-right corner
  const px=hw-1.2,pz=-hd+2.2;bx(B,1.4,.05,.8,0x6b4a33,px,.72,pz);for(const a of [-.65,.65])bx(B,.05,.72,.75,0x57534e,px+a,0,pz);bx(B,.72,.44,.04,0x111827,px,.83,pz+.06);bx(B,.05,.12,.05,0x111827,px,.72,pz+.02);
  pp(B,"t","pl",.66,.38,1,px,1.05,pz+.085,0xffffff,{uv:lab(W.atl,["🖥 STORE PC","Manage"],{bg:"#0b1220",fg:"#38bdf8"},.66/.38)});bx(B,.42,.02,.14,0x334155,px,.77,pz+.3);
  cy(B,.03,.42,0x111827,px+.2,0,pz+.85);bx(B,.45,.08,.45,0x1e293b,px+.2,.42,pz+.85);bx(B,.45,.5,.06,0x1e293b,px+.2,.5,pz+1.07);sg(B,["🔒 STAFF ONLY · OFFICE"],1.5,.28,hw-.12,2.05,pz,-PI/2,{bg:"#334155"});
  ob(px-.75,px+.75,pz-.45,pz+.45);W.pc={x:px,z:pz+1};
  navBuild();
  // stockers with a pallet jack in a wide-enough aisle
  const cand=t.lay.filter(f=>f.k==="shelf"||f.k==="fridge"),used=[];let si=0;
  for(let i=0;i<Math.min(6,t.st.stock|0)&&cand.length;i++){for(let k=0;k<cand.length*2;k++){const f=cand[(si++)%cand.length],sd=(si+i)%2?1:-1,a=SM_FX[f.k].w/2,pts=[[a+.25,-.95],[a+.25,.15],[a+1.05,-.95],[a+1.05,.15],[a+1.9,-.4],[a+.45,.75]].map(([lx,lz])=>l2w(f,sd*lx,lz));
      if(!pts.every(([x,z])=>navFree(x,z,.08))||used.some(([x,z])=>Math.hypot(x-pts[0][0],z-pts[0][1])<2))continue;used.push(pts[0]);
      bPush(B,f.x,0,f.z,-f.r*PI/2);bPush(B,sd*(a+.65),0,-.4,0);bx(B,.8,.03,1,0x92400e,0,.1,0);for(const zz of [-.45,0,.45])bx(B,.8,.1,.1,0xa16207,0,0,zz);
      for(let n=0;n<(hi?8:4);n++)bx(B,.36,.28,.3,n%3?0xc4a484:0xb08d63,(n%2-.5)*.38,.13+Math.floor(n/4)*.29,(Math.floor(n/2)%2-.5)*.4);bx(B,.02,.29,.3,0xe5e7eb,0,.13,.2);
      for(const a2 of [-.18,.18])bx(B,.14,.05,1.1,0xdc2626,a2,.02,.05);bx(B,.5,.3,.22,0xdc2626,0,0,.62);cy(B,.025,.9,0x111827,0,.3,.68,"s",{rx:-.35});bx(B,.3,.04,.04,0x111827,0,1.13,1.0);bPop(B);bPop(B);
      const [sx,sz]=pts[5],[fx,fz]=l2w(f,0,.75);W.staff.push(mkFig({x:sx,z:sz,yaw:Math.atan2(fx-sx,fz-sz),sh:0xea580c,pa:0x1f2937,md:"stock"}));
      const xs=pts.slice(0,4).map(p=>p[0]),zs=pts.slice(0,4).map(p=>p[1]);ob(Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs));break}}
  for(let i=0;i<(t.st.sec|0)&&i<4;i++)W.staff.push(mkFig({x:i%2?hw-1:-hw+1,z:zc+1.2,yaw:PI,sh:0x111827,pa:0x111827,ha:0x111827,md:"idle"}));
  // wet floor sign in a free spot
  for(const [x,z] of [[-hw*.45,0],[hw*.3,-hd*.3],[-hw*.2,hd*.25],[hw*.5,hd*.1],[0,-hd*.5]]){if(!navFree(x,z,.6))continue;bPush(B,x,0,z,.6);bx(B,.32,.62,.015,0xfacc15,0,0,.08,"s",{rx:-.13});bx(B,.32,.62,.015,0xfacc15,0,0,-.08,"s",{rx:.13});
    const u=lab(W.atl,["⚠ CAUTION","WET FLOOR"],{bg:"#facc15",fg:"#111827"},.7);pp(B,"t","pl",.26,.36,1,0,.33,.052,0xffffff,{rx:-.13,uv:u});pp(B,"t","pl",.26,.36,1,0,.33,-.052,0xffffff,{rx:-.13,ry:PI,uv:u});bx(B,1.1,.004,.7,0xbfdbfe,.5,.001,.3,"g");bPop(B);ob(x-.3,x+.3,z-.25,z+.25);break}
  // flyer promo: window posters and bunting
  if(promo){for(const s of [-1,1]){const x=s*(1.5+sw/2);sg(B,["🔥 FLYER DEALS","Up to 30% off this week"],Math.min(2,sw-.4),1.1,x,1.75,hd-.05,PI,{bg:"#dc2626",fg:"#fef08a",ph:128});sg(B,["🔥 FLYER DEALS","Up to 30% off"],Math.min(2,sw-.4),1.1,x,1.75,hd+.05,0,{bg:"#dc2626",fg:"#fef08a",ph:128})}
    for(const z of [-hd*.35,hd*.15]){bx(C,w-1,.012,.012,0x334155,0,3.5,z);for(let x=-hw+1;x<hw-.8;x+=.3)bx(C,.12,.12,.01,[0xdc2626,0xfacc15,0x2563eb][Math.round((x+hw)/.3)%3],x,3.38,z,"s",{rz:PI/4})}
    sg(B,["SALE","Flyer prices inside"],2.2,.7,hw-.12,1.6,hd*.35,-PI/2,{bg:"#dc2626",fg:"#fef08a"})}
  bMesh(B,g);bMesh(C,g,W.ceil);W.atl.tex.needsUpdate=true;if(W.patl.dirty){W.patl.tex.needsUpdate=true;W.patl.dirty=0}
  crowdSync(t);W.sig=sigOf(t)}
/* ---------- navigation grid for shoppers (0.5 m cells, BFS flow fields cached per target) ---------- */
function navFree(x,z,m){m=m==null?.3:m;if(Math.abs(x)>W.hw-.4||z<-W.hd+.4||z>W.hd-.3)return false;for(const o of W.obst)if(x>o.x0-m&&x<o.x1+m&&z>o.z0-m&&z<o.z1+m)return false;return true}
function navBuild(){const cs=.5,nx=Math.ceil(W.hw*2/cs),nz=Math.ceil(W.hd*2/cs),ok=new Uint8Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)ok[j*nx+i]=navFree(-W.hw+cs*(i+.5),-W.hd+cs*(j+.5))?1:0;W.nav={cs,nx,nz,ok,F:new Map(),nn:new Map()}}
const cellI=(x,z)=>{const N=W.nav,i=Math.max(0,Math.min(N.nx-1,Math.floor((x+W.hw)/N.cs))),j=Math.max(0,Math.min(N.nz-1,Math.floor((z+W.hd)/N.cs)));return j*N.nx+i};
const cellC=k=>{const N=W.nav;return [-W.hw+N.cs*(k%N.nx+.5),-W.hd+N.cs*(Math.floor(k/N.nx)+.5)]};
function navNear(k){const N=W.nav;if(N.ok[k])return k;if(N.nn.has(k))return N.nn.get(k);const i0=k%N.nx,j0=Math.floor(k/N.nx);let best=-1,bd=1e9;
  for(let r=1;r<8&&best<0;r++)for(let j=j0-r;j<=j0+r;j++)for(let i=i0-r;i<=i0+r;i++){if(i<0||j<0||i>=N.nx||j>=N.nz)continue;const q=j*N.nx+i;if(N.ok[q]){const dd=(i-i0)**2+(j-j0)**2;if(dd<bd){bd=dd;best=q}}}N.nn.set(k,best);return best}
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function field(tg){const N=W.nav;let F=N.F.get(tg);if(F)return F;F=new Int16Array(N.nx*N.nz).fill(-1);F[tg]=0;const qu=[tg];
  for(let h=0;h<qu.length;h++){const k=qu[h],i=k%N.nx,j=(k-i)/N.nx;for(const [a,b] of D8){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=N.nx||jj>=N.nz)continue;const q=jj*N.nx+ii;if(F[q]>=0||!N.ok[q])continue;if(a&&b&&(!N.ok[j*N.nx+ii]||!N.ok[jj*N.nx+i]))continue;F[q]=F[k]+1;qu.push(q)}}
  if(N.F.size>40)N.F.clear();N.F.set(tg,F);return F}
function turn(f,a,dt){const d=Math.atan2(Math.sin(a-f.yaw),Math.cos(a-f.yaw));f.yaw+=d*Math.min(1,dt*7)}
function stepTo(f,tx,tz,dt){const dx=tx-f.x,dz=tz-f.z,d=Math.hypot(dx,dz);if(d<.06){f.mv=Math.max(0,f.mv-dt*4);return true}const s=Math.min(d,f.sp*dt);f.x+=dx/d*s;f.z+=dz/d*s;turn(f,Math.atan2(dx,dz),dt);f.mv=Math.min(1,f.mv+dt*4);f.ph+=dt*f.sp*5.5;return false}
function goNav(f,tx,tz,dt){const N=W.nav;if(!N||Math.hypot(tx-f.x,tz-f.z)<.7)return stepTo(f,tx,tz,dt);const ti=navNear(cellI(tx,tz));if(ti<0)return stepTo(f,tx,tz,dt);const F=field(ti),ci=cellI(f.x,f.z);
  if(!N.ok[ci]||F[ci]<0){const ni=navNear(ci);if(ni<0||F[ni]<0)return stepTo(f,tx,tz,dt);const [cx,cz]=cellC(ni);stepTo(f,cx,cz,dt);return false}
  const i=ci%N.nx,j=(ci-i)/N.nx;let best=-1,bd=F[ci];for(const [a,b] of D8){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=N.nx||jj>=N.nz)continue;const k=jj*N.nx+ii;if(F[k]<0)continue;if(a&&b&&(!N.ok[j*N.nx+ii]||!N.ok[jj*N.nx+i]))continue;const v=F[k]+(a&&b?.4:0);if(v<bd){bd=v;best=k}}
  if(best<0)return stepTo(f,tx,tz,dt);const [cx,cz]=cellC(best);stepTo(f,cx,cz,dt);return false}
/* ---------- shoppers & staff: jointed figures drawn with instanced meshes (8 draw calls for everyone) ---------- */
const SHC=[0x2563eb,0xdc2626,0x16a34a,0xf59e0b,0x7c3aed,0x0891b2,0xdb2777,0xf8fafc,0x334155,0x65a30d,0xea580c,0x0f766e],PAC=[0x1e3a8a,0x1f2937,0x44403c,0x0f172a,0x78716c,0x1e40af,0x57534e],SKC=[0xf1c27d,0xe0ac69,0xc68642,0x8d5524,0xffdbac,0x5c3a21],HAC=[0x1c1917,0x422006,0x78350f,0xd6d3d1,0xfacc15,0x292524];
const pick=a=>a[Math.floor(Math.random()*a.length)],FN=72;
function mkFig(o){return Object.assign({x:0,z:0,yaw:0,ph:Math.random()*6,ph0:Math.random()*6,mv:0,sp:.9+Math.random()*.45,sh:pick(SHC),pa:pick(PAC),sk:pick(SKC),ha:pick(HAC),md:"idle",cart:0},o)}
function crowdInit(){const T=W.T,m=mat("fig"),c=new T.Color(1,1,1),mk=(geo,n,mm)=>{const im=new T.InstancedMesh(geo,mm||m,n);im.frustumCulled=false;if(!mm)for(let i=0;i<n;i++)im.setColorAt(i,c);im.count=0;W.scene.add(im);return im};
  const cb=mkB();cartParts(cb,true);const bb=mkB();basketParts(bb);
  W.cr={leg:mk(new T.CylinderGeometry(.5,.42,1,6),FN*2),arm:mk(new T.CylinderGeometry(.5,.4,1,6),FN*2),tor:mk(new T.CylinderGeometry(.5,.4,1,8).translate(0,.5,0),FN),head:mk(new T.SphereGeometry(.5,10,8),FN),
    hair:mk(new T.SphereGeometry(.5,10,5,0,PI*2,0,PI/2),FN),cart:mk(bGeo(cb,"s"),FN,mat("s")),bask:mk(bGeo(bb,"s"),FN,mat("s"))}}
function shopperN(t){const sl=smSlots(t),st=sl?smIn(t).length/sl:0;return Math.max(1,Math.min(W.q?26:10,Math.round((3+t.tier*5)*(.3+.7*st)*smCust(t))))}
function crowdSync(t){const want=shopperN(t);W.figs.forEach((f,i)=>{f.die=i>=want?1:0;if(f.st==="lane"||f.st==="q"||f.st==="pay")f.st="exit"});while(W.figs.length<want)W.figs.push(mkFig({st:"gone",t:Math.random()*5}))}
function pickStop(f){const L=smS(city()).lay;for(let k=0;k<8&&L.length;k++){const fx=L[Math.random()*L.length|0],d=SM_FX[fx.k],ps=slotPts(fx),s=Math.random()*ps.length|0,pt=ps[s][Math.random()*ps[s].length|0],lz=pt[1]+(fx.k==="shelf"||fx.k==="fridge"?(Math.random()-.5)*d.d*.7:0);
    const [x,z]=l2w(fx,pt[0]*(1.05+Math.random()*.25),lz);if(!navFree(x,z,.15))continue;const [cx,cz]=l2w(fx,0,lz);f.tx=x;f.tz=z;f.fy=Math.atan2(cx-x,cz-z);f.st="go";return}
  const N=W.nav;for(let k=0;k<20;k++){const q=Math.random()*N.ok.length|0;if(N.ok[q]){[f.tx,f.tz]=cellC(q);f.fy=f.yaw;f.st="go";return}}f.st="exit"}
function toLane(f){const Ls=W.lanes;if(!Ls.length){f.st="exit";return}let bi=-1,bq=9;Ls.forEach((L,i)=>{const n=L.q.length+Math.random()*.5;if(n<bq){bq=n;bi=i}});if(Ls[bi].q.length>=2){f.stops=1;pickStop(f);return}
  Ls[bi].q.push(f);f.lane=bi;f.st="lane";f.tx=Ls[bi].x+.62;f.tz=W.zc-1.4}
const qSpot=(L,k)=>[L.x+.62,k?W.zc-1.4:W.zc+.05];
function simFig(f,dt){switch(f.st){
  case"gone":f.t-=dt;if(f.t<=0){if(f.die)return false;f.x=(Math.random()-.5)*2;f.z=W.hd+1.8;f.yaw=PI;f.st="in";f.stops=2+(Math.random()*3|0);f.cart=Math.random()<.45?1:Math.random()<.6?2:0}break;
  case"in":if(stepTo(f,f.x*1.4,W.hd-1.6,dt))pickStop(f);break;
  case"go":if(goNav(f,f.tx,f.tz,dt)){f.st="look";f.t=1.5+Math.random()*3}break;
  case"look":f.mv=Math.max(0,f.mv-dt*4);turn(f,f.fy,dt);f.t-=dt;if(f.t<=0){if(--f.stops>0)pickStop(f);else toLane(f)}break;
  case"lane":if(!W.lanes[f.lane]){f.st="exit";break}if(goNav(f,f.tx,f.tz,dt))f.st="q";break;
  case"q":{const L=W.lanes[f.lane];if(!L){f.st="exit";break}const k=L.q.indexOf(f);if(k<0){f.st="exit";break}if(k>1)break;const p=qSpot(L,k);if(stepTo(f,p[0],p[1],dt)){turn(f,k?0:-PI/2,dt);if(!k){f.st="pay";f.t=2.5+Math.random()*2.5}}break}
  case"pay":{f.mv=0;turn(f,-PI/2,dt);f.t-=dt;if(f.t<=0){const L=W.lanes[f.lane];if(L&&L.q.indexOf(f)>=0)L.q.splice(L.q.indexOf(f),1);f.st="out1";f.tx=f.x;f.tz=W.zc+1.15}break}
  case"out1":if(stepTo(f,f.tx,f.tz,dt)){f.st="out2";f.tx=(Math.random()-.5)*1.4;f.tz=W.hd-.5}break;
  case"out2":if(stepTo(f,f.tx,f.tz,dt)){f.st="out3";f.tz=W.hd+2}break;
  case"out3":if(stepTo(f,f.tx,f.tz,dt)){f.st="gone";f.t=1+Math.random()*5}break;
  case"exit":if(goNav(f,0,W.hd-1.4,dt)){f.st="out2";f.tx=(Math.random()-.5)*1.4;f.tz=W.hd-.5}break}
  f.md=f.st==="look"?"reach":f.cart===1?"push":f.mv>.05?"walk":"idle";return true}
function crowdTick(dt){for(let i=W.figs.length-1;i>=0;i--)if(!simFig(W.figs[i],dt))W.figs.splice(i,1);
  const C=W.cr,T=W.T,B=W.mB||(W.mB=new T.Matrix4()),A=W.mA||(W.mA=new T.Matrix4()),X=W.mX||(W.mX=new T.Matrix4()),col=W.cc||(W.cc=new T.Color()),tm=W.tm;let n=0,nc=0,nb=0;
  const draw=f=>{if(n>=FN)return;const mv=f.mv||0,sw=Math.sin(f.ph)*.55*mv;B.makeRotationY(f.yaw);B.setPosition(f.x,Math.abs(Math.sin(f.ph))*.03*mv,f.z);
    for(let s=0;s<2;s++){const sg=s?1:-1;A.copy(B).multiply(X.makeTranslation(sg*.1,.88,0)).multiply(X.makeRotationX(s?-sw:sw)).multiply(X.makeTranslation(0,-.44,0)).multiply(X.makeScale(.15,.88,.17));C.leg.setMatrixAt(n*2+s,A);C.leg.setColorAt(n*2+s,col.setHex(f.pa))}
    A.copy(B).multiply(X.makeTranslation(0,.84,0)).multiply(X.makeScale(.42,.62,.25));C.tor.setMatrixAt(n,A);C.tor.setColorAt(n,col.setHex(f.sh));
    let aL=-sw*.8,aR=sw*.8;const m=f.md,o=f.ph0;if(m==="push")aL=aR=-.65;else if(m==="scan"){aR=-1.05+Math.sin(tm*5+o)*.35;aL=-.7}else if(m==="reach"){aR=-1.45+Math.sin(tm*2+o)*.2;aL=.05}
    else if(m==="stock"){aL=-1.1+Math.sin(tm*3+o)*.3;aR=-1.1+Math.sin(tm*3+o+1.5)*.3}else if(m==="work"){aR=-.9+Math.sin(tm*2+o)*.25;aL=-.6}else if(m==="idle"&&!mv){aL=aR=.05+Math.sin(tm*1.3+o)*.03}
    if(f.cart===2&&m!=="reach")aR=-.05;
    for(let s=0;s<2;s++){const sg=s?1:-1;A.copy(B).multiply(X.makeTranslation(sg*.27,1.42,0)).multiply(X.makeRotationZ(sg*.07)).multiply(X.makeRotationX(s?aR:aL)).multiply(X.makeTranslation(0,-.3,0)).multiply(X.makeScale(.11,.6,.12));C.arm.setMatrixAt(n*2+s,A);C.arm.setColorAt(n*2+s,col.setHex(f.sh))}
    A.copy(B).multiply(X.makeTranslation(0,1.63,0)).multiply(X.makeScale(.22,.26,.24));C.head.setMatrixAt(n,A);C.head.setColorAt(n,col.setHex(f.sk));
    A.copy(B).multiply(X.makeTranslation(0,1.65,-.015)).multiply(X.makeScale(.245,.22,.265));C.hair.setMatrixAt(n,A);C.hair.setColorAt(n,col.setHex(f.ha));
    if(f.cart===1){if(f.st==="pay")A.makeTranslation(f.x,0,f.z+.85);else A.copy(B).multiply(X.makeTranslation(0,0,.8));C.cart.setMatrixAt(nc++,A)}
    else if(f.cart===2){A.copy(B).multiply(X.makeTranslation(.3,.42,.04));C.bask.setMatrixAt(nb++,A)}n++};
  for(const f of W.staff){if(f.lane!=null){const L=W.lanes[f.lane];f.md=L&&L.q[0]&&L.q[0].st==="pay"?"scan":"idle"}draw(f)}for(const f of W.figs)if(f.st!=="gone")draw(f);
  for(const k of ["leg","arm"])C[k].count=n*2;for(const k of ["tor","head","hair"])C[k].count=n;C.cart.count=nc;C.bask.count=nb;
  for(const k in C){C[k].instanceMatrix.needsUpdate=true;if(C[k].instanceColor)C[k].instanceColor.needsUpdate=true}}
function doorsTick(dt){if(!W.doors)return;let near=Math.hypot(W.p.x,W.p.z-W.hd)<3.2;if(!near)for(const f of W.figs)if(f.st!=="gone"&&Math.abs(f.x)<2.5&&Math.abs(f.z-W.hd)<2.2){near=true;break}
  W.dO+=((near?1:0)-W.dO)*Math.min(1,dt*4);W.doors.forEach((d,i)=>{d.position.x=(i?1:-1)*(.75+1.42*W.dO)})}
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
  W.tm=ts/1000;if(W.cr)crowdTick(dt);doorsTick(dt);if(W.beltT)W.beltT.offset.y=(W.beltT.offset.y-dt*.35)%1;
  if(!W.noAuto&&W.q){W.fN++;if(W.fN>40)W.fS+=dt;if(W.fN>160){W.noAuto=1;if(W.fS/120>.045){W.q=0;W.ren.setPixelRatio(Math.min(1.25,devicePixelRatio||1));build();ghost()}}}
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
    W.ren=ren;W.q=lowEnd()?0:1;ren.setPixelRatio(Math.min(W.q?2:1.25,devicePixelRatio||1));el.insertBefore(ren.domElement,el.firstChild);const sc=W.scene=new T.Scene();sc.background=new T.Color(0xbfdbfe);W.cam=new T.PerspectiveCamera(60,1,.1,200);
    sc.add(new T.HemisphereLight(0xffffff,0xb8b0a4,1.05));const dl=new T.DirectionalLight(0xfff7ed,.45);dl.position.set(5,10,6);sc.add(dl);
    W.mats={};W.figs=[];W.staff=[];W.lanes=[];W.dO=0;W.fN=0;W.fS=0;W.noAuto=0;W.atl=atlas(2048);W.patl=atlas(2048);crowdInit();
    const av=W.av=person(T,0x2563eb);W.legs=av.userData.legs;sc.add(av);build();
    for(const f of W.figs)if(Math.random()<.75){pickStop(f);if(f.st==="go"){f.x=f.tx;f.z=f.tz;f.yaw=f.fy;f.st="look";f.t=Math.random()*4;f.stops=1+(Math.random()*3|0);f.cart=Math.random()<.45?1:Math.random()<.6?2:0}else f.st="gone"}W.raf=requestAnimationFrame(loop);el.focus()}).catch(()=>{close();toast("Couldn't load the 3D store. Check your connection and try again.")})}
function close(){if(!W.on)return;W.on=false;document.body.classList.remove("lc3-on");cancelAnimationFrame(W.raf);W.raf=0;if(W.kd){window.removeEventListener("keydown",W.kd,true);W.kd=null}W.bm=null;W.pk=null;
  if(W.scene)W.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){if(m.map)m.map.dispose();m.dispose()}});
  for(const k in GEO){GEO[k].dispose();delete GEO[k]}for(const k in W.mats||{}){const m=W.mats[k];if(m.map)m.map.dispose();m.dispose()}if(W.atl)W.atl.tex.dispose();if(W.patl)W.patl.tex.dispose();W.mats={};W.figs=[];W.staff=[];W.cr=null;W.doors=null;W.beltT=null;W.atl=W.patl=null;
  if(W.ren){W.ren.dispose();try{W.ren.forceContextLoss()}catch(e){}}W.ren=W.scene=W.cam=W.av=W.world=W.gh=null;if(W.el)W.el.remove();W.el=null;try{save()}catch(e){}}
return {open,close};
})()
