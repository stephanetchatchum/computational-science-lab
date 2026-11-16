/**
 * Stage 4: a visual for every build step, the audit rewrites (B1, B5, B6, B7, B8, A1), the A4 corrections
 * (guide tests that could not pass), and full guides for s4p8 and s4p9.
 * Every test below runs against a reference solution in scripts/reference/ (scripts/verify_guides.sh, also in CI).
 */
import type { Guide, GuideStep } from './legacy/curriculum.js';
import type { AddedStep, GuidePatch, Visual } from './stage01';

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });

export const STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s4p1: {
    0: { widget: 'heat2d', caption: 'Your fourth check, live: a hot square on a 2D grid. Below r = 0.25 it spreads calmly; slide r above 0.25 and it explodes.', preset: { r: 0.24 } },
    1: { widget: 'vonneumann', caption: 'Why the limit is r ≤ ½: every wiggle of the grid is multiplied by λ = 1 − 4r·sin²(kΔx/2) each step. When r > ½ the shortest wiggle has |λ| > 1 and grows.' },
    2: { widget: 'win3d', caption: 'The empty 3D scene your landscape will stand in.' },
    3: { widget: 'heat2d', caption: 'The landscape you are building, seen from above: hot in the middle, spreading and sinking.', preset: { r: 0.2 } },
    4: { widget: 'heat2d', caption: 'r = 0.30: past the 2D limit of ¼. Spikes appear in a few dozen steps.', preset: { r: 0.3 } },
  },
  s4p2: {
    0: { widget: 'numdiff', caption: 'Your first check, run: pure advection with no physical diffusion. The bell still widens, from variance 0.25 to 0.74 in 10 s. That smear is made by the upwind scheme itself.' },
    2: { widget: 'win2d', caption: 'The window for the river.' },
    3: { widget: 'plume', caption: 'The river and the dye you are drawing: carried by the flow and spreading.' },
  },
  s4p3: {
    0: { widget: 'ssa', caption: 'Your third check: one town, no travel. Each grey line is one random epidemic; their average (blue) should follow the equations (white).' },
    1: { widget: 'townspread', caption: 'The gravity model: thicker lines carry more travel. Big, close towns pull hardest.' },
    2: { widget: 'blobs', caption: 'Your agent model inside one town is this: random people, random contacts, the same rates as the equations.' },
    3: { widget: 'win2d', caption: 'The window for the map.' },
    4: { widget: 'townspread', caption: 'The outbreak starts in the biggest town and reaches the others later, the far ones last.' },
  },
  s4p4: {
    1: { widget: 'truss', caption: 'Two bars and a load: the hand calculation, as a picture. Compression red, tension blue.', preset: { load: 100 } },
    2: { widget: 'truss', caption: 'One stiffness block per bar, added into the big matrix. Remove a diagonal and the truss becomes a mechanism: the matrix is singular and cannot be solved.' },
    3: { widget: 'win3d', caption: 'The empty 3D scene for your bridge.' },
    4: { widget: 'truss', caption: 'Load it and watch it sag (exaggerated). Top members squeeze (red), bottom members stretch (blue).', preset: { load: 200 } },
    5: { widget: 'truss', caption: 'Double the load: every force doubles. That is what “linear” means.', preset: { load: 300 } },
  },
  s4p5: {
    0: { widget: 'mkpairs', caption: 'Your hand checks as a picture: every pair of years votes up (green) or down (red). S is greens minus reds.' },
    2: { widget: 'fdr', caption: '64 places means 64 tests. Even with no real trend anywhere, about 3 of them will pass p < 0.05 by luck. Remember this for later.' },
    3: { widget: 'win2d', caption: 'The window for the test and the map.' },
    4: { widget: 'mkpairs', caption: 'The animation you are building: 528 pairs for 33 years, drawn a few at a time.' },
    5: { widget: 'fdr', caption: 'Your map’s grey cells are the tests that failed. The next step asks how many of the coloured ones are luck.' },
  },
  s4p6: {
    0: { widget: 'wavesurf', caption: 'What your checks measure: a pulse leaves the source at 1500 m/s, part of it bounces off the fast layer and comes back up.' },
    2: { widget: 'win3d', caption: 'The empty 3D scene for the wavefield.' },
    3: { widget: 'wavesurf', caption: 'The living surface you are building, seen from above: red is high pressure, blue is low.' },
    5: { widget: 'wavesurf', caption: 'Slide Δt up: in the fast layer c·Δt/Δx passes 1/√2 ≈ 0.707 first, and that is where it tears apart.', preset: { dt: 1.9 } },
  },
  s4p7: {
    0: { widget: 'grayscott', caption: 'The two-chemical system your checks test, running. Pick a preset.' },
    1: { widget: 'grayscott', caption: 'Your gs_step, many times per frame: feed f brings in U, kill k removes V.', preset: { preset: 1 } },
    2: { widget: 'win2d', caption: 'The window your patterns will grow in.' },
    3: { widget: 'grayscott', caption: 'Spots, stripes, coral: the same equations, different f and k.', preset: { preset: 2 } },
    4: { widget: 'grayscott', caption: 'Press Reset for a new random seed: the positions change, the kind of pattern does not.', preset: { preset: 0 } },
    5: { widget: 'grayscott', caption: 'Step through the presets: each (f, k) pair has its own family of patterns.', preset: { preset: 4 } },
  },
};

const PLUME_TEST_FIXED = `from pytest import approx
from src.plume import run, mean_and_variance

def test_pure_advection_moves_the_bell():
    x, c = run(D=0.0)                       # defaults: v=1, dx=0.05, dt=0.001, 10 seconds
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.05)
    assert var < 0.8                        # it started at 0.25; upwind adds a smear you will predict exactly later

def test_advection_plus_diffusion():
    x, c = run(D=1.0)
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.1)
    assert var == approx(20.25, rel=0.06)   # exact is 20.25; the scheme adds a little fake smear

def test_total_dye_is_conserved():
    x, c = run(D=1.0)
    assert c.sum() * 0.05 == approx(1.0, abs=1e-6)`;

const TRUSS_TEST_FIXED = `import math
import numpy as np
from pytest import approx
from src.truss import solve_truss, equilibrium_error

def test_the_hand_calculation():
    nodes = [(0, 0, 0), (4, 0, 0), (2, 3, 0)]
    members = [(0, 2, 1000.0), (1, 2, 1000.0)]
    # Both bars lie in the x–y plane, so nothing resists node 2 moving in z: lock it.
    u, forces = solve_truss(nodes, members, [(0, "xyz"), (1, "xyz"), (2, "z")], {2: (0.0, -100.0, 0.0)})
    assert u[2][1] == approx(-0.07222, abs=1e-4)
    assert forces == approx([-60.09, -60.09], abs=0.01)

def make_bridge():
    nodes = [(0,0,0), (2,0,0), (4,0,0), (1,1.5,0), (3,1.5,0),
             (0,0,2), (2,0,2), (4,0,2), (1,1.5,2), (3,1.5,2)]
    pairs = [(0,1),(1,2),(0,3),(3,1),(1,4),(4,2),(3,4),
             (5,6),(6,7),(5,8),(8,6),(6,9),(9,7),(8,9),
             (0,5),(1,6),(2,7),(3,8),(4,9),
             (0,6),(3,9),(1,8)]                          # three braces stop the two sides swaying
    EA = 1e4
    members = [(i, j, EA / math.dist(nodes[i], nodes[j])) for i, j in pairs]
    fixed = [(0,"xyz"), (2,"xyz"), (5,"xyz"), (7,"xyz")]
    loads = {1: (0.0, -100.0, 0.0), 6: (0.0, -100.0, 0.0)}
    return nodes, members, fixed, loads

def test_bridge_sags_and_balances():
    nodes, members, fixed, loads = make_bridge()
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert u[1][1] < 0 and u[6][1] < 0                   # the loaded nodes go DOWN
    assert equilibrium_error(nodes, members, forces, loads, [1, 3, 4, 6, 8, 9]) < 1e-6

def test_doubling_the_load_doubles_the_forces():
    nodes, members, fixed, loads = make_bridge()
    u1, f1 = solve_truss(nodes, members, fixed, loads)
    heavy = {k: (0.0, 2 * v[1], 0.0) for k, v in loads.items()}
    u2, f2 = solve_truss(nodes, members, fixed, heavy)
    assert np.allclose(np.array(f2), 2 * np.array(f1), rtol=1e-6)`;

