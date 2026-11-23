"""The fair fight: every policy on outbreaks none of them trained on. Run: python -m src.compare"""
import numpy as np
from src.country import demo_country
from src.play import play, do_nothing, hand_rule
from src.qlearn import q_policy
from src.evolve import net_policy

def table(cases, pops, G, policies):
    print(f"{'R0':>4} {'start':>5} " + " ".join(f"{n:>10}" for n in policies))
    tot = np.zeros(len(policies))
    for R0, town in cases:
        s = [play(p, pops, G, R0=R0, seed_town=town)["score"] for p in policies.values()]
        tot += s; print(f"{R0:4.1f} {town:5d} " + " ".join(f"{v:10.1f}" for v in s))
    print(f"{'mean':>10} " + " ".join(f"{v / len(cases):10.1f}" for v in tot))

def main():
    pops, xy, G = demo_country()
    P = {"nothing": do_nothing, "hand rule": hand_rule, "Q-learning": q_policy(np.load("data/qtable.npy")), "evolved": net_policy(np.load("data/brain.npy"))}
    print("Trained on R0 2.0, 2.5, 3.0 starting in towns 0, 1, 2. Now:")
    table([(1.8, 5), (2.5, 8), (3.5, 3), (3.5, 0), (2.2, 11)], pops, G, P)
    print("A country none of them has seen:")
    pops2, xy2, G2 = demo_country(n=20, seed=7, steep=0.6)
    table([(2.0, 0), (2.5, 4), (3.0, 10)], pops2, G2, P)

if __name__ == "__main__":
    main()
