import math

def machine_epsilon():
    e = 1.0
    while 1.0 + e / 2 != 1.0: e /= 2
    return e

def roots_naive(a, b, c):
    d = math.sqrt(b * b - 4 * a * c); return ((-b + d) / (2 * a), (-b - d) / (2 * a))

def roots_stable(a, b, c):
    d = math.sqrt(b * b - 4 * a * c); q = -0.5 * (b + math.copysign(d, b)); return (c / q, q / a)

def var_two_pass(xs):
    m = sum(xs) / len(xs); return sum((x - m) ** 2 for x in xs) / len(xs)

def var_one_pass(xs):
    n = len(xs); return sum(x * x for x in xs) / n - (sum(xs) / n) ** 2
