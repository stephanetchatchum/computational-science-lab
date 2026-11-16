def exponential(p0, r, years):
    out = [p0]
    for _ in range(years): p = out[-1]; out.append(p + r * p)
    return out

def logistic(p0, r, k, years):
    out = [p0]
    for _ in range(years): p = out[-1]; out.append(p + r * p * (1 - p / k))
    return out
