try:
    from src.heat import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.heat': raise
import math
import numpy as np
from pytest import approx
from src.heat import heat1d, blow_up_step, heat2d_step, blow_up_2d

def exact(x, t, alpha=0.01):
    return np.sin(np.pi * x) * math.exp(-alpha * math.pi ** 2 * t)

def test_error_shrinks_as_the_grid_gets_finer():
    errs = []
    for n, dt in [(20, 0.01), (50, 0.01), (100, 0.002)]:
        x, u, r = heat1d(n, dt, 0.01, 2.0)
        errs.append(np.max(np.abs(u - exact(x, 2.0))))
    assert errs[0] > errs[1] > errs[2]
    assert errs[1] < 1e-4 and errs[2] < 1e-5

def test_peak_matches_the_exact_answer():
    x, u, r = heat1d(50, 0.01, 0.01, 2.0)
    assert u.max() == approx(0.8209, abs=0.001)

def test_the_stability_limit_is_real():
    assert blow_up_step(50, 0.4) is None            # r = 0.4, safe
    step = blow_up_step(50, 0.6)                    # r = 0.6, too big
    assert step is not None and 100 < step < 140

def test_2d_limit_is_one_quarter():
    assert blow_up_2d(0.2) is None
    assert blow_up_2d(0.3) is not None and blow_up_2d(0.3) < 60

from src.heat import thomas, heat1d_implicit, richardson_order

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
    assert richardson_order(*mids) == approx(2.0, abs=0.05)
