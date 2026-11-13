import { footballMarkets, price, twoWayMarkets } from './markets';

export type Sport = 'Football' | 'Tennis' | 'Basketball' | 'Baseball' | 'American Football' | 'Esports';
export type Category = 'Popular' | 'Goals' | 'Halves' | 'Handicaps' | 'Goalscorers' | 'Corners & Cards' | 'Players' | 'Minutes' | 'Totals' | 'Sets' | 'Quarters' | 'Maps' | 'Innings';
export type Flag = 'eng' | 'eu' | 'esp' | 'ita' | 'ger' | 'usa' | 'int';
export interface Outcome { id: string; label: string; odds: number; previous?: number }
export interface Market { id: string; name: string; category: Category; outcomes: Outcome[]; suspended: boolean; layout?: 'list' }
export interface Fixture {
  id: string;
  sport: Sport;
  league: string;
  country: string;
  flag: Flag;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  homeCode: string;
  awayCode: string;
  colors: [string, string];
  live: boolean;
  /** Football: "52:00" ticks, "HT" does not. Other sports: a period label. */
  clock: string;
  score: [number, number];
  /** ISO kick-off time; displayed in the viewer's own time zone. */
  kickoff: string;
  players: string[];
  markets: Market[];
}

export const sports: Sport[] = ['Football', 'Tennis', 'Basketball', 'Baseball', 'American Football', 'Esports'];
export const sportLabel = (s: Sport) => (s === 'Football' ? 'Soccer' : s);
export const categories: Category[] = ['Popular', 'Goals', 'Halves', 'Handicaps', 'Goalscorers', 'Corners & Cards', 'Players', 'Minutes', 'Sets', 'Quarters', 'Maps', 'Innings', 'Totals'];
/** Visible group name. The stored category keeps a stable id; the tab reads "Corners & cards". */
export const categoryLabel = (c: Category | 'All') => (c === 'Corners & Cards' ? 'Corners & cards' : c);
export const leagues = ['Premier League', 'Champions League', 'LaLiga', 'Serie A', 'Bundesliga'];
export const leagueInfo: Record<string, { code: string; color: string; country: string; flag: Flag }> = {
  'Premier League': { code: 'PL', color: '#6d3fd6', country: 'England', flag: 'eng' },
  'Champions League': { code: 'CL', color: '#2f5fc4', country: 'Europe', flag: 'eu' },
  LaLiga: { code: 'LL', color: '#e0552f', country: 'Spain', flag: 'esp' },
  'Serie A': { code: 'SA', color: '#1677c9', country: 'Italy', flag: 'ita' },
  Bundesliga: { code: 'BL', color: '#d43a43', country: 'Germany', flag: 'ger' },
  'ATP Finals': { code: 'ATP', color: '#23926a', country: 'Italy', flag: 'ita' },
  'WTA Finals': { code: 'WTA', color: '#8a4fc7', country: 'International', flag: 'int' },
  NBA: { code: 'NBA', color: '#c96a26', country: 'USA', flag: 'usa' },
  EuroLeague: { code: 'EL', color: '#e07a2f', country: 'Europe', flag: 'eu' },
  NFL: { code: 'NFL', color: '#3756b5', country: 'USA', flag: 'usa' },
  MLB: { code: 'MLB', color: '#2a6fb0', country: 'USA', flag: 'usa' },
  'CS2 Major': { code: 'CS2', color: '#9c7f2a', country: 'International', flag: 'int' },
  'LoL Worlds': { code: 'LOL', color: '#2b8fa3', country: 'International', flag: 'int' },
};

