import numpy as np
from SALib.sample import sobol as sobol_sample
from SALib.analyze import sobol as sobol_analyze

PROBLEM = {"num_vars": 4, "names": ["beta", "sigma", "gamma", "i0"],
           "bounds": [[0.3, 0.7], [0.1, 0.33], [0.07, 0.2], [0.0005, 0.005]]}

def seir_peaks(beta, sigma, gamma, i0, dt=0.2, days=250):
    """The fast SEIR from the ensemble project, run for many parameter rows at once."""
    beta, sigma, gamma, i0 = (np.asarray(a, float) for a in (beta, sigma, gamma, i0))
    y = np.stack([1 - i0, np.zeros_like(i0), i0, np.zeros_like(i0)]); peak = y[2].copy()
    def f(y): S, E, I, R = y; return np.stack([-beta*S*I, beta*S*I - sigma*E, sigma*E - gamma*I, gamma*I])
    for _ in range(int(round(days / dt))):
        k1 = f(y); k2 = f(y + dt/2*k1); k3 = f(y + dt/2*k2); k4 = f(y + dt*k3); y = y + dt/6*(k1 + 2*k2 + 2*k3 + k4)
        peak = np.maximum(peak, y[2])
    return peak

def peak_fraction(X):
    X = np.atleast_2d(X); return seir_peaks(X[:, 0], X[:, 1], X[:, 2], X[:, 3])

def run_sobol(problem, func, n=256):
    X = sobol_sample.sample(problem, n, calc_second_order=False)
    Y = func(X)
    return sobol_analyze.analyze(problem, Y, calc_second_order=False)

def propagate(X):
    """2.5th, 50th and 97.5th percentile of the peak over the sample rows."""
    lo, mid, hi = np.percentile(peak_fraction(X), [2.5, 50, 97.5]); return float(lo), float(mid), float(hi)

def posterior_inputs(n, seed=0, path="posterior.npz"):
    """beta and gamma drawn TOGETHER from the Bayesian project's samples; sigma and i0 from their ranges."""
    rng = np.random.default_rng(seed); d = np.load(path); k = rng.integers(0, len(d["beta"]), n)
    sig = rng.uniform(*PROBLEM["bounds"][1], n); i0 = rng.uniform(*PROBLEM["bounds"][3], n)
    return np.column_stack([d["beta"][k], sig, d["gamma"][k], i0])
