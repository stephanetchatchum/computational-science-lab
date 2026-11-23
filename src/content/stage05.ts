/**
 * Stage 5: a visual for every build step, the audit rewrites (B2, B3, B4, C5, B1, E1, A1), the D1 rewrite of s5p6
 * as finite-volume shallow water, one A4 correction, and the full guide for s5p7 (Bayesian calibration by MCMC).
 * s5p4 and s5p5 were redesigned as AI projects (Nov 2026): their guides and visuals are in redesigned.ts.
 * Every test below runs against a reference solution in scripts/reference/ (scripts/verify_guides.sh, also in CI).
 */
import type { Guide, GuideStep } from './legacy/curriculum.js';
import type { AddedStep, GuidePatch, Visual } from './stage01';
import { GUIDES as LEGACY } from './legacy/curriculum.js';

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });

export const STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s5p1: {
    0: { widget: 'nbody', caption: 'What your checks protect: hundreds of bodies pulling on each other, every pair, every step.' },
    2: { widget: 'scaling', caption: 'Your timing table as a picture: on log–log axes an O(N²) method is a line of slope 2. Compiled code shifts the line down; only a better algorithm changes its slope.' },
    3: { widget: 'win3d', caption: 'The empty 3D scene for the disc.' },
    4: { widget: 'nbody', caption: 'A rotating disc: clumps and spiral arms grow from gravity alone.', preset: { cold: 0 } },
    5: { widget: 'nbody', caption: 'A cold cloud with no spin collapses into a knot; the spinning disc does not.', preset: { cold: 1 } },
  },
  s5p2: {
    0: { widget: 'fan', caption: 'What the ensemble produces: one epidemic curve per set of inputs, and the band they make together.' },
    2: { widget: 'fan', caption: 'Each line is one draw of (β, σ, γ). Uncertain inputs give a spread of futures.' },
    3: { widget: 'cores', caption: 'Workers share out the runs. The speedup falls short of the number of cores because starting processes and collecting results cost time.' },
    5: { widget: 'win2d', caption: 'The window for the fan chart.' },
    6: { widget: 'fan', caption: 'The fan builds up run by run; the band wobbles at first and then settles.' },
  },
  s5p3: {
    0: { widget: 'heat2d', caption: 'The solver your checks compare: the same heat step, whether numpy or numba runs it.', preset: { r: 0.2 } },
    2: { widget: 'cores', caption: 'Parallel speedup is never free: it depends on whether the work is arithmetic or memory traffic.' },
    3: { widget: 'win2d', caption: 'The window for the high-resolution run.' },
    4: { widget: 'heat2d', caption: 'Same picture at any resolution; only the time per step changes.', preset: { r: 0.24 } },
  },
  s5p6: {
    0: { widget: 'dambreak', caption: 'The checks’ main test, running: a dam vanishes at t = 0. White is Ritter’s exact solution; your solver must land on it.' },
    1: { widget: 'dambreak', caption: 'Finite volumes: every cell keeps its own water; what one face takes out of one cell it puts into the next.' },
    2: { widget: 'dambreak', caption: 'Refine the grid: the curve closes in on the exact solution, slowest at the sharp front.', preset: { n: 400 } },
    3: { widget: 'terrain', caption: 'A real elevation grid: the shape the water will follow.' },
    4: { widget: 'win3d', caption: 'The empty 3D scene for the terrain.' },
    5: { widget: 'terrain', caption: 'Your terrain mesh from above: valleys low and green, ridges high.' },
    6: { widget: 'flood2d', caption: 'Water released upstream follows the valley in real seconds. The two totals must stay equal.' },
    7: { widget: 'flood2d', caption: 'Flooded cells at one moment: the map you would compare with a real flood extent.' },
  },
};

const FAN_SEE = LEGACY.s5p2.steps[6].see!.replace('the median peaks near **0.30** around **day 45**', 'the median curve peaks near **0.27** around **day 45** (lower than the median of the 500 peaks, 0.30, because the runs peak on different days)');

const C_TEST = `from src.ckernel import acc_c

def test_c_kernel_matches_numpy():
    r, m = random_bodies(50)
    assert np.allclose(acc_c(r, m, 0.01), acc_numpy(r, m, 0.01), rtol=1e-12, atol=1e-12)`;

const BH_TEST = `from src.bh import acc_bh, acc_direct_2d

def flat_bodies(n, seed=0):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, 2)), rng.random(n) + 0.5

def test_theta_zero_is_the_direct_sum():
    r, m = flat_bodies(300)
    assert np.allclose(acc_bh(r, m, 0.01, theta=0.0), acc_direct_2d(r, m, 0.01), rtol=1e-9, atol=1e-9)

def test_error_grows_with_theta():
    r, m = flat_bodies(300)
    exact = acc_direct_2d(r, m, 0.01)
    def median_error(theta):
        a = acc_bh(r, m, 0.01, theta)
        return np.median(np.linalg.norm(a - exact, axis=1) / np.linalg.norm(exact, axis=1))
    e25, e50, e100 = median_error(0.25), median_error(0.5), median_error(1.0)
    assert e25 < e50 < e100
    assert e50 < 0.02`;

const POSTERIOR_TEST = `from src.posterior import sample_posterior

def test_posterior_rows_are_real_draws(tmp_path):
    path = tmp_path / "posterior.npz"
    np.savez(path, beta=np.array([0.40, 0.42, 0.38]), gamma=np.array([0.12, 0.13, 0.11]))
    P = sample_posterior(200, seed=0, path=path)
    assert P.shape == (200, 3)
    assert np.allclose(P[:, 1], 1 / 5.2)                       # sigma is fixed
    pairs = {(0.40, 0.12), (0.42, 0.13), (0.38, 0.11)}
    assert all((round(b, 2), round(g, 2)) in pairs for b, _, g in P)   # beta and gamma travel together
    assert np.array_equal(P, sample_posterior(200, seed=0, path=path))`;

