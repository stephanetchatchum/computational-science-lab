import numpy as np

def gillespie_seir(N, beta, sigma, gamma, I0, t_end, seed=None):
    rng = np.random.default_rng(seed); S, E, I, R = N - I0, 0, I0, 0; t = 0.0; ts = [0.0]; ys = [(S, E, I, R)]
    while t < t_end:
        r1, r2, r3 = beta * S * I / N, sigma * E, gamma * I; total = r1 + r2 + r3
        if total == 0: break
        t += rng.exponential(1 / total); u = rng.random() * total
        if u < r1: S -= 1; E += 1
        elif u < r1 + r2: E -= 1; I += 1
        else: I -= 1; R += 1
        ts.append(t); ys.append((S, E, I, R))
    return np.array(ts), np.array(ys)

def ode_peak_and_final(N, beta, sigma, gamma, I0):
    f = lambda y: np.array([-beta * y[0] * y[2] / N, beta * y[0] * y[2] / N - sigma * y[1], sigma * y[1] - gamma * y[2], gamma * y[2]])
    y = np.array([N - I0, 0.0, I0, 0.0]); dt = 0.1; peak = I0
    for _ in range(2000):
        k1 = f(y); k2 = f(y + dt / 2 * k1); k3 = f(y + dt / 2 * k2); k4 = f(y + dt * k3); y = y + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4); peak = max(peak, y[2])
    return peak, N - y[0]
