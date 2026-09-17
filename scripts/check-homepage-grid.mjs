import { chromium } from 'file:///C:/Users/Jeswin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true });
const page = await browser.newPage(), errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', e => { if(e.type()==='error') errors.push(e.text()); });
try {
  for(const width of [375,390,768,1024,1440,1920]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
    await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode();}));});
    const geometry = await page.evaluate(()=>{
      const selectors=['.header-row','.hero','#discover','#range','.requirement-inner','#business','#enquire > .container','.brand-text-scene > .container','.footer'];
      return selectors.map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return{selector,left:r.left+parseFloat(s.paddingLeft),right:r.right-parseFloat(s.paddingRight)};});
    });
    for(const item of geometry) { assert(Math.abs(item.left-geometry[0].left)<1,`${width}: left ${item.selector}`); assert(Math.abs(item.right-geometry[0].right)<1,`${width}: right ${item.selector}`); }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    for(const selector of ['.hero','#discover','#range','#requirements','#business','#enquire','.brand-text-scene']) { await page.locator(selector).scrollIntoViewIfNeeded(); await page.waitForTimeout(650); }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(900);
    await page.screenshot({path:`tmp/homepage-qa/grid-${width}-full.png`,fullPage:true});
    results.push({width,geometry,overflow:false});
  }
  assert.deepEqual(errors,[]);
  const report={status:'passed',results,errors}; await writeFile('tmp/homepage-qa/grid-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
