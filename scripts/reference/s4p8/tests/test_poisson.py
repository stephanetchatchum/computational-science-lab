import math
import numpy as np
from pytest import approx
from src.poisson import grid, laplacian_matrix, solve_direct

def test_matrix_shape_and_entries():
    A = laplacian_matrix(3)                    # 3 x 3 interior points, h = 1/4
    assert A.shape == (9, 9)
    assert abs(A - A.T).max() == 0             # symmetric
    assert A[4, 4] == approx(64.0)             # 4 / h²
    assert A[4, 1] == approx(-16.0) and A[4, 3] == approx(-16.0)

def manufactured(N):
    x, h = grid(N)
    X, Y = np.meshgrid(x, x, indexing="ij")
    return 2 * math.pi**2 * np.sin(math.pi * X) * np.sin(math.pi * Y), np.sin(math.pi * X) * np.sin(math.pi * Y)

def test_second_order_accurate():
    errs = []
    for N in (15, 31):
        f, exact = manufactured(N)
        errs.append(np.max(np.abs(solve_direct(f) - exact)))
    assert errs[1] < 1e-3
    assert errs[0] / errs[1] == approx(4.0, abs=0.2)

from src.poisson import jacobi, sor, omega_opt

def test_gauss_seidel_is_twice_as_fast_as_jacobi():
    f = np.ones((15, 15))
    _, n_jacobi = jacobi(f)
    _, n_gs = sor(f, 1.0)
    assert 0.45 < n_gs / n_jacobi < 0.55

def test_sor_is_much_faster_again():
    f = np.ones((15, 15))
    _, n_gs = sor(f, 1.0)
    _, n_sor = sor(f, omega_opt(15))
    assert n_sor < n_gs / 5

def test_best_omega_matches_theory():
    f = np.ones((15, 15))
    scan = [(sor(f, w)[1], w) for w in np.arange(1.50, 1.86, 0.01)]
    best = min(scan)[1]
    assert abs(best - omega_opt(15)) / omega_opt(15) < 0.02

from src.poisson import conjugate_gradient

def test_cg_matches_direct_and_scales_like_n():
    its = []
    for N in (15, 31):
        f = np.ones((N, N))
        u, n = conjugate_gradient(laplacian_matrix(N), f.ravel(), tol=1e-6)
        assert np.allclose(u.reshape(N, N), solve_direct(f), rtol=1e-4)
        its.append(n)
    assert 1.8 < its[1] / its[0] < 2.2          # double N, double the iterations (Jacobi: four times)

from src.poisson import charges

def test_point_charge_potential():
    N = 63
    u = solve_direct(charges(N, [(0.5, 0.5, 1.0)]))
    c = 31                                      # the charge's cell
    numeric = u[c + 4, c] - u[c + 12, c]
    theory = math.log(12 / 4) / (2 * math.pi)   # 2D point charge: φ = −(q/2π)·ln r + constant
    assert numeric == approx(theory, rel=0.02)
