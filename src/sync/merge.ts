/** Merge two copies of the learner state (two devices). Never loses a completion, tick or note. */
import { sanitize, type AppState, type JournalEntry, type HistoryItem } from '../state/store';

const later = (a?: string, b?: string) => ((a ?? '') >= (b ?? '') ? a : b);
function orMaps(a: Record<string, Record<string, boolean>>, b: Record<string, Record<string, boolean>>) {
  const out: Record<string, Record<string, boolean>> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[k] = { ...(a[k] ?? {}) };
    for (const [kk, v] of Object.entries(b[k] ?? {})) out[k][kk] = out[k][kk] || v;
  }
  return out;
}

export function mergeStates(localIn: unknown, remoteIn: unknown): AppState {
  const a = sanitize(localIn), b = sanitize(remoteIn);
  const newer = a.updatedAt >= b.updatedAt ? a : b;
  const deleted = [...new Set([...a.journalDeleted, ...b.journalDeleted])];
  const journal = new Map<string, JournalEntry>();
  for (const e of [...a.journal, ...b.journal]) {
    if (deleted.includes(e.id)) continue;
    const prev = journal.get(e.id);
    if (!prev || e.updatedAt > prev.updatedAt) journal.set(e.id, e);
  }
  const lessons: AppState['lessons'] = {};
  for (const id of new Set([...Object.keys(a.lessons), ...Object.keys(b.lessons)])) {
    const x = a.lessons[id], y = b.lessons[id];
    if (!x || !y) { lessons[id] = (x ?? y)!; continue; }
    const [first, second] = (x.completedAt && !y.completedAt) || (!!x.completedAt === !!y.completedAt && (x.prediction?.at ?? '') >= (y.prediction?.at ?? '')) ? [y, x] : [x, y];
    lessons[id] = { ...first, ...second, firstVisit: x.firstVisit < y.firstVisit ? x.firstVisit : y.firstVisit };
  }
  const reviews: AppState['reviews'] = {};
  for (const id of new Set([...Object.keys(a.reviews), ...Object.keys(b.reviews)])) {
    const x = a.reviews[id], y = b.reviews[id];
    reviews[id] = !x ? y : !y ? x : (x.last ?? '') >= (y.last ?? '') ? x : y;
  }
  const seen = new Set<string>(); const history: HistoryItem[] = [];
  for (const h of [...a.history, ...b.history].sort((p, q) => p.at.localeCompare(q.at))) {
    const k = h.at + h.ref + h.label; if (!seen.has(k)) { seen.add(k); history.push(h); }
  }
  return {
    ...newer,
    completed: [...new Set([...a.completed, ...b.completed])],
    guideProgress: orMaps(a.guideProgress, b.guideProgress),
    milestones: orMaps(a.milestones, b.milestones),
    lessons, reviews,
    journal: [...journal.values()].sort((p, q) => q.createdAt.localeCompare(p.createdAt)),
    journalDeleted: deleted,
    history: history.slice(-400),
    lastLocation: (a.lastLocation?.at ?? '') >= (b.lastLocation?.at ?? '') ? a.lastLocation : b.lastLocation,
    migratedFrom: [...new Set([...a.migratedFrom, ...b.migratedFrom])],
    approvalsRev: Math.max(a.approvalsRev, b.approvalsRev),
    updatedAt: later(a.updatedAt, b.updatedAt)!,
  };
}

export type SyncDecision = 'take-remote' | 'push-local' | 'merge' | 'nothing';
/** What to do, given the last successful sync time. */
export function decide(localUpdatedAt: string, remoteUpdatedAt: string | null, lastSyncedAt: string | null): SyncDecision {
  if (!remoteUpdatedAt) return 'push-local';
  const localDirty = !lastSyncedAt || localUpdatedAt > lastSyncedAt;
  const remoteChanged = !lastSyncedAt || remoteUpdatedAt > lastSyncedAt;
  if (localDirty && remoteChanged) return 'merge';
  if (remoteChanged) return 'take-remote';
  if (localDirty) return 'push-local';
  return 'nothing';
}