export const PATCHES: Record<string, GuidePatch> = {
  s4p1: {
    steps: { 1: { item: 'B8', hint: 'Where ½ comes from (von Neumann). Any grid shape is a sum of waves e^(ikjΔx). Put one into the update and it comes back multiplied by λ = 1 − 4r·sin²(kΔx/2). Errors stay bounded only if |λ| ≤ 1 for every k. The worst wave is the shortest, sin² = 1, giving λ = 1 − 4r, and |1 − 4r| ≤ 1 means **r ≤ ½**. In 2D the two directions add: λ = 1 − 4r(sin²a + sin²b), worst case 1 − 8r, so **r ≤ ¼**.' } },
  },
  s4p2: {
    steps: {
      0: { item: 'A4', code: PLUME_TEST_FIXED },
      3: { item: 'A4', see: 'The dye starts as a narrow red stripe at 5 m. It drifts right and, with diffusion on, spreads. At **t = 10 s** the centre is at **15 m** and the variance reads about **21**. With diffusion off it still widens, to variance **0.74**: that is the scheme’s own smear, which the next audit step predicts exactly.' },
    },
  },
  s4p4: {
    steps: {
      0: { item: 'A4', doAll: [
        'Draw this: node 0 at (0,0,0) pinned, node 1 at (4,0,0) pinned, node 2 at (2,3,0) free. Two bars: 0→2 and 1→2. Both have k = 1000 N/m. A load of **100 N pulls node 2 straight down**.',
        'Each bar has length L = √(2² + 3²) = **√13 = 3.606 m**.',
        'The vertical share of each bar’s direction is **3/√13 = 0.8321**.',
        'By symmetry both bars carry the same force N. Vertical equilibrium at node 2 gives **2·N·0.8321 = 100**, so **N = 60.09 N**, and it is compression, so −60.09.',
        'The node moves down by **u = −0.0722 m**.',
        'One more thing a drawing hides: both bars lie flat in the x–y plane, so nothing at all stops node 2 sliding in z. In 3D you must lock that direction (a support on node 2 in z), or the computer is asked to solve a problem with no single answer.'] },
      1: { item: 'A4', code: TRUSS_TEST_FIXED },
      2: { item: 'A4', hint: 'If numpy says **Singular matrix**, your structure is a mechanism: it can move in some direction without stretching any bar, so no unique answer exists. Lock that direction or add a brace. If the forces have the wrong sign, check that c points from a toward b in both the assembly and the force recovery.' },
    },
  },
  s4p6: {
    steps: { 5: { item: 'B8', hint: 'Where 1/√2 comes from. Put a wave e^(i(ax + bz)) into the update: it comes back multiplied by λ, where λ + 1/λ = 2 − 4C²(sin²(aΔx/2) + sin²(bΔz/2)) and C = cΔt/Δx. |λ| stays 1 only while the right side stays between −2 and 2, so C²(sin² + sin²) ≤ 1. The worst wave has both sin² = 1: 2C² ≤ 1, so **C ≤ 1/√2 ≈ 0.707**. In 1D it would be C ≤ 1. Write in README.md that the *fast* layer sets the limit: stability is decided by the **largest** c anywhere on your grid.' } },
  },
};

const IMPLICIT_TEST = `from src.heat import thomas, heat1d_implicit, richardson_order

def test_thomas_matches_numpy():
    a = np.array([0.0, -1.0, -2.0, -1.0]); b = np.array([4.0, 5.0, 6.0, 4.0]); c = np.array([-1.0, -2.0, -1.0, 0.0])
    d = np.array([1.0, 2.0, 3.0, 4.0])
    A = np.diag(b) + np.diag(a[1:], -1) + np.diag(c[:-1], 1)
    assert np.allclose(thomas(a, b, c, d), np.linalg.solve(A, d))

def test_implicit_is_stable_where_explicit_explodes():
    assert blow_up_step(51, 5.0) is not None                  # explicit at r = 5 explodes
    x, u, r = heat1d_implicit(51, 0.2, 0.01, 2.0)             # r = 5, ten steps
    assert r == approx(5.0)
    assert np.max(np.abs(u - exact(x, 2.0))) < 2e-3

def test_order_from_three_grids_without_the_exact_answer():
    mids = []
    for n in (11, 21, 41):
        dx = 1 / (n - 1)
        x, u, r = heat1d(n, 0.25 * dx**2 / 0.01, 0.01, 2.0)   # keep r = 0.25 on every grid
        mids.append(u[(n - 1) // 2])
    assert richardson_order(*mids) == approx(2.0, abs=0.05)`;

const NUMDIFF_TEST = `from src.plume import numerical_diffusion, cell_peclet

def test_upwind_smear_is_predicted_exactly():
    for dx, dt in [(0.05, 0.001), (0.025, 0.001), (0.05, 0.01)]:
        x, c = run(D=0.0, dx=dx, dt=dt)
        m, var = mean_and_variance(x, c)
        assert var == approx(0.25 + 2 * numerical_diffusion(1.0, dx, dt) * 10.0, rel=0.01)

def test_cell_peclet():
    assert cell_peclet(1.0, 0.05, 1.0) == approx(0.05)
    assert cell_peclet(0.5, 10.0, 30.0) == approx(1 / 6)`;

const SSA_TEST = `from src.ssa import gillespie_seir, ode_peak_and_final

def test_gillespie_conserves_people_and_s_never_rises():
    ts, ys = gillespie_seir(2000, 0.5, 0.2, 0.1, 20, 200.0, seed=0)
    assert np.all(ys.sum(axis=1) == 2000)
    assert np.all(np.diff(ys[:, 0]) <= 0)
    assert np.all(np.diff(ts) > 0)

def test_three_models_agree_in_the_mean():
    peak_ode, final_ode = ode_peak_and_final(2000, 0.5, 0.2, 0.1, 20)
    ssa = [gillespie_seir(2000, 0.5, 0.2, 0.1, 20, 200.0, seed=s)[1] for s in range(40)]
    assert np.mean([y[:, 2].max() for y in ssa]) == approx(peak_ode, rel=0.05)
    assert np.mean([2000 - y[-1, 0] for y in ssa]) == approx(final_ode, rel=0.01)
    agent_peaks, agent_final = [], []
    for s in range(40):
        e = Epidemic([2000], np.array([[1.0]]), beta=0.5, sigma=0.2, gamma=0.1, i0=20, travel=0.0, seed=s)
        I = [e.counts()[2]]
        for day in range(200):
            e.step_day(); I.append(e.counts()[2])
        agent_peaks.append(max(I)); agent_final.append(2000 - e.counts()[0])
    assert np.mean(agent_peaks) == approx(peak_ode, rel=0.08)
    assert np.mean(agent_final) == approx(final_ode, rel=0.01)`;

const SPARSE_TEST = `from src.truss import solve_truss_sparse, long_bridge, stiffness_sparse
from src.solver import gaussian_pivoted

def test_sparse_matches_dense():
    nodes, members, fixed, loads = long_bridge(20)
    u1, f1 = solve_truss(nodes, members, fixed, loads)
    u2, f2 = solve_truss_sparse(nodes, members, fixed, loads)
    assert np.allclose(u2, u1, rtol=1e-8, atol=1e-10 * np.abs(u1).max())

def test_sparse_storage_is_tiny():
    nodes, members, fixed, loads = long_bridge(500)              # about 2000 nodes
    K = stiffness_sparse(nodes, members)
    assert len(nodes) == 2002
    assert K.nnz / K.shape[0] ** 2 < 0.005                       # under half a percent of the entries are not zero

def test_stage2_solver_on_the_hand_truss():
    nodes = [(0, 0, 0), (4, 0, 0), (2, 3, 0)]
    K = stiffness_sparse(nodes, [(0, 2, 1000.0), (1, 2, 1000.0)]).toarray()
    free = [6, 7]                                                # node 2, x and y
    u = gaussian_pivoted(K[np.ix_(free, free)].tolist(), [0.0, -100.0])
    assert u[1] == approx(-0.07222, abs=1e-4)`;

