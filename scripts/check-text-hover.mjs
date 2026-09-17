import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}), errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  const svg=page.locator('.text-hover-effect');
  await page.locator('.brand-text-scene').scrollIntoViewIfNeeded();
  await svg.scrollIntoViewIfNeeded();await page.waitForTimeout(4200);
  assert.equal(await svg.getAttribute('aria-label'),'ANUPAMA ENTERPRISES');
  assert.equal(await page.locator('footer .text-hover-effect').count(),1);
  const box=await svg.boundingBox();
  await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);await page.waitForTimeout(350);
  assert.equal(await svg.locator('text').last().evaluate(e=>getComputedStyle(e).opacity),'1');
  const cx=await svg.locator('radialGradient').getAttribute('cx');
  assert.notEqual(cx,'50%');
  await page.screenshot({path:fileURLToPath(new URL('../tmp/homepage-qa/text-hover-desktop.png',import.meta.url))});
  await page.mouse.move(0,0);assert.equal(await svg.locator('text').last().evaluate(e=>getComputedStyle(e).opacity),'0');
  await svg.focus();
  assert.equal(await svg.locator('text').last().evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.equal(await svg.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  await svg.evaluate(e=>e.blur());
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5);await page.waitForTimeout(350);
  assert.equal(await svg.locator('text').last().evaluate(e=>getComputedStyle(e).opacity),'0');
  assert.equal(await svg.locator('text').first().getAttribute('stroke-dashoffset'),'0');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
  await svg.scrollIntoViewIfNeeded();
  await page.screenshot({path:fileURLToPath(new URL('../tmp/homepage-qa/text-hover-mobile.png',import.meta.url))});
  assert.equal(errors.length,0);
  const report={status:'passed',checks:['ANUPAMA SVG rendered','stroke settles','cursor updates gradient mask','hover/leave gradient visibility','live reduced-motion removes hover','390px reflow'],errors};
  await writeFile(new URL('../tmp/homepage-qa/text-hover-report.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
} finally {await browser.close();}

