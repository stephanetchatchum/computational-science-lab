try:
    from src.plume import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.plume': raise
from pytest import approx
from src.plume import run, mean_and_variance

def test_pure_advection_moves_the_bell():
    x, c = run(D=0.0)                       # defaults: v=1, dx=0.05, dt=0.001, 10 seconds
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.05)
    assert var < 0.8                        # it started at 0.25; upwind adds a smear you will predict exactly later

def test_advection_plus_diffusion():
    x, c = run(D=1.0)
    m, var = mean_and_variance(x, c)
    assert m == approx(15.0, abs=0.1)
    assert var == approx(20.25, rel=0.06)   # exact is 20.25; the scheme adds a little fake smear

def test_total_dye_is_conserved():
    x, c = run(D=1.0)
    assert c.sum() * 0.05 == approx(1.0, abs=1e-6)

from src.plume import numerical_diffusion, cell_peclet

def test_upwind_smear_is_predicted_exactly():
    for dx, dt in [(0.05, 0.001), (0.025, 0.001), (0.05, 0.01)]:
        x, c = run(D=0.0, dx=dx, dt=dt)
        m, var = mean_and_variance(x, c)
        assert var == approx(0.25 + 2 * numerical_diffusion(1.0, dx, dt) * 10.0, rel=0.01)

def test_cell_peclet():
    assert cell_peclet(1.0, 0.05, 1.0) == approx(0.05)
    assert cell_peclet(0.5, 10.0, 30.0) == approx(1 / 6)
