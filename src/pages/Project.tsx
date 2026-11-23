import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { GUIDES_2D, isUnlocked, milestonesFor, revisionsFor, type Project as P } from '../content/curriculum';
import { FINDINGS, DECISIONS } from '../content/audit';
import { effectiveGuide, specText, validationText, type EffGuide, type EffStep } from '../content/guides';
import { HERO_VIZ, guideMarkdown, comeBackCommands } from '../content/legacy/guideExtras.js';
import { REDESIGNED_HERO } from '../content/redesigned';
import { Md, Html, paragraphs, stripMarkup } from '../components/Markup';
import { CodeBlock } from '../components/CodeBlock';
import { VizWidget, StepVisuals } from '../components/VizWidget';
import { Reveal } from '../components/Reveal';
import { QuickNote } from '../components/QuickNote';
import { DomainBadge, VisualBadge } from '../components/Badges';
import { LESSONS } from '../content/lessons';
import { SNAPSHOTS } from '../content/dataSnapshots';
import { snapshotUrl, snapshotsPage } from '../config';
import EpisodeCard from '../components/EpisodeCard';
import { startEpisode, stepEpisode } from '../content/episodes';

type Tab = 'overview' | 'build' | 'finish' | 'stuck' | 'notes' | 'details';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' }, { id: 'build', label: 'Build' }, { id: 'finish', label: 'Tests & finish' },
  { id: 'stuck', label: 'If stuck' }, { id: 'notes', label: 'Notes' }, { id: 'details', label: 'Details' },
];
const isTestCode = (code: string) => /def test_|import pytest|^\s*assert /m.test(code);

function StepView({ n, total, st, done, onToggle, onPrev, onNext, pid }: { n: number; total: number; st: EffStep; done: boolean; onToggle: () => void; onPrev: () => void; onNext: () => void; pid: string }) {
  const { state } = useApp(); const a = state.settings.assistance;
  const [showOrig, setShowOrig] = useState(false);
  const s = showOrig && st.revised ? { ...st, ...st.revised.original } : st;
  const code = s.code ? (isTestCode(s.code) || a === 'full'
    ? <div className="block"><div className="lbl code">Write this in the file</div><CodeBlock code={s.code} /></div>
    : <div className="block"><div className="lbl code">Code for this step</div><Reveal label="Reveal the code" prompt="Write it from the instructions first. Reveal only to compare."><CodeBlock code={s.code} /></Reveal></div>) : null;
  const doList = s.do?.length ? <div className="block"><div className="lbl">Do this</div><ol className="do">{s.do.map((d, i) => <Md key={i} as="li" text={d} />)}</ol></div> : null;
  return (
    <article id={`step-${n}`} className="step-card" aria-labelledby={`st-${n}`}>
      <div className="tag-row">
        <span className="kicker">Step {n} of {total - 1}</span>
        {st.origin === 'added' && <span className="badge violet">new step · audit {st.item}</span>}
        {st.revised && <span className="badge violet">revised · audit {st.item}</span>}
        {st.revised && <button className="btn small ghost" onClick={() => setShowOrig(o => !o)}>{showOrig ? 'Show revised' : 'Show original text'}</button>}
        {done && <span className="badge green">done</span>}
      </div>
      <h2 id={`st-${n}`}><Md text={s.t} /></h2>
      {(() => { const ep = stepEpisode(pid, n); return ep ? <EpisodeCard ep={ep} /> : null; })()}
      {st.optional && <p className="notice violet" style={{ margin: '6px 0 10px' }}>{st.optional}</p>}
      {s.why && <p className="why"><Md text={s.why} /></p>}
      <StepVisuals visuals={st.visuals} />
      {a === 'independent' && doList ? <div className="block"><Reveal label="Show detailed instructions" prompt="Independent mode: plan this step from its goal and expected result.">{doList}</Reveal></div> : doList}
      {st.tree && <div className="block"><div className="lbl">Your folder should look like this</div><CodeBlock code={st.tree} kind="tree" /></div>}
      {code}
      {s.run && <div className="block"><div className="lbl run">Run this</div><CodeBlock code={s.run} kind="cmd" /></div>}
      {s.see && <div className="block"><div className="lbl see">You should see</div><div className="see"><Md text={s.see} /></div></div>}
      {s.hint && <div className="block">{a === 'full' ? <div className="hint"><Md text={s.hint} /></div> : <Reveal label="Show hint" prompt="Stuck on this step?"><div className="hint"><Md text={s.hint} /></div></Reveal>}</div>}
      <div className="step-actions">
        <button className="btn ghost" onClick={onPrev} disabled={n === 0}>← Back</button>
        <span className="spacer" />
        <Link className="btn small ghost" to={`/journal?new=debugging&ref=${pid}&step=${n}`}>Log a debugging lesson</Link>
        {<button className={`btn ${done ? '' : 'primary'}`} onClick={() => { onToggle(); if (!done) onNext(); }}>{done ? 'Untick' : n === total - 1 ? 'Done' : 'Done — next step →'}</button>}
        {done && n < total - 1 && <button className="btn ghost" onClick={onNext}>Next →</button>}
      </div>
    </article>
  );
}

