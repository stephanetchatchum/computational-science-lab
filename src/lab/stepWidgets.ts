/**
 * Step visuals: small instruments that show what the code in one build step does.
 * Same canvas engine and spec format as the original widgets. All maths runs live in the browser;
 * synthetic data is labelled as synthetic on screen.
 */
import { VIZ, QC, fmtN, rk4, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const mono = (c: VizCtx, x: number, y: number, t: string, col = '#c8d2e0', size = 12, align: CanvasTextAlign = 'left') => c.txt(x, y, t, col, size, align);

/* ---------- 3D helpers (simple perspective camera that orbits) ---------- */
function cam(c: VizCtx, az: number, el: number, dist: number) {
  const ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el), f = Math.min(c.W, c.H) * 1.1;
  return (x: number, y: number, z: number): [number, number, number] => {
    const xr = ca * x - sa * z, zr = sa * x + ca * z;          // yaw
    const yr = ce * y - se * zr, zz = se * y + ce * zr + dist;  // pitch
    return [c.W / 2 + (f * xr) / zz, c.H / 2 - (f * yr) / zz, zz];
  };
}
function groundGrid(c: VizCtx, P: ReturnType<typeof cam>, half: number, n: number, y = 0) {
  const ctx = c.ctx; ctx.save(); ctx.strokeStyle = 'rgba(120,140,170,.22)'; ctx.lineWidth = 1;
  for (let i = -n; i <= n; i++) {
    const t = (i / n) * half; let a = P(t, y, -half), b = P(t, y, half);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    a = P(-half, y, t); b = P(half, y, t); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  ctx.restore();
}
const orbitPointer = (S: any, _P: any, c: VizCtx, sx: number, sy: number, type: string) => {
  if (type === 'down') { S.drag = [sx, sy, S.az, S.el]; return; }
  if (!S.drag) return; S.az = S.drag[2] + (sx - S.drag[0]) / 120; S.el = Math.max(0.05, Math.min(1.3, S.drag[3] + (sy - S.drag[1]) / 160)); void c;
};

/* ---------- empty windows (what the templates open) ---------- */
VIZ.win2d = { ...STEP,
  title: 'The pygame template window', eq: 'screen 1000 × 600 px &nbsp;|&nbsp; (0, 0) = top-left, y grows downward',
  note: 'This is what the template opens.', h: 260, autoplay: false,
  init() { return {}; },
  draw(c: VizCtx) {
    const ctx = c.ctx, w = Math.min(c.W - 40, 520), h = w * 0.6, x0 = (c.W - w) / 2, y0 = 18;
    ctx.save(); ctx.fillStyle = '#2a3140'; ctx.fillRect(x0, y0, w, 18); ctx.fillStyle = 'rgb(15,20,30)'; ctx.fillRect(x0, y0 + 18, w, h);
    ctx.strokeStyle = '#3a4456'; ctx.strokeRect(x0, y0, w, h + 18); ctx.restore();
    mono(c, x0 + 8, y0 + 3, 'My Simulation', '#c8d2e0', 11);
    c.sdot(x0 + w / 2, y0 + 18 + h / 2, 7, 'rgb(80,200,160)', 8);
    mono(c, x0 + 20, y0 + 30, 'It works!', '#e6e6e6', 13);
    const ax = x0 - 4, ay = y0 + 18; ctx.save(); ctx.strokeStyle = QC.energy; ctx.fillStyle = QC.energy; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 60, ay); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + 50); ctx.stroke(); ctx.restore();
    mono(c, ax + 64, ay - 14, 'x →', QC.energy, 11); mono(c, ax - 22, ay + 44, 'y ↓', QC.energy, 11);
    mono(c, x0 + w / 2 + 12, y0 + 18 + h / 2 - 6, '(500, 300)', QC.dim, 11);
  },
};

VIZ.win3d = { ...STEP,
  title: 'The Ursina template scene', eq: 'y is UP &nbsp;|&nbsp; ball.y = 1 + 0.5·t &nbsp;|&nbsp; drag = orbit camera',
  note: 'Drag to orbit.', h: 300, pointer: orbitPointer,
  init() { return { t: 0, az: 0.6, el: 0.35 }; },
  step(S: any, dt: number) { S.t += dt; if (S.t > 8) S.t = 0; },
  draw(c: VizCtx, S: any) {
    const P = cam(c, S.az, S.el, 26); groundGrid(c, P, 10, 10);
    const y = 1 + 0.5 * S.t, b = P(0, y, 0), g = P(0, 0, 0);
    c.ctx.save(); c.ctx.setLineDash([3, 4]); c.ctx.strokeStyle = 'rgba(88,166,255,.5)'; c.ctx.beginPath(); c.ctx.moveTo(g[0], g[1]); c.ctx.lineTo(b[0], b[1]); c.ctx.stroke(); c.ctx.restore();
    c.sdot(b[0], b[1], Math.max(4, 260 / b[2]), QC.pos, 16);
    const yA = P(0, 4, 0), xA = P(4, 0, 0), zA = P(0, 0, 4), o = P(0, 0, 0);
    ([[xA, 'x', QC.bad], [yA, 'y (up)', QC.vel], [zA, 'z', QC.pos]] as [number[], string, string][]).forEach(([p, l, col]) => {
      c.ctx.save(); c.ctx.strokeStyle = col; c.ctx.lineWidth = 2; c.ctx.beginPath(); c.ctx.moveTo(o[0], o[1]); c.ctx.lineTo(p[0], p[1]); c.ctx.stroke(); c.ctx.restore(); mono(c, p[0] + 4, p[1] - 6, l, col, 11);
    });
    mono(c, 12, 10, `y = ${y.toFixed(2)} m    t = ${S.t.toFixed(2)} s`, '#e7edf6', 12);
  },
  stats(S: any) { return [['ball height y', (1 + 0.5 * S.t).toFixed(2) + ' m', QC.pos], ['time t', S.t.toFixed(2) + ' s', QC.dim]]; },
};

