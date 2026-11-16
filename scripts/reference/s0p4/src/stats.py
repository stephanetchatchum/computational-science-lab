import math

def mean(xs):
    if len(xs) == 0: raise ValueError("empty list")
    return sum(xs) / len(xs)

def variance(xs):
    m = mean(xs); return sum((x - m) ** 2 for x in xs) / len(xs)

def std(xs):
    return math.sqrt(variance(xs))

def running_stats(xs):
    return [(mean(xs[:i]), std(xs[:i])) for i in range(1, len(xs) + 1)]

def sample_variance(xs):
    if len(xs) < 2: raise ValueError("need at least 2 numbers")
    m = mean(xs); return sum((x - m) ** 2 for x in xs) / (len(xs) - 1)

def settle_day(values):
    final = mean(values); span = max(values) - min(values); last = 0
    for i, (m, _) in enumerate(running_stats(values)):
        if abs(m - final) > 0.02 * span: last = i
    return last
