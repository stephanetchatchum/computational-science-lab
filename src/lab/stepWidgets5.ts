/** Stage 5 step visuals. Numbers match the reference solutions in scripts/reference/; synthetic data is labelled. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function cells(c: VizCtx, x0: number, y0: number, w: number, h: number, n: number, m: number, col: (i: number, j: number) => string) {
  const cw = w / m, ch = h / n; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { c.ctx.fillStyle = col(i, j); c.ctx.fillRect(x0 + j * cw, y0 + i * ch, cw + 0.6, ch + 0.6); }
}
const percentile = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y), k = (s.length - 1) * p / 100, f = Math.floor(k); return s[f] + (s[Math.min(f + 1, s.length - 1)] - s[f]) * (k - f); };

/* ================= s5p1 ================= */
VIZ.nbody = { ...STEP,
  title: 'Gravity between every pair: a disc that spins, a cloud that collapses', eq: 'aᵢ = Σⱼ mⱼ (rⱼ − rᵢ) / (|rⱼ − rᵢ|² + ε²)^{3/2} &nbsp;|&nbsp; leapfrog: kick, drift, kick',
  note: '250 bodies in 2D (seen from above), computed live: 62 500 pairs per step. Disc speeds are circular-orbit speeds √(mass inside ÷ radius).', h: 320, resetOnParam: true,
  params: [{ k: 'cold', label: 'start', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'cold cloud' : 'rotating disc') }],
  init(P: any) {
    const R = rng(3), n = 250, x = new Float64Array(n), y = new Float64Array(n), vx = new Float64Array(n), vy = new Float64Array(n);
    const rhos = Array.from({ length: n }, () => 6 * R.u());
    for (let i = 0; i < n; i++) { const rho = rhos[i], a = 2 * Math.PI * R.u(); x[i] = rho * Math.cos(a); y[i] = rho * Math.sin(a); if (!P.cold) { const inside = Math.max(1, rhos.filter(r => r < rho).length) / n, sp = Math.sqrt(inside / Math.max(rho, 0.05)) / Math.max(rho, 1e-6); vx[i] = -y[i] * sp; vy[i] = x[i] * sp; } }
    return { n, x, y, vx, vy, ax: new Float64Array(n), ay: new Float64Array(n), t: 0 };
  },
  acc(S: any) { const { n, x, y, ax, ay } = S, m = 1 / n, e2 = 0.08 * 0.08; ax.fill(0); ay.fill(0); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const dx = x[j] - x[i], dy = y[j] - y[i], r2 = dx * dx + dy * dy + e2, f = m / (r2 * Math.sqrt(r2)); ax[i] += f * dx; ay[i] += f * dy; ax[j] -= f * dx; ay[j] -= f * dy; } },
  step(S: any) {
    const dt = 0.02; for (let k = 0; k < 2; k++) { VIZ.nbody.acc(S); for (let i = 0; i < S.n; i++) { S.vx[i] += 0.5 * dt * S.ax[i]; S.vy[i] += 0.5 * dt * S.ay[i]; S.x[i] += dt * S.vx[i]; S.y[i] += dt * S.vy[i]; } VIZ.nbody.acc(S); for (let i = 0; i < S.n; i++) { S.vx[i] += 0.5 * dt * S.ax[i]; S.vy[i] += 0.5 * dt * S.ay[i]; } S.t += dt; }
  },
  draw(c: VizCtx, S: any) {
    c.view(-8, 8, -8, 8, true);
    for (let i = 0; i < S.n; i++) { const sp = Math.hypot(S.vx[i], S.vy[i]), t = clamp(sp / 1.2, 0, 1); c.dot(S.x[i], S.y[i], 2.2, `rgb(${Math.round(90 + 165 * t)},${Math.round(140 + 115 * t)},255)`); }
  },
  stats(S: any) { let r = 0; for (let i = 0; i < S.n; i++) r += Math.hypot(S.x[i], S.y[i]); return [['time', S.t.toFixed(1), QC.dim], ['mean radius', (r / S.n).toFixed(2), QC.energy]]; },
};

/** Timings measured on our 2-core test machine (ms per force evaluation). */
const MEAS = {
  direct2d: [[500, 15], [1000, 55], [2000, 211], [4000, 881]],
  numba2d: [[500, 5], [1000, 17], [2000, 74], [4000, 265], [8000, 1078]],
  bh: [[500, 90], [1000, 186], [2000, 394], [4000, 891], [8000, 2209]],
};
VIZ.scaling = { ...STEP,
  title: 'Timing on log–log axes: slope is the algorithm, height is the hardware', eq: 'time ∝ Nᵖ &nbsp;⇒&nbsp; log time = p·log N + const',
  note: 'Real timings from our 2-core test machine, 2D bodies. Yours will differ; the slopes will not.', h: 280, autoplay: false,
  toggles: [{ k: 'bh', label: 'show Barnes–Hut (pure Python)', on: true }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(2.6, 4.0, 0.5, 3.5); c.grid(7, 6); c.axes('log₁₀ N', 'log₁₀ ms'); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    const line = (pts: number[][], col: string) => { c.path(pts.map(([n, t]) => [Math.log10(n), Math.log10(t)] as [number, number]), col, 2.2, 6); pts.forEach(([n, t]) => c.dot(Math.log10(n), Math.log10(t), 4, col)); };
    line(MEAS.direct2d, QC.warm); line(MEAS.numba2d, QC.vel); if (P.bh) line(MEAS.bh, QC.pos);
    c.legend([['numpy direct (slope 2)', QC.warm], ['numba direct (slope 2)', QC.vel], ...(P.bh ? [['Barnes–Hut (slope ≈ 1.1)', QC.pos] as [string, string]] : [])]);
  },
  stats() { const sl = (a: number[][]) => (Math.log10(a.at(-1)![1]) - Math.log10(a[0][1])) / (Math.log10(a.at(-1)![0]) - Math.log10(a[0][0])); return [['numpy slope', sl(MEAS.direct2d).toFixed(2), QC.warm], ['numba slope', sl(MEAS.numba2d).toFixed(2), QC.vel], ['tree slope', sl(MEAS.bh).toFixed(2), QC.pos]]; },
};

