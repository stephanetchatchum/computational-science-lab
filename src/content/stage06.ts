/**
 * Stage 6: a visual for every build step, the audit items (E1 for s6p1, A1 and C5 for s6p2) and one A4 correction.
 * The s6p2 tests run against scripts/reference/s6p2 (SALib), like every earlier stage.
 * s6p1 and s6p3 are open-ended by design: the learner writes the checks for their own paper or question.
 */
import type { GuideStep } from './legacy/curriculum.js';
import type { AddedStep, GuidePatch, Visual } from './stage01';
import type { Guide } from './legacy/curriculum.js';

const S = (t: string, why: string, d: string[], run: string | null, see: string | null, hint: string | null, code: string | null = null): GuideStep =>
  ({ t, why, do: d, run, see, hint, code });

const WIN: Visual = { widget: 'win2d', caption: 'The empty window you are about to open: a dark screen and a green dot. Nothing else yet.' };

export const STEP_VISUALS: Record<string, Record<number, Visual>> = {
  s6p1: {
    0: { widget: 'reproduce', caption: 'What a good target looks like: one specific curve you can try to match. Here a made-up paper; yours comes from the literature.', preset: { lg: -4, dt: 0.1 } },
    1: { widget: 'reproduce', caption: 'Why the parameter table matters. Two values this “paper” never printed are on the sliders: each one moves a different part of the curve.' },
    3: { widget: 'reproduce', caption: 'Your implementation against the target. Green numbers mean within 2% and one day.', preset: { lg: -4, dt: 1 } },
    4: WIN,
    5: { widget: 'reproduce', caption: 'The side-by-side view in miniature: their curve dashed, yours live.' },
    6: { widget: 'reproduce', caption: 'Chasing the difference. A timing shift with almost the same height points at the starting condition; a height change points at the integrator. Name the suspect with evidence.', preset: { lg: -2, dt: 0.1 } },
  },
  s6p2: {
    0: { widget: 'ishigami', caption: 'Your validation case. Each panel is the output against one input: a clear trend is a large first-order index, and x₃ matters only by interacting with x₁.' },
    1: { widget: 'sobolbars', lead: true, caption: 'What your runner returns, computed live here on the same SEIR and ranges.', preset: { n: 128 } },
    2: { widget: 'sobolbars', caption: 'The ranking for your model. More samples steady the bars; the order does not change.', preset: { n: 512 } },
    3: WIN,
    4: { widget: 'dials', lead: true, caption: 'Your instrument panel. Drag γ end to end, then i₀: the needle tells you the ranking before any table does.' },
    5: { widget: 'sobolbars', caption: 'The evidence your recommendation cites: the input with the tallest green bar is the one worth measuring better.' },
  },
  s6p3: {
    0: { widget: 'rainshift', caption: 'A question narrow enough to answer: one number (days per decade) from one place. Made-up data.' },
    1: { widget: 'rainshift', caption: 'Decide before you look: the verdict rule “shows only if the interval excludes zero” is part of the proposal, not the results.', preset: { tr: 2 } },
    2: { widget: 'rainshift', caption: 'What cutting costs: with 10 years instead of 33 the interval widens and the same true trend may only be “suggested”.', preset: { yrs: 10 } },
    3: { widget: 'rainshift', caption: 'A check with a known answer: set the true trend to 0. Over many runs the interval contains zero, which is exactly what a test should confirm.', preset: { tr: 0 } },
    4: WIN,
    5: { widget: 'rainshift', lead: true, caption: 'Evidence accumulating in its natural order. The last frame is the headline result, and every frame before it is a real partial result.' },
    6: { widget: 'rainshift', caption: 'Shows or suggests? A small true trend with noisy years can leave zero inside the interval. Report that honestly.', preset: { tr: 2, yrs: 33 } },
  },
};

const OPT_S6P1 = 'Optional (audit E1): the live side-by-side window. The numeric comparison in the next steps carries the result; the window is encouragement.';
export const PATCHES: Record<string, GuidePatch> = {
  s6p1: { steps: { 4: { item: 'E1', optional: OPT_S6P1 }, 5: { item: 'E1', optional: OPT_S6P1 } } },
  s6p2: {
    steps: {
      2: { item: 'A4', see: 'Four rows. With these ranges **gamma dominates** (S1 near 0.69), then beta (about 0.21), then sigma (about 0.09), and the starting infected fraction is essentially **0.00**. The first-order indices sum to about **0.99**, so the inputs hardly interact. Your exact numbers depend on your ranges.' },
    },
  },
};

