import math
import numpy as np
NX, NZ, DX, DT, F0, T0 = 300, 200, 5.0, 0.001, 15.0, 0.08
SRC = (2, 150); RECV = [150, 170, 190, 210]; IFACE = 40; OFFSETS = [0, 100, 200, 300]

def ricker(t, f0=F0, t0=T0):
    a = (math.pi * f0 * (t - t0))**2; return (1 - 2 * a) * math.exp(-a)

def check_cfl(c_max, dt, dx):
    if c_max * dt / dx > 0.7071: raise ValueError("CFL")

def run_wave(layered, t_end=0.7, dt=DT, check=True):
    c = np.full((NZ, NX), 1500.0)
    if layered: c[IFACE:, :] = 3000.0
    if check: check_cfl(c.max(), dt, DX)
    cc = (c * dt / DX)**2; p_old = np.zeros((NZ, NX)); p = np.zeros((NZ, NX)); n = round(t_end / dt); tr = np.zeros((4, n))
    for s in range(n):
        lap = np.zeros_like(p); lap[1:-1, 1:-1] = p[2:, 1:-1] + p[:-2, 1:-1] + p[1:-1, 2:] + p[1:-1, :-2] - 4 * p[1:-1, 1:-1]
        p_new = 2 * p - p_old + cc * lap; p_new[SRC] += ricker(s * dt)
        p_new[0, :] = 0; p_new[-1, :] = 0; p_new[:, 0] = 0; p_new[:, -1] = 0
        p_old, p = p, p_new; tr[:, s] = [p[2, j] for j in RECV]
    return tr

def direct_speed(traces):
    k = round(0.4 / DT); t1 = np.argmax(np.abs(traces[1, :k])) * DT; t3 = np.argmax(np.abs(traces[3, :k])) * DT
    return 200 / (t3 - t1)

def estimate_depths(layered, uniform):
    d = layered - uniform; out = []
    for r, off in enumerate(OFFSETS):
        t = np.argmax(np.abs(d[r])) * DT; out.append(0.5 * math.sqrt((1500 * (t - T0))**2 - off**2))
    return out
