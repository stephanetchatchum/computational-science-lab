try:
    from src.truss import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.truss': raise
import math
import numpy as np
from pytest import approx
from src.truss import solve_truss, equilibrium_error

def test_the_hand_calculation():
    nodes = [(0, 0, 0), (4, 0, 0), (2, 3, 0)]
    members = [(0, 2, 1000.0), (1, 2, 1000.0)]
    # Both bars lie in the x–y plane, so nothing resists node 2 moving in z: lock it.
    u, forces = solve_truss(nodes, members, [(0, "xyz"), (1, "xyz"), (2, "z")], {2: (0.0, -100.0, 0.0)})
    assert u[2][1] == approx(-0.07222, abs=1e-4)
    assert forces == approx([-60.09, -60.09], abs=0.01)

def make_bridge():
    nodes = [(0,0,0), (2,0,0), (4,0,0), (1,1.5,0), (3,1.5,0),
             (0,0,2), (2,0,2), (4,0,2), (1,1.5,2), (3,1.5,2)]
    pairs = [(0,1),(1,2),(0,3),(3,1),(1,4),(4,2),(3,4),
             (5,6),(6,7),(5,8),(8,6),(6,9),(9,7),(8,9),
             (0,5),(1,6),(2,7),(3,8),(4,9),
             (0,6),(3,9),(1,8)]                          # three braces stop the two sides swaying
    EA = 1e4
    members = [(i, j, EA / math.dist(nodes[i], nodes[j])) for i, j in pairs]
    fixed = [(0,"xyz"), (2,"xyz"), (5,"xyz"), (7,"xyz")]
    loads = {1: (0.0, -100.0, 0.0), 6: (0.0, -100.0, 0.0)}
    return nodes, members, fixed, loads

def test_bridge_sags_and_balances():
    nodes, members, fixed, loads = make_bridge()
    u, forces = solve_truss(nodes, members, fixed, loads)
    assert u[1][1] < 0 and u[6][1] < 0                   # the loaded nodes go DOWN
    assert equilibrium_error(nodes, members, forces, loads, [1, 3, 4, 6, 8, 9]) < 1e-6

def test_doubling_the_load_doubles_the_forces():
    nodes, members, fixed, loads = make_bridge()
    u1, f1 = solve_truss(nodes, members, fixed, loads)
    heavy = {k: (0.0, 2 * v[1], 0.0) for k, v in loads.items()}
    u2, f2 = solve_truss(nodes, members, fixed, heavy)
    assert np.allclose(np.array(f2), 2 * np.array(f1), rtol=1e-6)

from src.truss import solve_truss_sparse, long_bridge, stiffness_sparse
from src.solver import gaussian_pivoted

def test_sparse_matches_dense():
    nodes, members, fixed, loads = long_bridge(20)
    u1, f1 = solve_truss(nodes, members, fixed, loads)
    u2, f2 = solve_truss_sparse(nodes, members, fixed, loads)
    assert np.allclose(u2, u1, rtol=1e-8, atol=1e-10 * np.abs(u1).max())

def test_sparse_storage_is_tiny():
    nodes, members, fixed, loads = long_bridge(500)              # about 2000 nodes
    K = stiffness_sparse(nodes, members)
    assert len(nodes) == 2002
    assert K.nnz / K.shape[0] ** 2 < 0.005                       # under half a percent of the entries are not zero

def test_stage2_solver_on_the_hand_truss():
    nodes = [(0, 0, 0), (4, 0, 0), (2, 3, 0)]
    K = stiffness_sparse(nodes, [(0, 2, 1000.0), (1, 2, 1000.0)]).toarray()
    free = [6, 7]                                                # node 2, x and y
    u = gaussian_pivoted(K[np.ix_(free, free)].tolist(), [0.0, -100.0])
    assert u[1] == approx(-0.07222, abs=1e-4)
