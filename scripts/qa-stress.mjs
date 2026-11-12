// Stress sweep for the built prototype at 1440px and 390px: every match page and market tab, rapid taps
// while prices move, double placement, typing during live ticks, history navigation, resizing, corrupt
// storage, then a responsive sweep across nine extra viewports.
// Usage: pnpm build && pnpm qa:stress   (QA_URL to target a deployed site)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const chrome = process.env.CHROME_PATH ?? ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
let server;
let base = process.env.QA_URL;
if (!base) {
  server = spawn(process.execPath, ['scripts/preview.mjs', '--port', '4180'], { stdio: 'ignore' });
  base = 'http://127.0.0.1:4180/';
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* Server is still starting. */ }
    await new Promise(r => setTimeout(r, 100));
  }
}
const results = [];
const check = (tag, name, ok, detail = '') => {
  results.push(!!ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}] ${name}${detail && !ok ? ` — ${String(detail).replace(/\s+/g, ' ')}` : ''}`);
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const number = text => Number(String(text).replace(/[^0-9.]/g, ''));
const browser = await chromium.launch(chrome ? { executablePath: chrome, args: ['--no-sandbox'] } : { channel: 'chrome' });

try {
  for (const [width, height, tag] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
    const mobile = tag === 'mobile';
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', r => r.failure()?.errorText !== 'net::ERR_ABORTED' && failed.push(`${r.url()} ${r.failure()?.errorText}`));
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    const tap = async locator => { if (mobile) await locator.tap(); else await locator.click(); };
    const visit = async hash => { await page.goto(`${base}#${hash}`); await page.waitForSelector('#page-title', { state: 'attached' }); await sleep(150); };
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const balance = async () => number(await page.locator('.wallet-pill b').innerText());
    const pickCount = () => page.evaluate(() => Number(document.querySelector('.slip-bar-count b')?.textContent ?? 0) || document.querySelectorAll('.side-panel .pick').length);
    const openSlip = async () => {
      if (mobile && !(await page.locator('dialog.sheet').count())) { await tap(page.locator('.slip-bar button')); await page.waitForSelector('dialog.sheet'); }
      return page.locator(mobile ? 'dialog .slip' : '.side-panel .slip');
    };
    const closeSheet = async () => { if (await page.locator('dialog[open]').count()) { await page.keyboard.press('Escape'); await sleep(100); } };

    await page.goto(base);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Collect every fixture from the Soccer "All" view, the Live page and each other sport.
    await visit('/football');
    await tap(page.locator('[data-action="football-scope"][data-scope="all"]'));
    const ids = new Set(await page.locator('a[href^="#/match/"]').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop())));
    await visit('/live');
    for (const id of await page.locator('a[href^="#/match/"]').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop()))) ids.add(id);
    for (const sport of ['Tennis', 'Basketball', 'Baseball', 'American Football', 'Esports']) {
      await visit('/sports');
      await tap(page.locator(`.sport-tabs [data-sport="${sport}"]`));
      await sleep(100);
      for (const id of await page.locator('main a[href^="#/match/"]').evaluateAll(as => as.map(a => a.getAttribute('href').split('/').pop()))) ids.add(id);
    }
    check(tag, 'all 42 fixtures are reachable from the lists', ids.size === 42, `${ids.size}`);

    // Every match page and every market tab
    const tabFailures = [];
    for (const id of ids) {
      await visit(`/match/${id}`);
      const tabs = await page.locator('.market-tabs [role="tab"]').count();
      if (!tabs) tabFailures.push(`${id}: no tabs`);
      for (let i = 0; i < tabs; i++) {
        await page.locator('.market-tabs [role="tab"]').nth(i).click();
        if (!(await page.locator('#market-list .market').count()) || await overflow() > 0) tabFailures.push(`${id}#${i}`);
      }
      if (!/ v /.test(await page.locator('#page-title').innerText())) tabFailures.push(`${id}: title`);
    }
    check(tag, `all ${ids.size} match pages render every market tab without overflow`, !tabFailures.length, tabFailures.slice(0, 8).join(', '));

    // Browser history across all five pages
    for (const h of ['/sports', '/live', '/football', '/match/ars-bha', '/bets', '/live', '/sports']) await visit(h);
    for (let i = 0; i < 3; i++) await page.goBack();
    await sleep(250);
    check(tag, 'back navigation lands on a rendered match page', /#\/match\/ars-bha/.test(page.url()) && await page.locator('.scoreboard').count() === 1);
    await page.goForward(); await sleep(250);
    check(tag, 'forward navigation renders Bet slip & My bets', /#\/bets/.test(page.url()) && await page.locator('.bets-table').count() === 1);

    // Rapid taps on a price while the live feed is moving other prices
    await visit('/match/ars-bha');
    const price = () => page.locator('#market-list .market:not(.is-suspended) .odds:not([disabled])').first();
    for (let i = 0; i < 20; i++) await tap(price());
    await sleep(100);
    check(tag, '20 rapid taps toggle cleanly back to an empty slip', await page.locator('#market-list .odds.selected').count() === 0 && await pickCount() === 0);
    for (let i = 0; i < 9; i++) { await tap(price()); await sleep(370); }
    check(tag, 'taps spread across live price ticks are never lost (odd count selects)', await page.locator('#market-list .odds.selected').count() === 1 && await pickCount() === 1);
    await tap(page.locator('#market-list .market:not(.is-suspended)').first().locator('.odds:not([disabled])').nth(1));
    check(tag, 'two singles from the same market stay independent', await page.locator('#market-list .odds.selected').count() === 2);

    // Rapid tab switching
    const tabCount = await page.locator('.market-tabs [role="tab"]').count();
    for (let i = 0; i < 21; i++) await page.locator('.market-tabs [role="tab"]').nth(i % tabCount).click();
    check(tag, 'rapid tab switching keeps exactly one selected tab', await page.locator('.market-tabs [aria-selected="true"]').count() === 1);

    // Typing stakes while the live feed ticks
    let slip = await openSlip();
    const inputs = slip.locator('[data-stake]');
    for (let k = 0; k < 2; k++) {
      await inputs.nth(k).click();
      for (const ch of k ? '7.5' : '12.50') { await page.keyboard.type(ch); await sleep(k ? 700 : 1200); }
    }
    check(tag, 'stakes typed during live ticks stay intact and focused',
      await inputs.nth(0).inputValue() === '12.50' && await inputs.nth(1).inputValue() === '7.5' && await page.evaluate(() => document.activeElement?.hasAttribute('data-stake')));

    // Double-click placement debits once
    slip = await openSlip();
    const before = await balance();
    await slip.locator('[data-action="place"].place').dblclick();
    await page.locator(`${mobile ? 'dialog' : '.side-panel'} .notice.success`).waitFor({ timeout: 6000 });
    const after = await balance();
    check(tag, 'double-click placement debits exactly once', Math.abs(before - 20 - after) < 0.001, `${before} → ${after}`);
    check(tag, 'receipt lists both singles', await page.locator(`${mobile ? 'dialog' : '.side-panel'} .receipt li`).count() === 2);
    await closeSheet();

    // Resize through every breakpoint with a pick in the slip
    await visit('/match/ars-bha');
    await tap(price());
    const resizeProblems = [];
    for (const w of [1440, 1280, 1279, 1100, 1099, 900, 899, 768, 767, 390, 380, 320, width]) {
      await page.setViewportSize({ width: w, height });
      await sleep(120);
      const o = await overflow();
      if (o > 0) resizeProblems.push(`${w}px +${o}`);
    }
    check(tag, 'resizing through every breakpoint keeps layout intact', !resizeProblems.length, resizeProblems.join(', '));
    await page.setViewportSize({ width, height });

    // Reload keeps the session; corrupt storage falls back to the sample session
    const kept = await balance();
    await page.reload(); await page.waitForSelector('#page-title', { state: 'attached' });
    check(tag, 'reload keeps balance and placed bets', await balance() === kept && /HB-1049|HB-1050/.test(await page.evaluate(() => localStorage.getItem('housebets-sportsbook-v2'))));
    await page.evaluate(() => localStorage.setItem('housebets-sportsbook-v2', '{"version":2,"balance":"oops"'));
    await page.reload(); await page.waitForSelector('#page-title', { state: 'attached' });
    check(tag, 'corrupt saved session recovers to 1,000.00 USDT', await balance() === 1000);

    // Long idle with the feed running and keyboard tabbing
    await visit('/sports');
    for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
    await sleep(8000);
    check(tag, 'idle live feed and keyboard tabbing cause no overflow', await overflow() <= 0);

    check(tag, 'no console or page errors', !errors.length, errors.slice(0, 5).join(' | '));
    check(tag, 'no failed or 4xx/5xx requests', !failed.length, failed.slice(0, 5).join(' | '));
    await context.close();
  }

  // Responsive sweep beyond the two contest widths
  for (const [width, height] of [[320, 640], [360, 740], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 1000], [1920, 1080], [844, 390]]) {
    const tag = `${width}×${height}`;
    const touch = width <= 932;
    const context = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const problems = [];
    for (const route of ['/sports', '/live', '/football', '/match/ars-bha', '/bets']) {
      await page.goto(`${base}#${route}`);
      await page.waitForSelector('#page-title', { state: 'attached' });
      await sleep(150);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const clipped = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true; return false; };
        const offscreen = [...document.querySelectorAll('main *, .topbar *')].filter(el => {
          const b = el.getBoundingClientRect();
          return b.width && (b.right > vw + 1 || b.left < -1) && !clipped(el);
        }).map(el => el.className || el.tagName);
        const cut = [...document.querySelectorAll('.team-name, .pick-fixture')].filter(b => b.scrollWidth > b.clientWidth + 1).map(b => b.textContent);
        return { overflow: document.documentElement.scrollWidth - vw, offscreen, cut };
      });
      if (r.overflow > 0) problems.push(`${route} overflows ${r.overflow}px`);
      if (r.offscreen.length) problems.push(`${route} off-screen: ${r.offscreen.slice(0, 3).join(', ')}`);
      if (r.cut.length) problems.push(`${route} truncates ${r.cut.slice(0, 3).join(', ')}`);
    }
    check(tag, 'all five pages fit without overflow or clipped team names', !problems.length, problems.slice(0, 4).join('; '));
    check(tag, 'no console or page errors', !errors.length, errors.slice(0, 3).join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
const bad = results.filter(r => !r).length;
console.log(`\n${results.length - bad}/${results.length} stress checks passed.`);
if (bad) process.exitCode = 1;
