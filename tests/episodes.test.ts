import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { EPISODES } from '../src/content/episodes';
import { buildProjects, defaultApprovals } from '../src/content/curriculum';
import { effectiveGuide } from '../src/content/guides';

describe('episodes', () => {
  const a = defaultApprovals(); const ps = buildProjects(a);
  it('every episode points at a real project, step and file', () => {
    for (const e of EPISODES) {
      const p = ps.find(x => x.id === e.project); expect(p, e.id).toBeTruthy();
      if (typeof e.at === 'object') expect(e.at.step).toBeLessThan(effectiveGuide(p!, a)!.steps.length);
      for (const f of [e.file, e.poster]) { expect(existsSync('public/' + f), f).toBe(true); expect(statSync('public/' + f).size).toBeGreaterThan(1000); }
      expect(statSync('public/' + e.file).size, 'keep episodes small').toBeLessThan(8_000_000);
    }
  });
  it('ids are unique and at most one start episode per project', () => {
    expect(new Set(EPISODES.map(e => e.id)).size).toBe(EPISODES.length);
    const starts = EPISODES.filter(e => e.at === 'start').map(e => e.project); expect(new Set(starts).size).toBe(starts.length);
  });
});
