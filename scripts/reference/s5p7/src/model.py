import math

SIGMA = 1 / 5.2

def weekly_cases(beta, gamma, weeks=30, N=1e6, I0=100, s0=1.0, dt=1.0):
    S, E, I, R = s0 * N - I0, 0.0, float(I0), (1 - s0) * N; out = []; per = round(7 / dt); prev = I + R
    def f(S, E, I):
        inf = beta * S * I / N; return -inf, inf - SIGMA * E, SIGMA * E - gamma * I, gamma * I
    for _ in range(weeks):
        for _ in range(per):
            a = f(S, E, I); b = f(S + dt/2*a[0], E + dt/2*a[1], I + dt/2*a[2]); c = f(S + dt/2*b[0], E + dt/2*b[1], I + dt/2*b[2]); d = f(S + dt*c[0], E + dt*c[1], I + dt*c[2])
            S += dt/6*(a[0] + 2*b[0] + 2*c[0] + d[0]); E += dt/6*(a[1] + 2*b[1] + 2*c[1] + d[1])
            I += dt/6*(a[2] + 2*b[2] + 2*c[2] + d[2]); R += dt/6*(a[3] + 2*b[3] + 2*c[3] + d[3])
        out.append(I + R - prev); prev = I + R
    return out

def log_likelihood(obs, mu):
    return sum(o * math.log(max(m, 1e-9)) - max(m, 1e-9) - math.lgamma(o + 1) for o, m in zip(obs, mu))
