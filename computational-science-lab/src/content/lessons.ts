/**
 * One lesson per lab widget. The widget, its equation, its note and the lab-section intro are the
 * original curriculum's own text; the question / prediction / recall card below are the only
 * new teaching text, and every answer here is checked against the widget's behaviour or standard theory.
 */
import { LAB, HERO_VIZ, STEP_VIZ } from './legacy/guideExtras.js';

export interface Lesson {
  id: string;
  question: string;
  predict: { prompt: string; options: string[]; answer: number; why: string };
  tryThis: string;
  recall: { prompt: string; answer: string };
}

export const LESSONS: Record<string, Lesson> = {
  vectors: { id: 'vectors', question: 'How can one arrow carry both a size and a direction?',
    predict: { prompt: 'The arrow points to (3, 4), so its length is 5. You drag it to (6, 8). Its length becomes…', options: ['5√2 ≈ 7.07', '10', '25'], answer: 1, why: '|v| = √(6² + 8²) = 10. Scaling both components by 2 scales the length by 2.' },
    tryThis: 'Drag the arrowhead to (6, 8), then to (−3, 4). Watch which numbers change sign and which do not.',
    recall: { prompt: 'Why is |v| = √(vₓ² + v_y²)?', answer: 'The components are the perpendicular legs of a right triangle whose hypotenuse is the arrow, so Pythagoras gives the length.' } },
  derivative: { id: 'derivative', question: 'What does a computer actually compute when it "differentiates"?',
    predict: { prompt: 'Using the forward difference [f(x+h) − f(x)]/h, you halve h. The error in the slope roughly…', options: ['halves', 'quarters', 'stays the same'], answer: 0, why: 'Taylor: f(x+h) = f + h·f′ + h²/2·f″ + …, so the forward difference equals f′ + (h/2)·f″ + …: the error is proportional to h (first order).' },
    tryThis: 'Read the slope error at h = 1, 0.5, 0.25. Check that each halving roughly halves the error.',
    recall: { prompt: 'Why does the forward-difference error shrink like h, and why can h not be made arbitrarily small on a computer?', answer: 'Truncation error is (h/2)f″ from the Taylor series. For very small h, round-off error ≈ ε·|f|/h grows; the best h is about √ε.' } },
  integral: { id: 'integral', question: 'How do you add up something that changes continuously?',
    predict: { prompt: 'This widget samples each slice at its midpoint. Going from N = 8 to N = 16 slices, the error drops by about…', options: ['2×', '4×', '16×'], answer: 1, why: 'The midpoint rule is second order: error ∝ Δx², so halving Δx cuts the error by about 4.' },
    tryThis: 'Note the error at N = 8, 16 and 32. Compute the ratios.',
    recall: { prompt: 'What is the order of the midpoint rule, and what does it predict when N doubles?', answer: 'Second order (error ∝ Δx²); doubling N divides the error by about 4.' } },
  uncertainty: { id: 'uncertainty', question: 'If two measurements each have an error, how big is the error of their sum?',
    predict: { prompt: 'σₐ = 0.4 and σ_b = 0.3. The uncertainty of a + b is…', options: ['0.7', '0.5', '0.1'], answer: 1, why: 'Independent uncertainties add in quadrature: √(0.4² + 0.3²) = √0.25 = 0.5.' },
    tryThis: 'Set σₐ = 0.4, σ_b = 0.3 and compare the merged glow with the two inputs.',
    recall: { prompt: 'Why do independent uncertainties add in quadrature rather than linearly?', answer: 'Variances of independent quantities add: Var(a+b) = Var(a) + Var(b). The uncertainty is the square root of the variance.' } },
  cannon: { id: 'cannon', question: 'Why is 45° the best launch angle — and when is it not?',
    predict: { prompt: 'You turn the drag k up from 0. The angle that gives the longest range…', options: ['stays at 45°', 'drops below 45°', 'rises above 45°'], answer: 1, why: 'Drag punishes long flight times, so flatter, shorter flights lose less to drag and the best angle falls below 45°.' },
    tryThis: 'With k = 0, compare θ = 40°, 45°, 50°. Then set k = 0.15 and repeat.',
    recall: { prompt: 'Write the no-drag range formula and explain why θ = 45° maximises it.', answer: 'R = v₀² sin(2θ)/g; sin(2θ) is largest (= 1) when 2θ = 90°.' } },
  growth: { id: 'growth', question: 'Why can nothing grow exponentially forever?',
    predict: { prompt: 'With r = 0.15 and K = 1000, starting at 100, the logistic curve eventually…', options: ['levels off at K', 'overshoots K and oscillates', 'keeps climbing slowly past K'], answer: 0, why: 'For small r the increment r·P·(1 − P/K) shrinks smoothly to zero as P → K, so the curve flattens at K without overshoot.' },
    tryThis: 'Change K and watch where the blue curve flattens. Then push r up and compare how fast it gets there.',
    recall: { prompt: 'Which term creates the ceiling, and why does growth stop exactly at K?', answer: 'The bracket (1 − P/K): it goes to zero as P → K, so the growth increment vanishes there.' } },
  lln: { id: 'lln', question: 'How many measurements do you need before an average can be trusted?',
    predict: { prompt: 'To halve the typical error of the running average you need about … as many data points.', options: ['2×', '4×', '10×'], answer: 1, why: 'The spread of the mean is σ/√n, so halving it needs n to grow by 4.' },
    tryThis: 'Raise the noise σ and watch how long the running average takes to settle.',
    recall: { prompt: 'Why does the spread of the sample mean shrink like σ/√n?', answer: 'For n independent samples Var(mean) = σ²/n; its square root is σ/√n.' } },
  leastsq: { id: 'leastsq', question: 'Which straight line "best" fits scattered data — best by what measure?',
    predict: { prompt: 'Drag one point far above the others. The fitted line…', options: ['ignores it', 'tilts strongly toward it', 'moves only slightly'], answer: 1, why: 'Residuals are squared, so one large miss dominates the sum and pulls the line toward the outlier.' },
    tryThis: 'Drag a single point far away, then back. Watch the red residual bars.',
    recall: { prompt: 'Why is least squares sensitive to outliers?', answer: 'Each residual enters squared: a residual 10× bigger carries 100× the weight in the sum of squared errors.' } },
  rootfind: { id: 'rootfind', question: 'How do you find where a function is zero when algebra cannot solve it?',
    predict: { prompt: 'f(x) = x² − 2 on the bracket [0, 2]. After 10 bisection steps the bracket width is about…', options: ['0.2', '0.002', '2 × 10⁻¹⁰'], answer: 1, why: 'Each step halves the bracket: 2 / 2¹⁰ ≈ 0.00195.' },
    tryThis: 'Press Step with only Bisection on, then only Newton. Count steps to 6 correct digits.',
    recall: { prompt: 'How many bisection steps reach tolerance tol on [a, b]? Why is Newton faster near a simple root?', answer: 'About log₂((b − a)/tol). Newton converges quadratically: the error is roughly squared each step, so correct digits double.' } },
  eulerdrift: { id: 'eulerdrift', question: 'Can a simulation create energy out of nothing?',
    predict: { prompt: 'You halve Δt for forward Euler on the spring. The energy growth…', options: ['disappears', 'roughly halves in rate but never stops', 'doubles'], answer: 1, why: 'Each step multiplies the energy by 1 + (ωΔt)²; over a fixed time that grows like exp(ω²Δt·t), so a smaller Δt slows the growth but never removes it.' },
    tryThis: 'Compare the energy after one swing at Δt = 0.06 and 0.03.',
    recall: { prompt: 'Why does forward Euler increase the energy of a harmonic oscillator every step?', answer: 'Its amplification factor for y′ = iωy is |1 + iωΔt| = √(1 + ω²Δt²) > 1, so the amplitude (and energy) grows every step.' } },
  forces: { id: 'forces', question: 'Why does a falling object stop speeding up?',
    predict: { prompt: 'You double the mass m and keep drag k fixed. Terminal velocity…', options: ['doubles', 'halves', 'stays the same'], answer: 0, why: 'At terminal velocity m·g = k·v, so v_t = m·g/k, proportional to m.' },
    tryThis: 'Read the terminal speed at m = 2 and m = 4.',
    recall: { prompt: 'Derive terminal velocity for linear drag.', answer: 'Net force m·g − k·v = 0 gives v_t = m·g/k.' } },
  boids: { id: 'boids', question: 'Can ordered group motion emerge without a leader?',
    predict: { prompt: 'Keep separation and cohesion, switch alignment off. The birds…', options: ['still fly as one flock in one direction', 'form clumps with no shared heading', 'scatter completely'], answer: 1, why: 'Cohesion pulls them together and separation spaces them out, but without alignment nothing makes their headings agree.' },
    tryThis: 'Switch the three rules on and off one at a time.',
    recall: { prompt: 'Name the three boid rules and the cost of the brute-force neighbour search.', answer: 'Separation, alignment, cohesion. Checking every pair costs O(N²); a spatial hash brings it close to O(N).' } },
  montecarlo: { id: 'montecarlo', question: 'How can randomness compute a precise number like π?',
    predict: { prompt: 'To make the error 10× smaller you need about … more darts.', options: ['10×', '100×', '1000×'], answer: 1, why: 'The error scales as 1/√N, so a 10× smaller error needs N to grow by 10² = 100.' },
    tryThis: 'Watch the estimate early and late. Notice how slowly the last digit settles.',
    recall: { prompt: 'Why does Monte Carlo error fall like 1/√N, and when does Monte Carlo beat a grid?', answer: 'It is an average of N independent samples (σ/√N). Its rate does not depend on dimension, so it wins in high dimensions where grids need exponentially many points.' } },
  overfit: { id: 'overfit', question: 'Does a curve that fits the past better always predict better?',
    predict: { prompt: 'Raise the polynomial degree from 1 to 9. The held-out error…', options: ['keeps falling', 'falls, then rises', 'rises from the start'], answer: 1, why: 'Extra flexibility first captures real structure, then starts fitting noise in the training points, so held-out error turns upward.' },
    tryThis: 'Step the degree up one at a time and note where the held-out error is smallest.',
    recall: { prompt: 'Why can training error keep falling while held-out error rises?', answer: 'Training error always drops with more parameters; beyond the true structure the extra parameters fit noise that does not repeat in new data.' } },
  markov: { id: 'markov', question: 'Can random day-to-day weather have a predictable long-run climate?',
    predict: { prompt: 'Raise P(dry→dry) from 0.8 to 0.95. The long-run share of dry days…', options: ['rises', 'falls', 'is unchanged'], answer: 0, why: 'Dry days become more persistent, so the stationary distribution puts more weight on Dry.' },
    tryThis: 'Move the slider and wait for the crowd to settle onto the dashed line.',
    recall: { prompt: 'What equation defines the stationary distribution, and how can you compute it?', answer: 'πP = π with Σπ = 1: a left eigenvector of P with eigenvalue 1, found by power iteration or an eigen-solver.' } },
  integrators: { id: 'integrators', question: 'Why do some step-by-step methods stay accurate while others drift?',
    predict: { prompt: 'You halve Δt. RK4’s error shrinks by about…', options: ['2×', '4×', '16×'], answer: 2, why: 'RK4 is fourth order: error ∝ Δt⁴, and 2⁴ = 16.' },
    tryThis: 'Compare the two errors at Δt = 0.5 and 0.25.',
    recall: { prompt: 'What does “order p” mean for global error, and what factors do Euler and RK4 give when Δt halves?', answer: 'Global error ∝ Δtᵖ. Euler (p = 1): about 2×. RK4 (p = 4): about 16×.' } },
  orbit: { id: 'orbit', question: 'What stays constant while a planet moves on an ellipse?',
    predict: { prompt: 'Near the star (perihelion) the planet moves…', options: ['fastest', 'slowest', 'at the same speed as far away'], answer: 0, why: 'Angular momentum L = r × v is conserved, so a smaller r means a larger speed.' },
    tryThis: 'Lower v₀ to squash the ellipse and switch on Equal areas.',
    recall: { prompt: 'Which two quantities are conserved in a Kepler orbit, and what do they test in your code?', answer: 'Energy E = ½v² − GM/r and angular momentum L. If either drifts, the integrator (or the force) is wrong.' } },
  seir: { id: 'seir', question: 'What decides whether an outbreak takes off?',
    predict: { prompt: 'Set β = 0.08 and γ = 0.1. The outbreak…', options: ['grows to a large peak', 'dies out without a large peak', 'grows forever'], answer: 1, why: 'R₀ = β/γ = 0.8 < 1: each infection produces fewer than one new one.' },
    tryThis: 'Find the β where R₀ crosses 1 for γ = 0.1 and watch the curve change character.',
    recall: { prompt: 'Explain the R₀ > 1 threshold from the early epidemic.', answer: 'With S ≈ N, infected individuals create new infections at rate β and leave at rate γ, so numbers grow only if β/γ > 1.' } },
  predprey: { id: 'predprey', question: 'Why do predator and prey populations cycle?',
    predict: { prompt: 'Start the prey further from the balance point. The loop in the phase plot…', options: ['gets larger', 'gets smaller', 'stays the same size'], answer: 0, why: 'Lotka–Volterra orbits are closed curves around the centre; starting further away puts you on a larger one.' },
    tryThis: 'Try several starting prey values and compare the loops.',
    recall: { prompt: 'Where is the non-trivial fixed point of Lotka–Volterra, and why are the orbits closed?', answer: 'At (γ/δ, α/β). A conserved quantity V = δx − γ ln x + βy − α ln y stays constant along each orbit.' } },
  heatcfl: { id: 'heatcfl', question: 'Why does a correct heat-equation code suddenly explode?',
    predict: { prompt: 'Set r = 0.55, just above 0.5. The solution…', options: ['is slightly less accurate but smooth', 'grows a saw-tooth that blows up', 'freezes'], answer: 1, why: 'The highest-frequency mode has amplification 1 − 4r, which has magnitude above 1 when r > 0.5, so a saw-tooth grows every step.' },
    tryThis: 'Approach 0.5 from below, then cross it.',
    recall: { prompt: 'Using von Neumann analysis, why is explicit FTCS stable only for r ≤ 1/2?', answer: 'Substituting uⱼⁿ = gⁿe^{ikjΔx} gives g = 1 − 4r·sin²(kΔx/2); |g| ≤ 1 for all k requires r ≤ 1/2.' } },
  plume: { id: 'plume', question: 'How does a pollutant move down a river?',
    predict: { prompt: 'Set the flow v to 0 and keep D > 0. The pulse…', options: ['spreads out in place', 'travels without spreading', 'disappears at once'], answer: 0, why: 'With v = 0 only diffusion acts: the centre stays put while the variance grows like 2Dt.' },
    tryThis: 'Try v = 0, then D = 0, then both on.',
    recall: { prompt: 'What do advection and diffusion each do to the centre and the width of a pulse?', answer: 'Advection moves the centre at v·t; diffusion grows the variance as 2D·t.' } },
  wave: { id: 'wave', question: 'How can an echo measure a depth you cannot see?',
    predict: { prompt: 'Move the boundary deeper. The echo arrives…', options: ['later', 'earlier', 'at the same time'], answer: 0, why: 'The two-way travel time is Δt = 2(d − xₛ)/c, which grows with d.' },
    tryThis: 'Move the boundary and read the gap between the two arrivals in the lower trace.',
    recall: { prompt: 'Derive the echo delay for a source at xₛ and a boundary at d.', answer: 'The pulse travels d − xₛ to the boundary and the same distance back at speed c: Δt = 2(d − xₛ)/c.' } },
  gauss: { id: 'gauss', question: 'What does “solving a linear system” actually do?',
    predict: { prompt: 'For an n × n system, elimination costs roughly…', options: ['n² operations', 'n³ operations', '2ⁿ operations'], answer: 1, why: 'Each of n pivots updates up to n² entries: about 2n³/3 floating-point operations.' },
    tryThis: 'Step through and count how many entries each pivot touches.',
    recall: { prompt: 'Why is elimination O(n³), and why does reusing an LU factorisation cost only O(n²) per new right-hand side?', answer: 'Factorising touches O(n²) entries for each of n pivots. With L and U stored, a new right-hand side needs only forward and back substitution, O(n²).' } },
  power: { id: 'power', question: 'How do you rank nodes by importance in a network?',
    predict: { prompt: 'All scores start equal. After power iteration settles, the highest score belongs to…', options: ['A', 'C', 'E'], answer: 1, why: 'C is linked to A, B and D, and its neighbours are themselves well connected, so it dominates the eigenvector.' },
    tryThis: 'Press Step until the change readout is below 10⁻⁴.',
    recall: { prompt: 'What does power iteration converge to, and what controls its speed?', answer: 'The dominant eigenvector; the error shrinks by about |λ₂/λ₁| each iteration.' } },
  rocket: { id: 'rocket', question: 'Why does a rocket with constant thrust accelerate harder over time?',
    predict: { prompt: 'During the burn, with thrust constant, the acceleration…', options: ['stays constant', 'increases', 'decreases'], answer: 1, why: 'a = (T − m·g − D)/m and m falls as fuel burns, so the same thrust accelerates less mass.' },
    tryThis: 'Watch the mass and acceleration bars, then change the burn rate.',
    recall: { prompt: 'State the ideal rocket equation and what each symbol means.', answer: 'Δv = vₑ·ln(m₀/m₁): exhaust speed times the log of initial over final mass (no gravity or drag losses).' } },
  energybars: { id: 'energybars', question: 'Where does a pendulum’s speed go at the top of its swing?',
    predict: { prompt: 'At the lowest point of the swing, the energy is…', options: ['all kinetic', 'all potential', 'half and half'], answer: 0, why: 'Potential energy is measured from the bottom, so there PE = 0 and everything is kinetic.' },
    tryThis: 'Change the start angle and watch the total bar.',
    recall: { prompt: 'Write KE and PE for a pendulum and explain how total-energy drift detects integrator bugs.', answer: 'KE = ½mL²θ̇², PE = mgL(1 − cos θ). Their sum must stay constant; drift means the time-stepping is adding or removing energy.' } },
  stability: { id: 'stability', question: 'Why does RK4 explode on a stiff problem when backward Euler does not?',
    predict: { prompt: 'For dy/dt = −50(y − cos t) with Δt = 0.1, z = λΔt = −5. Which method is stable?', options: ['Forward Euler and RK4', 'Only RK4', 'Only backward Euler'], answer: 2, why: 'Euler needs z in [−2, 0] on the real axis and RK4 about [−2.79, 0]; backward Euler, R(z) = 1/(1 − z), is stable for every Re z ≤ 0.' },
    tryThis: 'Slide Δt from 0.03 up to 0.1 and watch the white dot leave the orange and blue regions.',
    recall: { prompt: 'Give R(z) for forward Euler, backward Euler and RK4. What is A-stability?', answer: '1 + z; 1/(1 − z); 1 + z + z²/2 + z³/6 + z⁴/24. A-stable means |R(z)| ≤ 1 on the whole left half-plane (backward Euler is; explicit methods are not).' } },
  fft: { id: 'fft', question: 'How do you see which frequencies hide inside a noisy signal?',
    predict: { prompt: 'A sine of 8 Hz sampled at 128 Hz for 1 s (N = 128). The spectrum peaks at…', options: ['8 Hz, in a single bin', 'many bins equally', '128 Hz'], answer: 0, why: 'The bin spacing is f_s/N = 1 Hz, and 8 Hz is exactly bin 8, so all its energy lands there.' },
    tryThis: 'Set f₁ = 8, then 8.5. Then raise the noise and compare the peak with the floor.',
    recall: { prompt: 'What sets the frequency resolution and the highest frequency a DFT can represent?', answer: 'Resolution Δf = f_s/N = 1/T (record length). The Nyquist frequency f_s/2 is the highest unaliased frequency.' } },
  convergence: { id: 'convergence', question: 'How do you prove your code converges at the rate theory promises?',
    predict: { prompt: 'Central difference: halve h. The error shrinks by about…', options: ['2×', '4×', '16×'], answer: 1, why: 'The central difference is second order (error ∝ h²): the log–log slope is 2.' },
    tryThis: 'Cycle through the six schemes and compare the measured slope with theory. For the difference formulas, look at the smallest h.',
    recall: { prompt: 'How do you estimate the order p from two step sizes, and why does the error rise again at very small h?', answer: 'p = log(e₁/e₂)/log(h₁/h₂). At tiny h round-off error (≈ ε/h) dominates truncation error.' } },
};

