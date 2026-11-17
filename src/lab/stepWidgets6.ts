/** Stage 6 step visuals, plus the two housekeeping visuals (project folder, git history) used by every guide.
 *  Numbers match scripts/reference/s6p2 (SALib); the rainy-season series is a labelled made-up example. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const mono = '12.5px ui-monospace, SFMono-Regular, Menlo, monospace';
const pct = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y), k = (s.length - 1) * p / 100, f = Math.floor(k); return s[f] + (s[Math.min(f + 1, s.length - 1)] - s[f]) * (k - f); };

/* ================= housekeeping: folder and git ================= */
const TREE = ['my-project/', '├── .venv/            your private Python', '├── src/', '│   ├── __init__.py', '│   └── main.py', '├── tests/', '│   └── test_*.py', '├── README.md', '├── requirements.txt  exact package versions', '└── .gitignore        keeps .venv out of git'];
VIZ.folder = { ...STEP,
  title: 'What the setup block builds', eq: 'one folder · one private Python (.venv) · empty files · a first git save',
  note: 'Each line appears as the command that makes it runs. Your folder name and file names come from the block in this step.', h: 260,
  init() { return { t: 0 }; },
  step(S: any, dt: number) { S.t = Math.min(S.t + dt * 2.2, TREE.length + 3); },
  draw(c: VizCtx, S: any) {
    const x = c.ctx; x.font = mono; x.textAlign = 'left';
    TREE.forEach((l, i) => { if (S.t > i) { x.fillStyle = i === 0 ? QC.energy : l.includes('.venv') ? QC.cool : '#d8dee9'; x.globalAlpha = Math.min(1, S.t - i); x.fillText(l, 24, 30 + i * 20); } });
    x.globalAlpha = 1;
    if (S.t > TREE.length + 1) { x.fillStyle = QC.vel; x.fillText('(.venv) $ git commit -m "Start: empty project structure"', 24, 30 + TREE.length * 20 + 12); }
  },
  stats(S: any) { return [['items made', Math.min(TREE.length, Math.floor(S.t)), QC.energy], ['git saves', S.t > TREE.length + 1 ? 1 : 0, QC.vel]]; },
};
const SAVES = ['Start: empty project structure', 'checks for the first function', 'first function passes', 'more checks, more code', 'window opens', 'the live view works', 'README with run command', 'Finish: the project'];
VIZ.gitlog = { ...STEP,
  title: 'Your project history, one save at a time', eq: 'git add . → git commit -m "…" → git log --oneline (newest on top)',
  note: 'Every save is a snapshot you can return to. Small, frequent saves with clear messages are the habit; the last one is the finished project.', h: 270,
  init() { return { t: 0 }; },
  step(S: any, dt: number) { S.t = Math.min(S.t + dt * 1.6, SAVES.length + 1); },
  draw(c: VizCtx, S: any) {
    const x = c.ctx, n = Math.min(SAVES.length, Math.floor(S.t)); x.font = mono; x.textAlign = 'left';
    for (let i = 0; i < n; i++) {
      const y = 30 + (n - 1 - i) * 26, newest = i === n - 1;
      c.sdot(40, y - 4, newest ? 7 : 5, newest ? QC.vel : QC.dim, newest ? 8 : 0);
      if (i > 0) { x.strokeStyle = 'rgba(230,237,243,.25)'; x.lineWidth = 2; x.beginPath(); x.moveTo(40, y + 2); x.lineTo(40, y + 20); x.stroke(); }
      x.fillStyle = QC.energy; x.fillText((0x1a2b3c + i * 7919).toString(16).slice(0, 7), 58, y);
      x.fillStyle = newest ? '#e6edf3' : '#9aa4b2'; x.fillText(SAVES[i], 130, y);
    }
  },
  stats(S: any) { return [['saves', Math.min(SAVES.length, Math.floor(S.t)), QC.vel]]; },
};

