import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const mediaManifest = JSON.parse(await readFile("public/media/manifest.json", "utf8"));
const origin = "https://kevinsong.dev";
const personId = `${origin}/#kevin-song`;
const websiteId = `${origin}/#website`;
const expectPreview = process.argv.includes("--preview");
const nativeBuild = process.argv.includes("--next");
const read = path => {
  if (!nativeBuild) return readFile(join(process.cwd(), "out", path), "utf8");
  if (path === "llms.txt") return readFile(join(process.cwd(), "public", path), "utf8");
  const file = path === "404.html" ? "_not-found.html" : /^(sitemap.xml|robots.txt)$/.test(path) ? `${path}.body` : path.replace(/[\\/]index\.html$/, ".html");
  return readFile(join(process.cwd(), ".next/server/app", file), "utf8");
};
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const attribute = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");
const sitemap = await read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decode(match[1]));
assert(urls.length >= 8, "Sitemap is missing public routes");
assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap URL");
const descriptions = new Set();
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, origin, `Wrong sitemap domain: ${url}`);
  assert(parsed.pathname.endsWith("/"), `Missing trailing slash: ${url}`);
  const html = await read(join(parsed.pathname.slice(1), "index.html"));
  const title = decode(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "");
  assert(title.includes("Kevin Song"), `Missing identity in title: ${url}`);
  assert.equal([...html.matchAll(/<title>/g)].length, 1, `Duplicate title: ${url}`);
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
  const canonical = links.filter(tag => attribute(tag, "rel") === "canonical");
  assert.equal(canonical.length, 1, `Expected one canonical: ${url}`);
  assert.equal(attribute(canonical[0], "href"), url, `Wrong canonical: ${url}`);
  const metas = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]);
  const named = name => metas.filter(tag => attribute(tag, "name") === name);
  const descriptionTags = named("description");
  assert.equal(descriptionTags.length, 1, `Expected one description: ${url}`);
  const description = attribute(descriptionTags[0], "content");
  assert(description.length > 40, `Empty or unhelpful description: ${url}`);
  assert(!descriptions.has(description), `Repeated description: ${url}`); descriptions.add(description);
  const robotTags = named("robots");
  assert(robotTags.length, `Missing index policy: ${url}`);
  assert.equal(robotTags.some(tag => /\bnoindex\b/.test(attribute(tag, "content"))), expectPreview, `Wrong index policy: ${url}`);
  const og = property => attribute(metas.find(tag => attribute(tag, "property") === property) ?? "", "content");
  assert.equal(og("og:url"), url, `Wrong Open Graph URL: ${url}`);
  assert.equal(og("og:title"), title, `Search/social titles disagree: ${url}`);
  assert.equal(og("og:image"), `${origin}${mediaManifest.socialImage}`, `Wrong social image: ${url}`);
  assert.equal(og("og:image:width"), "1200"); assert.equal(og("og:image:height"), "630");
  assert(og("og:image:alt").includes("Kevin Song"), `Missing social alt: ${url}`);
  assert(links.some(tag => attribute(tag, "media") === "(prefers-color-scheme: dark)" && attribute(tag, "href") === mediaManifest.faviconDark), `Dark favicon: ${url}`);
  assert(links.some(tag => attribute(tag, "media") === "(prefers-color-scheme: light)" && attribute(tag, "href") === mediaManifest.faviconLight), `Light favicon: ${url}`);
  const payloads = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const nodes = payloads.flatMap(payload => payload["@graph"] ?? [payload]);
  const persons = nodes.filter(node => node["@type"] === "Person");
  assert.equal(persons.length, 1, `Expected one canonical Person: ${url}`);
  assert.equal(persons[0]["@id"], personId, `Person identity drift: ${url}`);
  assert(nodes.some(node => node["@type"] === "WebSite" && node["@id"] === websiteId), `Missing WebSite: ${url}`);
  const page = nodes.find(node => node["@id"] === `${url}#webpage`);
  assert(page, `Missing route-specific page schema: ${url}`);
  assert.equal(page.url, url); assert.equal(page.about["@id"], personId);
  assert.equal(nodes.filter(node => node["@type"] === "ProfilePage").length, parsed.pathname === "/about/" ? 1 : 0, `ProfilePage on wrong route: ${url}`);
  if (parsed.pathname !== "/") assert(nodes.some(node => node["@type"] === "BreadcrumbList"), `Missing breadcrumbs: ${url}`);
  if (parsed.pathname.startsWith("/work/")) {
    const project = nodes.find(node => node["@type"] === "CreativeWork");
    assert(project && project.url === url, `Missing project entity: ${url}`);
    assert.equal(project.contributor["@id"], personId);
  }
  if (parsed.pathname === "/engineering/") {
    assert.equal(page.mainEntity.itemListElement.length, urls.filter(url => new URL(url).pathname.startsWith("/work/")).length, "Project listing drift");
  }
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "");
  assert(text.includes("Kevin Song"), `Identity only exists inside scripts: ${url}`);
  assert(text.includes("<h1"), `Missing server-rendered heading: ${url}`);
  console.log(`PASS ${parsed.pathname}: canonical, metadata, identity, page schema, static content`);
}
const robots = await read("robots.txt");
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert(!/Disallow: \/\s*$/m.test(robots), "Unexpected blanket crawl block");
const guide = await read("llms.txt");
for (const url of urls) assert(guide.includes(url), `Public index omits ${url}`);
const notFound = await read("404.html");
assert(/name="robots"[^>]*content="[^"]*noindex/.test(notFound), "404 should be non-indexable");
console.log(`PASS ${urls.length} public routes; sitemap, crawler access, llms.txt links, and noindex 404`);
