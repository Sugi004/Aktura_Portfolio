# Project standards

- This is a Next.js App Router application with React and TypeScript. Keep server components as the default; isolate browser interactions in small client components.
- Keep public content in `lib/content.ts` and editable database content in Supabase. Do not invent owner credentials, contact details, client stories or business claims.
- Inquiry data is private. Validate on the server, minimize stored details, keep secrets server-only, and check the authenticated admin roster on every sensitive operation. Never expose internal notes or client records publicly.
- A travel request is not a booking confirmation. Supplier availability, charges and terms require client approval and supplier confirmation.
- Use semantic HTML, visible focus, useful labels and errors, keyboard support, reduced-motion behavior and a static fallback for WebGL.
- Keep animation and third-party dependencies purposeful. Defer nonessential 3D and avoid loading it on routes that do not use it.

## Checks

- `npm run typecheck`
- `npm run test:inquiries`
- `npm run build`
