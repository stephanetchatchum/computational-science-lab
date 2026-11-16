import numpy as np

def dft_matrix(N):
    n = np.arange(N); return np.exp(-2j * np.pi * np.outer(n, n) / N)

def dft(x):
    return dft_matrix(len(x)) @ x

def power_spectrum(x, dt):
    x = np.asarray(x, float) - np.mean(x); X = np.fft.rfft(x); return np.fft.rfftfreq(len(x), d=dt), np.abs(X) ** 2

def parseval_error(x):
    X = np.fft.fft(x); a = np.sum(np.asarray(x) ** 2); return abs(a - np.sum(np.abs(X) ** 2) / len(x)) / a

def _k(N):
    return np.fft.fftfreq(N, 1 / N)

def spectral_derivative(f):
    return np.real(np.fft.ifft(1j * _k(len(f)) * np.fft.fft(f)))

def heat_spectral(u0, alpha, t):
    return np.real(np.fft.ifft(np.exp(-alpha * _k(len(u0)) ** 2 * t) * np.fft.fft(u0)))
