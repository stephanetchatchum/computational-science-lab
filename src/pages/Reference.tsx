import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { setupPageHTML, setGuideProgress, setOS } from '../content/legacy/guideExtras.js';
import { STAGES, CAPSTONE, stageProjects, stageConcepts, isApproved } from '../content/curriculum';
import { ROADMAP_ADDITIONS, REVISIONS, PACING } from '../content/audit';
import research from '../content/research.json';

/* ---------------------------------------------------------------- Setup (original page, unchanged text) */
export function Setup() {
  usePage('Setup');
  const { state, toggleStep, setSettings } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => { setGuideProgress(state.guideProgress); setOS(state.settings.os); return setupPageHTML(); }, [state.guideProgress, state.settings.os]);
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    const os = t.closest('[data-os]') as HTMLElement | null;
    if (os) { setSettings({ os: os.dataset.os as 'win' | 'unix' }); return; }
    const cp = t.closest('[data-copy]') as HTMLElement | null;
    if (cp) { const pre = cp.parentElement?.querySelector('pre'); if (pre) navigator.clipboard?.writeText(pre.textContent ?? '').then(() => { cp.textContent = 'Copied'; setTimeout(() => (cp.textContent = 'Copy'), 1400); }).catch(() => {}); }
  };
  const onChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const t = e.target as unknown as HTMLInputElement;
    if (t.dataset.step) toggleStep('setup', 's' + t.dataset.step, `Setup step ${t.dataset.step}`);
  };
  const ticks = Object.values(state.guideProgress.setup || {}).filter(Boolean).length;
  return (
    <div className="content narrow" style={{ padding: 0 }}>
      <div className="notice cyan" style={{ marginBottom: 18 }}>{ticks}/5 install steps ticked. Tick the box on each step; the Windows and Mac/Linux buttons switch every command on this page. The reader described below is the ▶ Listen button in the top bar.</div>
      <div ref={ref} className="legacy-html" onClick={onClick} onChange={onChange} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ---------------------------------------------------------------- Roadmaps */
export function Roadmaps() {
  usePage('Roadmaps');
  const { projects, state } = useApp();
  const f2 = isApproved(state.approvals, 'F2');
  const cols = [{ label: 'Mathematics', key: 'math' as const }, { label: 'Physics & science', key: 'physics' as const }, { label: 'Computing & numerical methods', key: 'programming' as const }];
  const timeline = [
    ['Stage 0–1', 'Correctness by hand', 'Every early result checked by hand or against a known formula — the root habit of validation.'],
    ['Stage 1', 'Reproducibility', 'Git, tests, a clean environment — a result only you can reproduce isn\'t yet a result.'],
    ['Stage 2–3', 'Convergence & error order', 'Empirically confirming theoretical convergence rates instead of assuming code that runs is code that\'s right.'],
    ...(f2 ? [[ROADMAP_ADDITIONS.timeline.stage, ROADMAP_ADDITIONS.timeline.title, ROADMAP_ADDITIONS.timeline.text]] : []),
    ['Stage 3–4', 'Calibration against real data', 'Fitting models to real historical records and being honest about fit quality.'],
    ['Stage 4–5', 'Held-out validation', 'Time-aware cross-validation, surrogate-model testing on unseen points.'],
    ['Stage 5–6', 'Uncertainty quantification', 'Ensembles and formal sensitivity analysis — knowing how much to trust an answer, not just what it is.'],
    ['Stage 6', 'Literature reproduction & inquiry', 'Reproducing a published result, then running your own proposal-to-pilot research cycle.'],
    ['Stage 7', 'Capstone', 'All of the above, integrated, on one substantial real problem, backtested honestly against history.'],
  ];
  return (
    <div>
      <h1>Roadmaps</h1>
      <p className="muted prose" style={{ margin: '6px 0 18px' }}>The same {projects.length} projects sliced by subject instead of by stage.</p>
      <div className="grid three">
        {cols.map(c => (
          <section key={c.key} className="panel">
            <h3 style={{ marginBottom: 10 }}>{c.label}</h3>
            <div className="stack sm">
              {STAGES.filter(s => s.id < 7).map(s => { const cs = stageConcepts(projects, s.id, c.key); return cs.length ? (
                <div key={s.id} style={{ fontSize: '.84rem' }}><span className="badge cyan">Stage {s.id}</span><div style={{ marginTop: 4 }}>{cs.join(' · ')}</div></div>) : null; })}
              {f2 && c.key === 'math' && <div style={{ fontSize: '.84rem' }}><span className="badge violet">audit F2</span><div style={{ marginTop: 4 }}>{ROADMAP_ADDITIONS.math.join(' · ')}</div></div>}
            </div>
          </section>
        ))}
      </div>
      <section className="section">
        <h2>Research & scientific-methodology roadmap</h2>
        <div className="panel"><ul className="timeline">{timeline.map(([a, b, c]) => <li key={b}><time>{a}</time><span><b>{b}</b> — <span className="muted">{c}</span></span></li>)}</ul></div>
      </section>
      <section className="section">
        <h2>Pacing</h2>
        <div className="grid three">{(state.decisions.pacing === 'accept' || isApproved(state.approvals, 'E2') ? PACING.revised : PACING.original).map(p => <div key={p.label} className="panel tight"><div className="kicker dim">{p.label}</div><div className="mono" style={{ fontSize: '1.3rem', margin: '4px 0' }}>{p.value}</div><p className="muted" style={{ fontSize: '.85rem' }}>{p.text}</p></div>)}</div>
        <p className="faint" style={{ fontSize: '.8rem', marginTop: 8 }}>{isApproved(state.approvals, 'E2') ? 'Revised pacing (audit E2 approved).' : 'Original pacing. The audit proposes 3.5 y / 2.3 y / 16 months (item E2).'} Stage workloads on the Curriculum page are summed from each project’s own estimate.</p>
      </section>
      <p className="faint" style={{ marginTop: 18, fontSize: '.85rem' }}>Stage list: {STAGES.map(s => `${s.id} ${s.name} (${stageProjects(projects, s.id).length})`).join(' · ')}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Capstone */
export function Capstone() {
  usePage('Capstone');
  const { state, done, projects } = useApp();
  const p = CAPSTONE.primary;
  const b10 = isApproved(state.approvals, 'B10');
  const stage6 = projects.filter(x => x.stage === 6);
  return (
    <div>
      <h1>Capstone</h1>
      <p className="muted prose" style={{ margin: '6px 0 18px' }}>Not chosen yet, on purpose — pick it once you know what you can do. Reachable after Stage 6 ({stage6.filter(x => done.has(x.id)).length}/{stage6.length} done).</p>
      <section className="panel accent stack">
        <div className="kicker">Recommended primary direction</div>
        <h2>{p.title}</h2>
        <div className="btn-row">{p.integrates.map(i => <span key={i} className="badge">{i}</span>)}</div>
        <dl className="dl"><dt>Description</dt><dd>{p.description}</dd><dt>Data sources</dt><dd>{p.dataSource}</dd><dt>Deliverable</dt><dd>{p.deliverableType}</dd><dt>Validation plan</dt><dd>{p.validation}</dd></dl>
        {b10 ? <div className="notice violet"><b>Required (audit B10):</b> {REVISIONS.find(r => r.project === 'capstone')?.text}</div>
          : <p className="faint" style={{ fontSize: '.82rem' }}>Audit item B10 (uncertainty propagation and a skill score) is pending. <Link to="/audit">Review</Link></p>}
      </section>
      <section className="section"><h2>Alternative directions</h2>
        <div className="grid three">{CAPSTONE.alternatives.map(a => <div key={a.title} className="panel tight"><div className="kicker dim">{a.domain}</div><h3 style={{ margin: '6px 0' }}>{a.title}</h3><p className="muted" style={{ fontSize: '.88rem' }}>{a.description}</p></div>)}</div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- About / research */
type R = typeof research;
const STRENGTH: Record<string, string> = { strong: 'green', moderate: 'cyan', promising: 'amber', practice: '' };
export function About() {
  usePage('How this app teaches');
  const [open, setOpen] = useState<number | null>(null);
  const r: R = research;
  return (
    <div className="content narrow" style={{ padding: 0 }}>
      <h1>How this app teaches, and why</h1>
      <p className="notice" style={{ margin: '12px 0 18px' }}>{r.boundary}</p>
      <p className="muted" style={{ marginBottom: 12, fontSize: '.9rem' }}>Each feature below is tied to the evidence behind it. Strength labels: {Object.entries(r.evidenceKey).map(([k, v]) => <span key={k}><span className={`badge ${STRENGTH[k]}`}>{k}</span> {v} </span>)}</p>
      <div className="stack sm">
        {r.items.map((it, i) => (
          <article key={i} className="panel tight">
            <button className="row" style={{ background: 'none', border: 0, width: '100%', textAlign: 'left', padding: 0 }} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <b style={{ flex: 1 }}>{it.feature}</b>
              <span className={`badge ${STRENGTH[it.strength]}`}>{it.strength}</span>
              <span className={`badge ${it.adhdSpecific ? 'violet' : ''}`}>{it.adhdSpecific ? 'ADHD-specific' : 'general learning science'}</span>
            </button>
            {open === i && <div style={{ marginTop: 10, fontSize: '.9rem' }}>
              <p>{it.finding}</p>
              {it.sources.length > 0 && <ul className="list" style={{ marginTop: 8, fontSize: '.82rem' }}>{it.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>}
            </div>}
          </article>
        ))}
      </div>
      <section className="section"><h2>Reference guidance</h2><ul className="list" style={{ marginTop: 8 }}>{r.references.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></section>
    </div>
  );
}

export function NotFound() {
  usePage('Not found');
  return <div className="empty">That page does not exist. <Link to="/">Go to Today</Link></div>;
}
