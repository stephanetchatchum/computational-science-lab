import { describe, expect, it } from 'vitest';
import { STAGES, GUIDES, GUIDES_2D, ORIGINAL_IDS, buildProjects, defaultApprovals, hasCycle, milestonesFor, revisionsFor, stageWorkload, weeks, type Approvals } from '../src/content/curriculum';
import { AUDIT_ITEMS, DEMOTIONS, NEW_PROJECTS, REVISED_ORDER, REVISIONS, FINDINGS } from '../src/content/audit';
import { HERO_VIZ, STEP_VIZ, LAB, setupStepsData, setupPageHTML, guideMarkdown } from '../src/content/legacy/guideExtras.js';
import { VIZ } from '../src/content/legacy/viz.js';
import { LESSONS, labSections } from '../src/content/lessons';
import '../src/lab/newWidgets';

const EXPECTED_IDS = ['s0p1','s0p2','s0p3','s0p4','s1p1','s1p2','s1p3','s1p4','s1p5','s2p1','s2p2','s2p3','s2p4','s2p5','s3p1','s3p2','s3p3','s3p4','s3p5','s4p1','s4p2','s4p3','s4p4','s4p5','s4p6','s4p7','s5p1','s5p2','s5p3','s5p4','s5p5','s5p6','s6p1','s6p2','s6p3'];
const none: Approvals = Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, 'pending']));
const all: Approvals = Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, 'approved']));

