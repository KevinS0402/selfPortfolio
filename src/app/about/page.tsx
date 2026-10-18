import { StructuredData } from "@/components/ui/StructuredData";
import { pageInfo, site } from "@/lib/site";
import { pageStructuredData } from "@/lib/structuredData";
import Image from "next/image";
import { ContactForm } from "@/components/sections/ContactForm";
import { pageMetadata } from "@/lib/pageMetadata";
import { ChapterHero, ChapterNext } from "@/components/layout/ChapterLayout";
import { Reveal } from "@/components/ui/Reveal";
import { MusicJourney } from "@/components/ui/MusicJourney";
import { TiltVisual } from "@/components/ui/HeroInteraction";
import { ArtMotif } from "@/components/ui/ArtMotif";

export const metadata = pageMetadata(pageInfo.about.title, pageInfo.about.description, pageInfo.about.path);
const moments = [
  { title: "About me", motif: "campus" as const, text: "Hi, I’m Kevin! I study computer science with a business minor at Vanderbilt University. I’m an Ingram Scholar, connecting ideas, people, and resources to build useful products and create opportunities for others." },
  { title: "Currently in New York", motif: "city" as const, text: "I’m spending this semester at Vanderbilt’s NYC campus while working across product and engineering at Elysian, and learning from the startup and technology community." },
  { title: "Building with people", motif: "classroom" as const, text: "I’m interested in how technical ideas become useful products, and how communities create opportunities for others. Service is part of that story, from DevelopIT to music education." },
];
export default function About() {
  return <div className="about-chapter"><StructuredData data={pageStructuredData({ path: pageInfo.about.path, name: `${pageInfo.about.title} | ${site.name}`, description: pageInfo.about.description, type: "ProfilePage", breadcrumbs: [{ name: "About", path: pageInfo.about.path }] })}/><ChapterHero title="About" label="03 / About" space={2} subtitle="A little beyond the résumé: the parts that don’t fit on a one-page PDF."/>
    <section className="container about-story" aria-label="Kevin’s story"><ol className="personal-waypoints">{moments.map((moment,i)=><li key={moment.title}><span className="chapter-number">0{i+1}</span><Reveal><h2>{moment.title}</h2><p>{moment.text}</p><TiltVisual>{i===0?<div className="vanderbilt-identity"><ArtMotif world={moment.motif} className="waypoint-art"/><Image src="/brands/vanderbilt.svg" alt="Vanderbilt University" width={91} height={65}/></div>:<ArtMotif world={moment.motif} className="waypoint-art"/>}</TiltVisual></Reveal></li>)}</ol></section>
    <MusicJourney/><ContactForm/><ChapterNext href="/" label="Back home" kind="home" previous={{href:"/impact/",label:"Impact"}}/>
  </div>;
}
