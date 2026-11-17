try:
    from src.seir_fast import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.seir_fast': raise
try:
    from src.ensemble import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.ensemble': raise
import numpy as np
from pytest import approx
from src.seir_fast import run_one
from src.ensemble import sample_params, run_serial, run_parallel

def test_one_run_matches_the_ode():
    peak, day, curve = run_one((0.5, 0.2, 0.1))
    assert peak == approx(0.305, abs=0.003)
    assert len(curve) == 250

def test_sampling_is_repeatable():
    a = sample_params(500, seed=0); b = sample_params(500, seed=0)
    assert np.array_equal(a, b)
    assert a[:, 0].mean() == approx(0.5, abs=0.02)

def test_parallel_equals_serial():
    params = sample_params(40, seed=1)
    s = run_serial(params)
    p = run_parallel(params, workers=2)
    assert np.allclose([r[0] for r in s], [r[0] for r in p])

from src.posterior import sample_posterior

def test_posterior_rows_are_real_draws(tmp_path):
    path = tmp_path / "posterior.npz"
    np.savez(path, beta=np.array([0.40, 0.42, 0.38]), gamma=np.array([0.12, 0.13, 0.11]))
    P = sample_posterior(200, seed=0, path=path)
    assert P.shape == (200, 3)
    assert np.allclose(P[:, 1], 1 / 5.2)                       # sigma is fixed
    pairs = {(0.40, 0.12), (0.42, 0.13), (0.38, 0.11)}
    assert all((round(b, 2), round(g, 2)) in pairs for b, _, g in P)   # beta and gamma travel together
    assert np.array_equal(P, sample_posterior(200, seed=0, path=path))

import shutil, subprocess, sys
import pytest
from src.mpi_run import split_indices

def test_split_covers_every_run_once():
    for size in (1, 2, 3, 4):
        got = sorted(i for rank in range(size) for i in split_indices(40, size, rank))
        assert got == list(range(40))

@pytest.mark.skipif(shutil.which("mpiexec") is None, reason="MPI is not installed")
def test_mpi_equals_serial(tmp_path):
    out = tmp_path / "peaks.npy"
    subprocess.run(["mpiexec", "-n", "2", sys.executable, "-m", "src.mpi_run", "40", str(out)], check=True)
    serial = [r[0] for r in run_serial(sample_params(40, seed=1))]
    assert np.allclose(np.load(out), serial)
