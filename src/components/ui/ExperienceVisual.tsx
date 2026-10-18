import Image from "next/image";
import { ArtMotif, type Motif } from "./ArtMotif";
import { TiltVisual } from "./HeroInteraction";

const visuals: Record<string, { logo: string; width: number; height: number; motif: Motif; caption: string }> = {
  Elysian: { logo: "elysian.svg", width: 146, height: 54, motif: "claims", caption: "User discovery → product → engineering" },
  NIST: { logo: "nist.svg", width: 158, height: 23, motif: "research", caption: "Simulation → analysis → visualization" },
  "Handshake MOVE": { logo: "handshake.svg", width: 48, height: 48, motif: "evaluation", caption: "Human judgment → model evaluation" },
  "Ivy Journey": { logo: "ivy-journey.png", width: 160, height: 72, motif: "browser", caption: "Design → AI assistance → business growth" },
};

export function ExperienceVisual({ name }: { name: string }) {
  const visual = visuals[name];
  if (!visual) return null;
  return <div className={`experience-visual experience-brand-${visual.motif}`}>
    <div className="organization-mark"><Image src={`/brands/${visual.logo}`} alt={`${name === "Handshake MOVE" ? "Handshake" : name} logo`} width={visual.width} height={visual.height} />{name === "Handshake MOVE" && <span>Handshake</span>}</div>
    <TiltVisual><ArtMotif world={visual.motif} /></TiltVisual>
    <span className="visual-caption">{visual.caption}</span>
  </div>;
}
