import { useEffect, useRef, useState } from 'react';
import { buildViz, VIZ } from '../content/legacy/viz.js';
import '../lab/newWidgets';
import { useApp } from '../state/AppState';
import { Md } from './Markup';

/** Mounts one canvas widget from the original engine and tears it down on unmount. */
export function VizWidget({ name, caption, onInteract }: { name: string; caption?: string | null; onInteract?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const { state } = useApp();
  const [err, setErr] = useState<string | null>(null);
  const cb = useRef(onInteract); cb.current = onInteract;
  useEffect(() => {
    const el = host.current; if (!el) return;
    let root: ReturnType<typeof buildViz> | undefined;
    try { root = buildViz(name, el); if (!root) setErr(`Unknown widget "${name}".`); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    const mark = () => cb.current?.();
    el.addEventListener('input', mark); el.addEventListener('click', mark); el.addEventListener('pointerdown', mark);
    return () => { el.removeEventListener('input', mark); el.removeEventListener('click', mark); el.removeEventListener('pointerdown', mark); root?.__destroy?.(); el.innerHTML = ''; };
    // remount when motion preference changes so autoplay respects it
  }, [name, state.settings.reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="vizwrap">
      {err ? <div className="viz viz-err">This demo could not start: {err}</div> : <div ref={host} />}
      {caption !== null && <Md as="p" className="viz-cap" text={caption ?? VIZ[name]?.note ?? ''} />}
    </div>
  );
}
