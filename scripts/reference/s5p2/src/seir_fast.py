import numpy as np

def run_one(params, i0=0.001, dt=0.2, days=250):
    beta, sigma, gamma = params; y = np.array([1 - i0, 0, i0, 0.0]); per = round(1 / dt); curve = []
    f = lambda y: np.array([-beta*y[0]*y[2], beta*y[0]*y[2] - sigma*y[1], sigma*y[1] - gamma*y[2], gamma*y[2]])
    for d in range(days):
        for _ in range(per):
            k1 = f(y); k2 = f(y + dt/2*k1); k3 = f(y + dt/2*k2); k4 = f(y + dt*k3); y = y + dt/6*(k1 + 2*k2 + 2*k3 + k4)
        curve.append(float(y[2]))
    peak = max(curve); return peak, curve.index(peak), curve
