import { StructuredData } from "@/components/ui/StructuredData";
import { pageInfo, site } from "@/lib/site";
import { pageStructuredData, engineeringList } from "@/lib/structuredData";
import { pageMetadata } from "@/lib/pageMetadata";
import Link from "next/link";
import { ChapterHero, ChapterNext } from "@/components/layout/ChapterLayout";
import { Architecture } from "@/components/ui/Architecture";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { ArtMotif } from "@/components/ui/ArtMotif";
import { TiltVisual } from "@/components/ui/HeroInteraction";
import { ExperienceVisual } from "@/components/ui/ExperienceVisual";
import { ScrollExhibit } from "@/components/ui/ScrollExhibit";
import { engineeringThemes, experiences, featuredProjects } from "@/data/journey";

export const metadata = pageMetadata(pageInfo.engineering.title, pageInfo.engineering.description, pageInfo.engineering.path);
export default function Engineering() {
  return <div className="engineering-chapter"><StructuredData data={pageStructuredData({ path: pageInfo.engineering.path, name: `${pageInfo.engineering.title} | ${site.name}`, description: pageInfo.engineering.description, type: "CollectionPage", mainEntity: engineeringList, breadcrumbs: [{ name: "Engineering", path: pageInfo.engineering.path }] })}/>
    <ChapterHero title="What I build." emphasis="How I think." label="01 / Engineering" space={0} subtitle="The projects, experiments, and decisions behind the work."><p className="mono-label chapter-role">Currently: Product &amp; Engineering at Elysian</p></ChapterHero>
    <ScrollExhibit title="A peek inside my brain." description="The ideas I keep coming back to, across projects and experience. Take a peek. Stay as long as you like." name="Music / accessibility / applied AI / web products" steps={engineeringThemes} variant="practice" kind="themes" href="#selected-work" linkLabel="See the projects"/>

    <section className="container section-block" aria-labelledby="selected-work"><div className="section-heading"><h2 id="selected-work">Selected work</h2><p>From music analysis to computer vision and emergency information.</p></div><div className="project-list">{featuredProjects.map((project, index) => <Reveal variant={index % 2 ? "right" : "left"} key={project.slug} delay={index * 0.05}><article className={`project-row ${project.secondary ? "project-secondary" : ""}`}><div className="project-overview"><h3><Link href={`/work/${project.slug}/`}>{project.title}<Arrow direction="external" /></Link></h3><p className="project-purpose">{project.purpose}</p>{!project.secondary && <TiltVisual><ArtMotif world={project.motif} className="project-identity-art" /></TiltVisual>}<div className="tag-list">{project.stack.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}</div><div className="project-actions"><Link className="text-link" href={`/work/${project.slug}/`}>Explore the case study<Arrow /></Link>{project.secondary && project.links.filter(link => link.label === "Devpost").map(link => <a key={link.href} className="text-link" href={link.href} target="_blank" rel="noreferrer">View on Devpost<Arrow direction="external"/></a>)}</div></div>{project.secondary ? <p className="project-secondary-note">A VandyHacks experiment in conversational interfaces. I led the team and worked on the frontend and prompt integration.</p> : <Reveal variant="unfold"><Architecture steps={project.architecture} name={project.title} compact /></Reveal>}</article></Reveal>)}</div></section>
    <section className="container section-block" aria-labelledby="experience"><div className="section-heading"><h2 id="experience">Experience</h2><p>Product thinking, applied AI, and the work behind the interface.</p></div><div className="experience-list">{experiences.map(experience => <Reveal variant="unfold" key={experience.name}><details className="experience-row"><summary><span className="experience-name">{experience.name}{experience.current && <span className="current-label">Current</span>}</span><span className="experience-focus">{experience.position}<span className="experience-category">{experience.focus}</span>{experience.dates && <span className="experience-dates">{experience.dates}</span>}</span><span className="expand-mark" aria-hidden="true" /></summary><div className="experience-detail"><ExperienceVisual name={experience.name} /><div className="experience-body"><p>{experience.description}</p><p>{experience.detail}</p><div className="tag-list">{experience.skills.map(skill => <span key={skill}>{skill}</span>)}</div>{experience.link && <a className="text-link" href={experience.link.href} target="_blank" rel="noreferrer">{experience.link.label}<Arrow direction="external" /></a>}</div></div></details></Reveal>)}</div></section>

    <ChapterNext href="/impact/" label="Impact" previous={{ href: "/", label: "All chapters" }} />
  </div>;
}
