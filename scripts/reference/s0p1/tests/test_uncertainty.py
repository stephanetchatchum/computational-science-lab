try:
    from src.units import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.units': raise
try:
    from src.uncertainty import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.uncertainty': raise
from src.uncertainty import round_measurement

def test_rounding():
    assert round_measurement(44.64, 0.72) == (44.6, 0.7)
    assert round_measurement(15.5, 0.2236) == (15.5, 0.2)
    assert round_measurement(212.0, 0.54) == (212.0, 0.5)
    assert round_measurement(-40.0, 1.8) == (-40.0, 2.0)
    assert round_measurement(1234.5, 38.0) == (1230.0, 40.0)
    assert round_measurement(7.34, 0.96) == (7.0, 1.0)
    assert round_measurement(5.123, 0.0) == (5.123, 0.0)

import pytest
from pytest import approx
from src.units import UnitError
from src.uncertainty import combine

def test_combine():
    assert combine((12.4, 0.2, "m/s"), (3.1, 0.1, "m/s"), "+") == (approx(15.5), approx(0.2236, abs=0.0001), "m/s")
    assert combine((2.0, 0.1, "m"), (3.0, 0.2, "m"), "x") == (approx(6.0), approx(0.5, abs=0.001), "m*m")
    assert combine((10.0, 0.2, "s"), (4.0, 0.1, "s"), "/") == (approx(2.5), approx(0.08, abs=0.0002), "s/s")
    assert combine((1.0, 0.1, "km"), (500.0, 5.0, "m"), "+") == (approx(1.5), approx(0.1001, abs=0.0001), "km")
    assert combine((5.0, 0.3, "m"), (2.0, 0.1, "m"), "-") == (approx(3.0), approx(0.3162, abs=0.0001), "m")

def test_combine_mismatch():
    with pytest.raises(UnitError):
        combine((5, 0.1, "m"), (2, 0.1, "kg"), "+")

def test_combine_makes_new_units():
    assert combine((100.0, 2.0, "m"), (9.58, 0.01, "s"), "/") == (approx(10.4384, abs=1e-4), approx(0.2091, abs=1e-4), "m/s")

from src.uncertainty import format_measurement

def test_format():
    assert format_measurement(44.64, 0.72, "km/h") == "44.6 ± 0.7 km/h"
    assert format_measurement(212.0, 0.54, "F") == "212.0 ± 0.5 F"
    assert format_measurement(1234.5, 38.0, "J") == "1230 ± 40 J"
    assert format_measurement(6.0, 0.4999999, "m*m") == "6.0 ± 0.5 m*m"
    assert format_measurement(7.34, 0.96, "s") == "7 ± 1 s"

import numpy as np

def test_product_rule_matches_simulation():
    a = np.random.default_rng(0).normal(2.0, 0.1, 400_000)
    b = np.random.default_rng(1).normal(3.0, 0.2, 400_000)
    assert np.std(a * b) == approx(0.5, abs=0.01)
