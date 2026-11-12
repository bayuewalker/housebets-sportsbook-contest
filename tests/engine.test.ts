import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  acceptChanges, cashOut, driftOdds, initialState, moveOdds, placeBets, placementError, removeSuspended,
  searchFixtures, searchReason, settle, stakeValue, toggleSelection, toggleSuspension, totalReturn, totalStake,
} from '../src/engine.ts';

/** Arsenal to win at 1.22 with a 10 USDT stake. */
const picked = () => {
  const s = initialState();
  toggleSelection(s, 'ars-bha', 'result', 'result-0');
  s.selections[0].stake = '10';
  return s;
};

test('a new pick starts with an empty stake that blocks placement', () => {
  const s = initialState();
  toggleSelection(s, 'ars-bha', 'result', 'result-0');
  assert.equal(s.selections[0].stake, '');
  assert.equal(totalStake(s), 0);
  assert.equal(totalReturn(s), 0);
  assert.match(placementError(s)!, /Enter a stake/);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
});

test('single pick calculates decimal return in USDT', () => {
  const s = picked();
  assert.equal(totalStake(s), 10);
  assert.equal(totalReturn(s), 12.2);
  assert.equal(placementError(s), undefined);
});

test('picks are independent singles, never multiplied together', () => {
  const s = picked();
  toggleSelection(s, 'liv-mun', 'result', 'result-0');
  s.selections[1].stake = '10';
  assert.equal(totalStake(s), 20);
  assert.equal(totalReturn(s), 28.7);
  const open = s.bets.filter(b => b.status === 'open').length;
  assert.equal(placeBets(s).ok, true);
  assert.equal(s.bets.filter(b => b.status === 'open').length, open + 2);
  assert.equal(s.balance, 980);
});

test('tapping selected odds removes the selection', () => {
  const s = picked();
  toggleSelection(s, 'ars-bha', 'result', 'result-0');
  assert.equal(s.selections.length, 0);
});

test('odds changes block placement until explicitly accepted', () => {
  const s = picked();
  moveOdds(s);
  assert.match(placementError(s)!, /Odds changed/);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
  assert.equal(totalReturn(s), 12.2);
  acceptChanges(s);
  assert.equal(totalReturn(s), 13.4);
  assert.equal(placeBets(s).ok, true);
  assert.equal(s.bets[0].odds, 1.34);
});

test('a second odds movement needs fresh acceptance', () => {
  const s = picked();
  moveOdds(s);
  acceptChanges(s);
  moveOdds(s);
  assert.equal(placeBets(s).ok, false);
  assert.match(placementError(s)!, /Odds changed/);
});

test('suspension preserves selection and prevents payment', () => {
  const s = picked();
  toggleSuspension(s);
  assert.equal(s.selections.length, 1);
  assert.match(placementError(s)!, /suspended/);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
  toggleSuspension(s);
  assert.equal(placeBets(s).ok, true);
});

test('suspended markets cannot be selected', () => {
  const s = initialState();
  toggleSelection(s, 'ars-bha', 'cards', 'cards-0');
  toggleSelection(s, 'avl-whu', 'result', 'result-0');
  assert.equal(s.selections.length, 0);
});

test('failed placement leaves picks, history and balance unchanged; retry succeeds', () => {
  const s = picked();
  s.failNext = true;
  const count = s.bets.length;
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
  assert.equal(s.bets.length, count);
  assert.equal(s.selections.length, 1);
  assert.equal(placeBets(s).ok, true);
  assert.equal(s.balance, 990);
  assert.equal(s.selections.length, 0);
});

test('invalid stakes, exponent notation and precision are rejected', () => {
  for (const value of ['', '-1', '0', '0.99', '1001', '1.001', '1e2', 'Infinity', 'NaN', ' 10', 'abc']) {
    const s = picked();
    s.selections[0].stake = value;
    assert.ok(placementError(s), value);
    assert.equal(placeBets(s).ok, false);
    assert.equal(s.balance, 1000);
  }
});

