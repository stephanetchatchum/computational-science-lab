import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { STAGES, stageProjects, isUnlocked } from '../content/curriculum';
import { currentProject, nextAction, projectFraction, stepsDone, stepCount } from '../lib/progress';
import { dueReviews } from '../state/store';
import { Md } from '../components/Markup';
import { AUDIT_ITEMS } from '../content/audit';

const LADDER = ['hand oracle', 'analytic solution', 'convergence order', 'calibration', 'held-out test', 'uncertainty quantification', 'reproduction'];
/** Which rung of the validation ladder each stage trains (from the original methodology roadmap). */
const RUNG_BY_STAGE = [0, 0, 2, 3, 4, 5, 6, 6];

const ago = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now'; if (d < 3600) return `${Math.floor(d / 60)} min ago`; if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return `${Math.floor(d / 86400)} d ago`;
};

function PlanBox() {
  const { state, update } = useApp();
  const [edit, setEdit] = useState(!state.plan);
  const [when, setWhen] = useState(state.plan?.when ?? '');
  const [then, setThen] = useState(state.plan?.then ?? '');
  if (!edit && state.plan) return (
    <div className="row" style={{ flexWrap: 'wrap', fontSize: '.88rem' }}>
      <span className="badge cyan">plan</span><span>If <b>{state.plan.when}</b>, then I will <b>{state.plan.then}</b>.</span>
      <button className="btn small ghost" onClick={() => setEdit(true)}>Change</button>
    </div>);
  return (
    <details className="panel tight" open={!state.plan ? undefined : true}>
      <summary style={{ cursor: 'pointer', fontSize: '.88rem' }}>Plan your next session as an if–then (optional)</summary>
      <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
        <span className="muted">If</span><input type="text" style={{ flex: '1 1 200px' }} placeholder="it is 7 pm and I am at my desk" value={when} onChange={e => setWhen(e.target.value)} aria-label="When" />
        <span className="muted">then I will</span><input type="text" style={{ flex: '1 1 200px' }} placeholder="open the next step and write the failing test" value={then} onChange={e => setThen(e.target.value)} aria-label="Then" />
        <button className="btn small primary" disabled={!when.trim() || !then.trim()} onClick={() => { update(s => ({ ...s, plan: { when: when.trim(), then: then.trim() } })); setEdit(false); }}>Save</button>
      </div>
    </details>);
}

