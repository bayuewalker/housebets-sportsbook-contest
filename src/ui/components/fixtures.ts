import { leagueInfo, sportLabel, type Fixture } from '../../data';
import { searchReason } from '../../engine';
import { icon, sportIcon } from '../../icons';
import { esc, plural } from '../format';
import { isLive, ui } from '../state';
import { badge, leagueFlag, liveBadge, oddsButton, star } from './common';

const primaryMarket = (f: Fixture, id?: string) =>
  f.markets.find(m => m.id === (id ?? (f.sport === 'Football' ? 'result' : 'winner')));

const isFullySuspended = (f: Fixture) => f.markets.every(m => m.suspended);

export interface RowOptions {
  market?: string;
  showLeague?: boolean;
}

export function eventRow(f: Fixture, options: RowOptions = {}): string {
  const live = isLive(f);
  const m = primaryMarket(f, options.market);
  const suspended = isFullySuspended(f);
  const reason = ui.query ? searchReason(f, ui.query) : '';
  const columns = m ? m.outcomes.length : options.market === 'btts' ? 2 : 3;
  const team = (side: 0 | 1) => `<span class="team">
      ${badge(f, side)}
      <span class="team-name">${esc(side === 0 ? f.home : f.away)}</span>
      ${live ? `<b class="score">${f.score[side]}</b>` : ''}
    </span>`;
  const odds = m
    ? m.outcomes.map((o, i) => oddsButton(f, m, o, 'row', i)).join('')
    : `<span class="odds-closed">Market settled</span>`;
  return `<article class="event-row ${live ? 'is-live' : ''} ${suspended ? 'is-suspended' : ''}">
    <div class="event-meta">
      ${liveBadge(f)}
      ${options.showLeague ? `<span class="event-league">${leagueFlag(f.league)}${esc(f.league)}</span>` : ''}
      ${suspended ? `<span class="tag suspended">${icon('lock')}Suspended</span>` : ''}
    </div>
    <a class="event-teams" href="#/match/${f.id}" aria-label="${esc(`${f.home} v ${f.away}${live ? `, live, ${f.score[0]}–${f.score[1]}` : ''}`)}">
      ${team(0)}${team(1)}
      ${reason ? `<em class="match-reason">${esc(reason)}</em>` : ''}
    </a>
    <div class="event-odds cols-${columns}">${odds}</div>
    <a class="more" href="#/match/${f.id}" aria-label="View all ${f.markets.length} markets for ${esc(f.home)} v ${esc(f.away)}">+${f.markets.length - (m ? 1 : 0)}${icon('chevron')}</a>
  </article>`;
}

export function leagueGroup(league: string, fixtures: Fixture[], options: RowOptions & { limit?: number } = {}): string {
  if (!fixtures.length) return '';
  const info = leagueInfo[league];
  const shown = options.limit ? fixtures.slice(0, options.limit) : fixtures;
  const sport = fixtures[0].sport;
  return `<section class="league" aria-label="${esc(league)}">
    <header class="league-head">
      ${leagueFlag(league)}
      <h3><span class="league-country">${esc(info?.country ?? sportLabel(sport))}</span><span class="sep" aria-hidden="true">·</span><span class="league-name">${esc(league)}</span></h3>
      <span class="league-count">${plural(fixtures.length, sport === 'Football' ? 'match' : 'event')}</span>
      ${star(`league:${league}`, league)}
    </header>
    ${shown.map(f => eventRow(f, options)).join('')}
  </section>`;
}

export function groupByLeague(fixtures: Fixture[], options: RowOptions = {}): string {
  return [...new Set(fixtures.map(f => f.league))]
    .map(league => leagueGroup(league, fixtures.filter(f => f.league === league), options))
    .join('');
}

export function groupBySport(fixtures: Fixture[]): string {
  return [...new Set(fixtures.map(f => f.sport))].map(sport => {
    const list = fixtures.filter(f => f.sport === sport);
    return `<div class="sport-block">
      <h3 class="sport-head">${icon(sportIcon(sport))}${esc(sportLabel(sport))}<span>${list.length}</span></h3>
      ${groupByLeague(list)}
    </div>`;
  }).join('');
}

export function featuredCard(f: Fixture): string {
  const live = isLive(f);
  const m = primaryMarket(f)!;
  return `<article class="featured-card ${live ? 'is-live' : ''}" style="--home:${f.colors[0]};--away:${f.colors[1]}">
    <div class="featured-top">
      <span class="event-league">${leagueFlag(f.league)}${esc(f.league)}</span>
      ${liveBadge(f)}
    </div>
    <a class="featured-teams" href="#/match/${f.id}" aria-label="Open ${esc(f.home)} v ${esc(f.away)}">
      <span class="featured-team">${badge(f, 0, true)}<b>${esc(f.homeShort)}</b></span>
      <span class="featured-score">${live ? `${f.score[0]}<i>–</i>${f.score[1]}` : '<i>v</i>'}</span>
      <span class="featured-team">${badge(f, 1, true)}<b>${esc(f.awayShort)}</b></span>
    </a>
    <div class="event-odds cols-${m.outcomes.length}">${m.outcomes.map((o, i) => oddsButton(f, m, o, 'row', i)).join('')}</div>
    <a class="featured-more" href="#/match/${f.id}">${f.markets.length} markets ${icon('chevron')}</a>
  </article>`;
}
