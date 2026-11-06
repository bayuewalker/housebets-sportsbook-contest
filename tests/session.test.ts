import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restoreSession } from '../src/session.ts';
import { initialState, cashOut, toggleSelection } from '../src/engine.ts';

test('refresh preserves a completed demo transaction but not unplaced picks', () => {
  const state = initialState();
  cashOut(state, 'HL-1048');
  toggleSelection(state, 'ars-bha', 'result', 'result-0');
  const restored = restoreSession(JSON.stringify({ version: 1, ...state }));
  assert.equal(restored.balance, 1031.2);
  assert.equal(restored.bets[0].status, 'cashed');
  assert.equal(restored.selections.length, 0);
  assert.equal(cashOut(restored, 'HL-1048'), false);
});

test('corrupt storage restores a complete sample session', () => {
  for (const raw of [null, '{broken', 'null', '[]', '{"version":2}']) {
    assert.deepEqual(restoreSession(raw), initialState());
  }
});

test('malformed history and balance cannot corrupt rendering or transactions', () => {
  const valid = { version: 1, ...initialState() };
  const variants = [
    { ...valid, balance: -1 },
    { ...valid, bets: [null] },
    { ...valid, bets: [{ ...valid.bets[0], odds: 0 }] },
    { ...valid, bets: [{ ...valid.bets[0], stake: -25 }] },
    { ...valid, bets: [{ ...valid.bets[0], fixtureId: 'missing' }] },
    { ...valid, bets: [{ ...valid.bets[0], createdAt: undefined }] },
    { ...valid, bets: [valid.bets[0], valid.bets[0]] },
    { ...valid, favorites: [null] },
  ];
  for (const value of variants) assert.deepEqual(restoreSession(JSON.stringify(value)), initialState());
});

test('live total-goal and both-score markets are not already decided', () => {
  for (const fixture of initialState().fixtures.filter(f => f.live && f.sport === 'Football')) {
    const total = fixture.score[0] + fixture.score[1];
    for (const market of fixture.markets.filter(m => m.name.startsWith('Total goals · ') && !m.suspended)) {
      const line = Number(market.name.split(' · ')[1]);
      if (Number.isFinite(line)) assert.ok(line > total, `${fixture.id}: ${market.name}`);
    }
    if (fixture.score.every(n => n > 0)) assert.equal(fixture.markets.some(m => m.id === 'btts' && !m.suspended), false);
  }
});
