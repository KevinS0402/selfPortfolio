import type { CSSProperties } from "react";
import type { Motif } from "./ArtMotif";

type Icon = "code" | "chip" | "chart" | "globe" | "people" | "book" | "notes" | "bulb";
const icons: Partial<Record<Motif, Icon[]>> = {
  engineering: ["code", "chip", "chart", "globe"],
  impact: ["people", "book", "notes", "bulb"],
};

function Glyph({ name }: { name: Icon }) {
  switch (name) {
    case "code": return <path d="m-5-7-7 7 7 7m10-14 7 7-7 7M2-10l-4 20" />;
    case "notes": return <><path d="M-4 6V-9l14-3V3M-4-5l14-3" /><ellipse cx="-8" cy="7" rx="4" ry="3" /><ellipse cx="6" cy="4" rx="4" ry="3" /></>;
    case "chart": return <path d="M-11-10v21h23M-7 5l6-7 6 3 6-10" />;
    case "chip": return <><rect x="-7" y="-7" width="14" height="14" rx="2" /><path d="M-4-7v-5M4-7v-5M-4 7v5M4 7v5M-7-4h-5M-7 4h-5M7-4h5M7 4h5" /></>;
    case "globe": return <><circle r="12" /><ellipse rx="5" ry="12" /><path d="M-12 0h24M-10-6h20M-10 6h20" /></>;
    case "book": return <path d="M0-8q-7-6-13-3V10q7-3 13 3 6-6 13-3V-11Q7-14 0-8ZM0-8v21" />;
    case "people": return <><circle cy="-6" r="4" /><path d="M-8 12V7q0-7 8-7t8 7v5M-11-7a3 3 0 0 0 0 6M11-7a3 3 0 0 1 0 6M-15 9V4q0-5 6-5M15 9V4q0-5-6-5" /></>;
    case "bulb": return <path d="M-4 7C-4 1-10 1-10-5a10 10 0 0 1 20 0c0 6-6 6-6 12ZM-4 11H4M-2 15H2" />;
  }
}

export function MotifSatellites({ world }: { world: Motif }) {
  const selected = icons[world];
  if (!selected) return null;
  return <g className="motif-satellites" transform="translate(160 85)">
    {selected.map((name, index) => {
      const radius = (154 + index * 19) * (world === "impact" ? 1.2 : 1);
      const angle = [-18, 10, -7, 23][index];
      const duration = 7 + index;
      const phase = duration * (index / 4 + .125);
      const style = { "--orbit-duration": `${duration}s`, "--orbit-phase": `-${phase}s` } as CSSProperties;
      return <g key={name} style={style} transform={`rotate(${angle}) scale(1 .24)`}>
        <circle className="planet-orbit-line" r={radius} vectorEffect="non-scaling-stroke" />
        <g className="motif-orbit-track"><g transform={`translate(${radius} 0)`}>
          <g className="motif-orbit-depth"><g className="motif-orbit-counter"><g transform={`scale(1 4.166667) rotate(${-angle})`}>
            <circle r="22" fill="var(--background)" stroke="var(--rule)" />
            <g className="motif-orbit-icon" transform="scale(.8)"><Glyph name={name} /></g>
          </g></g></g>
        </g></g>
      </g>;
    })}
  </g>;
}
