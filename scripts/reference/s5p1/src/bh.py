import numpy as np

class Node:
    def __init__(self, cx, cy, size):
        self.cx, self.cy, self.size = cx, cy, size
        self.mass = 0.0; self.mx = 0.0; self.my = 0.0; self.kids = None; self.body = None

def _child(node, x, y):
    return node.kids[(2 if x >= node.cx else 0) + (1 if y >= node.cy else 0)]

def insert(node, i, r, m):
    if node.kids is None and node.body is None and node.mass == 0:
        node.body = i
    else:
        if node.kids is None:
            q = node.size / 4
            node.kids = [Node(node.cx + sx * q, node.cy + sy * q, node.size / 2) for sx in (-1, 1) for sy in (-1, 1)]
            old = node.body; node.body = None
            insert(_child(node, r[old, 0], r[old, 1]), old, r, m)
        insert(_child(node, r[i, 0], r[i, 1]), i, r, m)
    node.mass += m[i]; node.mx += m[i] * r[i, 0]; node.my += m[i] * r[i, 1]

def build_tree(r, m):
    lo, hi = r.min(axis=0), r.max(axis=0); c = (lo + hi) / 2
    root = Node(c[0], c[1], float(max(hi - lo)) * 1.0001 + 1e-12)
    for i in range(len(m)): insert(root, i, r, m)
    return root

def _acc(node, i, r, theta, eps, out):
    if node.mass == 0 or node.body == i: return
    dx = node.mx / node.mass - r[i, 0]; dy = node.my / node.mass - r[i, 1]; d2 = dx * dx + dy * dy
    if node.kids is None or node.size * node.size < theta * theta * d2:
        f = node.mass / (d2 + eps * eps) ** 1.5; out[0] += f * dx; out[1] += f * dy
    else:
        for k in node.kids: _acc(k, i, r, theta, eps, out)

def acc_bh(r, m, eps, theta=0.5):
    root = build_tree(r, m); a = np.zeros((len(m), 2))
    for i in range(len(m)):
        out = [0.0, 0.0]; _acc(root, i, r, theta, eps, out); a[i] = out
    return a

def acc_direct_2d(r, m, eps):
    d = r[None, :, :] - r[:, None, :]; r2 = (d**2).sum(axis=2) + eps**2
    w = m[None, :] / r2**1.5; np.fill_diagonal(w, 0.0); return (w[:, :, None] * d).sum(axis=1)