const MK_RIGOUR_TEST = `import numpy as np
from src.mk import mk_z_ties, prewhiten, bh_reject

def test_ties_shrink_the_variance():
    assert mk_z([1, 2, 2, 3]) == approx(1.3587, abs=1e-3)       # ignores the tie
    assert mk_z_ties([1, 2, 2, 3]) == approx(1.4446, abs=1e-3)  # corrects for it

def ar1(rng, phi, n=33):
    e = rng.normal(size=n); x = np.zeros(n); x[0] = e[0] / np.sqrt(1 - phi * phi)
    for t in range(1, n):
        x[t] = phi * x[t - 1] + e[t]
    return x

def test_prewhitening_controls_false_alarms():
    rng = np.random.default_rng(0); plain = whitened = 0
    for _ in range(400):
        x = ar1(rng, 0.6)                                       # no trend at all, but memory from year to year
        plain += mk_p(mk_z(x)) < 0.05
        whitened += mk_p(mk_z(prewhiten(x))) < 0.05
    assert plain / 400 > 0.2                                    # the plain test cries wolf
    assert whitened / 400 < 0.08                                # close to the promised 5%

def test_benjamini_hochberg():
    p = [0.001, 0.008, 0.039, 0.041, 0.042, 0.06, 0.074, 0.205, 0.212, 0.216]
    assert list(bh_reject(p, 0.05)) == [True, True] + [False] * 8`;

const EOF_TEST = `import numpy as np
from pytest import approx
from src.eof import eofs

def test_eof_finds_a_planted_pattern():
    rng = np.random.default_rng(2)
    pattern = np.sin(np.linspace(0, 3, 64)) + 0.3
    pc = np.sin(np.arange(33) / 3)
    field = np.outer(pc, pattern) + 0.05 * rng.normal(size=(33, 64))
    patterns, series, explained = eofs(field)
    assert explained[0] > 0.99
    assert abs(np.corrcoef(patterns[0], pattern)[0, 1]) > 0.99
    assert np.sum(explained) == approx(1.0)`;

const TURING_TEST = `from src.gray_scott import PRESETS
from src.turing import uniform_states, growth_rate

def test_the_empty_dish_is_always_stable():
    for f, k in PRESETS.values():
        assert growth_rate(1.0, 0.0, f, k, 1.0, 0.5) < 0                # small disturbances of U = 1, V = 0 die

def test_turing_needs_unequal_diffusion():
    U, V = uniform_states(0.055, 0.062)[0]
    assert growth_rate(U, V, 0.055, 0.062, 0.0, 0.0) < 0                 # stable without diffusion
    assert growth_rate(U, V, 0.055, 0.062, 1.0, 0.5) > 0.005             # unstable with Du/Dv = 2: a pattern grows
    assert growth_rate(U, V, 0.055, 0.062, 1.0, 1.0) < 0                 # equal diffusion: no pattern

def test_the_other_side_of_the_boundary():
    U, V = uniform_states(0.06, 0.0609)[0]
    assert growth_rate(U, V, 0.06, 0.0609, 1.0, 0.5) < 0                 # stays uniform

def test_spots_have_no_uniform_partner_state():
    f, k = PRESETS["spots"]
    assert uniform_states(f, k) == []                                    # spots need a big kick, not a slow instability`;

