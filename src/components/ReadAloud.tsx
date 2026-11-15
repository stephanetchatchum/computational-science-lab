import { useEffect, useState } from 'react';
import { useApp } from '../state/AppState';
import { pickVoice } from '../lib/reader';
/** Text-to-speech for one block of text (Web Speech API; hidden where unsupported). */
export function ReadAloud({ text, label = 'Listen' }: { text: string; label?: string }) {
  const { state } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => { if (supported && speaking) window.speechSynthesis.cancel(); }, [speaking, supported]);
  if (!supported) return null;
  const toggle = () => {
    const s = window.speechSynthesis;
    if (speaking) { s.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = state.settings.tts.rate;
    const v = pickVoice(state.settings.tts.voice); if (v) { u.voice = v; u.lang = v.lang; }
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    s.cancel(); s.speak(u); setSpeaking(true);
  };
  return <button type="button" className="btn small ghost" onClick={toggle} aria-pressed={speaking}>{speaking ? '■ Stop' : `▶ ${label}`}</button>;
}
