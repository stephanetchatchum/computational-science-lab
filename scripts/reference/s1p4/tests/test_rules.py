try:
    from src.boid import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.boid': raise
try:
    from src.rules import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.rules': raise
import numpy as np
from src.boid import Boid
from src.rules import neighbours, separation, alignment, cohesion

def make(x, y, z, vx=0.0, vy=0.0, vz=0.0):
    return Boid(np.array([x, y, z], dtype=float), np.array([vx, vy, vz], dtype=float))

def test_neighbours():
    a = make(0, 0, 0); b = make(30, 0, 0); c = make(100, 0, 0)
    assert neighbours(a, [a, b, c], 60) == [b]          # not itself, not the far one

def test_separation_pushes_away():
    s = separation(make(0, 0, 0), [make(10, 0, 0)], 25)
    assert s[0] < 0 and abs(s[1]) < 1e-9 and abs(s[2]) < 1e-9

def test_separation_ignores_distant_boids():
    assert np.allclose(separation(make(0, 0, 0), [make(100, 0, 0)], 25), [0, 0, 0])

def test_alignment_matches_neighbour_velocity():
    me = make(0, 0, 0, 1, 0, 0)
    n1 = make(5, 0, 0, 0, 1, 0); n2 = make(0, 5, 0, 0, 1, 0)
    assert np.allclose(alignment(me, [n1, n2]), [-1, 1, 0])

def test_cohesion_points_at_the_centre():
    me = make(0, 0, 0)
    assert np.allclose(cohesion(me, [make(10, 0, 0), make(10, 20, 6)]), [10, 10, 3])

def test_empty_neighbourhood_gives_zero():
    me = make(3, 4, 5, 1, 1, 1)
    assert np.allclose(alignment(me, []), [0, 0, 0])
    assert np.allclose(cohesion(me, []), [0, 0, 0])
    assert np.allclose(separation(me, [], 25), [0, 0, 0])

from src.rules import build_grid, neighbours_grid

def test_grid_matches_brute_force():
    rng = np.random.default_rng(3)
    flock = [make(*rng.uniform(0, 500, 3)) for _ in range(200)]
    grid = build_grid(flock, 60.0)
    for b in flock:
        fast = neighbours_grid(b, grid, 60.0, 60.0)
        slow = neighbours(b, flock, 60.0)
        assert sorted(map(id, fast)) == sorted(map(id, slow))
