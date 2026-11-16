def step_euler(x, v, dt, m=1.0, k=1.0, c=0.0, force=0.0):
    a = (-k * x - c * v + force) / m; return x + dt * v, v + dt * a

def energy(x, v, m=1.0, k=1.0):
    return 0.5 * m * v**2 + 0.5 * k * x**2

def step_semi_implicit(x, v, dt, m=1.0, k=1.0, c=0.0, force=0.0):
    a = (-k * x - c * v + force) / m; nv = v + dt * a; return x + dt * nv, nv
