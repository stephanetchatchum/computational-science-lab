import numpy as np

def peak_temp(alpha, hot_size, steps=400, n=80):
    assert alpha * 0.2 <= 0.25
    u = np.zeros((n, n)); a = n // 2 - hot_size // 2; u[a:a + hot_size, a:a + hot_size] = 100.0
    for _ in range(steps):
        lap = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1) - 4 * u
        u = u + 0.2 * alpha * lap; u[0, :] = 0; u[-1, :] = 0; u[:, 0] = 0; u[:, -1] = 0
    return float(u[n // 2, n // 2])
