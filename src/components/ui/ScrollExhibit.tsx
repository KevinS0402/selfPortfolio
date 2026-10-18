"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useJourney } from "./useJourney";
import { ContourField } from "./ContourField";
import { ExhibitSymbol } from "./ExhibitSymbol";
import { Arrow } from "./Arrow";
import type { ArchitectureStep } from "@/data/journey";

export function ScrollExhibit({title,description,name,steps,href,linkLabel="Explore the case study",kind="steps",variant="circuit"}:{title:string;description:string;name:string;steps:ArchitectureStep[];href?:string;linkLabel?:string;kind?:"steps"|"themes";variant?:"circuit"|"community"|"sound"|"practice"}) {
  const {ref,stage,select}=useJourney(steps.length);
  const panel=useId();
  const wireMask = `${panel.replace(/[^a-zA-Z0-9_-]/g, "")}-wires`;
  const [covers, setCovers] = useState<{x:number;y:number;width:number;height:number}[]>([]);
  useEffect(() => {
    const root = ref.current;
    const wire = root?.querySelector<SVGSVGElement>(".exhibit-wires");
    const icons = [...(root?.querySelectorAll<HTMLElement>(".exhibit-node-art") ?? [])];
    if (!root || !wire) return;
    function measure() {
      const box = wire!.getBoundingClientRect();
      if (!box.width || !box.height) return;
      setCovers(icons.map(icon => {
        const bounds = icon.getBoundingClientRect();
        // Include the full hover/selection movement without masking the background.
        const pad = 18;
        return { x:(bounds.left-box.left-pad)/box.width*1000, y:(bounds.top-box.top-pad)/box.height*180, width:(bounds.width+pad*2)/box.width*1000, height:(bounds.height+pad*2)/box.height*180 };
      }));
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root); icons.forEach(icon => observer.observe(icon));
    measure();
    return () => observer.disconnect();
  }, [ref, steps.length]);
  return <div ref={ref} className={`scroll-sequence exhibit-sequence exhibit-${variant}`} data-stage={stage}>
    <section className="sequence-pin container" aria-label={`${name} exploration`}>
      <div className="exhibit-heading"><h2>{title}</h2><p>{description}</p></div>
      <div className="exhibit-canvas">
        <ContourField variant={variant === "practice" ? "circuit" : variant}/><div className="exhibit-name">{name}</div>
        <svg className="exhibit-wires" data-mask-ready={covers.length > 0} viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true"><defs><mask id={wireMask} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="180"><rect width="1000" height="180" fill="white"/>{covers.map((cover,index)=><rect key={index} {...cover} rx="8" fill="black"/>)}</mask></defs><g mask={`url(#${wireMask})`}><path d="M50 90 C220 90 200 20 350 90 S600 160 650 90 S820 20 950 90"/><path className="wire-lit" d="M50 90 C220 90 200 20 350 90 S600 160 650 90 S820 20 950 90" pathLength="1"/></g></svg>
        <ol className="exhibit-nodes" aria-label={`${name} ${kind}`}>{steps.map((step,index)=><li key={step.title}>
          <button type="button" aria-pressed={stage===index} aria-controls={panel} onClick={()=>select(index)}>
            <span className="exhibit-node-art"><ExhibitSymbol index={index} variant={variant}/></span><span className="exhibit-number">0{index+1}</span><strong>{step.title}</strong>
          </button>
        </li>)}</ol>
        <div id={panel} className="exhibit-explanations">{steps.map((step,index)=><article key={step.title} className={`glass-note liquid-glass exhibit-explanation ${stage===index?"is-active":""}`}><span>{step.detail}</span><p>{step.explanation}</p></article>)}</div>
      </div>
      <div className="sequence-bottom"><p className="sequence-instructions"><span className="scroll-instruction">Scroll to follow the connections. </span>Select a {kind === "themes" ? "theme" : "step"} to take a closer look.</p>{href&&<Link className="text-link" href={href}>{linkLabel}<Arrow/></Link>}</div>
      <div className="sequence-track" aria-hidden="true"><span/></div>
    </section>
  </div>;
}
