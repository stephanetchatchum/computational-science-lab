import numpy as np

def euler_solve(f, y0, t0, t_end, dt):
    ts, ys = [t0], [y0]; t, y = t0, y0
    for _ in range(round((t_end - t0) / dt)):
        y = y + dt * f(t, y); t = t + dt; ts.append(t); ys.append(y)
    return ts, ys

def rk4_step(f, t, y, dt):
    k1 = f(t, y); k2 = f(t + dt / 2, y + dt / 2 * k1); k3 = f(t + dt / 2, y + dt / 2 * k2); k4 = f(t + dt, y + dt * k3)
    return y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def rk4_solve(f, y0, t0, t_end, dt):
    ts, ys = [t0], [y0]; t, y = t0, y0
    for _ in range(round((t_end - t0) / dt)):
        y = rk4_step(f, t, y, dt); t = t + dt; ts.append(t); ys.append(y)
    return ts, ys

def adaptive_rk4(f, y0, t0, t_end, tol):
    ts, ys = [t0], [y0]; t, y, dt = t0, y0, 0.1
    while t < t_end:
        dt = min(dt, t_end - t)
        big = rk4_step(f, t, y, dt)
        small = rk4_step(f, t + dt / 2, rk4_step(f, t, y, dt / 2), dt / 2)
        err = np.max(np.abs(small - big)) / 15
        if err <= tol:
            y = small; t += dt; ts.append(t); ys.append(y)
        dt = dt * min(2.0, max(0.2, 0.9 * (tol / (err + 1e-30)) ** 0.2))
    return ts, ys

def backward_euler_solve(f, y0, t0, t_end, dt):
    ts, ys = [t0], [y0]; t, y = t0, y0
    for _ in range(round((t_end - t0) / dt)):
        tn = t + dt; z = y
        for _ in range(30):
            g = z - y - dt * f(tn, z); dg = 1 - dt * (f(tn, z + 1e-7) - f(tn, z)) / 1e-7
            z_new = z - g / dg
            if abs(z_new - z) < 1e-12:
                z = z_new; break
            z = z_new
        y, t = z, tn; ts.append(t); ys.append(y)
    return ts, ys