const MPI_TEST = `import shutil, subprocess, sys
import pytest
from src.mpi_run import split_indices

def test_split_covers_every_run_once():
    for size in (1, 2, 3, 4):
        got = sorted(i for rank in range(size) for i in split_indices(40, size, rank))
        assert got == list(range(40))

@pytest.mark.skipif(shutil.which("mpiexec") is None, reason="MPI is not installed")
def test_mpi_equals_serial(tmp_path):
    out = tmp_path / "peaks.npy"
    subprocess.run(["mpiexec", "-n", "2", sys.executable, "-m", "src.mpi_run", "40", str(out)], check=True)
    serial = [r[0] for r in run_serial(sample_params(40, seed=1))]
    assert np.allclose(np.load(out), serial)`;

const IMPLICIT_TEST = `from src.kernels import lod_reference, step_implicit_numba

def test_implicit_numba_matches_the_reference():
    a = start(60); b = a.copy()
    for _ in range(10):
        a = lod_reference(a, 2.0)
    b = step_implicit_numba(b, 2.0, 10)
    assert np.allclose(a, b, atol=1e-9)

def test_implicit_is_stable_far_past_the_explicit_limit():
    u = start(60); first = u.max()
    u = step_implicit_numba(u, 5.0, 20)                  # r = 5, twenty times the explicit limit
    assert u.max() < first and u.min() >= -1e-12`;

const FLOOD_TEST_1D = `import math
import numpy as np
from pytest import approx
from src.flood import fill_voids, ritter, run1d, G

def test_fill_voids():
    g = np.array([[1.0, 2.0], [-32768.0, 4.0]])
    out = fill_voids(g)
    assert out.min() > -1000 and np.isfinite(out).all()

def test_ritter_formula():
    c0 = math.sqrt(G * 1.0)
    assert ritter(0.0, 1.0) == approx(4 / 9)          # at the dam: 4/9 of the starting depth
    assert ritter(-2 * c0, 1.0) == approx(1.0)        # far upstream: not reached yet
    assert ritter(3 * c0, 1.0) == approx(0.0)         # beyond the front: still dry

def dam(n):
    edges = np.linspace(-5, 5, n + 1)
    x = 0.5 * (edges[:-1] + edges[1:])
    return x, edges[1] - edges[0], np.where(x < 0, 1.0, 0.0), np.zeros(n)

def test_1d_conserves_water_in_a_closed_channel():
    x, dx, h, q = dam(200)
    total = h.sum() * dx
    h, q, t = run1d(h, q, dx, 3.0)                    # long enough to bounce off both walls
    assert h.sum() * dx == approx(total, rel=1e-12)
    assert h.min() >= 0

def test_dam_break_matches_ritter_and_improves_with_resolution():
    errors = []
    for n in (200, 400):
        x, dx, h, q = dam(n)
        h, q, t = run1d(h, q, dx, 0.5)
        errors.append(np.mean(np.abs(h - ritter(x, t))))
    assert errors[1] < errors[0]
    assert errors[1] < 0.01`;

const FLOOD_TEST_2D = `from src.flood import step2d

def bumpy(n=40):
    y, x = np.mgrid[0:n, 0:n]
    return 2 + np.sin(x / 4.0) * np.cos(y / 5.0) + 0.05 * x

def test_lake_at_rest_stays_at_rest():
    z = bumpy()
    h = np.maximum(0.0, 2.6 - z)                       # a flat lake with dry islands in it
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    for _ in range(200):
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
    assert np.abs(hu).max() < 1e-10 and np.abs(hv).max() < 1e-10

def test_2d_water_is_conserved_and_never_negative():
    z = bumpy()
    h = np.where(np.arange(40)[None, :] < 10, 3.0, 0.0) * np.ones((40, 40))
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    total = h.sum()
    for _ in range(300):
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
    assert h.sum() == approx(total, rel=1e-12)
    assert h.min() >= 0

def test_water_runs_down_into_the_valley_floor():
    n = 40
    z = np.tile(np.abs(np.arange(n) - n // 2) * 0.5, (n, 1)).astype(float)
    h = np.zeros_like(z); h[5:10, 2:5] = 2.0
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    t = 0.0
    while t < 1800:                                    # half an hour of real time
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
        t += dt
    mid = n // 2
    assert h[:, mid - 1: mid + 2].sum() > 0.8 * h.sum()`;

