/**
 * The three widgets the scientific audit (item F1) asked for, written in the same
 * spec format as the original 26 so they run in the same canvas engine.
 * All numbers shown come from src/lib/numerics, which is unit-tested.
 */
import { VIZ, QC, fmtN, type VizCtx } from '../content/legacy/viz.js';
import { amplification, complex, realAxisLimit, METHODS, type MethodId } from '../lib/numerics/stability';
import { amplitudeSpectrum, parsevalError, rng } from '../lib/numerics/fft';
import { SCHEMES, sweep } from '../lib/numerics/convergence';

const METHOD_COL: Record<MethodId, string> = { euler: QC.acc, rk4: QC.pos, beuler: QC.vel, trap: QC.mag };
const LAMBDA = -50; // stiff test problem from the audit: dy/dt = −50(y − cos t)

/* ------------------------------------------------------------------ 1. stability regions */
VIZ.stability = {
  title: 'Where is an integrator stable? The region |R(z)| ≤ 1',
  eq: 'y′ = λy &nbsp;→&nbsp; yₙ₊₁ = R(z)·yₙ, &nbsp;z = λΔt &nbsp;|&nbsp; stable ⇔ |R(z)| ≤ 1',
  note: 'Each shaded region is where one method keeps errors from growing. The white dot is z = λΔt for the stiff problem dy/dt = −50(y − cos t): slide **Δt** and watch it leave the Euler and RK4 regions while backward Euler stays stable everywhere in the left half-plane. **Drag** anywhere to probe your own z.',
  h: 360, autoplay: false,
  params: [{ k: 'dt', label: 'Δt (λ = −50)', min: 0.005, max: 0.15, val: 0.03, step: 0.001, fmt: (v: number) => v.toFixed(3) }],
  toggles: [{ k: 'euler', label: 'Forward Euler', on: true }, { k: 'rk4', label: 'RK4', on: true }, { k: 'beuler', label: 'Backward Euler', on: false }],
  init(P: any) { return { z: complex(LAMBDA * P.dt, 0), cache: null as any, key: '' }; },
  onParam(S: any, P: any) { S.z = complex(LAMBDA * P.dt, 0); },
  onToggle() { /* keep probe */ },
  pointer(S: any, _P: any, c: VizCtx, sx: number, sy: number) { S.z = complex(c.invX(sx), c.invY(sy)); },
  draw(c: VizCtx, S: any, P: any) {
    c.view(-6, 2, -3.6, 3.6, true);
    const on = (['beuler', 'rk4', 'euler'] as MethodId[]).filter(m => P[m]);
    const cell = 3, ctx = c.ctx;
    const x0 = c.pad.l, x1 = c.W - c.pad.r, y0 = c.pad.t, y1 = c.H - c.pad.b;
    for (const m of on) {
      ctx.save(); ctx.fillStyle = METHOD_COL[m] + '30';
      for (let sx = x0; sx < x1; sx += cell) for (let sy = y0; sy < y1; sy += cell) {
        if (amplification(m, complex(c.invX(sx + cell / 2), c.invY(sy + cell / 2))) <= 1) ctx.fillRect(sx, sy, cell, cell);
      }
      // boundary: cells where stability flips relative to the right neighbour or the one below
      ctx.fillStyle = METHOD_COL[m];
      for (let sx = x0; sx < x1 - cell; sx += cell) for (let sy = y0; sy < y1 - cell; sy += cell) {
        const a = amplification(m, complex(c.invX(sx), c.invY(sy))) <= 1;
        const b = amplification(m, complex(c.invX(sx + cell), c.invY(sy))) <= 1;
        const d = amplification(m, complex(c.invX(sx), c.invY(sy + cell))) <= 1;
        if (a !== b || a !== d) ctx.fillRect(sx, sy, 1.6, 1.6);
      }
      ctx.restore();
    }
    c.grid(8, 6); c.axes('Re z', 'Im z'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    c.dot(S.z.re, S.z.im, 6, '#ffffff', 12);
    c.chip(c.X(S.z.re) + 9, c.Y(S.z.im) - 22, `z = ${S.z.re.toFixed(2)}${S.z.im >= 0 ? '+' : '−'}${Math.abs(S.z.im).toFixed(2)}i`, '#ffffff');
    c.legend(on.map(m => [METHODS[m].name, METHOD_COL[m]] as [string, string]));
  },
  stats(S: any, P: any) {
    const out: [string, string, string][] = [];
    (['euler', 'rk4', 'beuler'] as MethodId[]).forEach(m => {
      const a = amplification(m, S.z);
      out.push([`|R| ${METHODS[m].name}`, fmtN(a, 3) + (a <= 1 ? ' ✓' : ' ✗'), a <= 1 ? QC.vel : QC.bad]);
    });
    out.push(['Euler limit Δt', (-2 / LAMBDA).toFixed(4), QC.dim]);
    out.push(['RK4 limit Δt', (realAxisLimit('rk4') / LAMBDA).toFixed(4), QC.dim]);
    void P; return out;
  },
};

/* ------------------------------------------------------------------ 2. FFT spectrum explorer */
const FS = 128, N = 128; // 1 s of data → frequency resolution 1 Hz, Nyquist 64 Hz
function signal(P: any) {
  const r = rng(Math.round(P.seed ?? 7)); const x: number[] = [];
  for (let n = 0; n < N; n++) { const t = n / FS; x.push(P.a1 * Math.sin(2 * Math.PI * P.f1 * t) + P.a2 * Math.sin(2 * Math.PI * P.f2 * t) + P.noise * r.normal()); }
  return x;
}
VIZ.fft = {
  title: 'Fourier spectrum: which frequencies are inside this signal?',
  eq: 'X_k = Σₙ xₙ e^{−2πikn/N} &nbsp;|&nbsp; Δf = f_s/N &nbsp;|&nbsp; f_max = f_s/2',
  note: 'Top: one second of signal sampled at 128 Hz (two sines plus noise). Bottom: its amplitude spectrum from an FFT. Put a frequency **between** two whole numbers (e.g. 10.5 Hz) and the single peak smears across many bins — that is spectral leakage. Raise the noise and watch the floor rise while the peaks stay put.',
  h: 380, autoplay: false, resetOnParam: true,
  params: [
    { k: 'f1', label: 'f₁', unit: 'Hz', min: 1, max: 60, val: 8, step: 0.25, fmt: (v: number) => v.toFixed(2) },
    { k: 'a1', label: 'A₁', min: 0, max: 2, val: 1, step: 0.05, fmt: (v: number) => v.toFixed(2) },
    { k: 'f2', label: 'f₂', unit: 'Hz', min: 1, max: 60, val: 21, step: 0.25, fmt: (v: number) => v.toFixed(2) },
    { k: 'a2', label: 'A₂', min: 0, max: 2, val: 0.5, step: 0.05, fmt: (v: number) => v.toFixed(2) },
    { k: 'noise', label: 'noise σ', min: 0, max: 2, val: 0.2, step: 0.05, fmt: (v: number) => v.toFixed(2) },
  ],
  init(P: any) { const x = signal(P); return { x, spec: amplitudeSpectrum(x, FS), parseval: parsevalError(x) }; },
  draw(c: VizCtx, S: any) {
    const H = c.H, top = c.pads(46, 14, 24, Math.round(H / 2) + 8);
    c.view(0, 1, -3.2, 3.2); c.grid(8, 4); c.axes('t (s)', 'x(t)'); c.ticks(v => v.toFixed(2), v => v.toFixed(1));
    c.path(S.x.map((v: number, i: number) => [i / FS, v] as [number, number]), QC.accent, 1.6, 6);
    c.pads(46, 14, Math.round(H / 2) + 26, 30);
    const amax = Math.max(1.05, ...S.spec.amp) * 1.1;
    c.view(0, 64, 0, amax); c.grid(8, 3); c.axes('f (Hz)'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
    c.chip(5, Math.round(H / 2) + 8, '|X(f)|');
    const ctx = c.ctx; ctx.save(); ctx.fillStyle = QC.energy;
    S.spec.freq.forEach((f: number, k: number) => { const X = c.X(f), Y = c.Y(S.spec.amp[k]); ctx.fillRect(X - 1.5, Y, 3, c.Y(0) - Y); });
    ctx.restore();
    c.unpad(top);
  },
  stats(S: any) {
    const idx = S.spec.amp.map((a: number, k: number) => [a, k] as [number, number]).sort((a: number[], b: number[]) => b[0] - a[0]).slice(0, 2);
    return [
      ['peak 1', `${S.spec.freq[idx[0][1]].toFixed(0)} Hz (${idx[0][0].toFixed(2)})`, QC.energy],
      ['peak 2', `${S.spec.freq[idx[1][1]].toFixed(0)} Hz (${idx[1][0].toFixed(2)})`, QC.energy],
      ['Δf', `${(FS / N).toFixed(2)} Hz`, QC.dim],
      ['Nyquist', `${FS / 2} Hz`, QC.dim],
      ['Parseval mismatch', S.parseval.toExponential(1), S.parseval < 1e-10 ? QC.vel : QC.bad],
    ];
  },
};

/* ------------------------------------------------------------------ 3. live convergence-order plot */
VIZ.convergence = {
  title: 'Measure the order of accuracy: slope of log(error) vs log(h)',
  eq: 'error ≈ C·hᵖ &nbsp;⇒&nbsp; log error = log C + p·log h &nbsp;|&nbsp; p = slope',
  note: 'Pick a scheme. Each dot is one run at step size h. On log–log axes a method of order p is a straight line of slope p; the readout fits it on the hollow-ringed points. For the difference formulas, keep going to tiny h: the error turns **up** again, because round-off (≈ ε/h) beats truncation (≈ hᵖ).',
  h: 340, autoplay: false, resetOnParam: true,
  params: [
    { k: 'scheme', label: 'scheme', min: 0, max: SCHEMES.length - 1, val: 0, step: 1, fmt: (v: number) => SCHEMES[Math.round(v)].id },
    { k: 'fit', label: 'points in fit', min: 2, max: 8, val: 5, step: 1, fmt: (v: number) => v.toFixed(0) },
  ],
  init(P: any) { const s = SCHEMES[Math.round(P.scheme)]; return { s, sw: sweep(s, Math.round(P.fit)) }; },
  draw(c: VizCtx, S: any) {
    const lh = S.sw.h.map(Math.log10), le = S.sw.err.map((e: number) => Math.log10(Math.max(e, 1e-17)));
    const xmin = Math.min(...lh) - 0.3, xmax = Math.max(...lh) + 0.3, ymin = Math.min(...le) - 0.5, ymax = Math.max(...le) + 0.5;
    c.view(xmin, xmax, ymin, ymax); c.grid(8, 5); c.axes('log₁₀ h', 'log₁₀ error');
    c.ticks(v => v.toFixed(0), v => v.toFixed(0));
    if (S.sw.fitIdx.length >= 2) {
      const i0 = S.sw.fitIdx[0], p = S.sw.order, b = le[i0] - p * lh[i0];
      c.path([[xmin, b + p * xmin], [xmax, b + p * xmax]], 'rgba(227,179,65,.55)', 1.4);
    }
    c.path(lh.map((x: number, i: number) => [x, le[i]] as [number, number]), 'rgba(88,166,255,.45)', 1.2);
    lh.forEach((x: number, i: number) => c.dot(x, le[i], 3.4, QC.pos, 6));
    S.sw.fitIdx.forEach((i: number) => { const ctx = c.ctx; ctx.save(); ctx.strokeStyle = QC.energy; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(c.X(lh[i]), c.Y(le[i]), 7, 0, 7); ctx.stroke(); ctx.restore(); });
    c.chip(c.pad.l + 6, c.pad.t + 4, S.s.name, QC.accent);
  },
  stats(S: any) {
    const ok = Math.abs(S.sw.order - S.s.expected) < 0.15;
    const minIdx = S.sw.err.indexOf(Math.min(...S.sw.err));
    return [
      ['measured order p', isFinite(S.sw.order) ? S.sw.order.toFixed(3) : '—', ok ? QC.vel : QC.acc],
      ['theory', String(S.s.expected), QC.exact],
      ['best h', S.sw.h[minIdx].toExponential(1), QC.dim],
      ['smallest error', S.sw.err[minIdx].toExponential(1), QC.dim],
    ];
  },
};

export const NEW_WIDGETS = ['stability', 'fft', 'convergence'] as const;
