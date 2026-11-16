import numpy as np

def classify(mm):
    return 0 if mm < 1 else 1 if mm <= 10 else 2

def transition_matrix(states, n):
    c = np.zeros((n, n))
    for a, b in zip(states[:-1], states[1:]): c[a][b] += 1
    return c / c.sum(axis=1, keepdims=True)

def stationary_eig(P):
    vals, vecs = np.linalg.eig(np.asarray(P).T); v = vecs[:, np.argmin(np.abs(vals - 1))]; return list((v / v.sum()).real)

def simulate(P, steps, seed=None, start=0):
    rng = np.random.default_rng(seed); s = start; out = [s]
    for _ in range(steps - 1): s = int(rng.choice(len(P), p=P[s])); out.append(s)
    return out

def spell_lengths(states):
    out = []; run = 0
    for s in states:
        if s == 0: run += 1
        elif run: out.append(run); run = 0
    if run: out.append(run)
    return out

def mean_dry_spell(states):
    s = spell_lengths(states); return sum(s) / len(s)

def chi_square(observed, expected):
    return sum((o - e) ** 2 / e for o, e in zip(observed, expected))
