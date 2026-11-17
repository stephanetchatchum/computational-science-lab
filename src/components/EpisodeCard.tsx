import { useApp } from '../state/AppState';
import type { Episode } from '../content/episodes';

export default function EpisodeCard({ ep }: { ep: Episode }) {
  const { state, toggleStep } = useApp();
  const key = 'ep:' + ep.id; const watched = !!state.guideProgress[ep.project]?.[key];
  const when = ep.at === 'start' ? 'Watch this before you start' : `Watch this at step ${ep.at.step}`;
  return (
    <section className="episode" aria-label={`Episode: ${ep.title}`}>
      <div className="episode-head">
        <span className="badge amber">▶ {when}</span>
        <strong>{ep.title}</strong>
        <span className="faint">{ep.length}</span>
        {watched && <span className="badge green">watched</span>}
      </div>
      <video controls preload="none" poster={ep.poster} src={ep.file} playsInline
        onEnded={() => { if (!watched) toggleStep(ep.project, key, `${ep.project} episode watched: ${ep.title}`); }} />
      <p className="faint episode-sum">{ep.summary}</p>
      <label className="faint episode-tick"><input type="checkbox" checked={watched} onChange={() => toggleStep(ep.project, key, `${ep.project} episode: ${ep.title}`)} /> I watched it</label>
    </section>
  );
}
