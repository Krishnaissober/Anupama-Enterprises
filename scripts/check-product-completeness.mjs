import {chromium} from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {products}=JSON.parse(await readFile('src/generated/catalogue-data.json','utf8')),enrichment=JSON.parse(await readFile('src/generated/product-enrichment.json','utf8'));
assert.equal(new Set(products.map(p=>p.slug)).size,products.length);
const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),errors=[],records=products.map(p=>({id:p.id,product:p.name,route:`/products/${p.slug}`,status:'COMPLETE',missing:[],widths:[]}));
try{
 await Promise.all([375,390,768,1024,1440,1920].map(async width=>{
  const page=await b.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  for(const [i,p] of products.entries()){
   const result=records[i],r=enrichment.records[p.id],profile=enrichment.profiles[r?.profileId];
   try{
    await page.goto(`http://127.0.0.1:4173/products/${p.slug}`,{waitUntil:'domcontentloaded'});await page.locator('.detail-verification > summary').waitFor();
    assert.equal(await page.locator('h1').innerText(),p.name);assert.equal(await page.locator('.product-gallery').count(),1);
    assert.ok((await page.locator('.product-catalogue-summary').innerText()).includes(p.name));assert.ok((await page.locator('.product-detail-intro > p.eyebrow').textContent()).includes(p.category));
    assert.equal(await page.getByRole('link',{name:'Discuss this product',exact:true}).count(),1);assert.equal(await page.locator('.product-external-reference').count(),1);
    assert.equal(r.catalogueDescription.sourceType,'catalogue');assert.ok(profile.fields.summary.sourceUrl);assert.equal(profile.fields.summary.sourceType,'external-research');
    for(const value of [p.specification,p.material,p.customisation].filter(Boolean))assert.ok((await page.locator('#main-content').innerText()).includes(value));
    if(r.sizeEntries.length)assert.deepEqual(await page.locator('.product-size-section tbody td').allTextContents(),r.sizeEntries.map(s=>s.value));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(await page.locator('[href^="tel:"],[href^="mailto:"],[href*="wa.me"]').count(),0);
    assert.match(await page.title(),new RegExp(p.id));assert.ok((await page.locator('link[rel=canonical]').getAttribute('href')).endsWith(`/products/${p.slug}`));
    if(products.some(other=>other.categorySlug===p.categorySlug&&other.id!==p.id))assert.ok(await page.locator('.catalogue-related .catalogue-product-link').count());
    result.widths.push(width);
    if([375,1440].includes(width)&&['CAT-003','CAT-006','CAT-037','CAT-048','CAT-053'].includes(p.id)){await page.waitForTimeout(900);await page.screenshot({path:`tmp/homepage-qa/coverage-${width}-${p.id}.png`});}
   }catch(e){result.status='MISSING';result.missing.push({width,reason:e.message});}
  }await page.close();
 }));
 const partial=products.filter(p=>p.requiresReview||enrichment.records[p.id].researchWithheld).length;
 const counts={detailRoutes:products.length,contextuallyEnriched:products.length-partial,restrictedByAmbiguity:partial,publicationApprovedImages:0,imageApprovalPending:products.length,existingCataloguePhotos:products.filter(p=>p.imageKey).length,technicalCatalogueDetails:products.filter(p=>p.specification||p.material||p.size&&!/contact|customise/i.test(p.size)).length,externalReferences:products.filter(p=>enrichment.records[p.id].profileId).length,ownerConfirmationRequired:products.length};
 const report={status:records.every(r=>r.status==='COMPLETE')&&!errors.length?'COMPLETE':'MISSING',total:products.length,complete:records.filter(r=>r.status==='COMPLETE').length,counts,records,errors};await writeFile('tmp/homepage-qa/product-completeness-report.json',JSON.stringify(report,null,2));
 for(const r of records)console.log(`${r.status} ${r.id} ${r.product}${r.missing.length?' '+JSON.stringify(r.missing):''}`);console.log('OVERALL',report.status,report.complete+'/'+report.total);assert.equal(report.status,'COMPLETE');
}finally{await b.close();}


