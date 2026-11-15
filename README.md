# Computational Science Lab

A personal learning environment built from the **Computational Science Curriculum** (8 stages, project build guides, live numerical experiments) and its **Scientific Audit** (Nov 2026).

It is a static single-page app: no server, no account. Progress lives in your browser and can be exported/imported as JSON.

## What is inside

| Area | What it does |
|---|---|
| **Today** (dashboard) | One next action, resume-where-you-stopped, an optional if–then plan, current objectives, stage map, validation ladder, due reviews, recent activity |
| **Curriculum** | All 8 stages: what you learn, why it matters, prerequisites, workload (summed from project estimates), skills, every project with status/lock, search and filters |
| **Project workspace** | Overview + live “play with the idea first” widget · numbered test-first build guide (OS-specific commands, per-step widgets, hints, code behind “reveal” in guided mode) · validation oracles and finish checklist · stuck table · concepts and glossary · audit findings · linked notes and reflection · Markdown export |
| **Concept lab** | The original 26 widgets + 3 audit widgets (integrator stability regions, FFT spectrum explorer, live convergence-order plot), each as a lesson: question → prediction → experiment → explanation → equation → where you implement it → explain-it-back → connection |
| **Review** | Spaced retrieval of lesson key ideas (1, 3, 7, 16, 35, 75 days) |
| **Journal** | Derivations (monospace), questions, discoveries, debugging lessons, observations, reflections, experiment ideas, parked thoughts — each linked to a lesson/project/step; search, filter, Markdown export |
| **Audit & decisions** | Every audit recommendation as approve / pending / reject, the five open decisions, and the project-level findings table. Nothing is applied silently |
| **Settings & data** | Dark/light, text size, reduced motion, focus mode, assistance level, OS, optional session timer, read-aloud voice/speed, backup/restore, import from the original HTML, reset |

## Run it locally

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 130 tests: numerics, widgets, curriculum integrity, persistence, UI flows
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/
```

## Deploy

The build uses relative paths and hash routing, so `dist/` works from any sub-path with no server config.

**GitHub Pages (included):** push to `main`, then in the repository go to *Settings → Pages → Build and deployment → Source: GitHub Actions*. `.github/workflows/deploy.yml` runs the tests, builds and publishes. `ci.yml` runs tests on every pull request.

**Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output directory `dist`.

## Your existing progress

Browsers keep storage per website, so the original HTML file (opened from disk) and this app (on its own address) cannot read each other's storage.

- **Same browser + same address:** the app reads the original keys (`compsci_curriculum_progress_v2`, `cs_guide_progress_v1`) on every load and merges them (union — never removes), and writes them back, so both stay in step.
- **Different address (the normal case after deploying):** *Settings → Bring progress from the original HTML file* gives a one-line snippet to run in the original file's browser console; paste the result into the box. It merges; nothing is lost.
- **Backups:** *Settings → Download a full backup* (JSON). Restoring merges completions with what is already there.

## Repository layout

```
original/computational-science-curriculum.html   your original file (source of truth for migrated content)
scripts/extract.py                                re-extracts it into src/content/legacy/ (byte-identical output)
scripts/research_md.py                            regenerates docs/RESEARCH.md from src/content/research.json
src/content/legacy/        curriculum.js, viz.js, guideExtras.js — original content and widget engine (+ .d.ts types)
src/content/audit.ts       the audit as data: items, findings, revisions, new projects, decisions
src/content/curriculum.ts  effective curriculum = original + approved audit items (pure functions)
src/content/lessons.ts     lesson layer for the 29 widgets
src/lab/newWidgets.ts      the three audit widgets
src/lib/numerics/          stability, FFT, convergence — unit-tested
src/state/                 versioned persistence, migration, spaced review, React context
src/pages, src/components  UI
tests/                     Vitest suites
docs/                      ARCHITECTURE.md, CURRICULUM.md (migration + decisions + what remains), RESEARCH.md
```

See `docs/CURRICULUM.md` for exactly what was migrated, what the audit changes do, and what is not built yet.
