import math

def simulate(v0, theta_deg, phi_deg=0, k=0.0, dt=0.01, g=9.8):
    theta, phi = math.radians(theta_deg), math.radians(phi_deg)
    vy = v0 * math.sin(theta); vg = v0 * math.cos(theta); vx, vz = vg * math.cos(phi), vg * math.sin(phi)
    x = y = z = t = 0.0; pts = [(0, 0, 0, 0)]
    while True:
        ax, ay, az = -k * vx, -g - k * vy, -k * vz
        vx += ax * dt; vy += ay * dt; vz += az * dt
        x += vx * dt; y += vy * dt; z += vz * dt; t += dt; pts.append((t, x, y, z))
        if y < 0: break
    return pts
