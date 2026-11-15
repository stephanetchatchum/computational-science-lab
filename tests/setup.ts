import '@testing-library/jest-dom/vitest';
// jsdom has no canvas, ResizeObserver or IntersectionObserver; widgets must degrade gracefully.
class RO { observe() {} unobserve() {} disconnect() {} }
(globalThis as any).ResizeObserver ??= RO;
(globalThis as any).IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {};
Element.prototype.scrollIntoView = function () {};
// minimal 2D context so widgets mount under jsdom
const noop = () => {};
(HTMLCanvasElement.prototype as any).getContext = function () {
  return new Proxy({}, {
    get: (t: any, k) => (k in t ? t[k] : k === 'measureText' ? () => ({ width: 10 }) : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop: noop }) : noop),
    set: (t: any, k, v) => { t[k] = v; return true; },
  });
};
(globalThis as any).requestAnimationFrame ??= (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
(globalThis as any).cancelAnimationFrame ??= (id: number) => clearTimeout(id);
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, onchange: null, dispatchEvent: () => false })) as any;
