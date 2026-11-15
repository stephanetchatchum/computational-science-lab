import { describe, expect, it } from 'vitest';
import { load, save, sanitize, importData, memoryStorage, scheduleReview, dueReviews, emptyState, STATE_KEY, LEGACY_KEYS, LEGACY_EXPORT_SNIPPET } from '../src/state/store';

describe('persistence and migration', () => {
  it('first run migrates the original app progress', () => {
    const st = memoryStorage({ [LEGACY_KEYS.completed]: JSON.stringify(['s0p1', 's0p2']), [LEGACY_KEYS.steps]: JSON.stringify({ s0p3: { s0: true, s1: true, d0: true }, setup: { s1: true } }), [LEGACY_KEYS.theme]: 'light', [LEGACY_KEYS.os]: 'win' });
    const s = load(st);
    expect(s.completed).toEqual(['s0p1', 's0p2']);
    expect(s.guideProgress.s0p3).toEqual({ s0: true, s1: true, d0: true });
    expect(s.settings.theme).toBe('light'); expect(s.settings.os).toBe('win');
    expect(s.migratedFrom.length).toBe(1);
  });
  it('save writes the new key and mirrors the original keys; reload round-trips', () => {
    const st = memoryStorage();
    const s = { ...emptyState(), completed: ['s1p1'], guideProgress: { s1p2: { s3: true } } };
    save(st, s);
    expect(JSON.parse(st.data[LEGACY_KEYS.completed])).toEqual(['s1p1']);
    expect(JSON.parse(st.data[LEGACY_KEYS.steps])).toEqual({ s1p2: { s3: true } });
    const back = load(st);
    expect(back.completed).toEqual(['s1p1']); expect(back.guideProgress).toEqual({ s1p2: { s3: true } });
  });
  it('legacy progress is merged, never removed', () => {
    const st = memoryStorage();
    save(st, { ...emptyState(), completed: ['s0p1'], guideProgress: { s0p2: { s0: true } } });
    st.set(LEGACY_KEYS.completed, JSON.stringify(['s0p1', 's0p4']));
    st.set(LEGACY_KEYS.steps, JSON.stringify({ s0p2: { s1: true, s0: false } }));
    const s = load(st);
    expect(s.completed.sort()).toEqual(['s0p1', 's0p4']);
    expect(s.guideProgress.s0p2).toEqual({ s0: true, s1: true });
  });
  it('corrupt storage never crashes and yields defaults', () => {
    const st = memoryStorage({ [STATE_KEY]: '{not json', [LEGACY_KEYS.completed]: '42' });
    const s = load(st);
    expect(s.completed).toEqual([]); expect(s.settings.theme).toBe('dark');
    expect(sanitize({ completed: [1, 's0p1', null], guideProgress: { a: { s0: 'yes', s1: true } }, settings: { textScale: 1.2 } }))
      .toMatchObject({ completed: ['s0p1'], guideProgress: { a: { s1: true } }, settings: { textScale: 1.2, theme: 'dark' } });
  });
  it('imports the original HTML console export (string values) and full backups', () => {
    const legacy = JSON.stringify({ [LEGACY_KEYS.completed]: JSON.stringify(['s0p1']), [LEGACY_KEYS.steps]: JSON.stringify({ s0p2: { s2: true } }) });
    const r = importData(emptyState(), legacy);
    expect(r.state.completed).toEqual(['s0p1']); expect(r.state.guideProgress.s0p2.s2).toBe(true);
    const backup = JSON.stringify({ ...emptyState(), completed: ['s2p1'], journal: [{ id: 'x', kind: 'idea', title: 't', body: 'b', createdAt: '', updatedAt: '' }] });
    const r2 = importData({ ...emptyState(), completed: ['s0p1'] }, backup);
    expect(r2.state.completed.sort()).toEqual(['s0p1', 's2p1']); expect(r2.state.journal.length).toBe(1);
    expect(() => importData(emptyState(), '{"x":1}')).toThrow(); expect(() => importData(emptyState(), 'nope')).toThrow();
    expect(LEGACY_EXPORT_SNIPPET).toContain(LEGACY_KEYS.completed);
  });
});

describe('spaced review', () => {
  it('intervals expand on success and reset on failure', () => {
    const t0 = Date.UTC(2026, 0, 1);
    let c = scheduleReview(undefined, 'good', t0); expect(c.intervalDays).toBe(1);
    c = scheduleReview(c, 'good', t0); expect(c.intervalDays).toBe(3);
    c = scheduleReview(c, 'good', t0); expect(c.intervalDays).toBe(7);
    c = scheduleReview(c, 'again', t0); expect(c.intervalDays).toBe(1); expect(c.lapses).toBe(1);
    const s = { ...emptyState(), reviews: { a: { ...c, due: new Date(t0 - 1).toISOString() }, b: { ...c, due: new Date(t0 + 1e9).toISOString() } } };
    expect(dueReviews(s, t0)).toEqual(['a']);
  });
});
