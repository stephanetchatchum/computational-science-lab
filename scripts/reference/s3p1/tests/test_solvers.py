import math
import numpy as np
from pytest import approx
from src.solvers import euler_solve, rk4_solve, adaptive_rk4

def decay(t, y):
    return -y

def test_decay_values():
    ts, ys = euler_solve(decay, 1.0, 0.0, 5.0, 0.1)
    assert ys[-1] == approx(0.005154, abs=1e-5)
    ts, ys = rk4_solve(decay, 1.0, 0.0, 5.0, 0.1)
    assert ys[-1] == approx(math.exp(-5), abs=1e-7)

def test_convergence_orders():
    def err(solver, dt):
        return abs(solver(decay, 1.0, 0.0, 5.0, dt)[1][-1] - math.exp(-5))
    e = [err(euler_solve, dt) for dt in (0.1, 0.05)]
    r = [err(rk4_solve, dt) for dt in (0.1, 0.05)]
    assert 1.8 < e[0] / e[1] < 2.2       # Euler: halve dt, half the error
    assert 14 < r[0] / r[1] < 18         # RK4: halve dt, one sixteenth of the error

def test_two_equations_at_once():
    f = lambda t, y: np.array([y[1], -y[0]])
    ts, ys = rk4_solve(f, np.array([1.0, 0.0]), 0.0, 10.0, 0.01)
    assert ys[-1][0] == approx(math.cos(10), abs=1e-4)

def test_adaptive_uses_few_steps():
    ts, ys = adaptive_rk4(decay, 1.0, 0.0, 5.0, tol=1e-8)
    assert ys[-1] == approx(math.exp(-5), abs=1e-6)
    assert len(ts) < 500

from src.solvers import backward_euler_solve

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
    assert 1.8 < e1 / e2 < 2.2
