# Kevin Song: search and AI discoverability

Planning baseline: October 18, 2026. Local preparation only; this document does not authorize publishing, messaging, DNS changes, or account changes.

## Scope

Preserve all approved visible copy, headings, page structure, visuals, and emphasis. SEO is technical preparation, not an editorial rewrite. Vanderbilt and Ingram are identity context, not a new dominant theme. Any future page-content change requires a separate request.

## Objective and positioning

Make kevinsong.dev the clear first-party reference for **Kevin Song, Vanderbilt University computer science student and Ingram Scholar**, connecting engineering/product work, service, and music as KSONG (宋凯文).

Aim to improve qualified discovery and correct identification. A number-one ranking for the ambiguous name “Kevin Song” cannot be promised. Broad institutional queries such as “Ingram Scholars at Vanderbilt” primarily seek Vanderbilt’s directory; Kevin’s portfolio should complement that source.

Vanderbilt’s [current scholars directory](https://www.vanderbilt.edu/ingram/our-scholars/) publicly lists Kevin Song, computer science, and a business minor. Search research also surfaces several unrelated people with the same name. These observations are not a rank-tracking baseline; impressions and positions need Search Console data.

## Query and page map

| Priority / intent | Example queries | Best page |
| --- | --- | --- |
| Primary identity | Kevin Song Vanderbilt; Kevin Song Ingram Scholar; Kevin Song portfolio | Home and About |
| Technical recruiting | Kevin Song software engineer; Kevin Song AI projects; Kevin Song Elysian | Engineering and project case studies |
| Service identity | Kevin Song DevelopIT; Kevin Song Ingram summer project; Kevin Song MNPS Save The Music | Impact |
| Creative identity | Kevin Song KSONG; KSONG 宋凯文; Kevin Song English Chinese music | About, linking to ksongfire.com |
| Specific work | Kevin Song SongSearch; SignLect Raspberry Pi; Canary.ai Vanderbilt | Respective case study |
| Longer-term topical discovery | Vanderbilt student AI music projects; accessibility computer vision projects | Case studies with authentic technical evidence |

These are hypotheses based on Kevin’s real work, not measured keyword volumes. Avoid doorway pages, repetitions of the name, invented achievements, or generic “best engineer” claims.

## Phase 1 — local foundation (implemented)

- Centralize the canonical domain and public identity in `src/lib/site.ts`.
- Give each route a descriptive, distinct search title and description. Keep the short About copy and visual design unchanged.
- Use stable Person and WebSite identifiers; connect verified public profiles and the Ingram/Vanderbilt affiliations. Do not declare graduation or alumni status while Kevin is a student.
- Apply ProfilePage to About, CollectionPage to Engineering/Impact, and WebPage plus CreativeWork to project case studies. Projects credit Kevin as a contributor, without inventing collaborators, ratings, outcomes, or employment details.
- Generate project listings from the existing content collection. Include breadcrumbs that match the site hierarchy.
- Preserve canonical trailing-slash URLs, static HTML, native links, the sitemap, and existing crawler access. Keep development and Vercel preview metadata non-indexable; production exports remain indexable.
- Update the existing llms.txt to link every public case study and clearly distinguish public/private sources. It is supplementary, not a ranking mechanism. No training-bot policy changes are part of this pass.
- Add `scripts/check-seo.mjs` to inspect the built HTML, canonical URLs, metadata, identity graph, page types, source relationships, sitemap, and 404.

## Phase 2 — external identity and technical presentation

1. Review existing links from Kevin’s LinkedIn, GitHub profile, KSONG site, and public project READMEs back to kevinsong.dev. Authorize external edits or outreach separately; do not send messages as part of this task.
2. Use existing institutional references, including Vanderbilt’s Ingram directory, to corroborate identity. Do not add keyword-heavy paragraphs, FAQ sections, articles, or extra university branding to the portfolio.
3. Completed locally: a 1200×630 black/gold landscape social-preview card is wired to Open Graph and Twitter metadata, without replacing on-page visuals.
4. Keep machine-readable facts in sync when Kevin separately requests a real content or role update. Do not use SEO as a reason to expand About or disclose work details.

## Phase 3 — before Vercel domain cutover

- Preserve **https://kevinsong.dev** and the existing public paths. Hosting alone does not require a domain change or a Search Console Change of Address request.
- Audit live legacy routes and valuable backlinks; create permanent redirects only for URLs that actually change. URL fragments are not sent to the server, so handle any legacy anchor navigation deliberately.
- Test the Vercel preview, direct-route refreshes, 404 status, PDF/assets/models, canonical URLs, structured data, and contact flow. Verify the actual preview response has noindex, including platform protection/header behavior; do not rely only on robots.txt blocking.
- Configure contact variables privately when ready, then test with authorized test delivery before directing users to the new production site. Never expose keys to the frontend.
- Check DNS records, HTTPS, root/www canonical redirects, production crawler access, and deployment headers. Preserve unrelated DNS records.
- Benchmark mobile LCP, INP, CLS and 3D/animation cost on a real phone. Keep crucial content independent of WebGL or JavaScript; optimize asset loading based on measurements, not animation removal by default.
- Switch DNS only after explicit deployment/cutover approval. Keep Firebase available until the new host serves users and crawlers correctly and propagation is checked.

## Phase 4 — launch verification and measurement

- Verify the domain in Google Search Console and Bing Webmaster Tools, or reuse existing verified properties. Account/DNS verification is a later explicit action.
- Submit the production sitemap and inspect Home, About, Impact, Engineering, and case studies. Use Google Rich Results Test and Schema Markup Validator as diagnostics, not proof that a rich result will appear.
- Record launch-date indexing, discovered canonicals, branded-query impressions/clicks/positions, and qualified contact outcomes. Review after indexing and then at roughly 30/60/90 days; time intervals are checkpoints, not ranking guarantees.
- Sample AI search questions: “Who is Kevin Song at Vanderbilt?”, “What has Kevin Song built?”, “Is Kevin Song an Ingram Scholar?”, “Who is KSONG?”. Check correct identity, current facts, and source citations. Record the tool/date/query because results vary.
- Check infrastructure logs for legitimate crawler access if available. Search crawlers and training crawlers have different purposes; changing training permissions is not required to make an identity clearer in search.

## Sources and practical boundaries

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features): normal SEO foundations still apply; important content should be accessible as text and structured data should match visible content.
- [Google: generative AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): no special AI schema or llms.txt file is required for Google’s AI features.
- [Google: ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page) and [site names](https://developers.google.com/search/docs/appearance/site-names).
- [Google: changing hosting without changing URLs](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes): test the destination, switch DNS, monitor, then retire the old infrastructure.
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots): OAI-SearchBot handles ChatGPT search discovery; GPTBot training controls are independent. The existing wildcard allow rule permits the search crawler, subject to hosting/firewall access.

No metadata, schema, crawler rule, text file, or migration can guarantee indexing, a knowledge panel, a citation, or first place. The work improves eligibility, clarity, and the quality of the source people and search systems can find.

## Local completion — October 18, 2026

The remaining local delivery and export-review work is complete. See [seo-local-verification.md](seo-local-verification.md) for measured asset reductions, production and preview checks, browser review, and the practical limits of local performance samples. [launch-checklist.md](launch-checklist.md) separates the remaining hosting/contact adapter, key setup, public validation, and account/DNS actions. No visible page copy or layout was changed by this work.
