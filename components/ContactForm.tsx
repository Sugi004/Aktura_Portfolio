'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import type { Service } from '@/lib/content';

type Props = { services: Service[]; defaultService?: string };
type TravelKind = 'flights' | 'accommodation' | 'travel' | 'reservations';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label>{label}{children}</label>;
}

export default function ContactForm({ services, defaultService = '' }: Props) {
  const [selectedService, setSelectedService] = useState(defaultService);
  const [tripMode, setTripMode] = useState('return');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const service = useMemo(() => services.find(item => item.id === selectedService), [services, selectedService]);
  const requestKind = selectedService === 'flights' || /flight/i.test(service?.title ?? '') ? 'flight' : selectedService === 'accommodation' || /hotel|accommodation/i.test(service?.title ?? '') ? 'hotel' : selectedService === 'travel' || /complete travel|business travel/i.test(service?.title ?? '') ? 'complete-trip' : selectedService === 'reservations' || /reservation/i.test(service?.title ?? '') ? 'reservation' : undefined;
  const isTravelForm = Boolean(requestKind);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('service');
    if (requested && services.some(item => item.id === requested)) setSelectedService(requested);
    else if (defaultService && services.some(item => item.id === defaultService)) setSelectedService(defaultService);
  }, [services, defaultService]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('pending');
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields: Record<string, FormDataEntryValue> = {};
    data.forEach((value, key) => { fields[key] = value; });
    const text = (key: string) => typeof fields[`travel_${key}`] === 'string' ? String(fields[`travel_${key}`]).trim() : '';
    const tripType = requestKind;
    const travelDetails: Record<string, unknown> = {};
    const number = (key: string) => {
      const value = Number(fields[`travel_${key}`] || 0);
      return Number.isInteger(value) && value > 0 ? value : undefined;
    };
    const list = (key: string) => text(key).split(',').map(item => item.trim()).filter(Boolean);
    if (tripType) travelDetails.tripType = tripType;
    if (requestKind === 'flight') {
      if (text('origin')) travelDetails.origin = text('origin');
      if (text('destination')) travelDetails.destination = text('destination');
      if (text('departureDate')) travelDetails.departureDate = text('departureDate');
      if (text('returnDate')) travelDetails.returnDate = text('returnDate');
      if (text('tripMode')) travelDetails.tripMode = text('tripMode');
      if (number('passengers')) travelDetails.passengers = number('passengers');
      if (text('cabin')) travelDetails.cabin = text('cabin');
    }
    if (requestKind === 'hotel') {
      travelDetails.destination = text('destination');
      if (text('checkIn')) travelDetails.checkIn = text('checkIn');
      if (text('checkOut')) travelDetails.checkOut = text('checkOut');
      if (text('accommodationType')) travelDetails.accommodationType = text('accommodationType');
      if (text('amenities')) travelDetails.preferences = text('amenities');
      if (number('guests')) travelDetails.guests = number('guests');
      if (number('rooms')) travelDetails.rooms = number('rooms');
    }
    if (requestKind === 'complete-trip') {
      if (text('origin')) travelDetails.origin = text('origin');
      const destinations = list('destinations');
      if (destinations.length) travelDetails.destinations = destinations;
      if (text('departureDate')) travelDetails.departureDate = text('departureDate');
      if (text('returnDate')) travelDetails.returnDate = text('returnDate');
      if (number('passengers')) travelDetails.travelers = number('passengers');
      const components = ['flights', 'accommodation', 'transfers', 'car-rental', 'restaurants', 'meetings-events', 'additional-concierge']
        .filter((key) => fields[`travel_component_${key}`] === 'on');
      if (components.length) travelDetails.components = components;
      if (text('additional')) travelDetails.preferences = text('additional');
    }
    if (requestKind === 'reservation') {
      if (text('location')) travelDetails.location = text('location');
      if (text('occasion')) travelDetails.occasion = text('occasion');
      if (text('date')) travelDetails.date = text('date');
      if (text('time')) travelDetails.time = text('time');
      if (number('partySize')) travelDetails.partySize = number('partySize');
      if (text('preference')) travelDetails.preference = text('preference');
    }
    if (text('requirements')) travelDetails.requirements = text('requirements');
    const category = service?.group === 'Executive support' ? 'executive-support' : service?.group === 'Travel desk' ? 'travel' : service?.group === 'Business operations' ? 'business-operations' : service?.group === 'Digital support' ? 'digital-workflows' : 'other';
    const payload: Record<string, unknown> = {
      name: fields.name,
      email: fields.email,
      timezone: [String(fields.country ?? '').trim(), String(fields.timezone ?? '').trim()].filter(Boolean).join(' · '),
      service: selectedService,
      serviceSelections: data.getAll('additionalServices').map(String),
      serviceCategory: category,
      serviceSlug: selectedService,
      budget: [String(fields.budget ?? '').trim(), String(fields.currency ?? '').trim()].filter(Boolean).join(' '),
      contactMethod: fields.contactMethod,
      message: fields.message,
      consent: fields.consent === 'on',
      website: fields.website,
      ...(tripType ? { travelDetails } : {}),
    };
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Your request could not be sent. Please review the details and try again.');
      setState('success');
      setMessage(result.notificationSent === false
        ? `Your request was saved, but the business email alert was not sent. Keep this reference: ${result.id ?? 'saved request'}. A reply may be delayed. No reservation is confirmed by this request.`
        : 'Your request has been received. I’ll review the details and follow up about scope and next steps. No reservation is confirmed by this request.');
      form.reset();
      setSelectedService('');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Your request could not be sent. Please try again.');
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    {state === 'success' && <div className="form-alert success-alert" role="status"><Check size={17}/><span>{message}</span></div>}
    {state === 'error' && <div className="form-alert error-alert" role="alert">{message}</div>}
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
      <Field label="Preferred contact"><select name="contactMethod" defaultValue="email"><option value="email">Email</option><option value="video">Video call</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp (share number in message)</option></select></Field>
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
    <label className="consent-field"><input name="consent" type="checkbox" required/> I agree that these details may be used to respond to my inquiry. <a href="/privacy">Privacy notice</a>.</label>
    <div className="form-submit"><button className="button button-dark" type="submit" disabled={state === 'pending'}>{state === 'pending' ? <>Sending <LoaderCircle className="spin" size={15}/></> : <>Send an inquiry <ArrowUpRight size={16}/></>}</button><span>Submitting a request does not authorize a booking.</span></div>
    <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  </form>;
}
