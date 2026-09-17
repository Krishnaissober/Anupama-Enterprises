import { readFile, writeFile } from 'node:fs/promises';
const text=await readFile(new URL('../content/catalogue-product-inventory.csv',import.meta.url),'utf8');
const rows=[];let row=[],field='',quoted=false;
for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
if(field||row.length){row.push(field);rows.push(row);}if(quoted)throw Error('Unterminated CSV');
const [header,...values]=rows;const source=values.map(v=>Object.fromEntries(header.map((h,i)=>[h,v[i]])));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const missing=s=>!s||/^(Not |No |Unknown|CURRENT)/i.test(s)||s==='(Contact Us)'?null:s;
// Exact-source images only; category illustrations must never pose as other products.
const imageMap={'CAT-001':'paper','CAT-006':'boxes','CAT-016':'labels','CAT-022':'office','CAT-023':'tapes','CAT-038':'protective'};
const blocked=new Set(['CAT-014','CAT-020','CAT-041']);
const products=source.map(s=>{
 if(s.presence_status!=='PRESENT IN CATALOGUE')throw Error('Unexpected presence status');
 const withheld=blocked.has(s.catalogue_id);
 return {id:s.catalogue_id,slug:`${slug(s.product_verbatim)}-${s.catalogue_id.toLowerCase()}`,name:s.product_verbatim,category:s.category_verbatim,categorySlug:slug(s.category_verbatim),page:Number(s.catalogue_page),presence:s.presence_status,status:s.current_business_status,imageKey:imageMap[s.catalogue_id]||null,variant:missing(s.variant_reference),size:withheld?null:missing(s.size_dimension_verbatim),specification:withheld?null:missing(s.specification_verbatim),material:missing(s.material_explicit),customisation:missing(s.customisation_reference),requiresReview:withheld};
});
const categories=[...new Set(products.map(p=>p.category))].map(name=>({name,slug:slug(name),count:products.filter(p=>p.category===name).length,imageKey:products.find(p=>p.category===name&&p.imageKey)?.imageKey||null}));
await writeFile(new URL('../src/generated/catalogue-data.json',import.meta.url),JSON.stringify({products,categories},null,2)+'\n');
console.log(`Prepared ${products.length} source occurrence references across ${categories.length} literal source groups; no active offerings or contacts.`);
