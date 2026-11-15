import math

def simulate(irr, load, panel_kw, battery_kwh, eff=0.8, soc0=None):
    soc = battery_kwh / 2 if soc0 is None else soc0; out = []; unmet = 0
    for g, l in zip(irr, load):
        s = soc + panel_kw * g * eff - l
        if s > battery_kwh: soc = battery_kwh
        elif s < 0: soc = 0; unmet += 1
        else: soc = s
        out.append(soc)
    return out, unmet

def cost(panel_kw, battery_kwh):
    return 700 * panel_kw + 300 * battery_kwh

def score(irr, load, panel, battery):
    _, unmet = simulate(irr, load, panel, battery); return cost(panel, battery) + 1_000_000 * max(0, unmet / len(irr) - 0.05)

def brute_force(irr, load):
    best = None
    for i in range(23):
        for b in range(41):
            p = 1.0 + 0.5 * i; _, un = simulate(irr, load, p, b); frac = un / len(irr)
            if frac <= 0.05 and (best is None or cost(p, b) < best[2]):
                best = (p, b, cost(p, b), frac)
    return best

def shortfall(irr, load, panel, battery, eff=0.8):
    soc = battery / 2; short = 0.0
    for g, l in zip(irr, load):
        s = soc + panel * g * eff - l
        if s > battery: s = battery
        elif s < 0: short -= s; s = 0.0
        soc = s
    return short

def smooth_score(irr, load, p, b, lam):
    return cost(p, b) + lam * max(0.0, shortfall(irr, load, p, b) / sum(load) - 0.05) ** 2

def gradient(irr, load, p, b, lam, h=1e-3):
    return ((smooth_score(irr, load, p + h, b, lam) - smooth_score(irr, load, p - h, b, lam)) / (2 * h),
            (smooth_score(irr, load, p, b + h, lam) - smooth_score(irr, load, p, b - h, lam)) / (2 * h))

def descend(irr, load, p, b, lam):
    step = 0.5; f = smooth_score(irr, load, p, b, lam); path = [(p, b)]
    while step >= 1e-4:
        gp, gb = gradient(irr, load, p, b, lam); n = math.hypot(gp, gb)
        if n == 0: break
        pn, bn = max(0.1, p - step * gp / n), max(0.0, b - step * gb / n); fn = smooth_score(irr, load, pn, bn, lam)
        if fn < f: p, b, f = pn, bn, fn; path.append((p, b)); step *= 1.5
        else: step /= 2
    return path

def optimise(irr, load, p, b):
    path = [(p, b)]
    for lam in (1e4, 1e5, 1e6, 1e7):
        path += descend(irr, load, *path[-1], lam)[1:]
    return path
