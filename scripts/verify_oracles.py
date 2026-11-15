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

# ======================= STAGE 2 =======================
# s2p1: flop count of the guide's naive elimination loops, and LU reuse
def count_flops(n):
    c_=0
    for c in range(n-1):
        for r in range(c+1,n):
            for k in range(c,n+1): c_+=1
    return c_
ok('s2p1 count_flops(2)=3, (3)=11', count_flops(2)==3 and count_flops(3)==11, (count_flops(2),count_flops(3)))
rat=count_flops(100)/(100**3/3); ok('s2p1 count_flops(100)/(n^3/3) in [1.0,1.05]', 1.0<=rat<=1.05, rat)
def lu(A):
    n=len(A); L=[[float(i==j) for j in range(n)] for i in range(n)]; U=[r[:] for r in A]
    for c in range(n-1):
        for r in range(c+1,n):
            f=U[r][c]/U[c][c]; L[r][c]=f
            for k in range(c,n): U[r][k]-=f*U[c][k]
    return L,U
def lu_solve(L,U,b):
    n=len(b); y=[0.0]*n
    for i in range(n): y[i]=b[i]-sum(L[i][k]*y[k] for k in range(i))
    x=[0.0]*n
    for i in reversed(range(n)): x[i]=(y[i]-sum(U[i][k]*x[k] for k in range(i+1,n)))/U[i][i]
    return x
A=[[4.0,1,0],[1,4,1],[0,1,4]]; L,U=lu(A)
x1=lu_solve(L,U,[5.0,6,5]); x2=lu_solve(L,U,[4.0,1,0])
ok('s2p1 lu_solve [5,6,5] -> [1,1,1]', np.allclose(x1,[1,1,1]), x1)
ok('s2p1 lu_solve second rhs matches numpy', np.allclose(x2,np.linalg.solve(A,[4,1,0])), x2)
def count_lu_solve(n): return n*(n-1)//2 + n*(n-1)//2   # inner multiply-adds of forward + back substitution
ok('s2p1 lu_solve multiply-adds for n=100 = 9900', count_lu_solve(100)==9900)

# s2p2: deterministic quadrature wins in 1D, Monte Carlo wins in 6D
I=1/3; xs=np.linspace(0,1,1001); tr=np.trapezoid(xs**2,xs)
ok('s2p2 trapezoid n=1000 error < 1e-6 for x^2', abs(tr-I)<1e-6, abs(tr-I))
mce=np.mean([abs(np.mean(np.random.default_rng(s).random(1001)**2)-I) for s in range(20)])
ok('s2p2 same budget (1001 points): MC mean error over 20 seeds > 1000 x trapezoid error', mce>1000*abs(tr-I), (mce, abs(tr-I)))
V6=math.pi**3/6
def ball_grid(d,m):
    g=-1+(np.arange(m)+0.5)*2/m; mesh=np.meshgrid(*([g]*d),indexing='ij'); r2=sum(a**2 for a in mesh)
    return (r2<=1).mean()*2**d
def ball_mc(d,n,seed):
    p=np.random.default_rng(seed).uniform(-1,1,(n,d)); return ((p**2).sum(1)<=1).mean()*2**d
eg=abs(ball_grid(6,10)-V6); em=abs(ball_mc(6,1_000_000,1)-V6)
ok('s2p2 6D: grid (10^6 cells) error > 0.05', eg>0.05, eg)
ok('s2p2 6D: MC (10^6 darts, seed 1) error < 0.05', em<0.05, em)
eg1=abs(ball_grid(1,1_000_000)-2); ok('s2p2 1D length of [-1,1] by grid exact-ish', eg1<1e-5, eg1)

