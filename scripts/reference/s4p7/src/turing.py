import math
import numpy as np

def uniform_states(f, k):
    disc = f * f - 4 * f * (f + k)**2
    if disc < 0: return []
    out = []
    for sgn in (1, -1):
        V = (f + sgn * math.sqrt(disc)) / (2 * (f + k)); out.append(((f + k) / V, V))
    return out

def growth_rate(U, V, f, k, Du, Dv):
    J = np.array([[-V * V - f, -2 * U * V], [V * V, 2 * U * V - (f + k)]])
    return max(float(np.max(np.linalg.eigvals(J - s * np.diag([Du, Dv])).real)) for s in np.linspace(0, 1.6, 321))
