import math
import numpy as np
from src.model import weekly_cases, log_likelihood

def log_posterior(theta, obs, prior_gamma=None, **model):
    beta, gamma, rho = theta
    if not (0 < beta < 2 and 0.02 < gamma < 1 and 0 < rho < 1): return -math.inf
    lp = log_likelihood(obs, [rho * m for m in weekly_cases(beta, gamma, len(obs), **model)])
    if prior_gamma is not None:
        mean, sd = prior_gamma; lp += -0.5 * ((gamma - mean) / sd) ** 2
    return lp

def metropolis(log_target, start, steps, cov, seed):
    rng = np.random.default_rng(seed); x = np.log(np.array(start, float)); lp = log_target(np.exp(x))
    L = np.linalg.cholesky(cov); chain = np.empty((steps, len(x))); accepted = 0
    for k in range(steps):
        y = x + L @ rng.normal(size=len(x)); lq = log_target(np.exp(y))
        if math.log(rng.random()) < lq - lp: x, lp = y, lq; accepted += 1
        chain[k] = np.exp(x)
    return chain, accepted / steps

def gelman_rubin(chains):
    chains = [np.asarray(c, float) for c in chains]; n = len(chains[0])
    W = np.mean([c.var(ddof=1) for c in chains]); B = n * np.var([c.mean() for c in chains], ddof=1)
    return math.sqrt(((n - 1) / n * W + B / n) / W)

def calibrate(obs, start=(0.5, 0.15, 0.05), pilot=2000, steps=2500, burn=500, seed=0, prior_gamma=None, **model):
    target = lambda th: log_posterior(th, obs, prior_gamma, **model)
    first, _ = metropolis(target, start, pilot, np.diag([0.01, 0.01, 0.01]) ** 2, seed)
    cov = np.cov(np.log(first[pilot // 2:]).T) * 2.38**2 / 3 + 1e-12 * np.eye(3)
    chains, rates = [], []
    for k, f in enumerate((0.9, 1.1, 0.95, 1.05)):
        c, a = metropolis(target, first[-1] * f, steps, cov, seed + 1 + k); chains.append(c[burn:]); rates.append(a)
    return chains, rates