/* ---------- s0p1 ---------- */
const CASES: [number, number][] = [[44.64, 0.72], [15.5, 0.2236], [212.0, 0.54], [-40.0, 1.8], [1234.5, 38.0], [7.34, 0.96], [5.123, 0]];
export function roundMeasurement(v: number, u: number): [number, number, number] {
  if (u === 0) return [v, 0, NaN];
  const t = u.toExponential(0); const e = parseInt(t.split('e')[1], 10); const d = -e;
  const p = Math.pow(10, d); return [Math.round(v * p) / p, parseFloat(t), d];
}
VIZ.rounding = { ...STEP,
  title: 'Round the uncertainty to one figure, then the value to the same place', eq: 'round(σ, 1 s.f.) → decimal place d → round(value, d)',
  note: 'Press Step to walk through the seven test cases.', h: 230, autoplay: false, stepBtn: true,
  params: [{ k: 'v', label: 'value', min: -50, max: 250, val: 44.64, step: 0.01, fmt: (v: number) => v.toFixed(2) }, { k: 'u', label: 'σ', min: 0, max: 40, val: 0.72, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { return { v: P.v, u: P.u, i: -1 }; },
  onParam(S: any, P: any) { S.v = P.v; S.u = P.u; S.i = -1; },
  stepOnce(S: any) { S.i = (S.i + 1) % CASES.length; [S.v, S.u] = CASES[S.i]; },
  draw(c: VizCtx, S: any) {
    const [rv, ru, d] = roundMeasurement(S.v, S.u); const span = Math.max(S.u * 4, Math.abs(S.v) * 0.02, 0.5);
    c.view(S.v - span, S.v + span, -1, 1); const ctx = c.ctx, y = c.Y(0);
    ctx.save(); ctx.strokeStyle = 'rgba(170,190,215,.5)'; ctx.beginPath(); ctx.moveTo(c.pad.l, y); ctx.lineTo(c.W - c.pad.r, y); ctx.stroke();
    if (isFinite(d)) { const step = Math.pow(10, -d); const first = Math.ceil((S.v - span) / step) * step;
      for (let t = first, k = 0; t <= S.v + span && k < 200; t += step, k++) { ctx.strokeStyle = 'rgba(227,179,65,.55)'; ctx.beginPath(); ctx.moveTo(c.X(t), y - 8); ctx.lineTo(c.X(t), y + 8); ctx.stroke(); } }
    ctx.fillStyle = 'rgba(57,208,216,.15)'; ctx.fillRect(c.X(S.v - S.u), y - 22, c.X(S.v + S.u) - c.X(S.v - S.u), 44); ctx.restore();
    c.dot(S.v, 0, 4, QC.dim); c.dot(rv, 0, 6, QC.accent, 12);
    mono(c, c.W / 2, 16, `${S.v} ± ${S.u}`, QC.dim, 13, 'center');
    mono(c, c.W / 2, c.H - 48, S.u === 0 ? `σ = 0 → keep ${S.v}` : `→ ${rv.toFixed(Math.max(0, d))} ± ${ru.toFixed(Math.max(0, d))}   (d = ${d})`, QC.accent, 15, 'center');
    if (S.i >= 0) mono(c, 10, 8, `test case ${S.i + 1} of 7`, QC.energy, 11);
  },
  stats(S: any) { const [rv, ru, d] = roundMeasurement(S.v, S.u); return [['σ to 1 s.f.', String(ru), QC.accent], ['decimal place d', isFinite(d) ? String(d) : '—', QC.energy], ['rounded value', String(rv), QC.accent]]; },
};

const FAMS = [
  { name: 'speed', a: 'm/s', b: 'km/h', f: (x: number) => x * 3.6, s: 3.6, off: 0, lo: 0, hi: 40, v: 12.4, u: 0.2 },
  { name: 'length', a: 'mi', b: 'km', f: (x: number) => x * 1.609344, s: 1.609344, off: 0, lo: 0, hi: 10, v: 1, u: 0.1 },
  { name: 'temperature', a: 'C', b: 'F', f: (x: number) => x * 1.8 + 32, s: 1.8, off: 32, lo: -40, hi: 110, v: 20, u: 0.5 },
];
VIZ.units = { ...STEP,
  title: 'Converting a measurement: value and uncertainty', eq: 'value: x·factor (+ offset for temperature) &nbsp;|&nbsp; uncertainty: σ·factor (never an offset)',
  note: 'Two rulers for the same quantity.', h: 250, autoplay: false,
  params: [{ k: 'fam', label: 'family', min: 0, max: 2, val: 0, step: 1, fmt: (v: number) => FAMS[Math.round(v)].name }, { k: 'x', label: 'value', min: 0, max: 1, val: 0.31, step: 0.001, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const F = FAMS[Math.round(P.fam)], v = F.lo + P.x * (F.hi - F.lo), u = F.u, ctx = c.ctx;
    const L = 60, R = c.W - 30, X = (t: number) => L + ((t - F.lo) / (F.hi - F.lo)) * (R - L);
    const lo2 = F.f(F.lo), hi2 = F.f(F.hi), X2 = (t: number) => L + ((t - lo2) / (hi2 - lo2)) * (R - L);
    [[70, F.a, F.lo, F.hi, X], [170, F.b, lo2, hi2, X2]].forEach(([y, lab, lo, hi, XX]: any) => {
      ctx.save(); ctx.strokeStyle = 'rgba(170,190,215,.5)'; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); ctx.restore();
      for (let i = 0; i <= 5; i++) { const t = lo + (i / 5) * (hi - lo); ctx.save(); ctx.strokeStyle = 'rgba(170,190,215,.4)'; ctx.beginPath(); ctx.moveTo(XX(t), y - 5); ctx.lineTo(XX(t), y + 5); ctx.stroke(); ctx.restore(); mono(c, XX(t), y + 8, t.toFixed(t > 100 ? 0 : 1), QC.dim, 10, 'center'); }
      mono(c, 10, y - 7, lab, '#e7edf6', 13);
    });
    const v2 = F.f(v), u2 = u * F.s;
    ctx.save(); ctx.fillStyle = 'rgba(57,208,216,.25)'; ctx.fillRect(X(v - u), 52, X(v + u) - X(v - u), 36); ctx.fillStyle = 'rgba(227,179,65,.25)'; ctx.fillRect(X2(v2 - u2), 152, X2(v2 + u2) - X2(v2 - u2), 36);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(v), 88); ctx.lineTo(X2(v2), 152); ctx.stroke(); ctx.restore();
    c.sdot(X(v), 70, 5, QC.accent, 10); c.sdot(X2(v2), 170, 5, QC.energy, 10);
    mono(c, c.W / 2, 20, `${v.toFixed(2)} ± ${u} ${F.a}  →  ${v2.toFixed(2)} ± ${u2.toFixed(3)} ${F.b}`, '#e7edf6', 13, 'center');
    if (F.off) mono(c, c.W / 2, c.H - 22, `offset +${F.off} moves the value only; σ is multiplied by ${F.s}`, QC.energy, 11, 'center');
  },
  stats(_S: any, P: any) { const F = FAMS[Math.round(P.fam)], v = F.lo + P.x * (F.hi - F.lo); return [['converted value', F.f(v).toFixed(3), QC.energy], ['converted σ', (F.u * F.s).toFixed(3), QC.energy], ['factor', String(F.s), QC.dim]]; },
};

VIZ.product = { ...STEP,
  title: 'Why the product rule works: the area of a fuzzy rectangle', eq: 'δ(ab) ≈ b·δa + a·δb &nbsp;(+ δa·δb, dropped) &nbsp;|&nbsp; σ_ab/|ab| = √((σa/a)² + (σb/b)²)',
  note: 'Grow δa and δb and watch the corner.', h: 280, autoplay: false,
  params: [{ k: 'da', label: 'δa', min: 0, max: 1, val: 0.1, step: 0.01, fmt: (v: number) => v.toFixed(2) }, { k: 'db', label: 'δb', min: 0, max: 1.5, val: 0.2, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const a = 2, b = 3; c.view(-0.3, 4, -0.3, 5, true); c.grid(6, 6);
    const r = (x0: number, y0: number, w: number, h: number, col: string) => { const X = c.X(x0), Y = c.Y(y0 + h); c.ctx.save(); c.ctx.fillStyle = col; c.ctx.fillRect(X, Y, c.X(x0 + w) - X, c.Y(y0) - Y); c.ctx.restore(); };
    r(0, 0, a, b, 'rgba(88,166,255,.35)'); r(a, 0, P.da, b, 'rgba(57,208,216,.55)'); r(0, b, a, P.db, 'rgba(227,179,65,.55)'); r(a, b, P.da, P.db, 'rgba(248,81,73,.75)');
    mono(c, c.X(a / 2), c.Y(b / 2), 'a × b = 6', '#e7edf6', 13, 'center');
    mono(c, c.X(a + P.da / 2) + 4, c.Y(b / 2), 'b·δa', QC.accent, 12); mono(c, c.X(a / 2), c.Y(b + P.db / 2) - 6, 'a·δb', QC.energy, 12, 'center');
  },
  stats(_S: any, P: any) {
    const first = 3 * P.da + 2 * P.db, corner = P.da * P.db, rule = 6 * Math.sqrt((P.da / 2) ** 2 + (P.db / 3) ** 2);
    return [['b·δa + a·δb', first.toFixed(3), QC.accent], ['corner δa·δb', corner.toFixed(4), QC.bad], ['corner / total', ((corner / (first + corner || 1)) * 100).toFixed(1) + '%', QC.bad], ['quadrature σ', rule.toFixed(3), QC.energy]];
  },
};

/* ---------- s0p2 ---------- */
function flightRange(v0: number, deg: number, k: number) {
  const g = 9.81, th = (deg * Math.PI) / 180; let s = [0, 0, v0 * Math.cos(th), v0 * Math.sin(th)]; const dt = 0.002;
  const f = (y: number[]) => [y[2], y[3], -k * y[2], -g - k * y[3]];
  for (let i = 0; i < 200000; i++) { const n = rk4(f, s, dt); if (n[1] < 0 && i > 0) { const fr = s[1] / (s[1] - n[1]); return s[0] + fr * (n[0] - s[0]); } s = n; }
  return s[0];
}
VIZ.rangecurve = { ...STEP,
  title: 'Range against launch angle: where is the best angle?', eq: 'no drag: R = v₀² sin(2θ)/g, best θ = 45° &nbsp;|&nbsp; with drag: best θ < 45°',
  note: 'Dots are simulated flights; the dashed curve is the formula.', h: 280, autoplay: false, resetOnParam: true,
  params: [{ k: 'v0', label: 'v₀', unit: 'm/s', min: 5, max: 40, val: 20, step: 1, fmt: (v: number) => v.toFixed(0) }, { k: 'k', label: 'drag k', min: 0, max: 0.3, val: 0.1, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const pts: [number, number][] = []; for (let d = 5; d <= 85; d += 2.5) pts.push([d, flightRange(P.v0, d, P.k)]); return { pts }; },
  draw(c: VizCtx, S: any, P: any) {
    const R0 = (P.v0 * P.v0) / 9.81; c.view(0, 90, 0, R0 * 1.12); c.grid(9, 4); c.axes('θ (°)', 'range (m)'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    const ex: [number, number][] = []; for (let d = 0; d <= 90; d++) ex.push([d, R0 * Math.sin((2 * d * Math.PI) / 180)]);
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path(ex, QC.exact, 1.4); c.ctx.restore();
    S.pts.forEach(([d, r]: number[]) => c.dot(d, r, 3.5, P.k ? QC.warm : QC.vel, 6));
    const best = S.pts.reduce((a: number[], b: number[]) => (b[1] > a[1] ? b : a)); c.dot(best[0], best[1], 7, QC.energy, 12);
    c.legend([['formula (no drag)', QC.exact], [P.k ? 'simulated, with drag' : 'simulated', P.k ? QC.warm : QC.vel]]);
  },
  stats(S: any, P: any) { const best = S.pts.reduce((a: number[], b: number[]) => (b[1] > a[1] ? b : a)); return [['best angle', best[0].toFixed(1) + '°', QC.energy], ['best range', best[1].toFixed(1) + ' m', QC.energy], ['formula max', ((P.v0 * P.v0) / 9.81).toFixed(1) + ' m', QC.exact]]; },
};

/* ---------- s0p3 ---------- */
VIZ.swarm = { ...STEP,
  title: 'Two swarms: unlimited against limited growth', eq: 'Pₙ₊₁ = Pₙ + r·Pₙ &nbsp;vs&nbsp; Pₙ₊₁ = Pₙ + r·Pₙ(1 − Pₙ/K) &nbsp;(one dot = one unit)',
  note: '', h: 280, resetOnParam: true,
  params: [{ k: 'r', label: 'r', min: 0.05, max: 0.4, val: 0.15, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const R = rng(5); const pos = Array.from({ length: 400 }, () => { const a = R.u() * 6.283, s = Math.sqrt(R.u()); return [Math.cos(a) * s, Math.sin(a) * s]; }); return { e: 5, l: 5, t: 0, pos, r: P.r }; },
  step(S: any, dt: number) { S.t += dt; if (S.t > 0.35) { S.t = 0; S.e = Math.min(400, S.e + S.r * S.e); S.l = S.l + S.r * S.l * (1 - S.l / 100); if (S.e >= 400 && S.l > 99) { S.e = 5; S.l = 5; } } },
  draw(c: VizCtx, S: any) {
    const half = c.W / 2, R0 = Math.min(half, c.H) * 0.36;
    [[half / 2, S.e, 'exponential', QC.acc, false], [half * 1.5, S.l, 'logistic, K = 100', QC.pos, true]].forEach(([cx, n, lab, col, ring]: any) => {
      const cy = c.H / 2 + 6, rad = ring ? R0 : R0 * Math.sqrt(n / 100);
      if (ring) { c.ctx.save(); c.ctx.strokeStyle = 'rgba(227,179,65,.6)'; c.ctx.setLineDash([5, 4]); c.ctx.beginPath(); c.ctx.arc(cx, cy, R0, 0, 7); c.ctx.stroke(); c.ctx.restore(); }
      for (let i = 0; i < Math.floor(n); i++) c.sdot(cx + S.pos[i][0] * rad, cy + S.pos[i][1] * rad, 2.4, col, 4);
      mono(c, cx, 8, `${lab}: ${Math.floor(n)}`, col, 12, 'center');
    });
  },
  stats(S: any) { return [['exponential', Math.floor(S.e), QC.acc], ['logistic', Math.floor(S.l), QC.pos]]; },
};

const GF = (() => { const R = rng(9), real: number[] = []; let p = 120; for (let i = 0; i < 60; i++) { real.push(p * (1 + 0.04 * R.normal())); p = p + 0.08 * p * (1 - p / 900); } return real; })();
const logisticSeq = (p0: number, r: number, K: number, n: number) => { const s = [p0]; for (let i = 1; i < n; i++) { const p = s[i - 1]; s.push(p + r * p * (1 - p / K)); } return s; };
const sseOf = (r: number, K: number) => logisticSeq(GF[0], r, K, GF.length).reduce((a, m, i) => a + (m - GF[i]) ** 2, 0);
VIZ.gridfit = { ...STEP,
  title: 'Grid search: try every (r, K), keep the smallest error', eq: 'SSE(r, K) = Σ (model − data)² &nbsp;|&nbsp; best = argmin over the grid',
  note: 'Click the map to try a pair. Synthetic data made with r = 0.08, K = 900.', h: 300, autoplay: false,
  init() {
    const N = 36, rs = Array.from({ length: N }, (_, i) => 0.02 + (i * 0.16) / (N - 1)), Ks = Array.from({ length: N }, (_, i) => 400 + (i * 1200) / (N - 1));
    const grid = rs.map(r => Ks.map(K => sseOf(r, K))); let best = [0, 0];
    grid.forEach((row, i) => row.forEach((v, j) => { if (v < grid[best[0]][best[1]]) best = [i, j]; }));
    return { rs, Ks, grid, best, pick: best.slice() };
  },
  pointer(S: any, _P: any, c: VizCtx, sx: number, sy: number) {
    const W = c.W * 0.48, N = S.rs.length; const i = Math.floor(((sx - 40) / (W - 50)) * N), j = Math.floor(((c.H - 30 - sy) / (c.H - 50)) * N);
    if (i >= 0 && i < N && j >= 0 && j < N) S.pick = [i, j];
  },
  draw(c: VizCtx, S: any) {
    const N = S.rs.length, W = c.W * 0.48, cw = (W - 50) / N, ch = (c.H - 50) / N, ctx = c.ctx;
    const lmin = Math.log(S.grid[S.best[0]][S.best[1]] + 1), lmax = Math.log(Math.max(...S.grid.flat()) + 1);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const t = (Math.log(S.grid[i][j] + 1) - lmin) / (lmax - lmin); ctx.fillStyle = `hsl(${200 - 170 * (1 - t)}, 70%, ${18 + 45 * (1 - t)}%)`;
      ctx.fillRect(40 + i * cw, c.H - 30 - (j + 1) * ch, cw + 0.5, ch + 0.5);
    }
    const mark = ([i, j]: number[], col: string) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(40 + i * cw, c.H - 30 - (j + 1) * ch, cw, ch); ctx.restore(); };
    mark(S.best, '#ffffff'); mark(S.pick, QC.energy);
    mono(c, 40, c.H - 22, 'r →', QC.dim, 11); mono(c, 6, 18, 'K ↑', QC.dim, 11);
    const o = c.pads(W + 50, 14, 24, 30);
    c.view(0, GF.length, 0, Math.max(...GF) * 1.2); c.grid(6, 4); c.axes('year', 'P'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    GF.forEach((p, i) => c.dot(i, p, 2.4, QC.dim));
    const [i, j] = S.pick; c.path(logisticSeq(GF[0], S.rs[i], S.Ks[j], GF.length).map((p, k) => [k, p] as [number, number]), QC.energy, 2.2, 8);
    c.unpad(o);
  },
  stats(S: any) { const [i, j] = S.pick, [bi, bj] = S.best; return [['your r, K', `${S.rs[i].toFixed(3)}, ${S.Ks[j].toFixed(0)}`, QC.energy], ['your SSE', fmtN(S.grid[i][j], 0), QC.energy], ['best r, K', `${S.rs[bi].toFixed(3)}, ${S.Ks[bj].toFixed(0)}`, '#fff']]; },
};

/* ---------- s0p4 ---------- */
VIZ.stats = { ...STEP,
  title: 'Mean, variance and standard deviation you can see', eq: 'mean = Σx/n &nbsp;|&nbsp; variance = Σ(x − mean)²/n &nbsp;(or n − 1) &nbsp;|&nbsp; sd = √variance',
  note: 'Drag a point.', h: 260, autoplay: false,
  params: [{ k: 'sample', label: 'divide by', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'n − 1' : 'n') }],
  init() { return { xs: [2, 4, 4, 4, 5, 5, 7, 9], drag: -1 }; },
  pointer(S: any, _P: any, c: VizCtx, sx: number, _sy: number, type: string) {
    const x = c.invX(sx);
    if (type === 'down') { let k = 0; S.xs.forEach((v: number, i: number) => { if (Math.abs(v - x) < Math.abs(S.xs[k] - x)) k = i; }); S.drag = k; }
    if (S.drag >= 0) S.xs[S.drag] = Math.max(0, Math.min(12, Math.round(x * 10) / 10));
  },
  draw(c: VizCtx, S: any, P: any) {
    const n = S.xs.length, m = S.xs.reduce((a: number, b: number) => a + b, 0) / n, ss = S.xs.reduce((a: number, b: number) => a + (b - m) ** 2, 0), v = ss / (P.sample ? n - 1 : n), sd = Math.sqrt(v);
    c.view(0, 12, -1, 7); c.grid(12, 4); c.ticks(x => x.toFixed(0), () => '');
    const ctx = c.ctx; const sorted = S.xs.map((x: number, i: number) => [x, i]).sort((a: number[], b: number[]) => a[0] - b[0]);
    const seen: Record<string, number> = {};
    sorted.forEach(([x]: number[]) => { const key = x.toFixed(1); const k = (seen[key] = (seen[key] ?? -1) + 1); const d = Math.abs(x - m);
      ctx.save(); ctx.fillStyle = 'rgba(227,179,65,.12)'; ctx.strokeStyle = 'rgba(227,179,65,.45)';
      const X0 = c.X(Math.min(x, m)), w = c.X(Math.min(x, m) + d) - X0, Y0 = c.Y(0.4 + k * 0.9); ctx.fillRect(X0, Y0 - w * 0.25, w, w * 0.25); ctx.strokeRect(X0, Y0 - w * 0.25, w, w * 0.25); ctx.restore();
      c.dot(x, 0.4 + k * 0.9, 6, QC.pos, 8); });
    ctx.save(); ctx.fillStyle = 'rgba(57,208,216,.12)'; ctx.fillRect(c.X(m - sd), c.pad.t, c.X(m + sd) - c.X(m - sd), c.H - c.pad.t - c.pad.b); ctx.restore();
    c.path([[m, -1], [m, 7]], QC.accent, 2, 8); mono(c, c.X(m) + 4, 6, 'mean', QC.accent, 11);
  },
  stats(S: any, P: any) { const n = S.xs.length, m = S.xs.reduce((a: number, b: number) => a + b, 0) / n, ss = S.xs.reduce((a: number, b: number) => a + (b - m) ** 2, 0), v = ss / (P.sample ? n - 1 : n);
    return [['mean', m.toFixed(3), QC.accent], [P.sample ? 'sample variance' : 'variance', v.toFixed(3), QC.energy], ['sd', Math.sqrt(v).toFixed(3), QC.accent]]; },
};

VIZ.dial = { ...STEP,
  title: 'A dial whose needle is the running mean', eq: 'mean after n days = (x₁ + … + xₙ)/n &nbsp;|&nbsp; needle angle ∝ mean',
  note: 'Synthetic daily temperatures (mean 21 °C, sd 3 °C).', h: 270, resetOnParam: true,
  params: [{ k: 'speed', label: 'days / s', min: 2, max: 60, val: 12, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { const R = rng(4); return { data: Array.from({ length: 365 }, () => 21 + 3 * R.normal()), n: 0, acc: 0 }; },
  step(S: any, dt: number, P: any) { S.acc += dt * P.speed; while (S.acc > 1 && S.n < 365) { S.acc -= 1; S.n++; } if (S.n >= 365) { S.n = 0; } },
  draw(c: VizCtx, S: any) {
    const xs = S.data.slice(0, Math.max(1, S.n)), m = xs.reduce((a: number, b: number) => a + b, 0) / xs.length, sd = Math.sqrt(xs.reduce((a: number, b: number) => a + (b - m) ** 2, 0) / xs.length);
    const cx = c.W * 0.32, cy = c.H * 0.62, R = Math.min(c.W * 0.26, c.H * 0.5), ctx = c.ctx, ang = (t: number) => Math.PI + ((t - 12) / 18) * Math.PI;
    ctx.save(); ctx.strokeStyle = '#2a3446'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.restore();
    for (let t = 12; t <= 30; t += 3) { const a = ang(t); mono(c, cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14) - 6, String(t), QC.dim, 10, 'center'); }
    const needle = (val: number, col: string, w: number) => { const a = ang(val); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9); ctx.stroke(); ctx.restore(); };
    needle(m, QC.accent, 3); needle(12 + sd * 2, 'rgba(188,140,255,.6)', 2);
    mono(c, cx, cy + 8, `day ${S.n}   mean ${m.toFixed(2)} °C`, '#e7edf6', 12, 'center');
    const o = c.pads(c.W * 0.62, 14, 24, 30); c.view(0, 365, 12, 30); c.grid(4, 3); c.axes('day', '°C'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    const run: [number, number][] = []; let s = 0; for (let i = 0; i < S.n; i++) { s += S.data[i]; run.push([i, s / (i + 1)]); }
    c.path(run, QC.accent, 2); c.unpad(o);
  },
  stats(S: any) { const xs = S.data.slice(0, Math.max(1, S.n)), m = xs.reduce((a: number, b: number) => a + b, 0) / xs.length; return [['day', S.n, QC.dim], ['running mean', m.toFixed(3), QC.accent]]; },
};

/* ---------- s1p1 ---------- */
VIZ.vectorize = { ...STEP,
  title: 'A Python loop against one NumPy call', eq: 'loop: one element per Python step &nbsp;|&nbsp; NumPy: whole array per call, in compiled code',
  note: 'Not to scale — the real ratio depends on your machine.', h: 220,
  init() { return { k: 0, t: 0 }; },
  step(S: any, dt: number) { S.t += dt; if (S.t > 0.05) { S.t = 0; S.k = (S.k + 1) % 72; } },
  draw(c: VizCtx, S: any) {
    const n = 64, cols = 16, cw = Math.min(22, (c.W / 2 - 40) / cols), ch = 18, ctx = c.ctx;
    const grid = (x0: number, title: string, filled: (i: number) => boolean, col: string) => {
      mono(c, x0, 8, title, '#e7edf6', 12);
      for (let i = 0; i < n; i++) { const x = x0 + (i % cols) * cw, y = 30 + Math.floor(i / cols) * (ch + 4); ctx.fillStyle = filled(i) ? col : '#1a2231'; ctx.fillRect(x, y, cw - 3, ch); }
    };
    grid(20, 'for x in xs:  (Python, one at a time)', i => i < Math.min(S.k, n), QC.warm);
    grid(c.W / 2 + 10, 'xs * 2  (NumPy, all at once)', () => S.k >= 2, QC.vel);
    mono(c, 20, 140, S.k < n ? `loop: ${Math.min(S.k, n)} / ${n} done` : 'loop: done', QC.warm, 12);
    mono(c, c.W / 2 + 10, 140, S.k >= 2 ? 'NumPy: done' : 'NumPy: working', QC.vel, 12);
  },
};

const TR = (() => { const R = rng(21); const out: { t: number; y: number }[] = []; let e = 0;
  for (let m = 0; m < 34 * 12; m++) { e = 0.6 * e + 0.35 * R.normal(); const t = 1990 + (m + 0.5) / 12; out.push({ t, y: 20 + 0.02 * (t - 1990) + 2.2 * Math.sin((2 * Math.PI * (m % 12)) / 12) + e }); } return out; })();
function olsSE(x: number[], y: number[]) { const n = x.length, xm = x.reduce((a, b) => a + b) / n, ym = y.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - xm) * (y[i] - ym); sxx += (x[i] - xm) ** 2; } const s = sxy / sxx, c0 = ym - s * xm; let rr = 0; for (let i = 0; i < n; i++) rr += (y[i] - c0 - s * x[i]) ** 2; return { s, c0, se: Math.sqrt(rr / (n - 2) / sxx) }; }
VIZ.trend = { ...STEP,
  title: 'Trend or noise? Monthly values against annual means', eq: 'slope ± 2·SE &nbsp;|&nbsp; SE assumes independent residuals',
  note: 'Synthetic station: true trend 0.20 °C per decade, a yearly cycle, and correlated noise.', h: 280, autoplay: false,
  params: [{ k: 'annual', label: 'use', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'annual means' : 'monthly values') }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const pts = P.annual ? Array.from({ length: 34 }, (_, k) => { const ys = TR.slice(k * 12, k * 12 + 12); return { t: 1990 + k + 0.5, y: ys.reduce((a, b) => a + b.y, 0) / 12 }; }) : TR;
    c.view(1990, 2024, 16, 25); c.grid(7, 4); c.axes('year', '°C'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    pts.forEach(p => c.dot(p.t, p.y, P.annual ? 4 : 2, P.annual ? QC.accent : 'rgba(88,166,255,.7)'));
    const f = olsSE(pts.map(p => p.t), pts.map(p => p.y)); c.path([[1990, f.c0 + f.s * 1990], [2024, f.c0 + f.s * 2024]], QC.energy, 2.4, 8);
  },
  stats(_S: any, P: any) {
    const pts = P.annual ? Array.from({ length: 34 }, (_, k) => { const ys = TR.slice(k * 12, k * 12 + 12); return { t: 1990 + k + 0.5, y: ys.reduce((a, b) => a + b.y, 0) / 12 }; }) : TR;
    const f = olsSE(pts.map(p => p.t), pts.map(p => p.y));
    return [['points n', pts.length, QC.dim], ['slope / decade', (f.s * 10).toFixed(3) + ' °C', QC.energy], ['± 2 SE', (2 * f.se * 10).toFixed(3), QC.accent], ['true slope', '0.200', QC.exact]];
  },
};

/* ---------- s1p2 ---------- */
VIZ.newtonfail = { ...STEP,
  title: 'Newton fails on purpose: x³ − 2x + 2 from x₀ = 0', eq: 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) &nbsp;|&nbsp; 0 → 1 → 0 → 1 … forever',
  note: 'Press Step. The tangent at 0 lands on 1 and the tangent at 1 lands back on 0.', h: 280, autoplay: false, stepBtn: true, resetOnParam: true,
  params: [{ k: 'x0', label: 'x₀', min: -2.5, max: 2.5, val: 0, step: 0.05, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { return { xs: [P.x0] }; },
  stepOnce(S: any) { const x = S.xs[S.xs.length - 1], d = 3 * x * x - 2; S.xs.push(d === 0 ? x : x - (x ** 3 - 2 * x + 2) / d); if (S.xs.length > 12) S.xs.shift(); },
  draw(c: VizCtx, S: any) {
    const f = (x: number) => x ** 3 - 2 * x + 2; c.view(-2.5, 2.5, -4, 6); c.grid(5, 5); c.axes('x', 'f(x)'); c.ticks();
    const pts: [number, number][] = []; for (let i = 0; i <= 200; i++) { const x = -2.5 + i * 0.025; pts.push([x, f(x)]); } c.path(pts, QC.accent, 2.2, 8);
    for (let i = 0; i < S.xs.length - 1; i++) { const a = S.xs[i], b = S.xs[i + 1]; c.path([[a, f(a)], [b, 0]], QC.warm, 1.6); c.path([[a, 0], [a, f(a)]], 'rgba(255,255,255,.25)', 1); }
    S.xs.forEach((x: number, i: number) => c.dot(x, 0, i === S.xs.length - 1 ? 6 : 3.5, QC.warm, 8));
    c.dot(-1.7693, 0, 5, QC.vel, 10); mono(c, c.X(-1.7693), c.Y(0) + 10, 'real root −1.769', QC.vel, 11, 'center');
  },
  stats(S: any) { return [['iterates', S.xs.slice(-6).map((x: number) => x.toFixed(3)).join(' → '), QC.warm]]; },
};

/* ---------- s1p3 ---------- */
VIZ.damped = { ...STEP,
  title: 'Damping: ringing, critical, creeping', eq: "x'' + 2ζω·x' + ω²·x = 0 &nbsp;|&nbsp; ζ < 1 rings, ζ = 1 fastest return, ζ > 1 creeps",
  note: '', h: 260, autoplay: false, resetOnParam: true,
  params: [{ k: 'z', label: 'ζ', min: 0, max: 2, val: 0.15, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const pts: [number, number][] = []; let y = [1, 0]; const f = (s: number[]) => [s[1], -2 * P.z * s[1] - s[0]]; for (let i = 0; i <= 800; i++) { pts.push([i * 0.03, y[0]]); y = rk4(f, y, 0.03); } return { pts }; },
  draw(c: VizCtx, S: any, P: any) {
    c.view(0, 24, -1.1, 1.1); c.grid(8, 4); c.axes('t', 'x'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    if (P.z < 1 && P.z > 0) { c.ctx.save(); c.ctx.setLineDash([4, 4]); const env: [number, number][] = []; for (let t = 0; t <= 24; t += 0.2) env.push([t, Math.exp(-P.z * t)]); c.path(env, 'rgba(227,179,65,.6)', 1.2); c.path(env.map(([t, v]) => [t, -v] as [number, number]), 'rgba(227,179,65,.6)', 1.2); c.ctx.restore(); }
    c.path(S.pts, QC.pos, 2.2, 8);
  },
  stats(_S: any, P: any) { return [['regime', P.z < 1 ? (P.z === 0 ? 'undamped' : 'under-damped (rings)') : P.z === 1 ? 'critical' : 'over-damped (creeps)', QC.energy], ['envelope', P.z < 1 ? `e^(−${P.z.toFixed(2)} t)` : '—', QC.dim]]; },
};

VIZ.resonance = { ...STEP,
  title: 'Resonance: steady amplitude against drive speed', eq: 'A(w) = F / √((1 − w²)² + (c·w)²) &nbsp;(m = k = 1, F = 0.5)',
  note: '', h: 260, autoplay: false,
  params: [{ k: 'c', label: 'damping c', min: 0.05, max: 1.5, val: 0.3, step: 0.01, fmt: (v: number) => v.toFixed(2) }, { k: 'w', label: 'drive w', min: 0.5, max: 2, val: 1, step: 0.05, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const A = (w: number) => 0.5 / Math.sqrt((1 - w * w) ** 2 + (P.c * w) ** 2); const top = Math.min(12, A(1) * 1.2 + 0.2);
    c.view(0.5, 2, 0, top); c.grid(6, 4); c.axes('w', 'amplitude'); c.ticks(v => v.toFixed(2), v => v.toFixed(1));
    const pts: [number, number][] = []; for (let w = 0.5; w <= 2.0001; w += 0.01) pts.push([w, A(w)]); c.path(pts, QC.mag, 2.4, 10);
    c.dot(P.w, A(P.w), 6, QC.energy, 12); c.path([[P.w, 0], [P.w, A(P.w)]], 'rgba(227,179,65,.5)', 1);
  },
  stats(_S: any, P: any) { const A = (w: number) => 0.5 / Math.sqrt((1 - w * w) ** 2 + (P.c * w) ** 2); const wp = P.c * P.c < 2 ? Math.sqrt(1 - (P.c * P.c) / 2) : 0;
    return [['amplitude at w', A(P.w).toFixed(3), QC.energy], ['peak at w', wp ? wp.toFixed(3) : 'no peak', QC.mag], ['A(0.5), A(1), A(2)', `${A(0.5).toFixed(2)}, ${A(1).toFixed(2)}, ${A(2).toFixed(2)}`, QC.dim]]; },
};

VIZ.symplectic = { ...STEP,
  title: 'Forward Euler spirals out; semi-implicit Euler stays on the loop', eq: 'Euler: x += dt·v_old, v += dt·a_old &nbsp;|&nbsp; semi-implicit: v += dt·a, then x += dt·v_new',
  note: '', h: 280, resetOnParam: true,
  params: [{ k: 'dt', label: 'dt', min: 0.01, max: 0.3, val: 0.1, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { return { e: [[1, 0]], s: [[1, 0]], t: 0 }; },
  step(S: any, dt: number, P: any) { S.t += dt; if (S.t < 0.03) return; S.t = 0;
    const [x, v] = S.e[S.e.length - 1]; S.e.push([x + P.dt * v, v - P.dt * x]);
    const [x2, v2] = S.s[S.s.length - 1]; const nv = v2 - P.dt * x2; S.s.push([x2 + P.dt * nv, nv]);
    if (S.e.length > 900) { S.e = [[1, 0]]; S.s = [[1, 0]]; } },
  draw(c: VizCtx, S: any) {
    const o = c.pads(40, c.W * 0.5, 24, 30); c.view(-2.2, 2.2, -2.2, 2.2, true); c.grid(4, 4); c.axes('x', 'v');
    c.path(S.e.map((p: number[]) => [p[0], p[1]]), QC.bad, 1.6); c.path(S.s.map((p: number[]) => [p[0], p[1]]), QC.vel, 2, 8);
    c.unpad(o); const o2 = c.pads(c.W * 0.55, 14, 24, 30); const n = S.e.length;
    c.view(0, Math.max(50, n), 0.3, 1.5); c.grid(4, 3); c.axes('step', 'energy'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    c.path(S.e.map((p: number[], i: number) => [i, Math.min(1.5, 0.5 * (p[0] ** 2 + p[1] ** 2))] as [number, number]), QC.bad, 2);
    c.path(S.s.map((p: number[], i: number) => [i, 0.5 * (p[0] ** 2 + p[1] ** 2)] as [number, number]), QC.vel, 2);
    c.unpad(o2); c.legend([['forward Euler', QC.bad], ['semi-implicit', QC.vel]]);
  },
  stats(S: any) { const E = (p: number[]) => 0.5 * (p[0] ** 2 + p[1] ** 2); return [['Euler energy', E(S.e[S.e.length - 1]).toFixed(4), QC.bad], ['semi-implicit energy', E(S.s[S.s.length - 1]).toFixed(4), QC.vel], ['true', '0.5000', QC.exact]]; },
};

/* ---------- s1p4 ---------- */
VIZ.spatialhash = { ...STEP,
  title: 'Neighbour search: every pair against a grid of cells', eq: 'brute force: N(N−1) checks &nbsp;|&nbsp; grid with cell = R: only the 3×3 cells around each bird',
  note: '', h: 300, autoplay: false, resetOnParam: true,
  params: [{ k: 'n', label: 'birds N', min: 20, max: 400, val: 120, step: 10, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { const R = rng(12); return { pts: Array.from({ length: P.n }, () => [R.u(), R.u()]), q: 0 }; },
  pointer(S: any, _P: any, c: VizCtx, sx: number, sy: number) { const x = (sx - 20) / (c.W * 0.62 - 20), y = (sy - 10) / (c.H - 20); let k = 0, best = 9; S.pts.forEach((p: number[], i: number) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < best) { best = d; k = i; } }); S.q = k; },
  draw(c: VizCtx, S: any) {
    const W = c.W * 0.62 - 20, H = c.H - 20, X = (u: number) => 20 + u * W, Y = (v: number) => 10 + v * H, cell = 0.12, ctx = c.ctx, q = S.pts[S.q];
    const qc = [Math.floor(q[0] / cell), Math.floor(q[1] / cell)];
    ctx.save(); ctx.strokeStyle = 'rgba(120,140,170,.2)'; for (let u = 0; u <= 1.0001; u += cell) { ctx.beginPath(); ctx.moveTo(X(u), Y(0)); ctx.lineTo(X(u), Y(1)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(X(0), Y(u)); ctx.lineTo(X(1), Y(u)); ctx.stroke(); }
    ctx.fillStyle = 'rgba(57,208,216,.12)'; ctx.fillRect(X((qc[0] - 1) * cell), Y((qc[1] - 1) * cell), 3 * cell * W, 3 * cell * H);
    ctx.strokeStyle = 'rgba(227,179,65,.7)'; ctx.beginPath(); ctx.ellipse(X(q[0]), Y(q[1]), cell * W, cell * H, 0, 0, 7); ctx.stroke(); ctx.restore();
    S.pts.forEach((p: number[], i: number) => { const near = Math.hypot(p[0] - q[0], p[1] - q[1]) < cell && i !== S.q; c.sdot(X(p[0]), Y(p[1]), i === S.q ? 6 : 3, i === S.q ? QC.energy : near ? QC.vel : QC.dim, near ? 6 : 0); });
    const n = S.pts.length; let cand = 0; S.pts.forEach((p: number[]) => { const pc = [Math.floor(p[0] / cell), Math.floor(p[1] / cell)]; S.pts.forEach((r: number[]) => { const rc = [Math.floor(r[0] / cell), Math.floor(r[1] / cell)]; if (Math.abs(pc[0] - rc[0]) <= 1 && Math.abs(pc[1] - rc[1]) <= 1) cand++; }); });
    S.cand = cand - n; S.brute = n * (n - 1);
    const bx = c.W * 0.66, top = 30, bw = c.W * 0.3, maxv = S.brute || 1;
    c.bar(bx, top + 20, bw, 14, 1, QC.bad, `brute force: ${S.brute.toLocaleString()} checks`);
    c.bar(bx, top + 80, bw, 14, S.cand / maxv, QC.vel, `grid: ${S.cand.toLocaleString()} checks`);
    mono(c, bx, top + 120, 'click a bird to move the search', QC.dim, 11);
  },
  stats(S: any) { return [['brute force', (S.brute ?? 0).toLocaleString(), QC.bad], ['grid', (S.cand ?? 0).toLocaleString(), QC.vel], ['saving', S.brute ? (S.brute / Math.max(1, S.cand)).toFixed(1) + '×' : '—', QC.energy]]; },
};

/* ---------- s1p5 ---------- */
VIZ.particles = { ...STEP,
  title: '80 independent particles in a box', eq: 'each particle: v += g·dt, r += v·dt, bounce off walls &nbsp;|&nbsp; no forces between them',
  note: 'Drag to orbit.', h: 300, pointer: orbitPointer,
  init() { const R = rng(8); return { az: 0.7, el: 0.35, p: Array.from({ length: 80 }, () => ({ r: [R.u() * 8 - 4, R.u() * 6 + 1, R.u() * 8 - 4], v: [R.normal() * 2, R.normal() * 2, R.normal() * 2] })) }; },
  step(S: any, dt: number) { S.p.forEach((q: any) => { q.v[1] -= 9.81 * dt; for (let k = 0; k < 3; k++) { q.r[k] += q.v[k] * dt; const lo = k === 1 ? 0 : -4, hi = k === 1 ? 8 : 4; if (q.r[k] < lo) { q.r[k] = lo; q.v[k] = Math.abs(q.v[k]); } if (q.r[k] > hi) { q.r[k] = hi; q.v[k] = -Math.abs(q.v[k]); } } }); },
  draw(c: VizCtx, S: any) {
    const P = cam(c, S.az, S.el, 22); groundGrid(c, P, 4, 4);
    const corners = [[-4, 0, -4], [4, 0, -4], [4, 0, 4], [-4, 0, 4]]; c.ctx.save(); c.ctx.strokeStyle = 'rgba(120,140,170,.35)';
    corners.forEach(([x, , z]) => { const a = P(x, 0, z), b = P(x, 8, z); c.ctx.beginPath(); c.ctx.moveTo(a[0], a[1]); c.ctx.lineTo(b[0], b[1]); c.ctx.stroke(); }); c.ctx.restore();
    S.p.map((q: any) => P(q.r[0], q.r[1], q.r[2])).sort((a: number[], b: number[]) => b[2] - a[2]).forEach((s: number[]) => c.sdot(s[0], s[1], Math.max(2, 70 / s[2]), QC.accent, 6));
  },
  stats(S: any) { const E = S.p.reduce((a: number, q: any) => a + 0.5 * (q.v[0] ** 2 + q.v[1] ** 2 + q.v[2] ** 2) + 9.81 * q.r[1], 0); return [['particles', S.p.length, QC.dim], ['total energy', E.toFixed(0), QC.energy]]; },
};

/* ---------- s1p6 ---------- */
VIZ.epsilon = { ...STEP,
  title: 'Machine epsilon: the smallest step above 1 the computer can see', eq: 'ε = 2⁻⁵² ≈ 2.22×10⁻¹⁶ &nbsp;|&nbsp; 1 + δ == 1 when δ < ε/2',
  note: 'Every number here is computed live in your browser’s 64-bit floats.', h: 260, autoplay: false,
  params: [{ k: 'p', label: 'δ = 10^p', min: -18, max: -1, val: -10, step: 0.25, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(-18, -1, -18, 1); c.grid(8, 5); c.axes('log₁₀ δ', 'log₁₀ rel. error'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    const pts: [number, number][] = []; for (let p = -18; p <= -1; p += 0.05) { const d = 10 ** p, got = 1 + d - 1; pts.push([p, Math.log10(Math.max(Math.abs(got - d) / d, 1e-18))]); }
    c.path(pts, QC.pos, 1.6); c.path([[Math.log10(2.220446049250313e-16), -18], [Math.log10(2.220446049250313e-16), 1]], 'rgba(227,179,65,.7)', 1.4);
    const d = 10 ** P.p, got = 1 + d - 1; c.dot(P.p, Math.log10(Math.max(Math.abs(got - d) / d, 1e-18)), 6, QC.energy, 10);
    mono(c, c.X(Math.log10(2.22e-16)) + 4, c.pad.t + 4, 'ε', QC.energy, 12);
  },
  stats(_S: any, P: any) { const d = 10 ** P.p; return [['δ', d.toExponential(2), QC.dim], ['(1 + δ) − 1', (1 + d - 1).toExponential(4), QC.energy], ['1 + δ == 1 ?', String(1 + d === 1), 1 + d === 1 ? QC.bad : QC.vel]]; },
};

/** Exact small root of x² + bx + 1 from its Catalan series −Σ Cₙ / b^(2n+1); independent of either formula. */
export function smallRootSeries(b: number) { let C = 1, sum = 0, pw = 1 / b; for (let n = 0; n < 40; n++) { sum += C * pw; C = (C * 2 * (2 * n + 1)) / (n + 2); pw /= b * b; } return -sum; }
VIZ.cancel = { ...STEP,
  title: 'Cancellation: correct formulas that fail on a computer', eq: 'small root of x² + bx + 1: (−b + √(b²−4))/2 &nbsp;vs&nbsp; 2/(−b − √(b²−4)) &nbsp;|&nbsp; variance: E[x²] − E[x]² vs two-pass',
  note: '', h: 280, autoplay: false,
  params: [{ k: 'mode', label: 'example', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'variance' : 'quadratic') }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const naive: [number, number][] = [], stable: [number, number][] = [];
    if (!P.mode) { for (let p = 1; p <= 10; p += 0.05) { const b = 10 ** p, d = Math.sqrt(b * b - 4), tru = smallRootSeries(b); naive.push([p, Math.log10(Math.max(Math.abs((-b + d) / 2 - tru) / Math.abs(tru), 1e-17))]); const q = -0.5 * (b + d); stable.push([p, Math.log10(Math.max(Math.abs(1 / q - tru) / Math.abs(tru), 1e-17))]); } }
    else { const base = [4, 7, 13, 16]; for (let p = 0; p <= 10; p += 0.1) { const off = 10 ** p, xs = base.map(x => x + off), n = 4, m = xs.reduce((a, b) => a + b) / n; const two = xs.reduce((a, b) => a + (b - m) ** 2, 0) / n, one = xs.reduce((a, b) => a + b * b, 0) / n - m * m; naive.push([p, Math.log10(Math.max(Math.abs(one - 22.5) / 22.5, 1e-17))]); stable.push([p, Math.log10(Math.max(Math.abs(two - 22.5) / 22.5, 1e-17))]); } }
    c.view(P.mode ? 0 : 1, 10, -17, 2); c.grid(9, 5); c.axes(P.mode ? 'log₁₀ offset' : 'log₁₀ b', 'log₁₀ rel. error'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    c.path(naive, QC.bad, 2, 6); c.path(stable, QC.vel, 2, 6); c.legend([[P.mode ? 'one-pass' : 'naive', QC.bad], [P.mode ? 'two-pass' : 'stable', QC.vel]]);
  },
};

export const STEP_WIDGETS = Object.keys(VIZ).filter(k => (VIZ[k] as { kind?: string }).kind === 'step');
