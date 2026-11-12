import type { Category, Market } from './data';

/** Pricing model for the sample football markets: independent Poisson goals, fitted to each fixture's match-result odds. */

const MARGIN = 1.065;
const MAX_GOALS = 10;

export function market(id: string, name: string, category: Category, labels: string[], prices: number[], suspended = false, layout?: 'list'): Market {
  return {
    id,
    name,
    category,
    suspended,
    ...(layout ? { layout } : {}),
    outcomes: labels.map((label, i) => ({ id: `${id}-${i}`, label, odds: prices[i] })),
  };
}

export function price(probability: number, margin = MARGIN): number {
  const raw = 1 / Math.max(probability * margin, 1 / 151);
  const clamped = Math.min(151, Math.max(1.02, raw));
  if (clamped >= 20) return Math.round(clamped);
  if (clamped >= 10) return Math.round(clamped * 2) / 2;
  return Math.round(clamped * 100) / 100;
}

function poisson(lambda: number): number[] {
  const p: number[] = [];
  let term = Math.exp(-lambda);
  let total = 0;
  for (let k = 0; k < MAX_GOALS; k++) {
    p.push(term);
    total += term;
    term = (term * lambda) / (k + 1);
  }
  p.push(Math.max(0, 1 - total));
  return p;
}

/** Joint distribution of goals still to come, as [home][away]. */
function grid(home: number, away: number): number[][] {
  const h = poisson(home);
  const a = poisson(away);
  return h.map(ph => a.map(pa => ph * pa));
}

function sum(m: number[][], test: (h: number, a: number) => boolean): number {
  let total = 0;
  m.forEach((row, h) => row.forEach((p, a) => { if (test(h, a)) total += p; }));
  return total;
}

const totalOf = (pairs: Array<[string, number]>) => pairs.reduce((t, [, p]) => t + p, 0);
const line = (n: number) => (n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1));

export interface FootballState {
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  odds: [number, number, number];
  live: boolean;
  minute: number;
  score: [number, number];
  ht?: [number, number];
  corners: [number, number];
  cards: [number, number];
  squads: [string[], string[]];
  suspended: string[];
}

/** Find goal expectancies that reproduce the quoted match-result price under the current score and time left. */
function fit(s: FootballState, remaining: number): [number, number] {
  const implied = s.odds.map(o => 1 / o);
  const target = implied[0] / (implied[0] + implied[2]);
  const total = 2.7;
  let lo = -2.6;
  let hi = 2.6;
  const homeShare = (sup: number) => {
    const m = grid(Math.max(0.05, (total + sup) / 2) * remaining, Math.max(0.05, (total - sup) / 2) * remaining);
    const win = sum(m, (h, a) => s.score[0] + h > s.score[1] + a);
    const lose = sum(m, (h, a) => s.score[0] + h < s.score[1] + a);
    return win / Math.max(1e-9, win + lose);
  };
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (homeShare(mid) < target) lo = mid;
    else hi = mid;
  }
  const sup = (lo + hi) / 2;
  return [Math.max(0.05, (total + sup) / 2), Math.max(0.05, (total - sup) / 2)];
}

const playerWeights = [0.3, 0.2, 0.14, 0.11, 0.08, 0.06];

