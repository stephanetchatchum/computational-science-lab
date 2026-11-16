/** Stage 4 step visuals. Numbers match the reference solutions in scripts/reference/; synthetic data is labelled. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-17));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Diverging colour: negative blue, positive red, |v| ≥ 1 full strength. */
const div = (v: number) => { const t = clamp(v, -1, 1); return t >= 0 ? `rgb(${Math.round(30 + 220 * t)},${Math.round(40 + 60 * t)},${Math.round(60 - 20 * t)})` : `rgb(${Math.round(30 + 20 * -t)},${Math.round(60 + 110 * -t)},${Math.round(70 + 180 * -t)})`; };
const heat = (t: number) => { const u = clamp(t, 0, 1); return `rgb(${Math.round(20 + 235 * u)},${Math.round(30 + 120 * Math.sin(Math.PI * u))},${Math.round(120 * (1 - u) + 20)})`; };
function cells(c: VizCtx, x0: number, y0: number, w: number, h: number, n: number, m: number, col: (i: number, j: number) => string) {
  const cw = w / m, ch = h / n; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { c.ctx.fillStyle = col(i, j); c.ctx.fillRect(x0 + j * cw, y0 + i * ch, cw + 0.6, ch + 0.6); }
}

/* ================= s4p1 heat ================= */
VIZ.vonneumann = { ...STEP,
  title: 'Von Neumann: how much each wiggle grows per step', eq: 'explicit heat λ = 1 − 4r·sin²(θ/2) &nbsp;|&nbsp; implicit λ = 1/(1 + 4r·sin²(θ/2)) &nbsp;|&nbsp; stable ⇔ |λ| ≤ 1 for every θ = kΔx',
  note: 'θ runs from long smooth waves (left) to the shortest zig-zag the grid can hold (right).', h: 270, autoplay: false,
  params: [{ k: 'scheme', label: 'scheme', min: 0, max: 2, val: 0, step: 1, fmt: (v: number) => ['explicit heat', 'implicit heat', '2D wave (C)'][v] }, { k: 'r', label: 'r (or C)', min: 0.05, max: 1.2, val: 0.4, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(0, Math.PI, 0, 2.2); c.grid(4, 4); c.axes('θ = kΔx', '|λ|'); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[0, 1], [Math.PI, 1]], 'rgba(230,237,243,.6)', 1.2); c.ctx.restore();
    const pts: [number, number][] = [];
    for (let i = 0; i <= 200; i++) { const th = (i / 200) * Math.PI, s2 = Math.sin(th / 2) ** 2; pts.push([th, Math.min(2.2, VIZ.vonneumann.lam(P.scheme, P.r, s2))]); }
    const worst = Math.max(...pts.map(p => p[1])); c.path(pts, worst > 1 + 1e-9 ? QC.bad : QC.vel, 2.4, 8);
  },
  lam(scheme: number, r: number, s2: number) {
    if (scheme === 0) return Math.abs(1 - 4 * r * s2);
    if (scheme === 1) return 1 / (1 + 4 * r * s2);
    const b = 2 - 8 * r * r * s2; return Math.abs(b) <= 2 ? 1 : (Math.abs(b) + Math.sqrt(b * b - 4)) / 2; // diagonal waves: both sin² equal
  },
  stats(_S: any, P: any) { let w = 0; for (let i = 0; i <= 200; i++) w = Math.max(w, VIZ.vonneumann.lam(P.scheme, P.r, Math.sin((i / 200) * Math.PI / 2) ** 2)); const lim = ['r ≤ 0.5', 'any r', 'C ≤ 0.707'][P.scheme]; return [['largest |λ|', w.toFixed(3), w > 1 + 1e-9 ? QC.bad : QC.vel], ['limit', lim, QC.dim], [w > 1 + 1e-9 ? 'UNSTABLE' : 'stable', '', w > 1 + 1e-9 ? QC.bad : QC.vel]]; },
};

