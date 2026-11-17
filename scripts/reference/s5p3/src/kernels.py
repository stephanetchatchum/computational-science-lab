import numpy as np
from numba import njit, prange

def step_numpy(u, r):
    lap = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1) - 4 * u
    v = u + r * lap; v[0, :] = 0; v[-1, :] = 0; v[:, 0] = 0; v[:, -1] = 0; return v

@njit(parallel=True, fastmath=True)
def step_numba(u, r, steps):
    n, m = u.shape; out = np.zeros_like(u)
    for _ in range(steps):
        for i in prange(1, n - 1):
            for j in range(1, m - 1):
                out[i, j] = u[i, j] + r * (u[i+1, j] + u[i-1, j] + u[i, j+1] + u[i, j-1] - 4 * u[i, j])
        u[:, :] = out
        u[0, :] = 0; u[-1, :] = 0; u[:, 0] = 0; u[:, -1] = 0
    return u

def available_backends():
    b = ["numpy", "numba"]
    try:
        from numba import cuda
        if cuda.is_available(): b.append("cuda")
    except Exception: pass
    return b

from scipy.linalg import solve_banded

def lod_reference(u, r):
    n = u.shape[0]; m = n - 2; ab = np.zeros((3, m)); ab[0, 1:] = -r; ab[1] = 1 + 2 * r; ab[2, :-1] = -r
    v = u.copy(); v[1:-1, 1:-1] = solve_banded((1, 1), ab, v[1:-1, 1:-1].T).T
    v[1:-1, 1:-1] = solve_banded((1, 1), ab, v[1:-1, 1:-1]); v[0, :] = 0; v[-1, :] = 0; v[:, 0] = 0; v[:, -1] = 0
    return v

@njit
def thomas_line(d, r, out, cp):
    m = len(d); b = 1 + 2 * r; cp[0] = -r / b; out[0] = d[0] / b
    for i in range(1, m):
        den = b + r * cp[i - 1]; cp[i] = -r / den; out[i] = (d[i] + r * out[i - 1]) / den
    for i in range(m - 2, -1, -1): out[i] -= cp[i] * out[i + 1]

@njit(parallel=True)
def step_implicit_numba(u, r, steps):
    n = u.shape[0]; m = n - 2
    for _ in range(steps):
        for i in prange(1, n - 1):
            cp = np.empty(m); out = np.empty(m); thomas_line(u[i, 1:-1].copy(), r, out, cp); u[i, 1:-1] = out
        for j in prange(1, n - 1):
            cp = np.empty(m); out = np.empty(m); thomas_line(u[1:-1, j].copy(), r, out, cp); u[1:-1, j] = out
    return u
