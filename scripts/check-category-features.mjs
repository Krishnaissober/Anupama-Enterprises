import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const {products,categories}=JSON.parse(await readFile('src/generated/catalogue-data.json','utf8')),assets=JSON.parse(await readFile('src/data/catalogue-images.json','utf8'));
// Exercise the actual selector without changing production data or shipping test imagery.
const source=(await readFile('src/catalogue/categoryFeatured.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace('export function','function');
const select=new Function('products','images',source+'\nreturn selectCategoryFeature;')(products,assets);
const c={slug:'test'},items=[{id:'a',categorySlug:'test',imageKey:'a'},{id:'b',categorySlug:'test',imageKey:'b'},{id:'other',categorySlug:'other',imageKey:'other'}],fixture={a:{src:'/assets/images/a.png',width:100,height:100,approved:true},b:{src:'/assets/images/b.png',width:800,height:800},other:{src:'/assets/images/other.png',width:900,height:900,approved:true}};
assert.equal(select(c,items,fixture).product.id,'a');fixture.a.approved=false;assert.equal(select(c,items,fixture).product.id,'b');fixture.b.sourceKind='generated-illustration';assert.equal(select(c,items,fixture).product.id,'a');fixture.a.src='https://example.com/photo.png';assert.equal(select(c,items,fixture).imageKey,null);assert.equal(select(c,items,fixture).product.id,'a');
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),errors=[],checked=[];
try{const page=await b.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const width of [375,768,1440]){await page.setViewportSize({width,height:1000});for(const slug of ['paper-courier-bags','corrugated-boxes','protective-packaging','sticker-label','tapes','carry-bags']){
  const category=categories.find(c=>c.slug===slug),feature=select(category);await page.goto(`http://127.0.0.1:4173/products/category/${slug}`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('h1').innerText(),category.name);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const hero=page.locator('.category-hero-image-link');assert.equal(await hero.getAttribute('href'),`/products/${feature.product.slug}`);
  if(feature.imageKey){const image=page.locator('.category-hero-visual img');await image.evaluate(i=>i.decode());assert.equal(await image.getAttribute('src'),assets[feature.imageKey].src);assert.equal(await page.locator('.category-featured img').getAttribute('src'),assets[feature.imageKey].src);assert.equal(await page.locator('.category-featured .catalogue-product-link').getAttribute('href'),`/products/${feature.product.slug}`);}else{assert.equal(await page.locator('.category-hero-visual img').count(),0);assert.match(await hero.innerText(),/Image pending approval/);}
  await hero.focus();assert.equal(await hero.evaluate(e=>e===document.activeElement),true);await page.locator('h1').click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(900);await page.screenshot({path:`tmp/homepage-qa/featured-${width}-${slug}.png`});checked.push({width,slug,id:feature.product.id,imageKey:feature.imageKey});
 }}
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/products/category/protective-packaging',{waitUntil:'networkidle'});await page.locator('.category-hero-image-link').hover();assert.equal(await page.locator('.category-hero-visual img').evaluate(e=>getComputedStyle(e).transform),'none');
 await page.locator('.category-featured .catalogue-product-link').click();await page.waitForLoadState('networkidle');await page.locator('.product-gallery').waitFor();assert.equal(await page.locator('h1').innerText(),'STRECH FILM ROLL');await page.getByRole('link',{name:'Discuss this product',exact:true}).click();assert.ok(page.url().endsWith('#catalogue-enquire'));
 assert.deepEqual(errors,[]);await writeFile('tmp/homepage-qa/category-feature-report.json',JSON.stringify({status:'passed',checked,errors},null,2));console.log('Featured selector, six category visuals at three widths, keyboard focus, reduced motion and detail/enquiry flow passed');
}finally{await b.close();}
