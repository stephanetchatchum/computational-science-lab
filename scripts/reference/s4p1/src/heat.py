import math
import numpy as np

def heat1d(n, dt, alpha=0.01, t_end=2.0):
    x = np.linspace(0, 1, n); dx = x[1] - x[0]; r = alpha * dt / dx**2; u = np.sin(np.pi * x)
    for _ in range(round(t_end / dt)):
        u[1:-1] = u[1:-1] + r * (u[2:] - 2 * u[1:-1] + u[:-2]); u[0] = 0; u[-1] = 0
    return x, u, r

def blow_up_step(n, r, alpha=0.01, limit=10, max_steps=1000):
    x = np.linspace(0, 1, n); u = np.sin(np.pi * x)
    for s in range(1, max_steps + 1):
        u[1:-1] = u[1:-1] + r * (u[2:] - 2 * u[1:-1] + u[:-2]); u[0] = 0; u[-1] = 0
        if np.max(np.abs(u)) > limit: return s
    return None

def heat2d_step(u, r):
    lap = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1) - 4 * u
    u = u + r * lap; u[0, :] = 0; u[-1, :] = 0; u[:, 0] = 0; u[:, -1] = 0
    return u

def blow_up_2d(r, n=60, steps=400):
    u = np.zeros((n, n)); u[25:35, 25:35] = 100.0
    for s in range(1, steps + 1):
        u = heat2d_step(u, r)
        if np.max(np.abs(u)) > 1000: return s
    return None

def thomas(a, b, c, d):
    n = len(b); cp = np.zeros(n); dp = np.zeros(n); cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0]
    for i in range(1, n):
        m = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / m; dp[i] = (d[i] - a[i] * dp[i - 1]) / m
    x = np.zeros(n); x[-1] = dp[-1]
    for i in range(n - 2, -1, -1): x[i] = dp[i] - cp[i] * x[i + 1]
    return x

def heat1d_implicit(n, dt, alpha=0.01, t_end=2.0):
    x = np.linspace(0, 1, n); dx = x[1] - x[0]; r = alpha * dt / dx**2; u = np.sin(np.pi * x); m = n - 2
    a = np.full(m, -r); b = np.full(m, 1 + 2 * r); c = np.full(m, -r)
    for _ in range(round(t_end / dt)):
        u[1:-1] = thomas(a, b, c, u[1:-1]); u[0] = 0; u[-1] = 0
    return x, u, r

def richardson_order(u_coarse, u_mid, u_fine):
    return math.log2(abs(u_coarse - u_mid) / abs(u_mid - u_fine))
