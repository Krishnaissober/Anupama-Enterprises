import React, { useEffect, useRef } from 'react';
import CatalogueImage from './CatalogueImage.jsx';
import ProductTransition from './ProductTransition.jsx';
import images from '../data/catalogue-images.json';

export function Arrow({ diagonal = false, className = '' }) {
  return <svg aria-hidden="true" className={`arrow ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} /></svg>;
}
export function Wordmark() { return <span className="wordmark">ANUPAMA<span>ENTERPRISES</span></span>; }
export function SectionHeading({ number, eyebrow, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow"><span className="section-number">{number}</span>{eyebrow}</p><h2>{title}</h2></div>{children}</div>;
}
export function ImageSlot({ label, accessibleLabel, imageKey, imageSequence = [], onImageChange, transition = false, variant = '', ordinal, className = '' }) {
  const key = imageKey || { Paper: 'paper', Boxes: 'boxes', Labels: 'labels', Tapes: 'tapes', Wrap: 'protective', Carry: 'carry', Office: 'office', Packaging: 'boxes' }[label];
  if (key) return <figure className={`image-slot real-media ${variant} ${className}`}><div className="media-window">{transition || imageSequence.length ? <ProductTransition imageKey={key} sequence={imageSequence} onImageChange={onImageChange} eager={variant.startsWith('hero-')} /> : <CatalogueImage imageKey={key} eager={variant.startsWith('hero-')} />}</div><figcaption className="media-caption"><span>{images[key].sourceKind === 'generated-illustration' ? 'Illustrative image' : 'Catalogue image'} / {ordinal || 'Reference'}</span><span>Owner approval required</span></figcaption></figure>;
  const description = accessibleLabel || (typeof label === 'string' ? label : 'Paper and form');
  return <div className={`image-slot ${variant} ${className}`} role="img" aria-label={`${description}: intentional image placeholder. Approved product photography required.`}>
    <div className="slot-top"><span>ANUPAMA / PRODUCT STUDY</span>{ordinal && <span>{ordinal}</span>}</div>
    <div className="slot-title" aria-hidden="true">{label}</div>
    <div className="slot-bottom"><span>IMAGE REQUIRED</span><span>Owner approval pending</span></div>
  </div>;
}
export function Dialog({ open, onClose, title, children, className = '' }) {
  const ref = useRef(null);
  const returnFocus = useRef(null);
  const closing = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open) { if (dialog.open) dialog.close(); return; }
    returnFocus.current = document.activeElement;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { closing.current?.cancel(); closing.current = null; document.body.style.overflow = previous; if (dialog.open) dialog.close(); returnFocus.current?.focus?.(); };
  }, [open]);
  function requestClose() {
    if (closing.current) return;
    if (!className.includes('mobile-menu') || matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    const duration = parseFloat(getComputedStyle(ref.current).getPropertyValue('--panel-duration')) || 200;
    closing.current = ref.current.firstElementChild.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: .9, transform: 'translateY(6px)' }], { duration, easing: 'ease-out' });
    closing.current.finished.then(() => { closing.current = null; onClose(); }).catch(() => {});
  }
  function containFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...ref.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  return <dialog ref={ref} className={`dialog ${className}`} aria-label={title} onKeyDown={containFocus} onCancel={e => { e.preventDefault(); requestClose(); }} onClick={e => { if (e.target === ref.current) requestClose(); }}>
    <div className="dialog-inner"><button autoFocus className="dialog-close" aria-label={`Close ${title}`} onClick={requestClose}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M6 18 18 6" /></svg></button>{children}</div>
  </dialog>;
}
export function goToSection(id) {
  location.hash = id;
  // Run after dialog closes, so native focus restoration cannot steal destination focus.
  window.setTimeout(() => document.getElementById(id)?.focus({ preventScroll: true }), 0);
}


