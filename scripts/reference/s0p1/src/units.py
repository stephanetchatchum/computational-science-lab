class UnitError(Exception):
    pass

UNITS = {
    "m": ("length", 1.0), "km": ("length", 1000.0), "cm": ("length", 0.01),
    "mm": ("length", 0.001), "ft": ("length", 0.3048), "mi": ("length", 1609.344),
    "s": ("time", 1.0), "min": ("time", 60.0), "hr": ("time", 3600.0),
    "m/s": ("speed", 1.0), "km/h": ("speed", 1 / 3.6), "mi/h": ("speed", 0.44704),
    "J": ("energy", 1.0), "kJ": ("energy", 1000.0), "cal": ("energy", 4.184),
    "kWh": ("energy", 3600000.0),
    "kg": ("mass", 1.0), "g": ("mass", 0.001),
    "C": ("temperature", 1.0), "F": ("temperature", 1.0), "K": ("temperature", 1.0),
}

def family_of(unit):
    if unit not in UNITS: raise UnitError("unknown unit: " + unit)
    return UNITS[unit][0]

def units_in_family(family):
    return [u for u, (f, _) in UNITS.items() if f == family]

def convert(value, unc, from_unit, to_unit):
    f1, f2 = family_of(from_unit), family_of(to_unit)
    if f1 != f2: raise UnitError("cannot convert " + f1 + " to " + f2)
    if f1 != "temperature":
        a, b = UNITS[from_unit][1], UNITS[to_unit][1]; return value * a / b, unc * a / b
    k = value + 273.15 if from_unit == "C" else (value - 32) * 5 / 9 + 273.15 if from_unit == "F" else value
    new = k - 273.15 if to_unit == "C" else (k - 273.15) * 9 / 5 + 32 if to_unit == "F" else k
    scale = {"C": 1.0, "K": 1.0, "F": 5 / 9}
    return new, unc * scale[from_unit] / scale[to_unit]