// Every player name is invented for this prototype. No real athlete appears anywhere.
const squads: Record<string, string[]> = {
  Arsenal: ['Theo Marlow', 'Ruben Castell', 'Idris Vane', 'Kofi Ashdown', 'Leon Corvell', 'Arlo Esterby'],
  'Brighton & Hove Albion': ['Rafe Halloran', 'Oskar Lindgard', 'Jules Mornay', 'Tomas Northcote', 'Milo Saltmarsh', 'Cyril Thackery'],
  Liverpool: ['Callum Brierley', 'Mateo Quiroga', 'Ansel Dufresne', 'Bastian Ivers', 'Yusuf Kittredge', 'Otto Pellegra'],
  'Manchester United': ['Hugo Arrabal', 'Elian Sotomar', 'Felix Wendler', 'Dmitri Quennell', 'Caio Rainsford', 'Jonas Ulvestad'],
};
const firstNames = ['Arlo', 'Bastian', 'Caio', 'Dario', 'Elian', 'Felix', 'Hugo', 'Idris', 'Jonas', 'Kofi', 'Lars', 'Mateo', 'Nico', 'Oskar', 'Pau', 'Rafe', 'Samu', 'Tomas', 'Yusuf', 'Emil', 'Iker', 'Matis', 'Ansel', 'Cyril'];
const surnames = ['Abernathy', 'Brightwell', 'Calloway', 'Dunleavy', 'Ellery', 'Fairbank', 'Galvane', 'Hartigan', 'Jessop', 'Kestrell', 'Lowther', 'Merriam', 'Nairne', 'Ondrasek', 'Penhallow', 'Quillfeather', 'Ravenhurst', 'Scarbrook', 'Tavernese', 'Underhay', 'Varnholt', 'Wexley', 'Yarrowby', 'Zellweg', 'Bellandi', 'Okoro', 'Hellwig', 'Ventosa', 'Albarrán', 'Ruscalla'];

