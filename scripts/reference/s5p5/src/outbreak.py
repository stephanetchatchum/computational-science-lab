import numpy as np

# action: (multiply transmission by, multiply travel by, share of S vaccinated per day, cost per person per week)
ACTIONS = {
    0: ("nothing",   1.0, 1.0, 0.0,  0.0),
    1: ("test",      0.7, 1.0, 0.0,  0.2),
    2: ("lockdown",  0.3, 0.2, 0.0,  1.0),
    3: ("vaccinate", 1.0, 1.0, 0.005, 0.4),
}

def growth_rate(beta, sigma, gamma):
    """Early exponential growth rate r of SEIR (per day): positive root of r^2 + (sigma+gamma) r + sigma(gamma-beta) = 0."""
    return (-(sigma + gamma) + np.sqrt((sigma - gamma) ** 2 + 4 * sigma * beta)) / 2

class Outbreak:
    """SEIR in every town, joined by gravity-model travel. One call to week() = 7 days."""
    def __init__(self, pops, G, R0=2.5, sigma=1 / 4, gamma=1 / 6, seed_town=0, seed_cases=20, travel=0.02, substeps=10, vaccine_week=10):
        self.N = np.asarray(pops, float); self.G = np.asarray(G, float)
        self.sigma, self.gamma, self.beta = sigma, gamma, R0 * gamma
        self.travel, self.h = travel, 1.0 / substeps
        n = len(self.N)
        self.E = np.zeros(n); self.I = np.zeros(n); self.R = np.zeros(n)
        self.I[seed_town] = seed_cases
        self.S = self.N - self.I
        self.cases = 0.0
        self.last_I = self.I.copy()
        self.vaccine_week, self.weeks = vaccine_week, 0

    def state(self):
        return self.S.copy(), self.E.copy(), self.I.copy(), self.R.copy()

    def week(self, actions):
        """Apply one action per town for 7 days. Returns new infections per town and cost per town."""
        a = np.asarray(actions)
        if self.weeks < self.vaccine_week: a = np.where(a == 3, 0, a)   # no vaccine yet: asking for it does nothing
        self.weeks += 1
        bmul = np.array([ACTIONS[k][1] for k in a]); tmul = np.array([ACTIONS[k][2] for k in a])
        vacc = np.array([ACTIONS[k][3] for k in a]); cost = np.array([ACTIONS[k][4] for k in a]) * self.N
        self.last_I = self.I.copy()
        new = np.zeros_like(self.N)
        m = self.travel * tmul
        for _ in range(int(round(7 / self.h))):
            frac = self.I / self.N
            seen = (1 - m) * frac + m * (self.G @ frac)          # infectious share a resident of each town meets
            inf = self.beta * bmul * self.S * seen * self.h
            prog = self.sigma * self.E * self.h
            rec = self.gamma * self.I * self.h
            vac = vacc * self.S * self.h
            self.S = self.S - inf - vac; self.E = self.E + inf - prog
            self.I = self.I + prog - rec; self.R = self.R + rec + vac
            new += inf
        self.cases += new.sum()
        return new, cost

    def features(self):
        """What the AI sees for each town: prevalence, growth, infection pressure from elsewhere, share immune."""
        prev = self.I / self.N
        growth = np.log((self.I + 1) / (self.last_I + 1))
        pressure = self.G @ prev
        immune = self.R / self.N
        vaccine = np.full(len(prev), float(self.weeks >= self.vaccine_week))
        return np.c_[prev, growth, pressure, immune, vaccine]
