import numpy as np
from pytest import approx
from src.seir import seir_rhs, simulate_seir, peak, r0

def test_rhs_conserves_people():
    d = seir_rhs(0.0, np.array([999000.0, 0.0, 1000.0, 0.0]), 0.5, 0.2, 0.1, 1e6)
    assert sum(d) == approx(0.0, abs=1e-9)

def test_r0():
    assert r0(0.5, 0.1) == 5.0

def test_epidemic_shape():
    ts, ys = simulate_seir(0.5, 0.2, 0.1, 1e6, 1000, 200, 0.1)
    I = [y[2] for y in ys]
    top, day = peak(ts, ys)
    assert top == approx(305135, rel=0.002)
    assert day == approx(47.7, abs=0.2)
    assert all(ys[k][0] >= ys[k + 1][0] - 1e-6 for k in range(len(ys) - 1))   # S never rises
    assert max(abs(sum(y) - 1e6) for y in ys) < 1.0                          # nobody appears or vanishes
    assert I[-1] < 1000                                                       # the epidemic ends
