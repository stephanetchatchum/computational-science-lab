/**
 * Persistent learner state.
 *
 * - One versioned JSON document under `cslab_state_v1`.
 * - On first load it MIGRATES the original HTML app's keys (completed projects and step ticks),
 *   and on every load it merges them in (union, never deleting), so nothing already earned is lost.
 * - Every save mirrors `completed` and step ticks back to the original keys, so the original
 *   HTML file opened from the same origin still sees the same progress.
 * - Storage goes through a small adapter so a server/database backend can replace localStorage
 *   without touching the UI (see docs/ARCHITECTURE.md).
 */
import { defaultApprovals, type Approvals } from '../content/curriculum';

export const STATE_KEY = 'cslab_state_v1';
export const LEGACY_KEYS = { completed: 'compsci_curriculum_progress_v2', steps: 'cs_guide_progress_v1', theme: 'compsci_curriculum_theme', os: 'cs_os' } as const;

export type JournalKind = 'derivation' | 'question' | 'discovery' | 'debugging' | 'observation' | 'reflection' | 'idea' | 'parked';
export interface JournalEntry { id: string; kind: JournalKind; title: string; body: string; ref?: { type: 'project' | 'lesson' | 'step'; id: string; label: string; step?: number }; createdAt: string; updatedAt: string; pinned?: boolean }
export interface LessonRecord { firstVisit: string; prediction?: { choice: number; correct: boolean; at: string }; experimented?: boolean; explanation?: string; completedAt?: string }
export interface ReviewCard { due: string; intervalDays: number; reps: number; lapses: number; last?: string }
export interface HistoryItem { at: string; kind: 'step' | 'project' | 'lesson' | 'milestone' | 'journal' | 'review' | 'visit'; ref: string; label: string }
export interface Settings {
  theme: 'dark' | 'light'; textScale: number; reducedMotion: boolean; focusMode: boolean;
  assistance: 'full' | 'guided' | 'independent'; os: 'unix' | 'win';
  session: { minutes: number; breakMinutes: number }; tts: { rate: number; voice: string | null; skipCode: boolean };
  showProposed: boolean;
}
export interface AppState {
  version: 1;
  completed: string[];
  /** same shape as the original app: { [projectId|'setup']: { s0: true, d2: true } } */
  guideProgress: Record<string, Record<string, boolean>>;
  milestones: Record<string, Record<string, boolean>>;
  lessons: Record<string, LessonRecord>;
  reviews: Record<string, ReviewCard>;
  journal: JournalEntry[];
  history: HistoryItem[];
  lastLocation: { path: string; label: string; at: string } | null;
  approvals: Approvals;
  decisions: Record<string, string>;
  settings: Settings;
  migratedFrom: string[];
  /** if–then plan for the next session */
  plan: { when: string; then: string } | null;
  /** 2 = all audit items approved by the learner (15 Nov 2026) */
  approvalsRev: number;
  /** ISO time of the last local change (used by sync) */
  updatedAt: string;
  /** ids of deleted journal entries, so a sync never brings them back */
  journalDeleted: string[];
}

export const defaultSettings = (): Settings => ({
  theme: 'dark', textScale: 1, reducedMotion: false, focusMode: false, assistance: 'guided', os: 'unix',
  session: { minutes: 0, breakMinutes: 5 }, tts: { rate: 1, voice: null, skipCode: false }, showProposed: true,
});

export const emptyState = (): AppState => ({
  // decisions: Decision 1 answered 'full guides' by the learner

  version: 1, completed: [], guideProgress: {}, milestones: {}, lessons: {}, reviews: {}, journal: [], history: [],
  lastLocation: null, approvals: defaultApprovals(), decisions: { guides: 'full' }, settings: defaultSettings(), migratedFrom: [], plan: null, approvalsRev: 2, updatedAt: new Date(0).toISOString(), journalDeleted: [],
});

export interface StorageAdapter { get(key: string): string | null; set(key: string, value: string): void }
export const memoryStorage = (init: Record<string, string> = {}): StorageAdapter & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, get: k => (k in data ? data[k] : null), set: (k, v) => { data[k] = v; } };
};
export const browserStorage = (): StorageAdapter => ({
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* quota or private mode: state stays in memory */ } },
});

