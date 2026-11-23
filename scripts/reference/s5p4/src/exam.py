"""The exam: the champion rides roads and traffic it never trained on. Run: python -m src.exam"""
import numpy as np
from src.race import race

def exam(champ, shape="A", cars=12, speed_cap=1.0, n=12):
    runs = [race(champ[None, :], shape=shape, cars=cars, seed=100 + k, speed_cap=speed_cap) for k in range(n)]
    crash = np.mean([r[1][0] for r in runs]); dist = np.mean([r[2][0] for r in runs]); fares = np.mean([r[3][0] for r in runs])
    return crash, dist, fares

if __name__ == "__main__":
    import os
    riders = {"careful": "data/champion.npy", "risky": "data/risky.npy"}   # risky: python -c "from src.train import train; ..." with crash_cost=50
    print("rider    road  cars/lane  crashed  metres  fares")
    for name, path in riders.items():
        if not os.path.exists(path): continue
        champ = np.load(path)
        for shape, cars in (("A", 12), ("A", 18), ("B", 12), ("B", 18)):
            c, d, f = exam(champ, shape, cars)
            print(f"{name:8} {shape:>4} {cars:10d} {100 * c:7.0f}% {d:7.0f} {f:6.1f}")
