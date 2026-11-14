// Integration check against the shared checklist. Restores the tested checkbox.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

(async () => {
  const server = http.createServer((req, res) => {
    const name = req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0].slice(1);
    if (!['index.html', 'sentences.js'].includes(name)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(__dirname, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  const first = await browser.newContext();
  const second = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const a = await first.newPage();
  const b = await second.newPage();
  const url = process.env.TEST_URL || 'http://127.0.0.1:' + server.address().port;
  let original;
  const checkbox = page => page.locator('[data-sentence-id="46"] input');
  try {
    for (const page of [a, b]) {
      await page.goto(url);
      if (page === b) await page.locator('.mobile-nav [data-view="sentences"]').click();
      else await page.selectOption('#view', 'sentences');
      await page.waitForFunction(() => document.getElementById('sync-status').textContent.includes('Synced across devices'));
      assert.equal(await page.locator('#sentence-list li').count(), 46);
    }
    const expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'sentences.json'), 'utf8'));
    assert.deepEqual(await a.locator('.sentence-text').allTextContents(), expected);
    assert.deepEqual(await b.locator('.sentence-text').allTextContents(), expected);
    original = await checkbox(a).isChecked();
    await checkbox(a).setChecked(!original);
    await a.waitForFunction(() => document.getElementById('sync-status').textContent.includes('Synced across devices'));
    await b.waitForFunction(value => document.querySelector('[data-sentence-id="46"] input').checked === value, !original);
    assert.equal(await b.locator('[data-sentence-id="46"]').evaluate(row => row.classList.contains('is-checked')), !original);
    await b.reload();
    await b.locator('.mobile-nav [data-view="sentences"]').click();
    await b.waitForFunction(value => document.querySelector('[data-sentence-id="46"] input').checked === value && !document.querySelector('[data-sentence-id="46"] input').disabled, !original);
    assert.equal(await b.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    for (const width of [320, 390, 720]) {
      await b.setViewportSize({ width, height: 844 });
      const menu = await b.locator('aside').boundingBox();
      const content = await b.locator('main').boundingBox();
      assert.equal(menu.width, width);
      assert.equal(content.width, width);
      assert.ok(content.y >= menu.y + menu.height);
      assert.equal(await b.locator('#view').isVisible(), false);
      assert.equal(await b.locator('.mobile-nav button').count(), 6);
      assert.equal(await b.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    }
    await b.setViewportSize({ width: 390, height: 844 });
    for (const view of ['summary', 'outline', 'flow', 'facts', 'organize', 'sentences']) {
      await b.locator(`.mobile-nav [data-view="${view}"]`).click();
      assert.equal(await b.locator('#content > section:visible').getAttribute('id'), view);
      assert.equal(await b.locator(`.mobile-nav [data-view="${view}"]`).getAttribute('aria-pressed'), 'true');
    }
    await a.evaluate(() => window.scrollTo(0, 1200));
    assert.equal(Math.round((await a.locator('aside').boundingBox()).y), 0);
    await a.emulateMedia({ media: 'print' });
    assert.equal(await a.locator('#content > section:visible').getAttribute('id'), 'sentences');
    assert.equal(await a.locator('.print:visible').count(), 0);
    await a.emulateMedia({ media: 'screen' });
    await a.route('**/rest/v1/bm01_sentences*', route => route.request().method() === 'PATCH' ? route.abort() : route.continue());
    await checkbox(a).setChecked(original);
    await a.waitForFunction(() => document.getElementById('sync-status').textContent.includes('Save could not be confirmed'));
    assert.equal(await checkbox(a).isChecked(), !original);
    await a.unrouteAll();
    console.log('PASS: 46 source sentences; two isolated browser contexts share state; reload persistence; gray styling; mobile width; sticky menu; print isolation; failed-save rollback.');
  } finally {
    if (original !== undefined) {
      await a.unrouteAll();
      await a.emulateMedia({ media: 'screen' });
      await a.locator('#sync-retry').click();
      await a.waitForFunction(() => !document.querySelector('[data-sentence-id="46"] input').disabled);
      await checkbox(a).setChecked(original);
      await a.waitForFunction(() => document.getElementById('sync-status').textContent.includes('Synced across devices'));
    }
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
