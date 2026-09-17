import React, { useEffect, useRef, useState } from 'react';
import CatalogueImage from './CatalogueImage.jsx';
import { preloadCatalogueImage } from './preloadCatalogueImage.js';

// Decode replacements first; keep the outgoing product visible beneath the reveal.
export default function ProductTransition({ imageKey, sequence = [], eager = false, onImageChange }) {
  const ref = useRef(null);
  const [requested, setRequested] = useState(imageKey);
  const [frame, setFrame] = useState({ current: imageKey, previous: null });
  useEffect(() => { onImageChange?.(frame.current); }, [frame.current, onImageChange]);
  useEffect(() => setRequested(imageKey), [imageKey]);
  const sequenceKey = sequence.join(',');
  useEffect(() => {
    if (!sequenceKey) return;
    const keys = sequenceKey.split(',');
    preloadCatalogueImage(keys[(keys.indexOf(frame.current) + 1) % keys.length]).catch(() => {});
  }, [sequenceKey, frame.current]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { if (media.matches) setFrame(current => current.previous ? { ...current, previous: null } : current); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!sequenceKey) return;
    const keys = sequenceKey.split(',');
    const node = ref.current, section = node.closest('section');
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, interacting = false;
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: .25 }) : null;
    observer?.observe(node);
    const enter = () => { interacting = true; };
    const leave = event => { interacting = section.matches(':hover') || section.contains(event.type === 'focusout' ? event.relatedTarget : document.activeElement); };
    section.addEventListener('pointerenter', enter); section.addEventListener('pointerleave', leave);
    section.addEventListener('focusin', enter); section.addEventListener('focusout', leave);
    const timer = setInterval(() => {
      if (!visible || interacting || document.hidden || media.matches || section.querySelector('.motion-toggle[aria-pressed="true"]')) return;
      setRequested(current => keys[(keys.indexOf(current) + 1) % keys.length]);
    }, 8500);
    return () => { clearInterval(timer); observer?.disconnect(); section.removeEventListener('pointerenter', enter); section.removeEventListener('pointerleave', leave); section.removeEventListener('focusin', enter); section.removeEventListener('focusout', leave); };
  }, [sequenceKey]);
  useEffect(() => {
    if (requested === frame.current) return;
    let cancelled = false;
    const commit = () => {
      if (cancelled) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setFrame(current => ({ current: requested, previous: reduced ? null : current.current }));
    };
    preloadCatalogueImage(requested).then(commit).catch(commit);
    return () => { cancelled = true; };
  }, [requested, frame.current]);
  useEffect(() => {
    if (!frame.previous) return;
    const timer = setTimeout(() => setFrame(current => ({ ...current, previous: null })), 900);
    return () => clearTimeout(timer);
  }, [frame.current, frame.previous]);
  return <div ref={ref} className="product-transition" data-product={frame.current}>
    {frame.previous && <div className="product-layer product-outgoing" aria-hidden="true"><CatalogueImage imageKey={frame.previous} decorative eager /></div>}
    <div key={frame.current} className={`product-layer ${frame.previous ? 'product-incoming' : ''}`}><CatalogueImage imageKey={frame.current} eager={eager} /></div>
  </div>;
}
