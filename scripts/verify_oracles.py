"""Every expected value written into the new or revised Stage 0–1 guide steps is computed here
from the exact algorithm the guide describes. Run: python3 scripts/verify_oracles.py"""
import math, numpy as np
ok = lambda name, cond, val='': print(('PASS ' if cond else 'FAIL ') + name, val) or (cond or exit(1))

# ---- s0p1: product rule by Monte Carlo, and m / s
A = np.random.default_rng(0).normal(2.0, 0.1, 400_000); B = np.random.default_rng(1).normal(3.0, 0.2, 400_000)
ok('s0p1 MC std of a*b ~ 0.5', abs(np.std(A*B) - 0.5) < 0.01, np.std(A*B))
v = 100.0 / 9.58; u = abs(v) * math.sqrt((2.0/100.0)**2 + (0.01/9.58)**2)
ok('s0p1 100±2 m / 9.58±0.01 s', abs(v-10.4384) < 1e-4 and abs(u-0.2091) < 1e-4, (v, u))

# ---- s0p3: window starts and exact recovery on synthetic exponential data
def exponential(p0, r, years):
    s=[p0]
    for _ in range(years): s.append(s[-1] + r*s[-1])
    return s
def sse(m, r): return sum(((a-b)/1e6)**2 for a,b in zip(m,r))
def fit_exponential(real):
    best=None
    for i in range(1,81):
        r=i/1000; sc=sse(exponential(real[0], r, len(real)-1), real)
        if best is None or sc<best[1]: best=(r,sc)
    return best
def window_starts(n, width=40, count=5): return [int(round(s)) for s in np.linspace(0, n-width, count)]
ok('s0p3 window_starts(60)', window_starts(60) == [0,5,10,15,20], window_starts(60))
ok('s0p3 window_starts(64)', window_starts(64) == [0,6,12,18,24], window_starts(64))
real = exponential(1_000_000, 0.025, 59)
rs = [fit_exponential(real[s:s+40])[0] for s in window_starts(len(real))]
ok('s0p3 exact r in every window', all(r == 0.025 for r in rs), rs)

# ---- s0p4: sample vs population variance
D=[2,4,4,4,5,5,7,9]; m=sum(D)/8
ok('s0p4 population var 4', sum((x-m)**2 for x in D)/8 == 4.0)
ok('s0p4 sample var 32/7', abs(sum((x-m)**2 for x in D)/7 - 4.571428571) < 1e-9, 32/7)

# ---- s1p1: annual means and block bootstrap
def fit_line_np(x, y):
    x=np.asarray(x,float); y=np.asarray(y,float); xm, ym = x.mean(), y.mean()
    s=((x-xm)*(y-ym)).sum()/((x-xm)**2).sum(); return s, ym-s*xm
def slope_se(x, y):
    x=np.asarray(x,float); y=np.asarray(y,float); s,c=fit_line_np(x,y); r=y-(c+s*x)
    return math.sqrt((r**2).sum()/(len(x)-2)/((x-x.mean())**2).sum())
def block_se(x, y, block=5, n_boot=1000, seed=0):
    x=np.asarray(x,float); y=np.asarray(y,float); rng=np.random.default_rng(seed); n=len(x); k=math.ceil(n/block); out=[]
    for _ in range(n_boot):
        idx=np.concatenate([np.arange(s, s+block) for s in rng.integers(0, n-block+1, k)])[:n]
        out.append(fit_line_np(x[idx], y[idx])[0])
    return float(np.std(out, ddof=1))
X=np.arange(10); ok('s1p1 bootstrap of a perfect line is 0', block_se(X, 3*X+7) < 1e-12)
rng=np.random.default_rng(42); x=np.arange(200); y=0.01*x+rng.normal(0,1,200)
r1 = block_se(x,y)/slope_se(x,y); ok('s1p1 independent noise: bootstrap/formula in [0.7,1.3]', 0.7 < r1 < 1.3, r1)
rng=np.random.default_rng(7); e=np.zeros(200)
for i in range(1,200): e[i]=0.8*e[i-1]+rng.normal(0,1)
y2=0.01*x+e; r2=block_se(x,y2)/slope_se(x,y2); ok('s1p1 AR(1) phi=0.8: bootstrap > 1.5 x formula', r2 > 1.5, r2)

