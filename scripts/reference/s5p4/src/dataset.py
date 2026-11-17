import os
import numpy as np
from src.truth import peak_temp

def sample_lhs(n, seed):
    rng = np.random.default_rng(seed); cols = []
    for _ in range(2):
        c = (np.arange(n) + rng.random(n)) / n; rng.shuffle(c); cols.append(c)
    return np.column_stack([0.2 + 0.8 * cols[0], np.round(4 + 26 * cols[1])])

def build_dataset(n=200, seed=0):
    path = os.path.join("data", "train.npz")
    if os.path.exists(path): d = np.load(path); return d["X"], d["y"]
    X = sample_lhs(n, seed); y = np.array([peak_temp(a, int(s)) for a, s in X])
    os.makedirs("data", exist_ok=True); np.savez(path, X=X, y=y); return X, y