export const PATCHES: Record<string, GuidePatch> = {
  s5p1: {
    steps: {
      4: { item: 'A4', replace: [['Give each an orbital velocity so the disc holds together instead of collapsing: speed {{0.6·sqrt(ρ)}} in the direction perpendicular to its radius, which is {{(-z, 0, x)}} normalised.',
        'Give each body the speed of a circular orbit, so the disc holds together: the mass inside its radius is {{m_in = (number of bodies with a smaller ρ) / 400}}, and the speed is {{sqrt(m_in / ρ)}}, in the direction perpendicular to its radius, {{(-z, 0, x)}} normalised. (The original guide used 0.6·√ρ, which is about 3.6 times too fast: that disc flies apart.)']],
        see: 'A rotating disc of 400 points that keeps its size: measured with these settings, the median radius stays near **3.3** for 10 time units, while the original 0.6·√ρ speeds made it grow past 10. Over longer runs clumps and arm-like streaks may form from gravity alone; how much depends on N and ε, so describe what yours does. Fly the camera above the disc, then edge-on to see how thin it is.' },
      2: { item: 'A4', see: 'Doubling N roughly **quadruples** every column: the O(N²) scaling showing itself. On our machine at N = 400: pure Python about **550 ms**, numpy about **13 ms**, and numba copied exactly from {{acc_python}} also about **14 ms**: only about 40 times faster than Python, because it builds a small array {{d}} for every pair. Rewrite numba’s inner loop with plain numbers ({{dx, dy, dz}} instead of {{d}}) and it drops to about **0.5 ms**, about 1000 times faster than Python. Report your own measured numbers.' },
      1: { item: 'B2', hint: 'Why kick–drift–kick keeps the energy steady (the symplectic idea). Each half of the update is an exact “shear” of positions and velocities, and shears never shrink or stretch areas in the space of (position, velocity). So leapfrog cannot slowly drain or pump energy the way RK4 does: its energy wobbles around a fixed value forever, the bounded line you measured over 1000 orbits in the orbit project. Write that in one paragraph in README.md, with your energy plot.' } },
  },
  s5p2: {
    steps: { 6: { item: 'E1', optional: 'Optional (audit E1): the live fan chart. Keep the static percentile plot, which carries the result.', see: FAN_SEE } },
  },
  s5p6: {
    steps: {
      0: { item: 'D1', t: 'Write the checks: a dam that bursts',
        why: 'A real flood model must move water at the speed real water moves. A bursting dam has an exact answer (Ritter, 1892), so you can check the speed, not just the direction.',
        doAll: [
          'Open **tests/test_flood.py**. Write the code below. Run it. It fails.',
          'The setup: a channel 10 m long with walls at both ends. Water 1 m deep fills the left half; the right half is dry. At t = 0 the dam between them vanishes.',
          'Ritter’s exact answer: with c₀ = √(g·h₀) and ξ = x/t, the depth is h₀ for ξ ≤ −c₀, zero for ξ ≥ 2c₀, and (2c₀ − ξ)²/(9g) in between. At the dam itself (ξ = 0) that is always 4/9 of the starting depth.'],
        see: 'A red **ImportError**.',
        hint: 'The front runs into the dry channel at 2c₀ ≈ 6.3 m/s. A model with no real time in it, like a “move a fraction c of the water each step” rule, cannot even ask this question.',
        code: FLOOD_TEST_1D },
      1: { item: 'D1', t: 'Write the 1D shallow-water solver (finite volumes)',
        why: 'The shallow-water (Saint-Venant) equations are conservation of water and of momentum. A finite-volume method keeps track of what crosses each face between cells, so water can never appear or vanish.',
        doAll: [
          'Open **src/flood.py**. Keep {{fill_voids}} from before (same as the old guide: replace void values with the mean of valid neighbours, repeat, then use the overall mean). Add {{G = 9.81}} and {{DRY = 1e-6}}.',
          'The state in each cell is the depth {{h}} and the discharge {{q = h·u}}. Write {{velocity(h, q)}}: {{q / h}} where {{h > DRY}}, else 0.',
          'Write {{ritter(x, t, x0=0.0, h0=1.0)}} from the formula in the previous step, with {{numpy.where}}.',
          'Write {{rusanov(hL, qL, hR, qR)}}: the flux across one face between a left state and a right state. With u from {{velocity}} and {{a = max(|uL| + √(g·hL), |uR| + √(g·hR))}} (the fastest wave speed at that face): mass flux {{0.5·(hL·uL + hR·uR) − 0.5·a·(hR − hL)}}, momentum flux {{0.5·(hL·uL² + ½g·hL² + hR·uR² + ½g·hR²) − 0.5·a·(hR·uR − hL·uL)}}. Return both and {{a}}. This is the local Lax–Friedrichs (Rusanov) flux.',
          'Write {{step1d(h, q, dx, cfl=0.45)}}. Walls: add one ghost cell at each end with the same depth and the OPPOSITE discharge. Compute every face flux at once with numpy slices. The time step is {{dt = cfl·dx / max(a)}}: no wave may cross more than about half a cell per step. Update {{h -= dt/dx·(F_right − F_left)}} and the same for q. Clip h at 0 and set q to 0 in dry cells. Return {{(h, q, dt)}}.',
          'Write {{run1d(h, q, dx, t_end)}}: call {{step1d}} until the time reaches {{t_end}}; return {{(h, q, t)}}.'],
        see: '**4 passed** in green.',
        hint: 'If water appears from nowhere, your two walls are not mirrors: the ghost cells must copy h and flip the sign of q.' },
      2: { item: 'D1', t: 'Validate against the exact dam break, then measure the error',
        why: 'A test tells you pass or fail. A convergence table tells you how good your solver is and where it struggles.',
        doAll: [
          'Make **dam_check.py** in the project root. For n = 100, 200, 400 and 800 cells, run the dam break to t = 0.5 s and print the mean absolute error against {{ritter}}.',
          'Plot your depth and Ritter’s curve for n = 400 on one chart (matplotlib or pygame).',
          'In **README.md**: the table, and one sentence on why the error halves more slowly than the grid spacing does. Hint: look at the sharp corner at the front of the wave.'],
        run: 'python dam_check.py',
        see: 'Errors fall steadily with n: about **0.016, 0.011, 0.0067, 0.0041**. That is roughly order 0.6–0.7, not 1, because a first-order scheme always smears the sharp front where the depth hits zero.' },
      6: { item: 'D1', t: 'Flood it, in real seconds',
        doAll: [
          'Work out the real cell size of your DEM: north–south {{dy = (north − south)·110574 / (n − 1)}} metres, east–west {{dx = (east − west)·111320·cos(latitude) / (n − 1)}}. For the Kigali box that is about **64 m** by **81 m**.',
          'Build a **second** mesh for the water surface, with the same x and z but height {{(ground + h)·VSCALE}}, semi-transparent blue: {{color=color.rgba(40, 110, 220, 160)}}. Hide dry cells (alpha 0).',
          'Each frame, call {{step2d(ground, h, hu, hv, dx, dy)}} a few times and add up the {{dt}} it returns. Show the simulated clock in hours and minutes. Rebuild only the water mesh.',
          'Add inflow in real units. Key **r**: a river of {{Q}} m³/s entering the lowest cell of one edge, so its depth grows by {{Q·dt / (dx·dy)}} each step. Key **n**: rain of {{R}} mm per hour on every cell, {{R/1000/3600·dt}} metres per step. **c** clears. **up/down** change Q or R.',
          'Show the total volume added and the total on the map, both in m³ ({{h.sum()·dx·dy}}). They must stay equal: your conservation check, live.'],
        see: 'Blue water pours in and follows the real valley floors, filling low ground first while the ridges stay dry. The clock shows real time: with a 50 m³/s river the main channel fills over tens of minutes, not in a few frames. The two volume totals stay equal.' },
      7: { item: 'D1', doAll: [
          'Search for a documented flood in your chosen area and any map of its extent and timing.',
          'If you find one: run your model with an inflow matching the reported event (river discharge or rainfall, in real units) for the reported duration. Mark the cells deeper than 10 cm and report the overlap as **cells in both ÷ cells in either**, a number between 0 and 1.',
          'If you cannot find one, write that plainly in **README.md** and state that your validation rests on the dam-break comparison, the lake-at-rest check and the two conservation checks, not on observations.',
          'Either way, list the model’s limits: 70 × 70 cells of about 70 m cannot resolve channels narrower than that; the Manning coefficient 0.03 is a guess; no infiltration into the ground.'] },
    },
    done: {
      1: { item: 'D1', text: 'Your solver matches the exact dam break, and the error shrinks as the grid gets finer.' },
      2: { item: 'D1', text: 'A lake at rest stays at rest, and water is conserved to rounding error in 1D and 2D.' },
      3: { item: 'D1', text: 'Real 3D terrain floods valley-first, with a real clock and inflow in m³/s or mm/h.' },
    },
    validation: { 0: { item: 'D1', text: 'The solver must reproduce Ritter’s exact dam-break solution (error falling with grid size), keep a lake at rest perfectly still over uneven ground, and conserve water to rounding error.' } },
  },
};

