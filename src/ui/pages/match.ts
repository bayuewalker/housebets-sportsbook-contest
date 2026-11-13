import { categories, categoryLabel, leagueInfo, sportLabel, type Fixture, type Market } from '../../data';
import { icon } from '../../icons';
import { esc, plural } from '../format';
import { clockText, currentFixture, isLive, state, ui } from '../state';
import { badge, emptyState, leagueFlag, liveBadge, oddsButton, periodText, star } from '../components/common';
import { outcomesForQuery, scorerRows } from '../query';

const SCORER_IDS = ['scorer', 'anytime', 'brace'];

function matches(m: Market, q: string): boolean {
  return !q || m.name.toLocaleLowerCase().includes(q) || m.outcomes.some(o => o.label.toLocaleLowerCase().includes(q));
}

function columns(m: Market): string {
  if (m.id === 'correct') return 'cols-3';
  if (m.layout === 'list') return 'list';
  return m.outcomes.length === 2 ? 'cols-2' : 'cols-3';
}

function marketCard(f: Fixture, m: Market, q: string): string {
  const outcomes = outcomesForQuery(m, q);
  if (!outcomes.length) return '';
  const open = !ui.collapsed.has(m.id);
  const bodyId = `market-${m.id}`;
  return `<section class="market ${m.suspended ? 'is-suspended' : ''} ${open ? '' : 'is-collapsed'}" aria-label="${esc(m.name)}">
    <h3 class="market-head">
      <button data-action="collapse" data-market="${m.id}" aria-expanded="${open}" aria-controls="${bodyId}">
        <span class="market-name">${esc(m.name)}</span>
        ${m.suspended ? `<span class="tag suspended">${icon('lock')}Suspended</span>` : ''}
        ${icon('down', 'caret')}
      </button>
    </h3>
    <div class="market-body" id="${bodyId}" ${open ? '' : 'hidden'}>
      ${m.suspended ? '<p class="market-msg">Prices are under review and reopen shortly. Picks already in your slip are kept.</p>' : ''}
      <div class="outcomes ${columns(m)}">${outcomes.map(o => oddsButton(f, m, o)).join('')}</div>
    </div>
  </section>`;
}

/** Goalscorer markets share one table: a fictional squad list with Next/First, Anytime and 2+ columns. */
function scorerCard(f: Fixture, q: string): string {
  const [first, anytime, brace] = SCORER_IDS.map(id => f.markets.find(m => m.id === id));
  if (!first || !anytime) return '';
  const open = !ui.collapsed.has('scorers');
  const marketNames = [first, anytime, brace].flatMap(m => m ? [m.name] : []);
  const players = scorerRows(f.players, ui.scorerTeam, q, marketNames);
  const showTeam = new Set(players.map(p => p.team)).size > 1;
  const cell = (m: Market | undefined, name: string) => {
    const o = m?.outcomes.find(x => x.label === name);
    return `<td>${m && o ? oddsButton(f, m, o, 'cell') : '<span class="odds-closed" aria-label="Not offered">–</span>'}</td>`;
  };
  const team = (side: 0 | 1) => `<button role="tab" data-focus="scorer-${side}" aria-selected="${ui.scorerTeam === side}" tabindex="${ui.scorerTeam === side ? 0 : -1}" class="${ui.scorerTeam === side ? 'active' : ''}" data-action="scorer-team" data-team="${side}">${esc(side === 0 ? f.homeShort : f.awayShort)}</button>`;
  const none = first.outcomes.find(o => o.label === 'No goalscorer');
  const marketQuery = !q || marketNames.some(name => name.toLocaleLowerCase().includes(q));
  const sideName = (side: 0 | 1) => side === 0 ? f.homeShort : f.awayShort;
  const rows = players.map(p => `<tr><th scope="row">${esc(p.name)}${showTeam ? `<small class="scorer-side">${esc(sideName(p.team))}</small>` : ''}</th>${cell(first, p.name)}${cell(anytime, p.name)}${cell(brace, p.name)}</tr>`).join('');
  const empty = `<tr class="none-row"><td colspan="4">No player matches “${esc(q)}”. Clear the search to return to ${esc(sideName(ui.scorerTeam))}.</td></tr>`;
  return `<section class="market scorers ${open ? '' : 'is-collapsed'}" aria-label="Goalscorers">
    <h3 class="market-head">
      <button data-action="collapse" data-market="scorers" aria-expanded="${open}" aria-controls="market-scorers">
        <span class="market-name">Goalscorers</span><span class="market-sub">${esc(first.name)} · Anytime · 2 or more</span>${icon('down', 'caret')}
      </button>
    </h3>
    <div class="market-body" id="market-scorers" ${open ? '' : 'hidden'}>
      <div class="team-switch" role="tablist" aria-label="Team">${team(0)}${team(1)}</div>
      <table class="scorer-table">
        <thead><tr><th scope="col">Player</th><th scope="col">${first.name.startsWith('Next') ? 'Next' : 'First'}</th><th scope="col">Anytime</th><th scope="col">2+</th></tr></thead>
        <tbody>
          ${rows || empty}
          ${none && marketQuery ? `<tr class="none-row"><th scope="row">No goalscorer</th><td>${oddsButton(f, first, none, 'cell')}</td><td></td><td></td></tr>` : ''}
        </tbody>
      </table>
      <p class="market-msg">Squad names are fictional sample players.</p>
    </div>
  </section>`;
}

