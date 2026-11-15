/**
 * Stage 0–1: audit rewrites, the new s1p6 guide, and a visual for every build step.
 * Every expected value below is computed and checked in scripts/verify_oracles.py.
 * Original steps keep their progress keys (s1…sN); added steps use their own keys (a:…),
 * so no existing tick moves to a different step.
 */
import type { Guide, GuideStep } from './legacy/curriculum.js';

export interface Visual { widget: string; caption: string; preset?: Record<string, number> }
export interface AddedStep { key: string; item: string; after: number; step: GuideStep; visual?: Visual }
export interface GuidePatch {
  steps?: Record<number, { replace?: [string, string][]; addCode?: string; optional?: string; item: string; see?: string; hint?: string; run?: string; t?: string; code?: string; why?: string; doAll?: string[] }>;
  stuck?: Record<number, { a?: string; b?: string; item: string }>;
  done?: Record<number, { text: string; item: string }>;
  spec?: Partial<Record<'deliverableWhy', { text: string; item: string }>>;
  /** Replacement text for the project's validation list (index → text). */
  validation?: Record<number, { text: string; item: string }>;
}

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });

/* ------------------------------------------------------------------ visuals for the ORIGINAL steps (0-based guide step index) */
export const STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s0p1: {
    0: { widget: 'rounding', caption: 'Each **assert** you are writing is one of these cases. Press **Step** to walk through all seven and watch which digit survives.' },
    1: { widget: 'rounding', caption: 'Your function in picture form: the uncertainty is cut to one significant figure, and the value is cut at the **same** decimal place (the highlighted tick spacing).' },
    2: { widget: 'units', caption: 'A unit **family** is a set of rulers that measure the same thing. Switch families with the slider.' },
    3: { widget: 'units', caption: 'Every factor in your table is the length of one unit on the base ruler.' },
    4: { widget: 'units', caption: 'Temperature is the odd one out: the value shifts by an offset, but the uncertainty only scales. Set family = 2 and compare the two bars.', preset: { fam: 2 } },
    5: { widget: 'uncertainty', caption: 'The merged blob is narrower than the two widths added together: uncertainties add in quadrature.' },
    6: { widget: 'rounding', caption: '{{format_measurement}} prints exactly what this picture shows: value and uncertainty rounded to the same place.' },
    7: { widget: 'win2d', caption: 'This is what the template opens. Note where (0, 0) is: the top-left corner, with y growing **downward**.' },
    8: { widget: 'uncertainty', caption: 'Glow radius proportional to uncertainty: drag σ and the blob grows.' },
    9: { widget: 'uncertainty', caption: 'Dragging only changes where a blob is drawn. The numbers inside it do not change.' },
    10: { widget: 'units', caption: 'Dropping a blob on a unit zone is exactly this conversion.' },
    11: { widget: 'uncertainty', caption: 'Merging two blobs with + is this picture.' },
    12: { widget: 'uncertainty', caption: 'Animate the radius toward its new value a little each frame instead of jumping.' },
  },
  s0p2: {
    0: { widget: 'rangecurve', caption: 'Your checks compare the stepped flight with the formula R = v²sin(2θ)/g. With k = 0 the dots sit exactly on the curve.', preset: { k: 0 } },
    2: { widget: 'win3d', caption: 'The Ursina template: a ground plane and a sphere rising at 0.5 m/s. Drag to orbit the camera. Here **y is up**.' },
    3: { widget: 'cannon', caption: 'The shell you are putting in the air, with its velocity and acceleration arrows.' },
    4: { widget: 'cannon', caption: 'The trail is the list of positions you store each frame.' },
    5: { widget: 'cannon', caption: 'Angle, speed and drag are the three controls you are adding.' },
  },
  s0p3: {
    0: { widget: 'growth', caption: 'Your checks: start at 100 with r = 0.1. Exponential gives 110, 121 …; logistic gives 109, 118.71 … and never passes K.', preset: { r: 0.1, K: 1000 } },
    2: { widget: 'win2d', caption: 'The empty pygame window. Remember: y grows downward.' },
    3: { widget: 'swarm', caption: 'Two swarms: the left one multiplies forever, the right one crowds against the circle that stands for K.' },
    4: { widget: 'gridfit', caption: 'What fitting will do with the numbers you download: try every (r, K) on a grid and keep the lowest error.' },
    6: { widget: 'growth', caption: 'The winner is the curve that stays closest to the real dots for the most years.' },
  },
  s0p4: {
    0: { widget: 'stats', caption: 'The test data [2, 4, 4, 4, 5, 5, 7, 9]. Mean 5; each square is one (x − mean)²; their average is the variance, 4.' },
    2: { widget: 'lln', caption: 'What a year of real daily values does to a running average: it lurches, then settles.' },
    3: { widget: 'win2d', caption: 'The empty window your dials will live in.' },
    4: { widget: 'dial', caption: 'One dial: the needle angle is the running mean, redrawn every time a day arrives.' },
    5: { widget: 'dial', caption: 'Streaming: one new day per tick. Watch the needle calm down.' },
    6: { widget: 'dial', caption: 'Same code, three variables.' },
  },
  s1p1: {
    0: { widget: 'leastsq', caption: 'The line your checks expect. Drag a point and the slope your function returns changes.' },
    2: { widget: 'vectorize', caption: 'Why NumPy wins: the loop handles one number per Python step; NumPy hands the whole array to compiled code. Not to scale — step 3 measures your machine.' },
    3: { widget: 'trend', caption: 'Monthly temperature has a strong yearly cycle on top of any trend. (Synthetic data with a known trend; your file will look similar.)' },
    4: { widget: 'win2d', caption: 'The window the dots will appear in.' },
    5: { widget: 'leastsq', caption: 'Each new dot moves the fitted line a little. Drag a point and watch the slope respond, as your line will when each year arrives.' },
    6: { widget: 'trend', caption: 'Is the slope bigger than twice its error bar? Switch to annual means to see the honest error bar.' },
  },
  s1p2: {
    0: { widget: 'rootfind', caption: 'Your checks: bisection reaches 1e-8 in 27 halvings; Newton gets there in 4.' },
    3: { widget: 'win2d', caption: 'The window for the hunt.' },
    4: { widget: 'rootfind', caption: 'Yielding one step at a time is exactly what the **Step** button does here.' },
    5: { widget: 'rootfind', caption: 'The function, the bracket and the tangent lines: your screen at the end of this step.' },
    6: { widget: 'newtonfail', caption: 'Newton from x₀ = 0 on x³ − 2x + 2: the tangents bounce between 0 and 1 forever, so your function must give up with RuntimeError.' },
  },
  s1p3: {
    2: { widget: 'win2d', caption: 'The window your spring will bounce in.' },
    3: { widget: 'energybars', caption: 'Kinetic and potential energy trade places; the total must not move.' },
    5: { widget: 'damped', caption: 'Damping c removes energy. Slide ζ: below 1 it rings down, at 1 it settles fastest, above 1 it creeps.' },
    6: { widget: 'resonance', caption: 'The amplitude your program measures, for every drive speed w. With damping 0.3 the peak sits just below w = 1.' },
  },
  s1p4: {
    0: { widget: 'boids', caption: 'Each test checks one arrow: separation away, alignment parallel, cohesion toward the centre.' },
    2: { widget: 'win3d', caption: 'The empty 3D scene. Orbit it: in 3D a flock has depth, which a flat window hides.' },
    3: { widget: 'boids', caption: 'All rules off except movement: 120 boids just drifting.' },
    5: { widget: 'boids', caption: 'All three rules on: the flock forms, though nothing in the code says "flock".' },
  },
  s1p5: {
    0: { widget: 'vectors', caption: 'Position, velocity and force are all vectors: three numbers each in 3D.' },
    2: { widget: 'win3d', caption: 'The empty 3D scene the box will sit in.' },
    3: { widget: 'particles', caption: '80 particles, each falling and bouncing on its own. Drag to orbit.' },
  },
};

