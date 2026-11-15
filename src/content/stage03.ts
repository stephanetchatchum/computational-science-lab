/**
 * Stage 3: a visual for every build step and the audit rewrites (B1, B2, B6, A3, B8, B9, E1, A1).
 * Every test below is run against a reference solution by scripts/verify_guides.sh (also in CI).
 */
import type { Guide, GuideStep } from './legacy/curriculum.js';
import type { AddedStep, GuidePatch, Visual } from './stage01';

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });

export const STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s3p1: {
    0: { widget: 'integrators', caption: 'Your first check in picture form: e^(−t), Euler and RK4 at the same Δt. At Δt = 0.1 Euler ends 23% low; RK4 is on the curve.', preset: { dt: 0.1 } },
    2: { widget: 'adaptive', caption: 'Your adaptive solver: one step against two half steps, error divided by 15. The ticks along the bottom are the accepted steps: close together where the curve bends, far apart where it is flat.' },
    3: { widget: 'win2d', caption: 'The window your race will run in.' },
    4: { widget: 'integrators', caption: 'The race you are building. At Δt = 0.5 Euler dives far below the curve.', preset: { dt: 0.5 } },
    5: { widget: 'convergence', caption: 'The same picture with the slope measured for you. Pick RK4: a straight line of slope 4.', preset: { scheme: 5 } },
  },
  s3p2: {
    0: { widget: 'orbit', caption: 'What the checks demand: a closed orbit, constant energy and angular momentum, and equal areas in equal times.' },
    3: { widget: 'win3d', caption: 'The empty 3D scene: drag to orbit the camera.' },
    4: { widget: 'orbit', caption: 'Your solar system from above. With v₀ = 1 the orbit is a circle and r stays 1.000.', preset: { v0: 1 } },
  },
  s3p3: {
    0: { widget: 'seir', caption: 'Your checks: β = 0.5, γ = 0.1 gives R₀ = 5 and one big peak.', preset: { beta: 0.5, gamma: 0.1 } },
    2: { widget: 'win2d', caption: 'The window for the blobs.' },
    3: { widget: 'blobs', caption: 'Every blob is a person. Blue susceptible, yellow exposed, red infectious, green recovered. Lower p and the outbreak may fizzle.' },
    5: { widget: 'poissonfit', caption: 'Calibration on known data: move β and s₀ until the curve meets the dots. On the right, the likelihood map. Its dark ridge shows that the data fixes R_eff = β·s₀/γ much better than β and s₀ separately.' },
  },
  s3p4: {
    0: { widget: 'predprey', caption: 'Your checks: start at (22, 10); prey swing between 18.1 and 22.0, period about 5.13.', preset: { x0: 22 } },
    2: { widget: 'win2d', caption: 'The window for the phase portrait.' },
    4: { widget: 'chase', caption: 'The chase you are building, with the guide’s rules. Rabbits boom, foxes follow, rabbits crash, foxes starve.' },
  },
  s3p5: {
    0: { widget: 'battery', caption: 'The bookkeeping your checks test, run hour by hour: the battery fills by day and drains at night. Red dots are hours the house goes short.' },
    1: { widget: 'battery', caption: 'Move the two sizes. Too small a panel and the battery never fills; too small a battery and the night empties it.' },
    2: { widget: 'battery', caption: 'Hourly data shows the night, which daily totals hide.', preset: { p: 1.5, b: 3 } },
    3: { widget: 'win2d', caption: 'The window for the cost landscape.' },
    4: { widget: 'costmap', caption: 'Every design is one square. Grey squares leave the house short more than 5% of the time. The white box is the brute-force answer, right on the grey edge.' },
    5: { widget: 'costmap', caption: 'Press Step: the ball moves to the cheapest neighbour until none is cheaper. Try the other corners.' },
    6: { widget: 'battery', caption: 'The time-lapse you are building, for the chosen design.', preset: { p: 2, b: 5.5 } },
  },
};