export const ADDED_STEPS: Record<string, AddedStep[]> = {
  s4p1: [{ key: 'a:B1-implicit', item: 'B1', after: 1, visual: { widget: 'implicitheat', caption: 'Slide r far past ½. The explicit rod (red) explodes; the implicit rod (green) stays on the exact curve (white), only a little less accurate per step.' },
    step: S('An implicit solver, and the order without the answer',
      'The explicit rule has to keep r ≤ ½, so a fine grid forces tiny time steps. Backward Euler takes the neighbours at the NEW time. Then each step is a linear system, but it is stable for any r. Then measure the order of accuracy from three grids alone, with no exact answer. That is how you check a solver on a real problem.',
      ['In **src/heat.py** write {{thomas(a, b, c, d)}}: it solves a tridiagonal system, where row i is {{a[i]*x[i-1] + b[i]*x[i] + c[i]*x[i+1] = d[i]}}. Sweep down once: {{cp[0] = c[0]/b[0]}}, {{dp[0] = d[0]/b[0]}}, and for i ≥ 1, {{m = b[i] - a[i]*cp[i-1]}}, {{cp[i] = c[i]/m}}, {{dp[i] = (d[i] - a[i]*dp[i-1])/m}}. Then back up: {{x[-1] = dp[-1]}}, {{x[i] = dp[i] - cp[i]*x[i+1]}}. Work: about 8n, not n³.',
       'Write {{heat1d_implicit(n, dt, alpha=0.01, t_end=2.0)}}: the same rod and start as {{heat1d}}. Each step solves {{-r*u_new[i-1] + (1 + 2r)*u_new[i] - r*u_new[i+1] = u_old[i]}} for the interior points with {{thomas}}. Keep the ends at 0. Return {{(x, u, r)}}.',
       'Write {{richardson_order(u_coarse, u_mid, u_fine)}}: the values at the same point on grids with spacing h, h/2 and h/4. The order is {{log2(abs(u_coarse - u_mid) / abs(u_mid - u_fine))}}.',
       'Why that works: if the error is C·hᵖ, the gaps between neighbouring grids are C·hᵖ(1 − 2⁻ᵖ) and C·(h/2)ᵖ(1 − 2⁻ᵖ). Their ratio is 2ᵖ, whatever C is, and you never needed the exact answer.',
       'Add the checks below to **tests/test_heat.py** and run them.',
       'In **README.md**: the r you used for the implicit run, its error, and one sentence on when you would pay for a linear solve each step.'],
      'python -m pytest -q tests/test_heat.py',
      'All checks pass. At r = 5 the explicit rod explodes after **14 steps**; the implicit one stays within **1.6e-3** of the exact answer. The three-grid order comes out **2.01**.',
      'The implicit error at r = 5 is bigger than the explicit error at r = 0.24: backward Euler is only first order in time. Stability is not accuracy.',
      IMPLICIT_TEST) }],
  s4p2: [{ key: 'a:B8-numdiff', item: 'B8', after: 1, visual: { widget: 'numdiff', caption: 'Pure advection, no physical diffusion. The bell still spreads, by exactly vΔx(1 − C)/2 per unit time. Make Δx smaller and the smear shrinks; make C = vΔt/Δx closer to 1 and it shrinks too.' },
    step: S('Numerical diffusion: the smear the scheme adds',
      'With D = 0 the true bell would keep its width forever, yet upwind widens it. The scheme adds a diffusion of its own, and you can predict exactly how much. A number like that tells you when to trust a run.',
      ['Taylor-expand the upwind update. With {{C = v*dt/dx}} (the Courant number), it turns out to solve not ∂c/∂t + v∂c/∂x = 0 but that plus **D_num·∂²c/∂x²**, with **D_num = v·Δx·(1 − C)/2**.',
       'Write {{numerical_diffusion(v, dx, dt)}} returning that number. For the defaults: 1 × 0.05 × 0.98 / 2 = **0.0245 m²/s**.',
       'A diffusing bell’s variance grows by 2·D·t. So after 10 s with no physical diffusion the variance should be 0.25 + 2 × 0.0245 × 10 = **0.74**. Run it.',
       'Write {{cell_peclet(v, dx, D)}} = {{v*dx/D}}. It compares carrying to spreading over one grid cell. Central differences ripple when it is above 2; upwind does not ripple, but its smear matters when D_num is not small next to D.',
       'Add the checks below to **tests/test_plume.py** and run them.',
       'For your 24-hour river spill (step 6): D_num = 0.5 × 10 × (1 − 0.05)/2 ≈ **2.4 m²/s**, about 8% of D = 30. Write in **README.md** whether that matters, and redo the exact spread with D + D_num.'],
      'python -m pytest -q tests/test_plume.py',
      'All checks pass. The measured variances are 0.74, 0.49 and 0.65 for the three grids, exactly what the formula predicts. With D + D_num the spill’s spread is predicted as **2.37 km**, which is what the simulation prints.',
      'The first check you wrote said the variance stays under 0.8, not under 0.35. The original guide demanded 0.35, which upwind can never achieve at this Δx. That is why it was changed (audit A4).',
      NUMDIFF_TEST) }],
  s4p3: [{ key: 'a:B7-gillespie', item: 'B7', after: 2, visual: { widget: 'ssa', caption: 'Twenty exact random epidemics in one town (grey), their mean (blue) and the equations (white). Individual runs wander; the mean follows the equations.' },
    step: S('A third model in between: the exact random version',
      'Your agent model makes daily steps and your equations are smooth averages. The Gillespie algorithm is the exact random version of the same equations, one event at a time. If all three agree on average, you have a chain of evidence that each one is right.',
      ['Create **src/ssa.py**. Write {{gillespie_seir(N, beta, sigma, gamma, I0, t_end, seed=None)}}. Start with {{S, E, I, R = N - I0, 0, I0, 0}} and {{t = 0}}.',
       'In a loop: the three event rates are {{beta*S*I/N}} (infection), {{sigma*E}} (becoming infectious) and {{gamma*I}} (recovery). Add them up to {{total}}; stop if it is 0.',
       'The waiting time to the next event is random: {{t += rng.exponential(1 / total)}}. Which event it is: draw {{u = rng.random() * total}} and pick the first rate whose running sum passes u. Apply that one change, store t and the four counts. Stop when t passes t_end.',
       'Return {{(times, states)}} as numpy arrays, states with one row per event.',
       'Write {{ode_peak_and_final(N, beta, sigma, gamma, I0)}}: run the SEIR equations with RK4 (dt 0.1, 200 days) and return the highest I and the number who were ever infected, {{N - S}} at the end.',
       'Add the checks below to **tests/test_agents.py**: the equations, 40 Gillespie runs and 40 agent runs must agree on the peak and the final size.',
       'In **README.md**: the three peak days. Why is the agent model’s peak about three days later?'],
      'python -m pytest -q tests/test_agents.py',
      'All checks pass. Mean peaks: equations **612**, Gillespie **628**, agents **638** infectious. Final size about **1986** for all three. Peak day: about 34 for the equations and Gillespie, about 37 for the agents.',
      'The agents are three days late because they move in whole days and use the state from the start of each day. Infections made today cannot spread until tomorrow.',
      SSA_TEST) }],
  s4p4: [{ key: 'a:B5-sparse', item: 'B5', after: 2, visual: { widget: 'sparsity', caption: 'The stiffness matrix of a long bridge. Every dot is a non-zero number; everything else is zero. Add panels and watch the dense size explode while the dots stay a thin band.' },
    step: S('Sparse matrices: solve a 2000-node bridge',
      'Each node only touches its neighbours, so almost every entry of K is zero. Storing and eliminating all those zeros is what makes a dense solver slow. Sparse storage keeps only the non-zeros.',
      ['Copy **solver.py** from your matrix-solver project into **src/**. Its {{gaussian_pivoted}} solves the small hand case exactly as numpy does. The check below proves it.',
       'Write {{stiffness_sparse(nodes, members)}}: build three lists, {{rows}}, {{cols}} and {{vals}}. For every member and each of its four 3×3 blocks add the 9 entries (with the same + and − signs as before). Then {{scipy.sparse.csr_matrix((vals, (rows, cols)), shape=(3n, 3n))}} adds up repeated positions for you.',
       'Write {{solve_truss_sparse(nodes, members, fixed, loads)}}: the same as {{solve_truss}}, but take the free part with {{K[free][:, free]}} and solve with {{scipy.sparse.linalg.spsolve}}.',
       'Write {{long_bridge(panels)}}: the same pattern as {{make_bridge}} repeated. Bottom nodes at x = 0, 2, 4, … on both sides (z = 0 and 2), top nodes at x = 1, 3, 5, … with y = 1.5. On each side: bottom chord, the two diagonals of each panel, top chord. Across: a bar at every bottom and top node, plus three braces per panel (bottom k on side 0 to bottom k+1 on side 1, bottom k+1 on side 0 to top k on side 1, top k on side 0 to top k+1 on side 1). Pin the four end nodes; load every other bottom node with 100 N down.',
       'Add the checks below to **tests/test_truss.py** and run them.',
       'Make **timing.py**: for {{long_bridge(500)}} (2002 nodes, 6006 unknowns) time both solvers and print the memory: dense needs 6006² × 8 bytes; sparse needs {{K.data.nbytes + K.indices.nbytes + K.indptr.nbytes}}. Write both in **README.md**.'],
      'python -m pytest -q tests/test_truss.py',
      'All checks pass. For 2002 nodes the dense matrix takes **289 MB** and several seconds to solve; the sparse one takes about **1.6 MB** and a fraction of a second, with the same answer. Only **0.37%** of the entries are not zero.',
      'If the dense run fails with a memory error, try {{long_bridge(250)}}. The comparison is the point, not the size.',
      SPARSE_TEST) }],
  s4p5: [
    { key: 'a:B6-mk-rigour', item: 'B6', after: 1, visual: { widget: 'fdr', caption: '64 tests, p-values sorted. The dashed line is 0.05 for every test; the slanted line is Benjamini–Hochberg. Only p-values under the slanted line are kept, which limits the share of false discoveries to about 5%.' },
      step: S('Make the test honest: ties, memory, and 64 tests at once',
        'The plain Mann–Kendall test assumes no tied values and no memory from year to year. Rain breaks both. And with 64 places, some will look significant by pure luck. Three fixes turn “some cells passed” into a claim you can defend.',
        ['**Ties.** Write {{mk_z_ties(values)}}: the same as {{mk_z}}, but subtract a term for every group of equal values from the variance. For a group of size t, subtract {{t*(t-1)*(2*t+5)}} before dividing by 18. Use {{numpy.unique(values, return_counts=True)}}.',
         '**Memory.** A wet year is often followed by another, which makes the plain test cry wolf. Write {{lag1(values)}}, the lag-1 autocorrelation {{sum(d[:-1]*d[1:]) / sum(d*d)}} with {{d = values - mean}}. Then {{prewhiten(values)}} returns {{values[1:] - r1 * values[:-1]}}. Run the test on that.',
         '**Many tests.** Write {{bh_reject(pvalues, q=0.05)}} (Benjamini–Hochberg). Sort the m p-values. Find the largest rank k with {{p_(k) <= q*k/m}}. Reject the k smallest; return one True or False per place, in the original order.',
         'Add the checks below to **tests/test_mk.py** and run them. The second one makes 400 series with memory but no trend at all, and counts the false alarms.',
         'On your 64 places: report how many are significant (1) with the plain test, (2) after prewhitening, and (3) after Benjamini–Hochberg. Grey out the rest on the map.'],
        'python -m pytest -q tests/test_mk.py',
        'All checks pass. The tie correction moves z from 1.359 to 1.445. On series with memory (lag-1 correlation 0.6) and no trend, the plain test says “significant” **29%** of the time; after prewhitening **5.5%**, close to the promised 5%.',
        'Prewhitening has a price: it also makes real trends harder to detect. On simulated series with a real trend, detection fell from about 93% to about 51%. Say this in README.md when you report your count.',
        MK_RIGOUR_TEST) },
    { key: 'a:B5-eof', item: 'B5', after: 5, visual: { widget: 'eof', caption: 'A field made of one planted pattern plus noise. The first EOF finds the pattern (left) and its rise and fall over the years (right). Add noise and watch the explained share drop.' },
      step: S('The main pattern of the whole map: EOF analysis',
        'Testing 64 places one by one ignores that neighbours move together. An EOF (also called PCA) finds the few map patterns that explain most of the year-to-year change, and when each one was strong.',
        ['Create **src/eof.py**. Write {{eofs(field)}}, where {{field}} has one row per year and one column per place (33 × 64).',
         'Subtract each column’s mean (the anomaly). Then {{U, s, Vt = numpy.linalg.svd(anomaly, full_matrices=False)}}.',
         'The rows of {{Vt}} are the patterns (EOFs). {{U * s}} gives their strength in each year (the principal components). The share of variance each one explains is {{s**2 / sum(s**2)}}. Return {{(Vt, U * s, explained)}}.',
         'Add the check below in **tests/test_eof.py**: a planted pattern must come back.',
         'On your rain data: paint EOF 1 on the 8 × 8 map (key **E**), plot its series under it, and write in **README.md** how much of the variance it explains and what its shape suggests.'],
        'python -m pytest -q tests/test_eof.py',
        'The check passes: the planted pattern comes back with correlation above 0.99 and explains **99.5%** of the variance. On real rain the first EOF usually explains far less; report what you get.',
        'The sign of an EOF is arbitrary: the pattern times −1 with its series times −1 is the same thing. Compare shapes, not signs.',
        EOF_TEST) },
  ],
  s4p7: [{ key: 'a:B8-turing', item: 'B8', after: 1, visual: { widget: 'turing', caption: 'Growth rate of a disturbance against its wave size s, for the uniform state. Above zero means a pattern grows. Change Dv: when it equals Du the curve never crosses zero.' },
    step: S('Linear stability: when does a flat dish make a pattern?',
      'Turing’s idea: a uniform mixture that is stable on its own can become unstable when the two chemicals spread at different speeds. You can test that with a 2×2 matrix before running anything.',
      ['Create **src/turing.py**. Write {{uniform_states(f, k)}}: the flat states other than the empty dish U = 1, V = 0. They satisfy {{U*V = f + k}} and {{(f + k)*V**2 - f*V + f*(f + k) = 0}}. If {{f*f - 4*f*(f + k)**2 < 0}} there are none: return []. Otherwise return the two {{(U, V)}} pairs, larger V first.',
       'The Jacobian of the reaction part at (U, V) is {{[[-V*V - f, -2*U*V], [V*V, 2*U*V - (f + k)]]}}.',
       'A small wave disturbance with wave size s grows at the largest real part of the eigenvalues of {{J - s * diag(Du, Dv)}}. On this grid, with your nine-point Laplacian, s runs from 0 to 1.6. Write {{growth_rate(U, V, f, k, Du, Dv)}}: try 321 values of s from 0 to 1.6 and return the biggest real part found.',
       'If it is positive, the flat state breaks up into a pattern. If it is positive only because Du ≠ Dv, that is a **Turing instability**.',
       'Add the checks below in **tests/test_turing.py** and run them.',
       'In **README.md**: one sentence each on (0.055, 0.062), which grows a pattern, and (0.06, 0.0609), which stays flat. Also say why the “spots” preset needs the starting square: it has no flat partner state at all, so its spots grow from a big local kick, not from a slow instability.'],
      'python -m pytest -q tests/test_turing.py',
      'All checks pass. At (0.055, 0.062), next to the coral preset, the flat state is stable without diffusion but grows at **+0.009** per step with Du/Dv = 2, and is stable again if Du = Dv. At (0.06, 0.0609) it stays stable. Spots have no flat partner state.',
      'If every growth rate is negative, check the sign of the diffusion term: you subtract s·Du and s·Dv, because diffusion damps short waves.',
      TURING_TEST) }],
};

