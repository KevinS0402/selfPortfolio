import { StructuredData } from "@/components/ui/StructuredData";
import { pageInfo, site } from "@/lib/site";
import { pageStructuredData, impactList } from "@/lib/structuredData";
import { pageMetadata } from "@/lib/pageMetadata";
import { ChapterHero, ChapterNext } from "@/components/layout/ChapterLayout";
import { ScrollExhibit } from "@/components/ui/ScrollExhibit";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Arrow";
import { ArtMotif } from "@/components/ui/ArtMotif";
import { TiltVisual } from "@/components/ui/HeroInteraction";
import { chapters, impactInitiatives } from "@/data/journey";

export const metadata = pageMetadata(pageInfo.impact.title, pageInfo.impact.description, pageInfo.impact.path);
export default function Impact() {
  return <div className="impact-chapter"><StructuredData data={pageStructuredData({ path: pageInfo.impact.path, name: `${pageInfo.impact.title} | ${site.name}`, description: pageInfo.impact.description, type: "CollectionPage", mainEntity: impactList, breadcrumbs: [{ name: "Impact", path: pageInfo.impact.path }] })}/><ChapterHero title="I like building things." emphasis="I also care about who gets to build them." label="02 / Impact" space={1} subtitle="From pro-bono computer science lessons to tools for music educators and a student-run recording studio, my service and leadership work creates spaces for others to learn and make things."/>
    <ScrollExhibit title="A thread worth following." description="Different spaces. A shared belief in access, education, and the things people can make together." name="Code / classrooms / creative community" variant="community" steps={impactInitiatives.map(item=>({title:item.title,detail:item.context,explanation:item.summary}))}/>
    <section className="container impact-stories" aria-label="Community initiatives">{impactInitiatives.map((initiative,i) => <Reveal variant={i % 2 ? "right" : "left"} key={initiative.title} delay={i*.06}><article className="impact-story" id={`initiative-${i+1}`}><div className="impact-story-visual"><span className="chapter-outline" aria-hidden="true">0{i+1}</span><TiltVisual><ArtMotif world={initiative.motif} /></TiltVisual></div><div className="impact-story-content"><p className="mono-label">{initiative.context}</p><h2>{initiative.title}</h2><p className="initiative-summary">{initiative.summary}</p><div className="initiative-contributions">{initiative.details.map(p=><p key={p}>{p}</p>)}</div><div className="source-links">{initiative.links.map(link => <a key={link.href} className="text-link" href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow direction="external" /></a>)}</div></div></article></Reveal>)}</section><ChapterNext href={chapters[2].href} label={chapters[2].title} previous={{href:"/",label:"All chapters"}} /></div>;
}