function BuildTab({ p, eg, guideKey }: { p: P; eg: EffGuide; guideKey: string }) {
  const { state, toggleStep, setSettings } = useApp();
  const [params, setParams] = useSearchParams();
  const prog = state.guideProgress[guideKey] || {};
  const steps = eg.steps;
  const want = params.get('step');
  const firstOpen = Math.max(0, steps.findIndex(s => !prog[s.key] && !s.optional));
  const cur = Math.min(steps.length - 1, want !== null ? Number(want) : firstOpen);
  const [all, setAll] = useState(false);
  const go = (n: number) => { params.set('step', String(Math.max(0, Math.min(steps.length - 1, n)))); setParams(params, { replace: true }); window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' }); };
  const toggle = (i: number) => toggleStep(guideKey, steps[i].key, `${p.id} step ${i}: ${stripMarkup(steps[i].t)}`);
  const doneN = steps.filter(s => prog[s.key] && !s.optional).length, req = steps.filter(s => !s.optional).length;
  useEffect(() => { if (all && want !== null) document.getElementById(`step-${want}`)?.scrollIntoView(); }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <span className="faint" style={{ fontSize: '.85rem' }}>{doneN} of {req} steps done</span>
        <span className="spacer" />
        <div className="seg" role="group" aria-label="Commands for"><button className={state.settings.os === 'unix' ? 'on' : ''} onClick={() => setSettings({ os: 'unix' })}>Mac / Linux</button><button className={state.settings.os === 'win' ? 'on' : ''} onClick={() => setSettings({ os: 'win' })}>Windows</button></div>
        <select aria-label="Help level" value={state.settings.assistance} onChange={e => setSettings({ assistance: e.target.value as 'full' | 'guided' | 'independent' })} style={{ width: 'auto' }}>
          <option value="full">Help: full</option><option value="guided">Help: guided</option><option value="independent">Help: independent</option>
        </select>
        <button className="btn small ghost" onClick={() => setAll(a => !a)}>{all ? 'One step at a time' : 'Show all steps'}</button>
      </div>
      <nav className="stepper" aria-label="Steps">
        {steps.map((s, i) => <button key={s.key} title={stripMarkup(s.t)} aria-label={`Step ${i}${prog[s.key] ? ' (done)' : ''}`} aria-current={i === cur ? 'step' : undefined}
          className={`${prog[s.key] ? 'done' : ''} ${i === cur ? 'on' : ''} ${s.origin === 'added' ? 'added' : ''} ${s.optional ? 'opt' : ''}`} onClick={() => { setAll(false); go(i); }}>{prog[s.key] ? '✓' : i}</button>)}
      </nav>
      {cur === 0 && !all && startEpisode(p.id) && !state.guideProgress[p.id]?.['ep:' + startEpisode(p.id)!.id] && <EpisodeCard ep={startEpisode(p.id)!} />}
      {(all ? steps.map((_, i) => i) : [cur]).map(i => (
        <StepView key={steps[i].key} n={i} total={steps.length} st={steps[i]} pid={p.id} done={!!prog[steps[i].key]} onToggle={() => toggle(i)} onPrev={() => go(i - 1)} onNext={() => go(i + 1)} />
      ))}
      {SNAPSHOTS[p.id] && <details style={{ marginTop: 16 }}>
        <summary className="muted" style={{ fontSize: '.88rem' }}>API down? Backup data for this project</summary>
        <ul className="list" style={{ marginTop: 8, fontSize: '.88rem' }}>{SNAPSHOTS[p.id].map(s => <li key={s.file}>{s.what}: <a href={snapshotUrl(s.file)} target="_blank" rel="noreferrer"><code>{s.file}</code></a></li>)}</ul>
        <p className="faint" style={{ fontSize: '.8rem', marginTop: 6 }}>Load it with <code>requests.get(URL).json()</code> instead of the API address. If a link gives 404, run “Refresh data snapshots” once in your repository's Actions tab. <a href={snapshotsPage} target="_blank" rel="noreferrer">All snapshots</a></p>
      </details>}
      <p className="faint" style={{ marginTop: 16, fontSize: '.82rem' }}>Coming back another day? Run these first: <code>{comeBackCommands(eg.guide.slug, state.settings.os).replace('\n', ' ; ')}</code></p>
    </div>
  );
}

function FinishTab({ p, eg, guideKey }: { p: P; eg?: EffGuide; guideKey: string }) {
  const { state, done, toggleStep, toggleMilestone, setCompleted, projects } = useApp();
  const nav = useNavigate();
  const prog = state.guideProgress[guideKey] || {};
  const ms = milestonesFor(p, state.approvals); const mprog = state.milestones[p.id] || {};
  const rev = revisionsFor(p.id, state.approvals).approved.filter(r => r.kind !== 'text');
  const coveredByGuide = new Set((eg?.steps ?? []).filter(s => s.origin === 'added').map(s => s.item));
  const extra = rev.filter(r => !coveredByGuide.has(r.item));
  const checks = eg?.done ?? [];
  const openChecks = checks.filter((_, i) => !prog['d' + i]).length;
  const [confirm, setConfirm] = useState(false);
  const isDone = done.has(p.id);
  const nextP = projects[projects.findIndex(x => x.id === p.id) + 1];
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section>
        <h2>How you will know it is right</h2>
        <div className="stack sm" style={{ marginTop: 10 }}>{validationText(p, state.approvals).map((v, i) => <div key={i} className="oracle"><span className="o">CHECK {i + 1}</span><span>{v.text} {v.item && <span className="badge violet">revised · {v.item}</span>}</span></div>)}</div>
      </section>
      {checks.length > 0 && <section>
        <h2>You are finished when all of these are true</h2>
        <ul className="checklist" style={{ marginTop: 10 }}>
          {checks.map((d, i) => <li key={i} className={prog['d' + i] ? 'on' : ''}><input type="checkbox" checked={!!prog['d' + i]} onChange={() => toggleStep(guideKey, 'd' + i, `${p.id} finish check ${i + 1}`)} aria-label={`Finish check ${i + 1}`} /><span>{d.item && <span className="badge violet" style={{ marginRight: 6 }}>revised · {d.item}</span>}<Md text={d.text} /></span></li>)}
        </ul>
      </section>}
      {extra.length > 0 && <section>
        <h2>Audit additions without a written step yet</h2>
        <p className="faint" style={{ fontSize: '.85rem', margin: '4px 0 10px' }}>Approved by you. Their full step-by-step text arrives with this project's stage.</p>
        <ul className="checklist">{extra.map((r, i) => <li key={i} className={mprog['a' + i] ? 'on' : ''}><input type="checkbox" checked={!!mprog['a' + i]} onChange={() => toggleMilestone(p.id, 'a' + i, `${p.id} audit addition ${r.item}`)} aria-label={`Audit addition ${i + 1}`} /><span><span className="badge violet" style={{ marginRight: 6 }}>{r.item}</span>{r.text}</span></li>)}</ul>
      </section>}
      {ms.length > 0 && <details>
        <summary className="muted">Specification milestones ({ms.filter(m => mprog[m.index]).length}/{ms.length})</summary>
        <ul className="checklist" style={{ marginTop: 10 }}>{ms.map(m => <li key={m.index} className={`${mprog[m.index] ? 'on' : ''} ${m.optional ? 'optional' : ''}`}><input type="checkbox" checked={!!mprog[m.index]} onChange={() => toggleMilestone(p.id, m.index, `${p.id} milestone ${m.index + 1}`)} aria-label={`Milestone ${m.index + 1}`} /><span>{m.optional && <span className="badge violet" style={{ marginRight: 6 }}>optional</span>}{m.text}</span></li>)}</ul>
      </details>}
      <section className={`panel ${isDone ? '' : 'accent'}`}>
        {isDone ? <p>Marked complete. <button className="btn small ghost" onClick={() => setCompleted(p.id, false)}>Undo</button></p> : <>
          <p className="muted" style={{ marginBottom: 12 }}>{openChecks === 0 ? 'Every finish check is ticked.' : `${openChecks} finish check(s) are not ticked yet.`} Completion is your honest judgement; it unlocks what depends on this project.</p>
          {!confirm || openChecks === 0 ? <button className="btn primary" onClick={() => (openChecks === 0 ? setCompleted(p.id, true) : setConfirm(true))}>Mark this project complete</button>
            : <div className="row" style={{ flexWrap: 'wrap' }}><span className="notice">Some checks are open. Mark complete anyway?</span><button className="btn primary" onClick={() => { setCompleted(p.id, true); setConfirm(false); }}>Yes, it is validated</button><button className="btn ghost" onClick={() => setConfirm(false)}>Not yet</button></div>}
        </>}
        {isDone && nextP && <div className="row" style={{ marginTop: 10 }}><button className="btn primary" onClick={() => nav(`/project/${nextP.id}`)}>Next: {nextP.id} {nextP.title.split(':')[0]} →</button></div>}
      </section>
    </div>
  );
}