function hash(text: string): number {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function squad(team: string): string[] {
  if (squads[team]) return squads[team];
  const seed = hash(team);
  const names: string[] = [];
  for (let i = 0; names.length < 6; i++) {
    const name = `${firstNames[(seed + i * 7) % firstNames.length]} ${surnames[(Math.floor(seed / 31) + i * 11) % surnames.length]}`;
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

const clubs: Record<string, [string, string, string]> = {
  Arsenal: ['Arsenal', 'ARS', '#c8323f'], 'Brighton & Hove Albion': ['Brighton', 'BHA', '#2f6db5'], Liverpool: ['Liverpool', 'LIV', '#c43544'],
  'Manchester United': ['Man Utd', 'MUN', '#b9312e'], 'Manchester City': ['Man City', 'MCI', '#5aa6dc'], 'Tottenham Hotspur': ['Spurs', 'TOT', '#e7ebf0'],
  Chelsea: ['Chelsea', 'CHE', '#2a4fae'], 'Newcastle United': ['Newcastle', 'NEW', '#9aa2ab'], 'Aston Villa': ['Aston Villa', 'AVL', '#7f2a4b'],
  'West Ham United': ['West Ham', 'WHU', '#7a2638'], Everton: ['Everton', 'EVE', '#2b54a3'], Fulham: ['Fulham', 'FUL', '#d9dde2'],
  Brentford: ['Brentford', 'BRE', '#d6383f'], 'Crystal Palace': ['Palace', 'CRY', '#2c5aa8'], Bournemouth: ['Bournemouth', 'BOU', '#c4303b'],
  'Wolverhampton Wanderers': ['Wolves', 'WOL', '#e8a33a'], 'Real Madrid': ['Real Madrid', 'RMA', '#d9d7e6'], 'Bayern Munich': ['Bayern', 'BAY', '#cf3442'],
  Inter: ['Inter', 'INT', '#2f56b0'], 'Paris Saint-Germain': ['PSG', 'PSG', '#2b3f8f'], Benfica: ['Benfica', 'BEN', '#cf3a3a'],
  Juventus: ['Juventus', 'JUV', '#d8d8d8'], Ajax: ['Ajax', 'AJA', '#cc3a3a'], Porto: ['Porto', 'POR', '#2a5bb0'], Celtic: ['Celtic', 'CEL', '#2e9a5a'],
  Barcelona: ['Barcelona', 'BAR', '#8a3f9f'], 'Atlético Madrid': ['Atlético', 'ATM', '#c53a43'], Sevilla: ['Sevilla', 'SEV', '#e4e1e1'],
  'Real Betis': ['Betis', 'BET', '#2d9a57'], Villarreal: ['Villarreal', 'VIL', '#e9cf3c'], 'Real Sociedad': ['Sociedad', 'RSO', '#3a6fc0'],
  Valencia: ['Valencia', 'VAL', '#e6a23a'], Girona: ['Girona', 'GIR', '#cf3a44'], 'Athletic Club': ['Athletic', 'ATH', '#c8323c'],
  Osasuna: ['Osasuna', 'OSA', '#a8303c'], 'Celta Vigo': ['Celta', 'CEL', '#79b8e6'], Mallorca: ['Mallorca', 'MLL', '#b8303a'],
  Napoli: ['Napoli', 'NAP', '#3d9fd6'], 'AC Milan': ['Milan', 'MIL', '#c4313a'], Roma: ['Roma', 'ROM', '#a3343c'], Lazio: ['Lazio', 'LAZ', '#7ec3e8'],
  Atalanta: ['Atalanta', 'ATA', '#2b4ca0'], Fiorentina: ['Fiorentina', 'FIO', '#6b3fa8'], Bologna: ['Bologna', 'BOL', '#a6303a'], Torino: ['Torino', 'TOR', '#8a2f36'],
  Dortmund: ['Dortmund', 'BVB', '#e8c534'], Leverkusen: ['Leverkusen', 'LEV', '#d2343a'], 'RB Leipzig': ['Leipzig', 'RBL', '#d64048'],
  'Eintracht Frankfurt': ['Frankfurt', 'SGE', '#cf3a3a'], Wolfsburg: ['Wolfsburg', 'WOB', '#5aa64a'], Freiburg: ['Freiburg', 'SCF', '#c73a3a'],
  "Borussia M'gladbach": ["M'gladbach", 'BMG', '#e7e7e7'], 'Union Berlin': ['Union', 'FCU', '#d23c3c'], Hoffenheim: ['Hoffenheim', 'TSG', '#2f69c0'], Mainz: ['Mainz', 'M05', '#c9353d'],
};

interface Live { minute: number; score: [number, number]; ht?: [number, number]; corners: [number, number]; cards: [number, number]; suspend?: string[] | 'all'; clock?: string }

function football(id: string, league: string, home: string, away: string, odds: [number, number, number], start: number, now: Date, live?: Live): Fixture {
  const info = leagueInfo[league];
  const [homeShort, homeCode, homeColor] = clubs[home];
  const [awayShort, awayCode, awayColor] = clubs[away];
  const homeSquad = squad(home);
  const awaySquad = squad(away);
  const markets = footballMarkets({
    home, away, homeShort, awayShort, odds,
    live: !!live,
    minute: live?.minute ?? 0,
    score: live?.score ?? [0, 0],
    ht: live?.ht,
    corners: live?.corners ?? [0, 0],
    cards: live?.cards ?? [0, 0],
    squads: [homeSquad, awaySquad],
    suspended: Array.isArray(live?.suspend) ? live.suspend : [],
  });
  if (live?.suspend === 'all') markets.forEach(m => { m.suspended = true; });
  return {
    id, sport: 'Football', league, country: info.country, flag: info.flag,
    home, away, homeShort, awayShort, homeCode, awayCode, colors: [homeColor, awayColor],
    live: !!live,
    clock: live ? live.clock ?? `${live.minute}:00` : '',
    score: live?.score ?? [0, 0],
    kickoff: at(now, live ? -(live.minute + (live.minute > 45 ? 15 : 0)) : start),
    players: [...homeSquad, ...awaySquad],
    markets,
  };
}

interface Other { sport: Sport; league: string; home: [string, string, string, string]; away: [string, string, string, string]; odds: [number, number]; start: number; live?: { clock: string; score: [number, number]; suspend?: string[] } }

/** Short, sport-appropriate secondary markets derived from the two-way price. */
function otherMarkets(o: Other) {
  const [h, a] = [o.home[1], o.away[1]];
  const favouriteHome = o.odds[0] <= o.odds[1];
  const fav = favouriteHome ? h : a;
  const dog = favouriteHome ? a : h;
  const edge = Math.abs(1 / o.odds[0] - 1 / o.odds[1]);
  const extra: Array<[string, string, Category, string[], number[]]> = [];
  const add = (id: string, name: string, category: Category, labels: string[], prices: number[]) => extra.push([id, name, category, labels, prices]);
  const yesNo = (p: number) => [price(p), price(1 - p)];
  const overUnder = (id: string, name: string, category: Category, l: number, p = 0.5) => add(id, `${name} · ${l}`, category, [`Over ${l}`, `Under ${l}`], yesNo(p));
  const now = (liveName: string, preName: string) => (o.live ? liveName : preName);

  if (o.sport === 'Tennis') {
    add('set', now('Current set winner', '1st set winner'), 'Popular', [h, a], yesNo((1 / o.odds[0]) / (1 / o.odds[0] + 1 / o.odds[1])));
    if (o.live) add('game', 'Next game', 'Popular', [h, a], yesNo(0.56));
    add('sets', 'Set betting', 'Sets', [`${h} 2–0`, `${h} 2–1`, `${a} 2–1`, `${a} 2–0`], [2.6, 3.9, 4.4, 3.6]);
    overUnder('games', 'Total games', 'Totals', 22.5, 0.52);
    overUnder('games-set', now('Games in current set', 'Games in 1st set'), 'Totals', 9.5, 0.48);
    add('hcp', 'Game handicap · 3.5', 'Handicaps', [`${fav} -3.5`, `${dog} +3.5`], yesNo(0.45 + edge / 2));
  } else if (o.sport === 'Basketball') {
    const spread = Math.round(edge * 20) + 0.5;
    add('spread', `Point spread · ${spread}`, 'Handicaps', [`${fav} -${spread}`, `${dog} +${spread}`], yesNo(0.5));
    add('spread-alt', `Point spread · ${spread + 4}`, 'Handicaps', [`${fav} -${spread + 4}`, `${dog} +${spread + 4}`], yesNo(0.36));
    overUnder('total', 'Total points', 'Totals', 221.5);
    overUnder('total-home', `${h} points`, 'Totals', 112.5, 0.52);
    overUnder('total-away', `${a} points`, 'Totals', 108.5, 0.48);
    add('quarter', now('Current quarter winner', '1st quarter winner'), 'Quarters', [h, a], yesNo(0.53));
    overUnder('quarter-total', now('Current quarter points', '1st quarter points'), 'Quarters', 55.5);
  } else if (o.sport === 'Esports') {
    add('maps-hcp', 'Map handicap · 1.5', 'Handicaps', [`${fav} -1.5`, `${dog} +1.5`], yesNo(0.42 + edge / 2));
    overUnder('maps', 'Total maps', 'Totals', 2.5, 0.46);
    add('map', now('Map 2 winner', 'Map 1 winner'), 'Maps', [h, a], yesNo(0.55));
    overUnder('rounds', now('Map 2 total rounds', 'Map 1 total rounds'), 'Maps', 26.5, 0.47);
  } else if (o.sport === 'American Football') {
    const spread = Math.round(edge * 18) + 0.5;
    add('spread', `Point spread · ${spread}`, 'Handicaps', [`${fav} -${spread}`, `${dog} +${spread}`], yesNo(0.5));
    overUnder('total', 'Total points', 'Totals', 47.5);
    add('half', now('2nd half winner', '1st half winner'), 'Halves', [h, a], yesNo(0.54));
    overUnder('total-home', `${h} points`, 'Totals', 24.5);
  } else {
    add('runline', 'Run line · 1.5', 'Handicaps', [`${fav} -1.5`, `${dog} +1.5`], yesNo(0.41));
    overUnder('total', 'Total runs', 'Totals', 8.5);
    add('inning', now('Next inning winner', '1st inning winner'), 'Innings', [h, a, 'Tie'], [3.1, 3.6, 1.62]);
    overUnder('total-home', `${h} runs`, 'Totals', 4.5, 0.52);
  }
  return twoWayMarkets(h, a, o.odds, extra, o.live?.suspend);
}

function other(id: string, o: Other, now: Date): Fixture {
  const info = leagueInfo[o.league];
  const hasPlayers = o.sport === 'Tennis';
  return {
    id, sport: o.sport, league: o.league, country: info.country, flag: info.flag,
    home: o.home[0], away: o.away[0], homeShort: o.home[1], awayShort: o.away[1], homeCode: o.home[2], awayCode: o.away[2],
    colors: [o.home[3], o.away[3]],
    live: !!o.live,
    clock: o.live?.clock ?? '',
    score: o.live?.score ?? [0, 0],
    kickoff: at(now, o.live ? -75 : o.start),
    players: hasPlayers ? [o.home[0], o.away[0]] : [],
    markets: otherMarkets(o),
  };
}

/** Minutes from the start of the current hour, so the sample day always lies ahead of the viewer. */
function at(now: Date, minutes: number): string {
  const base = new Date(now);
  base.setMinutes(0, 0, 0);
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}

export function createFixtures(now = new Date()): Fixture[] {
  const pl = 'Premier League', cl = 'Champions League', ll = 'LaLiga', sa = 'Serie A', bl = 'Bundesliga';
  return [
    football('ars-bha', pl, 'Arsenal', 'Brighton & Hove Albion', [1.22, 5.5, 15], 0, now, { minute: 52, score: [1, 0], ht: [1, 0], corners: [4, 1], cards: [1, 0], suspend: ['cards', 'corner-next'] }),
    football('liv-mun', pl, 'Liverpool', 'Manchester United', [1.65, 4, 4.33], 150, now),
    football('mci-tot', pl, 'Manchester City', 'Tottenham Hotspur', [1.5, 4.5, 5.25], 60, now),
    football('che-new', pl, 'Chelsea', 'Newcastle United', [2.6, 3.1, 2.9], 0, now, { minute: 45, clock: 'HT', score: [1, 1], ht: [1, 1], corners: [3, 4], cards: [1, 2] }),
    football('avl-whu', pl, 'Aston Villa', 'West Ham United', [2, 3.4, 4], 0, now, { minute: 23, score: [0, 0], corners: [1, 2], cards: [0, 0], suspend: 'all' }),
    football('eve-ful', pl, 'Everton', 'Fulham', [2.45, 3.2, 2.95], 240, now),
    football('bre-cry', pl, 'Brentford', 'Crystal Palace', [2.2, 3.4, 3.25], 1500, now),
    football('bou-wol', pl, 'Bournemouth', 'Wolverhampton Wanderers', [2.05, 3.5, 3.5], 1530, now),
    football('rma-bay', cl, 'Real Madrid', 'Bayern Munich', [2.2, 3.7, 2.9], 360, now),
    football('psg-ben', cl, 'Paris Saint-Germain', 'Benfica', [1.08, 11, 34], 0, now, { minute: 61, score: [2, 0], ht: [1, 0], corners: [6, 2], cards: [0, 2] }),
    football('ars-int', cl, 'Arsenal', 'Inter', [1.95, 3.5, 4], 2880, now),
    football('juv-aja', cl, 'Juventus', 'Ajax', [1.75, 3.7, 4.6], 345, now),
    football('por-cel', cl, 'Porto', 'Celtic', [1.7, 3.8, 4.8], 1800, now),
    football('bar-atm', ll, 'Barcelona', 'Atlético Madrid', [1.72, 3.6, 5.1], 0, now, { minute: 38, score: [1, 0], corners: [3, 1], cards: [1, 1] }),
    football('sev-bet', ll, 'Sevilla', 'Real Betis', [2.4, 3.25, 3], 300, now),
    football('vil-rso', ll, 'Villarreal', 'Real Sociedad', [2.25, 3.3, 3.25], 420, now),
    football('val-gir', ll, 'Valencia', 'Girona', [2.6, 3.3, 2.75], 1560, now),
    football('ath-osa', ll, 'Athletic Club', 'Osasuna', [1.8, 3.5, 4.75], 1680, now),
    football('cel-mll', ll, 'Celta Vigo', 'Mallorca', [2.1, 3.3, 3.7], 2940, now),
    football('int-nap', sa, 'Inter', 'Napoli', [1.92, 3.45, 3.9], 390, now),
    football('mil-rom', sa, 'AC Milan', 'Roma', [9, 4.2, 1.4], 0, now, { minute: 74, score: [0, 1], ht: [0, 1], corners: [5, 3], cards: [2, 3] }),
    football('juv-laz', sa, 'Juventus', 'Lazio', [1.85, 3.4, 4.5], 2970, now),
    football('ata-fio', sa, 'Atalanta', 'Fiorentina', [1.95, 3.6, 3.8], 1620, now),
    football('bol-tor', sa, 'Bologna', 'Torino', [2.05, 3.2, 3.8], 1500, now),
    football('dor-lev', bl, 'Dortmund', 'Leverkusen', [2.55, 3.6, 2.6], 1590, now),
    football('rbl-sge', bl, 'RB Leipzig', 'Eintracht Frankfurt', [1.95, 3.7, 3.6], 330, now),
    football('wob-scf', bl, 'Wolfsburg', 'Freiburg', [2.4, 3.4, 2.85], 1470, now),
    football('bmg-fcu', bl, "Borussia M'gladbach", 'Union Berlin', [2.1, 3.4, 3.4], 2910, now),
    football('tsg-m05', bl, 'Hoffenheim', 'Mainz', [2.3, 3.6, 2.9], 3000, now),
    other('var-mor', { sport: 'Tennis', league: 'ATP Finals', home: ['J. Vossell', 'J. Vossell', 'VOS', '#be7c4d'], away: ['C. Mornell', 'C. Mornell', 'MOR', '#a3a75c'], odds: [1.45, 2.75], start: 0, live: { clock: 'Set 2 · 4–3', score: [1, 0] } }, now),
    other('kes-rui', { sport: 'Tennis', league: 'WTA Finals', home: ['N. Pellam', 'N. Pellam', 'PEL', '#b0607a'], away: ['A. Quillane', 'A. Quillane', 'QUI', '#5c8fb0'], odds: [1.9, 1.9], start: 0, live: { clock: 'Set 1 · 5–5', score: [0, 0] } }, now),
    other('hal-dre', { sport: 'Tennis', league: 'ATP Finals', home: ['L. Halden', 'L. Halden', 'HAL', '#4f8f7a'], away: ['M. Drestan', 'M. Drestan', 'DRE', '#9a6a4a'], odds: [1.8, 2], start: 120 }, now),
    other('bos-nyk', { sport: 'Basketball', league: 'NBA', home: ['Boston Celtics', 'Celtics', 'BOS', '#3c9a6e'], away: ['New York Knicks', 'Knicks', 'NYK', '#d07a3c'], odds: [1.45, 2.8], start: 0, live: { clock: 'Q3 · 04:32', score: [78, 72] } }, now),
    other('lal-gsw', { sport: 'Basketball', league: 'NBA', home: ['Los Angeles Lakers', 'Lakers', 'LAL', '#7d4fb5'], away: ['Golden State Warriors', 'Warriors', 'GSW', '#d6a832'], odds: [1.75, 2.1], start: 0, live: { clock: 'Q1 · 08:10', score: [14, 11] } }, now),
    other('mia-chi', { sport: 'Basketball', league: 'NBA', home: ['Miami Heat', 'Heat', 'MIA', '#b8323f'], away: ['Chicago Bulls', 'Bulls', 'CHI', '#c8323c'], odds: [1.62, 2.35], start: 480 }, now),
    other('rmb-fen', { sport: 'Basketball', league: 'EuroLeague', home: ['Real Madrid', 'Real Madrid', 'RMB', '#d9d7e6'], away: ['Fenerbahçe', 'Fenerbahçe', 'FEN', '#2b3f8f'], odds: [1.55, 2.45], start: 1440 }, now),
    other('kc-buf', { sport: 'American Football', league: 'NFL', home: ['Kansas City Chiefs', 'Chiefs', 'KC', '#c8323c'], away: ['Buffalo Bills', 'Bills', 'BUF', '#2c55a8'], odds: [1.65, 2.25], start: 0, live: { clock: 'Q2 · 06:41', score: [10, 7], suspend: ['winner'] } }, now),
    other('phi-dal', { sport: 'American Football', league: 'NFL', home: ['Philadelphia Eagles', 'Eagles', 'PHI', '#2d6b5a'], away: ['Dallas Cowboys', 'Cowboys', 'DAL', '#4a5f8f'], odds: [1.55, 2.5], start: 1740 }, now),
    other('nyy-lad', { sport: 'Baseball', league: 'MLB', home: ['New York Yankees', 'Yankees', 'NYY', '#30437a'], away: ['Los Angeles Dodgers', 'Dodgers', 'LAD', '#2d63b0'], odds: [1.6, 2.35], start: 0, live: { clock: 'Top 6th', score: [3, 2] } }, now),
    other('hou-atl', { sport: 'Baseball', league: 'MLB', home: ['Houston Astros', 'Astros', 'HOU', '#d9772f'], away: ['Atlanta Braves', 'Braves', 'ATL', '#b8323c'], odds: [1.95, 1.87], start: 1380 }, now),
    other('nav-g2', { sport: 'Esports', league: 'CS2 Major', home: ['Natus Vincere', 'NAVI', 'NAVI', '#c5aa4e'], away: ['G2 Esports', 'G2', 'G2', '#8c94a1'], odds: [1.4, 2.85], start: 0, live: { clock: 'Map 2 · 9–7', score: [1, 0] } }, now),
    other('t1-gen', { sport: 'Esports', league: 'LoL Worlds', home: ['T1', 'T1', 'T1', '#c8323c'], away: ['Gen.G', 'Gen.G', 'GEN', '#b89a3a'], odds: [1.7, 2.1], start: 210 }, now),
  ];
}
