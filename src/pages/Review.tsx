import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { LESSONS } from '../content/lessons';
import { dueReviews } from '../state/store';

/** Spaced retrieval: recall from memory first, then check, then rate honestly. */
export default function Review() {
  usePage('Review');
  const { state, review } = useApp();
  const due = useMemo(() => dueReviews(state).filter(id => LESSONS[id]), [state]);
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState('');
  const [shown, setShown] = useState(false);
  const upcoming = Object.entries(state.reviews).filter(([id]) => !due.includes(id)).sort((a, b) => a[1].due.localeCompare(b[1].due)).slice(0, 6);
  const id = due[Math.min(idx, due.length - 1)];
  const card = id ? LESSONS[id] : null;
  const rate = (r: 'good' | 'again') => { review(id!, r); setAttempt(''); setShown(false); setIdx(0); };

  return (
    <div className="content narrow" style={{ padding: 0 }}>
      <h1>Review</h1>
      <p className="muted" style={{ margin: '6px 0 18px' }}>Recall from memory before looking. Getting it wrong is part of how this works: the effort of retrieving is what strengthens the memory. Intervals grow 1 → 3 → 7 → 16 → 35 → 75 days when you recall it.</p>
      {card ? (
        <section className="panel accent stack">
          <div className="row"><span className="kicker">{due.length} due</span><span className="spacer" /><Link to={`/lesson/${id}`} className="btn small ghost">Open the lesson</Link></div>
          <p className="question" style={{ fontSize: '1.2rem' }}>{card.recall.prompt}</p>
          <textarea aria-label="Your answer" value={attempt} onChange={e => setAttempt(e.target.value)} placeholder="Answer from memory (a few words is fine)…" />
          {!shown ? <button className="btn primary" onClick={() => setShown(true)}>Check my answer</button> : <>
            <div className="see"><b>Model answer:</b> {card.recall.answer}</div>
            <div className="row"><span className="muted" style={{ fontSize: '.88rem' }}>Did you have the key idea?</span><span className="spacer" />
              <button className="btn" onClick={() => rate('again')}>Not yet — show again tomorrow</button>
              <button className="btn primary" onClick={() => rate('good')}>Yes, I had it</button></div>
          </>}
        </section>
      ) : (
        <div className="empty">Nothing is due right now.{Object.keys(state.reviews).length === 0 && <> Finish a lesson in the <Link to="/lab">Concept lab</Link> to start your review deck.</>}</div>
      )}
      {upcoming.length > 0 && <section className="section"><h2>Coming up</h2>
        <table className="t" style={{ marginTop: 8 }}><thead><tr><th>Concept</th><th>Due</th><th>Interval</th></tr></thead><tbody>
          {upcoming.map(([k, c]) => <tr key={k}><td><Link to={`/lesson/${k}`}>{LESSONS[k]?.question ?? k}</Link></td><td className="mono">{new Date(c.due).toLocaleDateString()}</td><td className="mono">{c.intervalDays} d</td></tr>)}
        </tbody></table></section>}
    </div>
  );
}
