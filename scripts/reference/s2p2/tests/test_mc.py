try:
    from src.mc import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.mc': raise
import math
from pytest import approx
from src.mc import pi_estimate, integrate

def test_pi():
    assert abs(pi_estimate(1_000_000, seed=1) - math.pi) < 0.01

def test_error_shrinks_like_one_over_root_n():
    def mean_error(n):
        return sum(abs(pi_estimate(n, seed=s) - math.pi) for s in range(30)) / 30
    ratio = mean_error(100) / mean_error(10_000)
    assert 5 < ratio < 20          # 100 times more darts should give about 10 times less error

def test_integral_of_x_squared():
    est, half = integrate(lambda x: x * x, 0.0, 1.0, 1_000_000, seed=1)
    assert est == approx(1 / 3, abs=0.002)
    assert 0.0005 < half < 0.0007  # the 95 percent half-width is about 0.00058

import math
import numpy as np
from src.mc import trapezoid, ball_volume_grid, ball_volume_mc

def test_grid_wins_in_one_dimension():
    t = trapezoid(lambda x: x * x, 0.0, 1.0, 1000)
    mc = np.mean([abs(np.mean(np.random.default_rng(s).random(1001) ** 2) - 1 / 3) for s in range(20)])
    assert abs(t - 1 / 3) < 1e-6
    assert mc > 1000 * abs(t - 1 / 3)

def test_monte_carlo_wins_in_six_dimensions():
    exact = math.pi ** 3 / 6
    assert abs(ball_volume_grid(6, 10) - exact) > 0.05
    assert abs(ball_volume_mc(6, 1_000_000, seed=1) - exact) < 0.05
