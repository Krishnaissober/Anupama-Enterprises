import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const e=JSON.parse(await readFile('src/generated/product-enrichment.json','utf8'));
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),errors=[];
try{
 const page=await b.newPage();page.on('pageerror',err=>errors.push(err.message));
 for(const width of [375,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const [slug,id] of [['plain-corrugated-boxes','CAT-006'],['direct-thermal-label-cat-016','CAT-016'],['sliver-pouches-cat-053','CAT-053']]){
   await page.goto('http://127.0.0.1:4173/products/'+slug,{waitUntil:'networkidle'});
   const r=e.records[id],p=e.profiles[r.profileId];
   assert.equal(await page.locator('.detail-verification').getAttribute('open'),null);
   assert.equal(await page.locator('.detail-reference-accordions details[open]').count(),0);
   assert.equal(await page.locator('.product-external-reference').count(),1);
   if(r.sizeEntries.length)assert.deepEqual(await page.locator('.product-size-section tbody td').allTextContents(),r.sizeEntries.map(s=>s.value));
   assert.ok(await page.locator('.catalogue-related .category-image-stage').count());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('[href^="tel:"],[href^="mailto:"],[href*="wa.me"]').count(),0);
   const order=await page.evaluate(()=>{let selectors=['.catalogue-detail','.catalogue-specifications','.product-size-section','.product-external-reference','.catalogue-related','#catalogue-enquire','.detail-verification'];return selectors.filter(s=>document.querySelector(s)).map(s=>({s,y:document.querySelector(s).getBoundingClientRect().top+scrollY}));});
   for(let i=1;i<order.length;i++)assert.ok(order[i].y>=order[i-1].y,JSON.stringify(order));
   if([375,1440].includes(width)){await page.screenshot({path:`tmp/homepage-qa/premium-${width}-${id}.png`,fullPage:true});}
   for(const d of await page.locator('.detail-reference-accordions details').all()){await d.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await d.getAttribute('open'),'');}
   assert.equal(await page.locator('.product-reference-summary').innerText(),p.fields.summary.value);
   assert.ok((await page.locator('.detail-reference-accordions').innerText()).includes(p.fields.description.value));
   await page.locator('.detail-verification > summary').focus();await page.keyboard.press('Enter');
   assert.deepEqual(await page.locator('.product-confirmation li').allTextContents(),r.confirmationItems.map(x=>x.value));
   await page.locator('.product-reference-sources summary').click();assert.ok(await page.locator('.product-reference-sources a').count());
   if(id==='CAT-006'){const opener=page.locator('.product-gallery-primary');await opener.focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await opener.evaluate(el=>el===document.activeElement),true);}
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/products/plain-corrugated-boxes',{waitUntil:'networkidle'});assert.equal(await page.locator('.product-gallery-primary .media-window').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);await writeFile('tmp/homepage-qa/premium-product-report.json',JSON.stringify({status:'passed',widths:[375,390,768,1024,1440,1920],checks:['photo/labels/ambiguous no-photo product presentations','source sizes and confirmation list unchanged','ordered hierarchy','research collapsed by default and accessible by keyboard','bottom source disclosure preserves source links','related visual stages','lightbox Escape and focus restoration','reduced motion','no active unapproved contacts','no horizontal overflow'],errors},null,2));console.log('Premium product presentation checks passed');
}finally{await b.close();}
