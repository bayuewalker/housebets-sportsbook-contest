import { icon } from '../../icons';
import { esc } from '../format';
import { openBets, state, ui, type PanelTab } from '../state';
import { panelBets } from './mybets';
import { slip, type SlipScope } from './slip';

/** Invented handles and messages; the chat is a static, read-only preview. */
const messages: Array<[string, string, string]> = [
  ['tidewalker', '#5fd1c9', 'Marlow nearly had a second there'],
  ['northbank_88', '#e3a35c', 'Corners line on ARS v BHA keeps moving'],
  ['quietpunter', '#9a8cf0', 'Halden v Drescher later, anyone watching?'],
  ['lowblock', '#ef7f8f', 'Half-time at Stamford, 1–1 and level on chances'],
  ['setpiece_sam', '#7cc7f2', 'Celtics pulling away in Q3'],
  ['tidewalker', '#5fd1c9', 'Villa v West Ham suspended, VAR check?'],
];

export function chatView(): string {
  return `<div class="chat">
    <p class="chat-note">${icon('info')}Chat preview. Messages are sample text and nothing is sent.</p>
    <ol class="chat-list">
      ${messages.map(([who, color, text]) => `<li><span class="chat-avatar" style="--c:${color}" aria-hidden="true">${esc(who[0].toUpperCase())}</span><span><b style="color:${color}">${esc(who)}</b>${esc(text)}</span></li>`).join('')}
    </ol>
    <form class="chat-form" aria-label="Send a message (disabled)">
      <input type="text" placeholder="Chat is read-only in this prototype" aria-label="Message" disabled>
      <button class="icon-btn" type="button" disabled aria-label="Send">${icon('send')}</button>
    </form>
  </div>`;
}

export function panelTabs(scope: 'panel' | 'sheet'): string {
  const n = state().selections.length;
  const tab = (id: PanelTab, label: string, count?: number) =>
    `<button role="tab" id="${scope}-tab-${id}" data-focus="${scope}-tab-${id}" aria-controls="${scope}-tabpanel" aria-selected="${ui.panelTab === id}"
      tabindex="${ui.panelTab === id ? 0 : -1}" class="${ui.panelTab === id ? 'active' : ''}" data-action="panel-tab" data-tab="${id}">
      ${label}${count ? ` <b>${count}</b>` : ''}
    </button>`;
  return `<div class="panel-tabs" role="tablist" aria-label="Side panel">
    ${tab('slip', 'Bet slip', n)}${tab('bets', 'My bets', openBets().length)}${tab('chat', 'Chat')}
  </div>`;
}

export function panelContent(scope: 'panel' | 'sheet'): string {
  const body = ui.panelTab === 'bets' ? panelBets() : ui.panelTab === 'chat' ? chatView() : slip(scope as SlipScope);
  return `<div class="panel-body" id="${scope}-tabpanel" role="tabpanel" aria-labelledby="${scope}-tab-${ui.panelTab}">${body}</div>`;
}

export function sidePanel(): string {
  return `<aside class="side-panel" aria-label="Bet slip, My bets and Chat">
    ${panelTabs('panel')}
    ${panelContent('panel')}
  </aside>`;
}
