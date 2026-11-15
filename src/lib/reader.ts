/**
 * Read-aloud engine ported from the original HTML app: sentence highlight (light) plus word highlight (deep)
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
/** Split normalised text into sentences (a "." inside 0.5 or e.g. file.py does not end one); very long sentences are cut at ; : , so speech engines do not stall. */
export function sentences(t: string, max = 230): { s: number; t: string }[] {
  const out: { s: number; t: string }[] = []; let a = 0;
  const push = (from: number, to: number) => {
    while (from < to && t[from] === ' ') from++; while (to > from && t[to - 1] === ' ') to--;
    if (to <= from) return;
    if (to - from <= max) { out.push({ s: from, t: t.slice(from, to) }); return; }
    let cut = -1; for (let i = from + max; i > from + 40; i--) if (/[;:,]/.test(t[i]) && t[i + 1] === ' ') { cut = i + 1; break; }
    if (cut < 0) { cut = t.lastIndexOf(' ', from + max); if (cut <= from) cut = from + max; }
    push(from, cut); push(cut, to);
  };
  for (let i = 0; i < t.length; i++) if (/[.!?]/.test(t[i]) && (i + 1 === t.length || t[i + 1] === ' ') && !/(e\.g|i\.e|vs|approx|Fig)\.$/i.test(t.slice(Math.max(0, i - 6), i + 1))) { push(a, i + 1); a = i + 1; }
  push(a, t.length);
  return out;
}
/** Word start offsets and estimated start times (seconds at rate 1) — used when a voice sends no word events. */
export function wordSchedule(t: string): { at: number; time: number }[] {
  const out: { at: number; time: number }[] = []; let time = 0; const re = /\S+/g; let m: RegExpExecArray | null;
  while ((m = re.exec(t))) { out.push({ at: m.index, time }); const w = m[0]; time += 0.11 + 0.055 * w.length + (/[,;:]$/.test(w) ? 0.18 : /[.!?]$/.test(w) ? 0.3 : 0); }
  return out;
}
/** Same choice as the original app: your saved voice, else an English "Natural" voice (Edge), else the first English voice. */
export function pickVoice(saved?: string | null): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const vs = window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  return vs.find(v => v.voiceURI === saved) ?? vs.find(v => v.name === saved) ?? vs.find(v => /natural/i.test(v.name)) ?? vs[0] ?? null;
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
      sentences(map.text).forEach(c => items.push({ el, text: c.t, start: c.s, map }));
    });
    this.items = items;
  }
  private timers: number[] = [];
  private clearTimers() { this.timers.forEach(t => clearTimeout(t)); this.timers = []; }
  private range(it: Item, from: number, to: number) {
    const a = it.map!.nodes[from], b = it.map!.nodes[to - 1]; if (!a || !b) return null;
    const r = new Range(); r.setStart(a.node, a.off); r.setEnd(b.node, b.off + 1); return r;
  }
  private setActive(el: HTMLElement | null, it?: Item) {
    document.querySelectorAll('.tts-active').forEach(x => x.classList.remove('tts-active'));
    const HL = (CSS as any).highlights, H = (window as any).Highlight;
    try { HL?.delete('tts-word'); HL?.delete('tts-sentence'); } catch { /* unsupported */ }
    if (!el) return;
    // Light shade on the sentence being read; whole element if the browser lacks the Highlight API or it is a code block.
    let ok = false;
    try { if (it?.map && HL && H) { const r = this.range(it, it.start, it.start + it.text.length); if (r) { HL.set('tts-sentence', new H(r)); ok = true; } } } catch { /* ignore */ }
    el.classList.add('tts-active'); el.classList.toggle('tts-whole', !ok);
    const r = el.getBoundingClientRect(); if (r.top < 90 || r.bottom > window.innerHeight - 120) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  private highlightWord(it: Item, ci: number) {
    try {
      const H = (window as any).Highlight; if (!it.map || !(CSS as any).highlights || !H) return;
      const t = it.map.text, g = it.start + ci; if (g >= t.length) return;
      let s = g; while (s > 0 && t[s - 1] !== ' ') s--; let e = g; while (e < t.length && t[e] !== ' ') e++;
      const r = this.range(it, s, e); if (r) (CSS as any).highlights.set('tts-word', new H(r));
    } catch { /* ignore */ }
  }
  private speak(i: number) {
    if (i < 0) i = 0; if (i >= this.items.length) { this.stop(); return; }
    this.clearTimers(); this.idx = i; const it = this.items[i]; const sess = ++this.session; this.setActive(it.el, it); this.emit();
    const synth = window.speechSynthesis; synth.cancel();
    const u = new SpeechSynthesisUtterance(it.text); u.lang = 'en-US'; u.rate = this.rate;
    const v = pickVoice(this.voiceURI); if (v) { u.voice = v; u.lang = v.lang; }
    // Real word events win; voices that send none (e.g. Chrome's online Google voices) get an estimated schedule.
    let real = false;
    u.onboundary = ev => { if (sess !== this.session || !it.map) return; if (ev.name && ev.name !== 'word') return; if (!real) { real = true; this.clearTimers(); } this.highlightWord(it, ev.charIndex); };
    u.onstart = () => {
      if (sess !== this.session || !it.map || real) return;
      for (const w of wordSchedule(it.text)) this.timers.push(window.setTimeout(() => { if (sess === this.session && !real) this.highlightWord(it, w.at); }, (w.time * 1000) / this.rate));
    };
    u.onend = () => { if (sess !== this.session) return; this.clearTimers(); if (!this.playing) return; this.speak(i + 1); };
    u.onerror = ev => { if (sess !== this.session) return; if (ev.error === 'interrupted' || ev.error === 'canceled') return; if (this.playing) this.speak(i + 1); };
    setTimeout(() => { if (sess === this.session) synth.speak(u); }, 40);
  }
  play(from?: number) { if (!this.supported) return; this.collect(); if (!this.items.length) return; this.playing = true; let i = from ?? this.idx; if (i >= this.items.length) i = 0; this.speak(i); }
  pause() { this.clearTimers(); this.playing = false; this.session++; if (this.supported) window.speechSynthesis.cancel(); this.emit(); }
  stop() { this.clearTimers(); this.playing = false; this.session++; if (this.supported) window.speechSynthesis.cancel(); this.idx = 0; this.setActive(null); this.emit(); }
  toggle() { this.playing ? this.pause() : this.play(); }
  jump(d: number) {
    if (!this.items.length) { this.collect(); if (!this.items.length) return; }
    const cur = this.items[Math.min(this.idx, this.items.length - 1)].el; let i = this.idx;
    if (d > 0) { while (i < this.items.length - 1 && this.items[i].el === cur) i++; }
    else { while (i > 0 && this.items[i].el === cur) i--; const t = this.items[i].el; while (i > 0 && this.items[i - 1].el === t) i--; }
    if (this.playing) this.speak(i); else { this.idx = i; this.setActive(this.items[i].el, this.items[i]); this.emit(); }
  }
  fromElement(el: HTMLElement) { this.collect(); const i = this.items.findIndex(it => it.el === el || it.el.contains(el)); if (i >= 0) { this.playing = true; this.speak(i); } }
  reset() { this.stop(); this.items = []; }
  status() { return this.items.length && (this.playing || this.idx > 0) ? `Sentence ${this.idx + 1} of ${this.items.length}` : 'Ready'; }
  refreshIfPlaying() { if (this.playing) { const el = this.items[this.idx]?.el; this.collect(); const i = el ? this.items.findIndex(x => x.el === el) : 0; this.speak(Math.max(0, i)); } else this.items = []; }
}
export const reader = new ReaderEngine();
