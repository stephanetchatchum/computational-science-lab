import numpy as np

class Epidemic:
    def __init__(self, pops, G, beta, sigma, gamma, i0, travel, seed=None):
        self.rng = np.random.default_rng(seed); self.pops = pops; self.G = G
        self.beta, self.sigma, self.gamma, self.travel = beta, sigma, gamma, travel
        self.town = np.repeat(np.arange(len(pops)), pops); self.state = np.zeros(len(self.town), int); self.where = self.town.copy()
        first = np.flatnonzero(self.town == 0); self.state[self.rng.choice(first, i0, replace=False)] = 2
    def step_day(self):
        old = self.state.copy(); n_t = len(self.pops)
        if self.travel > 0 and n_t > 1:
            go = self.rng.random(len(self.town)) < self.travel; self.where = self.town.copy()
            for k in np.flatnonzero(go): self.where[k] = self.rng.choice(n_t, p=self.G[self.town[k]])
        else: self.where = self.town.copy()
        new = old.copy()
        for t in range(n_t):
            here = self.where == t; n = here.sum()
            if n == 0: continue
            I = np.sum(here & (old == 2)); p = 1 - np.exp(-self.beta * I / n)
            s = np.flatnonzero(here & (old == 0)); new[s[self.rng.random(len(s)) < p]] = 1
        e = np.flatnonzero(old == 1); new[e[self.rng.random(len(e)) < 1 - np.exp(-self.sigma)]] = 2
        i = np.flatnonzero(old == 2); new[i[self.rng.random(len(i)) < 1 - np.exp(-self.gamma)]] = 3
        self.state = new
    def counts(self):
        return tuple(int(np.sum(self.state == k)) for k in range(4))
    def counts_by_town(self):
        return np.array([[np.sum((self.town == t) & (self.state == k)) for k in range(4)] for t in range(len(self.pops))])
