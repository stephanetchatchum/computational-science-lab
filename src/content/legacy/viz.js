/* AUTO-EXTRACTED from the original computational-science-curriculum.html.
   Content is unchanged except where marked PATCH. Do not hand-edit; re-run scripts/extract.py. */
/* eslint-disable */
// @ts-nocheck
const ESC = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const ESCA = s => ESC(s).replace(/"/g,'&quot;');
// inline markup used in guide text:  **bold**   {{code}}
const fmt = s => ESC(s).replace(/\{\{(.+?)\}\}/g,'<code>$1</code>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const plain = s => String(s).replace(/\{\{(.+?)\}\}/g,'$1').replace(/\*\*(.+?)\*\*/g,'$1');

const QC = {           // one colour per physical quantity, used everywhere
  pos:'#58a6ff', vel:'#3fb950', acc:'#f0883e', energy:'#e3b341',
  bad:'#f85149', exact:'#d8dee9', accent:'#39d0d8', dim:'#6b7684',
  warm:'#ff7b5a', cool:'#7aa2f7', mag:'#bc8cff'
};
const VIZ = {};

/* ---------- canvas helper ---------- */
function makeCtx(canvas){
  const ctx = canvas.getContext('2d');
  const c = {ctx, W:0, H:0, _x0:0,_x1:1,_y0:0,_y1:1, pad:{l:46,r:14,t:24,b:30}};
  c.resize = ()=>{
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const w = Math.max(240, Math.round(r.width||600)), h = Math.round(parseFloat(canvas.dataset.h||260));
    canvas.width = w*dpr; canvas.height = h*dpr; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0); c.W = w; c.H = h;
  };
  c.view = (x0,x1,y0,y1,equal)=>{
    c._x0=x0;c._x1=x1;c._y0=y0;c._y1=y1;
    if(equal){                                   // keep circles circular
      const pw = c.W-c.pad.l-c.pad.r, ph = c.H-c.pad.t-c.pad.b;
      const sx = pw/(x1-x0), sy = ph/(y1-y0), s = Math.min(sx,sy);
      const cx=(x0+x1)/2, cy=(y0+y1)/2;
      c._x0=cx-pw/(2*s); c._x1=cx+pw/(2*s); c._y0=cy-ph/(2*s); c._y1=cy+ph/(2*s);
    }
  };
  c.X = x => c.pad.l + (x-c._x0)/(c._x1-c._x0)*(c.W-c.pad.l-c.pad.r);
  c.Y = y => c.H-c.pad.b - (y-c._y0)/(c._y1-c._y0)*(c.H-c.pad.t-c.pad.b);
  c.invX = sx => c._x0 + (sx-c.pad.l)/(c.W-c.pad.l-c.pad.r)*(c._x1-c._x0);
  c.invY = sy => c._y0 + (c.H-c.pad.b-sy)/(c.H-c.pad.t-c.pad.b)*(c._y1-c._y0);
  c.bg = ()=>{ ctx.clearRect(0,0,c.W,c.H); ctx.fillStyle='#0b0f16'; ctx.fillRect(0,0,c.W,c.H); };
  c.glow = (col,amt)=>{ ctx.shadowColor=col; ctx.shadowBlur=amt||10; };
  c.noglow = ()=>{ ctx.shadowBlur=0; };
  c.grid = (nx,ny)=>{
    ctx.save(); ctx.strokeStyle='rgba(120,140,170,.13)'; ctx.lineWidth=1; ctx.beginPath();
    for(let i=0;i<=(nx||8);i++){ const sx=Math.round(c.pad.l+i/(nx||8)*(c.W-c.pad.l-c.pad.r))+.5; ctx.moveTo(sx,c.pad.t); ctx.lineTo(sx,c.H-c.pad.b); }
    for(let j=0;j<=(ny||5);j++){ const sy=Math.round(c.pad.t+j/(ny||5)*(c.H-c.pad.t-c.pad.b))+.5; ctx.moveTo(c.pad.l,sy); ctx.lineTo(c.W-c.pad.r,sy); }
    ctx.stroke(); ctx.restore();
  };
  c.axes = (lx,ly)=>{
    ctx.save(); ctx.strokeStyle='rgba(170,190,215,.5)'; ctx.lineWidth=1.2; ctx.beginPath();
    const yz = (c._y0<=0&&c._y1>=0)? c.Y(0) : c.H-c.pad.b;
    const xz = (c._x0<=0&&c._x1>=0)? c.X(0) : c.pad.l;
    ctx.moveTo(c.pad.l, yz); ctx.lineTo(c.W-c.pad.r, yz);
    ctx.moveTo(xz, c.pad.t); ctx.lineTo(xz, c.H-c.pad.b); ctx.stroke();
    ctx.restore();
    if(lx) c.chip(c.W-c.pad.r-ctx.measureText(lx).width-4, c.H-17, lx);
    if(ly) c.chip(5, 3, ly);
  };
  c.ticks = (fx,fy)=>{
    ctx.save(); ctx.fillStyle='#6b7684'; ctx.font='10px ui-monospace,monospace';
    ctx.textAlign='center'; ctx.textBaseline='top';
    if(fx !== false) for(let i=0;i<=4;i++){ const v=c._x0+i/4*(c._x1-c._x0); ctx.fillText(fx?fx(v):v.toFixed(1), c.X(v), c.H-c.pad.b+5); }
    ctx.textAlign='right'; ctx.textBaseline='middle';
    for(let j=0;j<=3;j++){ const v=c._y0+j/3*(c._y1-c._y0); ctx.fillText(fy?fy(v):v.toFixed(1), c.pad.l-5, c.Y(v)); }
    ctx.restore();
  };
  c.path = (pts,col,w,glow)=>{
    if(!pts||pts.length<2) return;
    ctx.save(); if(glow) c.glow(col,glow); ctx.strokeStyle=col; ctx.lineWidth=w||2;
    ctx.lineJoin='round'; ctx.lineCap='round'; ctx.beginPath();
    ctx.moveTo(c.X(pts[0][0]), c.Y(pts[0][1]));
    for(let i=1;i<pts.length;i++) ctx.lineTo(c.X(pts[i][0]), c.Y(pts[i][1]));
    ctx.stroke(); ctx.restore();
  };
  c.dot = (x,y,r,col,glow)=>{
    ctx.save(); if(glow) c.glow(col,glow); ctx.fillStyle=col;
    ctx.beginPath(); ctx.arc(c.X(x),c.Y(y),r,0,7); ctx.fill(); ctx.restore();
  };
  c.sdot = (sx,sy,r,col,glow)=>{
    ctx.save(); if(glow) c.glow(col,glow); ctx.fillStyle=col;
    ctx.beginPath(); ctx.arc(sx,sy,r,0,7); ctx.fill(); ctx.restore();
  };
  c.arrow = (x0,y0,x1,y1,col,label,glow)=>{
    const ax=c.X(x0), ay=c.Y(y0), bx=c.X(x1), by=c.Y(y1);
    const dx=bx-ax, dy=by-ay, L=Math.hypot(dx,dy); if(L<1.5) return;
    const ux=dx/L, uy=dy/L, head=Math.min(9, L*0.34);
    ctx.save(); if(glow!==false) c.glow(col,8);
    ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=2.2; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx-ux*head*.8, by-uy*head*.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx,by);
    ctx.lineTo(bx-ux*head-uy*head*.5, by-uy*head+ux*head*.5);
    ctx.lineTo(bx-ux*head+uy*head*.5, by-uy*head-ux*head*.5);
    ctx.closePath(); ctx.fill();
    if(label){ ctx.shadowBlur=0; ctx.font='bold 11px ui-monospace,monospace'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(label, bx+ux*7+3, by+uy*7); }
    ctx.restore();
  };
  c.txt = (sx,sy,t,col,size,align)=>{
    ctx.save(); ctx.fillStyle=col||'#c8d2e0'; ctx.font=(size||12)+'px ui-monospace,monospace';
    ctx.textAlign=align||'left'; ctx.textBaseline='top'; ctx.fillText(t,sx,sy); ctx.restore();
  };
  c.bar = (sx,sy,w,h,frac,col,label)=>{
    ctx.save(); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(sx,sy,w,h);
    c.glow(col,8); ctx.fillStyle=col; ctx.fillRect(sx,sy,Math.max(0,Math.min(1,frac))*w,h);
    ctx.restore();
    if(label) c.txt(sx, sy-14, label, col, 11);
  };
  c.legend = (items)=>{
    ctx.save(); ctx.font='11px ui-monospace,monospace';
    const w = items.reduce((a,[l])=>a + 17 + ctx.measureText(l).width + 10, 0);
    ctx.restore();
    let sx = Math.max(c.pad.l+4, c.W - c.pad.r - w), sy = c.pad.t + 3;
    ctx.save(); ctx.fillStyle='rgba(11,15,22,.86)';
    ctx.beginPath(); ctx.roundRect(sx-7, sy-4, w+10, 19, 6); ctx.fill(); ctx.restore();
    items.forEach(([lab,col])=>{
      ctx.save(); c.glow(col,6); ctx.fillStyle=col; ctx.fillRect(sx,sy+5,10,3); ctx.restore();
      c.txt(sx+14, sy, lab, '#9aa6b8', 11);
      ctx.save(); ctx.font='11px ui-monospace,monospace';
      sx += 17 + ctx.measureText(lab).width + 10; ctx.restore();
    });
  };
  c.chip = (sx,sy,t,col)=>{
    ctx.save(); ctx.font='11px ui-monospace,monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
    const w = ctx.measureText(t).width;
    ctx.fillStyle='rgba(11,15,22,.86)';
    ctx.beginPath(); ctx.roundRect(sx-5, sy-3, w+10, 17, 5); ctx.fill();
    ctx.fillStyle=col||'#8b96a8'; ctx.fillText(t, sx, sy); ctx.restore();
  };
  c.clip = (x,y,w,h,fn)=>{ ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); fn(); ctx.restore(); };
  c.pads = (l,r,t,b)=>{ const o={l:c.pad.l,r:c.pad.r,t:c.pad.t,b:c.pad.b};
    c.pad = {l:l==null?o.l:l, r:r==null?o.r:r, t:t==null?o.t:t, b:b==null?o.b:b}; return o; };
  c.unpad = o => { c.pad = o; };
  return c;
}