function parse<T>(raw: string | null): T | null { if (!raw) return null; try { return JSON.parse(raw) as T; } catch { return null; } }
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Make any parsed object safe to use: fill defaults, drop wrong types. Never throws. */
export function sanitize(input: unknown): AppState {
  const base = emptyState();
  if (!isObj(input)) return base;
  const s = input as Partial<AppState>;
  const strArr = (v: unknown) => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
  const boolMap = (v: unknown) => {
    const out: Record<string, Record<string, boolean>> = {};
    if (isObj(v)) for (const [k, m] of Object.entries(v)) if (isObj(m)) { out[k] = {}; for (const [kk, b] of Object.entries(m)) if (typeof b === 'boolean') out[k][kk] = b; }
    return out;
  };
  return {
    version: 1,
    completed: [...new Set(strArr(s.completed))],
    guideProgress: boolMap(s.guideProgress),
    milestones: boolMap(s.milestones),
    lessons: isObj(s.lessons) ? (s.lessons as AppState['lessons']) : {},
    reviews: isObj(s.reviews) ? (s.reviews as AppState['reviews']) : {},
    journal: Array.isArray(s.journal) ? s.journal.filter(e => isObj(e) && typeof (e as JournalEntry).id === 'string') as JournalEntry[] : [],
    history: Array.isArray(s.history) ? (s.history as HistoryItem[]).slice(-400) : [],
    lastLocation: isObj(s.lastLocation) ? (s.lastLocation as AppState['lastLocation']) : null,
    approvals: { ...base.approvals, ...(isObj(s.approvals) ? (s.approvals as Approvals) : {}) },
    decisions: isObj(s.decisions) ? (s.decisions as Record<string, string>) : {},
    settings: { ...base.settings, ...(isObj(s.settings) ? (s.settings as Settings) : {}),
      session: { ...base.settings.session, ...(isObj(s.settings) && isObj((s.settings as Settings).session) ? (s.settings as Settings).session : {}) },
      tts: { ...base.settings.tts, ...(isObj(s.settings) && isObj((s.settings as Settings).tts) ? (s.settings as Settings).tts : {}) } },
    migratedFrom: strArr(s.migratedFrom),
    approvalsRev: typeof s.approvalsRev === 'number' ? s.approvalsRev : 1,
    updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : new Date(0).toISOString(),
    journalDeleted: strArr(s.journalDeleted),
    plan: isObj(s.plan) && typeof (s.plan as { when?: unknown }).when === 'string' ? (s.plan as AppState['plan']) : null,
  };
}

/** Union-merge legacy progress into the state. Never removes anything. */
export function mergeLegacy(state: AppState, legacyCompleted: unknown, legacySteps: unknown, source: string): AppState {
  const next = { ...state, completed: [...state.completed], guideProgress: { ...state.guideProgress } };
  let touched = false;
  if (Array.isArray(legacyCompleted)) for (const id of legacyCompleted) if (typeof id === 'string' && !next.completed.includes(id)) { next.completed.push(id); touched = true; }
  if (isObj(legacySteps)) for (const [pid, m] of Object.entries(legacySteps)) {
    if (!isObj(m)) continue;
    const cur = { ...(next.guideProgress[pid] || {}) };
    for (const [k, v] of Object.entries(m)) if (v === true && cur[k] !== true) { cur[k] = true; touched = true; }
    next.guideProgress[pid] = cur;
  }
  if (touched && !next.migratedFrom.includes(source)) next.migratedFrom = [...next.migratedFrom, source];
  return next;
}

