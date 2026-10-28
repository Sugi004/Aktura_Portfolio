type Props = { destination: 'london' | 'dubai' | 'singapore'; label: string };

const cities = { london: 'London', dubai: 'Dubai', singapore: 'Singapore' } as const;

/** Static, clearly labelled fallback for browsers where WebGL cannot initialize. */
export default function GlobeFallback({ destination, label }: Props) {
  return <div className="globe-fallback" role="status" aria-label={`${label} Static Earth preview; interactive 3D is unavailable in this browser.`}>
    <div className="globe-fallback-orb" aria-hidden="true">
      <img src="/textures/earth-blue-marble.jpg" alt="" />
      <i className="globe-fallback-rim" />
      <svg viewBox="0 0 360 220" fill="none"><path d="M58 144C120 24 212 31 305 92" /></svg>
      <i className="globe-fallback-origin" />
      <i className="globe-fallback-destination" />
    </div>
    <div className="globe-fallback-caption"><span>Static Earth preview</span><strong>NYC <i/> {cities[destination].toUpperCase()}</strong></div>
  </div>;
}
