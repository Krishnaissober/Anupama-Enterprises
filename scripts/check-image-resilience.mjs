import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    let release; const gate=new Promise(resolve=>release=resolve);
    await page.route('**/assets/images/**',async route=>{await gate;await route.continue();});
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(250);
    const grounds=await page.locator('.hero .real-media').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));
    assert.equal(grounds.length,3);assert.ok(grounds.every(c=>c!=='rgb(255, 255, 255)'&&c!=='rgba(0, 0, 0, 0)'));
    assert.equal(await page.locator('.hero img').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).visibility==='hidden')),true);
    await page.locator('.hero-composition').screenshot({path:`tmp/homepage-qa/image-waiting-${width}.png`});
    release();
    await page.waitForFunction(()=>[...document.querySelectorAll('.hero img')].every(n=>n.complete&&n.naturalWidth&&getComputedStyle(n).visibility==='visible'));
    await page.locator('#discover').scrollIntoViewIfNeeded();
    for(const name of ['Tapes','Labels','Boxes','Labels','Tapes','Labels']) {
      await page.locator('.category-choice').filter({hasText:name}).focus();await page.waitForTimeout(70);
    }
    await page.waitForTimeout(1400);
    assert.equal(await page.locator('.category-stage .product-transition').getAttribute('data-product'),'labels');
    assert.equal(await page.locator('.category-stage .product-layer').count(),1);
    assert.equal(await page.locator('.hero .real-media').evaluateAll(nodes=>JSON.stringify(nodes.map(n=>getComputedStyle(n).backgroundColor))),JSON.stringify(grounds));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.category-choice').filter({hasText:'Boxes'}).focus();await page.waitForTimeout(200);
    assert.equal(await page.locator('.category-stage .product-outgoing').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);await page.close();
    const failed=await browser.newPage({viewport:{width,height:1000}});
    await failed.route('**/assets/images/**',route=>route.abort());
    await failed.goto('http://127.0.0.1:4173/');
    await failed.waitForFunction(()=>document.querySelectorAll('.hero .catalogue-image-fallback').length===3);
    assert.equal(await failed.locator('.hero .real-media').evaluateAll(nodes=>JSON.stringify(nodes.map(n=>getComputedStyle(n).backgroundColor))),JSON.stringify(grounds));
    await failed.locator('.hero-composition').screenshot({path:`tmp/homepage-qa/image-error-${width}.png`});
    await failed.close();console.log(`${width}: delayed decoding, persistent backgrounds, rapid switching, cleanup, reduced motion and error fallback passed`);
  }
} finally {await browser.close();}