/* ---------- build one widget ---------- */
let VIZ_SEQ = 0;
function buildViz(name, host){
  const spec = VIZ[name]; if(!spec) return;
  const id = 'viz'+(++VIZ_SEQ);
  const params = (spec.params||[]).map(p=>Object.assign({},p));
  const P = {}; params.forEach(p=>P[p.k]=p.val);

  host.innerHTML = `
    <div class="viz" id="${id}">
      <div class="viz-head">
        <span class="viz-title">${ESC(spec.title)}</span>
        ${spec.eq?`<span class="viz-eq">${spec.eq}</span>`:''}
      </div>
      <canvas data-h="${spec.h||270}"></canvas>
      <div class="viz-stats"></div>
      ${params.length?`<div class="viz-params">${params.map(p=>`
        <label class="viz-p">
          <span class="viz-pl">${p.label}${p.unit?` <i>${p.unit}</i>`:''}</span>
          <input type="range" data-k="${p.k}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.val}">
          <output data-o="${p.k}">${p.fmt?p.fmt(p.val):p.val}</output>
        </label>`).join('')}</div>`:''}
      <div class="viz-bar">
        <button class="viz-btn play" data-act="play">❚❚ Pause</button>
        <button class="viz-btn" data-act="reset">↺ Reset</button>
        ${(spec.toggles||[]).map(t=>`<button class="viz-btn tg${t.on?' on':''}" data-tg="${t.k}">${t.label}</button>`).join('')}
        ${spec.stepBtn?`<button class="viz-btn" data-act="stepone">▶| Step</button>`:''}
      </div>
    </div>`;

  const root = host.querySelector('.viz');
  const canvas = root.querySelector('canvas');
  const c = makeCtx(canvas);
  const statsEl = root.querySelector('.viz-stats');
  (spec.toggles||[]).forEach(t=>P[t.k]=!!t.on);

  let S = spec.init(P, c);
  let playing = spec.autoplay !== false;
  let visible = false, raf = null, lastT = 0;

  const reduced = (globalThis.__CSLAB_REDUCED_MOTION__ === true) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); /* PATCH: app setting */
  if(reduced) playing = false;

  function renderStats(){
    if(!spec.stats){ statsEl.style.display='none'; return; }
    statsEl.innerHTML = spec.stats(S,P).map(([k,v,col])=>
      `<span class="viz-s"><b style="color:${col||'#c8d2e0'}">${v}</b><i>${k}</i></span>`).join('');
  }
  function frame(now){
    raf = null;
    const dt = Math.min(0.05, lastT ? (now-lastT)/1000 : 0.016); lastT = now;
    if(playing && spec.step) spec.step(S, dt, P, c);
    c.bg(); spec.draw(c, S, P); renderStats();
    if(visible) raf = requestAnimationFrame(frame);
  }
  function kick(){ if(!raf && visible){ lastT=0; raf=requestAnimationFrame(frame);} }
  function redrawOnce(){ c.bg(); spec.draw(c,S,P); renderStats(); }

  root.querySelectorAll('input[type=range]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      const p = params.find(q=>q.k===inp.dataset.k);
      P[inp.dataset.k] = parseFloat(inp.value);
      root.querySelector(`output[data-o="${inp.dataset.k}"]`).textContent = p.fmt?p.fmt(P[inp.dataset.k]):inp.value;
      if(spec.onParam) spec.onParam(S,P,c); else if(spec.resetOnParam) S = spec.init(P,c);
      kick(); if(!playing) redrawOnce();
    });
  });
  root.querySelectorAll('[data-tg]').forEach(b=>{
    b.addEventListener('click', ()=>{
      P[b.dataset.tg] = !P[b.dataset.tg]; b.classList.toggle('on', P[b.dataset.tg]);
      if(spec.onToggle) spec.onToggle(S,P,c); else S = spec.init(P,c);
      kick(); if(!playing) redrawOnce();
    });
  });
  const playBtn = root.querySelector('[data-act=play]');
  playBtn.addEventListener('click', ()=>{
    playing = !playing; playBtn.textContent = playing?'❚❚ Pause':'▶ Play';
    playBtn.classList.toggle('on', !playing); kick();
  });
  playBtn.textContent = playing?'❚❚ Pause':'▶ Play';
  root.querySelector('[data-act=reset]').addEventListener('click', ()=>{ S = spec.init(P,c); kick(); redrawOnce(); });
  const stepBtn = root.querySelector('[data-act=stepone]');
  if(stepBtn) stepBtn.addEventListener('click', ()=>{ if(spec.stepOnce) spec.stepOnce(S,P,c); redrawOnce(); });

  if(spec.pointer){
    const pt = e=>{ const r=canvas.getBoundingClientRect();
      const t = e.touches? e.touches[0] : e;
      return [t.clientX-r.left, t.clientY-r.top]; };
    let down=false;
    const dn = e=>{ down=true; spec.pointer(S,P,c,...pt(e),'down'); redrawOnce(); e.preventDefault(); };
    const mv = e=>{ if(!down) return; spec.pointer(S,P,c,...pt(e),'move'); redrawOnce(); e.preventDefault(); };
    const up = ()=>{ down=false; };
    root.__mv=mv; root.__up=up; canvas.addEventListener('mousedown',dn); window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
    canvas.addEventListener('touchstart',dn,{passive:false}); canvas.addEventListener('touchmove',mv,{passive:false}); window.addEventListener('touchend',up);
    canvas.style.cursor='crosshair';
  }

  const ro = new ResizeObserver(()=>{ c.resize(); if(spec.onResize) spec.onResize(S,P,c); redrawOnce(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(es=>{
    visible = es[0].isIntersecting;
    if(visible){ c.resize(); kick(); redrawOnce(); }
    else if(raf){ cancelAnimationFrame(raf); raf=null; }
  }, {rootMargin:'120px'});
  io.observe(root);
  c.resize(); redrawOnce();
  /* PATCH: teardown so the single-page app does not leak listeners/animation frames */
  root.__destroy = ()=>{ visible=false; if(raf) cancelAnimationFrame(raf); raf=null; try{ro.disconnect(); io.disconnect();}catch(e){}
    if(spec.pointer){ window.removeEventListener('mousemove',root.__mv); window.removeEventListener('mouseup',root.__up); window.removeEventListener('touchend',root.__up); } };
  return root;
}

function mountVizIn(scope){
  (scope||document).querySelectorAll('[data-viz]:not([data-mounted])').forEach(h=>{
    h.setAttribute('data-mounted','1');
    try{ buildViz(h.getAttribute('data-viz'), h); }
    catch(e){ h.innerHTML = '<div class="viz viz-err">This demo could not start: '+ESC(e.message)+'</div>'; }
  });
}
function vizBlock(name, caption){
  const spec = VIZ[name];
  return `<div class="vizwrap">
    <div class="no-tts" data-viz="${name}"></div>
    <p class="viz-cap" data-tts>${fmt(caption || (spec?spec.note:'') || '')}</p>
  </div>`;
}

/* =========================================================
   SMALL NUMERICS shared by widgets
   ========================================================= */
const rk4 = (f, y, dt) => {               // y is an array
  const add=(a,b,s)=>a.map((v,i)=>v+b[i]*s);
  const k1=f(y), k2=f(add(y,k1,dt/2)), k3=f(add(y,k2,dt/2)), k4=f(add(y,k3,dt));
  return y.map((v,i)=>v+dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));
};
const fmtN = (v,d)=> (Math.abs(v)>=1e4||(/*tiny*/Math.abs(v)<1e-3&&v!==0)) ? v.toExponential(1) : v.toFixed(d===undefined?2:d);

/* =========================================================
   WIDGETS
   ========================================================= */

/* --- 1. vectors: components and addition --- */
VIZ.vectors = {
  title:'A vector is an arrow: it has size and direction',
  eq:'<b>v</b> = (vₓ, v_y) &nbsp;|&nbsp; |<b>v</b>| = √(vₓ² + v_y²)',
  note:'Drag the blue arrowhead. The green and orange arrows are its **components** along x and y. The equation and numbers update as you drag.',
  h:290, autoplay:false, pointer:true,
  params:[],
  init(){ return {vx:3.2, vy:2.4}; },
  pointer(S,P,c,sx,sy){ S.vx = Math.max(-5,Math.min(5,c.invX(sx))); S.vy = Math.max(-4,Math.min(4,c.invY(sy))); },
  draw(c,S){
    c.view(-5,5,-4,4,true); c.grid(10,8); c.axes('x','y'); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    c.arrow(0,0,S.vx,0,QC.vel,'vₓ');
    c.arrow(S.vx,0,S.vx,S.vy,QC.acc,'v_y');
    c.arrow(0,0,S.vx,S.vy,QC.pos,'v',true);
    c.dot(S.vx,S.vy,6,QC.pos,14);
    c.legend([['vₓ',QC.vel],['v_y',QC.acc],['v',QC.pos]]);
  },
  stats(S){ const m=Math.hypot(S.vx,S.vy); return [
    ['vₓ', fmtN(S.vx), QC.vel], ['v_y', fmtN(S.vy), QC.acc],
    ['|v|', fmtN(m), QC.pos], ['angle', fmtN(Math.atan2(S.vy,S.vx)*180/Math.PI,0)+'°', QC.dim]];}
};

/* --- 2. derivative as a slope --- */
VIZ.derivative = {
  title:'A derivative is the slope of the tangent line',
  eq:"f′(x) ≈ [f(x+h) − f(x)] / h &nbsp; → &nbsp; exact as h → 0",
  note:'The orange line is the **estimate** from two points h apart. Shrink h and watch it fall onto the true tangent (white). That is exactly what your finite-difference code computes.',
  h:280, autoplay:false, resetOnParam:true,
  params:[
    {k:'x', label:'x', min:-2.4, max:2.4, val:0.8, step:0.05, fmt:v=>v.toFixed(2)},
    {k:'h', label:'h', min:0.01, max:1.5, val:1.0, step:0.01, fmt:v=>v.toFixed(2)}
  ],
  init(){ return {}; },
  draw(c,S,P){
    const f = x=>Math.sin(x)+0.25*x*x, df = x=>Math.cos(x)+0.5*x;
    c.view(-2.6,2.6,-1.6,2.6); c.grid(8,5); c.axes('x','f(x)'); c.ticks();
    const pts=[]; for(let i=0;i<=200;i++){ const x=-2.6+i/200*5.2; pts.push([x,f(x)]); }
    c.path(pts, QC.accent, 2.2, 8);
    const x0=P.x, h=P.h, y0=f(x0), y1=f(x0+h);
    const slope=(y1-y0)/h, exact=df(x0);
    c.path([[x0-2.4, y0-exact*2.4],[x0+2.4, y0+exact*2.4]], QC.exact, 1.6);  // true tangent
    c.path([[x0-2.4, y0-slope*2.4],[x0+2.4, y0+slope*2.4]], QC.acc, 2.4, 10); // estimate
    c.ctx.save(); c.ctx.strokeStyle='rgba(240,136,62,.45)'; c.ctx.setLineDash([4,3]); c.ctx.beginPath();
    c.ctx.moveTo(c.X(x0),c.Y(y0)); c.ctx.lineTo(c.X(x0+h),c.Y(y0)); c.ctx.lineTo(c.X(x0+h),c.Y(y1)); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.X(x0+h/2), c.Y(y0)+4, 'h', QC.acc, 11, 'center');
    c.dot(x0,y0,5,QC.pos,12); c.dot(x0+h,y1,4.5,QC.acc,10);
    c.legend([['f(x)',QC.accent],['true tangent',QC.exact],['estimate',QC.acc]]);
  },
  stats(S,P){
    const f=x=>Math.sin(x)+0.25*x*x, df=x=>Math.cos(x)+0.5*x;
    const est=(f(P.x+P.h)-f(P.x))/P.h, ex=df(P.x);
    return [['estimate',fmtN(est,3),QC.acc],['exact',fmtN(ex,3),QC.exact],
            ['error',fmtN(Math.abs(est-ex),4),Math.abs(est-ex)>0.05?QC.bad:QC.vel]];}
};

/* --- 3. integral as accumulated area --- */
VIZ.integral = {
  title:'An integral is accumulated area',
  eq:'∫ₐᵇ f(x) dx ≈ Σ f(xᵢ)·Δx &nbsp; → &nbsp; exact as N → ∞',
  note:'Each bar is one slice of area. Add more slices and the total creeps toward the exact answer. More slices means less error, which is the same convergence idea as in your solvers.',
  h:280, autoplay:false, resetOnParam:true,
  params:[{k:'n', label:'slices N', min:1, max:80, val:8, step:1, fmt:v=>v.toFixed(0)}],
  init(){ return {}; },
  draw(c,S,P){
    const f = x=>0.6+Math.sin(x)*0.9+0.25*x;
    c.view(0,3.2,0,3.2); c.grid(8,5); c.axes('x','f(x)'); c.ticks();
    const N=Math.round(P.n), dx=3/N;
    for(let i=0;i<N;i++){
      const x=i*dx, y=f(x+dx/2);
      c.ctx.save(); c.ctx.fillStyle='rgba(57,208,216,.22)'; c.ctx.strokeStyle='rgba(57,208,216,.75)'; c.ctx.lineWidth=1;
      const X=c.X(x), Y=c.Y(y), W=c.X(x+dx)-X, H=c.Y(0)-Y;
      c.ctx.fillRect(X,Y,W,H); c.ctx.strokeRect(X,Y,W,H); c.ctx.restore();
    }
    const pts=[]; for(let i=0;i<=200;i++){ const x=i/200*3.2; pts.push([x,f(x)]); }
    c.path(pts, QC.warm, 2.4, 10);
    c.legend([['f(x)',QC.warm],['slices',QC.accent]]);
  },
  stats(S,P){
    const f=x=>0.6+Math.sin(x)*0.9+0.25*x;
    const N=Math.round(P.n), dx=3/N; let s=0; for(let i=0;i<N;i++) s+=f(i*dx+dx/2)*dx;
    const exact = (0.6*3) + (Math.cos(0)-Math.cos(3))*0.9 + 0.125*9;
    return [['N',N,QC.accent],['sum',fmtN(s,4),QC.accent],['exact',fmtN(exact,4),QC.exact],
            ['error',fmtN(Math.abs(s-exact),4),Math.abs(s-exact)>0.01?QC.acc:QC.vel]];}
};

/* --- 4. uncertainty propagation --- */
VIZ.uncertainty = {
  title:'Combining two uncertain measurements',
  eq:'a ± σₐ, b ± σ_b &nbsp;→&nbsp; (a+b) ± √(σₐ² + σ_b²)',
  note:'Two fuzzy measurements merge into one. Notice the merged glow is **narrower than the two added together** — uncertainties add in quadrature, not straight. That is the whole reason the formula has a square root.',
  h:250, resetOnParam:true,
  params:[
    {k:'ua', label:'σₐ', min:0.05, max:1.2, val:0.4, step:0.05, fmt:v=>v.toFixed(2)},
    {k:'ub', label:'σ_b', min:0.05, max:1.2, val:0.3, step:0.05, fmt:v=>v.toFixed(2)}
  ],
  init(){ return {t:0}; },
  step(S,dt){ S.t += dt*0.5; if(S.t>3) S.t=0; },
  draw(c,S,P){
    const a=4, b=3, uc=Math.hypot(P.ua,P.ub), naive=P.ua+P.ub;
    c.view(0,10,0,3);
    const blob=(x,u,col,lab,y)=>{
      const g=c.ctx.createRadialGradient(c.X(x),c.Y(y),0,c.X(x),c.Y(y),Math.max(8,(c.X(u)-c.X(0))*1.4));
      g.addColorStop(0,col+'ee'); g.addColorStop(.45,col+'55'); g.addColorStop(1,col+'00');
      c.ctx.fillStyle=g; c.ctx.beginPath(); c.ctx.arc(c.X(x),c.Y(y),Math.max(8,(c.X(u)-c.X(0))*1.4),0,7); c.ctx.fill();
      c.dot(x,y,4,col,12);
      c.ctx.save(); c.ctx.strokeStyle=col; c.ctx.lineWidth=2; c.glow(col,6); c.ctx.beginPath();
      c.ctx.moveTo(c.X(x-u),c.Y(y)); c.ctx.lineTo(c.X(x+u),c.Y(y)); c.ctx.stroke();
      [x-u,x+u].forEach(e=>{c.ctx.beginPath();c.ctx.moveTo(c.X(e),c.Y(y)-5);c.ctx.lineTo(c.X(e),c.Y(y)+5);c.ctx.stroke();});
      c.ctx.restore();
      c.txt(c.X(x), c.Y(y)-34, lab, col, 12, 'center');
    };
    const ph = Math.min(1, S.t/1.6);
    blob(a, P.ua, QC.pos, `a = ${a.toFixed(1)} ± ${P.ua.toFixed(2)}`, 2.3);
    blob(b, P.ub, QC.vel, `b = ${b.toFixed(1)} ± ${P.ub.toFixed(2)}`, 1.5);
    if(ph>0.15) blob(a+b, uc*ph, QC.energy, `a+b = ${(a+b).toFixed(1)} ± ${uc.toFixed(2)}`, 0.6);
    c.ctx.save(); c.ctx.strokeStyle='rgba(248,81,73,.5)'; c.ctx.setLineDash([5,4]); c.ctx.lineWidth=2; c.ctx.beginPath();
    c.ctx.moveTo(c.X(a+b-naive),c.Y(0.18)); c.ctx.lineTo(c.X(a+b+naive),c.Y(0.18)); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.X(a+b), c.Y(0.18)+8, `naive σₐ+σ_b = ${naive.toFixed(2)} (too wide)`, QC.bad, 11, 'center');
  },
  stats(S,P){ const u=Math.hypot(P.ua,P.ub); return [
    ['σ combined', u.toFixed(3), QC.energy],
    ['σₐ+σ_b', (P.ua+P.ub).toFixed(3), QC.bad],
    ['saved', ((1-u/(P.ua+P.ub))*100).toFixed(0)+'%', QC.vel]];}
};

/* --- 5. projectile --- */
VIZ.cannon = {
  title:'Projectile motion with and without drag',
  eq:'aₓ = −k·vₓ &nbsp;|&nbsp; a_y = −g − k·v_y &nbsp;|&nbsp; R = v₀²sin(2θ)/g',
  note:'Arrows show the **velocity** (green) and the **acceleration** (orange). With k = 0 the range matches the formula exactly and 45° is best. Turn drag up and the best angle drops below 45°.',
  h:300,
  params:[
    {k:'v0', label:'v₀', unit:'m/s', min:5, max:40, val:20, step:1, fmt:v=>v.toFixed(0)},
    {k:'th', label:'θ', unit:'°', min:5, max:85, val:45, step:1, fmt:v=>v.toFixed(0)},
    {k:'k', label:'drag k', min:0, max:0.3, val:0, step:0.01, fmt:v=>v.toFixed(2)}
  ],
  traj(P){
    const g=9.8, dt=0.004, th=P.th*Math.PI/180;
    let x=0,y=0,vx=P.v0*Math.cos(th),vy=P.v0*Math.sin(th);
    const pts=[[0,0]]; let peak=0, guard=0;
    while(y>=0 && guard++<40000){
      const ax=-P.k*vx, ay=-9.8-P.k*vy;
      vx+=ax*dt; vy+=ay*dt; x+=vx*dt; y+=vy*dt;
      pts.push([x,y]); if(y>peak) peak=y;
    }
    return {pts, range:pts[pts.length-1][0], peak};
  },
  init(P){ const t=VIZ.cannon.traj(P); return {t, i:0}; },
  onParam(S,P){ S.t = VIZ.cannon.traj(P); S.i = 0; },
  step(S,dt){ S.i += dt*260; if(S.i >= S.t.pts.length-1) S.i = 0; },
  draw(c,S,P){
    const maxX = Math.max(12, S.t.range*1.12), maxY = Math.max(6, S.t.peak*1.5);
    c.view(-1, maxX, -0.6, maxY); c.grid(8,5); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    c.ctx.save(); c.ctx.strokeStyle='rgba(63,185,80,.55)'; c.ctx.lineWidth=2;
    c.ctx.beginPath(); c.ctx.moveTo(c.pad.l,c.Y(0)); c.ctx.lineTo(c.W-c.pad.r,c.Y(0)); c.ctx.stroke(); c.ctx.restore();
    if(P.k>0){ const n=VIZ.cannon.traj(Object.assign({},P,{k:0}));
      c.path(n.pts, 'rgba(216,222,233,.3)', 1.6); }
    const i = Math.min(Math.floor(S.i), S.t.pts.length-1);
    c.path(S.t.pts.slice(0,i+1), QC.energy, 2.6, 12);
    const [x,y]=S.t.pts[i];
    const prev=S.t.pts[Math.max(0,i-1)];
    const vx=(x-prev[0])/0.004, vy=(y-prev[1])/0.004, sc=maxX/90;
    c.arrow(x,y,x+vx*sc,y+vy*sc,QC.vel,'v');
    c.arrow(x,y,x+(-P.k*vx)*sc*2.4,y+(-9.8-P.k*vy)*sc*2.4,QC.acc,'a');
    c.dot(x,y,6,QC.pos,16);
    c.legend([['path',QC.energy],['v',QC.vel],['a',QC.acc]].concat(P.k>0?[['no drag',QC.exact]]:[]));
  },
  stats(S,P){
    const ideal = P.v0*P.v0*Math.sin(2*P.th*Math.PI/180)/9.8;
    return [['range R', S.t.range.toFixed(1)+' m', QC.energy],
            ['peak', S.t.peak.toFixed(1)+' m', QC.pos],
            ['formula', ideal.toFixed(1)+' m', QC.exact],
            ['drag loss', (ideal-S.t.range).toFixed(1)+' m', P.k>0?QC.bad:QC.dim]];}
};

