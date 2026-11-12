import { driftOdds } from '../engine';
import { periodText } from './components/common';
import { refreshOutcome, root, updateCompactScore } from './render';
import { clockText, isLive, state, ticking, ui } from './state';

const CLOCK_MS = 1000;
const FEED_MS = 3500;

function tickClocks() {
  ui.elapsed++;
  for (const f of state().fixtures) {
    if (!isLive(f) || !ticking(f)) continue;
    root.querySelectorAll<HTMLElement>(`[data-clock="${f.id}"]`).forEach(el => {
      el.textContent = clockText(f, el.hasAttribute('data-seconds'));
    });
    root.querySelectorAll<HTMLElement>(`[data-period="${f.id}"]`).forEach(el => {
      el.textContent = periodText(f);
    });
  }
}

/** Simulated in-play feed: moves one on-screen, unselected price and flashes it. */
function movePrice() {
  if (!ui.liveFeed || ui.busy || ui.loading || document.hidden) return;
  const onScreen = new Set(Array.from(root.querySelectorAll<HTMLElement>('main .odds')).map(el => `${el.dataset.fixture}:${el.dataset.market}`));
  const change = driftOdds(state(), Math.random, (fixtureId, marketId) => onScreen.has(`${fixtureId}:${marketId}`));
  if (!change) return;
  change.cleared.forEach(refreshOutcome);
  refreshOutcome(`${change.fixtureId}:${change.marketId}:${change.outcomeId}`);
  root.querySelectorAll<HTMLElement>(`.odds[data-fixture="${change.fixtureId}"][data-market="${change.marketId}"][data-outcome="${change.outcomeId}"]`).forEach(el => {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  });
}

export function startFeed() {
  setInterval(tickClocks, CLOCK_MS);
  setInterval(movePrice, FEED_MS);
  window.addEventListener('scroll', updateCompactScore, { passive: true });
  window.addEventListener('resize', updateCompactScore, { passive: true });
}
