import { sportLabel, sports, type Sport } from '../../data';
import { round, type Bet } from '../../engine';
import { icon, sportIcon } from '../../icons';
import { dayOffset, esc, fullDate, money, placedLabel, plural } from '../format';
import { openBets, state, ui, type DateFilter } from '../state';
import { emptyState } from './common';

const RESULT: Record<Bet['status'], string> = { open: 'Open', won: 'Won', lost: 'Lost', cashed: 'Cashed out' };
const DATES: Array<[DateFilter, string]> = [['all', 'All time'], ['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']];

function inDateRange(b: Bet, filter: DateFilter, now = new Date()): boolean {
  if (filter === 'all') return true;
  if (filter === 'today') return dayOffset(b.placedAt, now) === 0;
  const days = filter === '7d' ? 7 : 30;
  return now.getTime() - Date.parse(b.placedAt) <= days * 86_400_000;
}

export function filteredBets(): Bet[] {
  return state().bets.filter(b =>
    (ui.historyTab === 'open' ? b.status === 'open' : b.status !== 'open')
    && inDateRange(b, ui.dateFilter)
    && (ui.sportFilter === 'All' || b.sport === ui.sportFilter));
}

function cashButton(b: Bet): string {
  return `<button class="btn ghost small cash" data-action="cash" data-id="${esc(b.id)}" aria-haspopup="dialog">${icon('coin')}Cash out <b>${money(b.cashOffer)}</b></button>`;
}

function detail(b: Bet): string {
  const potential = round(b.stake * b.odds);
  return `<div class="bet-detail-grid">
    <div><dt>Reference</dt><dd>${esc(b.id)}</dd></div>
    <div><dt>Event</dt><dd>${b.status === 'open' ? `<a href="#/match/${esc(b.fixtureId)}">${esc(b.fixture)}</a>` : esc(b.fixture)}</dd></div>
    <div><dt>Market</dt><dd>${esc(b.market)} · Single</dd></div>
    <div><dt>Placed</dt><dd>${esc(fullDate(b.placedAt))}</dd></div>
    ${b.settledAt ? `<div><dt>${b.status === 'cashed' ? 'Cashed out' : 'Settled'}</dt><dd>${esc(fullDate(b.settledAt))}</dd></div>` : ''}
    <div><dt>${b.status === 'open' ? 'Potential returns' : 'Full-odds return'}</dt><dd>${money(potential)} USDT</dd></div>
  </div>
  ${b.status === 'cashed' ? `<p class="cash-history">${icon('coin')}<span>Cashed out for <b>${money(b.return)} USDT</b> on a ${money(b.stake)} USDT stake, against ${money(potential)} USDT at full odds.</span></p>` : ''}
  ${b.status === 'open' && b.cashOffer > 0 ? `<div class="bet-detail-actions">${cashButton(b)}<span>This sample offer stays at ${money(b.cashOffer)} USDT until you confirm it.</span></div>` : ''}`;
}

function row(b: Bet): string {
  const open = ui.expanded.has(b.id);
  const detailId = `bet-${b.id}`;
  return `<tbody class="bet ${b.status} ${open ? 'expanded' : ''}">
    <tr class="bet-row">
      <td data-label="Placed" class="placed">
        <button class="expand" data-action="expand" data-id="${esc(b.id)}" aria-expanded="${open}" aria-controls="${detailId}" aria-label="${open ? 'Hide' : 'Show'} details for ${esc(b.outcome)}, ${esc(b.fixture)}">${icon('down')}</button>
        <span>${esc(placedLabel(b.placedAt))}</span>
      </td>
      <td data-label="Bet" class="bet-cell">
        <span class="bet-sport" title="${esc(sportLabel(b.sport))}">${icon(sportIcon(b.sport))}</span>
        <span class="bet-copy"><strong>${esc(b.outcome)}</strong><small>${esc(b.market)} · ${esc(b.fixture)}</small></span>
        ${b.status === 'open' && b.cashOffer > 0 ? cashButton(b) : ''}
      </td>
      <td data-label="Odds" class="num">${b.odds.toFixed(2)}</td>
      <td data-label="Stake" class="num">${money(b.stake)}</td>
      <td data-label="Returns" class="num returns">${money(b.return)}${b.status === 'open' ? '<small>potential</small>' : ''}</td>
      <td data-label="Result" class="result"><span class="result-tag ${b.status}">${RESULT[b.status]}</span></td>
    </tr>
    <tr class="bet-detail" id="${detailId}" ${open ? '' : 'hidden'}><td colspan="6">${open ? detail(b) : ''}</td></tr>
  </tbody>`;
}

