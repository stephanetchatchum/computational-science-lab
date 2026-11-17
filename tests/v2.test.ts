import { describe, expect, it } from 'vitest';
import { buildProjects, defaultApprovals, GUIDES, type Approvals } from '../src/content/curriculum';
import { AUDIT_ITEMS } from '../src/content/audit';
import { effectiveGuide, hasGuide } from '../src/content/guides';
import { STEP_VISUALS, ADDED_STEPS, NEW_GUIDES, NEW_STEP_VISUALS, PATCHES } from '../src/content/stages';
import { VIZ } from '../src/content/legacy/viz.js';
import { roundMeasurement, smallRootSeries } from '../src/lab/stepWidgets';
import '../src/lab/newWidgets';
import '../src/lab/stepWidgets2';
import { solve2, elimCount, singularValues, vander } from '../src/lab/stepWidgets2';
import * as W3 from '../src/lab/stepWidgets3';
import * as W4 from '../src/lab/stepWidgets4';
import * as W5 from '../src/lab/stepWidgets5';
import * as W6 from '../src/lab/stepWidgets6';
import { mergeStates, decide } from '../src/sync/merge';
import { emptyState, load, memoryStorage, save, STATE_KEY } from '../src/state/store';
import { spokenCode, sentences, wordSchedule } from '../src/lib/reader';

const all = defaultApprovals();
const none: Approvals = Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, 'pending']));
const P = (id: string) => buildProjects(all).find(p => p.id === id)!;
const STAGE01 = ['s0p1', 's0p2', 's0p3', 's0p4', 's1p1', 's1p2', 's1p3', 's1p4', 's1p5', 's1p6', 's2p1', 's2p2', 's2p3', 's2p4', 's2p5', 's2p6', 's3p1', 's3p2', 's3p3', 's3p4', 's3p5', 's4p1', 's4p2', 's4p3', 's4p4', 's4p5', 's4p6', 's4p7', 's4p8', 's4p9', 's5p1', 's5p2', 's5p3', 's5p4', 's5p5', 's5p6', 's5p7', 's6p1', 's6p2', 's6p3'];

describe('effective guides', () => {
  it('every audit item is approved by default (your decision)', () => {
    expect(AUDIT_ITEMS.every(i => all[i.id] === 'approved')).toBe(true);
  });
  it('original step keys never move: s0 setup, s1…sN original, a:… added, git last', () => {
    for (const id of STAGE01.filter(x => GUIDES[x])) {
      const g = effectiveGuide(P(id), all)!; const n = GUIDES[id].steps.length;
      expect(g.steps[0].key).toBe('s0'); expect(g.steps.at(-1)!.key).toBe('s' + (n + 1));
      const orig = g.steps.filter(s => s.origin === 'original').map(s => s.key);
      expect(orig).toEqual(Array.from({ length: n }, (_, i) => 's' + (i + 1)));
      expect(g.steps.filter(s => s.origin === 'added').every(s => s.key.startsWith('a:'))).toBe(true);
    }
  });
  it('without approvals the guide equals the original exactly', () => {
    for (const id of STAGE01.filter(x => GUIDES[x])) {
      const g = effectiveGuide(P(id), none)!;
      expect(g.steps.length).toBe(GUIDES[id].steps.length + 2);
      g.steps.slice(1, -1).forEach((s, i) => { expect(s.do).toEqual(GUIDES[id].steps[i].do); expect(s.code).toEqual(GUIDES[id].steps[i].code); });
    }
  });
  it('every build step of every stage (setup and git steps too) has a visual, and every visual exists', () => {
    for (const id of STAGE01) {
      const g = effectiveGuide(P(id), all)!;
      for (const s of g.steps) {
        expect(s.visuals.length, `${id} ${s.key} ${s.t}`).toBeGreaterThan(0);
        for (const v of s.visuals) {
          expect(VIZ[v.widget], v.widget).toBeTruthy();
          for (const k of Object.keys(v.preset ?? {})) expect((VIZ[v.widget].params ?? []).some(p => p.k === k), `${v.widget}.${k}`).toBe(true);
        }
      }
    }
  });
  it('text patches find the text they replace', () => {
    for (const [id, patch] of Object.entries(PATCHES)) for (const [i, ps] of Object.entries(patch.steps ?? {}))
      for (const [from] of ps.replace ?? []) expect(GUIDES[id].steps[Number(i)].do, `${id} step ${i}`).toContain(from);
  });
  it('added steps attach to real steps and carry tests', () => {
    for (const [id, list] of Object.entries(ADDED_STEPS)) for (const a of list) {
      expect(a.after).toBeLessThan(GUIDES[id].steps.length);
      if (!a.key.endsWith('-source')) expect(a.step.code ?? '').toMatch(/def test_/);   // '-source' steps hold non-Python source (e.g. C)
    }
  });
  it('all five new projects have full guides', () => {
    for (const id of ['s1p6', 's2p6', 's4p8', 's4p9', 's5p7']) { expect(hasGuide(id)).toBe(true); expect(NEW_GUIDES[id].steps.length).toBe(Object.keys(NEW_STEP_VISUALS[id]).length); expect(P(id).firstWin).not.toBe(''); }
    expect(P('s2p6').firstWin).toMatch(/CO₂/);
    expect(Object.keys(STEP_VISUALS).length).toBeGreaterThanOrEqual(9);
  });
});

