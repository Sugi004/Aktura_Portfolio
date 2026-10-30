'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Service } from '@/lib/content';
import { createContactMailto } from '@/lib/contact-mailto';

type Props = { services: Service[]; defaultService?: string };
type TravelKind = 'flights' | 'accommodation' | 'travel' | 'reservations';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label>{label}{children}</label>;
}

export default function ContactForm({ services, defaultService = '' }: Props) {
  const [selectedService, setSelectedService] = useState(defaultService);
  const [tripMode, setTripMode] = useState('return');
  const [mailtoHref, setMailtoHref] = useState('');
  const service = useMemo(() => services.find(item => item.id === selectedService), [services, selectedService]);
  const requestKind = selectedService === 'flights' || /flight/i.test(service?.title ?? '') ? 'flight' : selectedService === 'accommodation' || /hotel|accommodation/i.test(service?.title ?? '') ? 'hotel' : selectedService === 'travel' || /complete travel|business travel/i.test(service?.title ?? '') ? 'complete-trip' : selectedService === 'reservations' || /reservation/i.test(service?.title ?? '') ? 'reservation' : undefined;
  const isTravelForm = Boolean(requestKind);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('service');
    if (requested && services.some(item => item.id === requested)) setSelectedService(requested);
    else if (defaultService && services.some(item => item.id === defaultService)) setSelectedService(defaultService);
  }, [services, defaultService]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const serviceTitle = services.find((item) => item.id === String(data.get('service'))) ?.title ?? 'General inquiry';
    const displayLabel = (key: string) => key
      .replace(/^travel_component_/, 'trip component ')
      .replace(/^travel_/, '')
      .replace(/([A-Z])/g, ' $1')
      .replaceAll('_', ' ')
      .replace(/^./, (value) => value.toUpperCase());
    const lines = Array.from(data.entries())
      .filter(([key, value]) => key === 'service' ? false : key.startsWith('travel_component_') ? value === 'on' : String(value).trim().length > 0)
      .map(([key, value]) => {
        if (key === 'additionalServices') {
          const title = services.find((item) => item.id === String(value))?.title ?? String(value);
          return `Additional service: ${title}`;
        }
        if (key.startsWith('travel_component_')) return `Trip component: ${displayLabel(key).replace('Trip component ', '')}`;
        return `${displayLabel(key)}: ${String(value).trim()}`;
      });
    const subject = `Altura Executive inquiry — ${serviceTitle}`;
    const body = `Hello Altura Executive,\n\nI would like to discuss support with the following details:\n\n${lines.join('\n')}\n\nPlease let me know the next steps.\n`;
    setMailtoHref(createContactMailto('alturaexecutive@gmail.com', subject, body));
  }

  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row">
      <Field label="Your name"><input name="name" autoComplete="name" required placeholder="Name"/></Field>
      <Field label="Business email"><input name="email" type="email" autoComplete="email" required placeholder="you@company.com"/></Field>
    </div>
    <div className="form-row">
      <Field label="Country"><input name="country" autoComplete="country-name" placeholder="Country"/></Field>
      <Field label="Time zone"><input name="timezone" placeholder="e.g. GMT, UTC−4"/></Field>
    </div>
    <div className="form-row">
      <Field label="What can I help with?"><select name="service" value={selectedService} onChange={e=>setSelectedService(e.target.value)} required><option value="" disabled>Select a service</option>{services.map(s=><option value={s.id} key={s.id}>{s.title}</option>)}</select></Field>
      <Field label="Preferred contact"><select name="contactMethod" defaultValue="Email"><option value="Email">Email</option><option value="Video call">Video call</option><option value="Phone">Phone</option><option value="WhatsApp: [Replace with your number]">WhatsApp (share number in message)</option></select></Field>
    </div>
    <details className="additional-services"><summary>Add more services to this request</summary><div>{services.filter(item=>item.id!==selectedService).map(item=><label key={item.id}><input type="checkbox" name="additionalServices" value={item.id}/>{item.title}</label>)}</div></details>
    <div className="form-row">
      <Field label="Estimated budget"><select name="budget" defaultValue=""><option value="" disabled>Select a range</option><option>Under 250</option><option>250–750</option><option>750–2,000</option><option>2,000+</option><option>Not sure yet</option></select></Field>
      <Field label="Currency"><select name="currency" defaultValue="USD"><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>AUD</option><option>Other</option></select></Field>
    </div>
    {isTravelForm && <fieldset className="travel-fields"><legend>{requestKind === 'flight' ? 'Flight request details' : requestKind === 'hotel' ? 'Accommodation request details' : requestKind === 'reservation' ? 'Reservation request details' : 'Trip coordination details'}</legend>
      {requestKind === 'flight' && <>
        <div className="form-row"><Field label="Departure city"><input name="travel_origin" placeholder="City or airport" required/></Field><Field label="Destination"><input name="travel_destination" placeholder="City or airport" required/></Field></div>
        <div className="form-row"><Field label="Journey type"><select name="travel_tripMode" value={tripMode} onChange={event=>setTripMode(event.target.value)}><option value="one-way">One-way</option><option value="return">Return</option></select></Field><Field label="Departure date"><input name="travel_departureDate" type="date" required/></Field></div>
        {tripMode === 'return' && <Field label="Return date"><input name="travel_returnDate" type="date" required/></Field>}
        <div className="form-row"><Field label="Passengers"><input name="travel_passengers" type="number" min="1" max="20" defaultValue="1" required/></Field><Field label="Preferred cabin"><select name="travel_cabin" defaultValue=""><option value="">No preference</option><option>Economy</option><option>Premium economy</option><option>Business</option><option>First</option></select></Field></div>
      </>}
      {requestKind === 'hotel' && <>
        <div className="form-row"><Field label="Destination"><input name="travel_destination" placeholder="City or area" required/></Field><Field label="Accommodation type"><select name="travel_accommodationType" defaultValue=""><option value="">No preference</option><option>Hotel</option><option>Serviced apartment</option><option>Extended stay</option><option>Other</option></select></Field></div>
        <div className="form-row"><Field label="Check-in"><input name="travel_checkIn" type="date" required/></Field><Field label="Check-out"><input name="travel_checkOut" type="date" required/></Field></div>
        <div className="form-row"><Field label="Guests"><input name="travel_guests" type="number" min="1" max="20" defaultValue="1" required/></Field><Field label="Rooms"><input name="travel_rooms" type="number" min="1" max="20" defaultValue="1"/></Field></div>
        <Field label="Preferred amenities"><input name="travel_amenities" placeholder="e.g. breakfast, accessibility, gym, workspace"/></Field>
      </>}
      {requestKind === 'complete-trip' && <>
        <div className="form-row"><Field label="Departure city"><input name="travel_origin" placeholder="City or airport" required/></Field><Field label="Destinations"><input name="travel_destinations" placeholder="Cities or route" required/></Field></div>
        <div className="form-row"><Field label="Departure date"><input name="travel_departureDate" type="date" required/></Field><Field label="Return date"><input name="travel_returnDate" type="date"/></Field></div>
        <Field label="Travelers"><input name="travel_passengers" type="number" min="1" max="20" defaultValue="1" required/></Field>
        <fieldset className="travel-component-options"><legend>What should I coordinate?</legend>{[['flights','Flight coordination'],['accommodation','Accommodation'],['transfers','Airport transfers'],['car-rental','Car rental'],['restaurants','Restaurant reservations'],['meetings-events','Meeting and event scheduling'],['additional-concierge','Additional concierge support']].map(([value,label])=><label key={value}><input name={`travel_component_${value}`} type="checkbox"/>{label}</label>)}</fieldset>
        <Field label="Other trip details"><input name="travel_additional" placeholder="Anything else to include?"/></Field>
      </>}
      {requestKind === 'reservation' && <>
        <div className="form-row"><Field label="City or venue area"><input name="travel_location" placeholder="Neighborhood or address" required/></Field><Field label="Occasion"><input name="travel_occasion" placeholder="Dinner, event, meeting…"/></Field></div>
        <div className="form-row"><Field label="Preferred date"><input name="travel_date" type="date" required/></Field><Field label="Preferred time"><input name="travel_time" type="time"/></Field></div>
        <div className="form-row"><Field label="Party size"><input name="travel_partySize" type="number" min="1" max="100" defaultValue="2" required/></Field><Field label="Location preference"><input name="travel_preference" placeholder="Area, style or venue"/></Field></div>
      </>}
      <Field label="Travel budget and other requirements"><input name="travel_requirements" placeholder="Amount and currency, flexibility, room needs or preferences"/></Field>
    </fieldset>}
    <Field label="Project description"><textarea name="message" rows={4} required placeholder="A few details about your request, deadline and preferences…"/></Field>
    <p className="contact-form-privacy">Your details stay in this form until you choose to open your email app. The website does not store or send them. Please don’t include card or passport details.</p>
    <div className="form-submit"><button className="button button-dark" type="submit">Prepare email <ArrowUpRight size={16}/></button><span>This website does not store your request.</span></div>
    {mailtoHref && <div className="form-alert success-alert" role="status"><span>Your email draft is ready. It won’t be sent until you choose Send in your email app.</span><a className="button button-outline" href={mailtoHref}>Open email app <ArrowUpRight size={15}/></a></div>}
  </form>;
}
