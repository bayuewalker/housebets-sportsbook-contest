import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restoreSession, SESSION_VERSION } from '../src/session.ts';
import { initialState, cashOut, toggleSelection } from '../src/engine.ts';

const now = new Date();

test('refresh preserves a completed demo transaction but not unplaced picks', () => {
  const state = initialState(now);
  cashOut(state, 'HB-1048');
  toggleSelection(state, 'ars-bha', 'result', 'result-0');
  const restored = restoreSession(JSON.stringify({ version: SESSION_VERSION, ...state }), now);
  assert.equal(restored.balance, 1031.2);
  assert.equal(restored.bets[0].status, 'cashed');
  assert.equal(restored.selections.length, 0);
  assert.equal(cashOut(restored, 'HB-1048'), false);
});

test('settled bets on past fixtures survive a refresh', () => {
  const state = initialState(now);
  const restored = restoreSession(JSON.stringify({ version: SESSION_VERSION, ...state }), now);
  assert.equal(restored.bets.length, state.bets.length);
  assert.ok(restored.bets.some(b => b.fixtureId.startsWith('past-')));
});

test('corrupt or outdated storage restores a complete sample session', () => {
  const old = JSON.stringify({ version: 1, ...initialState(now) });
  for (const raw of [null, '{broken', 'null', '[]', '{"version":2}', old]) {
    assert.deepEqual(restoreSession(raw, now), initialState(now));
  }
});

test('malformed history and balance cannot corrupt rendering or transactions', () => {
  const valid = { version: SESSION_VERSION, ...initialState(now) };
  const variants = [
    { ...valid, balance: -1 },
    { ...valid, bets: [null] },
    { ...valid, bets: [{ ...valid.bets[0], odds: 0 }] },
    { ...valid, bets: [{ ...valid.bets[0], stake: -25 }] },
    { ...valid, bets: [{ ...valid.bets[0], fixtureId: 'missing' }] },
    { ...valid, bets: [{ ...valid.bets[0], placedAt: undefined }] },
    { ...valid, bets: [{ ...valid.bets[0], placedAt: 'yesterday' }] },
    { ...valid, bets: [{ ...valid.bets[0], sport: 'Darts' }] },
    { ...valid, bets: [valid.bets[0], valid.bets[0]] },
    { ...valid, favorites: [null] },
  ];
  for (const value of variants) assert.deepEqual(restoreSession(JSON.stringify(value), now), initialState(now));
});

test('live total-goal and both-score markets are not already decided', () => {
  for (const fixture of initialState(now).fixtures.filter(f => f.live && f.sport === 'Football')) {
    const total = fixture.score[0] + fixture.score[1];
    for (const market of fixture.markets.filter(m => m.name.startsWith('Total goals · ') && !m.suspended)) {
      const line = Number(market.name.split(' · ')[1]);
      if (Number.isFinite(line)) assert.ok(line > total, `${fixture.id}: ${market.name}`);
    }
    if (fixture.score.every(n => n > 0)) assert.equal(fixture.markets.some(m => m.id === 'btts' && !m.suspended), false);
  }
});

test('fixtures are scheduled relative to the current hour', () => {
  const fixtures = initialState(now).fixtures;
  for (const f of fixtures) {
    const start = Date.parse(f.kickoff);
    if (f.live) assert.ok(start < now.getTime(), f.id);
    else assert.ok(start > now.getTime() - 3600_000 && start < now.getTime() + 4 * 24 * 3600_000, f.id);
  }
});
