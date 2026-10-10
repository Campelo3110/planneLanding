const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/home/campelo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

const base = process.env.PLANNE_SITE_URL || 'http://127.0.0.1:5000';
const examples = [
  ['birthday', 'foto-editorial'],
  ['wedding', 'ilustrado'],
  ['quinceanera', 'gravado'],
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const ptContext = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
    const pt = await ptContext.newPage();
    await pt.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await pt.waitForURL(url => /^\/pt-br\/?$/.test(url.pathname));
    assert.equal(await pt.evaluate(() => localStorage.getItem('planne-language')), 'pt');
    assert.equal(await pt.locator('.m-invite-shots iframe').count(), 3);
    for (let i = 0; i < examples.length; i++) {
      const [occasion, style] = examples[i];
      assert.equal(new URL(await pt.locator('.m-invite-shots iframe').nth(i).getAttribute('src'), base).search,
        `?landing-preview=${occasion}&lang=pt&style=${style}`);
    }
    await pt.locator('.m-invite-shots').scrollIntoViewIfNeeded();
    assert.match(await pt.frameLocator('.m-invite-shots iframe').nth(0).locator('#event-title').innerText(), /Marina/);
    assert.match(await pt.frameLocator('.m-invite-shots iframe').nth(2).locator('#event-title').innerText(), /Laura/);
    await pt.setViewportSize({ width: 390, height: 844 });
    assert.equal(await pt.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const embedded = pt.frameLocator('.m-invite-shots iframe').first();
    assert.equal(await embedded.locator('html').getAttribute('data-invite-embed'), 'true');
    assert.equal(await embedded.locator('html').evaluate(element => getComputedStyle(element).overflow), 'hidden');
    assert.ok(await embedded.locator('h1').evaluate(element => parseFloat(getComputedStyle(element).fontSize)) <= 41);
    assert.equal(await pt.locator('.m-invite-shots iframe').first().evaluate(element => getComputedStyle(element).pointerEvents), 'none');
    assert.equal(await pt.locator('.m-invite-shots iframe').first().getAttribute('tabindex'), '-1');
    await pt.goto(base + '/pt-br/aniversario', { waitUntil: 'domcontentloaded' });
    assert.equal(await pt.locator('.m-invite-shots iframe').count(), 3);
    assert.equal(await pt.frameLocator('.m-invite-shots iframe').first().locator('html').getAttribute('data-invite-embed'), 'true');
    assert.match(await pt.frameLocator('.m-invite-shots iframe').first().locator('#event-title').innerText(), /Marina/);
    assert.ok(await pt.frameLocator('.m-invite-shots iframe').first().locator('h1').evaluate(element => parseFloat(getComputedStyle(element).fontSize)) <= 41);
    const opened = await pt.context().newPage();
    await opened.goto(base + '/rsvp-v2?landing-preview=birthday&lang=pt&style=foto-editorial', { waitUntil: 'domcontentloaded' });
    assert.equal(await opened.locator('html').getAttribute('data-invite-embed'), null);
    await opened.close();
    await pt.goto(base + '/pt-br', { waitUntil: 'domcontentloaded' });
    await pt.setViewportSize({ width: 1280, height: 900 });
    await pt.locator('.m-language').click();
    await pt.waitForURL(base + '/');
    assert.equal(await pt.evaluate(() => localStorage.getItem('planne-language')), 'en');
    await pt.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(new URL(pt.url()).pathname, '/');
    assert.equal(await pt.locator('.m-invite-shots iframe').count(), 3);
    for (let i = 0; i < examples.length; i++) {
      const [occasion, style] = examples[i];
      assert.equal(new URL(await pt.locator('.m-invite-shots iframe').nth(i).getAttribute('src'), base).search,
        `?landing-preview=${occasion}&lang=en&style=${style}`);
    }
    await ptContext.close();

    const enContext = await browser.newContext({ locale: 'en-US' });
    const en = await enContext.newPage();
    await en.goto(base + '/', { waitUntil: 'domcontentloaded' });
    assert.equal(new URL(en.url()).pathname, '/');
    assert.equal(await en.evaluate(() => localStorage.getItem('planne-language')), 'en');
    await en.goto(base + '/pt-br/', { waitUntil: 'domcontentloaded' });
    assert.match(new URL(en.url()).pathname, /^\/pt-br\/?$/);
    await enContext.close();
    console.log('Home: idioma do navegador, preferência manual persistida, três ocasiões e prévias PT/EN OK.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
