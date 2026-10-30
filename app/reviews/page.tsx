import type { Metadata } from 'next';
import BrandWordmark from '@/components/BrandWordmark';
import ReviewCarousel from '@/components/ReviewCarousel';

export const metadata: Metadata = { title: 'Client Reviews | Altura Executive', description: 'Client reviews for Altura Executive support.' };

export default function ReviewsPage() {
  return <main id="main-content" className="review-page editorial-page" data-editorial-page>
    <header className="site-header"><BrandWordmark/><nav className="review-page-nav" aria-label="Main navigation"><a href="/services">Services</a><a href="/packages">Packages</a><a href="/contact">Contact</a></nav></header>
    <section className="review-page-intro"><a className="text-link" href="/">← Home</a><p className="kicker">Client Reviews</p><h1>Considered support,<br/><em>in their words.</em></h1><p>Thoughtful coordination across work, travel and everyday priorities.</p></section>
    <div className="review-page-carousel"><ReviewCarousel/></div>
    <div className="review-page-cta"><a className="button button-dark" href="/contact">Discuss your needs <span aria-hidden="true">↗</span></a></div>
    <footer className="site-footer"><BrandWordmark className="footer-mark"/><p>Remote executive assistance and travel coordination.</p><nav className="footer-links" aria-label="Footer"><a href="/services">Services</a><a href="/packages">Packages</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><span className="copyright">© {new Date().getFullYear()} · Altura Executive</span></footer>
  </main>;
}
