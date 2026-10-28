'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import GlobeFallback from './GlobeFallback';

const EarthScene = dynamic(() => import('./GlobeCanvasImpl'), { ssr: false, loading: () => null });

export default function IntroGlobe({ active, onReady, onFailure }: { active: boolean; onReady: () => void; onFailure: () => void }) {
  const [failed, setFailed] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionAllowed(!media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const fail = () => { setFailed(true); onFailure(); };
  return <div className="app-intro-globe">
    {!failed && <EarthScene active={active} motionAllowed={motionAllowed} destination="london" focusCity="london" onSceneReady={onReady} onSceneFailure={fail} />}
    {failed && <GlobeFallback destination="london" label="Altura Executive travel preview." />}
  </div>;
}
