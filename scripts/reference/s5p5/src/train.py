"""Train both AIs on the made-up country and save them. Run: python -m src.train"""
import os, time
import numpy as np
from src.country import demo_country
from src.qlearn import train_q
from src.evolve import train_evo

def main(lam=1.0, tag=""):
    pops, xy, G = demo_country()
    os.makedirs("data", exist_ok=True)
    t = time.time(); Q = train_q(pops, G, episodes=400, lam=lam)
    np.save(f"data/qtable{tag}.npy", Q); print(f"Q-learning: {time.time() - t:.0f} s")
    t = time.time()
    w = train_evo(pops, G, gens=20, size=30, lam=lam, log=lambda g, best, med: print(f"generation {g:2d}  best {best:7.2f}  median {med:7.2f}"))
    np.save(f"data/brain{tag}.npy", w); print(f"evolution: {time.time() - t:.0f} s")

if __name__ == "__main__":
    main()
