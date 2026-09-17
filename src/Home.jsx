import React, { useEffect, useState } from 'react';
import products from './generated/homepage-data.json';
import Navigation1 from './components/watermelon/Navigation1.jsx';
import Hero from './components/Hero.jsx';
import Discovery from './components/Discovery.jsx';
import Showcase from './components/Showcase.jsx';
import { RequirementPanel, BusinessNote, EvidenceSlot, FinalContact, Footer } from './components/BusinessAndContact.jsx';
import { Arrow, Dialog, goToSection } from './components/Primitives.jsx';
import { recordHomepageEvent } from './lib/events.js';
import useHomepageMotion from './lib/useHomepageMotion.js';
import TextHoverEffectDemo from '../components/text-hover-effect-demo.tsx';

export default function Home() {
  useEffect(()=>{const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=new URL('/',location.origin).href;document.head.append(canonical);return()=>canonical.remove();},[]);
  useHomepageMotion();
  const [heroCategory, setHeroCategory] = useState("labels");
  const [storyCategory, setStoryCategory] = useState("labels");
  const [preview, setPreview] = useState(null);
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const openPreview = product => { setPreview(product); recordHomepageEvent('product_viewed', { productId: product.id, context: 'homepage_reference_preview' }); };
  return <><a className="skip-link" href="#main-content">Skip to content</a><div id="top" /><Navigation1 />
    <div className="review-strip"><details className="container"><summary>Preview content notes</summary><p>Inherited catalogue products and images require current-business and publication approval. The carry-bag discovery image is an illustrative composition, not a verified product photograph. Source pages and verification status are available through Inspect this reference. Contacts are not enabled.</p></details></div>
    <main id="main-content" tabIndex="-1"><Hero onProductChange={setHeroCategory} /><Discovery products={products} heroCategory={heroCategory} onCategoryChange={setStoryCategory} onPreview={openPreview} /><Showcase products={products} storyCategory={storyCategory} onPreview={openPreview} /><RequirementPanel /><BusinessNote /><EvidenceSlot /><FinalContact selectedProduct={enquiryProduct} /></main><Footer><TextHoverEffectDemo /></Footer>
    <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} title="Catalogue reference preview">{preview && <><p className="eyebrow">Present in catalogue / PDF page {preview.sourcePage}</p><h2 className="preview-title">{preview.name}</h2><p className="preview-status">Current status requires business confirmation.</p><p>This is an inherited catalogue reference. Current availability, specifications, pricing and manufacturing or trading status have not been approved.</p><p className="preview-note">Explore the <a className="text-link" href="/products">catalogue and product details <Arrow diagonal/></a>.</p><button className="button" onClick={() => { setEnquiryProduct(preview); setPreview(null); recordHomepageEvent('enquiry_clicked', { productId: preview.id }); goToSection('enquire'); }}>Discuss this reference <Arrow diagonal /></button></>}</Dialog>
  </>;
}


