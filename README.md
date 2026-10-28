# Executive Assistance Portfolio

A responsive Next.js portfolio and inquiry workflow for a premium remote assistance practice. The public site includes service and package content, a dedicated travel desk and travel-aware request forms. A private Supabase-backed workspace supports inquiry triage and content editing.

The canonical business requirements are preserved in [docs/Portfolio.md](docs/Portfolio.md). The proposed visual direction and reference notes are in [docs/design-research.md](docs/design-research.md). The homepage has one lazy-loaded Three.js globe; all core content and service requests remain HTML and CSS.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The public portfolio and its editable fallback content run without credentials. Inquiry submission and the private admin require a Supabase project. Email notifications also require Resend configuration.

## Supabase setup

1. Create a Supabase project and copy its project URL, anon key and service-role key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key is server-only and must never be prefixed with `NEXT_PUBLIC_` or exposed to the browser.
2. In the Supabase SQL Editor, run `supabase/migrations/202610240001_initial_portfolio.sql`, then `supabase/migrations/202610240002_inquiry_hardening.sql`, followed by `supabase/seed.sql`. The seed adds editable demonstration content and draft package prices.
3. In Supabase Authentication, create the owner's user. Add its user UUID to `public.admin_users` using the SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('SUPABASE_AUTH_USER_UUID');
   ```

4. Sign in at `/admin`. Manage inquiries in the dashboard, and public services, packages, FAQs, and demonstration projects at `/admin/content`.

The migrations enable row-level security. Public users can read only active public content. Inquiry submissions go through the server endpoint; direct anonymous calls to the database submission RPC are denied. Admin middleware validates and refreshes Supabase sessions, then checks the signed-in user against the admin roster; the database independently enforces the same admin boundary with RLS. The server applies a limit of 5 requests per IP per hour and 3 per normalized email per day, with only HMAC hashes retained for at most eight days. Set `RATE_LIMIT_HMAC_SECRET` to an independent random secret if desired; otherwise the server derives the HMAC using the service-role key. Forwarded client-IP headers must be overwritten by the hosting proxy (Vercel does this). On self-hosted deployments, configure a trusted proxy to set the client IP; without a trusted forwarding header, requests share the `unknown-client` IP limit. Inquiry records, travel details, and internal notes are restricted to authenticated administrators.

## Email notifications

Set `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_EMAIL`, and `INQUIRY_FROM_EMAIL` from `.env.example` in local or Vercel environment settings. Configure a sender identity accepted by your Resend account before relying on delivery. Email is optional; inquiry storage still works when Resend is not configured.

## Deploy to Vercel

Import the repository into Vercel, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS domain and set the Supabase variables (including the server-only service-role key) for the deployment environment. Optionally set the Resend variables and rate-limit HMAC secret, then deploy. Use the same Supabase migration and seed steps against the production project. Add the production URL to Supabase Auth's allowed redirect URLs. No secrets belong in Git.

`npm run build` creates the production build. `npm run typecheck` checks TypeScript types.
`npm run test:inquiries` runs focused automated checks for inquiry validation and travel-field sanitization.

## Owner setup before launch

- Replace remaining sample biography, contact details, and consultation link placeholders with approved information.
- Review the three editable draft packages ($150, $350, and $700 monthly), their limits, and publish only the offers you want active.
- Review `/privacy` and `/terms`; both are clearly marked drafts and need the business identity, jurisdiction, provider list, and retention practices completed.
- Replace or remove the clearly labeled demonstration projects. They do not claim client work or results.
- Verify the production sender, notification recipient, auth redirects, and a real inquiry from the deployed domain.

## Launch configuration and recurring costs

The source is buildable, but a live launch still needs the owner's actual business identity and contact details, canonical domain, production Supabase project and admin account, and an approved Resend sender and notification address. Until those values are configured, inquiry storage and notification delivery are unavailable; the API returns a clear service-unavailable response rather than claiming a request was delivered.

The current request-and-approval workflow does not charge clients or book travel directly. Before enabling payments, scheduling, analytics, direct booking or a client portal, choose and configure those providers separately. Recurring costs depend on selected plans and usage; budget for a domain registrar, hosting, managed database/authentication, and transactional email. Scheduling and analytics are optional additions. Confirm provider pricing at purchase time rather than relying on an unapproved estimate.

Before launch, replace the clearly marked privacy and service-terms drafts with reviewed business-specific documents, set a data retention/deletion policy, enable database backups and recovery checks, and test email delivery and inquiry handling from the production domain. The database stores inquiry details and travel preferences, but the public forms do not accept card or passport details.

The site requests coordination only. A trip or reservation is never represented as booked until its supplier confirms it. It does not collect payment card or passport details and does not perform direct supplier bookings.