VIZ.heat2d = { ...STEP,
  title: 'Heat on a 2D grid: calm below r = ¼, explosive above', eq: 'u ← u + r·(up + down + left + right − 4u) &nbsp;|&nbsp; 2D limit r ≤ ¼',
  note: 'A hot square of 100 in a cold plate; walls held at 0.', h: 300, resetOnParam: true,
  params: [{ k: 'r', label: 'r', min: 0.05, max: 0.34, val: 0.2, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { const n = 48, u = new Float64Array(n * n); for (let i = 20; i < 28; i++) for (let j = 20; j < 28; j++) u[i * n + j] = 100; return { n, u, k: 0, boom: 0 }; },
  step(S: any, _dt: number, P: any) {
    if (S.boom) return; const n = S.n;
    for (let rep = 0; rep < 2; rep++) {
      const u = S.u, v = new Float64Array(n * n);
      for (let i = 1; i < n - 1; i++) for (let j = 1; j < n - 1; j++) { const k = i * n + j; v[k] = u[k] + P.r * (u[k - n] + u[k + n] + u[k - 1] + u[k + 1] - 4 * u[k]); }
      S.u = v; S.k++; let mx = 0; for (let k = 0; k < n * n; k++) mx = Math.max(mx, Math.abs(v[k])); S.mx = mx; if (mx > 1000) { S.boom = S.k; break; } if (mx < 4) { Object.assign(S, VIZ.heat2d.init(null, null as any)); break; }
    }
  },
  draw(c: VizCtx, S: any) {
    const n = S.n, side = Math.min(c.H - 20, c.W * 0.55), x0 = (c.W - side) / 2;
    cells(c, x0, 10, side, side, n, n, (i, j) => { const v = S.u[i * n + j]; return v < 0 ? `rgb(40,90,${Math.round(clamp(150 - v * 2, 0, 255))})` : heat(v / 30); });
    if (S.boom) c.chip(x0 + 10, 20, `exploded at step ${S.boom}`, QC.bad);
  },
  stats(S: any, P: any) { return [['step', S.k, QC.dim], ['largest |u|', (S.mx ?? 100).toFixed(1), S.boom ? QC.bad : QC.energy], ['r vs ¼', P.r <= 0.25 ? 'stable' : 'unstable', P.r <= 0.25 ? QC.vel : QC.bad]]; },
};

/** Explicit and implicit heat on the rod, as in the guide (sin start, ends at 0). */
export function rodPair(n: number, r: number, steps: number) {
  const x = Array.from({ length: n }, (_, i) => i / (n - 1)); let e = x.map(v => Math.sin(Math.PI * v)); let im = e.slice();
  for (let s = 0; s < steps; s++) {
    e = e.map((v, i) => (i === 0 || i === n - 1 ? 0 : v + r * (e[i + 1] - 2 * v + e[i - 1])));
    const m = n - 2, cp = new Array(m).fill(0), dp = new Array(m).fill(0);
    for (let i = 0; i < m; i++) { const a = i ? -r : 0, b = 1 + 2 * r, cc = -r, d = im[i + 1], den = b - a * (i ? cp[i - 1] : 0); cp[i] = cc / den; dp[i] = (d - a * (i ? dp[i - 1] : 0)) / den; }
    const out = new Array(n).fill(0); for (let i = m - 1; i >= 0; i--) out[i + 1] = dp[i] - cp[i] * (i < m - 1 ? out[i + 2] : 0); im = out;
  }
  return { x, e, im };
}
VIZ.implicitheat = { ...STEP,
  title: 'Explicit against implicit at the same large r', eq: 'implicit: −r·u′ᵢ₋₁ + (1 + 2r)·u′ᵢ − r·u′ᵢ₊₁ = uᵢ, one tridiagonal solve per step',
  note: '21 points, 40 steps. White: exact sin(πx)·e^(−π²·αt). The explicit blow-up grows from round-off, so it needs a few dozen steps.', h: 270, autoplay: false,
  params: [{ k: 'r', label: 'r', min: 0.1, max: 5, val: 2, step: 0.1, fmt: (v: number) => v.toFixed(1) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const n = 21, R = rodPair(n, P.r, 40), dx = 1 / (n - 1), t = 40 * P.r * dx * dx; // α·t in units where α = 1
    c.view(0, 1, -1.2, 1.2); c.grid(4, 4); c.axes('x', 'u'); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    const ex: [number, number][] = []; for (let i = 0; i <= 100; i++) ex.push([i / 100, Math.sin(Math.PI * i / 100) * Math.exp(-(Math.PI ** 2) * t)]);
    c.path(ex, 'rgba(230,237,243,.7)', 1.4);
    c.path(R.x.map((x, i) => [x, clamp(R.e[i], -1.2, 1.2)] as [number, number]), QC.bad, 2, 6); c.path(R.x.map((x, i) => [x, R.im[i]] as [number, number]), QC.vel, 2.2, 6);
    c.legend([['exact', '#c8d2e0'], ['explicit', QC.bad], ['implicit', QC.vel]]);
  },
  stats(_S: any, P: any) { const R = rodPair(21, P.r, 40), mx = Math.max(...R.e.map(Math.abs)); return [['explicit max |u|', mx > 1e3 ? mx.toExponential(1) : mx.toFixed(3), mx > 1.01 ? QC.bad : QC.dim], ['implicit peak', Math.max(...R.im).toFixed(3), QC.vel], ['r vs ½', P.r <= 0.5 ? 'explicit stable' : 'explicit unstable', P.r <= 0.5 ? QC.vel : QC.bad]]; },
};

/* ================= s4p2 numerical diffusion ================= */
export function upwindVariance(dx: number, dt: number, T = 10) {
  const L = 25, n = Math.round(L / dx), x = Array.from({ length: n }, (_, i) => i * dx); let c = x.map(v => Math.exp(-((v - 5) ** 2) / (2 * 0.25)));
  const steps = Math.round(T / dt), C = dt / dx;
  for (let s = 0; s < steps; s++) { const o = c; c = o.map((v, i) => v - C * (v - o[(i - 1 + n) % n])); }
  const tot = c.reduce((a, b) => a + b, 0), m = c.reduce((a, v, i) => a + v * x[i], 0) / tot, v = c.reduce((a, w, i) => a + w * (x[i] - m) ** 2, 0) / tot;
  return { x, c, m, v };
}
VIZ.numdiff = { ...STEP,
  title: 'Upwind smears the dye even with no diffusion at all', eq: 'D_num = v·Δx·(1 − C)/2, &nbsp;C = vΔt/Δx &nbsp;|&nbsp; variance after t: 0.25 + 2·D_num·t',
  note: 'Pure advection, v = 1 m/s, 10 s. Dashed: the true bell, same shape as at the start.', h: 270, autoplay: false, resetOnParam: true,
  params: [{ k: 'dx', label: 'Δx (m)', min: 0.025, max: 0.2, val: 0.05, step: 0.025, fmt: (v: number) => v.toFixed(3) }, { k: 'C', label: 'C = vΔt/Δx', min: 0.02, max: 1, val: 0.02, step: 0.02, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { return upwindVariance(P.dx, P.C * P.dx); },
  draw(c: VizCtx, S: any) {
    c.view(8, 22, 0, 1.05); c.grid(7, 4); c.axes('x (m)', 'dye'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    const tr: [number, number][] = []; for (let i = 0; i <= 300; i++) { const x = 8 + 14 * i / 300; tr.push([x, Math.exp(-((x - 15) ** 2) / 0.5)]); }
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path(tr, 'rgba(230,237,243,.7)', 1.4); c.ctx.restore();
    c.path(S.x.map((x: number, i: number) => [x, S.c[i]] as [number, number]).filter((p: number[]) => p[0] >= 8 && p[0] <= 22), QC.bad, 2.4, 8);
  },
  stats(S: any, P: any) { const pred = 0.25 + 2 * (P.dx * (1 - P.C) / 2) * 10; return [['measured variance', S.v.toFixed(4), QC.bad], ['0.25 + 2·D_num·t', pred.toFixed(4), QC.energy], ['D_num', (P.dx * (1 - P.C) / 2).toFixed(4) + ' m²/s', QC.dim]]; },
};

/* ================= s4p3 SSA and towns ================= */
export function gillespie(N: number, beta: number, sigma: number, gamma: number, I0: number, tEnd: number, R: { u(): number }) {
  let S = N - I0, E = 0, I = I0, Rr = 0, t = 0; const ts = [0], Is = [I0], Ss = [S];
  while (t < tEnd) { const r1 = beta * S * I / N, r2 = sigma * E, r3 = gamma * I, tot = r1 + r2 + r3; if (!tot) break; t += -Math.log(1 - R.u()) / tot; const u = R.u() * tot; if (u < r1) { S--; E++; } else if (u < r1 + r2) { E--; I++; } else { I--; Rr++; } ts.push(t); Is.push(I); Ss.push(S); }
  return { ts, Is, Ss };
}
export function seirODE(N: number, beta: number, sigma: number, gamma: number, I0: number, days = 200, dt = 0.1) {
  let y = [N - I0, 0, I0, 0]; const out: number[][] = [y.slice()]; const f = (q: number[]) => { const inf = beta * q[0] * q[2] / N; return [-inf, inf - sigma * q[1], sigma * q[1] - gamma * q[2], gamma * q[2]]; };
  for (let s = 0; s < days / dt; s++) { const k1 = f(y), k2 = f(y.map((v, j) => v + dt / 2 * k1[j])), k3 = f(y.map((v, j) => v + dt / 2 * k2[j])), k4 = f(y.map((v, j) => v + dt * k3[j])); y = y.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); out.push(y.slice()); }
  return out;
}
VIZ.ssa = { ...STEP,
  title: 'Exact random epidemics (Gillespie) against the equations', eq: 'next event after Exp(total rate) &nbsp;|&nbsp; which event: in proportion to its rate',
  note: 'One town of 2000, β = 0.5, σ = 0.2, γ = 0.1, 20 infectious at the start. New runs every Reset.', h: 280, autoplay: false,
  init() {
    const R = rng(Math.floor(Math.random() * 1e6)), runs = Array.from({ length: 20 }, () => gillespie(2000, 0.5, 0.2, 0.1, 20, 160, R));
    const mean = new Array(161).fill(0); for (const r of runs) { let k = 0; for (let d = 0; d <= 160; d++) { while (k + 1 < r.ts.length && r.ts[k + 1] <= d) k++; mean[d] += r.Is[k] / runs.length; } }
    return { runs, mean, ode: seirODE(2000, 0.5, 0.2, 0.1, 20, 160) };
  },
  draw(c: VizCtx, S: any) {
    c.view(0, 160, 0, 800); c.grid(8, 4); c.axes('day', 'infectious'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    for (const r of S.runs) { const p: [number, number][] = []; for (let i = 0; i < r.ts.length; i += 15) p.push([r.ts[i], r.Is[i]]); c.path(p, 'rgba(160,170,190,.35)', 1); }
    c.path(S.ode.filter((_: any, i: number) => i % 5 === 0).map((y: number[], i: number) => [i * 0.5, y[2]] as [number, number]), 'rgba(240,240,240,.9)', 2);
    c.path(S.mean.map((v: number, d: number) => [d, v] as [number, number]), QC.pos, 2.4, 6);
    c.legend([['equations', '#e6edf3'], ['mean of 20 runs', QC.pos], ['single runs', '#8b949e']]);
  },
  stats(S: any) { const pk = S.runs.map((r: any) => Math.max(...r.Is)); const ode = Math.max(...S.ode.map((y: number[]) => y[2])); return [['equations peak', ode.toFixed(0), QC.dim], ['mean of run peaks', (pk.reduce((a: number, b: number) => a + b, 0) / pk.length).toFixed(0), QC.pos], ['run peaks range', `${Math.min(...pk)}–${Math.max(...pk)}`, QC.dim]]; },
};

VIZ.townspread = { ...STEP,
  title: 'Towns joined by travel: the outbreak spreads with a delay', eq: 'pull i→j ∝ pop_j / distance² (rows sum to 1) &nbsp;|&nbsp; mixing = (1 − τ)·home + τ·gravity',
  note: 'Synthetic towns; the outbreak starts in the biggest one. Circle colour: share infectious.', h: 300, resetOnParam: true,
  params: [{ k: 'tau', label: 'travel τ', min: 0.005, max: 0.2, val: 0.05, step: 0.005, fmt: (v: number) => v.toFixed(3) }],
  init(P: any) {
    const R = rng(11), n = 12, xy = Array.from({ length: n }, () => [0.1 + 0.8 * R.u(), 0.1 + 0.8 * R.u()]), pop = Array.from({ length: n }, (_, i) => Math.round(2000 * Math.exp(-i * 0.3)));
    const G = xy.map((a, i) => { const row = xy.map((b, j) => (i === j ? 0 : pop[j] / ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2))); const s = row.reduce((x, y) => x + y, 0); return row.map(v => v / s); });
    const M = G.map((row, i) => row.map((g, j) => (i === j ? 1 - P.tau : P.tau * g)));
    const y = pop.map((p, i) => (i === 0 ? [p - 10, 0, 10, 0] : [p, 0, 0, 0]));
    return { xy, pop, G, M, y, day: 0, hist: [] as number[][] };
  },
  step(S: any) {
    const b = 0.5, sg = 0.2, g = 0.1, n = S.pop.length;
    for (let rep = 0; rep < 2; rep++) {
      if (S.day > 220) return;
      const share = S.y.map((q: number[], j: number) => q[2] / S.pop[j]);
      for (let sub = 0; sub < 4; sub++) S.y = S.y.map((q: number[], i: number) => { const lam = b * S.M[i].reduce((a: number, m: number, j: number) => a + m * share[j], 0), dt = 0.25, inf = lam * q[0] * dt; return [q[0] - inf, q[1] + inf - sg * q[1] * dt, q[2] + sg * q[1] * dt - g * q[2] * dt, q[3] + g * q[2] * dt]; });
      S.day++; S.hist.push(Array.from({ length: n }, (_, i) => S.y[i][2] / S.pop[i]));
    }
  },
  draw(c: VizCtx, S: any) {
    const W = c.W * 0.55, H = c.H - 20, X = (u: number) => 10 + u * W, Y = (v: number) => 10 + v * H, n = S.pop.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const w = (S.G[i][j] + S.G[j][i]) * 6; if (w < 0.15) continue; c.ctx.strokeStyle = 'rgba(120,150,190,.4)'; c.ctx.lineWidth = w; c.ctx.beginPath(); c.ctx.moveTo(X(S.xy[i][0]), Y(S.xy[i][1])); c.ctx.lineTo(X(S.xy[j][0]), Y(S.xy[j][1])); c.ctx.stroke(); }
    c.ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) { const sh = S.y[i][2] / S.pop[i], rr = 4 + Math.sqrt(S.pop[i]) / 4; c.sdot(X(S.xy[i][0]), Y(S.xy[i][1]), rr, sh > 0.002 ? `rgb(${Math.round(80 + 175 * Math.min(1, sh * 4))},60,60)` : (S.y[i][3] / S.pop[i] > 0.5 ? QC.vel : QC.pos), sh > 0.05 ? 8 : 0); }
    const o = c.pads(c.W * 0.62, 14, 18, 26); c.view(0, 220, 0, 0.35); c.grid(4, 3); c.axes('day', 'share infectious'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    for (let i = 0; i < n; i++) c.path(S.hist.map((h: number[], d: number) => [d, h[i]] as [number, number]), `hsla(${(i * 37) % 360},70%,60%,.85)`, 1.4);
    c.unpad(o);
  },
  stats(S: any) { const pk = S.hist.length ? Array.from({ length: S.pop.length }, (_, i) => S.hist.reduce((m: number[], h: number[], d: number) => (h[i] > m[0] ? [h[i], d] : m), [0, 0])[1]) : [0]; return [['day', S.day, QC.dim], ['first town peaks', `day ${Math.min(...pk)}`, QC.bad], ['last town peaks', `day ${Math.max(...pk)}`, QC.warm]]; },
};

/* ================= s4p4 truss ================= */
/** Dense solve with partial pivoting; returns null if the matrix is singular (a mechanism). */
export function solveDense(A: number[][], b: number[]): number[] | null {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]), scale = Math.max(...A.map(r => Math.max(...r.map(Math.abs))));
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; if (Math.abs(M[p][c]) < 1e-10 * scale) return null; [M[c], M[p]] = [M[p], M[c]]; for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } }
  const x = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; } return x;
}
const TN: [number, number][] = [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0], [1, 1.5], [3, 1.5], [5, 1.5], [7, 1.5]];
const TM: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [0, 5], [5, 1], [1, 6], [6, 2], [2, 7], [7, 3], [3, 8], [8, 4]];
export function truss2d(load: number, removeBrace: boolean) {
  const mem = removeBrace ? TM.filter((_, i) => i !== 10) : TM, n = TN.length, K = Array.from({ length: 2 * n }, () => new Array(2 * n).fill(0)), cs: number[][] = [];
  for (const [a, b] of mem) { const dx = TN[b][0] - TN[a][0], dy = TN[b][1] - TN[a][1], L = Math.hypot(dx, dy), c = [dx / L, dy / L], k = 1e4 / L; cs.push(c);
    for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) { const v = k * c[p] * c[q]; K[2 * a + p][2 * a + q] += v; K[2 * b + p][2 * b + q] += v; K[2 * a + p][2 * b + q] -= v; K[2 * b + p][2 * a + q] -= v; } }
  const locked = new Set([0, 1, 9]), free = [...Array(2 * n).keys()].filter(i => !locked.has(i)), F = new Array(2 * n).fill(0); for (const i of [1, 2, 3]) F[2 * i + 1] = -load / 3;
  const uf = solveDense(free.map(i => free.map(j => K[i][j])), free.map(i => F[i])); if (!uf) return null;
  const u = new Array(2 * n).fill(0); free.forEach((i, k) => (u[i] = uf[k]));
  const forces = mem.map(([a, b], i) => (1e4 / Math.hypot(TN[b][0] - TN[a][0], TN[b][1] - TN[a][1])) * ((u[2 * b] - u[2 * a]) * cs[i][0] + (u[2 * b + 1] - u[2 * a + 1]) * cs[i][1]));
  return { u, forces, mem };
}
VIZ.truss = { ...STEP,
  title: 'A truss under load: forces in every bar, and the sag', eq: 'K = Σ k·(c cᵀ) blocks &nbsp;|&nbsp; solve K_free·u = F &nbsp;|&nbsp; force = k·(u_b − u_a)·c',
  note: 'Pinned left, roller right; the load is shared by the three middle bottom nodes. Sag drawn hugely exaggerated.', h: 290, autoplay: false,
  params: [{ k: 'load', label: 'total load (N)', min: 0, max: 300, val: 150, step: 10, fmt: (v: number) => v.toFixed(0) }],
  toggles: [{ k: 'cut', label: 'remove one diagonal', on: false }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const R = truss2d(P.load, P.cut); c.view(-0.5, 8.5, -1.4, 2.2);
    if (!R) { TM.forEach(([a, b], i) => { if (i === 10) return; c.path([TN[a], TN[b]], 'rgba(160,170,190,.6)', 3); }); c.chip(c.X(1), c.Y(2.2), 'Singular matrix: this truss is a mechanism. It can fold without stretching any bar.', QC.bad); return; }
    const umax = Math.max(1e-12, ...(R?.u ?? [0]).map(Math.abs)), ex = (0.9 * P.load / 300) / umax, pos = TN.map((p, i) => [p[0] + ex * R.u[2 * i], p[1] + ex * R.u[2 * i + 1]] as [number, number]);
    R.mem.forEach(([a, b]) => { c.path([TN[a], TN[b]], 'rgba(120,130,150,.25)', 1); });
    const fmax = Math.max(1e-9, ...R.forces.map(Math.abs));
    R.mem.forEach(([a, b], i) => { const f = R.forces[i]; c.path([pos[a], pos[b]], f < 0 ? QC.bad : QC.pos, 1.5 + 5 * Math.abs(f) / fmax, 4); });
    pos.forEach(p => c.dot(p[0], p[1], 4, '#e6edf3'));
    for (const i of [1, 2, 3]) c.arrow(pos[i][0], pos[i][1], pos[i][0], pos[i][1] - 0.2 - P.load / 400, QC.energy);
  },
  stats(_S: any, P: any) { const R = truss2d(P.load, P.cut); if (!R) return [['status', 'singular — no solution', QC.bad]]; const i = R.forces.reduce((m, f, k) => (Math.abs(f) > Math.abs(R.forces[m]) ? k : m), 0); return [['largest |force|', `${R.forces[i].toFixed(1)} N`, R.forces[i] < 0 ? QC.bad : QC.pos], ['in bar', `${R.mem[i][0]}–${R.mem[i][1]}`, QC.dim], ['mid sag', `${(R.u[5] * 1000).toFixed(2)} mm`, QC.energy]]; },
};

