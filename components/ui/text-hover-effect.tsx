"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
type Props = { text: string; duration?: number; automatic?: boolean };
export const TextHoverEffect = ({text,duration=0.2}:Props) => {
  const ref=useRef<SVGSVGElement>(null), id=useId().replace(/:/g,'');
  const [reduced,setReduced]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [position,setPosition]=useState({cx:'50%',cy:'50%'});
  const typography={fontFamily:'Helvetica, Arial, sans-serif',fontSize:text.length>12?34:64,fontWeight:700};
  return <svg ref={ref} width="100%" height="100%" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={text} tabIndex={0} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} className="text-hover-effect select-none"
    onPointerEnter={e=>{if(!reduced && e.pointerType!=='touch')setHovered(true);}}
    onPointerLeave={()=>{setHovered(false);setPosition({cx:'50%',cy:'50%'});}}
    onPointerMove={e=>{if(reduced || e.pointerType==='touch' || !ref.current)return;const r=ref.current.getBoundingClientRect();if(!r.width||!r.height)return;setPosition({cx:`${Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))}%`,cy:`${Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))}%`});}}>
    <defs>
      <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f4bd62"/><stop offset="16%" stopColor="#f47759"/><stop offset="33%" stopColor="#ed76ae"/><stop offset="50%" stopColor="#a68bfa"/><stop offset="66%" stopColor="#68bdf2"/><stop offset="83%" stopColor="#66d5bd"/><stop offset="100%" stopColor="#e8d783"/></linearGradient>
      <motion.radialGradient id={`${id}-reveal`} r="35%" initial={false} animate={reduced?{cx:'50%',cy:'50%'}:position} transition={{duration:reduced?0:duration,ease:'easeOut'}}><stop offset="0%" stopColor="white"/><stop offset="100%" stopColor="black"/></motion.radialGradient>
      <mask id={`${id}-mask`}><rect width="300" height="80" fill={`url(#${id}-reveal)`}/></mask>
    </defs>
    {/* This complete outline stays mounted through lazy loading and every animation. */}
    <text data-wordmark-base="true" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" textLength="288" lengthAdjust="spacingAndGlyphs" fill="transparent" stroke="currentColor" strokeWidth=".45" strokeDashoffset="0" strokeDasharray="none" style={typography}>{text}</text>
    {!reduced&&<motion.text aria-hidden="true" data-wordmark-enhancement="true" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" textLength="288" lengthAdjust="spacingAndGlyphs" fill="transparent" stroke={`url(#${id}-gradient)`} strokeWidth=".45" style={{...typography,opacity:.25}} initial={{strokeDashoffset:1000,strokeDasharray:1000}} animate={{strokeDashoffset:0,strokeDasharray:1000}} transition={{duration:4,ease:'easeInOut'}}>{text}</motion.text>}
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" textLength="288" lengthAdjust="spacingAndGlyphs" fill="transparent" stroke={`url(#${id}-gradient)`} strokeWidth=".8" mask={`url(#${id}-mask)`} style={{...typography,opacity:(hovered||focused)&&!reduced?1:0}}>{text}</text>
  </svg>;
};



