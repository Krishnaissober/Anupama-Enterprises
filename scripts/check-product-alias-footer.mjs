import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),errors=[],routes=[],checks=[];
async function assertFullBase(page){
 const base=page.locator('.brand-text-scene [data-wordmark-base]');assert.equal(await base.count(),1);assert.equal(await base.textContent(),'ANUPAMA ENTERPRISES');
 const state=await base.evaluate(e=>{const s=getComputedStyle(e),r=e.getBBox();return {dash:s.strokeDasharray,offset:s.strokeDashoffset,opacity:s.opacity,stroke:s.stroke,x:r.x,y:r.y,right:r.x+r.width,bottom:r.y+r.height};});
 assert.equal(state.dash,'none');assert.equal(Number.parseFloat(state.offset),0);assert.equal(state.opacity,'1');assert.notEqual(state.stroke,'none');assert.ok(state.x>=0&&state.right<=300&&state.y>=0&&state.bottom<=80,JSON.stringify(state));
}
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [375,390,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});
  for(const [path,kind,title] of [['/products/category/corrugated-boxes','category','Corrugated Boxes'],['/products/plain-corrugated-boxes','detail','PLAIN CORRUGATED BOXES']]){
   await page.goto('http://127.0.0.1:4173'+path,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').innerText(),title);
   assert.equal(await page.locator('.category-editorial-hero').count(),kind==='category'?1:0);assert.equal(await page.locator('.catalogue-detail').count(),kind==='detail'?1:0);
   if(kind==='detail'){
    for(const selector of ['.product-gallery','.product-catalogue-summary','.catalogue-specifications','.product-size-section','.product-linked-references','.product-external-reference','.product-confirmation','.catalogue-related','#catalogue-enquire'])assert.equal(await page.locator(selector).count(),1);
    await page.locator('.product-gallery-primary img').evaluate(i=>i.decode());assert.ok((await page.locator('.catalogue-specifications').innerText()).includes('AVAILABLE SIZES (LxBxH)'));assert.equal(await page.locator('.product-size-section tbody tr').count(),8);
    assert.equal(await page.getByRole('link',{name:'Discuss this product',exact:true}).count(),1);assert.match(await page.locator('.catalogue-detail-status').innerText(),/requires confirmation/);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'http://127.0.0.1:4173/products/plain-corrugated-boxes-cat-006');
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);routes.push({width,url:page.url(),kind,title});
   if([375,1440].includes(width)){await page.waitForTimeout(900);await page.screenshot({path:`tmp/homepage-qa/route-fix-${width}-${kind}.png`});}
  }
  // Before lazy enhancement loads, the fallback must already contain a complete outline.
  await assertFullBase(page);await page.locator('.brand-text-scene').scrollIntoViewIfNeeded();await page.locator('.text-hover-effect').waitFor();
  for(const delay of [0,100,500,1500]){if(delay)await page.waitForTimeout(delay);await assertFullBase(page);}
  const svg=page.locator('.text-hover-effect');await svg.hover();await assertFullBase(page);await svg.focus();await assertFullBase(page);assert.equal(await svg.evaluate(e=>e===document.activeElement),true);
  await page.mouse.move(0,0);await svg.evaluate(e=>e.blur());await assertFullBase(page);
  if([375,1440].includes(width))await page.screenshot({path:`tmp/homepage-qa/wordmark-resting-${width}.png`});
  await page.emulateMedia({reducedMotion:'reduce'});await assertFullBase(page);await page.locator('[data-wordmark-enhancement]').waitFor({state:'detached'});await page.reload({waitUntil:'networkidle'});await assertFullBase(page);await page.locator('.brand-text-scene').scrollIntoViewIfNeeded();await page.locator('.text-hover-effect').waitFor();await assertFullBase(page);assert.equal(await page.locator('[data-wordmark-enhancement]').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});
 }
 checks.push('six widths: distinct category and product alias routes','complete detail: gallery, source details, eight exact size entries, linked options, general context, status, related references and enquiry','canonical targets unique original detail URL','wordmark full before enhancement, during early drawing, hover, focus and resting','wordmark bounds fit SVG; no page overflow','reduced-motion initial load and live preference: immediate static full outline');
 assert.deepEqual(errors,[]);await writeFile('tmp/homepage-qa/product-alias-footer-report.json',JSON.stringify({status:'passed',routes,checks,errors},null,2));console.log({status:'passed',checks,errors});
}finally{await browser.close();}
