/** Discrete Fourier transform utilities: naive DFT (the definition) and an iterative radix-2 FFT. */
export interface Spectrum { re: Float64Array; im: Float64Array }

export function dft(x: ArrayLike<number>): Spectrum {
  const N = x.length, re = new Float64Array(N), im = new Float64Array(N);
  for (let k = 0; k < N; k++) {
    let sr = 0, si = 0;
    for (let n = 0; n < N; n++) { const a = (-2 * Math.PI * k * n) / N; sr += x[n] * Math.cos(a); si += x[n] * Math.sin(a); }
    re[k] = sr; im[k] = si;
  }
  return { re, im };
}

export const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

export function fft(x: ArrayLike<number>): Spectrum {
  const N = x.length;
  if (!isPow2(N)) throw new Error(`fft: length ${N} is not a power of two`);
  const re = Float64Array.from(x as ArrayLike<number>), im = new Float64Array(N);
  for (let i = 1, j = 0; i < N; i++) {            // bit-reversal permutation
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; }
  }
  for (let len = 2; len <= N; len <<= 1) {        // butterflies
    const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
  return { re, im };
}

/** One-sided amplitude spectrum: a pure sine of amplitude A at an exact bin frequency shows height A. */
export function amplitudeSpectrum(x: ArrayLike<number>, fs: number) {
  const N = x.length, X = fft(x), half = N / 2;
  const freq: number[] = [], amp: number[] = [];
  for (let k = 0; k <= half; k++) {
    const m = Math.hypot(X.re[k], X.im[k]) / N;
    freq.push((k * fs) / N); amp.push(k === 0 || k === half ? m : 2 * m);
  }
  return { freq, amp, df: fs / N, nyquist: fs / 2 };
}

/** Parseval: Σ|x|² = (1/N) Σ|X|². Returns relative mismatch. */
export function parsevalError(x: ArrayLike<number>): number {
  const X = fft(x), N = x.length; let t = 0, f = 0;
  for (let i = 0; i < N; i++) { t += x[i] * x[i]; f += X.re[i] * X.re[i] + X.im[i] * X.im[i]; }
  f /= N;
  return Math.abs(t - f) / Math.max(t, 1e-300);
}

/** Small deterministic PRNG (mulberry32) + Box–Muller, so noisy demos are reproducible. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const u = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const normal = () => { let x = 0; while (x === 0) x = u(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u()); };
  return { u, normal };
}