/* ------------------------------------------------------------------ new project s4p8 */
const POISSON_TEST_1 = `import math
import numpy as np
from pytest import approx
from src.poisson import grid, laplacian_matrix, solve_direct

def test_matrix_shape_and_entries():
    A = laplacian_matrix(3)                    # 3 x 3 interior points, h = 1/4
    assert A.shape == (9, 9)
    assert abs(A - A.T).max() == 0             # symmetric
    assert A[4, 4] == approx(64.0)             # 4 / h²
    assert A[4, 1] == approx(-16.0) and A[4, 3] == approx(-16.0)

def manufactured(N):
    x, h = grid(N)
    X, Y = np.meshgrid(x, x, indexing="ij")
    return 2 * math.pi**2 * np.sin(math.pi * X) * np.sin(math.pi * Y), np.sin(math.pi * X) * np.sin(math.pi * Y)

def test_second_order_accurate():
    errs = []
    for N in (15, 31):
        f, exact = manufactured(N)
        errs.append(np.max(np.abs(solve_direct(f) - exact)))
    assert errs[1] < 1e-3
    assert errs[0] / errs[1] == approx(4.0, abs=0.2)`;

const POISSON_TEST_2 = `from src.poisson import jacobi, sor, omega_opt

def test_gauss_seidel_is_twice_as_fast_as_jacobi():
    f = np.ones((15, 15))
    _, n_jacobi = jacobi(f)
    _, n_gs = sor(f, 1.0)
    assert 0.45 < n_gs / n_jacobi < 0.55

def test_sor_is_much_faster_again():
    f = np.ones((15, 15))
    _, n_gs = sor(f, 1.0)
    _, n_sor = sor(f, omega_opt(15))
    assert n_sor < n_gs / 5`;

const POISSON_TEST_3 = `def test_best_omega_matches_theory():
    f = np.ones((15, 15))
    scan = [(sor(f, w)[1], w) for w in np.arange(1.50, 1.86, 0.01)]
    best = min(scan)[1]
    assert abs(best - omega_opt(15)) / omega_opt(15) < 0.02`;

const POISSON_TEST_4 = `from src.poisson import conjugate_gradient

def test_cg_matches_direct_and_scales_like_n():
    its = []
    for N in (15, 31):
        f = np.ones((N, N))
        u, n = conjugate_gradient(laplacian_matrix(N), f.ravel(), tol=1e-6)
        assert np.allclose(u.reshape(N, N), solve_direct(f), rtol=1e-4)
        its.append(n)
    assert 1.8 < its[1] / its[0] < 2.2          # double N, double the iterations (Jacobi: four times)`;

const POISSON_TEST_5 = `from src.poisson import charges

def test_point_charge_potential():
    N = 63
    u = solve_direct(charges(N, [(0.5, 0.5, 1.0)]))
    c = 31                                      # the charge's cell
    numeric = u[c + 4, c] - u[c + 12, c]
    theory = math.log(12 / 4) / (2 * math.pi)   # 2D point charge: φ = −(q/2π)·ln r + constant
    assert numeric == approx(theory, rel=0.02)`;

/* ------------------------------------------------------------------ new project s4p9 */
const ISING_TEST_1 = `import math
import numpy as np
from pytest import approx
from src.ising import energy, magnetisation, delta_e, exact_average_energy

def test_energy_of_simple_states():
    up = np.ones((4, 4), int)
    assert energy(up) == -32                    # 16 sites x 2 bonds each, all aligned
    assert magnetisation(up) == 16
    checker = np.indices((4, 4)).sum(axis=0) % 2 * 2 - 1
    assert energy(checker) == 32                # every bond broken

def test_delta_e_matches_a_full_recount():
    s = np.random.default_rng(0).choice([-1, 1], (6, 6))
    for i, j in [(0, 0), (2, 3), (5, 5)]:
        t = s.copy(); t[i, j] *= -1
        assert delta_e(s, i, j) == energy(t) - energy(s)

def test_exact_2x2_by_listing_all_16_states():
    Z = 2 * math.exp(8 / 2.0) + 12 + 2 * math.exp(-8 / 2.0)
    assert exact_average_energy(2.0, L=2) == approx((-8 * 2 * math.exp(4) + 8 * 2 * math.exp(-4)) / Z)
    assert exact_average_energy(2.0, L=2) == approx(-7.2033, abs=1e-4)`;