export function footballMarkets(s: FootballState): Market[] {
  const { homeShort: hs, awayShort: as, live } = s;
  const [sh, sa] = s.score;
  const goals = sh + sa;
  const remaining = live ? Math.max(0.03, (90 - s.minute) / 90) : 1;
  const [lh, la] = fit(s, remaining);
  const rest = grid(lh * remaining, la * remaining);
  const final = (test: (h: number, a: number) => boolean) => sum(rest, (h, a) => test(sh + h, sa + a));
  const out: Market[] = [];
  const add = (id: string, name: string, category: Category, labels: string[], probabilities: number[], layout?: 'list') => {
    // A two- or three-way market with a near-certain side is effectively settled, so it is not offered.
    if (!layout && probabilities.some(p => p < 0.018 || p > 0.982)) return;
    out.push(market(id, name, category, labels, probabilities.map(p => price(p)), s.suspended.includes(id), layout));
  };
  const overUnder = (id: string, name: string, category: Category, over: number) => add(id, name, category, [`Over ${name.split(' · ').pop()}`, `Under ${name.split(' · ').pop()}`], [over, 1 - over]);

  // Popular
  const pHome = final((h, a) => h > a);
  const pDraw = final((h, a) => h === a);
  const pAway = 1 - pHome - pDraw;
  out.push(market('result', 'Match result', 'Popular', [hs, 'Draw', as], s.odds, s.suspended.includes('result')));
  add('double', 'Double chance', 'Popular', [`${hs} or Draw`, `${hs} or ${as}`, `Draw or ${as}`], [pHome + pDraw, pHome + pAway, pDraw + pAway].map(p => p / 0.98));
  const expected = goals + (lh + la) * remaining;
  const mainLine = Math.max(goals + 0.5, Math.floor(expected) + 0.5);
  overUnder('goals', `Total goals · ${mainLine}`, 'Popular', final((h, a) => h + a > mainLine));
  const bothScored = sh > 0 && sa > 0;
  if (!bothScored) add('btts', 'Both teams to score', 'Popular', ['Yes', 'No'], [final((h, a) => h > 0 && a > 0), 1 - final((h, a) => h > 0 && a > 0)]);
  add('dnb', 'Draw no bet', 'Popular', [hs, as], [pHome / (pHome + pAway), pAway / (pHome + pAway)]);
  const noGoal = sum(rest, (h, a) => h + a === 0);
  const homeNext = (lh / (lh + la)) * (1 - noGoal);
  add('next', live ? 'Next goal' : 'First team to score', 'Popular', [hs, 'No goal', as], [homeNext, noGoal, 1 - noGoal - homeNext]);

  // Goals
  for (const l of [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]) {
    if (l <= goals || l === mainLine) continue;
    overUnder(`goals${l * 10}`, `Total goals · ${l}`, 'Goals', final((h, a) => h + a > l));
  }
  for (const [side, name, current] of [[0, hs, sh], [1, as, sa]] as const) {
    for (const extra of live ? [0.5, 1.5] : [0.5, 1.5, 2.5]) {
      const l = current + extra;
      overUnder(`team${side}-${l * 10}`, `${name} total goals · ${l}`, 'Goals', final((h, a) => (side === 0 ? h : a) > l));
    }
  }
  const exact = live ? [goals, goals + 1, goals + 2, goals + 3] : [0, 1, 2, 3, 4, 5];
  const top = exact[exact.length - 1] + 1;
  add('exact', 'Exact total goals', 'Goals', [...exact.map(String), `${top}+`], [...exact.map(n => final((h, a) => h + a === n)), final((h, a) => h + a >= top)]);
  const odd = final((h, a) => (h + a) % 2 === 1);
  add('parity', 'Total goals · odd/even', 'Goals', ['Odd', 'Even'], [odd, 1 - odd]);
  const scores: Array<[string, number]> = [];
  rest.forEach((row, h) => row.forEach((p, a) => { if (h <= 3 && a <= 3) scores.push([`${sh + h}–${sa + a}`, p]); }));
  const likely = scores.sort((x, y) => y[1] - x[1]).slice(0, 12);
  add('correct', 'Correct score', 'Goals', [...likely.map(c => c[0]), 'Any other'], [...likely.map(c => c[1]), 1 - totalOf(likely)], 'list');
  if (sa === 0) add('cs0', `${hs} clean sheet`, 'Goals', ['Yes', 'No'], [final((_h, a) => a === 0), 1 - final((_h, a) => a === 0)]);
  if (sh === 0) add('cs1', `${as} clean sheet`, 'Goals', ['Yes', 'No'], [final(h => h === 0), 1 - final(h => h === 0)]);
  const window = live ? Math.min(10, 90 - s.minute) : 15;
  const soon = 1 - Math.exp(-(lh + la) * (window / 90));
  add('window', live ? `Goal in the next ${window} minutes` : 'Goal before 15:00', 'Goals', ['Yes', 'No'], [soon, 1 - soon]);

  // Halves: time left in each half, with second halves slightly busier than first halves.
  const firstHalfDone = live && s.minute >= 45;
  const ht = firstHalfDone ? s.ht ?? [sh, sa] : [sh, sa];
  const r1 = live ? Math.max(0, 45 - s.minute) / 90 : 0.5;
  const r2 = live ? Math.min(45, 90 - s.minute) / 90 : 0.5;
  const first = grid(lh * r1 * 0.9, la * r1 * 0.9);
  const second = grid(lh * r2 * 1.1, la * r2 * 1.1);
  const firstNow: [number, number] = firstHalfDone ? [ht[0], ht[1]] : [sh, sa];
  const secondNow: [number, number] = firstHalfDone ? [sh - ht[0], sa - ht[1]] : [0, 0];
  const inFirst = (test: (h: number, a: number) => boolean) => sum(first, (h, a) => test(firstNow[0] + h, firstNow[1] + a));
  const inSecond = (test: (h: number, a: number) => boolean) => sum(second, (h, a) => test(secondNow[0] + h, secondNow[1] + a));
  const resultIndex = (h: number, a: number) => (h > a ? 0 : h === a ? 1 : 2);
  if (!firstHalfDone) {
    const hH = inFirst((h, a) => h > a);
    const hD = inFirst((h, a) => h === a);
    add('ht', 'Half-time result', 'Halves', [hs, 'Draw', as], [hH, hD, 1 - hH - hD]);
    for (const l of [0.5, 1.5]) if (l > goals) overUnder(`ht${l * 10}`, `1st half total goals · ${l}`, 'Halves', inFirst((h, a) => h + a > l));
    if (!(firstNow[0] > 0 && firstNow[1] > 0)) add('htbtts', 'Both teams to score · 1st half', 'Halves', ['Yes', 'No'], [inFirst((h, a) => h > 0 && a > 0), 1 - inFirst((h, a) => h > 0 && a > 0)]);
  }
  const sH = inSecond((h, a) => h > a);
  const sD = inSecond((h, a) => h === a);
  add('2h', '2nd half result', 'Halves', [hs, 'Draw', as], [sH, sD, 1 - sH - sD]);
  for (const l of [0.5, 1.5, 2.5]) if (l > secondNow[0] + secondNow[1]) overUnder(`2h${l * 10}`, `2nd half total goals · ${l}`, 'Halves', inSecond((h, a) => h + a > l));
  if (!(secondNow[0] > 0 && secondNow[1] > 0)) add('2hbtts', 'Both teams to score · 2nd half', 'Halves', ['Yes', 'No'], [inSecond((h, a) => h > 0 && a > 0), 1 - inSecond((h, a) => h > 0 && a > 0)]);
  const htft = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const halves = [0, 0, 0];
  first.forEach((row1, h1) => row1.forEach((p1, a1) => {
    if (p1 < 1e-7) return;
    const fh = firstNow[0] + h1;
    const fa = firstNow[1] + a1;
    second.forEach((row2, h2) => row2.forEach((p2, a2) => {
      const p = p1 * p2;
      htft[resultIndex(fh, fa) * 3 + resultIndex(fh + secondNow[0] + h2, fa + secondNow[1] + a2)] += p;
      halves[resultIndex(fh + fa, secondNow[0] + h2 + secondNow[1] + a2)] += p;
    }));
  }));
  if (!firstHalfDone) {
    const sides = [hs, 'Draw', as];
    add('htft', 'Half-time / full-time', 'Halves', sides.flatMap(a => sides.map(b => `${a} / ${b}`)), htft, 'list');
  }
  add('highest', 'Highest scoring half', 'Halves', ['1st half', 'Equal', '2nd half'], halves);

  // Handicaps
  const diff = (h: number, a: number) => h - a;
  for (const hcp of [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]) {
    const win = final((h, a) => diff(h, a) + hcp > 0);
    const lose = final((h, a) => diff(h, a) + hcp < 0);
    const pWin = win / (win + lose);
    add(`ah${hcp < 0 ? 'm' : 'p'}${Math.abs(hcp) * 10}`, `Asian handicap · ${line(hcp)}`, 'Handicaps', [`${hs} ${line(hcp)}`, `${as} ${line(-hcp)}`], [pWin, 1 - pWin]);
  }
  for (const hcp of [-1, 1]) {
    const w = final((h, a) => diff(h, a) + hcp > 0);
    const d = final((h, a) => diff(h, a) + hcp === 0);
    add(`eh${hcp < 0 ? 'm' : 'p'}1`, `Handicap (3-way) · ${hs} ${line(hcp)}`, 'Handicaps', [`${hs} ${line(hcp)}`, `Draw ${line(hcp)}`, `${as} ${line(-hcp)}`], [w, d, 1 - w - d]);
  }

  // Goalscorers
  const scorer = (team: 0 | 1, i: number) => (team === 0 ? lh : la) * remaining * playerWeights[i];
  const names = [...s.squads[0].map((n, i) => [n, scorer(0, i)] as const), ...s.squads[1].map((n, i) => [n, scorer(1, i)] as const)].sort((x, y) => y[1] - x[1]);
  const totalRate = (lh + la) * remaining;
  add('scorer', live ? 'Next goalscorer' : 'First goalscorer', 'Goalscorers', [...names.map(n => n[0]), 'No goalscorer'], [...names.map(n => (n[1] / totalRate) * (1 - noGoal)), noGoal], 'list');
  add('anytime', 'Anytime goalscorer', 'Goalscorers', names.map(n => n[0]), names.map(n => 1 - Math.exp(-n[1])), 'list');
  const brace = names.map(n => [n[0], 1 - Math.exp(-n[1]) * (1 + n[1])] as const).filter(n => n[1] > 0.005);
  if (brace.length) add('brace', 'To score 2 or more', 'Goalscorers', brace.map(n => n[0]), brace.map(n => n[1]), 'list');
  add('last', 'Last goalscorer', 'Goalscorers', [...names.map(n => n[0]), 'No goalscorer'], [...names.map(n => (n[1] / totalRate) * (1 - noGoal)), noGoal], 'list');

  // Corners & cards
  const cornerShare = lh / (lh + la);
  const cornerRate = 10.2 * remaining;
  const cornersNow = s.corners[0] + s.corners[1];
  const cornerTotal = poisson(cornerRate);
  const over = (dist: number[], now: number, l: number) => dist.reduce((t, p, k) => t + (now + k > l ? p : 0), 0);
  const mainCorners = Math.max(cornersNow + 0.5, Math.floor(cornersNow + cornerRate) + 0.5);
  for (const l of [mainCorners, mainCorners - 1, mainCorners + 1, mainCorners + 2]) {
    if (l <= cornersNow) continue;
    overUnder(l === mainCorners ? 'corners' : `corners${l * 10}`, `Total corners · ${l}`, 'Corners & Cards', over(cornerTotal, cornersNow, l));
  }
  add('corner-next', live ? 'Next corner' : 'First corner', 'Corners & Cards', [hs, as], [cornerShare, 1 - cornerShare]);
  for (const [side, name, now, share] of [[0, hs, s.corners[0], cornerShare], [1, as, s.corners[1], 1 - cornerShare]] as const) {
    const l = Math.floor(now + cornerRate * share) + 0.5;
    overUnder(`corners-team${side}`, `${name} corners · ${l}`, 'Corners & Cards', over(poisson(cornerRate * share), now, l));
  }
  if (!live) overUnder('corners-ht', '1st half corners · 4.5', 'Corners & Cards', over(poisson(10.2 * 0.45), 0, 4.5));
  const cardRate = 4.2 * remaining;
  const cardsNow = s.cards[0] + s.cards[1];
  for (const l of [3.5, 4.5, 5.5]) {
    if (l <= cardsNow) continue;
    overUnder(l === 3.5 ? 'cards' : `cards${l * 10}`, `Total cards · ${l}`, 'Corners & Cards', over(poisson(cardRate), cardsNow, l));
  }
  const red = 0.02 + 0.12 * remaining;
  add('red', 'Red card shown', 'Corners & Cards', ['Yes', 'No'], [red, 1 - red]);
  for (const [side, name, now] of [[0, hs, s.cards[0]], [1, as, s.cards[1]]] as const) {
    const l = now + 1.5;
    overUnder(`cards-team${side}`, `${name} cards · ${l}`, 'Corners & Cards', over(poisson(cardRate / 2), now, l));
  }
  return out;
}

/** Compact two-way market set for the non-football sports. */
export function twoWayMarkets(home: string, away: string, odds: [number, number], extra: Array<[string, string, Category, string[], number[]]>, suspended: string[] = []): Market[] {
  return [
    market('winner', 'Match winner', 'Popular', [home, away], odds, suspended.includes('winner')),
    ...extra.map(([id, name, category, labels, prices]) => market(id, name, category, labels, prices, suspended.includes(id))),
  ];
}
