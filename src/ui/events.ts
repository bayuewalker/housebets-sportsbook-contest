import type { Category, Sport } from '../data';
import {
  acceptChanges, cashOut, moveOdds, placeBets, placementError, removeSuspended, settle, toggleSelection, toggleSuspension,
} from '../engine';
import { plural } from './format';
import { render, root, setDialogCancel } from './render';
import {
  clearFilters, closeDialog, go, isFavorite, isSelected, page, pickKey, resetState, state, toast, ui,
  type DateFilter, type FootballMarket, type InfoTopic, type PanelTab,
} from './state';

const navigate = (url: string) => go(url, render);

let pendingScroll = '';

const mobile = () => window.matchMedia('(max-width: 1099px)').matches;

function focusSearch() {
  const input = root.querySelector<HTMLInputElement>('#global-search');
  window.scrollTo({ top: 0 });
  input?.focus({ preventScroll: true });
}

function openPanel(tab: PanelTab) {
  ui.panelTab = tab;
  if (mobile() || ui.panelHidden) {
    closeDialog();
    ui.dialog = tab === 'chat' ? 'chat' : 'slip';
  }
}

async function place() {
  if (ui.busy || placementError(state())) return;
  ui.busy = true;
  ui.notice = null;
  render();
  await new Promise(r => setTimeout(r, 850));
  const result = placeBets(state());
  ui.busy = false;
  ui.notice = { kind: result.ok ? 'success' : 'error', message: result.message, bets: result.bets?.map(b => ({ ...b })) };
  render();
}

