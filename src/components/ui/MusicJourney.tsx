"use client";
import { useJourney } from "./useJourney";
import { Reveal } from "./Reveal";
import { ContourField } from "./ContourField";
import { Arrow } from "./Arrow";
import { CreativeOrbit } from "./CreativeOrbit";

export function MusicJourney() {
  const {ref}=useJourney();
  return <div ref={ref} className="scroll-sequence music-sequence"><section className="sequence-pin container" aria-labelledby="music-heading">
    <ContourField variant="sound"/>
    <Reveal stagger className="music-heading"><h2 id="music-heading">Same Kevin.<br/><em>Another voice.</em></h2><p>Two languages. A sound of my own.</p></Reveal>
    <div className="music-score" aria-hidden="true"><span>EN</span><svg viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0 100h1000"/>{Array.from({length:91},(_,i)=>{const height=8+Math.abs(Math.sin(i*.81)*Math.cos(i*.18))*150;return <path key={i} d={`M${i*11+5} ${(100-height/2).toFixed(2)}v${height.toFixed(2)}`}/>;})}</svg><span lang="zh-Hans">中文</span></div>
    <div className="music-detail ksong-section"><div><h3><span>KSONG</span> <em className="ksong-chinese-name" lang="zh-Hans">宋凯文</em></h3><p>I write, record, and produce original music in English and Chinese as KSONG. I also direct and edit music videos and promotional media across release campaigns. The work brings together creative direction, production, and storytelling across cultures.</p><a className="text-link" href="https://ksongfire.com/" target="_blank" rel="noreferrer">Visit KSONG<Arrow direction="external"/></a></div><div className="music-constellation"><CreativeOrbit/></div></div>
    <div className="sequence-track" aria-hidden="true"><span/></div>
  </section></div>;
}
