import { leagues } from '../../data';
import { icon } from '../../icons';
import { esc } from '../format';
import { isLive, state, ui, type FootballMarket } from '../state';
import { emptyState, leagueFlag, skeleton } from '../components/common';
import { leagueGroup } from '../components/fixtures';

const MARKETS: Array<[FootballMarket, string]> = [['result', 'Match result'], ['goals', 'Over/Under goals'], ['btts', 'Both teams to score']];
const UPCOMING_HOURS = 24;

export function footballPage(): string {
  const football = state().fixtures.filter(f => f.sport === 'Football');
  const inScope = football.filter(f => ui.footballScope === 'all' || isLive(f) || Date.parse(f.kickoff) - Date.now() < UPCOMING_HOURS * 3_600_000);
  const list = inScope
    .filter(f => !ui.league || f.league === ui.league)
    .sort((a, b) => Number(isLive(b)) - Number(isLive(a)) || Date.parse(a.kickoff) - Date.parse(b.kickoff));
  const chip = (league: string, label: string) => {
    const count = inScope.filter(f => !league || f.league === league).length;
    const active = ui.league === league;
    return `<button class="filter-chip ${active ? 'active' : ''}" data-action="league-filter" data-league="${esc(league)}" aria-pressed="${active}">
      ${league ? leagueFlag(league) : icon('ball')}${esc(label)}<b>${count}</b>
    </button>`;
  };
  const scopeCount = inScope.length;
  const scopeNote = ui.footballScope === 'upcoming' ? 'today & live' : 'matches';
  const scope = (value: 'upcoming' | 'all', label: string) =>
    `<button data-action="football-scope" data-scope="${value}" class="${ui.footballScope === value ? 'active' : ''}" aria-pressed="${ui.footballScope === value}">${label}</button>`;
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/sports">Sports</a>${icon('chevron')}<span aria-current="page">Soccer</span></nav>
    <h1 id="page-title" tabindex="-1" class="page-title">${icon('ball')}Soccer <span><b class="scope-count">${scopeCount}</b> ${scopeNote} · ${football.filter(isLive).length} live</span></h1>
    <div class="filter-chips" role="group" aria-label="Competitions">${chip('', ui.footballScope === 'upcoming' ? 'Today & live' : 'All leagues')}${leagues.map(l => chip(l, l)).join('')}</div>
    <div class="list-controls">
      <label class="select"><span>Market</span>
        <select id="football-market" aria-label="Market shown on each match">${MARKETS.map(([v, l]) => `<option value="${v}" ${ui.footballMarket === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </label>
      <div class="segmented" role="group" aria-label="Which matches to show">${scope('upcoming', 'Live &amp; Upcoming')}${scope('all', 'All')}</div>
    </div>
    ${ui.loading ? skeleton() : list.length
      ? leagues.filter(l => list.some(f => f.league === l)).map(l => leagueGroup(l, list.filter(f => f.league === l), { market: ui.footballMarket })).join('')
      : emptyState('No matches in this window', 'Switch to All to see every scheduled match.', 'Show all matches', 'football-all', 'clock')}`;
}
