"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type CursorMode = "default" | "link" | "world" | "portrait" | "art";
const pointerQuery = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

export function SiteCursor() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = root.current, halo = ring.current, label = caption.current;
    if (!element || !halo || !label) return;
    const media = window.matchMedia(pointerQuery);
    let shown = false, previousMode: CursorMode = "default";
    let point: { x: number; y: number } | null = null;
    let scrollFrame = 0;
    function hide() {
      if (!shown) return;
      shown = false; point = null;
      document.documentElement.classList.remove("has-art-cursor");
      element!.classList.remove("is-visible", "is-pressed");
    }
    function targetMode(target: Element | null) {
      if (target?.closest("input, textarea, select, [contenteditable='true'], iframe, [data-native-cursor]")) { hide(); return false; }
      const action = target?.closest("a, button:not(:disabled), summary, [role='button'], [data-cursor]");
      const hint = action?.getAttribute("data-cursor");
      const mode: CursorMode = hint === "world" || hint === "portrait" || hint === "art" ? hint : action ? "link" : "default";
      if (mode !== previousMode) {
        previousMode = mode; element!.dataset.mode = mode;
        label!.textContent = mode === "world" ? "EXPLORE" : mode === "art" || mode === "portrait" ? "MOVE" : "";
      }
      return true;
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType !== "mouse") { hide(); return; }
      if (!targetMode(event.target instanceof Element ? event.target : null)) return;
      point = { x: event.clientX, y: event.clientY };
      // Position is immediate. Only the halo's size/color transition; the browser
      // draws the precision dot natively even while the main thread is busy.
      halo!.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (!shown) { shown = true; element!.classList.add("is-visible"); document.documentElement.classList.add("has-art-cursor"); }
    }
    function scroll() {
      if (!shown || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (point) targetMode(document.elementFromPoint(point.x, point.y));
      });
    }
    function leave(event: PointerEvent) { if (!event.relatedTarget || event.relatedTarget instanceof HTMLIFrameElement) hide(); }
    function preference() { if (!media.matches) hide(); }
    function down() { if (shown) element!.classList.add("is-pressed"); }
    function up() { element!.classList.remove("is-pressed"); }
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("keydown", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", scroll, { passive: true });
    media.addEventListener("change", preference);
    return () => {
      hide(); cancelAnimationFrame(scrollFrame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("keydown", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", preference);
    };
  }, [pathname]);
  return <div ref={root} className="site-cursor" data-mode="default" aria-hidden="true">
    <div ref={ring} className="cursor-ring"><span className="cursor-ring-outline" /><span ref={caption} className="cursor-caption" /></div>
  </div>;
}
