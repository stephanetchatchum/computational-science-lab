/** Visuals for the two AI projects in Stage 5 (Moto-Taxi Rush and AI vs the Virus).
 *  The physics and the epidemic model are the same as in scripts/reference/s5p4 and s5p5, so the numbers match. */
import { VIZ, QC, type VizCtx } from '../content/legacy/viz.js';
import { rng } from '../lib/numerics/fft';

const STEP = { kind: 'step' } as const;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const speedCol = (t: number) => `rgb(${Math.round(248 - 185 * t)},${Math.round(81 + 104 * t)},${Math.round(73 + 7 * t)})`;

/* ================= traffic: the Intelligent Driver Model ================= */
export const IDM = { v0: 10, T: 1.0, a: 1.0, b: 1.5, s0: 2.0, car: 4.5 };
export function idmAccel(v: number, gap: number, dv: number, v0 = IDM.v0) {
  const sStar = IDM.s0 + Math.max(0, v * IDM.T + v * dv / (2 * Math.sqrt(IDM.a * IDM.b)));
  return IDM.a * (1 - (v / v0) ** 4 - (sStar / Math.max(gap, 0.1)) ** 2);
}
export const equilibriumGap = (v: number, v0 = IDM.v0) => (IDM.s0 + v * IDM.T) / Math.sqrt(1 - (v / v0) ** 4);

/** n cars on a ring of the given length, all at the equilibrium speed, one car half a metre out of place. */
export function ringStart(n: number, length = 230) {
  const gap = length / n - IDM.car; let lo = 0, hi = IDM.v0 * 0.999999;
  for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (equilibriumGap(m) < gap) lo = m; else hi = m; }
  const s = Array.from({ length: n }, (_, i) => (i * length) / n); s[0] += 0.5;
  return { s, v: s.map(() => lo), length, t: 0, vEq: lo };
}
export function ringStep(R: { s: number[]; v: number[]; length: number; t: number }, dt: number) {
  const n = R.s.length, idx = R.s.map((_, i) => i).sort((a, b) => R.s[a] - R.s[b]);
  const s = idx.map(i => R.s[i]), v = idx.map(i => R.v[i]), acc = new Array(n);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, gap = ((s[j] - s[i] + R.length) % R.length) - IDM.car; acc[i] = idmAccel(v[i], gap, v[i] - v[j]); }
  for (let i = 0; i < n; i++) { v[i] = Math.max(0, v[i] + acc[i] * dt); s[i] = (s[i] + v[i] * dt) % R.length; }
  R.s = s; R.v = v; R.t += dt;
}

