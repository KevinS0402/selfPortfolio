"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { classifyLink } from "@/lib/analyticsPolicy";
import { browserBlocksAnalytics, configurePortfolioAnalytics, startPortfolioAnalytics, stopPortfolioAnalytics, trackPortfolioEvent, trackPortfolioPage } from "@/lib/portfolioAnalytics";

function hasStoredOptOut() {
  try {
    const saved = localStorage.getItem("portfolio-analytics-disabled-v1");
    return saved === "1" || (saved === null && localStorage.getItem("portfolio-optional-analytics-v1") === "declined");
  } catch { return false; }
}
export function PortfolioAnalytics({enabled, environment}:{enabled:boolean;environment:"production"|"test"}) {
  const pathname = usePathname();
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? "";
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "";
  const configured = enabled && Boolean(key && host);
  useEffect(() => () => stopPortfolioAnalytics(), []);
  useEffect(() => {
    if (!configured || browserBlocksAnalytics() || hasStoredOptOut()) { stopPortfolioAnalytics(); return; }
    configurePortfolioAnalytics({key,host,environment});
    void startPortfolioAnalytics();
    trackPortfolioPage(pathname);
  },[configured,key,host,environment,pathname]);
  useEffect(() => {
    if (!configured || browserBlocksAnalytics() || hasStoredOptOut()) return;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    function clicked(event: MouseEvent) {
      if (event.button !== 0) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const action = classifyLink(anchor.href,location.href);
      if (action) trackPortfolioEvent(action.event,{...action.properties,source:anchor.closest(".journey-world-detail,.journey-landmarks") ? "world" : anchor.closest(".site-header") ? "header" : anchor.closest(".site-footer") ? "footer" : "content"});
    }
    function focused(event: FocusEvent) {
      if (event.target instanceof Element && event.target.closest("#contact-form")) trackPortfolioEvent("contact_started",{},"contact-started");
    }
    function depth() {
      scrollTimer = undefined;
      const total = document.documentElement.scrollHeight - innerHeight;
      if (total < 100) return;
      const reached = Math.min(100,Math.round(window.scrollY / total * 100));
      for (const value of [25,50,75,100]) if (reached >= value) trackPortfolioEvent("scroll_depth",{depth:value},`depth-${value}`);
    }
    function scrolled() { if (!scrollTimer) scrollTimer = setTimeout(depth,180); }
    const scenes = new IntersectionObserver(entries => {
      for (const item of entries) if (item.isIntersecting) {
        const sequence = item.target.closest<HTMLElement>("[data-analytics-sequence]");
        if (sequence) {
          const step = Number(sequence.dataset.stage ?? 0) + 1;
          trackPortfolioEvent("sequence_step_viewed",{sequence:sequence.dataset.analyticsSequence!,step},`sequence-${sequence.dataset.analyticsSequence}-${step}`);
        }
      }
    },{rootMargin:"-90px 0px -15% 0px"});
    document.querySelectorAll("[data-analytics-sequence] > .sequence-pin").forEach(scene => scenes.observe(scene));
    document.addEventListener("click",clicked);
    document.addEventListener("focusin",focused);
    window.addEventListener("scroll",scrolled,{passive:true});
    return () => { clearTimeout(scrollTimer); scenes.disconnect(); document.removeEventListener("click",clicked); document.removeEventListener("focusin",focused); window.removeEventListener("scroll",scrolled); };
  },[configured,pathname]);
  return null;
}
