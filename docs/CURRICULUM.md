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

## Audit items and their defaults

All 26 items are in **Audit & decisions** with Approve / Pending / Reject. Defaults:

- **Approved by the build brief:** C1–C5 (the five new projects → 40 required) and F1 (the three widgets).
- **Pending (everything else):** A1–A3, B1–B10, X1, D1, E1–E3, F2.

What approving does (nothing rewrites original text):

| Item type | Effect when approved |
|---|---|
| C1–C5 | Project appears as a specification (summary + oracles) in the revised order; its prerequisite-edge changes apply (s1p1 ← s1p6, s4p4 ← s4p8, s5p2 ← s5p7). |
| B*, X1, D1, A1/A3 fixes | The audit's text for that project appears as **required additions** with their own checkboxes under *Tests & finish*. |
| E1 | The eight decorative visual milestones are labelled optional (s0p4's third dial is already an extension, so nothing changes there). |
| E2 | Roadmaps show the revised pacing (3.5 y / 2.3 y / 16 months). |
| E3 | Specialisation track cards appear in Curriculum (not counted). |
| F2 | Fourier / elliptic PDEs / floating point / Bayesian rows and the Verification timeline item appear in Roadmaps. |

Item **X1** was added because Part 3 of the audit proposes changes for s0p3, s1p2, s2p1, s2p2 and s5p4 that its Part 5 approval list does not mention. They are kept separate so you can decide them explicitly.

## Decisions that are still yours (Audit page)

1. Full build guides for the five new projects, or specifications only?
2. Dead 2D guides: delete, or keep behind a toggle?
3. s2p5: real Overpass road edges, or GeoNames relabelled as a proximity graph?
4. s4p5: CHIRPS NetCDF via xarray, or NASA POWER grid with the spec rewritten?
5. Accept the revised pacing, or cut Essential items to hold two years?

## Not built yet (deliberately)

- **Build guides for s1p6, s2p6, s4p8, s4p9, s5p7.** Each needs numbered test-first steps and every oracle value computed and verified, as the original guides were. Inventing them without that verification would break the curriculum's own standard. The specification pages show the audit's summary and oracles, and link the relevant lab widget.
- **Rewritten guide text for A1 / D1** (e.g. the s5p6 shallow-water rewrite): shown as approved required work, not as rewritten steps, for the same reason.
- **Specialisation-track guides** (the audit itself proposes cards without guides).
- **Server sync / accounts:** the storage adapter is ready; see `ARCHITECTURE.md`.
- **Cached fallback data files (A3)** for disease.sh / Open Topo Data / Overpass: these need the actual data snapshots, which are not in the source documents.
