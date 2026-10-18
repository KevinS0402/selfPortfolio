"use client";

import { useEffect, useRef, type ReactNode } from "react";


const surfaces = ".liquid-glass, .exhibit-node-art";

/** One event-driven pointer clock per page; pointer movement never re-renders React. */
export function LivingSurface({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const contrast = window.matchMedia("(forced-colors: active)");
    let frame = 0;
    let point: { x: number; y: number; element: Element } | null = null;
    const active = new Set<HTMLElement>();
    const visible = new Set<Element>();
    const ambient = [...page.querySelectorAll(".contour-field, .liquid-glass, .music-score, .art-motif, .creative-orbit")];
    function refreshAmbient() {
      ambient.forEach(element => {
        const state = String(!document.hidden && !reduced.matches && !contrast.matches && visible.has(element));
        if (element.getAttribute("data-ambient-active") !== state) element.setAttribute("data-ambient-active", state);
      });
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
      refreshAmbient();
    });
    ambient.forEach(element => observer.observe(element));

    function clear() {
      active.forEach(element => {
        element.removeAttribute("data-pointer-active");
        ["--surface-x", "--surface-y", "--flow-x", "--flow-y", "--glass-angle"].forEach(name => element.style.removeProperty(name));
      });
      active.clear();
    }
    function update() {
      frame = 0;
      if (!point || reduced.matches || contrast.matches || !fine.matches || document.hidden) { clear(); return; }
      const next = new Set<HTMLElement>();
      const measurements: { element: HTMLElement; x: number; y: number }[] = [];
      let element: Element | null = point.element;
      while (element && element !== page) {
        if (element instanceof HTMLElement && element.matches(surfaces)) {
          const box = element.getBoundingClientRect();
          if (box.width && box.height) {
            next.add(element);
            measurements.push({ element, x: Math.max(0, Math.min(1, (point.x - box.left) / box.width)), y: Math.max(0, Math.min(1, (point.y - box.top) / box.height)) });
          }
        }
        element = element.parentElement;
      }
      active.forEach(previous => {
        if (!next.has(previous)) {
          previous.removeAttribute("data-pointer-active");
          ["--surface-x", "--surface-y", "--flow-x", "--flow-y", "--glass-angle"].forEach(name => previous.style.removeProperty(name));
          active.delete(previous);
        }
      });
      measurements.forEach(({ element, x, y }) => {
        element.style.setProperty("--surface-x", `${(x * 100).toFixed(2)}%`);
        element.style.setProperty("--surface-y", `${(y * 100).toFixed(2)}%`);
        element.style.setProperty("--flow-x", `${((x - .5) * 22).toFixed(2)}px`);
        element.style.setProperty("--flow-y", `${((y - .5) * 16).toFixed(2)}px`);
        element.style.setProperty("--glass-angle", `${(Math.atan2(y - .5, x - .5) * 180 / Math.PI + 90).toFixed(2)}deg`);
        element.dataset.pointerActive = "true";
        active.add(element);
      });
      const scene = point.element.closest(".pointer-surface, .sequence-pin");
      scene?.querySelectorAll(".contour-field").forEach(svg => {
        svg.dispatchEvent(new CustomEvent("portfolio-pointer-ripple", { detail: { clientX: point!.x, clientY: point!.y } }));
      });
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
      point = { x: event.clientX, y: event.clientY, element: event.target };
      if (!frame) frame = requestAnimationFrame(update);
    }
    function leave() { point = null; cancelAnimationFrame(frame); frame = 0; clear(); }
    function preference() { leave(); refreshAmbient(); }
    page.addEventListener("pointermove", move, { passive: true });
    page.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", preference);
    reduced.addEventListener("change", preference);
    fine.addEventListener("change", preference);
    contrast.addEventListener("change", preference);
    return () => {
      leave(); observer.disconnect();
      page.removeEventListener("pointermove", move);
      page.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", preference);
      reduced.removeEventListener("change", preference);
      fine.removeEventListener("change", preference);
      contrast.removeEventListener("change", preference);
    };
  }, []);

  return <div ref={root} className="page-journey living-page">
    {children}
  </div>;
}