function scoreboard(f: Fixture): string {
  const live = isLive(f);
  return `<section class="scoreboard ${live ? 'is-live' : ''}" aria-label="Scoreboard" style="--home:${f.colors[0]};--away:${f.colors[1]}">
    <div class="scoreboard-top">
      <span class="event-league">${leagueFlag(f.league)}${esc(f.league)}</span>
      ${liveBadge(f, true)}
    </div>
    <div class="scoreboard-main">
      <div class="sb-team">${badge(f, 0, true)}<b>${esc(f.home)}</b>${star(`team:${f.home}`, f.home)}</div>
      <div class="sb-score">
        <strong ${live ? `aria-label="Score ${f.score[0]} to ${f.score[1]}"` : ''}>${live ? `${f.score[0]}<i>–</i>${f.score[1]}` : '<i>v</i>'}</strong>
        <span class="sb-period" data-period="${f.id}">${esc(periodText(f))}</span>
      </div>
      <div class="sb-team">${badge(f, 1, true)}<b>${esc(f.away)}</b>${star(`team:${f.away}`, f.away)}</div>
    </div>
  </section>`;
}

function compactScore(f: Fixture): string {
  const live = isLive(f);
  return `<div class="compact-score" aria-hidden="true">
    <span class="cs-team">${badge(f, 0)}${esc(f.homeCode)}</span>
    <b class="cs-score">${live ? `${f.score[0]} – ${f.score[1]}` : 'v'}</b>
    <span class="cs-team">${esc(f.awayCode)}${badge(f, 1)}</span>
    <span class="cs-clock">${live ? `<span class="live-pill">Live</span><span data-clock="${f.id}">${esc(clockText(f))}</span>` : esc(periodText(f))}</span>
  </div>`;
}