export function load(storage: StorageAdapter): AppState {
  let state = sanitize(parse(storage.get(STATE_KEY)));
  const firstRun = storage.get(STATE_KEY) === null;
  state = mergeLegacy(state, parse(storage.get(LEGACY_KEYS.completed)), parse(storage.get(LEGACY_KEYS.steps)), 'original-html (same browser)');
  if (state.approvalsRev < 2) {           // learner approved every audit item on 15 Nov 2026
    state = { ...state, approvalsRev: 2, approvals: defaultApprovals(), decisions: { guides: 'full', ...state.decisions } };
  }
  if (firstRun) {
    const th = storage.get(LEGACY_KEYS.theme); if (th === 'light' || th === 'dark') state.settings.theme = th;
    const os = storage.get(LEGACY_KEYS.os); if (os === 'win' || os === 'unix') state.settings.os = os;
    const voice = storage.get('cs_voice'), rate = parseFloat(storage.get('cs_rate') ?? '');
    state.settings.tts = { ...state.settings.tts, ...(voice ? { voice } : {}), ...(rate ? { rate } : {}), ...(storage.get('cs_skip') === '1' ? { skipCode: true } : {}) };
  }
  return state;
}

export function save(storage: StorageAdapter, state: AppState) {
  storage.set(STATE_KEY, JSON.stringify(state));
  // mirror into the original app's keys so both stay in step
  storage.set(LEGACY_KEYS.completed, JSON.stringify(state.completed));
  storage.set(LEGACY_KEYS.steps, JSON.stringify(state.guideProgress));
}

/** Import: accepts a full export from this app, or the original app's two keys. */
export function importData(state: AppState, text: string): { state: AppState; message: string } {
  const data = parse<Record<string, unknown>>(text);
  if (!isObj(data)) throw new Error('That is not valid JSON.');
  if (data.version === 1 && 'settings' in data) {
    const incoming = sanitize(data);
    const merged = mergeLegacy(incoming, state.completed, state.guideProgress, 'import');
    return { state: merged, message: `Imported a full backup (${incoming.completed.length} completed projects, ${incoming.journal.length} journal entries). Your current completions were kept as well.` };
  }
  const lc = data[LEGACY_KEYS.completed], ls = data[LEGACY_KEYS.steps];
  if (lc === undefined && ls === undefined) throw new Error('No progress found. Expected a backup from this app or the two keys from the original HTML.');
  const decode = (v: unknown) => (typeof v === 'string' ? parse(v) : v);
  const next = mergeLegacy(state, decode(lc), decode(ls), 'original-html (import)');
  const added = next.completed.length - state.completed.length;
  return { state: next, message: `Merged progress from the original HTML: ${added} new completed project(s); step ticks merged. Nothing was removed.` };
}

export const exportData = (state: AppState) => JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);

/** Snippet to paste in the original HTML file's DevTools console to copy its progress. */
export const LEGACY_EXPORT_SNIPPET = `copy(JSON.stringify({ "${LEGACY_KEYS.completed}": localStorage.getItem("${LEGACY_KEYS.completed}"), "${LEGACY_KEYS.steps}": localStorage.getItem("${LEGACY_KEYS.steps}") }))`;

/* ---------- spaced review (expanding intervals) ---------- */
const DAY = 86_400_000;
export const INTERVALS = [1, 3, 7, 16, 35, 75];
export function scheduleReview(card: ReviewCard | undefined, result: 'good' | 'again', now = Date.now()): ReviewCard {
  const c = card ?? { due: new Date(now).toISOString(), intervalDays: 0, reps: 0, lapses: 0 };
  if (result === 'again') return { ...c, intervalDays: 1, reps: 0, lapses: c.lapses + 1, due: new Date(now + DAY).toISOString(), last: new Date(now).toISOString() };
  const reps = c.reps + 1, intervalDays = INTERVALS[Math.min(reps - 1, INTERVALS.length - 1)];
  return { ...c, reps, intervalDays, due: new Date(now + intervalDays * DAY).toISOString(), last: new Date(now).toISOString() };
}
export const dueReviews = (s: AppState, now = Date.now()) => Object.entries(s.reviews).filter(([, c]) => new Date(c.due).getTime() <= now).map(([id]) => id);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export function pushHistory(s: AppState, item: Omit<HistoryItem, 'at'>): HistoryItem[] {
  return [...s.history, { ...item, at: new Date().toISOString() }].slice(-400);
}
