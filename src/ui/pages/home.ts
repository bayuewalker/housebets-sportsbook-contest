import { leagueInfo, leagues, sportLabel, type Fixture } from '../../data';
import { compareYourMatches, searchFixtures } from '../../engine';
import { icon, sportIcon } from '../../icons';
import { esc, plural } from '../format';
import { followsFixture, isLive, liveFixtures, state, ui } from '../state';
import { emptyState, leagueFlag, sectionHead, skeleton } from '../components/common';
import { eventRow, featuredCard, groupByLeague } from '../components/fixtures';

const FEATURED = ['ars-bha', 'psg-ben', 'liv-mun', 'rma-bay', 'bar-atm', 'int-nap', 'bos-nyk'];
const SOON_HOURS = 12;

const byKickoff = (a: Fixture, b: Fixture) => Date.parse(a.kickoff) - Date.parse(b.kickoff);

function toggleLink(action: string, expanded: boolean, total: number, shown: number): string {
  if (total <= shown && !expanded) return `<span class="section-count">${total}</span>`;
  return `<button class="view-all" data-action="${action}" aria-expanded="${expanded}">${expanded ? 'Show less' : `View all ${total}`}${icon(expanded ? 'up' : 'chevron')}</button>`;
}

function searchResults(): string {
  const list = searchFixtures(state().fixtures, ui.query);
  return `<h1 id="page-title" tabindex="-1" class="page-title">Results for “${esc(ui.query)}” <span>${plural(list.length, 'event')}</span></h1>
    ${list.length ? groupByLeague(list) : emptyState('No matches found', 'Try a team, a player, a competition or a market, for example Arsenal, Marlow, LaLiga or corners.', 'Clear search', 'clear-search')}`;
}

function sportPage(): string {
  const sport = ui.sport as Exclude<typeof ui.sport, 'All'>;
  const list = state().fixtures.filter(f => f.sport === sport);
  const live = list.filter(isLive);
  const upcoming = list.filter(f => !isLive(f)).sort(byKickoff);
  return `<h1 id="page-title" tabindex="-1" class="page-title">${icon(sportIcon(sport))}${esc(sportLabel(sport))} <span>${plural(list.length, 'event')}</span></h1>
    ${live.length ? `${sectionHead('<span class="live-dot"></span>Live', `<span class="section-count">${live.length}</span>`)}${groupByLeague(live)}` : ''}
    ${upcoming.length ? `${sectionHead(`${icon('clock')}Upcoming`, `<span class="section-count">${upcoming.length}</span>`)}${groupByLeague(upcoming)}` : ''}`;
}

export function homePage(): string {
  if (ui.loading) return `<h1 id="page-title" tabindex="-1" class="sr-only">Sports home</h1>${skeleton()}`;
  if (ui.query) return searchResults();
  if (ui.sport !== 'All') return sportPage();
  const s = state();
  const mine = s.fixtures.filter(followsFixture).sort((a, b) => compareYourMatches(a, b, s.favorites, isLive));
  const featured = FEATURED.map(id => s.fixtures.find(f => f.id === id)!).filter(Boolean);
  const live = liveFixtures();
  const soon = s.fixtures.filter(f => !isLive(f) && Date.parse(f.kickoff) - Date.now() < SOON_HOURS * 3_600_000).sort(byKickoff);
  const mineShown = ui.showAllMine ? mine : mine.slice(0, 3);
  const soonShown = ui.showAllSoon ? soon : soon.slice(0, 6);
  return `<h1 id="page-title" tabindex="-1" class="sr-only">Sports home</h1>
    <section class="home-section" aria-labelledby="mine-title" id="your-matches">
      ${sectionHead(`<span id="mine-title">${icon('star')}Your matches</span>`, mine.length ? toggleLink('toggle-mine', ui.showAllMine, mine.length, 3) : '')}
      ${mine.length ? `<div class="rows">${mineShown.map(f => eventRow(f, { showLeague: true })).join('')}</div>`
        : `<p class="muted inline-empty">${icon('star')}Star a team or league to see its matches here.</p>`}
    </section>
    <section class="home-section" aria-labelledby="featured-title">
      ${sectionHead('<span id="featured-title">Featured</span>', `<div class="carousel-nav"><button class="icon-btn" data-action="carousel" data-dir="-1" aria-label="Previous featured match">${icon('left')}</button><button class="icon-btn" data-action="carousel" data-dir="1" aria-label="Next featured match">${icon('chevron')}</button></div>`)}
      <div class="carousel" tabindex="0" aria-label="Featured matches">${featured.map(featuredCard).join('')}</div>
    </section>
    <section class="home-section" aria-labelledby="live-title">
      ${sectionHead('<span id="live-title"><span class="live-dot"></span>Live now</span>', live.length ? `<a class="view-all" href="#/live">View all ${live.length}${icon('chevron')}</a>` : '')}
      ${live.length ? `<div class="rows">${live.slice(0, 6).map(f => eventRow(f, { showLeague: true })).join('')}</div>`
        : emptyState('No live events right now', 'The next kick-offs are listed below.', 'Show upcoming', 'upcoming', 'clock')}
    </section>
    <section class="home-section" aria-labelledby="soon-title" id="starting-soon">
      ${sectionHead(`<span id="soon-title">${icon('clock')}Starting soon</span>`, toggleLink('toggle-soon', ui.showAllSoon, soon.length, 6))}
      <div class="rows">${soonShown.map(f => eventRow(f, { showLeague: true })).join('')}</div>
    </section>
    <section class="home-section" aria-labelledby="comp-title">
      ${sectionHead('<span id="comp-title">Top competitions</span>')}
      <div class="competitions">${leagues.map(l => {
        const n = s.fixtures.filter(f => f.league === l).length;
        return `<button data-action="league" data-league="${esc(l)}">${leagueFlag(l)}<span><b>${esc(l)}</b><small>${esc(leagueInfo[l].country)} · ${n} scheduled</small></span>${icon('chevron')}</button>`;
      }).join('')}</div>
    </section>`;
}
