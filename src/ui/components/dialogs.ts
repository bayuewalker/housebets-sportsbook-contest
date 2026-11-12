import { leagues } from '../../data';
import { brandLogo, icon } from '../../icons';
import { esc, money } from '../format';
import { openBets, state, ui } from '../state';
import { leagueFlag } from './common';
import { panelContent, panelTabs } from './panel';
import { wordmark } from './shell';

function demo(): string {
  const s = state();
  const item = (action: string, glyph: string, title: string, text: string, armed = false) =>
    `<button data-action="${action}" class="${armed ? 'armed' : ''}">${icon(glyph)}<b>${title}</b><span>${text}</span></button>`;
  return `<p class="eyebrow">Demo controls</p>
    <h2>Trigger any state</h2>
    <p class="dialog-intro">Sample data and simulated transactions. Price and suspension changes target your first selection, or Arsenal's match result when the slip is empty.</p>
    <div class="demo-grid">
      ${item('move', 'refresh', 'Move odds', 'Needs explicit acceptance')}
      ${item('suspend', 'lock', 'Suspend / reopen', 'Selection stays in the slip')}
      ${item('fail', 'info', s.failNext ? 'Failure armed' : 'Fail next placement', s.failNext ? 'Click again to disarm' : 'Balance stays untouched', s.failNext)}
      ${item('settle', 'check', 'Settle an open bet', 'Marks it won and pays out')}
      ${item('no-live', 'clock', s.noLive ? 'Restore live events' : 'No live events', 'Shows the starting-soon fallback', s.noLive)}
      ${item('loading', 'refresh', 'Loading state', 'Two-second skeleton')}
      ${item('feed', 'live', ui.liveFeed ? 'Pause live prices' : 'Resume live prices', 'In-play prices move every few seconds', !ui.liveFeed)}
    </div>
    <div class="dialog-foot"><span>Reset restores 1,000 USDT and the sample history.</span><button class="text-btn" data-action="reset-confirm">Reset demo</button></div>`;
}

function info(): string {
  const s = state();
  switch (ui.info) {
    case 'Profile':
      return `<p class="eyebrow">Demo profile</p>
        <div class="profile-head"><span class="icon-btn avatar large" aria-hidden="true">${icon('profile')}</span><div><h2>Guest player</h2><p>Simulated session, no account connected</p></div></div>
        <dl class="stats-list">
          <div><dt>Demo balance</dt><dd>${money(s.balance)} USDT</dd></div>
          <div><dt>Open bets</dt><dd>${openBets().length}</dd></div>
          <div><dt>Favourites</dt><dd>${s.favorites.length}</dd></div>
        </dl>
        <div class="dialog-actions">
          <button class="btn ghost" data-action="view-open">${icon('ticket')}My bets</button>
          <button class="btn ghost" data-action="demo">${icon('settings')}Demo controls</button>
        </div>
        <p class="dialog-intro">Favourites, bet history and the demo balance are stored in this browser only.</p>`;
    case 'Prize':
      return `<p class="eyebrow">Weekly Prize</p><h2>Part of the Housebets shell</h2>
        <p>The Weekly Prize lives in the Housebets top bar. It is shown here for context only; this sportsbook prototype has no leaderboard, entries or rewards.</p>
        <button class="btn accent" data-action="close">Back to Sports ${icon('arrow')}</button>`;
    case 'VIP':
      return `<p class="eyebrow">VIP club</p><h2>Part of the Housebets shell</h2>
        <p>The VIP crown opens the Housebets loyalty area. It is outside this sportsbook prototype, so nothing is tracked or awarded here.</p>
        <button class="btn accent" data-action="close">Back to Sports ${icon('arrow')}</button>`;
    default:
      return `<p class="eyebrow">Casino</p><h2>Outside this prototype</h2>
        <p>Casino sits next to Sports in the Housebets navigation. This contest entry covers the sportsbook pages only, so no casino games are available here.</p>
        <button class="btn accent" data-action="close">Back to Sports ${icon('arrow')}</button>`;
  }
}

