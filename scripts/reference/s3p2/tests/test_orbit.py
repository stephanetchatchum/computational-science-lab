import math
from pytest import approx
from src.orbit import simulate, energy, orbit_period, semi_major_axis, swept_area, ang_momentum

def test_circular_orbit_returns_to_its_start():
    s = simulate(1.0, 0.001, 6.2832)[-1]          # v0 = 1.0 gives a circle
    assert s[1] == approx(1.0, abs=0.01)          # x back to 1
    assert abs(s[3]) < 0.01                       # z back to 0

def test_radius_is_constant_in_a_circle():
    for t, x, y, z, vx, vy, vz in simulate(1.0, 0.001, 6.2832):
        assert math.hypot(x, y, z) == approx(1.0, abs=0.01)

def test_energy_is_conserved():
    E = [energy(s) for s in simulate(0.7, 0.001, 10.0)]
    assert max(E) - min(E) < 1e-6

def test_angular_momentum_is_conserved():
    L = [ang_momentum(s) for s in simulate(0.7, 0.001, 10.0)]
    assert max(abs(l[1] - L[0][1]) for l in L) < 1e-6

def test_keplers_third_law():
    a = [semi_major_axis(v) for v in (0.7, 1.0, 1.2)]
    T = [orbit_period(v) for v in (0.7, 1.0, 1.2)]
    assert T[0] == approx(3.386, abs=0.005)
    assert T[1] == approx(6.2832, abs=0.005)
    assert T[2] == approx(14.993, abs=0.02)
    slope = (math.log(T[2]) - math.log(T[0])) / (math.log(a[2]) - math.log(a[0]))
    assert slope == approx(1.5, abs=0.01)          # T squared is proportional to a cubed

def test_keplers_second_law_equal_areas():
    states = simulate(0.7, 0.001, 3.386)
    n = len(states)
    assert swept_area(states, 0, n // 10) == approx(swept_area(states, 4 * n // 10, 5 * n // 10), rel=0.01)

from src.orbit import leapfrog_step, rk4_step, max_energy_error

def test_rk4_energy_error_grows_with_time():
    e10 = max_energy_error(rk4_step, 0.7, 0.01, 10)
    e100 = max_energy_error(rk4_step, 0.7, 0.01, 100)
    assert 8 < e100 / e10 < 12

def test_leapfrog_energy_error_stays_bounded():
    e10 = max_energy_error(leapfrog_step, 0.7, 0.01, 10)
    e100 = max_energy_error(leapfrog_step, 0.7, 0.01, 100)
    assert e100 < 1.05 * e10
    assert e100 < 1e-3