VIZ.sparsity = { ...STEP,
  title: 'The stiffness matrix is almost all zeros', eq: 'dense memory = (3n)² × 8 bytes &nbsp;|&nbsp; sparse ≈ 12 bytes per non-zero',
  note: 'Each dot is one non-zero 3×3 block of K for the long bridge (nodes numbered side by side).', h: 300, autoplay: false,
  params: [{ k: 'panels', label: 'panels', min: 2, max: 40, val: 8, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { return {}; },
  pattern(P: number) {
    const id: Record<string, number> = {}; let n = 0; for (let s = 0; s < 2; s++) { for (let k = 0; k <= P; k++) id[`b${k}_${s}`] = n++; for (let k = 0; k < P; k++) id[`t${k}_${s}`] = n++; }
    const pairs: [number, number][] = [];
    for (let s = 0; s < 2; s++) for (let k = 0; k < P; k++) { pairs.push([id[`b${k}_${s}`], id[`b${k + 1}_${s}`]], [id[`b${k}_${s}`], id[`t${k}_${s}`]], [id[`t${k}_${s}`], id[`b${k + 1}_${s}`]]); if (k < P - 1) pairs.push([id[`t${k}_${s}`], id[`t${k + 1}_${s}`]]); }
    for (let k = 0; k <= P; k++) pairs.push([id[`b${k}_0`], id[`b${k}_1`]]);
    for (let k = 0; k < P; k++) { pairs.push([id[`t${k}_0`], id[`t${k}_1`]], [id[`b${k}_0`], id[`b${k + 1}_1`]], [id[`b${k + 1}_0`], id[`t${k}_1`]]); if (k < P - 1) pairs.push([id[`t${k}_0`], id[`t${k + 1}_1`]]); }
    const blocks = new Set<number>(); for (let i = 0; i < n; i++) blocks.add(i * n + i); for (const [a, b] of pairs) { blocks.add(a * n + b); blocks.add(b * n + a); }
    return { n, blocks };
  },
  draw(c: VizCtx, _S: any, P: any) {
    const { n, blocks } = VIZ.sparsity.pattern(P.panels), side = Math.min(c.H - 20, c.W * 0.6), x0 = (c.W - side) / 2, cw = side / n;
    c.ctx.fillStyle = '#0b1220'; c.ctx.fillRect(x0, 10, side, side); c.ctx.strokeStyle = 'rgba(140,160,190,.4)'; c.ctx.strokeRect(x0, 10, side, side);
    c.ctx.fillStyle = QC.accent; blocks.forEach((k: number) => { const i = Math.floor(k / n), j = k % n; c.ctx.fillRect(x0 + j * cw, 10 + i * cw, Math.max(1.2, cw), Math.max(1.2, cw)); });
  },
  stats(_S: any, P: any) { const { n, blocks } = VIZ.sparsity.pattern(P.panels), N3 = 3 * n, nnz = blocks.size * 9; return [['nodes', n, QC.dim], ['non-zero share', (100 * nnz / (N3 * N3)).toFixed(2) + '%', QC.vel], ['dense', `${(N3 * N3 * 8 / 1e6).toFixed(2)} MB`, QC.bad], ['sparse', `${((nnz * 12 + (N3 + 1) * 4) / 1e6).toFixed(3)} MB`, QC.vel]]; },
};

/* ================= s4p5 Mann–Kendall, FDR, EOF ================= */
const phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
function erf(x: number) { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); }
export const mkS = (v: number[]) => { let s = 0; for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) s += Math.sign(v[j] - v[i]); return s; };
export function mkZP(v: number[]) { const n = v.length, S = mkS(v), vr = n * (n - 1) * (2 * n + 5) / 18, z = S > 0 ? (S - 1) / Math.sqrt(vr) : S < 0 ? (S + 1) / Math.sqrt(vr) : 0; return { S, z, p: 2 * (1 - phi(Math.abs(z))) }; }
VIZ.mkpairs = { ...STEP,
  title: 'Mann–Kendall: every pair of years votes', eq: 'S = (later higher) − (later lower) &nbsp;|&nbsp; Var S = n(n−1)(2n+5)/18 &nbsp;|&nbsp; z → p',
  note: 'Synthetic 33 years: a trend plus noise. Each line joins two years: green if the later is higher, red if lower.', h: 290, resetOnParam: true,
  params: [{ k: 'trend', label: 'trend per decade', min: -1.5, max: 1.5, val: 0.6, step: 0.1, fmt: (v: number) => v.toFixed(1) }],
  init(P: any) { const R = rng(4), v = Array.from({ length: 33 }, (_, i) => 3 + P.trend * i / 10 + R.normal() * 0.8), pairs: number[][] = []; for (let i = 0; i < 33; i++) for (let j = i + 1; j < 33; j++) pairs.push([i, j]); for (let i = pairs.length - 1; i > 0; i--) { const k = Math.floor(R.u() * (i + 1)); [pairs[i], pairs[k]] = [pairs[k], pairs[i]]; } return { v, pairs, k: 0 }; },
  step(S: any) { S.k = Math.min(S.pairs.length, S.k + 4); },
  draw(c: VizCtx, S: any) {
    const lo = Math.min(...S.v) - 0.5, hi = Math.max(...S.v) + 0.5; c.view(-1, 33, lo, hi); c.grid(8, 4); c.axes('year', 'rain'); c.ticks(v => (1991 + v).toFixed(0), v => v.toFixed(1));
    for (let q = 0; q < S.k; q++) { const [i, j] = S.pairs[q], d = S.v[j] - S.v[i]; c.ctx.strokeStyle = d > 0 ? 'rgba(63,185,80,.28)' : d < 0 ? 'rgba(248,81,73,.28)' : 'rgba(150,150,150,.3)'; c.ctx.beginPath(); c.ctx.moveTo(c.X(i), c.Y(S.v[i])); c.ctx.lineTo(c.X(j), c.Y(S.v[j])); c.ctx.stroke(); }
    S.v.forEach((y: number, i: number) => c.dot(i, y, 3.5, QC.accent));
  },
  stats(S: any) { let g = 0, r = 0; for (let q = 0; q < S.k; q++) { const [i, j] = S.pairs[q]; if (S.v[j] > S.v[i]) g++; else if (S.v[j] < S.v[i]) r++; } const done = S.k === S.pairs.length, t = mkZP(S.v); return [['pairs', `${S.k} / 528`, QC.dim], ['green − red = S', `${g} − ${r} = ${g - r}`, g >= r ? QC.vel : QC.bad], ['p', done ? t.p.toFixed(4) + (t.p < 0.05 ? ' significant' : ' not significant') : '…', done ? (t.p < 0.05 ? QC.vel : QC.dim) : QC.dim]]; },
};

