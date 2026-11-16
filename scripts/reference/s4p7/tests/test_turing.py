from src.gray_scott import PRESETS
from src.turing import uniform_states, growth_rate

def test_the_empty_dish_is_always_stable():
    for f, k in PRESETS.values():
        assert growth_rate(1.0, 0.0, f, k, 1.0, 0.5) < 0                # small disturbances of U = 1, V = 0 die

def test_turing_needs_unequal_diffusion():
    U, V = uniform_states(0.055, 0.062)[0]
    assert growth_rate(U, V, 0.055, 0.062, 0.0, 0.0) < 0                 # stable without diffusion
    assert growth_rate(U, V, 0.055, 0.062, 1.0, 0.5) > 0.005             # unstable with Du/Dv = 2: a pattern grows
    assert growth_rate(U, V, 0.055, 0.062, 1.0, 1.0) < 0                 # equal diffusion: no pattern

def test_the_other_side_of_the_boundary():
    U, V = uniform_states(0.06, 0.0609)[0]
    assert growth_rate(U, V, 0.06, 0.0609, 1.0, 0.5) < 0                 # stays uniform

def test_spots_have_no_uniform_partner_state():
    f, k = PRESETS["spots"]
    assert uniform_states(f, k) == []                                    # spots need a big kick, not a slow instability
