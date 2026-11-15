import { useEffect, useState } from 'react';
import { usePage } from '../components/Layout';
import { useApp } from '../state/AppState';
import { exportData, importData, emptyState, LEGACY_EXPORT_SNIPPET } from '../state/store';
import { CodeBlock } from '../components/CodeBlock';
import { pickVoice } from '../lib/reader';
import { configFromBuild, getConfig, setConfig, signIn, signOut, signUp } from '../sync/supabase';

function Account() {
  const { sync } = useApp();
  const [url, setUrl] = useState(getConfig()?.url ?? ''); const [key, setKey] = useState(getConfig()?.key ?? '');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const run = async (f: () => Promise<unknown>, ok: string) => { setBusy(true); setMsg(null); try { await f(); setMsg(ok); } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); } };
  if (!sync.configured) return (
    <div className="stack sm">
      <p style={{ fontSize: '.92rem' }}>Sync is off. Your progress is saved in this browser only. To use it on every device, connect a free Supabase project (one-time, about 10 minutes — see <b>docs/SUPABASE.md</b> in your repository).</p>
      <label className="field">Project URL<input type="text" placeholder="https://xxxx.supabase.co" value={url} onChange={e => setUrl(e.target.value.trim())} /></label>
      <label className="field">anon public key<input type="text" placeholder="eyJ…" value={key} onChange={e => setKey(e.target.value.trim())} /></label>
      <div className="row"><button className="btn primary" disabled={!/^https:\/\/.+/.test(url) || key.length < 20} onClick={() => { setConfig({ url, key }); sync.refresh(); }}>Connect</button></div>
    </div>);
  if (!sync.user) return (
    <div className="stack sm">
      <p style={{ fontSize: '.92rem' }}>Connected to your Supabase project. Sign in, or create your account the first time.</p>
      <label className="field">Email<input type="text" autoComplete="email" value={email} onChange={e => setEmail(e.target.value.trim())} /></label>
      <label className="field">Password<input type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></label>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn primary" disabled={busy || !email || pw.length < 6} onClick={() => run(() => signIn(email, pw), 'Signed in.')}>Sign in</button>
        <button className="btn" disabled={busy || !email || pw.length < 6} onClick={() => run(() => signUp(email, pw), 'Account created. If Supabase asks you to confirm your email, click the link, then sign in here.')}>Create account</button>
        {!configFromBuild() && <button className="btn ghost small" onClick={() => { setConfig(null); sync.refresh(); }}>Disconnect project</button>}
      </div>
      {msg && <div className="notice cyan" role="status">{msg}</div>}
    </div>);
  return (
    <div className="stack sm">
      <p style={{ fontSize: '.92rem' }}>Signed in as <b>{sync.user.email}</b>. Progress, notes and settings sync automatically a few seconds after each change and whenever you return to this tab.</p>
      <p className="faint" style={{ fontSize: '.85rem' }}>Status: {sync.status === 'synced' ? `synced ${sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString() : ''}` : sync.status}{sync.error ? ` — ${sync.error}` : ''}</p>
      <div className="row"><button className="btn" onClick={() => sync.now()} disabled={sync.status === 'syncing'}>Sync now</button><button className="btn ghost" onClick={() => run(() => signOut(), 'Signed out. Your progress stays in this browser.')}>Sign out</button></div>
      {msg && <div className="notice cyan" role="status">{msg}</div>}
    </div>);
}

