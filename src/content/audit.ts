/**
 * Scientific Audit of the Computational Science Curriculum (14 Nov 2026) — encoded as data.
 * Every recommendation is an item that starts PENDING unless the build brief already approved it.
 * The app never rewrites original text: approved items are shown as additional required work,
 * new projects, prerequisite edges, demotions and roadmap rows. Everything is reversible in Settings → Audit.
 */

export type ApprovalState = 'approved' | 'rejected' | 'pending';

export interface AuditItem {
  id: string; group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; title: string; detail: string; projects: string[];
  /** default approval: only items the build brief explicitly approved start as approved */
  defaultState: ApprovalState; defaultReason?: string;
}

export const AUDIT_GROUPS: Record<AuditItem['group'], string> = {
  A: 'Hygiene (no scientific judgement needed)',
  B: 'Required milestones added to existing projects',
  C: 'New projects',
  D: 'Rewrite',
  E: 'Rebalancing',
  F: 'Concept lab and roadmaps',
};

const APPROVED_BY_YOU = 'Approved by you on 15 Nov 2026 ("treat all of the audit recommendations as approved").';
const BRIEF_40 = 'Approved by the build brief ("the revised curriculum of approximately 40 required projects"). Build guides are still subject to Decision 1.';

export const AUDIT_ITEMS: AuditItem[] = [
  { id: 'A1', group: 'A', title: 'Align every spec with its guide and fix stale text', defaultState: 'approved', defaultReason: APPROVED_BY_YOU,
    detail: 'Align specs with guides (s2p5, s4p5, s5p3, s5p6, s3p3, s4p3, s2p4 thresholds) and fix stale text (s0p2/s0p3 deliverableWhy, s3p2 Kepler-3 validation sentence, s1p3 "exactly 0.5" note, s6p2 β/γ sentence).',
    projects: ['s2p5', 's4p5', 's5p3', 's5p6', 's3p3', 's4p3', 's2p4', 's0p2', 's0p3', 's3p2', 's1p3', 's6p2'] },
  { id: 'A2', group: 'A', title: 'Dead 2D guide definitions (9 projects)', defaultState: 'approved', defaultReason: APPROVED_BY_YOU,
    detail: 'Delete the nine dead 2D guide definitions that the Ursina blocks overwrite (s0p2, s1p5, s1p4, s3p2, s5p1, s4p1, s4p4, s4p6, s5p6), or keep them behind a "2D version" toggle. See Decision 2.',
    projects: ['s0p2', 's1p5', 's1p4', 's3p2', 's5p1', 's4p1', 's4p4', 's4p6', 's5p6'] },
  { id: 'A3', group: 'A', title: 'Cached fallback files for third-party APIs', defaultState: 'approved', defaultReason: APPROVED_BY_YOU,
    detail: 'Ship a cached fallback CSV path in guides that depend on third-party APIs (disease.sh, Open Topo Data, Overpass).',
    projects: ['s3p3', 's5p6', 's2p5'] },
  { id: 'A4', group: 'A', title: 'Guide tests that could not pass (found while verifying)', defaultState: 'approved', defaultReason: 'Not in the original audit. Found by Claude on 16 Nov 2026 by running every guide test against a reference solution; these are corrections, not new content.',
    detail: 's4p2: pure upwind advection smears the bell to variance 0.74, so the check "variance < 0.35" can never pass (the numerical diffusion vΔx(1−C)/2 explains the 0.74 exactly). s4p4: the hand truss lies in one plane, and the 3D bridge has no sway bracing, so both stiffness matrices are singular and numpy refuses to solve them.',
    projects: ['s4p2', 's4p4'] },
  { id: 'B1', group: 'B', title: 'Implicit methods and stiffness', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Required milestones in s3p1, s4p1, s5p3.', projects: ['s3p1', 's4p1', 's5p3'] },
  { id: 'B2', group: 'B', title: 'Symplectic integration', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 's1p3 semi-implicit Euler, s3p2 leapfrog vs RK4 over 1000 orbits, s5p1 explanation.', projects: ['s1p3', 's3p2', 's5p1'] },
  { id: 'B3', group: 'B', title: 'Algorithms and data structures', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 's1p4 spatial hash, s2p5 BFS/Dijkstra, s5p1 Barnes–Hut.', projects: ['s1p4', 's2p5', 's5p1'] },
  { id: 'B4', group: 'B', title: 'Compiled language and MPI', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 's5p1 C/ctypes kernel, s5p2 mpi4py scaling.', projects: ['s5p1', 's5p2'] },
  { id: 'B5', group: 'B', title: 'Linear algebra depth', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 's2p3 QR and conditioning, s4p4 sparse K, s4p5 EOF/PCA.', projects: ['s2p3', 's4p4', 's4p5'] },
  { id: 'B6', group: 'B', title: 'Statistical rigour', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 's1p1 annual means and bootstrap SE, s4p5 Mann–Kendall corrections and false-discovery control, s3p3 R_eff rename and Poisson likelihood.', projects: ['s1p1', 's4p5', 's3p3'] },
  { id: 'B7', group: 'B', title: 'Gillespie SSA in s4p3', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Gillespie SSA implementation of the single-town SEIR between the ODE and the agent model.', projects: ['s4p3'] },
  { id: 'B8', group: 'B', title: 'Derivation steps (◎ items)', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'One derivation step added to s0p1, s3p1, s3p4, s4p1, s4p2, s4p6, s4p7.', projects: ['s0p1', 's3p1', 's3p4', 's4p1', 's4p2', 's4p6', 's4p7'] },
  { id: 'B9', group: 'B', title: 's3p5: real gradient descent + hourly data', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Real gradient descent on a smoothed cost plus hourly data (or remove the term from concepts — say which).', projects: ['s3p5'] },
  { id: 'B10', group: 'B', title: 'Capstone: uncertainty propagation and skill score', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Forecast uncertainty propagated to the recommendation; backtest reports a proper skill score against the baseline.', projects: ['capstone'] },
  { id: 'X1', group: 'B', title: 'Other Part 3 changes not itemised in the approval list', defaultState: 'approved', defaultReason: APPROVED_BY_YOU,
    detail: 'Part 3 proposes these but Part 5 does not list them: s0p3 fitted r, K uncertainty; s1p2 h-sweep to 1e-12 and machine epsilon; s2p1 flop count and LU reuse; s2p2 trapezoid/Simpson vs Monte Carlo; s5p4 Gaussian-process surrogate (optional → required if time).',
    projects: ['s0p3', 's1p2', 's2p1', 's2p2', 's5p4'] },
  { id: 'C1', group: 'C', title: 's1p6 Floating point and convergence harness', defaultState: 'approved', defaultReason: BRIEF_40, detail: 'New Stage 1 project after s1p2.', projects: ['s1p6'] },
  { id: 'C2', group: 'C', title: 's2p6 Fourier analysis of a climate signal', defaultState: 'approved', defaultReason: BRIEF_40, detail: 'New Stage 2 project after s2p3.', projects: ['s2p6'] },
  { id: 'C3', group: 'C', title: 's4p8 Poisson equation and iterative solvers', defaultState: 'approved', defaultReason: BRIEF_40, detail: 'New Stage 4 project after s4p1.', projects: ['s4p8'] },
  { id: 'C4', group: 'C', title: 's4p9 Ising model, Metropolis Monte Carlo', defaultState: 'approved', defaultReason: BRIEF_40, detail: 'New Stage 4 project after s4p7.', projects: ['s4p9'] },
  { id: 'C5', group: 'C', title: 's5p7 Bayesian calibration by MCMC', defaultState: 'approved', defaultReason: BRIEF_40, detail: 'New Stage 5 project before s5p2.', projects: ['s5p7'] },
  { id: 'D1', group: 'D', title: 's5p6 flood model rewritten as finite-volume shallow water', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Real time units. The DEM download, 3D terrain and conservation tests are kept.', projects: ['s5p6'] },
  { id: 'E1', group: 'E', title: 'Demote eight decorative visual milestones to optional', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'They remain in the guides under an "Optional" label.', projects: ['s0p3', 's0p4', 's2p4', 's2p5', 's3p5', 's5p2', 's5p5', 's6p1'] },
  { id: 'E2', group: 'E', title: 'Update pacing cards (3.5 y / 2.3 y / 16 months) and the project count', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'The honest cost of the essential additions.', projects: [] },
  { id: 'E3', group: 'E', title: 'Optional specialisation track (no build guides yet)', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Robotics/aerospace, computational biology, astrophysics, quantum — shown under a "Specialisation" filter.', projects: [] },
  { id: 'F1', group: 'F', title: 'Three new lab widgets', defaultState: 'approved', defaultReason: 'Explicitly requested in the build brief.', detail: 'Integrator stability region, FFT spectrum, live convergence-order plot.', projects: [] },
  { id: 'F2', group: 'F', title: 'Roadmap rows for Fourier, elliptic PDEs, floating point, Bayesian inference; a Verification item', defaultState: 'approved', defaultReason: APPROVED_BY_YOU, detail: 'Added to the subject roadmaps and the methodology timeline.', projects: [] },
];

/** Part 1 project-level findings (science depth + main issue). */
export const FINDINGS: Record<string, { depth: 'Thin' | 'Adequate' | 'Good' | 'Weak'; issue: string }> = {
  s0p1: { depth: 'Adequate', issue: 'Propagation formula asserted, not derived (first-order Taylor). Strict same-family rule for × and ÷ blocks m/s = m ÷ s.' },
  s0p2: { depth: 'Adequate', issue: 'deliverableWhy text says "a script is right-sized" while type is Ursina 3D (stale copy).' },
  s0p3: { depth: 'Adequate', issue: 'Fit score divides by 1e6 with no justification; no uncertainty on fitted r, K.' },
  s0p4: { depth: 'Thin', issue: 'Statistically light; acceptable as API onboarding.' },
  s1p1: { depth: 'Adequate', issue: 'Slope SE assumes independent residuals; monthly temperature is strongly autocorrelated (seasonal). Should deseasonalise or use annual means.' },
  s1p2: { depth: 'Good', issue: 'Missing: the round-off floor in finite differences (optimal h ≈ √ε). Natural home for floating-point content.' },
  s1p3: { depth: 'Good', issue: '"Stuck" note says semi-implicit Euler keeps energy exactly 0.5. It oscillates boundedly; it is not exact.' },
  s1p4: { depth: 'Adequate', issue: 'O(N²) neighbour search; no spatial hashing.' },
  s1p5: { depth: 'Adequate', issue: 'Fine as software project.' },
  s2p1: { depth: 'Good', issue: 'Missing: operation count O(n³), backward error, why LU beats re-elimination.' },
  s2p2: { depth: 'Good', issue: 'No comparison with deterministic quadrature (trapezoid/Simpson) to motivate when MC wins.' },
  s2p3: { depth: 'Adequate', issue: 'Normal equations square the condition number; never stated. QR is the correct method and is absent.' },
  s2p4: { depth: 'Good', issue: 'Thresholds differ between spec (Dry = 0 mm) and guide (Dry < 1 mm).' },
  s2p5: { depth: 'Weak', issue: 'Spec claims random walkers reveal eigenvector centrality; they reveal degree. Guide is correct and contradicts the spec. Graph is kNN of towns, not a road network.' },
  s3p1: { depth: 'Good', issue: 'Implicit method is an extension; stiffness never met. Adaptive error constant 15 asserted ("trust it for now").' },
  s3p2: { depth: 'Good', issue: 'Validation text "exponent close to 3/2 for a vs 1 for T" is garbled. Symplectic comparison should be required. No real ephemeris check.' },
  s3p3: { depth: 'Adequate', issue: 'Calibrating a fully-susceptible N = 13 M to a Delta wave recovers R_eff, not R₀; immunity, vaccination and NPIs ignored. Spec says HDX; guide uses disease.sh.' },
  s3p4: { depth: 'Good', issue: 'Linearised stability named in milestones but no Jacobian is computed.' },
  s3p5: { depth: 'Weak', issue: '"Gradient descent" never happens; greedy grid descent. Daily resolution hides the day/night cycle the battery exists for.' },
  s4p1: { depth: 'Good', issue: 'Stability condition verified empirically but never derived (von Neumann analysis is two lines). Implicit scheme is an extension.' },
  s4p2: { depth: 'Good', issue: 'No Peclet number; no numerical-diffusion estimate for upwind (vΔx/2), which the smear test measures but never names.' },
  s4p3: { depth: 'Adequate', issue: 'Gillespie SSA missing as the exact stochastic bridge between ODE and agents. WorldPop in spec; GeoNames in guide.' },
  s4p4: { depth: 'Good', issue: 'Dense K; the sparse structure is the whole point at scale. Uses np.linalg.solve, not the Stage 2 solver as spec says.' },
  s4p5: { depth: 'Weak', issue: 'Not gridded NetCDF. Mann–Kendall without tie correction, serial-correlation pre-whitening, or field significance (64 tests at p < 0.05 expect ≈3 false positives).' },
  s4p6: { depth: 'Good', issue: '2D CFL stated, not derived. Fine otherwise.' },
  s4p7: { depth: 'Adequate', issue: 'Gray–Scott in nondimensional units with dt = 1; no linear stability analysis to predict the pattern boundary.' },
  s5p1: { depth: 'Adequate', issue: "Barnes–Hut is an extension. No compiled language. Leapfrog's symplectic property stated in one line." },
  s5p2: { depth: 'Adequate', issue: 'Parameter distributions are invented normals; should come from a posterior. No MPI.' },
  s5p3: { depth: 'Weak', issue: 'GPU optional; title overclaims. Content is good CPU parallelism.' },
  s5p4: { depth: 'Adequate', issue: 'Fine; uses scikit-learn correctly.' },
  s5p5: { depth: 'Adequate', issue: 'Honest about tiny n. Fine.' },
  s5p6: { depth: 'Weak', issue: 'Not shallow water; no time scale; c = 0.2 per step is arbitrary; IoU against a real event is impossible without time.' },
  s6p1: { depth: 'Good', issue: 'None.' },
  s6p2: { depth: 'Good', issue: 'Spec says β usually dominates; guide finds γ dominates. Both should say "depends on ranges".' },
  s6p3: { depth: 'Good', issue: 'None.' },
  capstone: { depth: 'Good', issue: 'Backtest design is correct. Needs an explicit uncertainty-propagation requirement from forecast to recommendation.' },
};

export type RevisionKind = 'required' | 'derivation' | 'fix' | 'text' | 'optional' | 'rewrite';
export interface Revision { item: string; project: string; kind: RevisionKind; text: string }

/** Part 3, split by the approval item that controls each change. */
export const REVISIONS: Revision[] = [
  { item: 'B8', project: 's0p1', kind: 'derivation', text: 'Derive the quadrature rule from a first-order Taylor expansion of f(a, b) before using it.' },
  { item: 'A1', project: 's0p1', kind: 'fix', text: 'Allow × and ÷ across unit families and produce the derived unit (m/s).' },
  { item: 'A1', project: 's0p2', kind: 'text', text: 'Rewrite deliverableWhy to match the Ursina/pygame deliverable (stale "a script is right-sized").' },
  { item: 'A1', project: 's0p3', kind: 'text', text: 'Rewrite deliverableWhy to match the Ursina/pygame deliverable (stale "a script is right-sized").' },
  { item: 'X1', project: 's0p3', kind: 'required', text: 'Report fitted r and K with a crude uncertainty: refit on each of 5 overlapping 40-year windows and report the spread.' },
  { item: 'E1', project: 's0p4', kind: 'optional', text: 'Demote the two extra dials to optional; add one required milestone: compare sample vs population variance on the same data and state when each applies.' },
  { item: 'B6', project: 's1p1', kind: 'required', text: 'Use annual means (or deseasonalise) before fitting; state that monthly residuals are autocorrelated and the SE formula assumes independence. Add a block-bootstrap SE as a cross-check.' },
  { item: 'X1', project: 's1p2', kind: 'required', text: 'Extend the h-sweep down to 1e-12 and explain the U-shaped error curve: optimal h ≈ √ε for forward differences. Add machine-epsilon test (1 + eps != 1).' },
  { item: 'A1', project: 's1p3', kind: 'fix', text: 'Fix the "stays exactly 0.5" note: semi-implicit Euler oscillates boundedly; it is not exact.' },
  { item: 'B2', project: 's1p3', kind: 'required', text: "Add semi-implicit Euler as a third integrator and plot its bounded energy oscillation against forward Euler's growth. This is the first symplectic method, two lines of code." },
  { item: 'B3', project: 's1p4', kind: 'required', text: 'Add a uniform-grid spatial hash for neighbour search; time O(N²) vs grid at N = 100, 400, 1600 and confirm the scaling exponent changes.' },
  { item: 'X1', project: 's2p1', kind: 'required', text: 'Count floating-point operations and confirm O(n³) by timing n = 50…800; show that reusing LU for a second right-hand side costs O(n²).' },
  { item: 'X1', project: 's2p2', kind: 'required', text: 'Add trapezoid and Simpson rules on the same integral; show MC loses in 1D and wins in 6D (a unit hypersphere volume).' },
  { item: 'B5', project: 's2p3', kind: 'required', text: 'Compute cond(V) and cond(VᵀV) and show the squaring. Implement least squares via Householder QR (or Gram–Schmidt) and compare accuracy at degree 8.' },
  { item: 'A1', project: 's2p4', kind: 'text', text: "Align thresholds between spec and guide (adopt the guide's: Dry < 1 mm). Add a chi-square or run-length comparison as the quantitative dry-spell test." },
  { item: 'A1', project: 's2p5', kind: 'fix', text: 'Correct the spec: random walkers measure degree, not eigenvector centrality (the guide already says so). Real road edges vs honest proximity graph: see Decision 3.' },
  { item: 'B3', project: 's2p5', kind: 'required', text: 'Add BFS shortest-hop and Dijkstra shortest-distance between two named towns.' },
  { item: 'B1', project: 's3p1', kind: 'required', text: 'Make backward Euler required; add the stiff test dy/dt = −50(y − cos t); show RK4 blows up at dt = 0.1 and backward Euler does not. Add a stability-region widget.' },
  { item: 'B8', project: 's3p1', kind: 'derivation', text: 'Derive the error constant 15 from the order of RK4 (2⁴ − 1).' },
  { item: 'A1', project: 's3p2', kind: 'fix', text: 'Fix garbled Kepler-3 validation text.' },
  { item: 'B2', project: 's3p2', kind: 'required', text: 'Make leapfrog required: run both integrators for 1000 orbits and plot energy drift; RK4 drifts linearly, leapfrog is bounded. Nondimensionalise explicitly (why GM = 1, what one time unit is in seconds for the Earth–Sun case). Optional: validate the Earth’s period against JPL Horizons state vectors.' },
  { item: 'B6', project: 's3p3', kind: 'required', text: 'Rename the fitted quantity R_eff; fix γ, σ and fit β and an initial-susceptible fraction, stating what it absorbs. Add a Poisson log-likelihood as the fit objective alongside SSE (prepares the Bayesian project).' },
  { item: 'A3', project: 's3p3', kind: 'fix', text: 'Replace disease.sh with an HDX or OWID CSV shipped in the repo as fallback.' },
  { item: 'B8', project: 's3p4', kind: 'required', text: 'Compute the Jacobian at both fixed points, its eigenvalues (purely imaginary at (20, 10) → centre), and confirm the simulated period 5.13 matches 2π/√(αγ) = 5.13.' },
  { item: 'B9', project: 's3p5', kind: 'required', text: 'Either implement actual gradient descent on a smoothed cost with finite-difference gradients (and compare with the greedy search), or remove "gradient descent" from the concepts. Switch to hourly NASA POWER data so the battery does something each night.' },
  { item: 'B8', project: 's4p1', kind: 'derivation', text: 'Derive the r ≤ 0.5 limit by von Neumann analysis (substitute u = λⁿ e^{ikx}).' },
  { item: 'B1', project: 's4p1', kind: 'required', text: 'Make the implicit (backward Euler) scheme required with a tridiagonal solve; show it is stable at r = 5. Add Richardson extrapolation to estimate the order from two grids.' },
  { item: 'B8', project: 's4p2', kind: 'derivation', text: "Derive the upwind scheme's numerical diffusion vΔx(1 − C)/2 and confirm it against the measured smear. Introduce the Peclet number." },
  { item: 'B7', project: 's4p3', kind: 'required', text: 'Insert a Gillespie SSA implementation of the single-town SEIR between the ODE and the agent model; all three must agree in the mean.' },
  { item: 'A1', project: 's4p3', kind: 'text', text: 'Align data source text (GeoNames).' },
  { item: 'B5', project: 's4p4', kind: 'required', text: 'Build K as scipy.sparse and solve with a sparse solver; show memory and time vs dense at 2000 nodes. Use the Stage 2 solver on the dense small case as the spec promises.' },
  { item: 'A1', project: 's4p5', kind: 'fix', text: 'Rewrite the spec to match the guide (64-point NASA POWER grid) or upgrade the guide to one CHIRPS NetCDF file via xarray — see Decision 4.' },
  { item: 'B6', project: 's4p5', kind: 'required', text: 'Add tie correction and pre-whitening to Mann–Kendall, and a false-discovery-rate step; report how many of the 64 cells survive.' },
  { item: 'B5', project: 's4p5', kind: 'required', text: 'Add an EOF/PCA of the rainfall anomaly field.' },
  { item: 'B8', project: 's4p6', kind: 'derivation', text: 'Derive the 2D CFL limit 1/√2 from the 2D von Neumann analysis. Optional: download one IRIS seismogram and identify P and S arrivals.' },
  { item: 'B8', project: 's4p7', kind: 'derivation', text: 'Linear stability analysis of the homogeneous state: derive the condition on D_u/D_v for pattern formation and show one (f, k) pair on each side of the boundary.' },
  { item: 'B3', project: 's5p1', kind: 'required', text: 'Make Barnes–Hut required (quadtree in 2D is enough); measure the O(N log N) crossover.' },
  { item: 'B4', project: 's5p1', kind: 'required', text: 'Add one compiled kernel: the same force loop in C called through ctypes (or Cython), timed alongside Numba.' },
  { item: 'B2', project: 's5p1', kind: 'derivation', text: 'Explain why leapfrog is symplectic in one paragraph with the energy plot from s3p2.' },
  { item: 'C5', project: 's5p2', kind: 'required', text: 'Replace invented normal priors with posterior samples from the new Bayesian project (s5p7).' },
  { item: 'B4', project: 's5p2', kind: 'required', text: 'Add an mpi4py version with comm.gather; report strong scaling on 1, 2, 4 processes.' },
  { item: 'A1', project: 's5p3', kind: 'text', text: 'Retitle "CPU-parallel and GPU-optional high-resolution solver". Keep content.' },
  { item: 'B1', project: 's5p3', kind: 'required', text: 'Add the implicit scheme from s4p1 and show the parallel speedup differs between explicit and implicit (the tridiagonal solve is sequential).' },
  { item: 'X1', project: 's5p4', kind: 'optional', text: 'Add a Gaussian-process surrogate with predictive variance so the surrogate reports its own uncertainty (currently an extension). Optional → Required if time.' },
  { item: 'E1', project: 's5p5', kind: 'optional', text: 'Keep. Demote the crop-blob rendering to optional.' },
  { item: 'D1', project: 's5p6', kind: 'rewrite', text: 'Rewrite as 1D shallow-water (Saint-Venant) with a finite-volume Lax–Friedrichs scheme, validated against the Ritter dam-break analytic solution, then 2D on the DEM with real seconds, Manning friction, and a CFL time step. Keep the DEM download and the two conservation tests. The 3D terrain rendering stays.' },
  { item: 'A1', project: 's6p2', kind: 'text', text: 'Change "β typically dominates" to "the ranking depends on the ranges; report yours".' },
  { item: 'C5', project: 's6p2', kind: 'required', text: 'Use the posterior from the Bayesian project (s5p7) as the input distributions.' },
  { item: 'B10', project: 'capstone', kind: 'required', text: 'Forecast uncertainty is propagated to the recommendation (a planting-date distribution, not a date), and the backtest reports a proper skill score against the baseline.' },
];

/** E1: decorative visual milestones demoted to optional (index into the original milestone list; null = not a required milestone today). */
export const DEMOTIONS: { project: string; label: string; index: number | null; note?: string }[] = [
  { project: 's0p3', label: 'population dot swarms', index: 5 },
  { project: 's0p4', label: 'third dial', index: null, note: 'The third needle is already listed as an extension, so nothing required changes.' },
  { project: 's2p4', label: 'walker swarm', index: 5 },
  { project: 's2p5', label: 'live walkers', index: 5 },
  { project: 's3p5', label: 'rolling-ball animation', index: 6 },
  { project: 's5p2', label: 'ensemble fan chart (keep the static percentile plot)', index: 5 },
  { project: 's5p5', label: 'crop blobs', index: 5 },
  { project: 's6p1', label: 'pygame reproduction next to paper figure (kept as encouragement)', index: 5 },
];

export interface NewProjectSpec {
  id: string; item: string; title: string; stage: number; domain: string; difficulty: string; time: string;
  prereqs: string[]; summary: string; oracles: string[]; concepts: { math: string[]; physics: string[]; programming: string[] };
  labWidget?: string; insertAfter: string;
  /** Filled in once the project has a full build guide. */
  firstWin?: string; deliverableType?: string; dataSource?: string; tools?: string[];
}
/** Part 4, the five new projects. Text is the audit's own; no build guide exists yet (Decision 1). */
export const NEW_PROJECTS: NewProjectSpec[] = [
  { id: 's1p6', item: 'C1', title: 'Floating Point and the Convergence Harness', stage: 1, domain: 'Computing', difficulty: 'Intermediate', time: '1.5 weeks', prereqs: ['s1p2'], insertAfter: 's1p2', labWidget: 'convergence',
    firstWin: 'A live log–log plot of your own error curves, bending upward exactly where the computer runs out of digits.', deliverableType: 'Tested Python module + live pygame plot', dataSource: 'None — validated against exactly known answers.', tools: ['numpy', 'pygame', 'pytest'],
    summary: 'IEEE 754, machine epsilon, cancellation (quadratic formula, variance one-pass vs two-pass), Richardson extrapolation, and a reusable order_of_accuracy(f, hs) that every later PDE project imports.',
    oracles: ['Measured orders for forward difference (1), central difference (2) and Simpson (4).'],
    concepts: { math: ['IEEE 754 floating point, machine epsilon', 'Cancellation error', 'Round-off vs truncation, optimal step size', 'Richardson extrapolation'], physics: ['None directly — verification methodology'], programming: ['A reusable convergence-order harness', 'Testing numerical code against known orders'] } },
  { id: 's2p6', item: 'C2', title: 'Fourier Analysis of a Real Climate Signal', stage: 2, domain: 'Climate', difficulty: 'Intermediate', time: '2.5 weeks', prereqs: ['s2p1', 's1p1'], insertAfter: 's2p3', labWidget: 'fft',
    firstWin: 'A spectrum of real CO₂ data with one spike standing exactly at one year.', deliverableType: 'Tested Python module + live pygame spectrum explorer', dataSource: 'NOAA GML Mauna Loa monthly CO₂ (gml.noaa.gov) and NASA POWER daily temperature for Kigali, 1994–2023.', tools: ['numpy', 'pygame', 'pytest'],
    summary: 'DFT written as a matrix, FFT via NumPy, Parseval check, power spectrum of Mauna Loa CO₂ (annual peak) and of 30 years of NASA POWER daily temperature (annual and semi-annual peaks), spectral derivative accuracy vs finite differences, spectral solution of the 1D heat equation checked against s4p1 later.',
    oracles: ['Peak at 1/365 d⁻¹ within one bin.', 'Parseval to 1e-10.'],
    concepts: { math: ['Discrete Fourier transform as a matrix', 'FFT', "Parseval's theorem", 'Spectral derivatives'], physics: ['Seasonal cycles in climate data'], programming: ['numpy.fft', 'Spectral methods'] } },
  { id: 's4p8', item: 'C3', title: 'Poisson Equation and Iterative Solvers', stage: 4, domain: 'Physics', difficulty: 'Advanced', time: '3 weeks', prereqs: ['s4p1', 's2p1'], insertAfter: 's4p1',
    firstWin: 'The electric potential of two charges painted on screen, with rings of equal potential, from a matrix you built yourself.', deliverableType: 'Tested Python module + pygame potential map and solver race', dataSource: 'None — validated against a manufactured solution and the 2D point-charge law.', tools: ['numpy', 'scipy', 'pygame', 'pytest'],
    summary: 'Electrostatic potential of two charges in a box (Laplace/Poisson), Jacobi → Gauss–Seidel → SOR with measured convergence rates, conjugate gradient on the sparse matrix, compare iterations vs grid size, analytic check against the point-charge potential. Reuse the sparse assembly idea in s4p4.',
    oracles: ['SOR optimal ω within 2% of 2/(1 + sin(πh)), h = 1/(N + 1).', 'CG iterations grow like N (Jacobi like N²): about 24, 50, 100 for N = 15, 31, 63. (The audit said “≤ N”; measured, it is about 1.6N.)'],
    concepts: { math: ['Elliptic PDEs (Poisson/Laplace)', 'Jacobi, Gauss–Seidel, SOR', 'Conjugate gradient', 'Sparse matrices'], physics: ['Electrostatics: potential of point charges'], programming: ['scipy.sparse', 'Iterative solver convergence measurement'] } },
  { id: 's4p9', item: 'C4', title: 'Ising Model: Metropolis Monte Carlo and a Phase Transition', stage: 4, domain: 'Physics', difficulty: 'Advanced', time: '3 weeks', prereqs: ['s2p2', 's4p7'], insertAfter: 's4p7',
    firstWin: 'A 128 × 128 grid of spins that freezes into one big magnet as you turn the temperature down past about 2.3.', deliverableType: 'Tested Python module + live pygame lattice and temperature scan', dataSource: 'None — validated against exact enumeration (2 × 2 and 4 × 4) and Onsager’s exact T_c.', tools: ['numpy', 'pygame', 'pytest'],
    summary: 'Detailed balance derived, Metropolis step, energy and magnetisation vs temperature, autocorrelation time and why you must thin, specific heat peak near T_c = 2.269 (Onsager), finite-size scaling with L = 16, 32, 64.',
    oracles: ['T_c estimate within 3% (specific-heat peak, L = 16).', 'Exact energy for a 2×2 lattice by listing all 16 states; Metropolis checked against the exact 4×4 answer.'],
    concepts: { math: ['Markov chain Monte Carlo, detailed balance', 'Autocorrelation time', 'Finite-size scaling'], physics: ['Statistical mechanics', '2D Ising model and phase transitions'], programming: ['Metropolis sampler', 'Efficient lattice updates'] } },
  { id: 's5p7', item: 'C5', title: 'Bayesian Calibration of the SEIR Model by MCMC', stage: 5, domain: 'Epidemiology', difficulty: 'Advanced', time: '3 weeks', prereqs: ['s3p3', 's4p9'], insertAfter: 's4p9',
    summary: 'Poisson likelihood from s3p3, flat and informative priors, Metropolis sampler reused from s4p9, trace plots, Gelman–Rubin on 4 chains, posterior for (β, γ), 95% credible interval on R_eff, posterior predictive check against the real case curve. Validated first on a synthetic data set with known parameters.',
    oracles: ['Recovers known parameters on a synthetic data set.', 'Gelman–Rubin diagnostic on 4 chains.'],
    concepts: { math: ['Likelihood, priors, posteriors', 'Metropolis–Hastings MCMC', 'Credible intervals, Gelman–Rubin'], physics: ['None directly — epidemic model calibration'], programming: ['MCMC sampler', 'Posterior predictive checks'] } },
];

/** Prerequisite edges that change only when a new project is approved. */
export const PREREQ_CHANGES: { item: string; project: string; add: string }[] = [
  { item: 'C1', project: 's1p1', add: 's1p6' },
  { item: 'C3', project: 's4p4', add: 's4p8' },
  { item: 'C5', project: 's5p2', add: 's5p7' },
];

/** Part 4 revised order (existing ids keep their ids; new ids slot in). */
export const REVISED_ORDER = [
  's0p1', 's0p2', 's0p3', 's0p4',
  's1p2', 's1p6', 's1p1', 's1p3', 's1p5', 's1p4',
  's2p1', 's2p2', 's2p3', 's2p6', 's2p4', 's2p5',
  's3p1', 's3p2', 's3p3', 's3p4', 's3p5',
  's4p1', 's4p8', 's4p2', 's4p4', 's4p3', 's4p5', 's4p6', 's4p7', 's4p9',
  's5p7', 's5p1', 's5p2', 's5p3', 's5p4', 's5p5', 's5p6',
  's6p1', 's6p2', 's6p3',
];

export const PACING = {
  original: [
    { label: 'Light Track', value: '~3 years', text: '5–10 hrs/week. Comfortable alongside a full course load — still reaches Stage 6 before your final year.' },
    { label: 'Your Pace', value: '~2 years', text: '10–20 hrs/week, varying. Sized so Stages 0–5 finish inside two years, leaving Stage 6 + capstone for your final year.' },
    { label: 'Intensive Track', value: '~14 months', text: '20+ hrs/week. Compresses the same projects without skipping validation steps — depth stays fixed either way.' },
  ],
  revised: [
    { label: 'Light Track', value: '≈ 3.5 years', text: '5–10 hrs/week. The honest cost of the essential additions (audit: ~112 required weeks, was 98).' },
    { label: 'Your Pace', value: '≈ 2.3 years', text: '10–20 hrs/week to the end of Stage 5, with Stage 6 and the capstone still in the final year.' },
    { label: 'Intensive Track', value: '≈ 16 months', text: '20+ hrs/week. Same depth and validation; the audit recommends not hiding the cost by shrinking estimates.' },
  ],
};

export const SPECIALISATION_TRACK = [
  { title: 'Robotics and aerospace', items: ['Rigid-body rotation with quaternions', 'PID control of an inverted pendulum using the s3p1 solver', 'Restricted three-body problem and Lagrange points extending s3p2'] },
  { title: 'Computational biology', items: ['Hodgkin–Huxley neuron (stiff, uses implicit methods)', 'Lennard-Jones molecular dynamics with velocity Verlet and a radial distribution function', 'Gillespie gene-expression bursts'] },
  { title: 'Astrophysics', items: ['Validate s3p2 against JPL Horizons', 'Gaia DR3 colour–magnitude diagram', 'SPH toy star as a capstone alternative'] },
  { title: 'Quantum', items: ['Time-independent Schrödinger as a tridiagonal eigenproblem (particle in a box, harmonic oscillator)', 'Time-dependent wave packet via Crank–Nicolson'] },
];

export const ROADMAP_ADDITIONS = {
  math: ['Fourier analysis (DFT/FFT, spectra, spectral derivatives)', 'Elliptic PDEs (Poisson/Laplace) and iterative solvers', 'Floating-point arithmetic and error analysis', 'Bayesian inference (likelihood, priors, MCMC)'],
  timeline: { stage: 'Stage 1–4', title: 'Verification', text: 'Manufactured solutions and Richardson extrapolation; an order-of-accuracy harness applied to every PDE project.' },
};

export interface Decision { id: string; question: string; options: { id: string; label: string }[]; relatedItem?: string }
export const DECISIONS: Decision[] = [
  { id: 'guides', question: 'For the five new projects: full build guides in the existing step-by-step style (tests first, numbered steps, verified oracle values, stuck table), or specifications only for now?', relatedItem: 'C1–C5',
    options: [{ id: 'full', label: 'Full build guides (each needs every oracle computed and verified)' }, { id: 'spec', label: 'Specifications only for now' }] },
  { id: 'twoD', question: 'For A2: delete the dead 2D guides, or expose them as a toggle?', relatedItem: 'A2',
    options: [{ id: 'toggle', label: 'Keep them behind a "2D version" toggle' }, { id: 'delete', label: 'Delete (hide) them' }] },
  { id: 's2p5', question: 'For s2p5: real Overpass road edges, or keep GeoNames and relabel honestly as a proximity graph?', relatedItem: 'A1',
    options: [{ id: 'overpass', label: 'Real Overpass road edges' }, { id: 'geonames', label: 'Keep GeoNames, relabel as proximity graph' }] },
  { id: 's4p5', question: 'For s4p5: upgrade to one CHIRPS NetCDF file via xarray (true to the spec, heavier download), or keep the NASA POWER grid and rewrite the spec?', relatedItem: 'A1',
    options: [{ id: 'chirps', label: 'Upgrade to CHIRPS NetCDF via xarray' }, { id: 'power', label: 'Keep NASA POWER grid, rewrite the spec' }] },
  { id: 'pacing', question: 'Is the pacing change acceptable (≈3.5 y / 2.3 y / 16 months), or which Essential items should be cut to hold two years?', relatedItem: 'E2',
    options: [{ id: 'accept', label: 'Accept the revised pacing' }, { id: 'cut', label: 'Hold two years — I will choose items to cut' }] },
];
