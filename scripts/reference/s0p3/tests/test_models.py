try:
    from src.models import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.models': raise
try:
    from src.data import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.data': raise
try:
    from src.fit import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.fit': raise
from pytest import approx
from src.models import exponential, logistic

def test_exponential():
    seq = exponential(100, 0.1, 10)        # P0, r, number of years
    assert len(seq) == 11                  # starting value plus 10 years
    assert seq[1] == approx(110)
    assert seq[2] == approx(121)
    assert seq[10] == approx(259.37, abs=0.01)

def test_logistic():
    seq = logistic(100, 0.1, 1000, 10)     # P0, r, K, number of years
    assert seq[1] == approx(109)
    assert seq[2] == approx(118.71, abs=0.01)
    assert seq[10] == approx(226.13, abs=0.01)
    assert max(logistic(100, 0.1, 1000, 300)) <= 1000

from src.fit import window_starts, fit_windows, fit_exponential
from src.models import exponential

def test_window_starts():
    assert window_starts(60) == [0, 5, 10, 15, 20]
    assert window_starts(64) == [0, 6, 12, 18, 24]

def test_windows_recover_a_known_rate():
    real = exponential(1_000_000, 0.025, 59)
    results = fit_windows(real, fit_exponential)
    assert [r for r, _ in results] == [0.025] * 5
