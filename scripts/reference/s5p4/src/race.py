import numpy as np
from src.world import World, HALF, LANES
from src.bike import step_bikes, V_MAX
from src.sensors import cast_rays, RAY_MAX, CAR_R
from src.brain import think

def wrap(a):
    return (a + np.pi) % (2 * np.pi) - np.pi

class Race:
    """Every brain in pop rides the same traffic at the same time (the riders cannot hit each other)."""
    def __init__(self, pop, shape="A", seed=0, cars=12, dt=0.1, speed_cap=1.0, crash_cost=300):
        self.pop, self.dt, self.speed_cap, self.crash_cost = pop, dt, speed_cap, crash_cost
        self.w = w = World(shape, cars_per_lane=cars, seed=seed)
        nb = len(pop)
        mid = np.sort(w.cars[1][0]); gaps = np.diff(np.r_[mid, mid[0] + w.length])
        k = np.random.default_rng(seed).integers(0, len(mid)); s0 = (mid[k] + gaps[k] / 2) % w.length
        start = w.to_xy(np.array([s0]), 0.0)[0]; i0 = int(w.locate(start[:1], start[1:])[1][0])
        self.x = np.full(nb, start[0]); self.y = np.full(nb, start[1]); self.th = np.full(nb, w.ang[i0]); self.v = np.full(nb, 5.0)
        self.alive = np.ones(nb, bool); self.crashed = np.zeros(nb, bool); self.skid = np.zeros(nb, bool)
        self.progress = np.zeros(nb); self.last_i = np.full(nb, i0); self.t = 0.0
        self.prev_front = np.full(nb, RAY_MAX); self.rays = np.full((nb, 7), RAY_MAX)
        # fares: a passenger waits every 120 m along the road, in a random lane
        self.fare_k = np.arange(1, 12); fs = (s0 + self.fare_k * 120.0) % w.length
        lanes = np.random.default_rng(seed).integers(0, LANES, len(fs))
        self.fare_xy = w.to_xy(fs, np.array([w.lane_offset(l) for l in lanes])[:, None])
        self.got = np.zeros((nb, len(fs)), bool); self.fares = np.zeros(nb)

    def step(self):
        w, dt, nb = self.w, self.dt, len(self.pop)
        cars = w.car_xy(); self.cars = cars
        self.rays = rays = cast_rays(w, self.x, self.y, self.th, cars)
        d, i = w.locate(self.x, self.y)
        closing = (self.prev_front - rays[:, 3]) / dt if self.t > 0 else np.zeros(nb)   # how fast the gap ahead shrinks
        self.prev_front = rays[:, 3]
        inp = np.c_[rays / RAY_MAX, self.v / V_MAX, np.sin(wrap(self.th - w.ang[i])), np.clip(closing / V_MAX, -1, 1)]
        out = think(self.pop, inp)
        steer = 0.35 * out[:, 0]
        target = V_MAX * (out[:, 1] + 1) / 2                       # the speed the rider wants
        acc = np.clip(2.0 * (target - self.v), -6.0, 3.0)         # brakes are stronger than the engine
        acc = np.where(self.v > V_MAX * self.speed_cap, np.minimum(acc, 0), acc)
        nx, ny, nth, nv, self.skid = step_bikes(self.x, self.y, self.th, self.v, steer, acc, dt)
        a = self.alive
        self.x = np.where(a, nx, self.x); self.y = np.where(a, ny, self.y); self.th = np.where(a, nth, self.th); self.v = np.where(a, nv, self.v)
        d, i = w.locate(self.x, self.y)
        ds = (w.s[i] - w.s[self.last_i] + w.length / 2) % w.length - w.length / 2
        self.progress += np.where(a, ds, 0); self.last_i = np.where(a, i, self.last_i)
        dc = np.hypot(self.x[:, None] - cars[None, :, 0], self.y[:, None] - cars[None, :, 1]).min(axis=1)
        crash = a & ((d > HALF) | (dc < CAR_R))
        self.crashed |= crash; self.alive &= ~crash
        near = np.hypot(self.x[:, None] - self.fare_xy[None, :, 0], self.y[:, None] - self.fare_xy[None, :, 1]) < 3.0
        new = near & ~self.got & self.alive[:, None] & (self.progress[:, None] > self.fare_k[None, :] * 120.0 - 30)
        self.got |= new; self.fares += new.sum(axis=1)
        w.step(dt); self.t += dt

    def fitness(self):
        return self.progress + 25 * self.fares - self.crash_cost * self.crashed

def race(pop, shape="A", seed=0, cars=12, seconds=45, dt=0.1, speed_cap=1.0, crash_cost=300):
    """Returns (fitness, crashed, metres gained, fares) for every brain."""
    r = Race(pop, shape, seed, cars, dt, speed_cap, crash_cost)
    for _ in range(int(seconds / dt)):
        r.step()
        if not r.alive.any(): break
    return r.fitness(), r.crashed, r.progress, r.fares
