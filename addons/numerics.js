/* Numerics behind the three audit widgets. Plain JS, works in the browser (window.CSNum) and in Node tests. */
(function (root) {
  // ---- complex helpers + stability functions R(z) for y' = λy, z = λΔt
  const C = (re, im) => ({ re, im: im || 0 });
  const add = (a, b) => C(a.re + b.re, a.im + b.im), mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const sc = (a, s) => C(a.re * s, a.im * s);
  const div = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
  const R = {
    euler: z => add(C(1), z),
    rk4: z => { const z2 = mul(z, z), z3 = mul(z2, z), z4 = mul(z3, z); return add(add(add(add(C(1), z), sc(z2, 1 / 2)), sc(z3, 1 / 6)), sc(z4, 1 / 24)); },
    beuler: z => div(C(1), add(C(1), sc(z, -1))),
    trap: z => div(add(C(1), sc(z, 0.5)), add(C(1), sc(z, -0.5))),
  };
  const amp = (m, z) => { const r = R[m](z); return Math.hypot(r.re, r.im); };
  function realAxisLimit(m, far) {
    far = far || -100;
    if (amp(m, C(far)) <= 1 + 1e-12) return -Infinity;
    let lo = far, hi = -1e-9;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (amp(m, C(mid)) <= 1 + 1e-12) hi = mid; else lo = mid; }
    return hi;
  }

  // ---- Fourier
  function dft(x) {
    const N = x.length, re = new Float64Array(N), im = new Float64Array(N);
    for (let k = 0; k < N; k++) { let a = 0, b = 0; for (let n = 0; n < N; n++) { const t = -2 * Math.PI * k * n / N; a += x[n] * Math.cos(t); b += x[n] * Math.sin(t); } re[k] = a; im[k] = b; }
    return { re, im };
  }
  function fft(x) {
    const N = x.length; if (!(N > 0 && (N & (N - 1)) === 0)) throw new Error('fft: length must be a power of two');
    const re = Float64Array.from(x), im = new Float64Array(N);
    for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; } }
    for (let len = 2; len <= N; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < N; i += len) { let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) { const a = i + k, b = a + len / 2, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const n = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = n; } }
    }
    return { re, im };
  }
  function amplitudeSpectrum(x, fs) {
    const N = x.length, X = fft(x), freq = [], amp = [];
    for (let k = 0; k <= N / 2; k++) { const m = Math.hypot(X.re[k], X.im[k]) / N; freq.push(k * fs / N); amp.push(k === 0 || k === N / 2 ? m : 2 * m); }
    return { freq, amp, df: fs / N, nyquist: fs / 2 };
  }
  function parsevalError(x) {
    const X = fft(x), N = x.length; let t = 0, f = 0;
    for (let i = 0; i < N; i++) { t += x[i] * x[i]; f += X.re[i] * X.re[i] + X.im[i] * X.im[i]; }
    return Math.abs(t - f / N) / Math.max(t, 1e-300);
  }
  function rng(seed) {
    let a = seed >>> 0;
    const u = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    return { u, normal: () => { let x = 0; while (x === 0) x = u(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u()); } };
  }

  // ---- order of accuracy
  const trapezoid = (f, a, b, n) => { const h = (b - a) / n; let s = 0.5 * (f(a) + f(b)); for (let i = 1; i < n; i++) s += f(a + i * h); return s * h; };
  const simpson = (f, a, b, n) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; };
  const ode = (step, dt) => { const n = Math.round(1 / dt), h = 1 / n; let y = 1; for (let i = 0; i < n; i++) y = step(y, h); return Math.abs(y - Math.E); };
  const geom = (a, b, n) => Array.from({ length: n }, (_, i) => a * Math.pow(b / a, i / (n - 1)));
  const pow2 = (k0, k1) => Array.from({ length: k1 - k0 + 1 }, (_, i) => 1 / Math.pow(2, k0 + i));
  const SCHEMES = [
    { id: 'fwd', name: 'Forward difference of sin at x = 1', expected: 1, hs: () => geom(1e-1, 1e-13, 25), error: h => Math.abs((Math.sin(1 + h) - Math.sin(1)) / h - Math.cos(1)) },
    { id: 'ctr', name: 'Central difference of sin at x = 1', expected: 2, hs: () => geom(1e-1, 1e-13, 25), error: h => Math.abs((Math.sin(1 + h) - Math.sin(1 - h)) / (2 * h) - Math.cos(1)) },
    { id: 'trap', name: 'Trapezoid rule, ∫₀¹ eˣ dx', expected: 2, hs: () => pow2(1, 14), error: h => Math.abs(trapezoid(Math.exp, 0, 1, Math.round(1 / h)) - (Math.E - 1)) },
    { id: 'simp', name: "Simpson's rule, ∫₀¹ eˣ dx", expected: 4, hs: () => pow2(1, 12), error: h => Math.abs(simpson(Math.exp, 0, 1, Math.round(1 / h)) - (Math.E - 1)) },
    { id: 'euler', name: "Forward Euler, y' = y to t = 1", expected: 1, hs: () => pow2(1, 14), error: h => ode((y, k) => y + k * y, h) },
    { id: 'rk4', name: "RK4, y' = y to t = 1", expected: 4, hs: () => pow2(1, 10), error: h => ode((y, k) => { const k1 = y, k2 = y + k / 2 * k1, k3 = y + k / 2 * k2, k4 = y + k * k3; return y + k / 6 * (k1 + 2 * k2 + 2 * k3 + k4); }, h) },
  ];
  function slope(xs, ys) { const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; } return sxy / sxx; }
  function sweep(s, fitPoints) {
    fitPoints = fitPoints || 5;
    const h = s.hs(), err = h.map(s.error), fitIdx = [];
    for (let i = 0; i < h.length && fitIdx.length < fitPoints; i++) { if (err[i] > 1e-13 && (i === 0 || err[i] < err[i - 1])) fitIdx.push(i); else if (fitIdx.length) break; }
    const order = fitIdx.length >= 2 ? slope(fitIdx.map(i => Math.log10(h[i])), fitIdx.map(i => Math.log10(err[i]))) : NaN;
    return { h, err, fitIdx, order };
  }

  const api = { C, R, amp, realAxisLimit, dft, fft, amplitudeSpectrum, parsevalError, rng, trapezoid, simpson, SCHEMES, slope, sweep };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CSNum = api;
})(typeof window !== 'undefined' ? window : globalThis);
