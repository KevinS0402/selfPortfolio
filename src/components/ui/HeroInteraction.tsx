"use client";

import { useReducedMotion } from "./useMotionPreference";

import { motion, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

function allowsPointer(pointerType: string) {
  return pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine) and (forced-colors: none)").matches;
}

export function HeroInteraction({ children }: { children: ReactNode }) {
  return <PointerSurface id="top" className="home-hero interactive-hero">{children}</PointerSurface>;
}

export function PointerSurface({ children, className, id }: { children: ReactNode; className: string; id?: string }) {
  const reduced = useReducedMotion();
  const light = useRef<HTMLDivElement>(null);
  return <section id={id} className={`${className} pointer-surface`} onPointerMove={event => {
    if (reduced || !allowsPointer(event.pointerType) || !light.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    light.current.style.transform = `translate3d(${event.clientX - bounds.left - 420}px,${event.clientY - bounds.top - 420}px,0)`;
    light.current.style.opacity = "1";
  }} onPointerLeave={() => { if (light.current) light.current.style.opacity = "0"; }}>
    <div ref={light} className="hero-pointer-light" aria-hidden="true" />
    {children}
  </section>;
}

export function TiltVisual({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 120, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 24 });
  const x = useSpring(0, { stiffness: 120, damping: 24 });
  return <motion.div className={`tilt-visual ${className}`} data-cursor="art" style={reduced ? undefined : { rotateX, rotateY, x, transformPerspective: 1000 }} onPointerMove={event => {
    if (reduced || !allowsPointer(event.pointerType)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
    const vertical = (event.clientY - bounds.top) / bounds.height - .5;
    rotateX.set(vertical * -10); rotateY.set(horizontal * 10); x.set(horizontal * 10);
  }} onPointerLeave={() => { rotateX.set(0); rotateY.set(0); x.set(0); }}>{children}</motion.div>;
}

export function MagneticLink({ children, href, className }: { children: ReactNode; href: string; className: string }) {
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 240, damping: 22 });
  const y = useSpring(0, { stiffness: 240, damping: 22 });
  return <motion.a href={href} className={`${className} magnetic-link`} style={reduced ? undefined : { x, y }} onPointerMove={event => {
    if (reduced || !allowsPointer(event.pointerType)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - bounds.left) / bounds.width - .5) * 16);
    y.set(((event.clientY - bounds.top) / bounds.height - .5) * 12);
  }} onPointerLeave={() => { x.set(0); y.set(0); }} onBlur={() => { x.set(0); y.set(0); }}>
    {children}
  </motion.a>;
}