/* --- 6. exponential vs logistic --- */
VIZ.growth = {
  title:'Unlimited growth versus growth with a ceiling',
  eq:'Pₙ₊₁ = Pₙ + r·Pₙ &nbsp;&nbsp;vs&nbsp;&nbsp; Pₙ₊₁ = Pₙ + r·Pₙ(1 − Pₙ/K)',
  note:'Both start identically. The only difference is the bracket (1 − P/K), which shrinks to zero as P nears the ceiling K. Watch the blue curve flatten exactly at K while the orange one keeps climbing.',
  h:280, resetOnParam:true,
  params:[
    {k:'r', label:'r', min:0.02, max:0.45, val:0.15, step:0.01, fmt:v=>v.toFixed(2)},
    {k:'K', label:'K', min:200, max:2000, val:1000, step:50, fmt:v=>v.toFixed(0)}
  ],
  init(P){ return {n:0, e:[100], l:[100]}; },
  step(S,dt,P){
    S.n += dt*9;
    while(S.e.length < Math.min(60, S.n)){
      const pe=S.e[S.e.length-1], pl=S.l[S.l.length-1];
      S.e.push(pe + P.r*pe); S.l.push(pl + P.r*pl*(1-pl/P.K));
    }
    if(S.n>72){ S.n=0; S.e=[100]; S.l=[100]; }
  },
  draw(c,S,P){
    const top = Math.max(P.K*1.35, 400);
    c.view(0,60,0,top); c.grid(6,5); c.axes('year','population'); c.ticks(v=>v.toFixed(0),v=>v>=1000?(v/1000).toFixed(1)+'k':v.toFixed(0));
    c.ctx.save(); c.ctx.strokeStyle='rgba(227,179,65,.6)'; c.ctx.setLineDash([6,4]); c.ctx.lineWidth=1.6;
    c.ctx.beginPath(); c.ctx.moveTo(c.pad.l,c.Y(P.K)); c.ctx.lineTo(c.W-c.pad.r,c.Y(P.K)); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.W-c.pad.r-4, c.Y(P.K)-15, 'K = '+P.K, QC.energy, 11, 'right');
    c.path(S.e.map((v,i)=>[i,Math.min(v,top*1.4)]), QC.acc, 2.4, 10);
    c.path(S.l.map((v,i)=>[i,v]), QC.pos, 2.6, 10);
    if(S.e.length>1){ c.dot(S.e.length-1, Math.min(S.e[S.e.length-1],top*1.4), 4.5, QC.acc, 10);
                      c.dot(S.l.length-1, S.l[S.l.length-1], 4.5, QC.pos, 10); }
    c.legend([['exponential',QC.acc],['logistic',QC.pos],['ceiling K',QC.energy]]);
  },
  stats(S,P){ const e=S.e[S.e.length-1], l=S.l[S.l.length-1];
    return [['year', S.e.length-1, QC.dim],['exponential', Math.round(e), QC.acc],
            ['logistic', Math.round(l), QC.pos],['ratio', (e/l).toFixed(1)+'×', QC.energy]];}
};

/* --- 7. law of large numbers --- */
VIZ.lln = {
  title:'Why more data makes an average trustworthy',
  eq:'x̄ₙ = (1/n)·Σxᵢ &nbsp;|&nbsp; spread of x̄ shrinks like σ/√n',
  note:'Each dot is one noisy measurement. The blue line is the running average. It lurches at the start and then settles — that settling **is** the law of large numbers, and it is what your dial project draws live.',
  h:280, resetOnParam:true,
  params:[{k:'sd', label:'noise σ', min:0.2, max:5, val:2.5, step:0.1, fmt:v=>v.toFixed(1)}],
  init(P){ return {xs:[], run:[], sum:0, t:0}; },
  step(S,dt,P){
    S.t += dt*26;
    while(S.xs.length < Math.min(200, S.t)){
      let u=0,v=0; while(!u)u=Math.random(); v=Math.random();
      const g = Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
      const x = 20 + g*P.sd; S.xs.push(x); S.sum += x; S.run.push(S.sum/S.xs.length);
    }
    if(S.t>240){ S.t=0; S.xs=[]; S.run=[]; S.sum=0; }
  },
  draw(c,S,P){
    c.view(0,200,20-P.sd*3.2,20+P.sd*3.2); c.grid(8,4); c.ticks(v=>v.toFixed(0),v=>v.toFixed(1));
    c.ctx.save(); c.ctx.strokeStyle='rgba(216,222,233,.55)'; c.ctx.setLineDash([6,4]); c.ctx.beginPath();
    c.ctx.moveTo(c.pad.l,c.Y(20)); c.ctx.lineTo(c.W-c.pad.r,c.Y(20)); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.W-c.pad.r-4, c.Y(20)-15, 'true mean = 20', QC.exact, 11, 'right');
    S.xs.forEach((x,i)=>c.sdot(c.X(i), c.Y(x), 1.8, 'rgba(188,140,255,.5)'));
    c.path(S.run.map((v,i)=>[i,v]), QC.pos, 2.4, 12);
    if(S.run.length) c.dot(S.run.length-1, S.run[S.run.length-1], 5, QC.pos, 14);
    c.legend([['samples',QC.mag],['running mean',QC.pos],['truth',QC.exact]]);
  },
  stats(S,P){ const n=S.run.length, m=n?S.run[n-1]:0;
    return [['n', n, QC.dim],['running mean', n?m.toFixed(3):'—', QC.pos],
            ['error', n?Math.abs(m-20).toFixed(3):'—', n&&Math.abs(m-20)<0.3?QC.vel:QC.acc],
            ['σ/√n', n?(P.sd/Math.sqrt(n)).toFixed(3):'—', QC.exact]];}
};

/* --- 8. least squares --- */
VIZ.leastsq = {
  title:'Least squares: the line that minimises squared error',
  eq:'slope = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² &nbsp;|&nbsp; SSE = Σ residual²',
  note:'**Drag any point.** The red bars are residuals — the vertical misses. The fitted line is the one position where the total of their squares is smallest. Drag one point far away and watch a single outlier drag the whole line.',
  h:290, autoplay:false, pointer:true,
  init(){ const pts=[]; for(let i=0;i<9;i++){ const x=i*1.1+0.6; pts.push([x, 1.2+0.72*x + (Math.random()-0.5)*3.4]); } return {pts, drag:-1}; },
  pointer(S,P,c,sx,sy,phase){
    if(phase==='down'){ let best=-1,bd=400;
      S.pts.forEach((p,i)=>{ const d=(c.X(p[0])-sx)**2+(c.Y(p[1])-sy)**2; if(d<bd){bd=d;best=i;} });
      S.drag=best; }
    if(S.drag>=0) S.pts[S.drag][1] = Math.max(-1, Math.min(11, c.invY(sy)));
  },
  fit(pts){ const n=pts.length, mx=pts.reduce((a,p)=>a+p[0],0)/n, my=pts.reduce((a,p)=>a+p[1],0)/n;
    let num=0, den=0; pts.forEach(p=>{num+=(p[0]-mx)*(p[1]-my); den+=(p[0]-mx)**2;});
    const b=num/den; return {b, a:my-b*mx}; },
  draw(c,S){
    c.view(0,11,-1,11); c.grid(8,6); c.axes('x','y'); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    const {a,b}=VIZ.leastsq.fit(S.pts);
    S.pts.forEach(p=>{ const yh=a+b*p[0];
      c.ctx.save(); c.ctx.strokeStyle='rgba(248,81,73,.75)'; c.ctx.lineWidth=2; c.ctx.beginPath();
      c.ctx.moveTo(c.X(p[0]),c.Y(p[1])); c.ctx.lineTo(c.X(p[0]),c.Y(yh)); c.ctx.stroke(); c.ctx.restore(); });
    c.path([[0,a],[11,a+b*11]], QC.accent, 2.6, 12);
    S.pts.forEach(p=>c.dot(p[0],p[1],5.5,QC.pos,10));
    c.legend([['data',QC.pos],['fit',QC.accent],['residual',QC.bad]]);
  },
  stats(S){ const {a,b}=VIZ.leastsq.fit(S.pts);
    const sse=S.pts.reduce((s,p)=>s+(p[1]-(a+b*p[0]))**2,0);
    return [['slope', b.toFixed(3), QC.accent],['intercept', a.toFixed(3), QC.accent],
            ['SSE', sse.toFixed(2), QC.bad]];}
};

/* --- 9. root finding --- */
VIZ.rootfind = {
  title:'Two ways to hunt a root: halving versus tangent jumps',
  eq:'bisection: m = (a+b)/2 &nbsp;|&nbsp; Newton: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)',
  note:'Press **Step** repeatedly. Bisection halves the blue bracket every time — steady but slow. Newton jumps along the tangent line and lands on √2 in about 4 steps. Both find the same answer; the difference is how many steps it costs.',
  h:290, autoplay:false, stepBtn:true,
  toggles:[{k:'newton', label:'Newton', on:true},{k:'bisect', label:'Bisection', on:true}],
  init(){ return {a:0, b:2, nx:2.0, bn:0, nn:0}; },
  stepOnce(S){
    const f=x=>x*x-2;
    if(S.b-S.a>1e-9 && S.bn<40){ const m=(S.a+S.b)/2; if(f(S.a)*f(m)<=0) S.b=m; else S.a=m; S.bn++; }
    if(Math.abs(f(S.nx))>1e-12 && S.nn<40){ S.nx = S.nx - f(S.nx)/(2*S.nx); S.nn++; }
  },
  draw(c,S,P){
    const f=x=>x*x-2;
    c.view(0,2.3,-2.4,3.2); c.grid(8,5); c.axes('x','f(x) = x² − 2'); c.ticks();
    const pts=[]; for(let i=0;i<=200;i++){ const x=i/200*2.3; pts.push([x,f(x)]); }
    c.path(pts, QC.accent, 2.2, 8);
    const R=Math.SQRT2;
    c.ctx.save(); c.ctx.strokeStyle='rgba(216,222,233,.4)'; c.ctx.setLineDash([4,4]); c.ctx.beginPath();
    c.ctx.moveTo(c.X(R),c.pad.t); c.ctx.lineTo(c.X(R),c.H-c.pad.b); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.X(R)+5, c.pad.t+2, '√2', QC.exact, 11);
    if(P.bisect){
      c.ctx.save(); c.ctx.fillStyle='rgba(88,166,255,.18)';
      c.ctx.fillRect(c.X(S.a), c.pad.t, c.X(S.b)-c.X(S.a), c.H-c.pad.t-c.pad.b); c.ctx.restore();
      c.dot((S.a+S.b)/2, 0, 5, QC.pos, 12);
      c.txt(c.X((S.a+S.b)/2), c.Y(0)+10, 'bisect', QC.pos, 11, 'center');
    }
    if(P.newton){
      const x=S.nx, y=f(x), sl=2*x;
      c.path([[x-1.2, y-sl*1.2],[x+1.2, y+sl*1.2]], QC.acc, 2, 8);
      c.dot(x, y, 5, QC.acc, 12);
      const nxt = x - y/sl; c.dot(nxt, 0, 4.5, QC.acc, 10);
      c.txt(c.X(nxt), c.Y(0)-20, 'Newton', QC.acc, 11, 'center');
    }
    c.legend([['f(x)',QC.accent],['bisection',QC.pos],['Newton',QC.acc]]);
  },
  stats(S){ const R=Math.SQRT2;
    return [['bisect steps', S.bn, QC.pos],['bisect err', Math.abs((S.a+S.b)/2-R).toExponential(1), QC.pos],
            ['Newton steps', S.nn, QC.acc],['Newton err', Math.abs(S.nx-R).toExponential(1), QC.acc]];}
};

