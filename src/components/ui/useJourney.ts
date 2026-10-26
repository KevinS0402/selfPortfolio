"use client";

import { trackPortfolioEvent } from "@/lib/portfolioAnalytics";
import { useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One scroll clock per scene. Only chapter changes trigger React renders. */
export function useJourney(count = 1) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const manual = useRef<{ stage: number; scroll: number; kind: "preview" | "select" } | null>(null);
  const automatic = useRef(0);
  const activeStage = useRef(0);
  const isPinned = useRef(false);
  const scrollIntent = useRef(false);
  const lastScrollIntent = useRef(-Infinity);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 640px) and (min-height: 650px)");
    let frame = 0;
    let nearby = true;
    let geometryDirty = true;
    let fits = false;
    let offset = 0;
    let previousTravel = "";
    let fitWidth = -1, fitHeight = -1;
    const progress = root.querySelector<HTMLElement>(".sequence-track span");
    const fields = [...root.querySelectorAll<HTMLElement>(".contour-field")];
    const wires = [...root.querySelectorAll<SVGPathElement>(".wire-lit")];
    const score = [...root.querySelectorAll<SVGPathElement>(".music-score svg path")];
    const pin = root.querySelector<HTMLElement>(":scope > .sequence-pin");
    const content = pin?.querySelector<HTMLElement>(".world-sequence-inner") ?? pin;
    root.dataset.enhanced = "true";
    root.style.setProperty("--journey-stages", String(count));
    function flowHeight(content: HTMLElement) {
      const style = getComputedStyle(content);
      const children = [...content.children].filter((child): child is HTMLElement => {
        if (!(child instanceof HTMLElement) || child.classList.contains("sr-only")) return false;
        const css = getComputedStyle(child);
        return css.display !== "none" && css.position !== "absolute" && css.position !== "fixed";
      });
      // offsetHeight measures the layout box, excluding overflowing decorative SVGs.
      const boxes = children.reduce((height, child) => {
        const css = getComputedStyle(child);
        return height + child.offsetHeight + (parseFloat(css.marginTop) || 0) + (parseFloat(css.marginBottom) || 0);
      }, 0);
      return boxes + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
        + (parseFloat(style.rowGap) || 0) * Math.max(0, children.length - 1);
    }
    function update() {
      frame = 0;
      if (!root || !nearby) return;
      // Layout is stable between resizes and chapter changes. Scroll reads one box;
      // it never walks the subtree or forces style/layout after writing to it.
      if (geometryDirty) {
        geometryDirty = false;
        // Pin eligibility is a viewport decision. Changing chapters must never
        // collapse the scroll runway while someone is travelling through it.
        if (fitWidth !== window.innerWidth || fitHeight !== window.innerHeight) {
          fits = Boolean(content && flowHeight(content) <= window.innerHeight - 88 + 3);
          fitWidth = window.innerWidth; fitHeight = window.innerHeight;
        }
        const lead = pin?.previousElementSibling;
        offset = lead instanceof HTMLElement
          ? lead.offsetTop + lead.offsetHeight + (parseFloat(getComputedStyle(lead).marginBottom) || 0) : 0;
        root.dataset.pinFits = String(fits);
        root.dataset.reduced = String(reduce.matches);
        root.style.setProperty("--journey-lead", `${offset}px`);
      }
      const rect = root.getBoundingClientRect();
      const pinned = desktop.matches && !reduce.matches && fits;
      isPinned.current = pinned;
      const travel = pinned
        ? clamp((88 - rect.top - offset) / Math.max(1, rect.height - offset - window.innerHeight + 88 - Math.max(96, Math.min(180, window.innerHeight * .18))))
        : clamp((window.innerHeight * .9 - rect.top) / Math.max(1, rect.height * .8));
      const nextTravel = (reduce.matches ? 1 : travel).toFixed(4);
      if (nextTravel !== previousTravel) {
        // Do not invalidate inherited styles for an entire sticky subtree per scroll.
        // Scope progress to the few decorative layers that actually consume it.
        if (progress) progress.style.transform = `scaleX(${nextTravel})`;
        fields.forEach(field => field.style.setProperty("--travel", nextTravel));
        wires.forEach(wire => { wire.style.strokeDashoffset = String(1 - Number(nextTravel)); });
        score.forEach(path => { path.style.strokeDashoffset = String(160 - Number(nextTravel) * 160); });
        previousTravel = nextTravel;
      }
      const next = Math.min(count - 1, Math.floor(travel * count));
      automatic.current = next;
      if (manual.current && scrollIntent.current && Math.abs(window.scrollY - manual.current.scroll) > 64) manual.current = null;
      const selected = manual.current?.stage ?? next;
      if (pinned && count > 1 && selected !== activeStage.current) { activeStage.current = selected; setStage(selected); }
    }
    function schedule() {
      if (nearby && !frame) frame = requestAnimationFrame(update);
    }
    function scrolling() { scrollIntent.current = true; lastScrollIntent.current = performance.now(); }
    function keyboard(event: KeyboardEvent) {
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest("input,textarea,select,[contenteditable]"))) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) scrolling();
    }
    function scrollbar(event: PointerEvent) { if (event.clientX >= document.documentElement.clientWidth) scrolling(); }
    const observer = new IntersectionObserver(entries => {
      nearby = entries[0]?.isIntersecting ?? false;
      if (nearby) schedule();
    }, { rootMargin: "400px" });
    observer.observe(root);
    function invalidate() { geometryDirty = true; schedule(); }
    const sizeObserver = new ResizeObserver(invalidate);
    if (pin) {
      sizeObserver.observe(pin);
      if (pin.previousElementSibling) sizeObserver.observe(pin.previousElementSibling);
      const content = pin.querySelector(".world-sequence-inner") ?? pin;
      [...content.children].forEach(child => { if (child instanceof HTMLElement) sizeObserver.observe(child); });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("wheel", scrolling, { passive: true });
    window.addEventListener("touchmove", scrolling, { passive: true });
    window.addEventListener("keydown", keyboard);
    window.addEventListener("pointerdown", scrollbar, { passive: true });
    window.addEventListener("resize", invalidate);
    window.addEventListener("pageshow", schedule);
    reduce.addEventListener("change", invalidate);
    desktop.addEventListener("change", invalidate);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("wheel", scrolling);
      window.removeEventListener("touchmove", scrolling);
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("pointerdown", scrollbar);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("pageshow", schedule);
      reduce.removeEventListener("change", invalidate);
      desktop.removeEventListener("change", invalidate);
    };
  }, [count]);

  useEffect(() => {
    const root = ref.current;
    const name = root?.dataset.analyticsSequence;
    if (!root || !name) return;
    const bounds = root.getBoundingClientRect();
    if (bounds.bottom > 90 && bounds.top < innerHeight) trackPortfolioEvent("sequence_step_viewed",{sequence:name,step:stage+1},`sequence-${name}-${stage+1}`);
  }, [stage]);

  function select(index: number) {
    scrollIntent.current = false;
    manual.current = { stage: index, scroll: window.scrollY, kind: "select" };
    activeStage.current = index;
    setStage(index);
  }
  function preview(index: number | null) {
    // Keep the last preview while the pointer travels toward its destination links.
    // Scrolling resumes automatic discovery after the normal movement threshold.
    if(index === null || performance.now() - lastScrollIntent.current < 80) return;
    scrollIntent.current = false;
    manual.current = {stage:index,scroll:window.scrollY,kind:"preview"};
    activeStage.current = index;
    setStage(index);
  }
  function release() {
    manual.current = null;
    if (isPinned.current) { activeStage.current = automatic.current; setStage(automatic.current); }
  }
  return { ref, stage, select, preview, release };
}
