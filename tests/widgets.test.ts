import { describe, expect, it } from 'vitest';
import { VIZ, makeCtx } from '../src/content/legacy/viz.js';
import '../src/lab/newWidgets';
import { STEP_WIDGETS } from '../src/lab/stepWidgets';

const noop = () => {};
function fakeCanvas() {
  const ctx: any = new Proxy({}, {
    get: (t: any, k) => (k in t ? t[k] : k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop: noop }) : noop),
    set: (t: any, k, v) => { t[k] = v; return true; },
  });
  return { getContext: () => ctx, getBoundingClientRect: () => ({ width: 700, height: 320, left: 0, top: 0 }), dataset: { h: '320' }, style: {} };
}

describe('every lab widget runs headless', () => {
  const names = Object.keys(VIZ);
  it('has the 26 original widgets, the 3 audit widgets and the step visuals', () => {
    expect(names.length).toBe(29 + STEP_WIDGETS.length);
    expect(STEP_WIDGETS.length).toBeGreaterThanOrEqual(20);
    for (const n of ['stability', 'fft', 'convergence']) expect(names).toContain(n);
  });
  for (const name of names) {
    it(name, () => {
      const spec = VIZ[name]; const c = makeCtx(fakeCanvas()); c.resize();
      const P: any = {}; (spec.params || []).forEach(p => (P[p.k] = p.val)); (spec.toggles || []).forEach(t => (P[t.k] = !!t.on));
      let S = spec.init(P, c);
      for (let i = 0; i < 200; i++) spec.step?.(S, 0.016, P, c);
      c.bg(); spec.draw(c, S, P);
      // every slider extreme must also work
      for (const p of spec.params || []) for (const v of [p.min, p.max]) {
        P[p.k] = v; if (spec.onParam) spec.onParam(S, P, c); else S = spec.init(P, c);
        spec.step?.(S, 0.016, P, c); spec.draw(c, S, P);
        const st = spec.stats?.(S, P) ?? [];
        for (const [, val] of st) expect(String(val)).not.toMatch(/NaN|undefined/);
        P[p.k] = p.val;
      }
      if (spec.pointer) { spec.pointer(S, P, c, 300, 150, 'down'); spec.pointer(S, P, c, 320, 170, 'move'); spec.draw(c, S, P); }
      if (spec.stepOnce) { for (let i = 0; i < 5; i++) spec.stepOnce(S, P, c); spec.draw(c, S, P); }
    });
  }
});
