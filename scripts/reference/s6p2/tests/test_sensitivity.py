try:
    from src.model import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.model': raise
try:
    from src.sensitivity import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.sensitivity': raise
import numpy as np
from pytest import approx
from src.sensitivity import run_sobol, PROBLEM, peak_fraction

def ishigami(X):
    a, b = 7.0, 0.1
    return np.sin(X[:, 0]) + a * np.sin(X[:, 1]) ** 2 + b * X[:, 2] ** 4 * np.sin(X[:, 0])

def test_against_the_known_ishigami_answer():
    problem = {"num_vars": 3, "names": ["x1", "x2", "x3"],
               "bounds": [[-np.pi, np.pi]] * 3}
    Si = run_sobol(problem, ishigami, n=1024)
    assert Si["S1"][0] == approx(0.31, abs=0.05)
    assert Si["S1"][1] == approx(0.44, abs=0.05)
    assert abs(Si["S1"][2]) < 0.05
    assert Si["ST"][2] > 0.2                     # x3 matters only through interactions

def test_indices_are_sane():
    Si = run_sobol(PROBLEM, peak_fraction, n=256)
    assert sum(Si["S1"]) <= 1.05                 # first order shares cannot exceed the whole
    assert all(st >= s1 - 0.05 for s1, st in zip(Si["S1"], Si["ST"]))

import numpy as np
from src.sensitivity import propagate, peak_fraction, PROBLEM

def stand_in(n=2000, seed=1):
    rng = np.random.default_rng(seed)
    g = rng.normal(0.145, 0.01, n); b = 3.0 * g + rng.normal(0, 0.008, n)   # beta and gamma move together
    return np.column_stack([b, rng.uniform(0.1, 0.33, n), g, rng.uniform(0.0005, 0.005, n)])

def test_identical_rows_give_zero_width():
    lo, mid, hi = propagate(np.tile([0.5, 0.2, 0.12, 0.001], (50, 1)))
    assert lo == mid == hi

def test_posterior_band_is_narrower_than_the_box():
    rng = np.random.default_rng(2)
    lo_b, hi_b = np.array(PROBLEM["bounds"]).T
    box = propagate(lo_b + (hi_b - lo_b) * rng.random((2000, 4)))
    post = propagate(stand_in())
    assert post[2] - post[0] < 0.5 * (box[2] - box[0])

def test_sigma_dominates_once_beta_and_gamma_are_known():
    X = stand_in(); fixed = X.copy(); fixed[:, 1] = 0.215
    assert peak_fraction(fixed).var() < 0.2 * peak_fraction(X).var()
