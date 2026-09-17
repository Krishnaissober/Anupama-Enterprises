import React from 'react';
import { Arrow, ImageSlot, SectionHeading } from './Primitives.jsx';

function ProductCard({ product, onPreview, dominant = false }) {
  return <article className={`editorial-card ${dominant ? 'dominant-card' : 'support-card'}`}><button className="product-card-button" onClick={() => onPreview(product)} aria-label={`View catalogue reference: ${product.name}`}><div className="story-image-motion"><ImageSlot label={product.imageLabel} imageKey={product.category} transition={dominant} ordinal={product.ordinal} variant={dominant ? 'feature-image' : 'support-image'} /></div><div className="product-card-copy"><div><p className="eyebrow">Catalogue reference / {product.ordinal}</p><h3>{product.navigationLabel}</h3><p className="card-status">Current status requires confirmation</p></div><Arrow diagonal /></div></button></article>;
}
export default function Showcase({ products, onPreview, storyCategory }) {
  const lead = products.find(p => p.category === storyCategory) || products.find(p => p.id === 'CAT-016');
  const chosen = [lead, ...['CAT-006', 'CAT-038', 'CAT-016'].map(id => products.find(p => p.id === id)).filter(p => p && p.id !== lead?.id)].filter(Boolean).slice(0,3);
  if (!chosen.length) return null;
  return <section className="section showcase container" id="range" tabIndex="-1"><SectionHeading number="02" eyebrow="A closer look" title={<>Different formats.<br />One place to explore.</>}><p className="heading-note">Selected catalogue references.<br />A starting point for the conversation.</p></SectionHeading><div className="showcase-grid"><ProductCard product={chosen[0]} onPreview={onPreview} dominant /><div className="support-stack">{chosen.slice(1).map(p => <ProductCard key={p.id} product={p} onPreview={onPreview} />)}</div></div></section>;
}

