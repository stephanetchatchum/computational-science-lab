try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
try:
    from src.energy import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.energy': raise
from pytest import approx
from src.energy import simulate, cost, brute_force

def test_hand_case():
    soc, unmet = simulate([5] * 5, [2] * 5, 1.0, 4.0, eff=1.0, soc0=2.0)
    assert soc == approx([4, 4, 4, 4, 4])
    assert unmet == 0

def test_a_dark_stretch():
    soc, unmet = simulate([0, 0, 0], [2, 2, 2], 1.0, 4.0, eff=1.0, soc0=4.0)
    assert soc == approx([2, 0, 0])
    assert unmet == 1

def test_cost():
    assert cost(2.0, 5.0) == approx(2.0 * 700 + 5.0 * 300)

def test_brute_force_finds_a_feasible_design():
    irr = [5.0] * 50 + [1.0] * 10 + [5.0] * 50
    best = brute_force(irr, [3.0] * len(irr))
    panel, battery, c, frac = best
    assert frac <= 0.05