export default function Settings() {
  usePage('Settings & account');
  const { state, setSettings, update } = useApp();
  const s = state.settings;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetStep, setResetStep] = useState(0);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)));
    load(); window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, []);
  const download = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportData(state)], { type: 'application/json' }));
    a.download = `cslab-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
  };
  const doImport = (text: string) => {
    try { const r = importData(state, text); update(() => r.state); setMsg({ ok: true, text: r.message }); setImportText(''); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) }); }
  };
  const readFile = (f: File | undefined) => { if (f) f.text().then(doImport); };

  return (
    <div className="page">
      <h1>Settings & account</h1>

      <section className="section">
        <h2>Account and sync</h2>
        <div className="panel"><Account /></div>
      </section>

      <section className="section">
        <h2>Reading and display</h2>
        <div className="panel stack">
          <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Appearance</span>
            <div className="seg"><button className={s.theme === 'dark' ? 'on' : ''} onClick={() => setSettings({ theme: 'dark' })}>Dark</button><button className={s.theme === 'light' ? 'on' : ''} onClick={() => setSettings({ theme: 'light' })}>Light</button></div>
            <span className="faint" style={{ fontSize: '.8rem' }}>Simulation panels stay dark, like instruments.</span></div>
          <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Text size</span>
            <input type="range" min={0.85} max={1.4} step={0.05} value={s.textScale} onChange={e => setSettings({ textScale: Number(e.target.value) })} style={{ width: 200 }} aria-label="Text size" />
            <span className="mono">{Math.round(s.textScale * 100)}%</span></div>
          <label className="check"><input type="checkbox" checked={s.reducedMotion} onChange={e => setSettings({ reducedMotion: e.target.checked })} />Reduce motion — simulations start paused and transitions are off</label>
          <label className="check"><input type="checkbox" checked={s.focusMode} onChange={e => setSettings({ focusMode: e.target.checked })} />Focus mode — hide navigation; build guides show one step at a time</label>
          <label className="check"><input type="checkbox" checked={s.showProposed} onChange={e => setSettings({ showProposed: e.target.checked })} />Show proposed (unapproved) audit changes on project pages</label>
        </div>
      </section>

      <section className="section">
        <h2>Help and assistance</h2>
        <div className="panel stack">
          <div className="seg" style={{ alignSelf: 'flex-start' }}>
            {(['full', 'guided', 'independent'] as const).map(a => <button key={a} className={s.assistance === a ? 'on' : ''} onClick={() => setSettings({ assistance: a })}>{a}</button>)}
          </div>
          <p className="muted" style={{ fontSize: '.86rem' }}><b>Full</b>: all code and hints visible. <b>Guided</b>: tests visible (they are the specification); implementation code and hints behind a click so you try first. <b>Independent</b>: each step shows only its goal, the command and the expected result.</p>
          <div className="row"><span style={{ width: 160 }}>Commands for</span><div className="seg"><button className={s.os === 'unix' ? 'on' : ''} onClick={() => setSettings({ os: 'unix' })}>Mac / Linux</button><button className={s.os === 'win' ? 'on' : ''} onClick={() => setSettings({ os: 'win' })}>Windows</button></div></div>
        </div>
      </section>

      <section className="section">
        <h2>Sessions and breaks</h2>
        <div className="panel stack">
          <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Session length</span>
            <select value={s.session.minutes} onChange={e => setSettings({ session: { ...s.session, minutes: Number(e.target.value) } })} style={{ width: 180 }}>
              <option value={0}>Off (no timer)</option>{[15, 20, 25, 30, 40, 50, 60, 90].map(m => <option key={m} value={m}>{m} minutes</option>)}
            </select></div>
          <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Suggested break</span>
            <select value={s.session.breakMinutes} onChange={e => setSettings({ session: { ...s.session, breakMinutes: Number(e.target.value) } })} style={{ width: 180 }}>
              {[3, 5, 10, 15].map(m => <option key={m} value={m}>{m} minutes</option>)}
            </select></div>
          <p className="faint" style={{ fontSize: '.82rem' }}>The timer sits in the top bar. When it ends it only suggests a break; nothing is locked and you can keep going.</p>
        </div>
      </section>

      <section className="section">
        <h2>Read aloud</h2>
        <div className="panel stack">
          {'speechSynthesis' in window ? <>
            <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Speed</span>
              <select value={s.tts.rate} onChange={e => setSettings({ tts: { ...s.tts, rate: Number(e.target.value) } })} style={{ width: 180 }}>{[0.8, 1, 1.15, 1.3, 1.5, 1.75].map(r => <option key={r} value={r}>{r}×</option>)}</select></div>
            <div className="row" style={{ flexWrap: 'wrap' }}><span style={{ width: 160 }}>Voice</span>
              <select value={pickVoice(s.tts.voice)?.voiceURI ?? ''} onChange={e => setSettings({ tts: { ...s.tts, voice: e.target.value || null } })} style={{ maxWidth: 360 }}>{voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}</select>
              <button className="btn small" onClick={() => { const u = new SpeechSynthesisUtterance('This is how I will read your lessons.'); const v = pickVoice(s.tts.voice); if (v) { u.voice = v; u.lang = v.lang; } u.rate = s.tts.rate; speechSynthesis.cancel(); speechSynthesis.speak(u); }}>Test voice</button></div>
            <p className="faint" style={{ fontSize: '.82rem' }}>Like the original app, the reader picks a voice with “Natural” in its name when your browser has one. Microsoft Edge has the most natural free voices (for example “Microsoft Aria Online (Natural)”); Chrome has “Google US English”. Voices come from your browser, so the list differs between Edge, Chrome and Safari.</p>
          </> : <p className="muted">This browser has no speech synthesis.</p>}
        </div>
      </section>

      <section className="section">
        <h2>Your data</h2>
        <div className="panel stack">
          <p style={{ fontSize: '.9rem' }}>Progress is saved in this browser automatically after every change, and mirrored into the original HTML file's storage keys. {state.migratedFrom.length > 0 && <span className="badge green">migrated from: {state.migratedFrom.join(', ')}</span>}</p>
          <div className="btn-row"><button className="btn primary" onClick={download}>Download a full backup (.json)</button>
            <label className="btn">Restore / import a file<input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={e => readFile(e.target.files?.[0])} /></label></div>
          <div className="divider" />
          <h3>Bring progress from the original HTML file</h3>
          <p className="muted" style={{ fontSize: '.86rem' }}>Browsers keep storage per website, so the original file (opened from your disk) and this app (on its own address) cannot see each other automatically. Open the original file, press F12 → Console, paste this line and press Enter. It copies your progress; paste it into the box below. Nothing is removed — progress is merged.</p>
          <CodeBlock code={LEGACY_EXPORT_SNIPPET} kind="cmd" />
          <textarea className="mono" placeholder="Paste here…" value={importText} onChange={e => setImportText(e.target.value)} aria-label="Import data" />
          <div className="row"><button className="btn" disabled={!importText.trim()} onClick={() => doImport(importText)}>Merge progress</button></div>
          {msg && <div className={`notice ${msg.ok ? 'cyan' : 'red'}`} role="status">{msg.text}</div>}
          <div className="divider" />
          <h3>Reset</h3>
          {resetStep === 0 && <button className="btn danger" style={{ alignSelf: 'flex-start' }} onClick={() => setResetStep(1)}>Reset all progress…</button>}
          {resetStep === 1 && <div className="row" style={{ flexWrap: 'wrap' }}><span className="notice red">This erases progress, notes and settings in this browser. Download a backup first.</span>
            <button className="btn" onClick={download}>Download backup</button>
            <button className="btn danger" onClick={() => { update(() => emptyState()); setResetStep(0); setMsg({ ok: true, text: 'Progress reset. Your backup file can restore it.' }); }}>Erase everything</button>
            <button className="btn ghost" onClick={() => setResetStep(0)}>Cancel</button></div>}
        </div>
      </section>
    </div>
  );
}