export const ADDED_STEPS: Record<string, AddedStep[]> = {
  s5p1: [
    { key: 'a:B4-c-source', item: 'B4', after: 1, visual: { widget: 'scaling', caption: 'The same O(N²) loop, written in C. Compiled code moves the timing line down; it cannot change its slope.' },
      step: S('Write the force loop in C',
        'Before calling C from Python you need the C. This is the same double loop as {{acc_python}}, in the language most fast scientific code is written in.',
        ['Create **src/force.c** and type the code below. It is C, not Python: every line ends with a semicolon, and every variable has a type ({{int}} for whole numbers, {{double}} for decimals).',
         'The positions arrive as one flat list: body i has x, y, z at {{r[3*i]}}, {{r[3*i+1]}}, {{r[3*i+2]}}. The answer goes into {{a}} the same way.',
         'Compile it into a library. Mac or Linux: {{gcc -O2 -shared -fPIC -o src/force.so src/force.c -lm}}. Windows: install MinGW-w64 and run the same command with {{force.dll}} instead of {{force.so}}.'],
        'gcc -O2 -shared -fPIC -o src/force.so src/force.c -lm',
        'No output means success; a new file **src/force.so** (or force.dll) appears.',
        'If gcc is not found: on Mac run {{xcode-select --install}}; on Ubuntu {{sudo apt install build-essential}}.',
        `#include <math.h>

void accel(int n, const double *r, const double *m, double eps, double *a) {
    for (int i = 0; i < n; i++) {
        double ax = 0, ay = 0, az = 0;
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            double dx = r[3*j] - r[3*i], dy = r[3*j+1] - r[3*i+1], dz = r[3*j+2] - r[3*i+2];
            double r2 = dx*dx + dy*dy + dz*dz + eps*eps;
            double f = m[j] / (r2 * sqrt(r2));
            ax += f * dx; ay += f * dy; az += f * dz;
        }
        a[3*i] = ax; a[3*i+1] = ay; a[3*i+2] = az;
    }
}`) },
    { key: 'a:B4-c', item: 'B4', after: 1, visual: { widget: 'scaling', caption: 'C and numba both turn the same double loop into machine code. They should land close together; numpy pays for building an N × N × 3 array.' },
      step: S('Call the C loop from Python',
        'Numba compiles Python for you. Writing the loop once in C, the language most fast scientific code is still written in, shows you what numba is doing behind the scenes, and how Python calls compiled code.',
        ['Create **src/ckernel.py**. Load the library with {{ctypes.CDLL(path)}}. Tell ctypes the argument types: {{lib.accel.argtypes = [c_int, POINTER(c_double), POINTER(c_double), c_double, POINTER(c_double)]}}.',
         'Write {{acc_c(r, m, eps)}}: make sure {{r}} and {{m}} are contiguous float64 arrays ({{numpy.ascontiguousarray}}), make an output {{a = numpy.zeros_like(r)}}, pass each with {{x.ctypes.data_as(POINTER(c_double))}}, call {{lib.accel(len(m), r, m, eps, a)}}, return {{a}}.',
         'Optional convenience: if the library file is missing, build it from Python with {{subprocess.run(["gcc", ...], check=True)}}.',
         'Add the check below to **tests/test_gravity.py**, and a C column to **bench.py**.'],
      'python -m pytest -q tests/test_gravity.py',
      'All checks pass: the C kernel agrees with numpy to about **1e-15**. In the bench at N = 400, C took about **0.7 ms**. Numba written with plain numbers lands in the same place (about 0.5 ms); both are about 1000 times faster than pure Python.',
      'If Python says it cannot find the library, print the path you are loading. It must point at the file gcc just made.',
      C_TEST) },
    { key: 'a:B3-bh', item: 'B3', after: 2, visual: { widget: 'quadtree', caption: 'The quadtree splits space until every box holds one body. Far boxes count as one mass at their centre; slide θ to see how many boxes one body has to open.' },
      step: S('Barnes–Hut: a better algorithm beats faster hardware',
        'Every version so far does N² pair calculations. A tree groups far-away bodies into one lump, so each body needs only about log N of them. That changes the slope on your timing plot, which no compiler can do.',
        ['Create **src/bh.py**. Work in 2D (x, y); the idea is the same in 3D with eight children instead of four.',
         'Write a class {{Node}} with the box centre {{cx, cy}}, its {{size}}, the total {{mass}}, the mass-weighted sums {{mx, my}} (so the centre of mass is {{mx/mass, my/mass}}), {{kids}} (None, or four children) and {{body}} (None, or one body index).',
         'Write {{insert(node, i, r, m)}}: if the node is empty, store the body there. Otherwise, if it is a leaf, split it into four children of half the size and push the old body down into the right child. Then push body i into its child. Always add body i’s mass to this node’s totals.',
         'Write {{build_tree(r, m)}}: one root box that covers every body, then insert them one by one.',
         'Write {{acc_bh(r, m, eps, theta=0.5)}}: for each body walk the tree. If a node is a leaf, or small compared to its distance ({{size² < theta²·d²}}), use its whole mass at its centre of mass. Otherwise open it and visit its four children. Skip the body’s own leaf.',
         'Write {{acc_direct_2d(r, m, eps)}}, the 2D version of {{acc_numpy}}, to check against. Add the checks below.',
         'Extend **bench.py**: time {{acc_bh}} and {{acc_direct_2d}} for N = 500, 1000, 2000, 4000 and 8000, plot log time against log N, and find the N where the tree wins. Put the plot and the crossover in **README.md**.'],
      'python -m pytest -q tests/test_gravity.py',
      'All checks pass. With θ = 0 the tree is the direct sum, to 1e-11. The median error is about **0.14%** at θ = 0.25, **0.9%** at θ = 0.5 and **5%** at θ = 1. In pure Python the tree’s time roughly doubles when N doubles, while numpy’s quadruples; the tree overtook numpy near **N = 4000** on our machine, and would overtake compiled direct code too at larger N.',
      'A few bodies very close to a lump get errors of 10–20%: the average hides them. That is why real codes pick θ ≈ 0.5 and check the worst cases too.',
      BH_TEST) },
  ],
  s5p2: [
    { key: 'a:C5-posterior', item: 'C5', after: 2, visual: { widget: 'fan', caption: 'Invented bell curves against posterior draws: inputs that were fitted to data give a narrower, honest fan.', preset: { posterior: 1 } },
      step: S('Use the posterior, not invented bell curves',
        'The normal distributions in {{sample_params}} were made up. The Bayesian project (s5p7) gives you samples of (β, γ) that are consistent with real data, including how they depend on each other. Feed those in instead.',
        ['In the Bayesian project, save your samples: {{numpy.savez("posterior.npz", beta=..., gamma=...)}} with one entry per kept sample. Copy that file here.',
         'Create **src/posterior.py**. Write {{sample_posterior(n, seed, path="posterior.npz", sigma=1/5.2)}}: load the file, draw {{n}} row numbers with {{rng.integers(0, number_of_samples, n)}}, and return {{column_stack([beta[k], full(n, sigma), gamma[k]])}}.',
         'Important: draw whole rows. β and γ must stay paired as the sampler found them, because in the posterior they move together. Drawing them separately would break that link.',
         'Add the check below and run it.',
         'Run your bench with {{sample_posterior}} instead of {{sample_params}} and compare the two sets of percentiles in **README.md**.'],
      'python -m pytest -q tests/test_ensemble.py',
      'All checks pass. Using the posterior from s5p7’s fake-data check, the 10th–90th percentile range of peaks was **0.15–0.19**, against **0.21–0.39** with the invented bell curves: the data rule out most of the combinations the bell curves allowed.',
      'If you have not finished s5p7 yet, use the check’s three-row file to try the code, and come back for the real file.',
      POSTERIOR_TEST) },
    { key: 'a:B4-mpi', item: 'B4', after: 4, visual: { widget: 'cores', caption: 'Strong scaling: the same 500 runs on 1, 2 and 4 processes. Ideal is a straight line; real runs bend away as communication and start-up costs grow.', preset: { s: 0.1 } },
      step: S('The same ensemble with MPI',
        'Pool works on one computer. Supercomputers and clusters use MPI: many separate processes, possibly on different machines, that send each other messages. The pattern is the same: split the work, run, gather.',
        ['Install it: {{pip install mpi4py mpich}} on Mac or Linux. On Windows install Microsoft MPI first, then {{pip install mpi4py}}.',
         'Create **src/mpi_run.py**. Write {{split_indices(n, size, rank)}}: the run numbers for one process, {{list(range(rank, n, size))}}. Process 0 takes 0, size, 2·size, …; process 1 takes 1, size + 1, …',
         'Write {{main(n, seed, out)}}: {{from mpi4py import MPI}}, {{comm = MPI.COMM_WORLD}}, get {{rank}} and {{size}}. Every process builds the same {{sample_params(n, seed)}} (same seed, same numbers) and runs only its own share, keeping {{(index, peak)}} pairs.',
         'Collect with {{parts = comm.gather(mine, root=0)}}. On rank 0 only, put each peak back at its index and save the array with {{numpy.save(out, peaks)}}.',
         'At the bottom: {{if __name__ == "__main__": main(int(sys.argv[1]), 1, sys.argv[2])}}.',
         'Run it with {{mpiexec -n 4 python -m src.mpi_run 500 peaks.npy}}. Time it for 1, 2 and 4 processes and put the times and speedups in **README.md**: that is a strong-scaling table.',
         'Add the checks below. The second one runs MPI for real if it is installed, and is skipped if it is not.'],
      'python -m pytest -q tests/test_ensemble.py',
      'All checks pass (the MPI one shows as skipped if MPI is not installed). The MPI peaks equal the serial peaks exactly. Speedup with more processes rises but stays below the process count.',
      'If every process prints the result, you forgot {{if rank == 0}} around the saving.',
      MPI_TEST) },
  ],
  s5p3: [{ key: 'a:B1-implicit', item: 'B1', after: 2, visual: { widget: 'cores', caption: 'Explicit steps are mostly memory traffic, so extra cores barely help. Implicit steps solve one tridiagonal system per row: each solve is sequential, but the rows are independent, so they share out across cores.', preset: { s: 0.05 } },
    step: S('The implicit solver, and where its parallel speed comes from',
      'Your heat-diffusion project showed the implicit scheme is stable at any step size. Each row needs a tridiagonal solve, and one solve cannot be split: every value depends on the one before. So where does parallel speed come from?',
      ['Use the simplest 2D implicit method: backward Euler along x for every row, then backward Euler along y for every column (called LOD, locally one-dimensional). Each direction is the 1D system you solved with {{thomas}}.',
       'Write {{lod_reference(u, r)}} with {{scipy.linalg.solve_banded}}: build the banded matrix {{ab}} with −r above and below the diagonal and 1 + 2r on it, solve all rows at once (pass the interior transposed), then all columns. Keep the edges at 0. This is your correct-but-slow reference.',
       'Write {{thomas_line(d, r, out, cp)}} with {{@njit}}: one Thomas solve for a single line.',
       'Write {{step_implicit_numba(u, r, steps)}} with {{@njit(parallel=True)}}: for each step, {{for i in prange(1, n - 1)}} solve row i with {{thomas_line}} (copy the row in, write the result back), then the same over columns. Give each line its own scratch arrays inside the loop.',
       'Add the checks below and run them.',
       'In **bench.py** time explicit and implicit at n = 1200, each with and without {{parallel=True}} (make a second, serial copy). Report the four times and the two speedups in **README.md**, with one sentence on why they differ.'],
      'python -m pytest -q tests/test_kernels.py',
      'All checks pass: the numba version matches scipy to about **1e-14**, and stays smooth and positive at r = 5. On a 2-core machine the implicit step got about **2×** faster in parallel while the explicit step barely changed. Your numbers depend on your cores and memory.',
      'If the parallel implicit version gives wrong answers, two rows are sharing one scratch array. Create them inside the {{prange}} loop.',
      IMPLICIT_TEST) }],
  s5p6: [{ key: 'a:D1-2d', item: 'D1', after: 2, visual: { widget: 'flood2d', caption: 'Water released on one hillside of a V valley runs down, sloshes, and settles along the valley floor. Friction slows it; the totals never change.' },
    step: S('Two dimensions over real ground: hydrostatic reconstruction',
      'On sloping ground a naive scheme makes a still lake start to flow, because it does not balance the pressure against the slope exactly. Hydrostatic reconstruction fixes that: each face sees the water level, not the raw depth.',
      ['Each cell now holds {{h}}, {{hu}} and {{hv}} (discharge in x and in y) over ground height {{z}}.',
       'Write {{_sweep(z, h, hu, hv)}} for faces in the x direction. Pad every array with one ghost column at each side (same h and z, opposite {{hu}}: walls). For each face take the left and right cells, then {{zs = max(zL, zR)}}, {{hLs = max(0, hL + zL − zs)}}, {{hRs = max(0, hR + zR − zs)}}: the depths as seen over the higher of the two grounds.',
       'Use {{rusanov}} on the reconstructed depths (with the original velocities). The y-momentum is carried with the mass flux, taking v from the upwind side. Then correct the momentum flux for each side: the left cell sees {{fq + ½g(hL² − hLs²)}}, the right cell sees {{fq + ½g(hR² − hRs²)}}. Return the differences across each cell and the largest wave speed.',
       'Write {{step2d(z, h, hu, hv, dx, dy=None, n_manning=0.03, cfl=0.45, dt_max=10.0)}}. Sweep in x, and get y by calling the same sweep on the transposed arrays with {{hv}} and {{hu}} swapped. Choose {{dt = min(dt_max, cfl·min(dx, dy)/max wave speed)}}: on a dry map nothing moves, so without {{dt_max}} the first step would be absurdly long. Update h, hu, hv, clip h at 0.',
       'Friction (Manning): after the update divide both discharges by {{1 + dt·g·n²·|u| / h^(4/3)}}. Dividing, instead of subtracting, can never flip the flow backwards. Dry cells get zero discharge. Return {{(h, hu, hv, dt)}}.',
       'Add the checks below and run them.'],
      'python -m pytest -q tests/test_flood.py',
      'All checks pass. The lake with dry islands stays still to about **1e-15** m/s. Water is conserved to rounding error. After half an hour about **99%** of the released water is on the valley floor.',
      'If the lake starts to move, the momentum correction has the wrong side: the left cell of a face uses hL and hLs, the right cell hR and hRs.',
      FLOOD_TEST_2D) }],
};

