try:
    from src.floats import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.floats': raise
try:
    from src.harness import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.harness': raise
import numpy as np
from src.floats import machine_epsilon

def test_epsilon():
    assert machine_epsilon() == 2.0 ** -52
    assert machine_epsilon() == np.finfo(float).eps

from pytest import approx
from src.floats import roots_naive, roots_stable, var_one_pass, var_two_pass

def test_quadratic_cancellation():
    small_naive = roots_naive(1.0, 1e8, 1.0)[0]
    small_stable = roots_stable(1.0, 1e8, 1.0)[0]
    assert abs(small_naive - (-1e-8)) / 1e-8 > 0.1      # more than 10% wrong
    assert small_stable == approx(-1e-8, rel=1e-15)
    assert roots_stable(1.0, 1e8, 1.0)[1] == approx(-1e8)

def test_variance_cancellation():
    data = [1e9 + 4, 1e9 + 7, 1e9 + 13, 1e9 + 16]
    assert var_two_pass(data) == 22.5
    assert abs(var_one_pass(data) - 22.5) > 10           # badly wrong
    assert var_one_pass([4, 7, 13, 16]) == 22.5            # fine without the offset