export function bh(p: number[], q = 0.05) { const m = p.length, o = p.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); let k = 0; o.forEach(([v], r) => { if (v <= q * (r + 1) / m) k = r + 1; }); const out = new Array(m).fill(false); for (let r = 0; r < k; r++) out[o[r][1]] = true; return out; }
VIZ.fdr = { ...STEP,
  title: '64 tests at once: luck, and the Benjamini–Hochberg fix', eq: 'sort p; keep the k smallest where p₍ₖ₎ ≤ 0.05·k/64',
  note: 'Synthetic: some places have a real trend (orange), the rest have none (grey).', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'real', label: 'places with a real trend', min: 0, max: 32, val: 8, step: 1, fmt: (v: number) => v.toFixed(0) }, { k: 'mu', label: 'trend strength (z)', min: 1, max: 5, val: 3, step: 0.5, fmt: (v: number) => v.toFixed(1) }],
  init(P: any) { const R = rng(8), p = Array.from({ length: 64 }, (_, i) => { if (i < P.real) { const z = P.mu + R.normal(); return 2 * (1 - phi(Math.abs(z))); } return R.u(); }); const truth = p.map((_, i) => i < P.real); return { p, truth, rej: bh(p) }; },
  draw(c: VizCtx, S: any) {
    const o = S.p.map((v: number, i: number) => [v, i]).sort((a: number[], b: number[]) => a[0] - b[0]);
    c.view(0, 65, 0, 0.3); c.grid(8, 3); c.axes('rank', 'p-value'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[0, 0.05], [65, 0.05]], 'rgba(230,237,243,.6)', 1.2); c.ctx.restore(); c.path([[0, 0], [64, 0.05]], QC.energy, 1.6);
    o.forEach(([v, i]: number[], r: number) => c.dot(r + 1, Math.min(v, 0.3), 3.5, S.truth[i] ? QC.warm : '#8b949e', S.rej[i] ? 8 : 0));
  },
  stats(S: any) { const naive = S.p.map((v: number) => v < 0.05), fn = (m: boolean[]) => [m.filter(Boolean).length, m.filter((x, i) => x && !S.truth[i]).length]; const [a, af] = fn(naive), [b, bf] = fn(S.rej); return [['p < 0.05', `${a} (${af} false)`, af ? QC.bad : QC.dim], ['Benjamini–Hochberg', `${b} (${bf} false)`, QC.energy]]; },
};

