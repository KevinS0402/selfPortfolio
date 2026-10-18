"use client";

import { useReducedMotion } from "./useMotionPreference";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import type { ArchitectureStep } from "@/data/journey";
import { Arrow } from "@/components/ui/Arrow";

export function Architecture({steps,compact=false,name}:{steps:ArchitectureStep[];compact?:boolean;name:string}) {
  const [selected,setSelected]=useState(0);
  const panelId=useId();
  const reduced=useReducedMotion();
  return <div className={`architecture-explorer ${compact ? "architecture-compact" : ""}`}>
    <p className="architecture-hint">Select a step to explore the system.</p>
    <ol className="architecture" aria-label={`${name} architecture`}>{steps.map((step,i) => <li className={`architecture-step ${selected===i ? "is-selected" : ""}`} key={step.title}>
      <button className="architecture-node" type="button" aria-pressed={selected===i} aria-controls={panelId} onClick={()=>setSelected(i)}><span className="architecture-number">0{i+1}</span><strong>{step.title}</strong></button>{i<steps.length-1 && <Arrow />}
    </li>)}</ol>
    <div id={panelId} className="architecture-detail liquid-glass" aria-live="polite" aria-atomic="true"><motion.div key={selected} initial={false} animate={reduced ? undefined : {y:[6,0],opacity:[.7,1]}} transition={{duration:.25}}><span>{steps[selected].detail}</span><p>{steps[selected].explanation}</p></motion.div></div>
  </div>;
}
