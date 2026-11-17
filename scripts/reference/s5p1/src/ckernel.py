import ctypes, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "force.dll" if sys.platform == "win32" else "force.so")

def build():
    subprocess.run(["gcc", "-O2", "-shared", "-fPIC", "-o", LIB, os.path.join(HERE, "force.c"), "-lm"], check=True)

def _lib():
    if not os.path.exists(LIB): build()
    lib = ctypes.CDLL(LIB)
    lib.accel.argtypes = [ctypes.c_int, ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double)]
    return lib

def acc_c(r, m, eps):
    r = np.ascontiguousarray(r, dtype=np.float64); m = np.ascontiguousarray(m, dtype=np.float64); a = np.zeros_like(r)
    p = lambda x: x.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
    _lib().accel(len(m), p(r), p(m), float(eps), p(a)); return a
