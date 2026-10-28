# 3D implementation audit

**Scope:** Existing site at `http://localhost:3001/`, evaluated against the attached master build brief and `docs/Portfolio.md`.
**Status:** Core 3D/scroll implementation and the nine intended public routes are in place. Production build, TypeScript check and inquiry tests pass. Visual/browser measurements cover the nine public routes at desktop, tablet and mobile viewports. Some input paths and backend-connected behaviors cannot be fully confirmed without a configured Supabase project and physical touch input.

## Findings and fixes

| Severity | Finding and evidence before changes | Root cause | Fix and current evidence |
|---|---|---|---|
| High | The hero contained a WebGL canvas, but an opaque CSS scene wash dominated the globe and the canvas had `pointer-events:none`; the real scene was visually obscured and could not receive drag input. | Layering and pointer-event styles made an implemented canvas look like a flat decorative illustration. | Removed the overdraw, replaced the hero with an R3F globe built from sphere/route/orbit geometry and lit materials, and enabled OrbitControls drag/touch. Production browser confirmed a WebGL context and visible scene; Chrome DevTools successfully dispatched a drag on the accessible hero globe at 390px touch emulation. This is automated gesture evidence, not a physical-device touch test. |
| High | No `@react-three/fiber` or GSAP/ScrollTrigger implementation was present; page sections had no 3D properties tied to scroll progress. | Existing scene ran independently of the page narrative. | Added a R3F scroll-story globe and GSAP ScrollTrigger progression. Browser evaluation confirmed the scene progress value changes during scroll and the active service chapter/destination text changes. Scene unmounts when outside the viewport margin; GSAP context and scene resources clean up on unmount. |
| High | The travel visual was a CSS map and destinations did not act as controls. | Visual had no scene objects or useful interaction. | Added a spatial globe with selectable destination controls and associated service copy. Destination selection updates route/detail content; this is a coordination example, not a booking or live-data claim. Browser confirmed the controls and text update. |
| Medium | Mobile hero text was excessively tall and the scroll-story scene disappeared as its steps advanced. | Desktop composition rules were carried onto narrow screens; offscreen canvas mounting conflicted with a mobile sticky layout. | Added mobile hero typography and a sticky journey visual; adjusted canvas visibility/mount thresholds. At 390px wide, document width equals viewport width, the story visual stays available during the measured scroll, and scene mount count is bounded. |
| Medium | Initial Lighthouse audit flagged insufficient contrast in story text and service category numbers. | Accent and muted text colors were too light for the ivory surfaces. | Darkened story labels/body/link colors and service numerals; raised the coral accent on the dark travel panel. The latest mobile Lighthouse audit reports Accessibility **100**. |
| Low | An early Lighthouse run against the development server reported a missing meta description even though the response contained the description tag. | The development audit/navigation result was transient; production Lighthouse later evaluated the built route correctly. | Verified the rendered response and DOM metadata, then reran both Lighthouse device modes against production. Final desktop and mobile audits both report SEO 100 with no failing audits. |
| Medium | Concurrently running `next dev` and `next build` corrupted the shared `.next` output once; dev server returned a transient 500 and RSC/webpack manifest errors. | Both Next processes wrote to the same build directory during verification. | Stopped/restarted the dev server after the build. Subsequent route checks and mobile Lighthouse navigation returned successfully. Avoid running both commands concurrently against the same `.next` directory. |

## Browser and responsive verification

- Browser target: `http://localhost:3001/`, using Chrome DevTools integration.
- At 390×844 mobile, the homepage rendered one WebGL canvas with a live WebGL context, an accessible H1, and `scrollWidth === innerWidth` (390px).
- The scene is rendered from R3F/Three.js geometry and materials: textured globe sphere, route tube, geographic grid, destination points, lights and shadow-enabled renderer. It is not an image, CSS sphere, video or SVG substitute.
- Scroll progress was observed changing in the scene's `data-story-progress`; active chapter and destination text changed as the page was scrolled.
- The following public routes were loaded at 1440×1000 desktop, 820×1180 tablet, and 390×844 mobile; each had a main landmark, H1, and no horizontal document overflow at the measured viewport: `/`, `/about`, `/services`, `/travel`, `/portfolio`, `/packages`, `/how-it-works`, `/contact`, `/faq`.
- Final production Lighthouse navigation audits: mobile Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100 (55 audits passed); desktop Accessibility 100, Best Practices 100, SEO 100, Agentic Browsing 100 (56 audits passed). Neither reported a failing audit. The Lighthouse tool does not include its performance category.
- A separate mobile production performance trace at default 1× CPU/network reported observed lab LCP 61ms and CLS 0.00; no CrUX field data exists for localhost. This is a local lab snapshot, not a throttled-device or field-performance guarantee.
- A browser console review after the runtime fixes reported no application errors; an R3F/Three.js deprecation warning for `THREE.Clock` was observed during development. The production build completed.
- Before/after screenshots were viewed in the browser tool. Persisting screenshot files was unavailable because the browser screenshot save operation rejected workspace paths; no screenshot file is claimed as an artifact.

