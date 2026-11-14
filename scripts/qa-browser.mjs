// Browser regression for the built prototype at the contest's two required widths (1440px and 390px).
// Usage: pnpm build && pnpm qa:browser   (QA_URL targets a deployed site; QA_SCREENSHOTS=dir captures images)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error('Not a JPEG');
  let i = 2;
  while (i < buffer.length - 8) {
    if (buffer[i] !== 0xff) { i++; continue; }
    const marker = buffer[i + 1];
    if (marker === 0xd9) break;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    i += 2 + buffer.readUInt16BE(i + 2);
  }
  throw new Error('JPEG SOF not found');
}

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
  try {
    const og = readFileSync('dist/og.jpg');
    const { width, height } = jpegSize(og);
    check('assets', 'og.jpg on disk is 1200×630', width === 1200 && height === 630, `${width}×${height}`);
    const ogRes = await fetch(`${base}og.jpg`);
    check('assets', 'og.jpg serves HTTP 200', ogRes.ok, String(ogRes.status));
  } catch (e) {
    check('assets', 'og.jpg on disk is 1200×630', false, e instanceof Error ? e.message : String(e));
  }

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
    check(tag, 'official Housebets wordmark replaces the placeholder mark', await page.locator('.topbar .brand-logo svg [fill="#02F7FD"]').count() > 0 && await page.locator('.topbar .brand-mark').count() === 0);
    if (!mobile) {
      check(tag, 'top bar shows the Weekly Prize widget', /Weekly Prize/.test(await page.locator('.prize').innerText()));
      check(tag, 'slim left icon rail with Live count', await page.locator('.rail').isVisible() && (await page.locator('.rail .rail-count.live').innerText()) === '13');
      check(tag, 'right panel tabs: Bet slip | My bets | Chat', (await page.locator('.side-panel [role="tab"]').allInnerTexts()).map(t => t.replace(/\d+/g, '').trim()).join('|') === 'Bet slip|My bets|Chat');
    } else {
      check(tag, 'bottom navigation and slip bar visible', await page.locator('.bottom-nav').isVisible() && await page.locator('.slip-bar').isVisible());
      check(tag, '390px header keeps the full Housebets wordmark', await page.locator('.topbar .brand-logo:not(.is-mark)').isVisible());
      const prize = await page.locator('.prize-compact').boundingBox();
      const vip = await page.locator('.topbar .vip').boundingBox();
      check(tag, 'compact Weekly Prize sits beside the VIP crown', await page.locator('.prize-compact').isVisible()
        && /50,000/.test(await page.locator('.prize-compact').innerText())
        && prize && vip && prize.x < vip.x && Math.abs(prize.y - vip.y) < 16);
    }
    check(tag, 'sport tabs under search start Home, Live 13, Soccer', /^Home\s*Live\s*13\s*Soccer/.test((await page.locator('.sport-tabs').innerText()).replace(/\n/g, ' ')));
    check(tag, 'favourites chips listed', await page.locator('.fav-chips .chip').count() === 3);
    if (mobile) {
      const rowHeight = await page.locator('#your-matches .event-row').first().evaluate(row => row.getBoundingClientRect().height);
      check(tag, 'mobile event cards stay dense', rowHeight <= 145, `${Math.round(rowHeight)}px`);
    }
    const sections = await page.locator('.home-section .section-head h2').allInnerTexts();
    check(tag, 'dense home: Your matches, Featured, Live now, Starting soon', ['Your matches', 'Featured', 'Live now', 'Starting soon'].every((s, i) => sections[i]?.includes(s)), sections.join(' / '));
    if (await page.locator('#your-matches [data-action="toggle-mine"]').count()) await tap('#your-matches [data-action="toggle-mine"]');
    const yours = await page.locator('#your-matches .event-row').evaluateAll(rows => rows.map(row => ({
      arsenal: /Arsenal/.test(row.innerText),
      live: row.classList.contains('is-live'),
    })));
    const arsenalCount = yours.filter(row => row.arsenal).length;
    const rest = yours.slice(arsenalCount);
    const firstLater = rest.findIndex(row => !row.live);
    const lastLive = rest.reduce((index, row, i) => (row.live ? i : index), -1);
    check(tag, 'your matches lead with Arsenal, then live favourite competitions', arsenalCount >= 1 && yours.slice(0, arsenalCount).every(row => row.arsenal) && yours[0].live && (firstLater < 0 || lastLive < firstLater), JSON.stringify(yours.slice(0, 6)));
    if (!mobile) {
      const compRows = await page.locator('.competitions button').evaluateAll(els => new Set(els.map(el => Math.round(el.getBoundingClientRect().top))).size);
      check(tag, 'top competitions sit on one row', await page.locator('.competitions button').count() === 5 && compRows === 1, String(compRows));
      const wrappedNames = await page.locator('.competitions button b').evaluateAll(els => els
        .filter(el => el.getClientRects().length > 1 || el.scrollWidth > el.clientWidth + 1)
        .map(el => el.textContent));
      check(tag, 'competition names stay on one line', wrappedNames.length === 0, wrappedNames.join(', '));
    }
    check(tag, 'top competitions label the full schedule', /8 scheduled/.test(await page.locator('.competitions').innerText()));
    check(tag, 'Live now "View all 13" is accurate', (await page.locator('a.view-all[href="#/live"]').innerText()).includes('View all 13'));
    const more = page.locator('.event-row .more').first();
    const moreLabel = await more.getAttribute('aria-label');
    const moreCount = Number(moreLabel.match(/View all (\d+) markets/)?.[1]);
    const moreVisible = number(await more.innerText());
    await more.click();
    await page.waitForSelector('.market-tabs');
    const pageTotal = number(await page.locator('.market-tabs [data-category="All"] b').innerText());
    check(tag, '"+N" counts the markets beyond the one on the row', moreCount === pageTotal && moreVisible === pageTotal - 1, `+${moreVisible} of ${moreCount}/${pageTotal}`);
    await visit('/sports');
    check(tag, 'times use the viewer time zone, not UTC', !/Times shown in UTC/.test(await page.locator('main').innerText()) && /Times in your time zone/.test(await page.locator('.site-footer').innerText()));
    check(tag, 'home has no horizontal overflow', await overflow() <= 0);
    await shot('home');
    await page.locator('#global-search').fill('Over 2.5');
    await sleep(150);
    check(tag, 'search matches an outcome and names the market', await page.locator('.event-row').count() > 0
      && /Market ·/.test(await page.locator('.match-reason').first().innerText())
      && /Over 2\.5/.test(await page.locator('.match-reason').first().innerText()));
    await page.locator('#global-search').fill('Both teams to score');
    await sleep(150);
    check(tag, 'search matches a market name', /Market · Both teams to score/.test(await page.locator('.match-reason').first().innerText()));
    await page.locator('#global-search').fill('');
    await sleep(100);

    // Live
    await visit('/live');
    check(tag, 'live page lists 13 events across sports', await page.locator('.event-row.is-live').count() === 13);
    check(tag, 'six live football matches', await page.locator('.sport-block').first().locator('.event-row').count() === 6);
    check(tag, 'half-time status and an inline suspended row', await page.locator('.live-badge.is-ht').count() >= 1 && await page.locator('.event-row.is-suspended .tag.suspended').count() >= 1);
    check(tag, 'league headers carry country flags', await page.locator('.league-head svg.flag').count() === await page.locator('.league-head').count());
    const sportBox = await page.locator('[aria-label="Filter live events by sport"]').boundingBox();
    const compBox = await page.locator('[aria-label="Filter live events by competition"]').boundingBox();
    check(tag, 'competition chips sit under the sport chips', sportBox && compBox && compBox.y > sportBox.y);
    await tap('[data-action="live-comp"][data-league="Premier League"]');
    const plCount = number(await page.locator('[data-action="live-comp"][data-league="Premier League"] b').innerText());
    check(tag, 'competition filter counts and narrows live Premier League', plCount >= 1 && await page.locator('.event-row').count() === plCount && await page.locator('.league').count() === 1);
    await shot('live-competition');
    await tap('[data-action="live-comp"][data-league=""]');
    await tap('[data-action="live-sport"][data-sport="Tennis"]');
    check(tag, 'live sport filter narrows to tennis', await page.locator('.event-row').count() === 2);
    await tap('[data-action="live-sport"][data-sport="All"]');
    await tap('[data-action="live-comp"][data-league="Premier League"]');
    await tap('[data-action="live-sport"][data-sport="Tennis"]');
    check(tag, 'empty state when sport and competition do not overlap', /Nothing live in Premier League/.test(await page.locator('.empty h3').innerText()));
    await tap('[data-action="live-comp-clear"]');
    check(tag, 'clearing the competition shows that sport again', await page.locator('.event-row').count() === 2);
    check(tag, 'live page has no horizontal overflow', await overflow() <= 0);
    await tap('[data-action="live-sport"][data-sport="All"]');
    await shot('live');

    // Soccer
    await visit('/football');
    const scoped = await page.locator('.event-row').count();
    const scopeCount = number(await page.locator('.scope-count').innerText());
    const chipCount = number(await page.locator('[data-action="league-filter"][data-league=""] b').innerText());
    check(tag, 'soccer header and Today & live chip share one count', scopeCount === chipCount && scopeCount === scoped && /today & live/i.test(await page.locator('.page-title').innerText()) && /Today & live/.test(await page.locator('[data-action="league-filter"][data-league=""]').innerText()), `${scopeCount}/${chipCount}/${scoped}`);
    await tap('[data-action="football-scope"][data-scope="all"]');
    const all = await page.locator('.event-row').count();
    check(tag, 'Live & Upcoming / All toggle changes the list', all === 29 && scoped < all && number(await page.locator('.scope-count').innerText()) === 29, `${scoped} → ${all}`);
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
    check(tag, 'match page offers 90–110 markets', total >= 90 && total <= 110, String(total));
    check(tag, 'Players, Minutes and Corners & cards groups are listed', /Players/.test(await page.locator('.market-tabs').innerText()) && /Minutes/.test(await page.locator('.market-tabs').innerText()) && /Corners & cards/.test(await page.locator('.market-tabs').innerText()));
    check(tag, 'goalscorer group has at least 9 markets', number(await page.locator('.market-tabs [data-category="Goalscorers"] b').innerText()) >= 9);
    check(tag, 'match page has a back button and breadcrumb menu', await page.locator('.crumb-back').isVisible() && await page.locator('.crumb-drop summary').isVisible());
    check(tag, 'match page opens on Popular', await page.locator('[data-category="Popular"][aria-selected="true"]').count() === 1);
    if (mobile) {
      const clearance = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('#market-result .odds')].map(el => el.getBoundingClientRect());
        const slip = document.querySelector('.slip-bar')?.getBoundingClientRect();
        const nav = document.querySelector('.bottom-nav')?.getBoundingClientRect();
        const limit = Math.min(slip?.top ?? innerHeight, nav?.top ?? innerHeight, innerHeight);
        return boxes.length === 3 && boxes.every(b => b.top >= 0 && b.bottom <= limit + 0.5 && b.height >= 44) && window.scrollY === 0;
      });
      check(tag, 'match result prices sit above the slip bar', clearance);
    }
    await tap('[data-action="category"][data-category="All"]');
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
    if (!mobile) {
      const orphans = await page.locator('#market-list .market').evaluateAll(els => {
        const rows = new Map();
        const width = document.querySelector('#market-list').getBoundingClientRect().width;
        for (const el of els) {
          if (el.hidden || !el.offsetParent) continue;
          const box = el.getBoundingClientRect();
          const key = Math.round(box.top);
          const list = rows.get(key) ?? [];
          list.push(box.width);
          rows.set(key, list);
        }
        let bad = 0;
        for (const widths of rows.values()) if (widths.length === 1 && widths[0] < width * 0.75) bad += 1;
        return bad;
      });
      check(tag, 'market grid has no narrow orphan card', orphans === 0, String(orphans));
    }
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
    const pickOdds = Number((await s.locator('.pick-odds').innerText()).match(/(\d+\.\d{2})\s*$/)[1]);
    const sameLine = async root => root.locator('.slip-totals .returns dd').evaluate(el => {
      const small = el.querySelector('small');
      if (!small) return false;
      const value = el.getBoundingClientRect();
      const unit = small.getBoundingClientRect();
      // A block-level unit sits under the amount and is as wide as the row. Flex items report display:block, so the line is judged from the boxes.
      return unit.top < value.bottom - 1 && unit.bottom > value.top + 1 && unit.left > value.left + 4 && unit.width < value.width * 0.75;
    });
    check(tag, 'stake chip sets 10 USDT and returns stake × odds', (await s.locator('[data-stake]').inputValue()) === '10'
      && number(await s.locator('.slip-totals .returns').innerText()) === Math.round(pickOdds * 1000) / 100);
    check(tag, 'slip total keeps the amount and USDT on one line', await sameLine(s) && /Potential returns/.test(await s.locator('.slip-totals .returns').innerText()));
    if (mobile) {
      const footer = await page.locator('dialog .slip-footer').boundingBox();
      const place = await page.locator('dialog [data-action="place"]').boundingBox();
      check(tag, 'Place bet is pinned to the bottom of the sheet', footer && place && footer.y + footer.height >= height - 2 && place.y + place.height <= height);
    }
    await shot('slip-ready');
    await demo('move');
    s = await openSlip();
    check(tag, 'odds change blocks placement until accepted', await s.locator('[data-action="accept"]').isVisible() && await s.locator('[data-action="place"]').isDisabled());
    check(tag, 'returns after accepting keep USDT on the same line', /Returns after accepting/.test(await s.locator('.slip-totals .returns').innerText()) && await sameLine(s));
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
    await closeSheet();
    const selected = page.locator('main .odds.selected.suspended').first();
    await selected.scrollIntoViewIfNeeded();
    const readable = await selected.evaluate(el => {
      const label = el.querySelector('.odds-label');
      const lock = el.querySelector('.odds-price');
      const parse = value => value.match(/[\d.]+/g).map(Number);
      const lum = value => {
        const [r, g, b] = parse(value).map(channel => {
          const v = channel / 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const contrast = (color, background) => {
        const hi = Math.max(lum(color), lum(background));
        const lo = Math.min(lum(color), lum(background));
        return (hi + 0.05) / (lo + 0.05);
      };
      const background = getComputedStyle(el).backgroundColor;
      return {
        text: label?.textContent?.trim() ?? '',
        label: contrast(getComputedStyle(label).color, background),
        lock: contrast(getComputedStyle(lock).color, background),
      };
    });
    check(tag, 'selected suspended odds keep the label and lock readable', readable.text.length > 0 && readable.label >= 3 && readable.lock >= 3, JSON.stringify(readable));
    await shot('suspended-selected');
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
    check(tag, 'cash out is on the open row before expanding', await page.locator('.bet-row [data-action="cash"][data-id="HB-1048"]').isVisible());
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
      const rail = await page.locator('.rail-nav a').evaluateAll(els => els.map(el => el.getAttribute('aria-label')));
      check(tag, 'collapsed rail names every destination', rail.includes('Home') && rail.includes('Soccer') && rail.some(n => /^Live, \d+ events$/.test(n)) && rail.some(n => /^My bets(?:, \d+ open bets)?$/.test(n)), rail.join(' | '));
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

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const clear = () => page.evaluate(() => {
      const boxes = [...document.querySelectorAll('#market-result .odds')].map(el => el.getBoundingClientRect());
      const bars = [...document.querySelectorAll('.slip-bar, .bottom-nav')].map(el => el.getBoundingClientRect()).filter(b => b.top < innerHeight && b.bottom > 0);
      const limit = Math.min(innerHeight, ...bars.map(b => b.top));
      return boxes.length === 3 && boxes.every(b => b.height >= 44 && b.top >= -0.5 && b.bottom <= limit + 0.5);
    });
    await page.goto(`${base}#/match/ars-bha`);
    await page.waitForSelector('#market-result .odds');
    await page.evaluate(() => window.scrollTo(0, 0));
    check('390x844', 'fresh match result is above the slip bar', await clear());
    await page.locator('[data-action="mobile-slip"]').tap();
    await page.waitForSelector('dialog[open]');
    await page.locator('dialog [data-action="close"]').tap();
    await page.waitForTimeout(100);
    check('390x844', 'match result stays above the slip bar after opening the slip', await clear());
    await page.setViewportSize({ width: 390, height: 480 });
    await page.locator('#market-search').focus();
    await page.waitForTimeout(50);
    check('390x480', 'match result stays clear while the market search is focused', await clear());
    await page.setViewportSize({ width: 390, height: 740 });
    await page.waitForTimeout(80);
    check('keyboard', 'navigation returns after keyboard dismissal with search still focused', await page.locator('#market-search').evaluate(el => el === document.activeElement) && !(await page.locator('html').evaluate(el => el.classList.contains('keyboard-open'))));
    await page.locator('#market-search').blur();
    await page.evaluate(() => window.scrollTo(0, 0));
    check('390x740', 'match result needs no scroll above the slip bar', await clear() && await page.evaluate(() => window.scrollY === 0));
    await page.locator('#market-search').fill('Rafe');
    check('search', 'Popular search explains matches in other categories', /No results in Popular/.test(await page.locator('#market-list').innerText()));
    await page.locator('[data-action="search-all-markets"]').tap();
    check('search', 'expanding search preserves the query', await page.locator('#market-search').inputValue() === 'Rafe');
    await page.waitForTimeout(120);
    const rafe = await page.locator('.scorer-table').innerText();
    check('search', 'away player search keeps the home tab and shows his prices', /Rafe Halloran/.test(rafe) && /Anytime/.test(rafe) && (await page.locator('.team-switch [aria-selected="true"]').innerText()).trim() === 'Arsenal', rafe.slice(0, 160));
    check('search', 'one-player result names the away team and search scope', /Brighton/.test(rafe) && /Searching both teams/.test(await page.locator('#market-list').innerText()));
    await page.locator('[data-action="clear-market-search"]').tap();
    check('search', 'clearing expanded search restores Popular', await page.locator('[data-category="Popular"]').getAttribute('aria-selected') === 'true');
    await page.locator('#market-search').fill('zzzz');
    await page.waitForTimeout(120);
    check('search', 'unknown player search explains the empty result', /No markets match/.test(await page.locator('#market-list').innerText()));
    await page.goto(`${base}#/sports`);
    await page.locator('.demo-entry').first().tap();
    check('demo', 'demo states names the three-step sequence', /Change the odds/.test(await page.locator('dialog').innerText()) && /Suspend the market/.test(await page.locator('dialog').innerText()) && /place the same bet again/.test(await page.locator('dialog').innerText()));
    await page.locator('[data-action="no-live"]').tap();
    await page.waitForSelector('.fallback, .empty');
    const fallback = await page.locator('main').innerText();
    check('live', 'no-live fallback has no past kick-offs', !/Yesterday/.test(fallback));
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${base}#/match/ars-bha`);
    await page.waitForSelector('.market-tabs');
    const last = page.locator('.market-tabs [role="tab"]').last();
    await last.click();
    const label = (await last.innerText()).replace(/\s+/g, ' ').trim();
    await page.locator('#market-list .odds').first().click();
    await page.waitForTimeout(80);
    const visible = await page.evaluate(() => {
      const tab = document.querySelector('.market-tabs [aria-selected="true"]');
      const scroller = document.querySelector('.market-tabs');
      const box = tab.getBoundingClientRect();
      const frame = scroller.getBoundingClientRect();
      return box.left >= frame.left - 1 && box.right <= frame.right + 1;
    });
    check('tabs', `active market tab stays in view after a pick (${label})`, visible);
    const players = await page.locator('[data-category="Players"]').innerText();
    await page.locator('[data-category="Players"]').click();
    const card = await page.locator('#market-list .market-name').first().innerText();
    check('players', 'player market names the threshold and period', /\d\+|First card/.test(card) && /rest of match|full match/.test(card), card);
    check('players', 'Players tab is still available', /Players/.test(players));
    await page.goto(`${base}#/live`);
    const body = await page.locator('body').innerText();
    check('names', 'WTA fixture does not use M. Kessler', !/Kessler/.test(body) && /Pellam/.test(body));
    await context.close();
  }

  for (const width of [360, 390, 454]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(`${base}#/sports`);
    await page.waitForSelector('.sport-tabs');
    const fades = await page.evaluate(() => {
      const el = document.querySelector('.sport-tabs');
      const read = left => { el.scrollLeft = left; el.dispatchEvent(new Event('scroll')); return el.dataset.fade; };
      const max = el.scrollWidth - el.clientWidth;
      return { start: read(0), mid: read(max / 2), end: read(max), overflow: max > 2 };
    });
    check(`${width}px`, 'horizontal fade follows the scroll position', fades.overflow && fades.start === 'end' && fades.mid === 'both' && fades.end === 'start', JSON.stringify(fades));
    await context.close();
  }

  for (const [width, height, tag] of [[320, 640], [360, 740], [375, 812]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    for (const route of ['/live', '/football']) {
      await page.goto(`${base}#${route}`);
      await page.waitForSelector('.league-head h3', { state: 'attached' });
      await sleep(250);
      const clipped = await page.evaluate(() => [...document.querySelectorAll('.league-head h3')]
        .filter(h => h.scrollWidth > h.clientWidth + 1)
        .map(h => h.innerText.replace(/\s+/g, ' ').trim()));
      check(tag, `league headers ellipsis instead of clip on ${route}`, clipped.length === 0, clipped.slice(0, 4).join(' | '));
      if (width === 375) {
        const cut = await page.evaluate(() => [...document.querySelectorAll('.league-name')]
          .filter(el => /Champions League|Premier League|WTA Finals|CS2 Major/.test(el.textContent))
          .filter(el => el.scrollWidth > el.clientWidth + 1)
          .map(el => el.textContent.trim()));
        check(tag, `long league names stay fully visible on ${route}`, cut.length === 0, cut.join(' | '));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server?.kill();
}
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
