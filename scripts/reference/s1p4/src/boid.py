import numpy as np

class Boid:
    def __init__(self, r, v):
        self.r = np.array(r, dtype=float); self.v = np.array(v, dtype=float)
