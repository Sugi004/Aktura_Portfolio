'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import GlobeFallback from './GlobeFallback';

type Destination = 'london' | 'dubai' | 'singapore';
type City = Destination | 'new-york';
type Props = { story?: boolean; eager?: boolean; enabled?: boolean; destination?: Destination; focusCity?: City; progress?: MutableRefObject<{ value: number }>; onDestinationSelect?: (destination: Destination) => void; onFocusCity?: (city: City) => void; onSceneReady?: () => void; onSceneFailure?: () => void; label: string };

const GlobeCanvas = dynamic(() => import('./GlobeCanvasImpl'), { ssr: false, loading: () => <div className="globe-loading" aria-hidden="true" /> });

export default function GlobeMount({ story = false, eager = false, enabled = true, destination = 'london', focusCity, progress, onDestinationSelect, onFocusCity, onSceneReady, onSceneFailure, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(eager && enabled);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [sceneUnavailable, setSceneUnavailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const failureSent = useRef(false);
  const onReadyRef = useRef(onSceneReady);
  const onFailureRef = useRef(onSceneFailure);
  onReadyRef.current = onSceneReady;
  onFailureRef.current = onSceneFailure;

  const reportReady = useCallback(() => {
    failureSent.current = false;
    setSceneReady(true);
    setSceneUnavailable(false);
    onReadyRef.current?.();
  }, []);
  const reportFailure = useCallback(() => {
    if (failureSent.current) return;
    failureSent.current = true;
    setSceneUnavailable(true);
    onFailureRef.current?.();
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (!enabled) { setActive(false); return; }
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setMotionAllowed(!media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    if (connection?.saveData && !eager) {
      media.removeEventListener('change', updateMotion);
      return;
    }
    if (eager) {
      setActive(true);
      return () => media.removeEventListener('change', updateMotion);
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '220px' });
    observer.observe(element);
    return () => { observer.disconnect(); media.removeEventListener('change', updateMotion); };
  }, [eager, enabled]);

  useEffect(() => {
    if (!eager || !enabled || sceneUnavailable || sceneReady) return;
    const timer = window.setTimeout(reportFailure, 9000);
    return () => window.clearTimeout(timer);
  }, [eager, enabled, reportFailure, sceneReady, sceneUnavailable]);

  return <div className={`globe-mount ${story ? 'globe-mount-story' : 'globe-mount-hero'}`} ref={host} role="group" aria-label={label}>
    <div className="globe-loading" aria-hidden="true" />
    {active && !sceneUnavailable && <div className="globe-canvas-wrap"><GlobeCanvas story={story} destination={destination} focusCity={focusCity} progress={progress} onDestinationSelect={onDestinationSelect} onFocusCity={onFocusCity} onSceneReady={eager ? reportReady : undefined} onSceneFailure={reportFailure} active={active} motionAllowed={motionAllowed} /></div>}
    {sceneUnavailable && <GlobeFallback destination={destination} label={label} />}
  </div>;
}
