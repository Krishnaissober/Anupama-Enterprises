import React, {useEffect,useRef} from 'react';
import CatalogueImage from '../components/CatalogueImage.jsx';
import {Arrow} from '../components/Primitives.jsx';
import {products,productUrl} from './model.js';
import {selectCategoryFeature} from './categoryFeatured.js';

// Presentation only: literal catalogue groups and product records stay unchanged.
export function categoryTone(category){
 const slug=(typeof category==='string'?category:category?.slug)||'';
 if(slug.includes('corrugated'))return 'kraft';
 if(slug.includes('paper')||slug.includes('carry'))return 'paper';
 if(slug.includes('tapes'))return 'industrial';
 if(slug.includes('protective')||slug.includes('plastic')||slug.includes('bopp'))return 'sage';
 return 'neutral';
}
function Reveal({children,className=''}){
 const ref=useRef(null);
 useEffect(()=>{
  const node=ref.current,media=matchMedia('(prefers-reduced-motion: reduce)');
  if(media.matches||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){node.classList.add('category-entered');observer.disconnect();}},{threshold:.08});
  node.classList.add('category-reveal-ready');observer.observe(node);
  const stable=()=>{if(media.matches){node.classList.remove('category-reveal-ready');observer.disconnect();}};
  media.addEventListener('change',stable);
  return()=>{observer.disconnect();media.removeEventListener('change',stable);};
 },[]);
 return <div ref={ref} className={`category-reveal ${className}`}>{children}</div>;
}
export function CategoryHero({category}){
 const feature=selectCategoryFeature(category),supported=feature.imageKey?feature.product:null;
 return <header className="category-editorial-hero" data-tone={categoryTone(category)}>
  <Reveal className="category-hero-copy"><p className="eyebrow">ANUPAMA ENTERPRISES / Catalogue</p><h1>{category.name}</h1><p className="category-hero-description">{category.count} inherited catalogue references. Explore the product names and details documented in this source group.</p><a className="text-link" href="#catalogue-results">Explore the collection <Arrow/></a><p className="category-availability">Current availability requires business confirmation.</p></Reveal>
  <Reveal className="category-hero-visual"><div className={`category-image-stage ${supported?'':'category-type-stage'}`}>
   {supported?<a className="category-hero-image-link" href={productUrl(supported)} aria-label={`View reference: ${supported.name}`}><div className="media-window"><CatalogueImage imageKey={feature.imageKey} eager/></div><span className="category-stage-action">{supported.name} <Arrow diagonal/></span></a>:<a className="category-hero-image-link" href={feature.product?productUrl(feature.product):'#catalogue-results'}><span className="category-material-lines" aria-hidden="true"/><p className="category-type-name">{feature.product?.name}</p><span className="category-stage-action">Image pending approval <Arrow diagonal/></span></a>}
  </div><p className="category-visual-caption">{feature.caption}</p></Reveal>
 </header>;
}
export function EditorialProductCard({product,large=false,featuredImageKey=product.imageKey}){
 const assetKey=featuredImageKey;
 return <Reveal className={`catalogue-product category-editorial-product ${large?'category-featured catalogue-product-large':''}`}><article data-tone={categoryTone(product.categorySlug)}><a className="catalogue-product-link" href={productUrl(product)}>
  <div className={`category-image-stage ${assetKey?'':'category-type-stage'}`}>
   {assetKey?<div className="media-window"><CatalogueImage imageKey={assetKey}/></div>:<><span className="category-material-lines" aria-hidden="true"/><span className="category-placeholder-title">{product.name}</span><span className="category-pending">Image pending approval</span></>}
  </div>
  <div className="catalogue-product-copy">{large&&<p className="eyebrow category-feature-label">Featured catalogue reference</p>}<h3>{product.name}</h3>{product.variant&&<p className="category-product-variant">{product.variant}</p>}{large&&product.size&&<p className="category-product-detail">Catalogue size: {product.size}</p>}{large&&product.specification&&<p className="category-product-detail">Catalogue specification: {product.specification}</p>}<span className="text-link">{large?'View product':'View reference'} <Arrow/></span>{assetKey&&<p className="category-card-approval">{large?selectCategoryFeature({slug:product.categorySlug}).caption:'Catalogue image · Owner approval required'}</p>}</div>
 </a></article></Reveal>;
}

