"use client";


import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "link" | "world" | "portrait" | "art";
const pointerQuery = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

export function SiteCursor() {
  const pathname = usePathname();
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 460, damping: 32, mass: .45 });
  const ringY = useSpring(y, { stiffness: 460, damping: 32, mass: .45 });
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(pointerQuery);
    let previousTarget: EventTarget | null = null;
    let previousMode: CursorMode = "default";
    function hide() {
      shown.current = false;
      document.documentElement.classList.remove("has-art-cursor");
      setVisible(false);
      setPressed(false);
      previousTarget = null;
      previousMode = "default";
      setMode("default");
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType !== "mouse") { hide(); return; }
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], iframe, [data-native-cursor]")) { hide(); return; }
      if (!shown.current) {
        x.jump(event.clientX); y.jump(event.clientY);
        ringX.jump(event.clientX); ringY.jump(event.clientY);
        shown.current = true;
        document.documentElement.classList.add("has-art-cursor");
        setVisible(true);
      }
      x.set(event.clientX); y.set(event.clientY);
      if (event.target !== previousTarget) {
        previousTarget = event.target;
        const action = target?.closest("a, button:not(:disabled), summary, [role='button'], [data-cursor]");
        const hint = action?.getAttribute("data-cursor");
        const nextMode: CursorMode = hint === "world" || hint === "portrait" || hint === "art" ? hint : action ? "link" : "default";
        if (nextMode !== previousMode) { previousMode = nextMode; setMode(nextMode); }
      }
    }
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget || event.relatedTarget instanceof HTMLIFrameElement) hide();
    };
    const capabilityChange = () => { if (!media.matches) hide(); };
    const down = () => { if (shown.current) setPressed(true); };
    const up = () => setPressed(false);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("keydown", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
    media.addEventListener("change", capabilityChange);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("keydown", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
      media.removeEventListener("change", capabilityChange);
    };
  }, [pathname, x, y, ringX, ringY]);

  return <div className={`site-cursor ${visible ? "is-visible" : ""} ${pressed ? "is-pressed" : ""}`} data-mode={mode} aria-hidden="true">
    <motion.div className="cursor-point" style={{ x, y }} />
    <motion.div className="cursor-ring" style={{ x: ringX, y: ringY }}><span className="cursor-ring-outline" /><span className="cursor-caption">{mode === "world" ? "EXPLORE" : mode === "portrait" || mode === "art" ? "MOVE" : ""}</span></motion.div>
  </div>;
}