const ISING_TEST_2 = `from src.ising import run

def test_metropolis_reproduces_the_exact_4x4_energy():
    exact = exact_average_energy(2.5, L=4)
    Es, Ms, _ = run(4, 2.5, 20000, seed=0)
    assert Es.mean() == approx(exact, abs=0.3)`;

const ISING_TEST_3 = `from src.ising import autocorr_time

def test_ordered_and_disordered_phases():
    _, M_cold, _ = run(16, 1.5, 4000, seed=1)
    _, M_hot, _ = run(16, 3.0, 4000, seed=1)
    assert M_cold.mean() / 256 > 0.95
    assert M_hot.mean() / 256 < 0.3

def test_critical_slowing_down():
    _, M_crit, _ = run(16, 2.27, 4000, seed=1)
    _, M_hot, _ = run(16, 3.0, 4000, seed=1)
    assert autocorr_time(M_crit) > 3 * autocorr_time(M_hot)`;

const ISING_TEST_4 = `from src.ising import specific_heat

def test_specific_heat_peak_finds_tc():
    temps = np.round(np.arange(2.0, 2.61, 0.05), 2)
    C = [specific_heat(run(16, T, 4000, seed=0)[0], T, 256) for T in temps]
    t_peak = temps[int(np.argmax(C))]
    assert abs(t_peak - 2.269) / 2.269 < 0.03`;

