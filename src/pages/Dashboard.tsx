import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { STAGES, stageProjects, isUnlocked } from '../content/curriculum';
import { currentProject, nextAction, projectFraction, stepsDone, stepCount } from '../lib/progress';
import { dueReviews } from '../state/store';
import { Md } from '../components/Markup';
import { VizWidget } from '../components/VizWidget';
import { HERO_VIZ } from '../content/legacy/guideExtras.js';
import { QUICK_WIN_IDS, QUICK_WIN_TEXT, DomainBadge } from '../components/Badges';

const LADDER = ['hand oracle', 'analytic solution', 'convergence order', 'calibration', 'held-out test', 'uncertainty quantification', 'reproduction'];
const RUNG_BY_STAGE = [0, 0, 2, 3, 4, 5, 6, 6];
const ago = (iso: string) => { const d = (Date.now() - new Date(iso).getTime()) / 1000; if (d < 60) return 'just now'; if (d < 3600) return `${Math.floor(d / 60)} min ago`; if (d < 86400) return `${Math.floor(d / 3600)} h ago`; return `${Math.floor(d / 86400)} d ago`; };

function PlanBox() {
  const { state, update } = useApp();
  const [edit, setEdit] = useState(false);
  const [when, setWhen] = useState(state.plan?.when ?? ''); const [then, setThen] = useState(state.plan?.then ?? '');
  if (state.plan && !edit) return <p className="muted" style={{ fontSize: '.92rem' }}>Your plan: if <b>{state.plan.when}</b>, then I will <b>{state.plan.then}</b>. <button className="btn small ghost" onClick={() => setEdit(true)}>Change</button></p>;
  return (
    <details open={edit || undefined}>
      <summary className="muted" style={{ fontSize: '.9rem' }}>Plan your next session as an if–then (optional)</summary>
      <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        <span className="muted">If</span><input type="text" style={{ flex: '1 1 200px' }} placeholder="it is 7 pm and I am at my desk" value={when} onChange={e => setWhen(e.target.value)} aria-label="When" />
        <span className="muted">then I will</span><input type="text" style={{ flex: '1 1 200px' }} placeholder="open the next step and write the failing test" value={then} onChange={e => setThen(e.target.value)} aria-label="Then" />
        <button className="btn small primary" disabled={!when.trim() || !then.trim()} onClick={() => { update(s => ({ ...s, plan: { when: when.trim(), then: then.trim() } })); setEdit(false); }}>Save</button>
      </div>
    </details>
  );
}

export default function Dashboard() {
  usePage('Today');
  const { state, projects, done, projectById } = useApp();
  const next = nextAction(state, projects);
  const cur = currentProject(state, projects);
  const due = dueReviews(state);
  const curStage = cur?.stage ?? 0;
  const doneCount = projects.filter(p => done.has(p.id)).length;
  const topStage = Math.max(-1, ...projects.filter(p => done.has(p.id)).map(p => p.stage));
  const rung = topStage < 0 ? -1 : RUNG_BY_STAGE[topStage];
  const hero = cur ? HERO_VIZ[cur.id] : undefined;
  const recent = [...state.history].reverse().filter(h => h.kind !== 'visit').slice(0, 6);
  const quick = QUICK_WIN_IDS.map(id => projectById(id)).filter(Boolean) as NonNullable<ReturnType<typeof projectById>>[];

  return (
    <div className="page">
      <section aria-labelledby="next-h">
        <div className="kicker">Your next action</div>
        <h1 id="next-h" style={{ margin: '8px 0 6px' }}><Md text={next.title} /></h1>
        <p className="lead">{next.detail}</p>
        <div className="row" style={{ marginTop: 18, flexWrap: 'wrap' }}>
          <Link className="btn primary" to={next.to} style={{ fontSize: '1rem', padding: '11px 20px' }}>{next.cta} →</Link>
          {state.lastLocation && state.lastLocation.path !== '/' && state.lastLocation.path !== next.to &&
            <Link to={state.lastLocation.path} className="btn ghost">Back to {state.lastLocation.label} <span className="faint mono" style={{ fontSize: '.75rem' }}>· {ago(state.lastLocation.at)}</span></Link>}
          {due.length > 0 && <Link to="/review" className="btn ghost">↻ {due.length} to review</Link>}
        </div>
        <div style={{ marginTop: 14 }}><PlanBox /></div>
      </section>

      {hero && cur && next.kind === 'step' && (
        <section className="section">
          <div className="kicker dim">The idea behind {cur.id}</div>
          <VizWidget name={hero[0]} caption={null} />
        </section>
      )}

      <section className="section">
        <div className="qw-head"><h2>🎮 Start here — the fastest path to something moving on screen</h2></div>
        <p className="muted" style={{ fontSize: '.92rem', marginBottom: 12 }}>{QUICK_WIN_TEXT}</p>
        <div className="qw-row">
          {quick.map(p => {
            const unlocked = isUnlocked(p, done);
            return (
              <Link key={p.id} to={`/project/${p.id}`} className={`qw-card ${unlocked ? '' : 'locked'}`}>
                <span className="faint mono" style={{ fontSize: '.74rem' }}>Stage {p.stage}{done.has(p.id) ? ' · ✓ done' : unlocked ? '' : ' · locked'}</span>
                <h4>{p.title}</h4>
                <p>{p.firstWin}</p>
                <span style={{ marginTop: 'auto' }}><DomainBadge domain={p.domain} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Where you are</h2><span className="spacer" /><span className="mono faint" style={{ fontSize: '.85rem' }}>{doneCount}/{projects.length} projects</span></div>
        <div className="stage-map">
          {STAGES.map(s => {
            const ps = stageProjects(projects, s.id);
            return (
              <Link key={s.id} to={s.id === 7 ? '/capstone' : `/curriculum?stage=${s.id}`} className={`stage-cell ${s.id === curStage ? 'current' : ''}`}>
                <span className="n">STAGE {s.id}</span><span className="t">{s.name}</span>
                <span className="dots">{ps.map(p => <i key={p.id} title={`${p.id} ${p.title}`} className={done.has(p.id) ? 'd' : stepsDone(state, p) > 0 ? 'p' : ''} />)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <details className="section">
        <summary><h2 style={{ display: 'inline' }}>Your progress in detail</h2></summary>
        <div className="stack" style={{ marginTop: 16 }}>
          {cur && <div>
            <div className="lbl">Current project</div>
            <Link to={`/project/${cur.id}`} style={{ color: 'var(--text)' }}><span className="mono faint">{cur.id}</span> {cur.title}</Link>
            {stepCount(state, cur) > 0 && <><div className="bar" style={{ margin: '8px 0 4px' }}><span style={{ width: `${projectFraction(state, cur) * 100}%` }} /></div>
              <span className="faint" style={{ fontSize: '.82rem' }}>{stepsDone(state, cur)} of {stepCount(state, cur)} required steps ticked</span></>}
          </div>}
          <div>
            <div className="lbl">Validation ladder — lights up as you finish stages</div>
            <div className="ladder">{LADDER.map((r, i) => <span key={r} className={i <= rung ? 'on' : ''}>{r}</span>).reduce<ReactNode[]>((a, el, i) => (i ? [...a, <i key={'a' + i}>→</i>, el] : [el]), [])}</div>
          </div>
          <div>
            <div className="lbl">Recent activity</div>
            {recent.length ? <ul className="timeline">{recent.map((h, i) => <li key={i}><time dateTime={h.at}>{ago(h.at)}</time><span><Md text={h.label} /></span></li>)}</ul> : <p className="faint">Nothing yet.</p>}
          </div>
        </div>
      </details>
    </div>
  );
}
