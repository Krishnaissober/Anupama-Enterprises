import { useEffect } from 'react';

// Content stays visible without JS/observer support. No scroll handler or perpetual loop.
export default function useHomepageMotion() {
  useEffect(() => {
    const root = document.getElementById('main-content');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)');
    const hero = root.querySelector('.hero-composition');
    let observer, visibilityObserver, frame = 0;
    const nodes = [...root.querySelectorAll('.section-heading, .editorial-card, .needs-row, .requirement-inner > div, .business-note > div, .contact-heading, .contact-image, .contact-lower')];
    const cards = nodes.filter(node => node.classList.contains('editorial-card'));
    nodes.forEach(node => {
      node.classList.add('motion-target');
      const followsHeading = node.matches('.business-copy, .requirement-copy, .contact-lower');
      node.style.setProperty('--reveal-order', String(followsHeading ? 2 : Math.max(0, cards.indexOf(node))));
    });
    function resetDepth() {
      cancelAnimationFrame(frame);
      hero.style.setProperty('--depth-x', '0px');
      hero.style.setProperty('--depth-y', '0px');
    }
    function configure() {
      observer?.disconnect();
      visibilityObserver?.disconnect();
      resetDepth();
      root.classList.toggle('motion-enabled', !reduce.matches);
      hero.classList.toggle('pointer-depth', !reduce.matches && fine.matches);
      if (reduce.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-arrived');
        observer.unobserve(entry.target);
      }), { threshold: 0.08 });
      nodes.filter(node => !node.classList.contains('motion-arrived')).forEach(node => observer.observe(node));
      visibilityObserver = new IntersectionObserver(entries => {
        root.querySelector('.hero').classList.toggle('hero-in-view', entries[0].isIntersecting);
      }, { threshold: 0.15 });
      visibilityObserver.observe(root.querySelector('.hero'));
    }
    function move(event) {
      if (reduce.matches || !fine.matches || event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const max = Number.parseFloat(getComputedStyle(root).getPropertyValue('--pointer-max')) || 4;
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        hero.style.setProperty('--depth-x', `${x * max}px`);
        hero.style.setProperty('--depth-y', `${y * max}px`);
      });
    }
    configure();
    function visibility() { root.classList.toggle('motion-background', document.hidden); }
    document.addEventListener('visibilitychange', visibility);
    reduce.addEventListener('change', configure); fine.addEventListener('change', configure);
    hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', resetDepth);
    return () => {
      observer?.disconnect(); visibilityObserver?.disconnect(); resetDepth(); root.classList.remove('motion-enabled');
      document.removeEventListener('visibilitychange', visibility);
      reduce.removeEventListener('change', configure); fine.removeEventListener('change', configure);
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', resetDepth);
    };
  }, []);
}
