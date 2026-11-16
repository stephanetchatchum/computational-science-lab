import numpy
from src.models import exponential, logistic

def sse(model_values, real_values):
    return sum(((m - r) / 1e6) ** 2 for m, r in zip(model_values, real_values))

def fit_exponential(real):
    best = None
    for i in range(1, 81):
        r = i / 1000; s = sse(exponential(real[0], r, len(real) - 1), real)
        if best is None or s < best[1]: best = (r, s)
    return best

def fit_logistic(real):
    best = None; mx = max(real)
    for i in range(1, 81):
        for m in [1.1, 1.3, 1.6, 2, 3, 5, 8, 12]:
            r = i / 1000; k = mx * m; s = sse(logistic(real[0], r, k, len(real) - 1), real)
            if best is None or s < best[2]: best = (r, k, s)
    return best

def window_starts(n, width=40, count=5):
    return [int(round(s)) for s in numpy.linspace(0, n - width, count)]

def fit_windows(real, fitter, width=40, count=5):
    return [fitter(real[s:s + width]) for s in window_starts(len(real), width, count)]
