// Stress sweep for the built prototype at 1440px and 390px: every Match Center and category, rapid taps,
// double placement, typing during live price ticks, history navigation, resizing and corrupt storage.
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
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) break; } catch { /* Server is still starting. */ } await new Promise(r => setTimeout(r, 100)); }
}
const fixtures = ['ars-bha', 'liv-mun', 'rma-bay', 'bar-atm', 'int-nap', 'dor-lev', 'sin-alc', 'bos-nyk', 'nav-g2'];
const results = [];
const check = (tag, name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} [${tag}] ${name}${detail ? ` — ${detail}` : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await chromium.launch(chrome ? { executablePath: chrome, args: ['--no-sandbox'] } : { channel: 'chrome' });
try {

  for (const [width, height, tag] of [[1440, 1000, 'desktop'], [390, 844, 'mobile']]) {
    const mobile = tag === 'mobile';
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    page.on('requestfailed', r => r.failure()?.errorText !== 'net::ERR_ABORTED' && failed.push(`${r.url()} ${r.failure()?.errorText}`));
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const balance = () => page.locator('.wallet strong').innerText();
    const slip = async () => {
      if (mobile && !(await page.locator('dialog.slip-modal').count())) { await page.locator('.mobile-slip-bar button').click(); await page.waitForSelector('dialog.slip-modal'); }
      return page.locator(mobile ? 'dialog.slip-modal' : '.right-rail');
    };
    const close = async () => { if (await page.locator('dialog[open]').count()) { await page.keyboard.press('Escape'); await sleep(100); } };

    await page.goto(base);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Every Match Center and every market category
    let categoryFailures = [];
    for (const id of fixtures) {
      await page.goto(`${base}#/match/${id}`);
      await page.waitForSelector('.match-scoreboard');
      const tabs = await page.locator('.market-tabs button').count();
      for (let i = 0; i < tabs; i++) {
        await page.locator('.market-tabs button').nth(i).click();
        if (!(await page.locator('.market-group').count()) || await overflow() > 0) categoryFailures.push(`${id}#${i}`);
      }
      const title = await page.locator('#page-title').innerText();
      if (!/ v /.test(title)) categoryFailures.push(`${id}: title "${title}"`);
    }
    check(tag, 'all 9 Match Centers render every category without overflow', !categoryFailures.length, categoryFailures.join(', '));

    // Rapid route switching via browser history
    for (const h of ['/sports', '/live', '/football', '/match/ars-bha', '/bets', '/live', '/sports']) await page.goto(`${base}#${h}`);
    for (let i = 0; i < 3; i++) await page.goBack();
    await sleep(200);
    check(tag, 'back navigation lands on a rendered page', await page.locator('#page-title').count() === 1 && /#\/match\/ars-bha/.test(page.url()));
    await page.goForward(); await sleep(200);
    check(tag, 'forward navigation renders Betslip & My Bets', /Betslip/.test(await page.locator('#page-title').innerText()));

    // Rapid odds toggling (20 taps) leaves a consistent slip
    await page.goto(`${base}#/match/ars-bha`);
    await page.waitForSelector('.market-group');
    const first = () => page.locator('.market-group').nth(1).locator('.odds').first();
    for (let i = 0; i < 20; i++) await first().click({ delay: 0 });
    check(tag, '20 rapid taps toggle cleanly back to an empty slip', await page.locator('.market-group .odds.selected').count() === 0 && (mobile ? /0/.test(await page.locator('.bar-ticket b').innerText()) : await page.locator('.right-rail .selection-card').count() === 0));
    await first().click();
    await page.locator('.market-group').nth(1).locator('.odds').nth(1).click();
    check(tag, 'two singles from the same market stay independent', await page.locator('.market-group .odds.selected').count() === 2);

    // Rapid category switching
    for (let i = 0; i < 18; i++) await page.locator('.market-tabs button').nth(i % 6).click();
    check(tag, 'rapid category switching keeps one active tab', await page.locator('.market-tabs button.active').count() === 1);

    // Typing a stake while the live price feed ticks
    let s = await slip();
    const input = s.locator('[data-stake]').first();
    await input.click();
    await input.press('Control+A');
    for (const ch of '12.50') { await page.keyboard.type(ch); await sleep(1600); }
    check(tag, 'stake typed during live price ticks stays intact and focused', (await input.inputValue()) === '12.50' && await page.evaluate(() => document.activeElement?.hasAttribute('data-stake')));

    // Double-click placement debits once
    const before = Number((await balance()).replace(/,/g, ''));
    const total = Number((await s.locator('.slip-summary .summary-line b').first().innerText()).replace(/[^\d.]/g, ''));
    await s.locator('.place-button').dblclick();
    await s.locator('.notice.success').waitFor();
    const after = Number((await balance()).replace(/,/g, ''));
    check(tag, 'double-click placement debits exactly once', Math.abs(before - total - after) < 0.001, `${before} - ${total} = ${after}`);
    check(tag, 'receipt lists both singles', await s.locator('.receipt li').count() === 2);
    await close();

    // Resize across breakpoints with content open
    await page.goto(`${base}#/match/ars-bha`);
    await page.locator('.market-group .odds').first().click();
    for (const w of [1280, 1050, 760, 390, 1440, width]) {
      await page.setViewportSize({ width: w, height });
      await sleep(150);
      if (await overflow() > 0) { check(tag, `resize to ${w}px has no overflow`, false, `${await overflow()}px`); }
    }
    check(tag, 'resizing through every breakpoint keeps layout intact', await overflow() <= 0);
    await page.setViewportSize({ width, height });

    // Corrupt storage falls back to the sample session
    await page.evaluate(() => localStorage.setItem('house-live-v1', '{"version":1,"balance":"oops"'));
    await page.reload(); await page.waitForSelector('#page-title', { state: 'attached' });
    check(tag, 'corrupt saved session recovers to 1,000.00 USDT', (await balance()) === '1,000.00');

    // Long idle with feed running and keyboard tabbing
    await page.goto(`${base}#/sports`);
    for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
    await sleep(8000);
    check(tag, 'idle live feed and keyboard tabbing cause no overflow', await overflow() <= 0);

    check(tag, 'no console or page errors', !errors.length, errors.slice(0, 5).join(' | '));
    const realFailures = failed.filter(f => !/fonts\.(googleapis|gstatic)/.test(f));
    check(tag, 'no failed or 4xx/5xx requests', !realFailures.length, realFailures.slice(0, 5).join(' | '));
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
const bad = results.filter(r => !r).length;
console.log(`\n${results.length - bad}/${results.length} stress checks passed.`);
if (bad) process.exitCode = 1;
