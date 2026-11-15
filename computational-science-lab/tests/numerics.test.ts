import { describe, expect, it } from 'vitest';
import { amplification, complex, isStable, realAxisLimit } from '../src/lib/numerics/stability';
import { amplitudeSpectrum, dft, fft, parsevalError, rng } from '../src/lib/numerics/fft';
import { SCHEMES, sweep, observedOrder, richardson, simpson, trapezoid } from '../src/lib/numerics/convergence';

describe('stability functions R(z)', () => {
  it('forward Euler is stable exactly on the disc |1+z| ≤ 1', () => {
    expect(amplification('euler', complex(-2))).toBeCloseTo(1, 12);
    expect(isStable('euler', complex(-1, 0.99))).toBe(true);
    expect(isStable('euler', complex(-2.01))).toBe(false);
    expect(realAxisLimit('euler')).toBeCloseTo(-2, 8);
  });
  it('RK4 real-axis stability limit is ≈ −2.7853', () => {
    expect(realAxisLimit('rk4')).toBeCloseTo(-2.785293563, 6);
  });
  it('RK4 is stable on part of the imaginary axis (|z| < 2√2)', () => {
    expect(isStable('rk4', complex(0, 2.8))).toBe(true);
    expect(isStable('rk4', complex(0, 2.9))).toBe(false);
  });
  it('backward Euler and trapezoid are A-stable', () => {
    for (const re of [-0.001, -1, -5, -50, -1e4]) for (const im of [0, 3, -40]) {
      expect(isStable('beuler', complex(re, im))).toBe(true);
      expect(isStable('trap', complex(re, im))).toBe(true);
    }
    expect(realAxisLimit('beuler')).toBe(-Infinity);
  });
  it('stiff test from the audit: RK4 blows up at dt = 0.1, backward Euler does not', () => {
    // dy/dt = −50 (y − cos t), y(0) = 0, integrate to t = 2
    const f = (t: number, y: number) => -50 * (y - Math.cos(t));
    const dt = 0.1, n = 20;
    let y = 0, t = 0;
    for (let i = 0; i < n; i++) {
      const k1 = f(t, y), k2 = f(t + dt / 2, y + dt / 2 * k1), k3 = f(t + dt / 2, y + dt / 2 * k2), k4 = f(t + dt, y + dt * k3);
      y += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); t += dt;
    }
    expect(Math.abs(y)).toBeGreaterThan(1e6);
    let yb = 0; t = 0;
    for (let i = 0; i < n; i++) { t += dt; yb = (yb + 50 * dt * Math.cos(t)) / (1 + 50 * dt); } // implicit step solved exactly
    expect(Math.abs(yb - Math.cos(2))).toBeLessThan(0.05);
  });
});

describe('Fourier transform', () => {
  it('FFT equals the DFT definition', () => {
    const r = rng(3); const x = Array.from({ length: 64 }, () => r.normal());
    const A = fft(x), B = dft(x);
    for (let k = 0; k < 64; k++) { expect(A.re[k]).toBeCloseTo(B.re[k], 9); expect(A.im[k]).toBeCloseTo(B.im[k], 9); }
  });
  it('rejects non power-of-two lengths', () => { expect(() => fft([1, 2, 3])).toThrow(); });
  it('a sine at an exact bin has one peak with its amplitude', () => {
    const fs = 128, x = Array.from({ length: 128 }, (_, n) => 1.5 * Math.sin(2 * Math.PI * 8 * n / fs));
    const s = amplitudeSpectrum(x, fs);
    const k = s.amp.indexOf(Math.max(...s.amp));
    expect(s.freq[k]).toBe(8); expect(s.amp[k]).toBeCloseTo(1.5, 10);
    expect(s.df).toBe(1); expect(s.nyquist).toBe(64);
    expect(s.amp.filter((a, i) => i !== k && a > 1e-9).length).toBe(0);
  });
  it('Parseval holds to 1e-10 (audit oracle for s2p6)', () => {
    const r = rng(11); const x = Array.from({ length: 1024 }, () => r.normal() * 3 + 1);
    expect(parsevalError(x)).toBeLessThan(1e-10);
  });
  it('an annual cycle in 3 years of daily data peaks at 1/365 d⁻¹ within one bin', () => {
    const N = 1024, x = Array.from({ length: N }, (_, d) => 10 * Math.cos(2 * Math.PI * d / 365));
    const s = amplitudeSpectrum(x, 1); // fs = 1 per day
    const k = s.amp.slice(1).indexOf(Math.max(...s.amp.slice(1))) + 1;
    expect(Math.abs(s.freq[k] - 1 / 365)).toBeLessThanOrEqual(s.df);
  });
});

describe('order of accuracy', () => {
  for (const s of SCHEMES) {
    it(`${s.name}: measured order ≈ ${s.expected}`, () => {
      const w = sweep(s, 5);
      expect(Math.abs(w.order - s.expected)).toBeLessThan(0.15);
    });
  }
  it('forward-difference error has a round-off floor near h ≈ √ε', () => {
    const s = SCHEMES.find(x => x.id === 'fwd')!; const w = sweep(s);
    const best = w.h[w.err.indexOf(Math.min(...w.err))];
    expect(best).toBeGreaterThan(1e-10); expect(best).toBeLessThan(1e-6);
    expect(w.err[w.err.length - 1]).toBeGreaterThan(Math.min(...w.err) * 100); // it turns back up
  });
  it('observedOrder and Richardson extrapolation', () => {
    const f = Math.exp, I = Math.E - 1;
    const T1 = trapezoid(f, 0, 1, 8), T2 = trapezoid(f, 0, 1, 16);
    expect(observedOrder(1 / 8, Math.abs(T1 - I), 1 / 16, Math.abs(T2 - I))).toBeCloseTo(2, 2);
    expect(Math.abs(richardson(T1, T2, 2) - I)).toBeLessThan(Math.abs(T2 - I) / 100);
    expect(simpson(f, 0, 1, 2)).toBeCloseTo(richardson(trapezoid(f, 0, 1, 1), trapezoid(f, 0, 1, 2), 2), 12); // Simpson = Richardson(trapezoid)
  });
});
