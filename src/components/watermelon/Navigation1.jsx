/* Adapted from Watermelon UI Navigation-1, MIT (see THIRD_PARTY_NOTICES.md).
 * Retains the source's bordered wrapper, wordmark/navigation/action composition and
 * desktop/mobile split. SaaS mega-menu, badges, icons and package-based sheet are
 * replaced with brand-specific links, custom SVG and a native accessible dialog.
 */
import React, { useEffect, useState } from 'react';
import { Arrow, Dialog, Wordmark, goToSection } from '../Primitives.jsx';

const homeLinks = [{ label: 'Explore the range', id: 'discover' }, { label: 'Our business', id: 'business' }];
export default function Navigation1({ catalogue = false, productId }) {
  const links = catalogue ? [{label:'Catalogue',id:'catalogue'},{label:'Our business',id:'business'}] : homeLinks;
  const enquiryHref='/enquire'+(productId?`?reference=${encodeURIComponent(productId)}`:'');
  const href = id => ({home:'/',catalogue:'/products',discover:'/products',business:'/our-business',enquire:enquiryHref,requirements:catalogue?'/#requirements':'#requirements'})[id];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id === 'range' ? 'discover' : entry.target.id);
    }), { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    ['top', 'discover', 'range', 'business', 'enquire'].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    const hero = document.querySelector('.hero'); if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const query = matchMedia('(min-width: 960px)');
    const resize = () => { if (query.matches) setOpen(false); };
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  return <header className="site-header relative w-full border-b">
    <div className="container flex items-center justify-between header-row">
      <a href="/" className="brand-link" aria-label="ANUPAMA ENTERPRISES, Home"><Wordmark /></a>
      <nav aria-label="Primary" className="desktop-navigation"><ul className="flex items-center">{links.map(link => <li key={link.id}><a href={href(link.id)} aria-current={location.pathname===href(link.id)||link.id==='catalogue'&&location.pathname.startsWith('/products')?'page':active === link.id&&href(link.id).startsWith('#')?'location':undefined}>{link.label}</a></li>)}</ul></nav>
      <div className="flex items-center header-actions"><a className="header-enquire" href={enquiryHref}>Enquire <Arrow diagonal /></a><button className="menu-trigger" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h18M3 17h18" /></svg></button></div>
    </div>
    <Dialog open={open} onClose={() => setOpen(false)} title="Navigation" className="mobile-menu"><Wordmark /><p className="eyebrow">Explore ANUPAMA ENTERPRISES</p><nav aria-label="Mobile"><ul>{[{label:'Home',id:'home'},{label:'Catalogue',id:'catalogue'},{label:'Our business',id:'business'}, { label: 'Have a requirement?', id: 'requirements' }, { label: 'Enquire', id: 'enquire' }].map(link => <li key={link.id}><a href={href(link.id)} onClick={e => {if(href(link.id).startsWith('#')){e.preventDefault();setOpen(false);goToSection(link.id);}else setOpen(false);}}>{link.label}<Arrow diagonal /></a></li>)}</ul></nav><p className="menu-location">Chandigarh, India<br />Manufacturing & Trading</p></Dialog>
  </header>;
}

