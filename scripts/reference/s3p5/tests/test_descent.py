import math
from pytest import approx
from src.energy import shortfall, optimise, cost

def synthetic_month():
    irr, load = [], []
    for h in range(24 * 30):
        day, hour = divmod(h, 24)
        cloud = 0.2 + 0.8 * ((day * 7) % 10) / 9
        irr.append(cloud * math.sin(math.pi * (hour - 6 + 0.5) / 12) if 6 <= hour < 18 else 0.0)
        load.append(0.6 if 18 <= hour < 23 else 0.15)
    return irr, load

IRR, LOAD = synthetic_month()

def short_frac(p, b):
    return shortfall(IRR, LOAD, p, b) / sum(LOAD)

def test_shortfall_hand_case():
    assert shortfall([0, 0, 0], [2, 2, 2], 1.0, 4.0, eff=1.0) == approx(4.0)

def test_descent_matches_a_fine_grid():
    grid = min((cost(0.5 + 0.1 * i, 0.5 * j), 0.5 + 0.1 * i, 0.5 * j)
               for i in range(36) for j in range(41) if short_frac(0.5 + 0.1 * i, 0.5 * j) <= 0.05)
    for start in [(4.0, 20.0), (1.0, 2.0)]:
        p, b = optimise(IRR, LOAD, *start)[-1]
        assert cost(p, b) == approx(grid[0], rel=0.02)
        assert short_frac(p, b) < 0.052
