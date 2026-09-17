import React, { useEffect, useState } from 'react';
import { Arrow, Wordmark } from './Primitives.jsx';
import { company, contacts, verifiedEvidence } from '../data/company.js';
import { ImageSlot } from './Primitives.jsx';

export function RequirementPanel() {
  const [paused, setPaused] = useState(false);
  const imageKeys = ['tapes', 'boxes', 'protective', 'labels'];
  const [imageIndex] = useState(() => {
    try {
      const previous = sessionStorage.getItem('anupama-requirement-image');
      const index = Number(previous);
      return previous !== null && Number.isInteger(index) && index >= 0 && index < imageKeys.length ? (index + 1) % imageKeys.length : 0;
    } catch { return 0; }
  });
  useEffect(() => {
    try { sessionStorage.setItem('anupama-requirement-image', String(imageIndex)); } catch { /* Image remains usable when storage is unavailable. */ }
  }, [imageIndex]);
  return <section className="requirement-panel" id="requirements" tabIndex="-1"><div className="container requirement-inner"><div><p className="eyebrow">Start with what you need</p><h2>Have a specific<br />requirement?</h2><ImageSlot imageKey={imageKeys[imageIndex]} imageSequence={imageKeys} className="requirement-image" /><button className="motion-toggle requirement-motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume product motion" : "Pause product motion"}</button></div><div className="requirement-copy"><p>Not sure where to begin? Describe what you’re looking for and ask about the options.</p><a className="button inverse" href="#enquire">Let’s discuss it <Arrow diagonal /></a></div></div></section>;
}
export function BusinessNote() {
  return <section className="section business-note container" id="business" tabIndex="-1"><div><p className="eyebrow"><span className="section-number">03</span>Our business</p><h2>Rooted in Chandigarh.<br />Focused on<br /><span>everyday essentials.</span></h2></div><div className="business-copy"><p className="business-name">{company.name}</p><p>{company.introduction}</p><dl><div><dt>Business</dt><dd>Manufacturing & Trading</dd></div><div><dt>Location</dt><dd>{company.location}</dd></div></dl><a href="#discover" className="text-link">Back to the range <Arrow diagonal /></a></div></section>;
}
export function EvidenceSlot() {
  const approved = verifiedEvidence.filter(item => item.approved && item.rightsCleared);
  if (!approved.length) return null;
  return <section className="section container" aria-label="Verified business evidence">{approved.map(item => <figure key={item.id}><img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" /><figcaption>{item.caption}</figcaption></figure>)}</section>;
}
export function FinalContact({ selectedProduct }) {
  return <section className="final-contact" id="enquire" tabIndex="-1"><div className="container"><ImageSlot label="Packaging" className="contact-image" /><p className="eyebrow">Begin a conversation</p><div className="contact-heading"><h2>Have a requirement?<br /><span>Let’s talk.</span></h2><Arrow diagonal className="contact-arrow" /></div>{selectedProduct && <p className="selected-context">Your catalogue reference: <strong>{selectedProduct.name}</strong></p>}<div className="contact-lower"><div className="contact-notice"><p>Contact details awaiting approval.</p><p>WhatsApp, phone and email channels will be available here once confirmed by the business. This preview does not send enquiries.</p></div><div className="contact-choices">{contacts.map(contact => <button key={contact.id} disabled className="contact-choice" aria-describedby="contact-pending"><span>{contact.label}<small>Awaiting approval</small></span><Arrow diagonal /></button>)}<span className="sr-only" id="contact-pending">Contact information requires owner confirmation. These channels are not yet enabled.</span></div></div></div></section>;
}
export function Footer({ children, catalogue = false }) {
  return <footer>{children}<div className="footer container"><a href="/" aria-label="ANUPAMA ENTERPRISES, Home"><Wordmark /></a><p>Manufacturing & Trading<br />Chandigarh, India</p><nav aria-label="Footer"><a href="/">Home</a><a href="/products">Catalogue</a><a href="/our-business">Our Business</a><a href="/enquire">Enquire</a></nav><div className="footer-bottom"><span>ANUPAMA ENTERPRISES</span><span>Owner review · Content confirmation pending</span><a href="#top">Back to top ↑</a></div></div></footer>;
}





