try:
    from src.solvers import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.solvers': raise
import math
import pytest
from pytest import approx
from src.solvers import bisection, newton, forward_diff, central_diff

def f(x): return x * x - 2
def df(x): return 2 * x

def test_bisection():
    root, count = bisection(f, 0, 2, 1e-8)
    assert root == approx(math.sqrt(2), abs=1e-8)
    assert count == 27

def test_bisection_needs_a_sign_change():
    with pytest.raises(ValueError):
        bisection(f, 2, 3)

def test_newton():
    root, count = newton(f, df, 1.0, 1e-8)
    assert root == approx(math.sqrt(2), abs=1e-8)
    assert count == 4

def test_newton_failure():
    with pytest.raises(RuntimeError):
        newton(lambda x: x**3 - 2*x + 2, lambda x: 3*x*x - 2, 0.0)

def test_differences():
    exact = math.cos(1.0)
    assert forward_diff(math.sin, 1.0, 0.001) == approx(exact, abs=5e-4)
    assert central_diff(math.sin, 1.0, 0.001) == approx(exact, abs=1e-7)

import numpy as np
from src.solvers import best_h

def test_machine_epsilon():
    eps = np.finfo(float).eps
    assert 1.0 + eps != 1.0
    assert 1.0 + eps / 2 == 1.0

def test_best_step_is_near_sqrt_eps():
    assert 1e-9 <= best_h() <= 1e-7
