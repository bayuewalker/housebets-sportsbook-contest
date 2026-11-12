import { sportLabel, sports } from '../../data';
import { icon, sportIcon } from '../../icons';
import { esc, plural } from '../format';
import { isLive, liveFixtures, state, ui } from '../state';
import { emptyState, leagueFlag, sectionHead, skeleton } from '../components/common';
import { groupByLeague, groupBySport } from '../components/fixtures';

export function livePage(): string {
  const all = liveFixtures();
  const sportShown = ui.sport === 'All' ? all : all.filter(f => f.sport === ui.sport);
  const competitions = [...new Set(sportShown.map(f => f.league))];
  if (ui.competition && !competitions.includes(ui.competition)) competitions.push(ui.competition);
  const shown = ui.competition ? sportShown.filter(f => f.league === ui.competition) : sportShown;
  const sportChip = (value: typeof ui.sport, label: string, count: number, glyph: string) =>
    `<button class="filter-chip ${ui.sport === value ? 'active' : ''}" data-action="live-sport" data-sport="${value}" aria-pressed="${ui.sport === value}" ${count ? '' : 'disabled'}>
      ${icon(glyph)}${esc(label)}<b>${count}</b>
    </button>`;
  const compChip = (league: string, label: string, count: number) =>
    `<button class="filter-chip ${ui.competition === league ? 'active' : ''}" data-action="live-comp" data-league="${esc(league)}" aria-pressed="${ui.competition === league}">
      ${league ? leagueFlag(league) : icon('trophy')}${esc(label)}<b>${count}</b>
    </button>`;
  const heading = `<h1 id="page-title" tabindex="-1" class="page-title"><span class="live-dot"></span>Live <span>${plural(all.length, 'event')} in play</span></h1>`;
  const filters = `<div class="live-filters">
    <div class="filter-chips" role="group" aria-label="Filter live events by sport">
      ${sportChip('All', 'All', all.length, 'live')}
      ${sports.map(s => sportChip(s, sportLabel(s), all.filter(f => f.sport === s).length, sportIcon(s))).join('')}
    </div>
    <div class="filter-chips" role="group" aria-label="Filter live events by competition">
      ${compChip('', 'All competitions', sportShown.length)}
      ${competitions.map(league => compChip(league, league, sportShown.filter(f => f.league === league).length)).join('')}
    </div>
  </div>`;
  if (ui.loading) return `${heading}${skeleton()}`;
  if (!all.length) {
    const soon = state().fixtures.filter(f => !isLive(f)).sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff)).slice(0, 8);
    return `${heading}
      <div class="fallback" role="status">${icon('clock')}<div><b>No live events right now.</b><span>Here is what starts next.</span></div></div>
      ${sectionHead(`${icon('clock')}Starting soon`, `<span class="section-count">${soon.length}</span>`)}
      ${groupByLeague(soon)}`;
  }
  if (!shown.length) {
    const sportName = ui.sport === 'All' ? 'any sport' : sportLabel(ui.sport);
    const title = ui.competition ? `Nothing live in ${ui.competition}` : 'Nothing live in this sport';
    const text = ui.competition
      ? `No ${ui.competition} events are live in ${sportName}. Clear the competition to see what is on.`
      : 'Pick another sport above.';
    return `${heading}${filters}${emptyState(title, text, ui.competition ? 'Show all competitions' : 'Show all live', ui.competition ? 'live-comp-clear' : 'live-all')}`;
  }
  return `${heading}
    ${filters}
    ${ui.sport === 'All' && !ui.competition ? groupBySport(shown) : groupByLeague(shown)}`;
}