VIZ.quadtree = { ...STEP,
  title: 'Barnes–Hut: far-away groups count as one mass', eq: 'open a box if size/distance ≥ θ, otherwise use its total mass at its centre of mass',
  note: 'Random bodies. The orange body is the one being computed; green boxes were used whole, small dots were visited one by one.', h: 320, autoplay: false, resetOnParam: true,
  params: [{ k: 'theta', label: 'θ', min: 0, max: 1.5, val: 0.5, step: 0.05, fmt: (v: number) => v.toFixed(2) }, { k: 'n', label: 'bodies', min: 50, max: 800, val: 300, step: 50, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) {
    const R = rng(5), pts = Array.from({ length: P.n }, () => [0.5 + 0.18 * R.normal(), 0.5 + 0.18 * R.normal()].map(v => clamp(v, 0.01, 0.99)));
    type N = { x: number; y: number; s: number; m: number; mx: number; my: number; kids: N[] | null; body: number };
    const mk = (x: number, y: number, s: number): N => ({ x, y, s, m: 0, mx: 0, my: 0, kids: null, body: -1 });
    const ins = (nd: N, i: number) => { if (!nd.kids && nd.body < 0 && nd.m === 0) nd.body = i; else { if (!nd.kids) { const q = nd.s / 4; nd.kids = [mk(nd.x - q, nd.y - q, nd.s / 2), mk(nd.x - q, nd.y + q, nd.s / 2), mk(nd.x + q, nd.y - q, nd.s / 2), mk(nd.x + q, nd.y + q, nd.s / 2)]; const o = nd.body; nd.body = -1; ins(nd.kids[(pts[o][0] >= nd.x ? 2 : 0) + (pts[o][1] >= nd.y ? 1 : 0)], o); } ins(nd.kids[(pts[i][0] >= nd.x ? 2 : 0) + (pts[i][1] >= nd.y ? 1 : 0)], i); } nd.m += 1; nd.mx += pts[i][0]; nd.my += pts[i][1]; };
    const root = mk(0.5, 0.5, 1); pts.forEach((_, i) => ins(root, i)); return { pts, root, target: 0 };
  },
  draw(c: VizCtx, S: any, P: any) {
    const side = Math.min(c.H - 16, c.W - 20), x0 = (c.W - side) / 2, X = (u: number) => x0 + u * side, Y = (v: number) => 8 + v * side, ctx = c.ctx;
    ctx.strokeStyle = 'rgba(140,160,190,.18)'; const box = (nd: any) => { ctx.strokeRect(X(nd.x - nd.s / 2), Y(nd.y - nd.s / 2), nd.s * side, nd.s * side); nd.kids?.forEach(box); }; box(S.root);
    const tp = S.pts[S.target]; let used = 0; S.used = 0;
    const walk = (nd: any) => { if (nd.m === 0 || nd.body === S.target) return; const cx = nd.mx / nd.m, cy = nd.my / nd.m, d2 = (cx - tp[0]) ** 2 + (cy - tp[1]) ** 2;
      if (!nd.kids || nd.s * nd.s < P.theta * P.theta * d2) { used++; if (nd.kids) { ctx.fillStyle = 'rgba(63,185,80,.18)'; ctx.fillRect(X(nd.x - nd.s / 2), Y(nd.y - nd.s / 2), nd.s * side, nd.s * side); c.sdot(X(cx), Y(cy), 3, QC.vel); } else c.sdot(X(cx), Y(cy), 1.6, '#e6edf3'); }
      else nd.kids.forEach(walk); };
    walk(S.root); S.used = used; c.sdot(X(tp[0]), Y(tp[1]), 6, QC.warm, 10);
  },
  stats(S: any, P: any) { return [['interactions', S.used ?? 0, QC.vel], ['direct sum needs', P.n - 1, QC.dim]]; },
};

/* ================= s5p2 ================= */
function seirFrac(beta: number, sigma: number, gamma: number, days = 250) { let y = [0.999, 0, 0.001, 0]; const dt = 0.5, out: number[] = []; const f = (q: number[]) => { const inf = beta * q[0] * q[2]; return [-inf, inf - sigma * q[1], sigma * q[1] - gamma * q[2], gamma * q[2]]; };
  for (let d = 0; d < days; d++) { for (let k = 0; k < 2; k++) { const a = f(y), b = f(y.map((v, i) => v + dt / 2 * a[i])), cc = f(y.map((v, i) => v + dt / 2 * b[i])), e = f(y.map((v, i) => v + dt * cc[i])); y = y.map((v, i) => v + dt / 6 * (a[i] + 2 * b[i] + 2 * cc[i] + e[i])); } out.push(y[2]); } return out; }
VIZ.fan = { ...STEP,
  title: 'An ensemble: one epidemic per set of inputs', eq: 'band = 10th to 90th percentile of the runs, day by day &nbsp;|&nbsp; line = median',
  note: '80 runs. Invented inputs: β ~ N(0.5, 0.1), σ ~ N(0.2, 0.04), γ ~ N(0.1, 0.02). Posterior: a normal approximation of the s5p7 fake-data posterior (β ≈ 0.42 ± 0.02, γ ≈ 0.14 ± 0.014, moving together).', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'posterior', label: 'inputs', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'posterior draws' : 'invented bell curves') }],
  init(P: any) {
    const R = rng(9), runs: number[][] = [];
    for (let k = 0; k < 80; k++) {
      let b: number, s: number, g: number;
      if (P.posterior) { const z1 = R.normal(), z2 = 0.9 * z1 + Math.sqrt(1 - 0.81) * R.normal(); b = 0.423 + 0.022 * z1; g = 0.14 + 0.014 * z2; s = 1 / 5.2; }
      else { b = Math.max(0.15, 0.5 + 0.1 * R.normal()); s = Math.max(0.08, 0.2 + 0.04 * R.normal()); g = Math.max(0.04, 0.1 + 0.02 * R.normal()); }
      runs.push(seirFrac(b, s, g));
    }
    return { runs };
  },
  draw(c: VizCtx, S: any) {
    c.view(0, 250, 0, 0.45); c.grid(5, 3); c.axes('day', 'share infectious'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    S.runs.forEach((r: number[]) => c.path(r.map((v, d) => [d, v] as [number, number]), 'rgba(140,160,200,.18)', 1));
    const lo: [number, number][] = [], hi: [number, number][] = [], md: [number, number][] = [];
    for (let d = 0; d < 250; d += 2) { const col = S.runs.map((r: number[]) => r[d]); lo.push([d, percentile(col, 10)]); hi.push([d, percentile(col, 90)]); md.push([d, percentile(col, 50)]); }
    c.ctx.fillStyle = 'rgba(88,166,255,.22)'; c.ctx.beginPath(); lo.forEach(([x, y], i) => (i ? c.ctx.lineTo(c.X(x), c.Y(y)) : c.ctx.moveTo(c.X(x), c.Y(y)))); hi.slice().reverse().forEach(([x, y]) => c.ctx.lineTo(c.X(x), c.Y(y))); c.ctx.fill();
    c.path(md, QC.energy, 2.4, 6);
  },
  stats(S: any) { const pk = S.runs.map((r: number[]) => Math.max(...r)); return [['peak 10th–90th', `${percentile(pk, 10).toFixed(2)}–${percentile(pk, 90).toFixed(2)}`, QC.pos], ['median of peaks', percentile(pk, 50).toFixed(2), QC.energy]]; },
};

