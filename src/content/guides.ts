/**
 * The effective build guide for a project = original guide (or new guide) + approved audit patches
 * + approved added steps + a visual for each step. Progress keys never change meaning:
 *   s0 = setup, s1…sN = original steps, a:… = added steps, s(N+1) = git, d0… = finish checks.
 */
import { GUIDES, GUIDES_2D, isApproved, type Approvals, type Project } from './curriculum';
import { STEP_VIZ, setupStepFor, gitStepFor } from './legacy/guideExtras.js';
import type { Guide, GuideStep } from './legacy/curriculum.js';
import { STEP_VISUALS, PATCHES, ADDED_STEPS, NEW_GUIDES, NEW_STEP_VISUALS, type Visual } from './stages';

export interface EffStep extends GuideStep {
  key: string; origin: 'setup' | 'original' | 'added' | 'git';
  item?: string; optional?: string; revised?: { item: string; original: GuideStep }; visuals: Visual[]; tree?: string;
}
export interface EffGuide { guide: Guide; steps: EffStep[]; done: { text: string; item?: string }[]; stuck: [string, string, string?][] }

export const hasGuide = (id: string) => !!(GUIDES[id] || NEW_GUIDES[id]);
export function baseGuide(id: string, twoD = false): Guide | undefined {
  if (twoD && GUIDES_2D[id]) return GUIDES_2D[id];
  return GUIDES[id] ?? NEW_GUIDES[id];
}

/** Original demo first (never removed), then the new step visual if it shows something different. */
function visualsFor(id: string, i: number): Visual[] {
  const out: Visual[] = [];
  const legacy = STEP_VIZ[id]?.[i];
  if (legacy) out.push({ widget: legacy[0], caption: legacy[1] });
  const own = STEP_VISUALS[id]?.[i] ?? NEW_STEP_VISUALS[id]?.[i];
  if (own && !out.some(v => v.widget === own.widget)) out.push(own);
  return out;
}

export function effectiveGuide(p: Project, a: Approvals, twoD = false): EffGuide | undefined {
  const g = baseGuide(p.id, twoD);
  if (!g) return undefined;
  const patch = twoD ? undefined : PATCHES[p.id];
  const orig: EffStep[] = g.steps.map((s, i) => {
    const e: EffStep = { ...s, key: 's' + (i + 1), origin: 'original', visuals: visualsFor(p.id, i) };
    const ps = patch?.steps?.[i];
    if (ps && isApproved(a, ps.item)) {
      const before = { ...s };
      if (ps.replace) e.do = e.do.map(d => ps.replace!.reduce((t, [from, to]) => (t === from ? to : t), d));
      if (ps.addCode) e.code = (e.code ?? '') + ps.addCode;
      if (ps.optional) e.optional = ps.optional;
      if (ps.doAll) e.do = ps.doAll;
      if (ps.why !== undefined) e.why = ps.why;
      if (ps.see !== undefined) e.see = ps.see;
      if (ps.hint !== undefined) e.hint = ps.hint;
      if (ps.run !== undefined) e.run = ps.run;
      if (ps.t !== undefined) e.t = ps.t;
      if (ps.code !== undefined) e.code = ps.code;
      const changed = ps.replace || ps.doAll || ps.why !== undefined || ps.addCode || ps.see !== undefined || ps.hint !== undefined || ps.run !== undefined || ps.t !== undefined || ps.code !== undefined;
      if (changed) e.revised = { item: ps.item, original: before };
      e.item = ps.item;
    }
    return e;
  });
  const added = twoD ? [] : (ADDED_STEPS[p.id] ?? []).filter(x => isApproved(a, x.item));
  const merged: EffStep[] = [];
  orig.forEach((s, i) => {
    merged.push(s);
    added.filter(x => x.after === i).forEach(x => merged.push({ ...x.step, key: x.key, origin: 'added', item: x.item, visuals: x.visual ? [x.visual] : [] }));
  });
  const setup = setupStepFor(p, g) as EffStep; setup.key = 's0'; setup.origin = 'setup'; setup.visuals = [];
  const git = gitStepFor(p, g) as EffStep; git.key = 's' + (g.steps.length + 1); git.origin = 'git'; git.visuals = [];
  // The pytest count in the finish checks follows the tests actually in the guide (audit steps add tests).
  const all = [...orig, ...added.map(x => x.step)];
  const nTests = all.reduce((n, s) => n + ((s.code ?? '').match(/^def test_/gm) ?? []).length, 0);
  const addedItems = [...new Set(added.filter(x => /^def test_/m.test(x.step.code ?? '')).map(x => x.item).concat(orig.filter(s => s.revised && /^def test_/m.test(s.code ?? '')).map(s => s.item!)))];
  const done = (g.done ?? []).map((text, i) => {
    const d = patch?.done?.[i];
    const out: { text: string; item?: string } = d && isApproved(a, d.item) ? { text: d.text, item: d.item } : { text };
    const m = out.text.match(/\*\*(\d+) passed\*\*/);
    if (m && Number(m[1]) !== nTests && (addedItems.length || isApproved(a, 'A1'))) { out.text = out.text.replace(m[0], `**${nTests} passed**`); out.item ??= addedItems.length ? addedItems.join(', ') : 'A1'; }
    return out;
  });
  const stuck = (g.stuck ?? []).map(([x, y], i): [string, string, string?] => {
    const s = patch?.stuck?.[i];
    return s && isApproved(a, s.item) ? [s.a ?? x, s.b ?? y, s.item] : [x, y];
  });
  return { guide: g, steps: [setup, ...merged, git], done, stuck };
}

/** Spec field text with approved audit fixes applied. */
export function specText(p: Project, field: 'deliverableWhy', a: Approvals): { text: string; item?: string } {
  const f = PATCHES[p.id]?.spec?.[field];
  return f && isApproved(a, f.item) ? { text: f.text, item: f.item } : { text: p[field] };
}

/** Steps that should count toward progress (optional steps do not block "next action"). */
export const requiredSteps = (eg: EffGuide) => eg.steps.filter(s => !s.optional);

/** The project's validation list with approved audit fixes applied. */
export function validationText(p: Project, a: Approvals): { text: string; item?: string }[] {
  const v = PATCHES[p.id]?.validation;
  return p.validation.map((text, i) => (v?.[i] && isApproved(a, v[i].item) ? { text: v[i].text, item: v[i].item } : { text }));
}
