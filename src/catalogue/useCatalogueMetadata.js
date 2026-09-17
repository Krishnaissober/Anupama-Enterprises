import {useEffect} from 'react';
import {categoryUrl,productUrl} from './model.js';
export default function useCatalogueMetadata(product,category){
 useEffect(()=>{
  const title=`${(product?product.name+' · '+product.id:category?.name)||'Catalogue'} | ANUPAMA ENTERPRISES`;
  const description=product?`${product.name} — inherited catalogue reference, page ${product.page}. View source details and independent product-type guidance. Current availability requires confirmation.`:'Explore inherited catalogue references from ANUPAMA ENTERPRISES. Current availability and specifications require owner confirmation.';
  document.title=title;
  const setMeta=(selector,attribute,value)=>{const node=document.querySelector(selector);if(node)node.setAttribute(attribute,value);};
  setMeta('meta[name="description"]','content',description);setMeta('meta[property="og:title"]','content',title);setMeta('meta[property="og:description"]','content',description);
  let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}
  canonical.href=new URL(product?productUrl(product):location.pathname.replace(/\/$/,'')||'/',location.origin).href;
  const schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.catalogueBreadcrumb='true';
  const crumbs=[['Home','/'],['Catalogue','/products']];if(category)crumbs.push([category.name,categoryUrl(category)]);if(product)crumbs.push([product.name,productUrl(product)]);
  schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map(([name,path],index)=>({'@type':'ListItem',position:index+1,name,item:new URL(path,location.origin).href}))}).replace(/</g,'\\u003c');
  document.head.append(schema);return()=>{schema.remove();canonical.remove();};
 },[product,category]);
}


