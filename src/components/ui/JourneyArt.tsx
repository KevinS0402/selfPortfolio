"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArtMotif } from "./ArtMotif";

export function JourneyArt() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const length = useTransform(scrollYProgress, [0, 0.7], [0.45, 1]);
  return <div className="journey-art" aria-hidden="true" ref={ref}>
    <svg className="journey-thread" viewBox="0 0 1440 620" fill="none" preserveAspectRatio="none"><motion.path d="M-30 500C30 465 92 450 72 480S46 548 123 543H370C512 543 506 410 636 391S939 274 965 204C1005 94 1226 85 1248 254S1370 451 1280 548C1210 627 1169 501 1070 515S994 604 859 538 761 489 704 519 665 546 586 542" style={{ pathLength: reduced ? 1 : length }} /><path d="M80 547H172l18-18h89M104 559h70l20-17h100M127 571h65l17-18h95" /><g className="portrait-orbits"><ellipse cx="1160" cy="290" rx="197" ry="231" transform="rotate(-24 1160 290)" /><ellipse cx="1160" cy="290" rx="212" ry="218" transform="rotate(-24 1160 290)" /><ellipse cx="1160" cy="290" rx="229" ry="205" transform="rotate(-24 1160 290)" /></g><circle cx="636" cy="391" r="4" className="art-solid" /><circle cx="704" cy="519" r="4" className="art-solid" /><circle cx="1280" cy="548" r="4" className="art-solid" /></svg>
    <div className="hero-world hero-world-engineering"><ArtMotif world="engineering" /><span>software</span></div>
    <div className="hero-world hero-world-impact"><ArtMotif world="impact" /><span>community</span></div>
    <div className="hero-world hero-world-about"><ArtMotif world="about" /><span>music</span></div>
  </div>;
}
