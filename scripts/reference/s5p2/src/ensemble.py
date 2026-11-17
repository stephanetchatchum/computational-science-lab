import numpy as np
from multiprocessing import Pool
from src.seir_fast import run_one

def sample_params(n, seed):
    rng = np.random.default_rng(seed)
    beta = np.clip(rng.normal(0.5, 0.1, n), 0.15, None); sigma = np.clip(rng.normal(0.2, 0.04, n), 0.08, None); gamma = np.clip(rng.normal(0.1, 0.02, n), 0.04, None)
    return np.column_stack([beta, sigma, gamma])

def run_serial(params):
    return [run_one(tuple(r)) for r in params]

def run_parallel(params, workers=None):
    with Pool(workers) as pool: return pool.map(run_one, [tuple(r) for r in params])
