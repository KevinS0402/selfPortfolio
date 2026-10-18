import { contourGlyphs, contourY, type ContourVariant } from "./contourGeometry";

type Surface = HTMLCanvasElement | OffscreenCanvas;
type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type ContourFade = "radial" | "vertical" | "horizontal";
export type ContourMessage =
  | { type: "init"; id: number; canvas: OffscreenCanvas; variant: ContourVariant; fade?: ContourFade }
  | { type: "resize"; id: number; width: number; height: number; ratio: number }
  | { type: "active"; id: number; active: boolean; reduced: boolean }
  | { type: "pointer"; id: number; x: number; y: number }
  | { type: "dispose"; id: number };

const letters = ".:+*", scrambled = ".:+*#01/=\\";
const fade = (x: number, y: number) => Math.max(0, 1 - Math.hypot((x - 600) / 650, (y - 320) / 370));

/** Cached terrain plus a small glyph pass. No DOM nodes, SVG masks, or layout reads. */
export function createContourRenderer(canvas: Surface, variant: ContourVariant, edgeFade: ContourFade = "radial") {
  const context = canvas.getContext("2d") as Context | null;
  if (!context) throw new Error("Canvas unavailable");
  const base: Surface = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(1, 1) : document.createElement("canvas");
  const background = base.getContext("2d") as Context;
  const points = contourGlyphs(variant).map(point => ({ ...point, fade: fade(point.x, point.y) }));
  let width = 1, height = 1, scale = 1, offsetX = 0, offsetY = 0;
  let active = false, reduced = false, lastPointer = -Infinity;
  let waves: { x: number; y: number; born: number }[] = [];
  function resize(cssWidth: number, cssHeight: number, ratio: number) {
    // Cap allocation independently of device pixel ratio and display size.
    const density = Math.min(ratio, 1.5, Math.sqrt(850_000 / Math.max(1, cssWidth * cssHeight)));
    width = canvas.width = base.width = Math.max(1, Math.round(cssWidth * density));
    height = canvas.height = base.height = Math.max(1, Math.round(cssHeight * density));
    scale = Math.max(width / 1200, height / 640);
    offsetX = (width - 1200 * scale) / 2; offsetY = (height - 640 * scale) / 2;
    background.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    background.clearRect(-offsetX / scale, -offsetY / scale, width / scale, height / scale);
    background.fillStyle = "#d6b45e";
    // Rasterize the softly faded dot texture once, rather than moving two SVG masks.
    for (let y = 0; y < 640; y += 8) for (let x = 0; x < 1200; x += 8) {
      const density = .06 + .1 * (Math.sin(x * .009 + y * .015) + 1) / 2;
      background.globalAlpha = fade(x, y) * density;
      background.fillRect(x, y, .9, .9);
    }
    background.strokeStyle = "#d6b45e";
    background.lineJoin = "round";
    background.lineCap = "round";
    for (let row = 0; row < 48; row++) {
      background.beginPath();
      background.lineWidth = row % 6 === 0 ? .95 : .6;
      background.globalAlpha = row % 6 === 0 ? .22 : .13;
      if (variant === "sound") {
        // Cache continuous cubic curves, rather than visibly angular samples of
        // the tighter sound waves. Matching tangents keep every join smooth.
        const v = row / 47, segments = 120, step = 1 / segments, epsilon = .00001;
        const slope = (u: number) => (contourY(variant, u + epsilon, v) - contourY(variant, u - epsilon, v)) / (2 * epsilon);
        background.moveTo(0, contourY(variant, 0, v));
        for (let col = 1; col <= segments; col++) {
          const start = (col - 1) / segments, end = col / segments;
          background.bezierCurveTo((start + step / 3) * 1200,
            contourY(variant, start, v) + slope(start) * step / 3,
            (end - step / 3) * 1200,
            contourY(variant, end, v) - slope(end) * step / 3,
            end * 1200, contourY(variant, end, v));
        }
      } else {
        for (let col = 0; col <= 60; col++) {
          const x = col * 20, y = contourY(variant, col / 60, row / 47);
          if (col === 0) background.moveTo(x, y); else background.lineTo(x, y);
        }
      }
      background.stroke();
    }
    // A baked radial fade merges lines into the page, with no per-frame filter.
    background.globalCompositeOperation = "destination-in";
    const mask = background.createRadialGradient(600, 320, 30, 600, 320, 650);
    mask.addColorStop(0, "#fff"); mask.addColorStop(1, "#fff0");
    background.globalAlpha = 1; background.fillStyle = mask;
    background.fillRect(-offsetX / scale, -offsetY / scale, width / scale, height / scale);
    if (edgeFade !== "radial") {
      // Fade the cached art only. A CSS mask on the whole plane would hide the
      // pointer origin and make a wave appear to start somewhere else.
      const edge = edgeFade === "vertical"
        ? background.createLinearGradient(0, -offsetY / scale, 0, (height - offsetY) / scale)
        : background.createLinearGradient(-offsetX / scale, 0, (width - offsetX) / scale, 0);
      edge.addColorStop(0, "#fff0");
      if (edgeFade === "vertical") { edge.addColorStop(.3, "#fff"); edge.addColorStop(.75, "#fff"); }
      else edge.addColorStop(.65, "#fff");
      edge.addColorStop(1, "#fff0");
      background.fillStyle = edge;
      background.fillRect(-offsetX / scale, -offsetY / scale, width / scale, height / scale);
    }
    background.globalCompositeOperation = "source-over";
    draw(0);
  }
  function draw(now: number) {
    context!.setTransform(1, 0, 0, 1, 0, 0);
    context!.clearRect(0, 0, width, height);
    // One cached image gently breathes; no paths are rebuilt or moved.
    context!.globalAlpha = reduced ? 1 : .89 + .11 * Math.sin(now * .00085);
    context!.drawImage(base, 0, 0);
    context!.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    context!.textAlign = "center"; context!.textBaseline = "middle";
    waves = waves.filter(wave => now - wave.born < 950);
    const phase = reduced ? 0 : now;
    for (const point of points) {
      let strength = 0;
      for (const wave of waves) {
        const age = (now - wave.born) / 950;
        const distance = Math.hypot(point.x - wave.x, point.y - wave.y);
        strength = Math.max(strength, Math.exp(-Math.pow((distance - age * 210) / 27, 2)) * (1 - age));
      }
      const breath = .7 + .3 * Math.sin(phase * .00065 + point.seed);
      const location = edgeFade === "vertical" ? (point.y * scale + offsetY) / height : (point.x * scale + offsetX) / width;
      const edge = edgeFade === "radial" ? 1 : Math.max(0, Math.min(1,
        location / (edgeFade === "vertical" ? .3 : .65), (1 - location) / (edgeFade === "vertical" ? .25 : .35)));
      context!.globalAlpha = Math.min(1, point.fade * point.opacity * breath * .8 * edge + strength * .8);
      context!.fillStyle = strength > .12 ? "#fae6af" : "#d6b45e";
      context!.font = `${point.size}px monospace`;
      const letter = strength > .12 ? scrambled[(point.seed + Math.floor(phase / 65)) % scrambled.length]
        : letters[Math.min(3, Math.floor((Math.sin(point.seed * .43 + phase * .00065) + 1) * 1.99))];
      const drift = reduced ? 0 : Math.sin(phase * .0004 + point.band) * 3;
      context!.fillText(letter, point.x + drift, point.y);
    }
    context!.fillStyle = "#d6b45e";
    for (const wave of waves) {
      const age = (now - wave.born) / 950;
      // A small center glint anchors feedback to the pointer, even where the
      // ambient contour symbols are sparse. The rest expands out from that point.
      if (age < .15) {
        context!.globalAlpha = .65 * (1 - age / .15);
        context!.fillRect(wave.x - .75, wave.y - .75, 1.5, 1.5);
      }
      context!.font = "8px monospace";
      for (let i = 0; i < 40; i++) {
        const angle = i / 40 * Math.PI * 2, radius = age * 210;
        const x = wave.x + Math.cos(angle) * radius, y = wave.y + Math.sin(angle) * radius;
        const edge = Math.max(0, Math.min(1, Math.min(x * scale + offsetX, width - x * scale - offsetX,
          y * scale + offsetY, height - y * scale - offsetY) / 24));
        context!.globalAlpha = (1 - age) * .5 * edge;
        if (i % 5 === 0 && age > .06) context!.fillText(scrambled[(i + Math.floor(now / 80)) % scrambled.length], x, y);
        else context!.fillRect(x - .75, y - .75, 1.5, 1.5);
      }
    }
    context!.globalAlpha = 1;
  }
  return {
    resize,
    setActive(value: boolean, prefersReduced: boolean) {
      active = value; reduced = prefersReduced;
      if (!active || reduced) { waves = []; draw(0); }
    },
    pointer(x: number, y: number, now: number) {
      if (!active || reduced || now - lastPointer < 32) return;
      lastPointer = now;
      waves.push({ x: (x * width - offsetX) / scale, y: (y * height - offsetY) / scale, born: now });
      if (waves.length > 4) waves.shift();
      draw(now); // First response is immediate; it does not wait for an idle timer.
    },
    tick(now: number) { if (active && !reduced) draw(now); },
    get running() { return active && !reduced; },
    get interactive() { return waves.length > 0; },
    dispose() { active = false; waves = []; canvas.width = base.width = 1; canvas.height = base.height = 1; },
  };
}
