import collections, heapq
import numpy as np

def degree(A):
    return A.sum(axis=1)

def power_iteration(A, steps=200):
    v = np.ones(len(A))
    for _ in range(steps): v = A @ v; v = v / np.linalg.norm(v)
    return v

def walker_visits(A, steps, seed=None):
    rng = np.random.default_rng(seed); node = 0; c = np.zeros(len(A))
    for _ in range(steps): node = rng.choice(np.flatnonzero(A[node])); c[node] += 1
    return c / c.sum()

def knn_adjacency(towns, k=3):
    n = len(towns); A = np.zeros((n, n))
    for i, t in enumerate(towns):
        d = sorted((np.hypot(t[2] - u[2], t[1] - u[1]), j) for j, u in enumerate(towns) if j != i)
        for _, j in d[:k]: A[i][j] = A[j][i] = 1
    return A

def bfs_path(adj, start, goal):
    q = collections.deque([start]); prev = {start: None}
    while q:
        u = q.popleft()
        if u == goal: break
        for v in adj[u]:
            if v not in prev: prev[v] = u; q.append(v)
    path = [goal]
    while prev[path[-1]] is not None: path.append(prev[path[-1]])
    return path[::-1]

def dijkstra(adj_w, start, goal):
    dist = {start: 0}; prev = {start: None}; done = set(); pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if u in done: continue
        done.add(u)
        if u == goal: break
        for v, w in adj_w[u].items():
            if d + w < dist.get(v, float("inf")): dist[v] = d + w; prev[v] = u; heapq.heappush(pq, (d + w, v))
    path = [goal]
    while prev[path[-1]] is not None: path.append(prev[path[-1]])
    return dist[goal], path[::-1]
