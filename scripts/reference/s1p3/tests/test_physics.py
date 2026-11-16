try:
    from src.physics import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.physics': raise
from pytest import approx
from src.physics import step_euler, energy

def test_one_step():
    x, v = step_euler(1.0, 0.0, 0.1)           # x, v, dt
    assert x == approx(1.0)
    assert v == approx(-0.1)

def test_energy_formula():
    assert energy(1.0, 0.0) == approx(0.5)
    assert energy(0.0, 2.0) == approx(2.0)

def test_energy_after_one_step():
    x, v = step_euler(1.0, 0.0, 0.1)
    assert energy(x, v) == approx(0.505)

def test_energy_grows_over_four_periods():
    x, v = 1.0, 0.0
    for _ in range(2513):                      # about 25.13 seconds at dt 0.01
        x, v = step_euler(x, v, 0.01)
    assert energy(x, v) == approx(0.643, abs=0.005)

from src.physics import step_semi_implicit

def test_one_semi_implicit_step():
    x, v = step_semi_implicit(1.0, 0.0, 0.1)
    assert v == approx(-0.1)
    assert x == approx(0.99)

def test_semi_implicit_energy_stays_bounded():
    x, v = 1.0, 0.0
    worst = 0.0
    for _ in range(2513):
        x, v = step_semi_implicit(x, v, 0.01)
        worst = max(worst, abs(energy(x, v) - 0.5))
    assert energy(x, v) == approx(0.5, abs=0.005)
    assert worst < 0.003
