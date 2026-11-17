/**
 * The effective curriculum = the original content + the audit items the learner has approved.
 * Pure functions only, so they are easy to test.
 */
import { STAGES, PROJECTS, CAPSTONE, GUIDES, GUIDES_2D, type LegacyProject, type Guide } from './legacy/curriculum.js';
import { NEW_GUIDES } from './stages';
import { AUDIT_ITEMS, NEW_PROJECTS, PREREQ_CHANGES, REVISED_ORDER, REVISIONS, DEMOTIONS, type ApprovalState, type Revision } from './audit';

export { STAGES, CAPSTONE, GUIDES, GUIDES_2D };
export type { LegacyProject, Guide };

export const ORIGINAL_IDS = PROJECTS.map(p => p.id);

export interface Project extends LegacyProject {
  /** 'original' = from the HTML; 'audit' = new project from the audit (spec only, no build guide) */
  origin: 'original' | 'audit';
  auditItem?: string; summary?: string; oracles?: string[]; labWidget?: string;
  /** Set when audit A1 rewrote this project's specification text. */
  specRevised?: string;
}

export type Approvals = Record<string, ApprovalState>;
export const defaultApprovals = (): Approvals => Object.fromEntries(AUDIT_ITEMS.map(i => [i.id, i.defaultState]));
export const isApproved = (a: Approvals, id: string) => (a[id] ?? AUDIT_ITEMS.find(i => i.id === id)?.defaultState) === 'approved';

function newProject(spec: typeof NEW_PROJECTS[number]): Project {
  return {
    id: spec.id, title: spec.title, stage: spec.stage, domain: spec.domain, difficulty: spec.difficulty, time: spec.time,
    prereqs: spec.prereqs, concepts: spec.concepts, context: spec.summary, explain: spec.summary,
    firstWin: NEW_GUIDES[spec.id] ? spec.firstWin ?? '' : '', problem: spec.summary,
    deliverableType: NEW_GUIDES[spec.id] ? spec.deliverableType ?? 'Tested Python module' : 'Specification — build guide coming with its stage',
    deliverableWhy: '', dataSource: spec.dataSource ?? 'None — validated against exactly known answers.', milestones: [], validation: spec.oracles, tools: NEW_GUIDES[spec.id] ? spec.tools ?? [] : [], extensions: [],
    origin: 'audit', auditItem: spec.item, summary: spec.summary, oracles: spec.oracles, labWidget: spec.labWidget,
  };
}

/**
 * Audit A1 ("align specs with guides"), following Decisions 3 and 4 (made by Claude at the learner's request, Nov 2026).
 * Decision 3: s2p5 keeps GeoNames towns and is honest that its links are a proximity graph, not roads.
 * Decision 4: s4p5 keeps the 8 × 8 NASA POWER grid and the spec is rewritten to match.
 */
