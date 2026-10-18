"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Native lazy frames can load several screens ahead. Wait until the post is near. */
export function DeferredLinkedInEmbed({ src, title, height }: { src: string; title: string; height: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setActive(true), { timeout: 600 });
      else timer = setTimeout(() => setActive(true), 0);
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);
  return <div ref={root} className="linkedin-embed-slot" style={{"--embed-height": `${height}px`} as CSSProperties}>
    {active && <iframe src={src} height={height} width="504" title={title} referrerPolicy="strict-origin-when-cross-origin" />}
  </div>;
}
