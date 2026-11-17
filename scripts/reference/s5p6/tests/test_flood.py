try:
    from src.dem import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.dem': raise
try:
    from src.flood import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.flood': raise
import math
import numpy as np
from pytest import approx
from src.flood import fill_voids, ritter, run1d, G

def test_fill_voids():
    g = np.array([[1.0, 2.0], [-32768.0, 4.0]])
    out = fill_voids(g)
    assert out.min() > -1000 and np.isfinite(out).all()

def test_ritter_formula():
    c0 = math.sqrt(G * 1.0)
    assert ritter(0.0, 1.0) == approx(4 / 9)          # at the dam: 4/9 of the starting depth
    assert ritter(-2 * c0, 1.0) == approx(1.0)        # far upstream: not reached yet
    assert ritter(3 * c0, 1.0) == approx(0.0)         # beyond the front: still dry

def dam(n):
    edges = np.linspace(-5, 5, n + 1)
    x = 0.5 * (edges[:-1] + edges[1:])
    return x, edges[1] - edges[0], np.where(x < 0, 1.0, 0.0), np.zeros(n)

def test_1d_conserves_water_in_a_closed_channel():
    x, dx, h, q = dam(200)
    total = h.sum() * dx
    h, q, t = run1d(h, q, dx, 3.0)                    # long enough to bounce off both walls
    assert h.sum() * dx == approx(total, rel=1e-12)
    assert h.min() >= 0

def test_dam_break_matches_ritter_and_improves_with_resolution():
    errors = []
    for n in (200, 400):
        x, dx, h, q = dam(n)
        h, q, t = run1d(h, q, dx, 0.5)
        errors.append(np.mean(np.abs(h - ritter(x, t))))
    assert errors[1] < errors[0]
    assert errors[1] < 0.01

from src.flood import step2d

def bumpy(n=40):
    y, x = np.mgrid[0:n, 0:n]
    return 2 + np.sin(x / 4.0) * np.cos(y / 5.0) + 0.05 * x

def test_lake_at_rest_stays_at_rest():
    z = bumpy()
    h = np.maximum(0.0, 2.6 - z)                       # a flat lake with dry islands in it
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    for _ in range(200):
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
    assert np.abs(hu).max() < 1e-10 and np.abs(hv).max() < 1e-10

def test_2d_water_is_conserved_and_never_negative():
    z = bumpy()
    h = np.where(np.arange(40)[None, :] < 10, 3.0, 0.0) * np.ones((40, 40))
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    total = h.sum()
    for _ in range(300):
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
    assert h.sum() == approx(total, rel=1e-12)
    assert h.min() >= 0

def test_water_runs_down_into_the_valley_floor():
    n = 40
    z = np.tile(np.abs(np.arange(n) - n // 2) * 0.5, (n, 1)).astype(float)
    h = np.zeros_like(z); h[5:10, 2:5] = 2.0
    hu, hv = np.zeros_like(h), np.zeros_like(h)
    t = 0.0
    while t < 1800:                                    # half an hour of real time
        h, hu, hv, dt = step2d(z, h, hu, hv, 10.0)
        t += dt
    mid = n // 2
    assert h[:, mid - 1: mid + 2].sum() > 0.8 * h.sum()
