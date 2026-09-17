import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),errors=[];
try{
 const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,375,390,768,1440,1920]){
  await p.setViewportSize({width,height:1000});await p.goto('http://127.0.0.1:4173/products',{waitUntil:'networkidle'});
  assert.equal(await p.locator('.hub-hero').count(),1);assert.equal(await p.locator('.hub-category').count(),10);
  await p.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode();}));});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.locator('.catalogue-results .catalogue-no-image').count(),0);
  assert.equal(await p.locator('.hub-product-information .category-image-stage').count(),0);
  if([375,768,1440].includes(width)){
   await p.waitForTimeout(1000);await p.screenshot({path:`tmp/homepage-qa/hub-after-${width}.png`});
   for(const [name,selector] of [['explorer','.hub-explorer'],['results','.catalogue-results']]){await p.locator(selector).evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-100));await p.waitForTimeout(1000);await p.screenshot({path:`tmp/homepage-qa/hub-after-${width}-${name}.png`});}
  }
 }
 await p.setViewportSize({width:1440,height:1000});await p.goto('http://127.0.0.1:4173/products',{waitUntil:'networkidle'});
 const link=p.locator('.hub-product .catalogue-product-link').first();await link.focus();assert.equal(await link.evaluate(e=>e===document.activeElement),true);await Promise.all([p.waitForURL('**/products/plain-paper-courier-bag-cat-001'),p.keyboard.press('Enter')]);await p.waitForLoadState('networkidle');await p.locator('.product-gallery').waitFor();assert.equal(await p.locator('.product-gallery').count(),1);await p.waitForTimeout(1000);await p.screenshot({path:'tmp/homepage-qa/hub-connected-detail.png'});
 await p.goto('http://127.0.0.1:4173/products/category/corrugated-boxes',{waitUntil:'networkidle'});assert.equal(await p.locator('.category-editorial-hero').count(),1);assert.equal(await p.locator('.category-featured').count(),1);await p.waitForTimeout(1000);await p.screenshot({path:'tmp/homepage-qa/hub-connected-category.png'});
 await p.emulateMedia({reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4173/products',{waitUntil:'networkidle'});const photo=p.locator('.hub-product-photo img').first();await photo.hover();assert.equal(await photo.evaluate(e=>getComputedStyle(e).transform),'none');
 await p.route('**/assets/images/catalogue/labels-page-14.png',r=>r.abort());await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('.hub-hero-labels .catalogue-image-fallback').count(),1);assert.notEqual(await p.locator('.hub-hero-labels').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
 assert.deepEqual(errors,[]);const report={status:'passed',widths:[320,375,390,768,1440,1920],checks:['hub hero and ten category explorer links','no empty photo panels for unphotographed references','decoded images and no horizontal overflow','keyboard navigation to rich detail','separate editorial category route','reduced-motion hover','failed hero image retains material background'],errors};await writeFile('tmp/homepage-qa/hub-presentation-report.json',JSON.stringify(report,null,2));console.log(report);
}finally{await b.close();}


