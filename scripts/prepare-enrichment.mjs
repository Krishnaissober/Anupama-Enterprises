import {readFile,writeFile} from 'node:fs/promises';
const {products}=JSON.parse(await readFile(new URL('../src/generated/catalogue-data.json',import.meta.url),'utf8'));
const research=JSON.parse(await readFile(new URL('../content/research/product-reference-profiles.json',import.meta.url),'utf8'));
const csv=await readFile(new URL('../content/catalogue-product-inventory.csv',import.meta.url),'utf8');
const rows=[];let row=[],field='',quoted=false;
for(let i=0;i<csv.length;i++){const c=csv[i];if(c==='"'){if(quoted&&csv[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
if(field||row.length){row.push(field);rows.push(row);}if(quoted)throw Error('Unterminated inventory CSV');
const [headers,...values]=rows,sourceRows=values.map(v=>Object.fromEntries(headers.map((h,i)=>[h,v[i]])));
const meta=p=>({sourceType:'external-research',sourceUrl:p.sourceUrl,sourceTitle:p.sourceTitle,retrievedAt:research.retrievedAt,verificationStatus:'external-reference',businessVerificationStatus:'owner-confirmation-required'});
const profiles=Object.fromEntries(research.profiles.map(p=>[p.id,{title:p.title,fields:Object.fromEntries(['summary','description','terminology','applications'].filter(f=>p[f]).map(f=>[f,{value:p[f],...meta(p)}]))}]));
const records=Object.fromEntries(products.map(p=>{
 const profile=research.profiles.find(r=>r.records.includes(Number(p.id.slice(4))));
 const provenance={sourceType:'catalogue',sourceUrl:'content/source/PnP Booklet_7709.pdf',sourceTitle:'PnP Booklet_7709.pdf',cataloguePage:p.page,verificationStatus:'catalogue-reference',businessVerificationStatus:'owner-confirmation-required'};
 const raw=sourceRows.find(s=>s.catalogue_id===p.id);
 const size=p.requiresReview?null:(p.size||(/contact us/i.test(raw.size_dimension_verbatim)?raw.size_dimension_verbatim:null));
 const sizeEntries=size&&!/contact|customise/i.test(size)?size.split(';').map(v=>v.trim()):[];
 const confirmationItems=['Current availability and whether this reference is manufactured, traded or stocked','Exact material, compatibility and suitability for your intended use','Current pricing, minimum order and lead time',...(p.imageKey?['Publication approval and a clearer original product photograph']:['An exact, owner-approved product photograph']),...(!size||/contact|customise/i.test(size)?['Sizes and dimensions require confirmation']:[]),...(p.requiresReview?['Ambiguous catalogue specifications require business confirmation']:[]),...(research.withheld[p.id]?[research.withheld[p.id]]:[])];
 const links=products.filter(other=>other.id!==p.id&&research.profiles.find(r=>r.records.includes(Number(other.id.slice(4))))?.id===profile?.id).map(other=>other.id);
 return [p.id,{profileId:profile?.id||null,catalogueDescription:{value:`${p.name} is listed in the inherited ${p.category} catalogue group on page ${p.page}.`,...provenance},sizeReference:size?{value:size,...provenance}:null,sizeEntries:sizeEntries.map(value=>({value,...provenance})),linkedReferences:links,confirmationItems:confirmationItems.map(value=>({value,sourceType:'owner-confirmation-required',verificationStatus:'unconfirmed'})),images:p.imageKey?[{imageKey:p.imageKey,...provenance,rightsStatus:'owner-approval-required'}]:[],catalogueFields:Object.fromEntries(['name','category','variant','size','specification','material','customisation'].filter(f=>p[f]).map(f=>[f,provenance])),researchWithheld:research.withheld[p.id]||null}];
}));
await writeFile(new URL('../src/generated/product-enrichment.json',import.meta.url),JSON.stringify({profiles,records},null,2)+'\n');
const imageReferences=research.imageReferences.map(r=>({...r,sourceType:'external-research',retrievedAt:research.retrievedAt,verificationStatus:'external-reference',rightsStatus:'REQUIRES IMAGE RIGHTS / OWNER APPROVAL',reusePermission:'No explicit reuse grant established; research link only',shipped:false}));
await writeFile(new URL('../content/research/image-rights-review.json',import.meta.url),JSON.stringify(imageReferences,null,2)+'\n');
const perProduct=products.map(p=>{const profile=research.profiles.find(r=>r.records.includes(Number(p.id.slice(4)))),candidate=research.imageReferences.find(r=>r.type===profile?.id);return {id:p.id,product:p.name,sourceUrl:candidate?.sourceUrl||profile?.sourceUrl,sourceTitle:candidate?.sourceTitle||profile?.sourceTitle,imageUrl:candidate?.imageUrl||null,researchDate:research.retrievedAt,rightsStatus:'No explicit reuse grant established — reference only',identityStatus:'General product-type example; not an equivalent or Anupama photograph',shipped:false};});
await writeFile(new URL('../content/research/product-image-candidates.json',import.meta.url),JSON.stringify(perProduct,null,2)+'\n');
console.log(`Enriched ${Object.values(records).filter(r=>r.profileId).length}/${products.length} references using ${research.profiles.length} external profiles; ${imageReferences.length} image candidates retained as research only.`);
