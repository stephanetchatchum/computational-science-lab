import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppState';
import { dueReviews } from '../state/store';
import { QuickNote } from './QuickNote';
import { ReaderBar } from './ReaderBar';
import { ICONS } from './Icons';

const NAV: { to: string; label: string; icon: string; end?: boolean }[] = [
  { to: '/', label: 'Today', icon: 'compass', end: true },
  { to: '/setup', label: 'Setup (do this first)', icon: 'wrench' },
  { to: '/curriculum', label: 'Project Library', icon: 'grid' },
  { to: '/lab', label: 'Concept lab', icon: 'flask' },
  { to: '/review', label: 'Review', icon: 'review' },
  { to: '/journal', label: 'Journal', icon: 'journal' },
];
const MORE: { to: string; label: string; icon: string }[] = [
  { to: '/roadmaps', label: 'Subject Roadmaps', icon: 'map' },
  { to: '/capstone', label: 'Capstone', icon: 'cap' },
  { to: '/ideas', label: 'Future AI projects', icon: 'bulb' },
  { to: '/audit', label: 'Audit & decisions', icon: 'audit' },
  { to: '/settings', label: 'Settings & account', icon: 'settings' },
  { to: '/about', label: 'How this app teaches', icon: 'info' },
];

/** Records where you are so the dashboard can offer "resume". */
export type Trail = { label: string; to?: string }[];
export function usePage(label: string, trail?: Trail) {
  const { update } = useApp();
  const loc = useLocation();
  const { setCrumbs } = useCrumbs();
  useEffect(() => {
    document.title = `${label} · Computational Science Lab`;
    const path = loc.pathname + loc.search;
    update(s => (s.lastLocation?.path === path && s.lastLocation.label === label ? s : { ...s, lastLocation: { path, label, at: new Date().toISOString() } }));
  }, [label, loc.pathname, loc.search, update]);
  const key = JSON.stringify(trail ?? [{ label }]);
  useEffect(() => { setCrumbs(JSON.parse(key)); }, [key, setCrumbs]);
}

const CrumbCtx = createContext<(c: Trail) => void>(() => {});
function useCrumbs() { return { setCrumbs: useContext(CrumbCtx) }; }

function SessionTimer() {
  const { state } = useApp();
  const mins = state.settings.session.minutes;
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  useEffect(() => { if (start === null) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [start]);
  if (!mins) return null;
  if (start === null) return <button className="timer" onClick={() => { setStart(Date.now()); setPhase('work'); }} title="Optional focus session. Nothing locks when it ends.">Start {mins}-min session</button>;
  const total = (phase === 'work' ? mins : state.settings.session.breakMinutes) * 60_000;
  const left = Math.max(0, total - (now - start));
  const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
  if (left === 0 && phase === 'work') {
    return <span className="row"><span className="timer break">Session done — take a short break?</span>
      <button className="btn small" onClick={() => { setPhase('break'); setStart(Date.now()); }}>Break {state.settings.session.breakMinutes} min</button>
      <button className="btn small ghost" onClick={() => setStart(Date.now())}>Keep going</button></span>;
  }
  if (left === 0 && phase === 'break') return <button className="timer" onClick={() => { setPhase('work'); setStart(Date.now()); }}>Break over — start again</button>;
  return <button className={`timer ${phase === 'break' ? 'break' : ''}`} onClick={() => setStart(null)} title="Click to stop">{phase === 'break' ? 'Break ' : ''}{mm}:{String(ss).padStart(2, '0')}</button>;
}

function Capture() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { state } = useApp();
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn small ghost" onClick={() => setOpen(o => !o)} aria-expanded={open} title="Write down a stray thought without leaving this page" aria-label="Park a thought">✎<span className="hide-sm"> Park a thought</span></button>
      {open && <div className="capture-box">
        <div className="row" style={{ marginBottom: 6 }}><b style={{ fontSize: '.9rem' }}>Park a thought</b><span className="spacer" /><button className="btn small ghost" onClick={() => setOpen(false)} aria-label="Close">✕</button></div>
        <p className="faint" style={{ fontSize: '.8rem', marginBottom: 8 }}>Write it down so it stops pulling at you. It goes to your journal.</p>
        <QuickNote compact defaultKind="parked" refTo={state.lastLocation ? { type: 'step', id: loc.pathname, label: state.lastLocation.label } : undefined} onSaved={() => setOpen(false)} />
      </div>}
    </div>
  );
}

export function Layout() {
  const { state, projects, done, setSettings, saveError } = useApp();
  const [crumbs, setCrumbsState] = useState<Trail>([]);
  const [menu, setMenu] = useState(false);
  const [reading, setReading] = useState(false);
  const loc = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMenu(false); if (!loc.search.includes('step=')) window.scrollTo({ top: 0 }); }, [loc.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  const required = projects.length;
  const doneCount = projects.filter(p => done.has(p.id)).length;
  const due = dueReviews(state).length;
  const focus = state.settings.focusMode;
  return (
    <div className={`shell ${focus ? 'focus' : ''}`}>
      <a href="#main" className="sr-only">Skip to content</a>
      <aside className={`side ${menu ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="2.5" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></svg>
          </div>
          <div><h1>Computational Science Lab</h1><small>personal edition · 2026</small></div>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <span className="nav-i">{ICONS[n.icon]}</span>{n.label}
              {n.to === '/curriculum' && <span className="count">{required}</span>}
              {n.to === '/review' && due > 0 && <span className="count hot">{due}</span>}
            </NavLink>
          ))}
          <details className="nav-more" open={MORE.some(m => loc.pathname.startsWith(m.to))}>
            <summary>More</summary>
            {MORE.map(n => <NavLink key={n.to} to={n.to}><span className="nav-i">{ICONS[n.icon]}</span>{n.label}</NavLink>)}
          </details>
        </nav>
        <div className="side-progress">
          <div className="row"><span>Projects complete</span><span className="mono">{doneCount}/{required}</span></div>
          <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${required ? (doneCount / required) * 100 : 0}%` }} /></div>
        </div>
      </aside>
      {menu && <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.4)' }} aria-hidden />}
      <div className="main" ref={mainRef}>
        <header className="topbar">
          <button className="btn small ghost menu-btn" onClick={() => setMenu(true)} aria-label="Open navigation">☰</button>
          <nav className="crumbs" aria-label="Breadcrumb">{crumbs.map((c, i) => <span key={i}>{i > 0 && <span className="faint"> / </span>}{c.to ? <Link to={c.to}>{c.label}</Link> : <span style={{ color: 'var(--text)' }}>{c.label}</span>}</span>)}</nav>
          <SessionTimer />
          <Capture />
          <button className={`btn small ${reading ? 'primary' : 'ghost'}`} onClick={() => setReading(r => !r)} aria-pressed={reading} title="Read this page aloud" aria-label="Listen">▶<span className="hide-sm"> Listen</span></button>
          <button className={`btn small ${focus ? 'primary' : 'ghost'}`} onClick={() => setSettings({ focusMode: !focus })} aria-pressed={focus} title="Hide navigation and secondary panels">{focus ? 'Exit focus' : 'Focus'}</button>
        </header>
        {saveError && <div className="notice red" role="alert" style={{ margin: '12px 28px 0' }}>Your progress could not be saved to this browser ({saveError}). Export a backup from Settings.</div>}
        <main id="main" className="content"><CrumbCtx.Provider value={setCrumbsState}><Outlet /></CrumbCtx.Provider></main>
      </div>
      <ReaderBar open={reading} onClose={() => setReading(false)} />
    </div>
  );
}
