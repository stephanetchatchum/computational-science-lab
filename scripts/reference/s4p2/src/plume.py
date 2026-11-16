import numpy as np

def run(v=1.0, D=1.0, dx=0.05, length=50.0, t_end=10.0, x0=5.0, s0=0.5, dt=0.001, scheme="upwind"):
    x = np.arange(0, length, dx); c = np.exp(-(x - x0)**2 / (2 * s0**2)); c = c / (c.sum() * dx)
    for _ in range(round(t_end / dt)):
        if scheme == "central": adv = -v * (np.roll(c, -1) - np.roll(c, 1)) / (2 * dx)
        else: adv = -v * (c - np.roll(c, 1)) / dx
        dif = D * (np.roll(c, -1) - 2 * c + np.roll(c, 1)) / dx**2
        c = c + dt * (adv + dif)
    return x, c

def mean_and_variance(x, c):
    w = c / c.sum(); m = (x * w).sum(); return m, ((x - m)**2 * w).sum()

def numerical_diffusion(v, dx, dt):
    C = v * dt / dx; return v * dx * (1 - C) / 2

def cell_peclet(v, dx, D):
    return v * dx / D
