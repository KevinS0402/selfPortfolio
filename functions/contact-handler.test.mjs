import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter, handleContact, MAX_BODY_BYTES } from "./contact-handler.mjs";

const input = { name: "Ada Example", email: "ada@example.com", subject: "A project", message: "I would love to talk about building something together.", company: "", captchaToken: "test-token-never-sent", submissionId: "e8e8461d-590c-4d73-9244-70ed77da1d99" };
const env = { NODE_ENV: "test", RECAPTCHA_SECRET_KEY: "mock-captcha-secret", NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "mock-site-key", RESEND_API_KEY: "test-key-never-sent", RESEND_FROM_EMAIL: "Portfolio <contact@example.com>", CONTACT_TO_EMAIL: "kevin.song.1@vanderbilt.edu" };
function request(changes = {}, fields = input) { return { method: "POST", origin: "http://localhost:3000", contentType: "application/json", rawBody: JSON.stringify(fields), ip: "127.0.0.1", ...changes }; }
function settings(fetchEmail = async () => new Response(JSON.stringify({ id: "mock-delivery-id" }))) { return { env, fetchEmail, fetchCaptcha: async () => new Response(JSON.stringify({ success: true, hostname: "localhost" })), allowRequest: () => true }; }

test("valid message goes only to configured inbox, uses reply-to, and is plain text", async () => {
  let payload, headers;
  const result = await handleContact(request({}, { ...input, to: "someone-else@example.com", from: "visitor@example.com", message: "A message with <script>markup</script> that stays plain text." }), settings(async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    payload = JSON.parse(options.body); headers = options.headers;
    return new Response(JSON.stringify({ id: "mock-delivery" }));
  }));
  assert.equal(result.status, 200);
  assert.deepEqual(payload.to, [env.CONTACT_TO_EMAIL]);
  assert.equal(payload.from, env.RESEND_FROM_EMAIL);
  assert.equal(payload.reply_to, input.email);
  assert.equal(payload.html, undefined);
  assert.match(payload.text, /<script>markup<\/script>/);
  assert.match(headers["Idempotency-Key"], /^portfolio-contact-[a-f0-9]{64}$/);
});
test("unchanged retries preserve the provider idempotency key", async () => {
  const keys = [];
  const config = settings(async (url, options) => { keys.push(options.headers["Idempotency-Key"]); return new Response('{"id":"mock"}'); });
  await handleContact(request(), config); await handleContact(request(), config);
  assert.equal(keys[0], keys[1]);
  await handleContact(request({}, { ...input, message: "This is a different message to the same recipient." }), config);
  assert.notEqual(keys[0], keys[2]);
});
test("invalid fields and malformed JSON cannot send mail", async () => {
  const config = settings(async () => assert.fail("must not send"));
  const result = await handleContact(request({}, { ...input, name: "", email: "not-an-email", subject: "injected\nheader", message: "short" }), config);
  assert.equal(result.status, 400); assert.equal(Object.keys(result.body.fields).length, 4);
  assert.equal((await handleContact(request({ rawBody: "{" }), config)).status, 400);
  assert.equal((await handleContact(request({}, []), config)).status, 400);
  assert.equal((await handleContact(request({}, { ...input, name: {}, email: [] }), config)).status, 400);
});
test("GET, cross-origin, wrong content type, and oversized bodies are rejected", async () => {
  const config = settings(async () => assert.fail("must not send"));
  assert.equal((await handleContact(request({ method: "GET" }), config)).status, 405);
  assert.equal((await handleContact(request({ origin: "https://other.example" }), config)).status, 403);
  assert.equal((await handleContact(request({ contentType: "text/plain" }), config)).status, 415);
  assert.equal((await handleContact(request({ rawBody: "x".repeat(MAX_BODY_BYTES + 1) }), config)).status, 413);
});
test("honeypot returns harmless confirmation without delivering", async () => {
  const result = await handleContact(request({}, { ...input, company: "spam.example" }), settings(async () => assert.fail("must not send")));
  assert.deepEqual(result.body, { ok: true });
});
test("missing configuration returns an honest error without a provider request", async () => {
  const result = await handleContact(request(), { ...settings(async () => assert.fail("must not send")), env: {} });
  assert.equal(result.status, 503); assert.equal(result.body.ok, undefined);
  assert.doesNotMatch(JSON.stringify(result.body), /RESEND|API_KEY/);
});
test("provider rejection, malformed receipt, and network failure never report success", async () => {
  for (const send of [async () => new Response('{"error":"private provider detail"}', { status: 403 }), async () => new Response('{}'), async () => { throw new Error("network timeout"); }]) {
    const result = await handleContact(request(), settings(send));
    assert.equal(result.status, 502); assert.equal(result.body.ok, undefined);
    assert.doesNotMatch(JSON.stringify(result.body), /private provider detail|test-key-never-sent/);
  }
});
test("rate limiter counts attempts, separates clients, and expires", async () => {
  let time = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 100, now: () => time });
  assert.equal(limiter("a"), true); assert.equal(limiter("a"), true); assert.equal(limiter("a"), false);
  assert.equal(limiter("b"), true); time = 101; assert.equal(limiter("a"), true);
  const result = await handleContact(request(), { ...settings(), allowRequest: () => false });
  assert.equal(result.status, 429); assert.equal(result.headers["Retry-After"], "600");
});
test("production excludes loopback unless explicitly configured", async () => {
  const result = await handleContact(request(), { ...settings(), env: { ...env, NODE_ENV: "production" } });
  assert.equal(result.status, 403);
});

