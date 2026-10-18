"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One scroll clock per scene. Only chapter changes trigger React renders. */
export function useJourney(count = 1) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const manual = useRef<{ stage: number; scroll: number; kind: "preview" | "select" } | null>(null);
  const automatic = useRef(0);
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
      root.dataset.enhanced = "true";
      const pin = root.querySelector<HTMLElement>(":scope > .sequence-pin");
      const content = pin?.querySelector<HTMLElement>(".world-sequence-inner") ?? pin;
      const fits = Boolean(content && flowHeight(content) <= window.innerHeight - 88 + 3);
      if (root.dataset.pinFits !== String(fits)) root.dataset.pinFits = String(fits);
      // A sticky element's offsetTop changes while pinned. Measure its normal-flow
      // predecessor instead so scroll progress cannot cancel itself out.
      const lead = pin?.previousElementSibling;
      const offset = lead instanceof HTMLElement
        ? lead.offsetTop + lead.offsetHeight + (parseFloat(getComputedStyle(lead).marginBottom) || 0)
        : 0;
      root.style.setProperty("--journey-stages", String(count));
      root.style.setProperty("--journey-lead", `${offset}px`);
      const rect = root.getBoundingClientRect();
      const pinned = desktop.matches && !reduce.matches && fits;
      isPinned.current = pinned;
      const travel = pinned
        ? clamp((88 - rect.top - offset) / Math.max(1, rect.height - offset - window.innerHeight + 88))
        : clamp((window.innerHeight * .9 - rect.top) / Math.max(1, rect.height * .8));
      root.dataset.enhanced = "true";
      root.dataset.reduced = String(reduce.matches);
      root.style.setProperty("--travel", String(reduce.matches ? 1 : travel));
      const next = Math.min(count - 1, Math.floor(travel * count));
      automatic.current = next;
      if (manual.current && scrollIntent.current && Math.abs(window.scrollY - manual.current.scroll) > 64) manual.current = null;
      if (pinned && count > 1) setStage(manual.current?.stage ?? next);
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
    const sizeObserver = new ResizeObserver(schedule);
    const pin = root.querySelector(":scope > .sequence-pin");
    if (pin) {
      sizeObserver.observe(pin);
      const content = pin.querySelector(".world-sequence-inner") ?? pin;
      [...content.children].forEach(child => { if (child instanceof HTMLElement) sizeObserver.observe(child); });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("wheel", scrolling, { passive: true });
    window.addEventListener("touchmove", scrolling, { passive: true });
    window.addEventListener("keydown", keyboard);
    window.addEventListener("pointerdown", scrollbar, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    reduce.addEventListener("change", schedule);
    desktop.addEventListener("change", schedule);
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
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      reduce.removeEventListener("change", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, [count]);

  function select(index: number) {
    scrollIntent.current = false;
    manual.current = { stage: index, scroll: window.scrollY, kind: "select" };
    setStage(index);
  }
  function preview(index: number | null) {
    // Keep the last preview while the pointer travels toward its destination links.
    // Scrolling resumes automatic discovery after the normal movement threshold.
    if(index === null || performance.now() - lastScrollIntent.current < 220) return;
    scrollIntent.current = false;
    manual.current = {stage:index,scroll:window.scrollY,kind:"preview"};
    setStage(index);
  }
  function release() {
    manual.current = null;
    if (isPinned.current) setStage(automatic.current);
  }
  return { ref, stage, select, preview, release };
}