/* --- 10. Euler energy drift --- */
VIZ.eulerdrift = {
  title:'A simple integrator quietly creates energy from nothing',
  eq:'E = ½mv² + ½kx² &nbsp;(must stay constant) &nbsp;|&nbsp; Euler: v ← v + a·Δt',
  note:'A real spring conserves energy exactly. Euler does not: every step adds a sliver, so the swing grows forever. Shrink Δt and the growth slows but never stops. This is the bug you are meant to **see**, not fix.',
  h:290, resetOnParam:true,
  params:[{k:'dt', label:'Δt', min:0.005, max:0.14, val:0.06, step:0.005, fmt:v=>v.toFixed(3)}],
  init(){ return {x:1, v:0, t:0, hist:[], E0:0.5}; },
  step(S,dt,P){
    for(let i=0;i<Math.max(1,Math.round(dt/0.016*2));i++){
      const a = -S.x;                       // m = k = 1
      const xn = S.x + P.dt*S.v;            // deliberately explicit Euler
      const vn = S.v + P.dt*a;
      S.x=xn; S.v=vn; S.t+=P.dt;
      const E = 0.5*S.v*S.v + 0.5*S.x*S.x;
      S.hist.push([S.t,E]); if(S.hist.length>900) S.hist.shift();
    }
    if(S.t>55){ S.x=1;S.v=0;S.t=0;S.hist=[]; }
  },
  draw(c,S,P){
    const half=Math.round(c.H*0.52);
    // top: the spring
    c.ctx.save(); c.ctx.beginPath(); c.ctx.rect(0,0,c.W,half); c.ctx.clip();
    const cy=half*0.55, wallX=42, px=wallX+ (S.x+2.6)/5.2*(c.W-wallX-40);
    c.ctx.strokeStyle='rgba(170,190,215,.6)'; c.ctx.lineWidth=3;
    c.ctx.beginPath(); c.ctx.moveTo(wallX,cy-30); c.ctx.lineTo(wallX,cy+30); c.ctx.stroke();
    c.ctx.strokeStyle=QC.accent; c.ctx.lineWidth=2; c.ctx.shadowColor=QC.accent; c.ctx.shadowBlur=6;
    c.ctx.beginPath(); c.ctx.moveTo(wallX,cy);
    for(let i=1;i<=14;i++){ const f=i/14; c.ctx.lineTo(wallX+(px-wallX)*f, cy+(i%2?-11:11)); }
    c.ctx.lineTo(px,cy); c.ctx.stroke(); c.ctx.restore();
    c.sdot(px,cy,13,QC.pos,16);
    c.chip(12, 8, 'the spring');
    // bottom: energy
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(0,half); c.ctx.lineTo(c.W,half); c.ctx.stroke(); c.ctx.restore();
    const E = 0.5*S.v*S.v + 0.5*S.x*S.x;
    const oldPad=c.pad.t; c.pad.t = half+22;
    c.view(0,55,0,Math.max(1.3, E*1.25)); c.ticks(v=>v.toFixed(0),v=>v.toFixed(2));
    c.ctx.save(); c.ctx.strokeStyle='rgba(216,222,233,.55)'; c.ctx.setLineDash([6,4]); c.ctx.beginPath();
    c.ctx.moveTo(c.pad.l,c.Y(0.5)); c.ctx.lineTo(c.W-c.pad.r,c.Y(0.5)); c.ctx.stroke(); c.ctx.restore();
    c.chip(c.W-c.pad.r-138, c.Y(0.5)+6, 'true energy = 0.5 J', QC.exact);
    c.path(S.hist, E>0.6?QC.bad:QC.energy, 2.4, 10);
    c.pad.t=oldPad;
    c.chip(12, half+7, 'energy over time');
  },
  stats(S,P){ const E=0.5*S.v*S.v+0.5*S.x*S.x;
    return [['Δt', P.dt.toFixed(3), QC.dim],['t', S.t.toFixed(1)+' s', QC.dim],
            ['energy', E.toFixed(4)+' J', E>0.6?QC.bad:QC.energy],
            ['gained', '+'+((E/0.5-1)*100).toFixed(1)+'%', E>0.6?QC.bad:QC.acc]];}
};

/* --- 11. forces on a falling body --- */
VIZ.forces = {
  title:'Net force decides the motion',
  eq:'F_net = m·g + (−k·v) &nbsp;→&nbsp; a = F_net / m &nbsp;→&nbsp; terminal when F_net = 0',
  note:'Orange is gravity (always the same), green is drag (grows with speed, always opposite v). When they cancel, the arrows are equal and the body stops speeding up — that is **terminal velocity**, and you can watch it happen.',
  h:290, resetOnParam:true,
  params:[
    {k:'m', label:'mass m', unit:'kg', min:0.5, max:6, val:2, step:0.1, fmt:v=>v.toFixed(1)},
    {k:'k', label:'drag k', min:0.2, max:6, val:2, step:0.1, fmt:v=>v.toFixed(1)}
  ],
  init(){ return {y:9, v:0, t:0, hist:[]}; },
  step(S,dt,P){
    for(let i=0;i<3;i++){
      const h=0.012, Fg=-9.8*P.m, Fd=-P.k*S.v, a=(Fg+Fd)/P.m;
      S.v+=a*h; S.y+=S.v*h; S.t+=h;
      S.hist.push([S.t, -S.v]); if(S.hist.length>700) S.hist.shift();
      if(S.y<0.4){ S.y=9; S.v=0; S.t=0; S.hist=[]; }
    }
  },
  draw(c,S,P){
    const split=Math.round(c.W*0.44);
    c.ctx.save(); c.ctx.beginPath(); c.ctx.rect(0,0,split,c.H); c.ctx.clip();
    const bx=split*0.5, by=c.H-20-(S.y/9.6)*(c.H-60);
    const Fg=9.8*P.m, Fd=P.k*Math.abs(S.v), sc=46/Math.max(Fg,1);
    c.sdot(bx,by,13,QC.pos,16);
    const A=(x0,y0,x1,y1,col,lab)=>{ const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy); if(L<3)return;
      const ux=dx/L,uy=dy/L,hd=9; c.ctx.save(); c.ctx.shadowColor=col; c.ctx.shadowBlur=8;
      c.ctx.strokeStyle=col; c.ctx.fillStyle=col; c.ctx.lineWidth=2.4;
      c.ctx.beginPath(); c.ctx.moveTo(x0,y0); c.ctx.lineTo(x1-ux*hd*.8,y1-uy*hd*.8); c.ctx.stroke();
      c.ctx.beginPath(); c.ctx.moveTo(x1,y1); c.ctx.lineTo(x1-ux*hd-uy*hd*.5,y1-uy*hd+ux*hd*.5);
      c.ctx.lineTo(x1-ux*hd+uy*hd*.5,y1-uy*hd-ux*hd*.5); c.ctx.closePath(); c.ctx.fill();
      c.ctx.shadowBlur=0; c.ctx.font='bold 11px ui-monospace,monospace'; c.ctx.textAlign='left';
      c.ctx.fillText(lab, x1+6, y1); c.ctx.restore(); };
    A(bx,by,bx,by+Fg*sc,QC.acc,'m·g');
    A(bx,by,bx,by-Fd*sc,QC.vel,'−k·v');
    c.ctx.restore();
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(split,0); c.ctx.lineTo(split,c.H); c.ctx.stroke(); c.ctx.restore();
    const term = 9.8*P.m/P.k;
    const oldL=c.pad.l; c.pad.l=split+40;
    c.view(0, Math.max(3,S.t+0.4), 0, term*1.35); c.grid(4,4); c.ticks(v=>v.toFixed(1),v=>v.toFixed(1));
    c.ctx.save(); c.ctx.strokeStyle='rgba(227,179,65,.6)'; c.ctx.setLineDash([5,4]); c.ctx.beginPath();
    c.ctx.moveTo(c.pad.l,c.Y(term)); c.ctx.lineTo(c.W-c.pad.r,c.Y(term)); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.W-c.pad.r-4, c.Y(term)-15, 'terminal v = mg/k', QC.energy, 10.5, 'right');
    c.path(S.hist, QC.vel, 2.4, 10);
    c.pad.l=oldL;
    c.chip(split+10, 7, 'speed over time');
  },
  stats(S,P){ const term=9.8*P.m/P.k, sp=Math.abs(S.v);
    return [['speed', sp.toFixed(2)+' m/s', QC.vel],['terminal', term.toFixed(2)+' m/s', QC.energy],
            ['m·g', (9.8*P.m).toFixed(1)+' N', QC.acc],['k·v', (P.k*sp).toFixed(1)+' N', QC.vel]];}
};

/* --- 12. boids --- */
VIZ.boids = {
  title:'Three local rules make a flock',
  eq:'v ← v + w_s·separation + w_a·alignment + w_c·cohesion',
  note:'Toggle the rules. **Separation only** scatters them. **Alignment only** points them the same way but leaves them spread out. **Cohesion only** clumps them into a ball. Only all three together give real flocking — nothing in the code says "flock".',
  h:300,
  toggles:[{k:'sep',label:'Separation',on:true},{k:'ali',label:'Alignment',on:true},{k:'coh',label:'Cohesion',on:true}],
  init(){ const b=[]; for(let i=0;i<70;i++){ const a=Math.random()*6.28;
    b.push({x:Math.random()*100,y:Math.random()*60,vx:Math.cos(a)*14,vy:Math.sin(a)*14}); } return {b, order:0}; },
  onToggle(){},
  step(S,dt,P){
    const R=16, D=5.5, h=Math.min(dt,0.033);
    const nb = S.b.map(()=>({sx:0,sy:0,ax:0,ay:0,cx:0,cy:0,n:0,ns:0}));
    for(let i=0;i<S.b.length;i++) for(let j=0;j<S.b.length;j++){
      if(i===j) continue; const a=S.b[i], o=S.b[j];
      let dx=o.x-a.x, dy=o.y-a.y;
      if(dx>50)dx-=100; if(dx<-50)dx+=100; if(dy>30)dy-=60; if(dy<-30)dy+=60;
      const d=Math.hypot(dx,dy); if(d>=R) continue;
      const q=nb[i]; q.n++; q.ax+=o.vx; q.ay+=o.vy; q.cx+=dx; q.cy+=dy;
      if(d<D && d>0){ q.ns++; q.sx-=dx/d; q.sy-=dy/d; }
    }
    S.b.forEach((a,i)=>{
      const q=nb[i]; let ax=0, ay=0;
      if(P.sep && q.ns){ ax+=q.sx*26; ay+=q.sy*26; }
      if(P.ali && q.n){ ax+=(q.ax/q.n-a.vx)*2.2; ay+=(q.ay/q.n-a.vy)*2.2; }
      if(P.coh && q.n){ ax+=(q.cx/q.n)*0.75; ay+=(q.cy/q.n)*0.75; }
      a.vx+=ax*h; a.vy+=ay*h;
      const s=Math.hypot(a.vx,a.vy)||1, lo=9, hi=20;
      const t=Math.max(lo,Math.min(hi,s)); a.vx=a.vx/s*t; a.vy=a.vy/s*t;
      a.x=(a.x+a.vx*h+100)%100; a.y=(a.y+a.vy*h+60)%60;
    });
    let ux=0,uy=0; S.b.forEach(a=>{const s=Math.hypot(a.vx,a.vy)||1; ux+=a.vx/s; uy+=a.vy/s;});
    S.order = Math.hypot(ux,uy)/S.b.length;
  },
  draw(c,S){
    c.view(0,100,0,60,true);
    S.b.forEach(a=>{
      const s=Math.hypot(a.vx,a.vy)||1, ux=a.vx/s, uy=a.vy/s;
      const X=c.X(a.x), Y=c.Y(a.y), L=7;
      c.ctx.save(); c.ctx.shadowColor=QC.accent; c.ctx.shadowBlur=7; c.ctx.fillStyle=QC.accent;
      c.ctx.beginPath(); c.ctx.moveTo(X+ux*L, Y-uy*L);
      c.ctx.lineTo(X-ux*L*0.6+uy*L*0.45, Y+uy*L*0.6+ux*L*0.45);
      c.ctx.lineTo(X-ux*L*0.6-uy*L*0.45, Y+uy*L*0.6-ux*L*0.45);
      c.ctx.closePath(); c.ctx.fill(); c.ctx.restore();
    });
    c.bar(c.pad.l, c.H-16, 150, 7, S.order, S.order>0.8?QC.vel:QC.acc, 'alignment (order parameter)');
  },
  stats(S,P){ const on=[P.sep&&'sep',P.ali&&'ali',P.coh&&'coh'].filter(Boolean).join(' + ')||'none';
    return [['rules on', on, QC.accent],['order', S.order.toFixed(2), S.order>0.8?QC.vel:QC.acc],
            ['boids', S.b.length, QC.dim]];}
};

/* --- 13. Monte Carlo pi --- */
VIZ.montecarlo = {
  title:'Estimating π by throwing random darts',
  eq:'π ≈ 4 × (darts inside circle) / (total darts) &nbsp;|&nbsp; error ∝ 1/√N',
  note:'Pure randomness producing a precise number. The error shrinks like 1/√N, so **100× more darts gives only 10× less error** — that is why the estimate crawls once it is close.',
  h:300,
  params:[{k:'rate', label:'darts/frame', min:1, max:120, val:25, step:1, fmt:v=>v.toFixed(0)}],
  init(){ return {in:0, n:0, pts:[]}; },
  step(S,dt,P){
    for(let i=0;i<Math.round(P.rate);i++){
      const x=Math.random()*2-1, y=Math.random()*2-1, ins=x*x+y*y<=1;
      S.n++; if(ins) S.in++;
      if(S.pts.length<4000) S.pts.push([x,y,ins]);
    }
  },
  draw(c,S){
    const sq=Math.min(c.W*0.52, c.H-30), ox=18, oy=(c.H-sq)/2;
    c.ctx.save(); c.ctx.strokeStyle='rgba(170,190,215,.45)'; c.ctx.lineWidth=1.5;
    c.ctx.strokeRect(ox,oy,sq,sq);
    c.ctx.strokeStyle=QC.accent; c.ctx.shadowColor=QC.accent; c.ctx.shadowBlur=9; c.ctx.lineWidth=2;
    c.ctx.beginPath(); c.ctx.arc(ox+sq/2, oy+sq/2, sq/2, 0, 7); c.ctx.stroke(); c.ctx.restore();
    S.pts.forEach(p=>{ c.ctx.fillStyle = p[2]?'rgba(63,185,80,.72)':'rgba(240,136,62,.6)';
      c.ctx.fillRect(ox+(p[0]+1)/2*sq, oy+(1-(p[1]+1)/2)*sq, 2, 2); });
    const est = S.n? 4*S.in/S.n : 0, err=Math.abs(est-Math.PI);
    const gx=ox+sq+34, gw=c.W-gx-14;
    c.txt(gx, oy+6, 'estimate', QC.dim, 11);
    c.txt(gx, oy+22, est? est.toFixed(5):'—', QC.energy, 26);
    c.txt(gx, oy+58, 'π = 3.14159…', QC.exact, 11);
    c.bar(gx, oy+92, Math.max(40,gw), 9, Math.min(1, 1-err/0.5), err<0.01?QC.vel:QC.acc, 'closeness');
    c.txt(gx, oy+118, 'N = '+S.n.toLocaleString(), QC.dim, 12);
    c.txt(gx, oy+136, 'error = '+(S.n?err.toFixed(4):'—'), err<0.01?QC.vel:QC.acc, 12);
    c.txt(gx, oy+160, '1/√N = '+(S.n?(1/Math.sqrt(S.n)).toFixed(4):'—'), QC.exact, 12);
  },
  stats(S){ const est=S.n?4*S.in/S.n:0;
    return [['N', S.n.toLocaleString(), QC.dim],['inside', S.in.toLocaleString(), QC.vel],
            ['π estimate', S.n?est.toFixed(5):'—', QC.energy],
            ['error', S.n?Math.abs(est-Math.PI).toFixed(5):'—', QC.acc]];}
};

