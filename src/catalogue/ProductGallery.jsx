import React,{useEffect,useState} from 'react';
import CatalogueImage from '../components/CatalogueImage.jsx';
import ProductTransition from '../components/ProductTransition.jsx';
import {Dialog,Arrow} from '../components/Primitives.jsx';
import {preloadCatalogueImage} from '../components/preloadCatalogueImage.js';
import imageMetadata from '../data/catalogue-images.json';
import {categoryTone} from './CategoryPresentation.jsx';
export const galleryIndex=(index,delta,count)=>count?(index+delta+count)%count:0;
export default function ProductGallery({product,images=[]}){
 const [index,setIndex]=useState(0),[open,setOpen]=useState(false);
 const keys=images.map(i=>i.imageKey),key=keys[index];
 useEffect(()=>{if(keys.length>1)preloadCatalogueImage(keys[(index+1)%keys.length]).catch(()=>{});},[key,keys.join(',')]);
 const change=delta=>setIndex(i=>galleryIndex(i,delta,keys.length));
 const keyboard=e=>{if(keys.length<2)return;if(e.key==='ArrowRight'){e.preventDefault();change(1);}if(e.key==='ArrowLeft'){e.preventDefault();change(-1);}};
 if(!key)return <section className="product-gallery product-designed-placeholder" data-tone={categoryTone(product.categorySlug)} aria-label={`${product.name} visual reference`}><div className="category-image-stage category-type-stage"><span className="category-material-lines" aria-hidden="true"/><p className="eyebrow">{product.category}</p><p className="product-placeholder-title">{product.name}</p><span className="category-pending">Image pending approval</span></div><p className="product-gallery-caption">Designed reference presentation<span>Exact product photograph requires owner approval</span></p></section>;
 const controls=keys.length>1&&<div className="product-gallery-controls"><button aria-label="Previous product image" onClick={()=>change(-1)}><Arrow/></button><span aria-live="polite">{index+1} / {keys.length}</span><button aria-label="Next product image" onClick={()=>change(1)}><Arrow/></button></div>;
 return <section className="product-gallery" data-tone={categoryTone(product.categorySlug)} style={{'--detail-image-cap':`${imageMetadata[key].width*1.65}px`}} aria-label={`${product.name} images`} onKeyDown={keyboard}><button className="product-gallery-primary catalogue-media" aria-label={`Open catalogue image for ${product.name}`} aria-haspopup="dialog" onClick={()=>setOpen(true)}><div className="media-window"><ProductTransition imageKey={key} eager/></div><span className="detail-gallery-expand" aria-hidden="true">View image <Arrow diagonal/></span></button><p className="product-gallery-caption">Catalogue image / Page {product.page}<span>Owner approval required</span></p>{controls}{keys.length>1&&<div className="product-gallery-thumbnails" aria-label="Choose product image">{keys.map((k,i)=><button key={`${k}-${i}`} aria-label={`View product image ${i+1}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><CatalogueImage imageKey={k} decorative/></button>)}</div>}<Dialog open={open} onClose={()=>setOpen(false)} title={`${product.name} catalogue image`} className="product-image-dialog"><div data-tone={categoryTone(product.categorySlug)} className="detail-lightbox-stage"><div className="catalogue-media"><div className="media-window"><ProductTransition imageKey={key} eager/></div></div>{controls}<p className="product-gallery-caption">Inherited catalogue image · Owner approval required</p></div></Dialog></section>;
}

