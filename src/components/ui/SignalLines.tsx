"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function SignalLines({ variant = "curve" }: { variant?: "curve" | "orbit" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0, 0.5], [0.35, 1]);
  return (
    <div ref={ref} className={`signal-lines signal-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 800 600" fill="none" preserveAspectRatio="xMidYMid slice">
        <path className="signal-quiet" d="M540 0v600M0 440h800" />
        <motion.path className="signal-gold" d={variant === "orbit" ? "M800 140C440 100 250 600 540 600S800 300 540 300 220 20 0 140" : "M0 560C420 560 420 220 800 200"} style={{ pathLength: reduced ? 1 : pathLength }} />
        <path className="signal-gold" d="M529 440h22M540 429v22" />
      </svg>
    </div>
  );
}