export const NEW_GUIDES: Record<string, Guide> = {
  s4p8: {
    slug: 'poisson-solvers', pip: ['numpy', 'scipy', 'pygame', 'pytest'],
    files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/poisson.py', 'grid, matrix, direct solve, Jacobi, SOR, conjugate gradient, charges'],
      ['src/main.py', 'pygame window: the potential, and solvers racing'], ['tests/test_poisson.py', 'checks'], ['rates.py', 'the iteration table for README.md']],
    words: [['Poisson equation', '−∇²u = f: the shape u that a source f produces, like the potential of charges or the steady temperature of a heated plate'],
      ['Five-point Laplacian', 'the grid version of ∇²: four neighbours minus four times the centre, divided by h²'],
      ['Direct solver', 'eliminates the whole system at once; exact but costly for big grids'],
      ['Iterative solver', 'improves a guess again and again until the residual is small'],
      ['Residual', 'how far the current guess is from satisfying the equations, f − A·u'],
      ['SOR', 'Gauss–Seidel with each correction stretched by a factor ω between 1 and 2'],
      ['Conjugate gradient', 'an iterative method for symmetric positive matrices that picks each new direction so it never undoes earlier progress']],
    steps: [
      S('Write the first checks', 'A problem with a known answer, and the matrix written down small enough to check by eye.',
        ['Open **tests/test_poisson.py**. Write the code below. Run it. It fails.',
         'The square is 0 to 1 in x and y. The walls are held at 0. There are N × N points inside, spaced {{h = 1/(N + 1)}}.',
         'If {{f = 2π²·sin(πx)·sin(πy)}}, the exact answer is {{u = sin(πx)·sin(πy)}}. You can check by differentiating twice. Problems built backwards from a chosen answer like this are called manufactured solutions.'],
        'python -m pytest -q tests/test_poisson.py', 'A red **ImportError**.',
        'With N = 3, h = 1/4 and 1/h² = 16. The middle point has four neighbours: its row has 64 on the diagonal and −16 four times.', POISSON_TEST_1),
      S('Build the matrix and solve directly', 'Every unknown is tied to its four neighbours. scipy can build that pattern for any N in two lines.',
        ['Open **src/poisson.py**. Write {{grid(N)}} returning {{(x, h)}}, where {{x}} is the N interior coordinates.',
         'Write {{laplacian_matrix(N)}}: the 1D matrix is {{T = scipy.sparse.diags([-1.0, 2.0, -1.0], [-1, 0, 1], shape=(N, N))}}. In 2D it is {{(kron(I, T) + kron(T, I)) / h**2}} with {{I = scipy.sparse.identity(N)}}. Return it as CSR with {{.tocsr()}}.',
         'Point (i, j) is number {{i*N + j}} in the long vector. That is exactly the order {{f.ravel()}} uses.',
         'Write {{solve_direct(f)}}: {{scipy.sparse.linalg.spsolve(A.tocsc(), f.ravel()).reshape(N, N)}}.'],
        'python -m pytest -q tests/test_poisson.py', '**2 passed** in green. The error falls by a factor of **4.0** when N goes from 15 to 31: second order.',
        'If the error does not fall, check that x leaves out the walls: {{numpy.linspace(h, 1 - h, N)}}.'),
      S('Open an empty pygame window', 'Before any physics, prove that a window opens and closes.',
        ['Open **src/main.py**.', 'Copy the **pygame window template** from the Setup page (section "Template: a pygame window") and paste it in.', 'Change the caption text to **Poisson Solvers**.', 'Save the file.'],
        'python -m src.main', 'A dark window opens with a green dot and the words **It works!**. Closing it ends the program with no red text.', 'If nothing happens, check that your terminal line starts with **(.venv)**.'),
      S('Paint the potential of two charges', 'See the answer before racing solvers to it.',
        ['Write {{charges(N, items)}}: a source array where each {{(x, y, q)}} adds {{q / h**2}} to the nearest cell. Dividing by h² makes the total charge q, whatever the grid.',
         'In **src/main.py**: N = 63, a +1 charge at (0.3, 0.5) and a −1 charge at (0.7, 0.5). Solve directly.',
         'Draw u as colours, 8 pixels per cell: red where positive, blue where negative, brightness growing with |u|.',
         'Draw equipotential lines: wherever u crosses a multiple of 0.02, darken the cell.'],
        'python -m src.main', 'A red hill around the + charge and a blue pit around the − charge, with rings of equal potential bending between them and squashed flat against the walls.', null),
      S('Jacobi and Gauss–Seidel', 'For a million unknowns a direct solve is too slow. Iterate instead: replace each value by the average of its neighbours plus the source, and repeat.',
        ['Write {{residual(u, f)}}: apply the five-point rule to u (pad it with a ring of zeros using {{numpy.pad(u, 1)}}), subtract from f, and return the size of that divided by the size of f.',
         'Write {{jacobi(f, tol=1e-6)}}: start from zeros. Each sweep, every point becomes {{0.25 * (up + down + left + right + h*h*f)}}, all computed from the OLD values. Stop when the residual is below tol. Return {{(u, iterations)}}.',
         'Write {{sor(f, omega=1.0, tol=1e-6)}}. Colour the points like a chessboard: red where {{(i + j) % 2 == 0}}, black otherwise. A red point’s neighbours are all black. Update all red points from the current black ones, then all black points from the NEW red ones. Each point moves to {{(1 - omega) * old + omega * (that same average)}}. With omega = 1 this is Gauss–Seidel.',
         'Add the checks below and run them. The source is {{f = 1}} everywhere.'],
        'python -m pytest -q tests/test_poisson.py', 'All checks pass. For N = 15, Jacobi needs **705** sweeps and Gauss–Seidel **362**, about half, because it uses new values as soon as they exist.',
        'If Jacobi never finishes, check that the update reads only old values: compute the whole new array from the padded old one in one line.', POISSON_TEST_2),
      S('SOR and the best ω', 'Gauss–Seidel creeps; stretching each step by ω overshoots on purpose and gets there much sooner. Theory says the best stretch is ω = 2/(1 + sin(πh)).',
        ['Write {{omega_opt(N)}} = {{2 / (1 + sin(π/(N + 1)))}}.',
         'Make the scan from the check below: count SOR iterations for ω from 1.50 to 1.85 in steps of 0.01.',
         'In the window, key **W**: plot iterations against ω, with a vertical line at {{omega_opt}}.',
         'Add the check and run it.'],
        'python -m pytest -q tests/test_poisson.py', 'All checks pass. For N = 15 the scan’s best ω is **1.69**, within 1% of the theory value **1.674**, and SOR needs only **48** sweeps against 362 for Gauss–Seidel.',
        'The iteration count jumps around a little near the best ω. Look at the bottom of the valley, not the single lowest point.', POISSON_TEST_3),
      S('Conjugate gradient', 'For symmetric matrices like this one there is a smarter iteration. Each new search direction is chosen so that it never undoes the progress of the earlier ones.',
        ['Write {{conjugate_gradient(A, b, tol=1e-6)}}. Start with {{x = 0}}, {{r = b}}, {{p = r}}, {{rr = r @ r}}.',
         'Each iteration: {{Ap = A @ p}}, {{a = rr / (p @ Ap)}}, {{x += a*p}}, {{r -= a*Ap}}, {{rr_new = r @ r}}. Stop when {{sqrt(rr_new) / norm(b) < tol}}. Otherwise {{p = r + (rr_new / rr) * p}} and {{rr = rr_new}}.',
         'It only ever multiplies A by a vector, so it never needs A written out densely.',
         'Add the check and run it.'],
        'python -m pytest -q tests/test_poisson.py', 'All checks pass. CG takes **24** iterations at N = 15 and **50** at N = 31: double N, double the work. Jacobi’s count goes up four times.',
        'If CG finishes in 1 iteration, your f is a single sine mode, an eigenvector of A. Use f = 1 to see real behaviour.', POISSON_TEST_4),
      S('Iterations against grid size', 'The number that decides which solver you use on a big problem.',
        ['Make **rates.py**: for N = 15, 31 and 63 with f = 1, print the iterations of Jacobi, Gauss–Seidel, SOR at {{omega_opt(N)}}, and CG.',
         'In the window, key **R**: race all four on N = 31, drawing the residual of each against iteration on a log scale.',
         'Put the table in **README.md** and say how each count grows when N doubles.'],
        'python rates.py', 'About **705, 2825, 11300** for Jacobi (×4 each time), half of that for Gauss–Seidel, **48, 100, 208** for SOR (×2) and **24, 50, 100** for CG (×2). The N = 63 Jacobi run takes a few seconds.',
        'The audit promised that CG would finish within N iterations. Measured, it takes about 1.6N. What holds is that it grows like N, not N².'),
      S('Check against the point-charge law', 'Finish by comparing with physics you can write down: in 2D, a point charge’s potential falls like −(q/2π)·ln r.',
        ['Put one charge q = 1 at the centre of an N = 63 box and solve directly.',
         'Compare the potential 4 cells and 12 cells to the right of the charge. The law says the difference should be {{ln(12/4) / (2π) = 0.1748}}, whatever the constant.',
         'Add the check and run it. Then, in **README.md**, say why points next to the charge, or near the walls, follow the law less well.'],
        'python -m pytest -q tests/test_poisson.py', 'All checks pass. The grid gives **0.1760** against the law’s **0.1748**, within 1%.', null, POISSON_TEST_5),
    ],
    done: ['{{python -m pytest -q}} prints **7 passed**.', 'The window shows the two-charge potential with equipotential lines.', 'Your ω scan has its lowest point within 2% of 2/(1 + sin πh).', 'README.md has the iteration table and how each count grows with N.', 'Your point-charge check agrees with −(q/2π)·ln r.', 'Everything is saved with git.'],
    stuck: [['The direct solution has the right shape but the wrong size.', 'Check the 1/h² in the matrix and that the charge adds q/h², not q.'],
      ['SOR is slower than Gauss–Seidel.', 'ω must be between 1 and 2, and the update is (1 − ω)·old + ω·new average, not the other way round.'],
      ['CG blows up.', 'The matrix must be the positive one (2 on the diagonal of T, not −2). Check {{p @ Ap}} is positive.']],
  },
  s4p9: {
    slug: 'ising-model', pip: ['numpy', 'pygame', 'pytest'],
    files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/ising.py', 'energy, Metropolis sweep, measurements'],
      ['src/main.py', 'pygame window: the lattice live, and the curves'], ['tests/test_ising.py', 'checks'], ['scan.py', 'the temperature scan for README.md']],
    words: [['Spin', 'a tiny magnet that points up (+1) or down (−1)'],
      ['Ising model', 'spins on a grid; neighbours that agree lower the energy'],
      ['Temperature T', 'how much random shaking there is; high T scrambles the spins'],
      ['Boltzmann weight', 'the chance of a state at temperature T is proportional to e^(−E/T)'],
      ['Detailed balance', 'in equilibrium, every move happens as often as its reverse'],
      ['Metropolis rule', 'try flipping a spin; always accept if the energy falls, otherwise accept with chance e^(−ΔE/T)'],
      ['Autocorrelation time', 'how many sweeps until a measurement forgets its earlier value'],
      ['Critical temperature', 'T_c = 2/ln(1 + √2) ≈ 2.269: below it the grid magnetises, above it it does not']],
    steps: [
      S('Write the first checks', 'Energy and its change must be exactly right before anything random happens.',
        ['Open **tests/test_ising.py**. Write the code below. Run it. It fails.',
         'Energy: {{E = −Σ s_i·s_j}} over every pair of neighbours, each pair counted once. The grid wraps around at the edges, so the right neighbour of the last column is the first column.',
         'A 2 × 2 grid has only 2⁴ = 16 states, so you can list them all and get the exact average energy at any temperature.'],
        'python -m pytest -q tests/test_ising.py', 'A red **ImportError**.',
        'On a 2 × 2 grid with wrap-around each pair of neighbours is joined twice (once each way round), so all-up has E = −8.', ISING_TEST_1),
      S('Energy, magnetisation, and the cost of a flip', 'Three short functions; the third is the one the simulation calls millions of times.',
        ['Open **src/ising.py**. Write {{energy(s)}}: {{-numpy.sum(s * (numpy.roll(s, -1, 0) + numpy.roll(s, -1, 1)))}}. Right and down neighbours only, so each pair counts once.',
         'Write {{magnetisation(s)}}: the sum of all spins.',
         'Write {{delta_e(s, i, j)}}: flipping one spin only changes its four bonds, so ΔE = {{2 * s[i, j] * (sum of its four neighbours)}}, wrapping with {{% L}}.',
         'Write {{exact_average_energy(T, L=2)}}: loop over {{itertools.product((-1, 1), repeat=L*L)}}, reshape each to L × L, and return {{Σ E·e^(−E/T) / Σ e^(−E/T)}}.'],
        'python -m pytest -q tests/test_ising.py', '**3 passed** in green. At T = 2 the exact 2 × 2 average energy is **−7.2033**.', null),
      S('The Metropolis sweep, and why it is right', 'You want states to turn up with probability proportional to e^(−E/T). Metropolis does that by a rule that only ever compares two neighbouring states.',
        ['**Detailed balance.** If moves from state A to B happen as often as from B to A, the populations stop changing. That needs P(A)·accept(A→B) = P(B)·accept(B→A), so accept(A→B)/accept(B→A) = e^(−(E_B − E_A)/T).',
         'Metropolis picks {{accept = min(1, e^(−ΔE/T))}}. Check both cases: if ΔE > 0 the ratio is e^(−ΔE/T) / 1; if ΔE < 0 it is 1 / e^(ΔE/T). Both equal e^(−ΔE/T).',
         'Write {{sweep(s, T, rng)}}, chessboard order: first all sites with {{(i + j) % 2 == 0}}, then the rest. For one colour, compute {{dE = 2 * s * neighbours(s)}} for the whole grid at once, draw {{rng.random(s.shape)}}, and flip where the mask is on and the random number is below {{numpy.exp(-dE / T)}}. Same-colour sites never touch, so they can be updated together.',
         'Write {{run(L, T, sweeps, burn=None, seed=None)}}: a random start, {{burn}} sweeps thrown away (default a fifth of {{sweeps}}), then record the energy and |magnetisation| after every sweep. Return {{(energies, magnetisations, s)}}.',
         'Add the check below: on a 4 × 4 grid, 2¹⁶ states can still be listed exactly, so the sampler must match the exact answer.'],
        'python -m pytest -q tests/test_ising.py', 'All checks pass. The Metropolis average on 4 × 4 at T = 2.5 lands within 0.3 of the exact **−22.07**. The run takes a few seconds.',
        'Do not use the chessboard sweep on a 2 × 2 grid. There every site sees the same neighbour twice, and the sweep can no longer reach every state from every other, so it settles on a wrong average (−7.45 instead of −7.20). Use 4 × 4 or bigger.', ISING_TEST_2),
      S('Open an empty pygame window', 'Before any physics, prove that a window opens and closes.',
        ['Open **src/main.py**.', 'Copy the **pygame window template** from the Setup page (section "Template: a pygame window") and paste it in.', 'Change the caption text to **Ising Model**.', 'Save the file.'],
        'python -m src.main', 'A dark window opens with a green dot and the words **It works!**. Closing it ends the program with no red text.', 'If nothing happens, check that your terminal line starts with **(.venv)**.'),
      S('Watch the magnet form', 'The transition is something you can see.',
        ['L = 128, random start. Draw up spins white and down spins dark, 4 pixels each.',
         'Each frame run 2 sweeps. Keys **UP** and **DOWN** change T by 0.05. Show T, the energy per spin and |m| = |M| / L².',
         'Start at T = 3.5 and walk down to 1.5 slowly.'],
        'python -m src.main', 'At T = 3.5 it is salt-and-pepper noise. Near **2.3** the patches grow huge and flicker. Below 2 one colour takes over and |m| climbs towards 1. Quench straight to T = 1.5 from noise and you may see stripes that take a long time to heal.', null),
      S('Two phases, and why you must thin', 'Successive sweeps are not independent samples. Near T_c they remember their past for many sweeps.',
        ['Write {{autocorr_time(x)}}: subtract the mean, then add up the autocorrelation {{c(t) = mean(x[:-t]·x[t:]) / variance}} for t = 1, 2, … until it first drops to 0 or below. Return {{0.5 + that sum}}.',
         'Samples taken {{2·τ}} sweeps apart count as roughly independent. The honest error of a mean is {{std / sqrt(n / (2τ))}}, not {{std / sqrt(n)}}.',
         'Add the checks below and run them. They take a few seconds.'],
        'python -m pytest -q tests/test_ising.py', 'All checks pass. At L = 16: |m| is **0.99** at T = 1.5 and **0.18** at T = 3.0. The autocorrelation time of |M| is about **10** sweeps at T = 2.27 and under **2** at T = 3.0: critical slowing down.', null, ISING_TEST_3),
      S('Find T_c from the specific heat', 'At a phase transition the energy fluctuates wildly. The specific heat measures exactly that, and peaks there.',
        ['Write {{specific_heat(energies, T, N)}} = {{var(energies) / (T² · N)}}, with N = L² spins.',
         'Make **scan.py**: for L = 16 and T from 2.0 to 2.6 in steps of 0.05, run 4000 sweeps and print T, energy per spin, |m| and C.',
         'Add the check below: the T of the biggest C must be within 3% of Onsager’s exact 2.269.',
         'In the window, key **C**: plot E, |m| and C against T from your scan.'],
        'python -m pytest -q tests/test_ising.py', 'All checks pass. The peak sits at **2.25–2.30** depending on the random seed, inside the 3% band around 2.269. The scan takes about 10 seconds.',
        'The curve is noisy. More sweeps smooth it; a finer T grid near the peak sharpens it.', ISING_TEST_4),
      S('Finite-size scaling', 'A real magnet has about 10²³ spins. You have 256. How do you know your answer applies to the real thing?',
        ['Repeat the scan for L = 16, 32 and 64, with a finer T grid from 2.15 to 2.40. L = 64 is slow: run it once, overnight if needed, and save the numbers.',
         'Plot C against T for the three sizes on one chart.',
         'In **README.md**: how do the peak height and the peak position change with L? Theory says the height grows like ln L and the position moves towards 2.269.'],
        'python scan.py', 'The peak gets taller and narrower as L grows, and its position moves towards 2.269. Your exact numbers depend on the sweeps and seeds you use.', null),
    ],
    done: ['{{python -m pytest -q}} prints **7 passed**.', 'You watched the lattice magnetise as T fell through about 2.3.', 'README.md explains detailed balance and why Metropolis satisfies it.', 'Your specific-heat peak is within 3% of 2.269.', 'README.md has the finite-size comparison for L = 16, 32, 64.', 'Everything is saved with git.'],
    stuck: [['The energy test is off by a factor of 2.', 'Count each pair once: right and down neighbours only, not all four.'],
      ['Metropolis gives the wrong average.', 'Recompute dE from the current grid for each colour; flip only the masked sites; and use a grid of at least 4 × 4.'],
      ['Nothing happens at low T.', 'Starting from random spins at T = 1.5 the domains take thousands of sweeps to merge. Start all up, or walk T down slowly.']],
  },
};