/* ------------------------------------------------------------------ text fixes and optional labels (audit A1, E1) */
export const PATCHES: Record<string, GuidePatch> = {
  s0p1: {
    steps: {
      5: { item: 'A1', replace: [[
        'Check the families with {{family_of}}. If they differ, {{raise UnitError}}. This also applies to x and /. (Real physics allows m divided by s. We stay strict to keep the project small.)',
        'For **+** and **-**, check the families with {{family_of}}. If they differ, {{raise UnitError}}. For **x** and **/** any two units may combine, because that is how new units are made: metres divided by seconds is a speed.',
      ]], addCode: '\n\ndef test_combine_makes_new_units():\n    assert combine((100.0, 2.0, "m"), (9.58, 0.01, "s"), "/") == (approx(10.4384, abs=1e-4), approx(0.2091, abs=1e-4), "m/s")' },
    },
    done: { 4: { item: 'A1', text: 'Merging the kg blob with a m/s blob using **+** makes both flash red and jump apart; using **x** makes a new blob in **kg*m/s**.' } },
  },
  s0p2: { spec: { deliverableWhy: { item: 'A1', text: 'A playable 3D cannon: you set the angle and speed, fire, and watch the shell fly. The time-stepped physics you wrote becomes something you can see from any angle and check against the range formula.' } } },
  s0p3: {
    spec: { deliverableWhy: { item: 'A1', text: 'A pygame window where the two models grow side by side as swarms, plus the fitted curves against real data, so the difference between "unlimited" and "limited" growth is something you watch, not only a number.' } },
    steps: { 3: { item: 'E1', optional: 'Optional (audit E1): a decorative visual. The fitted curves in step 7 carry the science.' } },
    done: { 1: { item: 'E1', text: 'If you built the optional swarms: the left keeps growing, the right stops at 100 dots.' } },
  },
  s0p4: {
    steps: { 6: { item: 'E1', optional: 'Optional (audit E1): the other two dials repeat the same idea. One dial is enough.' } },
    done: { 2: { item: 'E1', text: 'At least one dial moves, with a bright mean needle and a faint std needle (three dials if you did the optional step).' } },
  },
  s1p3: {
    stuck: { 1: { item: 'A1', a: 'Energy stays close to 0.5 and only wobbles.', b: 'You used the NEW x to compute the new v (or the new v for the new x). That is semi-implicit Euler: its energy stays bounded, within about 0.0025 of 0.5 at dt 0.01, but it is not exactly constant. Forward Euler must use the OLD values; that growing energy is the bug this project wants you to see.' } },
  },
};

