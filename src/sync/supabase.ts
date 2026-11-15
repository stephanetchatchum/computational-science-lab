/**
 * Optional account + sync through Supabase (free tier). Off until a project URL and anon key exist,
 * either at build time (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) or entered in Settings.
 * The anon key is designed to be public; Row Level Security in supabase/schema.sql keeps each
 * learner's row private.
 */
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { sanitize, type AppState } from '../state/store';
import { decide, mergeStates } from './merge';

const CFG_KEY = 'cslab_supabase_cfg';
const META_KEY = 'cslab_sync_meta';
export interface SyncConfig { url: string; key: string }

export function getConfig(): SyncConfig | null {
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) return { url: env.VITE_SUPABASE_URL, key: env.VITE_SUPABASE_ANON_KEY };
  try { const c = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); return c?.url && c?.key ? c : null; } catch { return null; }
}
export const configFromBuild = () => !!(import.meta.env as Record<string, string | undefined>).VITE_SUPABASE_URL;
export function setConfig(c: SyncConfig | null) { if (c) localStorage.setItem(CFG_KEY, JSON.stringify(c)); else localStorage.removeItem(CFG_KEY); client = null; }

let client: SupabaseClient | null = null;
export function sb(): SupabaseClient | null {
  const c = getConfig(); if (!c) return null;
  if (!client) client = createClient(c.url, c.key, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } });
  return client;
}

const meta = (uid: string): { lastSyncedAt: string | null } => { try { return JSON.parse(localStorage.getItem(META_KEY) || '{}')[uid] ?? { lastSyncedAt: null }; } catch { return { lastSyncedAt: null }; } };
const setMeta = (uid: string, m: { lastSyncedAt: string }) => { let all: Record<string, unknown> = {}; try { all = JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { /* reset */ } all[uid] = m; localStorage.setItem(META_KEY, JSON.stringify(all)); };
export const isDirty = (s: AppState, uid: string) => { const m = meta(uid).lastSyncedAt; return !m || s.updatedAt > m; };

export async function currentUser(): Promise<User | null> { const c = sb(); if (!c) return null; const { data } = await c.auth.getSession(); return data.session?.user ?? null; }
export async function signUp(email: string, password: string) { const c = sb()!; const { error, data } = await c.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } }); if (error) throw error; return data; }
export async function signIn(email: string, password: string) { const { error } = await sb()!.auth.signInWithPassword({ email, password }); if (error) throw error; }
export async function signOut() { await sb()?.auth.signOut(); }

/** Pull, decide, push. Returns the state the app should now hold. */
export async function syncNow(local: AppState): Promise<{ state: AppState; action: string }> {
  const c = sb(); const user = await currentUser();
  if (!c || !user) throw new Error('Not signed in.');
  const { data, error } = await c.from('learner_state').select('state, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  const d = decide(local.updatedAt, data?.updated_at ?? null, meta(user.id).lastSyncedAt);
  let next = local;
  if (d === 'take-remote') next = sanitize(data!.state);
  if (d === 'merge') next = mergeStates(local, data!.state);
  if (d === 'push-local' || d === 'merge') {
    const now = new Date().toISOString();
    next = { ...next, updatedAt: next.updatedAt > now ? next.updatedAt : now };
    const { error: e2 } = await c.from('learner_state').upsert({ user_id: user.id, state: next, updated_at: next.updatedAt });
    if (e2) throw e2;
  }
  setMeta(user.id, { lastSyncedAt: next.updatedAt > (data?.updated_at ?? '') ? next.updatedAt : data!.updated_at });
  return { state: next, action: d };
}