## Functionality and security

- Existing inquiry validation suite passes 8/8 tests, covering normalization, required fields, combined services, honeypot handling, travel field allowlists and date validation.
- Flight, hotel and complete-trip request fields remain in the travel inquiry path; public contact/service inquiries still use the existing `ContactForm` flow.
- Supabase-backed admin pages and CSV export keep server-side authentication/authorization checks. The no-configuration admin page displays “Admin is not configured”; no customer data is available in this environment. **Live sign-in, protected dashboard access and database submission/notification behavior were not tested because this workspace has no configured Supabase credentials.**
- Privacy/terms pages and all nine intended routes returned HTTP 200 during the route sweep. Admin login rendered; actual authorized/unauthorized session cases require backend credentials.
- The hero/story honor `prefers-reduced-motion`; WebGL is lazy-mounted, DPR-limited and unloaded offscreen. A physical mobile device and GPU profiling were unavailable, so battery/thermal behavior is not measured.

## Commands and checks

- `npm run build` — passed (optimized Next.js build; 20 static pages generated).
- `npm run typecheck` — passed.
- `npm run test:inquiries` — passed, 8/8.
- Desktop/tablet/mobile public-route viewport sweep — passed for route response, main landmark, H1 and horizontal overflow checks.
- Production Lighthouse — mobile and desktop all report Accessibility 100, Best Practices 100, SEO 100 and Agentic Browsing 100.
- No separate lint script is defined in `package.json`.

## Remaining verification limits

Chrome DevTools dispatched a drag gesture to the hero globe in a 390px touch-emulated browser context, and the destination controls and scroll-linked scene were exercised in the production build. No physical-device touch test was available. Production email, Supabase authentication, live database writes, and admin role cases also remain unverified until the relevant environment is configured.

## Second-pass Earth and visual audit — 2026-10-24

The original implementation had a procedural sphere and approximate coast strokes, which did not meet the requested standard for a recognizable Earth surface. The follow-up replaces those strokes with a local true-color global Blue Marble texture from NASA Earth Observatory, resized from its published 5400 × 2700 composite to 2048 × 1024 for web delivery. Provenance and attribution are recorded in `public/textures/README.md`; this is not live satellite data. Coordinates and destination markers use latitude/longitude positions, and routes use Three.js quadratic Bézier curves rendered as tube geometry above the globe. The globe presents New York and a selected destination, draws the route with story progress, animates a route traveler, and supports drag rotation. Interactive marker selection updates the story's destination state; keyboard-accessible destination buttons remain available.

The prior large orbit ring was removed because it dominated and obscured the route. The hero and portfolio now share the textured Earth scene, while the portfolio's remaining eight panels use purpose-built illustrative travel, calendar, research, workflow, document and reminder visuals rather than the former CSS placeholder tiles. The travel card now has a high-contrast navy surface, ivory type and restrained mint/gold status bars. Semantic palette and typography tokens, theme contrast overrides and reduced-motion handling are defined in `app/landing-redesign.css`.

In the latest development-browser pass, the homepage showed a live WebGL context, loaded `/textures/earth-blue-marble.jpg` successfully, displayed nine portfolio examples, and had no horizontal overflow at 1440 × 1000. The latest production build, type check and inquiry suite passed (20 static pages generated; 8/8 inquiry tests). The texture source is NASA Earth Observatory's [Blue Marble: Next Generation base map](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/); source and credit details are in `public/textures/README.md`.

Latest production verification after the visual and contrast changes: all nine public routes return HTTP 200 with an H1; privacy, terms, and admin login also return HTTP 200. Desktop 1440 × 1000 and mobile 390 × 844 show no horizontal overflow. The interactive journey was checked in the browser: scroll progress advanced to 0.313, the active chapter changed, and selecting Dubai with the accessible destination button updated its pressed state and the globe's visible destination label. Pointer handlers are wired on the globe markers; a direct synthetic marker click was not separately tested. Both theme states toggled successfully; reduced-motion mobile mode loaded the canvas and retained accessible content and controls. The portfolio illustration and texture were viewed at desktop and mobile sizes, and the latest production browser session had no console errors.