function menu(): string {
  const open = openBets().length;
  return `<a class="brand" href="#/sports">${brandLogo()}${wordmark()}</a>
    <nav class="menu-nav" aria-label="Sportsbook pages">
      <a href="#/sports">${icon('home')}Home</a>
      <a href="#/live">${icon('live')}Live <b class="count live">${state().fixtures.filter(f => f.live && !state().noLive).length}</b></a>
      <a href="#/football">${icon('ball')}Soccer</a>
      <a href="#/bets">${icon('ticket')}Bet slip &amp; My bets ${open ? `<b class="count">${open}</b>` : ''}</a>
    </nav>
    <p class="menu-label">Top competitions</p>
    <div class="menu-leagues">${leagues.map(l => `<button data-action="league" data-league="${esc(l)}">${leagueFlag(l)}${esc(l)}</button>`).join('')}</div>
    <p class="menu-label">More</p>
    <div class="menu-nav">
      <button data-action="info" data-topic="Prize">${icon('trophy')}Weekly Prize</button>
      <button data-action="info" data-topic="VIP">${icon('crown')}VIP club</button>
      <button data-action="info" data-topic="Profile">${icon('profile')}Demo profile</button>
      <button data-action="demo">${icon('settings')}Demo controls</button>
    </div>`;
}

function cash(): string {
  const b = state().bets.find(x => x.id === ui.cashId);
  if (!b) return '';
  return `<p class="eyebrow">Cash out</p><h2>Cash out this bet?</h2>
    <p>${esc(b.outcome)} · ${esc(b.market)}<br>${esc(b.fixture)}</p>
    <div class="big-amount">${money(b.cashOffer)} <small>USDT</small></div>
    <p>The bet settles now and this amount returns to your demo balance. Stake ${money(b.stake)} USDT; full potential return ${money(b.return)} USDT.</p>
    <button class="btn accent" data-action="confirm-cash" data-id="${esc(b.id)}">Confirm cash out</button>`;
}

export function dialog(): string {
  if (!ui.dialog) return '';
  const s = state();
  let label = '';
  let body = '';
  let cls = '';
  switch (ui.dialog) {
    case 'slip':
    case 'chat':
      label = ui.panelTab === 'chat' ? 'Chat' : ui.panelTab === 'bets' ? 'My bets' : 'Bet slip';
      cls = 'sheet';
      body = `<div class="sheet-head"><span class="grab" aria-hidden="true"></span>${panelTabs('sheet')}</div>${panelContent('sheet')}`;
      break;
    case 'menu':
      label = 'Menu';
      cls = 'drawer';
      body = menu();
      break;
    case 'demo':
      label = 'Demo controls';
      body = demo();
      break;
    case 'wallet':
      label = 'Demo wallet';
      body = `<p class="eyebrow">Demo wallet</p><h2>Practice balance</h2>
        <div class="big-amount">${money(s.balance)} <small>USDT</small></div>
        <p>Deposits and withdrawals are switched off. This frontend prototype has no accounts, payments or real-money transactions.</p>
        <button class="btn ghost" data-action="view-open">My bets ${icon('arrow')}</button>`;
      break;
    case 'cash':
      label = 'Confirm cash out';
      body = cash();
      break;
    case 'reset':
      label = 'Reset demo';
      body = `<p class="eyebrow">Reset</p><h2>Start a fresh session?</h2>
        <p>Your picks, favourites and bet history go back to the sample session.</p>
        <button class="btn accent" data-action="reset">Reset demo session</button>`;
      break;
    case 'info':
      label = ui.info === 'Profile' ? 'Demo profile' : ui.info === 'Prize' ? 'Weekly Prize' : ui.info === 'VIP' ? 'VIP club' : 'Casino';
      body = info();
      break;
  }
  return `<dialog class="modal ${cls}" aria-label="${esc(label)}">
    <button class="icon-btn modal-close" data-action="close" aria-label="Close">${icon('close')}</button>
    ${body}
  </dialog>`;
}
