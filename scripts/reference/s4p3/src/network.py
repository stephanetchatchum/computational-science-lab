import numpy as np

def gravity_matrix(pops, xy):
    n = len(pops); G = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                d2 = (xy[i][0] - xy[j][0])**2 + (xy[i][1] - xy[j][1])**2; G[i, j] = pops[j] / d2
        if n > 1: G[i] /= G[i].sum()
    return G
