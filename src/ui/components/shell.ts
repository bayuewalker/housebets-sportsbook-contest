import { sportLabel, sports, type Sport } from '../../data';
import { totalReturn, totalStake, resolve } from '../../engine';
import { brandLogo, brandMark, icon, sportIcon } from '../../icons';
import { esc, money, plural, timeZone } from '../format';
import { currentFixture, isFavorite, liveFixtures, openBets, page, state, ui } from '../state';

export const wordmark = () => `<span class="wordmark">Housebets</span>`;

function nextMondayCountdown(now = new Date()): string {
  const end = new Date(now);
  end.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
  end.setHours(0, 0, 0, 0);
  const hours = Math.floor((end.getTime() - now.getTime()) / 3_600_000);
  return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
}

export function topbar(): string {
  const s = state();
  return `<header class="topbar">
    <div class="topbar-start">
      <button class="icon-btn rail-toggle" data-action="rail" aria-label="${ui.railExpanded ? 'Collapse' : 'Expand'} navigation" aria-expanded="${ui.railExpanded}">${icon('rail')}</button>
      <a class="brand" href="#/sports" aria-label="Housebets Sports home">${brandLogo()}${brandMark()}${wordmark()}</a>
    </div>
    <button class="prize" data-action="info" data-topic="Prize" aria-haspopup="dialog" aria-label="Weekly Prize, 50,000 dollars, ${nextMondayCountdown()}">
      <span class="prize-icon">${icon('trophy')}</span>
      <span class="prize-copy"><small>Weekly Prize</small><b>$50,000.00</b></span>
      <span class="prize-time">${nextMondayCountdown()}</span>
    </button>
    <div class="topbar-end">
      <button class="wallet-pill" data-action="wallet" aria-haspopup="dialog" aria-label="Demo balance ${money(s.balance)} USDT">
        <span class="coin">${icon('coin')}</span><b>${money(s.balance)}</b><span class="unit">USDT</span>${icon('down', 'caret')}
      </button>
      <button class="btn accent wallet-btn" data-action="wallet" aria-haspopup="dialog">${icon('wallet')}<span>Wallet</span></button>
      <button class="prize-compact" data-action="info" data-topic="Prize" aria-haspopup="dialog" aria-label="Weekly Prize, 50,000 dollars">${icon('trophy')}<b>$50,000</b></button>
      <button class="icon-btn vip" data-action="info" data-topic="VIP" aria-haspopup="dialog" aria-label="VIP club">${icon('crown')}</button>
      <button class="icon-btn avatar" data-action="info" data-topic="Profile" aria-haspopup="dialog" aria-label="Demo profile">${icon('profile')}</button>
      <button class="icon-btn panel-toggle" data-action="panel" aria-label="${ui.panelHidden ? 'Show' : 'Hide'} side panel" aria-expanded="${!ui.panelHidden}">${icon('panel')}</button>
    </div>
  </header>`;
}

function railLink(href: string, label: string, glyph: string, active: boolean, count = '', live = false): string {
  return `<a class="rail-item ${active ? 'active' : ''}" href="${href}" ${active ? 'aria-current="page"' : ''} data-tip="${esc(label)}">
    ${icon(glyph)}<span class="rail-label">${esc(label)}</span>${count ? `<b class="rail-count ${live ? 'live' : ''}">${count}</b>` : ''}
  </a>`;
}

function railButton(action: string, label: string, glyph: string, active = false, extra = ''): string {
  return `<button class="rail-item ${active ? 'active' : ''}" data-action="${action}" ${extra} data-tip="${esc(label)}" aria-label="${esc(label)}" ${active ? 'aria-pressed="true"' : ''}>
    ${icon(glyph)}<span class="rail-label">${esc(label)}</span>
  </button>`;
}

export function iconRail(): string {
  const p = page();
  const section = p === 'match' ? (currentFixture().sport === 'Football' ? 'football' : 'home') : p;
  const open = openBets().length;
  return `<aside class="rail ${ui.railExpanded ? 'expanded' : ''}" aria-label="Main navigation">
    <div class="rail-switch" role="group" aria-label="Housebets products">
      <button class="switch-item" data-action="info" data-topic="Casino" aria-haspopup="dialog">${icon('casino')}<span>Casino</span></button>
      <a class="switch-item active" href="#/sports" aria-current="true">${icon('ball')}<span>Sports</span></a>
    </div>
    <nav class="rail-nav" aria-label="Sportsbook pages">
      ${railLink('#/sports', 'Home', 'home', section === 'home' && ui.sport === 'All')}
      ${railLink('#/live', 'Live', 'live', section === 'live', String(liveFixtures().length), true)}
      ${railLink('#/football', 'Soccer', 'ball', section === 'football')}
      ${sports.filter(s => s !== 'Football').map(s => railButton('sport', sportLabel(s), sportIcon(s), section === 'home' && ui.sport === s, `data-sport="${s}"`)).join('')}
      <span class="rail-sep" aria-hidden="true"></span>
      ${railButton('favourites', 'Favourites', 'star')}
      ${railLink('#/bets', 'My bets', 'ticket', section === 'bets', open ? String(open) : '')}
    </nav>
    <div class="rail-foot">${railButton('demo', 'Demo controls', 'settings', false, 'aria-haspopup="dialog"')}</div>
  </aside>`;
}