export const PATCHES: Record<string, GuidePatch> = {
  s3p1: {
    steps: { 2: { item: 'B8', hint: 'Where 15 comes from. RK4 is fourth order, so one step of size dt is off by about C·dt⁵. Two half steps are each off by C·(dt/2)⁵, together 2·C·dt⁵/32 = C·dt⁵/16. So one step minus two half steps is about C·dt⁵ − C·dt⁵/16 = (15/16)·C·dt⁵, and the error of the two half steps is that difference divided by 15. For a method of order p the number is 2^p − 1.' } },
  },
  s3p2: {
    validation: { 1: { item: 'A1', text: 'T² ∝ a³ must hold across at least 3 simulated orbits: fit log T against log a and report the slope, which must be 1.5 within 0.01. Equivalently, T²/a³ = 4π² ≈ 39.48 in these units.' } },
  },
  s3p3: {
    steps: {
      5: { item: 'B6', t: 'Calibrate to a real outbreak: R_eff, not R₀',
        why: 'By mid-2021 some people in Rwanda were already immune or vaccinated, and measures were in place. What a fit can measure is the effective reproduction number R_eff, so name it that.',
        doAll: [
          'Open **src/data.py**. Write {{get_weekly_cases(country)}}. Download {{https://catalog.ourworldindata.org/garden/covid/latest/cases_deaths/cases_deaths.csv}} once and save it in **data/**. Keep the rows whose {{country}} is {{"Rwanda"}}; you need the columns {{date}} and {{new_cases}}. (audit A3: this replaces disease.sh, an unmaintained mirror.)',
          'The source behind this file, WHO, collects cases **weekly**, so many single days are 0 or empty. Sum {{new_cases}} into 20 weeks starting 2021-05-16. Empty values count as 0.',
          'If the download fails, use the course copy, **owid_cases_deaths_rwanda.csv**, linked on this tab under "API down?".',
          'In **src/fit.py** write {{weekly_model(beta, s0, I0, weeks, N=13_000_000)}}: run your SEIR with {{sigma = 1/5.2}} and {{gamma = 1/8}}, starting from {{S = s0*N - I0}}, {{E = 0}}, {{I = I0}}, {{R = (1 - s0)*N}}, with dt 0.25. The new cases in a week are how much {{I + R}} grew during that week.',
          '**s0** is the share of people still susceptible at the start. It absorbs everything the model leaves out: earlier infections, vaccination, and people who rarely mix. Fixing σ and γ from published values and fitting β and s0 is honest about that.',
          'Write {{poisson_nll(obs, mu)}}: the sum of {{mu - obs * log(mu)}}. This is the negative log-likelihood of counts that follow a Poisson law with mean mu, minus a constant. It treats a miss of 50 in a week of 100 cases as much worse than the same miss in a week of 2000; the sum of squares treats them the same.',
          'Only a fraction ρ of infections are reported. For a Poisson fit the best ρ has a formula: {{rho = sum(obs) / sum(model)}}.',
          'Write {{fit(obs, betas, s0s, I0s=(30,), N=13_000_000)}}: try every combination, scale each model by its best ρ, and keep the smallest {{poisson_nll}}. Return {{(beta, s0, rho, nll)}}. Add the checks below: they make data from known values and demand the fit gets them back.',
          'Run it on Rwanda with β from 0.15 to 0.60 in steps of 0.01, s0 in 0.3, 0.4, …, 1.0, and I0 in 10, 30, 100, 300. Run your old sum-of-squares fit too.',
          'Print **R_eff = β·s0/γ**. In **README.md**: R_eff from both fits, and one sentence on why it should be compared with published R_eff estimates for Rwanda in mid-2021, not with the R₀ of 5 to 8 published for Delta.'],
        see: 'The checks pass: from data made with β = 0.40, s0 = 0.5 and ρ = 0.1 the fit returns exactly those values, and R_eff = **1.6**. On Rwanda you get 20 weekly totals and your own R_eff; for a wave that rises and then falls, expect a value of a few units at most, nowhere near 5 to 8.',
        hint: 'If β ends at the edge of the range, widen it. If the fit cannot tell s0 = 0.4 from 0.6, look at the likelihood map in the visual: along its dark ridge β·s0 stays about the same, so the data pins down R_eff better than β and s0 separately.',
        code: 'import numpy as np\nfrom pytest import approx\nfrom src.fit import weekly_model, poisson_nll, fit\n\ndef test_poisson_nll():\n    assert poisson_nll(np.array([2, 0]), np.array([1.0, 1.0])) == approx(2.0)\n\ndef test_fit_recovers_known_values():\n    truth = weekly_model(0.40, 0.5, 100, 30, N=1_000_000)\n    obs = np.round(0.1 * truth)\n    betas = np.round(np.arange(0.30, 0.505, 0.01), 2)\n    beta, s0, rho, nll = fit(obs, betas, [0.4, 0.5, 0.6, 1.0], I0s=[100], N=1_000_000)\n    assert beta == approx(0.40)\n    assert s0 == 0.5\n    assert rho == approx(0.1, rel=0.01)\n    assert beta * s0 * 8 == approx(1.6)',
        run: 'python -m pytest -q tests/test_fit.py' },
    },
    done: { 4: { item: 'B6', text: 'You printed a fitted R_eff for Rwanda from the Poisson fit and the sum-of-squares fit.' } },
    validation: { 1: { item: 'B6', text: 'Compare your R_eff with published R_eff estimates for the same country and period, and explain why it is not R₀: immunity, vaccination and measures all lower it, and s0 absorbs them.' } },
  },
  s3p5: {
    steps: {
      2: { item: 'B9', t: 'Get real hourly sunshine for a place',
        why: 'The battery exists for the night. Daily totals hide the night completely, so use hourly data.',
        doAll: [
          'Next to your copied {{fetch_daily}}, write {{fetch_hourly(lat, lon, start, end)}}: the same address with **hourly** in place of daily, parameter {{ALLSKY_SFC_SW_DWN}}, and {{&time-standard=LST}} added so hour 0 is local midnight, not UTC.',
          'Hourly values are in **Wh/m²** for that hour. Divide by 1000 to get kWh/m², the units your simulation already uses. A value of -999 means missing: use 0 and count how many there were.',
          'Download 2022: {{fetch_hourly(-1.94, 30.06, "20220101", "20221231")}}. You get 8760 numbers. Save them in **data/**.',
          'The load is now hourly too: **0.6 kWh** per hour from 18:00 to 23:00 and **0.15** in every other hour, 5.85 kWh a day. Write that assumption in README.md.',
          'Your {{simulate}} and {{brute_force}} do not change. One list entry is now one hour, and the unmet fraction is the share of **hours** the house goes short.',
          'Run {{brute_force}} and print the answer. Run the old daily version too and compare the battery sizes.'],
        see: 'One line with four numbers and an unmet fraction of 0.05 or less. Expect the battery to come out bigger than in the daily version, because it must now carry every evening and night. Brute force over 8760 hours takes several seconds.' },
      5: { item: 'E1', optional: 'Optional (audit E1): the greedy ball. The required search is real gradient descent in the next step, which draws its own path.' },
      6: { item: 'B9', doAll: [
          'Press **G** for the gauge screen. Use the brute-force design. Run {{simulate}} on the real hourly year.',
          'Draw a battery as a tall rectangle that fills to the current state of charge. Draw a sun icon whose size follows that hour’s sunshine. Move through the year at 480 hours (20 days) per second.',
          'Show the date and hour, the state of charge and the count of unmet hours so far.'],
        see: 'The battery fills by day and drains every evening. At the end the counter shows **438 or fewer** unmet hours (5 percent of 8760).' },
    },
    done: {
      1: { item: 'B9', text: 'Brute force on the real hourly year returns a design with 5 percent or fewer unmet hours.' },
      3: { item: 'B9', text: 'Gradient descent lands within 2 percent of the grid on the synthetic month, and README.md compares descent with brute force on your real year.' },
    },
  },
};

