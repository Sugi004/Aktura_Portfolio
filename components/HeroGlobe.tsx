'use client';

import { useState } from 'react';
import GlobeMount from './GlobeMount';
import { useAppIntro } from './AppIntroCoordinator';

const destinations = [
  { id: 'london', label: 'London', code: 'LON' },
  { id: 'dubai', label: 'Dubai', code: 'DXB' },
  { id: 'singapore', label: 'Singapore', code: 'SIN' },
] as const;
type Destination = typeof destinations[number]['id'];

export default function HeroGlobe() {
  const [destination, setDestination] = useState<Destination>('london');
  const [focusCity, setFocusCity] = useState<Destination | 'new-york'>('london');
  const { reportEarthReady, reportEarthFailure, introVisible } = useAppIntro();
  const city = destinations.find((item) => item.id === destination)?.label ?? 'London';

  return <>
    <GlobeMount eager enabled={!introVisible} destination={destination} focusCity={focusCity} onFocusCity={setFocusCity} onDestinationSelect={(next) => { setDestination(next); setFocusCity(next); }} onSceneReady={reportEarthReady} onSceneFailure={reportEarthFailure} label={`Interactive 3D globe with a route from New York to ${city}. Click a destination marker or use the route buttons; drag or swipe to rotate.`} />
    <div className="hero-route-picker" role="group" aria-label="Choose a route destination">
      <button type="button" aria-label="Focus New York, route origin" aria-pressed={focusCity === 'new-york'} onClick={() => setFocusCity('new-york')}>NYC</button>
      {destinations.map((item) => <button key={item.id} type="button" aria-label={`${item.code} — set route destination to ${item.label}`} aria-pressed={destination === item.id} onClick={() => { setDestination(item.id); setFocusCity(item.id); }}>{item.code}</button>)}
    </div>
  </>;
}
