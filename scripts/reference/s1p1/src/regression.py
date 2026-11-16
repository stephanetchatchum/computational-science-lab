import math
import numpy

def fit_line(xs, ys):
    n = len(xs); xm = sum(xs) / n; ym = sum(ys) / n
    slope = sum((x - xm) * (y - ym) for x, y in zip(xs, ys)) / sum((x - xm) ** 2 for x in xs)
    return slope, ym - slope * xm

def slope_std_error(xs, ys, slope, intercept):
    n = len(xs); xm = sum(xs) / n
    res = sum((y - (intercept + slope * x)) ** 2 for x, y in zip(xs, ys))
    return math.sqrt((res / (n - 2)) / sum((x - xm) ** 2 for x in xs))

def fit_line_np(xs, ys):
    x = numpy.array(xs, float); y = numpy.array(ys, float); xm, ym = x.mean(), y.mean()
    slope = ((x - xm) * (y - ym)).sum() / ((x - xm) ** 2).sum(); return slope, ym - slope * xm

def annual_means(years, values):
    groups = {}
    for yr, v in zip(years, values): groups.setdefault(int(yr), []).append(v)
    ks = sorted(k for k, v in groups.items() if len(v) == 12)
    return ks, [sum(groups[k]) / 12 for k in ks]

def block_bootstrap_se(xs, ys, block=5, n_boot=1000, seed=0):
    x = numpy.asarray(xs, float); y = numpy.asarray(ys, float); rng = numpy.random.default_rng(seed); n = len(x); k = math.ceil(n / block); slopes = []
    for _ in range(n_boot):
        starts = rng.integers(0, n - block + 1, k); idx = numpy.concatenate([numpy.arange(s, s + block) for s in starts])[:n]
        slopes.append(fit_line_np(x[idx], y[idx])[0])
    return float(numpy.std(slopes, ddof=1))