const SPEC_ALIGN: Record<string, { item: string; apply: (p: Project) => Partial<Project> }> = {
  s2p5: { item: 'A1', apply: p => ({
    title: 'Eigenvector Centrality Analysis of an African Town Network',
    explain: p.explain.replace('then unleash it on a real African road network pulled from OpenStreetMap.', 'then unleash it on a real network of Kenyan towns from GeoNames, where each town is linked to its nearest neighbours.'),
    problem: p.problem.replace('Then extract a real road or settlement network for one African region of your choice from OpenStreetMap, via the Overpass API, representing at least 30 nodes,', 'Then build a real settlement network for one African region from GeoNames (at least 30 towns), linking each town to its nearest neighbours — a proximity graph, not a road map —'),
    firstWin: 'Early win: a real map of towns sized by importance — the biggest dots are the ones your algorithm just crowned as structurally central.',
    dataSource: 'GeoNames cities15000: real towns and coordinates. Links join each town to its nearest neighbours, so this is a proximity graph, not roads. A copy is kept in the course repository.',
    milestones: p.milestones.map((m, i) => i === 0 ? 'Build a real settlement network for a region: GeoNames towns, each linked to its nearest neighbours (a proximity graph), stored as an adjacency matrix.' : m.replace('Draw the real road network', 'Draw the real town network')),
    validation: p.validation.map((v, i) => i === 1 ? 'Sanity-check centrality against real-world knowledge of the region (a known regional hub town should not rank as structurally unimportant), and say plainly that links are proximity, not roads.' : v),
  }) },
  s4p3: { item: 'A1', apply: p => ({
    problem: p.problem.replace('download real gridded population data for one African region of your choice from WorldPop, identify the 10 to 30 highest-population grid cells as your settlements,', 'take the 10 to 30 largest towns of one African country from GeoNames (the town list you already downloaded in the town-network project), with their real populations as your settlements,'),
    dataSource: 'GeoNames towns and populations (reused from the town-network project). Travel between towns comes from a gravity model, an assumption, not measured mobility.',
    milestones: p.milestones.map((m, i) => i === 0 ? 'Load real towns and populations for a region (GeoNames) and place a manageable number of agents in them.' : m),
  }) },
  s4p5: { item: 'A1', apply: p => ({
    title: 'Detecting Real Precipitation Trends Over East Africa (NASA POWER Grid)',
    explain: p.explain.replace('with access to satellite weather data covering the entire East African region, not just one weather station, but a whole grid of thousands of locations at once.', 'with satellite-based rainfall for a grid of 64 places across East Africa, not just one weather station.'),
    problem: p.problem.replace('Download a real gridded precipitation reanalysis or satellite dataset, for example CHIRPS or ERA5, covering East Africa for at least 30 years, in NetCDF format.', 'Download annual rainfall for an 8 × 8 grid of points over East Africa (latitudes −4 to 10, longitudes 30 to 44) from NASA POWER for 1991–2023.').replace('available in the pymannkendall package or implementable from its published formula', 'implemented by you from its published formula, with tie correction, prewhitening and a false-discovery-rate step'),
    dataSource: 'NASA POWER monthly PRECTOTCORR for an 8 × 8 grid over East Africa, 1991–2023 (Decision 4). A copy is kept in the course repository.',
    milestones: p.milestones.map((m, i) => i === 0 ? 'Download and correctly load annual rainfall for the 64-point NASA POWER grid over East Africa, 1991–2023.' : m),
  }) },
  s5p3: { item: 'A1', apply: () => ({ title: 'CPU-Parallel (GPU-Optional) High-Resolution 2D Heat Solver' }) },
  s5p6: { item: 'D1', apply: p => ({
    title: 'Shallow-Water Flood Model (Finite Volume) for a Real River Basin',
    problem: 'Solve the shallow-water (Saint-Venant) equations with a finite-volume local Lax–Friedrichs (Rusanov) scheme. In 1D, validate against Ritter’s exact dam-break solution and report how the error falls with grid size. In 2D, use hydrostatic reconstruction so a lake at rest over uneven ground stays at rest, Manning friction, a CFL time step and real seconds, and check that water is conserved to rounding error. Then download a real elevation grid (SRTM via Open Topo Data), fill voids, and flood it with a stated inflow in m³/s or rainfall in mm/h. If a documented flood extent exists, report intersection-over-union; if not, say so and rest the validation on the analytic and conservation checks.',
    milestones: p.milestones.map((m, i) => i === 1 ? 'Implement the 2D shallow-water equations with a finite-volume Rusanov scheme, hydrostatic reconstruction, Manning friction and a CFL time step, in real seconds, validated against the exact dam-break solution.' : m),
  }) },
};

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
  for (const [id, fix] of Object.entries(SPEC_ALIGN)) {
    const p = all.find(x => x.id === id);
    if (p && isApproved(a, fix.item)) Object.assign(p, fix.apply(p), { specRevised: fix.item });
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