/* --- 14. overfitting --- */
VIZ.overfit = {
  title:'A wigglier curve fits the past and predicts worse',
  eq:'fit on training points only &nbsp;→&nbsp; score on held-out points',
  note:'Raise the degree. **Training error always falls.** Held-out error falls, then rises — that turn is overfitting. The honest score is always the held-out one, which is why your project hides the last years before fitting.',
  h:290, autoplay:false, resetOnParam:true,
  params:[{k:'deg', label:'degree', min:1, max:9, val:1, step:1, fmt:v=>v.toFixed(0)}],
  init(){
    const tr=[], te=[], f=x=>1.1+0.85*x+0.35*Math.sin(x*1.6);
    let seed=7; const rnd=()=>{ seed=(seed*1103515245+12345)%2147483648; return seed/2147483648-0.5; };
    for(let i=0;i<11;i++){ const x=i*0.62; tr.push([x, f(x)+rnd()*0.75]); }
    for(let i=0;i<5;i++){ const x=7.0+i*0.52; te.push([x, f(x)+rnd()*0.75]); }
    return {tr,te};
  },
  poly(pts,d){
    const n=d+1, A=[], b=[];
    for(let i=0;i<n;i++){ A.push(new Array(n).fill(0)); b.push(0);
      for(let j=0;j<n;j++) pts.forEach(p=>A[i][j]+=Math.pow(p[0],i+j));
      pts.forEach(p=>b[i]+=Math.pow(p[0],i)*p[1]); }
    for(let i=0;i<n;i++){ A[i][i]+=1e-9;
      let piv=i; for(let r=i+1;r<n;r++) if(Math.abs(A[r][i])>Math.abs(A[piv][i])) piv=r;
      [A[i],A[piv]]=[A[piv],A[i]]; [b[i],b[piv]]=[b[piv],b[i]];
      for(let r=i+1;r<n;r++){ const f=A[r][i]/A[i][i]; if(!isFinite(f))continue;
        for(let cc=i;cc<n;cc++) A[r][cc]-=f*A[i][cc]; b[r]-=f*b[i]; } }
    const x=new Array(n).fill(0);
    for(let i=n-1;i>=0;i--){ let s=b[i]; for(let j=i+1;j<n;j++) s-=A[i][j]*x[j]; x[i]=s/A[i][i]; }
    return x.map(v=>isFinite(v)?v:0);
  },
  draw(c,S,P){
    c.view(-0.4,9.4,-1.5,10.5); c.grid(8,5); c.axes('x','y'); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    c.ctx.save(); c.ctx.fillStyle='rgba(227,179,65,.07)';
    c.ctx.fillRect(c.X(6.8), c.pad.t, c.W-c.pad.r-c.X(6.8), c.H-c.pad.t-c.pad.b); c.ctx.restore();
    c.txt(c.X(6.9), c.pad.t+4, 'held-out', QC.energy, 11);
    const co=VIZ.overfit.poly(S.tr, Math.round(P.deg));
    const ev=x=>co.reduce((s,a,i)=>s+a*Math.pow(x,i),0);
    const pts=[]; for(let i=0;i<=240;i++){ const x=-0.4+i/240*9.8; pts.push([x, Math.max(-6,Math.min(16,ev(x)))]); }
    c.path(pts, QC.accent, 2.6, 10);
    S.tr.forEach(p=>c.dot(p[0],p[1],5,QC.pos,8));
    S.te.forEach(p=>c.dot(p[0],p[1],5.5,QC.energy,10));
    c.legend([['training',QC.pos],['held-out',QC.energy],['fit',QC.accent]]);
  },
  stats(S,P){
    const co=VIZ.overfit.poly(S.tr, Math.round(P.deg));
    const ev=x=>co.reduce((s,a,i)=>s+a*Math.pow(x,i),0);
    const r=a=>Math.sqrt(a.reduce((s,p)=>s+(p[1]-ev(p[0]))**2,0)/a.length);
    const tr=r(S.tr), te=r(S.te);
    return [['degree', Math.round(P.deg), QC.accent],['train RMSE', tr.toFixed(3), QC.pos],
            ['held-out RMSE', te>99?'huge':te.toFixed(3), te>tr*2.2?QC.bad:QC.energy]];}
};

/* --- 15. Markov chain --- */
VIZ.markov = {
  title:'Many random walkers reveal the long-run answer',
  eq:'πP = π &nbsp;(the stationary distribution)',
  note:'Every dot hops at random using the same probability table. No single dot is predictable, yet **the crowd split settles to a fixed ratio** — that ratio is the stationary distribution, which you can also get exactly from an eigenvector.',
  h:280,
  params:[{k:'pdry', label:'P(dry→dry)', min:0.3, max:0.95, val:0.8, step:0.01, fmt:v=>v.toFixed(2)}],
  init(){ const w=[]; for(let i=0;i<240;i++) w.push({s:0, j:Math.random()*0.6, x:Math.random(), y:Math.random()}); return {w, t:0}; },
  step(S,dt,P){
    S.t+=dt;
    const Pm=[[P.pdry, (1-P.pdry)*0.7, (1-P.pdry)*0.3],[0.45,0.35,0.20],[0.35,0.40,0.25]];
    S.w.forEach(k=>{ k.j-=dt; if(k.j<=0){ k.j=0.45+Math.random()*0.5;
      const r=Math.random(), row=Pm[k.s]; let a=0, ns=2;
      for(let i=0;i<3;i++){ a+=row[i]; if(r<a){ ns=i; break; } }
      k.s=ns; k.x=Math.random(); k.y=Math.random(); } });
  },
  stationary(P){
    const Pm=[[P.pdry,(1-P.pdry)*0.7,(1-P.pdry)*0.3],[0.45,0.35,0.20],[0.35,0.40,0.25]];
    let v=[1/3,1/3,1/3];
    for(let it=0;it<800;it++){ const n=[0,0,0];
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) n[j]+=v[i]*Pm[i][j];
      v=n; const s=v[0]+v[1]+v[2]; v=v.map(x=>x/s); }
    return v;
  },
  draw(c,S,P){
    const names=['Dry','Light','Heavy'], cols=[QC.cool,QC.vel,QC.mag];
    const zw=(c.W-70)/3, zh=c.H-72;
    const counts=[0,0,0]; S.w.forEach(k=>counts[k.s]++);
    const st=VIZ.markov.stationary(P);
    for(let i=0;i<3;i++){
      const zx=25+i*(zw+10);
      c.ctx.save(); c.ctx.strokeStyle=cols[i]+'55'; c.ctx.fillStyle=cols[i]+'0e'; c.ctx.lineWidth=1.5;
      c.ctx.beginPath(); c.ctx.roundRect(zx,18,zw,zh,10); c.ctx.fill(); c.ctx.stroke(); c.ctx.restore();
      c.txt(zx+zw/2, 2, names[i], cols[i], 12, 'center');
      const share=counts[i]/S.w.length;
      c.txt(zx+zw/2, zh+24, (share*100).toFixed(0)+'%', cols[i], 15, 'center');
      c.ctx.save(); c.ctx.strokeStyle=QC.exact; c.ctx.setLineDash([4,3]); c.ctx.lineWidth=1.5;
      const ty = 18+zh - st[i]*zh;
      c.ctx.beginPath(); c.ctx.moveTo(zx,ty); c.ctx.lineTo(zx+zw,ty); c.ctx.stroke(); c.ctx.restore();
    }
    S.w.forEach(k=>{ const zx=25+k.s*(zw+10);
      c.sdot(zx+8+k.x*(zw-16), 26+k.y*(zh-16), 2.6, cols[k.s], 5); });
    c.txt(c.W-14, c.H-14, 'dashed = exact stationary', QC.exact, 10.5, 'right');
  },
  stats(S,P){ const counts=[0,0,0]; S.w.forEach(k=>counts[k.s]++);
    const st=VIZ.markov.stationary(P);
    return [['crowd dry', (counts[0]/S.w.length*100).toFixed(0)+'%', QC.cool],
            ['exact dry', (st[0]*100).toFixed(0)+'%', QC.exact],
            ['gap', Math.abs(counts[0]/S.w.length-st[0]).toFixed(3), QC.vel]];}
};

/* --- 16. Euler vs RK4 --- */
VIZ.integrators = {
  title:'Euler versus RK4 chasing the true curve',
  eq:'dy/dt = −y &nbsp;(exact: y = e^{−t}) &nbsp;|&nbsp; error ∝ Δt¹ vs Δt⁴',
  note:'Same step size, same equation. Euler drifts off; RK4 sits on the exact curve. Halving Δt halves Euler\'s error but cuts RK4\'s by about **16×** — that is what "fourth order" buys you.',
  h:280, autoplay:false, resetOnParam:true,
  params:[{k:'dt', label:'Δt', min:0.05, max:1.0, val:0.5, step:0.05, fmt:v=>v.toFixed(2)}],
  init(){ return {}; },
  run(dt){
    const eu=[[0,1]], rk=[[0,1]]; let ye=1, yr=1, t=0;
    const n=Math.max(1,Math.round(5/dt));
    for(let i=0;i<n;i++){
      ye = ye + dt*(-ye);
      const k1=-yr, k2=-(yr+dt/2*k1), k3=-(yr+dt/2*k2), k4=-(yr+dt*k3);
      yr = yr + dt/6*(k1+2*k2+2*k3+k4);
      t += dt; eu.push([t,ye]); rk.push([t,yr]);
    }
    return {eu, rk, ye, yr};
  },
  draw(c,S,P){
    const r=VIZ.integrators.run(P.dt); S._r=r;
    c.view(0,5,-0.25,1.1); c.grid(5,4); c.axes('t','y'); c.ticks(v=>v.toFixed(1),v=>v.toFixed(2));
    const ex=[]; for(let i=0;i<=200;i++){ const t=i/200*5; ex.push([t,Math.exp(-t)]); }
    c.path(ex, QC.exact, 2, 0);
    c.path(r.eu, QC.acc, 2.4, 10); r.eu.forEach(p=>c.dot(p[0],p[1],3,QC.acc));
    c.path(r.rk, QC.vel, 2.4, 10); r.rk.forEach(p=>c.dot(p[0],p[1],3,QC.vel));
    c.legend([['exact e^−t',QC.exact],['Euler',QC.acc],['RK4',QC.vel]]);
  },
  stats(S,P){
    const r=S._r||VIZ.integrators.run(P.dt), ex=Math.exp(-5);
    return [['Δt', P.dt.toFixed(2), QC.dim],
            ['Euler err', Math.abs(r.ye-ex).toExponential(1), QC.acc],
            ['RK4 err', Math.abs(r.yr-ex).toExponential(1), QC.vel],
            ['RK4 better by', (Math.abs(r.ye-ex)/Math.max(1e-18,Math.abs(r.yr-ex))).toExponential(0)+'×', QC.energy]];}
};

/* --- 17. ORBIT (flagship) --- */
VIZ.orbit = {
  title:'Gravity, orbits and the two things that never change',
  eq:'a = −GM·r̂/r² &nbsp;|&nbsp; E = ½v² − GM/r &nbsp;|&nbsp; L = r × v',
  note:'Slide v₀. Below circular speed the orbit is a squashed ellipse, and the planet **speeds up near the star and crawls at the far end**. The two shaded wedges take the same time to sweep and have the same area. Energy E and angular momentum L stay flat the whole time — if your own code lets E drift, you have a bug.',
  h:340,
  params:[{k:'v0', label:'v₀', min:0.45, max:1.38, val:0.68, step:0.01, fmt:v=>v.toFixed(2)}],
  toggles:[{k:'areas', label:'Equal areas', on:true}],
  init(P){
    return {s:[1,0,0,P.v0], trail:[], t:0, Eh:[], E0:0.5*P.v0*P.v0-1, wedge:[[1,0]], wt:0, wedges:[]};
  },
  onParam(S,P){ Object.assign(S, VIZ.orbit.init(P)); },
  step(S,dt,P){
    const h=0.0022, steps=Math.min(26, Math.max(1, Math.round(dt*900)));
    const f = y => { const r=Math.hypot(y[0],y[1]); return [y[2],y[3],-y[0]/(r*r*r),-y[1]/(r*r*r)]; };
    const a = -1/(2*S.E0), T = 2*Math.PI*Math.pow(Math.max(a,0.05),1.5);
    for(let i=0;i<steps;i++){
      S.s = rk4(f, S.s, h); S.t += h;
      S.trail.push([S.s[0],S.s[1]]); if(S.trail.length>2600) S.trail.shift();
      const r=Math.hypot(S.s[0],S.s[1]);
      S.Eh.push([S.t, 0.5*(S.s[2]**2+S.s[3]**2)-1/r]); if(S.Eh.length>1100) S.Eh.shift();
      S.wedge.push([S.s[0],S.s[1]]); S.wt+=h;
      if(S.wt >= T/10){ S.wedges.push(S.wedge); S.wedge=[[S.s[0],S.s[1]]]; S.wt=0;
        if(S.wedges.length>2) S.wedges.shift(); }
    }
  },
  draw(c,S,P){
    const split = Math.round(c.W*0.58);
    const a = -1/(2*S.E0), apo = a*(1 + Math.max(0, 1 - S.E0*0 )) ;
    const R = Math.max(1.25, Math.min(3.6, a*1.75));
    /* ---------- left: the orbit ---------- */
    const o = c.pads(null, c.W-split, null, null);
    c.view(-R,R,-R,R,true);
    c.clip(0,0,split,c.H, ()=>{
      c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.10)';
      [0.5,1,1.5,2,3].forEach(rr=>{ c.ctx.beginPath(); c.ctx.arc(c.X(0),c.Y(0), c.X(rr)-c.X(0), 0, 7); c.ctx.stroke(); });
      c.ctx.restore();
      if(P.areas) S.wedges.forEach((w,i)=>{ if(w.length<3) return;
        c.ctx.save(); c.ctx.fillStyle = i? 'rgba(188,140,255,.30)':'rgba(57,208,216,.26)';
        c.ctx.strokeStyle = i? 'rgba(188,140,255,.6)':'rgba(57,208,216,.55)';
        c.ctx.beginPath(); c.ctx.moveTo(c.X(0),c.Y(0));
        w.forEach(p=>c.ctx.lineTo(c.X(p[0]),c.Y(p[1]))); c.ctx.closePath();
        c.ctx.fill(); c.ctx.stroke(); c.ctx.restore(); });
      c.path(S.trail, 'rgba(88,166,255,.5)', 1.6);
      c.ctx.save(); c.glow(QC.energy,26); c.ctx.fillStyle=QC.energy;
      c.ctx.beginPath(); c.ctx.arc(c.X(0),c.Y(0),9,0,7); c.ctx.fill(); c.ctx.restore();
      const [x,y,vx,vy]=S.s, r=Math.hypot(x,y);
      c.arrow(x,y,x+vx*0.40,y+vy*0.40,QC.vel,'v');
      c.arrow(x,y,x-x/(r*r*r)*0.30,y-y/(r*r*r)*0.30,QC.acc,'a');
      c.dot(x,y,6.5,QC.pos,16);
    });
    if(P.areas) c.chip(10, c.H-24, 'the two shaded wedges: equal time, equal area', QC.accent);
    c.unpad(o);
    /* ---------- divider ---------- */
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(split,0); c.ctx.lineTo(split,c.H); c.ctx.stroke(); c.ctx.restore();
    /* ---------- right: the dashboard ---------- */
    const gx = split+14, gw = c.W-gx-14;
    const [x,y,vx,vy]=S.s, r=Math.hypot(x,y), sp=Math.hypot(vx,vy);
    const PT=30, PB=c.H-150;                       // energy plot occupies y = 30 .. 150
    const o2 = c.pads(gx+34, 14, PT, PB);
    c.view(Math.max(0,S.t-16), Math.max(16,S.t), S.E0-0.5, S.E0+0.5);
    c.grid(3,2);
    c.clip(split+1, PT, c.W-split, c.H-PT-PB, ()=>{ c.path(S.Eh, QC.energy, 2.2, 8); });
    c.txt(gx+30, PT-2, S.E0.toFixed(2), QC.dim, 10, 'right');
    c.txt(gx+30, c.H-PB-13, (S.E0-0.5).toFixed(2), QC.dim, 10, 'right');
    c.unpad(o2);
    c.chip(gx, 9, 'energy E — must stay flat', QC.energy);
    /* bars */
    const by = c.H-128;
    c.bar(gx, by+16, Math.max(60,gw), 9, Math.min(1,sp/2.2), QC.vel, 'speed  |v| = '+sp.toFixed(2));
    c.bar(gx, by+56, Math.max(60,gw), 9, Math.min(1,r/(2*a)), QC.pos, 'distance  r = '+r.toFixed(2));
    const near = r < 0.92*a, far = r > 1.08*a;
    c.txt(gx, by+78, near ? 'closer than average — speeding up'
                          : (far ? 'farther than average — slowing down' : 'at average distance'),
          near?QC.vel:(far?QC.pos:QC.dim), 11.5);
    c.txt(gx, by+96, 'one lap takes '+(2*Math.PI*Math.pow(a,1.5)).toFixed(2)+' time units', QC.dim, 11);
  },
  stats(S,P){
    const [x,y,vx,vy]=S.s, r=Math.hypot(x,y);
    const E=0.5*(vx*vx+vy*vy)-1/r, L=x*vy-y*vx, drift=Math.abs(E-S.E0);
    const a=-1/(2*S.E0);
    return [['r', r.toFixed(3), QC.pos],['|v|', Math.hypot(vx,vy).toFixed(3), QC.vel],
            ['E', E.toFixed(4), QC.energy],['L', L.toFixed(4), QC.mag],
            ['E drift', drift.toExponential(1), drift<1e-6?QC.vel:QC.bad],
            ['T²/a³', ((2*Math.PI*Math.pow(a,1.5))**2/Math.pow(a,3)).toFixed(2), QC.exact]];}
};

