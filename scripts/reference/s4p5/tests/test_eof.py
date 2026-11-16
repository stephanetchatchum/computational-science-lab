import numpy as np
from pytest import approx
from src.eof import eofs

def test_eof_finds_a_planted_pattern():
    rng = np.random.default_rng(2)
    pattern = np.sin(np.linspace(0, 3, 64)) + 0.3
    pc = np.sin(np.arange(33) / 3)
    field = np.outer(pc, pattern) + 0.05 * rng.normal(size=(33, 64))
    patterns, series, explained = eofs(field)
    assert explained[0] > 0.99
    assert abs(np.corrcoef(patterns[0], pattern)[0, 1]) > 0.99
    assert np.sum(explained) == approx(1.0)
