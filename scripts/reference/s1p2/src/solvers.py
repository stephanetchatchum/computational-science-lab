import math

def bisection(f, a, b, tol=1e-8):
    if f(a) * f(b) > 0: raise ValueError("no sign change")
    count = 0
    while (b - a) / 2 >= tol:
        m = (a + b) / 2
        if f(a) * f(m) <= 0: b = m
        else: a = m
        count += 1
    return (a + b) / 2, count

def newton(f, df, x0, tol=1e-8, max_iter=50):
    x = x0; count = 0
    while abs(f(x)) > tol:
        if count >= max_iter: raise RuntimeError("did not converge")
        x = x - f(x) / df(x); count += 1
    return x, count

def forward_diff(f, x, h): return (f(x + h) - f(x)) / h
def central_diff(f, x, h): return (f(x + h) - f(x - h)) / (2 * h)

def best_h():
    errs = [(abs(forward_diff(math.sin, 1.0, 10.0 ** -k) - math.cos(1.0)), 10.0 ** -k) for k in range(1, 13)]
    return min(errs)[1]

def bisection_steps(f, a, b):
    while (b - a) / 2 >= 1e-8:
        m = (a + b) / 2; yield (a, b, m)
        if f(a) * f(m) <= 0: b = m
        else: a = m

def newton_steps(f, df, x0):
    x = x0; yield x
    for _ in range(50): x = x - f(x) / df(x); yield x
