import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { AUDIT_GROUPS, AUDIT_ITEMS, DECISIONS, FINDINGS, type ApprovalState } from '../content/audit';
import { buildProjects, hasCycle } from '../content/curriculum';

export default function Audit() {
  usePage('Audit & decisions');
  const { state, update, projects } = useApp();
  const loc = useLocation();
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView(); }, [loc.hash]);
  const setItem = (id: string, v: ApprovalState) => {
    const next = { ...state.approvals, [id]: v };
    if (hasCycle(buildProjects(next))) { setMsg('That combination would create a prerequisite cycle, so it was not applied.'); return; }
    update(s => ({ ...s, approvals: next })); setMsg(null);
  };
  const counts = AUDIT_ITEMS.reduce((a, i) => { const v = state.approvals[i.id] ?? i.defaultState; a[v]++; return a; }, { approved: 0, rejected: 0, pending: 0 } as Record<ApprovalState, number>);

  return (
    <div>
      <h1>Scientific audit & your decisions</h1>
      <p className="muted prose" style={{ margin: '6px 0 12px' }}>The audit (14 Nov 2026) re-ran 20 numeric oracles and found them correct, and proposed fixes, new milestones and five new projects. Nothing below changes your original guides' text. Approving an item adds required work, new projects or prerequisite edges; rejecting or leaving it pending keeps the original. Every choice is reversible and your progress is never touched.</p>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
        <span className="badge green">{counts.approved} approved</span><span className="badge violet">{counts.pending} pending</span><span className="badge">{counts.rejected} rejected</span>
        <span className="faint" style={{ fontSize: '.85rem' }}>Required projects now: <b className="mono">{projects.length}</b> (original 35)</span>
      </div>
      {msg && <div className="notice red" role="alert">{msg}</div>}

      <section className="section" id="decisions">
        <h2>Decisions</h2>
        <div className="stack sm" style={{ marginTop: 10 }}>
          {DECISIONS.map((d, i) => (
            <div key={d.id} className="panel tight">
              <div className="row"><span className="badge violet">Decision {i + 1}</span><span className="faint mono" style={{ fontSize: '.75rem' }}>{d.relatedItem}</span><span className="spacer" />{state.decisions[d.id] ? <span className="badge green">decided</span> : <span className="badge amber">open</span>}</div>
              <p style={{ margin: '8px 0', fontSize: '.92rem' }}>{d.question}</p>
              <div className="btn-row">
                {d.options.map(o => <button key={o.id} className={`btn small ${state.decisions[d.id] === o.id ? 'primary' : ''}`} onClick={() => update(s => ({ ...s, decisions: { ...s.decisions, [d.id]: o.id } }))}>{o.label}</button>)}
                {state.decisions[d.id] && <button className="btn small ghost" onClick={() => update(s => { const n = { ...s.decisions }; delete n[d.id]; return { ...s, decisions: n }; })}>Clear</button>}
              </div>
              {d.id === 'guides' && state.decisions.guides === 'full' && <p className="faint" style={{ fontSize: '.8rem', marginTop: 8 }}>Recorded. Full guides are written stage by stage: s1p6 and s2p6 are done; s4p8, s4p9 and s5p7 show their specification until their stage is built.</p>}
              {d.id === 's2p5' && <p className="faint" style={{ fontSize: '.8rem', marginTop: 8 }}>{state.decisions.s2p5 === 'geonames' ? 'Chosen by Claude at your request. Why: the lesson is eigenvectors, and they work the same on any network. GeoNames is one small, reliable file with a backup copy; road data from Overpass is large, rate-limited and messy to clean, which would turn an eigenvector project into a data-cleaning one. The project text now says plainly that links join nearest towns, not roads. Real roads are a good extension later.' : 'The Overpass road version is not built: the guide still uses GeoNames towns.'}</p>}
              {d.id === 's4p5' && <p className="faint" style={{ fontSize: '.8rem', marginTop: 8 }}>{state.decisions.s4p5 === 'power' ? 'Chosen by Claude at your request. Why: the 8 × 8 NASA POWER grid is already backed up in this repository and uses the same download code you write in Stage 0. CHIRPS needs NetCDF files and xarray, a new tool and a much bigger download, for a project about trend statistics, not file formats. The specification will be rewritten to match when Stage 4 is built.' : 'The CHIRPS version is not built: the guide still uses the NASA POWER grid.'}</p>}
              {d.id === 'twoD' && state.decisions.twoD === 'toggle' && <p className="faint" style={{ fontSize: '.8rem', marginTop: 8 }}>A “2D version” switch now appears on the nine 3D projects. 2D progress is stored separately.</p>}
            </div>
          ))}
        </div>
      </section>

      {(Object.keys(AUDIT_GROUPS) as (keyof typeof AUDIT_GROUPS)[]).map(g => (
        <section key={g} className="section">
          <h2>{g}. {AUDIT_GROUPS[g]}</h2>
          <div className="stack sm" style={{ marginTop: 10 }}>
            {AUDIT_ITEMS.filter(i => i.group === g).map(i => {
              const v = state.approvals[i.id] ?? i.defaultState;
              return (
                <div key={i.id} className="panel tight">
                  <div className="row" style={{ flexWrap: 'wrap' }}>
                    <span className="badge mono">{i.id}</span><b style={{ flex: '1 1 260px' }}>{i.title}</b>
                    <div className="seg" role="group" aria-label={`Decision for ${i.id}`}>
                      {(['approved', 'pending', 'rejected'] as ApprovalState[]).map(s => <button key={s} className={v === s ? 'on' : ''} onClick={() => setItem(i.id, s)}>{s === 'approved' ? 'Approve' : s === 'pending' ? 'Pending' : 'Reject'}</button>)}
                    </div>
                  </div>
                  <p className="muted" style={{ fontSize: '.86rem', marginTop: 6 }}>{i.detail}</p>
                  {i.defaultReason && <p className="faint" style={{ fontSize: '.78rem', marginTop: 4 }}>Default: {i.defaultReason}</p>}
                  {i.projects.length > 0 && <p style={{ fontSize: '.78rem', marginTop: 4 }}>{i.projects.map((p, k) => <span key={p}>{k ? ' · ' : ''}{p === 'capstone' ? <Link to="/capstone">capstone</Link> : <Link to={`/project/${p}?tab=audit`}>{p}</Link>}</span>)}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="section">
        <h2>Project-level findings</h2>
        <table className="t" style={{ marginTop: 10 }}>
          <thead><tr><th>Project</th><th>Depth</th><th>Main issue found</th></tr></thead>
          <tbody>{Object.entries(FINDINGS).map(([id, f]) => <tr key={id}><td className="mono">{id === 'capstone' ? <Link to="/capstone">capstone</Link> : <Link to={`/project/${id}?tab=audit`}>{id}</Link>}</td><td><span className={`badge ${f.depth === 'Good' ? 'green' : f.depth === 'Weak' ? 'red' : f.depth === 'Thin' ? 'amber' : ''}`}>{f.depth}</span></td><td style={{ fontSize: '.84rem' }}>{f.issue}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
