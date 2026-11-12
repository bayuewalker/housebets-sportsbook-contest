import { leagueInfo, type Fixture, type Market, type Outcome } from '../../data';
import { icon } from '../../icons';
import { esc, flag, kickoffLabel, localTime, dayLabel } from '../format';
import { clockText, isFavorite, isLive, isSelected, ui } from '../state';

export type OddsSize = 'row' | 'full' | 'cell';

/** Short labels for list rows; the full outcome name is always in the accessible label. */
export function shortLabel(m: Market, o: Outcome, index: number): string {
  if (m.id === 'result' || m.id === 'winner') return m.outcomes.length === 3 ? ['1', 'X', '2'][index] : ['1', '2'][index];
  if (o.label.startsWith('Over ')) return `O ${o.label.slice(5)}`;
  if (o.label.startsWith('Under ')) return `U ${o.label.slice(6)}`;
  return o.label;
}

export function oddsButton(f: Fixture, m: Market, o: Outcome, size: OddsSize = 'full', index = 0): string {
  const selected = isSelected(f.id, m.id, o.id);
  const direction = o.previous ? (o.odds > o.previous ? 'up' : 'down') : '';
  const label = size === 'row' ? shortLabel(m, o, index) : o.label;
  const state = m.suspended
    ? 'market suspended'
    : `${o.odds.toFixed(2)}${direction ? `, odds ${direction === 'up' ? 'up' : 'down'} from ${o.previous!.toFixed(2)}` : ''}`;
  const aria = `${o.label}, ${m.name}, ${f.home} v ${f.away}, ${state}${selected ? ', in bet slip' : ''}`;
  const arrow = direction ? `<span class="move ${direction}" aria-hidden="true">${direction === 'up' ? '▲' : '▼'}</span>` : '';
  return `<button class="odds ${size} ${selected ? 'selected' : ''} ${direction} ${m.suspended ? 'suspended' : ''}"
    data-action="odds" data-fixture="${f.id}" data-market="${m.id}" data-outcome="${o.id}"
    ${m.suspended || ui.busy ? 'disabled' : ''} aria-pressed="${selected}" aria-label="${esc(aria)}">
    ${size === 'cell' ? '' : `<span class="odds-label">${esc(label)}</span>`}
    <span class="odds-price">${m.suspended ? icon('lock') : `${arrow}${o.odds.toFixed(2)}`}</span>
  </button>`;
}

export function badge(f: Fixture, side: 0 | 1, large = false): string {
  return `<span class="club ${large ? 'large' : ''}" style="--club:${f.colors[side]}" aria-hidden="true">${esc(side === 0 ? f.homeCode : f.awayCode)}</span>`;
}

export function liveBadge(f: Fixture, seconds = false): string {
  if (!isLive(f)) return `<span class="kickoff"><span>${esc(dayLabel(f.kickoff))}</span><b>${esc(localTime(f.kickoff))}</b></span>`;
  const ht = f.clock === 'HT';
  return `<span class="live-badge ${ht ? 'is-ht' : ''}"><span class="live-pill">Live</span><span class="clock" data-clock="${f.id}" ${seconds ? 'data-seconds' : ''}>${esc(clockText(f, seconds))}</span></span>`;
}

export function periodText(f: Fixture): string {
  if (!isLive(f)) return kickoffLabel(f);
  if (f.sport !== 'Football') return f.clock;
  if (f.clock === 'HT') return 'Half-time';
  return Number.parseInt(clockText(f), 10) < 45 ? '1st half' : '2nd half';
}

export function star(key: string, label: string, cls = ''): string {
  const on = isFavorite(key);
  return `<button class="icon-btn star ${on ? 'on' : ''} ${cls}" data-action="follow" data-key="${esc(key)}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Add'} ${esc(label)} ${on ? 'from' : 'to'} favourites">${icon('star')}</button>`;
}

export function leagueFlag(league: string): string {
  const info = leagueInfo[league];
  return info ? flag(info.flag, info.country) : '';
}

export function emptyState(title: string, text: string, button = '', action = '', art = 'search'): string {
  return `<div class="empty">
    <span class="empty-art">${icon(art)}</span>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${button ? `<button class="btn ghost" data-action="${action}">${esc(button)}</button>` : ''}
  </div>`;
}

export function skeleton(rows = 4): string {
  return `<div class="loading" role="status">
    <span class="loading-label"><span class="spinner" aria-hidden="true"></span>Loading matches…</span>
    ${'<div class="skeleton" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'.repeat(rows)}
  </div>`;
}

export function sectionHead(title: string, extra = '', id = ''): string {
  return `<div class="section-head" ${id ? `id="${id}"` : ''}><h2>${title}</h2>${extra}</div>`;
}