# ---- s1p2: epsilon and best h
eps=np.finfo(float).eps
ok('s1p2 1+eps != 1 and 1+eps/2 == 1', (1.0+eps != 1.0) and (1.0+eps/2 == 1.0), eps)
hs=[10.0**-k for k in range(1,13)]; errs=[abs((math.sin(1+h)-math.sin(1))/h-math.cos(1)) for h in hs]
best=hs[int(np.argmin(errs))]; ok('s1p2 best forward h in [1e-9,1e-7]', 1e-9 <= best <= 1e-7, best)
ok('s1p2 error at 1e-12 larger than at best by >100x', errs[-1] > 100*min(errs), errs[-1]/min(errs))

# ---- s1p3: semi-implicit Euler
def semi(x, v, dt, m=1.0, k=1.0, c=0.0, force=0.0):
    a=(-k*x-c*v+force)/m; v2=v+dt*a; return x+dt*v2, v2
E=lambda x,v: 0.5*v*v+0.5*x*x
x1,v1=semi(1.0,0.0,0.1); ok('s1p3 one semi-implicit step', abs(x1-0.99)<1e-12 and abs(v1+0.1)<1e-12, (x1,v1))
xs,vs=1.0,0.0; dev=0
for _ in range(2513): xs,vs=semi(xs,vs,0.01); dev=max(dev,abs(E(xs,vs)-0.5))
ok('s1p3 energy after 2513 steps within 0.005 of 0.5', abs(E(xs,vs)-0.5)<0.005, E(xs,vs))
ok('s1p3 max energy deviation < 0.003 at dt 0.01', dev<0.003, dev)
xs,vs=1.0,0.0; dev=0
for _ in range(100000): xs,vs=semi(xs,vs,0.01); dev=max(dev,abs(E(xs,vs)-0.5))
ok('s1p3 still bounded after 100000 steps (< 0.003)', dev<0.003, dev)

