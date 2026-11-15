import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { STAGES, stageProjects, stagePrereqs, stageWorkload, stageConcepts, isUnlocked, isApproved, type Project } from '../content/curriculum';
import { SPECIALISATION_TRACK } from '../content/audit';
import { stepsDone, stepCount, projectFraction } from '../lib/progress';
import { stripMarkup } from '../components/Markup';

function StatusIcon({ p }: { p: Project }) {
  const { state, done } = useApp();
  if (done.has(p.id)) return <span className="status-icon done" aria-label="Complete">✓</span>;
  if (!isUnlocked(p, done)) return <span className="status-icon locked" aria-label="Locked">·</span>;
  if (stepsDone(state, p.id) > 0) return <span className="status-icon prog" aria-label="In progress">◐</span>;
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
        <small>{locked ? `Needs ${p.prereqs.filter(id => !done.has(id)).join(', ')}` : stripMarkup(p.context).slice(0, 140)}</small>
      </span>
      <span className="mini-bar">{stepCount(p.id) > 0 && <span className="bar"><span style={{ width: `${projectFraction(state, p) * 100}%` }} /></span>}</span>
      <span className="row" style={{ gap: 6 }}>
        {p.origin === 'audit' && <span className="badge violet">new · spec only</span>}
        <span className="badge">{p.time}</span>
      </span>
    </Link>
  );
}

export default function Curriculum() {
  usePage('Curriculum');
  const { projects, state, done } = useApp();
  const loc = useLocation();
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [domain, setDomain] = useState('');
  const [diff, setDiff] = useState('');
  const [hideLocked, setHideLocked] = useState(false);
  useEffect(() => { if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView(); }, [loc.hash]);

  const domains = useMemo(() => [...new Set(projects.map(p => p.domain))].sort(), [projects]);
  const diffs = useMemo(() => [...new Set(projects.map(p => p.difficulty))], [projects]);
  const match = (p: Project) => {
    if (stage && String(p.stage) !== stage) return false;
    if (domain && p.domain !== domain) return false;
    if (diff && p.difficulty !== diff) return false;
    if (hideLocked && !isUnlocked(p, done)) return false;
    if (q) {
      const blob = [p.id, p.title, p.domain, p.context, ...p.concepts.math, ...p.concepts.physics, ...p.concepts.programming, ...p.tools].join(' ').toLowerCase();
      return q.toLowerCase().split(/\s+/).every(w => blob.includes(w));
    }
    return true;
  };
  const filtering = !!(q || stage || domain || diff || hideLocked);
  const shown = projects.filter(match);

  return (
    <div>
      <h1>Curriculum</h1>
      <p className="muted prose" style={{ marginTop: 6 }}>Eight stages, {projects.length} required projects. Every project teaches mathematics, physics and programming together, tied to a real problem and a real way to check the answer.</p>

      <div className="panel tight filters" style={{ marginTop: 18 }} role="search">
        <label className="field">Search<input type="search" placeholder="Title, concept, tool…" value={q} onChange={e => setQ(e.target.value)} /></label>
        <label className="field">Stage<select value={stage} onChange={e => setStage(e.target.value)}><option value="">All stages</option>{STAGES.filter(s => s.id < 7).map(s => <option key={s.id} value={s.id}>Stage {s.id}</option>)}</select></label>
        <label className="field">Domain<select value={domain} onChange={e => setDomain(e.target.value)}><option value="">All domains</option>{domains.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="field">Difficulty<select value={diff} onChange={e => setDiff(e.target.value)}><option value="">All levels</option>{diffs.map(d => <option key={d}>{d}</option>)}</select></label>
        <label className="check" style={{ paddingBottom: 8 }}><input type="checkbox" checked={hideLocked} onChange={e => setHideLocked(e.target.checked)} />Hide locked</label>
      </div>

      {filtering ? (
        <section className="section">
          <p className="faint" style={{ marginBottom: 10 }}>{shown.length} project{shown.length === 1 ? '' : 's'} match.</p>
          {shown.length ? <div className="proj-list">{shown.map(p => <ProjectRow key={p.id} p={p} />)}</div> : <div className="empty">No projects match these filters.</div>}
        </section>
      ) : STAGES.map(s => {
        const ps = stageProjects(projects, s.id);
        if (s.id === 7) return (
          <section key={s.id} id="stage-7" className="stage-block">
            <div className="stage-head"><h2><span className="sn">07</span>{s.name}</h2><Link className="btn small" to="/capstone">Open capstone</Link></div>
            <p className="muted prose">{s.summary}</p>
          </section>
        );
        const wl = stageWorkload(projects, s.id);
        const pre = stagePrereqs(projects, s.id);
        const d = ps.filter(p => done.has(p.id)).length;
        return (
          <section key={s.id} id={`stage-${s.id}`} className="stage-block">
            <div className="stage-head">
              <div>
                <h2><span className="sn">0{s.id}</span>{s.name}</h2>
                <p style={{ marginTop: 4 }}>{s.tagline}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '.85rem' }}>{d}/{ps.length} done</div>
                <div className="faint" style={{ fontSize: '.78rem' }}>≈ {wl.lo}–{wl.hi} weeks</div>
              </div>
            </div>
            <details className="panel tight" style={{ marginBottom: 10 }}>
              <summary style={{ cursor: 'pointer', fontSize: '.88rem' }}>Why this stage matters · prerequisites · skills developed</summary>
              <div className="stack sm" style={{ marginTop: 10, fontSize: '.88rem' }}>
                <p className="muted">{s.summary}</p>
                <div><b>Prerequisites from earlier stages: </b>{pre.length ? pre.map((p, i) => <span key={p.id}>{i ? ', ' : ''}<Link to={`/project/${p.id}`}>{p.id}</Link>{done.has(p.id) ? ' ✓' : ''}</span>) : <span className="muted">none</span>}</div>
                <div className="concepts" style={{ marginTop: 6 }}>
                  {(['math', 'physics', 'programming'] as const).map(k => (
                    <div key={k}><h4>{k === 'math' ? 'Mathematics' : k === 'physics' ? 'Physics & science' : 'Computing'}</h4>
                      <ul className="list" style={{ fontSize: '.82rem' }}>{stageConcepts(projects, s.id, k).slice(0, 8).map(c => <li key={c}>{c}</li>)}</ul></div>
                  ))}
                </div>
              </div>
            </details>
            <div className="proj-list">{ps.map(p => <ProjectRow key={p.id} p={p} />)}</div>
          </section>
        );
      })}

      {isApproved(state.approvals, 'E3') && !filtering && (
        <section className="section">
          <div className="section-head"><h2>Specialisation track</h2><span className="badge violet">optional · no build guides yet</span></div>
          <p className="muted prose" style={{ marginBottom: 12 }}>Not counted in progress. Unlocks after Stage 4.</p>
          <div className="grid two">{SPECIALISATION_TRACK.map(t => <div key={t.title} className="panel tight"><h3>{t.title}</h3><ul className="list" style={{ marginTop: 8, fontSize: '.88rem' }}>{t.items.map(i => <li key={i}>{i}</li>)}</ul></div>)}</div>
        </section>
      )}
    </div>
  );
}
