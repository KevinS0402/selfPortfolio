import { useId, type CSSProperties } from "react";
import { AsciiRipple } from "./AsciiRipple";
import { contourY } from "./contourGeometry";

export function ContourField({ variant = "terrain", className = "" }: { variant?: "terrain" | "circuit" | "community" | "sound"; className?: string }) {
  const id = useId().replace(/:/g, "");
  const paths = Array.from({ length: 48 }, (_, row) => {
    const points = Array.from({ length: 101 }, (_, col) => {
      const x = col * 12;
      const u = col / 100;
      const v = row / 47;
      const y = contourY(variant, u, v);
      return `${col === 0 ? "M" : "L"}${x},${y.toFixed(2)}`;
    }).join(" ");
    return <path key={row} d={points} pathLength="1" className={row % 6 === 0 ? "contour-major" : undefined} />;
  });
  return <svg className={`contour-field contour-${variant} ${className}`} viewBox="0 0 1200 640" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id={`${id}-light`}><stop offset="0" stopColor="white" /><stop offset="1" stopColor="black" /></radialGradient>
      <mask id={`${id}-mask`}><rect width="1200" height="640" fill={`url(#${id}-light)`} /></mask>
      <pattern id={`${id}-dots`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="currentColor" /></pattern>
      <mask id={`${id}-dither-flow`}><ellipse className="dither-blob dither-blob-one" cx="320" cy="360" rx="340" ry="205" fill={`url(#${id}-light)`}/><ellipse className="dither-blob dither-blob-two" cx="840" cy="280" rx="310" ry="220" fill={`url(#${id}-light)`}/></mask>
    </defs>
    <g className="contour-response"><g mask={`url(#${id}-mask)`}><rect width="1200" height="640" fill={`url(#${id}-dots)`} opacity=".14" /><rect className="contour-dither-cloud" width="1200" height="640" fill={`url(#${id}-dots)`} mask={`url(#${id}-dither-flow)`}/><g className="contour-flow">{[0,1,2].map(band=><g key={band} className={`contour-lines contour-band contour-band-${band}`}>{paths.slice(band*16,(band+1)*16)}</g>)}</g><AsciiRipple variant={variant}/><g className="contour-travelers">{[0,1,2].map(index=><circle key={index} r="2" style={{"--particle-index":index} as CSSProperties}/>)}</g></g></g>
  </svg>;
}
