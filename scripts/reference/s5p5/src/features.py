import numpy as np

def growing_degree_days(temps, base=10):
    return float(sum(max(0, t - base) for t in temps))

def season_rain(rain, start_day, end_day):
    return float(sum(rain[start_day:end_day]))

def heat_stress_days(temps, threshold=35):
    return sum(1 for t in temps if t > threshold)

def correlation_matrix(X):
    return np.corrcoef(X, rowvar=False)
