import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { buildProjects, type Project } from '../content/curriculum';
import { setGuideProgress, setOS } from '../content/legacy/guideExtras.js';
import { useSync, type SyncApi } from '../sync/useSync';
import {
  browserStorage, load, save, pushHistory, scheduleReview, uid,
  type AppState, type JournalEntry, type Settings, type StorageAdapter, type HistoryItem,
} from './store';

interface Ctx {
  state: AppState;
  projects: Project[];
  projectById: (id: string) => Project | undefined;
  done: Set<string>;
  update: (fn: (s: AppState) => AppState) => void;
  toggleStep: (pid: string, key: string, label: string) => void;
  toggleMilestone: (pid: string, idx: number | string, label: string) => void;
  setCompleted: (pid: string, value: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  addJournal: (e: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => JournalEntry;
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;
  log: (item: Omit<HistoryItem, 'at'>) => void;
  review: (lessonId: string, result: 'good' | 'again') => void;
  saveError: string | null;
  sync: SyncApi;
}
const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children, storage = browserStorage() }: { children: ReactNode; storage?: StorageAdapter }) {
  const storageRef = useRef(storage);
  const [state, setState] = useState<AppState>(() => load(storageRef.current));
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try { save(storageRef.current, state); setSaveError(null); } catch (e) { setSaveError(String(e)); }
    setGuideProgress(state.guideProgress);
    setOS(state.settings.os);
    (globalThis as Record<string, unknown>).__CSLAB_REDUCED_MOTION__ = state.settings.reducedMotion;
    const root = document.documentElement;
    root.dataset.theme = state.settings.theme;
    root.style.setProperty('--text-scale', String(state.settings.textScale));
    root.classList.toggle('reduce-motion', state.settings.reducedMotion);
  }, [state]);

  // keep tabs in sync if the app is open twice
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === 'cslab_state_v1' && e.newValue) setState(load(storageRef.current)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(s => { const n = fn(s); return n === s ? s : { ...n, updatedAt: new Date().toISOString() }; }), []);
  const replace = useCallback((n: AppState) => setState(n), []);
  const sync = useSync(state, replace);
  const projects = useMemo(() => buildProjects(state.approvals), [state.approvals]);
  const byId = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const done = useMemo(() => new Set(state.completed), [state.completed]);

  const value: Ctx = {
    state, projects, done, update, saveError, sync,
    projectById: id => byId.get(id),
    toggleStep: (pid, key, label) => update(s => {
      const cur = { ...(s.guideProgress[pid] || {}) }; const on = !cur[key]; cur[key] = on;
      return { ...s, guideProgress: { ...s.guideProgress, [pid]: cur }, history: on ? pushHistory(s, { kind: 'step', ref: pid, label }) : s.history };
    }),
    toggleMilestone: (pid, idx, label) => update(s => {
      const cur = { ...(s.milestones[pid] || {}) }; const on = !cur[idx]; cur[idx] = on;
      return { ...s, milestones: { ...s.milestones, [pid]: cur }, history: on ? pushHistory(s, { kind: 'milestone', ref: pid, label }) : s.history };
    }),
    setCompleted: (pid, v) => update(s => {
      const set = new Set(s.completed); if (v) set.add(pid); else set.delete(pid);
      return { ...s, completed: [...set], history: v ? pushHistory(s, { kind: 'project', ref: pid, label: `Completed ${pid}` }) : s.history };
    }),
    setSettings: patch => update(s => ({ ...s, settings: { ...s.settings, ...patch } })),
    addJournal: e => {
      const now = new Date().toISOString();
      const entry: JournalEntry = { ...e, id: uid(), createdAt: now, updatedAt: now };
      update(s => ({ ...s, journal: [entry, ...s.journal], history: pushHistory(s, { kind: 'journal', ref: entry.id, label: entry.title || entry.kind }) }));
      return entry;
    },
    updateJournal: (id, patch) => update(s => ({ ...s, journal: s.journal.map(j => (j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j)) })),
    deleteJournal: id => update(s => ({ ...s, journal: s.journal.filter(j => j.id !== id), journalDeleted: [...s.journalDeleted, id] })),
    log: item => update(s => ({ ...s, history: pushHistory(s, item) })),
    review: (lessonId, result) => update(s => ({ ...s, reviews: { ...s.reviews, [lessonId]: scheduleReview(s.reviews[lessonId], result) }, history: pushHistory(s, { kind: 'review', ref: lessonId, label: `Reviewed ${lessonId} (${result})` }) })),
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside <AppStateProvider>');
  return c;
}
