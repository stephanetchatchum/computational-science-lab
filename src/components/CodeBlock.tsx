import { useState } from 'react';
export function CodeBlock({ code, kind = 'file', label }: { code: string; kind?: 'file' | 'cmd' | 'tree'; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { ta.remove(); }
    }
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="codewrap">
      <pre className={`code ${kind}`} aria-label={label}>{code}</pre>
      {kind !== 'tree' && <button type="button" className="copybtn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>}
    </div>
  );
}
