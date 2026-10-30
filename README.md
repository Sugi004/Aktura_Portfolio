# Executive Assistance Portfolio

A responsive Next.js portfolio for remote executive assistance, business support, and travel coordination. Service, package, FAQ, project-example, and testimonial content lives in local source files and is delivered as a static site. The app has no database, admin workspace, or submission API.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Inquiry forms create a prefilled email draft in the visitor’s email app. The site does not transmit or store form entries. Visitors must choose Send in their email app. The review carousel displays the testimonials maintained in `lib/review-content.ts`.

## Test and build

```sh
npm run typecheck
npm test
npm run build
```

Playwright browser tests cover public navigation, carousel controls, email draft composition, package-card styling, and overflow at mobile, tablet, and desktop sizes.

## Deploy to Vercel

Import the repository into Vercel and deploy. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain for sitemap and robots metadata. No database or admin credentials are required.

Before launch, replace remaining sample business details, review the privacy and terms copy, confirm the contact email and phone number, and make sure the testimonials and ratings are approved for publication.
