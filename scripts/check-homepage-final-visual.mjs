import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], shots = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!document.querySelector('.hero-main .product-incoming'), { timeout: 12000 });
  assert.equal(await page.locator('.hero-main .product-outgoing').evaluate(e => getComputedStyle(e).opacity), '1');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tmp/homepage-qa/final-transition-midpoint.png' });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.hero-main .product-outgoing').count(), 0);
  const lastImage = () => page.locator('.hero-main .product-layer:last-child img').getAttribute('src');
  await page.locator('.hero-foot .motion-toggle').click();
  await page.mouse.move(0,0); await page.locator('.hero-foot .motion-toggle').evaluate(e => e.blur());
  const paused = await lastImage(); await page.waitForTimeout(9000); assert.equal(await lastImage(), paused);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => document.querySelector('.hero-foot .motion-toggle').click());
  await page.waitForTimeout(9000); assert.equal(await lastImage(), paused);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const selectors = ['.hero', '#discover', '#range', '#requirements', '#business', '.brand-text-scene'];
  for (const width of [1440,390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    for (const selector of selectors) {
      const section = page.locator(selector); await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      await section.locator('img').evaluateAll(async imgs => { await Promise.all(imgs.map(img => { img.loading = 'eager'; return img.decode(); })); });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const path = `tmp/homepage-qa/final-${width}-${selector.replace(/[^a-z]/g,'')}.png`;
      // Exclude the sticky navigation from section-only captures; viewport QA separately checks navigation.
      await section.screenshot({ path, style: '.site-header, .skip-link { visibility: hidden !important; }' }); shots.push(path);
    }
  }
  assert.deepEqual(errors, []);
  const report = { status: 'passed', checks: ['opaque outgoing image during reveal', 'transition cleanup', 'explicit rotation pause', 'reduced-motion rotation pause', 'six rendered sections at desktop and mobile widths', 'no image decode errors, console errors or overflow'], screenshots: shots, errors };
  await writeFile('tmp/homepage-qa/final-visual-report.json', JSON.stringify(report,null,2)); console.log(JSON.stringify(report));
} finally { await browser.close(); }
