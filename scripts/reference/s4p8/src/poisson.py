import math
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spl

def grid(N):
    h = 1.0 / (N + 1); x = np.linspace(h, 1 - h, N); return x, h

def laplacian_matrix(N):
    """The 5-point matrix for -∇²u on N×N interior points, zero on the walls, as scipy.sparse CSR."""
    h = 1.0 / (N + 1); T = sp.diags([-1.0, 2.0, -1.0], [-1, 0, 1], shape=(N, N)); I = sp.identity(N)
    return ((sp.kron(I, T) + sp.kron(T, I)) / h**2).tocsr()

def solve_direct(f):
    N = f.shape[0]; return spl.spsolve(laplacian_matrix(N).tocsc(), f.ravel()).reshape(N, N)

def residual(u, f):
    N = f.shape[0]; h = 1.0 / (N + 1); p = np.pad(u, 1)
    Au = (4 * p[1:-1, 1:-1] - p[2:, 1:-1] - p[:-2, 1:-1] - p[1:-1, 2:] - p[1:-1, :-2]) / h**2
    return float(np.linalg.norm(f - Au) / np.linalg.norm(f))

def jacobi(f, tol=1e-6, max_iter=100_000):
    N = f.shape[0]; h = 1.0 / (N + 1); u = np.zeros((N, N))
    for it in range(1, max_iter + 1):
        p = np.pad(u, 1); u = 0.25 * (p[2:, 1:-1] + p[:-2, 1:-1] + p[1:-1, 2:] + p[1:-1, :-2] + h * h * f)
        if residual(u, f) < tol: return u, it
    return u, max_iter

def sor(f, omega=1.0, tol=1e-6, max_iter=100_000):
    """omega = 1 is Gauss–Seidel. Red–black ordering so each half-sweep is one numpy line."""
    N = f.shape[0]; h = 1.0 / (N + 1); p = np.zeros((N + 2, N + 2)); I, J = np.meshgrid(np.arange(1, N + 1), np.arange(1, N + 1), indexing="ij")
    red = (I + J) % 2 == 0; black = ~red; F = np.pad(f, 1)
    for it in range(1, max_iter + 1):
        for mask in (red, black):
            gs = 0.25 * (np.roll(p, 1, 0) + np.roll(p, -1, 0) + np.roll(p, 1, 1) + np.roll(p, -1, 1) + h * h * F)
            inner = np.zeros_like(p, bool); inner[1:-1, 1:-1] = mask
            p[inner] = (1 - omega) * p[inner] + omega * gs[inner]
        u = p[1:-1, 1:-1]
        if residual(u, f) < tol: return u.copy(), it
    return p[1:-1, 1:-1].copy(), max_iter

def omega_opt(N):
    return 2 / (1 + math.sin(math.pi / (N + 1)))

def conjugate_gradient(A, b, tol=1e-6, max_iter=10_000):
    x = np.zeros_like(b); r = b - A @ x; p = r.copy(); rr = r @ r; nb = np.linalg.norm(b)
    for it in range(1, max_iter + 1):
        Ap = A @ p; a = rr / (p @ Ap); x += a * p; r -= a * Ap; rr_new = r @ r
        if math.sqrt(rr_new) / nb < tol: return x, it
        p = r + (rr_new / rr) * p; rr = rr_new
    return x, max_iter

def charges(N, items):
    """Point charges as a source: q / h² in one cell each. items = [(x, y, q)]."""
    x, h = grid(N); f = np.zeros((N, N))
    for cx, cy, q in items: f[int(round(cx / h)) - 1, int(round(cy / h)) - 1] += q / h**2
    return f