test('valid boundary stakes accepted without floating point residue', () => {
  const s = picked();
  s.selections[0].stake = '1.01';
  assert.equal(totalReturn(s), 1.23);
  assert.equal(stakeValue('1000'), 1000);
  assert.equal(placeBets(s).ok, true);
  assert.equal(s.balance, 998.99);
});

test('aggregate stake cannot exceed demo balance', () => {
  const s = picked();
  s.selections[0].stake = '600';
  toggleSelection(s, 'liv-mun', 'result', 'result-0');
  s.selections[1].stake = '600';
  assert.match(placementError(s)!, /balance/);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
});

test('cashout credits once, records the time and moves bet out of open', () => {
  const s = initialState();
  assert.equal(cashOut(s, 'HB-1048'), true);
  assert.equal(s.balance, 1031.2);
  assert.equal(s.bets[0].status, 'cashed');
  assert.ok(s.bets[0].settledAt);
  assert.equal(cashOut(s, 'HB-1048'), false);
  assert.equal(s.balance, 1031.2);
});

test('settlement credits once and retains settled record', () => {
  const s = initialState();
  assert.equal(settle(s), true);
  assert.equal(s.balance, 1047.5);
  assert.equal(s.bets[0].status, 'won');
  assert.equal(settle(s), true);
  assert.equal(settle(s), true);
  assert.equal(settle(s), false);
});

test('sample history covers every result type across several sports and weeks', () => {
  const { bets } = initialState();
  assert.deepEqual([...new Set(bets.map(b => b.status))].sort(), ['cashed', 'lost', 'open', 'won']);
  assert.ok(new Set(bets.map(b => b.sport)).size >= 5);
  const oldest = Math.min(...bets.map(b => Date.parse(b.placedAt)));
  assert.ok(Date.now() - oldest > 30 * 24 * 3600_000);
  for (const b of bets) assert.equal(b.status === 'open', b.settledAt === undefined, b.id);
});

test('search covers teams, players, competition and markets', () => {
  const s = initialState();
  for (const term of ['Arsenal', 'Marlow', 'Premier League', 'Total corners', 'Spurs']) assert.ok(searchFixtures(s.fixtures, term).length, term);
  assert.equal(searchFixtures(s.fixtures, 'ZZZ-NOT-A-TEAM').length, 0);
});

test('five leagues with three to ten matches each, and thirteen live events', () => {
  const s = initialState();
  for (const l of ['Premier League', 'Champions League', 'LaLiga', 'Serie A', 'Bundesliga']) {
    const count = s.fixtures.filter(f => f.league === l).length;
    assert.ok(count >= 3 && count <= 10, `${l}: ${count}`);
  }
  const live = s.fixtures.filter(f => f.live);
  assert.equal(live.length, 13);
  assert.equal(live.filter(f => f.sport === 'Football').length, 6);
});

test('the featured match offers 40 to 85 markets across six football groups', () => {
  const [ars] = initialState().fixtures;
  assert.ok(ars.markets.length >= 40 && ars.markets.length <= 85, String(ars.markets.length));
  assert.equal(new Set(ars.markets.map(m => m.category)).size, 6);
  assert.ok(ars.markets.some(m => m.suspended));
  assert.equal(new Set(ars.markets.map(m => m.id)).size, ars.markets.length);
  for (const m of ars.markets) for (const o of m.outcomes) assert.ok(o.odds >= 1.02 && o.odds <= 151, `${m.id} ${o.odds}`);
});

test('empty and unknown selections cannot transact', () => {
  const s = initialState();
  assert.equal(placeBets(s).ok, false);
  toggleSelection(s, 'missing', 'result', 'result-0');
  assert.equal(s.selections.length, 0);
  s.selections.push({ fixtureId: 'missing', marketId: 'x', outcomeId: 'y', acceptedOdds: 2, stake: '10' });
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
});

test('transaction revalidation catches a suspension after initial review', () => {
  const s = picked();
  assert.equal(placementError(s), undefined);
  toggleSuspension(s);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 1000);
});

