try:
    from src.fourier import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.fourier': raise
try:
    from src.data import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.data': raise
import numpy as np
from pytest import approx
from src.fourier import dft_matrix, dft

def test_dft_equals_fft():
    x = np.random.default_rng(5).normal(size=64)
    assert np.max(np.abs(dft(x) - np.fft.fft(x))) < 1e-10

def test_matrix_is_unitary_up_to_n():
    F = dft_matrix(64)
    assert np.allclose(F @ F.conj().T, 64 * np.eye(64), atol=1e-9)

from src.fourier import power_spectrum, parseval_error

DAYS = np.arange(30 * 365)
SERIES = (15 + 6 * np.cos(2 * np.pi * DAYS / 365.25) + 2 * np.cos(4 * np.pi * DAYS / 365.25 + 1)
          + np.random.default_rng(2).normal(0, 1.5, DAYS.size))

def test_parseval():
    assert parseval_error(SERIES) < 1e-10

def test_annual_and_semiannual_peaks():
    f, p = power_spectrum(SERIES, dt=1.0)
    df = f[1]
    k1 = np.argmax(p)
    assert abs(f[k1] - 1 / 365.25) <= df
    p2 = p.copy(); p2[max(0, k1 - 2):k1 + 3] = 0
    assert abs(f[np.argmax(p2)] - 2 / 365.25) <= df

from src.fourier import spectral_derivative, heat_spectral

N = 32
X = 2 * np.pi * np.arange(N) / N

def test_spectral_derivative_is_nearly_exact():
    d = spectral_derivative(np.sin(3 * X))
    assert np.max(np.abs(d - 3 * np.cos(3 * X))) < 1e-12

def test_finite_differences_are_not():
    f = np.sin(3 * X); h = 2 * np.pi / N
    fd = (np.roll(f, -1) - np.roll(f, 1)) / (2 * h)
    assert np.max(np.abs(fd - 3 * np.cos(3 * X))) > 0.1

def test_heat_equation_solved_exactly():
    u0 = np.sin(X) + 0.5 * np.sin(3 * X)
    u = heat_spectral(u0, alpha=0.1, t=0.5)
    exact = np.exp(-0.05) * np.sin(X) + 0.5 * np.exp(-0.45) * np.sin(3 * X)
    assert np.max(np.abs(u - exact)) < 1e-12
