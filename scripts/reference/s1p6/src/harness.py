import numpy

def order_of_accuracy(error_fn, hs):
    errors = [error_fn(h) for h in hs]; return numpy.polyfit(numpy.log(hs), numpy.log(errors), 1)[0]

def trapezoid(f, a, b, n):
    h = (b - a) / n; return h * (0.5 * f(a) + 0.5 * f(b) + sum(f(a + i * h) for i in range(1, n)))

def simpson(f, a, b, n):
    h = (b - a) / n; s = f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i * h) for i in range(1, n)); return s * h / 3

def richardson(A_h, A_h2, p):
    return (2 ** p * A_h2 - A_h) / (2 ** p - 1)
