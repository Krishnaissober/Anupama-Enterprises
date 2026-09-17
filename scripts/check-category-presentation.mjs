import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const errors=[],checks=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,375,390,768,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const slug of ['corrugated-boxes','paper-courier-bags','sticker-label','plastic-courier-bags']){
   await page.goto(`http://127.0.0.1:4173/products/category/${slug}`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('.category-editorial-hero').count(),1);
   await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode();}));});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('.catalogue-results .catalogue-no-image').count(),0);
   assert.equal(await page.evaluate(()=>[...document.images].some(i=>!i.complete||!i.naturalWidth)),false);
   const link=page.locator('.category-editorial-product .catalogue-product-link').first();
   await link.focus();assert.equal(await link.evaluate(e=>e===document.activeElement),true);
   await page.locator('h1').click();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(1000);
   if([375,768,1440].includes(width))await page.screenshot({path:`tmp/homepage-qa/category-polish-${width}-${slug}-hero.png`});
   await page.locator('.catalogue-product-list').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
   if([375,1440].includes(width))await page.screenshot({path:`tmp/homepage-qa/category-polish-${width}-${slug}-collection.png`});
  }
 }
 checks.push('four categories at six widths; loaded images; no overflow or empty image blocks; keyboard focus');
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/products/category/corrugated-boxes',{waitUntil:'networkidle'});
 const first=page.locator('.category-editorial-product .catalogue-product-link').first();await first.hover();await page.waitForTimeout(500);
 assert.notEqual(await first.locator('img').evaluate(e=>getComputedStyle(e).transform),'none');
 await first.click();await page.waitForLoadState('networkidle');assert.match(page.url(),/\/products\/plain-corrugated-boxes-cat-006/);assert.equal(await page.locator('.product-gallery').count(),1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/products/category/corrugated-boxes',{waitUntil:'networkidle'});
 const hero=page.locator('.category-hero-image-link');await hero.hover();assert.equal(await hero.locator('img').evaluate(e=>getComputedStyle(e).transform),'none');assert.equal(await page.locator('.category-hero-visual .category-image-stage').evaluate(e=>getComputedStyle(e).animationName),'none');
 checks.push('hover scale, product navigation to enriched detail, reduced-motion static image and reveal');
 await page.route('**/assets/images/catalogue/boxes-page-08.png',route=>route.abort());await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('.category-hero-visual .catalogue-image-fallback').count(),1);
 assert.notEqual(await page.locator('.category-hero-visual .category-image-stage').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
 checks.push('failed hero image retains designated background and fallback');
 assert.deepEqual(errors,[]);await writeFile('tmp/homepage-qa/category-presentation-report.json',JSON.stringify({status:'passed',checks,errors},null,2));console.log({status:'passed',checks,errors});
}finally{await browser.close();}
