/** Stage 2 step visuals. All numbers are computed live; synthetic data is labelled. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng, fft, dft } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const T = (c: VizCtx, x: number, y: number, t: string, col = '#c8d2e0', size = 12, align: CanvasTextAlign = 'left') => c.txt(x, y, t, col, size, align);
const lg = (v: number) => Math.log10(Math.max(v, 1e-17));

/* ---------- s2p1 ---------- */
export function solve2(eps: number, pivot: boolean) {
  let A = [[eps, 1, 1], [1, 1, 2]];
  if (pivot && Math.abs(A[1][0]) > Math.abs(A[0][0])) A = [A[1], A[0]];
  const f = A[1][0] / A[0][0]; const r1 = A[1].map((v, k) => v - f * A[0][k]);
  const x2 = r1[2] / r1[1]; const x1 = (A[0][2] - A[0][1] * x2) / A[0][0];
  return [x1, x2, f];
}
VIZ.pivot = { ...STEP,
  title: 'A tiny pivot destroys the answer; swapping rows saves it', eq: '[ε 1; 1 1]·x = [1; 2] &nbsp;|&nbsp; true x ≈ (1, 1) &nbsp;|&nbsp; naive factor = 1/ε',
  note: '', h: 260, autoplay: false,
  params: [{ k: 'p', label: 'ε = 10^−p', min: 1, max: 20, val: 20, step: 1, fmt: (v: number) => `1e-${v}` }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(1, 20, -17, 1); c.grid(19, 6); c.axes('p', 'log₁₀ error in x₁'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    const naive: [number, number][] = [], piv: [number, number][] = [];
    for (let p = 1; p <= 20; p += 0.25) { const e = 10 ** -p, tru = 1 / (1 - e); naive.push([p, lg(Math.abs(solve2(e, false)[0] - tru))]); piv.push([p, lg(Math.abs(solve2(e, true)[0] - tru))]); }
    c.path(naive, QC.bad, 2, 6); c.path(piv, QC.vel, 2, 6);
    const e = 10 ** -P.p, tru = 1 / (1 - e);
    c.dot(P.p, lg(Math.abs(solve2(e, false)[0] - tru)), 6, QC.bad, 10); c.dot(P.p, lg(Math.abs(solve2(e, true)[0] - tru)), 6, QC.vel, 10);
    c.legend([['naive', QC.bad], ['pivoted', QC.vel]]);
  },
  stats(_S: any, P: any) { const e = 10 ** -P.p, n = solve2(e, false), q = solve2(e, true); return [['naive x', `(${n[0].toPrecision(4)}, ${n[1].toPrecision(4)})`, QC.bad], ['pivoted x', `(${q[0].toPrecision(4)}, ${q[1].toPrecision(4)})`, QC.vel], ['naive factor', n[2].toExponential(1), QC.dim]]; },
};

export const elimCount = (n: number) => ((n - 1) * n * (2 * n - 1)) / 6 + (n - 1) * n;
VIZ.flops = { ...STEP,
  title: 'Counting work: factorise once (≈ n³/3), solve again (≈ n²)', eq: 'elimination: Σ (n−1−c)(n−c+1) ≈ n³/3 &nbsp;|&nbsp; LU solve: n(n−1)',
  note: '', h: 260, autoplay: false,
  params: [{ k: 'lg', label: 'n = 10^x', min: 1, max: 3.5, val: 2, step: 0.05, fmt: (v: number) => Math.round(10 ** v).toString() }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(1, 3.5, 0, 11); c.grid(5, 5); c.axes('log₁₀ n', 'log₁₀ operations'); c.ticks(v => v.toFixed(1), v => v.toFixed(0));
    const a: [number, number][] = [], b: [number, number][] = [];
    for (let x = 1; x <= 3.5; x += 0.02) { const n = Math.round(10 ** x); a.push([x, lg(elimCount(n))]); b.push([x, lg(n * (n - 1))]); }
    c.path(a, QC.warm, 2.4, 8); c.path(b, QC.vel, 2.4, 8);
    const n = Math.round(10 ** P.lg); c.dot(P.lg, lg(elimCount(n)), 6, QC.warm, 10); c.dot(P.lg, lg(n * (n - 1)), 6, QC.vel, 10);
    c.legend([['eliminate (slope 3)', QC.warm], ['reuse LU (slope 2)', QC.vel]]);
  },
  stats(_S: any, P: any) { const n = Math.round(10 ** P.lg); return [['n', n, QC.dim], ['eliminate', elimCount(n).toLocaleString(), QC.warm], ['LU solve', (n * (n - 1)).toLocaleString(), QC.vel], ['ratio', (elimCount(n) / Math.max(1, n * (n - 1))).toFixed(0) + '×', QC.energy]]; },
};

/* ---------- s2p2 ---------- */
VIZ.mcconv = { ...STEP,
  title: 'Monte Carlo error against the number of darts', eq: 'mean |π̂ − π| over 20 seeds &nbsp;|&nbsp; slope on log–log axes ≈ −½',
  note: '', h: 260, autoplay: false,
  init() {
    const pts: [number, number][] = [];
    for (let e = 1; e <= 5; e += 0.5) { const N = Math.round(10 ** e); let err = 0; for (let s = 0; s < 20; s++) { const R = rng(1000 + s); let inside = 0; for (let i = 0; i < N; i++) { const x = R.u() * 2 - 1, y = R.u() * 2 - 1; if (x * x + y * y <= 1) inside++; } err += Math.abs((4 * inside) / N - Math.PI); } pts.push([e, Math.log10(err / 20)]); }
    const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
    return { pts, slope, b: my - slope * mx };
  },
  draw(c: VizCtx, S: any) {
    c.view(0.8, 5.2, -3.5, 0.5); c.grid(5, 4); c.axes('log₁₀ N', 'log₁₀ error'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    c.path([[0.8, S.b + S.slope * 0.8], [5.2, S.b + S.slope * 5.2]], 'rgba(227,179,65,.6)', 1.4);
    S.pts.forEach((p: number[]) => c.dot(p[0], p[1], 5, QC.accent, 8));
  },
  stats(S: any) { return [['measured slope', S.slope.toFixed(3), QC.energy], ['theory', '−0.5', QC.exact]]; },
};

const ballV = (d: number) => Math.PI ** (d / 2) / gamma(d / 2 + 1);
function gamma(z: number): number { return z === 1 ? 1 : z === 0.5 ? Math.sqrt(Math.PI) : (z - 1) * gamma(z - 1); }
function gridBall(d: number, m: number) {
  let inside = 0; const idx = new Array(d).fill(0); const g = (i: number) => -1 + ((i + 0.5) * 2) / m; const total = m ** d;
  for (let t = 0; t < total; t++) { let r2 = 0; for (let k = 0; k < d; k++) r2 += g(idx[k]) ** 2; if (r2 <= 1) inside++; for (let k = 0; k < d; k++) { idx[k]++; if (idx[k] < m) break; idx[k] = 0; } }
  return (inside / total) * 2 ** d;
}
VIZ.curse = { ...STEP,
  title: 'Grid against Monte Carlo as the dimension grows (same budget)', eq: 'grid: m = N^(1/d) points per axis &nbsp;|&nbsp; Monte Carlo error ∝ 1/√N in any dimension',
  note: 'Volume of the unit ball; exact value known in every dimension.', h: 270, autoplay: false, resetOnParam: true,
  params: [{ k: 'e', label: 'budget N = 10^x', min: 3, max: 5, val: 4, step: 1, fmt: (v: number) => `1e${v}` }],
  init(P: any) {
    const N = 10 ** P.e, rows: { d: number; g: number; m: number }[] = [];
    for (let d = 2; d <= 8; d++) {
      const m = Math.max(2, Math.floor(N ** (1 / d) + 1e-9)); const g = Math.abs(gridBall(d, m) - ballV(d)) / ballV(d);
      const R = rng(7 + d); let inside = 0; for (let i = 0; i < N; i++) { let r2 = 0; for (let k = 0; k < d; k++) { const x = R.u() * 2 - 1; r2 += x * x; } if (r2 <= 1) inside++; }
      rows.push({ d, g, m: Math.abs((inside / N) * 2 ** d - ballV(d)) / ballV(d) });
    }
    return { rows };
  },
  draw(c: VizCtx, S: any) {
    c.view(1.5, 8.5, -4, 0.5); c.grid(7, 5); c.axes('dimension d', 'log₁₀ relative error'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    c.path(S.rows.map((r: any) => [r.d, lg(r.g)] as [number, number]), QC.warm, 2.2, 6); c.path(S.rows.map((r: any) => [r.d, lg(r.m)] as [number, number]), QC.vel, 2.2, 6);
    S.rows.forEach((r: any) => { c.dot(r.d, lg(r.g), 4.5, QC.warm); c.dot(r.d, lg(r.m), 4.5, QC.vel); });
    c.legend([['grid (midpoints)', QC.warm], ['Monte Carlo', QC.vel]]);
  },
  stats(S: any) { const six = S.rows.find((r: any) => r.d === 6); return [['6D grid error', (six.g * 100).toFixed(2) + '%', QC.warm], ['6D MC error', (six.m * 100).toFixed(2) + '%', QC.vel]]; },
};

/* ---------- s2p3 ---------- */
/** Singular values by one-sided Jacobi (accurate for ill-conditioned matrices). */
export function singularValues(A: number[][]): number[] {
  const m = A.length, n = A[0].length; const U = A.map(r => r.slice());
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      let a = 0, b = 0, g = 0; for (let i = 0; i < m; i++) { a += U[i][p] ** 2; b += U[i][q] ** 2; g += U[i][p] * U[i][q]; }
      if (Math.abs(g) <= 1e-15 * Math.sqrt(a * b)) continue; off = Math.max(off, Math.abs(g) / Math.sqrt(a * b));
      const z = (b - a) / (2 * g), t = Math.sign(z || 1) / (Math.abs(z) + Math.sqrt(1 + z * z)), cs = 1 / Math.sqrt(1 + t * t), sn = cs * t;
      for (let i = 0; i < m; i++) { const x = U[i][p], y = U[i][q]; U[i][p] = cs * x - sn * y; U[i][q] = sn * x + cs * y; }
    }
    if (off < 1e-15) break;
  }
  return Array.from({ length: n }, (_, j) => Math.sqrt(U.reduce((s, r) => s + r[j] ** 2, 0))).sort((x, y) => y - x);
}
export const vander = (xs: number[], deg: number) => xs.map(x => Array.from({ length: deg + 1 }, (_, k) => x ** k));
VIZ.conditioning = { ...STEP,
  title: 'Condition numbers: V, and the normal equations VᵀV', eq: 'cond(VᵀV) = cond(V)² &nbsp;|&nbsp; digits lost ≈ log₁₀ cond',
  note: 'V = polynomial design matrix on 20 points in [0, 1].', h: 270, autoplay: false,
  params: [{ k: 'deg', label: 'degree', min: 1, max: 12, val: 8, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { const xs = Array.from({ length: 20 }, (_, i) => i / 19); const conds = Array.from({ length: 12 }, (_, i) => { const s = singularValues(vander(xs, i + 1)); return s[0] / s[s.length - 1]; }); return { conds }; },
  draw(c: VizCtx, S: any, P: any) {
    c.view(0.5, 12.5, 0, 24); c.grid(12, 6); c.axes('degree', 'log₁₀ condition number'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[0.5, 16], [12.5, 16]], 'rgba(248,81,73,.7)', 1.4); c.ctx.restore(); c.chip(c.X(0.7), c.Y(16) - 18, '1e16: no digits left', QC.bad);
    c.path(S.conds.map((k: number, i: number) => [i + 1, Math.log10(k)] as [number, number]), QC.vel, 2.2, 6);
    c.path(S.conds.map((k: number, i: number) => [i + 1, 2 * Math.log10(k)] as [number, number]), QC.warm, 2.2, 6);
    c.dot(P.deg, Math.log10(S.conds[P.deg - 1]), 6, QC.vel, 10); c.dot(P.deg, 2 * Math.log10(S.conds[P.deg - 1]), 6, QC.warm, 10);
    c.legend([['cond(V) — QR', QC.vel], ['cond(VᵀV) — normal equations', QC.warm]]);
  },
  stats(S: any, P: any) { const k = S.conds[P.deg - 1]; return [['cond(V)', k.toExponential(2), QC.vel], ['cond(VᵀV)', (k * k).toExponential(2), QC.warm], ['digits left (normal eq.)', Math.max(0, 16 - 2 * Math.log10(k)).toFixed(1), QC.energy]]; },
};

/* ---------- s2p4 ---------- */
VIZ.spells = { ...STEP,
  title: 'Dry-spell lengths: simulated chain against the geometric law', eq: 'P(L = k) = (1 − p)·p^(k−1) &nbsp;|&nbsp; mean = 1/(1 − p)',
  note: 'p = P(dry → dry). 20 000 simulated days.', h: 260, autoplay: false, resetOnParam: true,
  params: [{ k: 'p', label: 'P(dry→dry)', min: 0.3, max: 0.95, val: 0.9, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const R = rng(3); let s = 0, run = 0; const runs: number[] = []; for (let i = 0; i < 20000; i++) { s = s === 0 ? (R.u() < P.p ? 0 : 1) : (R.u() < 0.5 ? 0 : 1); if (s === 0) run++; else if (run) { runs.push(run); run = 0; } } return { runs }; },
  draw(c: VizCtx, S: any, P: any) {
    const K = 20, h = new Array(K + 1).fill(0); S.runs.forEach((r: number) => { if (r <= K) h[r]++; }); const n = S.runs.length;
    c.view(0.5, K + 0.5, 0, Math.max(1 - P.p, h[1] / n) * 1.15); c.grid(10, 4); c.axes('spell length (days)', 'share'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    for (let k = 1; k <= K; k++) { const X0 = c.X(k - 0.35), X1 = c.X(k + 0.35), Y = c.Y(h[k] / n); c.ctx.fillStyle = 'rgba(88,166,255,.55)'; c.ctx.fillRect(X0, Y, X1 - X0, c.Y(0) - Y); }
    c.path(Array.from({ length: K }, (_, i) => [i + 1, (1 - P.p) * P.p ** i] as [number, number]), QC.energy, 2.2, 8);
    c.legend([['simulated', QC.pos], ['geometric law', QC.energy]]);
  },
  stats(S: any, P: any) { const m = S.runs.reduce((a: number, b: number) => a + b, 0) / S.runs.length; return [['simulated mean', m.toFixed(2) + ' d', QC.pos], ['1/(1 − p)', (1 / (1 - P.p)).toFixed(2) + ' d', QC.energy], ['spells', S.runs.length, QC.dim]]; },
};

/* ---------- s2p5 ---------- */
VIZ.knn = { ...STEP,
  title: 'A network from towns: join each to its k nearest', eq: 'A[i][j] = A[j][i] = 1 if j is among the k nearest of i &nbsp;|&nbsp; degree = row sum',
  note: 'Synthetic towns.', h: 290, autoplay: false,
  params: [{ k: 'k', label: 'k', min: 1, max: 6, val: 3, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { const R = rng(17); return { t: Array.from({ length: 40 }, () => [R.u(), R.u()]) }; },
  draw(c: VizCtx, S: any, P: any) {
    const n = S.t.length, A = Array.from({ length: n }, () => new Array(n).fill(0));
    S.t.forEach((p: number[], i: number) => { S.t.map((q: number[], j: number) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).filter((x: number[]) => x[1] !== i).sort((a: number[], b: number[]) => a[0] - b[0]).slice(0, P.k).forEach(([, j]: number[]) => { A[i][j] = A[j][i] = 1; }); });
    const X = (u: number) => 20 + u * (c.W - 40), Y = (v: number) => 14 + v * (c.H - 28), ctx = c.ctx;
    ctx.save(); ctx.strokeStyle = 'rgba(120,160,210,.45)'; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (A[i][j]) { ctx.beginPath(); ctx.moveTo(X(S.t[i][0]), Y(S.t[i][1])); ctx.lineTo(X(S.t[j][0]), Y(S.t[j][1])); ctx.stroke(); } ctx.restore();
    const deg = A.map(r => r.reduce((a, b) => a + b, 0)); S.deg = deg;
    S.t.forEach((p: number[], i: number) => c.sdot(X(p[0]), Y(p[1]), 3 + deg[i], QC.accent, 6));
  },
  stats(S: any) { const d = S.deg ?? [0]; return [['min degree', Math.min(...d), QC.dim], ['max degree', Math.max(...d), QC.energy], ['symmetric', 'yes', QC.vel]]; },
};

const G4 = { pos: [[0.15, 0.3], [0.5, 0.12], [0.45, 0.62], [0.85, 0.7]], w: { 0: { 1: 5, 2: 2 }, 1: { 0: 5, 2: 1 }, 2: { 0: 2, 1: 1, 3: 4 }, 3: { 2: 4 } } as Record<number, Record<number, number>> };
VIZ.dijkstra = { ...STEP,
  title: 'Fewest roads (BFS) against shortest distance (Dijkstra)', eq: 'Dijkstra: always finish the closest unfinished town (priority queue)',
  note: 'Distances in km.', h: 290, autoplay: false, stepBtn: true, resetOnParam: true,
  params: [{ k: 'goal', label: 'from A to', min: 1, max: 3, val: 1, step: 1, fmt: (v: number) => 'ABCD'[v] }],
  init() { return { dist: { 0: 0 } as Record<number, number>, prev: { 0: -1 } as Record<number, number>, pq: [[0, 0]] as number[][], done: [] as number[] }; },
  stepOnce(S: any) {
    while (S.pq.length) { S.pq.sort((a: number[], b: number[]) => a[0] - b[0]); const [d, u] = S.pq.shift(); if (S.done.includes(u)) continue; S.done.push(u);
      for (const [v, w] of Object.entries(G4.w[u])) { const nv = Number(v); if (d + w < (S.dist[nv] ?? 1e9)) { S.dist[nv] = d + w; S.prev[nv] = u; S.pq.push([d + w, nv]); } } break; }
  },
  draw(c: VizCtx, S: any, P: any) {
    const X = (u: number) => 40 + u * (c.W - 80), Y = (v: number) => 20 + v * (c.H - 40), ctx = c.ctx, p = G4.pos;
    const bfs = P.goal === 1 ? [0, 1] : P.goal === 2 ? [0, 2] : [0, 2, 3];
    const dj: number[] = []; if (S.done.includes(P.goal)) { let x = P.goal; while (x !== -1) { dj.unshift(x); x = S.prev[x]; } }
    const edge = (a: number, b: number, col: string, w: number) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X(p[a][0]), Y(p[a][1])); ctx.lineTo(X(p[b][0]), Y(p[b][1])); ctx.stroke(); ctx.restore(); };
    for (const [a, nb] of Object.entries(G4.w)) for (const [b, w] of Object.entries(nb)) if (Number(a) < Number(b)) { edge(+a, +b, 'rgba(140,160,190,.4)', 2); T(c, (X(p[+a][0]) + X(p[+b][0])) / 2 + 8, (Y(p[+a][1]) + Y(p[+b][1])) / 2 + 16, `${w} km`, QC.dim, 11); }
    for (let i = 0; i < bfs.length - 1; i++) edge(bfs[i], bfs[i + 1], 'rgba(255,123,90,.8)', 6);
    for (let i = 0; i < dj.length - 1; i++) edge(dj[i], dj[i + 1], QC.vel, 3);
    p.forEach((q, i) => { c.sdot(X(q[0]), Y(q[1]), 15, S.done.includes(i) ? QC.vel : '#2a3446', 8); T(c, X(q[0]), Y(q[1]) - 7, 'ABCD'[i], S.done.includes(i) ? '#061018' : '#e6edf3', 13, 'center'); if (S.dist[i] !== undefined) T(c, X(q[0]), Y(q[1]) + 18, `${S.dist[i]} km`, QC.energy, 11, 'center'); });
  },
  stats(S: any, P: any) { const bl = P.goal === 1 ? 5 : P.goal === 2 ? 2 : 6; return [['BFS route length', bl + ' km', QC.warm], ['Dijkstra', S.done.includes(P.goal) ? S.dist[P.goal] + ' km' : 'press Step', QC.vel], ['queue', S.pq.map((x: number[]) => `${'ABCD'[x[1]]}:${x[0]}`).join(' ') || '—', QC.dim]]; },
};

/* ---------- s2p6 ---------- */
VIZ.dftmatrix = { ...STEP,
  title: 'The DFT matrix: every row is a wave', eq: 'F[k][n] = e^(−2πi·kn/N) &nbsp;|&nbsp; colour = real part cos(2πkn/N)',
  note: '', h: 300, autoplay: false,
  params: [{ k: 'N', label: 'N', min: 8, max: 64, val: 32, step: 8, fmt: (v: number) => v.toFixed(0) }, { k: 'row', label: 'highlight row k', min: 0, max: 63, val: 3, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const N = P.N, k = Math.min(P.row, N - 1), size = Math.min(c.H - 20, c.W * 0.5), cs = size / N, x0 = 14, y0 = 10, ctx = c.ctx;
    for (let r = 0; r < N; r++) for (let n = 0; n < N; n++) { const v = Math.cos((2 * Math.PI * r * n) / N); ctx.fillStyle = v >= 0 ? `rgba(57,208,216,${0.15 + 0.8 * v})` : `rgba(255,123,90,${0.15 - 0.8 * v})`; ctx.fillRect(x0 + n * cs, y0 + r * cs, cs + 0.3, cs + 0.3); }
    ctx.save(); ctx.strokeStyle = QC.energy; ctx.lineWidth = 2; ctx.strokeRect(x0, y0 + k * cs, size, cs); ctx.restore();
    const o = c.pads(size + 50, 14, 24, 30); c.view(0, N, -1.2, 1.2); c.grid(4, 4); c.axes('n', ''); c.chip(c.X(0) + 6, c.Y(1.2) + 4, 'highlighted row', QC.energy); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    const pts: [number, number][] = []; for (let n = 0; n <= 200; n++) { const t = (n / 200) * N; pts.push([t, Math.cos((2 * Math.PI * k * t) / N)]); } c.path(pts, 'rgba(227,179,65,.35)', 1.2);
    for (let n = 0; n < N; n++) c.dot(n, Math.cos((2 * Math.PI * k * n) / N), 3.5, QC.energy, 6);
    c.unpad(o);
  },
  stats(_S: any, P: any) { const k = Math.min(P.row, P.N - 1); return [['row k', k, QC.energy], ['turns across the row', Math.min(k, P.N - k), QC.dim]]; },
};

function smoothF(x: number) { return Math.exp(Math.sin(x)); }
VIZ.specderiv = { ...STEP,
  title: 'Spectral derivative against central differences', eq: 'spectral: multiply mode k by i·k &nbsp;|&nbsp; f(x) = e^(sin x), exact f′ = cos x·e^(sin x)',
  note: '', h: 260, autoplay: false,
  init() {
    const fd: [number, number][] = [], sp: [number, number][] = [];
    for (let N = 6; N <= 64; N += 2) {
      const x = Array.from({ length: N }, (_, i) => (2 * Math.PI * i) / N), f = x.map(smoothF), ex = x.map(t => Math.cos(t) * smoothF(t)), h = (2 * Math.PI) / N;
      fd.push([N, lg(Math.max(...x.map((_, i) => Math.abs((f[(i + 1) % N] - f[(i - 1 + N) % N]) / (2 * h) - ex[i]))))]);
      const X = dft(f); const re = new Float64Array(N), im = new Float64Array(N);
      for (let k = 0; k < N; k++) { const kk = k < N / 2 ? k : k === N / 2 ? 0 : k - N; re[k] = -kk * X.im[k]; im[k] = kk * X.re[k]; }
      let err = 0; for (let n = 0; n < N; n++) { let s = 0; for (let k = 0; k < N; k++) { const a = (2 * Math.PI * k * n) / N; s += re[k] * Math.cos(a) - im[k] * Math.sin(a); } err = Math.max(err, Math.abs(s / N - ex[n])); }
      sp.push([N, lg(err)]);
    }
    return { fd, sp };
  },
  draw(c: VizCtx, S: any) {
    c.view(4, 66, -16, 1); c.grid(6, 5); c.axes('grid points N', 'log₁₀ max error'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    c.path(S.fd, QC.warm, 2.2, 6); c.path(S.sp, QC.vel, 2.2, 6); c.legend([['central difference', QC.warm], ['spectral', QC.vel]]);
  },
  stats(S: any) { return [['N = 32 central', (10 ** S.fd[13][1]).toExponential(1), QC.warm], ['N = 32 spectral', (10 ** S.sp[13][1]).toExponential(1), QC.vel]]; },
};

VIZ.spectralheat = { ...STEP,
  title: 'Heat equation in Fourier space: high wavenumbers die first', eq: 'û_k(t) = û_k(0)·e^(−α k² t) &nbsp;|&nbsp; exact for periodic problems',
  note: 'A square wave diffusing on a ring.', h: 300, resetOnParam: true,
  params: [{ k: 'alpha', label: 'α', min: 0.01, max: 0.5, val: 0.1, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { const N = 64; const u0 = Array.from({ length: N }, (_, i) => (i >= N / 4 && i < (3 * N) / 4 ? 1 : 0)); return { N, U0: fft(u0), t: 0 }; },
  step(S: any, dt: number) { S.t += dt * 0.6; if (S.t > 12) S.t = 0; },
  draw(c: VizCtx, S: any, P: any) {
    const N = S.N, re = new Float64Array(N), im = new Float64Array(N), amp: number[] = [];
    for (let k = 0; k < N; k++) { const kk = k <= N / 2 ? k : k - N, g = Math.exp(-P.alpha * kk * kk * S.t); re[k] = S.U0.re[k] * g; im[k] = -S.U0.im[k] * g; if (k <= N / 2) amp.push(Math.hypot(re[k], im[k]) / N); }
    const u: number[] = [];
    for (let n = 0; n < N; n++) { let s = 0; for (let k = 0; k < N; k++) { const a = (2 * Math.PI * k * n) / N; s += re[k] * Math.cos(a) + im[k] * Math.sin(a); } u.push(s / N); }
    const o = c.pads(46, c.W * 0.45, 24, 30); c.view(0, N, -0.2, 1.2); c.grid(4, 4); c.axes('x', 'u'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    c.path(u.map((v, i) => [i, v] as [number, number]), QC.warm, 2.4, 8); c.unpad(o);
    const o2 = c.pads(c.W * 0.6, 14, 24, 30); c.view(0, 16, 0, 0.55); c.grid(4, 4); c.axes('k', ''); c.chip(c.X(5), c.Y(0.55) + 4, 'mode amplitudes |û_k|', QC.mag); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    for (let k = 0; k <= 16; k++) { const X = c.X(k), Y = c.Y(Math.min(0.55, amp[k])); c.ctx.fillStyle = QC.mag; c.ctx.fillRect(X - 3, Y, 6, c.Y(0) - Y); }
    c.unpad(o2);
  },
  stats(S: any) { return [['t', S.t.toFixed(2), QC.dim]]; },
};

export const STEP_WIDGETS_2 = ['pivot', 'flops', 'mcconv', 'curse', 'conditioning', 'spells', 'knn', 'dijkstra', 'dftmatrix', 'specderiv', 'spectralheat'];
