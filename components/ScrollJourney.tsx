'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowUpRight, Globe2 } from 'lucide-react';
import GlobeMount from './GlobeMount';

const destinations = {
  london: { city: 'London', detail: 'Compare flight and accommodation options, coordinate meeting schedules, and keep the itinerary in one clear place.' },
  dubai: { city: 'Dubai', detail: 'Coordinate hotel research, airport transfers, reservation requests, and reminders around your approved plans.' },
  singapore: { city: 'Singapore', detail: 'Bring multi-city planning, serviced-stay research, and cross-time-zone meeting coordination together.' },
} as const;
type Destination = keyof typeof destinations;

const chapters = [
  { eyebrow: '01 · A little more room', title: 'Your time, returned to what matters.', detail: 'One trusted remote partner can keep administrative, travel, and personal details moving with care. Start with a single task or define an ongoing arrangement.', link: '#about', linkText: 'Meet the approach' },
  { eyebrow: '02 · Executive assistance', title: 'The everyday details, handled.', detail: 'Inbox and calendar coordination, meeting preparation, document organization, follow-ups, and clear action lists give your attention a place to land.', link: '/services', linkText: 'Explore executive support' },
  { eyebrow: '03 · Travel concierge', title: 'A considered route from here to there.', detail: 'Choose a destination to preview the kind of coordination available. These are service examples, not live fares, hotel inventory, or booking confirmations.', link: '/travel', linkText: 'Open the travel desk' },
  { eyebrow: '04 · Business coordination', title: 'Momentum across the moving parts.', detail: 'Lead research, customer follow-up, project tracking, reports, and documented workflows keep agreed work visible and organized.', link: '/services', linkText: 'See business services' },
  { eyebrow: '05 · A clear working agreement', title: 'Scope first. Then underway.', detail: 'A request becomes a conversation, then a written scope with timing, deliverables, and fees. Work starts after you review and approve the proposal.', link: '/packages', linkText: 'Review package starting points' },
  { eyebrow: '06 · One thoughtful next step', title: 'Make space for what comes next.', detail: 'Illustrative samples show the working style. Share what you would like to make easier and we can clarify a useful next step together.', link: '#contact', linkText: 'Start a conversation' },
];

export default function ScrollJourney() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef({ value: 0 });
  const [activeChapter, setActiveChapter] = useState(0);
  const [destination, setDestination] = useState<Destination>('london');

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const nodes = section.current?.querySelectorAll<HTMLElement>('[data-journey-step]');
      if (!nodes) return;
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveChapter(Number((entry.target as HTMLElement).dataset.index));
      }, { rootMargin: '-30% 0px -35% 0px', threshold: 0 });
      nodes.forEach((node, index) => { node.dataset.index = String(index); observer.observe(node); });
      return () => observer.disconnect();
    }
    gsap.registerPlugin(ScrollTrigger);
    const root = section.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.to(progress.current, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top+=8%',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => {
            root.dataset.storyProgress = trigger.progress.toFixed(3);
            const next = Math.min(chapters.length - 1, Math.floor(trigger.progress * chapters.length));
            setActiveChapter((previous) => previous === next ? previous : next);
          },
        },
      });
      root.querySelectorAll<HTMLElement>('[data-journey-step]').forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 61%',
          end: 'bottom 39%',
          onEnter: () => setActiveChapter(index),
          onEnterBack: () => setActiveChapter(index),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return <section className="journey-section" id="journey" ref={section} aria-labelledby="journey-title" data-parallax-section="journey">
    <div className="journey-heading section-shell">
      <p className="kicker"><Globe2 size={14} aria-hidden="true"/> A more considered kind of support</p>
      <h2 id="journey-title">One trusted point of contact.<br/><em>Wherever the details take you.</em></h2>
      <p>Scroll through the ways support can move with you. The globe responds to the story; drag it to explore the route.</p>
    </div>
    <div className="journey-layout">
      <div className="journey-visual-column">
        <div className="journey-visual-sticky">
          <GlobeMount story destination={destination} progress={progress} onDestinationSelect={setDestination} label={`Interactive 3D travel globe. The current route connects New York with ${destinations[destination].city}.`} />
          <div className="journey-visual-topline"><span>ROUTES & RESPONSIBILITIES</span><span>01 — 06</span></div>
          <div className="journey-destination-panel">
            <div className="journey-destination-header"><span>ROUTE PREVIEW</span><span>COORDINATION EXAMPLE</span></div>
            <div className="journey-route-label"><span>NEW YORK</span><ArrowUpRight size={14} aria-hidden="true"/><strong>{destinations[destination].city.toUpperCase()}</strong></div>
            <div className="journey-destination-tabs" role="group" aria-label="Preview travel coordination by destination">
              {(Object.keys(destinations) as Destination[]).map((key) => <button key={key} type="button" aria-pressed={destination === key} onClick={() => setDestination(key)}>{destinations[key].city}</button>)}
            </div>
            <p aria-live="polite">{destinations[destination].detail}</p>
            <span className="journey-disclaimer">Illustrative service examples · no live availability</span>
          </div>
          <span className="journey-progress-mark" aria-hidden="true">{String(activeChapter + 1).padStart(2, '0')} <i/> 06</span>
        </div>
      </div>
      <div className="journey-steps">
        {chapters.map((chapter, index) => <article className={`journey-step ${activeChapter === index ? 'is-active' : ''}`} data-journey-step data-index={index} key={chapter.eyebrow}>
          <span className="journey-step-index">{chapter.eyebrow}</span>
          <h3>{chapter.title}</h3>
          <p>{chapter.detail}</p>
          <a className="text-link" href={chapter.link}>{chapter.linkText} <ArrowUpRight size={15} aria-hidden="true"/></a>
          {index < chapters.length - 1 && <ArrowDownRight className="journey-down" size={17} aria-hidden="true"/>}
        </article>)}
      </div>
    </div>
  </section>;
}
