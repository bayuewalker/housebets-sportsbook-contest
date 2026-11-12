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

  // Goalscorers. Player lists only keep prices that are still a real chance, so a late match
  // does not fill the card with impossible lines. Yes/no markets use the same near-certainty filter.
  const scorer = (team: 0 | 1, i: number) => (team === 0 ? lh : la) * remaining * playerWeights[i];
  const names = [...s.squads[0].map((n, i) => [n, scorer(0, i)] as const), ...s.squads[1].map((n, i) => [n, scorer(1, i)] as const)].sort((x, y) => y[1] - x[1]);
  const totalRate = (lh + la) * remaining;
  const atLeast = (mu: number, k: number) => {
    let term = Math.exp(-mu);
    let cdf = 0;
    for (let n = 0; n < k; n++) { cdf += term; term *= mu / (n + 1); }
    return Math.max(0, 1 - cdf);
  };
  const playerList = (id: string, name: string, weight: (mu: number) => number, floor = 0.015) => {
    const rows = names.map(n => [n[0], weight(n[1])] as const).filter(n => n[1] >= floor);
    if (rows.length >= 1) add(id, name, 'Goalscorers', rows.map(n => n[0]), rows.map(n => n[1]), 'list');
  };
  // A brace or a hat-trick stays on the card as a long price when the match is already underway.
  const ensureList = (id: string, name: string, weight: (mu: number) => number, floor: number) => {
    const rows = names.map(n => [n[0], weight(n[1])] as const).sort((a, b) => b[1] - a[1]);
    const kept = rows.filter(n => n[1] >= floor);
    const pick = kept.length ? kept : rows.slice(0, 3);
    add(id, name, 'Goalscorers', pick.map(n => n[0]), pick.map(n => n[1]), 'list');
  };
  add('scorer', live ? 'Next goalscorer' : 'First goalscorer', 'Goalscorers', [...names.map(n => n[0]), 'No goalscorer'], [...names.map(n => (n[1] / totalRate) * (1 - noGoal)), noGoal], 'list');
  add('anytime', 'Anytime goalscorer', 'Goalscorers', names.map(n => n[0]), names.map(n => 1 - Math.exp(-n[1])), 'list');
  ensureList('brace', 'To score 2 or more', mu => atLeast(mu, 2), 0.01);
  add('last', 'Last goalscorer', 'Goalscorers', [...names.map(n => n[0]), 'No goalscorer'], [...names.map(n => (n[1] / totalRate) * (1 - noGoal)), noGoal], 'list');
  ensureList('hat', 'Hat-trick', mu => atLeast(mu, 3), 0.004);
  playerList('header', 'To score a header', mu => 1 - Math.exp(-mu * 0.22));
  playerList('outside', 'To score from outside the box', mu => 1 - Math.exp(-mu * 0.16));
  if (!firstHalfDone) playerList('both-halves', 'To score in both halves', mu => (1 - Math.exp(-mu * 0.48)) * (1 - Math.exp(-mu * 0.52)));
  else add('both-halves', 'Goal in both halves', 'Goalscorers', ['Yes', 'No'], [1 - noGoal, noGoal]);
  for (const [side, squad, label] of [[0, s.squads[0], hs], [1, s.squads[1], as]] as const) {
    const teamRate = (side === 0 ? lh : la) * remaining;
    const rows = squad.map((n, i) => [n, scorer(side, i)] as const);
    const teamNo = Math.exp(-teamRate);
    const scored = side === 0 ? sh > 0 : sa > 0;
    add(`team-scorer-${side}`, `${label} ${scored ? 'next' : 'first'} goalscorer`, 'Goalscorers', [...rows.map(n => n[0]), 'No goalscorer'], [...rows.map(n => (n[1] / Math.max(teamRate, 1e-9)) * (1 - teamNo)), teamNo], 'list');
  }
  add('header-next', live ? 'Next goal is a header' : 'First goal is a header', 'Goalscorers', ['Yes', 'No'], [0.22 * (1 - noGoal), 1 - 0.22 * (1 - noGoal)]);
  add('outside-next', live ? 'Next goal from outside the box' : 'First goal from outside the box', 'Goalscorers', ['Yes', 'No'], [0.16 * (1 - noGoal), 1 - 0.16 * (1 - noGoal)]);
  const penalty = 0.03 + 0.09 * remaining;
  add('penalty', 'Penalty scored', 'Goalscorers', ['Yes', 'No'], [penalty, 1 - penalty]);

  // Players — fictional squad names only. Each row is that player's price.
  const playerProp = (id: string, name: string, prob: (mu: number, i: number) => number) => {
    const rows = names.map((n, i) => [n[0], prob(n[1], i)] as const).filter(n => n[1] >= 0.02 && n[1] <= 0.94);
    if (rows.length >= 2) add(id, name, 'Players', rows.map(n => n[0]), rows.map(n => n[1]), 'list');
  };
  playerProp('sot', 'Shots on target', mu => 1 - Math.exp(-Math.max(mu * 3.4, 0.35 * remaining)));
  playerProp('sot2', '2+ shots on target', mu => atLeast(Math.max(mu * 2.4, 0.2 * remaining), 2));
  playerProp('shots', 'Player shots', mu => 1 - Math.exp(-Math.max(mu * 5, 0.7 * remaining)));
  playerProp('sot-out', 'Shots outside the box', mu => 1 - Math.exp(-Math.max(mu * 1.8, 0.28 * remaining)));
  playerProp('shots-off', 'Shots off target', mu => 1 - Math.exp(-Math.max(mu * 2.8, 0.4 * remaining)));
  playerProp('booked', 'To be booked', (_mu, i) => 1 - Math.exp(-(0.16 + (11 - i) * 0.012) * (0.35 + remaining)));
  playerProp('assist', 'To assist', mu => 1 - Math.exp(-mu * 0.72));
  playerProp('fouls', 'Fouls committed', (_mu, i) => 1 - Math.exp(-(0.42 + (i % 6) * 0.05) * (0.45 + remaining)));
  playerProp('offsides', 'Offsides', mu => 1 - Math.exp(-Math.max(mu * 1.3, 0.22 * remaining)));
  playerProp('tackles', 'Tackles', (_mu, i) => 1 - Math.exp(-(0.5 + (i % 5) * 0.06) * (0.4 + remaining)));
  const cardWeight = names.map((_n, i) => 0.7 + ((names.length - i) % 7) * 0.15);
  const cardTotal = cardWeight.reduce((sum, weight) => sum + weight, 0);
  const cardChance = Math.min(0.82, 0.5 + 0.35 * remaining);
  const cardRows = names
    .map((n, i) => [n[0], (cardWeight[i] / cardTotal) * cardChance] as const)
    .filter(row => row[1] >= 0.02);
  if (cardRows.length >= 2) {
    const used = cardRows.reduce((sum, row) => sum + row[1], 0);
    add('card-first', 'To be carded first', 'Players', [...cardRows.map(row => row[0]), 'No card'], [...cardRows.map(row => row[1]), Math.max(0.02, 1 - used)], 'list');
  }

  // Minutes. Past windows are closed; what is left is the open part of the current window onwards.
  const nowMin = live ? Math.min(s.minute, 89) : 0;
  const lambda = lh + la;
  for (const start of [0, 10, 20, 30, 40, 50, 60, 70, 80]) {
    const end = start + 10;
    if (nowMin >= end) continue;
    const from = Math.max(start, nowMin);
    const p = 1 - Math.exp(-lambda * ((end - from) / 90));
    add(`min-${start}`, `Goal ${start}–${end}`, 'Minutes', ['Yes', 'No'], [p, 1 - p]);
  }
  const timeBands: Array<[string, number]> = [];
  for (const start of [0, 10, 20, 30, 40, 50, 60, 70, 80]) {
    const end = start + 10;
    const from = Math.max(start, nowMin);
    if (from >= end) continue;
    const p = Math.exp(-lambda * ((from - nowMin) / 90)) - Math.exp(-lambda * ((end - nowMin) / 90));
    if (p >= 0.02) timeBands.push([`${start}–${end}`, p]);
  }
  const noFurther = Math.exp(-lambda * ((90 - nowMin) / 90));
  if (timeBands.length) {
    add('goal-time', goals === 0 ? 'First goal time' : 'Next goal time', 'Minutes', [...timeBands.map(b => b[0]), 'No goal'], [...timeBands.map(b => b[1]), noFurther], 'list');
  }

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
  const cornerOdd = cornerTotal.reduce((t, p, k) => t + ((cornersNow + k) % 2 === 1 ? p : 0), 0);
  add('corners-oe', 'Total corners · odd/even', 'Corners & Cards', ['Odd', 'Even'], [cornerOdd, 1 - cornerOdd]);
  const cover = (rateH: number, rateA: number, nowH: number, nowA: number, hcp: number) => {
    const h = poisson(rateH);
    const a = poisson(rateA);
    let win = 0;
    let lose = 0;
    h.forEach((ph, i) => a.forEach((pa, j) => {
      const d = nowH + i + hcp - (nowA + j);
      if (d > 0) win += ph * pa;
      else if (d < 0) lose += ph * pa;
    }));
    return win / Math.max(1e-9, win + lose);
  };
  const split3 = (nowH: number, nowA: number, rateH: number, rateA: number) => {
    const h = poisson(rateH);
    const a = poisson(rateA);
    let home = 0;
    let away = 0;
    let tie = 0;
    h.forEach((ph, i) => a.forEach((pa, j) => {
      const d = nowH + i - (nowA + j);
      if (d > 0) home += ph * pa;
      else if (d < 0) away += ph * pa;
      else tie += ph * pa;
    }));
    return [home, tie, away];
  };
  for (const hcp of [-2.5, -1.5, 0.5, 1.5, 2.5]) {
    const pWin = cover(cornerRate * cornerShare, cornerRate * (1 - cornerShare), s.corners[0], s.corners[1], hcp);
    add(`ch${hcp < 0 ? 'm' : 'p'}${Math.abs(hcp) * 10}`, `Corner handicap · ${line(hcp)}`, 'Handicaps', [`${hs} ${line(hcp)}`, `${as} ${line(-hcp)}`], [pWin, 1 - pWin]);
  }
  add('most-corners', 'Most corners', 'Corners & Cards', [hs, 'Tie', as], split3(s.corners[0], s.corners[1], cornerRate * cornerShare, cornerRate * (1 - cornerShare)));
  add('most-cards', 'Most cards', 'Corners & Cards', [hs, 'Tie', as], split3(s.cards[0], s.cards[1], cardRate / 2, cardRate / 2));
  if (live) {
    const mainNow = Math.max(0.5, Math.floor(cornerRate) + 0.5);
    for (const l of [mainNow - 1, mainNow, mainNow + 1, mainNow + 2]) {
      if (l < 0.5) continue;
      overUnder(`corners-now-${l * 10}`, `Corners from now · ${l}`, 'Corners & Cards', over(poisson(cornerRate), 0, l));
    }
    const cardMain = Math.max(0.5, Math.floor(cardRate) + 0.5);
    for (const l of [cardMain, cardMain + 1, cardMain + 2]) {
      overUnder(`cards-now-${l * 10}`, `Cards from now · ${l}`, 'Corners & Cards', over(poisson(cardRate), 0, l));
    }
  }

  // Lines that stay bettable after the score has moved: the team still to score, the margin, and the rest of the match.
  if (sh === 0) add('score-home', `${hs} to score`, 'Goals', ['Yes', 'No'], [final(h => h > 0), 1 - final(h => h > 0)]);
  if (sa === 0) add('score-away', `${as} to score`, 'Goals', ['Yes', 'No'], [final((_h, a) => a > 0), 1 - final((_h, a) => a > 0)]);
  if (sa === 0) add('wtn-home', `${hs} win to nil`, 'Popular', ['Yes', 'No'], [final((h, a) => h > a && a === 0), 1 - final((h, a) => h > a && a === 0)]);
  if (sh === 0) add('wtn-away', `${as} win to nil`, 'Popular', ['Yes', 'No'], [final((h, a) => a > h && h === 0), 1 - final((h, a) => a > h && h === 0)]);
  const oddHome = final(h => h % 2 === 1);
  const oddAway = final((_h, a) => a % 2 === 1);
  add('odd-home', `${hs} goals · odd/even`, 'Goals', ['Odd', 'Even'], [oddHome, 1 - oddHome]);
  add('odd-away', `${as} goals · odd/even`, 'Goals', ['Odd', 'Even'], [oddAway, 1 - oddAway]);
  const marginRows: Array<[string, number]> = [
    [`${hs} by 1`, final((h, a) => h - a === 1)],
    [`${hs} by 2`, final((h, a) => h - a === 2)],
    [`${hs} by 3+`, final((h, a) => h - a >= 3)],
    ['Draw', final((h, a) => h === a)],
    [`${as} by 1`, final((h, a) => a - h === 1)],
    [`${as} by 2`, final((h, a) => a - h === 2)],
    [`${as} by 3+`, final((h, a) => a - h >= 3)],
  ];
  const margins = marginRows.filter(row => row[1] >= 0.025);
  if (margins.length >= 3) add('margin', 'Winning margin', 'Goals', margins.map(row => row[0]), margins.map(row => row[1]), 'list');
  const rangeRows: Array<[string, number]> = [
    ['0–1', final((h, a) => h + a <= 1)],
    ['2–3', final((h, a) => h + a >= 2 && h + a <= 3)],
    ['4–6', final((h, a) => h + a >= 4 && h + a <= 6)],
    ['7+', final((h, a) => h + a >= 7)],
  ];
  const goalRange = rangeRows.filter(row => row[1] >= 0.025);
  if (goalRange.length >= 2) add('goal-range', 'Total goals range', 'Goals', goalRange.map(row => row[0]), goalRange.map(row => row[1]), 'list');
  for (const hcp of [-2.5, -2, 2, 2.5]) {
    const win = final((h, a) => diff(h, a) + hcp > 0);
    const lose = final((h, a) => diff(h, a) + hcp < 0);
    add(`ahx${hcp < 0 ? 'm' : 'p'}${Math.abs(hcp) * 10}`, `Asian handicap · ${line(hcp)}`, 'Handicaps', [`${hs} ${line(hcp)}`, `${as} ${line(-hcp)}`], [win / Math.max(1e-9, win + lose), lose / Math.max(1e-9, win + lose)]);
  }
  add('2h-dc', '2nd half double chance', 'Halves', [`${hs} or Draw`, `${hs} or ${as}`, `Draw or ${as}`], [sH + sD, sH + (1 - sH - sD), sD + (1 - sH - sD)].map(p => Math.min(0.96, p)));
  if (live) {
    const rh = sum(rest, (h, a) => h > a);
    const rd = sum(rest, (h, a) => h === a);
    const ra = Math.max(0, 1 - rh - rd);
    add('rest-result', 'Rest of match result', 'Popular', [hs, 'Draw', as], [rh, rd, ra]);
    add('rest-dc', 'Rest of match double chance', 'Popular', [`${hs} or Draw`, `${hs} or ${as}`, `Draw or ${as}`], [rh + rd, rh + ra, rd + ra].map(p => Math.min(0.96, p)));
    for (const l of [0.5, 1.5, 2.5]) overUnder(`rest-${l * 10}`, `Rest of match goals · ${l}`, 'Goals', sum(rest, (h, a) => h + a > l));
    const restBoth = sum(rest, (h, a) => h > 0 && a > 0);
    add('rest-btts', 'Both teams to score · rest of match', 'Goals', ['Yes', 'No'], [restBoth, 1 - restBoth]);
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
