import numpy as np
from pytest import approx
from src.network import gravity_matrix
from src.agents import Epidemic

def test_gravity_matrix_shape_and_zero_diagonal():
    pops = [1000, 500, 200]; xy = [(0, 0), (1, 0), (0, 2)]
    G = gravity_matrix(pops, xy)
    assert G.shape == (3, 3) and np.allclose(np.diag(G), 0)
    assert G[0, 1] > G[0, 2]            # town 1 is bigger and closer than town 2 is to town 0

def test_rows_are_probabilities():
    G = gravity_matrix([1000, 500, 200], [(0, 0), (1, 0), (0, 2)])
    assert np.allclose(G.sum(axis=1), 1.0)

def test_one_town_matches_the_simple_model():
    peaks = []
    for seed in range(20):
        e = Epidemic([2000], np.array([[1.0]]), beta=0.5, sigma=0.2, gamma=0.1, i0=20, travel=0.0, seed=seed)
        I = [e.counts()[2]]
        for day in range(150):
            e.step_day(); I.append(e.counts()[2])
        peaks.append((max(I), I.index(max(I))))
    mean_peak = np.mean([p[0] for p in peaks]); mean_day = np.mean([p[1] for p in peaks])
    assert 0.2 * 2000 < mean_peak < 0.45 * 2000        # ODE says about 30 percent
    assert 15 < mean_day < 45

from src.ssa import gillespie_seir, ode_peak_and_final

def test_gillespie_conserves_people_and_s_never_rises():
    ts, ys = gillespie_seir(2000, 0.5, 0.2, 0.1, 20, 200.0, seed=0)
    assert np.all(ys.sum(axis=1) == 2000)
    assert np.all(np.diff(ys[:, 0]) <= 0)
    assert np.all(np.diff(ts) > 0)

def test_three_models_agree_in_the_mean():
    peak_ode, final_ode = ode_peak_and_final(2000, 0.5, 0.2, 0.1, 20)
    ssa = [gillespie_seir(2000, 0.5, 0.2, 0.1, 20, 200.0, seed=s)[1] for s in range(40)]
    assert np.mean([y[:, 2].max() for y in ssa]) == approx(peak_ode, rel=0.05)
    assert np.mean([2000 - y[-1, 0] for y in ssa]) == approx(final_ode, rel=0.01)
    agent_peaks, agent_final = [], []
    for s in range(40):
        e = Epidemic([2000], np.array([[1.0]]), beta=0.5, sigma=0.2, gamma=0.1, i0=20, travel=0.0, seed=s)
        I = [e.counts()[2]]
        for day in range(200):
            e.step_day(); I.append(e.counts()[2])
        agent_peaks.append(max(I)); agent_final.append(2000 - e.counts()[0])
    assert np.mean(agent_peaks) == approx(peak_ode, rel=0.08)
    assert np.mean(agent_final) == approx(final_ode, rel=0.01)
