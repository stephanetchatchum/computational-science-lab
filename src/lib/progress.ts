import { isUnlocked, type Project } from '../content/curriculum';
import { effectiveGuide, hasGuide, type EffGuide } from '../content/guides';
import type { AppState } from '../state/store';
import { dueReviews } from '../state/store';

const cache = new WeakMap<object, Map<string, EffGuide | undefined>>();
export function eg(s: AppState, p: Project): EffGuide | undefined {
  let m = cache.get(s.approvals); if (!m) { m = new Map(); cache.set(s.approvals, m); }
  if (!m.has(p.id)) m.set(p.id, effectiveGuide(p, s.approvals));
  return m.get(p.id);
}
export function stepCount(s: AppState, p: Project) { return eg(s, p)?.steps.filter(x => !x.optional).length ?? 0; }
export function stepsDone(s: AppState, p: Project) {
  const g = eg(s, p); if (!g) return 0; const prog = s.guideProgress[p.id] || {};
  return g.steps.filter(x => !x.optional && prog[x.key]).length;
}
export function firstOpenStep(s: AppState, p: Project): number | null {
  const g = eg(s, p); if (!g) return null; const prog = s.guideProgress[p.id] || {};
  const i = g.steps.findIndex(x => !x.optional && !prog[x.key]); return i < 0 ? null : i;
}
export function checksDone(s: AppState, p: Project) {
  const g = eg(s, p); if (!g) return { done: 0, total: 0 }; const prog = s.guideProgress[p.id] || {};
  return { done: g.done.filter((_, i) => prog['d' + i]).length, total: g.done.length };
}
export function projectFraction(s: AppState, p: Project) {
  if (s.completed.includes(p.id)) return 1;
  const n = stepCount(s, p); return n ? stepsDone(s, p) / n : 0;
}
export function currentProject(s: AppState, projects: Project[]): Project | undefined {
  const done = new Set(s.completed);
  for (let i = s.history.length - 1; i >= 0; i--) {
    const h = s.history[i];
    if ((h.kind === 'step' || h.kind === 'milestone' || h.kind === 'visit') && /^s\dp\d+$/.test(h.ref) && !done.has(h.ref)) {
      const p = projects.find(x => x.id === h.ref); if (p && isUnlocked(p, done)) return p;
    }
  }
  return projects.find(p => !done.has(p.id) && isUnlocked(p, done));
}

export interface NextAction { title: string; detail: string; to: string; cta: string; kind: 'setup' | 'step' | 'finish' | 'spec' | 'done' }
const clean = (t: string) => t.replace(/\*\*|\{\{|\}\}/g, '');
export function nextAction(s: AppState, projects: Project[]): NextAction {
  const setupTicks = Object.values(s.guideProgress.setup || {}).filter(Boolean).length;
  if (s.completed.length === 0 && setupTicks === 0 && Object.keys(s.guideProgress).filter(k => k !== 'setup').length === 0) {
    return { kind: 'setup', title: 'Set up your computer', detail: 'Install Python, Git and VS Code once (30–45 minutes). Every project starts from this.', to: '/setup', cta: 'Open Setup' };
  }
  const p = currentProject(s, projects);
  if (!p) return { kind: 'done', title: 'Every unlocked project is complete', detail: 'Choose your capstone direction.', to: '/capstone', cta: 'Open Capstone' };
  if (!hasGuide(p.id)) return { kind: 'spec', title: p.title, detail: 'The build guide for this new project arrives with its stage. Read the specification and explore its lab widget meanwhile.', to: `/project/${p.id}`, cta: 'Open specification' };
  const i = firstOpenStep(s, p);
  if (i === null) {
    const c = checksDone(s, p);
    return { kind: 'finish', title: p.title, detail: `All steps ticked. Confirm the finish checklist (${c.done}/${c.total}) and mark the project complete.`, to: `/project/${p.id}?tab=finish`, cta: 'Verify and finish' };
  }
  const st = eg(s, p)!.steps[i];
  return { kind: 'step', title: `Step ${i}: ${clean(st.t)}`, detail: p.title, to: `/project/${p.id}?tab=build&step=${i}`, cta: 'Resume this step' };
}
export function reviewSummary(s: AppState) { return dueReviews(s).length; }
