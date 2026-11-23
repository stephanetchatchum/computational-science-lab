import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppState } from '../state/store';
import { currentUser, getConfig, isDirty, sb, syncNow } from './supabase';

export interface SyncApi {
  configured: boolean; user: User | null; status: 'off' | 'signed-out' | 'syncing' | 'synced' | 'error';
  error: string | null; lastSync: string | null; now: () => Promise<void>; refresh: () => void;
}

/** Keeps the local state and the learner's Supabase row in step: on sign-in, on focus, and 3 s after changes. */
export function useSync(state: AppState, replace: (s: AppState) => void): SyncApi {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SyncApi['status']>(getConfig() ? 'signed-out' : 'off');
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const stateRef = useRef(state); stateRef.current = state;
  const busy = useRef(false);

  const now = useCallback(async () => {
    if (busy.current) return; busy.current = true; setStatus('syncing'); setError(null);
    try {
      const { state: next, action } = await syncNow(stateRef.current);
      if (action === 'take-remote' || action === 'merge') replace(next);
      setStatus('synced'); setLastSync(new Date().toISOString());
    } catch (e) { setStatus('error'); setError(e instanceof Error ? e.message : String(e)); }
    finally { busy.current = false; }
  }, [replace]);

  useEffect(() => {
    const c = sb(); if (!c) { setStatus('off'); setUser(null); return; }
    let alive = true;
    currentUser().then(u => { if (!alive) return; setUser(u); setStatus(u ? 'syncing' : 'signed-out'); if (u) now(); });
    const { data } = c.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); if (session?.user) now(); else setStatus('signed-out'); });
    const onFocus = () => { if (user) now(); };
    window.addEventListener('focus', onFocus); window.addEventListener('online', onFocus);
    return () => { alive = false; data.subscription.unsubscribe(); window.removeEventListener('focus', onFocus); window.removeEventListener('online', onFocus); };
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !isDirty(state, user.id)) return;
    const t = setTimeout(() => { now(); }, 3000);
    return () => clearTimeout(t);
  }, [state.updatedAt, user, now]); // eslint-disable-line react-hooks/exhaustive-deps

  return { configured: !!getConfig(), user, status, error, lastSync, now, refresh: () => setTick(t => t + 1) };
}
