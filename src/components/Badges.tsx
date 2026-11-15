import type { Project } from '../content/curriculum';
/** Restored from the original: domain colours and the "visual payoff" level. */
const DOMAIN_HUE: Record<string, string> = {
  Computing: 'slate', Physics: 'amber', Math: 'blue', 'Data Science': 'purple', Climate: 'cyan', Epidemiology: 'rose',
  Biology: 'green', Energy: 'orange', Engineering: 'blue', 'Environmental Science': 'cyan', HPC: 'purple',
  'ML for Science': 'rose', Agriculture: 'orange', Research: 'slate',
};
export function DomainBadge({ domain }: { domain: string }) {
  return <span className={`dbadge hue-${DOMAIN_HUE[domain] ?? 'slate'}`}>{domain}</span>;
}
export function visualLevel(p: Project): 'High' | 'Medium' | 'Low' {
  const dt = p.deliverableType.toLowerCase();
  if (dt.includes('pygame') || dt.includes('animat') || dt.includes('ursina') || dt.includes('3d')) return 'High';
  if (dt.startsWith('cli tool') || dt.startsWith('technical report')) return 'Low';
  return 'Medium';
}
const VMETA = { High: { icon: '🎬', label: 'High visual payoff' }, Medium: { icon: '📊', label: 'Medium visual payoff' }, Low: { icon: '📄', label: 'Low visual payoff — mostly text/numbers' } };
export function VisualBadge({ p, compact }: { p: Project; compact?: boolean }) {
  const l = visualLevel(p); const m = VMETA[l];
  return <span className={`vbadge v-${l}`} title={m.label}>{m.icon} {compact ? l : m.label}</span>;
}
export const QUICK_WIN_IDS = ['s0p2', 's0p3', 's1p5', 's1p4', 's2p2', 's3p2', 's3p3', 's4p7'];
export const QUICK_WIN_TEXT = 'Every project in this curriculum is a live simulation you build and watch run — but some get you to the moving-on-screen moment faster than others. If you need momentum, build these first: a cannon you fire, a swarm of dots multiplying, a flock of birds that organizes itself, darts that compute pi, planets that orbit, a blob epidemic, and zebra stripes that grow out of chemistry. Then circle back for the rest in order.';
