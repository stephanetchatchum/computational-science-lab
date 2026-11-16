import math
import numpy as np
import pytest
from pytest import approx
from src.wave import ricker, check_cfl, run_wave, direct_speed, estimate_depths

def test_ricker_peaks_at_t0():
    assert ricker(0.08) == approx(1.0)

def test_cfl_rule():
    check_cfl(1500, 0.001, 5.0)                  # 1500*0.001/5 = 0.3, fine
    with pytest.raises(ValueError):
        check_cfl(3000, 0.002, 5.0)              # 1.2, far too big

def test_speed_measured_in_water():
    assert 1400 < direct_speed(run_wave(layered=False)) < 1600

def test_depth_recovered_from_the_echo():
    for h in estimate_depths(run_wave(layered=True), run_wave(layered=False)):
        assert abs(h - 200) < 10                 # within 5 percent of the true 200 m
