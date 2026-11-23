import numpy as np

L = 1.3            # wheelbase, m
MU_G = 0.7 * 9.81  # the most sideways acceleration the tyres can give, m/s^2
V_MAX = 14.0       # top speed, m/s (about 50 km/h)

def step_bikes(x, y, th, v, steer, accel, dt):
    """Kinematic bicycle model for many bikes at once.
    The tyres can only push sideways up to MU_G, so at speed the bike cannot turn as tightly as the
    handlebars ask: the turn is cut back to the friction limit and `skid` says where that happened."""
    v = np.clip(v + accel * dt, 0.0, V_MAX)
    k = np.tan(steer) / L                                  # curvature the rider asks for (1 / turn radius)
    k_max = MU_G / np.maximum(v, 0.1) ** 2                 # curvature the tyres allow at this speed
    skid = np.abs(k) > k_max
    k = np.clip(k, -k_max, k_max)
    x = x + v * np.cos(th) * dt
    y = y + v * np.sin(th) * dt
    th = th + v * k * dt
    return x, y, th, v, skid
