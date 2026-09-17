import React, { useRef, useState } from 'react';
import images from '../data/catalogue-images.json';
import { preloadCatalogueImage } from './preloadCatalogueImage.js';
const descriptions = { paper: 'Plain paper courier envelopes arranged together', boxes: 'Plain corrugated cardboard boxes in different sizes', labels: 'Direct thermal label roll with inherited dimension annotations', office: 'POS thermal billing rolls with a cardboard box', tapes: 'Transparent packaging tape rolls', protective: 'Stretch film roll with film extended', carry: 'Kraft carry bags with coloured rope handles' };
export default function CatalogueImage({ imageKey, eager = false, decorative = false, className = '' }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState('');
  const [failed, setFailed] = useState('');
  const image = images[imageKey];
  if (!image) throw new Error(`Unknown catalogue image: ${imageKey}`);
  const source = image.sourceKind === 'generated-illustration' ? 'AI-generated illustrative composition' : 'Inherited catalogue image';
  if (failed === image.src) return <span className="catalogue-image-fallback" role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `${descriptions[imageKey]}. Image unavailable.`}><span>Product image unavailable</span><small>{descriptions[imageKey]}</small></span>;
  return <img ref={ref} className={`catalogue-image ${className}`} src={image.src} style={{ visibility: loaded === image.src ? 'visible' : 'hidden' }} onLoad={async event => { const node = event.currentTarget, src = image.src; try { await preloadCatalogueImage(imageKey, node); if (ref.current === node && node.getAttribute('src') === src) setLoaded(src); } catch { if (ref.current === node && node.getAttribute('src') === src) setFailed(src); } }} onError={() => setFailed(image.src)} alt={decorative ? '' : `${descriptions[imageKey]}. ${source}, owner approval required.`} width={image.width} height={image.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" data-catalogue-page={image.page} data-source-kind={image.sourceKind || 'catalogue'} />;
}

