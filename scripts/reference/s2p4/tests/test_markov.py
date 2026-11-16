try:
    from src.markov import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.markov': raise
try:
    from src.nasa import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.nasa': raise
import numpy as np
from pytest import approx
from src.markov import classify, transition_matrix, stationary_eig, simulate, mean_dry_spell

P = np.array([[0.9, 0.1], [0.5, 0.5]])

def test_classify():
    assert classify(0.0) == 0      # dry:   less than 1 mm
    assert classify(0.99) == 0
    assert classify(1.0) == 1      # light: 1 to 10 mm
    assert classify(10.0) == 1
    assert classify(10.1) == 2     # heavy: more than 10 mm

def test_transition_matrix_counts():
    M = transition_matrix([0, 0, 1, 0, 1, 1], 2)
    assert np.allclose(M, [[1 / 3, 2 / 3], [1 / 2, 1 / 2]])

def test_stationary_by_eigenvector():
    assert stationary_eig(P) == approx([5 / 6, 1 / 6])

def test_stationary_by_simulation():
    path = simulate(P, 200_000, seed=1)
    share = [path.count(0) / len(path), path.count(1) / len(path)]
    assert share == approx([5 / 6, 1 / 6], abs=0.01)

def test_dry_spells():
    assert mean_dry_spell([0, 0, 1, 0, 0, 0, 2, 0]) == approx((2 + 3 + 1) / 3)

from src.markov import spell_lengths, chi_square

def test_spell_lengths():
    assert spell_lengths([0, 0, 1, 0, 0, 0, 2, 0]) == [2, 3, 1]

def test_chi_square():
    assert chi_square([10, 20], [15, 15]) == approx(10 / 3)

def test_geometric_mean_spell():
    path = simulate(P, 200_000, seed=1)
    assert np.mean(spell_lengths(path)) == approx(10.0, abs=0.3)
