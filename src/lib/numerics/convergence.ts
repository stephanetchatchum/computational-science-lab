/** Order-of-accuracy experiments: error(h) for several schemes, and the slope of log(error) vs log(h). */
export interface Scheme {
  id: string; name: string; expected: number; kind: 'derivative' | 'quadrature' | 'ode';
  /** error for step size h (h is the step / slice width / Δt) */
  error: (h: number) => number;
  /** sensible h values, largest first */
  hs: () => number[];
}
const f = Math.sin, df = Math.cos, X0 = 1;
const g = Math.exp, A = 0, B = 1, EXACT_INT = Math.E - 1;

export function trapezoid(fn: (x: number) => number, a: number, b: number, n: number) {
  const h = (b - a) / n; let s = 0.5 * (fn(a) + fn(b));
  for (let i = 1; i < n; i++) s += fn(a + i * h);
  return s * h;
}
export function simpson(fn: (x: number) => number, a: number, b: number, n: number) {
  if (n % 2) throw new Error('simpson: n must be even');
  const h = (b - a) / n; let s = fn(a) + fn(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h);
  return (s * h) / 3;
}
/** y' = y, y(0)=1, integrate to t=1 (exact e) */
function odeError(step: (y: number, dt: number) => number, dt: number) {
  const n = Math.round(1 / dt); const h = 1 / n; let y = 1;
  for (let i = 0; i < n; i++) y = step(y, h);
  return Math.abs(y - Math.E);
}
const eulerStep = (y: number, h: number) => y + h * y;
const rk4Step = (y: number, h: number) => { const k1 = y, k2 = y + (h / 2) * k1, k3 = y + (h / 2) * k2, k4 = y + h * k3; return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4); };
const geom = (from: number, to: number, n: number) => Array.from({ length: n }, (_, i) => from * Math.pow(to / from, i / (n - 1)));
const pow2 = (k0: number, k1: number) => Array.from({ length: k1 - k0 + 1 }, (_, i) => 1 / 2 ** (k0 + i));

export const SCHEMES: Scheme[] = [
  { id: 'fwd', name: 'Forward difference of sin at x=1', expected: 1, kind: 'derivative',
    error: h => Math.abs((f(X0 + h) - f(X0)) / h - df(X0)), hs: () => geom(1e-1, 1e-13, 25) },
  { id: 'ctr', name: 'Central difference of sin at x=1', expected: 2, kind: 'derivative',
    error: h => Math.abs((f(X0 + h) - f(X0 - h)) / (2 * h) - df(X0)), hs: () => geom(1e-1, 1e-13, 25) },
  { id: 'trap', name: 'Trapezoid rule, ∫₀¹ eˣ dx', expected: 2, kind: 'quadrature',
    error: h => Math.abs(trapezoid(g, A, B, Math.round(1 / h)) - EXACT_INT), hs: () => pow2(1, 14) },
  { id: 'simp', name: "Simpson's rule, ∫₀¹ eˣ dx", expected: 4, kind: 'quadrature',
    error: h => Math.abs(simpson(g, A, B, Math.round(1 / h)) - EXACT_INT), hs: () => pow2(1, 12) },
  { id: 'euler', name: "Forward Euler, y' = y to t = 1", expected: 1, kind: 'ode',
    error: h => odeError(eulerStep, h), hs: () => pow2(1, 14) },
  { id: 'rk4', name: "RK4, y' = y to t = 1", expected: 4, kind: 'ode',
    error: h => odeError(rk4Step, h), hs: () => pow2(1, 10) },
];

/** least-squares slope of y on x */
export function slope(xs: number[], ys: number[]) {
  const n = xs.length; const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  return sxy / sxx;
}
/** observed order from two step sizes: p = log(e1/e2) / log(h1/h2) */
export const observedOrder = (h1: number, e1: number, h2: number, e2: number) => Math.log(e1 / e2) / Math.log(h1 / h2);

export interface Sweep { h: number[]; err: number[]; fitIdx: number[]; order: number }
/** Sweep h and fit the slope over the first `fitPoints` points that are above the round-off floor. */
export function sweep(s: Scheme, fitPoints = 5): Sweep {
  const h = s.hs(), err = h.map(s.error);
  const floor = 1e-13; const fitIdx: number[] = [];
  for (let i = 0; i < h.length && fitIdx.length < fitPoints; i++) {
    if (err[i] > floor && (i === 0 || err[i] < err[i - 1])) fitIdx.push(i); else if (fitIdx.length) break;
  }
  const order = fitIdx.length >= 2 ? slope(fitIdx.map(i => Math.log10(h[i])), fitIdx.map(i => Math.log10(err[i]))) : NaN;
  return { h, err, fitIdx, order };
}
/** Richardson extrapolation of A(h) with known order p: (2^p A(h/2) − A(h)) / (2^p − 1). */
export const richardson = (Ah: number, Ah2: number, p: number) => (2 ** p * Ah2 - Ah) / (2 ** p - 1);
