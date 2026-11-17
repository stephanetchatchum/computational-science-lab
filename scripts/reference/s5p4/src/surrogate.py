import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

def rmse(a, b):
    return np.sqrt(np.mean((np.asarray(a) - np.asarray(b)) ** 2))

def fit_models(X, y, seed=0):
    k = int(0.8 * len(y)); out = {}
    for name, m in (("linear", LinearRegression()), ("forest", RandomForestRegressor(n_estimators=200, random_state=seed))):
        m.fit(X[:k], y[:k]); out[name] = (rmse(y[:k], m.predict(X[:k])), rmse(y[k:], m.predict(X[k:])))
    return out
