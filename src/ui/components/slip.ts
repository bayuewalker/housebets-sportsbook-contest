import { placementError, resolve, round, stakeValue, totalReturn, totalStake, type Selection } from '../../engine';
import { icon } from '../../icons';
import { esc, money, plural } from '../format';
import { isLive, pickKey, state, ui } from '../state';

export type SlipScope = 'panel' | 'sheet' | 'page';

const QUICK_STAKES = [5, 10, 25, 50, 100];

function selectionCard(p: Selection, scope: SlipScope): string {
  const r = resolve(state(), p);
  if (!r) return '';
  const key = pickKey(p);
  const changed = r.outcome.odds !== p.acceptedOdds;
  const id = `stake-${scope}-${key}`;
  const value = stakeValue(p.stake);
  const invalid = p.stake !== '' && (!Number.isFinite(value) || value < 1 || value > 1000);
  const odds = changed ? r.outcome.odds : p.acceptedOdds;
  const returns = Number.isFinite(value) ? round(value * odds) : 0;
  const disabled = ui.busy ? 'disabled' : '';
  return `<article class="pick ${changed && !r.market.suspended ? 'is-changed' : ''} ${r.market.suspended ? 'is-suspended' : ''}">
    <div class="pick-top">
      <span class="pick-kind">${isLive(r.fixture) ? '<span class="live-pill">Live</span>' : icon('clock')}${esc(r.market.name)}</span>
      <button class="icon-btn" data-action="remove" data-key="${key}" aria-label="Remove ${esc(r.outcome.label)}" ${disabled}>${icon('close')}</button>
    </div>
    <div class="pick-main">
      <strong>${esc(r.outcome.label)}</strong>
      <b class="pick-odds ${changed ? (r.outcome.odds > p.acceptedOdds ? 'up' : 'down') : ''}">${changed ? `<s>${p.acceptedOdds.toFixed(2)}</s>` : ''}${odds.toFixed(2)}</b>
    </div>
    <a class="pick-fixture" href="#/match/${r.fixture.id}">${esc(r.fixture.home)} v ${esc(r.fixture.away)}</a>
    ${r.market.suspended
      ? `<p class="pick-msg suspended" role="status">${icon('lock')}<span><b>Market suspended.</b> Your pick is kept; placing is paused until it reopens.</span></p>`
      : changed
        ? `<p class="pick-msg changed" role="status">${icon('refresh')}<span><b>Odds changed</b> from ${p.acceptedOdds.toFixed(2)} to ${r.outcome.odds.toFixed(2)}. Accept to continue.</span></p>`
        : ''}
    <div class="stake-row">
      <label class="stake-field ${invalid ? 'invalid' : ''}" for="${id}">
        <span class="stake-caption">Stake</span>
        <input id="${id}" data-focus="${id}" data-stake="${key}" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off"
          placeholder="0.00" value="${esc(p.stake)}" aria-label="Stake for ${esc(r.outcome.label)} in USDT"
          aria-invalid="${invalid}" ${invalid ? `aria-describedby="${id}-error"` : ''} ${disabled}>
        <span class="unit">USDT</span>
      </label>
      <div class="pick-return"><small>Returns</small><b>${money(returns)}</b></div>
    </div>
    <div class="quick-stakes" role="group" aria-label="Quick stakes">
      ${QUICK_STAKES.map(n => `<button data-action="stake" data-key="${key}" data-value="${n}" aria-pressed="${p.stake === String(n)}" aria-label="Stake ${n} USDT" ${disabled}>${n}</button>`).join('')}
    </div>
    ${invalid ? `<p class="input-error" id="${id}-error">${icon('info')}Enter 1 to 1,000 USDT, up to 2 decimals.</p>` : ''}
  </article>`;
}

