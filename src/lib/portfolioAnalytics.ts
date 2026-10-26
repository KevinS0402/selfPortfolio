"use client";

import { campaignProperties, portfolioPath, safeReferrer, sanitizeAnalyticsEvent, type AnalyticsEventName, type AnalyticsProperties } from "./analyticsPolicy";
import type posthog from "posthog-js/dist/module.slim";

type Client = typeof posthog;
type Config = {key: string; host: string; environment: "production" | "test"};
let config: Config | undefined;
let client: Client | undefined;
let loading: Promise<boolean> | undefined;
let allowed = false;
let currentPath = "";
let lastPage = "";
let entry: AnalyticsProperties = {};
const once = new Set<string>();
const pending: {event: AnalyticsEventName; properties: AnalyticsProperties}[] = [];
export function configurePortfolioAnalytics(value: Config) {
  config = value;
  if (!Object.keys(entry).length) entry = {...campaignProperties(location.href), $referrer:safeReferrer(document.referrer, location.origin)};
}
export function browserBlocksAnalytics() {
  return navigator.doNotTrack === "1" || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl === true;
}
export function stopPortfolioAnalytics() {
  allowed = false; pending.length = 0; once.clear(); lastPage = "";
  // The local capture gate stops new events without writing an SDK consent cookie.
}
export async function startPortfolioAnalytics() {
  if (!config?.key || !config.host || browserBlocksAnalytics()) return false;
  if (allowed && client) return true;
  allowed = true;
  if (client) return true;
  if (loading) return loading;
  loading = (async () => {
    try {
      // The slim core has no replay, autocapture, survey, heatmap or flag extensions.
      const {default: sdk} = await import("posthog-js/dist/module.slim");
      if (!allowed || !config) return false;
      sdk.init(config.key, {
        api_host: config.host, persistence:"memory", disable_persistence:true,
        persistence_name:"kevin_portfolio", consent_persistence_name:"portfolio_analytics_memory_v1",
        opt_out_capturing_by_default:false, cross_subdomain_cookie:false,
        autocapture:false, capture_pageview:false, capture_pageleave:false,
        capture_performance:false, capture_exceptions:false, capture_heatmaps:false,
        capture_dead_clicks:false, rageclick:false, disable_session_recording:true,
        disable_surveys:true, advanced_disable_flags:true, disable_external_dependency_loading:true,
        enable_recording_console_log:false, person_profiles:"never", respect_dnt:true,
        mask_all_text:true, mask_all_element_attributes:true,
        before_send: event => allowed && !browserBlocksAnalytics() ? sanitizeAnalyticsEvent(event, location.origin) : null,
      });
      client = sdk;
      for (const item of pending.splice(0)) if (allowed) client.capture(item.event, item.properties);
      return true;
    } catch {
      pending.length = 0; allowed = false;
      return false; // Optional analytics must never break navigation or sending a note.
    } finally { loading = undefined; }
  })();
  return loading;
}
export function trackPortfolioEvent(event: AnalyticsEventName, properties: AnalyticsProperties = {}, onceKey?: string) {
  if (typeof window === "undefined" || !allowed || !config || browserBlocksAnalytics()) return;
  const path = portfolioPath(location.pathname);
  if (!path) return;
  if (currentPath !== path) { currentPath = path; once.clear(); }
  // Child effects can run before the layout's pageview effect on navigation.
  // Establish the page once before recording its first interaction or milestone.
  if (event !== "$pageview" && lastPage !== path) trackPortfolioPage(path);
  if (onceKey) { const key = `${path}:${onceKey}`; if (once.has(key)) return; once.add(key); }
  const item = {event,properties:{...entry,...properties,app:"portfolio",environment:config.environment,measurement_mode:"memory",path,$pathname:path,$current_url:`${location.origin}${path}`}};
  if (client) client.capture(item.event, item.properties);
  else if (pending.length < 30) pending.push(item);
}
export function trackPortfolioPage(pathname: string) {
  const path = portfolioPath(pathname);
  if (!allowed || !path || path === lastPage) return;
  if (currentPath !== path) { currentPath = path; once.clear(); }
  lastPage = path;
  trackPortfolioEvent("$pageview");
}