/* --- 18. SEIR --- */
VIZ.seir = {
  title:'An epidemic is four numbers flowing into each other',
  eq:'S→E→I→R &nbsp;|&nbsp; R₀ = β/γ &nbsp;|&nbsp; peak happens when S falls to 1/R₀',
  note:'β is how fast infection spreads, γ is how fast people recover. Only their **ratio** R₀ decides whether it takes off. Push R₀ below 1 and the outbreak dies without ever peaking.',
  h:290, resetOnParam:true,
  params:[
    {k:'beta', label:'β', min:0.08, max:0.9, val:0.5, step:0.01, fmt:v=>v.toFixed(2)},
    {k:'gamma', label:'γ', min:0.03, max:0.4, val:0.1, step:0.01, fmt:v=>v.toFixed(2)}
  ],
  init(P){ return {y:[0.999,0,0.001,0], t:0, h:[]}; },
  step(S,dt,P){
    const sig=0.2, hh=0.25;
    for(let i=0;i<Math.min(14,Math.round(dt*90));i++){
      if(S.t>240){ S.y=[0.999,0,0.001,0]; S.t=0; S.h=[]; }
      const f = y => { const inf=P.beta*y[0]*y[2];
        return [-inf, inf-sig*y[1], sig*y[1]-P.gamma*y[2], P.gamma*y[2]]; };
      S.y = rk4(f, S.y, hh); S.t += hh;
      S.h.push([S.t, S.y[0], S.y[1], S.y[2], S.y[3]]);
      if(S.h.length>1200) S.h.shift();
    }
  },
  draw(c,S,P){
    c.view(0,240,0,1.02); c.grid(6,4); c.axes('days','fraction of people'); c.ticks(v=>v.toFixed(0),v=>v.toFixed(1));
    const cols=[QC.cool,QC.energy,QC.bad,QC.vel], labs=['S','E','I','R'];
    for(let k=1;k<=4;k++) c.path(S.h.map(r=>[r[0],r[k]]), cols[k-1], k===3?2.8:2, k===3?12:6);
    const R0=P.beta/P.gamma;
    c.ctx.save(); c.ctx.strokeStyle='rgba(216,222,233,.35)'; c.ctx.setLineDash([4,4]); c.ctx.beginPath();
    c.ctx.moveTo(c.pad.l,c.Y(1/R0)); c.ctx.lineTo(c.W-c.pad.r,c.Y(1/R0)); c.ctx.stroke(); c.ctx.restore();
    c.chip(c.pad.l+6, c.Y(1/R0)+6, '1/R₀ — S crosses here at the peak', QC.exact);
    c.legend([['S',QC.cool],['E',QC.energy],['I',QC.bad],['R',QC.vel]]);
    const bw=126, bx=c.W-c.pad.r-bw-6, by=c.H-c.pad.b-68;
    c.ctx.save(); c.ctx.fillStyle = R0>1? 'rgba(248,81,73,.16)':'rgba(63,185,80,.16)';
    c.ctx.strokeStyle = R0>1? 'rgba(248,81,73,.55)':'rgba(63,185,80,.55)'; c.ctx.lineWidth=1.5;
    c.ctx.beginPath(); c.ctx.roundRect(bx, by, bw, 52, 9); c.ctx.fill(); c.ctx.stroke(); c.ctx.restore();
    c.txt(bx+bw/2, by+6, 'R₀ = β/γ', '#c8d2e0', 11.5, 'center');
    c.txt(bx+bw/2, by+21, R0.toFixed(2), R0>1?QC.bad:QC.vel, 20, 'center');
    c.txt(bx+bw/2, by+58, R0>1?'above 1: it spreads':'below 1: it dies out', R0>1?QC.bad:QC.vel, 11, 'center');
  },
  stats(S,P){ const R0=P.beta/P.gamma;
    const peak=S.h.reduce((m,r)=>Math.max(m,r[3]),0);
    return [['R₀', R0.toFixed(2), R0>1?QC.bad:QC.vel],
            ['infectious now', (S.y[2]*100).toFixed(1)+'%', QC.bad],
            ['peak so far', (peak*100).toFixed(1)+'%', QC.acc],
            ['ever infected', ((S.y[3])*100).toFixed(1)+'%', QC.vel]];}
};

/* --- 19. predator-prey --- */
VIZ.predprey = {
  title:'Predator and prey chase each other round a loop',
  eq:'dx/dt = αx − βxy &nbsp;|&nbsp; dy/dt = δxy − γy',
  note:'Left is the two populations over time; right is the same motion drawn as **x against y**. The closed loop means the cycle repeats forever. The cross is the balance point where both derivatives are zero.',
  h:290, resetOnParam:true,
  params:[{k:'x0', label:'start prey', min:12, max:48, val:22, step:1, fmt:v=>v.toFixed(0)}],
  init(P){ return {y:[P.x0,10], t:0, h:[], loop:[]}; },
  step(S,dt,P){
    const a=1.0,b=0.1,d=0.075,g=1.5, hh=0.0075;
    for(let i=0;i<Math.min(28,Math.round(dt*900));i++){
      const f=y=>[a*y[0]-b*y[0]*y[1], d*y[0]*y[1]-g*y[1]];
      S.y=rk4(f,S.y,hh); S.t+=hh;
      S.h.push([S.t,S.y[0],S.y[1]]); if(S.h.length>2000) S.h.shift();
      S.loop.push([S.y[0],S.y[1]]); if(S.loop.length>2600) S.loop.shift();
      if(S.t>30){ S.t=0; S.h=[]; }
    }
  },
  draw(c,S,P){
    const split=Math.round(c.W*0.54);
    const oldR=c.pad.r; c.pad.r=c.W-split+14;
    c.view(Math.max(0,S.t-16), Math.max(16,S.t), 0, 46); c.grid(4,4); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    c.path(S.h.map(r=>[r[0],r[1]]), QC.vel, 2.4, 8);
    c.path(S.h.map(r=>[r[0],r[2]]), QC.acc, 2.4, 8);
    c.chip(c.pad.l+4, 6, 'populations over time');
    c.legend([['prey',QC.vel],['predator',QC.acc]]);
    c.pad.r=oldR;
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(split,0); c.ctx.lineTo(split,c.H); c.ctx.stroke(); c.ctx.restore();
    const oldL=c.pad.l; c.pad.l=split+40;
    c.view(0,48,0,26); c.grid(3,3); c.ticks(v=>v.toFixed(0),v=>v.toFixed(0));
    c.path(S.loop, QC.mag, 2, 8);
    const fx=1.5/0.075, fy=1.0/0.1;
    c.ctx.save(); c.ctx.strokeStyle=QC.exact; c.ctx.lineWidth=1.6; c.ctx.beginPath();
    c.ctx.moveTo(c.X(fx)-6,c.Y(fy)); c.ctx.lineTo(c.X(fx)+6,c.Y(fy));
    c.ctx.moveTo(c.X(fx),c.Y(fy)-6); c.ctx.lineTo(c.X(fx),c.Y(fy)+6); c.ctx.stroke(); c.ctx.restore();
    c.dot(S.y[0],S.y[1],5,QC.pos,12);
    c.chip(split+46, 6, 'prey → predator (phase loop)');
    c.pad.l=oldL;
  },
  stats(S){ return [['prey', S.y[0].toFixed(1), QC.vel],['predator', S.y[1].toFixed(1), QC.acc],
            ['balance point', '20.0 / 10.0', QC.exact]];}
};

/* --- 20. heat + CFL --- */
VIZ.heatcfl = {
  title:'The stability number that decides success or disaster',
  eq:'r = α·Δt/Δx² &nbsp;|&nbsp; stable only while r ≤ 0.5 in 1D',
  note:'Slide r past **0.5** and the smooth curve tears itself apart within a few steps. This is not a bug in your code — it is the method failing, and the only fix is a smaller Δt. Finding this limit yourself is the point of the project.',
  h:290, resetOnParam:true,
  params:[{k:'r', label:'r', min:0.1, max:0.75, val:0.35, step:0.01, fmt:v=>v.toFixed(2)}],
  init(){ const n=70, u=[]; for(let i=0;i<n;i++) u.push(Math.sin(Math.PI*i/(n-1))); return {u, n, k:0, blew:0}; },
  step(S,dt,P){
    for(let q=0;q<2;q++){
      const v=S.u.slice();
      for(let i=1;i<S.n-1;i++) v[i]=S.u[i]+P.r*(S.u[i+1]-2*S.u[i]+S.u[i-1]);
      v[0]=0; v[S.n-1]=0; S.u=v; S.k++;
      const mx=Math.max(...S.u.map(Math.abs));
      if(mx>6 && !S.blew) S.blew=S.k;
      if(mx>1e4 || S.k>4000){ const n=S.n, u=[];
        for(let i=0;i<n;i++) u.push(Math.sin(Math.PI*i/(n-1)));
        S.u=u; S.k=0; S.blew=0; }
    }
  },
  draw(c,S,P){
    const unstable = P.r>0.5;
    c.view(0,1,-1.35,1.35); c.grid(5,4); c.axes('position x','temperature u'); c.ticks(v=>v.toFixed(1),v=>v.toFixed(1));
    const col = S.blew? QC.bad : (unstable? QC.acc : QC.warm);
    c.path(S.u.map((v,i)=>[i/(S.n-1), Math.max(-1.3,Math.min(1.3,v))]), col, 2.6, 12);
    S.u.forEach((v,i)=>{ if(i%3===0) c.dot(i/(S.n-1), Math.max(-1.3,Math.min(1.3,v)), 2.4, col); });
    c.ctx.save(); c.ctx.fillStyle = unstable? 'rgba(248,81,73,.13)':'rgba(63,185,80,.11)';
    c.ctx.beginPath(); c.ctx.roundRect(c.W-c.pad.r-150, c.pad.t+4, 146, 40, 8); c.ctx.fill(); c.ctx.restore();
    c.txt(c.W-c.pad.r-77, c.pad.t+8, 'r = '+P.r.toFixed(2)+(unstable?'  >  0.5':'  ≤  0.5'),
          unstable?QC.bad:QC.vel, 12, 'center');
    c.txt(c.W-c.pad.r-77, c.pad.t+26, unstable? (S.blew? 'EXPLODED at step '+S.blew : 'unstable — watch it')
          : 'stable: it just fades', unstable?QC.bad:QC.vel, 11, 'center');
  },
  stats(S,P){ const mx=Math.max(...S.u.map(Math.abs));
    return [['r', P.r.toFixed(2), P.r>0.5?QC.bad:QC.vel],['step', S.k, QC.dim],
            ['max |u|', mx>1e3?mx.toExponential(1):mx.toFixed(3), mx>1.05?QC.bad:QC.warm],
            ['verdict', P.r>0.5?'unstable':'stable', P.r>0.5?QC.bad:QC.vel]];}
};

/* --- 21. advection vs diffusion --- */
VIZ.plume = {
  title:'Carried along, and spreading out',
  eq:'∂c/∂t = −v·∂c/∂x + D·∂²c/∂x² &nbsp;|&nbsp; centre = v·t, &nbsp;variance = 2D·t',
  note:'**Advection** moves the peak; **diffusion** flattens it. Set D to zero and the pulse travels without spreading. Turn v off and it spreads without going anywhere. Real rivers do both at once.',
  h:280, resetOnParam:true,
  params:[
    {k:'v', label:'flow v', min:0, max:2, val:1, step:0.05, fmt:x=>x.toFixed(2)},
    {k:'D', label:'spread D', min:0, max:1.6, val:0.5, step:0.05, fmt:x=>x.toFixed(2)}
  ],
  init(){ const n=240, c0=[]; for(let i=0;i<n;i++){ const x=i*0.25; c0.push(Math.exp(-((x-6)**2)/(2*0.55*0.55))); }
    return {c:c0, n, dx:0.25, t:0}; },
  step(S,dt,P){
    const h=0.004;
    for(let q=0;q<4;q++){
      const v=S.c.slice();
      for(let i=1;i<S.n-1;i++){
        const adv = -P.v*(S.c[i]-S.c[i-1])/S.dx;
        const dif = P.D*(S.c[i+1]-2*S.c[i]+S.c[i-1])/(S.dx*S.dx);
        v[i]=S.c[i]+h*(adv+dif);
      }
      v[0]=0; v[S.n-1]=0; S.c=v; S.t+=h;
      if(S.t>22){ const c0=[]; for(let i=0;i<S.n;i++){ const x=i*S.dx; c0.push(Math.exp(-((x-6)**2)/(2*0.55*0.55))); }
        S.c=c0; S.t=0; }
    }
  },
  draw(c,S,P){
    c.view(0,60,0,1.15); c.grid(6,4); c.axes('distance downstream (m)','concentration'); c.ticks(v=>v.toFixed(0),v=>v.toFixed(1));
    c.ctx.save(); c.ctx.fillStyle='rgba(57,208,216,.07)';
    c.ctx.fillRect(c.pad.l, c.pad.t, c.W-c.pad.l-c.pad.r, c.H-c.pad.t-c.pad.b); c.ctx.restore();
    const pts=S.c.map((v,i)=>[i*S.dx, v]);
    c.ctx.save(); c.ctx.beginPath(); c.ctx.moveTo(c.X(0),c.Y(0));
    pts.forEach(p=>c.ctx.lineTo(c.X(p[0]),c.Y(p[1]))); c.ctx.lineTo(c.X(60),c.Y(0)); c.ctx.closePath();
    const g=c.ctx.createLinearGradient(0,c.pad.t,0,c.H-c.pad.b);
    g.addColorStop(0,'rgba(240,136,62,.5)'); g.addColorStop(1,'rgba(240,136,62,.02)');
    c.ctx.fillStyle=g; c.ctx.fill(); c.ctx.restore();
    c.path(pts, QC.warm, 2.4, 10);
    const tot=S.c.reduce((a,b)=>a+b,0)||1;
    const mean=S.c.reduce((a,v,i)=>a+v*i*S.dx,0)/tot;
    c.ctx.save(); c.ctx.strokeStyle=QC.accent; c.ctx.setLineDash([4,3]); c.ctx.lineWidth=1.6;
    c.ctx.beginPath(); c.ctx.moveTo(c.X(mean),c.pad.t); c.ctx.lineTo(c.X(mean),c.H-c.pad.b); c.ctx.stroke(); c.ctx.restore();
    c.txt(c.X(mean)+5, c.pad.t+2, 'centre', QC.accent, 11);
    c.txt(c.pad.l+4, c.pad.t+2, 'exact centre = 6 + v·t = '+(6+P.v*S.t).toFixed(1)+' m', QC.exact, 11);
  },
  stats(S,P){
    const tot=S.c.reduce((a,b)=>a+b,0)||1;
    const mean=S.c.reduce((a,v,i)=>a+v*i*S.dx,0)/tot;
    const varr=S.c.reduce((a,v,i)=>a+v*(i*S.dx-mean)**2,0)/tot;
    return [['t', S.t.toFixed(1)+' s', QC.dim],['centre', mean.toFixed(2)+' m', QC.accent],
            ['exact', (6+P.v*S.t).toFixed(2)+' m', QC.exact],
            ['spread σ', Math.sqrt(Math.max(0,varr)).toFixed(2)+' m', QC.warm]];}
};

