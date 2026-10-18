# Local SEO and AI-discovery verification

> Deployment update, October 18, 2026: the application now uses a standard Next.js build and native /api/contact/ route. The confirmed CAPTCHA is v2 checkbox with NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY; Enterprise API/project-ID instructions and static-export checks below describe earlier preparation. Follow the current README for active configuration. Production build, native crawl and 15 mocked contact tests pass.

October 18, 2026 · `codex/portfolio-redesign` · local work only.

## Preserved presentation

The homepage, Engineering, Impact, About, and shared case-study page sources match the snapshot taken before this completion pass, byte for byte. `globals.css` and `journey.css` also match. Approved descriptions, confidential-project boundaries, links, headings, section order, motion, and room geometry were retained. Image delivery was optimized from the existing originals; no product screenshot or personal story was invented.

## Search and discovery foundation

- All eight public routes have distinct titles/descriptions, production-domain canonical URLs, matching social metadata, and a consistent Person/WebSite identity graph.
- About uses ProfilePage; Engineering and Impact use CollectionPage; case studies describe CreativeWork and credit Kevin as contributor. Non-home routes include breadcrumbs.
- Sitemap and supplementary `llms.txt` link all public routes. The wildcard crawler policy is unchanged.
- Both a real preview build and a normal production build were produced. Preview HTML has noindex; production HTML is indexable. The loopback preview server adds a noindex header for local review. Actual Vercel headers/protection still require a hosted check.
- A 1200×630 black/gold sharing image replaces the portrait in social metadata only. The in-page portrait is unchanged in composition.

## Delivery improvements

| Asset | Original | Delivered variant | Reduction |
| --- | ---: | ---: | ---: |
| Portrait | 1,386,434 B | 52,609 B at 960px AVIF | 96.2% |
| Portrait on small screens | 1,386,434 B | 9,602 B at 320px AVIF | 99.3% |
| Header monogram | 830,635 B | 8,008 B at 192px PNG | 99.0% |
| Static room fallback | 3,017,271 B | 144,390 B WebP | 95.2% |

Browser selection depends on layout, device density, and format support. WebP/JPEG fallbacks remain. The compact themed favicons preserve the approved dark/light mark treatments. Hashed filenames prevent old-asset cache confusion; original files remain available.

Invisible ripple pixel pools are created on first pointer interaction instead of adding 507 hidden rectangles per field to initial HTML. Visible ASCII glyphs remain server-rendered. Material clones are shared within each room where their behavior matches, preserving per-room emphasis and icon depth behavior. Model animation frames stop while offscreen or in a hidden tab and resume on return.

The homepage HTML changed from approximately 500.5 KB to 409.0 KB before compression; compressed HTML is about 134.5 KB. The main reduction here is initial DOM work, rather than a large compressed-transfer saving. The three room GLBs remain approximately 11.6 MB total: geometry/detail was not reduced.

## Verification performed

- TypeScript, ESLint, and production compilation/static export passed; all 13 generated entries completed, including eight public pages and supporting routes.
- `scripts/check-seo.mjs`: all eight production routes passed; the actual preview build passed `--preview`. Checks cover canonicals, distinct metadata, social dimensions/alt, themed icons, identity references, page types, projects, sitemap, static text, and noindex 404.
- `scripts/check-crawl.mjs`: production passed eight routes, 152 internal links/fragments, and 52 local assets, including models, social card, icons, CSS/fonts, and PDF. Unknown project/page/asset paths return 404; slash redirects preserve queries. The isolated preview also passed its noindex metadata/header checks.
- Server-rendered text/headings and native links are present in exported HTML without executing scripts. This was an HTML crawl, not a claim that every browser interaction was tested with JavaScript disabled.
- Browser checks covered homepage widths 320, 390, 768, 1024, and 1440px with no horizontal overflow in the inspected layout; desktop Engineering/Impact/About were also inspected.
- Mobile swipe selected Impact; keyboard End selected About. The mobile menu's Get in touch link reached the About contact form. Desktop sticky scrolling progressed Engineering → Impact → About. Engineering direct refresh loaded its model; SongSearch navigation and browser back/forward worked.
- The browser selected the new responsive AVIF and compact monogram assets. No first-party hydration error appeared in the inspected logs. LinkedIn's embedded page still emits its own `getInstalledRelatedApps` restriction; no embed recoloring or platform workaround was introduced.
- Temporary performance instrumentation was removed from application source after observation. The final exported JavaScript contains no audit marker. No real email was sent.

## Performance observations and limits

Temporary eight-second, unthrottled local browser samples recorded homepage LCP around **560 ms at 390px** and **1,144 ms at 1440px**. Total observed layout shift was **0** and **0.0103** respectively. These used local serving, browser caching, and this laptop; they are not comparable cold-network baselines, Lighthouse scores, field Core Web Vitals, or a verified INP measurement. An earlier sample spanning client navigation was excluded.

Model downloads and shader/JavaScript work still warrant realistic mobile-network and real-device testing. The local samples contained long tasks; asset reductions do not prove that every interaction meets responsiveness targets. Preserve quality when considering later model compression or delivery changes. The optional sample source and raw observations are retained with task evidence outside the application repository.

Reduced-motion branches were preserved in source. No new browser reduced-motion emulation or Safari/iOS device test is claimed in this pass. Google/Bing validators and actual AI-search citation behavior must be checked after public deployment. Ranking, indexing, and citations cannot be guaranteed.

## Deferred launch work

See [launch-checklist.md](launch-checklist.md): Vercel contact adapter, private configuration, authorized test delivery, hosted preview checks, DNS cutover, Search Console/Bing verification/submission, and ongoing measurement. Firebase and the public site were not changed; nothing was committed, pushed, or deployed.