export const NEW_STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s4p8: {
    0: { widget: 'poisson', caption: 'The answer your checks know in advance: one smooth hump, sin(πx)·sin(πy).', preset: { mode: 0 } },
    1: { widget: 'poisson', caption: 'Each unknown is joined to four neighbours. The solver finds all of them at once.', preset: { mode: 0 } },
    2: { widget: 'win2d', caption: 'The window for the potential.' },
    3: { widget: 'poisson', caption: 'Two charges, + and −, in a box with walls at zero.', preset: { mode: 1 } },
    4: { widget: 'iterconv', caption: 'Residual against iteration on a log scale. Jacobi crawls; Gauss–Seidel is twice as fast; SOR and CG are in another league.' },
    5: { widget: 'omegascan', caption: 'Iterations for each ω. The valley bottom sits at 2/(1 + sin πh), the dashed line.' },
    6: { widget: 'iterconv', caption: 'CG’s line drops steeply: each step searches in a new direction that keeps earlier gains.', preset: { N: 31 } },
    7: { widget: 'iterconv', caption: 'Double N and compare: Jacobi’s count goes up 4×, SOR and CG only 2×.', preset: { N: 47 } },
    8: { widget: 'poisson', caption: 'One charge in the middle: the rings get farther apart further out, the ln r law.', preset: { mode: 2 } },
  },
  s4p9: {
    0: { widget: 'ising', caption: 'Your checks in picture form: each white or dark square is a spin; neighbours that agree lower the energy.', preset: { T: 3.5 } },
    1: { widget: 'detailedbalance', caption: 'The cost of one flip: ΔE = 2·s·(sum of four neighbours), only ever −8, −4, 0, 4 or 8.' },
    2: { widget: 'detailedbalance', caption: 'Acceptance min(1, e^(−ΔE/T)) for each possible ΔE. The ratio of forward to backward moves is always e^(−ΔE/T): detailed balance.' },
    3: { widget: 'win2d', caption: 'The window for the lattice.' },
    4: { widget: 'ising', caption: 'Slide T down through about 2.3 and watch one colour take over.', preset: { T: 2.27 } },
    5: { widget: 'autocorr', caption: '|m| sweep by sweep, and how fast it forgets its past. Near T_c the memory is long.' },
    6: { widget: 'isingcurves', caption: 'Energy, |m| and specific heat across T for a 16 × 16 grid. The specific heat peaks near 2.269.' },
    7: { widget: 'isingcurves', caption: 'The same scan; bigger grids give taller, sharper peaks closer to 2.269.' },
  },
};
