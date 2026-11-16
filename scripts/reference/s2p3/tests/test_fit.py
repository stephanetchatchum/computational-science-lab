try:
    from src.solver import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.solver': raise
try:
    from src.fit import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.fit': raise
try:
    from src.data import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.data': raise
from pytest import approx
from src.fit import polyfit, polyval, rmse

X = [0, 1, 2, 3, 4, 5]

def test_line():
    c = polyfit(X, [2 * x + 5 for x in X], 1)
    assert c == approx([5.0, 2.0])

def test_parabola():
    c = polyfit(X, [x * x - 3 * x + 2 for x in X], 2)
    assert c == approx([2.0, -3.0, 1.0])

def test_polyval_and_rmse():
    assert polyval([5.0, 2.0], 3) == approx(11.0)
    assert rmse([1, 2, 3], [1, 2, 6]) == approx(3 / 3 ** 0.5)

import math
import numpy as np
from src.fit import householder_qr, lstsq_qr
from src.solver import gaussian_pivoted

XS = np.linspace(0, 1, 20)
V = np.vander(XS, 9, increasing=True)
TRUE = np.array([1, -2, 3, -4, 5, -6, 7, -8, 9], dtype=float)
Y = V @ TRUE

def test_condition_number_squares():
    assert np.linalg.cond(V.T @ V) == approx(np.linalg.cond(V) ** 2, rel=0.05)

def test_qr_factors():
    Q, R = householder_qr(V)
    assert np.allclose(Q.T @ Q, np.eye(9), atol=1e-12)
    assert np.allclose(Q @ R, V, atol=1e-12)

def test_qr_beats_normal_equations():
    qr_error = np.max(np.abs(lstsq_qr(V, Y) - TRUE))
    ne = gaussian_pivoted((V.T @ V).tolist(), (V.T @ Y).tolist())
    ne_error = np.max(np.abs(np.array(ne) - TRUE))
    assert qr_error < 1e-8
    assert ne_error > 1e-7
