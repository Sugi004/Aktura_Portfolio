# Reference design audit — Travel Partner

**Date:** 2026-10-24  
**Reference supplied:** `https://wonderlandams.com/works/death-to-stock`  
**Site audited:** Travel Partner at `http://localhost:3001/`  
**Requirements:** `/Users/sugishivam/Downloads/Portfolio.md`

## What was observable

The supplied case-study URL currently returns a 404. The Internet Archive’s 28 September 2022 capture also loaded its toolbar but not the page content in the available browser; its scripts/assets produced errors. That means the case study’s exact typography, full scroll sequence, image crops, page transitions, and responsive behavior could not be verified, and this audit does not invent those details.

I inspected WONDERLAND’s live work index at `https://wonderlandams.com/works` as a limited fallback. At desktop width it presents a near-black canvas, compact wordmark/navigation and category filters, widely spaced project imagery, and large editorial type. The live index says it is an overview of studio work and experiments. The current page’s animation did not settle consistently in the browser, so the visual description is limited to what appeared in captured viewports. Official pages: [WONDERLAND Work](https://wonderlandams.com/works), [The WONDERLAND Brand](https://wonderlandams.com/works/wonderland).

## Translation to Travel Partner

The direction is **a working atlas**: an executive’s day and travel itinerary treated like one considered route. The Earth remains the singular cinematic object; typography, spacing, and bespoke work illustrations carry the rest. This translates editorial ambition into the service’s subject matter, without borrowing Wonderland’s marks, wording, or artwork.

### Design tokens

| Role | Value | Use |
|---|---|---|
| Deep ink | `#101a21` | Intro, hero, travel story |
| Warm paper | `#f3efe5` | Reading surfaces and forms |
| Midnight teal | `#19333b` | Atlas panels and route surfaces |
| Muted teal | `#77c6b5` | Geographic signals and accessible accents |
| Champagne | `#d7b66e` | Primary route and intentional emphasis |
| Coral | `#e98768` | Small brand mark and contact cues |

**Typography:** retain the already bundled `Newsreader` display face for expressive editorial headings and `DM Sans` for readable service copy, labels, and forms. There is no verified evidence for WONDERLAND’s typeface; no font match is claimed.

**Layout:** broad page gutters align the masthead, section titles, and inquiry form. The hero is an offset composition: the headline owns the upper-left field while the Earth expands behind a protected route-control area. Below it, the service story alternates paper and ink surfaces. Portfolio artwork keeps a shared height for quick scanning, while each illustration uses a different composition and accent to show a distinct work type.

**Motion principles:** one short entry sequence; short, once-only section reveals; the existing ScrollTrigger chapter narrative; and the Earth route/destination response. Avoid pinned text on mobile, indiscriminate stagger animations, decorative cursor replacement, and forced transitions between routes. Every scroll effect has a readable static state and respects reduced motion.

## Project audit findings before overhaul

- The homepage already had the correct service content and routes, but its section introductions, card grid, repeated pills, and repeated labels created a conventional landing-page rhythm.
- The hero was governed by several conflicting layers of CSS, including an older flex/absolute globe treatment. The latest override fixed the earlier clipping, but the visual system remained a patchwork of appended declarations.
- The scroll story and Earth were already connected through GSAP/ScrollTrigger and R3F. Destination data and the real Earth texture were present; the automated browser’s R3F renderer had previously chosen the graceful fallback, preventing visual route QA there.
- Nine illustrative portfolio panels already represented different work categories and preserved fixed heights. The overhaul will keep their content, labels, and equal dimensions while strengthening their art direction.
- The travel desk, inquiry form, package data, admin routes, and privacy/terms pages must stay intact. No live availability, bookings, clients, testimonials, or outcomes may be invented.

## Translation checklist

- Keep the Earth and the moving gold route as the central brand metaphor.
- Replace the generic header/hero rhythm with editorial scale, asymmetric placement, and more deliberate negative space.
- Give services, travel, process, work, packages, and contact distinct surface rhythms within one palette.
- Make each sample illustration communicate its actual deliverable; preserve the “illustrative” qualification.
- Preserve all public routes, form validation, accessibility, mobile navigation, theme toggle, reduced-motion behavior, and readable WebGL fallback.
- Verify the real globe in a capable WebGL runtime before claiming its route and marker appearance has passed browser QA.

## Implementation and QA update — 2026-10-24

The homepage now uses the “Your time is valuable” editorial hero and a working-atlas composition; section treatments alternate warm paper, ink, and muted color surfaces. The copy and existing service details remain intact, and the three travel cards and portfolio artwork retain legible, distinctive treatments. GSAP reveals are scoped to marked sections and skip animation under reduced motion. A labelled Earth fallback remains available if the browser cannot initialize WebGL. The app intro uses the Travel Partner wordmark, waits for essential readiness, has a five-second minimum requested earlier, and retains a bounded failure release.

Production verification after the final CSS correction: `npm run build`, `npm run typecheck`, and `npm run test:inquiries` passed (8/8 inquiry tests). All nine public routes (home, about, services, travel, portfolio, packages, how-it-works, contact, FAQ) returned HTTP 200 with the main landmark. Desktop and 390px mobile showed no horizontal overflow. Browser console had no errors. At 390px, a route-picker CSS collision was found and corrected: the selector now has one vertical anchor and a compact fixed-height footprint. R3F did not mount a canvas in this browser and displayed its labelled fallback; real globe rendering, pointer/drag selection, and GPU behavior remain unverified here.

## Responsive and 3D loading correction — 2026-10-24

The loading sequence now renders the same Three.js geographic Earth as the home hero, with its real Earth texture, 3D route, destination markers, and moving route marker. Reduced-motion preferences are read by the intro scene. The 3D canvas failure signal was moved out of the canvas fallback child; that child had been mounted on successful renders too, causing the real scene to be replaced immediately. The homepage renderer waits until the intro exits to avoid competing render loops. The intro dismissal timer no longer cancels itself when the fade begins, which previously left the page `inert` under the hidden overlay.

Responsive CSS now stacks the hero before tablet columns become cramped and keeps content grids to one column on narrow screens. Production browser measurements at widths 320, 390, 768, 820, 1024, and 1440px reported zero horizontal overflow. In a fresh mobile browser, the intro canvas and hero canvas both identified as `three.js r186` at their respective stages; after the intro, the page was no longer inert. DXB selection updated its pressed state while the hero canvas remained mounted. Build, typecheck, and all inquiry tests passed (8/8).
