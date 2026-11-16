import numpy as np

def eofs(field):
    A = np.asarray(field, float); A = A - A.mean(axis=0); U, s, Vt = np.linalg.svd(A, full_matrices=False)
    return Vt, U * s, s**2 / np.sum(s**2)