describe('Decision 3 (made by Claude at the learner\'s request)', () => {
  it('s2p5 no longer promises OpenStreetMap roads once A1 is approved; the original stays without it', () => {
    const p = P('s2p5'); const text = [p.title, p.explain, p.problem, p.firstWin, p.dataSource, ...p.milestones, ...p.validation].join(' ');
    expect(text).not.toMatch(/Overpass|OpenStreetMap|road network/i);
    expect(p.dataSource).toMatch(/proximity graph/); expect(p.specRevised).toBe('A1');
    const orig = buildProjects(none).find(x => x.id === 's2p5')!; expect(orig.problem).toMatch(/Overpass/); expect(orig.specRevised).toBeUndefined();
  });
  it('new and migrated learners get Decisions 3 and 4 recorded, without overwriting a choice already made', () => {
    expect(emptyState().decisions).toMatchObject({ s2p5: 'geonames', s4p5: 'power' });
    const st = memoryStorage(); save(st, { ...emptyState(), approvalsRev: 2, decisions: { guides: 'full', s2p5: 'overpass' } } as never);
    const raw = JSON.parse(st.data[STATE_KEY]); raw.approvalsRev = 2; raw.decisions = { guides: 'full', s2p5: 'overpass' }; st.set(STATE_KEY, JSON.stringify(raw));
    const s = load(st); expect(s.decisions).toMatchObject({ s2p5: 'overpass', s4p5: 'power' }); expect(s.approvalsRev).toBe(3);
  });
});

describe('finish checks', () => {
  it('"N passed" always equals the number of tests in the guide, with or without audit steps', () => {
    for (const ap of [all, none]) for (const p of buildProjects(ap)) {
      const g = effectiveGuide(p, ap); if (!g) continue;
      const n = g.steps.reduce((s, x) => s + ((x.code ?? '').match(/^def test_/gm) ?? []).length, 0);
      const m = g.done.map(x => x.text).join(' ').match(/\*\*(\d+) passed\*\*/);
      if (m && !(ap === none && p.id === 's0p4')) expect(Number(m[1]), p.id).toBe(n); // original s0p4: its 5th test is described in words only; A4 adds it as code
    }
  });
});

