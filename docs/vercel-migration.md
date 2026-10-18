# Firebase → Vercel migration runbook

> Deployment update, October 18, 2026: the application now uses a standard Next.js build and native /api/contact/ route. The confirmed CAPTCHA is v2 checkbox with NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY; Enterprise API/project-ID instructions and static-export checks below describe earlier preparation. Follow the current README for active configuration. Production build, native crawl and 15 mocked contact tests pass.

Prepared October 18, 2026. This is the deployment preparation and account setup sequence; it does not indicate a completed deployment. The current Firebase site and local presentation are unchanged.

## Confirmed choices

- Domain: `https://kevinsong.dev`; preserve the existing public chapter/project URLs and visible content.
- New portfolio project in the same Vercel account that contains `ksongmusic`. Keep the music project separate. Suggested new project name: `kevin-song-portfolio`, subject to availability.
- Cloudflare remains the authoritative DNS provider; Kevin has access. No registrar or nameserver transfer is required.
- Contact sender: `Kevin Song <contact@kevinsong.dev>`.
- Contact recipient: `kevin.song.1@vanderbilt.edu`.
- Source: `KevinS0402/selfPortfolio`, current local branch `codex/portfolio-redesign`; the repository's remote default reference is `main`.

## Audit snapshot

The Vercel connection currently exposes the separate `ksongmusic` project; no portfolio project was listed. The local redesign includes many uncommitted/untracked files and must be reviewed and pushed before a Git-based deployment can reproduce it. Importing the old remote main branch now would not reproduce the current local design.

`.env.local` exists. A presence-only check (no values exposed) found:

| Variable | Local state | Vercel treatment |
| --- | --- | --- |
| `RESEND_API_KEY` | Populated, validity/permissions not verified | Secret, server only |
| `RESEND_FROM_EMAIL` | Placeholder | Config: `Kevin Song <contact@kevinsong.dev>` after verification |
| `CONTACT_TO_EMAIL` | Populated, delivery not tested | Config: `kevin.song.1@vanderbilt.edu` |
| `RECAPTCHA_API_KEY` | Empty | Secret, server only |
| `RECAPTCHA_PROJECT_ID` | Empty | Config: Google Cloud project ID |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Empty | Public Config; must exist during frontend build and server verification |
| `CONTACT_ALLOWED_ORIGINS` | Not set | Optional Config for exact controlled testing origin(s); production root/www are already allowlisted |

Populated does not mean valid. Local values are not automatically available in Vercel. Do not paste secrets into chat, source files, Git history, screenshots, or deployment logs. No credential was tested with a real send in this audit.

## 1. Code and deployment-source preparation — Codex

Use Vercel's standard Next.js deployment rather than uploading the Firebase `out` directory as the complete app. Most portfolio pages can still be prerendered; the contact endpoint needs a server runtime.

Before deployment:

1. Adapt `functions/contact-handler.mjs` to a Node.js Next.js route at `/api/contact`. Keep server-side CAPTCHA verification, fixed sender/recipient, visitor Reply-To, input/body limits, timeout/error behavior, idempotency, and existing spam checks.
2. Change the export-only build configuration deliberately for Vercel. POST Route Handlers cannot run in a static-only export. Retain the existing Firebase deployment as rollback; do not delete the current project or switch DNS during this change.
3. Carry the relevant response headers/CSP from `firebase.json` into the Vercel/Next configuration; Firebase headers and rewrites do not transfer automatically. Confirm LinkedIn embeds, Google checkbox scripts/frames, fonts, and WebGL assets still work.
4. Update production build/check scripts for the standard Next.js output, preserving SEO/crawl validation, static readable content, trailing slashes, and real 404s. Preserve preview noindex and production indexing.
5. Test the deployed-equivalent contact adapter with mocked Google/Resend, then perform production build and browser checks. The in-memory limiter remains per instance; it is not a persistent global quota.
6. Review and commit the intended source/assets, excluding `.env.local`, generated build folders, temporary evidence and unrelated design work. Push the reviewed branch when proceeding with deployment. No automatic Firebase workflow was found in the local checkout; check repository integrations before enabling automatic production publishing.

This audit/runbook does not claim those migration code changes are already implemented.

## 2. Resend sender setup — Kevin

1. Sign into the existing Resend account and open Domains. Add `kevinsong.dev` if it is not already verified.
2. Add the exact sending-verification DNS records displayed by Resend in Cloudflare. This typically includes DKIM and SPF/return-path records. Do not guess the names/values, duplicate SPF records at a hostname, or replace unrelated website/mail records. DNS-only is appropriate for verification CNAME records. Enable sending; inbound receiving is not needed for this form.
3. Wait for Resend to show the sending domain as Verified. Check any existing DMARC policy before adding another record.
4. Use `Kevin Song <contact@kevinsong.dev>` as `RESEND_FROM_EMAIL`.
5. Confirm the existing API key is valid for this account/domain, or create a dedicated portfolio key with Sending access restricted to the verified domain. Use separate non-production credentials for preview testing when practical.
6. Add the key directly to the portfolio Vercel project's Secret environment settings, not to this chat. Keep the recipient set to Vanderbilt.

Verifying a sending identity does not create an inbox at contact@kevinsong.dev. This contact flow only needs to send from that identity to Vanderbilt. The handler sets Reply-To to the visitor's email, so replying in Vanderbilt mail goes to the visitor. Do not set the sender to a visitor's address or to vanderbilt.edu, which Kevin does not administer.

## 3. Google reCAPTCHA setup — Kevin

The current code uses the Google Cloud reCAPTCHA Enterprise checkbox integration (`enterprise.js` plus REST CreateAssessment). It does **not** use a legacy `RECAPTCHA_SECRET_KEY`.

