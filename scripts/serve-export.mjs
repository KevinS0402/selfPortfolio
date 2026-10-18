import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { gzipSync } from "node:zlib";
const option = (name, fallback) => process.argv.find(arg => arg.startsWith(`${name}=`))?.slice(name.length + 1) ?? fallback;
const root = resolve(option("--directory", "out"));
const port = Number(option("--port", "3002"));
const preview = process.argv.includes("--preview");
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"application/javascript; charset=utf-8", ".json":"application/json", ".txt":"text/plain; charset=utf-8", ".xml":"application/xml", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".avif":"image/avif", ".webp":"image/webp", ".glb":"model/gltf-binary", ".pdf":"application/pdf", ".woff2":"font/woff2", ".ico":"image/x-icon" };
await stat(resolve(root, "index.html"));
const server = http.createServer(async (req,res) => {
  if (preview) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (!["GET","HEAD"].includes(req.method)) { res.writeHead(405,{Allow:"GET, HEAD"}); res.end(); return; }
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const path = decodeURIComponent(url.pathname);
    if (path.includes("\\") || path.includes("\0")) throw new Error("Invalid path");
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside export");
    let status = 200;
    try {
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!path.endsWith("/")) { res.writeHead(308,{Location:path+"/"+url.search}); res.end(); return; }
        file = resolve(file,"index.html");
      }
      await stat(file);
    } catch { status=404; file=resolve(root,"404.html"); }
    let body=await readFile(file);
    const type=types[extname(file)] ?? "application/octet-stream";
    const headers={"Content-Type":type,"Cache-Control": /\/(?:_next\/static|media)\//.test(path) && /[a-f0-9]{10}/.test(path) ? "public, max-age=31536000, immutable" : "no-cache"};
    if (/text|javascript|json|xml/.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"]??"")) { body=gzipSync(body); headers["Content-Encoding"]="gzip"; headers.Vary="Accept-Encoding"; }
    headers["Content-Length"]=String(body.length);
    res.writeHead(status,headers); res.end(req.method==="HEAD"?undefined:body);
  } catch { res.writeHead(400); res.end("Bad request"); }
});
server.listen(port,"127.0.0.1",()=>console.log(`Export review: http://127.0.0.1:${port} (${preview?"preview/noindex":"production"})`));
for (const signal of ["SIGINT","SIGTERM"]) process.on(signal,()=>server.close(()=>process.exit(0)));
