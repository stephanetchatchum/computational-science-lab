import math
from src.units import family_of, convert, UnitError

def _exp(unc):
    return int(f"{unc:.0e}".split("e")[1])

def round_measurement(value, unc):
    if unc == 0: return (value, 0.0)
    text = f"{unc:.0e}"; d = -int(text.split("e")[1])
    return (round(value, d), float(text))

def combine(m1, m2, op):
    v1, u1, a = m1; v2, u2, b = m2
    if op in "+-":
        if family_of(a) != family_of(b): raise UnitError("cannot combine " + a + " and " + b)
        v2, u2 = convert(v2, u2, b, a)
        return (v1 + v2 if op == "+" else v1 - v2, math.sqrt(u1**2 + u2**2), a)
    v = v1 * v2 if op == "x" else v1 / v2
    return (v, abs(v) * math.sqrt((u1 / v1)**2 + (u2 / v2)**2), a + ("*" if op == "x" else "/") + b)

def format_measurement(value, unc, unit):
    if unc == 0: return f"{value} ± 0 {unit}"
    v, u = round_measurement(value, unc); d = max(0, -_exp(u))
    return f"{v:.{d}f} ± {u:.{d}f} {unit}"
