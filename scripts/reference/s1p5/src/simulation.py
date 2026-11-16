import numpy as np
from src.particle import Particle

class Simulation:
    def __init__(self, n):
        rng = np.random.default_rng()
        self.particles = [Particle(rng.uniform(-6, 6, 3), rng.uniform(-4, 4, 3), 1.0) for _ in range(n)]
    def step(self, dt, forces):
        for p in self.particles: p.step(dt, forces)
