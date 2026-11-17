try:
    from src.kernels import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.kernels': raise
import numpy as np
from src.kernels import step_numpy, step_numba, available_backends

def start(n):
    u = np.zeros((n, n)); u[n // 3: 2 * n // 3, n // 3: 2 * n // 3] = 100.0
    return u

def test_numba_matches_numpy_exactly():
    a = start(120); b = a.copy()
    for _ in range(50):
        a = step_numpy(a, 0.2)
    b = step_numba(b, 0.2, 50)
    assert np.allclose(a, b, atol=1e-9)

def test_heat_only_spreads_and_fades():
    u = start(120); first = u.max()
    for _ in range(50):
        u = step_numpy(u, 0.2)
    assert u.max() < first and u.min() >= -1e-9

def test_backends_listed():
    b = available_backends()
    assert "numpy" in b and "numba" in b          # "cuda" only if you have an NVIDIA card

from src.kernels import lod_reference, step_implicit_numba

def test_implicit_numba_matches_the_reference():
    a = start(60); b = a.copy()
    for _ in range(10):
        a = lod_reference(a, 2.0)
    b = step_implicit_numba(b, 2.0, 10)
    assert np.allclose(a, b, atol=1e-9)

def test_implicit_is_stable_far_past_the_explicit_limit():
    u = start(60); first = u.max()
    u = step_implicit_numba(u, 5.0, 20)                  # r = 5, twenty times the explicit limit
    assert u.max() < first and u.min() >= -1e-12
