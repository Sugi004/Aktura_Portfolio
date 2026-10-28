import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, Plane, Hotel, MapPinned } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav from '@/components/MobileNav';
import { getPublicContent } from '@/lib/public-content';
import EditorialMotion from '@/components/EditorialMotion';
import BrandWordmark from '@/components/BrandWordmark';
import PrimaryNav from '@/components/PrimaryNav';

export const metadata: Metadata = {
  title: 'Travel & Reservations Desk | Altura Executive',
  description: 'Request flight research, hotel options, complete travel coordination and concierge support. Reservations are confirmed only by suppliers.',
};

export default async function TravelDeskPage() {
  const { services } = await getPublicContent();
  return <main id="main-content" className="travel-desk-page editorial-page" data-editorial-page>
    <EditorialMotion />
    <header className="site-header">
      <BrandWordmark/>
      <PrimaryNav/><MobileNav/>
      <ThemeToggle/><a className="button button-small button-dark header-cta" href="/#contact">Contact <ArrowUpRight size={15}/></a>
    </header>
    <section className="travel-desk-hero" data-editorial-reveal data-parallax-section="travel-hero"><a className="text-link" href="/"><ArrowLeft size={15}/> Back to home</a><p className="kicker"><span className="kicker-line"/> Dedicated travel & reservations desk</p><h1>Travel, thoughtfully <em>coordinated.</em></h1><p>Share your route, stay preferences or complete trip requirements. I’ll research suitable options, clarify the details and send a proposal for your approval.</p><div className="travel-desk-points"><article><Plane/><h2>Flights</h2><p>Route, cabin and schedule comparisons with coordination after you approve.</p></article><article><Hotel/><h2>Stays</h2><p>Hotel and accommodation options compared by location, amenities and budget.</p></article><article><MapPinned/><h2>Complete trips</h2><p>Transfers, car rentals, restaurants, meetings and itinerary details brought together.</p></article></div><p className="travel-disclaimer">This form requests assistance only. Prices and availability can change, and no flight or room is booked until the supplier confirms the reservation. Third-party charges are itemized separately from the service fee. Please do not include payment card or passport details.</p></section>
    <section className="travel-desk-form section-shell" id="request" data-editorial-reveal data-parallax-section="travel-request"><div><p className="kicker">Start a request</p><h2>Tell me what the trip needs.</h2><p>Select a travel service below. The request form will show the relevant trip details. I’ll follow up with options and obtain your approval before any reservation is coordinated.</p><p className="fine-print">For secure handling of sensitive booking documents, we’ll agree on an appropriate channel if needed.</p></div><ContactForm services={services} defaultService="flights"/></section>
    <footer className="site-footer" data-parallax-section="footer"><BrandWordmark className="footer-mark"/><p>Remote executive assistance and travel coordination.</p><div className="footer-links"><a href="/services">Services</a><a href="/packages">Packages</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div><span className="copyright">© {new Date().getFullYear()} · Altura Executive</span></footer>
  </main>;
}
