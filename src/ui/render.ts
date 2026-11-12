import { icon } from '../icons';
import { esc } from './format';
import { currentFixture, page, save, state, ui } from './state';
import { oddsButton } from './components/common';
import { dialog } from './components/dialogs';
import { bottomNav, favouriteChips, footer, iconRail, mobileSlipBar, searchBar, sportTabs, topbar } from './components/shell';
import { sidePanel } from './components/panel';
import { betsPage } from './pages/bets';
import { footballPage } from './pages/football';
import { homePage } from './pages/home';
import { livePage } from './pages/live';
import { matchPage } from './pages/match';

export const root = document.querySelector<HTMLDivElement>('#app')!;

let opener: { key: string; index: number } | undefined;
let onDialogCancel: () => void = () => undefined;

export function setDialogCancel(handler: () => void) {
  onDialogCancel = handler;
}

// Views are re-rendered wholesale, so focus is restored by a stable control key rather than by element identity.
const controlKey = (el: HTMLElement) =>
  el.dataset.focus || el.id || `${el.tagName}|${el.getAttribute('href') ?? ''}|${JSON.stringify(el.dataset)}`;

const controls = (inModal: boolean, key: string) =>
  Array.from(root.querySelectorAll<HTMLElement>('a,button,input,select,[tabindex]'))
    .filter(e => !!e.closest('dialog') === inModal && controlKey(e) === key);

function pageView(): string {
  switch (page()) {
    case 'match': return matchPage();
    case 'bets': return betsPage();
    case 'football': return footballPage();
    case 'live': return livePage();
    default: return homePage();
  }
}

function title(): string {
  switch (page()) {
    case 'match': return `${currentFixture().home} v ${currentFixture().away}`;
    case 'bets': return 'Bet slip & My bets';
    case 'football': return 'Soccer';
    case 'live': return 'Live';
    default: return 'Sports';
  }
}

export function render() {
  const active = document.activeElement instanceof HTMLElement && document.activeElement !== root && root.contains(document.activeElement)
    ? document.activeElement
    : null;
  const where = active ? { key: controlKey(active), inModal: !!active.closest('dialog'), index: 0 } : undefined;
  if (where && active) where.index = Math.max(0, controls(where.inModal, where.key).indexOf(active));
  const input = active instanceof HTMLInputElement ? active : null;
  const selection = input ? [input.selectionStart, input.selectionEnd] : null;
  const oldModal = document.querySelector('dialog');
  const scrollers = Array.from(document.querySelectorAll<HTMLElement>('dialog, dialog .slip-body, .side-panel .slip-body, .side-panel .panel-body')).map(el => el.scrollTop);
  if (!oldModal && ui.dialog && where && !where.inModal) opener = where;
  const closing = !!oldModal && !ui.dialog;
  oldModal?.close();

  const p = page();
  const withPanel = p !== 'bets' && !ui.panelHidden;
  root.className = `app page-${p} ${withPanel ? 'with-panel' : 'no-panel'} ${ui.railExpanded ? 'rail-open' : ''}`;
  root.innerHTML = `${topbar()}${iconRail()}
    <main id="main" tabindex="-1">
      <div class="main-head">${searchBar()}${sportTabs()}${p === 'home' && !ui.query && ui.sport === 'All' ? favouriteChips() : ''}</div>
      <div class="page">${pageView()}</div>
      ${footer()}
    </main>
    ${withPanel ? sidePanel() : ''}
    ${p === 'bets' ? '' : mobileSlipBar()}
    ${bottomNav()}
    ${dialog()}
    ${ui.toast ? `<div class="toast" role="status">${icon('check')}${esc(ui.toast)}</div>` : ''}`;

  const modal = document.querySelector<HTMLDialogElement>('dialog');
  if (modal) {
    modal.showModal();
    modal.addEventListener('cancel', e => {
      e.preventDefault();
      onDialogCancel();
    });
  }
  document.querySelectorAll<HTMLElement>('dialog, dialog .slip-body, .side-panel .slip-body, .side-panel .panel-body').forEach((el, i) => {
    el.scrollTop = scrollers[i] ?? 0;
  });

  const find = (inModal: boolean, w: { key: string; index: number }) => {
    const list = controls(inModal, w.key);
    return list[w.index] ?? list[0];
  };
  let target: HTMLElement | undefined;
  if (modal && where?.inModal) target = find(true, where);
  else if (!modal && where && !where.inModal) target = find(false, where);
  else if (!modal && closing) target = (opener && find(false, opener)) ?? document.querySelector<HTMLElement>('#page-title') ?? undefined;
  if (closing) opener = undefined;
  if (target) {
    target.focus({ preventScroll: true });
    if (selection && target instanceof HTMLInputElement && selection[0] !== null) {
      try {
        target.setSelectionRange(selection[0], selection[1] ?? selection[0]);
      } catch {
        /* Some input types do not support selection ranges. */
      }
    }
  }
  document.title = `${title()} · Housebets`;
  save();
  updateCompactScore();
}

/** Patch one odds button in place: replacing it mid-press would drop the player's tap. */
export function refreshOutcome(key: string) {
  const [fid, mid, oid] = key.split(':');
  const f = state().fixtures.find(x => x.id === fid);
  const m = f?.markets.find(x => x.id === mid);
  const o = m?.outcomes.find(x => x.id === oid);
  if (!f || !m || !o) return;
  root.querySelectorAll<HTMLButtonElement>(`.odds[data-fixture="${fid}"][data-market="${mid}"][data-outcome="${oid}"]`).forEach(button => {
    const size = button.classList.contains('row') ? 'row' : button.classList.contains('cell') ? 'cell' : 'full';
    const index = m.outcomes.indexOf(o);
    const template = document.createElement('template');
    template.innerHTML = oddsButton(f, m, o, size, index);
    const next = template.content.firstElementChild as HTMLButtonElement;
    for (const name of button.getAttributeNames()) if (!next.hasAttribute(name)) button.removeAttribute(name);
    for (const name of next.getAttributeNames()) if (button.getAttribute(name) !== next.getAttribute(name)) button.setAttribute(name, next.getAttribute(name)!);
    if (button.innerHTML !== next.innerHTML) button.innerHTML = next.innerHTML;
  });
}

/** Show the compact score bar once the full scoreboard has scrolled under the top bar. */
export function updateCompactScore() {
  const board = root.querySelector<HTMLElement>('.scoreboard');
  const bar = root.querySelector<HTMLElement>('.topbar');
  const show = !!board && !!bar && board.getBoundingClientRect().bottom < bar.getBoundingClientRect().bottom + 8;
  root.classList.toggle('show-compact', show);
}
