import math
import numpy
import numpy as np
from src.solver import gaussian_pivoted

def polyfit(xs, ys, degree):
    V = np.array([[x ** p for p in range(degree + 1)] for x in xs], float); y = np.array(ys, float)
    return gaussian_pivoted((V.T @ V).tolist(), (V.T @ y).tolist())

def polyval(coeffs, x):
    return sum(c * x ** i for i, c in enumerate(coeffs))

def rmse(actual, predicted):
    return math.sqrt(sum((a - p) ** 2 for a, p in zip(actual, predicted)) / len(actual))

def householder_qr(V):
    R = np.array(V, float).copy(); m, n = R.shape; Q = numpy.eye(m)
    for j in range(n):
        x = R[j:, j]; v = x.copy(); v[0] += math.copysign(numpy.linalg.norm(x), x[0]); v /= numpy.linalg.norm(v)
        R[j:, :] -= 2 * numpy.outer(v, v @ R[j:, :]); Q[:, j:] -= 2 * numpy.outer(Q[:, j:] @ v, v)
    return Q[:, :n], R[:n, :]

def lstsq_qr(V, y):
    Q, R = householder_qr(V); b = Q.T @ y; n = R.shape[1]; c = np.zeros(n)
    for i in range(n - 1, -1, -1): c[i] = (b[i] - R[i, i + 1:] @ c[i + 1:]) / R[i, i]
    return c
