import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { VIZ } from '../content/legacy/viz.js';
import '../lab/newWidgets';
import { LESSONS, labSections, widgetUses } from '../content/lessons';
import { VizWidget } from '../components/VizWidget';
import { Md, Html, stripMarkup } from '../components/Markup';
import { ReadAloud } from '../components/ReadAloud';
import { scheduleReview, pushHistory } from '../state/store';

export function LabIndex() {
  usePage('Concept lab');
  const { projectById, state } = useApp();
  const sections = labSections(id => !!projectById(id));
  return (
    <div>
      <h1>Concept lab</h1>
      <p className="muted prose" style={{ margin: '6px 0 6px' }}>Every widget answers one question. Open a lesson to predict, experiment, see the mathematics, and connect it to the code you will write. Nothing here is graded.</p>
      {sections.map(s => (
        <section key={s.title} className="section">
          <h2>{s.title}</h2>
          <p className="muted prose" style={{ margin: '4px 0 12px', fontSize: '.92rem' }}><Md text={s.intro} /></p>
          <div className="grid three">
            {s.items.map(({ widget, project }) => {
              const rec = state.lessons[widget]; const spec = VIZ[widget];
              return (
                <Link key={widget + project} to={`/lesson/${widget}`} className="lab-card">
                  <div className="row"><span className="kicker">{widget}</span><span className="spacer" />{rec?.completedAt ? <span className="badge green">done</span> : rec ? <span className="badge cyan">started</span> : null}</div>
                  <b style={{ fontSize: '.95rem' }}>{LESSONS[widget]?.question ?? spec?.title}</b>
                  <span className="eq">{stripMarkup(spec?.eq ?? '')}</span>
                  <span className="faint" style={{ fontSize: '.78rem' }}>Used in {project}{projectById(project) ? ` · ${projectById(project)!.title.split(':')[0]}` : ''}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const PHASES = ['The question', 'Predict', 'Experiment', 'What is going on', 'The mathematics', 'Where you implement it', 'Explain it back', 'Connection'];

export function LessonPage() {
  const { id = '' } = useParams();
  const lesson = LESSONS[id]; const spec = VIZ[id];
  const { state, update, projectById } = useApp();
  usePage(lesson ? `Lesson · ${id}` : 'Lesson not found', [{ label: 'Concept lab', to: '/lab' }, { label: lesson?.question ?? id }]);
  const rec = state.lessons[id];
  const section = useMemo(() => labSections(pid => !!projectById(pid)).find(s => s.items.some(i => i.widget === id)), [id, projectById]);
  const [phase, setPhase] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [explain, setExplain] = useState('');
  const [showModel, setShowModel] = useState(false);
  useEffect(() => {
    const r = state.lessons[id];
    setChoice(r?.prediction?.choice ?? null); setExplain(r?.explanation ?? ''); setShowModel(!!r?.explanation);
    setPhase(r?.completedAt ? PHASES.length - 1 : r?.prediction ? 3 : 0);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!lesson || !spec) return <div className="empty">No lesson “{id}”. <Link to="/lab">Back to the lab</Link></div>;

  const touch = (patch: Partial<NonNullable<typeof rec>>, label?: string) => update(s => ({
    ...s, lessons: { ...s.lessons, [id]: { ...s.lessons[id], firstVisit: s.lessons[id]?.firstVisit ?? new Date().toISOString(), ...patch } },
    history: label ? pushHistory(s, { kind: 'lesson', ref: id, label }) : s.history,
  }));
  const lockPrediction = (i: number) => { setChoice(i); touch({ prediction: { choice: i, correct: i === lesson.predict.answer, at: new Date().toISOString() } }, `Predicted in lesson ${id}`); setPhase(p => Math.max(p, 2)); };
  const complete = () => {
    touch({ explanation: explain, completedAt: rec?.completedAt ?? new Date().toISOString() }, `Completed lesson: ${lesson.question}`);
    update(s => ({ ...s, reviews: s.reviews[id] ? s.reviews : { ...s.reviews, [id]: scheduleReview(undefined, 'good') } }));
    setPhase(PHASES.length - 1);
  };
  const uses = widgetUses(id);
  const items = section?.items ?? [];
  const pos = items.findIndex(i => i.widget === id);
  const nextLesson = items[pos + 1]?.widget;
  const linked = items.find(i => i.widget === id)?.project;
  const phaseEl = (n: number, children: ReactNode) => n > phase ? null : (
    <section key={n} className={`phase ${n < phase ? 'done' : 'on'}`} aria-label={PHASES[n]}>
      <span className="phase-n">{n < phase ? '✓' : n + 1}</span>
      <div><h3>{PHASES[n]}</h3>{children}</div>
    </section>
  );
  const answered = choice !== null;

  return (
    <div className="content narrow" style={{ padding: 0 }}>
      <div className="kicker">{section?.title ?? 'Concept lab'}</div>
      <h1 style={{ margin: '6px 0 18px' }}>{spec.title}</h1>
      <div className="lesson-flow">
        {phaseEl(0, <>
          <p className="question">{lesson.question}</p>
          {section && <p className="muted" style={{ marginTop: 8 }}><Md text={section.intro} /></p>}
          {phase === 0 && <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setPhase(1)}>I have the question in mind →</button>}
        </>)}
        {phaseEl(1, <>
          <p style={{ marginBottom: 10 }}>{lesson.predict.prompt}</p>
          <div className="options" role="radiogroup">
            {lesson.predict.options.map((o, i) => {
              const cls = !answered ? '' : i === lesson.predict.answer ? 'right' : i === choice ? 'wrong' : '';
              return <button key={i} role="radio" aria-checked={choice === i} className={`option ${cls}`} disabled={answered} onClick={() => lockPrediction(i)}>{o}</button>;
            })}
          </div>
          {!answered && <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => setPhase(2)}>Skip — I'd rather explore first</button>}
          {answered && <p className="muted" style={{ marginTop: 10, fontSize: '.9rem' }}>{choice === lesson.predict.answer ? 'Your prediction holds. ' : 'Not this time — that is useful information. '}Now test it in the experiment below; the explanation follows after.</p>}
        </>)}
        {phaseEl(2, <>
          <p className="notice cyan" style={{ marginBottom: 10 }}><b>Try this:</b> {lesson.tryThis}</p>
          <VizWidget name={id} caption={null} onInteract={() => { if (!rec?.experimented) touch({ experimented: true }); }} />
          {phase === 2 && <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setPhase(3)}>I have seen it happen →</button>}
        </>)}
        {phaseEl(3, <>
          <div className="stack sm">
            <p><b>Why:</b> {lesson.predict.why}</p>
            <p className="muted"><Md text={spec.note} /></p>
            <div className="row"><ReadAloud text={`${lesson.predict.why} ${stripMarkup(spec.note ?? '')}`} /></div>
          </div>
          {phase === 3 && <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setPhase(4)}>Show the mathematics →</button>}
        </>)}
        {phaseEl(4, <>
          <Html className="eq-big" html={spec.eq ?? ''} />
          {phase === 4 && <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setPhase(5)}>Where does this go in my code? →</button>}
        </>)}
        {phaseEl(5, <>
          {uses.length ? <ul className="list">{uses.map((u, i) => {
            const p = projectById(u.project);
            return <li key={i}><Link to={u.step === null ? `/project/${u.project}` : `/project/${u.project}?tab=build&step=${u.step + 1}`}>{u.project} · {p?.title.split(':')[0]}{u.step === null ? ' — “Play with the idea first”' : ` — step ${u.step + 1}`}</Link><div className="faint" style={{ fontSize: '.85rem' }}><Md text={u.caption} /></div></li>;
          })}</ul> : <p className="muted">This widget belongs to {linked ? <Link to={`/project/${linked}`}>{linked}</Link> : 'the numerical-analysis core'}; the project specification lists where you implement it.</p>}
          {phase === 5 && <button className="btn primary" style={{ marginTop: 12 }} onClick={() => setPhase(6)}>Explain it back →</button>}
        </>)}
        {phaseEl(6, <>
          <p style={{ marginBottom: 8 }}>{lesson.recall.prompt}</p>
          <textarea aria-label="Your explanation" placeholder="In your own words. Two or three sentences are enough." value={explain} onChange={e => setExplain(e.target.value)} />
          <div className="row" style={{ marginTop: 8 }}>
            {!showModel && <button className="btn" disabled={explain.trim().length < 15} onClick={() => setShowModel(true)}>Compare with a model answer</button>}
            {explain.trim().length < 15 && !showModel && <span className="faint" style={{ fontSize: '.8rem' }}>Write first, then compare.</span>}
          </div>
          {showModel && <div className="see" style={{ marginTop: 10 }}><b>Model answer:</b> {lesson.recall.answer}</div>}
          {showModel && !rec?.completedAt && <button className="btn primary" style={{ marginTop: 12 }} onClick={complete}>Finish lesson and schedule review</button>}
        </>)}
        {phaseEl(7, <>
          <p>This idea comes back in <b>Review</b> in {state.reviews[id]?.intervalDays ?? 1} day(s), as a recall question — retrieval spaced over days keeps it.</p>
          <div className="btn-row" style={{ marginTop: 10 }}>
            {linked && <Link className="btn primary" to={`/project/${linked}`}>Go to {linked}</Link>}
            {nextLesson && <Link className="btn" to={`/lesson/${nextLesson}`}>Next lesson: {LESSONS[nextLesson]?.question}</Link>}
            <Link className="btn ghost" to={`/journal?new=observation&ref=lesson:${id}`}>Note an observation</Link>
          </div>
        </>)}
      </div>
    </div>
  );
}