/* ------------------------------------------------------------------ new project s5p7 */
const MCMC_TEST_1 = `import math
import numpy as np
from pytest import approx
from src.model import weekly_cases, log_likelihood

def test_poisson_log_likelihood():
    # P(2 | mean 1) * P(0 | mean 1) = (e^-1 / 2) * e^-1
    assert log_likelihood([2, 0], [1.0, 1.0]) == approx(-2 - math.log(2))

def test_epidemic_rises_then_falls():
    w = weekly_cases(0.4, 0.125)
    peak = int(np.argmax(w))
    assert 5 < peak < 20
    assert w[0] < w[peak] and w[-1] < w[peak]
    assert sum(w) < 1e6                                  # nobody is infected twice`;

const MCMC_TEST_2 = `from src.mcmc import metropolis, gelman_rubin

def test_metropolis_samples_a_known_distribution():
    target = lambda th: -0.5 * (math.log(th[0]) / 0.5) ** 2    # log of the sample is normal(0, 0.5)
    chain, rate = metropolis(target, [1.0], 20000, np.array([[0.5 ** 2]]), seed=0)
    logs = np.log(chain[2000:, 0])
    assert abs(logs.mean()) < 0.05
    assert logs.std() == approx(0.5, abs=0.05)
    assert 0.3 < rate < 0.9

def test_gelman_rubin():
    rng = np.random.default_rng(0)
    agree = [rng.normal(size=2000) for _ in range(4)]
    disagree = [rng.normal(loc=k, size=2000) for k in range(4)]
    assert gelman_rubin(agree) < 1.01
    assert gelman_rubin(disagree) > 1.5`;