test('accepting another pick never silently accepts a suspended changed selection', () => {
  const s = picked();
  moveOdds(s);
  toggleSuspension(s);
  toggleSelection(s, 'liv-mun', 'result', 'result-0');
  s.selections[1].stake = '10';
  acceptChanges(s);
  assert.equal(s.selections[0].acceptedOdds, 1.22);
  toggleSuspension(s);
  assert.match(placementError(s)!, /Odds changed/);
  acceptChanges(s);
  assert.equal(placementError(s), undefined);
});

test('repeated placement after a success cannot duplicate the debit or receipt', () => {
  const s = picked();
  s.selections[0].stake = '25';
  const first = placeBets(s);
  const count = s.bets.length;
  assert.equal(first.ok, true);
  assert.equal(s.balance, 975);
  assert.equal(placeBets(s).ok, false);
  assert.equal(s.balance, 975);
  assert.equal(s.bets.length, count);
});

test('successful placement returns a receipt for every single', () => {
  const s = picked();
  toggleSelection(s, 'liv-mun', 'result', 'result-0');
  s.selections[1].stake = '25';
  const result = placeBets(s);
  assert.equal(result.bets?.length, 2);
  assert.deepEqual(result.bets!.map(b => [b.outcome, b.stake, b.return, b.sport]), [['Arsenal', 10, 12.2, 'Football'], ['Liverpool', 25, 41.25, 'Football']]);
  assert.equal(new Set(result.bets!.map(b => b.id)).size, 2);
  assert.equal(placeBets(initialState()).bets, undefined);
});

test('search explains why each fixture matched', () => {
  const [ars] = initialState().fixtures;
  assert.equal(searchReason(ars, 'arsenal'), 'Team');
  assert.equal(searchReason(ars, 'Marlow'), 'Player · Theo Marlow');
  assert.equal(searchReason(ars, 'premier'), 'Competition');
  assert.equal(searchReason(ars, 'corners'), 'Market · Total corners · 9.5');
  assert.equal(searchReason(ars, '  '), '');
});

test('removing suspended picks keeps open selections and their stakes', () => {
  const s = picked();
  toggleSelection(s, 'liv-mun', 'result', 'result-0');
  s.selections[1].stake = '40';
  toggleSuspension(s);
  assert.equal(removeSuspended(s), 1);
  assert.deepEqual(s.selections.map(p => [p.fixtureId, p.stake]), [['liv-mun', '40']]);
  assert.equal(placementError(s), undefined);
});

test('live price feed moves one unselected in-play price and never a pick', () => {
  const s = picked();
  const seq = [0, 0.99, 0.1];
  let i = 0;
  const rng = () => seq[i++ % seq.length];
  for (let n = 0; n < 200; n++) {
    const c = driftOdds(s, rng);
    assert.ok(c);
    const f = s.fixtures.find(x => x.id === c.fixtureId)!;
    assert.equal(f.live, true);
    const m = f.markets.find(x => x.id === c.marketId)!;
    assert.equal(m.suspended, false);
    const o = m.outcomes.find(x => x.id === c.outcomeId)!;
    assert.notEqual(o.odds, o.previous);
    assert.ok(o.odds >= 1.01);
  }
  assert.equal(s.fixtures[0].markets[0].outcomes[0].odds, 1.22);
  assert.equal(placementError(s), undefined);
});

test('live price feed clears stale movement markers and stops when nothing is live', () => {
  const s = initialState();
  const first = driftOdds(s, () => 0)!;
  const second = driftOdds(s, () => 0.5)!;
  assert.ok(second.cleared.includes(`${first.fixtureId}:${first.marketId}:${first.outcomeId}`));
  s.noLive = true;
  assert.equal(driftOdds(s), undefined);
});

test('live price feed can be limited to prices on screen', () => {
  const s = initialState();
  for (let n = 0; n < 50; n++) {
    const c = driftOdds(s, Math.random, (f, m) => f === 'bar-atm' && m === 'result')!;
    assert.equal(c.fixtureId, 'bar-atm');
    assert.equal(c.marketId, 'result');
  }
  assert.equal(driftOdds(s, Math.random, () => false), undefined);
});
