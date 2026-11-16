try:
    from src.particle import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.particle': raise
try:
    from src.simulation import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.simulation': raise
import numpy as np
from pytest import approx
from src.particle import Particle, gravity, make_drag
from src.simulation import Simulation

def test_free_fall_for_one_second():
    p = Particle([0.0, 0.0, 0.0], [0.0, 0.0, 0.0], 1.0)
    for _ in range(1000):
        p.step(0.001, [gravity])
    assert p.r[1] == approx(-4.9, abs=0.01)      # index 1 is the y axis, which is UP
    assert p.r[0] == approx(0.0) and p.r[2] == approx(0.0)

def test_drag_slows_a_moving_particle():
    p = Particle([0, 0, 0], [10.0, 0, 0], 1.0)
    p.step(0.1, [make_drag(1.0)])
    assert 0 < p.v[0] < 10

def test_heavier_particles_fall_at_the_same_rate():
    a = Particle([0, 0, 0], [0, 0, 0], 1.0)
    b = Particle([0, 0, 0], [0, 0, 0], 50.0)
    for _ in range(100):
        a.step(0.01, [gravity]); b.step(0.01, [gravity])
    assert a.r[1] == approx(b.r[1])              # mass cancels: F = m*a with F = m*g

def test_no_shared_state():
    sim = Simulation(50)
    ids = {id(p.r) for p in sim.particles} | {id(p.v) for p in sim.particles}
    assert len(ids) == 100