export interface LabSection { title: string; intro: string; items: { widget: string; project: string }[] }

/** Original lab sections plus the audit's new numerical-analysis section. */
export function labSections(projectExists: (id: string) => boolean): LabSection[] {
  const orig: LabSection[] = LAB.map(([title, intro, items]) => ({ title, intro, items: items.map(([widget, project]) => ({ widget, project })) }));
  orig.push({
    title: 'Numerical analysis: stability, spectra and convergence',
    intro: 'Three widgets the scientific audit found missing. Where is a method stable? Which frequencies are in a signal? Does the error fall at the rate the theory promises? Every later solver depends on being able to answer these.',
    items: [
      { widget: 'stability', project: 's3p1' },
      { widget: 'fft', project: projectExists('s2p6') ? 's2p6' : 's2p3' },
      { widget: 'convergence', project: projectExists('s1p6') ? 's1p6' : 's1p2' },
    ],
  });
  return orig;
}

/** Where a widget appears inside project guides ("Play with the idea first" or inside a step). */
export function widgetUses(widget: string): { project: string; step: number | null; caption: string }[] {
  const out: { project: string; step: number | null; caption: string }[] = [];
  for (const [pid, [w, cap]] of Object.entries(HERO_VIZ)) if (w === widget) out.push({ project: pid, step: null, caption: cap });
  for (const [pid, steps] of Object.entries(STEP_VIZ)) for (const [i, [w, cap]] of Object.entries(steps)) if (w === widget) out.push({ project: pid, step: Number(i), caption: cap });
  return out;
}