# s2p3: conditioning squares, QR beats normal equations at degree 8
x=np.linspace(0,1,20); Vm=np.vander(x,9,increasing=True)
cV=np.linalg.cond(Vm); cN=np.linalg.cond(Vm.T@Vm)
ok('s2p3 cond(V^T V) ~ cond(V)^2 (rel 5%)', abs(cN/cV**2-1)<0.05, (cV,cN))
ctrue=np.array([1,-2,3,-4,5,-6,7,-8,9],float); y=Vm@ctrue
def householder_qr(A):
    A=A.astype(float).copy(); m,n=A.shape; Q=np.eye(m)
    for j in range(n):
        x_=A[j:,j]; v_=x_.copy(); v_[0]+=math.copysign(np.linalg.norm(x_),x_[0]); v_/=np.linalg.norm(v_)
        A[j:,:]-=2*np.outer(v_,v_@A[j:,:]); Q[:,j:]-=2*np.outer(Q[:,j:]@v_,v_)
    return Q[:,:n],A[:n,:]
Qh,Rh=householder_qr(Vm)
ok('s2p3 Q^T Q = I and QR = V', np.allclose(Qh.T@Qh,np.eye(9),atol=1e-12) and np.allclose(Qh@Rh,Vm,atol=1e-12))
def back(R,b):
    n=len(b); xx=np.zeros(n)
    for i in reversed(range(n)): xx[i]=(b[i]-R[i,i+1:]@xx[i+1:])/R[i,i]
    return xx
c_qr=back(Rh,Qh.T@y); c_ne=np.linalg.solve(Vm.T@Vm,Vm.T@y)
eqr=np.max(np.abs(c_qr-ctrue)); ene=np.max(np.abs(c_ne-ctrue))
ok('s2p3 Householder QR coefficient error < 1e-8', eqr<1e-8, eqr)
def gp(Mm,bb):
    n=len(bb); A_=[list(r)+[q] for r,q in zip(Mm,bb)]
    for col in range(n):
        p=max(range(col,n),key=lambda r:abs(A_[r][col])); A_[col],A_[p]=A_[p],A_[col]
        for r in range(col+1,n):
            f=A_[r][col]/A_[col][col]
            for k in range(col,n+1): A_[r][k]-=f*A_[col][k]
    xx=[0.0]*n
    for r in reversed(range(n)): xx[r]=(A_[r][n]-sum(A_[r][k]*xx[k] for k in range(r+1,n)))/A_[r][r]
    return np.array(xx)
ene=np.max(np.abs(gp((Vm.T@Vm).tolist(),(Vm.T@y).tolist())-ctrue))
ok('s2p3 normal equations with the guide solver: error > 1e-7', ene>1e-7, ene)

# s2p4: geometric dry spells, chi-square
def simulate(P,steps,seed=None,start=0):
    rng=np.random.default_rng(seed); s=start; out=[]
    for _ in range(steps): s=int(rng.choice(len(P),p=P[s])); out.append(s)
    return out
def mean_spell(st):
    runs=[];c=0
    for s in st:
        if s==0: c+=1
        elif c: runs.append(c); c=0
    if c: runs.append(c)
    return sum(runs)/len(runs)
Pm=np.array([[0.9,0.1],[0.5,0.5]]); ms=mean_spell(simulate(Pm,200_000,seed=1))
ok('s2p4 mean dry spell ~ 1/(1-0.9) = 10 (abs 0.3)', abs(ms-10)<0.3, ms)
chi=lambda o,e: sum((a-b)**2/b for a,b in zip(o,e))
ok('s2p4 chi_square([10,20],[15,15]) = 3.333', abs(chi([10,20],[15,15])-10/3)<1e-12)
ok('s2p4 geometric P(L=1..3) for p=0.9: 0.1, 0.09, 0.081', np.allclose([(1-.9)*.9**(k-1) for k in (1,2,3)],[0.1,0.09,0.081]))

# s2p5: BFS hops and Dijkstra on the four-town map with distances
import heapq
W={0:{1:5,2:2},1:{0:5,2:1},2:{0:2,1:1,3:4},3:{2:4}}
def bfs(G,s,t):
    from collections import deque
    q=deque([s]); prev={s:None}
    while q:
        u=q.popleft()
        if u==t: break
        for w in G[u]:
            if w not in prev: prev[w]=u; q.append(w)
    path=[t]
    while prev[path[-1]] is not None: path.append(prev[path[-1]])
    return path[::-1]
