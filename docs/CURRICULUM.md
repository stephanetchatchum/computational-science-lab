# Curriculum migration, audit decisions, and what remains

## Migrated from the original HTML (verbatim)

| Content | Count | Where in the app |
|---|---|---|
| Stages (name, tagline, summary) | 8 | Curriculum, dashboard stage map |
| Project specifications (all fields: context, explain, first win, problem, deliverable, data source, milestones, validation, tools, extensions, concepts) | 35 | Project workspace tabs |
| Build guides (slug, packages, file tree, glossary, numbered steps with why/do/run/see/hint/code, finish checklist, stuck table) | 35 active (9 Ursina 3D) | Build guide / Tests & finish / If stuck tabs |
| 2D pygame guides overwritten by the 3D versions | 9 (kept, hidden unless Decision 2 = toggle) | “2D version” switch |
| Setup page (install steps, rules, templates, Python/Git survival kits, troubleshooting) | 1 | Setup |
| Concept-lab widgets and sections | 26 widgets, 12 sections | Concept lab, lessons, project steps |
| Widget placements (“Play with the idea first” + per-step demos) | all | Project overview and build steps |
| Capstone (primary + 3 alternatives) | 1 | Capstone |
| Subject roadmaps + methodology timeline + pacing cards | all | Roadmaps |
| Markdown export of a guide | all | “Download guide (.md)” |
| Read-aloud with line highlight, Space/←/→/Esc, double-click to start, Skip code, A−/A+ | yes | ▶ Listen in the top bar, plus per-step Listen |
| Progress keys and ids | `compsci_curriculum_progress_v2`, `cs_guide_progress_v1`, ids `s0p1…s6p3`, step keys `s0…`, check keys `d0…` | unchanged; migrated and mirrored |

Project ids are never renamed. The extraction is reproducible: `python3 scripts/extract.py` regenerates byte-identical modules from `original/`.

One display fix: the original formatter applied `**bold**` inside `{{code}}`, so `vx**2` in code rendered as bold. The app keeps `**` literal inside code.

## Audit items

On 15 Nov 2026 you approved **every** audit recommendation and chose **full build guides** (Decision 1).
Saved progress from before was migrated automatically; nothing was lost. Items can still be switched
off one by one on the Audit page.

Approved changes never overwrite the original. In the build guide they appear as:

- **revised** step cards (with a "Show original text" button), for text fixes such as A1;
- **new step** cards with their own tests (keys `a:…`, so existing ticks never move);
- **optional** labels for the decorative visuals demoted by E1;
- for projects whose stage has not been rewritten yet, as checkboxes under *Tests & finish*.

## Built so far, stage by stage

| Stage | Every step has a visual | Audit changes written as steps | New project guide |
|---|---|---|---|
| 0 | ✅ | ✅ s0p1 (B8 derivation, A1 m/s), s0p2/s0p3 (A1 text), s0p3 (X1 windows), s0p4 (E1 sample variance) | — |
| 1 | ✅ | ✅ s1p1 (B6), s1p2 (X1 ε and best h), s1p3 (A1 fix, B2 semi-implicit), s1p4 (B3 spatial hash) | ✅ s1p6 full guide |
| 2 | ✅ | ✅ s2p1 (X1 flop count), s2p2 (X1 curse of dimensionality), s2p3 (B5 QR vs normal equations), s2p4 (A1 dry spells, E1 optional swarm), s2p5 (B3 shortest paths, E1 optional) | ✅ s2p6 full guide (Fourier, real CO₂ and Kigali data) |
| 3–6 | original demos only | shown as checkboxes | s4p8, s4p9, s5p7 still specifications |

Every new expected value is recomputed by `scripts/verify_oracles.py` (also run in CI).

## Remaining decisions (Audit page)

2. Dead 2D guides: delete, or keep behind a toggle?
3. s2p5: real Overpass road edges, or GeoNames relabelled as a proximity graph?
4. s4p5: CHIRPS NetCDF via xarray, or NASA POWER grid with the spec rewritten?
5. Accept the revised pacing, or cut Essential items to hold two years?

Decisions 3 and 4 decide how the Stage 2 and Stage 4 guides are rewritten.

## Still to build (next stages)

- Step visuals and rewritten steps for Stages 3–6, one stage at a time, same method as Stages 0–2.
- Full guides for s4p8 and s4p9 (Stage 4), s5p7 (Stage 5), with verified expected values.
- The s5p6 shallow-water rewrite (D1).
- Overpass data snapshot, once Decision 3 is made.