/** First EOF by power iteration on the 64 × 64 covariance (same answer as the first SVD vector). */
export function firstEOF(field: number[][]) {
  const T = field.length, n = field[0].length, mean = Array.from({ length: n }, (_, j) => field.reduce((a, r) => a + r[j], 0) / T), A = field.map(r => r.map((v, j) => v - mean[j]));
  const C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A.reduce((a, r) => a + r[i] * r[j], 0))); let v = new Array(n).fill(1);
  for (let it = 0; it < 200; it++) { const w = C.map(row => row.reduce((a, x, j) => a + x * v[j], 0)); const nr = Math.hypot(...w); v = w.map(x => x / nr); }
  const lam = C.map(row => row.reduce((a, x, j) => a + x * v[j], 0)).reduce((a, x, i) => a + x * v[i], 0), tr = C.reduce((a, r, i) => a + r[i], 0);
  return { pattern: v, pc: A.map(r => r.reduce((a, x, j) => a + x * v[j], 0)), explained: lam / tr };
}
VIZ.eof = { ...STEP,
  title: 'EOF 1: the map pattern that explains the most', eq: 'anomaly = U·S·Vᵀ &nbsp;|&nbsp; pattern = first row of Vᵀ &nbsp;|&nbsp; explained = s₁² / Σ s²',
  note: 'Synthetic 33 × 64 field: one planted dipole pattern rising and falling, plus noise.', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'noise', label: 'noise', min: 0.05, max: 2, val: 0.4, step: 0.05, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const R = rng(2), pat = Array.from({ length: 64 }, (_, k) => { const i = Math.floor(k / 8), j = k % 8; return Math.exp(-((i - 2) ** 2 + (j - 2) ** 2) / 6) - Math.exp(-((i - 5.5) ** 2 + (j - 5) ** 2) / 6); }); const pc = Array.from({ length: 33 }, (_, t) => Math.sin(t / 3)); const field = pc.map(a => pat.map(p => a * p + P.noise * 0.3 * R.normal())); return { pat, ...firstEOF(field) }; },
  draw(c: VizCtx, S: any) {
    const side = Math.min(c.H - 30, c.W * 0.4), sgn = S.pattern.reduce((a: number, v: number, i: number) => a + v * S.pat[i], 0) >= 0 ? 1 : -1, mx = Math.max(...S.pattern.map(Math.abs));
    cells(c, 12, 14, side, side, 8, 8, (i, j) => div(sgn * S.pattern[i * 8 + j] / mx)); c.txt(12, side + 26, 'EOF 1 (8 × 8 map)', QC.dim, 11);
    const o = c.pads(side + 60, 14, 18, 28); const m = Math.max(...S.pc.map(Math.abs)) || 1; c.view(0, 32, -1.2, 1.2); c.grid(4, 4); c.axes('year', 'strength'); c.ticks(v => (1991 + v).toFixed(0), v => v.toFixed(1));
    c.path(S.pc.map((v: number, t: number) => [t, sgn * v / m] as [number, number]), QC.energy, 2.2, 6); c.unpad(o);
  },
  stats(S: any) { const corr = (() => { const a = S.pattern, b = S.pat, ma = a.reduce((x: number, y: number) => x + y, 0) / 64, mb = b.reduce((x: number, y: number) => x + y, 0) / 64; let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < 64; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; } return Math.abs(sab / Math.sqrt(saa * sbb)); })(); return [['explained by EOF 1', (100 * S.explained).toFixed(1) + '%', QC.energy], ['match to planted pattern', corr.toFixed(3), corr > 0.9 ? QC.vel : QC.warm]]; },
};

/* ================= s4p6 waves ================= */
VIZ.wavesurf = { ...STEP,
  title: 'A pressure pulse, an echo, and the 2D stability limit', eq: 'p_new = 2p − p_old + (cΔt/Δx)²·∇²p &nbsp;|&nbsp; stable while c·Δt/Δx ≤ 1/√2 everywhere',
  note: 'Water (c = 1500 m/s) over a fast layer (3000 m/s, below the dashed line). Δx = 5 m.', h: 300, resetOnParam: true,
  params: [{ k: 'dt', label: 'Δt (ms)', min: 0.5, max: 1.9, val: 1, step: 0.1, fmt: (v: number) => v.toFixed(1) }],
  init() { const nx = 120, nz = 80; return { nx, nz, p: new Float64Array(nx * nz), po: new Float64Array(nx * nz), k: 0, boom: 0 }; },
  step(S: any, _dt: number, P: any) {
    if (S.boom) return; if (S.k > 700) Object.assign(S, VIZ.wavesurf.init(null, null as any)); const nx = S.nx, nz = S.nz, dts = P.dt / 1000;
    for (let rep = 0; rep < 3; rep++) {
      const p = S.p, po = S.po, pn = new Float64Array(nx * nz);
      for (let i = 1; i < nz - 1; i++) { const cc = ((i >= 30 ? 3000 : 1500) * dts / 5) ** 2; for (let j = 1; j < nx - 1; j++) { const k = i * nx + j; pn[k] = 2 * p[k] - po[k] + cc * (p[k - nx] + p[k + nx] + p[k - 1] + p[k + 1] - 4 * p[k]); } }
      const t = S.k * dts, a = (Math.PI * 15 * (t - 0.08)) ** 2; pn[2 * nx + 60] += (1 - 2 * a) * Math.exp(-a);
      S.po = p; S.p = pn; S.k++; let mx = 0; for (let k = 0; k < nx * nz; k++) if (Math.abs(pn[k]) > mx) mx = Math.abs(pn[k]); if (mx > 1e3) { S.boom = S.k; break; }
    }
  },
  draw(c: VizCtx, S: any) {
    const w = Math.min(c.W - 20, (c.H - 20) * 1.5), h = w / 1.5, x0 = (c.W - w) / 2;
    cells(c, x0, 10, w, h, S.nz, S.nx, (i, j) => div(S.p[i * S.nx + j] * 8));
    c.ctx.save(); c.ctx.setLineDash([6, 4]); c.ctx.strokeStyle = 'rgba(230,237,243,.6)'; c.ctx.beginPath(); c.ctx.moveTo(x0, 10 + h * 30 / S.nz); c.ctx.lineTo(x0 + w, 10 + h * 30 / S.nz); c.ctx.stroke(); c.ctx.restore();
    if (S.boom) c.chip(x0 + 10, 20, `unstable: blew up at step ${S.boom}`, QC.bad);
  },
  stats(S: any, P: any) { const Cw = 1500 * P.dt / 1000 / 5, Cf = 2 * Cw; return [['C in water', Cw.toFixed(2), QC.dim], ['C in fast layer', Cf.toFixed(2), Cf > 0.7071 ? QC.bad : QC.vel], ['time', `${(S.k * P.dt).toFixed(0)} ms`, QC.dim]]; },
};