const STIFF_TEST = `from src.solvers import backward_euler_solve

def stiff(t, y):
    return -50 * (y - math.cos(t))

EXACT_2 = -0.3978017673          # exact y(2) for y(0) = 0

def test_rk4_blows_up_on_a_stiff_problem():
    ts, ys = rk4_solve(stiff, 0.0, 0.0, 2.0, 0.1)
    assert abs(ys[-1]) > 1e10

def test_backward_euler_is_stable_and_first_order():
    assert abs(backward_euler_solve(stiff, 0.0, 0.0, 2.0, 0.1)[1][-1] - EXACT_2) < 1e-3
    e1 = abs(backward_euler_solve(stiff, 0.0, 0.0, 2.0, 0.04)[1][-1] - EXACT_2)
    e2 = abs(backward_euler_solve(stiff, 0.0, 0.0, 2.0, 0.02)[1][-1] - EXACT_2)
    assert 1.8 < e1 / e2 < 2.2`;

const LEAPFROG_TEST = `from src.orbit import leapfrog_step, rk4_step, max_energy_error

def test_rk4_energy_error_grows_with_time():
    e10 = max_energy_error(rk4_step, 0.7, 0.01, 10)
    e100 = max_energy_error(rk4_step, 0.7, 0.01, 100)
    assert 8 < e100 / e10 < 12

def test_leapfrog_energy_error_stays_bounded():
    e10 = max_energy_error(leapfrog_step, 0.7, 0.01, 10)
    e100 = max_energy_error(leapfrog_step, 0.7, 0.01, 100)
    assert e100 < 1.05 * e10
    assert e100 < 1e-3`;

