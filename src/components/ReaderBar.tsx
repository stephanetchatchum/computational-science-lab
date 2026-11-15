import { useEffect, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { reader, pickVoice } from '../lib/reader';
import { useApp } from '../state/AppState';

/** The original bottom reader bar: Listen, previous/next line, stop, status, speed, voice, Skip code, A−/A+. */
export function ReaderBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setSettings } = useApp();
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const loc = useLocation();
  const tts = state.settings.tts;
  useEffect(() => reader.on(force), []);
  useEffect(() => { reader.reset(); }, [loc.pathname, loc.search]);
  useEffect(() => {
    reader.rate = tts.rate; reader.skipCode = tts.skipCode;
    reader.voiceURI = tts.voice ?? '';
  }, [tts.rate, tts.skipCode, tts.voice]);
  useEffect(() => {
    if (!reader.supported) return;
    const load = () => {
      const vs = reader.voices(); setVoices(vs);
      const chosen = pickVoice(tts.voice); if (chosen && chosen.voiceURI !== tts.voice) setSettings({ tts: { ...tts, voice: chosen.voiceURI } });
    };
    load(); window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (t.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === ' ' && !t.closest('button')) { e.preventDefault(); reader.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); reader.jump(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); reader.jump(-1); }
      else if (e.key === 'Escape') reader.stop();
    };
    const onDbl = (e: MouseEvent) => { const el = (e.target as HTMLElement).closest('main h1,main h2,main h3,main p,main li,main dt,main dd,main .see,main .hint,main [data-tts]') as HTMLElement | null; if (el && !el.closest('.viz')) { window.getSelection()?.removeAllRanges(); reader.fromElement(el); } };
    window.addEventListener('keydown', onKey); document.addEventListener('dblclick', onDbl);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('dblclick', onDbl); };
  }, [open]);
  if (!open) return null;
  if (!reader.supported) return <div className="reader-bar" role="status">This browser cannot read aloud. Try Microsoft Edge or Google Chrome. <button className="rbtn" onClick={onClose}>✕</button></div>;
  const scale = state.settings.textScale;
  return (
    <div className="reader-bar" role="toolbar" aria-label="Read aloud controls">
      <button className="rbtn primary" onClick={() => reader.toggle()} title="Play / pause (Space)">{reader.playing ? '❚❚ Pause' : reader.idx > 0 ? '▶ Resume' : '▶ Listen'}</button>
      <button className="rbtn" onClick={() => reader.jump(-1)} title="Previous line (←)" aria-label="Previous line">⏮</button>
      <button className="rbtn" onClick={() => reader.jump(1)} title="Next line (→)" aria-label="Next line">⏭</button>
      <button className="rbtn" onClick={() => reader.stop()} title="Stop (Esc)" aria-label="Stop">⏹</button>
      <span className="rstatus">{reader.status()}</span>
      <span className="rsep" />
      <select aria-label="Speed" value={tts.rate} onChange={e => { setSettings({ tts: { ...tts, rate: Number(e.target.value) } }); reader.rate = Number(e.target.value); reader.refreshIfPlaying(); }}>
        {[0.8, 1, 1.15, 1.3, 1.5, 1.75].map(r => <option key={r} value={r}>{r}×</option>)}
      </select>
      <select aria-label="Voice" value={tts.voice ?? ''} onChange={e => { setSettings({ tts: { ...tts, voice: e.target.value } }); reader.voiceURI = e.target.value; reader.refreshIfPlaying(); }}>
        {voices.length ? voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>) : <option value="">Default voice</option>}
      </select>
      <button className={`rbtn ${tts.skipCode ? 'on' : ''}`} aria-pressed={tts.skipCode} onClick={() => { setSettings({ tts: { ...tts, skipCode: !tts.skipCode } }); reader.skipCode = !tts.skipCode; reader.refreshIfPlaying(); }} title="Skip code and commands while listening">Skip code</button>
      <span className="rsep" />
      <button className="rbtn" onClick={() => setSettings({ textScale: Math.max(0.85, +(scale - 0.05).toFixed(2)) })} aria-label="Smaller text">A−</button>
      <button className="rbtn" onClick={() => setSettings({ textScale: Math.min(1.5, +(scale + 0.05).toFixed(2)) })} aria-label="Bigger text">A+</button>
      <button className="rbtn" onClick={() => { reader.stop(); onClose(); }} aria-label="Close reader">✕</button>
    </div>
  );
}
