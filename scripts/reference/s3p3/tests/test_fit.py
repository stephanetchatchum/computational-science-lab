import numpy as np
from pytest import approx
from src.fit import weekly_model, poisson_nll, fit

def test_poisson_nll():
    assert poisson_nll(np.array([2, 0]), np.array([1.0, 1.0])) == approx(2.0)

def test_fit_recovers_known_values():
    truth = weekly_model(0.40, 0.5, 100, 30, N=1_000_000)
    obs = np.round(0.1 * truth)
    betas = np.round(np.arange(0.30, 0.505, 0.01), 2)
    beta, s0, rho, nll = fit(obs, betas, [0.4, 0.5, 0.6, 1.0], I0s=[100], N=1_000_000)
    assert beta == approx(0.40)
    assert s0 == 0.5
    assert rho == approx(0.1, rel=0.01)
    assert beta * s0 * 8 == approx(1.6)