/* ------------------------------------------------------------------ added steps (audit B2, B3, B6, B8, X1, E1) */
export const ADDED_STEPS: Record<string, AddedStep[]> = {
  s0p1: [
    { key: 'a:B8-taylor', item: 'B8', after: 6, visual: { widget: 'product', caption: 'The rectangle a × b. Its area changes by b·δa + a·δb (the two strips). The tiny corner δa·δb is what the first-order rule throws away.' },
      step: S('Derive the rule you have been using',
        'Until now the formulas for combining uncertainty were given to you. Here you prove them, so you know when they stop working.',
        ['Open your journal (or **README.md**) and write the derivation by hand, line by line.',
         'Start from a result {{f(a, b)}}. Move a by a small error {{δa}} and b by {{δb}}. The first-order Taylor expansion is {{f(a+δa, b+δb) ≈ f + (∂f/∂a)·δa + (∂f/∂b)·δb}}.',
         'Square both sides and average over many measurements. When the errors in a and b are **independent**, the cross term averages to zero. That leaves {{σ_f² = (∂f/∂a)²·σ_a² + (∂f/∂b)²·σ_b²}}.',
         'Put in {{f = a + b}}: both derivatives are 1, so {{σ_f = √(σ_a² + σ_b²)}}. That is your + rule.',
         'Put in {{f = a·b}}: the derivatives are b and a. Divide by f² and you get {{σ_f/|f| = √((σ_a/a)² + (σ_b/b)²)}}. That is your x rule.',
         'Check it with a simulation: add the test below to **tests/test_uncertainty.py**. It draws 400 000 random pairs and measures the spread of a·b directly.'],
        'python -m pytest -q tests/test_uncertainty.py',
        'All checks pass. The simulated spread is about **0.500**, the same as {{combine((2.0, 0.1, "m"), (3.0, 0.2, "m"), "x")}} gives.',
        'The exact variance of a product has an extra term σ_a²σ_b² = 0.0004. It is tiny here, so the first-order rule is fine. It is not fine when σ_a is close to a.',
        'import numpy as np\n\ndef test_product_rule_matches_simulation():\n    a = np.random.default_rng(0).normal(2.0, 0.1, 400_000)\n    b = np.random.default_rng(1).normal(3.0, 0.2, 400_000)\n    assert np.std(a * b) == approx(0.5, abs=0.01)') },
  ],
  s0p3: [
    { key: 'a:X1-windows', item: 'X1', after: 5, visual: { widget: 'gridfit', caption: 'One fit gives one dot on this map. Fitting five different 40-year windows gives five dots; how far apart they land is your uncertainty on r and K.' },
      step: S('Put error bars on r and K',
        'A single fitted r has no uncertainty attached. Refitting on overlapping windows shows how much it depends on which years you used.',
        ['In **src/fit.py** write {{window_starts(n, width=40, count=5)}}. It returns {{count}} start indices spread evenly from 0 to {{n - width}}: {{[int(round(s)) for s in numpy.linspace(0, n - width, count)]}}.',
         'Write {{fit_windows(real, fitter, width=40, count=5)}}. For each start {{s}}, call {{fitter(real[s:s + width])}} and collect the results in a list.',
         'Add the checks below to **tests/test_models.py** and run them.',
         'Then run {{fit_windows}} on your real data with {{fit_exponential}} and with {{fit_logistic}}. Print the smallest and largest r (and K).',
         'In **README.md** report r as a range, for example **r between 0.024 and 0.031 per year**, not as one number.'],
        'python -m pytest -q',
        'All checks pass. On synthetic data made with r = 0.025, every window recovers exactly 0.025, so the spread is zero. Your real data will give a real spread.',
        'If every window gives the same r on real data, check that you are passing {{real[s:s + width]}} and not {{real}} each time.',
        'from src.fit import window_starts, fit_windows, fit_exponential\nfrom src.models import exponential\n\ndef test_window_starts():\n    assert window_starts(60) == [0, 5, 10, 15, 20]\n    assert window_starts(64) == [0, 6, 12, 18, 24]\n\ndef test_windows_recover_a_known_rate():\n    real = exponential(1_000_000, 0.025, 59)\n    results = fit_windows(real, fit_exponential)\n    assert [r for r, _ in results] == [0.025] * 5') },
  ],
  s0p4: [
    { key: 'a:E1-sample', item: 'E1', after: 1, visual: { widget: 'stats', caption: 'Switch between population (÷ n) and sample (÷ n − 1). With only 8 numbers the difference is visible: 4.0 against 4.571.', preset: { sample: 1 } },
      step: S('Sample or population variance?',
        'There are two variances. Using the wrong one is a classic, silent mistake.',
        ['In **src/stats.py** write {{sample_variance(xs)}}: the same sum of {{(x - m) ** 2}}, but divided by {{len(xs) - 1}}. With fewer than 2 numbers, {{raise ValueError}}.',
         'Add the checks below and run them.',
         'In **README.md** write two sentences: divide by **n** when your list is the whole population you care about; divide by **n − 1** when it is a sample used to estimate a bigger population, because the sample mean sits closer to its own data than the true mean does.',
         'Which one does numpy use by default? Check {{numpy.var(DATA)}} and {{numpy.var(DATA, ddof=1)}}.'],
        'python -m pytest -q tests/test_stats.py',
        'All checks pass. {{numpy.var}} gives 4.0 (population) unless you pass {{ddof=1}}, which gives 4.571.',
        null,
        'from src.stats import sample_variance\n\ndef test_sample_variance():\n    assert sample_variance(DATA) == approx(32 / 7)\n    with pytest.raises(ValueError):\n        sample_variance([10])') },
  ],
  s1p1: [
    { key: 'a:B6-annual', item: 'B6', after: 5, visual: { widget: 'trend', caption: 'Switch to annual means. The seasonal wave disappears, the points become nearly independent, and the honest error bar gets wider.', preset: { annual: 1 } },
      step: S('Fit annual means, and cross-check the error bar',
        'The slope formula assumes every residual is independent. Monthly temperatures are not: a warm March is usually followed by a warm April. The formula then reports an error bar that is too small.',
        ['In **src/regression.py** write {{annual_means(years, values)}}. {{years}} are decimal years like 2001.5. Group the values by {{int(year)}}, keep only years with all 12 months, and return two lists: the year and its mean.',
         'Write {{block_bootstrap_se(xs, ys, block=5, n_boot=1000, seed=0)}}: make arrays; {{rng = numpy.random.default_rng(seed)}}; {{n = len(xs)}}; {{k = math.ceil(n / block)}}. Repeat {{n_boot}} times: draw {{k}} random starts with {{rng.integers(0, n - block + 1, k)}}, join the blocks {{numpy.arange(s, s + block)}}, keep the first {{n}} indices, fit the slope on those points. Return the standard deviation of the slopes with {{ddof=1}}.',
         'Add the checks below and run them.',
         'Then on your real data: fit the annual means. Report the slope per decade with BOTH error bars, the formula one and the bootstrap one. If they disagree, trust the bootstrap.',
         'Change the verdict in step 7 to use the larger of the two error bars.'],
        'python -m pytest -q tests/test_regression.py',
        'All checks pass. With independent noise the two error bars agree within 30%. With strongly correlated noise (each value 0.8 times the last plus noise) the bootstrap error bar is about twice the formula one.',
        'Residuals are blocked so that correlated neighbours stay together; a plain bootstrap of single points would hide the correlation again.',
        'import math\nimport numpy as np\nfrom src.regression import annual_means, block_bootstrap_se\n\ndef test_annual_means_drop_incomplete_years():\n    years = [2000 + (m + 0.5) / 12 for m in range(24)] + [2002.04]\n    values = [1.0] * 12 + [3.0] * 12 + [99.0]\n    assert annual_means(years, values) == ([2000, 2001], [approx(1.0), approx(3.0)])\n\ndef test_bootstrap_of_a_perfect_line_is_zero():\n    x = np.arange(10)\n    assert block_bootstrap_se(x, 3 * x + 7) == approx(0.0, abs=1e-12)\n\ndef test_bootstrap_agrees_when_noise_is_independent():\n    rng = np.random.default_rng(42)\n    x = np.arange(200); y = 0.01 * x + rng.normal(0, 1, 200)\n    s, c = fit_line_np(x, y)\n    ratio = block_bootstrap_se(x, y) / slope_std_error(x, y, s, c)\n    assert 0.7 < ratio < 1.3\n\ndef test_bootstrap_is_wider_when_noise_is_correlated():\n    rng = np.random.default_rng(7); e = np.zeros(200)\n    for i in range(1, 200):\n        e[i] = 0.8 * e[i - 1] + rng.normal(0, 1)\n    x = np.arange(200); y = 0.01 * x + e\n    s, c = fit_line_np(x, y)\n    assert block_bootstrap_se(x, y) > 1.5 * slope_std_error(x, y, s, c)') },
  ],
  s1p2: [
    { key: 'a:X1-epsilon', item: 'X1', after: 2, visual: { widget: 'convergence', caption: 'Your h-sweep on log–log axes. The error falls with slope 1, then turns UP below h ≈ 1e-8: round-off (≈ ε/h) has taken over.', preset: { scheme: 0 } },
      step: S('Find the floor: machine epsilon and the best h',
        'Smaller h is not always better. A computer stores about 16 significant digits, and subtracting two nearly equal numbers throws most of them away.',
        ['Extend **errors.py**: sweep {{h = 10.0 ** -k}} for k from 1 to 12 and print the forward-difference error for each.',
         'In **src/solvers.py** write {{best_h()}}: it runs that same sweep and returns the h with the smallest error.',
         'Add the checks below. The first proves that 1 + ε is the smallest step above 1 that the computer can see.',
         'In **README.md** explain the U shape in one sentence each side: the truncation error is about h·|f″|/2 and falls with h; the round-off error is about ε/h and grows. They balance near **h ≈ √ε ≈ 1e-8**.'],
        'python -m pytest -q tests/test_solvers.py',
        'All checks pass. The best h is **1e-8**, and the error at h = 1e-12 is more than 100 times worse than at the best h.',
        'ε here is {{numpy.finfo(float).eps}}, about 2.2e-16.',
        'import numpy as np\nfrom src.solvers import best_h\n\ndef test_machine_epsilon():\n    eps = np.finfo(float).eps\n    assert 1.0 + eps != 1.0\n    assert 1.0 + eps / 2 == 1.0\n\ndef test_best_step_is_near_sqrt_eps():\n    assert 1e-9 <= best_h() <= 1e-7') },
  ],
  s1p3: [
    { key: 'a:B2-semi', item: 'B2', after: 4, visual: { widget: 'symplectic', caption: 'Left: position against velocity. Forward Euler spirals outward (energy grows). Semi-implicit Euler stays on a closed loop (energy only wobbles). Same cost: two lines of code.' },
      step: S('Add the first symplectic method',
        'One small change in the order of two lines turns the energy bug into a bounded wobble. This is the idea behind every orbit and molecular simulation.',
        ['In **src/physics.py** write {{step_semi_implicit(x, v, dt, m=1.0, k=1.0, c=0.0, force=0.0)}}.',
         'Compute {{a}} from the OLD x and v exactly as before. Then {{new_v = v + dt * a}} FIRST, and {{new_x = x + dt * new_v}} using the NEW v.',
         'Add the checks below and run them.',
         'In **src/main.py** let key **S** switch between {{step_euler}} and {{step_semi_implicit}}. Draw both energy bars, one above the other.'],
        'python -m pytest -q tests/test_physics.py',
        'All checks pass. On screen, at dt 0.01, the Euler bar grows past the white line while the semi-implicit bar stays on it, wobbling by at most about **0.0025**.',
        'The wobble does not grow with time: after 100 000 steps it is still under 0.003.',
        'from src.physics import step_semi_implicit\n\ndef test_one_semi_implicit_step():\n    x, v = step_semi_implicit(1.0, 0.0, 0.1)\n    assert v == approx(-0.1)\n    assert x == approx(0.99)\n\ndef test_semi_implicit_energy_stays_bounded():\n    x, v = 1.0, 0.0\n    worst = 0.0\n    for _ in range(2513):\n        x, v = step_semi_implicit(x, v, 0.01)\n        worst = max(worst, abs(energy(x, v) - 0.5))\n    assert energy(x, v) == approx(0.5, abs=0.005)\n    assert worst < 0.003') },
  ],
  s1p4: [
    { key: 'a:B3-hash', item: 'B3', after: 5, visual: { widget: 'spatialhash', caption: 'Brute force compares every pair (N² comparisons). The grid only looks in the 9 cells around a bird (27 in 3D). Raise N and watch the two counters separate.' },
      step: S('Make neighbour search fast with a grid',
        'Checking every bird against every other bird costs N² comparisons. Put the birds in grid cells as wide as the search radius, and each bird only needs to look in its own cell and the ones touching it.',
        ['In **src/rules.py** write {{build_grid(flock, cell)}}: a dictionary from the cell {{tuple((b.r // cell).astype(int))}} to the list of boids in it.',
         'Write {{neighbours_grid(boid, grid, cell, R)}}: look only in the 27 cells around the boid\'s cell (dx, dy, dz each in -1, 0, 1) and keep the other boids closer than R.',
         'Add the check below: on 200 random boids it must return exactly the same neighbours as your brute-force {{neighbours}}.',
         'Make **timing.py**: time one full neighbour pass with both methods for N = 100, 400 and 1600. Fit the slope of log(time) against log(N) for each.',
         'Write the two slopes in **README.md**.'],
        'python -m pytest -q tests/test_rules.py',
        'The check passes. Brute force gives a slope near **2**; the grid gives a slope near **1** (your exact numbers depend on your machine).',
        'Use a cell size equal to R. Smaller cells miss neighbours; larger cells check too many.',
        'from src.rules import build_grid, neighbours_grid\n\ndef test_grid_matches_brute_force():\n    rng = np.random.default_rng(3)\n    flock = [make(*rng.uniform(0, 500, 3)) for _ in range(200)]\n    grid = build_grid(flock, 60.0)\n    for b in flock:\n        fast = neighbours_grid(b, grid, 60.0, 60.0)\n        slow = neighbours(b, flock, 60.0)\n        assert sorted(map(id, fast)) == sorted(map(id, slow))') },
  ],
};

