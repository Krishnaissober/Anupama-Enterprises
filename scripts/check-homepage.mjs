import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const output = new URL('../tmp/homepage-qa/', import.meta.url);
const baseURL = process.env.HOMEPAGE_QA_URL || 'http://127.0.0.1:5173/';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const page = await browser.newPage();
const errors = []; const externalRequests = []; const failures = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!r.url().startsWith(baseURL) && !r.url().startsWith('data:')) externalRequests.push(r.url()); });
page.on('response', r => { if (r.status() >= 400) failures.push({ url: r.url(), status: r.status() }); });
const screenshots = []; const viewports = [];
try {
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    // Verify lazy images too, rather than treating not-yet-requested assets as broken.
    await page.evaluate(async () => { await Promise.all([...document.images].map(async image => { image.loading = 'eager'; await image.decode(); })); });
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, h1Count: document.querySelectorAll('h1').length,
      brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).length,
      malformedLabels: [...document.querySelectorAll('[aria-label]')].filter(e => e.getAttribute('aria-label').includes('[object Object]')).length,
      deadAnchors: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h === '#' || !document.getElementById(h.slice(1))) }));
    assert(dimensions.content <= dimensions.viewport, `Horizontal overflow at ${width}: ${dimensions.content}`);
    assert.equal(dimensions.h1Count, 1); assert.equal(dimensions.brokenImages, 0); assert.equal(dimensions.malformedLabels, 0); assert.equal(dimensions.deadAnchors.length, 0);
    viewports.push({ width, ...dimensions });
    const path = new URL(`homepage-${width}.png`, output);
    await page.screenshot({ path: fileURLToPath(path), fullPage: true });
    await page.screenshot({ path: fileURLToPath(new URL(`hero-${width}.png`, output)), fullPage: false });
    screenshots.push(path.href);
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const menu = page.getByRole('dialog', { name: 'Navigation', exact: true });
  await menu.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert(await menu.evaluate(d => d.contains(document.activeElement)), 'Menu focus escaped'); }
  await page.keyboard.press('Escape');
  await menu.waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).evaluate(b => b === document.activeElement), true);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await menu.getByRole('link', { name: 'Have a requirement?', exact: true }).click();
  await menu.waitFor({ state: 'hidden' });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'requirements');
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  const search = page.getByRole('searchbox', { name: 'Search catalogue references', exact: true });
  await search.fill('paper');
  await page.getByRole('button', { name: 'Search catalogue references', exact: true }).click();
  assert.equal(await page.locator('.reference-list li').count(), 1);
  await page.getByRole('button', { name: 'Corrugated boxes', exact: true }).click();
  await page.getByRole('heading', { name: 'No matching references.', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Clear search and filters', exact: false }).click();
  assert.equal(await page.locator('.reference-list li').count(), 7);
  await page.getByRole('button', { name: 'Paper courier bags', exact: true }).click();
  await page.getByRole('button', { name: 'Corrugated boxes', exact: true }).click();
  assert.equal(await page.locator('.reference-list li').count(), 2, 'OR category matching');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Office', exact: true }).click();
  assert.equal(await page.locator('.reference-list li').count(), 1);
  assert.match(await page.locator('.reference-list').innerText(), /POS THEMAL BILLING ROLL/);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  const first = page.locator('.reference-row').first();
  await page.locator('.source-results summary').click();
  await first.click();
  const preview = page.getByRole('dialog', { name: 'Catalogue reference preview', exact: true });
  await preview.waitFor({ state: 'visible' });
  assert.match(await preview.innerText(), /PDF page 5/i);
  await page.keyboard.press('Escape');
  await preview.waitFor({ state: 'hidden' });
  assert(await first.evaluate(e => document.activeElement === e), 'Reference focus did not restore');
  await first.click();
  await preview.getByRole('button', { name: 'Discuss this reference', exact: false }).click();
  await preview.waitFor({ state: 'hidden' });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'enquire');
  assert.match(await page.locator('.selected-context').innerText(), /PLAIN PAPER COURIER BAG/);
  assert.equal(await page.locator('.contact-choice:disabled').count(), 3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.arrow').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  assert.equal(await page.evaluate(() => !!document.querySelector('meta[name="robots"][content="noindex, nofollow"]')), true);
  assert.equal(externalRequests.length, 0, 'Unexpected external browser requests');
  assert.equal(errors.length, 0, 'Browser errors'); assert.equal(failures.length, 0, 'HTTP failures');
  const report = { status: 'passed', viewports, errors, failures, externalRequests, screenshots, checks: ['search', 'AND query / OR categories', 'no results and reset', 'need shortcuts', 'reference preview', 'contextual enquiry anchor', 'mobile focus trap/Escape/return', 'menu destination focus', 'reduced motion', 'disabled unapproved contacts', 'noindex preview', 'no external requests'] };
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
