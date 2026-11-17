import math
import numpy as np

G = 9.81
DRY = 1e-6

def fill_voids(ground, nodata=-32768):
    g = np.array(ground, float); bad = (g <= nodata) | ~np.isfinite(g)
    for _ in range(10):
        if not bad.any(): break
        p = np.pad(np.where(bad, np.nan, g), 1, constant_values=np.nan)
        nb = np.stack([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]])
        with np.errstate(all="ignore"): mean = np.nanmean(nb, axis=0)
        fix = bad & np.isfinite(mean); g[fix] = mean[fix]; bad = bad & ~fix
    if bad.any(): g[bad] = g[~bad].mean()
    return g

def ritter(x, t, x0=0.0, h0=1.0):
    c0 = math.sqrt(G * h0); xi = (np.asarray(x, float) - x0) / t
    return np.where(xi <= -c0, h0, np.where(xi >= 2 * c0, 0.0, (2 * c0 - xi) ** 2 / (9 * G)))

def velocity(h, q):
    return np.where(h > DRY, q / np.maximum(h, DRY), 0.0)

def rusanov(hL, qL, hR, qR):
    uL, uR = velocity(hL, qL), velocity(hR, qR)
    a = np.maximum(np.abs(uL) + np.sqrt(G * hL), np.abs(uR) + np.sqrt(G * hR))
    fh = 0.5 * (hL * uL + hR * uR) - 0.5 * a * (hR - hL)
    fq = 0.5 * (hL * uL**2 + 0.5 * G * hL**2 + hR * uR**2 + 0.5 * G * hR**2) - 0.5 * a * (hR * uR - hL * uL)
    return fh, fq, a

def step1d(h, q, dx, cfl=0.45):
    hp = np.concatenate([h[:1], h, h[-1:]]); qp = np.concatenate([-q[:1], q, -q[-1:]])
    fh, fq, a = rusanov(hp[:-1], qp[:-1], hp[1:], qp[1:])
    dt = cfl * dx / max(a.max(), 1e-12)
    h2 = np.maximum(h - dt / dx * (fh[1:] - fh[:-1]), 0.0); q2 = q - dt / dx * (fq[1:] - fq[:-1])
    return h2, np.where(h2 > DRY, q2, 0.0), dt

def run1d(h, q, dx, t_end):
    t = 0.0
    while t < t_end:
        h, q, dt = step1d(h, q, dx)
        t += dt
    return h, q, t

def _sweep(z, h, hu, hv):
    zp = np.pad(z, ((0, 0), (1, 1)), mode="edge"); hp = np.pad(h, ((0, 0), (1, 1)), mode="edge")
    hup = np.pad(hu, ((0, 0), (1, 1)), mode="edge"); hup[:, 0] *= -1; hup[:, -1] *= -1
    hvp = np.pad(hv, ((0, 0), (1, 1)), mode="edge")
    zL, zR, hL, hR = zp[:, :-1], zp[:, 1:], hp[:, :-1], hp[:, 1:]
    uL, uR = velocity(hL, hup[:, :-1]), velocity(hR, hup[:, 1:]); vL, vR = velocity(hL, hvp[:, :-1]), velocity(hR, hvp[:, 1:])
    zs = np.maximum(zL, zR); hLs = np.maximum(0, hL + zL - zs); hRs = np.maximum(0, hR + zR - zs)
    fh, fq, a = rusanov(hLs, hLs * uL, hRs, hRs * uR)
    vup = np.where(fh > 0, vL, vR); fv = fh * vup
    fqL = fq + 0.5 * G * (hL**2 - hLs**2); fqR = fq + 0.5 * G * (hR**2 - hRs**2)
    return fh[:, 1:] - fh[:, :-1], fqL[:, 1:] - fqR[:, :-1], fv[:, 1:] - fv[:, :-1], a.max()

def step2d(z, h, hu, hv, dx, dy=None, n_manning=0.03, cfl=0.45, dt_max=10.0):
    dy = dx if dy is None else dy
    wet = h > DRY; hu = np.where(wet, hu, 0.0); hv = np.where(wet, hv, 0.0)
    X = _sweep(z, h, hu, hv); Y = _sweep(z.T, h.T, hv.T, hu.T)
    dt = min(dt_max, cfl * min(dx, dy) / max(X[3], Y[3], 1e-9))
    h2 = np.maximum(h - dt / dx * X[0] - dt / dy * Y[0].T, 0.0)
    hu2 = hu - dt / dx * X[1] - dt / dy * Y[2].T; hv2 = hv - dt / dx * X[2] - dt / dy * Y[1].T
    speed = np.sqrt(hu2**2 + hv2**2) / np.maximum(h2, DRY)
    k = 1 + dt * G * n_manning**2 * speed / np.maximum(h2, DRY) ** (4 / 3)
    wet = h2 > DRY
    return h2, np.where(wet, hu2 / k, 0.0), np.where(wet, hv2 / k, 0.0), dt
