import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { STAGES, GUIDES, GUIDES_2D, isUnlocked, milestonesFor, revisionsFor, type Project as P, type Guide } from '../content/curriculum';
import { FINDINGS, AUDIT_ITEMS, DECISIONS } from '../content/audit';
import { HERO_VIZ, STEP_VIZ, setupStepFor, gitStepFor, guideMarkdown, comeBackCommands } from '../content/legacy/guideExtras.js';
import type { GuideStep } from '../content/legacy/curriculum.js';
import { Md, Html, paragraphs, stripMarkup } from '../components/Markup';
import { CodeBlock } from '../components/CodeBlock';
import { VizWidget } from '../components/VizWidget';
import { Reveal } from '../components/Reveal';
import { ReadAloud } from '../components/ReadAloud';
import { QuickNote } from '../components/QuickNote';
import { LESSONS } from '../content/lessons';

type Tab = 'overview' | 'build' | 'validate' | 'debug' | 'science' | 'audit' | 'notes';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' }, { id: 'build', label: 'Build guide' }, { id: 'validate', label: 'Tests & finish' },
  { id: 'debug', label: 'If stuck' }, { id: 'science', label: 'Science & maths' }, { id: 'audit', label: 'Audit' }, { id: 'notes', label: 'Notes & reflection' },
];

const isTestCode = (code: string) => /def test_|import pytest|^\s*assert /m.test(code);

interface FullStep extends GuideStep { viz?: string; vizCap?: string; tree?: string }
function allSteps(p: P, g: Guide): FullStep[] {
  const sv = STEP_VIZ[p.id] || {};
  return [setupStepFor(p, g) as FullStep, ...g.steps.map((s, i) => (sv[i] ? { ...s, viz: sv[i][0], vizCap: sv[i][1] } : s)), gitStepFor(p, g)];
}

function StepCard({ n, st, done, current, onToggle, assistance, pid }: { n: number; st: FullStep; done: boolean; current: boolean; onToggle: () => void; assistance: 'full' | 'guided' | 'independent'; pid: string }) {
  const code = st.code ? (
    isTestCode(st.code) || assistance === 'full'
      ? <div><div className="lbl code">Write this in the file</div><CodeBlock code={st.code} /></div>
      : <div><div className="lbl code">Code for this step</div>
          <Reveal label="Reveal the code" prompt="Write it from the instructions above first. Reveal only to compare.">
            <CodeBlock code={st.code} />
          </Reveal></div>
  ) : null;
  const doList = st.do?.length ? <div><div className="lbl">Do this</div><ol className="do">{st.do.map((d, i) => <Md key={i} as="li" text={d} />)}</ol></div> : null;
  const speak = [`Step ${n}. ${st.t}`, st.why ?? '', ...(st.do ?? []), st.see ? `You should see: ${st.see}` : ''].map(stripMarkup).join('. ');
  return (
    <section id={`step-${n}`} className={`step ${done ? 'done' : ''} ${current ? 'current' : ''}`} aria-labelledby={`step-${n}-t`}>
      <div className="step-h">
        <button type="button" className="tick" onClick={onToggle} aria-pressed={done} aria-label={done ? `Untick step ${n}` : `Mark step ${n} as done`}>{done ? '✓' : n}</button>
        <h3 id={`step-${n}-t`}><Md text={st.t} /></h3>
        <span className="spacer" />
        <ReadAloud text={speak} />
      </div>
      {st.why && <p className="step-why"><Md text={st.why} /></p>}
      <div className="step-body">
        {st.viz && <div><div className="lbl lbl-viz">See it before you build it</div><VizWidget name={st.viz} caption={st.vizCap} /></div>}
        {assistance === 'independent' && doList ? <Reveal label="Show detailed instructions" prompt="Independent mode: plan this step yourself from the title and the expected result.">{doList}</Reveal> : doList}
        {st.tree && <div><div className="lbl">Your folder should look like this</div><CodeBlock code={st.tree} kind="tree" /></div>}
        {code}
        {st.run && <div><div className="lbl run">Run this</div><CodeBlock code={st.run} kind="cmd" /></div>}
        {st.see && <div><div className="lbl see">You should see</div><div className="see"><Md text={st.see} /></div></div>}
        {st.hint && (assistance === 'full'
          ? <div><div className="lbl hint">Hint</div><div className="hint"><Md text={st.hint} /></div></div>
          : <Reveal label="Show hint" prompt="Stuck on this step?"><div><div className="lbl hint">Hint</div><div className="hint"><Md text={st.hint} /></div></div></Reveal>)}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Link className="btn small ghost" to={`/journal?new=debugging&ref=${pid}&step=${n}`}>Log a debugging lesson</Link>
          <button type="button" className={`btn small ${done ? '' : 'primary'}`} onClick={onToggle}>{done ? 'Untick' : 'Done — next step'}</button>
        </div>
      </div>
    </section>
  );
}