/* --- 22. wave + reflection --- */
VIZ.wave = {
  title:'A pulse travels, and bounces where the speed changes',
  eq:'∂²p/∂t² = c²·∂²p/∂x² &nbsp;|&nbsp; gap between arrivals Δt = 2·(d − xₛ)/c',
  note:'Unlike heat, a wave keeps its shape as it travels. At the purple boundary the speed changes and part of the pulse **reflects**. The lower trace is what a sensor at the surface records: the pulse leaving, then silence, then the echo coming back. Move the boundary and the echo arrives at a different time — that time is how you measure a depth you cannot see.',
  h:300, resetOnParam:true,
  params:[{k:'bx', label:'boundary d', unit:'m', min:55, max:150, val:95, step:1, fmt:v=>v.toFixed(0)}],
  N:300, L:200, C1:1.0, C2:1.8, XS:25,
  init(P){
    const W=VIZ.wave, n=W.N, dx=W.L/n, dt=0.45*dx/W.C2;
    return {p:new Float64Array(n), q:new Float64Array(n), n, dx, dt, k:0,
            T: 2*(P.bx-W.XS)/W.C1 + 90, trace:[], arrivals:[]};
  },
  step(S,dt,P){
    const W=VIZ.wave, n=S.n, dxx=S.dx, h=S.dt, f=0.075, t0=1.4/f;
    const bi=Math.round(P.bx/W.L*n), src=Math.round(W.XS/W.L*n);
    const kL=(W.C1*h-dxx)/(W.C1*h+dxx), kR=(W.C2*h-dxx)/(W.C2*h+dxx);
    for(let rep=0; rep<Math.min(12, Math.max(1, Math.round(dt*420))); rep++){
      const t=S.k*h, np=new Float64Array(n);
      for(let i=1;i<n-1;i++){ const cc=(i<bi?W.C1:W.C2)*h/dxx;
        np[i]=2*S.p[i]-S.q[i]+cc*cc*(S.p[i+1]-2*S.p[i]+S.p[i-1]); }
      np[0]   = S.p[1]   + kL*(np[1]   - S.p[0]);      // Mur absorbing ends:
      np[n-1] = S.p[n-2] + kR*(np[n-2] - S.p[n-1]);    // nothing bounces off the edges
      if(t<2*t0){ const a=Math.PI*Math.PI*f*f*(t-t0)*(t-t0);
        np[src] += (1-2*a)*Math.exp(-a)*0.045; }
      S.q=S.p; S.p=np; S.k++;
      S.trace.push([t, np[src]]);
      if(S.k*h > S.T){ Object.assign(S, VIZ.wave.init(P)); break; }
    }
  },
  draw(c,S,P){
    const W=VIZ.wave, split=Math.round(c.H*0.60), src=Math.round(W.XS/W.N*W.L);
    /* ---- top: the wave in space ---- */
    const o = c.pads(null, null, null, c.H-split);
    c.view(0, W.L, -1.15, 1.15); c.grid(5,3); c.ticks(false, v=>v.toFixed(1));
    c.clip(0, 0, c.W, split, ()=>{
      c.ctx.fillStyle='rgba(188,140,255,.09)';
      c.ctx.fillRect(c.X(P.bx), c.pad.t, c.W-c.pad.r-c.X(P.bx), split-c.pad.t);
      c.ctx.save(); c.ctx.strokeStyle=QC.mag; c.ctx.lineWidth=2; c.glow(QC.mag,8);
      c.ctx.beginPath(); c.ctx.moveTo(c.X(P.bx),c.pad.t); c.ctx.lineTo(c.X(P.bx),split-8); c.ctx.stroke(); c.ctx.restore();
      c.path([...S.p].map((v,i)=>[i*W.L/S.n, Math.max(-1.1,Math.min(1.1,v))]), QC.accent, 2.2, 12);
    });
    c.chip(c.X(P.bx)+7, c.pad.t+4, 'faster rock →  d = '+P.bx.toFixed(0)+' m', QC.mag);
    c.chip(c.pad.l+4, c.pad.t+4, 'the wave in the ground');
    c.dot(src, 0, 4.5, QC.energy, 12);
    c.chip(c.X(src)-14, c.Y(0)-26, 'sensor', QC.energy);
    c.unpad(o);
    /* ---- divider ---- */
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(0,split); c.ctx.lineTo(c.W,split); c.ctx.stroke(); c.ctx.restore();
    /* ---- bottom: what the sensor records ---- */
    const o2 = c.pads(null, null, split+30, 26);
    c.view(0, S.T, -1.15, 1.15); c.ticks(v=>v.toFixed(0), v=>v.toFixed(1));
    c.clip(0, split+1, c.W, c.H-split-1, ()=>{
      c.ctx.save(); c.ctx.strokeStyle='rgba(170,190,215,.3)'; c.ctx.beginPath();
      c.ctx.moveTo(c.pad.l,c.Y(0)); c.ctx.lineTo(c.W-c.pad.r,c.Y(0)); c.ctx.stroke(); c.ctx.restore();
      c.path(S.trace, QC.vel, 1.8, 8);
      const te = 2*(P.bx-W.XS)/W.C1 + 25;
      c.ctx.save(); c.ctx.strokeStyle='rgba(227,179,65,.55)'; c.ctx.setLineDash([4,4]);
      c.ctx.beginPath(); c.ctx.moveTo(c.X(te), split+30); c.ctx.lineTo(c.X(te), c.H-26); c.ctx.stroke(); c.ctx.restore();
      c.chip(Math.min(c.X(te)+5, c.W-150), split+36, 'echo expected here', QC.energy);
    });
    c.chip(c.pad.l+4, split+9, 'what the sensor records — time →');
    c.unpad(o2);
  },
  stats(S,P){
    const W=VIZ.wave, t=S.k*S.dt, dtEcho=2*(P.bx-W.XS)/W.C1;
    return [['boundary d', P.bx.toFixed(0)+' m', QC.mag],
            ['sensor at', W.XS+' m', QC.energy],
            ['time now', t.toFixed(0), QC.dim],
            ['Δt to echo', dtEcho.toFixed(0), QC.vel],
            ['d from Δt', (W.XS + W.C1*dtEcho/2).toFixed(0)+' m', QC.accent]];}
};

/* --- 23. gaussian elimination --- */
VIZ.gauss = {
  title:'Elimination turns a matrix into a staircase',
  eq:'row_r ← row_r − (a_rc / a_cc)·row_c',
  note:'Press **Step**. Each press clears one entry below the diagonal. Once everything below is zero you can read the answer straight off from the bottom up — that is all "solving a system" means.',
  h:270, autoplay:false, stepBtn:true,
  init(){ return {M:[[2,1,-1,8],[-3,-1,2,-11],[-2,1,2,-3]], i:0, j:0, done:false, last:null}; },
  stepOnce(S){
    const M=S.M, n=3;
    for(let cc=0;cc<n;cc++) for(let r=cc+1;r<n;r++){
      if(Math.abs(M[r][cc])<1e-9) continue;
      const f=M[r][cc]/M[cc][cc];
      for(let k=cc;k<n+1;k++) M[r][k]-=f*M[cc][k];
      S.last=[r,cc,f]; return;
    }
    S.done=true;
  },
  draw(c,S){
    const n=3, cols=4, cw=Math.min(84,(c.W-60)/cols), ch=46;
    const ox=(c.W-cw*cols-16)/2, oy=28;
    for(let r=0;r<n;r++) for(let k=0;k<cols;k++){
      const v=S.M[r][k], zero=Math.abs(v)<1e-9;
      const below = k<n && r>k;
      const X=ox+k*cw+(k===3?16:0), Y=oy+r*ch;
      c.ctx.save();
      c.ctx.fillStyle = (below&&zero)? 'rgba(63,185,80,.16)' : (below? 'rgba(248,81,73,.13)':'rgba(88,166,255,.11)');
      if(S.last && S.last[0]===r) c.ctx.fillStyle='rgba(227,179,65,.2)';
      c.ctx.strokeStyle='rgba(140,160,190,.3)';
      c.ctx.beginPath(); c.ctx.roundRect(X,Y,cw-6,ch-6,7); c.ctx.fill(); c.ctx.stroke(); c.ctx.restore();
      c.txt(X+(cw-6)/2, Y+(ch-6)/2-8, (Math.abs(v)<1e-9?0:v).toFixed(2),
            (below&&zero)?QC.vel:(below?QC.bad:QC.pos), 14, 'center');
    }
    c.txt(ox+cw*3+8, 6, 'answer', QC.dim, 11);
    c.txt(ox, 6, 'coefficients (below the diagonal must become 0)', QC.dim, 11);
    c.txt(c.W/2, oy+n*ch+6, S.done? 'Done — now read the answer bottom-up'
      : (S.last? `row ${S.last[0]+1} ← row ${S.last[0]+1} − ${S.last[2].toFixed(2)} × row ${S.last[1]+1}`
               : 'press Step'), S.done?QC.vel:QC.energy, 12, 'center');
  },
  stats(S){ let z=0; for(let r=1;r<3;r++) for(let k=0;k<r;k++) if(Math.abs(S.M[r][k])<1e-9) z++;
    return [['zeros below diagonal', z+' of 3', z===3?QC.vel:QC.acc],
            ['status', S.done?'solved':'eliminating', S.done?QC.vel:QC.energy]];}
};

/* --- 24. power iteration / centrality --- */
VIZ.power = {
  title:'Importance spreads until it settles',
  eq:'v ← A·v, then rescale &nbsp;→&nbsp; the dominant eigenvector',
  note:'Every node hands its score to its neighbours, over and over. The scores stop changing — that settled pattern **is** the eigenvector, and it ranks nodes by how well-connected their connections are.',
  h:280, autoplay:false, stepBtn:true,
  init(){
    const A=[[0,1,1,0,0],[1,0,1,0,0],[1,1,0,1,0],[0,0,1,0,1],[0,0,0,1,0]];
    const pos=[[.22,.26],[.22,.74],[.5,.5],[.76,.32],[.9,.74]];
    return {A, pos, v:[1,1,1,1,1], k:0, prev:null};
  },
  stepOnce(S){
    S.prev=S.v.slice();
    const n=5, nv=new Array(n).fill(0);
    for(let i=0;i<n;i++) for(let j=0;j<n;j++) nv[i]+=S.A[i][j]*S.v[j];
    const m=Math.max(...nv); S.v=nv.map(x=>x/m); S.k++;
  },
  draw(c,S){
    const names=['A','B','C','D','E'];
    const X=f=>40+f*(c.W-90), Y=f=>24+f*(c.H-80);
    c.ctx.save(); c.ctx.strokeStyle='rgba(140,160,190,.35)'; c.ctx.lineWidth=1.6;
    for(let i=0;i<5;i++) for(let j=i+1;j<5;j++) if(S.A[i][j]){
      c.ctx.beginPath(); c.ctx.moveTo(X(S.pos[i][0]),Y(S.pos[i][1]));
      c.ctx.lineTo(X(S.pos[j][0]),Y(S.pos[j][1])); c.ctx.stroke(); }
    c.ctx.restore();
    S.v.forEach((v,i)=>{
      const r=9+v*22;
      c.sdot(X(S.pos[i][0]), Y(S.pos[i][1]), r, QC.accent, 14);
      c.txt(X(S.pos[i][0]), Y(S.pos[i][1])-6, names[i], '#061018', 13, 'center');
      c.txt(X(S.pos[i][0]), Y(S.pos[i][1])+r+4, v.toFixed(3), QC.dim, 11, 'center');
    });
    const delta = S.prev? Math.max(...S.v.map((v,i)=>Math.abs(v-S.prev[i]))) : 1;
    c.txt(c.W/2, c.H-22, S.k===0? 'press Step — all scores start equal'
      : (delta<1e-4? 'settled: this is the eigenvector' : `iteration ${S.k}, biggest change ${delta.toFixed(4)}`),
      delta<1e-4?QC.vel:QC.energy, 12, 'center');
  },
  stats(S){ const d=S.prev? Math.max(...S.v.map((v,i)=>Math.abs(v-S.prev[i]))) : 1;
    const best='ABCDE'[S.v.indexOf(Math.max(...S.v))];
    return [['iteration', S.k, QC.dim],['most central', best, QC.accent],
            ['change', d<1? d.toFixed(5):'—', d<1e-4?QC.vel:QC.acc]];}
};

