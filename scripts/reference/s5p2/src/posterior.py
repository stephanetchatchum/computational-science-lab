import numpy as np

def sample_posterior(n, seed, path="posterior.npz", sigma=1 / 5.2):
    d = np.load(path); rng = np.random.default_rng(seed); k = rng.integers(0, len(d["beta"]), n)
    return np.column_stack([d["beta"][k], np.full(n, sigma), d["gamma"][k]])