function BuildTab({ p, g, guideKey }: { p: P; g: Guide; guideKey: string }) {
  const { state, toggleStep, setSettings } = useApp();
  const [params, setParams] = useSearchParams();
  const steps = useMemo(() => allSteps(p, g), [p, g, state.settings.os]); // eslint-disable-line react-hooks/exhaustive-deps
  const prog = state.guideProgress[guideKey] || {};
  const firstOpen = steps.findIndex((_, i) => !prog['s' + i]);
  const want = params.get('step');
  const [cur, setCur] = useState<number>(want !== null ? Number(want) : Math.max(0, firstOpen));
  const oneAtATime = state.settings.focusMode;
  useEffect(() => { if (want !== null) setCur(Number(want)); }, [want]);
  useEffect(() => { document.getElementById(`step-${cur}`)?.scrollIntoView({ block: 'start', behavior: state.settings.reducedMotion ? 'auto' : 'smooth' }); }, [cur, oneAtATime]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (n: number) => { setCur(n); params.set('step', String(n)); setParams(params, { replace: true }); };
  const toggle = (i: number) => {
    const wasDone = !!prog['s' + i];
    toggleStep(guideKey, 's' + i, `${p.id} step ${i}: ${stripMarkup(steps[i].t)}`);
    if (!wasDone && i < steps.length - 1) go(i + 1);
  };
  const doneN = steps.filter((_, i) => prog['s' + i]).length;
  const visible = oneAtATime ? [cur] : steps.map((_, i) => i);
  return (
    <div className="ws-grid">
      <div>
        <div className="row" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="faint" style={{ fontSize: '.85rem' }}>Do the steps in order. Tests come first: write the check, watch it fail, then make it pass.</span>
          <span className="spacer" />
          <div className="seg" role="group" aria-label="Commands for">
            <button className={state.settings.os === 'unix' ? 'on' : ''} onClick={() => setSettings({ os: 'unix' })}>Mac / Linux</button>
            <button className={state.settings.os === 'win' ? 'on' : ''} onClick={() => setSettings({ os: 'win' })}>Windows</button>
          </div>
        </div>
        {visible.map(i => <StepCard key={i} n={i} st={steps[i]} pid={p.id} done={!!prog['s' + i]} current={i === cur} onToggle={() => toggle(i)} assistance={state.settings.assistance} />)}
        {oneAtATime && <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" disabled={cur === 0} onClick={() => go(cur - 1)}>← Previous step</button><span className="spacer" />
          <button className="btn" disabled={cur >= steps.length - 1} onClick={() => go(cur + 1)}>Next step →</button>
        </div>}
        {!oneAtATime && <p className="faint" style={{ marginTop: 14, fontSize: '.82rem' }}>Coming back another day? Run these first: <code>{comeBackCommands(g.slug, state.settings.os).replace('\n', ' ; ')}</code></p>}
      </div>
      <aside className="ws-aside">
        <div className="panel tight">
          <div className="row"><b style={{ fontSize: '.85rem' }}>Steps</b><span className="spacer" /><span className="mono faint" style={{ fontSize: '.78rem' }}>{doneN}/{steps.length}</span></div>
          <div className="bar" style={{ margin: '8px 0 10px' }}><span style={{ width: `${(doneN / steps.length) * 100}%` }} /></div>
          <div className="step-nav">
            {steps.map((s, i) => <button key={i} className={`${prog['s' + i] ? 'done' : ''} ${i === cur ? 'on' : ''}`} onClick={() => go(i)}><span className="sn">{prog['s' + i] ? '✓' : i}</span><span>{stripMarkup(s.t)}</span></button>)}
          </div>
        </div>
        <div className="panel tight" style={{ fontSize: '.8rem' }}>
          <b>Assistance</b>
          <div className="seg" style={{ marginTop: 8, display: 'flex' }}>
            {(['full', 'guided', 'independent'] as const).map(a => <button key={a} className={state.settings.assistance === a ? 'on' : ''} onClick={() => setSettings({ assistance: a })} style={{ flex: 1 }}>{a}</button>)}
          </div>
          <p className="faint" style={{ marginTop: 6 }}>{state.settings.assistance === 'full' ? 'Everything visible.' : state.settings.assistance === 'guided' ? 'Tests visible; implementation code and hints behind a click.' : 'Only goal, command and expected result; instructions on request.'}</p>
        </div>
      </aside>
    </div>
  );
}

function ValidateTab({ p, g, guideKey }: { p: P; g?: Guide; guideKey: string }) {
  const { state, done, toggleStep, toggleMilestone, setCompleted, projects } = useApp();
  const nav = useNavigate();
  const prog = state.guideProgress[guideKey] || {};
  const ms = milestonesFor(p, state.approvals);
  const mprog = state.milestones[p.id] || {};
  const rev = revisionsFor(p.id, state.approvals).approved.filter(r => r.kind !== 'text');
  const checks = g?.done ?? [];
  const openChecks = checks.filter((_, i) => !prog['d' + i]).length;
  const openReq = ms.filter(m => !m.optional && !mprog[m.index]).length + rev.filter((_, i) => !mprog['a' + i]).length;
  const [confirm, setConfirm] = useState(false);
  const isDone = done.has(p.id);
  const idx = projects.findIndex(x => x.id === p.id), nextP = projects[idx + 1];
  return (
    <div className="stack" style={{ gap: 26 }}>
      <section>
        <h2>Validation — how you will know it is right</h2>
        <p className="muted" style={{ margin: '4px 0 12px', fontSize: '.9rem' }}>These are the numerical oracles and checks from the specification. A result that has not passed them is not a result yet.</p>
        <div className="stack sm">{p.validation.map((v, i) => <div key={i} className="oracle"><span className="o">CHECK {i + 1}</span><span>{v}</span></div>)}</div>
      </section>
      {checks.length > 0 && <section>
        <h2>You are finished when all of these are true</h2>
        <ul className="checklist" style={{ marginTop: 10 }}>
          {checks.map((d, i) => <li key={i} className={prog['d' + i] ? 'on' : ''}><input type="checkbox" checked={!!prog['d' + i]} onChange={() => toggleStep(guideKey, 'd' + i, `${p.id} finish check ${i + 1}`)} aria-label={`Finish check ${i + 1}`} /><Md text={d} /></li>)}
        </ul>
      </section>}
      {ms.length > 0 && <section>
        <h2>Specification milestones</h2>
        <ul className="checklist" style={{ marginTop: 10 }}>
          {ms.map(m => <li key={m.index} className={`${mprog[m.index] ? 'on' : ''} ${m.optional ? 'optional' : ''}`}><input type="checkbox" checked={!!mprog[m.index]} onChange={() => toggleMilestone(p.id, m.index, `${p.id} milestone ${m.index + 1}`)} aria-label={`Milestone ${m.index + 1}`} /><span>{m.optional && <span className="badge violet" style={{ marginRight: 6 }}>optional (audit E1)</span>}{m.text}</span></li>)}
        </ul>
      </section>}
      {rev.length > 0 && <section>
        <h2>Required additions you approved</h2>
        <ul className="checklist" style={{ marginTop: 10 }}>
          {rev.map((r, i) => <li key={i} className={mprog['a' + i] ? 'on' : ''}><input type="checkbox" checked={!!mprog['a' + i]} onChange={() => toggleMilestone(p.id, 'a' + i, `${p.id} audit addition ${r.item}`)} aria-label={`Audit addition ${i + 1}`} /><span><span className="badge violet" style={{ marginRight: 6 }}>{r.item} · {r.kind}</span>{r.text}</span></li>)}
        </ul>
      </section>}
      <section className={`panel ${isDone ? '' : 'accent'}`}>
        <h2>Finish</h2>
        {isDone ? <p style={{ margin: '8px 0' }}>Marked complete. <button className="btn small ghost" onClick={() => setCompleted(p.id, false)}>Undo</button></p> : <>
          <p className="muted" style={{ margin: '6px 0 12px' }}>{openChecks + openReq === 0 ? 'Every check is ticked.' : `${openChecks} finish check(s) and ${openReq} required milestone(s) are not ticked yet.`} Completion is your own honest judgement; it unlocks the projects that depend on this one.</p>
          {!confirm || openChecks + openReq === 0
            ? <button className="btn primary" onClick={() => (openChecks + openReq === 0 ? setCompleted(p.id, true) : setConfirm(true))}>Mark this project complete</button>
            : <div className="row" style={{ flexWrap: 'wrap' }}><span className="notice">Some checks are open. Mark complete anyway?</span><button className="btn primary" onClick={() => { setCompleted(p.id, true); setConfirm(false); }}>Yes, it is validated</button><button className="btn ghost" onClick={() => setConfirm(false)}>Not yet</button></div>}
        </>}
        {isDone && nextP && <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={() => nav(`/project/${nextP.id}`)}>Next: {nextP.id} {nextP.title.split(':')[0]} →</button><Link className="btn ghost" to={`/journal?new=reflection&ref=${p.id}`}>Write a reflection</Link></div>}
      </section>
    </div>
  );
}

function AuditTab({ p }: { p: P }) {
  const { state } = useApp();
  const f = FINDINGS[p.id]; const r = revisionsFor(p.id, state.approvals);
  const items = AUDIT_ITEMS.filter(i => i.projects.includes(p.id));
  return (
    <div className="stack">
      {f && <div className="panel audit tight"><div className="kicker violet">Audit finding · science depth: {f.depth}</div><p style={{ marginTop: 6 }}>{f.issue}</p></div>}
      {r.approved.length > 0 && <section><h3>Approved changes</h3><ul className="list" style={{ marginTop: 8 }}>{r.approved.map((x, i) => <li key={i}><span className="badge green">{x.item}</span> <span className="badge">{x.kind}</span> {x.text}</li>)}</ul></section>}
      {r.proposed.length > 0 && state.settings.showProposed && <section><h3>Proposed — awaiting your decision</h3><ul className="list" style={{ marginTop: 8 }}>{r.proposed.map((x, i) => <li key={i} className="muted"><span className="badge violet">{x.item}</span> <span className="badge">{x.kind}</span> {x.text}</li>)}</ul></section>}
      {items.length > 0 && <p className="faint" style={{ fontSize: '.85rem' }}>Related audit items: {items.map(i => i.id).join(', ')}. <Link to="/audit">Approve or reject them</Link>. Original guide text is never rewritten; approved changes appear as additional required work.</p>}
      {!f && !items.length && <div className="empty">The audit has no findings for this project.</div>}
    </div>
  );
}

function SpecOnly({ p }: { p: P }) {
  const { state } = useApp();
  const dec = state.decisions.guides;
  return (
    <div className="stack">
      <div className="notice violet">New project from the scientific audit (item {p.auditItem}). It has a specification and oracles but <b>no build guide yet</b>{dec ? ` — your decision: ${DECISIONS[0].options.find(o => o.id === dec)?.label}.` : '. Decision 1 (full guides or specifications only) is still open.'} No steps or oracle values are invented here.</div>
      <section><h2>What you will build</h2><p className="prose" style={{ marginTop: 8 }}>{p.summary}</p></section>
      <section><h2>Oracles</h2><div className="stack sm" style={{ marginTop: 8 }}>{(p.oracles ?? []).map((o, i) => <div key={i} className="oracle"><span className="o">ORACLE</span><span>{o}</span></div>)}</div></section>
      {p.labWidget && <section><h2>Explore the idea first</h2><VizWidget name={p.labWidget} /><Link className="btn small" to={`/lesson/${p.labWidget}`}>Open the full lesson</Link></section>}
      {!dec && <Link className="btn" to="/audit#decisions">Record Decision 1</Link>}
    </div>
  );
}

export default function Project() {
  const { id = '' } = useParams();
  const { projectById, state, done, log } = useApp();
  const p = projectById(id);
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab'); const tab = (rawTab === 'finish' ? 'validate' : rawTab) as Tab | null;
  const twoDAllowed = state.decisions.twoD === 'toggle' && !!GUIDES_2D[id];
  const [twoD, setTwoD] = useState(false);
  usePage(p ? `${p.id} · ${p.title.split(':')[0]}` : 'Project not found', p ? [{ label: 'Curriculum', to: '/curriculum' }, { label: `Stage ${p.stage}`, to: `/curriculum#stage-${p.stage}` }, { label: p.id }] : undefined);
  useEffect(() => { if (p) log({ kind: 'visit', ref: p.id, label: `Opened ${p.id}` }); }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <div className="empty">No project with id “{id}”. <Link to="/curriculum">Back to the curriculum</Link></div>;
  const g = twoD && twoDAllowed ? GUIDES_2D[id] : GUIDES[id];
  const guideKey = twoD && twoDAllowed ? `${id}@2d` : id;
  const active: Tab = tab ?? (p.origin === 'audit' ? 'overview' : state.guideProgress[guideKey] ? 'build' : 'overview');
  const setTab = (t: Tab) => { params.set('tab', t); params.delete('step'); setParams(params); };
  const locked = !isUnlocked(p, done);
  const hero = HERO_VIZ[p.id];
  const lessonLinks = Object.values(LESSONS).filter(l => hero?.[0] === l.id || Object.values(STEP_VIZ[p.id] || {}).some(v => v[0] === l.id));

  const download = () => {
    if (!g) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([guideMarkdown(p, g)], { type: 'text/markdown' }));
    a.download = `${g.slug}-GUIDE.md`; document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <div>
      <div className="ws-head">
        <div>
          <div className="meta">
            <span className="badge cyan">{p.id}</span><span className="badge">Stage {p.stage} · {STAGES[p.stage].name}</span>
            <span className="badge">{p.domain}</span><span className="badge">{p.difficulty}</span><span className="badge">{p.time}</span>
            {done.has(p.id) && <span className="badge green">complete</span>}
            {locked && <span className="badge amber">locked</span>}
          </div>
          <h1>{p.title}</h1>
          {p.firstWin && <p className="muted"><b style={{ color: 'var(--accent)' }}>First win · </b>{p.firstWin.replace(/^(Early win|Within the first (hour|sitting)): ?/, '')}</p>}
        </div>
        <div className="panel tight stack sm">
          <div className="lbl">Prerequisites</div>
          {p.prereqs.length ? p.prereqs.map(q => <Link key={q} to={`/project/${q}`} style={{ fontSize: '.85rem' }}>{done.has(q) ? '✓' : '○'} {q}</Link>) : <span className="faint" style={{ fontSize: '.85rem' }}>None — start now.</span>}
          {g && <button className="btn small ghost" onClick={download}>Download guide (.md)</button>}
          {twoDAllowed && <div className="seg"><button className={!twoD ? 'on' : ''} onClick={() => setTwoD(false)}>3D (Ursina)</button><button className={twoD ? 'on' : ''} onClick={() => setTwoD(true)}>2D version</button></div>}
        </div>
      </div>
      {locked && <div className="notice" style={{ marginTop: 14 }}>Locked until {p.prereqs.filter(q => !done.has(q)).join(', ')} {p.prereqs.filter(q => !done.has(q)).length > 1 ? 'are' : 'is'} complete. You can still read everything.</div>}

      <div className="tabs" role="tablist">
        {TABS.filter(t => p.origin === 'original' || ['overview', 'science', 'audit', 'notes'].includes(t.id)).map(t =>
          <button key={t.id} role="tab" aria-selected={active === t.id} className={active === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {active === 'overview' && (p.origin === 'audit' ? <SpecOnly p={p} /> : (
        <div className="stack" style={{ gap: 26 }}>
          <section className="prose">
            <div className="row"><h2>What you are building</h2><span className="spacer" /><ReadAloud text={stripMarkup(p.explain)} /></div>
            <div style={{ marginTop: 10 }}>{paragraphs(p.explain).map((h, i) => <Html key={i} html={h} className="g-p" />)}</div>
          </section>
          {hero && <section><h2>Play with the idea first</h2><p className="muted" style={{ margin: '4px 0 6px' }}>Same physics you are about to code, running live. Predict what each slider does before you move it.</p><VizWidget name={hero[0]} caption={hero[1]} /></section>}
          <section className="grid two">
            <div className="panel tight"><div className="lbl">Why it matters</div><p style={{ fontSize: '.92rem' }}>{p.context}</p></div>
            <div className="panel tight"><div className="lbl">Deliverable</div><p style={{ fontSize: '.92rem' }}><b>{p.deliverableType}.</b> {p.deliverableWhy}</p><div className="lbl" style={{ marginTop: 10 }}>Data</div><p style={{ fontSize: '.92rem' }}>{p.dataSource}</p></div>
          </section>
          {lessonLinks.length > 0 && <section><div className="lbl">Concept lessons for this project</div><div className="btn-row">{lessonLinks.map(l => <Link key={l.id} className="btn small" to={`/lesson/${l.id}`}>{l.question}</Link>)}</div></section>}
          <section><button className="btn primary" onClick={() => setTab('build')}>Start the build guide →</button></section>
          <details className="panel tight"><summary style={{ cursor: 'pointer' }}>Original technical specification</summary><p style={{ marginTop: 10, fontSize: '.9rem' }}>{p.problem}</p></details>
        </div>))}

      {active === 'build' && g && <BuildTab p={p} g={g} guideKey={guideKey} />}
      {active === 'validate' && <ValidateTab p={p} g={g} guideKey={guideKey} />}
      {active === 'debug' && (g?.stuck?.length ? (
        <div className="stack">
          <p className="muted">Symptom on the left, cause and fix on the right. If yours is not here, write it down — it will be the first entry in your own table.</p>
          <div className="stuck">{g.stuck.flatMap(([a, b], i) => [<div key={'a' + i}><Md text={a} /></div>, <div key={'b' + i}><Md text={b} /></div>])}</div>
          <div className="panel tight"><h3 style={{ marginBottom: 8 }}>Log a debugging lesson</h3><QuickNote defaultKind="debugging" refTo={{ type: 'project', id: p.id, label: p.id }} placeholder="Symptom → cause → fix. What will you check first next time?" /></div>
        </div>) : <div className="empty">No stuck table for this project.</div>)}
      {active === 'science' && (
        <div className="stack" style={{ gap: 22 }}>
          <div className="concepts">
            {(['math', 'physics', 'programming'] as const).map(k => <div key={k} className="panel tight"><h4>{k === 'math' ? 'Mathematics' : k === 'physics' ? 'Physics & science' : 'Computing'}</h4><ul className="list" style={{ fontSize: '.88rem' }}>{p.concepts[k].map(c => <li key={c}>{c}</li>)}</ul></div>)}
          </div>
          {g?.words?.length ? <section><h2>Words you will meet</h2><dl className="dl" style={{ marginTop: 10 }}>{g.words.map(([t, m]) => [<dt key={'t' + t}><Md text={t} /></dt>, <dd key={'d' + t}><Md text={m} /></dd>])}</dl></section> : null}
          {p.tools.length > 0 && <section><div className="lbl">Tools</div><div className="btn-row">{p.tools.map(t => <span key={t} className="badge">{t}</span>)}</div></section>}
          {p.extensions.length > 0 && <section><h2>Extensions</h2><ul className="list" style={{ marginTop: 8 }}>{p.extensions.map(e => <li key={e}>{e}</li>)}</ul></section>}
        </div>)}
      {active === 'audit' && <AuditTab p={p} />}
      {active === 'notes' && <NotesTab p={p} />}
    </div>
  );
}

function NotesTab({ p }: { p: P }) {
  const { state } = useApp();
  const notes = state.journal.filter(j => j.ref?.id === p.id || j.ref?.id?.startsWith?.(`/project/${p.id}`));
  return (
    <div className="grid two">
      <div className="panel">
        <h3 style={{ marginBottom: 6 }}>Reflection and scientific reporting</h3>
        <ul className="list muted" style={{ fontSize: '.85rem', marginBottom: 12 }}>
          <li>Which check would have caught a wrong answer, and did it pass on the first run?</li>
          <li>What does the result mean physically, and where does the model stop being trustworthy?</li>
          <li>What would you test next if you had one more day?</li>
        </ul>
        <QuickNote defaultKind="reflection" refTo={{ type: 'project', id: p.id, label: p.id }} />
      </div>
      <div className="stack sm">
        <h3>Notes for {p.id}</h3>
        {notes.length ? notes.map(n => <div key={n.id} className="entry"><header><span className="badge">{n.kind}</span><b>{n.title}</b></header><div className={`body ${n.kind === 'derivation' ? 'mono' : ''}`}>{n.body}</div></div>) : <div className="empty">No notes linked to this project yet.</div>}
        <Link to={`/journal?ref=${p.id}`} className="btn small ghost">Open in journal</Link>
      </div>
    </div>
  );
}