describe('step-visual maths', () => {
  it('rounding widget reproduces all seven s0p1 test cases', () => {
    const cases: [number, number, number, number][] = [[44.64, 0.72, 44.6, 0.7], [15.5, 0.2236, 15.5, 0.2], [212, 0.54, 212, 0.5], [-40, 1.8, -40, 2], [1234.5, 38, 1230, 40], [7.34, 0.96, 7, 1], [5.123, 0, 5.123, 0]];
    for (const [v, u, rv, ru] of cases) { const [a, b] = roundMeasurement(v, u); expect(a).toBeCloseTo(rv, 10); expect(b).toBeCloseTo(ru, 10); }
  });
  it('the exact small-root series agrees with the stable formula', () => {
    for (const b of [10, 1e3, 1e8]) { const d = Math.sqrt(b * b - 4), q = -0.5 * (b + d); expect(Math.abs(smallRootSeries(b) - 1 / q) / Math.abs(1 / q)).toBeLessThan(1e-15); }
  });
});

describe('Stage 2 visual maths (matches scripts/verify_oracles.py)', () => {
  it('pivoting rescues the tiny-pivot system', () => {
    const e = 1e-20, tru = 1 / (1 - e);
    expect(Math.abs(solve2(e, false)[0] - tru)).toBeGreaterThan(0.5);
    expect(Math.abs(solve2(e, true)[0] - tru)).toBeLessThan(1e-15);
  });
  it('elimination counts 3 and 11 operations for n = 2, 3', () => { expect(elimCount(2)).toBe(3); expect(elimCount(3)).toBe(11); expect(elimCount(100) / (1e6 / 3)).toBeCloseTo(1.0148, 3); });
  it('cond(V) for degree 8 on 20 points is about 6e5, and squares for VᵀV', () => {
    const xs = Array.from({ length: 20 }, (_, i) => i / 19); const s = singularValues(vander(xs, 8)); const k = s[0] / s.at(-1)!;
    expect(k).toBeGreaterThan(5e5); expect(k).toBeLessThan(7e5);
  });
});

describe('read-aloud sentences and words', () => {
  it('splits sentences, keeps decimals, file names and e.g. intact, and offsets point at the text', () => {
    const t = 'Set h = 0.5 and run src/main.py now. It prints 3.14, e.g. pi! Done?';
    const ss = sentences(t);
    expect(ss.map(x => x.t)).toEqual(['Set h = 0.5 and run src/main.py now.', 'It prints 3.14, e.g. pi!', 'Done?']);
    for (const x of ss) expect(t.slice(x.s, x.s + x.t.length)).toBe(x.t);
  });
  it('cuts very long sentences at a comma, never mid-word', () => {
    const t = Array.from({ length: 30 }, (_, i) => `clause number ${i}`).join(', ') + '.';
    const ss = sentences(t);
    expect(ss.length).toBeGreaterThan(1);
    for (const x of ss) { expect(x.t.length).toBeLessThanOrEqual(230); expect(t.slice(x.s, x.s + x.t.length)).toBe(x.t); }
    expect(ss.map(x => x.t).join(' ')).toBe(t);
  });
  it('estimated word schedule starts each word in order', () => {
    const w = wordSchedule('One two, three.');
    expect(w.map(x => x.at)).toEqual([0, 4, 9]); expect(w[0].time).toBe(0); expect(w[2].time).toBeGreaterThan(w[1].time);
  });
});

describe('Stage 3 visual maths (matches the reference solutions)', () => {
  it('RK4 explodes on the stiff problem at Δt = 0.1; backward Euler is within 1e-3', () => {
    expect(Math.abs(W3.rk4Stiff(0.1).at(-1)![1])).toBeGreaterThan(1e10);
    expect(Math.abs(W3.backwardEuler((t, y) => -50 * (y - Math.cos(t)), 0, 2, 0.1).at(-1)![1] - W3.stiffExact(2))).toBeLessThan(1e-3);
  });
  it('adaptive RK4 meets the original check: under 500 steps, error under 1e-6', () => {
    const a = W3.adaptiveRK4((_t, y) => -y, 1, 5, 1e-8); expect(a.ts.length).toBeLessThan(500); expect(Math.abs(a.ys.at(-1)! - Math.exp(-5))).toBeLessThan(1e-6);
  });
  it('the Poisson fit recovers ρ = 0.1 at the true β and s₀', () => { expect(W3.fitAt(0.4, 0.5).rho).toBeCloseTo(0.1, 3); expect(W3.poissonNLL([2, 0], [1, 1])).toBeCloseTo(2, 12); });
  it('the Lotka–Volterra period from (22, 10) is 2π/√1.5 within 0.01', () => expect(Math.abs(W3.lvLoop(22).period - 2 * Math.PI / Math.sqrt(1.5))).toBeLessThan(0.01));
  it('gradient descent lands within 2% of the grid ($3050 at 2.0 kW, 5.5 kWh)', () => {
    const g = W3.gridBest(); expect(g[0]).toBeCloseTo(3050, 6);
    for (const st of [[4, 20], [1, 2]]) { const e = W3.gradientPath(st[0], st[1]).at(-1)!; expect(Math.abs(W3.costOf(e[0], e[1]) / g[0] - 1)).toBeLessThan(0.02); expect(W3.shortFrac(e[0], e[1])).toBeLessThan(0.052); }
  });
});

