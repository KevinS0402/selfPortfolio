"use client";

import { useReducedMotion } from "./useMotionPreference";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "rise" | "left" | "right" | "unfold" | "turn";
  eager?: boolean;
  stagger?: boolean;
  as?: "div" | "header";
};

/** One observation per reading group; entrances only animate opacity and transform. */
export function Reveal({ children, className = "", delay = 0, variant = "rise", eager = false, stagger = false, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: .16, margin: "0px 0px -12% 0px" });
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const wait = Math.max(0, Math.min(delay, .3));
  return <Tag ref={ref} className={`reveal reveal-${variant} ${stagger ? "reveal-sequence" : ""} ${eager ? "reveal-eager" : ""} ${ready && !reduced && !eager ? "is-ready" : ""} ${visible || reduced || eager ? "is-revealed" : ""} ${className}`} style={{animationDelay:`${wait}s`,"--reveal-delay":`${wait}s`} as CSSProperties}>{children}</Tag>;
}
