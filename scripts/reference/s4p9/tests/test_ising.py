import math
import numpy as np
from pytest import approx
from src.ising import energy, magnetisation, delta_e, exact_average_energy

def test_energy_of_simple_states():
    up = np.ones((4, 4), int)
    assert energy(up) == -32                    # 16 sites x 2 bonds each, all aligned
    assert magnetisation(up) == 16
    checker = np.indices((4, 4)).sum(axis=0) % 2 * 2 - 1
    assert energy(checker) == 32                # every bond broken

def test_delta_e_matches_a_full_recount():
    s = np.random.default_rng(0).choice([-1, 1], (6, 6))
    for i, j in [(0, 0), (2, 3), (5, 5)]:
        t = s.copy(); t[i, j] *= -1
        assert delta_e(s, i, j) == energy(t) - energy(s)

def test_exact_2x2_by_listing_all_16_states():
    Z = 2 * math.exp(8 / 2.0) + 12 + 2 * math.exp(-8 / 2.0)
    assert exact_average_energy(2.0, L=2) == approx((-8 * 2 * math.exp(4) + 8 * 2 * math.exp(-4)) / Z)
    assert exact_average_energy(2.0, L=2) == approx(-7.2033, abs=1e-4)

from src.ising import run

def test_metropolis_reproduces_the_exact_4x4_energy():
    exact = exact_average_energy(2.5, L=4)
    Es, Ms, _ = run(4, 2.5, 20000, seed=0)
    assert Es.mean() == approx(exact, abs=0.3)

from src.ising import autocorr_time

def test_ordered_and_disordered_phases():
    _, M_cold, _ = run(16, 1.5, 4000, seed=1)
    _, M_hot, _ = run(16, 3.0, 4000, seed=1)
    assert M_cold.mean() / 256 > 0.95
    assert M_hot.mean() / 256 < 0.3

def test_critical_slowing_down():
    _, M_crit, _ = run(16, 2.27, 4000, seed=1)
    _, M_hot, _ = run(16, 3.0, 4000, seed=1)
    assert autocorr_time(M_crit) > 3 * autocorr_time(M_hot)

from src.ising import specific_heat

def test_specific_heat_peak_finds_tc():
    temps = np.round(np.arange(2.0, 2.61, 0.05), 2)
    C = [specific_heat(run(16, T, 4000, seed=0)[0], T, 256) for T in temps]
    t_peak = temps[int(np.argmax(C))]
    assert abs(t_peak - 2.269) / 2.269 < 0.03
