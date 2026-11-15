/* Three widgets the scientific audit asked for (item F1), written in the original VIZ format
   so they look and behave exactly like the other 26. Loaded after the original script:
   VIZ, LAB, QC, fmtN, renderLab are the original's globals. Numbers come from addons/numerics.js. */
(function () {
  if (typeof VIZ === 'undefined' || !window.CSNum) return;
  const N_ = window.CSNum;
  const COL = { euler: QC.mag, rk4: QC.cool, beuler: QC.vel };
  const NAME = { euler: 'Forward Euler', rk4: 'RK4', beuler: 'Backward Euler' };
  const LAMBDA = -50;   // the audit's stiff test: dy/dt = −50 (y − cos t)

  /* ---------------- 1. stability regions ---------------- */
  VIZ.stability = {
    title: 'Where is an integrator stable? The region |R(z)| ≤ 1',
    eq: 'y′ = λy → y<sub>n+1</sub> = R(z)·y<sub>n</sub>, z = λΔt &nbsp;|&nbsp; stable ⇔ |R(z)| ≤ 1',
    note: 'Each shaded region is where one method keeps errors from growing. The white dot is z = λΔt for the stiff problem **dy/dt = −50(y − cos t)**. Slide **Δt** and watch the dot leave the Euler and RK4 regions, while backward Euler stays stable everywhere on the left. **Drag** on the plane to test any z.',
    h: 340, autoplay: false,
    params: [{ k: 'dt', label: 'Δt', unit: '(λ = −50)', min: 0.005, max: 0.15, val: 0.03, step: 0.001, fmt: v => v.toFixed(3) }],
    toggles: [{ k: 'euler', label: 'Forward Euler', on: true }, { k: 'rk4', label: 'RK4', on: true }, { k: 'beuler', label: 'Backward Euler', on: false }],
    init(P) { return { z: N_.C(LAMBDA * P.dt, 0) }; },
    onParam(S, P) { S.z = N_.C(LAMBDA * P.dt, 0); },
    onToggle() {},
    pointer(S, P, c, sx, sy) { S.z = N_.C(c.invX(sx), c.invY(sy)); },
    draw(c, S, P) {
      c.view(-6, 2, -3.6, 3.6, true);
      const ctx = c.ctx, cell = 3, x0 = c.pad.l, x1 = c.W - c.pad.r, y0 = c.pad.t, y1 = c.H - c.pad.b;
      ['beuler', 'rk4', 'euler'].filter(m => P[m]).forEach(m => {
        ctx.save(); ctx.fillStyle = COL[m] + '33';
        for (let sx = x0; sx < x1; sx += cell) for (let sy = y0; sy < y1; sy += cell)
          if (N_.amp(m, N_.C(c.invX(sx + cell / 2), c.invY(sy + cell / 2))) <= 1) ctx.fillRect(sx, sy, cell, cell);
        ctx.fillStyle = COL[m];
        for (let sx = x0; sx < x1 - cell; sx += cell) for (let sy = y0; sy < y1 - cell; sy += cell) {
          const a = N_.amp(m, N_.C(c.invX(sx), c.invY(sy))) <= 1;
          if (a !== (N_.amp(m, N_.C(c.invX(sx + cell), c.invY(sy))) <= 1) || a !== (N_.amp(m, N_.C(c.invX(sx), c.invY(sy + cell))) <= 1)) ctx.fillRect(sx, sy, 1.6, 1.6);
        }
        ctx.restore();
      });
      c.grid(8, 6); c.axes('Re z', 'Im z'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
      c.dot(S.z.re, S.z.im, 6, '#ffffff', 12);
      c.chip(c.X(S.z.re) + 9, c.Y(S.z.im) - 22, 'z = ' + S.z.re.toFixed(2) + (S.z.im >= 0 ? ' + ' : ' − ') + Math.abs(S.z.im).toFixed(2) + 'i', '#ffffff');
      c.legend(['euler', 'rk4', 'beuler'].filter(m => P[m]).map(m => [NAME[m], COL[m]]));
    },
    stats(S) {
      const out = ['euler', 'rk4', 'beuler'].map(m => { const a = N_.amp(m, S.z); return ['|R| ' + NAME[m], fmtN(a, 3) + (a <= 1 ? ' ✓' : ' ✗'), a <= 1 ? QC.vel : QC.bad]; });
      out.push(['Euler needs Δt ≤', (2 / 50).toFixed(4), QC.dim]);
      out.push(['RK4 needs Δt ≤', (N_.realAxisLimit('rk4') / LAMBDA).toFixed(4), QC.dim]);
      return out;
    },
  };

  /* ---------------- 2. FFT spectrum explorer ---------------- */
  const FS = 128, NS = 128; // one second of data → 1 Hz bins, Nyquist 64 Hz
  const signal = P => { const r = N_.rng(7), x = []; for (let n = 0; n < NS; n++) { const t = n / FS; x.push(P.a1 * Math.sin(2 * Math.PI * P.f1 * t) + P.a2 * Math.sin(2 * Math.PI * P.f2 * t) + P.noise * r.normal()); } return x; };
  VIZ.fft = {
    title: 'Fourier spectrum: which frequencies are inside this signal?',
    eq: 'X<sub>k</sub> = Σ x<sub>n</sub>e<sup>−2πikn/N</sup> &nbsp;|&nbsp; Δf = f<sub>s</sub>/N &nbsp;|&nbsp; f<sub>max</sub> = f<sub>s</sub>/2',
    note: 'Top: one second of signal sampled at 128 Hz — two sine waves plus noise. Bottom: its spectrum, one bar per frequency. Each sine becomes **one spike** at its frequency, as tall as its amplitude. Set f₁ to a non-whole number like **10.5** and the spike smears into its neighbours: that is **spectral leakage**. Raise the noise and the floor rises while the spikes stay put.',
    h: 360, autoplay: false, resetOnParam: true,
    params: [
      { k: 'f1', label: 'f₁', unit: 'Hz', min: 1, max: 60, val: 8, step: 0.25, fmt: v => v.toFixed(2) },
      { k: 'a1', label: 'A₁', min: 0, max: 2, val: 1, step: 0.05, fmt: v => v.toFixed(2) },
      { k: 'f2', label: 'f₂', unit: 'Hz', min: 1, max: 60, val: 21, step: 0.25, fmt: v => v.toFixed(2) },
      { k: 'a2', label: 'A₂', min: 0, max: 2, val: 0.5, step: 0.05, fmt: v => v.toFixed(2) },
      { k: 'noise', label: 'noise σ', min: 0, max: 2, val: 0.2, step: 0.05, fmt: v => v.toFixed(2) },
    ],
    init(P) { const x = signal(P); return { x, spec: N_.amplitudeSpectrum(x, FS), parseval: N_.parsevalError(x) }; },
    draw(c, S) {
      const H = c.H, keep = c.pads(46, 14, 24, Math.round(H / 2) + 8);
      c.view(0, 1, -3.2, 3.2); c.grid(8, 4); c.axes('t (s)', 'signal x(t)'); c.ticks(v => v.toFixed(2), v => v.toFixed(1));
      c.path(S.x.map((v, i) => [i / FS, v]), QC.accent, 1.6, 6);
      c.pads(46, 14, Math.round(H / 2) + 26, 30);
      const top = Math.max(1.05, ...S.spec.amp) * 1.1;
      c.view(0, 64, 0, top); c.grid(8, 3); c.axes('frequency (Hz)'); c.ticks(v => v.toFixed(0), v => v.toFixed(1));
      c.chip(5, Math.round(H / 2) + 8, 'spectrum |X(f)|');
      c.ctx.save(); c.ctx.fillStyle = QC.energy;
      S.spec.freq.forEach((f, k) => { const X = c.X(f), Y = c.Y(S.spec.amp[k]); c.ctx.fillRect(X - 1.5, Y, 3, c.Y(0) - Y); });
      c.ctx.restore(); c.unpad(keep);
    },
    stats(S) {
      const top = S.spec.amp.map((a, k) => [a, k]).sort((a, b) => b[0] - a[0]).slice(0, 2);
      return [
        ['peak 1', S.spec.freq[top[0][1]].toFixed(0) + ' Hz', QC.energy], ['height', top[0][0].toFixed(2), QC.energy],
        ['peak 2', S.spec.freq[top[1][1]].toFixed(0) + ' Hz', QC.energy], ['bin width Δf', '1 Hz', QC.dim],
        ['Parseval error', S.parseval.toExponential(1), S.parseval < 1e-10 ? QC.vel : QC.bad],
      ];
    },
  };

  /* ---------------- 3. live convergence-order plot ---------------- */
  VIZ.convergence = {
    title: 'Is your method as accurate as theory says? Measure the order',
    eq: 'error ≈ C·h<sup>p</sup> ⇒ log error = log C + p·log h &nbsp;|&nbsp; p = slope',
    note: 'Pick a method with the **method** slider. Each dot is one run with step size h; both axes are logarithmic, so a method of order p is a straight line of **slope p**. The ringed dots are the ones fitted. For the two difference formulas, look at the tiny-h end: the error turns back **up**, because rounding error (≈ ε/h) starts to beat the method’s own error. The lowest point is the best h you can ever use.',
    h: 330, autoplay: false, resetOnParam: true,
    params: [
      { k: 'scheme', label: 'method', min: 0, max: N_.SCHEMES.length - 1, val: 0, step: 1, fmt: v => ['fwd diff', 'central diff', 'trapezoid', 'Simpson', 'Euler ODE', 'RK4 ODE'][Math.round(v)] },
      { k: 'fit', label: 'fit points', min: 2, max: 8, val: 5, step: 1, fmt: v => v.toFixed(0) },
    ],
    init(P) { const s = N_.SCHEMES[Math.round(P.scheme)]; return { s, sw: N_.sweep(s, Math.round(P.fit)) }; },
    draw(c, S) {
      const lh = S.sw.h.map(Math.log10), le = S.sw.err.map(e => Math.log10(Math.max(e, 1e-17)));
      const xa = Math.min(...lh) - 0.3, xb = Math.max(...lh) + 0.3;
      c.view(xa, xb, Math.min(...le) - 0.5, Math.max(...le) + 0.5); c.grid(8, 5); c.axes('log₁₀ h', 'log₁₀ error'); c.ticks(v => v.toFixed(0), v => v.toFixed(0));
      if (S.sw.fitIdx.length >= 2) { const i0 = S.sw.fitIdx[0], p = S.sw.order, b = le[i0] - p * lh[i0]; c.path([[xa, b + p * xa], [xb, b + p * xb]], 'rgba(227,179,65,.55)', 1.4); }
      c.path(lh.map((x, i) => [x, le[i]]), 'rgba(88,166,255,.45)', 1.2);
      lh.forEach((x, i) => c.dot(x, le[i], 3.4, QC.pos, 6));
      S.sw.fitIdx.forEach(i => { c.ctx.save(); c.ctx.strokeStyle = QC.energy; c.ctx.lineWidth = 1.6; c.ctx.beginPath(); c.ctx.arc(c.X(lh[i]), c.Y(le[i]), 7, 0, 7); c.ctx.stroke(); c.ctx.restore(); });
      c.chip(c.pad.l + 6, c.pad.t + 4, S.s.name, QC.accent);
    },
    stats(S) {
      const k = S.sw.err.indexOf(Math.min(...S.sw.err));
      return [['measured order p', isFinite(S.sw.order) ? S.sw.order.toFixed(3) : '—', Math.abs(S.sw.order - S.s.expected) < 0.15 ? QC.vel : QC.acc],
        ['theory', String(S.s.expected), QC.exact], ['best h', S.sw.h[k].toExponential(1), QC.dim], ['smallest error', S.sw.err[k].toExponential(1), QC.dim]];
    },
  };

  /* ---------------- add them to the Concept lab as one new section ---------------- */
  LAB.push(['Is the method telling the truth? Stability, spectra and convergence',
    'Three questions every solver has to answer before you trust it. **Where is it stable?** **Which frequencies are in this signal?** **Does the error shrink as fast as the theory promises?** These were missing from the lab; every later PDE and ODE project leans on them.',
    [['stability', 's3p1'], ['fft', 's2p3'], ['convergence', 's1p2']]]);
  if (typeof renderLab === 'function') renderLab();
})();
