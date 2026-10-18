import { createHash } from "node:crypto";

export const MAX_BODY_BYTES = 16_384;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const SEND_ERROR = "Your message couldn’t be sent. Please try again, or email me directly.";

// This per-instance limiter is deliberately bounded. It complements the honeypot
// and same-origin check without introducing a database into the portfolio.
export function createRateLimiter({ limit = 5, windowMs = 600_000, now = Date.now } = {}) {
  const buckets = new Map();
  return ip => {
    const time = now();
    for (const [key, bucket] of buckets) if (bucket.expires <= time) buckets.delete(key);
    const key = ip || "unknown";
    const bucket = buckets.get(key);
    if (!bucket && buckets.size >= 2000) return false;
    if (!bucket) { buckets.set(key, { count: 1, expires: time + windowMs }); return true; }
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  };
}
const defaultLimiter = createRateLimiter();

function reply(status, body, headers = {}) {
  return { status, body, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers } };
}

export async function handleContact(request, { env = process.env, fetchEmail = fetch, fetchCaptcha = fetch, allowRequest = defaultLimiter } = {}) {
  if (request.method !== "POST") return reply(405, { error: "Please use the contact form to send a message." }, { Allow: "POST" });
  const allowedOrigins = new Set([
    "https://kevinsong.dev", "https://www.kevinsong.dev",
    "https://selfportfolio-896e8.web.app", "https://selfportfolio-896e8.firebaseapp.com",
    ...(env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]),
    ...(env.CONTACT_ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean),
  ]);
  if (!allowedOrigins.has(request.origin)) return reply(403, { error: SEND_ERROR });
  if (!(request.contentType || "").toLowerCase().startsWith("application/json")) return reply(415, { error: "Please send your message using the contact form." });
  if (typeof request.rawBody !== "string" || Buffer.byteLength(request.rawBody, "utf8") > MAX_BODY_BYTES) return reply(413, { error: "That message is a little too long. Please shorten it and try again." });
  if (!allowRequest(request.ip)) return reply(429, { error: "Please wait a few minutes before sending another message." }, { "Retry-After": "600" });

  let input;
  try { input = JSON.parse(request.rawBody); } catch { return reply(400, { error: "Please check your message and try again." }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return reply(400, { error: "Please check your message and try again." });
  // Automated form fillers get a harmless response; no email is sent.
  if (input.company) return reply(200, { ok: true });
  const value = key => typeof input[key] === "string" ? input[key].trim() : "";
  const name = value("name"), email = value("email"), subject = value("subject"), message = value("message");
  const fields = {};
  if (!name || name.length > 100 || CONTROL.test(name)) fields.name = "Please enter your name (up to 100 characters).";
  if (email.length > 254 || !EMAIL.test(email) || CONTROL.test(email)) fields.email = "Please enter a valid email address.";
  if (subject.length > 120 || CONTROL.test(subject)) fields.subject = "Keep the subject to one line, up to 120 characters.";
  if (message.length < 10 || message.length > 5000 || /[\u0000\u000b\u000c\u007f]/.test(message)) fields.message = "Please write a message between 10 and 5,000 characters.";
  if (Object.keys(fields).length) return reply(400, { error: "A couple of details need another look.", fields });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value("submissionId"))) return reply(400, { error: "Please refresh the page and try again." });

  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM_EMAIL?.trim();
  const recipient = env.CONTACT_TO_EMAIL?.trim() || "kevin.song.1@vanderbilt.edu";
  if (!apiKey || !from || CONTROL.test(from) || !EMAIL.test(recipient)) return reply(503, { error: SEND_ERROR });
  const captchaSecret = env.RECAPTCHA_SECRET_KEY?.trim();
  const captchaSite = env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim();
  // Google's public demonstration keys must never enable real email delivery.
  if (!captchaSecret || !captchaSite || captchaSite === "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI") return reply(503, { error: SEND_ERROR });
  const captchaToken = value("captchaToken");
  if (!captchaToken || captchaToken.length > 4096) return reply(400, { error: "Please complete the reCAPTCHA check and try again." });
  try {
    const verification = await fetchCaptcha("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: captchaSecret, response: captchaToken }).toString(),
      signal: AbortSignal.timeout(5_000),
    });
    if (!verification.ok) return reply(503, { error: "The reCAPTCHA check is unavailable. Please try again, or email me directly." });
    const verdict = await verification.json();
    // A successful v2 response must belong to this exact accepted hostname.
    // Tokens are single-use; retries require a fresh checkbox response.
    if (verdict?.success !== true || verdict.hostname !== new URL(request.origin).hostname) return reply(400, { error: "The reCAPTCHA check expired or wasn’t accepted. Please complete it again." });
  } catch { return reply(503, { error: "The reCAPTCHA check is unavailable. Please try again, or email me directly." }); }
  const idempotency = createHash("sha256").update(JSON.stringify([value("submissionId"), name, email, subject, message])).digest("hex");
  try {
    const response = await fetchEmail("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `portfolio-contact-${idempotency}` },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
        from, to: [recipient], reply_to: email,
        subject: `Portfolio: ${subject || `A note from ${name}`}`,
        text: `A new note from kevinsong.dev\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || "Hello!"}\n\n${message}`,
      }),
    });
    if (!response.ok) return reply(502, { error: SEND_ERROR });
    const receipt = await response.json();
    if (typeof receipt.id !== "string" || !receipt.id) return reply(502, { error: SEND_ERROR });
    return reply(200, { ok: true });
  } catch { return reply(502, { error: SEND_ERROR }); }
}