/* --- 25. rocket: thrust, drag, gravity, and a mass that shrinks --- */
VIZ.rocket = {
  title:'A rocket speeds up because it is throwing itself away',
  eq:'a = (T − m·g − D) / m &nbsp;|&nbsp; m(t) = m₀ − ṁ·t &nbsp;|&nbsp; Δv = vₑ·ln(m₀/m₁)',
  note:'Thrust T is **constant** the whole way up, yet the rocket accelerates harder and harder. Nothing is pushing more — the mass m in the bottom of a = F/m is shrinking as fuel burns. Watch the orange mass bar drain while the green acceleration bar grows, then the moment burnout hits and gravity takes over.',
  h:330,
  params:[
    {k:'ve', label:'exhaust vₑ', unit:'m/s', min:1800, max:3200, val:2400, step:50, fmt:v=>v.toFixed(0)},
    {k:'mdot', label:'burn rate ṁ', unit:'kg/s', min:8, max:30, val:15, step:1, fmt:v=>v.toFixed(1)},
    {k:'dry', label:'dry mass', unit:'kg', min:100, max:400, val:150, step:10, fmt:v=>v.toFixed(0)}
  ],
  M0: 900,                                  // full mass at lift-off, kg
  init(P){ return {y:0, v:0, t:0, m:VIZ.rocket.M0, hist:[], burntOut:false, vmax:0, apogee:0}; },
  step(S,dt,P){
    const R=VIZ.rocket, h=0.02, g=9.8, k=0.12;
    for(let i=0;i<Math.min(12, Math.max(1, Math.round(dt*300))); i++){
      const burning = S.m > P.dry;
      const T = burning ? P.mdot*P.ve : 0;
      if(burning && !S.burntOut) S.m = Math.max(P.dry, S.m - P.mdot*h); else S.burntOut = true;
      const D = k*Math.exp(-S.y/8500)*S.v*Math.abs(S.v);   // air thins with height
      const a = (T - S.m*g - D)/S.m;
      S.v += a*h; S.y += S.v*h; S.t += h;
      S.vmax = Math.max(S.vmax, S.v); S.apogee = Math.max(S.apogee, S.y);
      S.hist.push([S.t, S.v, a]); if(S.hist.length>1400) S.hist.shift();
      if((S.y < 0 && S.t > 1) || S.t > (R.M0-P.dry)/P.mdot + 110){ Object.assign(S, VIZ.rocket.init(P)); break; }
    }
  },
  draw(c,S,P){
    const R=VIZ.rocket, split=Math.round(c.W*0.34), g=9.8;
    const burning = S.m > P.dry + 1e-6;
    const T = burning ? P.mdot*P.ve : 0, D = 0.12*Math.exp(-S.y/8500)*S.v*Math.abs(S.v);
    const a = (T - S.m*g - D)/S.m;
    /* ---- left: the rocket ---- */
    c.clip(0,0,split,c.H, ()=>{
      const top = Math.max(2000, S.apogee*1.1);
      const rx = split*0.52, ry = c.H-28 - Math.min(1, S.y/top)*(c.H-80);
      /* ground */
      c.ctx.save(); c.ctx.strokeStyle='rgba(63,185,80,.5)'; c.ctx.lineWidth=2;
      c.ctx.beginPath(); c.ctx.moveTo(8,c.H-24); c.ctx.lineTo(split-8,c.H-24); c.ctx.stroke(); c.ctx.restore();
      /* flame */
      if(burning){ const f=10+Math.random()*16;
        c.ctx.save(); c.ctx.shadowColor=QC.warm; c.ctx.shadowBlur=18;
        const gr=c.ctx.createLinearGradient(rx, ry+12, rx, ry+12+f);
        gr.addColorStop(0,'rgba(255,220,120,.95)'); gr.addColorStop(1,'rgba(255,90,40,0)');
        c.ctx.fillStyle=gr; c.ctx.beginPath(); c.ctx.moveTo(rx-6, ry+12);
        c.ctx.lineTo(rx, ry+12+f); c.ctx.lineTo(rx+6, ry+12); c.ctx.closePath(); c.ctx.fill(); c.ctx.restore(); }
      /* body */
      c.ctx.save(); c.ctx.shadowColor=QC.pos; c.ctx.shadowBlur=10; c.ctx.fillStyle='#cfe0f5';
      c.ctx.beginPath(); c.ctx.moveTo(rx, ry-18); c.ctx.lineTo(rx+6, ry-4);
      c.ctx.lineTo(rx+6, ry+12); c.ctx.lineTo(rx-6, ry+12); c.ctx.lineTo(rx-6, ry-4);
      c.ctx.closePath(); c.ctx.fill(); c.ctx.restore();
      /* fuel left, drawn inside the body */
      const frac = Math.max(0,(S.m-P.dry)/(R.M0-P.dry));
      c.ctx.fillStyle='rgba(240,136,62,.85)'; c.ctx.fillRect(rx-5, ry+12-16*frac, 10, 16*frac);
      /* force arrows — all three scaled against the biggest force on screen */
      const biggest = Math.max(T, S.m*g, D, 1), sc = 56/biggest;
      const A=(mag,dir,col,lab,off)=>{ const len=Math.max(14, mag*sc); if(mag<1) return;
        c.ctx.save(); c.ctx.shadowColor=col; c.ctx.shadowBlur=8; c.ctx.strokeStyle=col; c.ctx.fillStyle=col;
        c.ctx.lineWidth=2.6; const x=rx+30+off, y0=ry, y1=ry-dir*len;
        c.ctx.beginPath(); c.ctx.moveTo(x,y0); c.ctx.lineTo(x, y1+dir*7); c.ctx.stroke();
        c.ctx.beginPath(); c.ctx.moveTo(x,y1); c.ctx.lineTo(x-5,y1+dir*9); c.ctx.lineTo(x+5,y1+dir*9);
        c.ctx.closePath(); c.ctx.fill(); c.ctx.shadowBlur=0;
        c.ctx.font='bold 10.5px ui-monospace,monospace'; c.ctx.textAlign='left';
        c.ctx.fillText(lab, x+7, y1 + dir*2); c.ctx.restore(); };
      A(T, 1, QC.vel, 'T', 0);
      A(S.m*g, -1, QC.acc, 'm·g', 26);
      A(D, -Math.sign(S.v)||1, QC.bad, 'drag', 50);
    });
    c.chip(10, 6, burning? 'burning — mass falling' : 'burnout — coasting', burning?QC.warm:QC.dim);
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(split,0); c.ctx.lineTo(split,c.H); c.ctx.stroke(); c.ctx.restore();
    /* ---- middle: speed and acceleration over time ---- */
    const o = c.pads(split+44, 176, 26, 34);
    c.view(0, Math.max(14, S.t), Math.min(-20, -Math.abs(a)*1.2), Math.max(26, S.vmax*0.22, a*1.25));
    c.grid(4,3); c.ticks(v=>v.toFixed(0), v=>v.toFixed(0));
    c.clip(split+1, 0, c.W-split-176, c.H, ()=>{
      c.ctx.save(); c.ctx.strokeStyle='rgba(170,190,215,.3)'; c.ctx.beginPath();
      c.ctx.moveTo(c.pad.l,c.Y(0)); c.ctx.lineTo(c.W-c.pad.r,c.Y(0)); c.ctx.stroke(); c.ctx.restore();
      c.path(S.hist.map(r=>[r[0], r[2]]), QC.vel, 2.4, 10);                 // acceleration
      c.path(S.hist.map(r=>[r[0], r[1]*0.2]), QC.pos, 2, 8);                // speed, scaled to fit
    });
    c.chip(split+48, 6, 'acceleration a (m/s²), and speed ÷5', QC.vel);
    c.unpad(o);
    /* ---- right: the bars ---- */
    const bx = c.W-166, bw = 150;
    c.bar(bx, 40, bw, 9, Math.max(0,(S.m-P.dry)/(VIZ.rocket.M0-P.dry)), QC.acc, 'fuel left');
    c.bar(bx, 82, bw, 9, Math.min(1, S.m/VIZ.rocket.M0), QC.exact, 'mass m = '+S.m.toFixed(0)+' kg');
    c.bar(bx, 124, bw, 9, Math.min(1, Math.abs(a)/60), a>0?QC.vel:QC.bad, (a>0?'speeding up  a = ':'slowing  a = ')+a.toFixed(1));
    c.bar(bx, 166, bw, 9, Math.min(1, S.y/Math.max(2000,S.apogee*1.1)), QC.pos, 'height = '+(S.y/1000).toFixed(1)+' km');
    const dv = P.ve*Math.log(VIZ.rocket.M0/P.dry);
    c.txt(bx, 196, 'Tsiolkovsky says', QC.dim, 11);
    c.txt(bx, 212, 'Δv = '+dv.toFixed(0)+' m/s', QC.accent, 14);
    c.txt(bx, 231, 'with no gravity,', QC.dim, 10.5);
    c.txt(bx, 244, 'and no air', QC.dim, 10.5);
    c.txt(bx, 262, 'really got: '+S.vmax.toFixed(0)+' m/s', QC.vel, 11.5);
  },
  stats(S,P){
    const burning = S.m > P.dry + 1e-6, g=9.8;
    const T = burning ? P.mdot*P.ve : 0, D=0.12*Math.exp(-S.y/8500)*S.v*Math.abs(S.v);
    const a=(T - S.m*g - D)/S.m;
    const dv = P.ve*Math.log(VIZ.rocket.M0/P.dry);
    return [['mass m', S.m.toFixed(0)+' kg', QC.exact],
            ['a = F/m', a.toFixed(1)+' m/s²', a>0?QC.vel:QC.bad],
            ['speed', S.v.toFixed(0)+' m/s', QC.pos],
            ['height', (S.y/1000).toFixed(1)+' km', QC.pos],
            ['ideal Δv', dv.toFixed(0)+' m/s', QC.accent],
            ['thrust T', (T/1000).toFixed(1)+' kN', burning?QC.vel:QC.dim]];}
};

/* --- 26. energy bars: a pendulum trading one kind of energy for another --- */
VIZ.energybars = {
  title:'Energy is not created, only swapped',
  eq:'KE = ½mL²θ̇² &nbsp;|&nbsp; PE = mgL(1 − cosθ) &nbsp;|&nbsp; KE + PE = constant',
  note:'Watch the two bars trade. At the bottom of the swing the bob is fastest: all **kinetic**, no height. At the top it stops dead: all **potential**, no speed. The white total bar never moves — that is energy conservation, and it is the one thing your simulation must reproduce.',
  h:310,
  params:[{k:'a0', label:'start angle', unit:'°', min:10, max:170, val:75, step:5, fmt:v=>v.toFixed(0)}],
  G:9.8, L:1.0, M:1.0,
  init(P){ return {th:P.a0*Math.PI/180, w:0, t:0, hist:[]}; },
  step(S,dt,P){
    const E=VIZ.energybars, h=0.004;
    const f = y => [y[1], -(E.G/E.L)*Math.sin(y[0])];
    for(let i=0;i<Math.min(26, Math.max(1,Math.round(dt*560))); i++){
      const r = rk4(f, [S.th, S.w], h); S.th=r[0]; S.w=r[1]; S.t+=h;
      const ke = 0.5*E.M*E.L*E.L*S.w*S.w, pe = E.M*E.G*E.L*(1-Math.cos(S.th));
      S.hist.push([S.t, ke, pe]); if(S.hist.length>900) S.hist.shift();
    }
  },
  draw(c,S,P){
    const E=VIZ.energybars, split=Math.round(c.W*0.40);
    const ke = 0.5*E.M*E.L*E.L*S.w*S.w, pe = E.M*E.G*E.L*(1-Math.cos(S.th)), tot = ke+pe;
    const E0 = E.M*E.G*E.L*(1-Math.cos(P.a0*Math.PI/180));
    /* ---- left: the pendulum ---- */
    c.clip(0,0,split,c.H, ()=>{
      const px=split/2, py=34, len=c.H-120;
      const bx=px+Math.sin(S.th)*len, by=py+Math.cos(S.th)*len;
      /* height reference line */
      c.ctx.save(); c.ctx.strokeStyle='rgba(227,179,65,.35)'; c.ctx.setLineDash([4,4]);
      c.ctx.beginPath(); c.ctx.moveTo(10, py+len); c.ctx.lineTo(split-10, py+len); c.ctx.stroke(); c.ctx.restore();
      c.chip(12, py+len+6, 'lowest point — PE = 0', QC.energy);
      /* rod */
      c.ctx.save(); c.ctx.strokeStyle='rgba(170,190,215,.55)'; c.ctx.lineWidth=2;
      c.ctx.beginPath(); c.ctx.moveTo(px,py); c.ctx.lineTo(bx,by); c.ctx.stroke(); c.ctx.restore();
      c.sdot(px,py,4,'#8b96a8');
      /* velocity arrow, tangent to the swing */
      const vx=Math.cos(S.th)*S.w*len*0.16, vy=-Math.sin(S.th)*S.w*len*0.16;
      if(Math.hypot(vx,vy)>4){
        c.ctx.save(); c.ctx.shadowColor=QC.vel; c.ctx.shadowBlur=8; c.ctx.strokeStyle=QC.vel;
        c.ctx.fillStyle=QC.vel; c.ctx.lineWidth=2.4;
        c.ctx.beginPath(); c.ctx.moveTo(bx,by); c.ctx.lineTo(bx+vx,by+vy); c.ctx.stroke();
        const L2=Math.hypot(vx,vy), ux=vx/L2, uy=vy/L2;
        c.ctx.beginPath(); c.ctx.moveTo(bx+vx,by+vy);
        c.ctx.lineTo(bx+vx-ux*8-uy*4, by+vy-uy*8+ux*4);
        c.ctx.lineTo(bx+vx-ux*8+uy*4, by+vy-uy*8-ux*4); c.ctx.closePath(); c.ctx.fill(); c.ctx.restore();
      }
      c.sdot(bx,by,12,QC.pos,16);
    });
    c.chip(10, 6, 'the pendulum');
    c.ctx.save(); c.ctx.strokeStyle='rgba(120,140,170,.25)'; c.ctx.beginPath();
    c.ctx.moveTo(split,0); c.ctx.lineTo(split,c.H); c.ctx.stroke(); c.ctx.restore();
    /* ---- right: the bars ---- */
    const bx2=split+20, bw=Math.max(80, c.W-split-150);
    c.bar(bx2, 46, bw, 16, ke/Math.max(E0,1e-6), QC.vel,  'KINETIC  ½mL²θ̇²   = '+ke.toFixed(2)+' J');
    c.bar(bx2, 104, bw, 16, pe/Math.max(E0,1e-6), QC.pos, 'POTENTIAL  mgL(1−cosθ) = '+pe.toFixed(2)+' J');
    c.bar(bx2, 162, bw, 16, tot/Math.max(E0,1e-6), QC.exact, 'TOTAL — never moves = '+tot.toFixed(2)+' J');
    c.chip(split+20, 10, 'energy, as a share of the energy you started with');
    /* the swap, over time */
    const o = c.pads(bx2, 14, 206, 26);
    c.view(Math.max(0,S.t-6), Math.max(6,S.t), 0, E0*1.12); c.grid(3,2);
    c.clip(split+1, 200, c.W-split, c.H-200, ()=>{
      c.path(S.hist.map(r=>[r[0],r[1]]), QC.vel, 1.8, 6);
      c.path(S.hist.map(r=>[r[0],r[2]]), QC.pos, 1.8, 6);
      c.path(S.hist.map(r=>[r[0],r[1]+r[2]]), QC.exact, 2, 6);
    });
    c.unpad(o);
  },
  stats(S,P){
    const E=VIZ.energybars;
    const ke=0.5*E.M*E.L*E.L*S.w*S.w, pe=E.M*E.G*E.L*(1-Math.cos(S.th)), tot=ke+pe;
    const E0=E.M*E.G*E.L*(1-Math.cos(P.a0*Math.PI/180));
    return [['kinetic', ke.toFixed(3)+' J', QC.vel],['potential', pe.toFixed(3)+' J', QC.pos],
            ['total', tot.toFixed(3)+' J', QC.exact],
            ['drift from start', (tot-E0).toExponential(1), Math.abs(tot-E0)<1e-5?QC.vel:QC.bad],
            ['speed', (Math.abs(S.w)*E.L).toFixed(2)+' m/s', QC.vel]];}
};


/* =========================================================
   SMALL HELPERS
   ========================================================= */

export { QC, VIZ, makeCtx, buildViz, rk4, fmtN, ESC, ESCA, fmt, plain };
