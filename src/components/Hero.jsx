import React, { useState } from 'react';
import { Arrow, ImageSlot } from './Primitives.jsx';

export default function Hero({ onProductChange }) {
  const [paused, setPaused] = useState(false);
  return <section className="hero container" aria-labelledby="hero-title">
    <div className="hero-copy"><p className="eyebrow hero-eyebrow">Chandigarh, India <span aria-hidden="true">/</span> Manufacturing & Trading</p>
      <h1 id="hero-title"><span className="hero-line"><span className="hero-word">Paper.</span></span><span className="hero-line"><span className="hero-word">Packaging.</span></span><span className="hero-line hero-accent"><span className="hero-word">Possibilities.</span></span></h1>
      <p className="hero-description">A world of paper bags, packaging and everyday essentials. Explore the product references. Start with what you need.</p>
      <div className="hero-buttons flex flex-wrap"><a className="button" href="#discover">Explore the range <Arrow /></a><a className="text-link" href="#enquire">Discuss a requirement <Arrow diagonal /></a></div>
    </div>
    <div className="hero-composition"><ImageSlot label="Labels" imageKey="labels" transition onImageChange={onProductChange} variant="hero-main" ordinal="01" /><ImageSlot label="Packaging" variant="hero-support" ordinal="02" /><ImageSlot label="Wrap" variant="hero-foreground" ordinal="03" /><div className="hero-caption"><span className="caption-rule" /><p>Paper. Pack. Protect.<br /><span>Product imagery from the inherited catalogue.</span></p></div></div>
    <div className="hero-foot"><span>Paper bags / Packaging / Office stationery</span><button className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Resume image motion' : 'Pause image motion'}</button><a href="#discover">Discover below <span aria-hidden="true">↓</span></a></div>
  </section>;
}




