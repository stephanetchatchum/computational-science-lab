import numpy as np
from src.solvers import rk4_solve
from src.seir import seir_rhs

SIGMA, GAMMA = 1 / 5.2, 1 / 8

def weekly_model(beta, s0, I0, weeks, N=13_000_000):
    y0 = np.array([s0 * N - I0, 0.0, I0, (1 - s0) * N])
    ts, ys = rk4_solve(lambda t, y: seir_rhs(t, y, beta, SIGMA, GAMMA, N), y0, 0.0, 7.0 * weeks, 0.25)
    grown = np.array([y[2] + y[3] for y in ys])
    return np.array([grown[(k + 1) * 28] - grown[k * 28] for k in range(weeks)])

def poisson_nll(obs, mu):
    mu = np.maximum(np.asarray(mu, float), 1e-9); return float(np.sum(mu - np.asarray(obs) * np.log(mu)))

def fit(obs, betas, s0s, I0s=(30,), N=13_000_000):
    obs = np.asarray(obs, float); best = None
    for b in betas:
        for s0 in s0s:
            for I0 in I0s:
                m = weekly_model(b, s0, I0, len(obs), N); rho = obs.sum() / m.sum(); v = poisson_nll(obs, rho * m)
                if best is None or v < best[3]:
                    best = (b, s0, rho, v)
    return best
