export interface VizCtx {
  ctx: CanvasRenderingContext2D; W: number; H: number; pad: { l: number; r: number; t: number; b: number };
  resize(): void; view(x0: number, x1: number, y0: number, y1: number, equal?: boolean): void;
  X(x: number): number; Y(y: number): number; invX(sx: number): number; invY(sy: number): number;
  bg(): void; grid(nx?: number, ny?: number): void; axes(lx?: string, ly?: string): void;
  ticks(fx?: ((v: number) => string) | false, fy?: (v: number) => string): void;
  path(pts: [number, number][], col: string, w?: number, glow?: number): void;
  dot(x: number, y: number, r: number, col: string, glow?: number): void;
  sdot(sx: number, sy: number, r: number, col: string, glow?: number): void;
  arrow(x0: number, y0: number, x1: number, y1: number, col: string, label?: string, glow?: boolean): void;
  txt(sx: number, sy: number, t: string, col?: string, size?: number, align?: CanvasTextAlign): void;
  bar(sx: number, sy: number, w: number, h: number, frac: number, col: string, label?: string): void;
  legend(items: [string, string][]): void; chip(sx: number, sy: number, t: string, col?: string): void;
  clip(x: number, y: number, w: number, h: number, fn: () => void): void;
  pads(l?: number | null, r?: number | null, t?: number | null, b?: number | null): { l: number; r: number; t: number; b: number };
  unpad(o: { l: number; r: number; t: number; b: number }): void;
}
export interface VizParam { k: string; label: string; min: number; max: number; val: number; step: number; unit?: string; fmt?: (v: number) => string }
export interface VizSpec {
  title: string; eq?: string; note?: string; h?: number; autoplay?: boolean; pointer?: any; stepBtn?: boolean; resetOnParam?: boolean;
  params?: VizParam[]; toggles?: { k: string; label: string; on?: boolean }[];
  init(P: any, c: VizCtx): any; step?(S: any, dt: number, P: any, c: VizCtx): void; draw(c: VizCtx, S: any, P: any): void;
  stats?(S: any, P: any): [string, string | number, string?][]; onParam?(S: any, P: any, c: VizCtx): void; onToggle?(S: any, P: any, c: VizCtx): void;
  stepOnce?(S: any, P: any, c: VizCtx): void; onResize?(S: any, P: any, c: VizCtx): void;
  [k: string]: any;
}
export const QC: Record<string, string>;
export const VIZ: Record<string, VizSpec>;
export function makeCtx(canvas: HTMLCanvasElement | any): VizCtx;
export function buildViz(name: string, host: HTMLElement): (HTMLElement & { __destroy?: () => void }) | undefined;
export function rk4(f: (y: number[]) => number[], y: number[], dt: number): number[];
export function fmtN(v: number, d?: number): string;
export function ESC(s: unknown): string;
export function ESCA(s: unknown): string;
export function fmt(s: unknown): string;
export function plain(s: unknown): string;