def dijkstra(G,s,t):
    dist={s:0}; prev={s:None}; pq=[(0,s)]; done=set()
    while pq:
        d,u=heapq.heappop(pq)
        if u in done: continue
        done.add(u)
        if u==t: break
        for w,c in G[u].items():
            if d+c<dist.get(w,1e18): dist[w]=d+c; prev[w]=u; heapq.heappush(pq,(d+c,w))
    path=[t]
    while prev[path[-1]] is not None: path.append(prev[path[-1]])
    return dist[t], path[::-1]
ok('s2p5 BFS A->B = [0,1]; A->D = [0,2,3]', bfs(W,0,1)==[0,1] and bfs(W,0,3)==[0,2,3])
ok('s2p5 Dijkstra A->B = 3 via C; A->D = 6', dijkstra(W,0,1)==(3,[0,2,1]) and dijkstra(W,0,3)==(6,[0,2,3]))

# s2p6: DFT matrix, Parseval, spectral peaks, spectral derivative, spectral heat
N=64; n_=np.arange(N); F=np.exp(-2j*np.pi*np.outer(n_,n_)/N); xr=np.random.default_rng(5).normal(size=N)
ok('s2p6 F@x equals numpy fft to 1e-10', np.max(np.abs(F@xr-np.fft.fft(xr)))<1e-10)
ok('s2p6 F F^H = N I', np.allclose(F@F.conj().T, N*np.eye(N), atol=1e-9))
days=np.arange(30*365); ts=15+6*np.cos(2*np.pi*days/365.25)+2*np.cos(4*np.pi*days/365.25+1)+np.random.default_rng(2).normal(0,1.5,days.size)
X=np.fft.fft(ts); par=abs((ts**2).sum()-(np.abs(X)**2).sum()/ts.size)/(ts**2).sum()
ok('s2p6 Parseval rel err < 1e-10 on 30 years', par<1e-10, par)
fr=np.fft.rfftfreq(ts.size,d=1.0); pw=np.abs(np.fft.rfft(ts-ts.mean()))**2; df=fr[1]
k1=np.argmax(pw); ok('s2p6 biggest peak at 1/365.25 within one bin', abs(fr[k1]-1/365.25)<=df, (fr[k1],1/365.25,df))
pw2=pw.copy(); pw2[max(0,k1-2):k1+3]=0; k2=np.argmax(pw2); ok('s2p6 second peak at 2/365.25 within one bin', abs(fr[k2]-2/365.25)<=df, fr[k2])
Ns=32; xg=2*np.pi*np.arange(Ns)/Ns; f=np.sin(3*xg); kk=np.fft.fftfreq(Ns,1/Ns)
ds=np.real(np.fft.ifft(1j*kk*np.fft.fft(f))); es=np.max(np.abs(ds-3*np.cos(3*xg)))
h=2*np.pi/Ns; dfd=(np.roll(f,-1)-np.roll(f,1))/(2*h); efd=np.max(np.abs(dfd-3*np.cos(3*xg)))
ok('s2p6 spectral derivative error < 1e-12', es<1e-12, es)
ok('s2p6 central difference error > 0.1 on same grid', efd>0.1, efd)
alpha,t=0.1,0.5; u0=np.sin(xg)+0.5*np.sin(3*xg); ut=np.real(np.fft.ifft(np.fft.fft(u0)*np.exp(-alpha*kk**2*t)))
ex=np.exp(-alpha*t)*np.sin(xg)+0.5*np.exp(-9*alpha*t)*np.sin(3*xg)
ok('s2p6 spectral heat solution error < 1e-12', np.max(np.abs(ut-ex))<1e-12, np.max(np.abs(ut-ex)))
print('ALL ORACLES VERIFIED')