describe('Stage 4 visual maths (matches the reference solutions)', () => {
  it('upwind smear: variance 0.74 after 10 s, as vΔx(1 − C)/2 predicts', () => expect(W4.upwindVariance(0.05, 0.001).v).toBeCloseTo(0.74, 3));
  it('SOR, Jacobi and CG iteration counts match the Python reference (N = 15, f = 1)', () => {
    const f = new Float64Array(225).fill(1);
    expect(W4.jacobiHist(f, 15).length).toBe(705); expect(W4.sorSolve(f, 15, 1).it).toBe(362); expect(W4.sorSolve(f, 15, W4.omegaOpt(15)).it).toBe(48); expect(W4.cgHist(f, 15).length).toBe(24);
  });
  it('the 2D truss solves, balances the load, and becomes singular without its diagonal', () => {
    const R = W4.truss2d(150, false)!; expect(R).not.toBeNull(); expect(W4.truss2d(150, true)).toBeNull();
    const R2 = W4.truss2d(300, false)!; R.forces.forEach((f, i) => expect(R2.forces[i]).toBeCloseTo(2 * f, 6));
  });
  it('Turing pair (0.055, 0.062) grows with Du/Dv = 2 and not with Du = Dv; spots have no flat state', () => {
    const [U, V] = W4.uniformStates(0.055, 0.062)[0]; let g = -1, ge = -1;
    for (let i = 0; i <= 320; i++) { g = Math.max(g, W4.growthAt(U, V, 0.055, 0.062, 1, 0.5, i / 200)); ge = Math.max(ge, W4.growthAt(U, V, 0.055, 0.062, 1, 1, i / 200)); }
    expect(g).toBeGreaterThan(0.005); expect(ge).toBeLessThan(0); expect(W4.uniformStates(0.03, 0.062)).toEqual([]);
  });
  it('Mann–Kendall S and BH match the hand checks', () => { expect(W4.mkS([1, 3, 2, 4])).toBe(4); expect(W4.mkZP([1, 2, 3, 4, 5]).z).toBeCloseTo(2.2045, 3); expect(W4.bh([0.001, 0.008, 0.039, 0.041, 0.042, 0.06, 0.074, 0.205, 0.212, 0.216]).filter(Boolean).length).toBe(2); });
});

