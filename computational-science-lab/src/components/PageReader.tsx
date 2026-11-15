import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../state/AppState';

/**
 * Read-aloud bar for the whole page (successor of the original HTML reader):
 * the line being read is highlighted and scrolled into view; Space pauses, ←/→ move a line,
 * Esc stops, double-click any line to start there, "Skip code" leaves out code blocks.
 */
const SELECTOR = 'main h1, main h2, main h3, main p, main li, main dt, main dd, main .see, main .hint, main .question, main pre.code';
const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function PageReader() {
  const { state, setSettings } = useApp();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const items = useRef<HTMLElement[]>([]);
  const playingRef = useRef(false);
  const skipCode = state.settings.tts.skipCode;

  const collect = useCallback(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(el => {
      if (el.closest('.side, .topbar, .capture, .reader-bar, .viz')) return false;
      if (el.matches('li, p') && el.querySelector('p, li')) return false;      // avoid reading containers twice
      if (skipCode && el.matches('pre.code')) return false;
      return (el.innerText || '').trim().length > 1 && el.offsetParent !== null;
    });
    items.current = all; return all;
  }, [skipCode]);

  const clear = () => document.querySelectorAll('.reading').forEach(e => e.classList.remove('reading'));
  const stop = useCallback(() => { playingRef.current = false; setPlaying(false); if (supported()) window.speechSynthesis.cancel(); clear(); }, []);

  const speakFrom = useCallback((start: number) => {
    if (!supported()) return;
    const list = items.current.length ? items.current : collect();
    if (start >= list.length) { stop(); return; }
    const el = list[start]; setIdx(start); clear(); el.classList.add('reading');
    el.scrollIntoView({ block: 'center', behavior: state.settings.reducedMotion ? 'auto' : 'smooth' });
    const text = el.matches('pre.code') ? 'Code block. ' + (el.innerText.split('\n').length) + ' lines.' : el.innerText;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = state.settings.tts.rate;
    const v = window.speechSynthesis.getVoices().find(v => v.name === state.settings.tts.voice); if (v) u.voice = v;
    u.onend = () => { if (playingRef.current) speakFrom(start + 1); };
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    playingRef.current = true; setPlaying(true);
  }, [collect, state.settings.tts.rate, state.settings.tts.voice, state.settings.reducedMotion, stop]);

  useEffect(() => { stop(); items.current = []; setIdx(0); }, [loc.pathname, loc.search, stop]);
  useEffect(() => { items.current = []; }, [skipCode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], button')) return;
      if (e.key === ' ') { e.preventDefault(); playing ? stop() : speakFrom(idx); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); collect(); speakFrom(Math.min(idx + 1, items.current.length - 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); collect(); speakFrom(Math.max(idx - 1, 0)); }
      else if (e.key === 'Escape') stop();
    };
    const onDbl = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(SELECTOR) as HTMLElement | null; if (!el) return;
      const list = collect(); const i = list.indexOf(el); if (i >= 0) speakFrom(i);
    };
    window.addEventListener('keydown', onKey); document.addEventListener('dblclick', onDbl);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('dblclick', onDbl); };
  }, [open, playing, idx, collect, speakFrom, stop]);

  if (!supported()) return null;
  const scale = state.settings.textScale;
  if (!open) return <button className="btn small ghost" onClick={() => setOpen(true)} title="Read this page aloud">▶ Listen</button>;
  return (
    <div className="reader-bar" role="toolbar" aria-label="Read aloud controls">
      <button className="btn small primary" onClick={() => (playing ? stop() : (collect(), speakFrom(idx)))}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
      <button className="btn small" onClick={() => { collect(); speakFrom(Math.max(idx - 1, 0)); }} aria-label="Previous line">⏮</button>
      <button className="btn small" onClick={() => { collect(); speakFrom(Math.min(idx + 1, items.current.length - 1)); }} aria-label="Next line">⏭</button>
      <button className={`btn small ${skipCode ? 'primary' : ''}`} onClick={() => setSettings({ tts: { ...state.settings.tts, skipCode: !skipCode } })} aria-pressed={skipCode}>Skip code</button>
      <button className="btn small" onClick={() => setSettings({ textScale: Math.max(0.85, +(scale - 0.05).toFixed(2)) })} aria-label="Smaller text">A−</button>
      <button className="btn small" onClick={() => setSettings({ textScale: Math.min(1.4, +(scale + 0.05).toFixed(2)) })} aria-label="Bigger text">A+</button>
      <span className="faint" style={{ fontSize: '.75rem' }}>Space · ← → · Esc · double-click a line</span>
      <button className="btn small ghost" onClick={() => { stop(); setOpen(false); }} aria-label="Close reader">✕</button>
    </div>
  );
}
