try:
    from src.stats import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.stats': raise
try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
import pytest
from pytest import approx
from src.stats import mean, variance, std, running_stats

DATA = [2, 4, 4, 4, 5, 5, 7, 9]

def test_basic():
    assert mean(DATA) == approx(5.0)
    assert variance(DATA) == approx(4.0)
    assert std(DATA) == approx(2.0)

def test_one_number():
    assert mean([10]) == approx(10)
    assert variance([10]) == approx(0)

def test_empty():
    with pytest.raises(ValueError):
        mean([])

def test_running():
    r = running_stats(DATA)
    assert len(r) == 8
    assert r[0] == (approx(2.0), approx(0.0))
    assert r[-1] == (approx(5.0), approx(2.0))

from src.stats import sample_variance

def test_sample_variance():
    assert sample_variance(DATA) == approx(32 / 7)
    with pytest.raises(ValueError):
        sample_variance([10])

import numpy as np

def test_matches_numpy():
    xs = list(np.random.default_rng(1).random(100))
    assert mean(xs) == approx(np.mean(xs))
    assert std(xs) == approx(np.std(xs))
