/**
 * The effective curriculum = the original content + the audit items the learner has approved.
 * Pure functions only, so they are easy to test.
 */
import { STAGES, PROJECTS, CAPSTONE, GUIDES, GUIDES_2D, type LegacyProject, type Guide } from './legacy/curriculum.js';
import { AUDIT_ITEMS, NEW_PROJECTS, PREREQ_CHANGES, REVISED_ORDER, REVISIONS, DEMOTIONS, type ApprovalState, type Revision } from './audit';

export { STAGES, CAPSTONE, GUIDES, GUIDES_2D };
export type { LegacyProject, Guide };

export const ORIGINAL_IDS = PROJECTS.map(p => p.id);

export interface Project extends LegacyProject {
  /** 'original' = from the HTML; 'audit' = new project from the audit (spec only, no build guide) */
  origin: 'original' | 'audit';
  auditItem?: string; summary?: string; oracles?: string[]; labWidget?: string;
}

export type Approvals = Record<string, ApprovalState>;
export const defaultApprovals = (): Approvals => Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, i.defaultState]));
export const isApproved = (a: Approvals, id: string) => (a[id] ?? AUDIT_ITEMS.find(i => i.id === id)?.defaultState) === 'approved';

function newProject(spec: typeof NEW_PROJECTS[number]): Project {
  return {
    id: spec.id, title: spec.title, stage: spec.stage, domain: spec.domain, difficulty: spec.difficulty, time: spec.time,
    prereqs: spec.prereqs, concepts: spec.concepts, context: spec.summary, explain: spec.summary,
    firstWin: '', problem: spec.summary, deliverableType: 'Specification only — build guide pending Decision 1',
    deliverableWhy: '', dataSource: '', milestones: [], validation: spec.oracles, tools: [], extensions: [],
    origin: 'audit', auditItem: spec.item, summary: spec.summary, oracles: spec.oracles, labWidget: spec.labWidget,
  };
}

/** Projects in learning order, with approved prerequisite edges applied. Original ids are never changed. */
export function buildProjects(a: Approvals): Project[] {
  const base: Project[] = PROJECTS.map(p => ({ ...p, prereqs: [...p.prereqs], origin: 'original' as const }));
  const added = NEW_PROJECTS.filter(n => isApproved(a, n.item)).map(newProject);
  const all = [...base, ...added];
  for (const ch of PREREQ_CHANGES) {
    if (!isApproved(a, ch.item)) continue;
    const p = all.find(x => x.id === ch.project);
    if (p && !p.prereqs.includes(ch.add)) p.prereqs.push(ch.add);
  }
  if (added.length === 0) return all;
  const rank = new Map(REVISED_ORDER.map((id, i) => [id, i]));
  return all.sort((x, y) => (rank.get(x.id) ?? 999) - (rank.get(y.id) ?? 999));
}

export const stageProjects = (ps: Project[], stage: number) => ps.filter(p => p.stage === stage);
export const isUnlocked = (p: Project, done: Set<string>) => p.prereqs.every(id => done.has(id));

/** Revisions that apply to a project, split into approved and still-proposed. */
export function revisionsFor(projectId: string, a: Approvals): { approved: Revision[]; proposed: Revision[] } {
  const rs = REVISIONS.filter(r => r.project === projectId);
  return { approved: rs.filter(r => isApproved(a, r.item)), proposed: rs.filter(r => !isApproved(a, r.item)) };
}

/** Milestones with their status: required, or optional when E1 is approved. */
export function milestonesFor(p: Project, a: Approvals): { text: string; optional: boolean; index: number }[] {
  const dem = isApproved(a, 'E1') ? DEMOTIONS.filter(d => d.project === p.id && d.index !== null).map(d => d.index) : [];
  return p.milestones.map((text, index) => ({ text, index, optional: dem.includes(index) }));
}

/** Parse "2–3 weeks" / "1.5 weeks" → midpoint weeks. */
export function weeks(time: string): number {
  const m = time.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?\s*week/);
  if (!m) return 0;
  const lo = parseFloat(m[1]), hi = m[2] ? parseFloat(m[2]) : lo;
  return (lo + hi) / 2;
}
export function stageWorkload(ps: Project[], stage: number) {
  const list = stageProjects(ps, stage);
  let lo = 0, hi = 0;
  for (const p of list) {
    const m = p.time.match(/([\d.]+)\s*(?:[–-]\s*([\d.]+))?/);
    if (m) { lo += parseFloat(m[1]); hi += m[2] ? parseFloat(m[2]) : parseFloat(m[1]); }
  }
  return { lo, hi, count: list.length };
}

/** Prerequisites of a stage = prerequisites of its projects that live in earlier stages. */
export function stagePrereqs(ps: Project[], stage: number): Project[] {
  const ids = new Set<string>();
  stageProjects(ps, stage).forEach(p => p.prereqs.forEach(id => ids.add(id)));
  return ps.filter(p => ids.has(p.id) && p.stage < stage);
}

/** Unique concept list for a stage in one subject. */
export function stageConcepts(ps: Project[], stage: number, key: 'math' | 'physics' | 'programming') {
  const set = new Set<string>();
  stageProjects(ps, stage).forEach(p => p.concepts[key].forEach(c => { if (!/^None/.test(c)) set.add(c); }));
  return [...set];
}

/** Detect prerequisite cycles (used by tests and as a runtime guard). */
export function hasCycle(ps: Project[]): boolean {
  const by = new Map(ps.map(p => [p.id, p])); const state = new Map<string, number>();
  const visit = (id: string): boolean => {
    const s = state.get(id); if (s === 1) return true; if (s === 2) return false;
    state.set(id, 1);
    for (const q of by.get(id)?.prereqs ?? []) if (visit(q)) return true;
    state.set(id, 2); return false;
  };
  return ps.some(p => visit(p.id));
}

export function guideFor(id: string, opts: { twoD?: boolean } = {}): Guide | undefined {
  if (opts.twoD && GUIDES_2D[id]) return GUIDES_2D[id];
  return GUIDES[id];
}
