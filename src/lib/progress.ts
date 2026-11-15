import { GUIDES, isUnlocked, type Project } from '../content/curriculum';
import type { AppState } from '../state/store';
import { dueReviews } from '../state/store';

/** The original app numbers steps s0 (setup) … sN+1 (git) and finish checks d0 … */
export function stepCount(pid: string) { const g = GUIDES[pid]; return g ? g.steps.length + 2 : 0; }
export function stepsDone(s: AppState, pid: string) {
  const n = stepCount(pid), prog = s.guideProgress[pid] || {};
  let d = 0; for (let i = 0; i < n; i++) if (prog['s' + i]) d++; return d;
}
export function firstOpenStep(s: AppState, pid: string): number | null {
  const n = stepCount(pid), prog = s.guideProgress[pid] || {};
  for (let i = 0; i < n; i++) if (!prog['s' + i]) return i; return null;
}
export function checksDone(s: AppState, pid: string) {
  const g = GUIDES[pid]; if (!g?.done) return { done: 0, total: 0 };
  const prog = s.guideProgress[pid] || {}; return { done: g.done.filter((_, i) => prog['d' + i]).length, total: g.done.length };
}
export function projectFraction(s: AppState, p: Project) {
  if (s.completed.includes(p.id)) return 1;
  const n = stepCount(p.id); return n ? stepsDone(s, p.id) / n : 0;
}

/** The project the learner is most plausibly working on now. */
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

export interface NextAction { title: string; detail: string; to: string; cta: string; kind: 'setup' | 'step' | 'finish' | 'spec' | 'review' | 'done' }
export function nextAction(s: AppState, projects: Project[]): NextAction {
  const setupTicks = Object.values(s.guideProgress.setup || {}).filter(Boolean).length;
  if (s.completed.length === 0 && setupTicks === 0 && Object.keys(s.guideProgress).filter(k => k !== 'setup').length === 0) {
    return { kind: 'setup', title: 'Set up your computer', detail: 'Install Python, Git and VS Code once (30–45 minutes). Every project starts from this.', to: '/setup', cta: 'Open Setup' };
  }
  const p = currentProject(s, projects);
  if (!p) return { kind: 'done', title: 'Every unlocked project is complete', detail: 'Choose your capstone direction.', to: '/capstone', cta: 'Open Capstone' };
  if (p.origin === 'audit' || !GUIDES[p.id]) {
    return { kind: 'spec', title: p.title, detail: 'This new project has a specification but no build guide yet. Read the spec and record your decision on build guides.', to: `/project/${p.id}`, cta: 'Open specification' };
  }
  const step = firstOpenStep(s, p.id);
  if (step === null) {
    const c = checksDone(s, p.id);
    return { kind: 'finish', title: p.title, detail: `All steps ticked. Confirm the finish checklist (${c.done}/${c.total}) and mark the project complete.`, to: `/project/${p.id}?tab=finish`, cta: 'Verify and finish' };
  }
  const g = GUIDES[p.id];
  const label = step === 0 ? 'Create the project folder and install what it needs' : step === g.steps.length + 1 ? 'Write the README and save your work with git' : g.steps[step - 1].t;
  return { kind: 'step', title: `Step ${step}: ${label.replace(/\*\*|\{\{|\}\}/g, '')}`, detail: p.title, to: `/project/${p.id}?tab=build&step=${step}`, cta: 'Resume this step' };
}

export function reviewSummary(s: AppState) { return dueReviews(s).length; }