VIZ.cores = { ...STEP,
  title: 'Speedup against cores: why it is never perfect', eq: 'Amdahl: speedup = 1 / (s + (1 − s)/p), s = the share that cannot run in parallel',
  note: 'Dashed: perfect speedup. Dots: real measurements on our 2-core machine (implicit heat step 2.0×, explicit 0.83×). The curve is Amdahl’s law for your chosen serial share.', h: 280, autoplay: false,
  params: [{ k: 's', label: 'serial share s', min: 0, max: 0.5, val: 0.1, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(1, 16, 0, 16); c.grid(5, 4); c.axes('cores p', 'speedup'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[1, 1], [16, 16]], 'rgba(230,237,243,.5)', 1.2); c.ctx.restore();
    const pts: [number, number][] = []; for (let p = 1; p <= 16; p += 0.25) pts.push([p, 1 / (P.s + (1 - P.s) / p)]); c.path(pts, QC.vel, 2.4, 6);
    c.dot(2, 2.0, 5, QC.pos, 8); c.dot(2, 0.83, 5, QC.warm, 8);
    c.legend([['Amdahl curve', QC.vel], ['implicit (measured)', QC.pos], ['explicit (measured)', QC.warm]]);
  },
  stats(_S: any, P: any) { return [['speedup on 4', (1 / (P.s + (1 - P.s) / 4)).toFixed(2), QC.vel], ['on 16', (1 / (P.s + (1 - P.s) / 16)).toFixed(2), QC.vel], ['limit', P.s ? (1 / P.s).toFixed(1) : '∞', QC.dim]]; },
};

/* ================= s5p4 ================= */
function peakSmall(alpha: number, hot: number) { const n = 40, u = new Float64Array(n * n), a = Math.floor(n / 2 - hot / 2); for (let i = a; i < a + hot; i++) for (let j = a; j < a + hot; j++) u[i * n + j] = 100; let v = new Float64Array(n * n);
  for (let s = 0; s < 100; s++) { for (let i = 1; i < n - 1; i++) for (let j = 1; j < n - 1; j++) { const k = i * n + j; v[k] = u[k] + 0.2 * alpha * (u[k - n] + u[k + n] + u[k - 1] + u[k + 1] - 4 * u[k]); } for (let k = 0; k < n * n; k++) u[k] = v[k]; v = new Float64Array(n * n); }
  return u[(n / 2) * n + n / 2]; }
