import numpy as np
from src.play import play

N_IN, N_HID, N_OUT = 5, 8, 4
N_W = N_IN * N_HID + N_HID + N_HID * N_OUT + N_OUT
SCALE = np.array([100.0, 1.0, 100.0, 1.0, 1.0])

def net_policy(w):
    W1 = w[:N_IN * N_HID].reshape(N_IN, N_HID); b1 = w[N_IN * N_HID:N_IN * N_HID + N_HID]
    k = N_IN * N_HID + N_HID
    W2 = w[k:k + N_HID * N_OUT].reshape(N_HID, N_OUT); b2 = w[k + N_HID * N_OUT:]
    def policy(f):
        h = np.tanh((f * SCALE) @ W1 + b1)
        return (h @ W2 + b2).argmax(axis=1)
    return policy

def next_generation(pop, fitness, rng, elite=8, sigma=0.2):
    order = np.argsort(fitness)[::-1]
    best = pop[order[:elite]]
    kids = best[rng.integers(0, elite, len(pop) - elite)] + rng.normal(0, sigma, (len(pop) - elite, pop.shape[1]))
    return np.vstack([best, kids])

def train_evo(pops, G, gens=40, size=40, lam=1.0, seed=0, R0s=(2.0, 2.5, 3.0), towns=(0, 1, 2), log=print):
    rng = np.random.default_rng(seed)
    pop = rng.normal(0, 0.5, (size, N_W))
    cases = [(R0, t) for R0 in R0s for t in towns]
    for g in range(gens):
        fit = np.array([np.mean([play(net_policy(w), pops, G, lam=lam, R0=R0, seed_town=t)["score"] for R0, t in cases]) for w in pop])
        best = pop[fit.argmax()].copy()
        if log: log(g, round(fit.max(), 2), round(np.median(fit), 2))
        pop = next_generation(pop, fit, rng)
    return best
