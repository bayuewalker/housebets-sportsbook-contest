import type { Market, Outcome } from '../data';

/** A market-name query keeps every outcome. A player query keeps only the matching rows. */
export function outcomesForQuery(m: Market, query: string): Outcome[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q || m.name.toLocaleLowerCase().includes(q)) return m.outcomes;
  return m.outcomes.filter(o => o.label.toLocaleLowerCase().includes(q));
}

/** Empty query, or a query that names the market, stays on the selected team. A player query searches both squads. */
export function scorerRows(players: string[], team: 0 | 1, query: string, marketNames: string[]): Array<{ name: string; team: 0 | 1 }> {
  const q = query.trim().toLocaleLowerCase();
  const squad = (side: 0 | 1) => players.slice(side * 6, side * 6 + 6).map(name => ({ name, team: side }));
  if (!q || marketNames.some(name => name.toLocaleLowerCase().includes(q))) return squad(team);
  return [0, 1].flatMap(side => squad(side as 0 | 1).filter(p => p.name.toLocaleLowerCase().includes(q)));
}
