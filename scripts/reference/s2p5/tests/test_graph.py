try:
    from src.graph import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.graph': raise
try:
    from src.towns import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.towns': raise
import numpy as np
from pytest import approx
from src.graph import degree, power_iteration, walker_visits

A = np.array([[0, 1, 1, 0],
              [1, 0, 1, 0],
              [1, 1, 0, 1],
              [0, 0, 1, 0]], dtype=float)

def test_degree():
    assert list(degree(A)) == [2, 2, 3, 1]

def test_power_iteration_matches_numpy():
    v = power_iteration(A)
    vals, vecs = np.linalg.eigh(A)
    best = np.abs(vecs[:, -1])
    assert v / v.max() == approx(best / best.max(), abs=1e-6)
    assert v / v.max() == approx([0.855, 0.855, 1.0, 0.461], abs=0.001)

def test_walkers_follow_degree_not_eigenvector():
    share = walker_visits(A, 200_000, seed=1)
    assert share == approx(degree(A) / degree(A).sum(), abs=0.01)

from src.graph import bfs_path, dijkstra

ADJ = {0: [1, 2], 1: [0, 2], 2: [0, 1, 3], 3: [2]}
W = {0: {1: 5, 2: 2}, 1: {0: 5, 2: 1}, 2: {0: 2, 1: 1, 3: 4}, 3: {2: 4}}

def test_bfs_counts_hops():
    assert bfs_path(ADJ, 0, 1) == [0, 1]
    assert bfs_path(ADJ, 0, 3) == [0, 2, 3]

def test_dijkstra_counts_distance():
    assert dijkstra(W, 0, 1) == (3, [0, 2, 1])
    assert dijkstra(W, 0, 3) == (6, [0, 2, 3])
