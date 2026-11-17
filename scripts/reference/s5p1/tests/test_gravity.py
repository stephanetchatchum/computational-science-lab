try:
    from src.gravity import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.gravity': raise
import numpy as np
from pytest import approx
from src.gravity import acc_python, acc_numpy, acc_numba, leapfrog

def random_bodies(n, seed=0):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(n, 3)), rng.random(n) + 0.5

def test_all_three_agree():
    r, m = random_bodies(30)
    a = acc_python(r, m, 0.01)
    assert np.allclose(a, acc_numpy(r, m, 0.01), rtol=1e-9, atol=1e-12)
    assert np.allclose(a, acc_numba(r, m, 0.01), rtol=1e-9, atol=1e-12)

def test_two_bodies_pull_toward_each_other():
    r = np.array([[0.0, 0, 0], [1.0, 0, 0]]); m = np.array([1.0, 1.0])
    a = acc_numpy(r, m, 0.0)
    assert a[0][0] > 0 and a[1][0] < 0          # they accelerate toward one another

def test_planet_returns_after_one_orbit():
    r = np.array([[0.0, 0, 0], [1.0, 0, 0]])
    v = np.array([[0.0, 0, 0], [0.0, 0, 1.0]])
    m = np.array([1.0, 1e-9])
    for _ in range(6283):
        r, v = leapfrog(r, v, m, 0.001, 0.0, acc_numpy)
    assert r[1] == approx([1.0, 0.0, 0.0], abs=0.02)

from src.ckernel import acc_c

def test_c_kernel_matches_numpy():
    r, m = random_bodies(50)
    assert np.allclose(acc_c(r, m, 0.01), acc_numpy(r, m, 0.01), rtol=1e-12, atol=1e-12)

from src.bh import acc_bh, acc_direct_2d

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
    assert e50 < 0.02
