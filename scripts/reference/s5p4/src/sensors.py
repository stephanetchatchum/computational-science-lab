import numpy as np

RAY_ANGLES = np.radians([-90, -45, -20, 0, 20, 45, 90])
RAY_MAX = 40.0
CAR_R = 2.0     # a car counts as a circle of this radius

def cast_rays(world, x, y, th, cars, step=1.0):
    """Distance along each ray to the first thing it hits (road edge or car). Shape (bikes, rays)."""
    nb = len(x); nr = len(RAY_ANGLES)
    out = np.full((nb, nr), RAY_MAX)
    alive = np.ones((nb, nr), bool)
    a = th[:, None] + RAY_ANGLES[None, :]
    c, s = np.cos(a), np.sin(a)
    for k in np.arange(step, RAY_MAX + 1e-9, step):
        px = x[:, None] + k * c; py = y[:, None] + k * s
        hit = ~world.on_road(px, py)
        if len(cars):
            dx = px.ravel()[:, None] - cars[None, :, 0]; dy = py.ravel()[:, None] - cars[None, :, 1]
            hit |= ((dx * dx + dy * dy).min(axis=1) < CAR_R ** 2).reshape(nb, nr)
        new = hit & alive
        out[new] = k; alive &= ~new
        if not alive.any(): break
    return out