describe('Stage 5 visual maths (matches the reference solutions)', () => {
  it('the reference force.c is exactly the C code the guide shows', async () => {
    const fs = await import('node:fs');
    const step = ADDED_STEPS.s5p1.find(a => a.key === 'a:B4-c-source')!;
    expect(fs.readFileSync('scripts/reference/s5p1/src/force.c', 'utf8').trim()).toBe(step.step.code!.trim());
  });
  it('dam break: the JS solver is close to Ritter and improves with resolution (as in Python: 0.0106 → 0.0067)', () => {
    const err = (n: number) => { const R = W5.dam1d(n, 0.5); return R.h.reduce((a: number, v: number, i: number) => a + Math.abs(v - W5.ritterJS(R.x[i], R.t)), 0) / n; };
    const e200 = err(200), e400 = err(400); expect(e400).toBeLessThan(e200); expect(e200).toBeCloseTo(0.0106, 3); expect(e400).toBeCloseTo(0.0067, 3);
  });
  it('2D flood step: a lake at rest stays at rest and water is conserved', () => {
    const n = 20, z = new Float64Array(n * n); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) z[i * n + j] = 2 + Math.sin(j / 4) * Math.cos(i / 5) + 0.05 * j;
    const S = { h: z.map(v => Math.max(0, 2.6 - v)), hu: new Float64Array(n * n), hv: new Float64Array(n * n) }, m0 = S.h.reduce((a, b) => a + b, 0);
    for (let k = 0; k < 100; k++) W5.flowStep(n, z, S, 10);
    expect(Math.max(...S.hu.map(Math.abs), ...S.hv.map(Math.abs))).toBeLessThan(1e-10); expect(S.h.reduce((a, b) => a + b, 0)).toBeCloseTo(m0, 9);
  });
  it('weekly SEIR in JS matches the Python model (peak near week 10)', () => { const w = W5.weeklyJS(0.4, 0.125); const k = w.indexOf(Math.max(...w)); expect(k).toBeGreaterThan(5); expect(k).toBeLessThan(15); });
  it('R̂ is near 1 for agreeing chains and large for disagreeing ones', () => {
    const a = [0, 1, 2, 3].map(s => Array.from({ length: 500 }, (_, i) => Math.sin(i * 1.7 + s * 3.1))); expect(W5.rhat(a)).toBeLessThan(1.05);
    expect(W5.rhat([0, 1, 2, 3].map(s => Array.from({ length: 500 }, (_, i) => s + 0.1 * Math.sin(i))))).toBeGreaterThan(1.5);
  });
});

describe('sync', () => {
  const t = (m: number) => new Date(Date.UTC(2026, 10, 15, 12, m)).toISOString();
  it('decides by what changed since the last sync', () => {
    expect(decide(t(5), null, null)).toBe('push-local');
    expect(decide(t(5), t(3), t(4))).toBe('push-local');
    expect(decide(t(3), t(5), t(4))).toBe('take-remote');
    expect(decide(t(5), t(6), t(4))).toBe('merge');
    expect(decide(t(3), t(3), t(4))).toBe('nothing');
    expect(decide(t(1), t(2), null)).toBe('merge');
  });
  it('merging never loses completions, ticks or notes, and keeps deletions', () => {
    const a = { ...emptyState(), updatedAt: t(1), completed: ['s0p1'], guideProgress: { s0p2: { s1: true } }, journal: [{ id: 'j1', kind: 'idea' as const, title: 'a', body: '', createdAt: t(0), updatedAt: t(0) }] };
    const b = { ...emptyState(), updatedAt: t(2), completed: ['s0p3'], guideProgress: { s0p2: { s2: true } }, journalDeleted: ['j1'], settings: { ...emptyState().settings, theme: 'light' as const } };
    const m = mergeStates(a, b);
    expect(m.completed.sort()).toEqual(['s0p1', 's0p3']); expect(m.guideProgress.s0p2).toEqual({ s1: true, s2: true });
    expect(m.journal.length).toBe(0); expect(m.settings.theme).toBe('light'); expect(m.updatedAt).toBe(t(2));
  });
});

describe('migration of your existing state', () => {
  it('an older saved state gets every audit item approved and Decision 1 = full guides, keeping progress', () => {
    const st = memoryStorage();
    save(st, { ...emptyState(), approvalsRev: 1, approvals: Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, 'pending'])), completed: ['s0p1'] } as never);
    const raw = JSON.parse(st.data[STATE_KEY]); delete raw.approvalsRev; st.set(STATE_KEY, JSON.stringify(raw));
    const s = load(st);
    expect(s.completed).toEqual(['s0p1']); expect(Object.values(s.approvals).every(v => v === 'approved')).toBe(true); expect(s.decisions.guides).toBe('full');
  });
});

describe('reader', () => {
  it('speaks terminal commands the way the original did', () => {
    expect(spokenCode('python -m src.main')).toBe('python dash m src dot main');
  });
});

