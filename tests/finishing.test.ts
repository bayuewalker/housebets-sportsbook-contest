import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchingMarkets, scorerRows, searchesBothTeams, SCORER_IDS } from '../src/ui/query.ts';
import { initialState } from '../src/engine.ts';
import { ui, setMarketQuery, searchAllMarkets } from '../src/ui/state.ts';
import { keyboardOccludesSearch } from '../src/ui/viewport.ts';

const fixture = initialState().fixtures.find(f => f.id === 'ars-bha')!;
const marketNames = fixture.markets.filter(m => SCORER_IDS.includes(m.id)).map(m => m.name);

function reset() {
  ui.category = 'Popular';
  ui.searchCategoryOrigin = null;
  ui.marketQuery = '';
  ui.scorerTeam = 0;
}

test('default category search offers real matches elsewhere and restores the initial scope', () => {
  reset();
  setMarketQuery(' Rafe ');
  const matches = matchingMarkets(fixture, ui.marketQuery);
  assert.ok(matches.length > 0);
  assert.equal(matches.filter(m => m.category === ui.category).length, 0);
  searchAllMarkets();
  assert.equal(ui.category, 'All');
  assert.equal(ui.marketQuery, ' Rafe ');
  assert.equal(searchesBothTeams(ui.marketQuery, marketNames), true);
  assert.deepEqual(scorerRows(fixture.players, ui.scorerTeam, ui.marketQuery, marketNames), [{ name: 'Rafe Halloran', team: 1 }]);
  assert.equal(ui.scorerTeam, 0);
  setMarketQuery('');
  assert.equal(ui.category, 'Popular');
  assert.equal(ui.scorerTeam, 0);
  assert.equal(ui.searchCategoryOrigin, null);
});

test('unknown query offers clearing instead of an empty all-markets detour', () => {
  reset();
  setMarketQuery('zzznobodyxyz');
  assert.equal(matchingMarkets(fixture, ui.marketQuery).length, 0);
});

test('market-name searches retain the selected squad without cross-team messaging', () => {
  reset();
  ui.category = 'Goalscorers';
  ui.scorerTeam = 1;
  setMarketQuery('Anytime');
  assert.equal(searchesBothTeams(ui.marketQuery, marketNames), false);
  const players = scorerRows(fixture.players, ui.scorerTeam, ui.marketQuery, marketNames);
  assert.ok(players.some(p => p.name === 'Rafe Halloran'));
  assert.ok(players.every(p => p.team === 1));
  setMarketQuery('');
  assert.equal(ui.scorerTeam, 1);
  assert.equal(ui.category, 'Goalscorers');
});

test('dismissed keyboard restores navigation while search retains focus', () => {
  assert.equal(keyboardOccludesSearch(true, 844, 480), true);
  assert.equal(keyboardOccludesSearch(true, 844, 844), false);
  assert.equal(keyboardOccludesSearch(true, 844, 780), false);
  assert.equal(keyboardOccludesSearch(false, 844, 480), false);
  assert.equal(keyboardOccludesSearch(true, 844, 480, 2), false);
});
