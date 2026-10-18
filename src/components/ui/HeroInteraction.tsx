"use client";

import { useReducedMotion } from "./useMotionPreference";

import { motion, useMotionTemplate, useMotionValue, useSpring, type MotionStyle } from "framer-motion";
import type { ReactNode } from "react";

function allowsPointer(pointerType: string) {
  return pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine) and (forced-colors: none)").matches;
}

export function HeroInteraction({ children }: { children: ReactNode }) {
  return <PointerSurface id="top" className="home-hero interactive-hero">{children}</PointerSurface>;
}

export function PointerSurface({ children, className, id }: { children: ReactNode; className: string; id?: string }) {
  const reduced = useReducedMotion();
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0);
  const driftX = useSpring(0, { stiffness: 100, damping: 24 });
  const driftY = useSpring(0, { stiffness: 100, damping: 24 });
  const light = useSpring(0, { stiffness: 120, damping: 24 });
  const dx = useMotionTemplate`${driftX}px`, dy = useMotionTemplate`${driftY}px`;
  const background = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(214,180,94,.09), transparent 75%)`;
  return <motion.section id={id} className={`${className} pointer-surface`} style={reduced ? undefined : { "--hero-x": dx, "--hero-y": dy } as MotionStyle} onPointerMove={event => {
    if (reduced || !allowsPointer(event.pointerType)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left); mouseY.set(event.clientY - bounds.top);
    driftX.set(((event.clientX - bounds.left) / bounds.width - .5) * 28);
    driftY.set(((event.clientY - bounds.top) / bounds.height - .5) * 20);
    light.set(1);
  }} onPointerLeave={() => { driftX.set(0); driftY.set(0); light.set(0); }}>
    <motion.div className="hero-pointer-light" style={{ background, opacity: light }} aria-hidden="true" />
    {children}
  </motion.section>;
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
