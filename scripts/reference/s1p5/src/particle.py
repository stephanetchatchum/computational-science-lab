import numpy as np

class Particle:
    def __init__(self, r, v, m):
        self.r = np.array(r, dtype=float); self.v = np.array(v, dtype=float); self.m = m
    def step(self, dt, forces):
        F = np.zeros(3)
        for f in forces: F = F + f(self)
        a = F / self.m; self.v = self.v + a * dt; self.r = self.r + self.v * dt

def gravity(p):
    return np.array([0.0, -9.8 * p.m, 0.0])

def make_drag(k):
    def drag(p): return -k * p.v
    return drag
