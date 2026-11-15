/**
 * Read-aloud engine ported from the original HTML app: line highlight, word-by-word highlight
 * (CSS Custom Highlight API where supported), skip code, spoken versions of terminal commands,
 * double-click a line to start there, ←/→ to move by line.
 */
type Item = { el: HTMLElement; text: string; start: number; map: { text: string; nodes: { node: Text; off: number }[] } | null };
type Listener = () => void;

export function spokenCode(s: string) {
  return s.split('\n').map(l => l.trim()).filter(Boolean).map(l => l
    .replace(/\.venv/g, 'dot venv').replace(/\//g, ' slash ').replace(/\\/g, ' backslash ')
    .replace(/_/g, ' underscore ').replace(/\./g, ' dot ').replace(/ -m /g, ' dash m ')
    .replace(/-/g, ' dash ').replace(/=/g, ' equals ').replace(/>/g, ' greater than ')
    .replace(/\$/g, ' dollar ').replace(/~/g, ' tilde ').replace(/\s+/g, ' ').trim()).join('. Then, ');
}

function normMap(el: HTMLElement) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let text = ''; const nodes: { node: Text; off: number }[] = []; let n: Node | null;
  while ((n = w.nextNode())) {
    const s = n.nodeValue ?? '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (/\s/.test(ch)) { if (!text.length || text[text.length - 1] === ' ') continue; text += ' '; nodes.push({ node: n as Text, off: i }); }
      else { text += ch; nodes.push({ node: n as Text, off: i }); }
    }
  }
  if (text.endsWith(' ')) { text = text.slice(0, -1); nodes.pop(); }
  return { text, nodes };
}
function chunkText(t: string, max = 230) {
  if (t.length <= max) return [{ s: 0, t }];
  const out: { s: number; t: string }[] = []; const re = /[^.!?;:]*[.!?;:]+\s*|[^.!?;:]+/g; let cur = '', cs = 0, m: RegExpExecArray | null;
  while ((m = re.exec(t))) { if (cur && (cur + m[0]).length > max) { out.push({ s: cs, t: cur.trimEnd() }); cur = m[0]; cs = m.index; } else { if (!cur) cs = m.index; cur += m[0]; } }
  if (cur) out.push({ s: cs, t: cur.trimEnd() });
  return out;
}
const SEL = 'h1,h2,h3,h4,p,li,dt,dd,.see,.hint,.question,[data-tts]';

class ReaderEngine {
  items: Item[] = []; idx = 0; playing = false; session = 0;
  rate = 1; voiceURI = ''; skipCode = false; root: HTMLElement | null = null;
  private listeners = new Set<Listener>();
  get supported() { return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; }
  on(fn: Listener) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { this.listeners.forEach(f => f()); }
  voices() { return this.supported ? window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)) : []; }
  private collect() {
    this.root = document.querySelector('main'); const items: Item[] = [];
    if (!this.root) { this.items = []; return; }
    this.root.querySelectorAll<HTMLElement>(SEL).forEach(el => {
      if (el.closest('.no-tts, .viz, .side, .topbar, .reader-bar')) return;
      if (el.matches('li,p') && el.parentElement?.closest('li,p')) return;
      if (el.dataset.tts === 'code') { if (!this.skipCode && el.dataset.say) items.push({ el, text: el.dataset.say, start: 0, map: null }); return; }
      if (el.offsetParent === null) return;
      const map = normMap(el); if (!map.text) return;
      chunkText(map.text).forEach(c => items.push({ el, text: c.t, start: c.s, map }));
    });
    this.items = items;
  }
  private setActive(el: HTMLElement | null) {
    document.querySelectorAll('.tts-active').forEach(x => x.classList.remove('tts-active'));
    try { (CSS as any).highlights?.delete('tts-word'); } catch { /* unsupported */ }
    if (!el) return; el.classList.add('tts-active');
    const r = el.getBoundingClientRect(); if (r.top < 90 || r.bottom > window.innerHeight - 120) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  private highlightWord(it: Item, ci: number) {
    try {
      const H = (window as any).Highlight; if (!it.map || !(CSS as any).highlights || !H) return;
      const t = it.map.text, g = it.start + ci; if (g >= t.length) return;
      let s = g; while (s > 0 && t[s - 1] !== ' ') s--; let e = g; while (e < t.length && t[e] !== ' ') e++;
      const a = it.map.nodes[s], b = it.map.nodes[e - 1]; if (!a || !b) return;
      const r = new Range(); r.setStart(a.node, a.off); r.setEnd(b.node, b.off + 1); (CSS as any).highlights.set('tts-word', new H(r));
    } catch { /* ignore */ }
  }
  private speak(i: number) {
    if (i < 0) i = 0; if (i >= this.items.length) { this.stop(); return; }
    this.idx = i; const it = this.items[i]; const sess = ++this.session; this.setActive(it.el); this.emit();
    const synth = window.speechSynthesis; synth.cancel();
    const u = new SpeechSynthesisUtterance(it.text); u.lang = 'en-US'; u.rate = this.rate;
    const v = synth.getVoices().find(x => x.voiceURI === this.voiceURI); if (v) u.voice = v;
    u.onboundary = ev => { if (sess !== this.session || !it.map) return; if (ev.name && ev.name !== 'word') return; this.highlightWord(it, ev.charIndex); };
    u.onend = () => { if (sess !== this.session || !this.playing) return; this.speak(i + 1); };
    u.onerror = ev => { if (sess !== this.session) return; if (ev.error === 'interrupted' || ev.error === 'canceled') return; if (this.playing) this.speak(i + 1); };
    setTimeout(() => { if (sess === this.session) synth.speak(u); }, 40);
  }
  play(from?: number) { if (!this.supported) return; this.collect(); if (!this.items.length) return; this.playing = true; let i = from ?? this.idx; if (i >= this.items.length) i = 0; this.speak(i); }
  pause() { this.playing = false; this.session++; if (this.supported) window.speechSynthesis.cancel(); this.emit(); }
  stop() { this.playing = false; this.session++; if (this.supported) window.speechSynthesis.cancel(); this.idx = 0; this.setActive(null); this.emit(); }
  toggle() { this.playing ? this.pause() : this.play(); }
  jump(d: number) {
    if (!this.items.length) { this.collect(); if (!this.items.length) return; }
    const cur = this.items[Math.min(this.idx, this.items.length - 1)].el; let i = this.idx;
    if (d > 0) { while (i < this.items.length - 1 && this.items[i].el === cur) i++; }
    else { while (i > 0 && this.items[i].el === cur) i--; const t = this.items[i].el; while (i > 0 && this.items[i - 1].el === t) i--; }
    if (this.playing) this.speak(i); else { this.idx = i; this.setActive(this.items[i].el); this.emit(); }
  }
  fromElement(el: HTMLElement) { this.collect(); const i = this.items.findIndex(it => it.el === el || it.el.contains(el)); if (i >= 0) { this.playing = true; this.speak(i); } }
  reset() { this.stop(); this.items = []; }
  status() { return this.items.length && (this.playing || this.idx > 0) ? `Line ${this.idx + 1} of ${this.items.length}` : 'Ready'; }
  refreshIfPlaying() { if (this.playing) { const el = this.items[this.idx]?.el; this.collect(); const i = el ? this.items.findIndex(x => x.el === el) : 0; this.speak(Math.max(0, i)); } else this.items = []; }
}
export const reader = new ReaderEngine();
