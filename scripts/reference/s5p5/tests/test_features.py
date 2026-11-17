try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
try:
    from src.yields import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.yields': raise
try:
    from src.features import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.features': raise
try:
    from src.model import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.model': raise
import numpy as np
from pytest import approx
from src.features import growing_degree_days, season_rain, heat_stress_days, correlation_matrix

def test_gdd():
    assert growing_degree_days([5, 10, 15, 20], base=10) == approx(15.0)
    assert growing_degree_days([0, 0, 0], base=10) == approx(0.0)

def test_season_rain():
    rain = [1.0] * 365
    assert season_rain(rain, 60, 150) == approx(90.0)     # days 60 up to 150

def test_heat_stress():
    assert heat_stress_days([30, 36, 40, 35], threshold=35) == 2    # strictly above 35

def test_correlation_finds_twins():
    a = np.arange(20.0); X = np.column_stack([a, 2 * a + 1, np.sin(a)])
    C = correlation_matrix(X)
    assert C[0, 1] == approx(1.0, abs=1e-9)               # columns 0 and 1 are the same thing
    assert abs(C[0, 2]) < 0.9
