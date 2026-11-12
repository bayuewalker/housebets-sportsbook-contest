import { createFixtures, type Fixture, type Market, type Outcome, type Sport } from './data';

export interface Selection {
  fixtureId: string;
  marketId: string;
  outcomeId: string;
  acceptedOdds: number;
  stake: string;
}

export type BetStatus = 'open' | 'won' | 'lost' | 'cashed';

export interface Bet {
  id: string;
  fixtureId: string;
  sport: Sport;
  fixture: string;
  market: string;
  outcome: string;
  odds: number;
  stake: number;
  /** Potential return while open; the amount paid once settled or cashed out. */
  return: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
  cashOffer: number;
}

export interface State {
  fixtures: Fixture[];
  selections: Selection[];
  bets: Bet[];
  favorites: string[];
  balance: number;
  failNext: boolean;
  noLive: boolean;
  revision: number;
}

export type Resolved = { fixture: Fixture; market: Market; outcome: Outcome };

export const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function stakeValue(value: string): number {
  return /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value) ? Number(value) : NaN;
}

export function resolve(s: State, p: Selection): Resolved | undefined {
  const fixture = s.fixtures.find(f => f.id === p.fixtureId);
  const market = fixture?.markets.find(m => m.id === p.marketId);
  const outcome = market?.outcomes.find(o => o.id === p.outcomeId);
  return fixture && market && outcome ? { fixture, market, outcome } : undefined;
}

export function selectionError(s: State, p: Selection): string | undefined {
  const r = resolve(s, p);
  if (!r) return 'Selection is unavailable. Remove it to continue.';
  if (r.market.suspended) return 'Market suspended. Wait for it to reopen or remove this selection.';
  if (r.outcome.odds !== p.acceptedOdds) return 'Odds changed. Accept the new price to continue.';
  if (p.stake === '') return 'Enter a stake to continue.';
  const stake = stakeValue(p.stake);
  if (!Number.isFinite(stake) || stake < 1 || stake > 1000) return 'Enter a stake from 1 to 1,000 USDT, with up to 2 decimals.';
}

function hourFloor(now: Date): number {
  const base = new Date(now);
  base.setMinutes(0, 0, 0);
  return base.getTime();
}

type SampleBet = [string, string, Sport, string, string, string, number, number, BetStatus, number, number?, number?];

/** A believable demo history: three open bets and settled bets spread over the last six weeks. */
function sampleBets(now: Date): Bet[] {
  const base = hourFloor(now);
  const minutes = (m: number) => new Date(base + m * 60_000).toISOString();
  const day = 24 * 60;
  const rows: SampleBet[] = [
    ['HB-1048', 'ars-bha', 'Football', 'Arsenal v Brighton & Hove Albion', 'Match result', 'Arsenal', 1.9, 25, 'open', -40, undefined, 31.2],
    ['HB-1047', 'bos-nyk', 'Basketball', 'Boston Celtics v New York Knicks', 'Match winner', 'Celtics', 1.72, 15, 'open', -95, undefined, 17.1],
    ['HB-1046', 'rma-bay', 'Football', 'Real Madrid v Bayern Munich', 'Total goals · 2.5', 'Over 2.5', 1.8, 10, 'open', -180, undefined, 9.2],
    ['HB-1045', 'past-che-eve', 'Football', 'Chelsea v Everton', 'Both teams to score', 'Yes', 1.75, 20, 'won', -day - 150, -day],
    ['HB-1044', 'past-hal-mor', 'Tennis', 'L. Halden v C. Moreno', 'Match winner', 'L. Halden', 2.1, 10, 'lost', -day - 300, -day - 160],
    ['HB-1043', 'past-bar-sev', 'Football', 'Barcelona v Sevilla', 'Match result', 'Barcelona', 1.45, 30, 'cashed', -3 * day - 120, -3 * day - 40, 38.4],
    ['HB-1042', 'past-mia-bos', 'Basketball', 'Miami Heat v Boston Celtics', 'Point spread · 4.5', 'Celtics -4.5', 1.91, 12, 'won', -5 * day - 200, -5 * day - 30],
    ['HB-1041', 'past-nav-g2', 'Esports', 'Natus Vincere v G2 Esports', 'Total maps · 2.5', 'Over 2.5', 2.05, 8, 'lost', -9 * day - 90, -9 * day],
    ['HB-1040', 'past-int-mil', 'Football', 'Inter v AC Milan', 'Total corners · 9.5', 'Over 9.5', 1.9, 15, 'won', -12 * day - 100, -12 * day],
    ['HB-1039', 'past-kc-phi', 'American Football', 'Kansas City Chiefs v Philadelphia Eagles', 'Match winner', 'Chiefs', 1.8, 20, 'lost', -20 * day - 240, -20 * day - 20],
    ['HB-1038', 'past-dor-rbl', 'Football', 'Dortmund v RB Leipzig', 'Match result', 'Draw', 3.6, 5, 'won', -26 * day - 130, -26 * day - 10],
    ['HB-1037', 'past-nyy-hou', 'Baseball', 'New York Yankees v Houston Astros', 'Run line · 1.5', 'Yankees -1.5', 2.2, 10, 'cashed', -40 * day - 180, -40 * day - 90, 14.6],
  ];
  return rows.map(([id, fixtureId, sport, fixture, market, outcome, odds, stake, status, placed, settled, cash]) => {
    const potential = round(stake * odds);
    const paid = status === 'won' ? potential : status === 'cashed' ? cash ?? 0 : status === 'lost' ? 0 : potential;
    return {
      id, fixtureId, sport, fixture, market, outcome, odds, stake,
      return: paid,
      status,
      placedAt: minutes(placed),
      ...(settled === undefined ? {} : { settledAt: minutes(settled) }),
      cashOffer: status === 'open' ? cash ?? 0 : 0,
    };
  });
}

