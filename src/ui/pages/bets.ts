import { icon } from '../../icons';
import { esc, money } from '../format';
import { state } from '../state';
import { betsTable } from '../components/mybets';
import { slip } from '../components/slip';

/** Bet slip and My bets share one page, as they share one panel on desktop. */
export function betsPage(): string {
  const s = state();
  return `<h1 id="page-title" tabindex="-1" class="page-title">${icon('ticket')}Bet slip &amp; My bets <span>Balance ${esc(money(s.balance))} USDT</span></h1>
    <div class="bets-layout">
      <section class="bets-slip card" aria-labelledby="slip-title">
        <h2 id="slip-title" class="card-title">Bet slip ${s.selections.length ? `<b class="count">${s.selections.length}</b>` : ''}</h2>
        ${slip('page')}
      </section>
      ${betsTable()}
    </div>`;
}
