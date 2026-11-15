import { useState, type ReactNode } from 'react';
/** Hides content behind a deliberate click: used for code, hints and answers so the learner attempts first. */
export function Reveal({ label, prompt, children, open: initial = false, onOpen }: { label: string; prompt?: string; children: ReactNode; open?: boolean; onOpen?: () => void }) {
  const [open, setOpen] = useState(initial);
  if (open) return <>{children}</>;
  return (
    <div className="reveal">
      <span>{prompt ?? 'Try it yourself first.'}</span>
      <button type="button" className="btn small" onClick={() => { setOpen(true); onOpen?.(); }}>{label}</button>
    </div>
  );
}