export function searchBar(): string {
  return `<div class="search" role="search">
    ${icon('search')}
    <input id="global-search" data-focus="search" type="search" enterkeyhint="search" autocomplete="off"
      placeholder="Search teams, players, leagues or markets" aria-label="Search teams, players, competitions or markets" value="${esc(ui.query)}">
    ${ui.query ? `<button type="button" class="icon-btn" data-action="clear-search" aria-label="Clear search">${icon('close')}</button>` : '<kbd aria-hidden="true">/</kbd>'}
  </div>`;
}

export function sportTabs(): string {
  const p = page();
  const fixtures = state().fixtures;
  const section = p === 'match' ? (currentFixture().sport === 'Football' ? 'football' : 'home') : p;
  const tab = (href: string, label: string, glyph: string, active: boolean, count?: number, live = false) =>
    `<a class="sport-tab ${active ? 'active' : ''}" href="${href}" ${active ? 'aria-current="page"' : ''}>
      ${icon(glyph)}<span>${esc(label)}</span>${count !== undefined ? `<b class="${live ? 'live' : ''}">${count}</b>` : ''}
    </a>`;
  const sportButton = (s: Sport) => {
    const active = section === 'home' && ui.sport === s;
    return `<button class="sport-tab ${active ? 'active' : ''}" data-action="sport" data-sport="${s}" aria-pressed="${active}">
      ${icon(sportIcon(s))}<span>${esc(sportLabel(s))}</span><b>${fixtures.filter(f => f.sport === s).length}</b>
    </button>`;
  };
  return `<nav class="sport-tabs" aria-label="Sports">
    ${tab('#/sports', 'Home', 'home', section === 'home' && ui.sport === 'All')}
    ${tab('#/live', 'Live', 'live', section === 'live', liveFixtures().length, true)}
    ${tab('#/football', 'Soccer', 'ball', section === 'football', fixtures.filter(f => f.sport === 'Football').length)}
    ${sports.filter(s => s !== 'Football').map(sportButton).join('')}
  </nav>`;
}

export function favouriteChips(): string {
  const favourites = state().favorites;
  return `<div class="fav-chips" role="group" aria-label="Favourites">
    <span class="fav-title">${icon('star')}Favourites</span>
    ${favourites.length ? favourites.map(key => {
      const [kind, name] = key.split(':');
      return `<span class="chip ${isFavorite(key) ? 'on' : ''}">
        <button class="chip-main" data-action="open-favourite" data-key="${esc(key)}">${icon(kind === 'team' ? 'shield' : 'trophy')}${esc(name)}</button>
        <button class="chip-x" data-action="follow" data-key="${esc(key)}" aria-label="Remove ${esc(name)} from favourites">${icon('close')}</button>
      </span>`;
    }).join('') : '<span class="fav-hint">Tap the star on a team or league to pin it here.</span>'}
  </div>`;
}

export function bottomNav(): string {
  return `<nav class="bottom-nav" aria-label="Mobile navigation">
    <button data-action="menu" aria-haspopup="dialog">${icon('menu')}<span>Menu</span></button>
    <a href="#/sports" class="active" aria-current="true">${icon('ball')}<span>Sports</span></a>
    <button data-action="info" data-topic="Casino" aria-haspopup="dialog">${icon('casino')}<span>Casino</span></button>
    <button data-action="chat" aria-haspopup="dialog">${icon('chat')}<span>Chat</span></button>
    <button data-action="search">${icon('search')}<span>Search</span></button>
  </nav>`;
}

export function mobileSlipBar(): string {
  const s = state();
  const n = s.selections.length;
  const attention = s.selections.some(p => {
    const r = resolve(s, p);
    return !r || r.market.suspended || r.outcome.odds !== p.acceptedOdds;
  });
  const status = attention
    ? 'Review needed'
    : n
      ? totalStake(s) ? `${plural(n, 'single')} · ${money(totalStake(s))} USDT` : `${plural(n, 'single')} · enter a stake`
      : 'Tap any odds to add a pick';
  return `<div class="slip-bar ${n ? 'has-picks' : ''}">
    <button data-action="mobile-slip" aria-haspopup="dialog" aria-label="Open bet slip, ${plural(n, 'selection')}${totalStake(s) ? `, potential return ${money(totalReturn(s))} USDT` : ''}${attention ? ', needs review' : ''}">
      <span class="slip-bar-count">${icon('ticket')}${n ? `<b>${n}</b>` : ''}</span>
      <span class="slip-bar-copy"><strong>Bet slip</strong><small class="${attention ? 'attention' : ''}">${status}</small></span>
      <span class="slip-bar-return">${totalStake(s) ? `<small>Returns</small><strong>${money(totalReturn(s))}</strong>` : icon('up')}</span>
    </button>
  </div>`;
}

export function footer(): string {
  return `<footer class="site-footer">
    <span class="footer-brand">${brandLogo()}</span>
    <p>Sportsbook design concept · sample fixtures and odds · simulated USDT balance</p>
    <p>Times in your time zone (${esc(timeZone())}) · Decimal odds · Singles only</p>
  </footer>`;
}
