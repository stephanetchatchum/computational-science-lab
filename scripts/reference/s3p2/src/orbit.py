import math
import numpy as np

def accel(x, y, z):
    r = math.sqrt(x * x + y * y + z * z); return (-x / r**3, -y / r**3, -z / r**3)

def deriv(s):
    t, x, y, z, vx, vy, vz = s; ax, ay, az = accel(x, y, z); return (vx, vy, vz, ax, ay, az)

def rk4_step(s, dt):
    t = s[0]; q = s[1:]
    k1 = deriv(s); k2 = deriv((t + dt / 2,) + tuple(a + dt / 2 * b for a, b in zip(q, k1)))
    k3 = deriv((t + dt / 2,) + tuple(a + dt / 2 * b for a, b in zip(q, k2))); k4 = deriv((t + dt,) + tuple(a + dt * b for a, b in zip(q, k3)))
    return (t + dt,) + tuple(a + dt / 6 * (p + 2 * r + 2 * u + w) for a, p, r, u, w in zip(q, k1, k2, k3, k4))

def simulate(v0, dt, t_end):
    s = (0.0, 1.0, 0.0, 0.0, 0.0, 0.0, v0); out = [s]
    for _ in range(round(t_end / dt)):
        s = rk4_step(s, dt); out.append(s)
    return out

def energy(s):
    t, x, y, z, vx, vy, vz = s; return 0.5 * (vx**2 + vy**2 + vz**2) - 1 / math.sqrt(x * x + y * y + z * z)

def ang_momentum(s):
    t, x, y, z, vx, vy, vz = s; return (y * vz - z * vy, z * vx - x * vz, x * vy - y * vx)

def semi_major_axis(v0):
    return -1 / (2 * (0.5 * v0**2 - 1))

def orbit_period(v0, dt=0.001):
    s = (0.0, 1.0, 0.0, 0.0, 0.0, 0.0, v0); k = 0
    while True:
        prev = s; s = rk4_step(s, dt); k += 1
        if k > 10 and prev[3] < 0 <= s[3]:
            return prev[0] + dt * (-prev[3]) / (s[3] - prev[3])

def swept_area(states, i0, i1):
    a = 0.0
    for i in range(i0, i1):
        r1 = np.array(states[i][1:4]); r2 = np.array(states[i + 1][1:4]); a += 0.5 * np.linalg.norm(np.cross(r1, r2))
    return a

def leapfrog_step(s, dt):
    t, x, y, z, vx, vy, vz = s
    ax, ay, az = accel(x, y, z); vx += dt / 2 * ax; vy += dt / 2 * ay; vz += dt / 2 * az
    x += dt * vx; y += dt * vy; z += dt * vz
    ax, ay, az = accel(x, y, z); vx += dt / 2 * ax; vy += dt / 2 * ay; vz += dt / 2 * az
    return (t + dt, x, y, z, vx, vy, vz)

def max_energy_error(stepper, v0, dt, orbits):
    s = (0.0, 1.0, 0.0, 0.0, 0.0, 0.0, v0); E0 = energy(s); worst = 0.0
    for _ in range(round(orbits * orbit_period(v0) / dt)):
        s = stepper(s, dt); worst = max(worst, abs(energy(s) - E0))
    return worst
