import itertools
import numpy as np

def neighbours(boid, flock, R):
    return [o for o in flock if o is not boid and np.linalg.norm(boid.r - o.r) < R]

def separation(boid, near, d_min):
    s = np.zeros(3)
    for o in near:
        if np.linalg.norm(boid.r - o.r) < d_min: s += boid.r - o.r
    return s

def alignment(boid, near):
    return np.zeros(3) if not near else np.mean([n.v for n in near], axis=0) - boid.v

def cohesion(boid, near):
    return np.zeros(3) if not near else np.mean([n.r for n in near], axis=0) - boid.r

def build_grid(flock, cell):
    g = {}
    for b in flock: g.setdefault(tuple((b.r // cell).astype(int)), []).append(b)
    return g

def neighbours_grid(boid, grid, cell, R):
    c = tuple((boid.r // cell).astype(int)); out = []
    for d in itertools.product((-1, 0, 1), repeat=3):
        for o in grid.get((c[0] + d[0], c[1] + d[1], c[2] + d[2]), []):
            if o is not boid and np.linalg.norm(boid.r - o.r) < R: out.append(o)
    return out