/* ================= s6p1: reproduce a published result ================= */
/** SIR prevalence curve, one value per day. Euler with step dt (the "library default" suspect). */
export function sirCurve(beta: number, gamma: number, i0: number, dt: number, days = 160) {
  let S = 1 - i0, I = i0; const out = [I], per = Math.max(1, Math.round(1 / dt)), h = 1 / per;
  for (let d = 1; d <= days; d++) { for (let k = 0; k < per; k++) { const inf = beta * S * I, rec = gamma * I; S -= h * inf; I += h * (inf - rec); } out.push(I); }
  return out;
}
export function sirCurveCoarse(beta: number, gamma: number, i0: number, dt: number, days = 160) {
  // dt above one day: step dt and sample the nearest step for each day
  if (dt <= 1) return sirCurve(beta, gamma, i0, dt, days);
  let S = 1 - i0, I = i0; const pts: [number, number][] = [[0, I]];
  for (let t = dt; t <= days + 1e-9; t += dt) { const inf = beta * S * I, rec = gamma * I; S -= dt * inf; I += dt * (inf - rec); pts.push([t, I]); }
  return Array.from({ length: days + 1 }, (_, d) => pts.reduce((b, p) => Math.abs(p[0] - d) < Math.abs(b[0] - d) ? p : b)[1]);
}
const PAPER = { beta: 0.3, gamma: 0.1, i0: 1e-4 };
const peakOf = (c: number[]) => { let k = 0; c.forEach((v, i) => { if (v > c[k]) k = i; }); return { day: k, val: c[k] }; };
VIZ.reproduce = { ...STEP,
  title: 'Your run against the paper’s figure', eq: 'paper: SIR, β = 0.3, γ = 0.1 (stated) · starting infected = UNSTATED · integrator = UNSTATED',
  note: 'A made-up “paper” so you can practise. Move the two suspects and watch which part of the curve each one moves: the starting fraction shifts the timing, the step size changes the height.', h: 300, autoplay: false, resetOnParam: true,
  params: [
    { k: 'lg', label: 'your starting infected (log₁₀)', min: -6, max: -2, val: -2, step: 0.5, fmt: (v: number) => `1e${v}` },
    { k: 'dt', label: 'your step size (days)', min: 0.1, max: 3, val: 0.1, step: 0.1, fmt: (v: number) => v.toFixed(1) },
  ],
  init(P: any) { return { paper: sirCurve(PAPER.beta, PAPER.gamma, PAPER.i0, 0.01), mine: sirCurveCoarse(PAPER.beta, PAPER.gamma, 10 ** P.lg, P.dt) }; },
  draw(c: VizCtx, S: any) {
    c.view(0, 160, 0, 0.42); c.grid(8, 4); c.axes('day', 'infected fraction'); c.ticks(v => v.toFixed(0), v => v.toFixed(2));
    c.ctx.save(); c.ctx.setLineDash([6, 5]); c.path(S.paper.map((v: number, i: number) => [i, v] as [number, number]), 'rgba(230,237,243,.75)', 2.2); c.ctx.restore();
    c.path(S.mine.map((v: number, i: number) => [i, v] as [number, number]), QC.vel, 2.4, 6);
    c.legend([['the paper (dashed)', '#d8dee9'], ['your run', QC.vel]]);
  },
  stats(S: any) { const a = peakOf(S.paper), b = peakOf(S.mine), d = 100 * (b.val - a.val) / a.val;
    return [['peak difference', `${d >= 0 ? '+' : ''}${d.toFixed(1)}%`, Math.abs(d) < 2 ? QC.vel : QC.warm], ['peak day shift', `${b.day - a.day >= 0 ? '+' : ''}${b.day - a.day} days`, Math.abs(b.day - a.day) <= 1 ? QC.vel : QC.warm]]; },
};

