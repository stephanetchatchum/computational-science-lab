import numpy as np

CAR = 4.5   # car length, m

def idm_accel(v, gap, dv, v0=10.0, T=1.0, a=1.0, b=1.5, s0=2.0):
    """Intelligent Driver Model: v speed, gap bumper-to-bumper, dv = v - v_leader."""
    s_star = s0 + np.maximum(0.0, v * T + v * dv / (2 * np.sqrt(a * b)))
    return a * (1 - (v / v0) ** 4 - (s_star / np.maximum(gap, 0.1)) ** 2)

def ring_step(s, v, length, dt, **p):
    """Cars on a ring road (one lane). s sorted ascending. Each car follows the next one."""
    lead_s = np.roll(s, -1); lead_v = np.roll(v, -1)
    gap = (lead_s - s) % length - CAR
    acc = idm_accel(v, gap, v - lead_v, **p)
    v = np.maximum(0.0, v + acc * dt)
    s = (s + v * dt) % length
    return s, v

def equilibrium_gap(v, v0=10.0, T=1.0, s0=2.0):
    return (s0 + v * T) / np.sqrt(1 - (v / v0) ** 4)
