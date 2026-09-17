import data from '../generated/catalogue-data.json';
export const {products,categories}=data;
export const productUrl=p=>`/products/${p.slug}`;
export const categoryUrl=c=>`/products/category/${c.slug}`;
export function filterProducts(items,query='',selected=[]){const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return items.filter(p=>(!selected.length||selected.includes(p.categorySlug))&&tokens.every(t=>[p.name,p.category,p.variant,p.size,p.specification,p.material,p.customisation].filter(Boolean).join(' ').toLowerCase().includes(t)));}
export const relatedProducts=p=>products.filter(item=>item.categorySlug===p.categorySlug&&item.id!==p.id).slice(0,3);
