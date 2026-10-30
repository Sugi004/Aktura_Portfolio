'use client';

import { useState } from 'react';
import { testimonials } from '@/lib/review-content';

export default function ReviewCarousel() {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  return <section className="review-carousel" aria-labelledby="review-title" aria-roledescription="carousel">
    <div className="review-heading">
      <div>
        <p className="kicker">Client Reviews</p>
        <h2 id="review-title">Thoughtful support, in their words.</h2>
        <p>Shared by clients about their experience with Altura Executive.</p>
      </div>
    </div>
    <article className="review-card" aria-live="polite" aria-atomic="true" aria-label={`Testimonial ${active + 1} of ${testimonials.length}`} key={current.id}>
      <div className="review-card-top"><span className="review-category">{current.category}</span><span className="review-score"><span className="review-stars-display" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span className="review-star" key={index}><span className="review-stars-empty">★</span><span className="review-stars-filled" style={{ width: `${Math.round(Math.max(0, Math.min(1, current.rating - index)) * 100)}%` }}>★</span></span>)}</span><strong aria-label={`${current.rating.toFixed(1)} out of 5 stars`}>{current.rating.toFixed(1)}<small>/5</small></strong></span></div>
      <blockquote>
        {current.quote.split('\n\n').map((paragraph, index) => index === 0
          ? <p className="review-quote-lead" key={paragraph}>{paragraph}</p>
          : <p key={paragraph}>{paragraph}</p>)}
      </blockquote>
      <div className="review-attribution"><strong>{current.name}</strong><span>{current.role}</span></div>
    </article>
    <div className="review-controls">
      <button type="button" aria-label="Previous testimonial" onClick={() => setActive((active - 1 + testimonials.length) % testimonials.length)}>←</button>
      <span aria-live="polite">{active + 1} / {testimonials.length}</span>
      <button type="button" aria-label="Next testimonial" onClick={() => setActive((active + 1) % testimonials.length)}>→</button>
    </div>
  </section>;
}
