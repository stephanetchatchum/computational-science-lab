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
| 3 | ✅ | ✅ s3p1 (B1 stiffness + backward Euler, B8 the 15 derived), s3p2 (B2 leapfrog over 1000 orbits, A1 Kepler text), s3p3 (B6 R_eff + Poisson fit, A3 OWID data), s3p4 (B8 Jacobian and period), s3p5 (B9 hourly data + real gradient descent, E1 optional ball) | — |
| 4 | ✅ | ✅ s4p1 (B1 implicit + Thomas, Richardson order; B8 von Neumann), s4p2 (B8 numerical diffusion, Péclet; A4 impossible check fixed), s4p3 (B7 Gillespie; A1 GeoNames), s4p4 (B5 sparse 2000-node bridge; A4 singular trusses fixed), s4p5 (B6 ties, prewhitening, Benjamini–Hochberg; B5 EOF; A1 + Decision 4), s4p6 (B8 2D CFL), s4p7 (B8 Turing analysis) | ✅ s4p8 Poisson + iterative solvers, ✅ s4p9 Ising |
| 5 | ✅ | ✅ s5p1 (B2 symplectic, B4 C kernel via ctypes, B3 Barnes–Hut; A4 disc speed + numba timing), s5p2 (C5 posterior + predictive checks, B4 mpi4py, E1 optional; A4 median curve), s5p3 (B1 LOD implicit heat), s5p4 (X1 optional GP surrogate), s5p5 (E1 optional), s5p6 (D1 rewrite: Rusanov shallow water, Ritter dam-break check, 2D flood in real seconds) | ✅ s5p7 Bayesian SEIR by MCMC |
| 6 | original demos only | shown as checkboxes | — |

Every new expected value is recomputed by `scripts/verify_oracles.py`. From Stage 3 on, `scripts/verify_guides.sh` also extracts the exact pytest files from the guides and runs them against reference solutions in `scripts/reference/` (both run in CI). The "N passed" finish check is computed from the tests actually in the guide.

## Remaining decisions (Audit page)

2. Dead 2D guides: delete, or keep behind a toggle?
3. s2p5: **decided (by Claude, at your request): keep GeoNames, labelled honestly as a proximity graph.** The spec text was rewritten under A1.
4. s4p5: **decided (by Claude, at your request): keep the NASA POWER grid and rewrite the spec** when Stage 4 is built.
5. Accept the revised pacing, or cut Essential items to hold two years?

Reasons are shown on the Audit page. Every decision can still be changed there.

## Still to build (next stages)

- Step visuals and rewritten steps for Stages 5–6, one stage at a time, same method as Stages 0–4.
- The full guide for s5p7 (Stage 5), with verified expected values.
- The s5p6 shallow-water rewrite (D1).

## Errors found in the original guides (audit item A4)

`scripts/verify_guides.sh` extracts the exact pytest files a learner builds from every guide (Stages 0–5, all audit items approved) and runs them against reference solutions in `scripts/reference/`, written to follow each guide literally. All 37 projects pass (242 tests). Getting there found these errors in the original guides, all corrected under A4:

| Project | Problem | Fix |
|---|---|---|
| s0p2 | Test calls `simulate(…, phi=90)`; the guide names the argument `phi_deg` | Test uses `phi_deg` |
| s0p4 | The fifth test was described in words only | Written out as code |
| s1p3 | Damped energy falls below 0.05 after ~8 s, not ~20 s | Expected text corrected |
| s2p1 | “2 passed” after the naive solver, but the test file cannot import yet | Expected text corrected |
| s2p2 | Half-width of the sinc integral is ~0.002, not ~0.0008 | Expected text corrected |
| s2p4 | Toy-matrix stationary shares are 0.65, 0.24, 0.11, not 0.58, 0.28, 0.14 | Expected text corrected |
| s4p2 | “variance < 0.35” is impossible: upwind’s own smear gives exactly 0.74 | Bound relaxed; the B8 step predicts 0.74 |
| s4p4 | Hand truss and 3D bridge are mechanisms (singular stiffness matrix) | Node 2 locked in z; three sway braces |
| s5p1 | Disc velocity 0.6·√ρ is ~3.6× too fast: the disc flies apart (median radius 3.3 → 10.4) | Circular-orbit speed √(m_inside/ρ); radius stays near 3.3 |
| s5p1 | Numba promised “hundreds of times faster” with the loop copied exactly; measured ~40× over Python (python ~550 ms, numpy ~13, copied numba ~14; scalar-loop numba ~0.5) | Expected text gives measured timings |
| s5p2 | Fan-chart median curve peaks near 0.27, not 0.30 (0.30 is the median of the 500 peaks; runs peak on different days) | Expected text corrected |

Not yet checked this way: the nine optional “2D version” guides (Decision 2), and Stage 6 (to be done when it is built).

Two promises in the audit's new-project specs were also corrected after measurement: CG on the Poisson problem takes about 1.6N iterations (not ≤ N), and the checkerboard Metropolis sweep is wrong on a 2 × 2 lattice (it is checked on 4 × 4 instead).