const C5_TEST = `import numpy as np
from src.sensitivity import propagate, peak_fraction, PROBLEM

def stand_in(n=2000, seed=1):
    rng = np.random.default_rng(seed)
    g = rng.normal(0.145, 0.01, n); b = 3.0 * g + rng.normal(0, 0.008, n)   # beta and gamma move together
    return np.column_stack([b, rng.uniform(0.1, 0.33, n), g, rng.uniform(0.0005, 0.005, n)])

def test_identical_rows_give_zero_width():
    lo, mid, hi = propagate(np.tile([0.5, 0.2, 0.12, 0.001], (50, 1)))
    assert lo == mid == hi

def test_posterior_band_is_narrower_than_the_box():
    rng = np.random.default_rng(2)
    lo_b, hi_b = np.array(PROBLEM["bounds"]).T
    box = propagate(lo_b + (hi_b - lo_b) * rng.random((2000, 4)))
    post = propagate(stand_in())
    assert post[2] - post[0] < 0.5 * (box[2] - box[0])

def test_sigma_dominates_once_beta_and_gamma_are_known():
    X = stand_in(); fixed = X.copy(); fixed[:, 1] = 0.215
    assert peak_fraction(fixed).var() < 0.2 * peak_fraction(X).var()`;

export const ADDED_STEPS: Record<string, AddedStep[]> = {
  s6p2: [
    { key: 'a:C5-posterior', item: 'C5', after: 2, visual: { widget: 'postbox', caption: 'The box allows every corner; the data do not. Right: the band of the peak each produces. Fix σ to see what uncertainty is left once β and γ are known.' },
      step: S('Use what the data taught you: inputs from the posterior',
        'The box treats every corner as equally likely, including combinations of β and γ the epidemic data ruled out. Your Bayesian project (s5p7) already measured what the data allow. Here you use it.',
        ['Copy **posterior.npz** from your Bayesian project folder into this folder. It holds the kept samples of β and γ.',
         'In **src/sensitivity.py** write {{propagate(X)}}: run {{peak_fraction(X)}} and return the 2.5th, 50th and 97.5th percentiles as three plain floats ({{numpy.percentile(..., [2.5, 50, 97.5])}}).',
         'Write {{posterior_inputs(n, seed=0, path="posterior.npz")}}: load the file, draw {{n}} row numbers with {{rng.integers(0, len(beta), n)}}, and take β and γ from the SAME rows, which keeps them moving together. Draw σ and i₀ uniformly from their ranges in {{PROBLEM}}. Return four columns in the order of {{PROBLEM["names"]}}.',
         'Add the tests below to **tests/test_sensitivity.py**. They use a stand-in posterior shaped like the real one, so they pass before you copy the file.',
         'Then compare for your report: {{propagate(posterior_inputs(2000))}} against {{propagate}} of 2000 uniform samples from the box.',
         'Do not feed posterior samples into {{run_sobol}}. Sobol indices assume independent inputs, and here β and γ are tied together (correlation about 0.97). Propagating the samples is the correct use; the third test asks the sensitivity question a different way, by fixing σ.'],
        'python -m pytest -q tests/test_sensitivity.py',
        '**5 passed**. With the stand-in, the 95% band of the peak is about **0.12 – 0.21** from the posterior against **0.06 – 0.42** from the box: roughly four times narrower. Fixing σ removes about **90%** of what is left. Once the data pin down β and γ, the incubation rate, which case counts never measured, is the biggest remaining uncertainty. Put that in your recommendation next to the box result.',
        'If {{lo == mid == hi}} fails on identical rows, return {{float(...)}} values. If posterior.npz is missing, the tests still pass; only your own comparison needs the file.',
        C5_TEST) },
  ],
};

export const NEW_GUIDES: Record<string, Guide> = {};
export const NEW_STEP_VISUALS: Record<string, Record<number, Visual>> = {};