/* ================= s4p7 Gray–Scott and Turing ================= */
const GS_PRESETS: [string, number, number][] = [['spots', 0.03, 0.062], ['stripes', 0.022, 0.051], ['coral', 0.0545, 0.062], ['rings', 0.029, 0.057], ['worms', 0.045, 0.063], ['dividing spots', 0.0367, 0.0649]];
VIZ.grayscott = { ...STEP,
  title: 'Two chemicals, two rules, endless patterns', eq: 'U += Du∇²U − UV² + f(1 − U) &nbsp;|&nbsp; V += Dv∇²V + UV² − (f + k)V &nbsp;|&nbsp; Du = 1, Dv = 0.5',
  note: 'Same nine-point Laplacian and starting square as your guide, on a smaller grid. Patterns take a little while to form.', h: 320, resetOnParam: true,
  params: [{ k: 'preset', label: 'preset', min: 0, max: 5, val: 0, step: 1, fmt: (v: number) => `${GS_PRESETS[v][0]} (${GS_PRESETS[v][1]}, ${GS_PRESETS[v][2]})` }],
  init() { const n = 80, U = new Float64Array(n * n).fill(1), V = new Float64Array(n * n), R = rng(Math.floor(Math.random() * 1e6)); for (let i = n / 2 - 7; i < n / 2 + 7; i++) for (let j = n / 2 - 7; j < n / 2 + 7; j++) { U[i * n + j] = 0.5; V[i * n + j] = 0.25; } for (let k = 0; k < n * n; k++) V[k] += 0.02 * R.u(); return { n, U, V, steps: 0 }; },
  step(S: any, _dt: number, P: any) {
    const [, f, k] = GS_PRESETS[P.preset], n = S.n, L = (Z: Float64Array, i: number, j: number) => { const im = (i - 1 + n) % n, ip = (i + 1) % n, jm = (j - 1 + n) % n, jp = (j + 1) % n; return -Z[i * n + j] + 0.2 * (Z[im * n + j] + Z[ip * n + j] + Z[i * n + jm] + Z[i * n + jp]) + 0.05 * (Z[im * n + jm] + Z[im * n + jp] + Z[ip * n + jm] + Z[ip * n + jp]); };
    for (let rep = 0; rep < 20; rep++) { const U = S.U, V = S.V, U2 = new Float64Array(n * n), V2 = new Float64Array(n * n); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const q = i * n + j, uvv = U[q] * V[q] * V[q]; U2[q] = U[q] + L(U, i, j) - uvv + f * (1 - U[q]); V2[q] = V[q] + 0.5 * L(V, i, j) + uvv - (f + k) * V[q]; } S.U = U2; S.V = V2; S.steps++; }
  },
  draw(c: VizCtx, S: any) { const side = Math.min(c.H - 16, c.W - 20), x0 = (c.W - side) / 2; cells(c, x0, 8, side, side, S.n, S.n, (i, j) => { const v = S.V[i * S.n + j]; return `rgb(${Math.round(clamp(v * 600, 0, 255))},${Math.round(clamp(v * 900, 0, 255))},${Math.round(clamp(150 + v * 300, 0, 255))})`; }); },
  stats(S: any, P: any) { return [['preset', GS_PRESETS[P.preset][0], QC.energy], ['steps', S.steps, QC.dim]]; },
};

export function uniformStates(f: number, k: number): [number, number][] { const d = f * f - 4 * f * (f + k) ** 2; if (d < 0) return []; return [1, -1].map(s => { const V = (f + s * Math.sqrt(d)) / (2 * (f + k)); return [(f + k) / V, V] as [number, number]; }); }
export function growthAt(U: number, V: number, f: number, k: number, Du: number, Dv: number, s: number) { const a = -V * V - f - s * Du, b = -2 * U * V, c = V * V, d = 2 * U * V - (f + k) - s * Dv, tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det; return disc >= 0 ? (tr + Math.sqrt(disc)) / 2 : tr / 2; }
const TP: [string, number, number][] = [['(0.055, 0.062): Turing', 0.055, 0.062], ['(0.06, 0.0609): stays flat', 0.06, 0.0609], ['coral (0.0545, 0.062)', 0.0545, 0.062], ['spots (0.03, 0.062)', 0.03, 0.062]];
VIZ.turing = { ...STEP,
  title: 'Does the flat mixture break into a pattern?', eq: 'growth(s) = largest Re eigenvalue of J − s·diag(Du, Dv), s from 0 to 1.6 &nbsp;|&nbsp; above 0 ⇒ a pattern grows',
  note: 'Uniform state with the larger V. Du = 1.', h: 270, autoplay: false,
  params: [{ k: 'pair', label: '(f, k)', min: 0, max: 3, val: 0, step: 1, fmt: (v: number) => TP[v][0] }, { k: 'Dv', label: 'Dv', min: 0.2, max: 1, val: 0.5, step: 0.05, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const [, f, k] = TP[P.pair], st = uniformStates(f, k); c.view(0, 1.6, -0.03, 0.02); c.grid(4, 5); c.axes('wave size s', 'growth per step'); c.ticks(v => v.toFixed(1), v => v.toFixed(3));
    c.path([[0, 0], [1.6, 0]], 'rgba(230,237,243,.6)', 1.2);
    if (!st.length) { c.chip(c.X(0.1), c.Y(0.015), 'No flat state except the empty dish: patterns here need a big local kick.', QC.warm); return; }
    const [U, V] = st[0], pts: [number, number][] = []; for (let i = 0; i <= 160; i++) { const s = i / 100; pts.push([s, clamp(growthAt(U, V, f, k, 1, P.Dv, s), -0.03, 0.02)]); }
    c.path(pts, Math.max(...pts.map(p => p[1])) > 0 ? QC.bad : QC.vel, 2.4, 8);
  },
  stats(_S: any, P: any) { const [, f, k] = TP[P.pair], st = uniformStates(f, k); if (!st.length) return [['flat state', 'none', QC.warm]]; const [U, V] = st[0]; let g = -1; for (let i = 0; i <= 160; i++) g = Math.max(g, growthAt(U, V, f, k, 1, P.Dv, i / 100)); return [['largest growth', g.toFixed(4), g > 0 ? QC.bad : QC.vel], ['without diffusion', growthAt(U, V, f, k, 0, 0, 0).toFixed(4), QC.dim], [g > 0 ? 'pattern grows' : 'stays flat', '', g > 0 ? QC.bad : QC.vel]]; },
};

/* ================= s4p8 Poisson ================= */
export function sorSolve(f: Float64Array, N: number, omega: number, tol = 1e-6, maxIt = 50000, hist?: number[]) {
  const h = 1 / (N + 1), u = new Float64Array(N * N), at = (i: number, j: number) => (i < 0 || j < 0 || i >= N || j >= N ? 0 : u[i * N + j]);
  const nf = Math.hypot(...f); let it = 0;
  for (it = 1; it <= maxIt; it++) {
    for (const col of [0, 1]) for (let i = 0; i < N; i++) for (let j = (i + col) % 2; j < N; j += 2) { const gs = 0.25 * (at(i - 1, j) + at(i + 1, j) + at(i, j - 1) + at(i, j + 1) + h * h * f[i * N + j]); u[i * N + j] = (1 - omega) * u[i * N + j] + omega * gs; }
    let r2 = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const r = f[i * N + j] - (4 * u[i * N + j] - at(i - 1, j) - at(i + 1, j) - at(i, j - 1) - at(i, j + 1)) / (h * h); r2 += r * r; }
    const res = Math.sqrt(r2) / nf; hist?.push(res); if (res < tol) break;
  }
  return { u, it };
}
export function jacobiHist(f: Float64Array, N: number, tol = 1e-6, maxIt = 40000) {
  const h = 1 / (N + 1); let u = new Float64Array(N * N); const nf = Math.hypot(...f), hist: number[] = [], at = (a: Float64Array, i: number, j: number) => (i < 0 || j < 0 || i >= N || j >= N ? 0 : a[i * N + j]);
  for (let it = 1; it <= maxIt; it++) { const v = new Float64Array(N * N); for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) v[i * N + j] = 0.25 * (at(u, i - 1, j) + at(u, i + 1, j) + at(u, i, j - 1) + at(u, i, j + 1) + h * h * f[i * N + j]); u = v; let r2 = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const r = f[i * N + j] - (4 * u[i * N + j] - at(u, i - 1, j) - at(u, i + 1, j) - at(u, i, j - 1) - at(u, i, j + 1)) / (h * h); r2 += r * r; } const res = Math.sqrt(r2) / nf; hist.push(res); if (res < tol) break; }
  return hist;
}
export function cgHist(f: Float64Array, N: number, tol = 1e-6) {
  const h2 = 1 / (N + 1) ** 2, A = (x: Float64Array) => { const y = new Float64Array(N * N); for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = i * N + j; y[k] = (4 * x[k] - (i > 0 ? x[k - N] : 0) - (i < N - 1 ? x[k + N] : 0) - (j > 0 ? x[k - 1] : 0) - (j < N - 1 ? x[k + 1] : 0)) / h2; } return y; };
  const dot = (a: Float64Array, b: Float64Array) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  const x = new Float64Array(N * N), r = Float64Array.from(f), p = Float64Array.from(f); let rr = dot(r, r); const nb = Math.sqrt(rr), hist: number[] = [];
  for (let it = 1; it < 10000; it++) { const Ap = A(p), a = rr / dot(p, Ap); for (let i = 0; i < x.length; i++) { x[i] += a * p[i]; r[i] -= a * Ap[i]; } const rn = dot(r, r); hist.push(Math.sqrt(rn) / nb); if (Math.sqrt(rn) / nb < tol) break; for (let i = 0; i < p.length; i++) p[i] = r[i] + (rn / rr) * p[i]; rr = rn; }
  return hist;
}
export const omegaOpt = (N: number) => 2 / (1 + Math.sin(Math.PI / (N + 1)));
VIZ.poisson = { ...STEP,
  title: 'The potential of a source in a box', eq: '−∇²u = f inside, u = 0 on the walls &nbsp;|&nbsp; five-point rule: (4u − four neighbours)/h² = f',
  note: 'Solved by SOR at the best ω on a 47 × 47 grid. Light bands are lines of equal potential.', h: 300, autoplay: false,
  params: [{ k: 'mode', label: 'source', min: 0, max: 2, val: 1, step: 1, fmt: (v: number) => ['sine hump (known answer)', 'two charges + −', 'one charge'][v] }],
  init() { return {}; },
  solve(mode: number) {
    const N = 47, h = 1 / (N + 1), f = new Float64Array(N * N), put = (x: number, y: number, q: number) => { f[(Math.round(x / h) - 1) * N + Math.round(y / h) - 1] += q / (h * h); };
    if (mode === 0) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) f[i * N + j] = 2 * Math.PI ** 2 * Math.sin(Math.PI * (i + 1) * h) * Math.sin(Math.PI * (j + 1) * h);
    else if (mode === 1) { put(0.5, 0.3, 1); put(0.5, 0.7, -1); } else put(0.5, 0.5, 1);
    return { N, ...sorSolve(f, N, omegaOpt(N), 1e-7) };
  },
  draw(c: VizCtx, _S: any, P: any) {
    const S = (VIZ.poisson._c?.mode === P.mode ? VIZ.poisson._c : (VIZ.poisson._c = { mode: P.mode, ...VIZ.poisson.solve(P.mode) }));
    const N = S.N, mx = Math.max(...Array.from(S.u as Float64Array).map(Math.abs)) || 1, side = Math.min(c.H - 20, c.W - 20), x0 = (c.W - side) / 2;
    const b = (i: number, j: number) => Math.floor(10 * S.u[Math.min(N - 1, i) * N + Math.min(N - 1, j)] / mx); cells(c, x0, 10, side, side, N, N, (i, j) => { const v = S.u[i * N + j] / mx, edge = b(i, j) !== b(i + 1, j) || b(i, j) !== b(i, j + 1); return edge ? 'rgba(230,237,243,.75)' : div(v * 1.4); });
  },
  stats(_S: any, P: any) { const S = VIZ.poisson._c ?? VIZ.poisson.solve(P.mode); return [['SOR sweeps', S.it, QC.energy], ['ω', omegaOpt(47).toFixed(3), QC.dim]]; },
};

