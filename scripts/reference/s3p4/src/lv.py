import numpy as np
from src.solvers import rk4_solve
ALPHA, BETA, DELTA, GAMMA = 1.0, 0.1, 0.075, 1.5

def lv_rhs(t, y, a=ALPHA, b=BETA, d=DELTA, g=GAMMA):
    x, yy = y; return np.array([a * x - b * x * yy, d * x * yy - g * yy])

def fixed_point():
    return (GAMMA / DELTA, ALPHA / BETA)

def simulate_lv(x0, y0, t_end, dt):
    return rk4_solve(lv_rhs, np.array([x0, y0]), 0.0, t_end, dt)

def period(ts, ys):
    xs = [y[0] for y in ys]; pk = [ts[i] for i in range(1, len(xs) - 1) if xs[i] > xs[i - 1] and xs[i] > xs[i + 1]]
    return pk[1] - pk[0]

def jacobian(x, y, a=ALPHA, b=BETA, d=DELTA, g=GAMMA):
    return np.array([[a - b * y, -b * x], [d * y, d * x - g]])
