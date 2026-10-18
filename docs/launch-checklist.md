# Portfolio launch checklist

> Deployment update, October 18, 2026: the application now uses a standard Next.js build and native /api/contact/ route. The confirmed CAPTCHA is v2 checkbox with NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY; Enterprise API/project-ID instructions and static-export checks below describe earlier preparation. Follow the current README for active configuration. Production build, native crawl and 15 mocked contact tests pass.

Prepared locally on October 18, 2026. Nothing here authorizes deployment, DNS changes, account edits, email delivery, or key setup.

## Ready locally

- Canonical URLs retain `https://kevinsong.dev/` and trailing-slash chapter/project paths.
- Search/social metadata, a shared identity graph, breadcrumbs, sitemap, and public `llms.txt` directory are generated with the static pages.
- Landscape sharing card and responsive versions of existing imagery are stored in `public/media`; originals remain available. Regenerate with `npm run media:build` (also runs before normal builds).
- Use `npm run check:seo` after an ordinary production build. For a build made with `VERCEL_ENV=preview`, use `node scripts/check-seo.mjs --preview`.
- Use `npm run preview:export` to serve `out` at `http://127.0.0.1:3002`. This read-only review server supplies real 404 responses and cannot send contact messages. It is not a production hosting configuration.
- Use `npm run check:crawl` against that server. It checks static readability, internal routes/fragments/assets, the PDF, slash redirects, and missing-page responses.

## Before creating a Vercel deployment

1. Keep the existing Firebase deployment and DNS working. Preserve the current domain and paths; changing hosting alone does not require Google's Change of Address tool.
2. Prepare a Vercel-compatible `/api/contact` endpoint around the existing shared contact handler. Firebase's rewrite/function entry point does not automatically migrate. Test validation, CAPTCHA enforcement, timeouts, sender/recipient rules, and delivery separately. This adapter is still a migration task.
3. Privately configure Resend and Google reCAPTCHA when ready. The public site key must exist at build time; server keys belong only in server runtime settings. Keep development and production CAPTCHA domains/settings separate. No keys are added by this SEO pass.
4. Configure preview protection and noindex. The local preview build proves the app's noindex metadata, but does not prove Vercel's live headers or protection. Inspect an actual hosted preview before launch.
5. Keep the Next.js static-export configuration unless the contact adapter or chosen hosting architecture requires a deliberate change. Do not inadvertently serve HTML for unknown routes or API paths.
6. Verify hosted direct loads/refreshes for all eight public pages, actual 404 status, PDF/model/font/image MIME types, contact handling, CSP, compression, caching, and canonical URLs. Review original production headers rather than copying development defaults.
7. Run a real-phone performance check and a hosted mobile lab test. Local unthrottled timings are useful diagnostics, not field LCP/INP/CLS or a Lighthouse score. The approximately 11.6 MB of homepage model geometry is deferred/lazy-loaded but still merits realistic mobile-network testing; preserve visual quality when deciding future model compression.

## Domain cutover — separately authorized

- Audit current root/www DNS and legacy URLs first. Preserve unrelated mail/TXT records. Redirect only URLs that actually change; fragments are handled in the browser.
- Connect `kevinsong.dev` on the new host and follow its verified DNS instructions. Choose one canonical root/www direction, confirm HTTPS and avoid redirect loops.
- Point DNS only after the new production site, contact delivery, and crawler access pass review. Keep Firebase available through propagation and rollback verification.
- Confirm production has no preview noindex header or metadata. Recheck `robots.txt`, sitemap, canonical domain, and all share images from the public domain.

## After launch — account actions still pending

- Reuse or verify Google Search Console and Bing Webmaster Tools properties, submit the sitemap, and inspect key URLs.
- Run Google's Rich Results Test / Schema Markup Validator against the public pages. Local structural checks do not guarantee rich-result eligibility or display.
- Record indexing, chosen canonicals, identity-query impressions/clicks, and contact outcomes. Revisit after indexing and at roughly 30/60/90 days.
- Sample AI-search identity questions with date/tool/query recorded. No special schema or `llms.txt` can guarantee an AI citation or ranking.

## Public identity audit (read-only)

- [Kevin's GitHub profile](https://github.com/KevinS0402) already links to kevinsong.dev and the matching LinkedIn profile. No change needed there based on the retrieved profile.
- [Vanderbilt's scholars directory](https://www.vanderbilt.edu/ingram/our-scholars/) publicly lists Kevin Song with computer science and a business minor, supporting the identity context already on the portfolio.
- LinkedIn returned an access restriction and ksongfire.com could not be retrieved by the research tool in this pass. Their backlink state is unverified; check manually later rather than assuming a missing link.
- Public SongSearch and Canary.ai repository pages were reachable, but this pass did not establish consistent portfolio backlinks in every project README. The VHX page could not be retrieved. Any README/profile edits are separate work; no external edits or outreach occurred.

Official guidance: [Google: hosting migration without URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes), [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features), [Next.js static export](https://nextjs.org/docs/app/guides/static-exports).
