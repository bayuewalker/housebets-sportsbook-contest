// Browser regression for the built prototype at the contest's two required widths.
// Usage: pnpm build && pnpm qa:browser   (QA_URL to target a deployed site, QA_SCREENSHOTS=dir to capture images)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';

const shots = process.env.QA_SCREENSHOTS;
const chrome = process.env.CHROME_PATH ?? ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
let server;
let base = process.env.QA_URL;
if (!base) {
  server = spawn(process.execPath, ['scripts/preview.mjs', '--port', '4179'], { stdio: 'ignore' });
  base = 'http://127.0.0.1:4179/';
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) break; } catch { /* Server is still starting. */ } await new Promise(r => setTimeout(r, 100)); }
}
if (shots) mkdirSync(shots, { recursive: true });

const results = [];
const check = (tag, name, ok, detail = '') => { results.push({ tag, name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}] ${name}${detail ? ` — ${detail}` : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch(chrome ? { executablePath: chrome, args: ['--no-sandbox'] } : { channel: 'chrome' });
try {
  for (const [width, height, tag] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
    const mobile = tag === 'mobile';
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${tag}-${name}.jpg`, quality: 86 }); };
    // Navigate the way a player does (links reset page filters); fall back to the URL when no link is on screen.
    const visit = async hash => {
      const link = page.locator(`a[href="#${hash}"]:visible`).first();
      if (page.url().startsWith(base) && await link.count()) await link.click(); else await page.goto(`${base}#${hash}`);
      await page.waitForSelector('#page-title', { state: 'attached' }); await sleep(250);
    };
    const balance = () => page.locator('.wallet strong').innerText();
    const openDemo = async () => { await page.locator(mobile ? '.mobile-demo' : '.demo-trigger').click(); await page.waitForSelector('dialog[open]'); };
    const demo = async action => { await openDemo(); await page.locator(`dialog [data-action="${action}"]`).click(); await sleep(150); };
    const openSlip = async () => { if (mobile && !(await page.locator('dialog.slip-modal').count())) { await page.locator('.mobile-slip-bar button').click(); await page.waitForSelector('dialog.slip-modal'); } return page.locator(mobile ? 'dialog.slip-modal' : '.right-rail'); };
    const closeDialog = async () => { if (await page.locator('dialog[open]').count()) { await page.keyboard.press('Escape'); await sleep(120); } };
    const layout = () => page.evaluate(() => {
      const de = document.documentElement;
      const tiny = [...document.querySelectorAll('body *')].filter(el => {
        if (el.closest('[aria-hidden="true"],.sr-only,svg') || !el.checkVisibility?.()) return false;
        const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        return own && parseFloat(getComputedStyle(el).fontSize) < 11;
      }).map(el => `${el.className || el.tagName}:${getComputedStyle(el).fontSize}`);
      const box = s => document.querySelector(s)?.getBoundingClientRect();
      const bar = box('.mobile-slip-bar'), nav = box('.bottom-nav');
      const smallTargets = [...document.querySelectorAll('main button, main a, .bottom-nav > *, .mobile-slip-bar button, .topbar button, .topbar a')].filter(el => el.checkVisibility?.()).map(el => el.getBoundingClientRect()).filter(r => r.width && (r.height < 24 || r.width < 24)).length;
      return { overflow: de.scrollWidth - de.clientWidth, tiny: [...new Set(tiny)], overlap: bar && nav && nav.height ? Math.max(0, bar.bottom - nav.top) : 0, smallTargets };
    });

    await page.goto(base);
    await page.evaluate(() => localStorage.clear());

    for (const [hash, name] of [['/sports', 'sports-home'], ['/live', 'live'], ['/football', 'football'], ['/match/ars-bha', 'match-center'], ['/bets', 'betslip-my-bets']]) {
      await visit(hash);
      const l = await layout();
      check(tag, `${name}: no horizontal overflow`, l.overflow <= 0, `${l.overflow}px`);
      check(tag, `${name}: no text under 11px`, !l.tiny.length, l.tiny.join(', '));
      check(tag, `${name}: interactive targets at least 24px`, !l.smallTargets, `${l.smallTargets} small`);
      if (mobile) check(tag, `${name}: betslip bar sits above bottom navigation`, l.overlap <= 0.5, `${l.overlap}px overlap`);
      await shot(name);
    }

    // Sports home: sports, search and following
    await visit('/sports');
    for (const [sport, rows] of [['Football', 6], ['Tennis', 1], ['Basketball', 1], ['Esports', 1], ['All sports', 9]]) {
      await page.locator(`.sport-tab[data-sport="${sport}"]`).click();
      check(tag, `sport filter ${sport} shows ${rows} fixtures`, await page.locator('.fixture-row').count() === rows);
    }
    await page.locator('#global-search').fill('Bukayo');
    check(tag, 'player search finds Arsenal with reason', (await page.locator('.fixture-row').count()) === 1 && /Player · Bukayo Saka/.test(await page.locator('.match-reason').innerText()));
    for (const [term, reason] of [['Brighton', 'Team'], ['LaLiga', 'Competition'], ['corners', 'Market']]) {
      await page.locator('#global-search').fill(term);
      check(tag, `search "${term}" explains ${reason} match`, (await page.locator('.match-reason').first().innerText()).startsWith(reason));
    }
    await page.locator('#global-search').fill('zzz');
    check(tag, 'empty search shows guidance', await page.locator('.empty-state h3', { hasText: 'No matches found' }).count() === 1);
    await shot('search-empty');
    await page.locator('.clear-search').click();
    check(tag, 'clear search restores home and keeps focus in search', (await page.locator('#global-search').inputValue()) === '' && await page.locator('.hero').count() === 1 && await page.evaluate(() => document.activeElement?.id === 'global-search'));
    await page.locator('#global-search').fill('Arsenal');
    await page.keyboard.press('Escape');
    check(tag, 'Escape clears search', (await page.locator('#global-search').inputValue()) === '');
    await page.locator('.group-heading [data-key="league:LaLiga"]').click();
    check(tag, 'follow competition toggles state', await page.locator('.group-heading [data-key="league:LaLiga"]').getAttribute('aria-pressed') === 'true');
    await page.locator('.filter-follow').click();
    check(tag, 'Following filter shows followed teams and competitions', await page.locator('.fixture-row').count() === 3);
    await page.locator('.group-heading [data-key="league:LaLiga"]').click();
    check(tag, 'unfollow removes competition from Following', await page.locator('.fixture-row').count() === 2);

    // Live
    await visit('/live');
    check(tag, 'Live lists every in-play fixture with a clock', await page.locator('.fixture-row.is-live').count() === 4 && await page.locator('.fixture-row .fixture-clock').count() === 4);
    await page.locator('.sport-tab[data-sport="Football"]').click();
    check(tag, 'Live sport filter', await page.locator('.fixture-row').count() === 2);
    await page.locator('#competition-filter').selectOption('LaLiga');
    check(tag, 'Live competition filter', await page.locator('.fixture-row').count() === 1);

    // Football
    await visit('/football');
    for (const [league, rows] of [['Premier League', 2], ['Champions League', 1], ['LaLiga', 1], ['Serie A', 1], ['Bundesliga', 1]]) {
      await page.locator(`.league-tabs [data-league="${league}"]`).click();
      check(tag, `Football ${league} tab shows ${rows} fixtures with match-result odds`, await page.locator('.fixture-row').count() === rows && await page.locator('.fixture-row .odds').count() === rows * 3);
      await page.locator(`.league-tabs [data-league="${league}"]`).click();
    }

    // Match Center
    await visit('/match/ars-bha');
    check(tag, 'Match Center keeps Football active in navigation', await page.locator('.nav-link[href="#/football"].active, .page-tabs a[href="#/football"].active').count() >= 1);
    const clockBefore = await page.locator('.scoreboard-top .fixture-clock').innerText();
    await sleep(1200);
    check(tag, 'Match clock advances', clockBefore !== await page.locator('.scoreboard-top .fixture-clock').innerText());
    for (const category of ['Popular', 'Goals', 'Halves', 'Handicaps', 'Goalscorers', 'Corners & Cards']) {
      await page.locator(`.market-tabs [data-category="${category}"]`).click();
      check(tag, `market category ${category}`, await page.locator('.market-group').count() >= 2);
    }
    check(tag, 'pre-suspended cards market is locked', await page.locator('.market-paused .odds:disabled').count() === 2);
    await page.locator('.market-tabs [data-category="Popular"]').click();
    await page.locator('.match-tabs-sticky').evaluate(el => { el.scrollIntoView(); window.scrollBy(0, 240); });
    await sleep(100);
    const sticky = await page.locator('.match-tabs-sticky').evaluate(el => ({ top: el.getBoundingClientRect().top, position: getComputedStyle(el).position, viewport: innerHeight }));
    check(tag, 'market categories stay visible while scrolling', sticky.position === 'sticky' && sticky.top >= (mobile ? 57 : 63) && sticky.top < sticky.viewport, `${sticky.top}px`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(7600);
    check(tag, 'live price feed moves odds', await page.locator('.odds.up, .odds.down').count() >= 1);
    await demo('feed');

    // Selection, stake and returns
    await page.locator('.market-group').first().locator('.odds').first().click();
    check(tag, 'tapping odds selects it', await page.locator('.market-group .odds.selected').count() === 1);
    if (mobile) check(tag, 'mobile bar counts the pick', /1/.test(await page.locator('.bar-ticket b').innerText()));
    let slip = await openSlip();
    const pickOdds = async () => Number(await slip.locator('.pick-name b').innerText());
    const returned = async () => (await slip.locator('.selection-return strong').innerText()).replace(/[^\d.]/g, '');
    await slip.locator('[data-stake]').fill('25');
    const price = await pickOdds();
    check(tag, `25 × ${price.toFixed(2)} decimal return`, await returned() === (25 * price).toFixed(2), await returned());
    await slip.locator('.quick-stakes [data-value="50"]').click();
    check(tag, `quick stake 50 × ${price.toFixed(2)} return`, await returned() === (50 * price).toFixed(2), await returned());
    await slip.locator('[data-stake]').fill('0.5');
    check(tag, 'invalid stake blocks placement', await slip.locator('.input-error').count() === 1 && await slip.locator('.place-button').isDisabled());
    await slip.locator('[data-stake]').fill('25');
    check(tag, 'stake input keeps focus while editing', await page.evaluate(() => document.activeElement?.hasAttribute('data-stake')));
    if (mobile) check(tag, 'stake input is 16px or larger (no iOS zoom)', parseFloat(await slip.locator('[data-stake]').evaluate(e => getComputedStyle(e).fontSize)) >= 16);
    await shot('betslip-stake');
    await closeDialog();

    // Changed odds
    await demo('move');
    slip = await openSlip();
    check(tag, 'changed odds alert blocks placement', await slip.locator('.slip-alert.warning').count() === 1 && await slip.locator('.place-button').isDisabled());
    const changedLabel = slip.locator('.pick-name .changed-price small', { hasText: 'new' });
    const removeBox = await slip.locator('.remove-selection').boundingBox();
    check(tag, 'changed odds card labels the live price as new', await changedLabel.count() === 1 && parseFloat(await changedLabel.evaluate(el => getComputedStyle(el).fontSize)) >= 11 && !!removeBox && removeBox.width >= 40 && removeBox.height >= 40);
    check(tag, 'changed odds preview the return after acceptance', await slip.locator('.selection-return.review-return', { hasText: 'Return after acceptance' }).count() === 1 && await slip.locator('.summary-line.review-return', { hasText: 'Return after acceptance' }).count() === 1);
    await shot('state-odds-changed');
    await slip.locator('[data-action="accept"]').click();
    const moved = await pickOdds();
    check(tag, `accepting new odds (${price.toFixed(2)} → ${moved.toFixed(2)}) updates return`, moved > price && await returned() === (25 * moved).toFixed(2) && !(await slip.locator('.place-button').isDisabled()));
    await closeDialog();

    // Suspension
    await demo('suspend');
    slip = await openSlip();
    check(tag, 'suspended selection kept and placement paused', await slip.locator('.selection-card.selection-suspended').count() === 1 && await slip.locator('.place-button').isDisabled());
    await shot('state-suspended');
    await closeDialog();
    check(tag, 'suspended market odds disabled on Match Center', await page.locator('.market-group').first().locator('.odds:disabled').count() === 3);
    await demo('suspend');
    slip = await openSlip();
    check(tag, 'reopened market allows placement', !(await slip.locator('.place-button').isDisabled()));
    await closeDialog();

    // Failure, retry and receipt
    const before = await balance();
    await demo('fail');
    check(tag, 'arming failure closes the scenario dialog', await page.locator('dialog[open]').count() === 0);
    slip = await openSlip();
    await slip.locator('.place-button').click();
    await slip.locator('.notice.error').waitFor();
    check(tag, 'failed placement leaves balance unchanged', before === await balance() && await slip.locator('.selection-card').count() === 1);
    await shot('state-failed');
    await slip.locator('.notice .retry').click();
    await slip.locator('.notice.success').waitFor();
    check(tag, 'retry succeeds once and debits 25 USDT', (await balance()) === '975.00' && await slip.locator('.receipt li').count() === 1);
    const receiptReturn = await slip.locator('.receipt li small').last().textContent();
    await shot('state-placed');
    await slip.locator('[data-action="view-open"]').click();
    await page.waitForSelector('.history');
    check(tag, 'My Bets shows exactly one new open bet', await page.locator('#history-panel .bet-card').count() === 2);

    // My Bets: history keyboard, cash out, settle
    await page.locator('#history-Open').focus();
    await page.keyboard.press('ArrowRight');
    check(tag, 'history tabs support arrow keys', await page.evaluate(() => document.activeElement?.id === 'history-Settled'));
    check(tag, 'Settled history includes a realistic lost single', await page.locator('#history-panel .bet-status.lost').count() === 1);
    await page.locator('#history-Cash-Out').click();
    check(tag, 'Cash Out is a distinct offer view', await page.locator('#history-panel.cashout-panel .cashout-card .bet-status', { hasText: 'Cash out available' }).count() >= 1 && await page.locator('#history-panel .bet-values', { hasText: 'Offer' }).count() >= 1);
    await page.locator('#history-panel .cash-button').first().click();
    await page.waitForSelector('dialog[open]');
    await shot('cash-out-confirm');
    await page.locator('dialog [data-action="confirm-cash"]').click();
    check(tag, 'cash out credits 23.00 once and moves to Settled', (await balance()) === '998.00' && await page.locator('#history-panel .bet-status.cashed').count() === 1);
    await demo('settle');
    check(tag, 'settlement credits the open bet', (await balance()) === '1,045.50' && await page.locator('#history-panel .bet-status.won').count() === 2);
    const receipt = page.locator('main .receipt li small').last();
    check(tag, 'placement receipt is unchanged by later cash out', !await receipt.count() || await receipt.textContent() === receiptReturn);
    await shot('my-bets-settled');
    await page.reload();
    await page.waitForSelector('#page-title', { state: 'attached' });
    check(tag, 'refresh keeps balance and history', (await balance()) === '1,045.50');

    // Dialog focus handling
    await page.locator(mobile ? '.mobile-demo' : '.demo-trigger').focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('dialog[open]');
    check(tag, 'dialog moves focus inside', await page.evaluate(() => !!document.activeElement?.closest('dialog')));
    await shot('demo-controls');
    await page.keyboard.press('Escape');
    await sleep(100);
    check(tag, 'Escape closes dialog and returns focus to opener', await page.locator('dialog[open]').count() === 0 && await page.evaluate(m => document.activeElement?.matches(m ? '.mobile-demo' : '.demo-trigger'), mobile));

    // Keyboard focus survives re-render
    await visit('/match/ars-bha');
    const firstOdds = page.locator('.market-group .odds').nth(1);
    await firstOdds.focus();
    await page.keyboard.press('Enter');
    check(tag, 'keyboard focus stays on toggled odds', await page.evaluate(() => document.activeElement?.matches('.market-group .odds.selected')));
    await page.keyboard.press('Enter');

    // No live, loading and reset
    await demo('no-live');
    check(tag, 'no live shows Starting soon fallback', await page.locator('.fallback-note').count() === 1 && /Starting soon/.test(await page.locator('.section-heading h2').first().innerText()));
    await shot('state-no-live');
    await demo('no-live');
    await demo('loading');
    check(tag, 'loading skeleton appears', await page.locator('.loading-state .skeleton-row').count() === 4);
    await shot('state-loading');
    await sleep(2300);
    check(tag, 'loading resolves to fixtures', await page.locator('.loading-state').count() === 0 && await page.locator('.fixture-row').count() > 0);
    await openDemo();
    await page.locator('dialog [data-action="reset-confirm"]').click();
    await page.locator('dialog [data-action="reset"]').click();
    check(tag, 'reset restores 1,000 USDT', (await balance()) === '1,000.00');

    // Shell destinations stay non-transactional
    if (mobile) {
      await page.locator('.bottom-nav [data-action="menu"]').click();
      check(tag, 'Menu opens navigation drawer', await page.locator('dialog.menu-modal .drawer-nav').count() === 1);
      await shot('menu');
      await page.locator('dialog.menu-modal .drawer-nav a[href="#/football"]').click();
      await sleep(200);
      check(tag, 'drawer link navigates and closes', await page.locator('dialog[open]').count() === 0 && /#\/football/.test(page.url()));
      for (const panel of ['Casino', 'Chat']) {
        await page.locator(`.bottom-nav [data-panel="${panel}"]`).click();
        check(tag, `${panel} explains it is outside the prototype`, /Outside this prototype/i.test(await page.locator('dialog .eyebrow').innerText()));
        await page.locator('dialog [data-action="close"].button').click();
      }
      await page.locator('.bottom-nav [data-action="search"]').click();
      check(tag, 'Search focuses the search field', await page.evaluate(() => document.activeElement?.id === 'global-search'));
      await page.locator('.bottom-nav a[href="#/sports"]').click();
      await sleep(200);
      check(tag, 'Sports returns to Sports Home', /#\/sports/.test(page.url()));
    } else {
      await page.locator('.product-switch [data-panel="Casino"]').click();
      check(tag, 'Casino switch is informational only', /Outside this prototype/i.test(await page.locator('dialog .eyebrow').innerText()));
      await closeDialog();
      await page.locator('.topbar .avatar').click();
      check(tag, 'profile panel shows simulated account', /Guest player/.test(await page.locator('dialog h2').innerText()));
      await shot('profile');
      await closeDialog();
      await page.locator('.deposit').click();
      check(tag, 'Deposit opens the demo wallet without transacting', /switched off/.test(await page.locator('dialog').innerText()) && (await balance()) === '1,000.00');
      await closeDialog();
    }

    check(tag, 'no runtime errors', !errors.length, errors.join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed.`);
if (failed.length) process.exitCode = 1;
