import { useState } from 'react';
import { useApp } from '../state/AppState';
import type { JournalEntry, JournalKind } from '../state/store';
export const KINDS: { id: JournalKind; label: string }[] = [
  { id: 'derivation', label: 'Derivation' }, { id: 'question', label: 'Question' }, { id: 'discovery', label: 'Discovery' },
  { id: 'debugging', label: 'Debugging lesson' }, { id: 'observation', label: 'Observation' }, { id: 'reflection', label: 'Reflection' },
  { id: 'idea', label: 'Experiment idea' }, { id: 'parked', label: 'Parked thought' },
];
/** Inline journal composer that links the note to where you are. */
export function QuickNote({ refTo, defaultKind = 'observation', placeholder, onSaved, compact }: { refTo?: JournalEntry['ref']; defaultKind?: JournalKind; placeholder?: string; onSaved?: (e: JournalEntry) => void; compact?: boolean }) {
  const { addJournal } = useApp();
  const [kind, setKind] = useState<JournalKind>(defaultKind);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saved, setSaved] = useState(false);
  const submit = () => {
    if (!body.trim() && !title.trim()) return;
    const e = addJournal({ kind, title: title.trim() || body.trim().split('\n')[0].slice(0, 70), body, ref: refTo });
    setTitle(''); setBody(''); setSaved(true); setTimeout(() => setSaved(false), 1600); onSaved?.(e);
  };
  return (
    <div className="stack sm">
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <select aria-label="Entry type" value={kind} onChange={e => setKind(e.target.value as JournalKind)} style={{ width: 'auto' }}>
          {KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
        {!compact && <input type="text" aria-label="Title" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} style={{ flex: 1, minWidth: 160 }} />}
      </div>
      <textarea className={kind === 'derivation' ? 'mono' : ''} aria-label="Note" placeholder={placeholder ?? 'Write it down while it is fresh…'} value={body} onChange={e => setBody(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }} />
      <div className="row">
        <button type="button" className="btn small primary" onClick={submit} disabled={!body.trim() && !title.trim()}>Save to journal</button>
        <span className="faint" style={{ fontSize: '.78rem' }}>{saved ? 'Saved ✓' : refTo ? `Linked to ${refTo.label}` : 'Ctrl/⌘ + Enter saves'}</span>
      </div>
    </div>
  );
}
