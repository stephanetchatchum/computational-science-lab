from pytest import approx
from src.lv import simulate_lv, fixed_point, period

def test_fixed_point():
    assert fixed_point() == (20.0, 10.0)

def test_stays_at_the_balance_point():
    ts, ys = simulate_lv(20.0, 10.0, 50.0, 0.01)
    assert all(abs(y[0] - 20) < 1e-6 and abs(y[1] - 10) < 1e-6 for y in ys)

def test_oscillates_around_it():
    ts, ys = simulate_lv(22.0, 10.0, 60.0, 0.001)
    xs = [y[0] for y in ys]
    assert min(xs) == approx(18.13, abs=0.05)
    assert max(xs) == approx(22.00, abs=0.05)

def test_period():
    ts, ys = simulate_lv(22.0, 10.0, 60.0, 0.001)
    assert period(ts, ys) == approx(5.13, abs=0.05)

import math
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
    assert period(ts, ys) == approx(2 * math.pi / w, abs=0.01)
