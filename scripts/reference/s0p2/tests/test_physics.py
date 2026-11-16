try:
    from src.physics import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.physics': raise
from src.physics import simulate

def test_no_drag_45_degrees():
    points = simulate(20, 45)              # v0 = 20 m/s, theta = 45 degrees
    last = points[-1]                      # each point is (t, x, y, z)
    peak = max(p[2] for p in points)       # y is the UP axis
    assert abs(last[1] - 40.8) < 0.41      # range R within about 1 percent
    assert abs(peak - 10.2) < 0.15         # peak height H

def test_azimuth_turns_the_shot_sideways():
    straight = simulate(20, 45, phi_deg=0)[-1]
    turned = simulate(20, 45, phi_deg=90)[-1]
    assert abs(straight[3]) < 1e-9         # phi = 0 means no sideways motion
    assert abs(turned[3] - 40.8) < 0.41    # phi = 90 sends the whole range sideways

def test_drag_shortens_the_range():
    assert simulate(20, 45, k=0.1)[-1][1] < simulate(20, 45)[-1][1]
