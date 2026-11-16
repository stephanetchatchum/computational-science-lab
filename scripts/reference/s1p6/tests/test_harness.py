try:
    from src.floats import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.floats': raise
try:
    from src.harness import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.harness': raise
import math
from pytest import approx
from src.harness import order_of_accuracy, trapezoid, simpson, richardson

H = [0.1, 0.05, 0.025, 0.0125]
I = math.e - 1

def test_difference_orders():
    fwd = lambda h: abs((math.sin(1 + h) - math.sin(1)) / h - math.cos(1))
    ctr = lambda h: abs((math.sin(1 + h) - math.sin(1 - h)) / (2 * h) - math.cos(1))
    assert order_of_accuracy(fwd, H) == approx(1, abs=0.1)
    assert order_of_accuracy(ctr, H) == approx(2, abs=0.1)

def test_quadrature_orders():
    hs = [0.5, 0.25, 0.125, 0.0625]
    tr = lambda h: abs(trapezoid(math.exp, 0, 1, round(1 / h)) - I)
    si = lambda h: abs(simpson(math.exp, 0, 1, round(1 / h)) - I)
    assert order_of_accuracy(tr, hs) == approx(2, abs=0.1)
    assert order_of_accuracy(si, hs) == approx(4, abs=0.1)

def test_richardson():
    t8, t16 = trapezoid(math.exp, 0, 1, 8), trapezoid(math.exp, 0, 1, 16)
    assert abs(t16 - I) == approx(5.593e-4, abs=1e-6)
    assert abs(richardson(t8, t16, 2) - I) < 1e-6
    assert richardson(t8, t16, 2) == approx(simpson(math.exp, 0, 1, 16), abs=1e-14)
