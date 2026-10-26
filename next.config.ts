import type { NextConfig } from "next";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "";
const posthogConnect = /^https:\/\/(us|eu)\.i\.posthog\.com$/.test(posthogHost) ? ` ${posthogHost}` : "";
const productionHeaders = [
  {
    "key": "X-Content-Type-Options",
    "value": "nosniff"
  },
  {
    "key": "Referrer-Policy",
    "value": "strict-origin-when-cross-origin"
  },
  {
    "key": "X-Frame-Options",
    "value": "DENY"
  },
  {
    "key": "Permissions-Policy",
    "value": "camera=(), microphone=(), geolocation=(), payment=()"
  },
  {
    "key": "Content-Security-Policy",
    "value": `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://www.google.com/recaptcha/${posthogConnect}; frame-src https://www.linkedin.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`
  }
];
const nextConfig: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  images: { unoptimized: true },
  async headers() {
    return process.env.NODE_ENV === "production" ? [{ source: "/:path*", headers: productionHeaders }] : [];
  },
};
export default nextConfig;