VIZ.ringjam = { ...STEP,
  title: 'A traffic jam with no accident: cars on a circle', eq: 'IDM: a = a₀[1 − (v/v₀)⁴ − (s*/s)²], s* = s₀ + vT + vΔv / 2√(ab)',
  note: 'Like Sugiyama’s 2008 experiment: a 230 m circle. Every car starts at the same steady speed; one is half a metre out of place. Red = slow, green = fast. Time runs 20× faster than real.', h: 320, resetOnParam: true,
  params: [{ k: 'n', label: 'cars', min: 10, max: 26, val: 22, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { return ringStart(P.n); },
  step(S: any) { for (let k = 0; k < 4; k++) ringStep(S, 0.1); },
  draw(c: VizCtx, S: any) {
    c.view(-1.5, 1.5, -1.2, 1.2, true); const ctx = c.ctx, R = 1;
    ctx.strokeStyle = 'rgba(230,237,243,.15)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(c.X(0), c.Y(0), c.X(R) - c.X(0), 0, 2 * Math.PI); ctx.stroke();
    S.s.forEach((s: number, i: number) => { const a = (2 * Math.PI * s) / S.length; c.dot(R * Math.cos(a), R * Math.sin(a), 7, speedCol(clamp(S.v[i] / 8, 0, 1)), 6); });
    c.txt(c.X(0), c.Y(0.12), `${(S.t / 60).toFixed(1)} min`, QC.dim, 13, 'center');
    c.txt(c.X(0), c.Y(-0.08), `mean ${(S.v.reduce((a: number, b: number) => a + b, 0) / S.v.length * 3.6).toFixed(0)} km/h`, QC.exact, 14, 'center');
  },
  stats(S: any) { const m = S.v.reduce((a: number, b: number) => a + b, 0) / S.v.length, sd = Math.sqrt(S.v.reduce((a: number, b: number) => a + (b - m) ** 2, 0) / S.v.length);
    return [['slowest car', (Math.min(...S.v) * 3.6).toFixed(1) + ' km/h', QC.bad], ['speed spread', sd.toFixed(2) + ' m/s', QC.warm], ['steady speed at start', (S.vEq * 3.6).toFixed(1) + ' km/h', QC.dim]]; },
};

/* ================= the bike: a bicycle model with a friction limit ================= */
export const BIKE = { L: 1.3, muG: 0.7 * 9.81, vMax: 14 };
VIZ.bikegrip = { ...STEP,
  title: 'Turning at speed: the tyres decide, not the handlebars', eq: 'asked: radius = L / tan δ &nbsp;|&nbsp; allowed: radius ≥ v² / (μg)',
  note: 'Wheelbase L = 1.3 m, μg = 0.7 × 9.81 m/s². Dashed: the circle the rider asks for. Solid: the circle the tyres can give. Orange marks = skidding.', h: 320, resetOnParam: true,
  params: [{ k: 'v', label: 'speed', min: 2, max: 14, val: 8, step: 0.5, fmt: (v: number) => `${v.toFixed(1)} m/s (${(v * 3.6).toFixed(0)} km/h)` },
    { k: 'steer', label: 'handlebar angle', min: 0.02, max: 0.35, val: 0.15, step: 0.01, fmt: (v: number) => `${(v * 180 / Math.PI).toFixed(0)}°` }],
  init(P: any) {
    const asked = BIKE.L / Math.tan(P.steer), allowed = P.v * P.v / BIKE.muG;
    return { asked, real: Math.max(asked, allowed), skid: allowed > asked, t: 0, trail: [] as [number, number][] };
  },
  step(S: any, dt: number, P: any) { S.t += dt; const a = (P.v * S.t) / S.real; S.trail.push([S.real * Math.sin(a), S.real * (1 - Math.cos(a))]); if (S.trail.length > 400) S.trail.shift(); },
  draw(c: VizCtx, S: any) {
    const span = Math.min(Math.max(S.real, S.asked) * 2.4, 80); c.view(-span * 0.6, span * 1.1, -span * 0.25, span * 0.9, true);
    const ctx = c.ctx, circle = (r: number, col: string, dash: number[]) => { ctx.save(); ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c.X(0), c.Y(r), Math.abs(c.X(r) - c.X(0)), 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); };
    circle(S.asked, 'rgba(230,237,243,.55)', [6, 5]); circle(S.real, S.skid ? QC.acc : QC.vel, []);
    if (S.trail.length > 1) c.path(S.trail, S.skid ? QC.acc : QC.vel, 3, 6);
    const p = S.trail.at(-1) ?? [0, 0]; c.dot(p[0], p[1], 6, QC.energy, 10);
  },
  stats(S: any, P: any) { return [['asked radius', S.asked.toFixed(1) + ' m', QC.exact], ['tyres allow', (P.v * P.v / BIKE.muG).toFixed(1) + ' m', S.skid ? QC.acc : QC.vel], ['sideways pull', (P.v * P.v / S.real / 9.81).toFixed(2) + ' g', QC.energy]]; },
};

/* ================= the riders: neuroevolution on a straight 3-lane road ================= */
const NI = 10, NH = 8, NO = 2, NW = NI * NH + NH + NH * NO + NO;
const RAYS = [-90, -45, -20, 0, 20, 45, 90].map(d => (d * Math.PI) / 180), RAY_MAX = 40, CAR_R = 2, HALF = 5.25, ROAD = 400;
function think(w: Float64Array, x: number[]) {
  const h = new Array(NH).fill(0);
  for (let j = 0; j < NH; j++) { let s = w[NI * NH + j]; for (let i = 0; i < NI; i++) s += x[i] * w[i * NH + j]; h[j] = Math.tanh(s); }
  const o = [0, 0], k = NI * NH + NH;
  for (let q = 0; q < NO; q++) { let s = w[k + NH * NO + q]; for (let j = 0; j < NH; j++) s += h[j] * w[k + j * NO + q]; o[q] = Math.tanh(s); }
  return o;
}
function newTraffic(seed: number) {
  const R = rng(seed), cars: { x: number; y: number; v: number; v0: number }[] = [];
  [-3.5, 0, 3.5].forEach((y, lane) => { const v0 = [8, 10, 12][lane]; for (let k = 0; k < 7; k++) { let x = (k * ROAD) / 7 + 8 * R.u() + 30; if (lane === 1 && x % ROAD < 25) x += 25; cars.push({ x: x % ROAD, y, v: v0 * (0.6 + 0.3 * R.u()), v0 }); } });
  return cars;
}
function stepTraffic(cars: { x: number; y: number; v: number; v0: number }[], dt: number) {
  for (const y of [-3.5, 0, 3.5]) {
    const lane = cars.filter(c => c.y === y).sort((a, b) => a.x - b.x);
    const acc = lane.map((c, i) => { const n = lane[(i + 1) % lane.length]; return idmAccel(c.v, ((n.x - c.x + ROAD) % ROAD) - IDM.car, c.v - n.v, c.v0); });
    lane.forEach((c, i) => { c.v = Math.max(0, c.v + acc[i] * dt); c.x = (c.x + c.v * dt) % ROAD; });
  }
}
function ray(b: any, a: number, cars: any[]) {
  const ca = Math.cos(b.th + a), sa = Math.sin(b.th + a);
  for (let k = 1; k <= RAY_MAX; k++) {
    const px = b.x + k * ca, py = b.y + k * sa; if (Math.abs(py) > HALF) return k;
    for (const c of cars) { let dx = ((px - c.x) % ROAD + ROAD) % ROAD; if (dx > ROAD / 2) dx -= ROAD; if (dx * dx + (py - c.y) ** 2 < CAR_R * CAR_R) return k; }
  }
  return RAY_MAX;
}
function newGen(S: any) {
  S.cars = newTraffic(1000 + S.gen); S.t = 0;
  S.bikes = S.pop.map((w: Float64Array) => ({ w, x: 0, y: 0, th: 0, v: 5, alive: true, prog: 0, prevFront: RAY_MAX, rays: RAYS.map(() => RAY_MAX), skid: false }));
}
VIZ.motoevo = { ...STEP,
  title: 'Moto-taxi riders learning to weave through traffic', eq: 'fitness = metres gained − 300 × crashed &nbsp;|&nbsp; keep the best 6, the rest are mutated copies',
  note: 'Runs in your browser: 30 riders, each a 10 → 8 → 2 neural network, on a straight 3-lane road (lanes at 8, 10 and 12 m/s). Every generation rides new traffic for 30 s. Rays are drawn for the leader.', h: 340, resetOnParam: false,
  params: [{ k: 'speed', label: 'sim speed', min: 1, max: 12, val: 3, step: 1, fmt: (v: number) => `${v}×` }],
  init() {
    const R = rng(7), pop = Array.from({ length: 30 }, () => Float64Array.from({ length: NW }, () => 0.5 * R.normal()));
    const S: any = { R, pop, gen: 0, history: [] as number[], best: 0 }; newGen(S); return S;
  },
  step(S: any, _dt: number, P: any) {
    const dt = 0.1;
    for (let k = 0; k < P.speed; k++) {
      for (const b of S.bikes) {
        if (!b.alive) continue;
        b.rays = RAYS.map(a => ray(b, a, S.cars)); const closing = (b.prevFront - b.rays[3]) / dt; b.prevFront = b.rays[3];
        const o = think(b.w, [...b.rays.map((r: number) => r / RAY_MAX), b.v / BIKE.vMax, Math.sin(b.th), clamp(closing / BIKE.vMax, -1, 1)]);
        const steer = 0.35 * o[0], target = (BIKE.vMax * (o[1] + 1)) / 2, acc = clamp(2 * (target - b.v), -6, 3);
        b.v = clamp(b.v + acc * dt, 0, BIKE.vMax); let kk = Math.tan(steer) / BIKE.L; const kMax = BIKE.muG / Math.max(b.v, 0.1) ** 2; b.skid = Math.abs(kk) > kMax; kk = clamp(kk, -kMax, kMax);
        b.x += b.v * Math.cos(b.th) * dt; b.y += b.v * Math.sin(b.th) * dt; b.th += b.v * kk * dt; b.prog += b.v * Math.cos(b.th) * dt;
        const hit = Math.abs(b.y) > HALF || S.cars.some((c: any) => { let dx = ((b.x - c.x) % ROAD + ROAD) % ROAD; if (dx > ROAD / 2) dx -= ROAD; return dx * dx + (b.y - c.y) ** 2 < CAR_R * CAR_R; });
        if (hit) { b.alive = false; b.crashed = true; }
      }
      stepTraffic(S.cars, dt); S.t += dt;
      if (S.t >= 30 || !S.bikes.some((b: any) => b.alive)) {
        const fit = S.bikes.map((b: any) => b.prog - (b.crashed ? 300 : 0)), order = fit.map((_: number, i: number) => i).sort((a: number, b: number) => fit[b] - fit[a]);
        S.history.push(fit[order[0]]); S.best = Math.max(S.best, fit[order[0]]);
        const elite = order.slice(0, 6).map((i: number) => S.pop[i]);
        S.pop = [...elite, ...Array.from({ length: 24 }, () => { const p: Float64Array = elite[Math.floor(S.R.u() * 6)]; return Float64Array.from(p, (v: number) => v + 0.15 * S.R.normal()); })];
        S.gen++; newGen(S); break;
      }
    }
  },
  draw(c: VizCtx, S: any) {
    const alive = S.bikes.filter((b: any) => b.alive), lead = (alive.length ? alive : S.bikes).reduce((a: any, b: any) => (b.prog > a.prog ? b : a));
    const cx = lead.x; c.view(cx - 25, cx + 45, -9, 9, true); const ctx = c.ctx;
    ctx.fillStyle = '#20262e'; ctx.fillRect(c.X(cx - 60), c.Y(HALF), c.X(cx + 90) - c.X(cx - 60), c.Y(-HALF) - c.Y(HALF));
    ctx.save(); ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(230,237,243,.35)'; for (const y of [-1.75, 1.75]) { ctx.beginPath(); ctx.moveTo(c.X(cx - 60), c.Y(y)); ctx.lineTo(c.X(cx + 90), c.Y(y)); ctx.stroke(); } ctx.restore();
    for (const car of S.cars) { let dx = ((car.x - cx) % ROAD + ROAD) % ROAD; if (dx > ROAD / 2) dx -= ROAD; const x = cx + dx; if (x < cx - 60 || x > cx + 90) continue; ctx.fillStyle = speedCol(clamp(car.v / 12, 0, 1)); ctx.fillRect(c.X(x - 2.25), c.Y(car.y + 0.9), c.X(x + 2.25) - c.X(x - 2.25), c.Y(car.y - 0.9) - c.Y(car.y + 0.9)); }
    RAYS.forEach((a, i) => { const r = lead.rays[i]; c.path([[lead.x, lead.y], [lead.x + r * Math.cos(lead.th + a), lead.y + r * Math.sin(lead.th + a)]], r < RAY_MAX ? 'rgba(248,81,73,.7)' : 'rgba(57,208,216,.45)', 1.2); });
    for (const b of S.bikes) { if (b.x < cx - 60 || b.x > cx + 90) continue; c.dot(b.x, b.y, b === lead ? 5.5 : 3.5, b.alive ? (b.skid ? QC.acc : QC.energy) : 'rgba(107,118,132,.6)', b === lead ? 10 : 0); }
    const H = S.history.slice(-40); if (H.length > 1) { const mx = Math.max(...H, 1), x0 = c.W - 200, y0 = 30, w = 170, h = 50; ctx.fillStyle = 'rgba(13,17,23,.7)'; ctx.fillRect(x0 - 6, y0 - 16, w + 12, h + 24);
      ctx.strokeStyle = QC.vel; ctx.lineWidth = 2; ctx.beginPath(); H.forEach((v: number, i: number) => { const X = x0 + (w * i) / (H.length - 1), Y = y0 + h - (h * Math.max(v, 0)) / mx; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); c.txt(x0, y0 - 6, 'best per generation', QC.dim, 11, 'left'); }
  },
  stats(S: any) { return [['generation', S.gen, QC.accent], ['riders still riding', `${S.bikes.filter((b: any) => b.alive).length} / 30`, QC.energy], ['best so far', S.best.toFixed(0) + ' m', QC.vel]]; },
};

/* ================= the virus: SEIR in 12 towns joined by travel ================= */
export const DEMO = {
  pops: [2000000, 933000, 597300, 435300, 340500, 278700, 235200, 203100, 178400, 158900, 143100, 130000],
  xy: [[34.259666857449744, 94.72420263843988], [320.5097860825588, 232.8648144257471], [37.65145689615967, 173.25077609458953], [191.6205192563336, 63.895565854831425], [293.8308605636858, 45.468807968561364], [156.4912761982648, 206.69607304854546], [172.25120816567113, 234.7194285752563], [295.1351149168641, 382.50690193443944], [113.68046549951659, 259.41888283193003], [278.4863986680622, 117.08829960499484], [0.5960334035344683, 389.3841099065651], [119.36048920675026, 125.59440081373472]],
};
export function gravityMatrix(pops: number[], xy: number[][]) {
  return pops.map((_, i) => { const row = pops.map((pj, j) => (i === j ? 0 : pj / ((xy[i][0] - xy[j][0]) ** 2 + (xy[i][1] - xy[j][1]) ** 2))); const s = row.reduce((a, b) => a + b, 0); return row.map(v => v / s); });
}
/** [transmission ×, travel ×, share of S vaccinated per day, cost per person per week] for nothing, test, lockdown, vaccinate. */
export const ACTIONS = [[1, 1, 0, 0], [0.7, 1, 0, 0.2], [0.3, 0.2, 0, 1], [1, 1, 0.005, 0.4]];
export function newOutbreak(R0: number, seedTown: number, pops = DEMO.pops, xy = DEMO.xy) {
  const n = pops.length, I = new Array(n).fill(0); I[seedTown] = 20;
  return { N: pops, G: gravityMatrix(pops, xy), beta: R0 / 6, sigma: 1 / 4, gamma: 1 / 6, travel: 0.02, S: pops.map((p, i) => p - I[i]), E: new Array(n).fill(0), I, R: new Array(n).fill(0), lastI: I.slice(), weeks: 0, cases: 0, score: 0, cost: 0, acts: new Array(n).fill(0), history: [] as number[] };
}
export function features(o: any) {
  return o.N.map((N: number, i: number) => { const prev = o.I[i] / N; let press = 0; for (let j = 0; j < o.N.length; j++) press += o.G[i][j] * (o.I[j] / o.N[j]); return [prev, Math.log((o.I[i] + 1) / (o.lastI[i] + 1)), press, o.R[i] / N, o.weeks >= 10 ? 1 : 0]; });
}
export function week(o: any, acts: number[], lam = 1) {
  const a = acts.map(k => (o.weeks < 10 && k === 3 ? 0 : k)); o.weeks++; o.lastI = o.I.slice(); o.acts = a;
  const n = o.N.length, h = 0.1, m = a.map(k => o.travel * ACTIONS[k][1]); let newInf = 0;
  for (let st = 0; st < 70; st++) {
    const frac = o.I.map((v: number, i: number) => v / o.N[i]);
    const seen = frac.map((f: number, i: number) => { let g = 0; for (let j = 0; j < n; j++) g += o.G[i][j] * frac[j]; return (1 - m[i]) * f + m[i] * g; });
    for (let i = 0; i < n; i++) {
      const inf = o.beta * ACTIONS[a[i]][0] * o.S[i] * seen[i] * h, prog = o.sigma * o.E[i] * h, rec = o.gamma * o.I[i] * h, vac = ACTIONS[a[i]][2] * o.S[i] * h;
      o.S[i] -= inf + vac; o.E[i] += inf - prog; o.I[i] += prog - rec; o.R[i] += rec + vac; newInf += inf;
    }
  }
  const total = o.N.reduce((x: number, y: number) => x + y, 0), cost = a.reduce((s, k, i) => s + ACTIONS[k][3] * o.N[i], 0) / total;
  o.cases += newInf; o.cost += cost; o.score += -(100 * newInf) / total - lam * cost; o.history.push((100 * newInf) / total);
}
export const handRule = (f: number[][]) => f.map(r => (r[0] > 0.005 ? 2 : r[0] > 0.001 ? 1 : 0));
/** The evolved brain from our reference run (scripts/reference/s5p5, seed 0): 5 → 8 → 4. */
export const EVOLVED: number[] = [0.0939182548057878, -0.07264158270366589, 1.080621560866664, -0.3674234145269002, 0.038661131897477, -0.9589574765532385, -0.42993053389620617, 0.9795717072617872, -1.5290575086357945, 0.27735999753248086, 0.1609498263683431, -0.11633122800542234, 0.3158120879263732, 0.3801107607154237, 0.9335211385103227, -1.1252254644593995, 0.6742332586382732, -0.9464737620867147, 0.4188256832857978, 0.5764218663475059, 0.8714363375593468, 0.5953679582307536, 0.8631875887565974, -0.9167684210857492, -0.7772885694151356, 0.22234691746856014, 0.9598562894787745, -0.3268982204147407, -0.8279052677113035, 0.34253605694378786, -0.29783606286905273, 1.4848413749706004, 0.029833533984168135, -0.36325457473260675, -0.5688603013252505, 0.5821446926815466, 0.3463295456048324, -0.23967388019429464, -0.47705235578540095, 0.6980498763418818, 0.8667400509113331, 0.817526221905668, 0.4772935777737838, -0.1328538224054828, -0.5361175433879695, -0.007705099199186938, 0.006788295788888014, -0.5059854553879068, -0.1388752364709382, 0.6645980514444076, -0.2347929273470598, 0.6561851378146348, 1.2820447728296696, 0.9152282439392934, 0.9138587177126786, 0.19128642062170503, 0.29379067449265506, -0.6376719928866794, 0.6623837597684461, 0.40770335595220386, 1.2241007526018066, 0.19865206977676023, -0.7721399456524625, -0.41090630853447446, -0.0091157510750189, -1.480866421511937, 0.5423171621163443, 0.3777186164988362, 0.2860289875050671, -0.14143564318042945, -0.7794837333368936, 1.428413348572443, 0.798016699057315, -0.4911769381834041, 1.0342067314831505, 0.24316875649039066, -0.31629044236806386, -0.024709836423412124, -0.038696783070441526, 1.0162825022656026, -0.9116759189432796, -0.5530368977896063, 0.1901434446544224, -0.3538468129090294];
export function evolvedPolicy(w: number[]) {
  const SC = [100, 1, 100, 1, 1];
  return (f: number[][]) => f.map(r => { const h = Array.from({ length: 8 }, (_, j) => { let s = w[40 + j]; for (let i = 0; i < 5; i++) s += r[i] * SC[i] * w[i * 8 + j]; return Math.tanh(s); }); let best = 0, bv = -Infinity; for (let q = 0; q < 4; q++) { let s = w[48 + 32 + q]; for (let j = 0; j < 8; j++) s += h[j] * w[48 + j * 4 + q]; if (s > bv) { bv = s; best = q; } } return best; });
}
const POLICY_NAMES = ['do nothing', 'hand rule', 'evolved AI'];
VIZ.outbreakmap = { ...STEP,
  title: 'The government game: 12 towns, one virus, 26 weeks', eq: 'weekly score = − % of people newly infected − cost per person &nbsp;|&nbsp; T test · L lockdown · V vaccinate',
  note: 'A made-up country (the same one as your checks). Circle size = population, red = share infectious. Letters show what each town does this week. The vaccine arrives in week 10.', h: 340, resetOnParam: true,
  params: [{ k: 'policy', label: 'who decides', min: 0, max: 2, val: 2, step: 1, fmt: (v: number) => POLICY_NAMES[v] },
    { k: 'R0', label: 'R₀', min: 1.8, max: 3.5, val: 2.5, step: 0.1, fmt: (v: number) => v.toFixed(1) },
    { k: 'town', label: 'outbreak starts in town', min: 0, max: 11, val: 0, step: 1, fmt: (v: number) => v.toFixed(0) }],
  init(P: any) { return { o: newOutbreak(P.R0, P.town), clock: 0 }; },
  step(S: any, dt: number, P: any) {
    if (S.o.weeks >= 26) return; S.clock += dt; if (S.clock < 0.45) return; S.clock = 0;
    const pol = P.policy === 0 ? (f: number[][]) => f.map(() => 0) : P.policy === 1 ? handRule : evolvedPolicy(EVOLVED);
    week(S.o, pol(features(S.o)));
  },
  draw(c: VizCtx, S: any) {
    const o = S.o; c.view(-30, 650, -30, 420, true);
    for (let i = 0; i < o.N.length; i++) for (let j = i + 1; j < o.N.length; j++) if (o.G[i][j] > 0.12 || o.G[j][i] > 0.12) c.path([DEMO.xy[i] as [number, number], DEMO.xy[j] as [number, number]], 'rgba(230,237,243,.12)', 1);
    o.N.forEach((N: number, i: number) => {
      const [x, y] = DEMO.xy[i], r = 5 + Math.sqrt(N / 2e6) * 22, prev = clamp((o.I[i] / N) / 0.02, 0, 1);
      c.dot(x, y, r, `rgba(${Math.round(60 + 188 * prev)},${Math.round(80 - 30 * prev)},${Math.round(110 - 50 * prev)},.95)`, prev > 0.3 ? 14 * prev : 0);
      const a = o.acts[i]; if (a) c.txt(c.X(x), c.Y(y) + 5, 'TLV'[a - 1], ['#58a6ff', '#f85149', '#3fb950'][a - 1], 15, 'center');
      c.txt(c.X(x) + r + 3, c.Y(y) - r, String(i), QC.dim, 10, 'left');
    });
    const H = o.history, x0 = c.X(430), y0 = c.Y(380), w = c.X(640) - x0, h = c.Y(200) - y0, mx = Math.max(0.05, ...H);
    c.ctx.strokeStyle = 'rgba(230,237,243,.25)'; c.ctx.strokeRect(x0, y0, w, h); c.txt(x0, y0 - 6, `new infections per week (top = ${mx.toFixed(2)}%)`, QC.dim, 11, 'left');
    c.ctx.fillStyle = QC.bad; H.forEach((v: number, i: number) => { const bh = (h * v) / mx; c.ctx.fillRect(x0 + (w * i) / 26 + 1, y0 + h - bh, w / 26 - 2, bh); });
  },
  stats(S: any) { const tot = S.o.N.reduce((a: number, b: number) => a + b, 0); return [['week', `${S.o.weeks} / 26`, QC.dim], ['infected so far', ((100 * S.o.cases) / tot).toFixed(1) + '%', QC.bad], ['cost so far', S.o.cost.toFixed(1), QC.energy], ['score', S.o.score.toFixed(1), QC.accent]]; },
};

export const STEP_WIDGETS_AI = ['ringjam', 'bikegrip', 'motoevo', 'outbreakmap'];