const MCMC_TEST_3 = `import pytest
from src.mcmc import calibrate

TRUE = [0.4, 0.125, 0.02]                                # beta, gamma, reporting rate
OBS = [int(v) for v in np.random.default_rng(0).poisson(0.02 * np.array(weekly_cases(0.4, 0.125)))]

@pytest.fixture(scope="module")
def fit():
    return calibrate(OBS)                                 # about 10 seconds

def test_recovers_the_truth_from_fake_data(fit):
    chains, rates = fit
    for j, true in enumerate(TRUE):
        assert gelman_rubin([c[:, j] for c in chains]) < 1.05
        lo, hi = np.percentile(np.concatenate([c[:, j] for c in chains]), [2.5, 97.5])
        assert lo < true < hi
    assert all(0.15 < r < 0.6 for r in rates)

def test_posterior_predictive_covers_the_data(fit):
    chains, _ = fit
    draws = np.concatenate(chains)
    rng = np.random.default_rng(5)
    sims = [rng.poisson(draws[i, 2] * np.array(weekly_cases(draws[i, 0], draws[i, 1]))) for i in rng.integers(0, len(draws), 200)]
    lo, hi = np.percentile(sims, [2.5, 97.5], axis=0)
    assert np.mean((np.array(OBS) >= lo) & (np.array(OBS) <= hi)) >= 0.9`;

