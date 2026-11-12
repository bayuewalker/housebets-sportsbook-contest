import type { Fixture, Flag } from '../data';

export { money } from '../engine';

export const esc = (value: unknown) =>
  String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : /(ch|s)$/.test(word) ? 'es' : 's'}`;

export const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';
  } catch {
    return 'local time';
  }
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Calendar days from today in the viewer's time zone (0 = today). */
export function dayOffset(iso: string, now = new Date()): number {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / 86_400_000);
}

export const localTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function dayLabel(iso: string, now = new Date()): string {
  const offset = dayOffset(iso, now);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  return new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

export const kickoffLabel = (f: Fixture) => `${dayLabel(f.kickoff)} · ${localTime(f.kickoff)}`;

export function placedLabel(iso: string, now = new Date()): string {
  const offset = dayOffset(iso, now);
  if (offset >= -1) return `${dayLabel(iso, now)}, ${localTime(iso)}`;
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' }) + `, ${localTime(iso)}`;
}

export const fullDate = (iso: string) =>
  new Date(iso).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Simple original flag drawings for league headers. */
const flags: Record<Flag, string> = {
  eng: '<rect width="24" height="16" fill="#fff"/><path d="M10 0h4v16h-4zM0 6h24v4H0z" fill="#ce2b37"/>',
  esp: '<rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/>',
  ita: '<rect width="8" height="16" fill="#009246"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#ce2b37"/>',
  ger: '<rect width="24" height="5.34" fill="#141414"/><rect y="5.33" width="24" height="5.34" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/>',
  eu: '<rect width="24" height="16" fill="#1f3f9a"/><g fill="#ffd34d">' +
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<circle cx="${(12 + Math.sin(a) * 5).toFixed(2)}" cy="${(8 - Math.cos(a) * 5).toFixed(2)}" r="0.9"/>`;
    }).join('') + '</g>',
  usa: '<rect width="24" height="16" fill="#fff"/><path d="M0 0h24v1.8H0zm0 3.6h24v1.8H0zm0 3.6h24V9H0zm0 3.6h24v1.8H0zm0 3.6h24V16H0z" fill="#c2273a"/><rect width="10.5" height="8.6" fill="#2b3b7c"/>',
  int: '<rect width="24" height="16" fill="#22414b"/><circle cx="12" cy="8" r="5" fill="none" stroke="#9fd8dc" stroke-width="1.2"/><path d="M7 8h10M12 3c-2.2 2.8-2.2 7.2 0 10m0-10c2.2 2.8 2.2 7.2 0 10" fill="none" stroke="#9fd8dc" stroke-width="1"/>',
};

export const flag = (code: Flag, label: string) =>
  `<svg class="flag" viewBox="0 0 24 16" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${flags[code]}</svg>`;
