import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav from '@/components/MobileNav';
import { getPublicContent } from '@/lib/public-content';
import EditorialMotion from '@/components/EditorialMotion';
import BrandWordmark from '@/components/BrandWordmark';
import ContactDetails from '@/components/ContactDetails';
import PrimaryNav from '@/components/PrimaryNav';
import ServiceVisualPair from '@/components/ServiceVisualPair';

const pages = {
  about: { title: 'A dependable partner for the details.', eyebrow: 'About', description: 'Professional, detail-oriented remote assistance shaped around clear communication, discretion and agreed priorities.' },
  services: { title: 'Practical support, across work and life.', eyebrow: 'Services', description: 'Choose a single task, project or a defined ongoing arrangement. Scope and fees are agreed before work begins.' },
  portfolio: { title: 'Examples of the way I work.', eyebrow: 'Portfolio & demonstrations', description: 'These illustrative samples show possible deliverables and working methods. They are not paid client projects or claims of actual results.' },
  packages: { title: 'Steady support, clearly scoped.', eyebrow: 'Packages', description: 'Choose a starting scope. Fees, hours and response windows are shared in a proposal before work begins.' },
  'how-it-works': { title: 'A clear path from request to delivery.', eyebrow: 'How it works', description: 'Every engagement starts with requirements, approval and a shared understanding of what success looks like.' },
  faq: { title: 'Useful details, answered.', eyebrow: 'Frequently asked questions', description: 'If your situation is specific, send an inquiry and we can clarify it together.' },
  contact: { title: 'What would you like to make easier?', eyebrow: 'Contact & consultation', description: 'Share the outcome you are looking for. I’ll follow up to clarify timing, scope and next steps.' },
} as const;

type Section = keyof typeof pages;
export function generateStaticParams() { return Object.keys(pages).map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  if (!(section in pages)) return {};
  const page = pages[section as Section];
  return { title: `${page.eyebrow} | Altura Executive`, description: page.description };
}

export default async function ContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: raw } = await params;
  if (!(raw in pages)) notFound();
  const section = raw as Section;
  const page = pages[section];
  const { services, packages, demos, faqs } = await getPublicContent();
  return <main id="main-content" className="content-page editorial-page" data-editorial-page>
    <EditorialMotion />
    <header className="site-header"><BrandWordmark/><PrimaryNav/><MobileNav/><ThemeToggle/><a className="button button-small button-dark header-cta" href="/contact">Contact <ArrowUpRight size={15}/></a></header>
    <section className="content-page-hero" data-editorial-reveal data-parallax-section="page-hero"><a className="text-link" href="/"><ArrowLeft size={15}/> Home</a><p className="kicker">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.description}</p></section>
    {section === 'about' && <section className="content-page-body" data-parallax-section="page-content"><h2>Dependable support, delivered remotely.</h2><p>I provide remote assistance for busy professionals, entrepreneurs and business owners. My approach is to understand the request, confirm priorities and communicate clearly as work progresses.</p><div className="content-value-grid">{[['Clarity','Agree the scope, timing, budget and deliverables before work begins.'],['Discretion','Request only the information needed to coordinate the work and protect confidential details.'],['Careful follow-through','Track the next step, deadline and approval so details do not get lost.'],['Client control','Present options and obtain approval before commitments or reservations are made.']].map(([title, text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><h2>Tools and capabilities</h2><p>Support can include calendar and inbox coordination, spreadsheets, document preparation, online research, travel option comparisons and workflow documentation. Specific tools and access are agreed to fit each engagement.</p><p>Professional development and relevant experience can be added here once the owner supplies approved details. No client names, credentials or results are implied on this page.</p></section>}
    {section === 'services' && <section className="content-page-body service-catalog" data-parallax-section="page-content">{[...new Set(services.map(s=>s.group))].map(group=><div key={group}><h2>{group}</h2><div className="content-card-grid">{services.filter(s=>s.group===group).map(s=><article className="content-info-card" key={s.id}><p className="kicker">{s.group}</p><h3>{s.title}</h3><p className="service-summary">{s.summary}</p><ServiceVisualPair serviceId={s.id}/><h4>Included tasks & deliverables</h4><ul>{s.delivers.map(task=><li key={task}><Check size={15}/>{task}</li>)}</ul><p className="service-benefit"><strong>Client benefit:</strong> {s.benefit}</p><a className="button button-outline" href={`/contact?service=${s.id}`}>Request this service <ArrowUpRight size={15}/></a></article>)}</div></div>)}<p>Combine services into a personalized package by describing the mix of support you need in your inquiry.</p></section>}
    {section === 'portfolio' && <section className="content-page-body" data-parallax-section="page-content"><div className="content-card-grid content-portfolio-grid">{demos.map((demo,i)=><article className="content-info-card" key={demo.name}><p className="kicker">Sample work · illustrative {String(i+1).padStart(2,'0')}</p><h2>{demo.name}</h2><p>{demo.text}</p><p>Demonstration only; not a real client engagement or outcome claim.</p></article>)}</div></section>}
    {section === 'packages' && <section className="content-page-body" data-parallax-section="page-content"><div className="content-card-grid content-packages-grid">{packages.map(p=><article className="content-info-card" key={p.name}><h2>{p.name}</h2><p className="package-availability">Scope and fees shared by proposal</p><p className="package-audience">{p.audience}</p><ul>{p.scope.map(item=><li key={item}><Check size={15}/>{item}</li>)}</ul><p className="package-note">{p.note} Third-party travel charges are itemized separately.</p><a className="button button-dark" href="/contact">Request a quotation <ArrowUpRight size={15}/></a></article>)}</div><p>One-time project support, custom travel coordination fees and custom monthly packages are available by quotation. No unlimited assistance is included.</p></section>}
    {section === 'how-it-works' && <section className="content-page-body content-process" data-parallax-section="page-content">{[['01','Submit a request','Choose services and describe your needs, deadline and preferences.'],['02','Consultation and requirements','Clarify requirements, budget, timing and expectations.'],['03','Proposal and approval','Review the agreed scope, price, deliverables and terms.'],['04','Work begins','Authorized tasks start after approval and agreed onboarding and payment conditions.'],['05','Updates and delivery','Receive updates, confirmations, reports or completed deliverables as agreed.']].map(([n,title,text])=><article key={n}><span>{n}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</section>}
    {section === 'faq' && <section className="content-page-body" data-parallax-section="page-content"><div className="faq-list">{faqs.map(([q,a])=><details key={q} className="faq-item"><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>}
    {section === 'contact' && <section className="content-page-body contact-page-content" data-parallax-section="page-content"><div><ShieldCheck/><h2>Share only what’s needed.</h2><p>Do not send card details, passport numbers or sensitive documents through this form. A secure channel can be agreed if required. Requesting assistance does not authorize a booking.</p><ContactDetails/></div><ContactForm services={services}/></section>}
    <footer className="site-footer" data-parallax-section="footer">
      <BrandWordmark className="footer-mark" />
      <p>Remote executive assistance and travel coordination.</p>
      <nav className="footer-links" aria-label="Footer">
        <a href="/services">Services</a><a href="/travel">Travel desk</a><a href="/portfolio">Work</a><a href="/packages">Packages</a><a href="/faq">FAQ</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a>
      </nav>
      <span className="copyright">© {new Date().getFullYear()} · Altura Executive</span>
    </footer>
  </main>;
}