Latest production Lighthouse navigation audits report Accessibility 100, Best Practices 100, SEO 100, and Agentic Browsing 100 on desktop (56 checks, no failures) and mobile (55 checks, no failures). Cold local performance traces at 1× CPU/network reported LCP 59 ms desktop / 62 ms mobile and CLS 0.00 for both. These are localhost lab observations, not field or throttled-device performance guarantees. CMS-backed admin sign-in, database writes, and external notifications remain dependent on unavailable Supabase/email credentials; no physical device was available for touch or GPU/thermal testing.

## Screenshot follow-up — 2026-10-24

Added direct hero route controls for London, Dubai and Singapore and connected them to the 3D route state, so selecting a destination rebuilds the route curve and updates the globe's active marker/label. Marker meshes also call the same state callback when clicked. The route buttons were exercised at desktop and mobile sizes: selecting Dubai and Singapore changed their pressed states and the visible globe labels, and the mobile page stayed at 390px with no horizontal overflow. The globe route marker itself was not separately clicked by synthetic pointer coordinates.

In dark mode, the eight portfolio samples now use separate restrained teal, plum, blue, forest, amber, slate, rose and green colorways, each with its own accent edge. The numbered chips are anchored to the bottom of each artwork to clear the “Illustrative” headings. The three travel-service cards use distinct dark surfaces and bright text/icons; the request intro copy was also lightened. The travel header logo's aria-label was removed so the visible brand text supplies its accessible name. Dark-mode production Lighthouse audits after these fixes: homepage desktop 100 Accessibility, 100 Best Practices, 100 SEO, 100 Agentic Browsing (56 checks); homepage mobile 100 in all four categories (56 checks); Travel Desk desktop 100 in all four categories (53 checks). No failing audits.

The hero destination picker is positioned over the top of the globe on mobile. At 390 × 844 it is entirely visible in the first viewport (y=666–705), does not create horizontal overflow, and selecting DXB updates the selected state and visible globe marker label. Buttons' screen-reader names include their visible codes. Production build, TypeScript check and the inquiry suite were rerun successfully after this adjustment (20 static pages; 8/8 tests).

## Globe, loader, and layout correction — 2026-10-24

The latest correction pass addresses the attached master prompt and screen captures. `lib/geography.ts` centralizes the north-up, longitude-zero-at-+X conversion used by the Three.js sphere; the four markers use the supplied coordinates (NYC 40.7128/-74.0060, LON 51.5072/-0.1276, DXB 25.2048/55.2708, SIN 1.3521/103.8198). City focus is independent from route destination, so NYC can be focused without changing route endpoints. Destination selection updates focus and the route without remounting the Earth group.

`components/GlobeCanvasImpl.tsx` now builds an elevated quadratic flight path as a depth-tested `TubeGeometry`. Its reveal completes once, while the travel marker continues along the same curve; story mode derives the reveal and marker position from scroll progress. The route mesh, destination markers, Earth, and shield rings share the rotating geographic group. Geometry disposal is tied to route changes/unmount. Reduced-motion mode shows the completed path and holds the marker at its destination. `components/HeroGlobe.tsx` provides NYC/LON/DXB/SIN controls and marker click-to-focus/route selection.

The previous five-second globe-only overlay is replaced by `components/AppIntroCoordinator.tsx`, mounted at the application root. The full-screen Travel Partner intro waits for fonts, layout frames, a minimum display interval, and the hero scene's renderer readiness; renderer failures release the intro and preserve a readable fallback. A bounded nine-second watchdog handles an unresponsive scene. The earlier absolute desktop globe overlay and negative-positioned hero note are superseded by the final responsive rules in `app/landing-redesign.css`; the hero uses a two-column grid on desktop and a stacked layout below 940px. The header uses aligned grid columns, compact theme control and CTA, and the mobile navigation appears before the available width becomes crowded. All portfolio artwork panels now share a 320px desktop / 300px mobile height, including the first featured panel, so the calendar example does not force a unique tab height.

### Verification for this pass

