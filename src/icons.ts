import logoRaw from '../brand/logo.svg?raw';
import markRaw from '../brand/mark.svg?raw';

const brandSvg = (raw: string, cls: string) => raw.replace('<svg ', `<svg class="${cls}" focusable="false" aria-hidden="true" `);

/** Official Housebets wordmark from the brand pack (`brand/logo.svg`). */
export const brandLogo = () => `<span class="brand-logo">${brandSvg(logoRaw, 'logo-svg')}</span>`;

/** Official Housebets mark from the brand pack (`brand/mark.svg`), used at small sizes. */
export const brandMark = () => `<span class="brand-logo is-mark">${brandSvg(markRaw, 'mark-svg')}</span>`;

/** Original line icons drawn for this prototype on a 24px grid. */
const paths: Record<string, string> = {
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  chat: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  casino: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3.5 4.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01',
  plus: 'M12 5v14M5 12h14',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.5v9M9.5 9.5c0-1 1-1.6 2.5-1.6s2.5.7 2.5 1.7-1 1.4-2.5 1.4-2.5.5-2.5 1.5 1 1.6 2.5 1.6 2.5-.6 2.5-1.6',
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z',
  live: 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.2 8.2a5.4 5.4 0 0 0 0 7.6m7.6 0a5.4 5.4 0 0 0 0-7.6M5.4 5.4a9.3 9.3 0 0 0 0 13.2m13.2 0a9.3 9.3 0 0 0 0-13.2',
  ball: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13 3.8 2.8-1.5 4.4H9.7l-1.5-4.4L12 8Zm0 0V3.5m3.8 7.3 4.6-1.6m-6.1 6 2.6 3.9m-7.2-3.9-2.6 3.9m1.1-8.3-4.6-1.6',
  star: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4',
  ticket: 'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7Zm10-1v12',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  back: 'M19 12H5m5-5-5 5 5 5',
  chevron: 'm9 6 6 6-6 6',
  left: 'm15 6-6 6 6 6',
  down: 'm6 9 6 6 6-6',
  up: 'm6 15 6-6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12.5 4.2 4.2L19 7',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  wallet: 'M4 7a2 2 0 0 1 2-2h11v4M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2Zm12 7h.01',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H5a3 3 0 0 0 3 4m8-4h3a3 3 0 0 1-3 4m-4 3v4m-3 3h6m-5-3h4',
  crown: 'm4 8 4 4 4-6 4 6 4-4-1.5 10h-13L4 8Zm1.5 12h13',
  tennis: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM5.6 5.6a9 9 0 0 1 0 12.8m12.8-12.8a9 9 0 0 0 0 12.8',
  basket: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3v18M5.6 5.6c3 2.4 3 10.4 0 12.8m12.8-12.8c-3 2.4-3 10.4 0 12.8',
  baseball: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM7 4.5c2 2 2.8 4.5 2.8 7.5S9 17.5 7 19.5m10-15c-2 2-2.8 4.5-2.8 7.5s.8 5.5 2.8 7.5',
  amfootball: 'M5 19c-1.5-5 2-12.5 9-14 2.5-.5 4.5 0 5 .5s1 2.5.5 5c-1.5 7-9 10.5-14 9 0 0-.5-.5-.5-.5Zm4-4 6-6m-4.5 1.5 2 2m-.5-3.5 2 2m-5 1 2 2',
  game: 'M7 9h10a4 4 0 0 1 3.9 4.9l-.6 2.6a2 2 0 0 1-3.4.9L14.5 15h-5l-2.4 2.4a2 2 0 0 1-3.4-.9l-.6-2.6A4 4 0 0 1 7 9Zm1 2.5v3m-1.5-1.5h3m6 0h.01m1.99-1.5h.01',
  settings: 'M4 7h10m4 0h2M4 17h4m4 0h8M16 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v5m0-8h.01',
  refresh: 'M20 11a8 8 0 0 0-14.7-4.4L4 8m0-4v4h4m-4 5a8 8 0 0 0 14.7 4.4L20 16m0 4v-4h-4',
  shield: 'M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z',
  panel: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm11 0v14',
  rail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm5 0v14',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  collapse: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  send: 'M4 12 20 4l-6 16-3-7-7-1Z',
};

export const icon = (name: string, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] ?? paths.ball}"/></svg>`;

export const sportIcon = (sport: string) =>
  ({ Football: 'ball', Tennis: 'tennis', Basketball: 'basket', Baseball: 'baseball', 'American Football': 'amfootball', Esports: 'game' })[sport] ?? 'ball';
