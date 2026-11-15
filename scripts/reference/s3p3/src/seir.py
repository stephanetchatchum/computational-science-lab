import numpy as np
from src.solvers import rk4_solve

def seir_rhs(t, y, beta, sigma, gamma, N):
    S, E, I, R = y; inf = beta * S * I / N
    return np.array([-inf, inf - sigma * E, sigma * E - gamma * I, gamma * I])

def simulate_seir(beta, sigma, gamma, N, I0, days, dt):
    return rk4_solve(lambda t, y: seir_rhs(t, y, beta, sigma, gamma, N), np.array([N - I0, 0.0, I0, 0.0]), 0.0, days, dt)

def peak(ts, ys):
    k = int(np.argmax([y[2] for y in ys])); return ys[k][2], ts[k]

def r0(beta, gamma):
    return beta / gamma