const JACOBIAN_TEST = `import math
import numpy as np
from src.lv import jacobian

def test_saddle_at_the_origin():
    ev = sorted(np.linalg.eigvals(jacobian(0.0, 0.0)).real)
    assert ev == approx([-1.5, 1.0])

def test_centre_and_its_period():
    ev = np.linalg.eigvals(jacobian(20.0, 10.0))
    assert max(abs(ev.real)) < 1e-12
    w = abs(ev[0].imag)
    assert w == approx(math.sqrt(1.5))
    ts, ys = simulate_lv(22.0, 10.0, 60.0, 0.001)
    assert period(ts, ys) == approx(2 * math.pi / w, abs=0.01)`;

const DESCENT_TEST = `import math
from pytest import approx
from src.energy import shortfall, optimise, cost

def synthetic_month():
    irr, load = [], []
    for h in range(24 * 30):
        day, hour = divmod(h, 24)
        cloud = 0.2 + 0.8 * ((day * 7) % 10) / 9
        irr.append(cloud * math.sin(math.pi * (hour - 6 + 0.5) / 12) if 6 <= hour < 18 else 0.0)
        load.append(0.6 if 18 <= hour < 23 else 0.15)
    return irr, load

IRR, LOAD = synthetic_month()

def short_frac(p, b):
    return shortfall(IRR, LOAD, p, b) / sum(LOAD)

def test_shortfall_hand_case():
    assert shortfall([0, 0, 0], [2, 2, 2], 1.0, 4.0, eff=1.0) == approx(4.0)

def test_descent_matches_a_fine_grid():
    grid = min((cost(0.5 + 0.1 * i, 0.5 * j), 0.5 + 0.1 * i, 0.5 * j)
               for i in range(36) for j in range(41) if short_frac(0.5 + 0.1 * i, 0.5 * j) <= 0.05)
    for start in [(4.0, 20.0), (1.0, 2.0)]:
        p, b = optimise(IRR, LOAD, *start)[-1]
        assert cost(p, b) == approx(grid[0], rel=0.02)
        assert short_frac(p, b) < 0.052`;