/** Returns false when the handler already rendered (or must not render). */
function handle(action: string, d: DOMStringMap, button: HTMLElement): boolean | void {
  const s = state();
  switch (action) {
    case 'follow': {
      const key = d.key!;
      s.favorites = isFavorite(key) ? s.favorites.filter(k => k !== key) : [...s.favorites, key];
      toast(isFavorite(key) ? `${key.split(':')[1]} added to favourites` : `${key.split(':')[1]} removed from favourites`);
      break;
    }
    case 'open-favourite': {
      const [kind, name] = d.key!.split(':');
      closeDialog();
      clearFilters();
      if (kind === 'league') {
        ui.league = name;
        navigate('/football');
      } else {
        ui.query = name;
        navigate('/sports');
      }
      break;
    }
    case 'favourites':
      closeDialog();
      clearFilters();
      if (page() === 'home') {
        render();
        document.querySelector('#your-matches')?.scrollIntoView({ block: 'start' });
        return false;
      }
      pendingScroll = '#your-matches';
      navigate('/sports');
      break;
    case 'sport':
      closeDialog();
      clearFilters();
      ui.sport = d.sport as Sport;
      navigate('/sports');
      break;
    case 'live-sport':
      ui.sport = d.sport as Sport | 'All';
      break;
    case 'live-all':
      ui.sport = 'All';
      break;
    case 'league':
      closeDialog();
      clearFilters();
      ui.league = d.league!;
      navigate('/football');
      break;
    case 'league-filter':
      ui.league = d.league!;
      break;
    case 'football-scope':
      ui.footballScope = d.scope as 'upcoming' | 'all';
      break;
    case 'football-all':
      ui.footballScope = 'all';
      ui.league = '';
      break;
    case 'toggle-soon':
      ui.showAllSoon = !ui.showAllSoon;
      break;
    case 'toggle-mine':
      ui.showAllMine = !ui.showAllMine;
      break;
    case 'carousel': {
      const track = button.closest('.home-section')?.querySelector<HTMLElement>('.carousel');
      const card = track?.querySelector<HTMLElement>('.featured-card');
      if (track && card) track.scrollBy({ left: Number(d.dir) * (card.offsetWidth + 12), behavior: 'smooth' });
      return false;
    }
    case 'clear-search':
      ui.query = '';
      render();
      focusSearch();
      return false;
    case 'search':
      closeDialog();
      render();
      focusSearch();
      return false;
    case 'upcoming':
      document.querySelector('#starting-soon')?.scrollIntoView({ behavior: 'smooth' });
      return false;
    case 'find-match':
      closeDialog();
      clearFilters();
      navigate('/sports');
      break;
    case 'odds': {
      if (ui.busy) return false;
      toggleSelection(s, d.fixture!, d.market!, d.outcome!);
      ui.notice = null;
      const added = isSelected(d.fixture!, d.market!, d.outcome!);
      if (added) ui.panelTab = 'slip';
      toast(added ? 'Added to bet slip' : 'Removed from bet slip');
      break;
    }
    case 'remove':
      s.selections = s.selections.filter(p => pickKey(p) !== d.key);
      ui.notice = null;
      break;
    case 'remove-suspended':
      toast(`${plural(removeSuspended(s), 'suspended selection')} removed`);
      ui.notice = null;
      break;
    case 'clear-slip':
      s.selections = [];
      ui.notice = null;
      break;
    case 'stake': {
      const p = s.selections.find(x => pickKey(x) === d.key);
      if (p) p.stake = d.value!;
      ui.notice = null;
      break;
    }
    case 'accept':
      acceptChanges(s);
      ui.notice = null;
      toast('New odds accepted');
      break;
    case 'place':
      void place();
      return false;
    case 'dismiss-notice':
      ui.notice = null;
      break;
    case 'history':
      ui.historyTab = d.tab as 'open' | 'settled';
      break;
    case 'expand':
      if (ui.expanded.has(d.id!)) ui.expanded.delete(d.id!);
      else ui.expanded.add(d.id!);
      break;
    case 'reset-bet-filters':
      ui.dateFilter = 'all';
      ui.sportFilter = 'All';
      break;
    case 'view-open':
      closeDialog();
      ui.historyTab = 'open';
      navigate('/bets');
      break;
    case 'category':
      ui.category = d.category as Category | 'All';
      break;
    case 'collapse':
      if (ui.collapsed.has(d.market!)) ui.collapsed.delete(d.market!);
      else ui.collapsed.add(d.market!);
      break;
    case 'collapse-all': {
      const ids = [...root.querySelectorAll<HTMLElement>('.market-head [data-action="collapse"]')].map(b => b.dataset.market!);
      for (const id of ids) {
        if (d.state === 'collapse') ui.collapsed.add(id);
        else ui.collapsed.delete(id);
      }
      break;
    }
    case 'clear-market-search':
      ui.marketQuery = '';
      render();
      root.querySelector<HTMLInputElement>('#market-search')?.focus();
      return false;
    case 'scorer-team':
      ui.scorerTeam = d.team === '1' ? 1 : 0;
      break;
    case 'panel-tab':
      ui.panelTab = d.tab as PanelTab;
      break;
    case 'panel':
      ui.panelHidden = !ui.panelHidden;
      break;
    case 'rail':
      ui.railExpanded = !ui.railExpanded;
      break;
    case 'mobile-slip':
      openPanel('slip');
      ui.dialog = 'slip';
      break;
    case 'chat':
      closeDialog();
      ui.panelTab = 'chat';
      ui.dialog = 'chat';
      break;
    case 'menu':
      closeDialog();
      ui.dialog = 'menu';
      break;
    case 'wallet':
      closeDialog();
      ui.dialog = 'wallet';
      break;
    case 'info':
      closeDialog();
      ui.info = d.topic as InfoTopic;
      ui.dialog = 'info';
      break;
    case 'demo':
      closeDialog();
      ui.dialog = 'demo';
      break;
    case 'close':
      closeDialog();
      break;
    case 'move':
      moveOdds(s);
      closeDialog();
      toast('Odds moved. Selected prices need your acceptance.');
      break;
    case 'suspend':
      toggleSuspension(s);
      closeDialog();
      toast('Market availability updated');
      break;
    case 'fail':
      s.failNext = !s.failNext;
      closeDialog();
      toast(s.failNext ? 'Next valid placement will fail' : 'Placement failure disarmed');
      break;
    case 'settle':
      toast(settle(s) ? 'Open bet settled as won. Return credited.' : 'No open bets to settle');
      closeDialog();
      ui.historyTab = 'settled';
      navigate('/bets');
      break;
    case 'no-live':
      s.noLive = !s.noLive;
      closeDialog();
      clearFilters();
      navigate('/live');
      break;
    case 'loading':
      closeDialog();
      clearFilters();
      navigate('/live');
      ui.loading = true;
      setTimeout(() => {
        ui.loading = false;
        render();
      }, 2000);
      break;
    case 'feed':
      ui.liveFeed = !ui.liveFeed;
      closeDialog();
      toast(ui.liveFeed ? 'Live prices resumed' : 'Live prices paused');
      break;
    case 'cash':
      ui.cashId = d.id!;
      ui.dialog = 'cash';
      break;
    case 'confirm-cash':
      if (cashOut(s, d.id!)) {
        toast('Cashed out. Demo balance updated.');
        ui.historyTab = 'settled';
        ui.expanded.add(d.id!);
      }
      closeDialog();
      break;
    case 'reset-confirm':
      closeDialog();
      ui.dialog = 'reset';
      break;
    case 'reset':
      resetState();
      ui.elapsed = 0;
      ui.liveFeed = true;
      ui.notice = null;
      ui.expanded.clear();
      ui.collapsed.clear();
      closeDialog();
      clearFilters();
      ui.historyTab = 'open';
      toast('Demo session reset');
      navigate('/sports');
      break;
  }
}

