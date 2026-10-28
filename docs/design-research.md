# Design research and direction

## References reviewed

- [Awwwards](https://www.awwwards.com/) — The accessible awards index groups work by disciplines such as hotel/restaurant, business, interaction, WebGL and 3D. This helped narrow the reference lens to service clarity, hospitality imagery and one purposeful interactive moment. The index is an inspiration catalog, not evidence that every nominated design is usable or accessible.
- [Siteinspire](https://www.siteinspire.com/) — The gallery exposes typographic, grid, photography and art-direction categories. This supports using editorial type and an intentional image/illustration system rather than repeating generic service cards.
- [Stripe](https://stripe.com/) — The homepage puts a plain-language value proposition and primary action first, then organizes the offer into clear modules and supporting proof. Borrow the clear hierarchy and direct action language; do not borrow financial-dashboard motifs or imply proof points this business does not have.
- [Linear: A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) — The design team describes reducing competing visual weight so the task area stays prominent, and pruning interface complexity. Apply this to quiet navigation, restrained dividers and predictable admin controls.
- [Three.js examples](https://threejs.org/examples/) — The official examples demonstrate geometry, lighting, and rendering patterns. The project uses a small procedural globe with simple geometry and light, not a downloaded scene or a large environment.
- [React Three Fiber documentation](https://r3f.docs.pmnd.rs/getting-started/introduction) — Reviewed as a potential React integration. This project's visual needs are one isolated decorative scene, so direct Three.js avoids adding a second rendering abstraction and dependency layer.
- [GSAP documentation](https://gsap.com/docs/v3/) — Reviewed for motion patterns. ScrollTrigger choreography was deliberately omitted: service and form content should remain immediately accessible, and the scene needs only a restrained rotation that Three.js already owns.
- [Godly](https://godly.website/) — The requested reference redirected to a page the research tool could not access. No visual claims about its contents are made and no design decision depends on it.

## Direction selected

The experience is an editorial remote-assistance desk: warm paper surfaces, deep coastal blue-green, muted brass, restrained coral details, a display serif paired with a practical sans serif, and a generous left-aligned grid. Travel is represented as coordination and route-making rather than a fake booking engine. The hero pairs the stated service promise with a three-dimensional globe, orbital path and a compact itinerary cue. Service details, pricing, travel requests and administration remain legible HTML.

Current tokens use warm ivory (`#f8f2e5`), ink/navy (`#17263a`), coastal teal (`#247f79`), muted brass (`#c28d38`), and quiet blue-gray (`#536575`). Newsreader is used for display copy and DM Sans for interface and body copy.

## Selected and rejected ideas

- Selected: direct headlines and calls to action; compact navigation; grouped service detail; distinct travel requests; clear package limits; carefully labeled illustrative work; one WebGL anchor that loads only near the hero.
- Rejected: a full-screen video or continuous scroll sequence (it would delay task access and impose battery cost); generic dashboard cards across the public pages; fake live airfare or hotel prices; fabricated testimonials and biographies; a complex globe texture and repeated 3D scenes; a booking checkout without a configured supplier or payment agreement.
- Rejected: adding GSAP or React Three Fiber for the hero's single animation. Direct Three.js keeps dependencies and animation ownership small.

## 3D, performance and accessibility

The globe is a lazy-loaded Three.js scene built from one sphere, a handful of latitude-like curves, three markers, one orbital ring and two lights. It caps device pixel ratio, starts only when near the viewport, pauses off-screen, disposes its resources and skips motion for `prefers-reduced-motion`. The existing HTML route and itinerary illustration remains visible as the no-WebGL fallback. The scene is decorative and hidden from assistive technology; all meaning and actions are available in page text and forms.

No Lighthouse, accessibility conformance, or production performance score is claimed in this document. Those require measured runs against the finished build and representative devices.
