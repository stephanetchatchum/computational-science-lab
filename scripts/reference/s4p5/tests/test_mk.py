try:
    from src.regression import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.regression': raise
try:
    from src.mk import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.mk': raise
try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
from pytest import approx
from src.mk import mk_s, mk_z, mk_p

def test_s_by_hand():
    assert mk_s([1, 2, 3, 4, 5]) == 10
    assert mk_s([5, 4, 3, 2, 1]) == -10
    assert mk_s([1, 3, 2, 4]) == 4
    assert mk_s([2, 2, 2]) == 0

def test_z_and_p():
    z = mk_z([1, 2, 3, 4, 5])
    assert z == approx(2.2045, abs=0.001)
    assert mk_p(z) == approx(0.0275, abs=0.001)
    assert mk_p(0.0) == approx(1.0)

def test_no_trend_is_not_significant():
    assert mk_p(mk_z([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])) > 0.05

import numpy as np
from src.mk import mk_z_ties, prewhiten, bh_reject

def test_ties_shrink_the_variance():
    assert mk_z([1, 2, 2, 3]) == approx(1.3587, abs=1e-3)       # ignores the tie
    assert mk_z_ties([1, 2, 2, 3]) == approx(1.4446, abs=1e-3)  # corrects for it

def ar1(rng, phi, n=33):
    e = rng.normal(size=n); x = np.zeros(n); x[0] = e[0] / np.sqrt(1 - phi * phi)
    for t in range(1, n):
        x[t] = phi * x[t - 1] + e[t]
    return x

def test_prewhitening_controls_false_alarms():
    rng = np.random.default_rng(0); plain = whitened = 0
    for _ in range(400):
        x = ar1(rng, 0.6)                                       # no trend at all, but memory from year to year
        plain += mk_p(mk_z(x)) < 0.05
        whitened += mk_p(mk_z(prewhiten(x))) < 0.05
    assert plain / 400 > 0.2                                    # the plain test cries wolf
    assert whitened / 400 < 0.08                                # close to the promised 5%

def test_benjamini_hochberg():
    p = [0.001, 0.008, 0.039, 0.041, 0.042, 0.06, 0.074, 0.205, 0.212, 0.216]
    assert list(bh_reject(p, 0.05)) == [True, True] + [False] * 8