1. Choose/create a Google Cloud project. Enable the reCAPTCHA Enterprise API. Complete any account/billing setup Google requires for that project.
2. Create a Web checkbox/challenge key for the portfolio (Challenge v2 / checkbox, not score-based v3). Keep domain verification enabled. Register `kevinsong.dev`; it covers subdomains such as www. Domain entries have no scheme, port or path.
3. Record the key ID as `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and the project's **project ID**, not display name or numeric project number, as `RECAPTCHA_PROJECT_ID`.
4. Create the server API key used to call the reCAPTCHA Enterprise API. Restrict its API access to that API and save it as `RECAPTCHA_API_KEY`. Do not apply browser HTTP-referrer restrictions to a key used by the server; those restrictions belong to browser keys, and server IP restrictions require known outbound addresses.
5. Use a separate non-production site key for localhost and the exact controlled Vercel testing hostname. Never allow all of `vercel.app` or disable domain verification. The server must accept the same exact testing origin; `CONTACT_ALLOWED_ORIGINS` is a comma-separated list of full HTTPS origins, not wildcard patterns.
6. Add the public site key before building. Changing it requires rebuilding/redeploying the frontend. Keep the private API key on the server. Use real configured keys for launch, not Google's published testing keys.

Google's valid token and hostname check must succeed before the handler calls Resend. Missing configuration must continue to leave direct email available and prevent a false success notice.

## 4. Create and configure the portfolio Vercel project

After the migration code and reviewed source are ready:

- Use the confirmed existing Vercel account; create a **new** project, separate from `ksongmusic`.
- Import `KevinS0402/selfPortfolio`; framework Next.js; root directory repository root; build `npm run build`; let Vercel manage standard Next.js output instead of forcing `out`.
- Select the supported Node runtime matching the reviewed app configuration. The existing contact code uses Node 22 APIs; do not make a framework-major upgrade as an unrelated migration step.
- Use the reviewed redesign branch for the initial preview. Configure the eventual production branch intentionally (remote default is main); avoid initially publishing the old remote main as the finished redesign.
- Add the six required environment values above. Store Resend/Google API keys as Secrets; site key, project ID, sender and recipient are Config. Use Production versus Preview scopes deliberately, with non-production test settings for previews.
- Obtain the actual generated testing hostname, register it on the non-production CAPTCHA key, and allow that exact origin on the contact endpoint. Keep previews protected/non-indexable.
- Environment changes affect subsequent deployments; rebuild after configuration changes. A local `.env.local` file is not a production configuration transfer.

## 5. Hosted validation before domain cutover

Check the actual Vercel deployment, not just localhost:

- Homepage, three chapters and four case studies; direct loads/refreshes, keyboard/mobile navigation, sticky sequences, models/fonts/PDF, asset MIME types, and true unknown-project 404.
- Canonicals remain kevinsong.dev; preview responses have noindex; the production build is indexable. Confirm actual security headers and Google/LinkedIn embeds under CSP.
- Manually complete CAPTCHA and send one clearly labeled test note to the agreed Vanderbilt recipient. Kevin should complete any CAPTCHA challenge in the browser. Check the Resend delivery event and actual inbox/spam folder, then verify Reply-To and error/retry behavior. Authorization for that test delivery should be explicit when executing it.
- Confirm production values and sender verification before directing visitors to the site. Use a controlled exact prelaunch hostname when testing the production configuration, or do the final production-origin delivery check immediately after DNS cutover.
- Review mobile loading/interaction performance on a real device; the models still total roughly 11.6 MB.

A success response alone is not proof of inbox delivery. A hosted preview success with different keys is not proof that production credentials/domains are correct.

## 6. Connect kevinsong.dev through Cloudflare

1. Preserve/export the current DNS records for rollback. Keep Firebase online.
2. Add `kevinsong.dev` and `www.kevinsong.dev` to the new Vercel project. Keep the root domain canonical and redirect www to it.
3. Read the exact project-specific A/CNAME/TXT values shown by Vercel. Change only the required website routing/ownership records in Cloudflare. No universal hardcoded Vercel IP/CNAME is supplied here.
4. Keep the Cloudflare nameservers. Preserve mail, SPF, DKIM, DMARC, and unrelated verification records. Prefer the Vercel-documented DNS-only configuration for its website records to avoid proxy/verification ambiguity during migration.
5. Verify DNS propagation, Vercel domain status, HTTPS, root/www redirects, production indexing, and the final production-origin contact send.
6. Retain Firebase during verification and the rollback window. After Vercel is stable, detach the old custom domain and disable any old publishing integration; retire unused Firebase Hosting/functions only after confirming they serve no remaining purpose. Keep the existing domain registration active. If reCAPTCHA lives in the same Google Cloud project as Firebase, keep that Cloud project and its reCAPTCHA API/keys; retiring Hosting does not require deleting the project.

## 7. Post-launch discovery

Recheck public robots.txt, sitemap, canonical/social metadata and 404s. Reuse or verify Google Search Console/Bing properties and submit the existing sitemap. Hosting changes with the same domain/URLs do not require Google's Change of Address tool. Keep subsequent Git updates pointed to the intended Vercel production branch.

## Official setup references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Next.js static-export limitations](https://nextjs.org/docs/app/guides/static-exports)
- [Vercel environments](https://vercel.com/docs/environment-variables)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Resend sending-domain verification](https://resend.com/docs/dashboard/domains/introduction)
- [Resend API key management](https://resend.com/docs/dashboard/api-keys/introduction)
- [Google website-key creation](https://docs.cloud.google.com/recaptcha/docs/create-key-website)
- [Google server assessments/authentication](https://docs.cloud.google.com/recaptcha/docs/create-assessment-website)
