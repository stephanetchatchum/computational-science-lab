try:
    from src.solver import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.solver': raise
import numpy as np
from pytest import approx
from src.solver import gaussian_eliminate, gaussian_pivoted, lu_decompose

def test_easy_system():
    A = [[2.0, 1.0], [1.0, 3.0]]; b = [3.0, 5.0]
    assert gaussian_eliminate(A, b) == approx([0.8, 1.4])
    assert gaussian_pivoted(A, b) == approx([0.8, 1.4])

def test_pivoting_is_needed():
    A = [[1e-20, 1.0], [1.0, 1.0]]; b = [1.0, 2.0]
    bad = gaussian_eliminate(A, b)
    good = gaussian_pivoted(A, b)
    assert abs(bad[0] - 1.0) > 0.5            # the naive answer is badly wrong
    assert good == approx([1.0, 1.0], abs=1e-6)

def test_lu():
    A = [[2.0, 1.0], [1.0, 3.0]]
    L, U = lu_decompose(A)
    assert np.allclose(np.array(L) @ np.array(U), A)
    assert L[0][0] == 1 and U[1][0] == 0

def test_hilbert_8():
    n = 8
    H = [[1 / (i + j + 1) for j in range(n)] for i in range(n)]
    b = [sum(row) for row in H]               # so the true answer is all ones
    x = gaussian_pivoted(H, b)
    assert np.allclose(x, 1.0, atol=1e-5)
    assert abs(np.linalg.cond(np.array(H)) - 1.526e10) < 1e8

from src.solver import count_flops, lu_solve

def test_flop_count():
    assert count_flops(2) == 3
    assert count_flops(3) == 11
    assert 1.0 <= count_flops(100) / (100 ** 3 / 3) <= 1.05

def test_lu_is_reusable():
    A = [[4.0, 1.0, 0.0], [1.0, 4.0, 1.0], [0.0, 1.0, 4.0]]
    L, U = lu_decompose(A)
    assert lu_solve(L, U, [5.0, 6.0, 5.0]) == approx([1.0, 1.0, 1.0])
    assert lu_solve(L, U, [4.0, 1.0, 0.0]) == approx(list(np.linalg.solve(A, [4.0, 1.0, 0.0])))