test("CAPTCHA verification precedes mail, binds hostname, and keeps secrets out of the email", async () => {
  const calls = [];
  const config = settings(async (url, options) => {
    calls.push("email");
    assert.doesNotMatch(options.body, /test-token-never-sent|mock-captcha-secret/);
    return new Response('{"id":"mock"}');
  });
  config.fetchCaptcha = async (url, options) => {
    calls.push("captcha");
    assert.equal(url, "https://www.google.com/recaptcha/api/siteverify");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/x-www-form-urlencoded");
    assert.deepEqual(Object.fromEntries(new URLSearchParams(options.body)), { secret: env.RECAPTCHA_SECRET_KEY, response: input.captchaToken });
    return new Response('{"success":true,"hostname":"localhost"}');
  };
  assert.equal((await handleContact(request(), config)).status, 200);
  assert.deepEqual(calls, ["captcha", "email"]);
});

test("missing or oversized CAPTCHA tokens never reach either provider", async () => {
  const config = { ...settings(async () => assert.fail("must not send")), fetchCaptcha: async () => assert.fail("must not verify") };
  for (const captchaToken of [undefined, "", 1, {}, "x".repeat(4097)]) {
    assert.equal((await handleContact(request({}, { ...input, captchaToken }), config)).status, 400);
  }
});

test("rejected, expired, malformed and wrong-host CAPTCHA results cannot send mail", async () => {
  for (const verdict of [{ success: false, "error-codes": ["timeout-or-duplicate"] }, { success: true, hostname: "other.example" }, { success: true }, { success: "true", hostname: "localhost" }, null]) {
    const result = await handleContact(request(), { ...settings(async () => assert.fail("must not send")), fetchCaptcha: async () => new Response(JSON.stringify(verdict)) });
    assert.equal(result.status, 400);
  }
});

test("CAPTCHA outages fail closed with a useful error", async () => {
  for (const fetchCaptcha of [async () => new Response("unavailable", { status: 503 }), async () => new Response("not json"), async () => { throw new Error("private verification detail"); }]) {
    const result = await handleContact(request(), { ...settings(async () => assert.fail("must not send")), fetchCaptcha });
    assert.equal(result.status, 503);
    assert.doesNotMatch(JSON.stringify(result.body), /private verification detail|mock-captcha-secret/);
  }
});

test("missing v2 configuration and published test site keys cannot send", async () => {
  const config = settings(async () => assert.fail("must not send"));
  for (const overrides of [{ RECAPTCHA_SECRET_KEY: "" }, { NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "" }, { NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" }]) {
    assert.equal((await handleContact(request(), { ...config, env: { ...env, ...overrides } })).status, 503);
  }
});

test("a production-origin token must match the accepted production hostname", async () => {
  const config = { ...settings(), env: { ...env, NODE_ENV: "production" }, fetchCaptcha: async () => new Response('{"success":true,"hostname":"kevinsong.dev"}') };
  assert.equal((await handleContact(request({ origin: "https://kevinsong.dev" }), config)).status, 200);
  config.fetchCaptcha = async () => new Response('{"success":true,"hostname":"localhost"}');
  assert.equal((await handleContact(request({ origin: "https://kevinsong.dev" }), config)).status, 400);
});
