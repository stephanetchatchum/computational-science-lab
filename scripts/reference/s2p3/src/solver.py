def _back(M, n):
    x = [0.0] * n
    for r in range(n - 1, -1, -1): x[r] = (M[r][n] - sum(M[r][k] * x[k] for k in range(r + 1, n))) / M[r][r]
    return x

def gaussian_eliminate(A, b):
    M = [row[:] + [bi] for row, bi in zip(A, b)]; n = len(M)
    for c in range(n - 1):
        for r in range(c + 1, n):
            f = M[r][c] / M[c][c]
            for k in range(c, n + 1): M[r][k] -= f * M[c][k]
    return _back(M, n)

def gaussian_pivoted(A, b):
    M = [row[:] + [bi] for row, bi in zip(A, b)]; n = len(M)
    for c in range(n - 1):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        if p != c: M[c], M[p] = M[p], M[c]
        for r in range(c + 1, n):
            f = M[r][c] / M[c][c]
            for k in range(c, n + 1): M[r][k] -= f * M[c][k]
    return _back(M, n)

def lu_decompose(A):
    n = len(A); L = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]; U = [row[:] for row in A]
    for c in range(n - 1):
        for r in range(c + 1, n):
            f = U[r][c] / U[c][c]; L[r][c] = f
            for k in range(c, n): U[r][k] -= f * U[c][k]
    return L, U

def count_flops(n):
    count = 0
    for c in range(n - 1):
        for r in range(c + 1, n):
            for k in range(c, n + 1): count += 1
    return count

def lu_solve(L, U, b):
    n = len(b); y = [0.0] * n
    for i in range(n): y[i] = b[i] - sum(L[i][k] * y[k] for k in range(i))
    x = [0.0] * n
    for i in range(n - 1, -1, -1): x[i] = (y[i] - sum(U[i][k] * x[k] for k in range(i + 1, n))) / U[i][i]
    return x

def elimination_steps(A, b):
    M = [row[:] + [bi] for row, bi in zip(A, b)]; n = len(M); yield ([r[:] for r in M], "start")
    for c in range(n - 1):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        if p != c: M[c], M[p] = M[p], M[c]; yield ([r[:] for r in M], f"swap R{c + 1} and R{p + 1}")
        for r in range(c + 1, n):
            f = M[r][c] / M[c][c]; yield ([row[:] for row in M], f"R{r + 1} = R{r + 1} - {f:.3g} * R{c + 1}")
            for k in range(c, n + 1): M[r][k] -= f * M[c][k]