VIZ.iterconv = { ...STEP,
  title: 'Four solvers racing to the same answer', eq: 'residual = |f − A·u| / |f| &nbsp;|&nbsp; stop at 10⁻⁶',
  note: 'f = 1 everywhere. Both axes logarithmic.', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'N', label: 'N (per side)', min: 15, max: 47, val: 15, step: 16, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { const N = P.N, f = new Float64Array(N * N).fill(1), gs: number[] = [], so: number[] = []; sorSolve(f, N, 1, 1e-6, 50000, gs); sorSolve(f, N, omegaOpt(N), 1e-6, 50000, so); return { jac: jacobiHist(f, N), gs, so, cg: cgHist(f, N) }; },
  draw(c: VizCtx, S: any) {
    c.view(0, Math.log10(S.jac.length) + 0.1, -6.3, 0.3); c.grid(5, 6); c.axes('log₁₀ iteration', 'log₁₀ residual'); c.ticks(v => v.toFixed(1), v => v.toFixed(0));
    const pl = (h: number[], col: string) => c.path(h.map((r, i) => [Math.log10(i + 1), lg(r)] as [number, number]), col, 2.2, 6);
    pl(S.jac, QC.bad); pl(S.gs, QC.warm); pl(S.so, QC.vel); pl(S.cg, QC.pos); c.legend([['Jacobi', QC.bad], ['Gauss–Seidel', QC.warm], ['SOR', QC.vel], ['CG', QC.pos]]);
  },
  stats(S: any) { return [['Jacobi', S.jac.length, QC.bad], ['Gauss–Seidel', S.gs.length, QC.warm], ['SOR', S.so.length, QC.vel], ['CG', S.cg.length, QC.pos]]; },
};

VIZ.omegascan = { ...STEP,
  title: 'How many SOR sweeps for each ω?', eq: 'theory: ω_opt = 2/(1 + sin πh), h = 1/(N + 1)',
  note: 'N = 15, f = 1. Dashed: the theory value.', h: 270, autoplay: false,
  init() { const N = 15, f = new Float64Array(N * N).fill(1), pts: [number, number][] = []; for (let w = 1; w <= 1.951; w += 0.01) pts.push([w, sorSolve(f, N, w).it]); return { pts }; },
  draw(c: VizCtx, S: any) {
    c.view(1, 1.96, 0, 400); c.grid(5, 4); c.axes('ω', 'sweeps'); c.ticks(v => v.toFixed(2), v => v.toFixed(0));
    c.path(S.pts, QC.vel, 2.2, 6); const w = omegaOpt(15); c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[w, 0], [w, 400]], QC.energy, 1.4); c.ctx.restore();
  },
  stats(S: any) { const b = S.pts.reduce((m: number[], p: number[]) => (p[1] < m[1] ? p : m)); return [['best ω (scan)', b[0].toFixed(2), QC.vel], ['theory', omegaOpt(15).toFixed(3), QC.energy], ['sweeps: ω = 1 / best', `${S.pts[0][1]} / ${b[1]}`, QC.dim]]; },
};

