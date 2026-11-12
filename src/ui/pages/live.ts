import { sportLabel, sports } from '../../data';
import { icon, sportIcon } from '../../icons';
import { esc, plural } from '../format';
import { isLive, liveFixtures, state, ui } from '../state';
import { emptyState, sectionHead, skeleton } from '../components/common';
import { groupByLeague, groupBySport } from '../components/fixtures';

export function livePage(): string {
  const all = liveFixtures();
  const shown = ui.sport === 'All' ? all : all.filter(f => f.sport === ui.sport);
  const chip = (value: typeof ui.sport, label: string, count: number, glyph: string) =>
    `<button class="filter-chip ${ui.sport === value ? 'active' : ''}" data-action="live-sport" data-sport="${value}" aria-pressed="${ui.sport === value}" ${count ? '' : 'disabled'}>
      ${icon(glyph)}${esc(label)}<b>${count}</b>
    </button>`;
  const heading = `<h1 id="page-title" tabindex="-1" class="page-title"><span class="live-dot"></span>Live <span>${plural(all.length, 'event')} in play</span></h1>`;
  if (ui.loading) return `${heading}${skeleton()}`;
  if (!all.length) {
    const soon = state().fixtures.filter(f => !isLive(f)).sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff)).slice(0, 8);
    return `${heading}
      <div class="fallback" role="status">${icon('clock')}<div><b>No live events right now.</b><span>Here is what starts next.</span></div></div>
      ${sectionHead(`${icon('clock')}Starting soon`, `<span class="section-count">${soon.length}</span>`)}
      ${groupByLeague(soon)}`;
  }
  return `${heading}
    <div class="filter-chips" role="group" aria-label="Filter live events by sport">
      ${chip('All', 'All', all.length, 'live')}
      ${sports.map(s => chip(s, sportLabel(s), all.filter(f => f.sport === s).length, sportIcon(s))).join('')}
    </div>
    ${shown.length ? (ui.sport === 'All' ? groupBySport(shown) : groupByLeague(shown)) : emptyState('Nothing live in this sport', 'Pick another sport above.', 'Show all live', 'live-all')}`;
}
