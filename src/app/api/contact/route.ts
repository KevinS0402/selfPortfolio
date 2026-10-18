import { handleContact, MAX_BODY_BYTES } from "../../../../functions/contact-handler.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

async function respond(request: Request) {
  let rawBody: string | undefined = "";
  if (request.method === "POST" && request.body) {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        length += part.value.byteLength;
        if (length > MAX_BODY_BYTES) { rawBody = undefined; await reader.cancel(); break; }
        chunks.push(part.value);
      }
      if (rawBody !== undefined) rawBody = Buffer.concat(chunks).toString("utf8");
    } catch {
      console.error("Contact request body could not be read");
      return Response.json({ error: "Please check your message and try again." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
  }
  const result = await handleContact({
    method: request.method, origin: request.headers.get("origin"), contentType: request.headers.get("content-type"), rawBody,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
  });
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
export const POST = respond;
export const GET = respond;
export const OPTIONS = respond;
