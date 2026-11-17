try:
    from src.model import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.model': raise
try:
    from src.mcmc import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.mcmc': raise
import math
import numpy as np
from pytest import approx
from src.model import weekly_cases, log_likelihood

def test_poisson_log_likelihood():
    # P(2 | mean 1) * P(0 | mean 1) = (e^-1 / 2) * e^-1
    assert log_likelihood([2, 0], [1.0, 1.0]) == approx(-2 - math.log(2))

def test_epidemic_rises_then_falls():
    w = weekly_cases(0.4, 0.125)
    peak = int(np.argmax(w))
    assert 5 < peak < 20
    assert w[0] < w[peak] and w[-1] < w[peak]
    assert sum(w) < 1e6                                  # nobody is infected twice

from src.mcmc import metropolis, gelman_rubin

def test_metropolis_samples_a_known_distribution():
    target = lambda th: -0.5 * (math.log(th[0]) / 0.5) ** 2    # log of the sample is normal(0, 0.5)
    chain, rate = metropolis(target, [1.0], 20000, np.array([[0.5 ** 2]]), seed=0)
    logs = np.log(chain[2000:, 0])
    assert abs(logs.mean()) < 0.05
    assert logs.std() == approx(0.5, abs=0.05)
    assert 0.3 < rate < 0.9

def test_gelman_rubin():
    rng = np.random.default_rng(0)
    agree = [rng.normal(size=2000) for _ in range(4)]
    disagree = [rng.normal(loc=k, size=2000) for k in range(4)]
    assert gelman_rubin(agree) < 1.01
    assert gelman_rubin(disagree) > 1.5

import pytest
from src.mcmc import calibrate

TRUE = [0.4, 0.125, 0.02]                                # beta, gamma, reporting rate
OBS = [int(v) for v in np.random.default_rng(0).poisson(0.02 * np.array(weekly_cases(0.4, 0.125)))]

@pytest.fixture(scope="module")
def fit():
    return calibrate(OBS)                                 # about 10 seconds

def test_recovers_the_truth_from_fake_data(fit):
    chains, rates = fit
    for j, true in enumerate(TRUE):
        assert gelman_rubin([c[:, j] for c in chains]) < 1.05
        lo, hi = np.percentile(np.concatenate([c[:, j] for c in chains]), [2.5, 97.5])
        assert lo < true < hi
    assert all(0.15 < r < 0.6 for r in rates)

def test_posterior_predictive_covers_the_data(fit):
    chains, _ = fit
    draws = np.concatenate(chains)
    rng = np.random.default_rng(5)
    sims = [rng.poisson(draws[i, 2] * np.array(weekly_cases(draws[i, 0], draws[i, 1]))) for i in rng.integers(0, len(draws), 200)]
    lo, hi = np.percentile(sims, [2.5, 97.5], axis=0)
    assert np.mean((np.array(OBS) >= lo) & (np.array(OBS) <= hi)) >= 0.9
