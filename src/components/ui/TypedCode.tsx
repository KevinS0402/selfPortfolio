"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { CSSProperties } from "react";

export function TypedCode() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: .5 });
  const reduced = useReducedMotion();
  const lines = ['const focus = [', '  "software", "AI", "product"', '];'];
  return <div ref={ref} className={`typed-code ${inView && !reduced ? "is-typing" : ""}`} aria-hidden="true">
    <span className="code-caption">kevin.ts</span>
    <pre>{lines.map((line, i) => <span key={line} className="code-line" style={{ "--line-length": `${line.length}ch`, "--line-delay": `${i * .65}s` } as CSSProperties}>{line}</span>)}</pre>
  </div>;
}
