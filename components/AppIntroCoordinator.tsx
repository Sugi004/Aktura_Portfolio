'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import IntroGlobe from './IntroGlobe';
import { createTimeline } from 'animejs';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type IntroContextValue = {
  reportEarthReady: () => void;
  reportEarthFailure: () => void;
  introVisible: boolean;
};

const noop = () => {};
const IntroContext = createContext<IntroContextValue>({ reportEarthReady: noop, reportEarthFailure: noop, introVisible: false });

export function useAppIntro() {
  return useContext(IntroContext);
}

export default function AppIntroCoordinator({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasHomepageScene = pathname === '/';
  const [showIntro, setShowIntro] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const [earthRequired, setEarthRequired] = useState(false);
  const [earthStatus, setEarthStatus] = useState<'pending' | 'ready' | 'failed'>('pending');
  const earthStatusRef = useRef(earthStatus);
  earthStatusRef.current = earthStatus;

  const reportEarthReady = useCallback(() => setEarthStatus('ready'), []);
  const reportEarthFailure = useCallback(() => setEarthStatus((status) => status === 'ready' ? status : 'failed'), []);
  const context = useMemo(() => ({ reportEarthReady, reportEarthFailure, introVisible: showIntro }), [reportEarthReady, reportEarthFailure, showIntro]);

  useEffect(() => {
    const requiresEarth = hasHomepageScene && Boolean(document.querySelector('[data-app-intro-scene="earth"]'));
    setEarthRequired(requiresEarth);
    if (!requiresEarth) setEarthStatus('ready');

    let firstFrame = 0;
    let secondFrame = 0;
    const minTimer = window.setTimeout(() => setMinimumTimeElapsed(true), 1600);
    // The intro is a short visual sequence; the optional globe never gates the page.
    const sceneWatchdog = requiresEarth ? window.setTimeout(() => {
      if (earthStatusRef.current === 'pending') setEarthStatus('failed');
    }, 9000) : undefined;
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setLayoutReady(true));
    });
    if ('fonts' in document) {
      document.fonts.ready.then(() => setFontsReady(true), () => setFontsReady(true));
    } else {
      setFontsReady(true);
    }

    return () => {
      window.clearTimeout(minTimer);
      if (sceneWatchdog) window.clearTimeout(sceneWatchdog);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [hasHomepageScene]);

  useEffect(() => {
    const root = document.documentElement;
    const release = () => root.removeAttribute('data-intro');
    // The intro plays on the first page of a session, whichever link opened it.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return release();
    try {
      if (window.sessionStorage.getItem('altura-intro-seen') === '1') return release();
      window.sessionStorage.setItem('altura-intro-seen', '1');
    } catch {
      // If session storage is unavailable, skip the intro instead of repeating it.
      return release();
    }
    setShowIntro(true);
    release();
  }, []);

  useEffect(() => {
    if (!showIntro || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timeline = createTimeline({ defaults: { ease: 'outCubic' } });
    timeline
      .add('.app-intro-wordmark', { opacity: [0, 1], y: [10, 0], duration: 550 })
      .add('.app-intro-scene', { opacity: [0, 1], scale: [.96, 1], duration: 850 }, '-=220')
      .add('.app-intro-title, .app-intro-subtitle', { opacity: [0, 1], y: [8, 0], duration: 500, delay: 90 }, '-=360');
    return () => { timeline.pause(); };
  }, [showIntro]);

  useEffect(() => {
    const ready = fontsReady && layoutReady && minimumTimeElapsed;
    if (!ready || !showIntro) return;
    setLeaving(true);
    const timer = window.setTimeout(() => setShowIntro(false), 520);
    return () => window.clearTimeout(timer);
  }, [earthRequired, earthStatus, fontsReady, layoutReady, minimumTimeElapsed, showIntro]);

  return <IntroContext.Provider value={context}>
    <div className="app-content" aria-hidden={showIntro ? true : undefined} inert={showIntro || undefined}>{children}</div>
    {showIntro && <div className={`app-intro${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Altura Executive brand introduction">
      <div className="app-intro-wordmark"><Image className="app-intro-logo" src="/images/altura-mark.webp" alt="" width={520} height={384}/><span>Altura Executive</span></div>
      {hasHomepageScene && <div className="app-intro-scene" aria-label="Three-dimensional Earth with a New York to London route"><IntroGlobe active={showIntro} onReady={reportEarthReady} onFailure={reportEarthFailure}/></div>}
      <p className="app-intro-title">Higher standards of executive support</p>
      <span className="app-intro-subtitle">Thoughtful executive and travel coordination</span>
      <div className="app-intro-progress" aria-hidden="true"><i /></div>
    </div>}
  </IntroContext.Provider>;
}
