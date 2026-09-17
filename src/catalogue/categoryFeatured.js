import {products} from './model.js';
import images from '../data/catalogue-images.json';

// Exact product mappings only. Never substitute a category example for a variant,
// or mistake a generated illustration for an available product photograph.
export function selectCategoryFeature(category,items=products,assets=images){
 const references=items.filter(p=>p.categorySlug===category.slug);
 const candidates=references.filter(p=>{
  const asset=assets[p.imageKey];
  return asset?.src?.startsWith('/assets/images/')&&asset.width>0&&asset.height>0&&asset.sourceKind!=='generated-illustration';
 });
 const ranked=candidates.map((product,index)=>({product,index,asset:assets[product.imageKey]})).sort((a,b)=>
  Number(b.asset.approved===true)-Number(a.asset.approved===true)||
  Math.min(b.asset.width,b.asset.height)-Math.min(a.asset.width,a.asset.height)||
  b.asset.width*b.asset.height-a.asset.width*a.asset.height||a.index-b.index);
 const product=ranked[0]?.product||references[0]||null,asset=ranked[0]?.asset||null;
 return {product,imageKey:asset?product.imageKey:null,approved:asset?.approved===true,caption:asset?(asset.approved===true?'Owner-approved product image':'Inherited catalogue image · Owner approval required'):'Typographic reference · Product imagery pending approval'};
}
