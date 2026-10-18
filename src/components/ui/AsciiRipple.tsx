"use client";

import { useEffect, useMemo, useRef } from "react";
import { contourGlyphs, type ContourVariant } from "./contourGeometry";

const glyphs = ".:+*", scrambled = ".:+*#01/=\\";
const ambientGlyph = (seed: number, phase: number) => glyphs[Math.floor((Math.sin(seed * .43 + phase) + 1) * 1.99)];
const pixels = Array.from({ length: 169 }, (_, index) => ({ x: (index % 13 - 6) * 14, y: (Math.floor(index / 13) - 6) * 14 }));
const lifetime = 1250;

/** SVG text stays server-rendered. Only the decorative glyphs and pixels mutate. */
export function AsciiRipple({ variant = "terrain" }: { variant?: ContourVariant }) {
  const points = useMemo(() => contourGlyphs(variant), [variant]);
  const root = useRef<SVGGElement>(null);
  useEffect(() => {
    const group = root.current;
    const svg = group?.ownerSVGElement;
    if (!group || !svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const texts = [...group.querySelectorAll<SVGTextElement>(".contour-ascii text")];
    const holder = group.querySelector<SVGGElement>(".dither-ripples")!;
    const pools: { element: SVGGElement; cells: SVGRectElement[] }[] = [];
    function ensurePools() {
      if (pools.length) return;
      for (let slot = 0; slot < 3; slot++) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", "g");
        element.setAttribute("class", "dither-ripple"); element.setAttribute("opacity", "0");
        const cells = pixels.map(pixel => {
          const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          Object.entries({ x: pixel.x, y: pixel.y, width: 2, height: 2, opacity: 0 }).forEach(([name, value]) => cell.setAttribute(name, String(value)));
          element.append(cell); return cell;
        });
        holder.append(element); pools.push({ element, cells });
      }
    }
    let waves: { x: number; y: number; born: number; slot: number }[] = [];
    let nextSlot = 0, frame = 0, painted = 0;
    let last: { x: number; y: number; time: number } | null = null;

    function reset() {
      cancelAnimationFrame(frame); frame = 0; waves = []; last = null;
      group!.removeAttribute("data-rippling");
      texts.forEach((text, index) => { text.textContent = ambientGlyph(points[index].seed, 0); text.setAttribute("opacity", String(points[index].opacity)); });
      pools.forEach(pool => pool.element.setAttribute("opacity", "0"));
    }
    function draw(now: number) {
      frame = 0;
      if (reduced.matches || document.hidden || svg!.getAttribute("data-ambient-active") !== "true") { reset(); return; }
      if (now - painted < (waves.length ? 70 : 260)) { frame = requestAnimationFrame(draw); return; }
      painted = now;
      waves = waves.filter(wave => now - wave.born < lifetime);
      if (!waves.length) group!.removeAttribute("data-rippling");
      const ages = waves.map(wave => ({ ...wave, age: (now - wave.born) / lifetime }));
      const intensity = (x: number, y: number) => ages.reduce((strength, wave) => {
        const distance = Math.hypot(x - wave.x, y - wave.y);
        const ring = Math.exp(-Math.pow((distance - wave.age * 140) / 22, 2));
        return Math.max(strength, ring * (1 - wave.age));
      }, 0);
      texts.forEach((text, index) => {
        const point = points[index];
        const strength = intensity(point.x, point.y);
        const letter = strength > .14
          ? scrambled[(point.seed * 17 + Math.floor(now / 85)) % scrambled.length]
          : ambientGlyph(point.seed, now * .00065);
        if (text.textContent !== letter) text.textContent = letter;
        const breath = .65 + .35 * Math.sin(now * .0005 + point.seed);
        text.setAttribute("opacity", (point.opacity * breath + strength * .65).toFixed(3));
      });
      pools.forEach((pool, slot) => {
        const wave = ages.find(item => item.slot === slot);
        if (!wave) { pool.element.setAttribute("opacity", "0"); return; }
        pool.element.setAttribute("opacity", "1");
        pool.element.setAttribute("transform", `translate(${wave.x.toFixed(2)} ${wave.y.toFixed(2)})`);
        pool.cells.forEach((cell, index) => {
          const pixel = pixels[index];
          const strength = Math.exp(-Math.pow((Math.hypot(pixel.x, pixel.y) - wave.age * 140) / 17, 2)) * (1 - wave.age);
          // Quantized dot-to-square transitions keep the ripple distinctly dithered.
          const shade = Math.floor(strength * 4) / 4;
          cell.setAttribute("opacity", String(shade * .7));
          const size = shade > .5 ? 4 : 2;
          cell.setAttribute("width", String(size)); cell.setAttribute("height", String(size));
        });
      });
      frame = requestAnimationFrame(draw);
    }
    function ripple(event: Event) {
      if (reduced.matches || document.hidden || svg!.getAttribute("data-ambient-active") !== "true") return;
      const { clientX, clientY } = (event as CustomEvent<{ clientX: number; clientY: number }>).detail;
      const matrix = group!.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
      const now = performance.now();
      if (last && (now - last.time < 90 || Math.hypot(point.x - last.x, point.y - last.y) < 9)) return;
      ensurePools();
      last = { x: point.x, y: point.y, time: now };
      waves = waves.filter(wave => wave.slot !== nextSlot);
      waves.push({ x: point.x, y: point.y, born: now, slot: nextSlot });
      nextSlot = (nextSlot + 1) % pools.length;
      group!.dataset.rippling = "true";
      if (!frame) frame = requestAnimationFrame(draw);
    }
    svg.addEventListener("portfolio-pointer-ripple", ripple);
    const visibility = new MutationObserver(() => {
      if (svg.getAttribute("data-ambient-active") === "true" && !reduced.matches && !document.hidden) {
        if (!frame) frame = requestAnimationFrame(draw);
      } else reset();
    });
    visibility.observe(svg, { attributes: true, attributeFilter: ["data-ambient-active"] });
    if (svg.getAttribute("data-ambient-active") === "true" && !reduced.matches) frame = requestAnimationFrame(draw);
    reduced.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset(); holder.replaceChildren(); visibility.disconnect(); svg.removeEventListener("portfolio-pointer-ripple", ripple);
      reduced.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [points]);

  return <g ref={root} className="ascii-ripple">
    <g className="contour-ascii">{[0,1,2].map(band => <g key={band} className={`contour-band contour-band-${band}`}>{points.filter(point => point.band === band).map(point => <text key={point.seed} x={point.x} y={point.y} fontSize={point.size} opacity={point.opacity}>{ambientGlyph(point.seed, 0)}</text>)}</g>)}</g>
    <g className="dither-ripples" />
  </g>;
}
