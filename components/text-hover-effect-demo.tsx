import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
const TextHoverEffect=lazy(()=>import('@/components/ui/text-hover-effect').then(module=>({default:module.TextHoverEffect})));
function StaticWordmark(){return <svg width="100%" height="100%" viewBox="0 0 300 80" role="img" aria-label="ANUPAMA ENTERPRISES"><text data-wordmark-base="true" strokeDashoffset="0" strokeDasharray="none" x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" textLength="288" lengthAdjust="spacingAndGlyphs" fill="transparent" stroke="currentColor" strokeWidth=".45" style={{fontFamily:'Helvetica, Arial, sans-serif',fontSize:34,fontWeight:700}}>ANUPAMA ENTERPRISES</text></svg>;}
export default function TextHoverEffectDemo(){
  const ref=useRef<HTMLElement>(null),[ready,setReady]=useState(false);
  useEffect(()=>{if(!ref.current)return;if(!('IntersectionObserver' in window)){setReady(true);return;}const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){setReady(true);observer.disconnect();}},{rootMargin:'300px'});observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <section ref={ref} className="brand-text-scene" aria-label="ANUPAMA ENTERPRISES"><div className="container"><p className="eyebrow">Paper. Packaging. Possibilities.</p><div className="brand-text-canvas flex items-center justify-center"><Suspense fallback={<StaticWordmark/>}>{ready?<TextHoverEffect text="ANUPAMA ENTERPRISES" duration={0.2}/>:<StaticWordmark/>}</Suspense></div><p className="brand-text-caption">Manufacturing &amp; Trading <span>Chandigarh, India</span></p></div></section>;
}




