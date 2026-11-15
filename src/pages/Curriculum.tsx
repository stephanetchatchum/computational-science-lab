import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { STAGES, stageProjects, stagePrereqs, stageWorkload, stageConcepts, isUnlocked, isApproved, type Project } from '../content/curriculum';
import { SPECIALISATION_TRACK } from '../content/audit';
import { stepsDone, projectFraction, stepCount } from '../lib/progress';
import { DomainBadge, VisualBadge } from '../components/Badges';
import { hasGuide } from '../content/guides';

function StatusIcon({ p }: { p: Project }) {
  const { state, done } = useApp();
  if (done.has(p.id)) return <span className="status-icon done" aria-label="Complete">✓</span>;
  if (!isUnlocked(p, done)) return <span className="status-icon locked" aria-label="Locked">·</span>;
  if (stepsDone(state, p) > 0) return <span className="status-icon prog" aria-label="In progress">◐</span>;
  return <span className="status-icon" aria-label="Not started" />;
}

export function ProjectRow({ p }: { p: Project }) {
  const { state, done } = useApp();
  const locked = !isUnlocked(p, done);
  return (
    <Link to={`/project/${p.id}`} className={`proj-row ${locked ? 'locked' : ''}`}>
      <StatusIcon p={p} />
      <span className="pid">{p.id}</span>
      <span className="ttl">{p.title}
        <small>{locked ? `Needs ${p.prereqs.filter(id => !done.has(id)).join(', ')}` : p.firstWin.replace(/^(Early win|Within the first (hour|sitting)): ?/, '') || p.summary}</small>
      </span>
      <span className="mini-bar">{stepCount(state, p) > 0 && <span className="bar"><span style={{ width: `${projectFraction(state, p) * 100}%` }} /></span>}</span>
      <span className="tag-row">
        {p.origin === 'audit' && <span className="badge violet">new</span>}
        {!hasGuide(p.id) && <span className="badge">spec</span>}
        <VisualBadge p={p} compact /><DomainBadge domain={p.domain} />
      </span>
    </Link>
  );
}

export default function Curriculum() {
  usePage('Curriculum');
  const { projects, state, done } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const stage = Number(params.get('stage') ?? Math.max(0, projects.find(p => !done.has(p.id))?.stage ?? 0));
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const words = q.toLowerCase().split(/\s+/);
    return projects.filter(p => { const blob = [p.id, p.title, p.domain, p.context, ...p.concepts.math, ...p.concepts.physics, ...p.concepts.programming, ...p.tools].join(' ').toLowerCase(); return words.every(w => blob.includes(w)); });
  }, [q, projects]);
  const s = STAGES[stage];
  const ps = stageProjects(projects, stage);
  const wl = stageWorkload(projects, stage); const pre = stagePrereqs(projects, stage);

  return (
    <div className="page wide">
      <div className="row" style={{ flexWrap: 'wrap', gap: 14 }}>
        <h1>Curriculum</h1><span className="spacer" />
        <input type="search" aria-label="Search all projects" placeholder="Search title, concept, tool…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 300 }} />
      </div>

      {q.trim() ? (
        <section className="section">
          <p className="faint" style={{ marginBottom: 10 }}>{results.length} project{results.length === 1 ? '' : 's'} match “{q}”.</p>
          {results.length ? <div className="proj-list">{results.map(p => <ProjectRow key={p.id} p={p} />)}</div> : <div className="empty">No project matches.</div>}
        </section>
      ) : <>
        <div className="pills" role="tablist" aria-label="Stages" style={{ marginTop: 18 }}>
          {STAGES.map(x => {
            const n = stageProjects(projects, x.id); const d = n.filter(p => done.has(p.id)).length;
            return <button key={x.id} role="tab" aria-selected={x.id === stage} className={`pill-btn ${x.id === stage ? 'on' : ''}`} onClick={() => setParams({ stage: String(x.id) })}>Stage {x.id}{n.length ? <span className="faint mono" style={{ marginLeft: 6, fontSize: '.75rem' }}>{d}/{n.length}</span> : null}</button>;
          })}
        </div>

        <section className="section">
          <div className="kicker">Stage {s.id}</div>
          <h2 style={{ fontSize: '1.6rem', margin: '6px 0' }}>{s.name}</h2>
          <p className="lead">{s.tagline}</p>
          {stage === 7 ? <p style={{ marginTop: 14 }}>{s.summary} <Link to="/capstone">Open the capstone →</Link></p> : <>
            <p className="faint" style={{ fontSize: '.88rem', marginTop: 10 }}>{ps.length} projects · about {wl.lo}–{wl.hi} weeks · {pre.length ? <>builds on {pre.map((p, i) => <span key={p.id}>{i ? ', ' : ''}<Link to={`/project/${p.id}`}>{p.id}</Link></span>)}</> : 'no earlier prerequisites'}</p>
            <div className="proj-list" style={{ marginTop: 16 }}>{ps.map(p => <ProjectRow key={p.id} p={p} />)}</div>
            <details style={{ marginTop: 16 }}>
              <summary className="muted">Why this stage matters, and the skills it builds</summary>
              <p className="muted" style={{ margin: '10px 0' }}>{s.summary}</p>
              <div className="concepts">
                {(['math', 'physics', 'programming'] as const).map(k => <div key={k}><h4>{k === 'math' ? 'Mathematics' : k === 'physics' ? 'Physics & science' : 'Computing'}</h4><ul className="list" style={{ fontSize: '.85rem' }}>{stageConcepts(projects, stage, k).map(c => <li key={c}>{c}</li>)}</ul></div>)}
              </div>
            </details>
          </>}
        </section>

        {isApproved(state.approvals, 'E3') && stage >= 4 && stage <= 6 && (
          <details className="section">
            <summary className="muted">Optional specialisation track (unlocks after Stage 4, not counted)</summary>
            <div className="grid two" style={{ marginTop: 12 }}>{SPECIALISATION_TRACK.map(t => <div key={t.title} className="panel tight"><h3>{t.title}</h3><ul className="list" style={{ marginTop: 8, fontSize: '.88rem' }}>{t.items.map(i => <li key={i}>{i}</li>)}</ul></div>)}</div>
          </details>
        )}
      </>}
    </div>
  );
}
