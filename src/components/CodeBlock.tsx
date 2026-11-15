import { useState } from 'react';
import { spokenCode } from '../lib/reader';
export function CodeBlock({ code, kind = 'file', label }: { code: string; kind?: 'file' | 'cmd' | 'tree'; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch { const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } finally { ta.remove(); } }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  const say = kind === 'cmd' ? spokenCode(code) : kind === 'tree' ? 'The folder map is on screen.' : 'The code for this step is on screen. Pause here and type it in.';
  return (
    <div className="codewrap">
      <pre className={`code ${kind}`} aria-label={label} data-tts="code" data-say={say}>{code}</pre>
      {kind !== 'tree' && <button type="button" className="copybtn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>}
    </div>
  );
}
