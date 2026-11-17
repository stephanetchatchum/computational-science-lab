import numpy as np
from numba import njit

def acc_python(r, m, eps):
    n = len(m); a = np.zeros((n, 3))
    for i in range(n):
        for j in range(n):
            if i == j: continue
            d = r[j] - r[i]; r2 = d @ d + eps**2; a[i] += m[j] * d / r2**1.5
    return a

def acc_numpy(r, m, eps):
    d = r[None, :, :] - r[:, None, :]; r2 = (d**2).sum(axis=2) + eps**2
    with np.errstate(divide="ignore", invalid="ignore"):
        w = m[None, :] / r2**1.5
    np.fill_diagonal(w, 0.0); return (w[:, :, None] * d).sum(axis=1)

@njit
def acc_numba(r, m, eps):
    n = len(m); a = np.zeros((n, 3))
    for i in range(n):
        for j in range(n):
            if i == j: continue
            d = r[j] - r[i]; r2 = d[0]*d[0] + d[1]*d[1] + d[2]*d[2] + eps**2
            for k in range(3): a[i, k] += m[j] * d[k] / r2**1.5
    return a

def leapfrog(r, v, m, dt, eps, acc_fn):
    a = acc_fn(r, m, eps); v = v + 0.5 * dt * a; r = r + dt * v; a = acc_fn(r, m, eps); v = v + 0.5 * dt * a
    return r, v
