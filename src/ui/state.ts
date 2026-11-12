import type { Category, Fixture, Sport } from '../data';
import { initialState, type Bet, type State } from '../engine';
import { restoreSession, SESSION_VERSION } from '../session';

const STORAGE = 'housebets-sportsbook-v2';

export type Page = 'home' | 'live' | 'football' | 'match' | 'bets';
export type DialogName = 'slip' | 'menu' | 'demo' | 'wallet' | 'cash' | 'reset' | 'info' | 'chat';
export type InfoTopic = 'Casino' | 'Profile' | 'Prize' | 'VIP';
export type PanelTab = 'slip' | 'bets' | 'chat';
export type FootballMarket = 'result' | 'goals' | 'btts';
export type DateFilter = 'all' | 'today' | '7d' | '30d';

/** View state that is not part of the betting engine. */
export const ui = {
  query: '',
  /** Sport shown on the home page and on the live page; "All" shows every sport. */
  sport: 'All' as Sport | 'All',
  /** Competition chip on the live page. Stays put when the sport changes, so an empty combination can be shown. */
  competition: '',
  league: '',
  footballMarket: 'result' as FootballMarket,
  footballScope: 'upcoming' as 'upcoming' | 'all',
  category: 'All' as Category | 'All',
  marketQuery: '',
  collapsed: new Set<string>(),
  scorerTeam: 0 as 0 | 1,
  panelTab: 'slip' as PanelTab,
  panelHidden: false,
  railExpanded: false,
  historyTab: 'open' as 'open' | 'settled',
  dateFilter: 'all' as DateFilter,
  sportFilter: 'All' as Sport | 'All',
  expanded: new Set<string>(),
  showAllSoon: false,
  showAllMine: false,
  busy: false,
  loading: false,
  notice: null as null | { kind: 'success' | 'error'; message: string; bets?: Bet[] },
  dialog: null as DialogName | null,
  info: 'Casino' as InfoTopic,
  cashId: '',
  liveFeed: true,
  elapsed: 0,
  toast: '',
};

let current: State = initialState();
try {
  current = restoreSession(localStorage.getItem(STORAGE));
} catch {
  /* Storage access is optional. */
}

export const state = () => current;

export function resetState() {
  current = initialState();
}

export function save() {
  try {
    const { favorites, bets, balance } = current;
    localStorage.setItem(STORAGE, JSON.stringify({ version: SESSION_VERSION, favorites, bets, balance }));
  } catch {
    /* Private browsing still works in memory. */
  }
}

export const route = () => location.hash.slice(1) || '/sports';

export function page(): Page {
  const r = route();
  if (r.startsWith('/match/')) return 'match';
  if (r === '/live') return 'live';
  if (r === '/football') return 'football';
  if (r === '/bets') return 'bets';
  return 'home';
}

export const currentFixture = (): Fixture => current.fixtures.find(f => f.id === route().split('/')[2]) ?? current.fixtures[0];

export const isLive = (f: Fixture) => f.live && !current.noLive;
export const liveFixtures = () => current.fixtures.filter(isLive);
export const isFavorite = (key: string) => current.favorites.includes(key);
export const openBets = () => current.bets.filter(b => b.status === 'open');
export const pickKey = (p: { fixtureId: string; marketId: string; outcomeId: string }) => `${p.fixtureId}:${p.marketId}:${p.outcomeId}`;
export const isSelected = (fixtureId: string, marketId: string, outcomeId: string) =>
  current.selections.some(p => p.fixtureId === fixtureId && p.marketId === marketId && p.outcomeId === outcomeId);

export const followsFixture = (f: Fixture) =>
  isFavorite(`team:${f.home}`) || isFavorite(`team:${f.away}`) || isFavorite(`league:${f.league}`);

/** Football clocks like "52:00" tick; "HT" and other sports' period labels do not. */
export const ticking = (f: Fixture) => f.sport === 'Football' && /^\d+:\d\d$/.test(f.clock);

export function clockSeconds(f: Fixture): number {
  const [m, s] = f.clock.split(':').map(Number);
  const start = m * 60 + s;
  return start + (ui.elapsed % (90 * 60 - start));
}

export function clockText(f: Fixture, seconds = false): string {
  if (!ticking(f)) return f.clock;
  const t = clockSeconds(f);
  return seconds ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` : `${Math.floor(t / 60)}'`;
}

export function closeDialog() {
  ui.dialog = null;
  ui.cashId = '';
}

export function clearFilters() {
  ui.query = '';
  ui.sport = 'All';
  ui.competition = '';
  ui.league = '';
}

export function toast(message: string) {
  ui.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast = '';
    document.querySelector('.toast')?.remove();
  }, 3200);
}
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function go(url: string, rerender: () => void) {
  if (location.hash === `#${url}`) rerender();
  else location.hash = url;
}
