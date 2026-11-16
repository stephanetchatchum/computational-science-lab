try:
    from src.units import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.units': raise
try:
    from src.uncertainty import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.uncertainty': raise
import pytest
from src.units import family_of, UnitError

def test_family_of():
    assert family_of("km") == "length"
    assert family_of("min") == "time"
    assert family_of("km/h") == "speed"
    assert family_of("F") == "temperature"
    assert family_of("kWh") == "energy"
    assert family_of("g") == "mass"

def test_unknown_unit():
    with pytest.raises(UnitError):
        family_of("banana")

from pytest import approx

def test_convert():
    assert convert(12.4, 0.2, "m/s", "km/h") == (approx(44.64), approx(0.72))
    assert convert(100, 0.3, "C", "F") == (approx(212), approx(0.54))
    assert convert(0, 1, "C", "K") == (approx(273.15), approx(1))
    assert convert(-40, 1, "C", "F") == (approx(-40), approx(1.8))
    assert convert(1, 0.1, "mi", "km") == (approx(1.609344), approx(0.1609344))
    assert convert(1, 0, "kWh", "J") == (approx(3600000), approx(0))

def test_convert_mismatch():
    with pytest.raises(UnitError):
        convert(5, 0.1, "m", "kg")
