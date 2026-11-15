-- Run once in Supabase → SQL Editor. One row per learner, private to that learner.
create table if not exists public.learner_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.learner_state enable row level security;
create policy "read own state"   on public.learner_state for select using (auth.uid() = user_id);
create policy "insert own state" on public.learner_state for insert with check (auth.uid() = user_id);
create policy "update own state" on public.learner_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
