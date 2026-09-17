import React, { useEffect, useMemo, useState } from 'react';
import { Arrow, SectionHeading } from './Primitives.jsx';
import CatalogueImage from './CatalogueImage.jsx';
import ProductTransition from './ProductTransition.jsx';
import { recordHomepageEvent } from '../lib/events.js';

const needs = [{ label: 'Packaging', categories: ['paper', 'boxes', 'tapes', 'protective'] }, { label: 'Carry bags', categories: ['carry'] }, { label: 'Labels', categories: ['labels'] }, { label: 'Office', categories: ['office'] }];
export default function Discovery({ products, onPreview, heroCategory, onCategoryChange }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [activeId, setActiveId] = useState('CAT-006');
  const [exploring, setExploring] = useState(false);
  const active = products.find(item => item.id === activeId) || products[0];
  useEffect(() => {
    if (exploring) return;
    const product = products.find(item => item.category === heroCategory);
    if (product) setActiveId(product.id);
  }, [heroCategory, exploring, products]);
  useEffect(() => { onCategoryChange?.(active.category); }, [active.category, onCategoryChange]);
  const matches = useMemo(() => products.filter(item => (!selected.length || selected.includes(item.category)) && (!query || query.toLowerCase().split(/\s+/).every(term => item.searchableText.includes(term)))), [products, query, selected]);
  function applyCategories(categories) { setExploring(true); setSelected(categories); const next = products.find(item => categories.includes(item.category)); if (next) setActiveId(next.id); recordHomepageEvent('filter_applied', { categoryIds: categories }); }
  function toggle(category) { applyCategories(selected.includes(category) ? selected.filter(id => id !== category) : [...selected, category]); }
  function reset() { setInput(''); setQuery(''); setSelected([]); setSubmitted(false); }
  return <section className="section discovery container" id="discover" tabIndex="-1" aria-labelledby="discovery-title">
    <SectionHeading number="01" eyebrow="Find your starting point" title={<span id="discovery-title">A world of<br />everyday essentials.</span>}><p className="heading-note">Start with a product area.<br />Find a reference for your requirement.</p></SectionHeading>
    <div className="discovery-workspace"><div className="discovery-controls"><form className="search-form" onSubmit={e => { e.preventDefault(); setQuery(input.trim()); setSubmitted(true); recordHomepageEvent('product_searched', { queryLength: input.trim().length }); }}><label htmlFor="product-search">Search catalogue references</label><div className="search-input-row flex"><input id="product-search" type="search" maxLength="120" value={input} onChange={e => setInput(e.target.value)} placeholder="Try paper, boxes or labels" /><button className="search-submit" aria-label="Search catalogue references" type="submit"><Arrow /></button></div></form>
      <fieldset className="categories"><legend>Explore by category</legend>{products.map(item => <button className={`category-choice ${selected.includes(item.category) ? 'selected' : ''}`} key={item.id} aria-pressed={selected.includes(item.category)} onMouseEnter={() => { if (matchMedia('(hover: hover) and (pointer: fine)').matches) { setExploring(true); setActiveId(item.id); } }} onFocus={() => { setExploring(true); setActiveId(item.id); }} onClick={() => { toggle(item.category); setActiveId(item.id); }}><span className="category-visual"><CatalogueImage imageKey={item.category} decorative /><span>{item.navigationLabel}</span></span><span className="category-mark" aria-hidden="true">{selected.includes(item.category) ? '−' : '+'}</span></button>)}</fieldset>
    </div><div className="discovery-results"><div className="result-header flex justify-between"><p aria-live="polite" aria-atomic="true">{submitted && !query ? 'Enter a product term, or choose a category.' : `${matches.length} catalogue ${matches.length === 1 ? 'reference' : 'references'}${query ? ` for “${query}”` : ''}`}</p><button className="reset-link" onClick={reset} disabled={!query && !selected.length && !input}>Reset</button></div>
      {(query || selected.length > 0) && <div className="filter-chips flex flex-wrap">{query && <button onClick={() => { setQuery(''); setInput(''); }}>Search: {query}<span aria-label="remove search">×</span></button>}{selected.map(id => <button key={id} onClick={() => toggle(id)}>{products.find(p => p.category === id)?.navigationLabel}<span aria-label="remove filter">×</span></button>)}</div>}
      <div className="category-stage" data-category={active.category}><div className="category-stage-copy"><p className="eyebrow">Explore the collection</p><h3 key={active.id}>{active.navigationLabel}</h3><button className="text-link" onClick={() => onPreview(active)}>Inspect this reference <Arrow diagonal /></button></div><div className="category-stage-media"><ProductTransition imageKey={active.category} /></div><span key={active.id} className="stage-index" aria-hidden="true">{active.ordinal}</span></div>
      {matches.length ? <details className="source-results" open={!!query || selected.length > 0}><summary>View source references <span>{matches.length}</span></summary><ul className="reference-list">{matches.map(item => <li key={item.id}><button onClick={() => onPreview(item)} className="reference-row"><span className="reference-number">{item.ordinal}</span><span className="reference-name">{item.name}<small>Catalogue reference · Current status requires confirmation</small></span><Arrow diagonal /></button></li>)}</ul></details> : <div className="empty-state"><h3>No matching references.</h3><p>Try a broader term or clear your categories. This search covers a curated homepage selection.</p><button className="button secondary" onClick={reset}>Clear search and filters <Arrow /></button></div>}
      <p className="reference-note">A curated selection from the inherited catalogue. Current products, availability and specifications require business confirmation.</p>
    </div></div>
    <div className="needs-row"><span className="eyebrow">Discover by need</span><div className="need-choices flex flex-wrap">{needs.map(need => <button key={need.label} onClick={() => applyCategories(need.categories)}>{need.label}<Arrow diagonal /></button>)}<a href="#enquire">A specific requirement <Arrow diagonal /></a></div></div>
  </section>;
}