export const ADDED_STEPS: Record<string, AddedStep[]> = {
  s3p1: [{ key: 'a:B1-stiff', item: 'B1', after: 2, visual: { widget: 'stiff', caption: 'Slide Δt past 0.0557 and RK4 explodes, although the true answer is a gentle wave. Backward Euler stays on it at every Δt. The stability-region map in the Concept lab shows why.' },
    step: S('Stiffness: when RK4 explodes',
      'Some problems have one very fast part that dies out at once. An explicit method like RK4 must still take tiny steps, or it blows up. An implicit method does not. This is the problem behind the heat equation in Stage 4.',
      ['In **src/solvers.py** write {{backward_euler_solve(f, y0, t0, t_end, dt)}}. Each step finds the new value {{z}} that solves {{z = y + dt * f(t + dt, z)}}: the slope is taken at the END of the step, which is what makes it implicit.',
       'Solve for {{z}} with Newton’s method. Start with {{z = y}}. Repeat up to 30 times: {{g = z - y - dt * f(t + dt, z)}}, {{dg = 1 - dt * (f(t + dt, z + 1e-7) - f(t + dt, z)) / 1e-7}}, {{z = z - g / dg}}. Stop when {{z}} changes by less than 1e-12.',
       'Add the checks below to **tests/test_solvers.py**. The stiff problem is {{dy/dt = -50 (y - cos t)}} with {{y(0) = 0}}. Its exact value at t = 2 is −0.3978.',
       'Why RK4 fails: on {{y′ = λy}} one RK4 step multiplies the error by R(z) = 1 + z + z²/2 + z³/6 + z⁴/24, with z = λ·dt. Here λ = −50, so dt = 0.1 gives z = −5 and R = **13.7**: the error grows 13.7 times every step. RK4 is stable only while 50·dt ≤ 2.785, so dt ≤ 0.0557.',
       'Backward Euler multiplies the error by 1/(1 − z). For every negative z that is smaller than 1, so it never blows up.',
       'In **README.md**: one sentence on which method you would choose for a problem with a fast part you do not care about, and why.'],
      'python -m pytest -q tests/test_solvers.py',
      'All checks pass. At dt = 0.1, RK4 reaches about **−5e22** by t = 2. Backward Euler gives **−0.39745**, off by 3.5e-4. Halving dt halves its error: first order.',
      'This version handles one equation. For a system, Newton needs the matrix of derivatives (the Jacobian). You will meet that in the heat-equation project.',
      STIFF_TEST) }],
  s3p2: [{ key: 'a:B2-leapfrog', item: 'B2', after: 2, visual: { widget: 'orbitdrift', caption: 'The largest energy error so far, on log axes. RK4 climbs in a straight line, ten times more error for ten times more orbits. Leapfrog jumps up in the first orbit and then stays flat.' },
    step: S('Leapfrog against RK4 over many orbits',
      'RK4 is very accurate per step but loses a little energy every orbit, always in the same direction, so the error adds up. Leapfrog’s error is bigger per step but does not add up. Over long runs that wins.',
      ['Units first. Here GM = 1 and the starting radius is 1. For the Earth and Sun the length unit is 1 AU and the time unit is √(AU³ / GM☉) = 1 year ÷ 2π ≈ **58.1 days**, so T = 2π is one year. Write this in **README.md**.',
       'In **src/orbit.py** write {{leapfrog_step(state, dt)}}: a half kick {{v += dt/2 * a(x)}}, a drift {{x += dt * v}}, then another half kick using the NEW position. Add dt to t.',
       'Write {{max_energy_error(stepper, v0, dt, orbits)}}: start at {{(0, 1, 0, 0, 0, 0, v0)}}, take {{round(orbits * orbit_period(v0) / dt)}} steps with {{stepper}}, and return the largest {{abs(energy(s) - E0)}} seen at any step.',
       'Add the checks below to **tests/test_orbit.py** and run them.',
       'Make **drift.py**: for 1, 10, 100 and 1000 orbits print the largest energy error of both methods at dt = 0.01 and v0 = 0.7. 1000 orbits of RK4 takes a few seconds.',
       'In **README.md**: from your numbers, after roughly how many orbits does leapfrog become the better choice at this dt?'],
      'python -m pytest -q tests/test_orbit.py',
      'All checks pass. At dt = 0.01, RK4’s largest error grows in proportion to time: about **6e-7** after 10 orbits, **6e-6** after 100, **6e-5** after 1000. Leapfrog’s stays at about **7.6e-4** however long you run. At this dt RK4 is still ahead at 1000 orbits; continuing its straight line, leapfrog wins after roughly **13 000 orbits**.',
      'Leapfrog is symplectic: it exactly conserves a slightly different energy, so the true energy only wobbles. The s5p1 project explains why.',
      LEAPFROG_TEST) }],
  s3p4: [{ key: 'a:B8-jacobian', item: 'B8', after: 1, visual: { widget: 'linearise', caption: 'Near (20, 10) the loop is almost the dashed ellipse of the linearised system, period 5.130. Push the start further out: the loop bends away from the ellipse and takes longer.' },
    step: S('Linearise: the Jacobian at the balance points',
      'Close to a fixed point a nonlinear system behaves like a linear one. The eigenvalues of the Jacobian say what kind of point it is, and predict the period of small cycles before you simulate anything.',
      ['In **src/lv.py** write {{jacobian(x, y)}}: the partial derivatives of {{lv_rhs}} as a numpy array, {{[[a - b*y, -b*x], [d*y, d*x - g]]}}.',
       'By hand first. At (0, 0) it is [[1, 0], [0, −1.5]]: eigenvalues 1 and −1.5, one direction grows and one shrinks. That is a **saddle**.',
       'At (20, 10) it is [[0, −2], [0.75, 0]]: eigenvalues ±i√1.5 = ±1.2247i, purely imaginary. That is a **centre**: small loops circle it forever without growing or shrinking.',
       'A centre with eigenvalues ±iω repeats every 2π/ω. Here ω = √1.5 = √(αγ), so T = 2π/√(αγ) = **5.130**.',
       'Add the checks below to **tests/test_lv.py**. Use {{numpy.linalg.eigvals}}.',
       'In **README.md**: compare 5.130 with your simulated periods from (22, 10) and (40, 10), and say why the bigger loop is slower.'],
      'python -m pytest -q tests/test_lv.py',
      'All checks pass. From (22, 10) the simulated period is **5.13**, matching 2π/√(αγ). From (40, 10) it is about **5.46**: big loops leave the region where the linear picture holds.',
      'If your eigenvalues have a real part of about 1e-17, that is round-off, not instability. The check allows it.',
      JACOBIAN_TEST) }],
  s3p5: [{ key: 'a:B9-gradient', item: 'B9', after: 5, visual: { widget: 'gradient', caption: 'Press Step to follow the descent. It moves downhill on the smoothed cost and settles on the edge of the grey region. Every start ends at the same design.' },
    step: S('Real gradient descent',
      'The ball only looks at four grid neighbours. Gradient descent follows the slope of the cost, can land on any panel and battery size, and is what the project title promised. It needs a cost whose slope means something.',
      ['Counting unmet hours gives a cost that jumps in steps, so its slope is zero almost everywhere. Use the **energy** that goes unmet instead. Write {{shortfall(irr, load, panel, battery, eff=0.8)}}: the same loop as {{simulate}}, returning the total kWh the battery could not supply. It changes smoothly as the sizes change.',
       'Write {{smooth_score(irr, load, p, b, lam)}} = {{cost(p, b) + lam * max(0, shortfall / sum(load) - 0.05) ** 2}}. Below a 5% shortfall only the price counts; above it the penalty rises smoothly.',
       'Write {{gradient(irr, load, p, b, lam, h=1e-3)}}: central differences, {{(score(p + h, b) - score(p - h, b)) / (2 * h)}} for p, and the same for b.',
       'Write {{descend(irr, load, p, b, lam)}}. Start with {{step = 0.5}}. Repeat: take the unit vector against the gradient and try moving {{step}} along it, never below p = 0.1 or b = 0. If the score drops, move and set {{step *= 1.5}}; if not, stay and set {{step /= 2}}. Stop when {{step < 1e-4}}. Return the list of positions.',
       'Write {{optimise(irr, load, p, b)}}: call {{descend}} with {{lam}} = 1e4, then 1e5, 1e6 and 1e7, each time starting where the last one ended. A gentle penalty first and a strict one last stops the descent stalling against a steep wall. Return the whole path.',
       'Add the checks below in **tests/test_descent.py**. They build a synthetic month so the answer is known.',
       'In **src/main.py** draw the descent path in blue on your landscape (key **D**). On your real year, write the descent cost and the brute-force cost in **README.md**.'],
      'python -m pytest -q tests/test_descent.py',
      'All checks pass. On the synthetic month a fine grid search picks 2.0 kW and 5.5 kWh for **$3050**. Descent from every corner reaches about **2.03 kW and 5.34 kWh** for **$3020**: about 1% cheaper because it is not tied to the grid, with a shortfall of 5.06%, just over the target because the penalty is soft.',
      'If descent stops far from the edge of the grey region, check that {{step}} grows after a successful move and that you start each λ where the last one ended.',
      DESCENT_TEST) }],
};

export const NEW_GUIDES: Record<string, Guide> = {};
export const NEW_STEP_VISUALS: Record<string, Record<number, Visual>> = {};
