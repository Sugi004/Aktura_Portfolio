import Image from 'next/image';
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, Globe2, Plane, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav from '@/components/MobileNav';
import HeroGlobe from '@/components/HeroGlobe';
import ScrollJourney from '@/components/ScrollJourney';
import PortfolioArt from '@/components/PortfolioArt';
import EditorialMotion from '@/components/EditorialMotion';
import { getPublicContent } from '@/lib/public-content';
import BrandWordmark from '@/components/BrandWordmark';
import ContactDetails from '@/components/ContactDetails';
import PrimaryNav from '@/components/PrimaryNav';
import ServiceVisualPair from '@/components/ServiceVisualPair';
import ReviewCarousel from '@/components/ReviewCarousel';

export default async function Home() {
  const { demos, faqs, packages, services } = await getPublicContent();
  const groups = [...new Set(services.map(s => s.group))];
  const structuredData = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Altura Executive', description: 'Remote executive assistance, business support and travel coordination for busy professionals.', email: 'alturaexecutive@gmail.com', telephone: '+12174681527', serviceType: ['Virtual executive assistant', 'Business travel coordinator', 'Remote personal assistant', 'Business support services'], areaServed: 'Worldwide' };
  return <main id="main-content" className="editorial-page" data-editorial-page data-app-intro-scene="earth">
    <EditorialMotion />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
    <header className="site-header">
      <BrandWordmark href="#home" />
      <PrimaryNav/>
      <MobileNav/>
      <ThemeToggle/>
      <a className="button button-small button-dark header-cta" href="#contact">Start a conversation <ArrowUpRight size={15}/></a>
      <a className="mobile-cta" href="#contact" aria-label="Contact"><ArrowUpRight size={20}/></a>
    </header>

    <div className="immersive-content">
    <section className="hero" id="home" data-parallax-section="hero">
      <div className="hero-copy">
        <p className="kicker" data-hero-reveal><span className="kicker-line"/> Altura Executive</p>
        <h1 aria-label="Higher standards of executive support." data-hero-reveal><span>Higher standards</span><em>of support.</em><span className="hero-title-close">The details around your day, thoughtfully handled.</span></h1>
        <p className="hero-sub" data-hero-reveal>Remote executive assistance across administration, business coordination, personal support and travel. Start with a task or discuss ongoing support; scope and fees are agreed before work begins.</p>
        <div className="hero-actions" data-hero-reveal><a className="button button-dark" href="#contact">Discuss your requirements <ArrowUpRight size={16}/></a><a className="text-link" href="#services">Explore services <ArrowDown size={15}/></a></div>
        <div className="hero-note" data-hero-reveal><span className="note-rule"/><span>Higher standards of executive support.</span></div>
      </div>
      <div className="hero-scene" aria-label="Interactive 3D globe showing a coordinated travel route" data-hero-reveal><HeroGlobe/><div className="hero-scene-label"><span>GLOBAL COORDINATION</span></div><div className="hero-scene-caption">A clearer route for work and travel.</div></div><div className="hero-index"><span>01</span><span className="index-rule"/><span>One trusted partner</span></div>
    </section>

    <section className="trust-strip" aria-label="Service principles" data-scene="principles" data-parallax-section="principles">
      <div><ShieldCheck/><span>Discreet by design</span></div><div><Globe2/><span>Remote, international support</span></div><div><Timer/><span>Work agreed around your priorities</span></div><div><Sparkles/><span>Details handled with care</span></div>
    </section>


    <section className="intro-section section-shell" id="about" data-scene="about" data-editorial-reveal data-parallax-section="about">
      <div className="section-aside"><span className="section-number">A01</span><span className="aside-line"/><span>How I can help</span></div>
      <div className="intro-main"><p className="kicker">A little more room in your day</p><h2>Good support feels like<br/><em>things simply moving.</em></h2></div>
      <div className="intro-detail"><p>I provide dependable, detail-oriented remote assistance for professionals who need the moving parts of work and life handled with care.</p><p>Choose one task, a defined project or ongoing monthly support. We agree scope, timing and fees before work begins. I work with discretion, clear communication and client approval at each important step.</p><p>For travel and administrative finance support, I coordinate research and records; suppliers confirm reservations, and regulated advice remains with your qualified professional.</p><a className="text-link" href="#how">See how it works <ArrowRight size={15}/></a></div>
    </section>

    <section className="problem-section section-shell" aria-labelledby="problem-title" data-editorial-reveal data-parallax-section="details"><div><p className="kicker">The details that add up</p><h2 id="problem-title">Give your attention back<br/><em>to the work that needs it.</em></h2></div><div className="problem-grid"><article><span>01</span><h3>Too many open loops</h3><p>Follow-ups, inbox tasks and small deadlines can pull focus away from higher-value work.</p></article><article><span>02</span><h3>Travel takes coordination</h3><p>Comparing flights, stays, transfers and meeting times is easier with one clear itinerary.</p></article><article><span>03</span><h3>Operations need follow-through</h3><p>Projects, leads and customer requests benefit from visible next steps and steady coordination.</p></article></div></section>

    <ScrollJourney />

    <section className="feature-travel" id="travel" data-scene="travel" data-editorial-reveal data-parallax-section="travel">
      <div className="travel-visual" data-editorial-image>
        <Image className="travel-photo" src="/images/executive-travel.webp" alt="View of an aircraft wing above the clouds at sunset" loading="lazy" width={1600} height={1000}/>
        <div className="travel-orbit orbit-one" aria-hidden="true"/><div className="travel-orbit orbit-two" aria-hidden="true"/>
        <div className="travel-visual-content" aria-hidden="true">
          <div className="route-tag"><span className="live-dot"/> YOUR TRAVEL DESK</div>
          <div className="route-map"><span className="map-arc"/><span className="map-point point-a"/><span className="map-point point-b"/><span className="plane-glyph"><Plane size={24}/></span><span className="map-city city-a">NEW YORK</span><span className="map-city city-b">LONDON</span></div>
          <div className="trip-card"><div><span className="trip-label">TRIP OVERVIEW</span><strong>One clear itinerary</strong></div><span className="trip-icon"><CalendarDays size={18}/></span><div className="trip-lines"><i/><i/><i/></div></div>
        </div>
        <div className="visual-caption">Research · coordination · confirmation</div>
      </div>
      <div className="travel-copy"><p className="kicker"><span className="kicker-line"/> Travel, thoughtfully coordinated</p><h2>From takeoff<br/>to <em>the details<br/>in between.</em></h2><p>Compare routes, stays and ground transport with your preferences in mind. I’ll bring the options together, coordinate approved arrangements and keep the itinerary clear.</p><ul className="check-list"><li><Check/> Flight and accommodation research</li><li><Check/> Transfer and reservation coordination</li><li><Check/> Itinerary, reminders and changes</li></ul><p className="fine-print">Prices and availability are set by providers. Reservations are final only after provider confirmation.</p><a className="button button-outline" href="/travel">Visit the travel desk <ArrowUpRight size={16}/></a></div>
    </section>

    <section className="services-section section-shell" id="services" data-scene="services" data-editorial-reveal data-parallax-section="services">
      <div className="section-heading"><div><p className="kicker">The service menu</p><h2>Support that meets<br/><em>the real shape of your day.</em></h2></div><p>Start with the part that needs attention. The exact scope is tailored together before we begin.</p></div>
      <div className="service-groups">{groups.map((group, gi)=><div className="service-group" key={group}><div className="group-head"><span className="section-number">0{gi+1}</span><h3>{group}</h3><span className="group-count">{String(services.filter(s=>s.group===group).length).padStart(2,'0')} services</span></div><div className="service-list">{services.filter(s=>s.group===group).map((service,i)=><details className="service-item" id={`service-${service.id}`} key={service.id}><summary><span className="service-title">{service.title}</span><span className="service-open">+</span></summary><div className="service-detail"><p>{service.summary}</p><ServiceVisualPair serviceId={service.id}/><div className="detail-grid"><div><h4>What I coordinate</h4><ul>{service.delivers.map(d=><li key={d}>{d}</li>)}</ul></div><div className="benefit-note"><h4>Why it helps</h4><p>{service.benefit}</p><a className="text-link" href={`/?service=${service.id}#contact`}>Request this service <ArrowUpRight size={14}/></a></div></div></div></details>)}</div></div>)}</div>
    </section>

    <section className="process-section" id="how" data-scene="process" data-editorial-reveal data-parallax-section="process"><div className="section-shell process-inner"><div className="process-intro"><p className="kicker">A clear way to begin</p><h2>Well considered.<br/><em>Then underway.</em></h2><p>Every request starts with a conversation and a shared understanding of what good looks like.</p></div><div className="process-steps">{[['01','Submit a request','Choose a service and describe what you need, when you need it and the preferences that matter.'],['02','Clarify requirements','We confirm requirements, budget, deadline and expectations.'],['03','Review the proposal','You receive the agreed scope, price, deliverables and relevant terms for approval.'],['04','Authorize the work','Work begins after your approval, onboarding and agreed payment conditions.'],['05','Updates and delivery','You receive updates, confirmations and completed deliverables according to our agreement.']].map(([n,t,d])=><div className="process-step" key={n}><span className="step-number">{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight size={16}/></div>)}</div></div></section>

    <section className="work-section section-shell" id="work" data-scene="work" data-editorial-reveal data-parallax-section="work"><div className="section-heading"><div><p className="kicker">Examples of the approach</p><h2>Organized around<br/><em>what matters next.</em></h2></div><p>Illustrative workflows show how support can come together. They are examples, not client engagements or outcome claims.</p></div><div className="demo-grid">{demos.map((d,i)=><article className="demo-item" key={d.name}><PortfolioArt index={i}/>{i === 0 ? <div className="demo-feature-copy"><p className="demo-kind">{d.kind}</p><h3>{d.name}</h3><p>{d.text}</p><a className="text-link" href="#contact">Discuss a similar need <ArrowUpRight size={14}/></a></div> : <><p className="demo-kind">{d.kind}</p><h3>{d.name}</h3><p>{d.text}</p><a className="text-link" href="#contact">Discuss a similar need <ArrowUpRight size={14}/></a></>}</article>)}</div></section>

    <section className="packages-section" id="packages" data-scene="packages" data-editorial-reveal data-parallax-section="packages"><div className="section-shell"><div className="section-heading package-heading"><div><p className="kicker">Ongoing support</p><h2>Steady help,<br/><em>at a thoughtful pace.</em></h2></div><p>Starting points for monthly arrangements. The final scope, hours and response windows are always agreed in a proposal.</p></div><div className="package-grid">{packages.map((p,i)=><article className={`package-card ${i===1?'package-featured':''}`} key={p.name}><div className="package-top"><span className="package-label">{i===1?'A little more coverage':i===0?'A focused start':'Broader partnership'}</span><span className="package-spark">{i===1?<Sparkles size={14} aria-hidden="true"/>:null}</span></div><h3>{p.name}</h3><p className="package-audience">{p.audience}</p><p className="package-availability">Scope and fees shared by proposal</p><ul>{p.scope.map(s=><li key={s}><Check aria-hidden="true"/>{s}</li>)}</ul><p className="package-note">{p.note}</p><a className={i===1?'button button-dark':'button button-outline'} href="#contact">Ask about this option <ArrowUpRight size={15}/></a></article>)}</div></div></section>

    <section className="section-shell reviews-home" id="reviews"><ReviewCarousel/></section>

    <section className="faq-section section-shell" id="faq" data-scene="faq" data-parallax-section="faq"><div className="faq-heading"><p className="kicker">A few useful details</p><h2>Questions, <em>answered.</em></h2><p>If your situation is specific, send a note and we can clarify it together.</p></div><div className="faq-list">{faqs.map(([q,a])=><details key={q} className="faq-item"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

    <section className="contact-section" id="contact" data-scene="contact" data-editorial-reveal data-parallax-section="contact"><div className="section-shell contact-inner"><div className="contact-copy"><p className="kicker"><span className="kicker-line"/> Begin with a conversation</p><h2>What would you like<br/>to <em>make easier?</em></h2><p>Share the outcome you’re looking for. I’ll follow up to clarify timing, scope and next steps.</p><ContactDetails/><div className="contact-footnote"><ShieldCheck size={18}/><span>Please don’t include card details, passport numbers or sensitive documents here. A secure channel can be agreed if needed.</span></div></div><ContactForm services={services}/></div></section>

    <footer className="site-footer" data-scene="footer" data-parallax-section="footer">
      <BrandWordmark href="#home" className="footer-mark" />
      <p>Remote executive assistance and travel coordination.</p>
      <nav className="footer-links" aria-label="Footer">
        <a href="/about">About</a><a href="/services">Services</a><a href="/travel">Travel desk</a><a href="/portfolio">Work</a><a href="/packages">Packages</a><a href="/reviews">Reviews</a><a href="/how-it-works">Process</a><a href="/faq">FAQs</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
      </nav>
      <span className="copyright">© {new Date().getFullYear()} · Altura Executive</span>
    </footer>
    </div>
  </main>;
}
