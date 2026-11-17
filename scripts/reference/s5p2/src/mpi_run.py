import sys
import numpy as np

def split_indices(n, size, rank):
    return list(range(rank, n, size))

def main(n=40, seed=1, out="mpi_peaks.npy"):
    from mpi4py import MPI
    from src.ensemble import sample_params
    from src.seir_fast import run_one
    comm = MPI.COMM_WORLD; rank, size = comm.Get_rank(), comm.Get_size()
    params = sample_params(n, seed)
    mine = [(i, run_one(tuple(params[i]))[0]) for i in split_indices(n, size, rank)]
    parts = comm.gather(mine, root=0)
    if rank == 0:
        peaks = np.zeros(n)
        for part in parts:
            for i, p in part: peaks[i] = p
        np.save(out, peaks)

if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 40, 1, sys.argv[2] if len(sys.argv) > 2 else "mpi_peaks.npy")