function summary(list: Bet[]): string {
  const staked = round(list.reduce((t, b) => t + b.stake, 0));
  const returned = round(list.reduce((t, b) => t + b.return, 0));
  if (ui.historyTab === 'open') {
    return `<p class="bets-summary"><span>${plural(list.length, 'open bet')}</span><span>Staked <b>${money(staked)}</b></span><span>Potential returns <b>${money(returned)}</b></span></p>`;
  }
  const cashed = list.filter(b => b.status === 'cashed');
  const net = round(returned - staked);
  return `<p class="bets-summary">
    <span>${plural(list.length, 'settled bet')}</span>
    <span>Staked <b>${money(staked)}</b></span>
    <span>Returns <b>${money(returned)}</b></span>
    <span>Net <b class="${net >= 0 ? 'pos' : 'neg'}">${net >= 0 ? '+' : '−'}${money(Math.abs(net))}</b></span>
    ${cashed.length ? `<span>${icon('coin')}${plural(cashed.length, 'cash-out')} · <b>${money(round(cashed.reduce((t, b) => t + b.return, 0)))}</b></span>` : ''}
  </p>`;
}

export function betsTable(): string {
  const s = state();
  const list = filteredBets();
  const counts = { open: openBets().length, settled: s.bets.length - openBets().length };
  const betSports = sports.filter(sp => s.bets.some(b => b.sport === sp));
  const tabs = (['open', 'settled'] as const).map(t => `<button role="tab" id="history-${t}" data-focus="history-${t}" aria-controls="history-panel"
      aria-selected="${ui.historyTab === t}" tabindex="${ui.historyTab === t ? 0 : -1}" class="${ui.historyTab === t ? 'active' : ''}"
      data-action="history" data-tab="${t}">${t === 'open' ? 'Open' : 'Settled'} <b>${counts[t]}</b></button>`).join('');
  return `<section class="mybets" aria-labelledby="mybets-title">
    <header class="mybets-head">
      <h2 id="mybets-title">My bets</h2>
      <div class="tabs" role="tablist" aria-label="Bet history">${tabs}</div>
    </header>
    <div class="mybets-filters">
      <label class="select"><span>Date</span>
        <select id="date-filter" aria-label="Filter by date">${DATES.map(([v, l]) => `<option value="${v}" ${ui.dateFilter === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </label>
      <label class="select"><span>Sport</span>
        <select id="sport-filter" aria-label="Filter by sport"><option value="All">All sports</option>${betSports.map(sp => `<option value="${sp}" ${ui.sportFilter === sp ? 'selected' : ''}>${sportLabel(sp as Sport)}</option>`).join('')}</select>
      </label>
    </div>
    <div id="history-panel" role="tabpanel" aria-labelledby="history-${ui.historyTab}" tabindex="0">
      ${summary(list)}
      ${list.length ? `<div class="table-wrap"><table class="bets-table">
        <thead><tr><th scope="col">Placed</th><th scope="col">Bet</th><th scope="col" class="num">Odds</th><th scope="col" class="num">Stake</th><th scope="col" class="num">Returns</th><th scope="col">Result</th></tr></thead>
        ${list.map(row).join('')}
      </table></div>`
        : emptyState(
          ui.historyTab === 'open' ? 'No open bets' : 'No settled bets in this range',
          ui.dateFilter !== 'all' || ui.sportFilter !== 'All' ? 'Try a wider date range or another sport.' : 'Pick a price to place a simulated single bet.',
          ui.dateFilter !== 'all' || ui.sportFilter !== 'All' ? 'Show all bets' : 'Find a match',
          ui.dateFilter !== 'all' || ui.sportFilter !== 'All' ? 'reset-bet-filters' : 'find-match',
          'ticket')}
    </div>
  </section>`;
}

/** Compact open-bet list for the right panel's My bets tab. */
export function panelBets(): string {
  const open = openBets();
  const settled = state().bets.filter(b => b.status !== 'open').slice(0, 3);
  const card = (b: Bet) => `<article class="mini-bet ${b.status}">
    <div class="mini-top"><span>${icon(sportIcon(b.sport))}${esc(placedLabel(b.placedAt))}</span><span class="result-tag ${b.status}">${RESULT[b.status]}</span></div>
    <strong>${esc(b.outcome)} <b>${b.odds.toFixed(2)}</b></strong>
    <small>${esc(b.market)} · ${esc(b.fixture)}</small>
    <div class="mini-values"><span>Stake <b>${money(b.stake)}</b></span><span>${b.status === 'open' ? 'Returns' : 'Paid'} <b>${money(b.return)}</b></span></div>
    ${b.status === 'open' && b.cashOffer > 0 ? cashButton(b) : ''}
  </article>`;
  return `<div class="panel-bets">
    <h3>Open <b>${open.length}</b></h3>
    ${open.length ? open.map(card).join('') : '<p class="muted">No open bets.</p>'}
    <h3>Recently settled</h3>
    ${settled.map(card).join('')}
    <a class="btn ghost full" href="#/bets">Full history ${icon('arrow')}</a>
  </div>`;
}
