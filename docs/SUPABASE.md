# Accounts and sync with Supabase (optional, free)

Without this, progress lives in one browser. With it, you sign in on any device and your progress,
journal, lessons, reviews and settings follow you.

## One-time setup (about 10 minutes)

1. Go to <https://supabase.com>, sign up, and click **New project**. Pick any name, a strong
   database password, and the region closest to you. Wait until it says the project is ready.
2. In the project, open **SQL Editor → New query**, paste the whole of `supabase/schema.sql` from
   this repository, and click **Run**. It creates one table and the rules that keep your row private.
3. Open **Authentication → URL Configuration** and set **Site URL** to your app address,
   for example `https://stephanetchatchum.github.io/computational-science-lab/`.
4. Optional, for a personal app: **Authentication → Providers → Email** and turn off
   **Confirm email**, so you can sign in straight away.
5. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key.

## Connect the app — choose one

- **Quick:** in the app go to **Settings & account → Account and sync**, paste the two values, click
  **Connect**, then **Create account** (first time) or **Sign in**. You do this once per browser.
- **Built in (every device, no pasting):** in your GitHub repository go to **Settings → Secrets and
  variables → Actions → Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  The deploy workflow passes them into the build.

The anon key is meant to be public; it can only do what the row-level-security rules in
`schema.sql` allow, which is reading and writing your own row after you sign in.

## How syncing decides

- Changes are pushed about 3 seconds after you make them, and pulled when you come back to the tab.
- If only one side changed since the last sync, that side wins (so un-ticking a step syncs too).
- If both changed (for example, offline on two devices), the copies are merged: completions, ticks,
  notes and lessons are combined, deleted notes stay deleted, and settings come from the newer copy.