export default function Dashboard() {
  usePage('Today');
  const { state, projects, done } = useApp();
  const next = nextAction(state, projects);
  const cur = currentProject(state, projects);
  const due = dueReviews(state);
  const pendingAudit = AUDIT_ITEMS.filter(i => (state.approvals[i.id] ?? i.defaultState) === 'pending').length;
  const undecided = 5 - Object.keys(state.decisions).length;
  const recent = [...state.history].reverse().filter(h => h.kind !== 'visit').slice(0, 7);
  const curStage = cur?.stage ?? 0;
  const doneCount = projects.filter(p => done.has(p.id)).length;
  const lessonsDone = Object.values(state.lessons).filter(l => l.completedAt).length;
  const topStage = Math.max(-1, ...projects.filter(p => done.has(p.id)).map(p => p.stage));
  const rung = topStage < 0 ? -1 : RUNG_BY_STAGE[topStage];

  return (
    <div className="stack" style={{ gap: 22 }}>
      <section className="panel accent hero-next" aria-labelledby="next-h">
        <div>
          <div className="kicker">Your next action</div>
          <h2 id="next-h"><Md text={next.title} /></h2>
          <p className="muted">{next.detail}</p>
        </div>
        <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
          <Link className="btn primary" to={next.to}>{next.cta} →</Link>
        </div>
      </section>

      <PlanBox />

      {state.lastLocation && state.lastLocation.path !== '/' && (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className="faint" style={{ fontSize: '.85rem' }}>You were last on</span>
          <Link to={state.lastLocation.path} className="btn small">{state.lastLocation.label}</Link>
          <span className="faint mono" style={{ fontSize: '.75rem' }}>{ago(state.lastLocation.at)}</span>
        </div>
      )}

      <div className="grid two">
        <section className="panel">
          <div className="kicker dim">Where you are</div>
          {cur ? (
            <div className="stack sm" style={{ marginTop: 8 }}>
              <h3>Stage {cur.stage} · {STAGES[cur.stage].name}</h3>
              <Link to={`/project/${cur.id}`} style={{ color: 'var(--text)' }}><span className="mono faint">{cur.id}</span> {cur.title}</Link>
              {cur.origin === 'original' && stepCount(cur.id) > 0 && <>
                <div className="bar"><span style={{ width: `${projectFraction(state, cur) * 100}%` }} /></div>
                <span className="faint" style={{ fontSize: '.8rem' }}>{stepsDone(state, cur.id)} of {stepCount(cur.id)} build steps ticked</span>
              </>}
              <div className="divider" />
              <div className="lbl">Objectives for this project</div>
              <ul className="list" style={{ fontSize: '.88rem' }}>
                {(cur.origin === 'audit' ? cur.oracles ?? [] : cur.milestones.slice(0, 3)).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          ) : <p className="muted">Everything unlocked is complete.</p>}
        </section>

        <section className="panel">
          <div className="kicker dim">Accomplished</div>
          <div className="stat-line" style={{ margin: '10px 0 14px' }}>
            <div className="stat"><b>{doneCount}<span className="faint" style={{ fontSize: '.9rem' }}>/{projects.length}</span></b><span>projects</span></div>
            <div className="stat"><b>{lessonsDone}</b><span>lessons</span></div>
            <div className="stat"><b>{state.journal.length}</b><span>journal notes</span></div>
          </div>
          <div className="lbl">Validation ladder — what you can already do</div>
          <div className="ladder" aria-label="Validation ladder">
            {LADDER.map((r, i) => <span key={r} className={i <= rung ? 'on' : ''}>{r}</span>).reduce<ReactNode[]>((a, el, i) => (i ? [...a, <i key={'a' + i}>→</i>, el] : [el]), [])}
          </div>
          <p className="faint" style={{ fontSize: '.78rem', marginTop: 8 }}>A rung lights up when you complete a project in the stage that trains it.</p>
        </section>
      </div>

      <section>
        <div className="section-head"><h2>Eight stages</h2><span className="spacer" /><Link to="/curriculum" className="btn small ghost">Open curriculum</Link></div>
        <div className="stage-map">
          {STAGES.map(s => {
            const ps = stageProjects(projects, s.id);
            return (
              <Link key={s.id} to={s.id === 7 ? '/capstone' : `/curriculum#stage-${s.id}`} className={`stage-cell ${s.id === curStage ? 'current' : ''}`}>
                <span className="n">STAGE {s.id}</span>
                <span className="t">{s.name}</span>
                <span className="dots" aria-label={`${ps.filter(p => done.has(p.id)).length} of ${ps.length} complete`}>
                  {ps.map(p => <i key={p.id} title={`${p.id} ${p.title}`} className={done.has(p.id) ? 'd' : p.origin === 'audit' ? 'n' : stepsDone(state, p.id) > 0 ? 'p' : ''} />)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid two">
        <section className="panel">
          <div className="section-head"><h3>Retrieval practice</h3><span className="spacer" /><Link className="btn small ghost" to="/review">Open</Link></div>
          {due.length ? <p>{due.length} concept{due.length > 1 ? 's are' : ' is'} due. About {Math.max(2, due.length)} minutes: recall first, then check.</p>
            : <p className="muted">Nothing due. Finish a lesson in the Concept lab and its key idea is scheduled for review.</p>}
          {(pendingAudit > 0 || undecided > 0) && <>
            <div className="divider" />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <span className="badge violet">audit</span>
              <span style={{ fontSize: '.88rem' }}>{pendingAudit} recommendations and {Math.max(0, undecided)} decisions await you. Nothing has been applied without your approval.</span>
              <Link to="/audit" className="btn small">Review</Link>
            </div>
          </>}
        </section>
        <section className="panel">
          <h3 style={{ marginBottom: 8 }}>Recent activity</h3>
          {recent.length ? (
            <ul className="timeline">
              {recent.map((h, i) => <li key={i}><time dateTime={h.at}>{ago(h.at)}</time><span><Md text={h.label} /></span></li>)}
            </ul>
          ) : <p className="muted">Nothing yet. Your ticks, lessons and notes will appear here.</p>}
        </section>
      </div>

      <section>
        <div className="section-head"><h2>Ready to start</h2><span className="faint" style={{ fontSize: '.85rem' }}>unlocked and not finished</span></div>
        <div className="proj-list">
          {projects.filter(p => !done.has(p.id) && isUnlocked(p, done)).slice(0, 4).map(p => (
            <Link key={p.id} to={`/project/${p.id}`} className="proj-row">
              <span className={`status-icon ${stepsDone(state, p.id) ? 'prog' : ''}`}>{stepsDone(state, p.id) ? '◐' : ''}</span>
              <span className="pid">{p.id}</span>
              <span className="ttl">{p.title}<small>{p.firstWin ? p.firstWin.replace(/^(Early win|Within the first (hour|sitting)): ?/, '') : p.summary}</small></span>
              <span className="badge">{p.time}</span>
              {p.origin === 'audit' ? <span className="badge violet">new · spec</span> : <span className="badge">{p.domain}</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
