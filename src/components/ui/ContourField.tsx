"use client";

import { useEffect, useRef } from "react";
import { createContourRenderer, type ContourMessage, type ContourFade } from "./contourRenderer";
import { pointerInQuad } from "./contourCoordinates";
import type { ContourVariant } from "./contourGeometry";

let worker: Worker | undefined;
let nextId = 0;
const clients = new Map<number, () => void>();

export function ContourField({ variant = "terrain", className = "" }: { variant?: ContourVariant; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const id = ++nextId;
    const fade: ContourFade = element.closest(".journey-chapter-hero") ? "horizontal"
      : element.matches(".hero-contours,.linkedin-atmosphere,.contact-contours") || element.closest(".exhibit-canvas,.music-sequence") ? "vertical" : "radial";
    const corners = [...element.querySelectorAll<HTMLElement>("[data-contour-corner]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    let canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true"); element.append(canvas);
    let fallback: ReturnType<typeof createContourRenderer> | undefined;
    let transferred = false, disposed = false, frame = 0, previous = 0;
    let visible = false;
    function animate(now: number) {
      frame = 0;
      if (!fallback?.running || disposed) return;
      if (now - previous >= (fallback.interactive ? 16 : 100)) { previous = now; fallback.tick(now); }
      frame = requestAnimationFrame(animate);
    }
    function send(message: ContourMessage) {
      if (disposed) return;
      if (transferred) worker?.postMessage(message);
      else if (fallback) {
        if (message.type === "resize") fallback.resize(message.width, message.height, message.ratio);
        else if (message.type === "active") { fallback.setActive(message.active, message.reduced); if (fallback.running && !frame) frame = requestAnimationFrame(animate); }
        else if (message.type === "pointer") fallback.pointer(message.x, message.y, performance.now());
      }
    }
    function resize() {
      const width = element!.clientWidth, height = element!.clientHeight;
      if (width && height) send({ type: "resize", id, width, height, ratio: Math.min(window.devicePixelRatio, 1.5) });
    }
    function visibility() { send({ type: "active", id, active: visible && !document.hidden && !forced.matches, reduced: reduced.matches }); }
    function mainThreadFallback() {
      if (disposed || fallback) return;
      if (transferred) {
        canvas.remove(); canvas = document.createElement("canvas"); canvas.setAttribute("aria-hidden", "true"); element!.append(canvas);
      }
      transferred = false;
      fallback = createContourRenderer(canvas, variant, fade);
      element!.dataset.renderer = "canvas";
      resize(); visibility();
    }
    try {
      if (typeof Worker === "undefined" || !canvas.transferControlToOffscreen) mainThreadFallback();
      else {
        if (!worker) {
          worker = new Worker(new URL("./contour.worker.ts", import.meta.url));
          worker.onerror = () => {
            worker?.terminate(); worker = undefined;
            clients.forEach(recover => recover());
          };
        }
        clients.set(id, mainThreadFallback);
        const surface = canvas.transferControlToOffscreen(); transferred = true;
        worker.postMessage({ type: "init", id, canvas: surface, variant, fade } satisfies ContourMessage, [surface]);
        element.dataset.renderer = "worker";
      }
    } catch { mainThreadFallback(); }
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; visibility(); });
    observer.observe(element);
    const size = new ResizeObserver(resize); size.observe(element);
    function pointer(event: Event) {
      if (reduced.matches || !visible) return;
      const { clientX, clientY } = (event as CustomEvent<{clientX: number; clientY: number}>).detail;
      const position = pointerInQuad({ x: clientX, y: clientY }, corners.map(corner => {
        const bounds = corner.getBoundingClientRect();
        return { x: bounds.left, y: bounds.top };
      }));
      // Ignore input outside the actual plane instead of producing a detached wave.
      if (!position || position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) return;
      send({ type: "pointer", id, ...position });
    }
    element.addEventListener("portfolio-pointer-ripple", pointer);
    reduced.addEventListener("change", visibility); forced.addEventListener("change", visibility);
    document.addEventListener("visibilitychange", visibility);
    resize();
    return () => {
      send({ type: "dispose", id }); disposed = true;
      fallback?.dispose(); cancelAnimationFrame(frame); observer.disconnect(); size.disconnect(); canvas.remove();
      clients.delete(id);
      if (!clients.size) { worker?.terminate(); worker = undefined; }
      element.removeEventListener("portfolio-pointer-ripple", pointer);
      reduced.removeEventListener("change", visibility); forced.removeEventListener("change", visibility);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [variant]);
  return <div ref={root} className={`contour-field contour-${variant} ${className}`} aria-hidden="true" style={{maskImage:"none"}}>
    {[[0,0],[100,0],[100,100],[0,100]].map(([x,y], index) => <span key={index} data-contour-corner style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:0,height:0}} />)}
  </div>;
}
