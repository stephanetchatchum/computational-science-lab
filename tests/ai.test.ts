import { describe, expect, it } from 'vitest';
import { ringStart, ringStep, newOutbreak, week, features, handRule, evolvedPolicy, EVOLVED } from '../src/lab/stepWidgetsAI';

// The in-app visuals must tell the same story as the reference solutions (scripts/reference/s5p4, s5p5).
describe('AI project visuals match the reference solutions', () => {
  const ring = (n: number) => { const R = ringStart(n); for (let k = 0; k < 6000; k++) ringStep(R, 0.1); return R.v; };
  it('22 cars on a 230 m circle make a phantom jam; 14 cars flow', () => {
    const v22 = ring(22), v14 = ring(14);
    expect(Math.min(...v22)).toBeLessThan(0.5);
    const m = v14.reduce((a, b) => a + b, 0) / 14;
    expect(Math.sqrt(v14.reduce((a, b) => a + (b - m) ** 2, 0) / 14)).toBeLessThan(0.05);
  });
  const play = (pol: (f: number[][]) => number[], R0: number, town: number) => { const o = newOutbreak(R0, town); for (let w = 0; w < 26; w++) week(o, pol(features(o))); return o.score; };
  it('outbreak scores equal the Python reference', () => {
    expect(play(f => f.map(() => 0), 2.5, 0)).toBeCloseTo(-89.2573, 3);
    expect(play(handRule, 2.5, 0)).toBeCloseTo(-21.7916, 3);
    expect(play(evolvedPolicy(EVOLVED), 2.5, 0)).toBeCloseTo(-12.4584, 3);
    expect(play(evolvedPolicy(EVOLVED), 3.5, 3)).toBeCloseTo(-21.313, 3);
  });
});