/* ================= s4p9 Ising ================= */
export function isingSweep(s: Int8Array, L: number, T: number, R: { u(): number }) {
  for (const col of [0, 1]) for (let i = 0; i < L; i++) for (let j = (i + col) % 2; j < L; j += 2) { const nb = s[((i + 1) % L) * L + j] + s[((i - 1 + L) % L) * L + j] + s[i * L + (j + 1) % L] + s[i * L + (j - 1 + L) % L], dE = 2 * s[i * L + j] * nb; if (dE <= 0 || R.u() < Math.exp(-dE / T)) s[i * L + j] = -s[i * L + j] as -1 | 1; }
}
export const isingE = (s: Int8Array, L: number) => { let e = 0; for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) e -= s[i * L + j] * (s[((i + 1) % L) * L + j] + s[i * L + (j + 1) % L]); return e; };
VIZ.ising = { ...STEP,
  title: 'Spins on a grid: shaking against agreeing', eq: 'E = −Σ sᵢsⱼ over neighbours &nbsp;|&nbsp; flip if ΔE ≤ 0, else with chance e^(−ΔE/T) &nbsp;|&nbsp; T_c ≈ 2.269',
  note: '64 × 64, wrap-around edges, chessboard sweeps.', h: 320,
  params: [{ k: 'T', label: 'temperature T', min: 1, max: 4, val: 2.27, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { const L = 64, R = rng(Math.floor(Math.random() * 1e6)), s = new Int8Array(L * L).map(() => (R.u() < 0.5 ? 1 : -1)); return { L, s, R, n: 0 }; },
  step(S: any, _dt: number, P: any) { for (let k = 0; k < 2; k++) isingSweep(S.s, S.L, P.T, S.R); S.n += 2; },
  draw(c: VizCtx, S: any) { const side = Math.min(c.H - 16, c.W - 20), x0 = (c.W - side) / 2; cells(c, x0, 8, side, side, S.L, S.L, (i, j) => (S.s[i * S.L + j] > 0 ? '#e6edf3' : '#1f2937')); },
  stats(S: any) { const N = S.L * S.L, m = Math.abs(S.s.reduce((a: number, b: number) => a + b, 0)) / N; return [['sweeps', S.n, QC.dim], ['|m|', m.toFixed(3), QC.energy], ['E per spin', (isingE(S.s, S.L) / N).toFixed(3), QC.pos]]; },
};

VIZ.detailedbalance = { ...STEP,
  title: 'Metropolis acceptance and detailed balance', eq: 'accept(A→B) = min(1, e^(−ΔE/T)) &nbsp;|&nbsp; accept(A→B) / accept(B→A) = e^(−ΔE/T) = P(B)/P(A)',
  note: 'One flip can only change E by −8, −4, 0, +4 or +8.', h: 260, autoplay: false,
  params: [{ k: 'T', label: 'T', min: 0.5, max: 5, val: 2.27, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(-10, 10, 0, 1.15); c.grid(5, 4); c.axes('ΔE', 'acceptance'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    for (const d of [-8, -4, 0, 4, 8]) { const a = Math.min(1, Math.exp(-d / P.T)), X0 = c.X(d - 1.2), X1 = c.X(d + 1.2), Y = c.Y(a); c.ctx.fillStyle = d > 0 ? 'rgba(248,81,73,.7)' : 'rgba(63,185,80,.7)'; c.ctx.fillRect(X0, Y, X1 - X0, c.Y(0) - Y); }
    const pts: [number, number][] = []; for (let i = 0; i <= 200; i++) { const d = -10 + i / 10; pts.push([d, Math.min(1, Math.exp(-d / P.T))]); } c.path(pts, 'rgba(230,237,243,.6)', 1.2);
  },
  stats(_S: any, P: any) { const a4 = Math.exp(-4 / P.T), a8 = Math.exp(-8 / P.T); return [['accept ΔE = +4', a4.toFixed(4), QC.bad], ['ratio ±4 moves', `${a4.toFixed(4)} / 1`, QC.dim], ['accept ΔE = +8', a8.toFixed(4), QC.bad]]; },
};

export function autocorrTime(x: number[]) { const n = x.length, m = x.reduce((a, b) => a + b, 0) / n, d = x.map(v => v - m), v = d.reduce((a, b) => a + b * b, 0) / n, cs: number[] = [1]; let tau = 0.5; for (let t = 1; t < n / 3; t++) { let s = 0; for (let i = 0; i < n - t; i++) s += d[i] * d[i + t]; const c = s / (n - t) / v; if (c <= 0) break; cs.push(c); tau += c; } return { tau, cs }; }
VIZ.autocorr = { ...STEP,
  title: 'How long does the magnet remember?', eq: 'c(t) = correlation of |m| with itself t sweeps later &nbsp;|&nbsp; τ = ½ + Σ c(t)',
  note: '16 × 16, 3000 sweeps after warming up. New random run on each change.', h: 290, autoplay: false, resetOnParam: true,
  params: [{ k: 'T', label: 'T', min: 1.8, max: 3.5, val: 2.27, step: 0.01, fmt: (v: number) => v.toFixed(2) }],
  init(P: any) { const L = 16, R = rng(Math.floor(Math.random() * 1e6)), s = new Int8Array(L * L).map(() => (R.u() < 0.5 ? 1 : -1)), m: number[] = []; for (let k = 0; k < 3600; k++) { isingSweep(s, L, P.T, R); if (k >= 600) m.push(Math.abs(s.reduce((a, b) => a + b, 0)) / (L * L)); } return { m, ...autocorrTime(m) }; },
  draw(c: VizCtx, S: any) {
    const o = c.pads(46, 14, 14, c.H * 0.5 + 10); c.view(0, 3000, 0, 1); c.grid(6, 2); c.axes('', ''); c.ticks(false, v => v.toFixed(1)); c.chip(c.X(30), c.Y(1) + 2, '|m| each sweep', QC.energy); c.path(S.m.map((v: number, i: number) => [i, v] as [number, number]), QC.energy, 1.2); c.unpad(o);
    const o2 = c.pads(46, 14, c.H * 0.55, 28); c.view(0, 60, 0, 1); c.grid(6, 2); c.axes('lag (sweeps)', ''); c.chip(c.X(30), c.Y(1) + 2, 'autocorrelation c(t)', QC.pos); c.ticks(v => v.toFixed(0), v => v.toFixed(1)); c.path(S.cs.slice(0, 61).map((v: number, i: number) => [i, v] as [number, number]), QC.pos, 2.2, 6); c.unpad(o2);
  },
  stats(S: any) { const n = S.m.length; return [['τ (sweeps)', S.tau.toFixed(1), QC.pos], ['independent samples', `≈ ${Math.round(n / (2 * S.tau))} of ${n}`, QC.dim]]; },
};

VIZ.isingcurves = { ...STEP,
  title: 'Energy, magnetisation and specific heat across T', eq: 'C = Var(E) / (T²·N) &nbsp;|&nbsp; Onsager: T_c = 2/ln(1 + √2) = 2.269',
  note: '16 × 16, 1500 sweeps per temperature, fresh random seed each time.', h: 300, autoplay: false,
  init() {
    const L = 16, N = 256, R = rng(Math.floor(Math.random() * 1e6)), rows: number[][] = []; const s = new Int8Array(N).fill(1);
    for (let T = 1.6; T <= 3.401; T += 0.1) { for (let k = 0; k < 300; k++) isingSweep(s, L, T, R); const E: number[] = [], M: number[] = []; for (let k = 0; k < 1500; k++) { isingSweep(s, L, T, R); E.push(isingE(s, L)); M.push(Math.abs(s.reduce((a, b) => a + b, 0))); } const mE = E.reduce((a, b) => a + b, 0) / E.length, vE = E.reduce((a, b) => a + (b - mE) ** 2, 0) / E.length; rows.push([T, mE / N, M.reduce((a, b) => a + b, 0) / M.length / N, vE / (T * T * N)]); }
    return { rows };
  },
  draw(c: VizCtx, S: any) {
    c.view(1.6, 3.4, -2.1, 2.1); c.grid(9, 6); c.axes('T', ''); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path([[2.269, -2.1], [2.269, 2.1]], 'rgba(230,237,243,.6)', 1.2); c.ctx.restore();
    c.path(S.rows.map((r: number[]) => [r[0], r[1]] as [number, number]), QC.pos, 2.2, 6); c.path(S.rows.map((r: number[]) => [r[0], r[2]] as [number, number]), QC.energy, 2.2, 6); c.path(S.rows.map((r: number[]) => [r[0], r[3]] as [number, number]), QC.bad, 2.2, 6);
    c.legend([['E per spin', QC.pos], ['|m|', QC.energy], ['C', QC.bad]]);
  },
  stats(S: any) { const pk = S.rows.reduce((m: number[], r: number[]) => (r[3] > m[3] ? r : m)); return [['C peaks at T', pk[0].toFixed(1), QC.bad], ['Onsager', '2.269', QC.dim]]; },
};

export const STEP_WIDGETS_4 = ['vonneumann', 'heat2d', 'implicitheat', 'numdiff', 'ssa', 'townspread', 'truss', 'sparsity', 'mkpairs', 'fdr', 'eof', 'wavesurf', 'grayscott', 'turing', 'poisson', 'iterconv', 'omegascan', 'ising', 'detailedbalance', 'autocorr', 'isingcurves'];
