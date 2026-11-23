import numpy as np
from src.outbreak import Outbreak

WEEKS = 26

def score(new, cost, pops, lam):
    """Weekly score for the whole country: minus (percent of people newly infected) minus lam x (cost per person)."""
    return -(100 * new.sum() / pops.sum()) - lam * cost.sum() / pops.sum()

def play(policy, pops, G, lam=1.0, R0=2.5, seed_town=0, weeks=WEEKS, log=False):
    """Run one outbreak where `policy(features) -> action per town`. Returns total score and totals."""
    o = Outbreak(pops, G, R0=R0, seed_town=seed_town)
    total, history = 0.0, []
    spent = 0.0
    for w in range(weeks):
        acts = np.asarray(policy(o.features()))
        new, cost = o.week(acts)
        total += score(new, cost, pops, lam); spent += cost.sum() / pops.sum()
        if log: history.append((acts.copy(), o.I.copy(), new.copy()))
    out = dict(score=total, infected=100 * o.cases / pops.sum(), cost=spent)
    if log: out["history"] = history
    return out

def do_nothing(f):
    return np.zeros(len(f), int)

def hand_rule(f):
    """Lock down where more than 0.5% are infectious, test where more than 0.1%."""
    prev = f[:, 0]
    return np.where(prev > 0.005, 2, np.where(prev > 0.001, 1, 0))