- `npm run typecheck` — passed.
- `npm run test:inquiries` — passed, 8/8.
- `npm run build` — passed; 20 static pages generated.
- Started the production build at `http://localhost:3001/`. Page, font, CSS, JS, and Earth texture requests returned HTTP 200 after restarting the server against the new build. The browser automation environment rendered the app-level loader and its failure path; its R3F canvas reported the “3D preview unavailable” fallback, so I could not verify the actual 3D render, geographic marker placement, route animation, or pointer interaction in this browser session. These visual acceptance points remain unverified here; the fallback kept the page and route controls usable.
- At 1200×768 desktop, 820×1180 tablet, and 390×844 mobile, the document had no horizontal overflow (scroll width matched viewport width). The 820px and 390px header/hero measurements confirmed the mobile menu is visible, the headline remains within its column, and the route selector stays within the scene bounds. Mobile screenshot capture showed the hero continues below the viewport rather than clipping its text.
- After the final artwork height adjustment, a 390×844 browser measurement reported all nine portfolio panels at exactly 300px and confirmed the intro's bounds cover the full 390×844 viewport.
- Browser console review showed the existing Three.js `THREE.Clock` deprecation warning; no current page-load error was observed after restarting the production server. Old 400 responses from a stale pre-restart navigation remained in automation console history and are not from the final navigation.

The app is left running on port 3001. The full-page intro, fallback behavior, viewport layout, tests, and build are verified; interactive WebGL rendering still needs confirmation in a browser/runtime where the R3F renderer initializes.

## Globe marker and portfolio card follow-up — 2026-10-24

Simplified the route animation by removing the visible route line; a gold torus-and-orb marker now rolls along the route curve close to the globe surface. The marker is larger and brighter, and destination markers expose a pointer cursor and a hover halo. The route itself remains represented by the moving marker and destination state. Increased the calendar artwork (example 04) to 320px on desktop and 300px on mobile to provide clear space for all three schedule rows and prevent the final item from crowding the card edge. Browser inspection confirmed the fourth artwork contains the heading, all three appointment entries, and its number chip without overflow.

Follow-up changes make all eight non-featured work illustrations uniform at 320px desktop / 300px mobile, so their paired cards align even when one needs more content space. Corrected the equirectangular east-west coordinate orientation so Dubai maps onto the Arabian Peninsula; the selected destination now rotates toward the front of the globe. Added three continuously rotating, translucent shield rings and a five-second homepage-only “Travel Partner” scene intro. The brand name and TP monogram now appear across public site headers, footers and page metadata.

## Editorial redesign verification — 2026-10-24

This pass rethemed the complete public experience as a working atlas, added the homepage editorial headline and coordinated section reveals, refined service and travel surfaces for contrast, and implemented the static Earth error state. The mobile route picker was inspected at 390 × 844; a conflicting top/bottom offset that stretched its box was fixed so it sits compactly near the top of the globe. The opening overlay now honors the prior five-second Travel Partner request while continuing to release on Earth-render failure or the nine-second watchdog.

`npm run build` passed (20 generated pages), `npm run typecheck` passed, and `npm run test:inquiries` passed (8/8). The nine public routes returned HTTP 200. Desktop and mobile document widths matched their viewports. At 390 × 844 the hero picker remained 46px tall, within the viewport, with zero horizontal overflow. Selecting DXB updated its pressed state and the fallback's route label to Dubai. Browser console reported zero errors. This automation environment rendered the static fallback and no canvas, so the production Earth, destination selection in a real WebGL context, route motion, and pointer interaction cannot be certified by this pass.

## Real intro globe and responsive correction — 2026-10-24

The application intro now loads `GlobeCanvasImpl` itself, so it presents the textured, geographic Three.js Earth and route instead of a CSS sphere. A false “canvas failure” was caused by a React effect placed inside R3F's fallback child; removing that effect allows actual renderer initialization. The intro waits for renderer readiness and the existing five-second minimum, then releases the page through a separate, stable dismissal timer. The main globe starts only after the intro exits. The intro pauses Earth motion when `prefers-reduced-motion` is enabled.

The DOM portal city labels were replaced by Three.js canvas-texture sprites to keep route changes in the WebGL scene. In production at 390 × 844, the intro had a `three.js r186` canvas and no fallback; after loading, the page was interactive and the hero also had a `three.js r186` canvas. Selecting DXB updated its active button while the canvas remained mounted. Responsive width checks at 320, 390, 768, 820, 1024, and 1440px found zero horizontal overflow. `npm run typecheck`, `npm run test:inquiries` (8/8), and `npm run build` all passed.
