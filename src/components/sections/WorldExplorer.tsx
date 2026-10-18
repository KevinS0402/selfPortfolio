"use client";

import { useReducedMotion } from "@/components/ui/useMotionPreference";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { WorldModel, type WorldIndex } from "@/components/ui/WorldModel";
import { chapters, featuredProjects, impactInitiatives } from "@/data/journey";
import { Reveal } from "@/components/ui/Reveal";
import { ContourField } from "@/components/ui/ContourField";
import { useJourney } from "@/components/ui/useJourney";
import { Arrow } from "@/components/ui/Arrow";

const spaces = chapters.map((chapter, index) => ({ ...chapter,
  description: ["Music, accessibility, applied AI, and useful web products. Different problems, plenty to explore.", "Teaching, building, and making room for more people to join in.", "Vanderbilt, New York, and songs in two languages. A few of the things that make me, me."][index],
  links: index === 0 ? featuredProjects.filter(p => !p.secondary).map(p => ({title:p.title,href:`/work/${p.slug}/`})) : index === 1 ? impactInitiatives.map((p,i)=>({title:p.title,href:`/impact/#initiative-${i+1}`})) : [{title:"KSONG",href:"https://ksongfire.com/"},{title:"A little about me",href:"/about/"},{title:"Let’s talk",href:"/about/#contact-form"}],
}));

export function WorldExplorer() {
  const {ref,stage,select,preview} = useJourney(3);
  const mobileScroller = useRef<HTMLDivElement>(null);
  const selectedSpace = useRef(stage);
  const reduced = useReducedMotion();
  const space = spaces[stage];
  const [announcement,setAnnouncement]=useState("");
  selectedSpace.current = stage;
  function selectSpace(index:number,scroll=true) {
    select(index);
    setAnnouncement(`Previewing ${spaces[index].label}. Follow the chapter link to explore.`);
    const scroller=mobileScroller.current;
    if(scroll && scroller?.clientWidth) scroller.scrollTo({left:index*scroller.clientWidth,behavior:reduced?"auto":"smooth"});
  }
  useEffect(()=>{
    const scroller=mobileScroller.current;
    if(!scroller)return;
    let previousWidth=0;
    const observer=new ResizeObserver(()=>{
      if(previousWidth===scroller.clientWidth)return;
      previousWidth=scroller.clientWidth;
      scroller.scrollTo({left:selectedSpace.current*previousWidth,behavior:"instant"});
    });
    observer.observe(scroller);return()=>observer.disconnect();
  },[]);
  return <div ref={ref} id="explore" className="scroll-sequence world-sequence" data-stage={stage}>
    <Reveal as="header" stagger className="container journey-world-heading"><p className="mono-label">Explore Kevin’s world</p><h2 id="world-heading">Start anywhere.<br /><em>See how it all connects.</em></h2><p id="world-instructions"><span className="world-desktop-hint">Scroll to discover. Hover a room to preview. Follow a link to explore.</span><span className="world-mobile-hint">Swipe to preview. Follow a link to explore.</span></p></Reveal>
    <section className="sequence-pin" aria-labelledby="world-heading">
      <ContourField className="world-contours" />
      <div className="container world-sequence-inner">

        <div className="journey-landmarks" data-cursor="world">
          <div ref={mobileScroller} className="world-mobile-scroller" role="region" aria-roledescription="carousel" aria-label="Kevin’s worlds" aria-describedby="world-instructions" tabIndex={0} onScroll={event=>{
            const el=event.currentTarget;if(el.clientWidth)selectSpace(Math.max(0,Math.min(2,Math.round(el.scrollLeft/el.clientWidth))),false);
          }} onKeyDown={event=>{
            const keys:Record<string,number>={ArrowRight:Math.min(stage+1,2),ArrowLeft:Math.max(stage-1,0),Home:0,End:2};
            if(event.key in keys){event.preventDefault();selectSpace(keys[event.key]);}
          }}>{spaces.map((item,i)=><div key={item.label} className="world-mobile-scene" role="group" aria-roledescription="slide" aria-label={`${i+1} of 3: ${item.label}`} />)}</div>
          <WorldModel mode="overview" space={stage as WorldIndex} onSelect={selectSpace} onPreview={preview} />
          <nav className="journey-world-links" aria-label="Chapters">{spaces.map((item,i)=><div key={item.label} className={i===stage?"is-selected":""} onPointerEnter={event=>{if(event.pointerType==="mouse")preview(i);}} onPointerLeave={()=>preview(null)}>
            <button type="button" aria-label={`Preview ${item.label}`} aria-pressed={stage===i} aria-controls="world-detail" onFocus={()=>preview(i)} onBlur={()=>preview(null)} onClick={()=>selectSpace(i)}><span>{item.number}</span><span className="preview-dot" aria-hidden="true" /></button>
            <Link href={item.href}><span>{item.label}<small>{["Software + AI","People + access","Life + music"][i]}</small></span><Arrow /></Link>
          </div>)}</nav>
        </div>
        <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
        <div className="journey-world-detail" id="world-detail">
          <div key={space.label} className="world-description preview-text-arrival"><span className="mono-label">{space.number} / {space.label}</span><h3>{space.label === "Engineering" ? "What I build. How I think." : space.label === "Impact" ? "Make room for more." : "A little beyond the résumé."}</h3><p>{space.description}</p></div>
          <div className="glass-note liquid-glass world-index"><span className="mono-label">Inside {space.label}</span>{space.links.map(link=><Link key={link.title} href={link.href} target={link.href.startsWith("https:")?"_blank":undefined} rel={link.href.startsWith("https:")?"noreferrer":undefined}>{link.title}<Arrow direction={link.href.startsWith("https:")?"external":"right"} /></Link>)}<Link className="world-destination" href={space.href}>Explore {space.label}<Arrow /></Link></div>
        </div>
        <div className="sequence-track" aria-hidden="true"><span /></div>
      </div>
    </section>
  </div>;
}
