import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { handleContact } from "./contact-handler.mjs";

const resendKey = defineSecret("RESEND_API_KEY");
const captchaKey = defineSecret("RECAPTCHA_SECRET_KEY");
export const contact = onRequest({
  region: "us-central1", secrets: [resendKey, captchaKey], cors: false,
  invoker: "public", maxInstances: 2, timeoutSeconds: 20, memory: "256MiB",
}, async (req, res) => {
  const result = await handleContact({
    method: req.method, origin: req.get("origin"), contentType: req.get("content-type"),
    rawBody: req.rawBody?.toString("utf8") || "", ip: req.ip,
  }, { env: { ...process.env, NODE_ENV: "production", RESEND_API_KEY: resendKey.value(), RECAPTCHA_SECRET_KEY: captchaKey.value() } });
  res.set(result.headers).status(result.status).json(result.body);
});
