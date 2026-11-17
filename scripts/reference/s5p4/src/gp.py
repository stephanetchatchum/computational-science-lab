import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel

def fit_gp(X, y):
    k = ConstantKernel(1.0) * RBF(np.full(X.shape[1], 0.5)) + WhiteKernel(1e-6, noise_level_bounds=(1e-10, 1e-1))
    return GaussianProcessRegressor(k, normalize_y=True, random_state=0).fit(X, y)

def coverage(model, X, y):
    m, s = model.predict(X, return_std=True); return float(np.mean(np.abs(m - y) <= 2 * s))
