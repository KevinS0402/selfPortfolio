# Kevin Song portfolio

Next.js 15 / React 19 portfolio, prepared for Vercel. The approved black/white/gold design, rooms, interactions, and public page content are preserved.

## Local development

Install dependencies with npm, then run `npm run dev -- --hostname 127.0.0.1 --port 3000`. The local entry point serves the same Next.js `/api/contact/` route used on Vercel. The bundled Node runtime can run `scripts/dev.mjs` directly on this laptop. Node 22 is the deployment runtime.

Copy `.env.example` to `.env.local` for local settings. Never commit populated secrets. Environment changes require restarting development; public site-key changes require a frontend rebuild.

## Contact settings

| Variable | Vercel type | Purpose |
| --- | --- | --- |
| RESEND_API_KEY | Secret | Resend sending key |
| RESEND_FROM_EMAIL | Config | Kevin Song <contact@kevinsong.dev> on a verified domain |
| CONTACT_TO_EMAIL | Config | kevin.song.1@vanderbilt.edu |
| RECAPTCHA_SECRET_KEY | Secret | Google reCAPTCHA v2 checkbox secret |
| NEXT_PUBLIC_RECAPTCHA_SITE_KEY | Config / public | Matching v2 checkbox site key; available at build time and runtime |
| CONTACT_ALLOWED_ORIGINS | Config / optional | Exact comma-separated testing origins; no wildcard patterns |

The v2 site/secret pair is used with api.js and Google's SiteVerify endpoint. RECAPTCHA_API_KEY and RECAPTCHA_PROJECT_ID from the earlier Enterprise implementation are no longer used. Register kevinsong.dev in the production key's domains; use a separate key for localhost and controlled testing domains.

The server validates input, bounds request bodies, checks accepted origins, enforces server-side CAPTCHA success and exact hostname, and sends only to the configured recipient. Visitor email becomes Reply-To. Tokens and credentials are not logged. A per-instance limiter and honeypot supplement CAPTCHA; the limiter is not a global persistent quota. Resend delivery uses a retry idempotency key and bounded timeouts. Missing settings fail honestly and preserve direct email access.

No database, CMS, or email inbox is provisioned by the app. Resend sending-domain verification does not create a mailbox for the From address. Actual delivery must be checked in Resend and Vanderbilt mail during launch testing.

## Production build and verification

- `npm run build` prepares existing imagery and runs a standard Next.js production build.
- `npm run start -- --hostname 127.0.0.1 --port 3002` reviews the built application locally.
- `npm run check:seo` checks prerendered metadata/schema, sitemap, crawler directory, and noindex 404 in the current native build.
- `node scripts/check-crawl.mjs --base=http://127.0.0.1:3002` checks the served routes, local links/fragments/assets, PDF, slash redirects and real 404s.
- `npm run test:contact` uses mocked verification/delivery; it does not send email.
- `npm run lint` and TypeScript checks validate the source.

The previous static export is no longer the deployment output. Vercel uses the Next.js framework preset and its default output. Security headers/CSP are defined in next.config.ts, including Google and LinkedIn frame/script allowances. firebase.json and functions/index.mjs remain legacy references; the deployed Vercel contact route imports the shared handler directly and has no Firebase runtime dependency.

## Deployment

Project: self-portfolio in Kevin's existing Vercel account. Source: KevinS0402/selfPortfolio. Keep the music project separate. Use the reviewed redesign commit for the release rather than the old main-branch site. Set production variables in Vercel, then deploy/test before Cloudflare cutover. No secret values are included in this repository.

Keep kevinsong.dev canonical, trailing-slash chapter/project paths, and www-to-root redirect behavior. Retain Firebase through the rollback window. Cloudflare remains DNS provider; use the exact records Vercel supplies, preserving mail and verification records. See docs/vercel-migration.md for the account/setup sequence.

## Content and media

Public content lives in src/data/journey.ts; original source collections remain available for reference. Music links to ksongfire.com. Existing official organization marks are documented in public/brands/SOURCES.md. Selected LinkedIn posts live in src/data/linkedinPosts.ts; their native embeds retain the platform's styling and direct links. The reusable post-update skill is under .agents/skills/kevin-linkedin-post.

`npm run media:build` creates hashed responsive portrait files, themed icons, compact monogram, room fallback and social card from the approved originals. Original artwork and detailed model geometry remain unchanged. Blender scripts are optional local model-authoring tools, not deployment requirements.

## Discovery

Titles, canonical URLs and public identity are centralized in src/lib/site.ts and src/lib/structuredData.ts. About uses ProfilePage, chapters describe collections, and project cases describe CreativeWork. Sitemap and supplementary llms.txt link the public pages. Production is indexable; local development and Vercel previews use noindex. See docs/discoverability-plan.md for the search plan. Older static-export verification notes are historical; current production checks use the native Next.js build.

Official references: [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Google v2 verification](https://developers.google.com/recaptcha/docs/verify), [Resend domain setup](https://resend.com/docs/dashboard/domains/introduction).