/* ================= s6p2: sensitivity ================= */
export const ISHI = { a: 7, b: 0.1 };
export function ishigami(x1: number, x2: number, x3: number) { return Math.sin(x1) + ISHI.a * Math.sin(x2) ** 2 + ISHI.b * x3 ** 4 * Math.sin(x1); }
/** Exact first-order and total indices of the Ishigami function (a = 7, b = 0.1). */
export function ishigamiExact() {
  const { a, b } = ISHI, p = Math.PI, V1 = 0.5 * (1 + b * p ** 4 / 5) ** 2, V2 = a * a / 8, V13 = b * b * p ** 8 * (1 / 18 - 1 / 50), V = V1 + V2 + V13;
  return { S1: [V1 / V, V2 / V, 0], ST: [(V1 + V13) / V, V2 / V, V13 / V] };
}
VIZ.ishigami = { ...STEP,
  title: 'A test function whose answer is known exactly', eq: 'Y = sin x₁ + 7 sin² x₂ + 0.1 x₃⁴ sin x₁ &nbsp;|&nbsp; exact S₁ = 0.31, 0.44, 0.00',
  note: 'Each panel plots the output against one input. A clear trend means a large first-order index. x₃ shows no trend at all, yet it widens the spread: it matters only through its interaction with x₁ (total index 0.24).', h: 280, resetOnParam: true,
  params: [{ k: 'n', label: 'samples', min: 100, max: 2000, val: 600, step: 100, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { const R = rng(3), u = () => -Math.PI + 2 * Math.PI * R.u(); return { pts: Array.from({ length: P.n }, () => { const x = [u(), u(), u()]; return [...x, ishigami(x[0], x[1], x[2])]; }) }; },
  draw(c: VizCtx, S: any) {
    const x = c.ctx, w = (c.W - 40) / 3, h = c.H - 50, ex = ishigamiExact();
    for (let k = 0; k < 3; k++) {
      const x0 = 20 + k * w; x.strokeStyle = 'rgba(230,237,243,.18)'; x.strokeRect(x0 + 4, 10, w - 8, h);
      x.fillStyle = [QC.pos, QC.vel, QC.mag][k];
      for (const p of S.pts) { const sx = x0 + 4 + (p[k] + Math.PI) / (2 * Math.PI) * (w - 8), sy = 10 + h - (p[3] + 11) / 29 * h; x.globalAlpha = 0.45; x.fillRect(sx - 1.2, sy - 1.2, 2.4, 2.4); }
      x.globalAlpha = 1; x.font = mono; x.textAlign = 'center'; x.fillStyle = '#e6edf3'; x.fillText(`x${k + 1}  ·  S₁ = ${ex.S1[k].toFixed(2)}`, x0 + w / 2, h + 32);
    }
  },
  stats() { const e = ishigamiExact(); return [['S₁ exact', e.S1.map(v => v.toFixed(2)).join(' · '), QC.vel], ['S_T(x₃)', e.ST[2].toFixed(2), QC.mag]]; },
};
export const SENS = { names: ['β', 'σ', 'γ', 'i₀'], bounds: [[0.3, 0.7], [0.1, 0.33], [0.07, 0.2], [0.0005, 0.005]] as [number, number][] };
/** Peak infected fraction of the fast SEIR (RK4), the same model as the reference. */
export function seirPeak(beta: number, sigma: number, gamma: number, i0: number, dt = 0.5, days = 250) {
  let S = 1 - i0, E = 0, I = i0, peak = I; const n = Math.round(days / dt);
  const f = (s: number, e: number, i: number) => [-beta * s * i, beta * s * i - sigma * e, sigma * e - gamma * i];
  for (let k = 0; k < n; k++) {
    const a = f(S, E, I), b = f(S + dt / 2 * a[0], E + dt / 2 * a[1], I + dt / 2 * a[2]), c = f(S + dt / 2 * b[0], E + dt / 2 * b[1], I + dt / 2 * b[2]), d = f(S + dt * c[0], E + dt * c[1], I + dt * c[2]);
    S += dt / 6 * (a[0] + 2 * b[0] + 2 * c[0] + d[0]); E += dt / 6 * (a[1] + 2 * b[1] + 2 * c[1] + d[1]); I += dt / 6 * (a[2] + 2 * b[2] + 2 * c[2] + d[2]); if (I > peak) peak = I;
  }
  return peak;
}
/** First-order (Saltelli 2010) and total (Jansen) Sobol indices from two random matrices A and B. */
export function sobol(f: (x: number[]) => number, bounds: [number, number][], n: number, seed = 1) {
  // A and B come from one 2k-dimensional Halton sequence (low discrepancy, like SALib's Sobol sequence), randomly shifted by the seed.
  const R = rng(seed), k = bounds.length, P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37], shift = P.map(() => R.u());
  const halton = (i: number, b: number) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  const pt = (j: number, d: number) => (halton(j + 1, P[d]) + shift[d]) % 1;
  const A = Array.from({ length: n }, (_, j) => bounds.map(([lo, hi], d) => lo + (hi - lo) * pt(j, d)));
  const B = Array.from({ length: n }, (_, j) => bounds.map(([lo, hi], d) => lo + (hi - lo) * pt(j, d + k)));
  const all0 = A.map(f).concat(B.map(f)), m = all0.reduce((s, v) => s + v, 0) / all0.length;
  const g = (x: number[]) => f(x) - m;   // centring the output cuts the estimator's noise a lot
  const fA = all0.slice(0, n).map(v => v - m), fB = all0.slice(n).map(v => v - m), all = fA.concat(fB), V = all.reduce((s, v) => s + v * v, 0) / all.length;
  const S1: number[] = [], ST: number[] = [];
  for (let i = 0; i < k; i++) {
    const fAB = A.map((row, j) => g(row.map((v, q) => (q === i ? B[j][i] : v))));
    S1.push(fB.reduce((s, v, j) => s + v * (fAB[j] - fA[j]), 0) / n / V);
    ST.push(fA.reduce((s, v, j) => s + (v - fAB[j]) ** 2, 0) / (2 * n) / V);
  }
  return { S1, ST };
}
const seirRow = (x: number[]) => seirPeak(x[0], x[1], x[2], x[3]);
VIZ.sobolbars = { ...STEP,
  title: 'Which input moves the peak? Sobol indices', eq: 'S₁ = share of the output variance from one input alone &nbsp;|&nbsp; S_T = including its interactions',
  note: 'Computed here, live, on the same SEIR and ranges as your guide: (k + 2)·N runs. Python with SALib gives γ 0.69, β 0.21, σ 0.09, i₀ 0.00. Small N wobbles; that is sampling noise, not science.', h: 280, autoplay: false, resetOnParam: true,
  params: [{ k: 'n', label: 'base samples N', min: 64, max: 512, val: 256, step: 64, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { return sobol(seirRow, SENS.bounds, P.n, 3); },
  draw(c: VizCtx, S: any) {
    c.view(0, 4, 0, 1); c.grid(4, 5); c.axes('input', 'index'); c.ticks(false, v => v.toFixed(1));
    const x = c.ctx;
    SENS.names.forEach((nm, i) => {
      const bw = (c.X(1) - c.X(0)) * 0.3, s1 = Math.max(0, S.S1[i]), st = Math.max(0, S.ST[i]), xc = c.X(i + 0.5);
      x.fillStyle = QC.vel; x.fillRect(xc - bw - 2, c.Y(s1), bw, c.Y(0) - c.Y(s1));
      x.fillStyle = 'rgba(188,140,255,.75)'; x.fillRect(xc + 2, c.Y(st), bw, c.Y(0) - c.Y(st));
      x.fillStyle = '#e6edf3'; x.font = '14px Inter, system-ui'; x.textAlign = 'center'; x.fillText(nm, xc, c.Y(0) + 18);
    });
    c.legend([['S₁ first order', QC.vel], ['S_T total', QC.mag]]);
  },
  stats(S: any) { const s = S.S1.reduce((a: number, b: number) => a + b, 0), top = S.S1.indexOf(Math.max(...S.S1)); return [['ΣS₁', s.toFixed(2), s <= 1.05 ? QC.vel : QC.bad], ['top input', SENS.names[top], QC.energy]]; },
};
VIZ.dials = { ...STEP,
  title: 'One slider per input, one needle for the peak', eq: 'drag a slider → the SEIR re-runs → the needle moves &nbsp;|&nbsp; faint needle = every slider at the middle of its range',
  note: 'Same model and ranges as your panel. Drag γ end to end, then i₀ end to end: the difference in needle travel is what the Sobol indices measure.', h: 270, autoplay: false,
  params: [
    { k: 'b', label: 'β  (0.3 – 0.7)', min: 0.3, max: 0.7, val: 0.5, step: 0.01, fmt: (v: number) => v.toFixed(2) },
    { k: 's', label: 'σ  (0.10 – 0.33)', min: 0.1, max: 0.33, val: 0.215, step: 0.005, fmt: (v: number) => v.toFixed(3) },
    { k: 'g', label: 'γ  (0.07 – 0.20)', min: 0.07, max: 0.2, val: 0.135, step: 0.005, fmt: (v: number) => v.toFixed(3) },
    { k: 'i', label: 'i₀  (0.0005 – 0.005)', min: 0.0005, max: 0.005, val: 0.00275, step: 0.00025, fmt: (v: number) => v.toFixed(4) },
  ],
  init() { return { ghost: seirPeak(0.5, 0.215, 0.135, 0.00275) }; },
  draw(c: VizCtx, S: any, P: any) {
    const x = c.ctx, cx = c.W / 2, cy = c.H - 30, r = Math.min(c.W / 2 - 30, c.H - 60), val = seirPeak(P.b, P.s, P.g, P.i), ang = (v: number) => Math.PI + Math.min(1, v / 0.5) * Math.PI;
    x.lineWidth = 14; x.strokeStyle = 'rgba(230,237,243,.12)'; x.beginPath(); x.arc(cx, cy, r, Math.PI, 2 * Math.PI); x.stroke();
    x.font = mono; x.fillStyle = '#9aa4b2'; x.textAlign = 'center';
    for (let v = 0; v <= 0.5001; v += 0.1) { const a = ang(v); x.fillText(v.toFixed(1), cx + (r + 22) * Math.cos(a), cy + (r + 22) * Math.sin(a) + 4); }
    const needle = (v: number, col: string, w: number) => { const a = ang(v); x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + (r - 10) * Math.cos(a), cy + (r - 10) * Math.sin(a)); x.stroke(); };
    needle(S.ghost, 'rgba(230,237,243,.25)', 3); needle(val, QC.energy, 4); c.sdot(cx, cy, 7, QC.energy, 6);
    S.val = val;
  },
  stats(S: any) { return [['peak infected', S.val !== undefined ? S.val.toFixed(3) : '…', QC.energy], ['middle of ranges', S.ghost.toFixed(3), QC.dim]]; },
};
/** Stand-in posterior from the Bayesian project: β and γ move together (R0 near 3). */
export function standInPosterior(n: number, seed = 1) {
  const R = rng(seed); return Array.from({ length: n }, () => { const g = 0.145 + 0.01 * R.normal(); return [3 * g + 0.008 * R.normal(), 0.1 + 0.23 * R.u(), g, 0.0005 + 0.0045 * R.u()]; });
}
export function boxSamples(n: number, seed = 2) { const R = rng(seed); return Array.from({ length: n }, () => SENS.bounds.map(([lo, hi]) => lo + (hi - lo) * R.u())); }
VIZ.postbox = { ...STEP,
  title: 'Uncertain inputs from data, not from a box', eq: 'grey: every corner of the box allowed &nbsp;|&nbsp; green: what the epidemic data allowed (β and γ move together)',
  note: 'Left: the inputs. Right: the 95% band of the peak each set of inputs produces. The posterior here is a stand-in shaped like the real one from s5p7 (R₀ ≈ 3). Fix σ to see what is left once β and γ are known.', h: 290, autoplay: false, resetOnParam: true,
  toggles: [{ k: 'fix', label: 'fix σ at the middle', on: false }],
  init(P: any) {
    const post = standInPosterior(400), box = boxSamples(400), sig = (r: number[]) => (P.fix ? 0.215 : r[1]);
    const run = (rows: number[][]) => rows.map(r => seirPeak(r[0], sig(r), r[2], r[3], 1));
    const pp = run(post), pb = run(box); return { post, box, band: [[pct(pb, 2.5), pct(pb, 97.5)], [pct(pp, 2.5), pct(pp, 97.5)]] };
  },
  draw(c: VizCtx, S: any) {
    const o = c.pads(null, c.W * 0.42); c.view(0.28, 0.72, 0.06, 0.21); c.grid(4, 3); c.axes('β', 'γ'); c.ticks(v => v.toFixed(2), v => v.toFixed(2));
    S.box.forEach((r: number[]) => c.dot(r[0], r[2], 2, 'rgba(154,164,178,.45)'));
    S.post.forEach((r: number[]) => c.dot(r[0], r[2], 2, QC.vel));
    c.unpad(o);
    const x = c.ctx, x0 = c.W * 0.64, w = c.W * 0.32, sc = (v: number) => x0 + v / 0.5 * w;
    x.font = mono; x.textAlign = 'left';
    [['box', 'rgba(154,164,178,.9)'], ['posterior', QC.vel]].forEach(([lab, col], i) => {
      const [lo, hi] = S.band[i], y = 70 + i * 70; x.fillStyle = col; x.fillRect(sc(lo), y, Math.max(2, sc(hi) - sc(lo)), 16);
      x.fillStyle = '#e6edf3'; x.fillText(`${lab}: ${lo.toFixed(2)} – ${hi.toFixed(2)}`, x0, y - 8);
    });
    x.fillStyle = '#9aa4b2'; x.fillText('peak infected fraction, 95% band', x0, 230);
  },
  stats(S: any) { return [['box width', (S.band[0][1] - S.band[0][0]).toFixed(2), QC.dim], ['posterior width', (S.band[1][1] - S.band[1][0]).toFixed(2), QC.vel]]; },
};

/* ================= s6p3: a pilot that earns its conclusion ================= */
/** Least-squares slope with a 95% interval (t ≈ 2 for a rough interval; exact t used in the reference). */
export function slopeCI(x: number[], y: number[]) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  const sxx = x.reduce((a, v) => a + (v - mx) ** 2, 0), b = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0) / sxx, a0 = my - b * mx;
  const s2 = y.reduce((a, v, i) => a + (v - a0 - b * x[i]) ** 2, 0) / Math.max(1, n - 2), se = Math.sqrt(s2 / sxx);
  const t = n > 30 ? 2.04 : [12.7, 4.3, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.2, 2.18, 2.16, 2.14, 2.13, 2.12, 2.11, 2.1, 2.09, 2.09, 2.08, 2.07, 2.07, 2.06, 2.06, 2.06, 2.05, 2.05, 2.05][Math.max(0, n - 3)];
  return { b, a: a0, lo: b - t * se, hi: b + t * se };
}
/** Made-up onset days. Seed chosen so the 95% interval holds the true trend at every stage of the reveal. */
export function rainSeries(tr: number, yrs: number) { const R = rng(9); return Array.from({ length: yrs }, (_, i) => [1991 + i, 60 + tr * i / 10 + 9 * R.normal()]); }
VIZ.rainshift = { ...STEP,
  title: 'Evidence arriving one year at a time', eq: 'onset day of the rainy season, one dot per year &nbsp;|&nbsp; line: trend with its 95% interval',
  note: 'A made-up example of a pilot question: “has the start of the main rains shifted later, in days per decade?” Shorter pilots give wider intervals. The verdict only says “shows” when the interval excludes zero.', h: 290, resetOnParam: true,
  params: [
    { k: 'tr', label: 'true trend (days per decade)', min: 0, max: 8, val: 4, step: 1, fmt: (v: number) => v.toFixed(0) },
    { k: 'yrs', label: 'years in the pilot', min: 8, max: 40, val: 33, step: 1, fmt: (v: number) => v.toFixed(0) },
  ],
  init(P: any) { return { n: 3, pts: rainSeries(P.tr, P.yrs) }; },
  step(S: any, dt: number) { S.n = Math.min(S.pts.length, S.n + dt * 4); },
  draw(c: VizCtx, S: any) {
    const k = Math.floor(S.n), pts = S.pts.slice(0, k); c.view(1990, 2032, 30, 95); c.grid(6, 4); c.axes('year', 'onset day'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    pts.forEach((p: number[]) => c.dot(p[0], p[1], 3.5, QC.pos, 4));
    if (k >= 4) { const r = slopeCI(pts.map((p: number[]) => p[0]), pts.map((p: number[]) => p[1])), xa = pts[0][0], xb = pts[k - 1][0];
      c.path([[xa, r.a + r.b * xa], [xb, r.a + r.b * xb]], QC.energy, 2.4, 6); S.r = r; }
  },
  stats(S: any) { if (!S.r) return [['trend', '…', QC.dim]]; const r = S.r, shows = r.lo > 0 || r.hi < 0;
    return [['trend (days/decade)', `${(10 * r.b).toFixed(1)} [${(10 * r.lo).toFixed(1)}, ${(10 * r.hi).toFixed(1)}]`, QC.energy], ['verdict', shows ? 'this shows a shift' : 'this only suggests', shows ? QC.vel : QC.warm]]; },
};

export const STEP_WIDGETS_6 = ['folder', 'gitlog', 'reproduce', 'ishigami', 'sobolbars', 'dials', 'postbox', 'rainshift'];
