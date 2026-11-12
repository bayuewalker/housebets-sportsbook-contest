import { sports } from './data';
import { initialState, type Bet, type State } from './engine';

export const SESSION_VERSION = 2;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const nonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

function isBet(value: unknown): value is Bet {
  if (!isRecord(value)) return false;
  return ['id', 'fixtureId', 'fixture', 'market', 'outcome'].every(key => typeof value[key] === 'string' && value[key].length > 0)
    && sports.includes(value.sport as never)
    && isDate(value.placedAt)
    && (value.settledAt === undefined || isDate(value.settledAt))
    && ['open', 'won', 'lost', 'cashed'].includes(String(value.status))
    && ['stake', 'return', 'cashOffer'].every(key => nonNegative(value[key]))
    && nonNegative(value.odds) && value.odds >= 1 && Number(value.stake) > 0;
}

/** Restore only a complete, valid demo session; never resume unplaced picks. */
export function restoreSession(raw: string | null, now = new Date()): State {
  const state = initialState(now);
  try {
    const saved: unknown = JSON.parse(raw ?? 'null');
    if (!isRecord(saved) || saved.version !== SESSION_VERSION || !nonNegative(saved.balance)
      || !Array.isArray(saved.favorites) || !saved.favorites.every(v => typeof v === 'string')
      || !Array.isArray(saved.bets) || !saved.bets.every(isBet)
      || new Set(saved.bets.map(b => b.id)).size !== saved.bets.length) return state;
    const fixtures = new Set(state.fixtures.map(f => f.id));
    if (saved.bets.some(b => b.status === 'open' && !fixtures.has(b.fixtureId))) return state;
    state.favorites = [...new Set(saved.favorites)];
    state.bets = saved.bets;
    state.balance = saved.balance;
  } catch { /* Storage is optional; use the complete sample session on failure. */ }
  return state;
}
