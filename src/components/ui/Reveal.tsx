"use client";

import { useReducedMotion } from "./useMotionPreference";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({children,className="",delay=0,variant="rise",eager=false}:{children:ReactNode;className?:string;delay?:number;variant?:"rise"|"left"|"right"|"unfold"|"turn";eager?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  const visible=useInView(ref,{once:true,amount:.12,margin:"0px 0px -8% 0px"});
  const reduced=useReducedMotion();
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  return <div ref={ref} className={`reveal reveal-${variant} ${ready && !reduced && !eager ? "is-ready" : ""} ${visible || reduced || eager ? "is-revealed" : ""} ${className}`} style={{animationDelay:`${Math.min(delay,.12)}s`}}>{children}</div>;
}