export function initialState(now = new Date()): State {
  return {
    fixtures: createFixtures(now),
    selections: [],
    favorites: ['team:Arsenal', 'league:Premier League', 'league:Champions League'],
    balance: 1000,
    failNext: false,
    noLive: false,
    revision: 0,
    bets: sampleBets(now),
  };
}

export function toggleSelection(s: State, fixtureId: string, marketId: string, outcomeId: string): void {
  const fixture = s.fixtures.find(f => f.id === fixtureId);
  const market = fixture?.markets.find(m => m.id === marketId);
  const outcome = market?.outcomes.find(o => o.id === outcomeId);
  if (!market || !outcome || market.suspended) return;
  const exists = s.selections.find(p => p.fixtureId === fixtureId && p.marketId === marketId && p.outcomeId === outcomeId);
  if (exists) s.selections = s.selections.filter(p => p !== exists);
  else s.selections.push({ fixtureId, marketId, outcomeId, acceptedOdds: outcome.odds, stake: '' });
  s.revision++;
}

export function acceptChanges(s: State): void {
  for (const p of s.selections) {
    const r = resolve(s, p);
    if (r && !r.market.suspended) p.acceptedOdds = r.outcome.odds;
  }
  s.revision++;
}

const validStake = (p: Selection) => (Number.isFinite(stakeValue(p.stake)) ? stakeValue(p.stake) : 0);

export function totalStake(s: State): number {
  return round(s.selections.reduce((n, p) => n + validStake(p), 0));
}

export function totalReturn(s: State): number {
  return round(s.selections.reduce((n, p) => n + round(validStake(p) * p.acceptedOdds), 0));
}

export function placementError(s: State): string | undefined {
  if (!s.selections.length) return 'Add a selection first.';
  for (const p of s.selections) {
    const e = selectionError(s, p);
    if (e) return e;
  }
  if (totalStake(s) > s.balance) return 'Not enough demo balance. Reduce your stakes.';
}

export function placeBets(s: State, now = new Date()): { ok: boolean; message: string; bets?: Bet[] } {
  const error = placementError(s);
  if (error) return { ok: false, message: error };
  if (s.failNext) {
    s.failNext = false;
    return { ok: false, message: 'Bet not placed. Connection interrupted. Your demo balance is unchanged. Try again.' };
  }
  const amount = totalStake(s);
  const count = s.selections.length;
  const lastId = Math.max(0, ...s.bets.map(b => Number(b.id.replace(/^HB-/, '')) || 0));
  const bets: Bet[] = s.selections.map((p, i) => {
    const r = resolve(s, p)!;
    const stake = stakeValue(p.stake);
    return {
      id: `HB-${lastId + 1 + i}`,
      fixtureId: r.fixture.id,
      sport: r.fixture.sport,
      fixture: `${r.fixture.home} v ${r.fixture.away}`,
      market: r.market.name,
      outcome: r.outcome.label,
      odds: p.acceptedOdds,
      stake,
      return: round(stake * p.acceptedOdds),
      status: 'open',
      placedAt: now.toISOString(),
      cashOffer: round(stake * 0.92),
    };
  });
  s.balance = round(s.balance - amount);
  s.bets.unshift(...[...bets].reverse());
  s.selections = [];
  s.revision++;
  return { ok: true, message: `${count} single bet${count === 1 ? '' : 's'} placed. ${money(amount)} USDT from your demo balance.`, bets };
}

