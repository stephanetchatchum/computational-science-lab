import numpy as np

def pi_estimate(n, seed=None):
    rng = np.random.default_rng(seed); pts = rng.random((n, 2)) * 2 - 1
    inside = np.sum(pts[:, 0]**2 + pts[:, 1]**2 <= 1); return 4 * inside / n

def integrate(f, a, b, n, seed=None):
    rng = np.random.default_rng(seed); x = a + (b - a) * rng.random(n); y = f(x)
    return (b - a) * np.mean(y), 1.96 * (b - a) * np.std(y) / np.sqrt(n)

def trapezoid(f, a, b, n):
    h = (b - a) / n; x = np.linspace(a, b, n + 1); y = f(x); return h * (y.sum() - 0.5 * (y[0] + y[-1]))

def ball_volume_grid(d, m):
    g = -1 + (np.arange(m) + 0.5) * 2 / m; mesh = np.meshgrid(*([g] * d), indexing="ij")
    return float(np.mean(sum(a**2 for a in mesh) <= 1) * 2**d)

def ball_volume_mc(d, n, seed=None):
    p = np.random.default_rng(seed).uniform(-1, 1, (n, d)); return float(np.mean((p**2).sum(1) <= 1) * 2**d)
