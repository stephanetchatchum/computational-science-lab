import numpy as np
from scipy.spatial import cKDTree
from src.traffic import ring_step, CAR

LANE = 3.5
LANES = 3
HALF = LANE * LANES / 2     # half the road width, m

def make_track(shape="A", n=2000):
    """A closed road. Returns centreline points (n, 2), tangent angles (n,) and arc length s (n,)."""
    phi = np.linspace(0, 2 * np.pi, n, endpoint=False)
    if shape == "A":
        r = 110 * (1 + 0.15 * np.sin(3 * phi) + 0.05 * np.cos(5 * phi))
    else:
        r = 100 * (1 + 0.16 * np.sin(4 * phi + 1.0))
    pts = np.c_[r * np.cos(phi), r * np.sin(phi)]
    d = np.diff(pts, axis=0, append=pts[:1])
    seg = np.hypot(d[:, 0], d[:, 1])
    s = np.concatenate([[0], np.cumsum(seg)[:-1]])
    ang = np.arctan2(d[:, 1], d[:, 0])
    return pts, ang, s, seg.sum()

class World:
    def __init__(self, shape="A", cars_per_lane=12, seed=0, v0=10.0):
        self.pts, self.ang, self.s, self.length = make_track(shape)
        self.tree = cKDTree(self.pts)
        # a map of the road: for every 0.5 m square, is it on the road?
        lo = self.pts.min(axis=0) - 50; hi = self.pts.max(axis=0) + 50
        self.origin, self.res = lo, 0.5
        gx = np.arange(lo[0], hi[0], self.res); gy = np.arange(lo[1], hi[1], self.res)
        X, Y = np.meshgrid(gx, gy, indexing="ij")
        d, _ = self.tree.query(np.c_[X.ravel(), Y.ravel()])
        self.road = (d <= HALF).reshape(X.shape)
        rng = np.random.default_rng(seed)
        self.v0 = v0
        self.cars = []   # per lane: arrays (s, v)
        for lane in range(LANES):
            base = np.sort(rng.uniform(0, self.length, cars_per_lane))
            # keep a safe start: spread evenly with jitter
            base = (np.arange(cars_per_lane) * self.length / cars_per_lane + rng.uniform(0, 8, cars_per_lane) + 40) % self.length
            self.cars.append([np.sort(base), rng.uniform(5, 9, cars_per_lane) * v0 / 10])
        # lane speed limits differ a little so overtaking pays
        self.lane_v0 = v0 * np.array([0.8, 1.0, 1.2])[:LANES]

    def lane_offset(self, lane):
        return (lane - (LANES - 1) / 2) * LANE

    def to_xy(self, s, offset):
        i = np.searchsorted(self.s, s % self.length, side="right") - 1
        a = self.ang[i]; p = self.pts[i]
        frac = (s % self.length - self.s[i])[:, None]
        base = p + frac * np.c_[np.cos(a), np.sin(a)]
        return base + offset * np.c_[-np.sin(a), np.cos(a)]   # left of the direction of travel

    def step(self, dt):
        for lane in range(LANES):
            s, v = self.cars[lane]
            o = np.argsort(s)
            self.cars[lane] = list(ring_step(s[o], v[o], self.length, dt, v0=self.lane_v0[lane]))

    def car_xy(self):
        return np.vstack([self.to_xy(s, self.lane_offset(k)) for k, (s, v) in enumerate(self.cars)])

    def on_road(self, x, y):
        i = ((x - self.origin[0]) / self.res).astype(int); j = ((y - self.origin[1]) / self.res).astype(int)
        ok = (i >= 0) & (j >= 0) & (i < self.road.shape[0]) & (j < self.road.shape[1])
        out = np.zeros(x.shape, bool)
        out[ok] = self.road[i[ok], j[ok]]
        return out

    def locate(self, x, y):
        """Distance from the centreline and the index of the nearest centreline point."""
        d, i = self.tree.query(np.c_[x, y])
        return d, i
