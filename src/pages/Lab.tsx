import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
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
  const [params, setParams] = useSearchParams();
  const si = Math.min(sections.length - 1, Number(params.get('s') ?? 0));
  const s = sections[si];
  return (
    <div className="page">
      <h1>Concept lab</h1>
      <p className="lead">Play first. Every widget answers one question; nothing here is graded.</p>
      <div className="row" style={{ marginTop: 18, flexWrap: 'wrap' }}>
        <span className="faint mono" style={{ fontSize: '.8rem' }}>Topic {si + 1} of {sections.length}</span>
        <select aria-label="Choose a topic" value={si} onChange={e => setParams({ s: e.target.value })} style={{ width: 'auto', maxWidth: '100%' }}>
          {sections.map((x, i) => <option key={x.title} value={i}>{x.title}</option>)}
        </select>
      </div>
      <section className="section">
        <h2>{s.title}</h2>
        <p className="muted" style={{ marginTop: 6 }}><Md text={s.intro} /></p>
        <div className="lab-stage">
          {s.items.map(({ widget, project }) => {
            const p = projectById(project); const rec = state.lessons[widget];
            return (
              <div key={widget + project} className="lab-item">
                <VizWidget name={widget} />
                <div className="row" style={{ flexWrap: 'wrap', marginTop: 6 }}>
                  <Link className="btn small" to={`/lesson/${widget}`}>{rec?.completedAt ? '✓ Lesson done — open again' : 'Open the lesson: predict, test, explain'}</Link>
                  {p && <span className="faint" style={{ fontSize: '.84rem' }}>You build this in <Link to={`/project/${p.id}`}>{p.id} · {p.title.split(':')[0]}</Link></span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 24 }}>
          {si > 0 && <button className="btn ghost" onClick={() => setParams({ s: String(si - 1) })}>← {sections[si - 1].title}</button>}
          <span className="spacer" />
          {si < sections.length - 1 && <button className="btn" onClick={() => setParams({ s: String(si + 1) })}>{sections[si + 1].title} →</button>}
        </div>
      </section>
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
    <div className="page">
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