function notice(): string {
  const n = ui.notice;
  if (!n) return '';
  const dismiss = `<button data-action="dismiss-notice" class="icon-btn" aria-label="Dismiss">${icon('close')}</button>`;
  if (n.kind === 'success') {
    return `<div class="notice success" role="status">${icon('check')}
      <div class="notice-body">
        <b>Bet placed</b>
        <p>${esc(n.message)}</p>
        ${n.bets?.length ? `<ul class="receipt">${n.bets.map(b => `<li>
          <span><strong>${esc(b.outcome)}</strong><small>${esc(b.market)} · ${esc(b.fixture)}</small></span>
          <span><b>${b.odds.toFixed(2)}</b><small>${money(b.stake)} → ${money(b.return)}</small></span>
        </li>`).join('')}</ul>` : ''}
        <button data-action="view-open" class="text-btn">View in My bets ${icon('arrow')}</button>
      </div>${dismiss}</div>`;
  }
  return `<div class="notice error" role="alert">${icon('info')}
    <div class="notice-body">
      <b>Bet not placed</b>
      <p>${esc(n.message.replace(/^Bet not placed\.\s*/, ''))}</p>
      ${placementError(state()) ? '' : `<button data-action="place" class="btn ghost small" ${ui.busy ? 'disabled' : ''}>${icon('refresh')}Try again</button>`}
    </div>${dismiss}</div>`;
}

function liveReturn(): number {
  const s = state();
  return round(s.selections.reduce((total, p) => {
    const r = resolve(s, p);
    const stake = stakeValue(p.stake);
    return total + (r && Number.isFinite(stake) ? round(stake * r.outcome.odds) : 0);
  }, 0));
}

export function slip(scope: SlipScope): string {
  const s = state();
  const n = s.selections.length;
  const resolved = s.selections.map(p => ({ p, r: resolve(s, p) }));
  const changed = resolved.filter(({ p, r }) => r && r.outcome.odds !== p.acceptedOdds && !r.market.suspended).length;
  const suspended = resolved.filter(({ r }) => r?.market.suspended).length;
  const blocked = placementError(s);
  const stake = totalStake(s);
  const returns = changed ? liveReturn() : totalReturn(s);
  const disabled = ui.busy ? 'disabled' : '';
  if (!n) {
    return `<div class="slip is-empty" data-scope="${scope}">
      <div class="slip-body">
        ${notice()}
        <div class="slip-empty">
          <span class="empty-art">${icon('ticket')}</span>
          <h3>Your bet slip is empty</h3>
          <p>Tap any price to add a selection. Each pick is placed as a single bet.</p>
          <a class="btn ghost" href="#/live">${icon('live')}Browse live events</a>
        </div>
      </div>
    </div>`;
  }
  const placeLabel = ui.busy
    ? '<span class="spinner" aria-hidden="true"></span>Placing…'
    : !stake
      ? 'Enter a stake'
      : `Place ${n === 1 ? 'bet' : `${n} bets`} · ${money(stake)} USDT`;
  return `<div class="slip" data-scope="${scope}">
    <div class="slip-body">
      ${notice()}
      <div class="slip-toolbar">
        <span>${plural(n, 'single')}</span>
        <button class="text-btn" data-action="clear-slip" ${disabled}>Clear all</button>
      </div>
      ${changed ? `<div class="slip-alert changed" role="status">${icon('refresh')}<span><b>Odds changed on ${plural(changed, 'selection')}.</b> Check the new price and returns, then accept.</span></div>` : ''}
      ${suspended ? `<div class="slip-alert suspended" role="status">${icon('lock')}<span><b>${plural(suspended, 'selection')} suspended.</b> Placing is paused.</span><button class="text-btn" data-action="remove-suspended" ${disabled}>Remove</button></div>` : ''}
      <div class="picks">${s.selections.map(p => selectionCard(p, scope)).join('')}</div>
    </div>
    <div class="slip-footer">
      <dl class="slip-totals">
        <div><dt>Total stake</dt><dd>${money(stake)} <small>USDT</small></dd></div>
        <div class="returns"><dt>${changed ? 'Returns after accepting' : 'Potential returns'}</dt><dd>${money(returns)} <small>USDT</small></dd></div>
      </dl>
      ${blocked && !changed && stake ? `<p class="slip-hint">${icon('info')}${esc(blocked)}</p>` : ''}
      <div class="slip-actions">
        ${changed ? `<button class="btn ghost accept" data-action="accept" ${disabled}>${icon('refresh')}Accept odds</button>` : ''}
        <button class="btn accent place" data-action="place" ${blocked || ui.busy ? 'disabled' : ''}>${placeLabel}</button>
      </div>
      <p class="slip-note">${icon('shield')}Demo balance only · no real money</p>
    </div>
  </div>`;
}
