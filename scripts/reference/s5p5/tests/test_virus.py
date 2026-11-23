try:
    from src.towns import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.towns': raise
try:
    from src.network import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.network': raise
try:
    from src.outbreak import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.outbreak': raise
try:
    from src.country import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.country': raise
try:
    from src.play import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.play': raise
try:
    from src.qlearn import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.qlearn': raise
try:
    from src.evolve import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.evolve': raise
try:
    from src.train import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.train': raise
try:
    from src.compare import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.compare': raise
import numpy as np
from pytest import approx
from src.outbreak import Outbreak, growth_rate
from src.country import demo_country

def one_town(**k):
    return Outbreak([100000], np.array([[0.0]]), travel=0.0, **k)

def test_people_are_conserved():
    pops, xy, G = demo_country()
    o = Outbreak(pops, G, R0=3.0)
    for w in range(10):
        o.week(np.zeros(len(pops), int))
    assert o.S + o.E + o.I + o.R == approx(pops)

def test_no_virus_no_epidemic():
    o = one_town(seed_cases=0)
    o.week([0])
    assert o.I[0] == 0 and o.S[0] == 100000

def test_early_growth_matches_theory():
    o = one_town(R0=2.5, seed_cases=1)
    I = []
    for w in range(6):
        o.week([0]); I.append(o.I[0])
    r = np.log(I[5] / I[3]) / 14
    assert r == approx(growth_rate(2.5 / 6, 1 / 4, 1 / 6), rel=0.02)

def test_lockdown_and_vaccine_shrink_the_epidemic():
    def final(action, weeks=26):
        o = one_town(R0=2.5, vaccine_week=0)
        for w in range(weeks):
            o.week([action])
        return o.cases
    assert final(2) < final(1) < final(0)
    assert final(3) < final(0)

def test_no_vaccine_before_it_arrives():
    a = one_town(R0=2.5, vaccine_week=10); b = one_town(R0=2.5, vaccine_week=10)
    for w in range(5):
        a.week([3]); b.week([0])
    assert a.cases == approx(b.cases)

from src.play import play, do_nothing, hand_rule

def test_rules_beat_doing_nothing():
    pops, xy, G = demo_country()
    assert play(hand_rule, pops, G)["score"] > play(do_nothing, pops, G)["score"]

from src.qlearn import q_update, bucket, N_STATES

def test_q_update_learns_a_known_answer():
    # one state, two actions: action 1 always pays 1, action 0 pays 0. With gamma = 0.5, Q(1) -> 1 / (1 - 0.5) = 2.
    Q = np.zeros((1, 2))
    for _ in range(2000):
        for a, r in ((0, 0.0), (1, 1.0)):
            q_update(Q, np.array([0]), np.array([a]), np.array([r]), np.array([0]), alpha=0.1, gamma=0.5)
    assert Q[0, 1] == approx(2.0, abs=1e-3)
    assert Q[0, 0] == approx(1.0, abs=1e-3)      # 0 now + 0.5 x best later (2)

def test_states_fit_the_table():
    f = np.array([[0.0, 0.0, 0.0, 0.0, 0.0], [0.5, 3.0, 0.5, 1.0, 1.0]])
    s = bucket(f)
    assert s.min() >= 0 and s.max() < N_STATES and s[0] != s[1]

from src.evolve import net_policy, N_W

def test_brain_chooses_one_action_per_town():
    w = np.random.default_rng(0).normal(0, 1, N_W)
    acts = net_policy(w)(np.random.default_rng(1).random((12, 5)))
    assert acts.shape == (12,) and set(acts) <= {0, 1, 2, 3}