describe('original content migrated intact', () => {
  it('8 stages and the 35 original project ids, in the original order', () => {
    expect(STAGES.map(s => s.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(ORIGINAL_IDS).toEqual(EXPECTED_IDS);
  });
  it('every original project has a build guide with steps, checks and a stuck table', () => {
    for (const id of EXPECTED_IDS) {
      const g = GUIDES[id];
      expect(g, id).toBeTruthy(); expect(g.steps.length, id).toBeGreaterThan(3);
      expect(g.done?.length, id).toBeGreaterThan(0); expect(g.stuck?.length, id).toBeGreaterThan(0);
      for (const s of g.steps) expect(s.t, id).toBeTruthy();
      expect(guideMarkdown(buildProjects(none).find(p => p.id === id)!, g)).toContain('## Steps');
    }
  });
  it('the nine 3D overrides are active and their 2D originals are preserved', () => {
    const ovr = ['s0p2', 's1p5', 's1p4', 's3p2', 's5p1', 's4p1', 's4p4', 's4p6', 's5p6'];
    expect(Object.keys(GUIDES_2D).sort()).toEqual([...ovr].sort());
    for (const k of ovr) { expect(GUIDES_2D[k]).not.toBe(GUIDES[k]); expect(GUIDES[k].pip).toContain('ursina'); }
  });
  it('every widget referenced by guides, lab and lessons exists', () => {
    const refs = [...Object.values(HERO_VIZ).map(v => v[0]), ...Object.values(STEP_VIZ).flatMap(o => Object.values(o).map(v => v[0])), ...LAB.flatMap(s => s[2].map(i => i[0]))];
    for (const r of refs) expect(VIZ[r], r).toBeTruthy();
    expect(Object.keys(HERO_VIZ).every(id => EXPECTED_IDS.includes(id))).toBe(true);
  });
  it('setup page and its 5 install steps render', () => {
    expect(setupStepsData().length).toBe(5);
    const html = setupPageHTML();
    expect(html).toContain('Install Python'); expect(html).toContain('Troubleshooting table');
  });
});

describe('lessons', () => {
  it('one lesson per widget, with a valid answer', () => {
    for (const name of Object.keys(VIZ).filter(n => (VIZ[n] as { kind?: string }).kind !== 'step' && !n.includes('~'))) {
      const l = LESSONS[name]; expect(l, name).toBeTruthy();
      expect(l.predict.answer).toBeGreaterThanOrEqual(0); expect(l.predict.answer).toBeLessThan(l.predict.options.length);
      expect(l.recall.answer.length).toBeGreaterThan(10);
    }
  });
  it('lab keeps the original 12 sections and adds the numerical-analysis section', () => {
    const s = labSections(() => true);
    expect(s.length).toBe(LAB.length + 1);
    expect(s.at(-1)!.items.map(i => i.widget)).toEqual(['stability', 'fft', 'convergence']);
  });
});

describe('audit overlay', () => {
  it('with nothing approved the curriculum is exactly the original 35', () => {
    const ps = buildProjects(none);
    expect(ps.map(p => p.id)).toEqual(EXPECTED_IDS);
    expect(hasCycle(ps)).toBe(false);
  });
  it('defaults (the five new projects approved) give 40 required projects in the revised order', () => {
    const ps = buildProjects(defaultApprovals());
    expect(ps.length).toBe(40);
    expect(ps.map(p => p.id)).toEqual(REVISED_ORDER);
    expect(new Set(REVISED_ORDER).size).toBe(40);
    expect(hasCycle(ps)).toBe(false);
  });
  it('approved prerequisite edges are applied and ids are never renamed', () => {
    const ps = buildProjects(all); const by = Object.fromEntries(ps.map(p => [p.id, p]));
    expect(by.s1p1.prereqs).toContain('s1p6'); expect(by.s4p4.prereqs).toContain('s4p8'); expect(by.s5p2.prereqs).toContain('s5p7');
    for (const id of EXPECTED_IDS) expect(by[id]).toBeTruthy();
    for (const p of ps) for (const q of p.prereqs) expect(by[q], `${p.id} → ${q}`).toBeTruthy();
    expect(hasCycle(ps)).toBe(false);
  });
  it('new projects follow their audit prerequisites', () => {
    const ps = buildProjects(all); const pos = Object.fromEntries(ps.map((p, i) => [p.id, i]));
    for (const n of NEW_PROJECTS) for (const q of n.prereqs) expect(pos[q], `${q} before ${n.id}`).toBeLessThan(pos[n.id]);
  });
  it('the original data never mutates when overlays are built', () => {
    buildProjects(all);
    expect(buildProjects(none).find(p => p.id === 's1p1')!.prereqs).toEqual(['s0p3', 's0p4']);
  });
  it('revisions and demotions point at real projects and milestones', () => {
    const ids = new Set([...EXPECTED_IDS, 'capstone']);
    for (const r of REVISIONS) { expect(ids.has(r.project), r.project).toBe(true); expect(AUDIT_ITEMS.some(i => i.id === r.item), r.item).toBe(true); }
    const ps = buildProjects(none);
    for (const d of DEMOTIONS) if (d.index !== null) expect(ps.find(p => p.id === d.project)!.milestones[d.index]).toBeTruthy();
    expect(Object.keys(FINDINGS).length).toBe(36);
  });
  it('E1 marks only the listed milestones optional', () => {
    const p = buildProjects(none).find(x => x.id === 's0p3')!;
    expect(milestonesFor(p, none).some(m => m.optional)).toBe(false);
    expect(milestonesFor(p, { ...none, E1: 'approved' }).filter(m => m.optional).map(m => m.index)).toEqual([5]);
  });
  it('revisionsFor splits approved and proposed', () => {
    const r = revisionsFor('s3p1', { ...none, B1: 'approved' });
    expect(r.approved.every(x => x.item === 'B1')).toBe(true); expect(r.proposed.some(x => x.item === 'B8')).toBe(true);
  });
});

describe('workload arithmetic', () => {
  it('parses time strings', () => { expect(weeks('2–3 weeks')).toBe(2.5); expect(weeks('1.5 weeks')).toBe(1.5); expect(weeks('1 week')).toBe(1); });
  it('original required work sums to ≈ 98 weeks (audit figure) using range midpoints', () => {
    const total = buildProjects(none).reduce((a, p) => a + weeks(p.time), 0);
    expect(total).toBeGreaterThan(90); expect(total).toBeLessThan(110);
    expect(stageWorkload(buildProjects(none), 0)).toEqual({ lo: 4, hi: 7, count: 4 });
  });
});

import { fmt as safeFmt } from '../src/components/Markup';
describe('inline markup', () => {
  it('keeps ** inside code literal and escapes HTML', () => {
    expect(safeFmt('{{0.5*(vx**2+vy**2)}} and **bold** <x>')).toBe('<code>0.5*(vx**2+vy**2)</code> and <b>bold</b> &lt;x&gt;');
  });
});
