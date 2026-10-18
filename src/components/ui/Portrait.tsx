"use client";

import { useReducedMotion } from "./useMotionPreference";

import Image from "next/image";
import { media } from "@/data/media";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

export function Portrait() {
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 140, damping: 25 });
  const y = useSpring(py, { stiffness: 140, damping: 25 });
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const sheen = useSpring(0, { stiffness: 140, damping: 25 });
  const sheenX = useTransform(x, [-.5,.5], [0,100]), sheenY = useTransform(y, [-.5,.5], [0,100]);
  const background = useMotionTemplate`radial-gradient(220px circle at ${sheenX}% ${sheenY}%, rgba(250,250,250,.18), transparent 75%)`;
  return (
    <motion.div className="portrait" data-cursor="portrait" style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }} onPointerMove={(event) => {
      if (reduced || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine) and (forced-colors: none)").matches) return;
      const rect = event.currentTarget.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width - 0.5);
      py.set((event.clientY - rect.top) / rect.height - 0.5);
      sheen.set(1);
    }} onPointerLeave={() => { px.set(0); py.set(0); sheen.set(0); }}>
      {failed ? <div className="portrait-fallback" role="img" aria-label="Kevin Song">KS</div> : <picture>
        <source type="image/avif" srcSet={`${media.portrait[320].avif} 320w, ${media.portrait[640].avif} 640w, ${media.portrait[960].avif} 960w`} sizes="(max-width: 639px) 112px, (max-width: 767px) 180px, (max-width: 1023px) 240px, 390px" />
        <source type="image/webp" srcSet={`${media.portrait[320].webp} 320w, ${media.portrait[640].webp} 640w, ${media.portrait[960].webp} 960w`} sizes="(max-width: 639px) 112px, (max-width: 767px) 180px, (max-width: 1023px) 240px, 390px" />
        <Image src={media.portraitJpeg} alt="Portrait of Kevin Song" fill loading="eager" fetchPriority="high" sizes="(max-width: 639px) 112px, (max-width: 767px) 180px, (max-width: 1023px) 240px, 390px" className="portrait-image" onError={() => setFailed(true)} />
      </picture>}
      <motion.div className="portrait-sheen" style={{ background, opacity: sheen }} aria-hidden="true" />
    </motion.div>
  );
}
