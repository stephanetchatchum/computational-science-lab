try:
    from src.regression import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.regression': raise
try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
from pytest import approx
from src.regression import fit_line, fit_line_np, slope_std_error

X = list(range(10))

def test_perfect_line():
    y = [3 * x + 7 for x in X]
    slope, intercept = fit_line(X, y)
    assert slope == approx(3.0)
    assert intercept == approx(7.0)
    assert slope_std_error(X, y, slope, intercept) == approx(0.0, abs=1e-9)

def test_noisy_line():
    y = [7.4, 9.6, 13.3, 15.8, 19.5, 22.1, 25.4, 28.0, 31.2, 34.0]
    slope, intercept = fit_line(X, y)
    assert slope == approx(3.0030, abs=0.0001)
    assert intercept == approx(7.1164, abs=0.0001)
    assert slope_std_error(X, y, slope, intercept) == approx(0.03349, abs=0.0001)

def test_numpy_version_agrees():
    y = [7.4, 9.6, 13.3, 15.8, 19.5, 22.1, 25.4, 28.0, 31.2, 34.0]
    assert fit_line_np(X, y) == (approx(fit_line(X, y)[0]), approx(fit_line(X, y)[1]))

import math
import numpy as np
from src.regression import annual_means, block_bootstrap_se

def test_annual_means_drop_incomplete_years():
    years = [2000 + (m + 0.5) / 12 for m in range(24)] + [2002.04]
    values = [1.0] * 12 + [3.0] * 12 + [99.0]
    assert annual_means(years, values) == ([2000, 2001], [approx(1.0), approx(3.0)])

def test_bootstrap_of_a_perfect_line_is_zero():
    x = np.arange(10)
    assert block_bootstrap_se(x, 3 * x + 7) == approx(0.0, abs=1e-12)

def test_bootstrap_agrees_when_noise_is_independent():
    rng = np.random.default_rng(42)
    x = np.arange(200); y = 0.01 * x + rng.normal(0, 1, 200)
    s, c = fit_line_np(x, y)
    ratio = block_bootstrap_se(x, y) / slope_std_error(x, y, s, c)
    assert 0.7 < ratio < 1.3

def test_bootstrap_is_wider_when_noise_is_correlated():
    rng = np.random.default_rng(7); e = np.zeros(200)
    for i in range(1, 200):
        e[i] = 0.8 * e[i - 1] + rng.normal(0, 1)
    x = np.arange(200); y = 0.01 * x + e
    s, c = fit_line_np(x, y)
    assert block_bootstrap_se(x, y) > 1.5 * slope_std_error(x, y, s, c)