/* ------------------------------------------------------------------ new project s1p6, full guide */
export const NEW_GUIDES: Record<string, Guide> = {
  s1p6: {
    slug: 'float-and-convergence', pip: ['numpy', 'pygame'],
    files: [['src/__init__.py', 'empty file; lets Python import from src'], ['src/floats.py', 'machine_epsilon(), the two quadratic solvers, the two variances'],
      ['src/harness.py', 'order_of_accuracy(), trapezoid(), simpson(), richardson()'], ['src/main.py', 'pygame window with the live log–log plot'],
      ['tests/test_floats.py', 'checks for floats.py'], ['tests/test_harness.py', 'checks for harness.py']],
    words: [['Machine epsilon', 'the gap between 1 and the next number the computer can store, about 2.2e-16'],
      ['Round-off error', 'the error from storing only about 16 significant digits'],
      ['Truncation error', 'the error from using a finite step h instead of the exact limit'],
      ['Cancellation', 'subtracting two nearly equal numbers, which wipes out their leading digits'],
      ['Order of accuracy', 'p in error ≈ C·hᵖ; the slope on a log–log plot'],
      ['Richardson extrapolation', 'combining answers at h and h/2 to cancel the leading error term']],
    steps: [
      S('Write the check for machine epsilon', 'Checks first, as always.',
        ['Open **tests/test_floats.py** and write the code below.', 'Run it. It fails.'],
        'python -m pytest -q tests/test_floats.py', 'A red **ImportError**.', null,
        'import numpy as np\nfrom src.floats import machine_epsilon\n\ndef test_epsilon():\n    assert machine_epsilon() == 2.0 ** -52\n    assert machine_epsilon() == np.finfo(float).eps'),
      S('Find epsilon by halving', 'You find the limit of the machine yourself instead of looking it up.',
        ['Open **src/floats.py**.', 'Write {{machine_epsilon()}}: start with {{e = 1.0}}. While {{1.0 + e / 2 != 1.0}}, halve {{e}}. Return {{e}}.'],
        'python -m pytest -q tests/test_floats.py', '**1 passed**.', 'If it never stops, you wrote {{1.0 + e != 1.0}}; use {{e / 2}}.'),
      S('Write the checks for cancellation', 'Two famous formulas that are correct on paper and wrong on a computer.',
        ['Add the code below to **tests/test_floats.py**.', 'Run it. It fails.'],
        'python -m pytest -q tests/test_floats.py', 'A red **ImportError**.', null,
        'from pytest import approx\nfrom src.floats import roots_naive, roots_stable, var_one_pass, var_two_pass\n\ndef test_quadratic_cancellation():\n    small_naive = roots_naive(1.0, 1e8, 1.0)[0]\n    small_stable = roots_stable(1.0, 1e8, 1.0)[0]\n    assert abs(small_naive - (-1e-8)) / 1e-8 > 0.1      # more than 10% wrong\n    assert small_stable == approx(-1e-8, rel=1e-15)\n    assert roots_stable(1.0, 1e8, 1.0)[1] == approx(-1e8)\n\ndef test_variance_cancellation():\n    data = [1e9 + 4, 1e9 + 7, 1e9 + 13, 1e9 + 16]\n    assert var_two_pass(data) == 22.5\n    assert abs(var_one_pass(data) - 22.5) > 10           # badly wrong\n    assert var_one_pass([4, 7, 13, 16]) == 22.5            # fine without the offset'),
      S('Write the two quadratic solvers and the two variances', 'The stable versions avoid subtracting nearly equal numbers.',
        ['{{roots_naive(a, b, c)}}: {{d = math.sqrt(b*b - 4*a*c)}}; return {{((-b + d) / (2*a), (-b - d) / (2*a))}}.',
         '{{roots_stable(a, b, c)}}: same {{d}}; {{q = -0.5 * (b + math.copysign(d, b))}}; return {{(c / q, q / a)}}. Here b and d always have the same sign, so they never cancel.',
         '{{var_two_pass(xs)}}: first the mean m, then the mean of {{(x - m) ** 2}}.',
         '{{var_one_pass(xs)}}: the mean of {{x * x}} minus the square of the mean. Same formula on paper.'],
        'python -m pytest -q tests/test_floats.py',
        '**3 passed**. The naive small root comes out as about **-7.45e-09** instead of -1e-08. The one-pass variance of the shifted data comes out as **0.0** instead of 22.5.',
        'Print both results to see how wrong they are. That is the point of this step.'),
      S('Write the checks for the convergence harness', 'This is the tool every later PDE project will import.',
        ['Open **tests/test_harness.py** and write the code below.', 'Run it. It fails.'],
        'python -m pytest -q tests/test_harness.py', 'A red **ImportError**.', null,
        'import math\nfrom pytest import approx\nfrom src.harness import order_of_accuracy, trapezoid, simpson, richardson\n\nH = [0.1, 0.05, 0.025, 0.0125]\nI = math.e - 1\n\ndef test_difference_orders():\n    fwd = lambda h: abs((math.sin(1 + h) - math.sin(1)) / h - math.cos(1))\n    ctr = lambda h: abs((math.sin(1 + h) - math.sin(1 - h)) / (2 * h) - math.cos(1))\n    assert order_of_accuracy(fwd, H) == approx(1, abs=0.1)\n    assert order_of_accuracy(ctr, H) == approx(2, abs=0.1)\n\ndef test_quadrature_orders():\n    hs = [0.5, 0.25, 0.125, 0.0625]\n    tr = lambda h: abs(trapezoid(math.exp, 0, 1, round(1 / h)) - I)\n    si = lambda h: abs(simpson(math.exp, 0, 1, round(1 / h)) - I)\n    assert order_of_accuracy(tr, hs) == approx(2, abs=0.1)\n    assert order_of_accuracy(si, hs) == approx(4, abs=0.1)\n\ndef test_richardson():\n    t8, t16 = trapezoid(math.exp, 0, 1, 8), trapezoid(math.exp, 0, 1, 16)\n    assert abs(t16 - I) == approx(5.593e-4, abs=1e-6)\n    assert abs(richardson(t8, t16, 2) - I) < 1e-6\n    assert richardson(t8, t16, 2) == approx(simpson(math.exp, 0, 1, 16), abs=1e-14)'),
      S('Write the harness', 'One function that measures the slope on a log–log plot.',
        ['Open **src/harness.py**.',
         '{{order_of_accuracy(error_fn, hs)}}: compute {{errors = [error_fn(h) for h in hs]}}; return the slope of {{log(errors)}} against {{log(hs)}} with {{numpy.polyfit(numpy.log(hs), numpy.log(errors), 1)[0]}}.',
         '{{trapezoid(f, a, b, n)}}: {{h = (b - a) / n}}; half of f(a) and f(b) plus every inside point; times h.',
         '{{simpson(f, a, b, n)}} for even n: weights 1, 4, 2, 4, …, 2, 4, 1; times {{h / 3}}.',
         '{{richardson(A_h, A_h2, p)}}: {{(2 ** p * A_h2 - A_h) / (2 ** p - 1)}}.'],
        'python -m pytest -q', '**6 passed** in total.',
        'Richardson on the trapezoid rule gives exactly Simpson\'s rule. The last check proves it.'),
      S('Open an empty pygame window', 'The plot needs a window.',
        ['Open **src/main.py**.', 'Copy the **pygame window template** from the Setup page and paste it in.', 'Change the caption text to **Convergence Harness**.'],
        'python -m src.main', 'A dark window with a green dot and **It works!**.', null),
      S('Draw the error curve live', 'Turn the harness into a picture you can read at a glance.',
        ['Sweep {{h = 10 ** (-k / 4)}} for k from 4 to 48 (h from 0.1 down to 1e-12).',
         'For each h compute the forward-difference and central-difference error for sin at 1.',
         'Map {{log10(h)}} to screen x from 80 to 920 and {{log10(error)}} to screen y from 540 to 60. Draw one dot per h, a new dot every 3 frames, so the curve grows from right to left.',
         'Draw a straight reference line of slope 1 and one of slope 2 through the first dot.',
         'Key **M** switches the method. Show the fitted slope of the first 5 dots and the h with the smallest error.'],
        'python -m src.main',
        'Both curves fall along their reference line, then turn up. The forward difference bottoms out near **h ≈ 1e-8**; the central difference near **h ≈ 1e-5** (√ε for slope 1, ε^(1/3) for slope 2).',
        'If the curve looks flat, you are plotting error against h instead of log10(error) against log10(h).'),
    ],
    done: ['{{python -m pytest -q}} prints **6 passed**.', 'You can explain why the naive small root is wrong.', 'The live plot shows slope 1 and slope 2 and the turn upward.', 'README.md names the best h for both methods.', 'Everything is saved with git.'],
    stuck: [['**machine_epsilon** never returns.', 'Test {{1.0 + e / 2 != 1.0}}, not {{e > 0}}.'],
      ['The order comes out negative.', 'Pass the errors, not the estimates, and keep h decreasing.'],
      ['Simpson raises or gives nonsense.', 'n must be even. Use n = 2, 4, 8, 16.']],
  },
};
export const NEW_STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s1p6: {
    0: { widget: 'epsilon', caption: 'The computer cannot see a difference smaller than ε relative to 1. Slide δ below 2.2e-16 and 1 + δ becomes exactly 1.' },
    1: { widget: 'epsilon', caption: 'Halving e until 1 + e/2 == 1 walks down this slider in steps of 2.' },
    2: { widget: 'cancel', caption: 'Relative error of the small quadratic root as b grows. The naive formula climbs toward 100% wrong; the stable one stays at machine precision.' },
    3: { widget: 'cancel', caption: 'Switch to variance mode: the one-pass formula collapses as the offset grows.', preset: { mode: 1 } },
    4: { widget: 'convergence', caption: 'The harness measures this slope. Cycle through the schemes.', preset: { scheme: 1 } },
    5: { widget: 'convergence', caption: "Simpson's rule: slope 4 until the error hits the floor.", preset: { scheme: 3 } },
    6: { widget: 'win2d', caption: 'The empty window your plot will live in.' },
    7: { widget: 'convergence', caption: 'Your finished screen will look like this.', preset: { scheme: 0, fit: 5 } },
  },
};
