// Browser regression for the built prototype at the contest's two required widths (1440px and 390px).
// Usage: pnpm build && pnpm qa:browser   (QA_URL targets a deployed site; QA_SCREENSHOTS=dir captures images)
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
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* Server is still starting. */ }
    await new Promise(r => setTimeout(r, 100));
  }
}
if (shots) mkdirSync(shots, { recursive: true });

const results = [];
const check = (tag, name, ok, detail = '') => {
  results.push({ tag, name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}] ${name}${detail && !ok ? ` — ${String(detail).replace(/\s+/g, ' ')}` : ''}`);
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const number = text => Number(String(text).replace(/[^0-9.]/g, ''));

const browser = await chromium.launch(chrome ? { executablePath: chrome, args: ['--no-sandbox'] } : { channel: 'chrome' });
try {
  for (const [width, height, tag] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
    const mobile = tag === 'mobile';
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${tag}-${name}.jpg`, quality: 86 }); };
    const tap = async selector => { const el = page.locator(selector).first(); if (mobile) await el.tap(); else await el.click(); await sleep(80); };
    const visit = async hash => { await page.goto(`${base}#${hash}`); await page.waitForSelector('#page-title', { state: 'attached' }); await sleep(250); };
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const balance = async () => number(await page.locator('.wallet-pill b').innerText());
    const scope = mobile ? 'dialog' : '.side-panel';
    const slip = () => page.locator(`${scope} .slip`);
    const openSlip = async () => {
      if (mobile && !(await page.locator('dialog.sheet').count())) { await tap('.slip-bar button'); await page.waitForSelector('dialog.sheet'); }
      if (await page.locator(`${mobile ? 'dialog' : '.side-panel'} [data-action="panel-tab"][data-tab="slip"][aria-selected="false"]`).count()) await tap(`${mobile ? 'dialog' : '.side-panel'} [data-action="panel-tab"][data-tab="slip"]`);
      return slip();
    };
    const closeSheet = async () => { if (await page.locator('dialog[open]').count()) { await tap('dialog [data-action="close"]'); await sleep(100); } };
    const demo = async action => {
      await closeSheet();
      if (mobile) { await tap('[data-action="menu"]'); await tap('dialog [data-action="demo"]'); } else await tap('.rail [data-action="demo"]');
      await page.waitForSelector('dialog[open] .demo-grid');
      await tap(`dialog [data-action="${action}"]`);
      await sleep(150);
    };

    await page.goto(base);
    await page.evaluate(() => localStorage.clear());

    // Home
    await visit('/sports');
    const body = await page.locator('body').innerText();
    check(tag, 'Housebets wordmark, no HOUSE//LIVE branding', /Housebets/.test(await page.locator('.topbar .wordmark').innerText()) && !/HOUSE\/\/LIVE/.test(body));
    check(tag, 'marketing copy removed', !/Welcome to your house|The game\. The moment|Follow the badge|A considered bet starts/i.test(body));
    check(tag, 'brand fonts Figtree and Red Hat Display load', await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('16px "Figtree Variable"') && document.fonts.check('16px "Red Hat Display Variable"')
        && getComputedStyle(document.body).fontFamily.includes('Figtree');
    }));
    check(tag, 'top bar has VIP crown and wallet', await page.locator('.topbar .vip').isVisible() && await page.locator('.wallet-pill').isVisible());
    if (!mobile) {
      check(tag, 'top bar shows the Weekly Prize widget', /Weekly Prize/.test(await page.locator('.prize').innerText()));
      check(tag, 'slim left icon rail with Live count', await page.locator('.rail').isVisible() && (await page.locator('.rail .rail-count.live').innerText()) === '13');
      check(tag, 'right panel tabs: Bet slip | My bets | Chat', (await page.locator('.side-panel [role="tab"]').allInnerTexts()).map(t => t.replace(/\d+/g, '').trim()).join('|') === 'Bet slip|My bets|Chat');
    } else {
      check(tag, 'bottom navigation and slip bar visible', await page.locator('.bottom-nav').isVisible() && await page.locator('.slip-bar').isVisible());
    }
    check(tag, 'sport tabs under search start Home, Live 13, Soccer', /^Home\s*Live\s*13\s*Soccer/.test((await page.locator('.sport-tabs').innerText()).replace(/\n/g, ' ')));
    check(tag, 'favourites chips listed', await page.locator('.fav-chips .chip').count() === 3);
    const sections = await page.locator('.home-section .section-head h2').allInnerTexts();
    check(tag, 'dense home: Your matches, Featured, Live now, Starting soon', ['Your matches', 'Featured', 'Live now', 'Starting soon'].every((s, i) => sections[i]?.includes(s)), sections.join(' / '));
    check(tag, 'Live now "View all 13" is accurate', (await page.locator('a.view-all[href="#/live"]').innerText()).includes('View all 13'));
    const moreLabel = await page.locator('.event-row .more').first().getAttribute('aria-label');
    const moreCount = Number(moreLabel.match(/View all (\d+) markets/)?.[1]);
    await page.locator('.event-row .more').first().click();
    await page.waitForSelector('.market-tabs');
    check(tag, '"+N markets" matches the match page total', moreCount === number(await page.locator('.market-tabs [data-category="All"] b').innerText()), `${moreCount}`);
    await visit('/sports');
    check(tag, 'times use the viewer time zone, not UTC', !/Times shown in UTC/.test(await page.locator('main').innerText()) && /Times in your time zone/.test(await page.locator('.site-footer').innerText()));
    check(tag, 'home has no horizontal overflow', await overflow() <= 0);
    await shot('home');

    // Live
    await visit('/live');
    check(tag, 'live page lists 13 events across sports', await page.locator('.event-row.is-live').count() === 13);
    check(tag, 'six live football matches', await page.locator('.sport-block').first().locator('.event-row').count() === 6);
    check(tag, 'half-time status and an inline suspended row', await page.locator('.live-badge.is-ht').count() >= 1 && await page.locator('.event-row.is-suspended .tag.suspended').count() >= 1);
    check(tag, 'league headers carry country flags', await page.locator('.league-head svg.flag').count() === await page.locator('.league-head').count());
    await tap('[data-action="live-sport"][data-sport="Tennis"]');
    check(tag, 'live sport filter narrows to tennis', await page.locator('.event-row').count() === 2);
    check(tag, 'live page has no horizontal overflow', await overflow() <= 0);
    await tap('[data-action="live-sport"][data-sport="All"]');
    await shot('live');

    // Soccer
    await visit('/football');
    const scoped = await page.locator('.event-row').count();
    await tap('[data-action="football-scope"][data-scope="all"]');
    const all = await page.locator('.event-row').count();
    check(tag, 'Live & Upcoming / All toggle changes the list', all === 29 && scoped < all, `${scoped} → ${all}`);
    const perLeague = await page.locator('.league').evaluateAll(groups => groups.map(g => g.querySelectorAll('.event-row').length));
    check(tag, 'five leagues with 3–10 matches each', perLeague.length === 5 && perLeague.every(n => n >= 3 && n <= 10), perLeague.join(','));
    await page.selectOption('#football-market', 'goals');
    check(tag, 'market dropdown switches rows to Over/Under', /^O \d/.test(await page.locator('.event-row .odds-label').first().innerText()));
    await page.selectOption('#football-market', 'btts');
    check(tag, 'market dropdown switches rows to BTTS', (await page.locator('.event-row .odds-label').first().innerText()) === 'Yes');
    await page.selectOption('#football-market', 'result');
    await tap('[data-action="league-filter"][data-league="LaLiga"]');
    check(tag, 'league chip filters to LaLiga', await page.locator('.league').count() === 1 && /LaLiga/.test(await page.locator('.league-head').innerText()));
    await tap('[data-action="league-filter"][data-league=""]');
    await tap('[data-action="football-scope"][data-scope="upcoming"]');
    check(tag, 'soccer page has no horizontal overflow', await overflow() <= 0);
    await shot('football');

    // Match page
    await visit('/match/ars-bha');
    check(tag, 'breadcrumb Soccer › England › Premier League › ARS–BHA', /Soccer\s*England\s*Premier League\s*ARS–BHA/.test((await page.locator('.crumbs').innerText()).replace(/\n/g, ' ')));
    const total = number(await page.locator('.market-tabs [data-category="All"] b').innerText());
    check(tag, 'match page offers 40–85 markets', total >= 40 && total <= 85, String(total));
    check(tag, 'some markets are suspended', await page.locator('.market.is-suspended').count() >= 1);
    check(tag, 'goalscorer table lists fictional squad with Next / Anytime / 2+', /Theo Marlow/.test(await page.locator('.scorer-table').innerText()) && (await page.locator('.scorer-table thead th').allInnerTexts()).join('|') === 'Player|Next|Anytime|2+');
    const unlabelled = await page.locator('.odds:not([aria-label])').count();
    check(tag, 'every odds button has an aria-label', unlabelled === 0);
    await tap('[data-action="category"][data-category="Goals"]');
    check(tag, 'market group tab filters cards', await page.locator('.market').count() === number(await page.locator('.market-tabs [data-category="Goals"] b').innerText()) - 0);
    await tap('[data-action="category"][data-category="All"]');
    await page.locator('#market-search').fill('corner');
    await sleep(100);
    check(tag, 'market search filters to corner markets', await page.locator('.market').count() >= 4 && (await page.locator('.market-name').allInnerTexts()).every(n => /corner/i.test(n)));
    await page.locator('#market-search').fill('');
    await tap('.market-head [data-market="result"]');
    check(tag, 'market cards collapse', await page.locator('#market-result').isHidden());
    await tap('.market-head [data-market="result"]');
    await tap('[data-action="collapse-all"]');
    check(tag, 'collapse all hides every market body', await page.locator('.market-body:visible').count() === 0);
    await tap('[data-action="collapse-all"]');
    if (mobile) {
      await page.evaluate(() => window.scrollTo(0, 900));
      await sleep(250);
      check(tag, 'compact sticky score header appears on scroll', await page.locator('.app.show-compact .compact-score').isVisible() && /ARS\s*1 – 0\s*BHA/.test(await page.locator('.compact-score').innerText()));
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    let moved = false;
    for (let i = 0; i < 24 && !moved; i++) { await sleep(500); moved = await page.locator('main .odds.up, main .odds.down').count() > 0; }
    check(tag, 'live prices move with up/down arrows', moved && await page.locator('main .odds .move').count() > 0);
    check(tag, 'match page has no horizontal overflow', await overflow() <= 0);
    await shot('match');

    // Bet slip states
    await tap('[data-market="result"][data-outcome="result-0"]');
    let s = await openSlip();
    check(tag, 'new pick starts with an empty stake', (await s.locator('[data-stake]').inputValue()) === '' && (await s.locator('[data-stake]').getAttribute('placeholder')) === '0.00');
    check(tag, 'place button waits for a stake', await s.locator('[data-action="place"]').isDisabled() && /Enter a stake/.test(await s.locator('[data-action="place"]').innerText()));
    check(tag, 'quick-stake chips offered', (await s.locator('.quick-stakes button').allInnerTexts()).join(',') === '5,10,25,50,100');
    await shot('slip-empty-stake');
    await s.locator('[data-stake]').fill('0.5');
    check(tag, 'invalid stake explains the limits', /1 to 1,000/.test(await s.locator('.input-error').innerText()));
    await tap(`${mobile ? 'dialog' : '.side-panel'} [data-action="stake"][data-value="10"]`);
    s = slip();
    check(tag, 'stake chip sets 10 USDT and return 12.20', (await s.locator('[data-stake]').inputValue()) === '10' && /12\.20/.test(await s.locator('.slip-totals .returns').innerText()));
    if (mobile) {
      const footer = await page.locator('dialog .slip-footer').boundingBox();
      const place = await page.locator('dialog [data-action="place"]').boundingBox();
      check(tag, 'Place bet is pinned to the bottom of the sheet', footer && place && footer.y + footer.height >= height - 2 && place.y + place.height <= height);
    }
    await shot('slip-ready');
    await demo('move');
    s = await openSlip();
    check(tag, 'odds change blocks placement until accepted', await s.locator('[data-action="accept"]').isVisible() && await s.locator('[data-action="place"]').isDisabled());
    if (mobile) {
      const accept = await page.locator('dialog [data-action="accept"]').boundingBox();
      check(tag, 'Accept odds is pinned in the sheet footer', accept && accept.y + accept.height <= height);
    }
    await shot('slip-changed');
    await tap(`${mobile ? 'dialog' : '.side-panel'} [data-action="accept"]`);
    await demo('suspend');
    s = await openSlip();
    check(tag, 'suspended selection is kept but cannot be placed', await s.locator('.pick.is-suspended').count() === 1 && await s.locator('[data-action="place"]').isDisabled());
    await shot('slip-suspended');
    await demo('suspend');
    await demo('fail');
    s = await openSlip();
    const before = await balance();
    await tap(`${mobile ? 'dialog' : '.side-panel'} [data-action="place"]`);
    await page.waitForSelector(`${scope} .notice.error`, { timeout: 5000 });
    check(tag, 'failed placement leaves balance unchanged and offers retry', (await balance()) === before && await slip().locator('.notice.error [data-action="place"]').count() === 1);
    await shot('slip-error');
    await tap(`${mobile ? 'dialog' : '.side-panel'} .notice.error [data-action="place"]`);
    await page.waitForSelector(`${scope} .notice.success`, { timeout: 5000 });
    check(tag, 'retry places the bet and debits once', Math.abs(before - 10 - await balance()) < 0.001);
    check(tag, 'receipt shows the placed single', await slip().locator('.receipt li').count() === 1);
    await shot('slip-placed');
    await closeSheet();
    if (mobile) {
      await tap('[data-market="btts"][data-outcome="btts-0"]');
      const toast = await page.locator('.toast').boundingBox();
      const bar = await page.locator('.slip-bar button').boundingBox();
      check(tag, 'toast never covers the slip bar', toast && bar && toast.y + toast.height <= bar.y);
      await tap('[data-market="btts"][data-outcome="btts-0"]');
    }

    // Bet slip & My bets page
    await visit('/bets');
    check(tag, 'bet slip and My bets share one page', await page.locator('.bets-slip').isVisible() && await page.locator('.mybets').isVisible());
    const heads = (await page.locator('.bets-table thead th').allTextContents()).map(t => t.trim());
    check(tag, 'table columns Placed / Bet / Odds / Stake / Returns / Result', heads.join('|') === 'Placed|Bet|Odds|Stake|Returns|Result', heads.join('|'));
    const openRows = await page.locator('.bets-table tbody.bet').count();
    check(tag, 'open tab lists four open bets', openRows === 4, String(openRows));
    await page.selectOption('#date-filter', 'today');
    check(tag, 'date filter options and Today filter', (await page.locator('#date-filter option').allInnerTexts()).join('|') === 'All time|Today|Last 7 days|Last 30 days');
    await page.selectOption('#date-filter', 'all');
    await tap('[data-action="history"][data-tab="settled"]');
    const settled = await page.locator('.bets-table tbody.bet').count();
    check(tag, 'settled tab shows won highlights', settled >= 9 && await page.locator('tbody.bet.won').count() >= 1);
    await page.selectOption('#sport-filter', 'Football');
    const footballOnly = await page.locator('.bets-table tbody.bet').count();
    check(tag, 'sport filter narrows history', footballOnly > 0 && footballOnly < settled);
    await page.selectOption('#sport-filter', 'All');
    await page.selectOption('#date-filter', '7d');
    check(tag, '7-day filter hides older bets', (await page.locator('.bets-table tbody.bet').count()) < settled);
    await page.selectOption('#date-filter', 'all');
    await tap('[data-action="expand"][data-id="HB-1043"]');
    const cashText = await page.locator('#bet-HB-1043').innerText();
    check(tag, 'expanded row shows cash-out history', /Cashed out for 38\.40 USDT/.test(cashText), cashText.slice(0, 120));
    await shot('bets-settled');
    await tap('[data-action="history"][data-tab="open"]');
    await tap('[data-action="expand"][data-id="HB-1048"]');
    const cashBefore = await balance();
    await tap('#bet-HB-1048 [data-action="cash"]');
    await page.waitForSelector('dialog[open] [data-action="confirm-cash"]');
    await tap('dialog [data-action="confirm-cash"]');
    check(tag, 'cash out credits the offer once', Math.abs(await balance() - cashBefore - 31.2) < 0.001);
    check(tag, 'cashed bet moves to Settled', await page.locator('[data-action="history"][data-tab="settled"][aria-selected="true"]').count() === 1 && /Cashed out/.test(await page.locator('tbody.bet', { hasText: 'Arsenal v Brighton' }).first().innerText()));
    check(tag, 'bets page has no horizontal overflow', await overflow() <= 0);
    await shot('bets');

    // Accessibility basics
    if (mobile) {
      const small = await page.evaluate(() => [...document.querySelectorAll('.odds, .bottom-nav > *, .sport-tab, .topbar .icon-btn, .wallet-pill, .expand, .slip-bar button, .tabs button, .select, .quick-stakes button')]
        .filter(el => el.offsetParent).map(el => el.getBoundingClientRect()).filter(r => r.height < 44 || r.width < 44).length);
      await visit('/match/ars-bha');
      const smallOdds = await page.evaluate(() => [...document.querySelectorAll('.odds, .market-head button, .market-tabs button, .topbar .icon-btn, .bottom-nav > *')]
        .filter(el => el.offsetParent).filter(el => el.getBoundingClientRect().height < 44).length);
      check(tag, 'tap targets are at least 44px tall', small === 0 && smallOdds === 0, `${small}/${smallOdds}`);
    } else {
      await visit('/sports');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      check(tag, 'keyboard focus shows a visible ring', ring === 'solid');
      await page.keyboard.press('/');
      check(tag, '"/" focuses search', await page.evaluate(() => document.activeElement?.id === 'global-search'));
    }
    check(tag, 'no console or page errors', !errors.length, errors.slice(0, 5).join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
