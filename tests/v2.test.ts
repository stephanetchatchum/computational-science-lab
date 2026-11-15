import { describe, expect, it } from 'vitest';
import { buildProjects, defaultApprovals, GUIDES, type Approvals } from '../src/content/curriculum';
import { AUDIT_ITEMS } from '../src/content/audit';
import { effectiveGuide, hasGuide } from '../src/content/guides';
import { STEP_VISUALS, ADDED_STEPS, NEW_GUIDES, NEW_STEP_VISUALS, PATCHES } from '../src/content/stage01';
import { VIZ } from '../src/content/legacy/viz.js';
import { roundMeasurement, smallRootSeries } from '../src/lab/stepWidgets';
import '../src/lab/newWidgets';
import { mergeStates, decide } from '../src/sync/merge';
import { emptyState, load, memoryStorage, save, STATE_KEY } from '../src/state/store';
import { spokenCode } from '../src/lib/reader';

const all = defaultApprovals();
const none: Approvals = Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, 'pending']));
const P = (id: string) => buildProjects(all).find(p => p.id === id)!;
const STAGE01 = ['s0p1', 's0p2', 's0p3', 's0p4', 's1p1', 's1p2', 's1p3', 's1p4', 's1p5', 's1p6'];

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
  it('every Stage 0–1 build step (including the new ones) has a visual, and every visual exists', () => {
    for (const id of STAGE01) {
      const g = effectiveGuide(P(id), all)!;
      for (const s of g.steps.filter(x => x.origin === 'original' || x.origin === 'added')) {
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
      expect(a.step.code ?? '').toMatch(/def test_/);
    }
  });
  it('s1p6 now has a full guide; the other four new projects remain specifications', () => {
    expect(hasGuide('s1p6')).toBe(true);
    expect(NEW_GUIDES.s1p6.steps.length).toBe(Object.keys(NEW_STEP_VISUALS.s1p6).length);
    for (const id of ['s2p6', 's4p8', 's4p9', 's5p7']) expect(hasGuide(id)).toBe(false);
    expect(Object.keys(STEP_VISUALS).length).toBeGreaterThanOrEqual(9);
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
