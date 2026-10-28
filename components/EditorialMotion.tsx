'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** A small set of once-only reveals; core content remains visible without JS. */
export default function EditorialMotion() {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector<HTMLElement>('[data-editorial-page]');
    if (!root) return;
    const context = gsap.context(() => {
      const heroParts = root.querySelectorAll<HTMLElement>('[data-hero-reveal]');
      if (heroParts.length) gsap.fromTo(heroParts, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.09, clearProps: 'transform,opacity' });

      root.querySelectorAll<HTMLElement>('[data-editorial-reveal]').forEach((element) => {
        gsap.fromTo(element, { opacity: 0, y: 20 }, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
        });
      });

      root.querySelectorAll<HTMLElement>('[data-editorial-image]').forEach((element) => {
        gsap.fromTo(element, { clipPath: 'inset(0 0 14% 0 round 3px)' }, {
          clipPath: 'inset(0 0 0% 0 round 3px)',
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });

      const compact = window.matchMedia('(max-width: 760px)').matches || window.matchMedia('(hover: none)').matches;
      const travel = compact ? 16 : 42;
      root.querySelectorAll<HTMLElement>('[data-parallax-section]').forEach((section, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        gsap.to(section, {
          '--altura-parallax-y': `${travel * direction}px`,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  return null;
}
