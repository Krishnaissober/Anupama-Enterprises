import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const page = await browser.newPage();
const checks = [];
const baseURL = process.env.HOMEPAGE_QA_URL || 'http://127.0.0.1:5173/';
try {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    const content = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(content <= width, `200% text overflow at ${width}: ${content}`);
    checks.push({ width, textSize: '200%', content, passed: true });
    await page.evaluate(() => document.documentElement.style.removeProperty('font-size'));
    for (const selector of ['#discover', '#showcase', '#enquire']) {
      const section = page.locator(selector);
      if (await section.count()) {
        await section.scrollIntoViewIfNeeded();
        await page.screenshot({ path: fileURLToPath(new URL(`../tmp/homepage-qa/section-${selector.slice(1)}-${width}.png`, import.meta.url)) });
      }
    }
  }
  await writeFile(new URL('../tmp/homepage-qa/reflow-report.json', import.meta.url), JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks, null, 2));
} finally { await browser.close(); }