export function matchPage(): string {
  const f = currentFixture();
  const q = ui.marketQuery.trim().toLocaleLowerCase();
  const available = categories.filter(c => f.markets.some(m => m.category === c));
  if (ui.category !== 'All' && !available.includes(ui.category)) ui.category = available.includes('Popular') ? 'Popular' : 'All';
  const inCategory = f.markets.filter(m => ui.category === 'All' || m.category === ui.category);
  const shown = inCategory.filter(m => matches(m, q) || (SCORER_IDS.includes(m.id) && f.players.some(p => p.toLocaleLowerCase().includes(q))));
  const scorerTable = f.sport === 'Football' && shown.some(m => SCORER_IDS.includes(m.id));
  const info = leagueInfo[f.league];
  const sportLink = f.sport === 'Football'
    ? `<a href="#/football">${esc(sportLabel(f.sport))}</a>`
    : `<button class="crumb-btn" data-action="sport" data-sport="${esc(f.sport)}">${esc(sportLabel(f.sport))}</button>`;
  let scorersPlaced = false;
  const pieces: Array<{ html: string; wide: boolean }> = [];
  for (const m of shown) {
    if (scorerTable && SCORER_IDS.includes(m.id)) {
      if (scorersPlaced) continue;
      scorersPlaced = true;
      pieces.push({ html: scorerCard(f, q), wide: true });
      continue;
    }
    const html = marketCard(f, m, q);
    if (html) pieces.push({ html, wide: m.layout === 'list' || outcomesForQuery(m, q).length > 6 });
  }
  let column = 0;
  const spanRow = pieces.map(() => false);
  pieces.forEach((piece, index) => {
    if (piece.wide) {
      if (column === 1) spanRow[index - 1] = true;
      column = 0;
    } else column = column === 1 ? 0 : 1;
  });
  if (column === 1) spanRow[pieces.length - 1] = true;
  const cards = pieces.map((piece, index) => (spanRow[index] ? piece.html.replace('class="market ', 'class="market span-row ') : piece.html)).join('');
  const allCollapsed = shown.length > 0 && shown.every(m => ui.collapsed.has(SCORER_IDS.includes(m.id) && scorerTable ? 'scorers' : m.id));
  const tab = (value: typeof ui.category, label: string, count: number) =>
    `<button role="tab" aria-controls="market-list" data-focus="cat-${esc(value)}" aria-selected="${ui.category === value}" tabindex="${ui.category === value ? 0 : -1}" class="${ui.category === value ? 'active' : ''}" data-action="category" data-category="${esc(value)}">${esc(label)}<b>${count}</b></button>`;
  const backHref = f.sport === 'Football' ? '#/football' : '#/sports';
  const backLabel = f.sport === 'Football' ? 'Back to Soccer' : 'Back to Sports';
  const leagueJump = f.sport === 'Football'
    ? `<button data-action="league" data-league="${esc(f.league)}">${esc(info?.country ?? '')} · ${esc(f.league)}</button>`
    : '';
  return `<nav class="crumbs" aria-label="Breadcrumb">
      <a class="crumb-back" href="${backHref}" aria-label="${backLabel}">${icon('back')}</a>
      <details class="crumb-drop">
        <summary><span>${esc(sportLabel(f.sport))}</span>${icon('chevron')}<span>${esc(info?.country ?? '')}</span>${icon('chevron')}<span>${esc(f.league)}</span>${icon('chevron')}<span aria-current="page">${esc(f.homeCode)}–${esc(f.awayCode)}</span></summary>
        <div class="crumb-menu">
          <a href="#/sports">Sports</a>
          ${sportLink}
          ${leagueJump}
        </div>
      </details>
      <button class="demo-entry crumb-demo" data-action="demo" aria-haspopup="dialog">Demo states</button>
    </nav>
    <h1 id="page-title" tabindex="-1" class="sr-only">${esc(f.home)} v ${esc(f.away)}</h1>
    ${compactScore(f)}
    ${scoreboard(f)}
    <div class="market-toolbar">
      <div class="market-tabs h-scroll" role="tablist" aria-label="Market groups">
        ${tab('All', 'All markets', f.markets.length)}
        ${available.map(c => tab(c, categoryLabel(c), f.markets.filter(m => m.category === c).length)).join('')}
      </div>
      <div class="market-tools">
        <div class="search small" role="search">
          ${icon('search')}
          <input id="market-search" data-focus="market-search" type="search" autocomplete="off" placeholder="Search markets or players" aria-label="Search markets on this match" value="${esc(ui.marketQuery)}">
          ${ui.marketQuery ? `<button type="button" class="icon-btn" data-action="clear-market-search" aria-label="Clear market search">${icon('close')}</button>` : ''}
        </div>
        <button class="btn ghost small" data-action="collapse-all" data-state="${allCollapsed ? 'expand' : 'collapse'}">${icon('collapse')}${allCollapsed ? 'Expand all' : 'Collapse all'}</button>
      </div>
      <p class="market-status">
        <span>${plural(shown.length, 'market')}${q ? ` matching “${esc(ui.marketQuery)}”` : ''}</span>
        ${isLive(f) ? `<span class="${ui.liveFeed && !state().noLive ? 'feed-on' : ''}"><span class="live-dot"></span>${ui.liveFeed ? 'Prices update live' : 'Live prices paused'}</span>` : `<span>${icon('clock')}Pre-match prices</span>`}
      </p>
    </div>
    <div class="markets" id="market-list" role="tabpanel" aria-label="Markets">${cards || emptyState(`No markets match “${ui.marketQuery}”`, 'Try another word, such as corners, handicap or a player name.', 'Clear market search', 'clear-market-search')}</div>`;
}
