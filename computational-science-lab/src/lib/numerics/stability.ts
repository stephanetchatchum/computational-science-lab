/** Linear stability of one-step integrators applied to y' = λy.
 *  One step multiplies y by R(z) with z = λΔt; the method is stable where |R(z)| ≤ 1. */
export interface Complex { re: number; im: number }
const c = (re: number, im = 0): Complex => ({ re, im });
const add = (a: Complex, b: Complex) => c(a.re + b.re, a.im + b.im);
const mul = (a: Complex, b: Complex) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const scale = (a: Complex, s: number) => c(a.re * s, a.im * s);
const div = (a: Complex, b: Complex) => { const d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
export const cabs = (a: Complex) => Math.hypot(a.re, a.im);

export type MethodId = 'euler' | 'rk4' | 'beuler' | 'trap';
export const METHODS: Record<MethodId, { name: string; R: (z: Complex) => Complex; formula: string }> = {
  euler: { name: 'Forward Euler', formula: 'R(z) = 1 + z', R: z => add(c(1), z) },
  rk4: {
    name: 'RK4', formula: 'R(z) = 1 + z + z²/2 + z³/6 + z⁴/24',
    R: z => { const z2 = mul(z, z), z3 = mul(z2, z), z4 = mul(z3, z);
      return add(add(add(add(c(1), z), scale(z2, 1 / 2)), scale(z3, 1 / 6)), scale(z4, 1 / 24)); },
  },
  beuler: { name: 'Backward Euler', formula: 'R(z) = 1 / (1 − z)', R: z => div(c(1), add(c(1), scale(z, -1))) },
  trap: { name: 'Trapezoid (Crank–Nicolson)', formula: 'R(z) = (1 + z/2) / (1 − z/2)', R: z => div(add(c(1), scale(z, 0.5)), add(c(1), scale(z, -0.5))) },
};
export const amplification = (m: MethodId, z: Complex) => cabs(METHODS[m].R(z));
export const isStable = (m: MethodId, z: Complex, tol = 1e-12) => amplification(m, z) <= 1 + tol;

/** Most negative real x such that the whole interval [x, 0] is stable (bisection on the boundary). */
export function realAxisLimit(m: MethodId, far = -100): number {
  if (isStable(m, c(far))) return -Infinity; // stable along the whole negative axis examined
  let lo = far, hi = -1e-9;           // stable at hi, unstable at lo
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (isStable(m, c(mid))) hi = mid; else lo = mid; }
  return hi;
}
export { c as complex };
