"""Evolve the riders. Run: python -m src.train   (about 5 to 10 minutes)"""
import os, time
import numpy as np
from src.brain import N_W, next_generation
from src.race import race

def train(gens=40, size=60, seeds_per_gen=3, crash_cost=300, seed=0, log=print):
    rng = np.random.default_rng(seed)
    pop = rng.normal(0, 0.5, (size, N_W))
    history = []
    for g in range(gens):
        runs = [race(pop, seed=10 * g + k, crash_cost=crash_cost) for k in range(seeds_per_gen)]
        fit = np.mean([r[0] for r in runs], axis=0)
        crashed = np.mean([r[1] for r in runs], axis=0)
        history.append((fit.max(), np.median(fit), crashed.mean()))
        if log: log(f"generation {g:2d}  best {fit.max():6.0f}  median {np.median(fit):6.0f}  crashed {100 * crashed.mean():3.0f}%")
        pop = next_generation(pop, fit, rng)
    # Pick the champion honestly: the 10 survivors ride 5 traffic patterns nobody has trained on.
    elite = pop[:10]
    val = np.mean([race(elite, seed=9000 + k, crash_cost=crash_cost)[0] for k in range(5)], axis=0)
    return elite[val.argmax()], np.array(history)

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    t = time.time()
    champ, hist = train()
    np.save("data/champion.npy", champ); np.save("data/history.npy", hist)
    print(f"saved data/champion.npy after {time.time() - t:.0f} s")