export const NEW_GUIDES: Record<string, Guide> = {
  s5p7: {
    slug: 'bayes-seir', pip: ['numpy', 'pygame', 'pytest'],
    files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/model.py', 'weekly_cases(), log_likelihood()'],
      ['src/mcmc.py', 'log_posterior(), metropolis(), gelman_rubin(), calibrate()'], ['src/main.py', 'pygame: chains, histograms and the predictive band'],
      ['tests/test_mcmc.py', 'checks'], ['real.py', 'the Rwanda run'], ['posterior.npz', 'saved samples for the ensemble projects']],
    words: [['Prior', 'what you believe about a parameter before seeing the data'],
      ['Likelihood', 'how probable the observed data are, for given parameter values'],
      ['Posterior', 'prior × likelihood, rescaled: what you believe after seeing the data'],
      ['MCMC', 'Markov chain Monte Carlo: a random walk whose visits are samples from the posterior'],
      ['Burn-in', 'the start of a chain, thrown away because it still remembers where it began'],
      ['R̂ (Gelman–Rubin)', 'compares several chains; near 1 means they agree, so they have probably converged'],
      ['Credible interval', 'the middle 95% of the posterior samples for a parameter'],
      ['Posterior predictive check', 'simulate new data from the fitted model and see whether the real data look like them']],
    steps: [
      S('Write the first checks', 'A fast model and an exact likelihood. The sampler will call them tens of thousands of times.',
        ['Open **tests/test_mcmc.py**. Write the code below. Run it. It fails.',
         'The model is your SEIR from the epidemic project, reporting weekly new cases, as in the R_eff fit. The data are counts, so the likelihood is Poisson: the chance of seeing o cases when μ are expected is μ^o·e^(−μ)/o!.'],
        'python -m pytest -q tests/test_mcmc.py', 'A red **ImportError**.',
        'Work on logs: log P = o·log μ − μ − log(o!). Sums of logs never underflow; products of tiny probabilities do.', MCMC_TEST_1),
      S('The model and the likelihood, fast', 'Plain Python floats, no numpy arrays, make each call about a millisecond. That is what makes 10 000 calls affordable.',
        ['Open **src/model.py**. Write {{weekly_cases(beta, gamma, weeks=30, N=1e6, I0=100, s0=1.0, dt=1.0)}}: S, E, I, R as four plain floats, starting at {{(s0·N − I0, 0, I0, (1 − s0)·N)}}, σ fixed at 1/5.2. RK4 with step dt (7 steps per week). Each week, the new cases are how much I + R grew. Return the list.',
         'Write {{log_likelihood(obs, mu)}}: the sum of {{o·log(m) − m − math.lgamma(o + 1)}}, with each m kept at least 1e-9 so log never sees zero.'],
        'python -m pytest -q tests/test_mcmc.py', '**2 passed** in green. With β = 0.4 and γ = 0.125 the weekly cases peak around **week 10**.', null),
      S('Bayes, and the Metropolis walk', 'The posterior is prior × likelihood. You cannot write it down, but you can walk through it so that you visit each place in proportion to how probable it is.',
        ['Open **src/mcmc.py**. Write {{log_posterior(theta, obs, prior_gamma=None, **model)}} for {{theta = (beta, gamma, rho)}}: return −∞ outside 0 < β < 2, 0.02 < γ < 1, 0 < ρ < 1 (the flat prior). Otherwise the log-likelihood of {{obs}} with means {{rho·weekly_cases(beta, gamma, len(obs), **model)}}. If {{prior_gamma = (mean, sd)}} is given, add {{−½((γ − mean)/sd)²}}.',
         'Write {{metropolis(log_target, start, steps, cov, seed)}}. Walk on the log of the parameters, so they stay positive: {{x = log(start)}}. Each step propose {{y = x + L·z}}, where {{L = cholesky(cov)}} and z is standard normal. Accept with probability {{min(1, exp(log_target(exp(y)) − log_target(exp(x))))}}; otherwise stay. Store {{exp(x)}} every step. Return the chain and the share accepted.',
         'Because you walk in log space with no correction, the flat prior is flat in log β, log γ and log ρ. Say so in **README.md**: priors are choices, and you must state them.',
         'Write {{gelman_rubin(chains)}} for one parameter: W is the mean of the chains’ variances, B is n times the variance of their means, and R̂ = √(((n − 1)/n·W + B/n)/W).',
         'Add the checks below. The first runs your sampler on a distribution whose answer you know.'],
        'python -m pytest -q tests/test_mcmc.py', '**4 passed**. The known distribution comes back with mean 0 and spread 0.5 on the log scale, and R̂ tells agreeing chains (about 1.00) from disagreeing ones (well above 1.5).',
        'If the sampler never moves, your proposal is too big; if it accepts almost everything, too small. Around 20–50% accepted is healthy.', MCMC_TEST_2),
      S('Open an empty pygame window', 'Before any physics, prove that a window opens and closes.',
        ['Open **src/main.py**.', 'Copy the **pygame window template** from the Setup page (section "Template: a pygame window") and paste it in.', 'Change the caption text to **Bayes SEIR**.', 'Save the file.'],
        'python -m src.main', 'A dark window opens with a green dot and the words **It works!**. Closing it ends the program with no red text.', 'If nothing happens, check that your terminal line starts with **(.venv)**.'),
      S('Calibrate fake data with a known answer', 'Before real data, prove the whole machine recovers parameters you chose yourself.',
        ['Write {{calibrate(obs, start=(0.5, 0.15, 0.05), pilot=2000, steps=2500, burn=500, seed=0, prior_gamma=None, **model)}}.',
         'Pilot run: {{metropolis}} from {{start}} with small independent steps, {{cov = diag([0.01, 0.01, 0.01])²}}. In this posterior β and γ are tightly linked: a faster spread can be traded for a faster recovery. Blind steps keep missing that narrow ridge.',
         'Learn the shape: {{cov = numpy.cov(log(pilot[pilot//2:]).T) · 2.38² / 3}}. Proposals now follow the ridge. (2.38²/d is the classic scaling for d parameters.)',
         'Four chains: start each from the end of the pilot times 0.9, 1.1, 0.95 and 1.05, run {{steps}} steps with the learned {{cov}}, drop the first {{burn}}. Return the four chains and their acceptance rates.',
         'Add the checks below. They make fake data with β = 0.4, γ = 0.125 and a reporting rate of 2%, then demand that the sampler finds them, that R̂ is below 1.05 and that data simulated from the posterior cover the real data.'],
        'python -m pytest -q tests/test_mcmc.py', 'All **6 passed**, in about 10–20 seconds. Acceptance about **35%**, R̂ about **1.02**. The 95% intervals: β **0.39–0.47**, γ **0.12–0.17**, reporting rate **0.0199–0.0209**, and R₀ = β/γ **2.7–3.3** (true 3.2). Every week of the data lies inside the predictive band.',
        'Without the pilot, the same sampler accepted 2–4% of steps and four chains disagreed (R̂ above 3). The shape matters more than the step size.', MCMC_TEST_3),
      S('Watch the chains', 'Trace plots are how you see whether a sampler is working.',
        ['In **src/main.py** run {{calibrate}} on the fake data in a background thread (or just before the window opens) and keep the four chains.',
         'Top: one trace per chain for β (sample number across, value up), each in its own colour, drawn growing a little each frame. Healthy chains look like overlapping fuzzy caterpillars, not separate lines.',
         'Bottom left: a histogram of all kept β samples with a vertical line at the truth. Bottom right: a scatter of β against γ, which shows the ridge.',
         'Key **P** shows the posterior predictive band (2.5–97.5%) over the data dots.'],
        'python -m src.main', 'Four traces that quickly overlap, a histogram around 0.4 with the truth inside it, and a diagonal cloud in the β–γ scatter: the parameters trade off along the ridge.', null),
      S('Priors matter: flat against informative', 'With little data the prior shapes the answer; with plenty the data win. Find out which situation you are in.',
        ['Published studies put the infectious period near 8 days, so γ ≈ 1/8 = 0.125. Make **priors.py**: build the same fake {{OBS}} as in the checks and run {{calibrate(OBS)}} and {{calibrate(OBS, prior_gamma=(0.125, 0.01))}}.',
         'Compare the 95% interval widths for γ and β with the flat-prior run. Add both histograms to the window (key **I**).',
         'In **README.md**: did the prior narrow the answer, and is that honest here? An informative prior is fine if it comes from independent evidence and you say so; it is not fine if it comes from the same data.'],
        'python priors.py', 'With the informative prior the γ interval shrinks from about **0.055** wide to about **0.028**, and β’s narrows too, because β and γ are linked.', null),
      S('Real data: Rwanda, with honest error bars', 'The point of all this: an R_eff with a credible interval, not just a best guess.',
        ['Make **real.py**. Load the 20 weekly totals with {{get_weekly_cases("Rwanda")}} from the epidemic project.',
         'Use {{N = 13_000_000}}, the susceptible share {{s0}} from your R_eff fit, and its {{I0}}. Pass them through: {{calibrate(obs, N=13e6, s0=..., I0=...)}}.',
         'Report the 95% credible interval of **R_eff = β·s0/γ**, R̂ for all three parameters, and the acceptance rates. Draw the posterior predictive band over the real weekly cases.',
         'Save the samples for the ensemble projects: {{numpy.savez("posterior.npz", beta=..., gamma=...)}}, all four chains joined.',
         'In **README.md**: your interval, whether every R̂ is below 1.05, and how many weeks fall outside the predictive band. If many do, the model is missing something (changing behaviour, reporting days); say what.'],
        'python real.py', 'An R_eff interval, three R̂ values near 1, and a band over the real data. Real data are messier than fake data: expect some weeks outside the band, and write down which.', 'If the chains disagree on real data, run longer and check the pilot started somewhere sensible (near your best fit from the R_eff project).'),
    ],
    done: ['{{python -m pytest -q}} prints **6 passed**.', 'On fake data the 95% intervals contain the true β, γ and reporting rate, with R̂ below 1.05.', 'The window shows overlapping traces, histograms and the β–γ ridge.', 'README.md compares the flat and informative priors.', 'README.md reports a Rwanda R_eff interval and the predictive check.', 'posterior.npz is saved for the ensemble projects.', 'Everything is saved with git.'],
    stuck: [['Acceptance is near 0%.', 'Your steps are too large or ignore the ridge. Use the pilot covariance, not a fixed step.'],
      ['R̂ stays above 1.1.', 'Run longer, and start the four chains from slightly different points near the pilot’s end.'],
      ['log of zero error.', 'Keep every expected count at least 1e-9 before taking the log.']],
  },
};

export const NEW_STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s5p7: {
    0: { widget: 'likelihood', caption: 'The likelihood of the data for each β, with γ fixed: the data favour a narrow range.' },
    1: { widget: 'likelihood', caption: 'Change γ: the best β moves with it. That link is the ridge the sampler has to follow.', preset: { gamma: 0.15 } },
    2: { widget: 'metropolis', caption: 'A Metropolis walk on a tilted, narrow ridge. Blind round steps (left) are mostly rejected; steps shaped like the ridge (right) glide along it.' },
    3: { widget: 'win2d', caption: 'The window for the chains.' },
    4: { widget: 'metropolis', caption: 'Learn the shape from a pilot, then sample: acceptance jumps from a few percent to about a third.', preset: { shaped: 1 } },
    5: { widget: 'traces', caption: 'Four chains from different starts. Once they overlap like fuzzy caterpillars, R̂ falls towards 1.' },
    6: { widget: 'likelihood', caption: 'The prior multiplies the likelihood: a narrow prior on γ pins down β too.', preset: { prior: 1 } },
    7: { widget: 'traces', caption: 'The same diagnostics apply to the real data.' },
  },
};
