export type ContourVariant = "terrain" | "circuit" | "community" | "sound";

export function contourY(variant: ContourVariant, u: number, v: number) {
  const envelope = Math.sin(v * Math.PI);
  const peak = Math.exp(-Math.pow((u - .43) * 4.8, 2));
  const ripple = Math.sin(u * 9 + v * 3) * 55 + Math.sin(u * 17 - v * 4) * 16;
  return variant === "sound"
    ? 80 + v * 480 + Math.sin(u * 46) * peak * envelope * 90
    : 90 + v * 470 + (ripple - peak * 100) * envelope;
}

const hash = (seed: number) => ((Math.imul(seed + 17, 1597334677) ^ Math.imul(seed + 53, 3812015801)) >>> 0) / 4294967295;

/** Stable, irregular samples follow the same terrain as the contour paths. */
export function contourGlyphs(variant: ContourVariant) {
  return Array.from({ length: 48 * 43 }, (_, seed) => {
    const row = Math.floor(seed / 43), col = seed % 43;
    const u = (col + .5 + (hash(seed * 7) - .5) * .65) / 43;
    const v = (row + .5) / 48;
    const density = .13 + .25 * Math.pow((Math.sin(u * 11 + v * 5) + 1) / 2, 2);
    const fade = Math.pow(Math.sin(u * Math.PI) * Math.sin(v * Math.PI), .8);
    return { seed, band: Math.min(2, Math.floor(row / 16)), x: Number((u * 1200).toFixed(2)), y: Number((contourY(variant, u, v) + (hash(seed * 13) - .5) * 5).toFixed(2)), opacity: Number((fade * (.22 + hash(seed * 3) * .48)).toFixed(3)), size: Number((7 + hash(seed * 11) * 3).toFixed(1)), visible: hash(seed) < density * fade };
  }).filter(point => point.visible);
}
