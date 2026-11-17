try:
    from src.truth import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.truth': raise
try:
    from src.dataset import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.dataset': raise
try:
    from src.surrogate import *  # noqa  (see dump_guide_tests.mjs)
except ModuleNotFoundError as e:
    if e.name != 'src.surrogate': raise
import numpy as np
from src.truth import peak_temp
from src.dataset import sample_lhs
from src.surrogate import fit_models, rmse

def test_truth_behaves_physically():
    assert peak_temp(0.5, 20) > peak_temp(0.5, 8)        # bigger hot spot, hotter centre
    assert peak_temp(0.9, 12) < peak_temp(0.3, 12)       # faster spreading, cooler centre

def test_sampling_covers_the_space():
    X = sample_lhs(200, seed=0)
    assert X.shape == (200, 2)
    assert 0.2 <= X[:, 0].min() and X[:, 0].max() <= 1.0
    assert set(np.unique(X[:, 1])) <= set(range(4, 31))
    assert len(np.unique(X[:, 1])) > 10                   # it really does spread out

def test_rmse():
    assert rmse(np.array([1.0, 2.0]), np.array([1.0, 4.0])) == np.sqrt(2.0)

from src.gp import fit_gp, coverage

def wiggle(x):
    return np.sin(3 * x).ravel() + 0.5 * x.ravel()

def test_gp_knows_where_it_is_unsure():
    rng = np.random.default_rng(0)
    X = np.sort(rng.uniform(0, 3, 15))[:, None]
    gp = fit_gp(X, wiggle(X))
    assert gp.predict(X, return_std=True)[1].max() < 0.05          # sure at the training points
    assert gp.predict(np.array([[6.0]]), return_std=True)[1][0] > 1.0   # unsure far from them
    Xt = rng.uniform(0, 3, 200)[:, None]
    assert coverage(gp, Xt, wiggle(Xt)) > 0.9                       # the 2-sigma band is honest
