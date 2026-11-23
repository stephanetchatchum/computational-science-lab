import numpy as np
from src.outbreak import Outbreak

N_ACTIONS = 4

def bucket(f):
    """Turn each town's features into one of 72 boxes (the state)."""
    prev = np.digitize(f[:, 0], [1e-4, 1e-3, 5e-3])          # 0..3
    grow = np.digitize(f[:, 1], [-0.1, 0.1])                  # 0..2
    press = np.digitize(f[:, 2], [1e-4, 1e-3])                # 0..2
    vac = f[:, 4].astype(int)                                 # 0..1
    return ((prev * 3 + grow) * 3 + press) * 2 + vac

N_STATES = 4 * 3 * 3 * 2

def q_update(Q, s, a, r, s2, alpha=0.1, gamma=0.9):
    """One Q-learning step, for many (s, a, r, s2) at once."""
    target = r + gamma * Q[s2].max(axis=1)
    np.add.at(Q, (s, a), alpha * (target - Q[s, a]))
    return Q

def train_q(pops, G, episodes=400, lam=1.0, eps=0.2, seed=0, R0s=(2.0, 2.5, 3.0), towns=(0, 1, 2)):
    rng = np.random.default_rng(seed)
    Q = np.zeros((N_STATES, N_ACTIONS))
    N = np.asarray(pops, float)
    for ep in range(episodes):
        o = Outbreak(pops, G, R0=rng.choice(R0s), seed_town=rng.choice(towns))
        s = bucket(o.features())
        for w in range(26):
            a = np.where(rng.random(len(N)) < eps, rng.integers(0, N_ACTIONS, len(N)), Q[s].argmax(axis=1))
            new, cost = o.week(a)
            r = -100 * new / N - lam * cost / N                 # each town's own score per person
            s2 = bucket(o.features())
            q_update(Q, s, a, r, s2)
            s = s2
    return Q

def q_policy(Q):
    return lambda f: Q[bucket(f)].argmax(axis=1)
