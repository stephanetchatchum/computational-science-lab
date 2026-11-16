import itertools, math
import numpy as np

def neighbours(s):
    return np.roll(s, 1, 0) + np.roll(s, -1, 0) + np.roll(s, 1, 1) + np.roll(s, -1, 1)

def energy(s):
    """E = −Σ over bonds s_i s_j, each bond once: right and down neighbours, periodic."""
    return float(-np.sum(s * (np.roll(s, -1, 0) + np.roll(s, -1, 1))))

def magnetisation(s):
    return float(np.sum(s))

def delta_e(s, i, j):
    L = s.shape[0]; nb = s[(i + 1) % L, j] + s[(i - 1) % L, j] + s[i, (j + 1) % L] + s[i, (j - 1) % L]
    return 2.0 * s[i, j] * nb

def exact_average_energy(T, L=2):
    Z = 0.0; EZ = 0.0
    for bits in itertools.product((-1, 1), repeat=L * L):
        s = np.array(bits).reshape(L, L); E = energy(s); w = math.exp(-E / T); Z += w; EZ += E * w
    return EZ / Z

def sweep(s, T, rng):
    """One Metropolis sweep, checkerboard order: every site gets one flip attempt."""
    L = s.shape[0]; I, J = np.indices((L, L))
    for colour in (0, 1):
        mask = (I + J) % 2 == colour; dE = 2 * s * neighbours(s)
        flip = mask & (rng.random((L, L)) < np.exp(-dE / T)); s[flip] *= -1
    return s

def run(L, T, sweeps, burn=None, seed=None, start="random"):
    rng = np.random.default_rng(seed); s = np.ones((L, L), int) if start == "up" else rng.choice([-1, 1], (L, L))
    burn = sweeps // 5 if burn is None else burn; Es = []; Ms = []
    for k in range(burn + sweeps):
        sweep(s, T, rng)
        if k >= burn: Es.append(energy(s)); Ms.append(abs(magnetisation(s)))
    return np.array(Es), np.array(Ms), s

def autocorr_time(x, max_lag=None):
    x = np.asarray(x, float) - np.mean(x); n = len(x); v = x @ x / n; tau = 0.5
    for t in range(1, max_lag or n // 3):
        c = (x[:-t] @ x[t:]) / (n - t) / v
        if c <= 0: break
        tau += c
    return tau

def specific_heat(Es, T, N):
    return float(np.var(Es) / (T * T * N))
