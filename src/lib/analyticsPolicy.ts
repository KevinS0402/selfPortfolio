/** Only intentional portfolio actions and bounded metadata leave the browser. */
export const analyticsEvents = ["$pageview", "explore_clicked", "chapter_clicked", "project_opened", "resume_opened", "outbound_link_clicked", "contact_link_clicked", "email_copied", "contact_started", "contact_submitted", "contact_failed", "scroll_depth", "sequence_step_viewed"] as const;
export type AnalyticsEventName = typeof analyticsEvents[number];
export type AnalyticsProperties = Record<string, string | number | boolean>;
export const analyticsPaths = new Set(["/", "/engineering/", "/impact/", "/about/", "/work/songsearch/", "/work/signlect/", "/work/canary-ai/", "/work/aihealth/"]);
const events = new Set<string>(analyticsEvents);
const properties = new Set([
  "token", "distinct_id", "$session_id", "$insert_id", "$lib", "$lib_version", "$browser", "$os", "$device_type", "$is_identified", "$process_person_profile", "$current_url", "$pathname", "$referrer", "$referring_domain", "$initial_current_url", "$initial_referrer", "$initial_referring_domain",
  "environment", "measurement_mode", "app", "path", "source", "chapter", "project", "destination", "sequence", "step", "depth", "outcome", "utm_source", "utm_medium", "utm_campaign"
]);
export function portfolioPath(value: string) {
  const path = value.endsWith("/") ? value : `${value}/`;
  return analyticsPaths.has(path) ? path : null;
}
export function campaignProperties(href: string): AnalyticsProperties {
  const result: AnalyticsProperties = {};
  try {
    const url = new URL(href);
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const value = url.searchParams.get(key);
      if (value && /^[a-z0-9_. -]{1,80}$/i.test(value)) result[key] = value;
    }
  } catch { /* Ignore malformed URLs. */ }
  return result;
}
export function safeReferrer(value: string, origin: string) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.origin === origin ? `${url.origin}${portfolioPath(url.pathname) ?? "/"}` : `${url.origin}/`;
  } catch { return ""; }
}
export function sanitizeAnalyticsEvent<T extends {event: string; properties: Record<string, unknown>}>(event: T, origin: string): T | null {
  if (!events.has(event.event)) return null;
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(event.properties)) {
    if (!properties.has(key) || !["string", "number", "boolean"].includes(typeof value)) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (key.includes("referrer") && !key.includes("domain")) { clean[key] = safeReferrer(String(value), origin); continue; }
    if (key === "$current_url" || key === "$initial_current_url") {
      try { const url = new URL(String(value)); const path = portfolioPath(url.pathname); if (path && url.origin === origin) clean[key] = `${origin}${path}`; } catch { /* Not a valid public page. */ }
      continue;
    }
    if (key === "path" || key === "$pathname") { const path = portfolioPath(String(value)); if (path) clean[key] = path; continue; }
    if (key.startsWith("utm_") && !/^[a-z0-9_. -]{1,80}$/i.test(String(value))) continue;
    if (["source","chapter","project","destination","sequence","outcome"].includes(key) && !/^[a-z0-9 ._:/&+’-]{1,100}$/i.test(String(value))) continue;
    clean[key] = value as string | number | boolean;
  }
  // Never identify a person or create profiles from a portfolio visit.
  clean.$process_person_profile = false;
  clean.$is_identified = false;
  return {...event, properties: clean};
}
export function classifyLink(href: string, current: string): {event: AnalyticsEventName; properties: AnalyticsProperties} | null {
  if (href.startsWith("mailto:")) return {event:"contact_link_clicked",properties:{destination:"email"}};
  try {
    const url = new URL(href, current), base = new URL(current);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (url.origin !== base.origin) return {event:"outbound_link_clicked",properties:{destination:url.hostname}};
    if (url.hash === "#contact-form" || url.hash === "#contact") return {event:"contact_link_clicked",properties:{destination:"contact-form"}};
    if (url.pathname.endsWith(".pdf")) return {event:"resume_opened",properties:{destination:"resume"}};
    if (url.hash === "#explore") return {event:"explore_clicked",properties:{destination:"explore"}};
    const path = portfolioPath(url.pathname);
    if (!path) return null;
    if (path.startsWith("/work/")) return {event:"project_opened",properties:{project:path.split("/")[2]}};
    if (path !== "/") return {event:"chapter_clicked",properties:{chapter:path.split("/")[1]}};
  } catch { /* Ignore malformed links. */ }
  return null;
}
