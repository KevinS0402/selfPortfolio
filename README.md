# Kevin Song portfolio

Next.js 16.4.3 / React 19.3.1 portfolio, prepared for Vercel. The approved black/white/gold design, rooms, interactions, and public page content are preserved.

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

- `npm run build` prepares existing imagery, runs ESLint, and runs a Next.js 16 production build with Turbopack and TypeScript checking. ESLint uses the native flat Next.js 16 configuration; lint remains an explicit build gate because Next.js 16 no longer runs it automatically.
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


### Vercel Web Analytics

`@vercel/analytics/next` is mounted once in the root layout on Vercel production deployments (`VERCEL=1`, `VERCEL_ENV=production`). Local builds and preview deployments do not send analytics. No new API key is required. Web Analytics must also be enabled for the portfolio project in the Vercel dashboard; Kevin confirmed it is enabled.

Deploy the updated source before expecting traffic data. Check Vercel → portfolio project → Analytics after visiting the production domain. The existing same-origin CSP permits the Vercel-hosted script and collection endpoints without expanding the policy. This integration tracks aggregate page views, including client-side route navigation; it does not identify visitors, read LinkedIn sessions, or transmit contact-form contents. No paid analytics add-on or custom event collection was configured.


### PostHog portfolio analytics

The confirmed PostHog project is **Default project**, ID **689244**, in US Cloud. The project name was kept unchanged. Set `NEXT_PUBLIC_POSTHOG_KEY` to its public **project token** and `NEXT_PUBLIC_POSTHOG_HOST` to the exact ingestion host supplied by PostHog. These are public configuration values, never a personal API key. The real local values live only in ignored `.env.local`; Vercel production requires the same two values before building. Do not copy other local secrets or `POSTHOG_LOCAL_TEST` into production.

The site enables PostHog on Vercel production only. `POSTHOG_LOCAL_TEST=1` explicitly enables local QA with `environment=test`; normal local builds and Vercel previews are off. Production events carry `environment=production`, `app=portfolio`, and `measurement_mode=memory`. Filter reports to both values so QA never counts as audience activity. No paid features, card, billing plan, project settings or other account changes were made. Limits remain managed in the PostHog account.

There is no first-visit banner. The SDK uses `persistence=memory` plus `disable_persistence=true`; random identifiers live only in page memory and reset on a full reload or new visit. App Router navigation within the same loaded document can still form a short journey, but returning-visitor, cross-device and cross-visit metrics are deliberately unavailable/unreliable. No analytics panel or preferences link is rendered. Previously saved opt-outs remain respected; the site writes no new analytics preferences or identifiers to browser storage. Browser Do Not Track and Global Privacy Control block capture. No SDK consent persistence methods or server-side cookieless hash mode are used. The SDK never calls `identify` and creates no person profiles. No recordings, canvas recording, autocapture, console/network capture, surveys, heatmaps, exception capture, performance capture or feature-flag requests are enabled. Vercel's existing aggregate analytics is unchanged.

The slim PostHog core loads in a separate dynamic chunk after hydration. Scroll measurements run at most once per 180ms, milestones are deduplicated per page visit, and animation-frame/pointer events are not tracked. SDK failures are isolated from browsing and contact actions. The CSP permits only the configured US/EU ingestion host, with no additional script origins or proxy routes.

Events: `$pageview`, `explore_clicked`, `chapter_clicked`, `project_opened`, `resume_opened`, `outbound_link_clicked`, `contact_link_clicked`, `email_copied`, `contact_started`, `contact_submitted`, `contact_failed`, `scroll_depth`, and `sequence_step_viewed`. Pageviews follow App Router navigation and browser history; chapter clicks are distinct from preview/scroll step exposure. Sequence steps are counted once per page visit. Scroll depth means a position was reached, not proof the content was read. A resume event means the PDF link was opened, not proof of reading or a saved download. Outbound clicks record the domain, not a person's profile URL. Contact submission is counted only after the API reports success; form start is counted on first focus, and failure records only a fixed category.

Payloads use an explicit event/property allowlist. Unknown paths are excluded. Page URLs lose all queries and fragments; external referrers retain only the origin. Campaign attribution accepts only `utm_source`, `utm_medium`, and `utm_campaign` with bounded safe values. Form names, emails, subjects, messages, CAPTCHA tokens, response bodies, arbitrary error strings and user identities are never captured. Fine-grained screen/viewport sizes, device/window identifiers, browser/OS versions and timezone values are removed before sending. Ingestion-derived approximate geographic data and IP handling remain controlled by the project's privacy settings; the service still receives network requests. This is reduced-data analytics, not a claim of complete anonymity or a universal exemption from consent rules. Browser IDs are not evidence of a named individual; blockers, opt-out, reloads and multiple devices affect counts.

Run `node scripts/check-analytics.mjs` for memory-only configuration/race/failure/deduplication/privacy checks, then lint, TypeScript, production build, SEO/crawl and browser checks. Review changes locally before a separate authorized release. After deployment, use PostHog Live events and filter by `app=portfolio` and `environment=production`, then compare pageviews, project opens, resume opens and contact outcomes. Useful funnel: `$pageview` -> `project_opened` -> `resume_opened` or `contact_submitted`. Tag shared links, for example `?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio`. Attribution cannot reconstruct omitted referrers or identify which person clicked a shared link.

Official SDK configuration: https://posthog.com/docs/libraries/js/config

Persistence reference: https://posthog.com/docs/libraries/js/persistence
