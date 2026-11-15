import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { KINDS, QuickNote } from '../components/QuickNote';
import type { JournalEntry, JournalKind } from '../state/store';

function refLink(r: JournalEntry['ref']) {
  if (!r) return null;
  if (r.id.startsWith('lesson:')) return `/lesson/${r.id.slice(7)}`;
  if (/^s\dp\d+$/.test(r.id)) return r.step !== undefined ? `/project/${r.id}?tab=build&step=${r.step}` : `/project/${r.id}`;
  if (r.id.startsWith('/')) return r.id;
  return null;
}

function Entry({ e }: { e: JournalEntry }) {
  const { updateJournal, deleteJournal } = useApp();
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(e.title); const [body, setBody] = useState(e.body);
  const [confirm, setConfirm] = useState(false);
  const link = refLink(e.ref);
  return (
    <article className="entry">
      <header>
        <span className="badge">{KINDS.find(k => k.id === e.kind)?.label ?? e.kind}</span>
        {e.pinned && <span className="badge amber">important</span>}
        {!edit && <b>{e.title}</b>}
        <span className="spacer" />
        {link && <Link to={link} className="faint" style={{ fontSize: '.78rem' }}>↗ {e.ref!.label}</Link>}
        <time className="faint mono" style={{ fontSize: '.72rem' }}>{new Date(e.createdAt).toLocaleString()}</time>
      </header>
      {edit ? (
        <div className="stack sm">
          <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} aria-label="Title" />
          <textarea className={e.kind === 'derivation' ? 'mono' : ''} value={body} onChange={ev => setBody(ev.target.value)} aria-label="Body" />
          <div className="row"><button className="btn small primary" onClick={() => { updateJournal(e.id, { title, body }); setEdit(false); }}>Save</button><button className="btn small ghost" onClick={() => setEdit(false)}>Cancel</button></div>
        </div>
      ) : <div className={`body ${e.kind === 'derivation' ? 'mono' : ''}`}>{e.body}</div>}
      {!edit && <div className="row" style={{ marginTop: 8 }}>
        <button className="btn small ghost" onClick={() => setEdit(true)}>Edit</button>
        <button className="btn small ghost" onClick={() => updateJournal(e.id, { pinned: !e.pinned })}>{e.pinned ? 'Unmark' : 'Mark important'}</button>
        {confirm ? <><span className="faint" style={{ fontSize: '.8rem' }}>Delete for good?</span><button className="btn small danger" onClick={() => deleteJournal(e.id)}>Delete</button><button className="btn small ghost" onClick={() => setConfirm(false)}>Keep</button></>
          : <button className="btn small ghost" onClick={() => setConfirm(true)}>Delete</button>}
      </div>}
    </article>
  );
}

export default function Journal() {
  usePage('Journal');
  const { state, projectById } = useApp();
  const [params] = useSearchParams();
  const initialKind = (params.get('new') as JournalKind) || 'observation';
  const refId = params.get('ref');
  const step = params.get('step');
  const refTo: JournalEntry['ref'] | undefined = refId ? {
    type: refId.startsWith('lesson:') ? 'lesson' : step ? 'step' : 'project', id: refId,
    label: refId.startsWith('lesson:') ? `lesson ${refId.slice(7)}` : `${refId}${step ? ` step ${step}` : ''}${projectById(refId) ? '' : ''}`,
    step: step ? Number(step) : undefined,
  } : undefined;
  const [kind, setKind] = useState<'' | JournalKind>('');
  const [q, setQ] = useState('');
  const [onlyRef, setOnlyRef] = useState(!!refId && !params.get('new'));
  const list = useMemo(() => state.journal.filter(e => (!kind || e.kind === kind) && (!onlyRef || e.ref?.id === refId) &&
    (!q || `${e.title} ${e.body} ${e.ref?.label ?? ''}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt.localeCompare(a.createdAt)), [state.journal, kind, q, onlyRef, refId]);

  const exportMd = () => {
    const md = '# Scientific journal\n\n' + state.journal.map(e => `## ${e.title}\n\n_${e.kind} · ${new Date(e.createdAt).toLocaleString()}${e.ref ? ` · ${e.ref.label}` : ''}_\n\n${e.kind === 'derivation' ? '```\n' + e.body + '\n```' : e.body}\n`).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); a.download = 'journal.md'; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div>
      <div className="row"><h1>Scientific journal</h1><span className="spacer" /><button className="btn small ghost" onClick={exportMd} disabled={!state.journal.length}>Export as Markdown</button></div>
      <p className="muted prose" style={{ margin: '6px 0 18px' }}>Derivations, questions, discoveries, debugging lessons, observations, reflections and ideas — each linked to the lesson or project it came from.</p>
      <div className="journal-grid">
        <aside className="stack sm">
          <label className="field">Search<input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Text in notes…" /></label>
          <div className="nav">
            <a href="#" className={kind === '' ? 'active' : ''} onClick={e => { e.preventDefault(); setKind(''); }}>All entries<span className="count">{state.journal.length}</span></a>
            {KINDS.map(k => <a key={k.id} href="#" className={kind === k.id ? 'active' : ''} onClick={e => { e.preventDefault(); setKind(k.id); }}>{k.label}<span className="count">{state.journal.filter(j => j.kind === k.id).length}</span></a>)}
          </div>
          {refId && <label className="check" style={{ fontSize: '.85rem' }}><input type="checkbox" checked={onlyRef} onChange={e => setOnlyRef(e.target.checked)} />Only {refId}</label>}
        </aside>
        <div className="stack">
          <div className="panel"><h3 style={{ marginBottom: 8 }}>New entry</h3><QuickNote key={initialKind + refId} defaultKind={initialKind} refTo={refTo} /></div>
          {list.length ? list.map(e => <Entry key={e.id} e={e} />) : <div className="empty">No entries{kind || q || onlyRef ? ' match' : ' yet'}.</div>}
        </div>
      </div>
    </div>
  );
}