function SpecOnly({ p }: { p: P }) {
  return (
    <div className="stack">
      {p.labWidget && <VizWidget name={p.labWidget} />}
      <p className="lead">{p.summary}</p>
      <div className="notice violet">New project from the audit ({p.auditItem}). Its full build guide — tests first, numbered steps, every expected value computed and checked — is being written stage by stage and arrives with Stage {p.stage}. Nothing here is invented ahead of that.</div>
      <section><h2>Expected results</h2><div className="stack sm" style={{ marginTop: 8 }}>{(p.oracles ?? []).map((o, i) => <div key={i} className="oracle"><span className="o">ORACLE</span><span>{o}</span></div>)}</div></section>
      {p.labWidget && <Link className="btn" to={`/lesson/${p.labWidget}`}>Open the lesson for this idea</Link>}
    </div>
  );
}

export default function Project() {
  const { id = '' } = useParams();
  const { projectById, state, done, log } = useApp();
  const p = projectById(id);
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab'); const tab = (raw === 'validate' ? 'finish' : raw === 'debug' ? 'stuck' : raw === 'science' || raw === 'audit' ? 'details' : raw) as Tab | null;
  const twoDAllowed = state.decisions.twoD === 'toggle' && !!GUIDES_2D[id];
  const [twoD, setTwoD] = useState(false);
  const eg = useMemo(() => (p ? effectiveGuide(p, state.approvals, twoD && twoDAllowed) : undefined), [p, state.approvals, twoD, twoDAllowed, state.settings.os]); // eslint-disable-line react-hooks/exhaustive-deps
  usePage(p ? `${p.id} · ${p.title.split(':')[0]}` : 'Project not found', p ? [{ label: 'Curriculum', to: '/curriculum' }, { label: `Stage ${p.stage}`, to: `/curriculum?stage=${p.stage}` }, { label: p.id }] : undefined);
  useEffect(() => { if (p) log({ kind: 'visit', ref: p.id, label: `Opened ${p.id}` }); }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <div className="empty">No project with id “{id}”. <Link to="/curriculum">Back to the curriculum</Link></div>;
  const guideKey = twoD && twoDAllowed ? `${id}@2d` : id;
  const active: Tab = tab ?? (eg && state.guideProgress[guideKey] ? 'build' : 'overview');
  const setTab = (t: Tab) => { params.set('tab', t); params.delete('step'); setParams(params); };
  const locked = !isUnlocked(p, done);
  const stepWidget = (() => { // fallback: the widget the guide uses most (scene windows excluded)
    const n: Record<string, number> = {};
    eg?.steps.forEach(x => x.visuals?.forEach(v => { if (!/^win/.test(v.widget)) n[v.widget] = (n[v.widget] || 0) + 1; }));
    return Object.entries(n).sort((x, y) => y[1] - x[1])[0]?.[0];
  })();
  const NEW_HERO: Record<string, [string, string]> = {
    s4p8: ['poisson', 'Play with the idea first: a 2D potential relaxing towards the solution, the heart of this project.'],
    s4p9: ['ising', 'Play with the idea first: a magnet made of spins. Change the temperature and watch order appear or melt.'],
    s5p7: ['traces', 'Play with the idea first: four random walkers that start far apart and end up sampling the same answer.'],
  };
  const hero = REDESIGNED_HERO[p.id] ?? HERO_VIZ[p.id] ?? NEW_HERO[p.id] ?? (p.labWidget ? [p.labWidget, ''] as [string, string] : stepWidget ? [stepWidget, 'Play with the idea first. This is the heart of the project.'] as [string, string] : undefined);
  const stepVisualCount = eg?.steps.filter(x => x.visuals?.length).length ?? 0;
  const lessons = Object.values(LESSONS).filter(l => hero?.[0] === l.id);
  const download = () => { if (!eg) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([guideMarkdown(p, eg.guide)], { type: 'text/markdown' })); a.download = `${eg.guide.slug}-GUIDE.md`; document.body.appendChild(a); a.click(); a.remove(); };
  const why = specText(p, 'deliverableWhy', state.approvals);
  const f = FINDINGS[p.id]; const rv = revisionsFor(p.id, state.approvals);

  return (
    <div className="page">
      <div className="tag-row"><span className="mono faint">{p.id}</span><span className="faint">· Stage {p.stage} · {p.time}</span><DomainBadge domain={p.domain} /><VisualBadge p={p} />
        {done.has(p.id) && <span className="badge green">complete</span>}{locked && <span className="badge amber">locked</span>}</div>
      <h1 style={{ margin: '8px 0 6px' }}>{p.title}</h1>
      {p.specRevised && <p className="faint" style={{ fontSize: '.8rem', margin: '0 0 6px' }}><span className="badge violet">revised · {p.specRevised}</span> The description was corrected to match what the guide actually builds. The original text is under Details.</p>}
      {p.firstWin && <p className="lead"><b style={{ color: 'var(--accent)' }}>Your first win · </b>{p.firstWin.replace(/^(Early win|Within the first (hour|sitting)): ?/, '')}</p>}
      {locked && <p className="notice" style={{ marginTop: 12 }}>Locked until {p.prereqs.filter(q => !done.has(q)).map((q, i) => <span key={q}>{i ? ', ' : ''}<Link to={`/project/${q}`}>{q}</Link></span>)} {p.prereqs.filter(q => !done.has(q)).length > 1 ? 'are' : 'is'} complete. You can still read everything.</p>}

      <div className="tabs" role="tablist">
        {TABS.filter(t => eg || ['overview', 'notes', 'details'].includes(t.id)).map(t => <button key={t.id} role="tab" aria-selected={active === t.id} className={active === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {active === 'overview' && (!eg ? <SpecOnly p={p} /> : (
        <div className="stack" style={{ gap: 24 }}>
          {startEpisode(p.id) && <EpisodeCard ep={startEpisode(p.id)!} />}
          {hero && <section><VizWidget name={hero[0]} caption={hero[1] || null} /></section>}
          {stepVisualCount > 0 && <p className="faint" style={{ fontSize: '.85rem', margin: '-8px 0 0' }}>▶ {stepVisualCount} of the {eg!.steps.length} build steps have their own live visual. Open <button className="linklike" onClick={() => setTab('build')}>Build</button> to see them, one per step.</p>}
          <section>
            <h2>What you are building</h2>
            <div style={{ marginTop: 8 }}>{paragraphs(p.explain).map((h, i) => <Html key={i} html={h} className="g-p" />)}</div>
          </section>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="btn primary" style={{ fontSize: '1rem', padding: '11px 20px' }} onClick={() => setTab('build')}>Start building →</button>
            {lessons.map(l => <Link key={l.id} className="btn ghost" to={`/lesson/${l.id}`}>Lesson: {l.question}</Link>)}
          </div>
        </div>))}

      {active === 'build' && eg && <>
        {twoDAllowed && <div className="seg" style={{ marginBottom: 12 }}><button className={!twoD ? 'on' : ''} onClick={() => setTwoD(false)}>3D (Ursina)</button><button className={twoD ? 'on' : ''} onClick={() => setTwoD(true)}>2D version</button></div>}
        <BuildTab key={p.id + guideKey} p={p} eg={eg} guideKey={guideKey} />
      </>}
      {active === 'finish' && <FinishTab p={p} eg={eg} guideKey={guideKey} />}
      {active === 'stuck' && (eg?.stuck.length ? <div className="stack">
        <p className="muted">Symptom on the left, cause and fix on the right.</p>
        <div className="stuck">{eg.stuck.flatMap(([a, b, item], i) => [<div key={'a' + i}>{item && <span className="badge violet" style={{ marginRight: 6 }}>revised</span>}<Md text={a} /></div>, <div key={'b' + i}><Md text={b} /></div>])}</div>
        <details><summary className="muted">Log a debugging lesson</summary><div style={{ marginTop: 10 }}><QuickNote defaultKind="debugging" refTo={{ type: 'project', id: p.id, label: p.id }} placeholder="Symptom → cause → fix." /></div></details>
      </div> : <div className="empty">No stuck table for this project.</div>)}
      {active === 'notes' && <NotesTab p={p} />}
      {active === 'details' && (
        <div className="stack" style={{ gap: 22 }}>
          <section><h3>Why it matters</h3><p style={{ marginTop: 6 }}>{p.context}</p></section>
          <section><h3>Deliverable</h3><p style={{ marginTop: 6 }}><b>{p.deliverableType}.</b> {why.text} {why.item && <span className="badge violet">revised · {why.item}</span>}</p><p className="muted" style={{ marginTop: 6 }}>Data: {p.dataSource}</p></section>
          <div className="concepts">{(['math', 'physics', 'programming'] as const).map(k => <div key={k}><h4>{k === 'math' ? 'Mathematics' : k === 'physics' ? 'Physics & science' : 'Computing'}</h4><ul className="list" style={{ fontSize: '.88rem' }}>{p.concepts[k].map(c => <li key={c}>{c}</li>)}</ul></div>)}</div>
          {eg?.guide.words?.length ? <section><h3>Words you will meet</h3><dl className="dl" style={{ marginTop: 8 }}>{eg.guide.words.map(([t, m]) => [<dt key={'t' + t}><Md text={t} /></dt>, <dd key={'d' + t}><Md text={m} /></dd>])}</dl></section> : null}
          {p.extensions.length > 0 && <section><h3>Extensions</h3><ul className="list" style={{ marginTop: 6 }}>{p.extensions.map(e => <li key={e}>{e}</li>)}</ul></section>}
          {(f || rv.approved.length > 0) && <section><h3>Scientific audit</h3>
            {f && <p className="muted" style={{ marginTop: 6 }}><span className="badge">{f.depth}</span> {f.issue}</p>}
            {rv.approved.length > 0 && <ul className="list" style={{ marginTop: 8, fontSize: '.9rem' }}>{rv.approved.map((x, i) => <li key={i}><span className="badge violet">{x.item}</span> {x.text}</li>)}</ul>}
          </section>}
          <details><summary className="muted">Original technical specification</summary><p style={{ marginTop: 8, fontSize: '.92rem' }}>{p.problem}</p></details>
          <div className="row">{eg && <button className="btn small ghost" onClick={download}>Download guide (.md)</button>}{!eg && state.decisions.guides && <span className="faint" style={{ fontSize: '.8rem' }}>Decision 1: {DECISIONS[0].options.find(o => o.id === state.decisions.guides)?.label}</span>}</div>
        </div>)}
    </div>
  );
}

function NotesTab({ p }: { p: P }) {
  const { state } = useApp();
  const notes = state.journal.filter(j => j.ref?.id === p.id || j.ref?.id?.startsWith?.(`/project/${p.id}`));
  return (
    <div className="stack">
      <section className="panel">
        <h3 style={{ marginBottom: 6 }}>Reflect and report</h3>
        <p className="muted" style={{ fontSize: '.9rem', marginBottom: 10 }}>Which check would have caught a wrong answer? Where does your model stop being trustworthy? What would you test next?</p>
        <QuickNote defaultKind="reflection" refTo={{ type: 'project', id: p.id, label: p.id }} />
      </section>
      {notes.map(n => <div key={n.id} className="entry"><header><span className="badge">{n.kind}</span><b>{n.title}</b></header><div className={`body ${n.kind === 'derivation' ? 'mono' : ''}`}>{n.body}</div></div>)}
    </div>
  );
}