describe('Stage 6 visual maths (matches scripts/reference/s6p2, SALib)', () => {
  it('Ishigami exact indices: S1 = 0.314, 0.442, 0 and S_T(x3) = 0.244', () => {
    const e = W6.ishigamiExact(); expect(e.S1[0]).toBeCloseTo(0.314, 3); expect(e.S1[1]).toBeCloseTo(0.442, 3); expect(e.ST[2]).toBeCloseTo(0.244, 3);
  });
  it('the SEIR peak equals the Python reference (0.25159 at beta 0.5, sigma 0.2, gamma 0.12, i0 0.001)', () => {
    expect(W6.seirPeak(0.5, 0.2, 0.12, 0.001, 0.2)).toBeCloseTo(0.25159, 4);
  });
  it('live Sobol agrees with SALib (gamma 0.69, beta 0.21, sigma 0.09, i0 0.00) within 0.05', () => {
    const S = W6.sobol(x => W6.seirPeak(x[0], x[1], x[2], x[3]), W6.SENS.bounds, 256, 3);
    [0.21, 0.09, 0.69, 0].forEach((v, i) => expect(Math.abs(S.S1[i] - v), W6.SENS.names[i]).toBeLessThan(0.05));
    expect(S.S1.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1.05);
  });
  it('posterior band is about 4x narrower than the box (Python: 0.12–0.21 vs 0.06–0.42)', () => {
    const run = (rows: number[][]) => rows.map(r => W6.seirPeak(r[0], r[1], r[2], r[3], 1)).sort((a, b) => a - b);
    const pp = run(W6.standInPosterior(400)), pb = run(W6.boxSamples(400));
    expect(pp[389] - pp[10]).toBeLessThan(0.35 * (pb[389] - pb[10])); expect(pp[10]).toBeGreaterThan(0.1); expect(pp[389]).toBeLessThan(0.23);
  });
  it('reproduce: the starting fraction shifts the timing, the step size changes the height', () => {
    const pk = (c: number[]) => { let k = 0; c.forEach((v, i) => { if (v > c[k]) k = i; }); return { d: k, v: c[k] }; };
    const paper = pk(W6.sirCurve(0.3, 0.1, 1e-4, 0.01)), early = pk(W6.sirCurve(0.3, 0.1, 1e-2, 0.1)), coarse = pk(W6.sirCurveCoarse(0.3, 0.1, 1e-4, 3));
    expect(paper.d - early.d).toBeGreaterThan(18); expect(Math.abs(early.v - paper.v) / paper.v).toBeLessThan(0.03);
    expect((coarse.v - paper.v) / paper.v).toBeGreaterThan(0.08);
  });
  it('slopeCI recovers a known slope and its interval contains it', () => {
    const x = Array.from({ length: 30 }, (_, i) => i), y = x.map(v => 2 + 0.5 * v + (v % 3 - 1) * 0.1), r = W6.slopeCI(x, y);
    expect(r.b).toBeCloseTo(0.5, 2); expect(r.lo).toBeLessThan(0.5); expect(r.hi).toBeGreaterThan(0.5);
  });
  it('rainshift verdicts match the captions: 33 years at 4/decade shows it; 2/decade or 10 years only suggest; 0 contains zero', () => {
    const v = (tr: number, yrs: number) => { const p = W6.rainSeries(tr, yrs), r = W6.slopeCI(p.map(q => q[0]), p.map(q => q[1])); return { shows: r.lo > 0 || r.hi < 0, holds: r.lo * 10 <= tr && r.hi * 10 >= tr }; };
    expect(v(4, 33)).toEqual({ shows: true, holds: true }); expect(v(2, 33).shows).toBe(false); expect(v(4, 10).shows).toBe(false); expect(v(0, 33)).toEqual({ shows: false, holds: true });
  });
  it('s6p2 finish check counts the 5 tests in the guide', () => {
    expect(effectiveGuide(P('s6p2'), all)!.done.some(d => d.text.includes('**5 passed**'))).toBe(true);
  });
});