# ---- s1p4: spatial hash equals brute force
rng=np.random.default_rng(3); P=rng.uniform(0,500,(200,3)); R=60.0
def brute(i): return sorted(j for j in range(len(P)) if j!=i and np.linalg.norm(P[i]-P[j])<R)
def grid_build(cell):
    g={}
    for j,p in enumerate(P): g.setdefault(tuple((p//cell).astype(int)),[]).append(j)
    return g
G=grid_build(R)
def via_grid(i):
    c=(P[i]//R).astype(int); out=[]
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            for dz in (-1,0,1):
                for j in G.get((c[0]+dx,c[1]+dy,c[2]+dz),[]):
                    if j!=i and np.linalg.norm(P[i]-P[j])<R: out.append(j)
    return sorted(out)
ok('s1p4 grid neighbours == brute force for all 200', all(brute(i)==via_grid(i) for i in range(200)))

# ---- s1p6: floating point and the convergence harness
def machine_epsilon():
    e=1.0
    while 1.0 + e/2 != 1.0: e/=2
    return e
ok('s1p6 machine_epsilon == 2**-52', machine_epsilon() == 2**-52)
def roots_naive(a,b,c):
    d=math.sqrt(b*b-4*a*c); return ((-b+d)/(2*a), (-b-d)/(2*a))
def roots_stable(a,b,c):
    d=math.sqrt(b*b-4*a*c); q=-0.5*(b+math.copysign(d,b)); return (c/q, q/a)
true_small = -1e-8   # x^2 + 1e8 x + 1: small root = -1e-8 - 1e-24 to double precision
rn = roots_naive(1,1e8,1); rs_ = roots_stable(1,1e8,1)
naive_small = rn[0]; stable_small = rs_[0]
ok('s1p6 naive small root rel err > 0.1', abs(naive_small-true_small)/1e-8 > 0.1, naive_small)
ok('s1p6 stable small root rel err < 1e-15', abs(stable_small-true_small)/1e-8 < 1e-15, stable_small)
ok('s1p6 both give big root -1e8', abs(rs_[1]+1e8) < 1e-6 and abs(rn[1]+1e8) < 1e-6)
data=[1e9+4,1e9+7,1e9+13,1e9+16]
def var_two(xs):
    m=sum(xs)/len(xs); return sum((x-m)**2 for x in xs)/len(xs)
def var_one(xs):
    n=len(xs); s=sum(xs); s2=sum(x*x for x in xs); return s2/n-(s/n)**2
ok('s1p6 two-pass variance exactly 22.5', var_two(data)==22.5, var_two(data))
ok('s1p6 one-pass variance off by > 10', abs(var_one(data)-22.5) > 10, var_one(data))
ok('s1p6 both agree on small data', var_one([4,7,13,16])==22.5==var_two([4,7,13,16]))
def order_of_accuracy(err, hs):
    lh=np.log(hs); le=np.log([err(h) for h in hs]); return float(np.polyfit(lh,le,1)[0])
H=[0.1,0.05,0.025,0.0125]
fwd=order_of_accuracy(lambda h: abs((math.sin(1+h)-math.sin(1))/h-math.cos(1)), H)
ctr=order_of_accuracy(lambda h: abs((math.sin(1+h)-math.sin(1-h))/(2*h)-math.cos(1)), H)
def trap(f,a,b,n):
    h=(b-a)/n; return h*(0.5*f(a)+0.5*f(b)+sum(f(a+i*h) for i in range(1,n)))
def simp(f,a,b,n):
    h=(b-a)/n; return h/3*(f(a)+f(b)+sum((4 if i%2 else 2)*f(a+i*h) for i in range(1,n)))
I=math.e-1
sim=order_of_accuracy(lambda h: abs(simp(math.exp,0,1,round(1/h))-I), [0.5,0.25,0.125,0.0625])
tra=order_of_accuracy(lambda h: abs(trap(math.exp,0,1,round(1/h))-I), [0.5,0.25,0.125,0.0625])
ok('s1p6 forward order ~1 (abs 0.1)', abs(fwd-1)<0.1, fwd)
ok('s1p6 central order ~2 (abs 0.1)', abs(ctr-2)<0.1, ctr)
ok('s1p6 trapezoid order ~2 (abs 0.1)', abs(tra-2)<0.1, tra)
ok('s1p6 simpson order ~4 (abs 0.1)', abs(sim-4)<0.1, sim)
T8,T16=trap(math.exp,0,1,8),trap(math.exp,0,1,16); Rx=(4*T16-T8)/3
ok('s1p6 trapezoid n=16 error ~ 5.6e-4', abs(abs(T16-I)-5.59e-4)<1e-5, abs(T16-I))
ok('s1p6 Richardson(8,16) error < 1e-6', abs(Rx-I)<1e-6, abs(Rx-I))
ok('s1p6 Richardson equals Simpson n=16', abs(Rx-simp(math.exp,0,1,16))<1e-14)
hs=[10**(-k/4) for k in range(4,49)]
ce=[abs((math.sin(1+h)-math.sin(1-h))/(2*h)-math.cos(1)) for h in hs]; fe=[abs((math.sin(1+h)-math.sin(1))/h-math.cos(1)) for h in hs]
bc=hs[int(np.argmin(ce))]; bf=hs[int(np.argmin(fe))]
ok('s1p6 live plot: central best h near 1e-5 (3e-6..3e-5)', 3e-6<bc<3e-5, bc)
ok('s1p6 live plot: forward best h near 1e-8 (3e-9..3e-8)', 3e-9<bf<3e-8, bf)
print('ALL ORACLES VERIFIED')