VIZ.surrogate = { ...STEP,
  title: 'The slow model, sampled with a Latin hypercube', eq: 'one point in every row-slice and every column-slice &nbsp;|&nbsp; colour = centre temperature',
  note: 'Same physics as your truth model on a smaller grid (40 × 40, 100 steps) so it runs here. Hot size is scaled to fit.', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'n', label: 'runs', min: 5, max: 40, val: 20, step: 5, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { const R = rng(1), n = P.n, perm = () => { const a = Array.from({ length: n }, (_, i) => (i + R.u()) / n); for (let i = n - 1; i > 0; i--) { const j = Math.floor(R.u() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }; const c0 = perm(), c1 = perm(); return { pts: c0.map((u, i) => { const al = 0.2 + 0.8 * u, hs = Math.round(2 + 14 * c1[i]); return [u, c1[i], peakSmall(al, hs)]; }) }; },
  draw(c: VizCtx, S: any, P: any) {
    c.view(0, 1, 0, 1); c.grid(P.n, P.n); c.axes('alpha (0.2 → 1.0)', 'hot size'); c.ticks(false, false as any);
    const mx = Math.max(...S.pts.map((p: number[]) => p[2])); S.pts.forEach((p: number[]) => { const t = p[2] / mx; c.dot(p[0], p[1], 6, `rgb(${Math.round(60 + 195 * t)},${Math.round(80 + 80 * t)},${Math.round(200 - 150 * t)})`, 6); });
  },
  stats(S: any) { const v = S.pts.map((p: number[]) => p[2]); return [['coolest centre', Math.min(...v).toFixed(1), QC.pos], ['hottest centre', Math.max(...v).toFixed(1), QC.bad]]; },
};

function gpFit(X: number[], Y: number[], ls = 0.5, amp = 1, noise = 1e-6) {
  const n = X.length, mY = Y.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(Y.reduce((a, b) => a + (b - mY) ** 2, 0) / n) || 1, y = Y.map(v => (v - mY) / sd), k = (a: number, b: number) => amp * Math.exp(-((a - b) ** 2) / (2 * ls * ls));
  const K = X.map((a, i) => X.map((b, j) => k(a, b) + (i === j ? noise : 0))), L = K.map(r => r.map(() => 0));
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) { let s = K[i][j]; for (let q = 0; q < j; q++) s -= L[i][q] * L[j][q]; L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j]; }
  const solve = (b: number[]) => { const z = b.slice(); for (let i = 0; i < n; i++) { for (let q = 0; q < i; q++) z[i] -= L[i][q] * z[q]; z[i] /= L[i][i]; } for (let i = n - 1; i >= 0; i--) { for (let q = i + 1; q < n; q++) z[i] -= L[q][i] * z[q]; z[i] /= L[i][i]; } return z; };
  const alpha = solve(y);
  return (x: number) => { const ks = X.map(a => k(x, a)), mean = ks.reduce((s, v, i) => s + v * alpha[i], 0), w = solve(ks), v = amp - ks.reduce((s, q, i) => s + q * w[i], 0); return [mY + sd * mean, sd * Math.sqrt(Math.max(v, 0))]; };
}
VIZ.gpband = { ...STEP,
  title: 'A Gaussian process: a prediction and its own error bar', eq: 'mean ± 2σ &nbsp;|&nbsp; RBF kernel, length 0.5',
  note: 'Truth (dashed): sin(3x) + x/2. Training points are drawn at random in 0–3; the band widens in gaps and beyond 3.', h: 280, autoplay: false, resetOnParam: true,
  params: [{ k: 'n', label: 'training points', min: 2, max: 15, val: 6, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { const R = rng(0), X = Array.from({ length: P.n }, () => 3 * R.u()).sort((a, b) => a - b); return { X, Y: X.map(x => Math.sin(3 * x) + 0.5 * x), f: gpFit(X, X.map(x => Math.sin(3 * x) + 0.5 * x)) }; },
  draw(c: VizCtx, S: any) {
    c.view(-0.2, 4.5, -2.5, 4); c.grid(5, 4); c.axes('x', 'y'); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    const xs = Array.from({ length: 200 }, (_, i) => -0.2 + 4.7 * i / 199), pr = xs.map(x => S.f(x));
    c.ctx.fillStyle = 'rgba(88,166,255,.22)'; c.ctx.beginPath(); xs.forEach((x, i) => (i ? c.ctx.lineTo(c.X(x), c.Y(pr[i][0] + 2 * pr[i][1])) : c.ctx.moveTo(c.X(x), c.Y(pr[i][0] + 2 * pr[i][1])))); xs.slice().reverse().forEach((x, i) => { const k = xs.length - 1 - i; c.ctx.lineTo(c.X(x), c.Y(pr[k][0] - 2 * pr[k][1])); }); c.ctx.fill();
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path(xs.map(x => [x, Math.sin(3 * x) + 0.5 * x] as [number, number]), 'rgba(230,237,243,.6)', 1.2); c.ctx.restore();
    c.path(xs.map((x, i) => [x, pr[i][0]] as [number, number]), QC.pos, 2.2, 6); S.X.forEach((x: number, i: number) => c.dot(x, S.Y[i], 4.5, QC.energy, 8));
  },
  stats(S: any) { return [['σ at x = 4.5', S.f(4.5)[1].toFixed(2), QC.warm], ['σ at a training point', S.f(S.X[0])[1].toExponential(1), QC.vel]]; },
};

/* ================= s5p5 ================= */
VIZ.gdd = { ...STEP,
  title: 'Growing degree days: warmth above a base, added up', eq: 'GDD = Σ max(0, T_day − base)',
  note: 'Synthetic year of daily mean temperatures (a seasonal wave plus noise).', h: 260, autoplay: false,
  params: [{ k: 'base', label: 'base (°C)', min: 5, max: 20, val: 10, step: 0.5, fmt: (v: number) => v.toFixed(1) }],
  init() { const R = rng(2); return { T: Array.from({ length: 365 }, (_, d) => 15 + 6 * Math.sin(2 * Math.PI * (d - 100) / 365) + 1.8 * R.normal()) }; },
  draw(c: VizCtx, S: any, P: any) {
    c.view(0, 365, 0, 28); c.grid(6, 4); c.axes('day of year', '°C'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    S.T.forEach((t: number, d: number) => { if (t > P.base) { c.ctx.fillStyle = 'rgba(227,179,65,.55)'; c.ctx.fillRect(c.X(d), c.Y(t), Math.max(1, c.X(1) - c.X(0)), c.Y(P.base) - c.Y(t)); } });
    c.path(S.T.map((t: number, d: number) => [d, t] as [number, number]), QC.pos, 1.4); c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[0, P.base], [365, P.base]], QC.bad, 1.4); c.ctx.restore();
  },
  stats(S: any, P: any) { return [['GDD', S.T.reduce((a: number, t: number) => a + Math.max(0, t - P.base), 0).toFixed(0), QC.energy], ['days above base', S.T.filter((t: number) => t > P.base).length, QC.dim]]; },
};

VIZ.loyo = { ...STEP,
  title: 'Leave one year out: the honest test for a short record', eq: 'for each year: fit on the others, predict it &nbsp;|&nbsp; compare with “predict the mean”',
  note: 'Synthetic: 25 years where yield depends weakly on season rain, plus noise.', h: 290, stepBtn: true,
  init() { const R = rng(12), rain = Array.from({ length: 25 }, () => 300 + 120 * R.normal()), y = rain.map(r => 1500 + 1.2 * r + 260 * R.normal()); return { rain, y, k: -1, pred: [] as number[], base: [] as number[] }; },
  stepOnce(S: any) { if (S.k >= 24) return; S.k++; const idx = S.rain.map((_: number, i: number) => i).filter((i: number) => i !== S.k), xm = idx.reduce((a: number, i: number) => a + S.rain[i], 0) / idx.length, ym = idx.reduce((a: number, i: number) => a + S.y[i], 0) / idx.length, b = idx.reduce((a: number, i: number) => a + (S.rain[i] - xm) * (S.y[i] - ym), 0) / idx.reduce((a: number, i: number) => a + (S.rain[i] - xm) ** 2, 0); S.pred.push(ym + b * (S.rain[S.k] - xm)); S.base.push(ym); S.line = [xm, ym, b]; },
  step(S: any) { S.tick = (S.tick ?? 0) + 1; if (S.tick % 30 === 0) VIZ.loyo.stepOnce!(S, null, null as any); },
  draw(c: VizCtx, S: any) {
    c.view(0, 650, 1200, 3200); c.grid(5, 4); c.axes('season rain (mm)', 'yield (kg/ha)'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    S.rain.forEach((r: number, i: number) => c.dot(r, S.y[i], i === S.k ? 7 : 4, i === S.k ? QC.warm : QC.pos, i === S.k ? 10 : 0));
    if (S.line) { const [xm, ym, b] = S.line; c.path([[0, ym - b * xm], [650, ym + b * (650 - xm)]], QC.vel, 1.8); c.dot(S.rain[S.k], S.pred.at(-1), 5, QC.vel, 8); }
  },
  stats(S: any) { const n = S.pred.length; if (!n) return [['press Step', '', QC.dim]]; const e = (p: number[]) => Math.sqrt(p.reduce((a, v, i) => a + (v - S.y[i]) ** 2, 0) / n); return [['years tested', n, QC.dim], ['model RMSE', e(S.pred).toFixed(0), QC.vel], ['mean-only RMSE', e(S.base).toFixed(0), QC.energy]]; },
};

/* ================= s5p6 shallow water ================= */
const G = 9.81, DRY = 1e-6;
export function ritterJS(x: number, t: number, h0 = 1) { const c0 = Math.sqrt(G * h0), xi = x / t; return xi <= -c0 ? h0 : xi >= 2 * c0 ? 0 : (2 * c0 - xi) ** 2 / (9 * G); }
function rus(hL: number, qL: number, hR: number, qR: number) { const uL = hL > DRY ? qL / hL : 0, uR = hR > DRY ? qR / hR : 0, a = Math.max(Math.abs(uL) + Math.sqrt(G * hL), Math.abs(uR) + Math.sqrt(G * hR)); return [0.5 * (hL * uL + hR * uR) - 0.5 * a * (hR - hL), 0.5 * (hL * uL * uL + 0.5 * G * hL * hL + hR * uR * uR + 0.5 * G * hR * hR) - 0.5 * a * (hR * uR - hL * uL), a]; }
export function dam1d(n: number, tEnd: number) {
  const dx = 10 / n, x = Array.from({ length: n }, (_, i) => -5 + (i + 0.5) * dx); let h: number[] = x.map(v => (v < 0 ? 1 : 0)), q: number[] = new Array(n).fill(0), t = 0;
  while (t < tEnd) { const hp = [h[0], ...h, h[n - 1]], qp = [-q[0], ...q, -q[n - 1]], F: number[][] = []; let a = 0; for (let i = 0; i <= n; i++) { const f = rus(hp[i], qp[i], hp[i + 1], qp[i + 1]); F.push(f); a = Math.max(a, f[2]); } const dt = 0.45 * dx / a; h = h.map((v, i) => Math.max(0, v - dt / dx * (F[i + 1][0] - F[i][0]))); q = q.map((v, i) => (h[i] > DRY ? v - dt / dx * (F[i + 1][1] - F[i][1]) : 0)); t += dt; }
  return { x, h, t };
}
VIZ.dambreak = { ...STEP,
  title: 'A dam bursts: finite volumes against Ritter’s exact answer', eq: 'face flux = average − ½·a·jump (Rusanov) &nbsp;|&nbsp; dt = 0.45·Δx / fastest wave',
  note: '10 m channel, walls at both ends, 1 m of water on the left. White: Ritter (1892).', h: 280, resetOnParam: true,
  params: [{ k: 'n', label: 'cells', min: 50, max: 800, val: 100, step: 50, fmt: (v: number) => v.toFixed(0) }],
  init() { return { t: 0.02 }; },
  step(S: any) { S.t += 0.01; if (S.t > 0.75) S.t = 0.02; },
  draw(c: VizCtx, S: any, P: any) {
    const R = dam1d(P.n, S.t); S.err = R.h.reduce((a, v, i) => a + Math.abs(v - ritterJS(R.x[i], R.t)), 0) / P.n;
    c.view(-5, 5, 0, 1.15); c.grid(5, 4); c.axes('x (m)', 'depth (m)'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    c.ctx.fillStyle = 'rgba(88,166,255,.35)'; c.ctx.beginPath(); c.ctx.moveTo(c.X(-5), c.Y(0)); R.x.forEach((x, i) => c.ctx.lineTo(c.X(x), c.Y(R.h[i]))); c.ctx.lineTo(c.X(5), c.Y(0)); c.ctx.fill();
    const ex: [number, number][] = []; for (let i = 0; i <= 300; i++) { const x = -5 + 10 * i / 300; ex.push([x, ritterJS(x, R.t)]); } c.path(ex, 'rgba(240,240,240,.9)', 1.6);
    S.tt = R.t;
  },
  stats(S: any) { return [['time', `${(S.tt ?? S.t).toFixed(2)} s`, QC.dim], ['mean |error|', (S.err ?? 0).toFixed(4), QC.energy]]; },
};

function valley(n: number) { const z = new Float64Array(n * n); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = j / (n - 1), y = i / (n - 1); z[i * n + j] = 30 * Math.abs(x - 0.5 - 0.08 * Math.sin(6 * y)) + 25 * y + 6 * Math.sin(9 * x) * Math.cos(7 * y); } return z; }
VIZ.terrain = { ...STEP,
  title: 'An elevation grid, shaded so you can read the shape', eq: 'height = metres above sea level &nbsp;|&nbsp; light from the north-west',
  note: 'Synthetic valley (your real DEM will look rougher).', h: 300, autoplay: false,
  init() { return { n: 60, z: valley(60) }; },
  draw(c: VizCtx, S: any) { const n = S.n, z = S.z, lo = Math.min(...z), hi = Math.max(...z), side = Math.min(c.H - 16, c.W - 20), x0 = (c.W - side) / 2;
    cells(c, x0, 8, side, side, n, n, (i, j) => { const t = (z[i * n + j] - lo) / (hi - lo), sh = clamp(0.75 + 0.06 * ((z[i * n + Math.max(0, j - 1)] - z[i * n + Math.min(n - 1, j + 1)]) + (z[Math.max(0, i - 1) * n + j] - z[Math.min(n - 1, i + 1) * n + j])), 0.35, 1.2); return `rgb(${Math.round((70 + 120 * t) * sh)},${Math.round((140 - 40 * t) * sh)},${Math.round((70 + 40 * t) * sh)})`; }); },
  stats(S: any) { return [['lowest', Math.min(...S.z).toFixed(0) + ' m', QC.pos], ['highest', Math.max(...S.z).toFixed(0) + ' m', QC.warm]]; },
};

/** 2D shallow water with hydrostatic reconstruction (same scheme as the guide), on a JS grid. */
function sweepX(n: number, z: Float64Array, h: Float64Array, hu: Float64Array, hv: Float64Array, tr: boolean) {
  const id = (i: number, j: number) => (tr ? j * n + i : i * n + j), dh = new Float64Array(n * n), dhu = new Float64Array(n * n), dhv = new Float64Array(n * n); let amax = 0;
  for (let i = 0; i < n; i++) { let prev: number[] | null = null;
    for (let f = 0; f <= n; f++) {
      const L = f - 1, Rr = f, li = id(i, Math.max(L, 0)), ri = id(i, Math.min(Rr, n - 1)), zL = z[li], zR = z[ri], hL = h[li], hR = h[ri];
      const uL = hL > DRY ? (L < 0 ? -hu[li] : hu[li]) / hL : 0, uR = hR > DRY ? (Rr >= n ? -hu[ri] : hu[ri]) / hR : 0, vL = hL > DRY ? hv[li] / hL : 0, vR = hR > DRY ? hv[ri] / hR : 0;
      const zs = Math.max(zL, zR), hLs = Math.max(0, hL + zL - zs), hRs = Math.max(0, hR + zR - zs), [fh, fq, a] = rus(hLs, hLs * uL, hRs, hRs * uR); amax = Math.max(amax, a);
      const fv = fh * (fh > 0 ? vL : vR), fqL = fq + 0.5 * G * (hL * hL - hLs * hLs), fqR = fq + 0.5 * G * (hR * hR - hRs * hRs);
      if (prev && L >= 0) { const k = id(i, L); dh[k] = fh - prev[0]; dhu[k] = fqL - prev[1]; dhv[k] = fv - prev[2]; }
      prev = [fh, fqR, fv];
    } }
  return { dh, dhu, dhv, amax };
}
export function flowStep(n: number, z: Float64Array, S: { h: Float64Array; hu: Float64Array; hv: Float64Array }, dx: number) {
  const X = sweepX(n, z, S.h, S.hu, S.hv, false), Y = sweepX(n, z, S.h, S.hv, S.hu, true), dt = Math.min(10, 0.45 * dx / Math.max(X.amax, Y.amax, 1e-9));
  for (let k = 0; k < n * n; k++) { const h2 = Math.max(0, S.h[k] - dt / dx * (X.dh[k] + Y.dh[k])); let hu2 = S.hu[k] - dt / dx * (X.dhu[k] + Y.dhv[k]), hv2 = S.hv[k] - dt / dx * (X.dhv[k] + Y.dhu[k]);
    if (h2 > DRY) { const sp = Math.hypot(hu2, hv2) / h2, kk = 1 + dt * G * 0.03 * 0.03 * sp / h2 ** (4 / 3); hu2 /= kk; hv2 /= kk; } else { hu2 = 0; hv2 = 0; }
    S.h[k] = h2; S.hu[k] = hu2; S.hv[k] = hv2; }
  return dt;
}
VIZ.flood2d = { ...STEP,
  title: 'A river enters a valley: water follows the ground, in real seconds', eq: 'hydrostatic reconstruction + Rusanov + Manning n = 0.03 &nbsp;|&nbsp; dt from the CFL rule',
  note: 'Synthetic 40 × 40 valley, 50 m cells; a river of Q m³/s enters at the top of the valley floor.', h: 310, resetOnParam: true,
  params: [{ k: 'Q', label: 'river Q (m³/s)', min: 5, max: 200, val: 50, step: 5, fmt: (v: number) => v.toFixed(0) }],
  init() { const n = 40; return { n, z: valley(n), h: new Float64Array(n * n), hu: new Float64Array(n * n), hv: new Float64Array(n * n), t: 0, added: 0 }; },
  step(S: any, _dt: number, P: any) {
    if (S.t > 3 * 3600) return; const dx = 50;
    for (let k = 0; k < 4; k++) { let src = 0, best = Infinity; for (let j = 0; j < S.n; j++) if (S.z[j] < best) { best = S.z[j]; src = j; } const dt = flowStep(S.n, S.z, S, dx); S.h[src] += P.Q * dt / (dx * dx); S.added += P.Q * dt; S.t += dt; }
  },
  draw(c: VizCtx, S: any) { const n = S.n, lo = Math.min(...S.z), hi = Math.max(...S.z), side = Math.min(c.H - 16, c.W - 20), x0 = (c.W - side) / 2;
    cells(c, x0, 8, side, side, n, n, (i, j) => { const k = i * n + j, d = S.h[k]; if (d > 0.05) { const t = clamp(d / 3, 0, 1); return `rgb(${Math.round(40 - 20 * t)},${Math.round(110 + 20 * t)},${Math.round(200 + 55 * t)})`; } const tt = (S.z[k] - lo) / (hi - lo); return `rgb(${Math.round(70 + 110 * tt)},${Math.round(130 - 30 * tt)},${Math.round(70 + 30 * tt)})`; }); },
  stats(S: any) { const vol = S.h.reduce((a: number, b: number) => a + b, 0) * 2500, hh = Math.floor(S.t / 3600), mm = Math.floor((S.t % 3600) / 60); return [['simulated time', `${hh} h ${mm} min`, QC.dim], ['volume added', `${(S.added / 1000).toFixed(1)} thousand m³`, QC.energy], ['on the map', `${(vol / 1000).toFixed(1)} thousand m³`, QC.vel]]; },
};

/* ================= s5p7 Bayes ================= */
export function weeklyJS(beta: number, gamma: number, weeks = 30) { const N = 1e6, sg = 1 / 5.2; let S = N - 100, E = 0, I = 100, R = 0, prev = I + R; const out: number[] = [], f = (S: number, E: number, I: number) => { const inf = beta * S * I / N; return [-inf, inf - sg * E, sg * E - gamma * I, gamma * I]; };
  for (let w = 0; w < weeks; w++) { for (let s = 0; s < 7; s++) { const a = f(S, E, I), b = f(S + a[0] / 2, E + a[1] / 2, I + a[2] / 2), cc = f(S + b[0] / 2, E + b[1] / 2, I + b[2] / 2), d = f(S + cc[0], E + cc[1], I + cc[2]); S += (a[0] + 2 * b[0] + 2 * cc[0] + d[0]) / 6; E += (a[1] + 2 * b[1] + 2 * cc[1] + d[1]) / 6; I += (a[2] + 2 * b[2] + 2 * cc[2] + d[2]) / 6; R += (a[3] + 2 * b[3] + 2 * cc[3] + d[3]) / 6; } out.push(I + R - prev); prev = I + R; }
  return out; }
function poissonDraws(mu: number[], seed: number) { const R = rng(seed); return mu.map(m => { if (m < 30) { let k = 0, p = Math.exp(-m), s = p; const u = R.u(); while (u > s && k < 200) { k++; p *= m / k; s += p; } return k; } return Math.max(0, Math.round(m + Math.sqrt(m) * R.normal())); }); }
const OBS = poissonDraws(weeklyJS(0.4, 0.125).map(v => 0.02 * v), 0);
function loglikProfile(beta: number, gamma: number) { const m = weeklyJS(beta, gamma), rho = OBS.reduce((a, b) => a + b, 0) / m.reduce((a, b) => a + b, 0); return OBS.reduce((s, o, i) => { const mu = Math.max(rho * m[i], 1e-9); return s + o * Math.log(mu) - mu; }, 0); }
VIZ.likelihood = { ...STEP,
  title: 'The likelihood surface over β and γ', eq: 'log L = Σ (o·log μ − μ) &nbsp;|&nbsp; μ = ρ·model, ρ at its best value &nbsp;|&nbsp; prior on γ: N(0.125, 0.01)',
  note: 'Fake weekly data made with β = 0.4, γ = 0.125, ρ = 0.02 (white cross). Bright = more probable. The line marks the slice shown on the right.', h: 300, autoplay: false,
  params: [{ k: 'gamma', label: 'slice at γ', min: 0.08, max: 0.2, val: 0.125, step: 0.005, fmt: (v: number) => v.toFixed(3) }, { k: 'prior', label: 'prior on γ', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'informative N(0.125, 0.01)' : 'flat') }],
  init() { const nb = 34, ng = 30, grid: number[][] = []; for (let i = 0; i < ng; i++) { grid.push([]); for (let j = 0; j < nb; j++) grid[i].push(loglikProfile(0.3 + 0.25 * j / (nb - 1), 0.08 + 0.12 * i / (ng - 1))); } return { grid, nb, ng }; },
  draw(c: VizCtx, S: any, P: any) {
    const prior = (g: number) => (P.prior ? -0.5 * ((g - 0.125) / 0.01) ** 2 : 0), vals = S.grid.map((r: number[], i: number) => r.map(v => v + prior(0.08 + 0.12 * i / (S.ng - 1)))), mx = Math.max(...vals.flat());
    const side = Math.min(c.H - 30, c.W * 0.48), x0 = 12, y0 = 8;
    cells(c, x0, y0, side, side, S.ng, S.nb, (i, j) => { const d = mx - vals[S.ng - 1 - i][j], t = clamp(1 - Math.log10(1 + d) / 4, 0, 1); return `rgb(${Math.round(15 + 230 * t)},${Math.round(20 + 180 * t * t)},${Math.round(40 + 60 * t)})`; });
    const bx = (b: number) => x0 + (b - 0.3) / 0.25 * side, gy = (g: number) => y0 + side - (g - 0.08) / 0.12 * side;
    c.ctx.strokeStyle = '#fff'; c.ctx.lineWidth = 2; c.ctx.beginPath(); c.ctx.moveTo(bx(0.4) - 6, gy(0.125)); c.ctx.lineTo(bx(0.4) + 6, gy(0.125)); c.ctx.moveTo(bx(0.4), gy(0.125) - 6); c.ctx.lineTo(bx(0.4), gy(0.125) + 6); c.ctx.stroke(); c.ctx.lineWidth = 1;
    c.ctx.strokeStyle = QC.energy; c.ctx.beginPath(); c.ctx.moveTo(x0, gy(P.gamma)); c.ctx.lineTo(x0 + side, gy(P.gamma)); c.ctx.stroke();
    c.txt(x0, y0 + side + 16, 'β 0.30 → 0.55   (γ up)', QC.dim, 11);
    const o = c.pads(side + 60, 14, 14, 28); const coarse = Array.from({ length: 60 }, (_, k) => 0.3 + 0.25 * k / 59), cl = coarse.map(b => loglikProfile(b, P.gamma)), b0 = coarse[cl.indexOf(Math.max(...cl))], bs = Array.from({ length: 80 }, (_, k) => b0 - 0.02 + 0.04 * k / 79), ll = bs.map(b => loglikProfile(b, P.gamma) + prior(P.gamma)), m2 = Math.max(...ll);
    c.view(b0 - 0.02, b0 + 0.02, 0, 1.05); c.grid(4, 2); c.axes('β (zoomed)', 'relative likelihood'); c.ticks(v => v.toFixed(3), v => v.toFixed(1)); c.path(bs.map((b, k) => [b, Math.exp(ll[k] - m2)] as [number, number]), QC.vel, 2.2, 6); c.unpad(o);
  },
  stats(_S: any, P: any) { const bs = Array.from({ length: 120 }, (_, k) => 0.3 + 0.25 * k / 119), ll = bs.map(b => loglikProfile(b, P.gamma)); return [['best β at this γ', bs[ll.indexOf(Math.max(...ll))].toFixed(3), QC.vel], ['R₀ = β/γ', (bs[ll.indexOf(Math.max(...ll))] / P.gamma).toFixed(2), QC.energy]]; },
};

VIZ.metropolis = { ...STEP,
  title: 'Metropolis on a narrow, tilted ridge', eq: 'propose x + step; accept with probability min(1, p(new)/p(old)) &nbsp;|&nbsp; shaped steps use the pilot’s covariance',
  note: 'Target: a correlated normal (correlation 0.98), like β and γ. Dots are accepted positions.', h: 300, resetOnParam: true,
  params: [{ k: 'shaped', label: 'proposal', min: 0, max: 1, val: 0, step: 1, fmt: (v: number) => (v ? 'shaped like the ridge' : 'round, fixed size') }],
  init() { return { R: rng(4), x: [2.5, -2.5], pts: [] as number[][], acc: 0, tot: 0 }; },
  step(S: any, _dt: number, P: any) {
    const rho = 0.98, lp = (v: number[]) => -0.5 * (v[0] ** 2 - 2 * rho * v[0] * v[1] + v[1] ** 2) / (1 - rho * rho);
    for (let k = 0; k < 6; k++) { let y: number[]; if (P.shaped) { const z1 = S.R.normal(), z2 = S.R.normal(), s = 2.38 / Math.SQRT2; y = [S.x[0] + s * z1, S.x[1] + s * (rho * z1 + Math.sqrt(1 - rho * rho) * z2)]; } else { y = [S.x[0] + 0.8 * S.R.normal(), S.x[1] + 0.8 * S.R.normal()]; }
      S.tot++; if (Math.log(S.R.u()) < lp(y) - lp(S.x)) { S.x = y; S.acc++; } S.pts.push(S.x.slice()); if (S.pts.length > 1500) S.pts.shift(); }
  },
  draw(c: VizCtx, S: any) {
    c.view(-4, 4, -4, 4, true); c.grid(4, 4); c.axes('β (scaled)', 'γ (scaled)'); c.ticks(false, false as any);
    c.ctx.strokeStyle = 'rgba(227,179,65,.35)'; for (const r of [1, 2, 3]) { c.ctx.beginPath(); for (let a = 0; a <= 64; a++) { const t = (a / 64) * 2 * Math.PI, u = r * Math.sqrt(1.98) * Math.cos(t), v = r * Math.sqrt(0.02) * Math.sin(t), X = c.X((u - v) / Math.SQRT2), Y = c.Y((u + v) / Math.SQRT2); a ? c.ctx.lineTo(X, Y) : c.ctx.moveTo(X, Y); } c.ctx.stroke(); }
    S.pts.forEach((p: number[]) => c.dot(p[0], p[1], 1.6, 'rgba(88,166,255,.7)')); c.dot(S.x[0], S.x[1], 5, QC.warm, 8);
  },
  stats(S: any) { return [['accepted', S.tot ? (100 * S.acc / S.tot).toFixed(0) + '%' : '—', QC.energy], ['steps', S.tot, QC.dim]]; },
};

export function rhat(chains: number[][]) { const n = chains[0].length, means = chains.map(c => c.reduce((a, b) => a + b, 0) / n), vars = chains.map((c, i) => c.reduce((a, b) => a + (b - means[i]) ** 2, 0) / (n - 1)), W = vars.reduce((a, b) => a + b, 0) / chains.length, mm = means.reduce((a, b) => a + b, 0) / chains.length, B = n * means.reduce((a, b) => a + (b - mm) ** 2, 0) / (chains.length - 1); return Math.sqrt(((n - 1) / n * W + B / n) / W); }
VIZ.traces = { ...STEP,
  title: 'Four chains, four starting points, one answer', eq: 'R̂ compares the spread within chains to the spread between them: near 1 means they agree',
  note: 'Target: β’s posterior from the fake-data fit (about 0.42 ± 0.02). The chains start far apart on purpose.', h: 290,
  init() { const R = rng(7); return { R, x: [0.3, 0.55, 0.35, 0.5], ch: [[], [], [], []] as number[][], n: 0 }; },
  step(S: any) { const lp = (b: number) => -0.5 * ((b - 0.423) / 0.022) ** 2; if (S.n > 1500) return;
    for (let k = 0; k < 4; k++) { for (let c = 0; c < 4; c++) { const y = S.x[c] + 0.02 * S.R.normal(); if (Math.log(S.R.u()) < lp(y) - lp(S.x[c])) S.x[c] = y; S.ch[c].push(S.x[c]); } S.n++; } },
  draw(c: VizCtx, S: any) {
    c.view(0, 1500, 0.28, 0.58); c.grid(5, 3); c.axes('step', 'β'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    const cols = [QC.pos, QC.warm, QC.vel, QC.mag]; S.ch.forEach((ch: number[], i: number) => c.path(ch.map((v, k) => [k, v] as [number, number]), cols[i], 1.2));
  },
  stats(S: any) { if (S.n < 40) return [['R̂', '…', QC.dim]]; const half = Math.floor(S.n / 2), r = rhat(S.ch.map((c: number[]) => c.slice(half))); return [['steps', S.n, QC.dim], ['R̂ (second half)', r.toFixed(3), r < 1.05 ? QC.vel : QC.warm]]; },
};

export const STEP_WIDGETS_5 = ['nbody', 'scaling', 'quadtree', 'fan', 'cores', 'surrogate', 'gpband', 'gdd', 'loyo', 'dambreak', 'terrain', 'flood2d', 'likelihood', 'metropolis', 'traces'];
