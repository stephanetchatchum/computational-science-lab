import numpy as np
from src.network import gravity_matrix

def demo_country(n=12, seed=3, steep=1.1):
    """A made-up country for checks: one big city, a few towns, many small ones (km coordinates)."""
    rng = np.random.default_rng(seed)
    pops = np.round(2_000_000 / np.arange(1, n + 1) ** steep, -2)
    xy = rng.uniform(0, 400, (n, 2))
    return pops, xy, gravity_matrix(pops, [tuple(p) for p in xy])

def real_country(towns):
    """towns from get_towns: (name, lat, lon, population). Returns names, pops, km coordinates, travel matrix."""
    lat = np.array([t[1] for t in towns]); lon = np.array([t[2] for t in towns])
    pops = np.array([t[3] for t in towns], float)
    xy = np.c_[(lon - lon.mean()) * 111.32 * np.cos(np.radians(lat.mean())), (lat - lat.mean()) * 110.57]
    return [t[0] for t in towns], pops, xy, gravity_matrix(pops, [tuple(p) for p in xy])
