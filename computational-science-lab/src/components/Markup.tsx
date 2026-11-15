import { ESC } from '../content/legacy/viz.js';

/** Like the original fmt(), but **bold** is not applied inside {{code}} (the original turned x**2 inside code into bold). */
export function fmt(s: unknown): string {
  return String(s ?? '').split(/(\{\{.+?\}\})/g).map(part => {
    const m = part.match(/^\{\{(.+)\}\}$/);
    return m ? `<code>${ESC(m[1])}</code>` : ESC(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }).join('');
}
/** Curriculum inline markup: **bold** and {{code}} (escaped first, so plain text is always safe). */
export function Md({ text, as: Tag = 'span', className }: { text?: string | null; as?: 'span' | 'p' | 'div' | 'li'; className?: string }) {
  if (!text) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: fmt(text) }} />;
}
/** Fields of the original curriculum that are authored HTML (e.g. `explain` with <b> and <br>). Trusted, bundled content only. */
export function Html({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
export const stripMarkup = (s: string) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\{\{(.+?)\}\}/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
/** Split the original `explain` HTML into paragraphs (it uses <br><br> as paragraph breaks). */
export const paragraphs = (html: string) => String(html).split(/<br\s*\/?>\s*<br\s*\/?>/i).map(h => h.replace(/<br\s*\/?>/gi, ' ').trim()).filter(Boolean);