export function bindEvents() {
  setDialogCancel(() => {
    closeDialog();
    render();
  });

  root.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a[href^="#/"]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href')!.slice(1);
      closeDialog();
      if (['/sports', '/live', '/football'].includes(href)) clearFilters();
      navigate(href);
      render();
      return;
    }
    const button = target.closest<HTMLElement>('[data-action]');
    if (!button || (button as HTMLButtonElement).disabled) return;
    if (handle(button.dataset.action!, button.dataset, button) !== false) render();
  });

  root.addEventListener('input', e => {
    const input = e.target as HTMLInputElement;
    if (input.id === 'global-search') {
      ui.query = input.value;
      ui.sport = 'All';
      if (page() !== 'home') navigate('/sports');
      render();
    } else if (input.id === 'market-search') {
      ui.marketQuery = input.value;
      render();
    } else if (input.dataset.stake) {
      const p = state().selections.find(x => pickKey(x) === input.dataset.stake);
      if (p) {
        p.stake = input.value;
        ui.notice = null;
        render();
      }
    }
  });

  root.addEventListener('change', e => {
    const select = e.target as HTMLSelectElement;
    if (select.id === 'football-market') ui.footballMarket = select.value as FootballMarket;
    else if (select.id === 'date-filter') ui.dateFilter = select.value as DateFilter;
    else if (select.id === 'sport-filter') ui.sportFilter = select.value as Sport | 'All';
    else return;
    render();
  });

  root.addEventListener('submit', e => e.preventDefault());

  // Arrow-key navigation for every tab list (WAI-ARIA tabs pattern).
  root.addEventListener('keydown', e => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = [...tab.closest('[role="tablist"]')!.querySelectorAll<HTMLElement>('[role="tab"]')];
    const i = tabs.indexOf(tab);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    e.preventDefault();
    const key = tabs[next].dataset.focus || tabs[next].id;
    tabs[next].click();
    root.querySelector<HTMLElement>(`[data-focus="${key}"]`)?.focus();
  });

  window.addEventListener('keydown', e => {
    const target = e.target as HTMLElement;
    if (e.key === 'Escape' && target.id === 'global-search' && ui.query) {
      e.preventDefault();
      ui.query = '';
      render();
      return;
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) && !document.querySelector('dialog')) {
      e.preventDefault();
      focusSearch();
    }
  });

  window.addEventListener('hashchange', () => {
    closeDialog();
    ui.category = 'All';
    ui.marketQuery = '';
    ui.collapsed.clear();
    ui.scorerTeam = 0;
    if (page() === 'live' || page() === 'football') ui.sport = 'All';
    render();
    const anchor = pendingScroll && document.querySelector(pendingScroll);
    pendingScroll = '';
    if (anchor) anchor.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
    if (document.activeElement?.id !== 'global-search') document.querySelector<HTMLElement>('#page-title')?.focus({ preventScroll: true });
  });

  document.querySelector('.skip-link')?.addEventListener('click', e => {
    e.preventDefault();
    const main = document.querySelector<HTMLElement>('#main');
    main?.focus();
    main?.scrollIntoView({ block: 'start' });
  });
}