export function cashOut(s: State, id: string, now = new Date()): boolean {
  const b = s.bets.find(b => b.id === id);
  if (!b || b.status !== 'open') return false;
  b.status = 'cashed';
  b.return = b.cashOffer;
  b.settledAt = now.toISOString();
  s.balance = round(s.balance + b.cashOffer);
  s.revision++;
  return true;
}

/** Demo control: settle the newest open bet as a win. */
export function settle(s: State, now = new Date()): boolean {
  const b = s.bets.find(b => b.status === 'open');
  if (!b) return false;
  b.status = 'won';
  b.settledAt = now.toISOString();
  s.balance = round(s.balance + b.return);
  s.revision++;
  return true;
}

function demoMarket(s: State): Market {
  const p = s.selections[0];
  const r = p ? resolve(s, p) : undefined;
  return r?.market ?? s.fixtures[0].markets[0];
}

export function moveOdds(s: State): void {
  for (const [i, o] of demoMarket(s).outcomes.entries()) {
    o.previous = o.odds;
    o.odds = round(Math.max(1.05, o.odds + (i === 0 ? 0.12 : -0.08)));
  }
  s.revision++;
}

export function toggleSuspension(s: State): void {
  const m = demoMarket(s);
  m.suspended = !m.suspended;
  s.revision++;
}

const searchable = (f: Fixture) => [
  f.home, f.away, f.homeShort, f.awayShort, f.league, f.sport, ...f.players,
  ...f.markets.flatMap(m => [m.name, ...m.outcomes.map(o => o.label)]),
];

export function searchFixtures(fixtures: Fixture[], query: string): Fixture[] {
  const q = query.trim().toLocaleLowerCase();
  return fixtures.filter(f => searchable(f).some(v => v.toLocaleLowerCase().includes(q)));
}

export function searchReason(f: Fixture, query: string): string {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return '';
  const has = (v: string) => v.toLocaleLowerCase().includes(q);
  if ([f.home, f.away, f.homeShort, f.awayShort].some(has)) return 'Team';
  const player = f.players.find(has);
  if (player) return `Player · ${player}`;
  if (has(f.league)) return 'Competition';
  if (has(f.sport)) return 'Sport';
  const market = f.markets.find(m => has(m.name) || m.outcomes.some(o => has(o.label)));
  if (!market) return '';
  const outcome = market.outcomes.find(o => has(o.label));
  if (outcome && !has(market.name)) return `Market · ${market.name} · ${outcome.label}`;
  return `Market · ${market.name}`;
}

/** Favourite-team fixtures, then favourite competitions. Live comes before upcoming inside each group. */
export function compareYourMatches(a: Fixture, b: Fixture, favorites: string[], live: (f: Fixture) => boolean): number {
  const team = (f: Fixture) => (favorites.includes(`team:${f.home}`) || favorites.includes(`team:${f.away}`) ? 0 : 1);
  return team(a) - team(b) || Number(live(b)) - Number(live(a)) || Date.parse(a.kickoff) - Date.parse(b.kickoff);
}

export function removeSuspended(s: State): number {
  const before = s.selections.length;
  s.selections = s.selections.filter(p => {
    const r = resolve(s, p);
    return r && !r.market.suspended;
  });
  s.revision++;
  return before - s.selections.length;
}

/** Simulated live price feed: nudges one unselected in-play price, so a pick never changes behind the player's back without the explicit acceptance flow. */
export function driftOdds(
  s: State,
  rng: () => number = Math.random,
  eligible: (fixtureId: string, marketId: string) => boolean = () => true,
): { fixtureId: string; marketId: string; outcomeId: string; cleared: string[] } | undefined {
  if (s.noLive) return;
  const picked = new Set(s.selections.map(p => `${p.fixtureId}:${p.marketId}:${p.outcomeId}`));
  const candidates = s.fixtures
    .filter(f => f.live)
    .flatMap(f => f.markets
      .filter(m => !m.suspended && eligible(f.id, m.id))
      .flatMap(m => m.outcomes.filter(o => !picked.has(`${f.id}:${m.id}:${o.id}`)).map(o => ({ f, m, o }))));
  if (!candidates.length) return;
  const cleared: string[] = [];
  for (const f of s.fixtures) for (const m of f.markets) for (const o of m.outcomes) {
    const key = `${f.id}:${m.id}:${o.id}`;
    if (o.previous !== undefined && !picked.has(key)) {
      delete o.previous;
      cleared.push(key);
    }
  }
  const { f, m, o } = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
  const step = round(0.02 + Math.floor(rng() * 4) * 0.02);
  const up = rng() < 0.5 || o.odds - step < 1.01;
  o.previous = o.odds;
  o.odds = round(up ? o.odds + step : o.odds - step);
  s.revision++;
  return { fixtureId: f.id, marketId: m.id, outcomeId: o.id, cleared };
}
