import React,{useEffect,useState} from 'react';
import Navigation1 from '../components/watermelon/Navigation1.jsx';
import {Footer} from '../components/BusinessAndContact.jsx';
import TextHoverEffectDemo from '../../components/text-hover-effect-demo.tsx';
import {Dialog,Arrow} from '../components/Primitives.jsx';
import {products,categories,filterProducts,relatedProducts,categoryUrl} from './model.js';
import {Breadcrumb,CategoryPanel,ProductCard,ProductMedia,EnquiryCTA} from './Components.jsx';
import './catalogue.css';
import ProductDetail from './ProductDetail.jsx';
import {CatalogueHero,VisualCategoryExplorer,HubProductCard} from './HubPresentation.jsx';
import {CategoryHero,EditorialProductCard,categoryTone} from './CategoryPresentation.jsx';
import {selectCategoryFeature} from './categoryFeatured.js';
import useCatalogueMetadata from './useCatalogueMetadata.js';

const PAGE_SIZE=12;
// Readable alias for this exact occurrence; ambiguous names retain their unique ID routes.
const PRODUCT_ROUTE_ALIASES={'/products/plain-corrugated-boxes':'CAT-006'};
function Filters({selected,setSelected,items=categories}){return <fieldset className="catalogue-facets"><legend>Catalogue category</legend>{items.map(c=><label key={c.slug}><input type="checkbox" aria-label={c.name} checked={selected.includes(c.slug)} onChange={()=>setSelected(selected.includes(c.slug)?selected.filter(s=>s!==c.slug):[...selected,c.slug])}/><span>{c.name}</span><small>{c.count}</small></label>)}</fieldset>;}
function Listing({category}){
 const params=new URLSearchParams(location.search),query=(params.get('q')||'').slice(0,160);
 const selected=params.getAll('category').filter(s=>categories.some(c=>c.slug===s));
 const [draft,setDraft]=useState(selected),[open,setOpen]=useState(false);
 const featured=category?selectCategoryFeature(category):null;
 const base=category?products.filter(p=>p.categorySlug===category.slug):products;
 const matches=filterProducts(base,query,category?[]:selected),pageCount=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));
 const page=Math.min(pageCount,Math.max(1,Number.parseInt(params.get('page'),10)||1));
 const url=(changes={})=>{const p=new URLSearchParams();if(changes.q??query)p.set('q',changes.q??query);for(const s of changes.selected??selected)p.append('category',s);if(changes.page>1)p.set('page',changes.page);return location.pathname+(p.size?`?${p}`:'');};
 const apply=()=>{location.assign(url({selected:draft}));};
 return <><div className="catalogue-list-heading" id="catalogue-results"><div><p className="eyebrow">Browse references</p><h2>{category?'Explore this category.':'Find your product reference.'}</h2></div><p>Catalogue evidence, with current-business status still awaiting confirmation.</p></div><form className="catalogue-search" method="get" action={location.pathname}><label htmlFor="catalogue-search">Search catalogue references</label><div><input id="catalogue-search" name="q" type="search" defaultValue={query} maxLength={160} placeholder="Search a product, category or source specification"/>{selected.map(s=><input key={s} name="category" type="hidden" value={s}/>)}<button className="button" type="submit">Search <Arrow/></button></div></form>
 <div className={`catalogue-workspace ${category?'catalogue-workspace-single':''}`}>
 {!category&&<><aside className="catalogue-desktop-filters"><Filters selected={draft} setSelected={setDraft}/><button className="button" onClick={apply}>Apply categories</button><a className="text-link" href={url({selected:[]})}>Clear filters</a></aside><button className="button catalogue-mobile-filter" onClick={()=>{setDraft(selected);setOpen(true);}} aria-haspopup="dialog">Filters{selected.length?` (${selected.length})`:''}</button><Dialog open={open} onClose={()=>setOpen(false)} title="Catalogue filters" className="catalogue-filter-dialog"><h2>Filter references</h2><Filters selected={draft} setSelected={setDraft}/><div className="catalogue-filter-actions"><button className="button" onClick={apply}>Apply filters</button><button className="text-link" onClick={()=>setDraft([])}>Reset selections</button><button className="text-link" onClick={()=>setOpen(false)}>Cancel</button></div></Dialog></>}
 <div className="catalogue-results"><div className="catalogue-result-summary"><p role="status">{matches.length} catalogue {matches.length===1?'reference':'references'}{query&&<> matching “{query}”</>}</p><p>Source order · Page {page} of {pageCount}</p></div>{(query||selected.length>0)&&<div className="catalogue-active-filters">{query&&<a href={url({q:''})}>Clear search “{query}” ×</a>}{selected.map(s=><a key={s} href={url({selected:selected.filter(v=>v!==s)})}>{categories.find(c=>c.slug===s).name} ×</a>)}<a href={location.pathname}>Reset all</a></div>}
 {matches.length?<div className="catalogue-product-list">{matches.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map((p,i)=>category?<EditorialProductCard key={p.id} product={p} large={p.id===featured.product?.id&&!!featured.imageKey} featuredImageKey={p.id===featured.product?.id?featured.imageKey:p.imageKey}/>:<HubProductCard key={p.id} product={p} large={i===0&&!!p.imageKey}/>)}</div>:<div className="catalogue-empty"><h3>No matching references.</h3><p>Try fewer terms or clear your categories.</p><a className="button" href={location.pathname}>Reset search and filters</a></div>}
 {pageCount>1&&<nav className="catalogue-pagination" aria-label="Catalogue pages">{page>1&&<a className="button secondary" href={url({page:page-1})}>Previous</a>}{Array.from({length:pageCount},(_,i)=><a key={i} href={url({page:i+1})} aria-current={page===i+1?'page':undefined}>{i+1}</a>)}{page<pageCount&&<a className="button secondary" href={url({page:page+1})}>Next</a>}</nav>}
 </div></div></>;
}
export default function Catalogue(){const path=location.pathname.replace(/\/$/,'');const category=path.startsWith('/products/category/')?categories.find(c=>c.slug===path.slice('/products/category/'.length)):null;const product=!path.startsWith('/products/category/')&&path!=='/products'?products.find(p=>path===`/products/${p.slug}`||p.id===PRODUCT_ROUTE_ALIASES[path]):null;const missing=path!=='/products'&&!category&&!product;
 useCatalogueMetadata(product,category||categories.find(c=>c.slug===product?.categorySlug));
 return <div className={`catalogue-page ${category?'category-editorial-page':path==='/products'?'category-editorial-page catalogue-hub-page':''}`} data-tone={category?categoryTone(category):undefined} id="top"><a className="skip-link" href="#main-content">Skip to content</a><Navigation1 catalogue productId={product?.id}/><main id="main-content" className="container" tabIndex={-1}><p className="catalogue-notice">Reference preview · Inherited catalogue products and imagery require owner approval. Current availability is unconfirmed.</p>{missing?<section className="catalogue-empty"><h1>Reference not found.</h1><p>This catalogue route is unavailable.</p><a className="button" href="/products">Back to catalogue</a></section>:product?<ProductDetail product={product}/>:<><Breadcrumb category={category}/>{category?<CategoryHero category={category}/>:<CatalogueHero/>}{!category&&<VisualCategoryExplorer categories={categories}/>}<Listing category={category}/><EnquiryCTA/></>}{missing&&<EnquiryCTA/>}</main><Footer catalogue><TextHoverEffectDemo/></Footer></div>;
}










