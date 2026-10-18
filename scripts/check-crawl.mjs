import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
const base=process.argv.find(arg=>arg.startsWith("--base="))?.slice(7)??"http://127.0.0.1:3002";
const preview=process.argv.includes("--preview");
const origin="https://kevinsong.dev";
const decode=s=>s.replaceAll("&amp;","&").replaceAll("&#x27;","'").replaceAll("&quot;",'"');
const attribute=(tag,name)=>decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]??"");
const htmls=new Map(), links=[], assets=new Set(["/models/engineering.glb","/models/impact.glb","/models/about.glb","/models/connections.glb","/models/rocket.glb","/llms.txt","/robots.txt"]);
const sitemap=await (await fetch(`${base}/sitemap.xml`)).text();
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert(urls.length>=8,"Missing public routes");
for(const path of urls){
 const response=await fetch(base+path); assert.equal(response.status,200,path);
 assert.equal(response.headers.has("x-robots-tag"),preview,"Review server index header");
 const html=await response.text(); htmls.set(path,html);
 assert(html.includes(`href="${origin}${path}"`),`Canonical: ${path}`);
 assert.equal(/name="robots"[^>]*content="[^"]*noindex/.test(html),preview,`Index policy: ${path}`);
 const readable=html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/g,"");
 assert(/<h1\b/.test(readable)&&readable.includes("Kevin Song"),`Static/no-JS content: ${path}`);
 for(const tag of html.match(/<(?:a|link|img|script|source|meta)\b[^>]*>/g)??[]){
  if(attribute(tag,"property")==="og:image") assets.add(attribute(tag,"content"));
  const href=attribute(tag,"href"),src=attribute(tag,"src");
  if(tag.startsWith("<a")&&href)links.push({from:path,href});
  else if(href&&["stylesheet","preload","icon","apple-touch-icon"].includes(attribute(tag,"rel"))) assets.add(href);
  if(src&&!src.startsWith("data:")) assets.add(src);
  for(const item of attribute(tag,"srcSet").split(",")){const u=item.trim().split(/\s+/)[0];if(u)assets.add(u);}
 }
 console.log(`PASS ${path}: HTML ${html.length} chars, gzip ${gzipSync(html).length} bytes; readable without scripts`);
}
let checkedLinks=0;
for(const {from,href}of links){
 const url=new URL(href,origin+from); if(!["http:","https:"].includes(url.protocol)||url.origin!==origin)continue;
 const path=url.pathname; let target=htmls.get(path);
 if(!target){const res=await fetch(base+path,{method:"HEAD"});assert.equal(res.status,200,`${from} -> ${href}`);}
 if(url.hash&&target){const id=decodeURIComponent(url.hash.slice(1));assert(target.includes(`id="${id}"`)||target.includes(`name="${id}"`),`Broken fragment: ${from} -> ${href}`);}
 checkedLinks++;
}
let checkedAssets=0;
for(const href of assets){
 const url=new URL(href,origin);if(url.origin!==origin)continue;
 const res=await fetch(base+url.pathname,{method:"HEAD"});assert.equal(res.status,200,`Broken local asset ${href}`);assert(res.headers.get("content-type"),`Missing MIME ${href}`);checkedAssets++;
 if(res.headers.get("content-type")?.includes("text/css")){
  const css=await (await fetch(base+url.pathname)).text();
  for(const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)){if(!match[1].startsWith("data:"))assets.add(new URL(match[1],url).href);}
 }
}
for(const path of ["/work/not-a-project/","/missing-asset.png","/not-a-page/"]){const res=await fetch(base+path);assert.equal(res.status,404,`False 200: ${path}`);}
const redirect=await fetch(base+"/engineering?review=1",{redirect:"manual"});assert.equal(redirect.status,308);assert.equal(redirect.headers.get("location"),"/engineering/?review=1");
const pdf=await fetch(base+"/kevin-song-resume-2026-cs-pm.pdf",{method:"HEAD"});assert.equal(pdf.headers.get("content-type"),"application/pdf");
console.log(`PASS ${urls.length} routes, ${checkedLinks} local links/fragments, ${checkedAssets} assets, PDF, trailing-slash redirect, true 404s${preview?", preview noindex header + metadata":""}`);
