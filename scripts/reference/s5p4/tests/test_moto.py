try:
    from src.bike import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.bike': raise
try:
    from src.traffic import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.traffic': raise
try:
    from src.world import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.world': raise
try:
    from src.sensors import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.sensors': raise
try:
    from src.brain import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.brain': raise
try:
    from src.race import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.race': raise
try:
    from src.train import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.train': raise
try:
    from src.exam import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.exam': raise
import numpy as np
from pytest import approx
from src.bike import step_bikes, L, MU_G, V_MAX

def ride(steer, speed, seconds, dt=0.01):
    x = y = th = np.zeros(1); v = np.full(1, speed); skid = False
    for _ in range(int(seconds / dt)):
        x, y, th, v, s = step_bikes(x, y, th, v, np.full(1, steer), np.zeros(1), dt); skid |= s[0]
    return x[0], y[0], th[0], v[0], skid

def test_straight_line():
    x, y, th, v, skid = ride(0.0, 10.0, 3.0)
    assert x == approx(30.0) and y == approx(0.0) and not skid

def test_slow_turn_is_a_circle_of_radius_L_over_tan_steer():
    steer, v = 0.2, 3.0
    R = L / np.tan(steer)
    x, y, th, _, skid = ride(steer, v, 2 * np.pi * R / v)
    assert not skid
    assert th == approx(2 * np.pi, rel=1e-3)                 # one full turn
    assert np.hypot(x, y) < 0.05 * R                          # back where it started

def test_fast_turn_is_limited_by_friction():
    v = 12.0
    x, y, th, _, skid = ride(0.3, v, 1.0)                     # asks for a 4 m circle at 43 km/h
    assert skid
    assert th == approx(MU_G / v * 1.0, rel=1e-6)             # turns only as fast as the tyres allow

def test_top_speed():
    x = y = th = np.zeros(1); v = np.zeros(1)
    for _ in range(1000):
        x, y, th, v, _ = step_bikes(x, y, th, v, np.zeros(1), np.full(1, 3.0), 0.05)
    assert v[0] == approx(V_MAX)

from src.traffic import idm_accel, ring_step, equilibrium_gap, CAR

def test_free_road_reaches_desired_speed():
    assert idm_accel(np.array([10.0]), np.array([1e9]), np.array([0.0]), v0=10.0)[0] == approx(0.0, abs=1e-6)
    assert idm_accel(np.array([0.0]), np.array([1e9]), np.array([0.0]))[0] == approx(1.0)

def test_equilibrium_gap_means_no_acceleration():
    v = np.array([6.0]); gap = equilibrium_gap(v)
    assert idm_accel(v, gap, np.array([0.0]))[0] == approx(0.0, abs=1e-9)

def ring(n, length=230.0, minutes=10, dt=0.1):
    gap = length / n - CAR
    vs = np.linspace(0, 10, 100001); v_eq = vs[np.argmin(np.abs(equilibrium_gap(vs[:-1]) - gap))]
    s = np.arange(n) * length / n; v = np.full(n, v_eq); s[0] += 0.5   # half a metre out of place
    for _ in range(int(minutes * 60 / dt)):
        s, v = ring_step(s, v, length, dt)
    return v

def test_phantom_jam_appears_in_dense_traffic():
    v = ring(22)                     # Sugiyama et al. 2008: 22 cars on a 230 m circle
    assert v.min() < 0.5             # somebody has stopped, with no accident anywhere
    assert v.std() > 2.0

def test_light_traffic_flows_smoothly():
    v = ring(14)
    assert v.std() < 0.05

from src.world import World, HALF

def test_road_map():
    w = World("A", cars_per_lane=0)
    p = w.to_xy(np.array([100.0]), 0.0)[0]
    side = w.to_xy(np.array([100.0]), HALF + 3.0)[0]
    assert w.on_road(p[:1], p[1:])[0] and not w.on_road(side[:1], side[1:])[0]
    a = w.to_xy(np.array([50.0]), w.lane_offset(0))[0]; b = w.to_xy(np.array([50.0]), w.lane_offset(1))[0]
    assert np.hypot(*(a - b)) == approx(3.5, abs=0.01)

from src.sensors import cast_rays, RAY_ANGLES, RAY_MAX

def test_rays_see_the_road_edge_and_a_car():
    w = World("A", cars_per_lane=0)
    i = 300; p = w.pts[i]; th = np.array([w.ang[i]])
    d = cast_rays(w, p[:1], p[1:], th, np.zeros((0, 2)))[0]
    left, right = d[list(RAY_ANGLES).index(np.radians(90))], d[list(RAY_ANGLES).index(np.radians(-90))]
    assert left == approx(HALF, abs=1.5) and right == approx(HALF, abs=1.5)
    car = p + 15 * np.array([np.cos(th[0]), np.sin(th[0])])
    ahead = cast_rays(w, p[:1], p[1:], th, car[None, :])[0][list(RAY_ANGLES).index(0.0)]
    assert ahead == approx(13.0, abs=1.0)                     # 15 m away, minus the car's 2 m radius

from src.brain import think, next_generation, N_IN, N_OUT, N_W

def test_brain_outputs():
    rng = np.random.default_rng(0)
    out = think(rng.normal(0, 1, (5, N_W)), rng.random((5, N_IN)))
    assert out.shape == (5, N_OUT) and np.all(np.abs(out) <= 1)

def test_evolution_keeps_the_best_and_improves():
    rng = np.random.default_rng(1)
    target = np.linspace(-1, 1, N_W)
    fit = lambda pop: -np.abs(pop - target).sum(axis=1)
    pop = rng.normal(0, 1, (40, N_W)); first = fit(pop).max()
    for g in range(60):
        f = fit(pop); best = pop[f.argmax()].copy()
        pop = next_generation(pop, f, rng)
        assert np.any(np.all(pop == best, axis=1))            # the champion survives unchanged
    assert fit(pop).max() > first + 20

from src.race import race

def test_a_race_is_fair_and_repeatable():
    pop = np.random.default_rng(2).normal(0, 0.5, (6, N_W))
    a = race(pop, seed=3, seconds=10)[0]; b = race(pop, seed=3, seconds=10)[0]
    assert np.array_equal(a, b)                               # same traffic, same brains, same result
    twin = race(np.vstack([pop[:1], pop[:1]]), seed=3, seconds=10)[0]
    assert twin[0] == twin[1]
