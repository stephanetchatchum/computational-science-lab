import numpy as np

def laplacian(Z):
    up, down, left, right = np.roll(Z, 1, 0), np.roll(Z, -1, 0), np.roll(Z, 1, 1), np.roll(Z, -1, 1)
    diag = np.roll(up, 1, 1) + np.roll(up, -1, 1) + np.roll(down, 1, 1) + np.roll(down, -1, 1)
    return -Z + 0.2 * (up + down + left + right) + 0.05 * diag

def gs_step(U, V, f, k, Du=1.0, Dv=0.5):
    uvv = U * V * V
    return U + Du * laplacian(U) - uvv + f * (1 - U), V + Dv * laplacian(V) + uvv - (f + k) * V

def new_state(n, seed=None):
    rng = np.random.default_rng(seed); U = np.ones((n, n)); V = np.zeros((n, n)); a, b = n // 2 - 14, n // 2 + 14
    U[a:b, a:b] = 0.5; V[a:b, a:b] = 0.25; V += 0.02 * rng.random((n, n)); return U, V

PRESETS = {"spots": (0.030, 0.062), "stripes": (0.022, 0.051), "coral": (0.0545, 0.062), "rings": (0.029, 0.057), "worms": (0.045, 0.063), "dividing spots": (0.0367, 0.0649)}
