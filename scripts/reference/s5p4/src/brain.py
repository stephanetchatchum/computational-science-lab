import numpy as np

N_IN, N_HID, N_OUT = 10, 8, 2
N_W = N_IN * N_HID + N_HID + N_HID * N_OUT + N_OUT

def unpack(w):
    i = 0
    W1 = w[..., i:i + N_IN * N_HID].reshape(w.shape[:-1] + (N_IN, N_HID)); i += N_IN * N_HID
    b1 = w[..., i:i + N_HID]; i += N_HID
    W2 = w[..., i:i + N_HID * N_OUT].reshape(w.shape[:-1] + (N_HID, N_OUT)); i += N_HID * N_OUT
    b2 = w[..., i:i + N_OUT]
    return W1, b1, W2, b2

def think(w, inputs):
    """w: (bikes, N_W), inputs: (bikes, N_IN) -> outputs in -1..1, shape (bikes, N_OUT)."""
    W1, b1, W2, b2 = unpack(w)
    h = np.tanh(np.einsum("bi,bih->bh", inputs, W1) + b1)
    return np.tanh(np.einsum("bh,bho->bo", h, W2) + b2)

def next_generation(pop, fitness, rng, elite=10, sigma=0.15):
    """Keep the best `elite` unchanged; fill the rest with mutated copies of them."""
    order = np.argsort(fitness)[::-1]
    best = pop[order[:elite]]
    parents = best[rng.integers(0, elite, len(pop) - elite)]
    kids = parents + rng.normal(0, sigma, parents.shape)
    return np.vstack([best, kids])
