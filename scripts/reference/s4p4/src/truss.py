import math
import numpy as np

def assemble(nodes, members):
    n = len(nodes); K = np.zeros((3 * n, 3 * n)); cs = []
    for a, b, k in members:
        pa, pb = np.array(nodes[a], float), np.array(nodes[b], float); L = np.linalg.norm(pb - pa); c = (pb - pa) / L; cs.append(c)
        kb = k * np.outer(c, c); ra = [3*a, 3*a+1, 3*a+2]; rb = [3*b, 3*b+1, 3*b+2]
        K[np.ix_(ra, ra)] += kb; K[np.ix_(rb, rb)] += kb; K[np.ix_(ra, rb)] -= kb; K[np.ix_(rb, ra)] -= kb
    return K, cs

def locked(fixed):
    out = set()
    for node, dirs in fixed:
        for d in dirs: out.add(3 * node + "xyz".index(d))
    return out

def solve_truss(nodes, members, fixed, loads):
    n = len(nodes); K, cs = assemble(nodes, members); F = np.zeros(3 * n)
    for i, f in loads.items(): F[3*i:3*i+3] = f
    lk = locked(fixed); free = [i for i in range(3 * n) if i not in lk]; u = np.zeros(3 * n)
    u[free] = np.linalg.solve(K[np.ix_(free, free)], F[free]); U = u.reshape(n, 3)
    forces = [k * float((U[b] - U[a]) @ c) for (a, b, k), c in zip(members, cs)]
    return U, forces

def equilibrium_error(nodes, members, forces, loads, free_nodes):
    worst = 0.0
    for i in free_nodes:
        tot = np.array(loads.get(i, (0.0, 0.0, 0.0)), float)
        for (a, b, k), N in zip(members, forces):
            if i in (a, b):
                o = b if i == a else a; d = np.array(nodes[o], float) - np.array(nodes[i], float); tot += N * d / np.linalg.norm(d)
        worst = max(worst, np.linalg.norm(tot))
    return worst

import scipy.sparse as sp
import scipy.sparse.linalg as spl

def stiffness_sparse(nodes, members):
    n = len(nodes); rows, cols, vals = [], [], []
    for a, b, k in members:
        pa, pb = np.array(nodes[a], float), np.array(nodes[b], float); c = (pb - pa) / np.linalg.norm(pb - pa); kb = k * np.outer(c, c)
        for I, J, sgn in ((a, a, 1), (b, b, 1), (a, b, -1), (b, a, -1)):
            for p in range(3):
                for q in range(3): rows.append(3 * I + p); cols.append(3 * J + q); vals.append(sgn * kb[p, q])
    return sp.csr_matrix((vals, (rows, cols)), shape=(3 * n, 3 * n))

def solve_truss_sparse(nodes, members, fixed, loads):
    n = len(nodes); K = stiffness_sparse(nodes, members); F = np.zeros(3 * n)
    for i, f in loads.items(): F[3*i:3*i+3] = f
    lk = locked(fixed); free = np.array([i for i in range(3 * n) if i not in lk]); u = np.zeros(3 * n)
    u[free] = spl.spsolve(K[free][:, free].tocsc(), F[free]); U = u.reshape(n, 3); forces = []
    for a, b, k in members:
        pa, pb = np.array(nodes[a], float), np.array(nodes[b], float); c = (pb - pa) / np.linalg.norm(pb - pa); forces.append(k * float((U[b] - U[a]) @ c))
    return U, forces

def long_bridge(panels, EA=1e4):
    nodes = []; idx = {}
    for side, z in enumerate((0.0, 2.0)):
        for k in range(panels + 1): idx['b', k, side] = len(nodes); nodes.append((2.0 * k, 0.0, z))
        for k in range(panels): idx['t', k, side] = len(nodes); nodes.append((2.0 * k + 1, 1.5, z))
    pairs = []
    for s in (0, 1):
        for k in range(panels):
            pairs += [(idx['b', k, s], idx['b', k + 1, s]), (idx['b', k, s], idx['t', k, s]), (idx['t', k, s], idx['b', k + 1, s])]
            if k < panels - 1: pairs.append((idx['t', k, s], idx['t', k + 1, s]))
    for k in range(panels + 1): pairs.append((idx['b', k, 0], idx['b', k, 1]))
    for k in range(panels):
        pairs += [(idx['t', k, 0], idx['t', k, 1]), (idx['b', k, 0], idx['b', k + 1, 1]), (idx['b', k + 1, 0], idx['t', k, 1])]
        if k < panels - 1: pairs.append((idx['t', k, 0], idx['t', k + 1, 1]))
    members = [(i, j, EA / math.dist(nodes[i], nodes[j])) for i, j in pairs]
    fixed = [(idx['b', 0, 0], 'xyz'), (idx['b', 0, 1], 'xyz'), (idx['b', panels, 0], 'xyz'), (idx['b', panels, 1], 'xyz')]
    loads = {idx['b', k, s]: (0.0, -100.0, 0.0) for k in range(1, panels) for s in (0, 1)}
    return nodes, members, fixed, loads
