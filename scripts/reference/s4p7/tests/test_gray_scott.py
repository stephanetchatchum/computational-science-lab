try:
    from src.gray_scott import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.gray_scott': raise
import numpy as np
from pytest import approx
from src.gray_scott import gs_step, laplacian, PRESETS, new_state

def lap_reference(Z):
    n, m = Z.shape; out = np.zeros_like(Z)
    for i in range(n):
        for j in range(m):
            s = -Z[i, j]
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    if di == 0 and dj == 0: continue
                    w = 0.2 if di == 0 or dj == 0 else 0.05
                    s += w * Z[(i + di) % n, (j + dj) % m]
            out[i, j] = s
    return out

def test_laplacian_matches_a_slow_loop():
    Z = np.random.default_rng(0).random((12, 12))
    assert np.allclose(laplacian(Z), lap_reference(Z))

def test_no_v_means_pure_diffusion():
    U = np.random.default_rng(1).random((12, 12)); V = np.zeros((12, 12))
    U2, V2 = gs_step(U, V, f=0.0, k=0.06)           # no feed, no V
    assert np.allclose(U2, U + 1.0 * lap_reference(U))
    assert np.allclose(V2, 0.0)

def test_empty_dish_stays_empty():
    U = np.ones((12, 12)); V = np.zeros((12, 12))
    U2, V2 = gs_step(U, V, f=0.03, k=0.06)
    assert np.allclose(U2, 1.0) and np.allclose(V2, 0.0)

def test_presets_and_start():
    assert len(PRESETS) == 6
    U, V = new_state(160, seed=0)
    assert U.shape == (160, 160) and V.max() > 0.2
