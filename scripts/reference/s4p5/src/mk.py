import math

def mk_s(values):
    n = len(values); s = 0
    for i in range(n):
        for j in range(i + 1, n):
            if values[j] > values[i]: s += 1
            elif values[j] < values[i]: s -= 1
    return s

def mk_z(values):
    n = len(values); S = mk_s(values); var = n * (n - 1) * (2 * n + 5) / 18
    return (S - 1) / math.sqrt(var) if S > 0 else (S + 1) / math.sqrt(var) if S < 0 else 0.0

def phi(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def mk_p(z):
    return 2 * (1 - phi(abs(z)))

import numpy as np

def mk_z_ties(values):
    n = len(values); S = mk_s(values); _, counts = np.unique(values, return_counts=True)
    var = (n * (n - 1) * (2 * n + 5) - sum(t * (t - 1) * (2 * t + 5) for t in counts)) / 18
    return (S - 1) / math.sqrt(var) if S > 0 else (S + 1) / math.sqrt(var) if S < 0 else 0.0

def lag1(values):
    d = np.asarray(values, float) - np.mean(values); return float(np.sum(d[:-1] * d[1:]) / np.sum(d * d))

def prewhiten(values):
    v = np.asarray(values, float); return v[1:] - lag1(v) * v[:-1]

def bh_reject(pvalues, q=0.05):
    p = np.asarray(pvalues, float); m = len(p); order = np.argsort(p); ok = p[order] <= q * np.arange(1, m + 1) / m
    k = int(np.max(np.flatnonzero(ok))) + 1 if ok.any() else 0; out = np.zeros(m, bool); out[order[:k]] = True
    return [bool(x) for x in out]
