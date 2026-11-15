# Architecture

## Stack and why

| Choice | Reason |
|---|---|
| **Vite + React 18 + TypeScript** | A static SPA is enough: there is no server-side data yet. Next.js would add a server runtime and SSR concerns (canvas widgets are browser-only) without benefit. Vite gives fast builds and Vitest. |
| **react-router (HashRouter)** | Works from any static host and any sub-path (GitHub Pages) with no rewrite rules; deep links survive reloads. |
| **Original canvas engine, not Three.js/Plotly** | The 26 original widgets already render correctly on a lightweight 2D canvas engine (`makeCtx`/`buildViz`). Re-implementing them in a charting library would risk scientific regressions and add ~1–3 MB. The three new widgets use the same engine so all 29 look and behave alike. The audit explicitly recommends *no new rendering*. |
| **Plain CSS with design tokens** | One stylesheet with CSS variables (dark/light), no utility-class build step. |
| **localStorage behind an adapter** | Works offline, no account. `StorageAdapter` (`get`/`set`) isolates storage so a server backend can replace it. |

## Content vs. logic

```
original HTML ──scripts/extract.py──▶ src/content/legacy/*.js   (verbatim content + widget engine, 3 marked PATCHes)
                                         │
src/content/audit.ts  ───────────────────┤   audit encoded as data (items, findings, revisions, new projects, decisions)
                                         ▼
src/content/curriculum.ts   buildProjects(approvals) → effective curriculum (pure, tested)
src/content/lessons.ts      lesson layer per widget (question, prediction, recall card)
                                         ▼
src/pages/*  (UI only; no curriculum text is hard-coded in components)
```

The PATCHes in the extracted code: (1) keep the nine 2D guides that the Ursina versions overwrite (`GUIDES_2D`), (2) let the app's reduced-motion setting pause widgets and add a teardown hook so widgets do not leak listeners in a single-page app, (3) pass guide progress in from the app instead of reading `localStorage` directly.

## State

`AppState` (versioned, `cslab_state_v1`):

- `completed`, `guideProgress` — **same shapes and ids as the original app** (`{ s0p1: { s0: true, d2: true }, setup: {...} }`), mirrored back to the original keys on every save.
- `milestones` (spec milestones and approved audit additions), `lessons`, `reviews`, `journal`, `history`, `lastLocation`, `plan`, `approvals`, `decisions`, `settings`, `migratedFrom`.
- `sanitize()` accepts any JSON and returns a valid state (never throws); `mergeLegacy()` is a union merge used for migration and imports.

### Adding a database and authentication later

1. Implement `StorageAdapter` against your backend (e.g. Supabase/Postgres row per user holding the JSON document, or normalised tables keyed by the same ids).
2. Make `load`/`save` async in `AppStateProvider` (load once after sign-in; debounce saves).
3. Conflict policy: reuse `mergeLegacy` (union of completions/ticks) and last-write-wins for settings/journal entries by `updatedAt`.
4. Keep the export/import JSON as the migration path between devices.

## Error handling

- Top-level and per-page error boundaries (project and lesson pages) show a recovery screen; progress is unaffected.
- Widgets that fail to start show a message instead of breaking the page.
- Save failures (quota, private mode) show a banner suggesting a backup.
- Audit approvals that would create a prerequisite cycle are refused.

## Accessibility

Keyboard-reachable controls, visible focus rings, skip link, ARIA labels on icon buttons, `aria-pressed`/`aria-selected` states, text scaling, reduced motion, light theme, read-aloud (Web Speech API) with line highlighting. The canvases are visual instruments; every widget also shows its key numbers as text in the stats row.

## Tests (`npm test`)

- `numerics.test.ts` — stability functions (Euler disc, RK4 limits −2.785 and 2√2, A-stability), the audit's stiff test (RK4 blows up at Δt = 0.1, backward Euler does not), FFT vs DFT, Parseval < 1e-10, annual peak at 1/365 d⁻¹, measured orders 1/2/2/4/1/4, round-off floor, Richardson.
- `widgets.test.ts` — all 29 widgets run headless through init/step/draw/stats at every slider extreme.
- `curriculum.test.ts` — the 35 ids and order, every guide intact, 2D guides preserved, all widget references resolve, overlay with nothing approved equals the original exactly, 40-project revised order, prerequisite edges, no cycles, demotions point at real milestones, workload arithmetic, markup escaping.
- `store.test.ts` — migration, mirroring, union merge, corrupt storage, both import formats, spaced-review intervals.
- `app.test.tsx` — every route renders, all 40 project workspaces open, ticking a step persists to both keys, completion flow, lesson flow, reversible audit approval, journal linking.

## v2 additions

- **Effective guides** (`src/content/guides.ts`): original guide + approved patches + added steps + visuals. Keys: `s0` setup, `s1…sN` original steps, `a:<item>-<name>` added steps, `s(N+1)` git, `d0…` finish checks. Ticks saved under the original app's keys therefore never move.
- **Step visuals** (`src/lab/stepWidgets.ts`): the same canvas engine as the original widgets; a step can show the original demo and a new one behind small tabs. Presets start sliders at the right values.
- **Read-aloud** (`src/lib/reader.ts`): the original reader ported — line and word highlight, spoken commands, Skip code, voice and speed in the bar.
- **Sync** (`src/sync/`): Supabase email + password auth (PKCE). `decide()` takes the remote copy, pushes the local one, or merges (`mergeStates`: union of completions/ticks/notes, tombstones for deleted notes, newer settings) based on what changed since the last sync.
- **Data snapshots**: `scripts/fetch_data.py` runs on GitHub's servers (`data-snapshots.yml`), writes `data/snapshots/` + `manifest.json` (source, time, size, SHA-256).
