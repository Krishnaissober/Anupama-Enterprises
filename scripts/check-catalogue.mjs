import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {products,categories}=JSON.parse(await readFile('src/generated/catalogue-data.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const errors=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/products',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.catalogue-category').count(),10);
 assert.match(await page.locator('.catalogue-result-summary').innerText(),/57 catalogue references/);
 await page.locator('#catalogue-search').fill('PLAIN PAPER COURIER BAG');await page.getByRole('button',{name:'Search',exact:true}).click();await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('.catalogue-product').count(),1);assert.match(page.url(),/q=/);
 await page.locator('.catalogue-active-filters a').first().click();await page.waitForLoadState('networkidle');assert.match(await page.locator('.catalogue-result-summary').innerText(),/57 catalogue references/);
 await page.locator('#catalogue-search').fill('zz-nonexistent');await page.getByRole('button',{name:'Search',exact:true}).click();await page.waitForLoadState('networkidle');assert.equal(await page.locator('.catalogue-empty').count(),1);
 await page.getByRole('link',{name:'Reset search and filters'}).click();await page.waitForLoadState('networkidle');
 await page.locator('.catalogue-desktop-filters').getByLabel('Paper Courier Bags').check();await page.locator('.catalogue-desktop-filters').getByLabel('Corrugated Boxes',{exact:true}).check();await page.getByRole('button',{name:'Apply categories'}).click();await page.waitForLoadState('networkidle');
 assert.match(await page.locator('.catalogue-result-summary').innerText(),/9 catalogue references/);
 await page.goBack({waitUntil:'networkidle'});assert.match(await page.locator('.catalogue-result-summary').innerText(),/57 catalogue references/);
 checks.push('search, clear, empty/reset, OR category filtering, URL state and Back');
 for(const c of categories){await page.goto(`http://127.0.0.1:4173/products/category/${c.slug}`,{waitUntil:"networkidle"});assert.equal(await page.locator('h1').innerText(),c.name);assert.match(await page.locator('.catalogue-result-summary').innerText(),new RegExp(`${c.count} catalogue reference`));}
 for(const p of products){await page.goto(`http://127.0.0.1:4173/products/${p.slug}`,{waitUntil:"networkidle"});assert.equal(await page.locator('h1').innerText(),p.name);const links=await page.locator('.catalogue-related .catalogue-product-link').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert.ok(links.every(href=>products.some(other=>href===`/products/${other.slug}`&&other.categorySlug===p.categorySlug&&other.id!==p.id)));assert.equal(await page.locator('[href^="tel:"],[href^="mailto:"],[href*="wa.me"]').count(),0);}
 checks.push('10 category routes, 57 detail routes, related-category integrity, inactive contacts');
 const label=products.find(p=>p.id==='CAT-016');
 for(const width of [375,390,768,1440,1920]){await page.setViewportSize({width,height:1000});for(const [name,path] of [['hub','/products'],['category',`/products/category/${categories[0].slug}`],['detail',`/products/${label.slug}`]]){await page.goto(`http://127.0.0.1:4173${path}`,{waitUntil:"networkidle"});await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode();}));});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('h1').count(),1);await page.screenshot({path:`tmp/homepage-qa/catalogue-${width}-${name}.png`,fullPage:true});}}
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/products',{waitUntil:'networkidle'});const trigger=page.getByRole('button',{name:'Filters',exact:true});await trigger.click();await page.waitForLoadState('networkidle');const dialog=page.getByRole('dialog',{name:'Catalogue filters'});await dialog.getByLabel('Tapes',{exact:true}).check();await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await page.waitForLoadState('networkidle');assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);await trigger.click();await page.waitForLoadState('networkidle');assert.equal(await dialog.getByLabel('Tapes',{exact:true}).isChecked(),false);await dialog.getByLabel('Tapes',{exact:true}).check();await dialog.getByRole('button',{name:'Apply filters'}).click();await page.waitForLoadState('networkidle');assert.match(await page.locator('.catalogue-result-summary').innerText(),/15 catalogue references/);
 await page.getByRole('button',{name:'Filters (1)'}).click();await page.waitForLoadState('networkidle');await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`http://127.0.0.1:4173/products/${label.slug}`,{waitUntil:"networkidle"});await page.locator('.catalogue-detail img').first().waitFor();assert.equal(await page.locator('.catalogue-detail img').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.goto('http://127.0.0.1:4173/products/not-real',{waitUntil:'networkidle'});assert.equal(await page.locator('h1').innerText(),'Reference not found.');
 checks.push('five widths: hub/category/detail, mobile apply/cancel/Escape/focus return, reduced motion, missing route');
 assert.deepEqual(errors,[]);await writeFile('tmp/homepage-qa/catalogue-report.json',JSON.stringify({status:'passed',checks,errors},null,2));console.log(JSON.stringify({status:'passed',checks,errors}));
}finally{await browser.close();}



