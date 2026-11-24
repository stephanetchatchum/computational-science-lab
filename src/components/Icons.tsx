/** Sidebar icons. The first six are the original app's icons, copied exactly; the rest are drawn in the same style. */
const P = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
export const ICONS: Record<string, JSX.Element> = {
  compass: <svg {...P}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  wrench: <svg {...P}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.6-.6-2.6z" /></svg>,
  grid: <svg {...P}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  flask: <svg {...P}><path d="M9 3h6M10 3v6.5L5.5 17A2.5 2.5 0 0 0 7.7 21h8.6a2.5 2.5 0 0 0 2.2-4L14 9.5V3" /><path d="M7 15h10" /></svg>,
  map: <svg {...P}><path d="M9 20l-5.5-2.5V4L9 6.5l6-2.5 5.5 2.5v13.5L15 17.5l-6 2.5z" /><path d="M9 6.5v13.5M15 4v13.5" /></svg>,
  bulb: <svg {...P}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>,
  cap: <svg {...P}><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12.5V17c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-4.5" /></svg>,
  review: <svg {...P}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 8v4l3 2" /></svg>,
  journal: <svg {...P}><path d="M5 3h11a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V3z" /><path d="M9 7h6M9 11h6" /><path d="M5 17a2 2 0 0 1 2-2h11" /></svg>,
  audit: <svg {...P}><path d="M12 3l8 4v5c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V7l8-4z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>,
  settings: <svg {...P}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>,
  info: <svg {...P}><circle cx="12" cy="12" r="10" /><path d="M12 16v-5M12 8h.01" /></svg>,
};
