/** Stage 3 step visuals. Numbers match scripts/verify_oracles.py (Stage 3 block); synthetic data is labelled. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-17));

/* ---------- s3p1: stiffness ---------- */
const stiffF = (t: number, y: number) => -50 * (y - Math.cos(t));
export const stiffExact = (t: number) => (2500 * Math.cos(t) + 50 * Math.sin(t)) / 2501 - (2500 / 2501) * Math.exp(-50 * t);
export function rk4Stiff(dt: number, T = 2) {
  const out: [number, number][] = [[0, 0]]; let y = 0, t = 0; const n = Math.round(T / dt);
  for (let i = 0; i < n; i++) { const k1 = stiffF(t, y), k2 = stiffF(t + dt / 2, y + dt / 2 * k1), k3 = stiffF(t + dt / 2, y + dt / 2 * k2), k4 = stiffF(t + dt, y + dt * k3); y += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += dt; out.push([t, y]); }
  return out;
}
/** Backward Euler with a Newton solve and a finite-difference derivative, exactly as the guide asks. */
export function backwardEuler(f: (t: number, y: number) => number, y0: number, T: number, dt: number) {
  const out: [number, number][] = [[0, y0]]; let y = y0, t = 0; const n = Math.round(T / dt), h = 1e-7;
  for (let i = 0; i < n; i++) {
    const tn = t + dt; let z = y;
    for (let it = 0; it < 30; it++) { const g = z - y - dt * f(tn, z), dg = 1 - dt * (f(tn, z + h) - f(tn, z)) / h, z2 = z - g / dg; const done = Math.abs(z2 - z) < 1e-12; z = z2; if (done) break; }
    y = z; t = tn; out.push([t, y]);
  }
  return out;
}
VIZ.stiff = { ...STEP,
  title: 'A stiff problem: RK4 explodes, backward Euler does not', eq: "y′ = −50(y − cos t) &nbsp;|&nbsp; RK4 stable only if 50·Δt ≤ 2.785 (Δt ≤ 0.0557)",
  note: '', h: 280, autoplay: false,
  params: [{ k: 'dt', label: 'Δt', min: 0.01, max: 0.1, val: 0.06, step: 0.005, fmt: (v: number) => v.toFixed(3) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    c.view(0, 2, -1.6, 1.6); c.grid(4, 4); c.axes('t', 'y'); c.ticks(v => v.toFixed(1), v => v.toFixed(1));
    const ex: [number, number][] = []; for (let i = 0; i <= 200; i++) ex.push([i / 100, stiffExact(i / 100)]);
    c.path(ex, 'rgba(230,237,243,.55)', 1.4);
    const clip = (p: [number, number][]) => p.map(([t, y]) => [t, Math.max(-1.6, Math.min(1.6, y))] as [number, number]);
    c.path(clip(rk4Stiff(P.dt)), QC.bad, 2.2, 6); c.path(backwardEuler(stiffF, 0, 2, P.dt), QC.vel, 2.2, 6);
    c.legend([['exact', '#c8d2e0'], ['RK4', QC.bad], ['backward Euler', QC.vel]]);
  },
  stats(_S: any, P: any) { const r = rk4Stiff(P.dt).at(-1)![1], b = backwardEuler(stiffF, 0, 2, P.dt).at(-1)![1]; return [['RK4 y(2)', Math.abs(r) > 1e4 ? r.toExponential(1) : r.toFixed(4), Math.abs(r) > 10 ? QC.bad : QC.vel], ['backward Euler y(2)', b.toFixed(4), QC.vel], ['exact', stiffExact(2).toFixed(4), QC.dim], ['50·Δt', (50 * P.dt).toFixed(2), 50 * P.dt > 2.785 ? QC.bad : QC.dim]]; },
};

/* ---------- s3p1: adaptive step ---------- */
const rk4s = (f: (t: number, y: number) => number, t: number, y: number, dt: number) => { const k1 = f(t, y), k2 = f(t + dt / 2, y + dt / 2 * k1), k3 = f(t + dt / 2, y + dt / 2 * k2), k4 = f(t + dt, y + dt * k3); return y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); };
export function adaptiveRK4(f: (t: number, y: number) => number, y0: number, T: number, tol: number) {
  const ts = [0], ys = [y0]; let t = 0, y = y0, dt = 0.1, tries = 0;
  while (t < T - 1e-12 && tries < 100000) {
    tries++; dt = Math.min(dt, T - t);
    const big = rk4s(f, t, y, dt), small = rk4s(f, t + dt / 2, rk4s(f, t, y, dt / 2), dt / 2), err = Math.abs(small - big) / 15;
    if (err <= tol) { t += dt; y = small; ts.push(t); ys.push(y); }
    dt = dt * Math.min(2, Math.max(0.2, 0.9 * (tol / (err + 1e-30)) ** 0.2));
  }
  return { ts, ys, tries };
}
VIZ.adaptive = { ...STEP,
  title: 'Adaptive steps: small where the curve changes fast, larger as it flattens', eq: 'error ≈ |two half steps − one step| / 15 &nbsp;|&nbsp; 15 = 2⁴ − 1 for a 4th-order method',
  note: '', h: 270, autoplay: false,
  params: [{ k: 'tol', label: 'tolerance 10^−x', min: 3, max: 10, val: 8, step: 1, fmt: (v: number) => `1e-${v}` }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const r = adaptiveRK4((_t, y) => -y, 1, 5, 10 ** -P.tol);
    c.view(0, 5, -0.12, 1.05); c.grid(5, 4); c.axes('t', 'y'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    const ex: [number, number][] = []; for (let i = 0; i <= 200; i++) ex.push([i / 40, Math.exp(-i / 40)]);
    c.path(ex, 'rgba(230,237,243,.5)', 1.4);
    r.ts.forEach((t, i) => { c.dot(t, r.ys[i], 3.5, QC.pos, 6); if (i) { const h = 60 * (t - r.ts[i - 1]); c.ctx.fillStyle = 'rgba(227,179,65,.55)'; c.ctx.fillRect(c.X(r.ts[i - 1]) + 1, c.Y(-0.12) - h, c.X(t) - c.X(r.ts[i - 1]) - 2, h); } });
    c.chip(c.X(5) - 150, c.Y(-0.12) - 80, 'bar height = step size', QC.energy);
    (c as any)._last = r;
  },
  stats(_S: any, P: any) { const r = adaptiveRK4((_t, y) => -y, 1, 5, 10 ** -P.tol); return [['accepted steps', r.ts.length - 1, QC.energy], ['tries', r.tries, QC.dim], ['error at t = 5', Math.abs(r.ys.at(-1)! - Math.exp(-5)).toExponential(1), QC.vel]]; },
};

/* ---------- s3p2: long-run energy ---------- */
type St = [number, number, number, number];
const acc2 = (x: number, y: number) => { const r3 = Math.hypot(x, y) ** 3; return [-x / r3, -y / r3]; };
const E2 = (s: St) => 0.5 * (s[2] ** 2 + s[3] ** 2) - 1 / Math.hypot(s[0], s[1]);
function rk4Orbit(s: St, dt: number): St {
  const d = (q: St): St => { const a = acc2(q[0], q[1]); return [q[2], q[3], a[0], a[1]]; };
  const add = (q: St, k: St, h: number): St => [q[0] + h * k[0], q[1] + h * k[1], q[2] + h * k[2], q[3] + h * k[3]];
  const k1 = d(s), k2 = d(add(s, k1, dt / 2)), k3 = d(add(s, k2, dt / 2)), k4 = d(add(s, k3, dt));
  return [0, 1, 2, 3].map(i => s[i] + dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as St;
}
function leapfrog(s: St, dt: number): St {
  let [x, y, vx, vy] = s; let a = acc2(x, y); vx += dt / 2 * a[0]; vy += dt / 2 * a[1]; x += dt * vx; y += dt * vy; a = acc2(x, y); vx += dt / 2 * a[0]; vy += dt / 2 * a[1]; return [x, y, vx, vy];
}
/** Running maximum of |E − E₀| after each orbit (v₀ = 0.7, period 3.386). */
export function driftCurve(step: (s: St, dt: number) => St, dt: number, orbits: number) {
  let s: St = [1, 0, 0, 0.7]; const E0 = E2(s), n = Math.round(3.386 / dt), out: number[] = []; let mx = 0;
  for (let o = 0; o < orbits; o++) { for (let i = 0; i < n; i++) { s = step(s, dt); const e = Math.abs(E2(s) - E0); if (e > mx) mx = e; } out.push(mx); }
  return out;
}
VIZ.orbitdrift = { ...STEP,
  title: 'Energy error over many orbits: RK4 drifts, leapfrog stays bounded', eq: 'leapfrog: half kick, drift, half kick &nbsp;|&nbsp; plotted: largest |E − E₀| so far',
  note: 'Eccentric orbit, v₀ = 0.7. Log scale on both axes.', h: 280, autoplay: false, resetOnParam: true,
  params: [{ k: 'dt', label: 'Δt', min: 0.005, max: 0.02, val: 0.01, step: 0.005, fmt: (v: number) => v.toFixed(3) }],
  init(P: any) { return { rk: driftCurve(rk4Orbit, P.dt, 300), lf: driftCurve(leapfrog, P.dt, 300) }; },
  draw(c: VizCtx, S: any) {
    c.view(0, Math.log10(300), -10, -1); c.grid(5, 9); c.axes('log₁₀ orbits', 'log₁₀ max |ΔE|'); c.ticks(v => v.toFixed(1), v => v.toFixed(0));
    const pts = (a: number[]) => a.map((e, i) => [Math.log10(i + 1), lg(e)] as [number, number]);
    c.path(pts(S.rk), QC.bad, 2.2, 6); c.path(pts(S.lf), QC.vel, 2.2, 6); c.legend([['RK4', QC.bad], ['leapfrog', QC.vel]]);
  },
  stats(S: any) { const r = S.rk, l = S.lf; return [['RK4 after 30 / 300', `${r[29].toExponential(1)} → ${r[299].toExponential(1)}`, QC.bad], ['leapfrog after 30 / 300', `${l[29].toExponential(1)} → ${l[299].toExponential(1)}`, QC.vel]]; },
};

/* ---------- s3p3: blobs ---------- */
VIZ.blobs = { ...STEP,
  title: 'Every blob is a person', eq: 'S blue · E yellow · I red · R green &nbsp;|&nbsp; infection chance per contact p',
  note: 'Random each run: the equations describe the average of many runs.', h: 300, resetOnParam: true,
  params: [{ k: 'p', label: 'p (per contact, per frame)', min: 0.01, max: 0.1, val: 0.04, step: 0.005, fmt: (v: number) => v.toFixed(3) }],
  init() {
    const R = rng(Math.floor(Math.random() * 1e6)), n = 300, W = 900, H = 600;
    const b = Array.from({ length: n }, (_, i) => { const a = R.u() * 6.283; return { x: R.u() * W, y: R.u() * H, vx: 2 * Math.cos(a), vy: 2 * Math.sin(a), s: i < 4 ? 2 : 0, t: i < 4 ? 300 : 0 }; });
    return { b, R, W, H, f: 0, hist: [] as number[][] };
  },
  step(S: any, _dt: number, P: any) {
    for (let rep = 0; rep < 2; rep++) {
      S.f++;
      for (const o of S.b) { o.vx += S.R.normal() * 0.3; o.vy += S.R.normal() * 0.3; const m = Math.hypot(o.vx, o.vy) || 1; o.vx *= 2 / m; o.vy *= 2 / m; o.x += o.vx; o.y += o.vy; if (o.x < 0 || o.x > S.W) { o.vx *= -1; o.x = Math.max(0, Math.min(S.W, o.x)); } if (o.y < 0 || o.y > S.H) { o.vy *= -1; o.y = Math.max(0, Math.min(S.H, o.y)); } }
      const inf = S.b.filter((o: any) => o.s === 2);
      for (const o of S.b) if (o.s === 0) { let k = 0; for (const q of inf) if ((q.x - o.x) ** 2 + (q.y - o.y) ** 2 < 144) k++; if (k && S.R.u() < 1 - (1 - P.p) ** k) { o.s = 1; o.t = -150 * Math.log(1 - S.R.u()); } }
      for (const o of S.b) if (o.s === 1 || o.s === 2) { o.t--; if (o.t <= 0) { if (o.s === 1) { o.s = 2; o.t = -300 * Math.log(1 - S.R.u()); } else o.s = 3; } }
      if (S.f % 30 === 0) S.hist.push([0, 1, 2, 3].map(k => S.b.filter((o: any) => o.s === k).length));
      if (S.f > 30 * 160) Object.assign(S, VIZ.blobs.init(P, null as any));
    }
  },
  draw(c: VizCtx, S: any) {
    const col = [QC.pos, QC.energy, QC.bad, QC.vel], k = Math.min((c.W * 0.62) / 900, (c.H - 16) / 600);
    c.ctx.strokeStyle = 'rgba(140,160,190,.3)'; c.ctx.strokeRect(8, 8, 900 * k, 600 * k);
    for (const o of S.b) c.sdot(8 + o.x * k, 8 + o.y * k, 3, col[o.s], o.s === 2 ? 6 : 0);
    const o = c.pads(c.W * 0.66, 14, 18, 26); c.view(0, 160, 0, 300); c.grid(4, 3); c.axes('day', ''); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    for (let k = 0; k < 4; k++) c.path(S.hist.map((h: number[], i: number) => [i, h[k]] as [number, number]), col[k], 1.8);
    c.unpad(o);
  },
  stats(S: any) { const h = S.hist.at(-1) ?? [300, 0, 4, 0]; const pk = S.hist.reduce((m: number[], x: number[], i: number) => (x[2] > m[0] ? [x[2], i] : m), [0, 0]); return [['day', S.hist.length, QC.dim], ['S E I R', h.join(' · '), QC.dim], ['infectious peak', `${pk[0]} on day ${pk[1]}`, QC.bad]]; },
};

/* ---------- s3p3: Poisson fit ---------- */
const SIG = 1 / 5.2, GAM = 1 / 8, NPOP = 1e6;
/** Weekly new infectious cases (inflow σE, i.e. the rise in I + R) for SEIR with a susceptible fraction s0. RK4, Δt = 0.25 d. */
export function weeklyCases(beta: number, s0: number, I0: number, weeks: number) {
  let y = [s0 * NPOP - I0, 0, I0, (1 - s0) * NPOP]; const dt = 0.25, per = 28, out: number[] = []; let prev = y[2] + y[3];
  const f = (q: number[]) => { const inf = beta * q[0] * q[2] / NPOP; return [-inf, inf - SIG * q[1], SIG * q[1] - GAM * q[2], GAM * q[2]]; };
  for (let w = 0; w < weeks; w++) {
    for (let i = 0; i < per; i++) { const k1 = f(y), k2 = f(y.map((v, j) => v + dt / 2 * k1[j])), k3 = f(y.map((v, j) => v + dt / 2 * k2[j])), k4 = f(y.map((v, j) => v + dt * k3[j])); y = y.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); }
    out.push(y[2] + y[3] - prev); prev = y[2] + y[3];
  }
  return out;
}
export const poissonNLL = (obs: number[], mu: number[]) => obs.reduce((s, o, i) => { const m = Math.max(mu[i], 1e-9); return s + m - o * Math.log(m); }, 0);
const SYNTH = weeklyCases(0.4, 0.5, 100, 30).map(v => Math.round(0.1 * v));
export function fitAt(beta: number, s0: number) { const m = weeklyCases(beta, s0, 100, 30); const rho = SYNTH.reduce((a, b) => a + b, 0) / m.reduce((a, b) => a + b, 0); const mu = m.map(v => rho * v); return { mu, rho, nll: poissonNLL(SYNTH, mu), sse: SYNTH.reduce((s, o, i) => s + (o - mu[i]) ** 2, 0) }; }
VIZ.poissonfit = { ...STEP,
  title: 'Fitting an outbreak: Poisson likelihood, reporting rate and R_eff', eq: 'best ρ = Σ observed / Σ model &nbsp;|&nbsp; −log L = Σ (μ − y·log μ) &nbsp;|&nbsp; R_eff = β·s₀/γ',
  note: 'Synthetic weekly cases made with β = 0.40, s₀ = 0.5, ρ = 0.1 (γ = 1/8, σ = 1/5.2 fixed). Right: −log L over (β, s₀); the dark ridge is where R_eff ≈ 1.6.', h: 300, autoplay: false,
  params: [{ k: 'beta', label: 'β', min: 0.2, max: 0.6, val: 0.3, step: 0.01, fmt: (v: number) => v.toFixed(2) }, { k: 's0', label: 's₀ (susceptible share)', min: 0.3, max: 1, val: 1, step: 0.05, fmt: (v: number) => v.toFixed(2) }],
  init() {
    const B = 21, Sn = 15, map: number[][] = [];
    for (let i = 0; i < B; i++) { map.push([]); for (let j = 0; j < Sn; j++) map[i].push(fitAt(0.2 + 0.02 * i, 0.3 + 0.05 * j).nll); }
    const flat = map.flat(), lo = Math.min(...flat), hi = Math.max(...flat); return { map, lo, top: Math.log10(1 + hi - lo), B, Sn };
  },
  draw(c: VizCtx, S: any, P: any) {
    const f = fitAt(P.beta, P.s0);
    const o = c.pads(46, c.W * 0.42, 18, 28); c.view(0, 30, 0, 2400); c.grid(6, 4); c.axes('week', 'cases'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    SYNTH.forEach((v, i) => c.dot(i + 0.5, v, 3.2, QC.pos)); c.path(f.mu.map((v, i) => [i + 0.5, v] as [number, number]), QC.warm, 2.2, 6); c.unpad(o);
    const x0 = c.W * 0.62, w = c.W - x0 - 14, h = c.H - 40, cw = w / S.B, ch = h / S.Sn;
    for (let i = 0; i < S.B; i++) for (let j = 0; j < S.Sn; j++) { const d = Math.log10(1 + S.map[i][j] - S.lo) / S.top; c.ctx.fillStyle = `rgb(${Math.round(13 + 220 * d)},${Math.round(17 + 160 * d)},${Math.round(23 + 60 * d)})`; c.ctx.fillRect(x0 + i * cw, 10 + h - (j + 1) * ch, cw + 0.5, ch + 0.5); }
    c.sdot(x0 + ((P.beta - 0.2) / 0.02 + 0.5) * cw, 10 + h - ((P.s0 - 0.3) / 0.05 + 0.5) * ch, 6, '#fff', 8);
    c.txt(x0, c.H - 12, 'β →  (0.20 – 0.60)', QC.dim, 11); c.txt(x0 + w, 22, 's₀ ↑', QC.dim, 11, 'right');
  },
  stats(_S: any, P: any) { const f = fitAt(P.beta, P.s0), best = fitAt(0.4, 0.5); return [['−log L above best', (f.nll - best.nll).toFixed(1), QC.energy], ['ρ', f.rho.toFixed(3), QC.dim], ['R_eff = β·s₀/γ', (P.beta * P.s0 / GAM).toFixed(2), QC.warm]]; },
};

/* ---------- s3p4: linearisation ---------- */
const LV = { a: 1, b: 0.1, d: 0.075, g: 1.5 };
export function lvLoop(x0: number, dt = 0.002) {
  const f = (x: number, y: number) => [LV.a * x - LV.b * x * y, LV.d * x * y - LV.g * y];
  let x = x0, y = 10, t = 0; const pts: [number, number][] = [[x, y]]; const peaks: number[] = []; let px = x, ppx = x;
  while (t < 40 && peaks.length < 2) {
    const k1 = f(x, y), k2 = f(x + dt / 2 * k1[0], y + dt / 2 * k1[1]), k3 = f(x + dt / 2 * k2[0], y + dt / 2 * k2[1]), k4 = f(x + dt * k3[0], y + dt * k3[1]);
    x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); t += dt;
    if (px > ppx && px > x && t > 0.1) peaks.push(t - dt); ppx = px; px = x; if (!peaks.length) pts.push([x, y]);
  }
  return { pts, period: peaks.length === 2 ? peaks[1] - peaks[0] : NaN };
}
VIZ.linearise = { ...STEP,
  title: 'Near the balance point the loop is an ellipse with a known period', eq: 'J(20, 10) = [[0, −2], [0.75, 0]] &nbsp;|&nbsp; eigenvalues ±i√1.5 &nbsp;|&nbsp; T = 2π/√(αγ) = 5.130',
  note: 'Dashed: the linearised ellipse. Small loops follow it; big loops bend away and take longer.', h: 290, autoplay: false,
  params: [{ k: 'x0', label: 'start prey (y₀ = 10)', min: 21, max: 60, val: 22, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const L = lvLoop(P.x0); const mx = Math.max(30, ...L.pts.map(p => p[0])) * 1.08, my = Math.max(16, ...L.pts.map(p => p[1])) * 1.08;
    c.view(0, mx, 0, my); c.grid(4, 4); c.axes('prey x', 'predators y'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    // linearised solution: x − 20 = A cos ωt, y − 10 = (A·0.75/ω) sin ωt with ω = √1.5
    const w = Math.sqrt(1.5), A = P.x0 - 20, el: [number, number][] = []; for (let i = 0; i <= 120; i++) { const t = (i / 120) * 2 * Math.PI / w; el.push([20 + A * Math.cos(w * t), 10 + (A * 0.75 / w) * Math.sin(w * t)]); }
    c.ctx.save(); c.ctx.setLineDash([5, 4]); c.path(el, 'rgba(227,179,65,.8)', 1.6); c.ctx.restore();
    c.path(L.pts, QC.vel, 2.2, 6); c.dot(20, 10, 5, QC.energy, 8); c.dot(0, 0, 5, QC.bad, 8);
    c.chip(c.X(20) + 8, c.Y(10) - 22, 'centre ±1.22i', QC.energy); c.chip(c.X(0) + 8, c.Y(0) - 26, 'saddle 1, −1.5', QC.bad);
  },
  stats(_S: any, P: any) { const L = lvLoop(P.x0); return [['simulated period', L.period.toFixed(3), QC.vel], ['2π/√(αγ)', (2 * Math.PI / Math.sqrt(1.5)).toFixed(3), QC.energy]]; },
};

/* ---------- s3p4: chase ---------- */
VIZ.chase = { ...STEP,
  title: 'Foxes chase rabbits: agents instead of equations', eq: 'rabbits breed toward 600 · foxes eat within 8 px, starve slowly, split at energy 3',
  note: 'Random each run; the guide’s rules, sped up.', h: 300,
  init() {
    const R = rng(Math.floor(Math.random() * 1e6)), W = 900, H = 600;
    return { R, W, H, r: Array.from({ length: 200 }, () => [R.u() * W, R.u() * H]), f: Array.from({ length: 6 }, () => [R.u() * W, R.u() * H, 1.5]), hist: [] as number[][], k: 0 };
  },
  step(S: any) {
    for (let rep = 0; rep < 3; rep++) {
      const R = S.R, wrap = (p: number[]) => { p[0] = (p[0] + S.W) % S.W; p[1] = (p[1] + S.H) % S.H; };
      const n = S.r.length, born: number[][] = [];
      for (const p of S.r) { p[0] += R.normal() * 1.2; p[1] += R.normal() * 1.2; wrap(p); if (R.u() < 0.02 * Math.max(0, 1 - n / 600)) born.push([p[0] + R.normal() * 3, p[1] + R.normal() * 3]); }
      S.r.push(...born); if (R.u() < 0.01) S.r.push([R.u() * S.W, R.u() * S.H]);
      const kids: number[][] = [];
      for (const fx of S.f) {
        let bi = -1, bd = 1e9; for (let i = 0; i < S.r.length; i++) { const d = (S.r[i][0] - fx[0]) ** 2 + (S.r[i][1] - fx[1]) ** 2; if (d < bd) { bd = d; bi = i; } }
        if (bi >= 0 && bd < 1600) { const d = Math.sqrt(bd) || 1; fx[0] += 2.4 * (S.r[bi][0] - fx[0]) / d; fx[1] += 2.4 * (S.r[bi][1] - fx[1]) / d; } else { fx[0] += R.normal() * 1.4; fx[1] += R.normal() * 1.4; }
        wrap(fx); if (bi >= 0 && bd < 64) { S.r.splice(bi, 1); fx[2] += 0.5; }
        fx[2] -= 0.004; if (fx[2] >= 3 && S.f.length + kids.length < 120) { fx[2] = 1.5; kids.push([fx[0], fx[1], 1.5]); }
      }
      S.f = S.f.concat(kids).filter((fx: number[]) => fx[2] > 0); if (S.f.length < 3 && R.u() < 0.002) S.f.push([R.u() * S.W, R.u() * S.H, 1.5]);
      if (++S.k % 10 === 0) { S.hist.push([S.r.length, S.f.length]); if (S.hist.length > 400) S.hist.shift(); }
    }
  },
  draw(c: VizCtx, S: any) {
    const k = Math.min((c.W * 0.62) / 900, (c.H - 16) / 600);
    c.ctx.strokeStyle = 'rgba(140,160,190,.3)'; c.ctx.strokeRect(8, 8, 900 * k, 600 * k);
    for (const p of S.r) c.sdot(8 + p[0] * k, 8 + p[1] * k, 1.8, '#e6edf3'); for (const f of S.f) c.sdot(8 + f[0] * k, 8 + f[1] * k, 4, QC.warm, 6);
    const o = c.pads(c.W * 0.66, 14, 18, 26); c.view(0, 400, 0, 700); c.grid(4, 3); c.axes('time', ''); c.ticks(false, v => v.toFixed(0));
    c.path(S.hist.map((h: number[], i: number) => [i, h[0]] as [number, number]), '#e6edf3', 1.6); c.path(S.hist.map((h: number[], i: number) => [i, h[1] * 5] as [number, number]), QC.warm, 1.8);
    c.unpad(o);
  },
  stats(S: any) { return [['rabbits', S.r.length, QC.dim], ['foxes (chart ×5)', S.f.length, QC.warm]]; },
};

/* ---------- s3p5: hourly battery, cost map, gradient descent ---------- */
/** Synthetic month: half-sine sunshine 06–18 h, a repeating pattern of cloudy days, evening-peak load. Same as the guide's test data. */
export function syntheticHours(days = 30) {
  const irr: number[] = [], load: number[] = [];
  for (let h = 0; h < 24 * days; h++) { const d = Math.floor(h / 24), hod = h % 24, cloud = 0.2 + 0.8 * ((d * 7) % 10) / 9; irr.push(hod >= 6 && hod < 18 ? cloud * Math.sin(Math.PI * (hod - 6 + 0.5) / 12) : 0); load.push(hod >= 18 && hod < 23 ? 0.6 : 0.15); }
  return { irr, load };
}
const SY = syntheticHours(); const LTOT = SY.load.reduce((a, b) => a + b, 0);
export function simulateBattery(irr: number[], load: number[], panel: number, batt: number, eff = 0.8) {
  let soc = batt / 2, unmet = 0, short = 0; const socs: number[] = [];
  for (let i = 0; i < irr.length; i++) { let s = soc + panel * irr[i] * eff - load[i]; if (s > batt) s = batt; else if (s < 0) { short -= s; unmet++; s = 0; } soc = s; socs.push(soc); }
  return { socs, unmet, short };
}
export const shortFrac = (p: number, b: number) => simulateBattery(SY.irr, SY.load, p, b).short / LTOT;
export const costOf = (p: number, b: number) => 700 * p + 300 * b;
export const smoothScore = (p: number, b: number, lam: number) => costOf(p, b) + lam * Math.max(0, shortFrac(p, b) - 0.05) ** 2;
export function gradientPath(p: number, b: number) {
  const path: [number, number][] = [[p, b]];
  for (const lam of [1e4, 1e5, 1e6, 1e7]) {
    let step = 0.5, f = smoothScore(p, b, lam), it = 0;
    while (step > 1e-4 && it++ < 3000) {
      const h = 1e-3, gp = (smoothScore(p + h, b, lam) - smoothScore(p - h, b, lam)) / (2 * h), gb = (smoothScore(p, b + h, lam) - smoothScore(p, b - h, lam)) / (2 * h), n = Math.hypot(gp, gb);
      if (!n) break; const pn = Math.max(0.1, p - step * gp / n), bn = Math.max(0, b - step * gb / n), fn = smoothScore(pn, bn, lam);
      if (fn < f) { p = pn; b = bn; f = fn; path.push([p, b]); step *= 1.5; } else step /= 2;
    }
  }
  return path;
}
export function gridBest() { let best = [Infinity, 0, 0]; for (let i = 0; i < 36; i++) for (let j = 0; j <= 40; j++) { const p = 0.5 + 0.1 * i, b = 0.5 * j; if (shortFrac(p, b) <= 0.05 && costOf(p, b) < best[0]) best = [costOf(p, b), p, b]; } return best; }

VIZ.battery = { ...STEP,
  title: 'A battery hour by hour: charge by day, drain at night', eq: 'soc ← clip(soc + panel·sun·0.8 − load, 0, battery) &nbsp;|&nbsp; red = hours the house goes short',
  note: 'Synthetic 10 days: a repeating pattern of sunny and cloudy days, evening-peak load of 5.85 kWh/day.', h: 280, autoplay: false,
  params: [{ k: 'p', label: 'panel kW', min: 0.5, max: 4, val: 2, step: 0.1, fmt: (v: number) => v.toFixed(1) }, { k: 'b', label: 'battery kWh', min: 0, max: 15, val: 5.5, step: 0.5, fmt: (v: number) => v.toFixed(1) }],
  init() { return {}; },
  draw(c: VizCtx, _S: any, P: any) {
    const n = 240, r = simulateBattery(SY.irr.slice(0, n), SY.load.slice(0, n), P.p, P.b);
    c.view(0, n, 0, Math.max(1, P.b) * 1.15); c.grid(10, 4); c.axes('hour', 'kWh in battery'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    for (let i = 0; i < n; i++) { const hgt = SY.irr[i] * Math.max(1, P.b) * 0.35; c.ctx.fillStyle = 'rgba(227,179,65,.25)'; c.ctx.fillRect(c.X(i), c.Y(hgt), Math.max(1, c.X(1) - c.X(0)), c.Y(0) - c.Y(hgt)); }
    c.path(r.socs.map((v, i) => [i, v] as [number, number]), QC.vel, 2, 6);
    let s = 0; for (let i = 0; i < n; i++) { const g = s + P.p * SY.irr[i] * 0.8 - SY.load[i]; if (g < 0) c.dot(i, 0, 2.6, QC.bad); s = Math.min(P.b, Math.max(0, g)); }
  },
  stats(_S: any, P: any) { const r = simulateBattery(SY.irr, SY.load, P.p, P.b); return [['short hours (30 d)', r.unmet, r.short / LTOT > 0.05 ? QC.bad : QC.vel], ['energy short', (100 * r.short / LTOT).toFixed(1) + '%', r.short / LTOT > 0.05 ? QC.bad : QC.vel], ['cost', '$' + costOf(P.p, P.b).toFixed(0), QC.energy]]; },
};

function drawCostMap(c: VizCtx, S: any) {
  c.view(0.5, 4, 0, 20); const cw = (c.X(0.6) - c.X(0.5)), ch = (c.Y(0) - c.Y(0.5));
  for (const [p, b, cost, ok] of S.cells) { const t = Math.min(1, (cost - 1500) / 6500); c.ctx.fillStyle = ok ? `rgb(${Math.round(30 + 200 * t)},${Math.round(110 + 100 * t)},${Math.round(60 - 20 * t)})` : '#30363d'; c.ctx.fillRect(c.X(p) - cw / 2, c.Y(b) - ch / 2, cw + 0.5, ch + 0.5); }
  c.axes('panel kW', 'battery kWh'); c.ticks(v => v.toFixed(1), v => v.toFixed(0));
  c.ctx.save(); c.ctx.strokeStyle = '#fff'; c.ctx.lineWidth = 2; c.ctx.strokeRect(c.X(S.best[1]) - cw / 2, c.Y(S.best[2]) - ch / 2, cw, ch); c.ctx.restore();
}
function costCells() { const cells: [number, number, number, boolean][] = []; for (let i = 0; i < 36; i++) for (let j = 0; j <= 40; j++) { const p = 0.5 + 0.1 * i, b = 0.5 * j; cells.push([p, b, costOf(p, b), shortFrac(p, b) <= 0.05]); } return cells; }
const STARTS = [[4, 20], [0.6, 20], [4, 0], [1, 2]];

VIZ.costmap = { ...STEP,
  title: 'The cost landscape and a greedy ball', eq: 'colour = 700·panel + 300·battery &nbsp;|&nbsp; grey = more than 5% of energy unmet &nbsp;|&nbsp; white box = brute force',
  note: 'Synthetic month (same data as the tests). The ball moves to the cheapest neighbour until none is cheaper.', h: 300, autoplay: false, stepBtn: true, resetOnParam: true,
  params: [{ k: 'start', label: 'start corner', min: 0, max: 3, val: 0, step: 1, fmt: (v: number) => STARTS[v].join(', ') }],
  init(P: any) { return { cells: costCells(), best: gridBest(), path: [STARTS[P.start]], stuck: false }; },
  stepOnce(S: any) {
    if (S.stuck) return; const [p, b] = S.path.at(-1); const sc = (p: number, b: number) => costOf(p, b) + (shortFrac(p, b) > 0.05 ? 1e6 : 0);
    const nb = [[p + 0.1, b], [p - 0.1, b], [p, b + 0.5], [p, b - 0.5]].filter(([x, y]) => x >= 0.49 && x <= 4.01 && y >= 0 && y <= 20);
    const q = nb.reduce((m, x) => (sc(x[0], x[1]) < sc(m[0], m[1]) ? x : m)); if (sc(q[0], q[1]) < sc(p, b)) S.path.push(q); else S.stuck = true;
  },
  draw(c: VizCtx, S: any) { drawCostMap(c, S); c.path(S.path, QC.bad, 2.4, 6); const e = S.path.at(-1); c.dot(e[0], e[1], 6, QC.bad, 10); },
  stats(S: any) { const e = S.path.at(-1); return [['brute force', `$${S.best[0].toFixed(0)}`, '#fff'], ['ball', `$${costOf(e[0], e[1]).toFixed(0)}${S.stuck ? ' (stopped)' : ''}`, QC.bad], ['moves', S.path.length - 1, QC.dim]]; },
};

VIZ.gradient = { ...STEP,
  title: 'Gradient descent on a smoothed cost', eq: 'score = cost + λ·max(0, shortfall − 5%)² &nbsp;|&nbsp; step against the finite-difference gradient; λ raised 10⁴ → 10⁷',
  note: 'Synthetic month. Every start ends at the same design, a little cheaper than the grid because panel and battery may take any value.', h: 300, autoplay: false, stepBtn: true, resetOnParam: true,
  params: [{ k: 'start', label: 'start', min: 0, max: 3, val: 0, step: 1, fmt: (v: number) => STARTS[v].join(', ') }],
  init(P: any) { return { cells: costCells(), best: gridBest(), full: gradientPath(STARTS[P.start][0], STARTS[P.start][1]), k: 1 }; },
  stepOnce(S: any) { S.k = Math.min(S.full.length, S.k + 15); },
  draw(c: VizCtx, S: any) { drawCostMap(c, S); const p = S.full.slice(0, S.k); c.path(p, '#58a6ff', 2.4, 8); const e = p.at(-1); c.dot(e[0], e[1], 6, '#58a6ff', 10); },
  stats(S: any) { const e = S.full[S.k - 1]; return [['grid best', `$${S.best[0].toFixed(0)}`, '#fff'], ['descent', `$${costOf(e[0], e[1]).toFixed(0)} at (${e[0].toFixed(2)}, ${e[1].toFixed(2)})`, QC.pos], ['shortfall', (100 * shortFrac(e[0], e[1])).toFixed(2) + '%', QC.dim], ['moves', `${S.k - 1} / ${S.full.length - 1}`, QC.dim]]; },
};

export const STEP_WIDGETS_3 = ['stiff', 'adaptive', 'orbitdrift', 'blobs', 'poissonfit', 'linearise', 'chase', 'battery', 'costmap', 'gradient'];
