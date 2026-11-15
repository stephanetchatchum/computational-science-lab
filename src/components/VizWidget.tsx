import { useEffect, useRef, useState } from 'react';
import { buildViz, VIZ } from '../content/legacy/viz.js';
import '../lab/newWidgets';
import '../lab/stepWidgets';
import '../lab/stepWidgets2';
import '../lab/stepWidgets3';
import { useApp } from '../state/AppState';
import { Md } from './Markup';
import type { Visual } from '../content/stages';

/** Register a copy of a widget whose sliders start at preset values. */
export function presetName(name: string, preset?: Record<string, number>) {
  if (!preset || !VIZ[name]) return name;
  const key = `${name}~${Object.entries(preset).map(([k, v]) => k + v).join('_')}`;
  if (!VIZ[key]) VIZ[key] = { ...VIZ[name], params: (VIZ[name].params ?? []).map(p => (p.k in preset ? { ...p, val: preset[p.k] } : p)) };
  return key;
}

/** Mounts one canvas widget from the original engine and tears it down on unmount. */
export function VizWidget({ name, caption, preset, onInteract }: { name: string; caption?: string | null; preset?: Record<string, number>; onInteract?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const { state } = useApp();
  const [err, setErr] = useState<string | null>(null);
  const cb = useRef(onInteract); cb.current = onInteract;
  const key = presetName(name, preset);
  useEffect(() => {
    const el = host.current; if (!el) return;
    let root: ReturnType<typeof buildViz> | undefined;
    try { root = buildViz(key, el); if (!root) setErr(`Unknown widget "${name}".`); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    const mark = () => cb.current?.();
    el.addEventListener('input', mark); el.addEventListener('click', mark); el.addEventListener('pointerdown', mark);
    return () => { el.removeEventListener('input', mark); el.removeEventListener('click', mark); el.removeEventListener('pointerdown', mark); root?.__destroy?.(); el.innerHTML = ''; };
  }, [key, state.settings.reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="vizwrap no-tts-wrap">
      {err ? <div className="viz viz-err">This demo could not start: {err}</div> : <div ref={host} className="no-tts" />}
      {caption !== null && <Md as="p" className="viz-cap" text={caption ?? VIZ[name]?.note ?? ''} />}
    </div>
  );
}

/** One or more visuals for a step: the first is shown, others behind small tabs. */
export function StepVisuals({ visuals }: { visuals: Visual[] }) {
  const [i, setI] = useState(0);
  if (!visuals.length) return null;
  const v = visuals[Math.min(i, visuals.length - 1)];
  return (
    <div className="step-visual">
      {visuals.length > 1 && <div className="vtabs" role="tablist">{visuals.map((x, k) => <button key={k} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{VIZ[x.widget]?.title?.split(':')[0] ?? x.widget}</button>)}</div>}
      <VizWidget key={v.widget + i} name={v.widget} caption={v.caption} preset={v.preset} />
    </div>
  );
}
