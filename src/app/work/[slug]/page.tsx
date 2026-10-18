import { StructuredData } from "@/components/ui/StructuredData";
import { pageStructuredData, projectEntity } from "@/lib/structuredData";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMetadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredProjects, type CaseStudySection } from "@/data/journey";
import { Arrow } from "@/components/ui/Arrow";
import { ScrollExhibit } from "@/components/ui/ScrollExhibit";
import { ChapterNext } from "@/components/layout/ChapterLayout";
import { ArtMotif } from "@/components/ui/ArtMotif";
import { Reveal } from "@/components/ui/Reveal";
import { PointerSurface } from "@/components/ui/HeroInteraction";
import { ContourField } from "@/components/ui/ContourField";

export const dynamicParams = false;
export function generateStaticParams() { return featuredProjects.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
function ProjectSection({ section }: { section: CaseStudySection }) {
  return <Reveal variant="unfold"><section className="container section-block case-section"><div className="case-heading"><h2>{section.title}</h2></div><div className="prose">{section.paragraphs.map(p => <p key={p}>{p}</p>)}</div></section></Reveal>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = featuredProjects.find(project => project.slug === slug);
  return project ? pageMetadata(`${project.title} Case Study`, project.summary, `/work/${slug}/`) : { title: "Project not found" };
}
export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const index = featuredProjects.findIndex(project => project.slug === slug);
  if (index < 0) notFound();
  const project = featuredProjects[index];
  const next = featuredProjects[(index + 1) % featuredProjects.length];
  const titleParts = project.slug === "songsearch" ? ["Song", "Search"] : project.slug === "signlect" ? ["Sign", "Lect"] : project.slug === "canary-ai" ? ["Canary", ".ai"] : ["AI", "Health"];
  const openingSections = ["What I built", "Purpose & audience"].flatMap(title => project.sections.filter(section => section.title === title));
  const remainingSections = project.sections.filter(section => !openingSections.includes(section));
  const futureDirections: Record<string,string> = {
    "aihealth": "The original team proposed refining usability and design, hosting a public version, and exploring a mobile app. These remain possible directions rather than completed features.",
    "songsearch": "Explore how the analysis compares with feedback from musicians and producers, while keeping the individual signals understandable. Creative judgment should stay part of the workflow.",
    "signlect": "Evaluate a broader range of signing styles and classroom conditions on the target hardware. Further development could improve dataset coverage without treating sign detection as full ASL translation.",
    "canary-ai": "Further evaluate source freshness, location relevance, and notification reliability across different emergency conditions, keeping the underlying sources visible to users.",
  };
  return <>
    <StructuredData data={pageStructuredData({ path: `/work/${project.slug}/`, name: `${project.title} Case Study | Kevin Song`, description: project.summary, mainEntity: { "@id": projectEntity(project)["@id"] }, extraNodes: [projectEntity(project)], breadcrumbs: [{ name: "Engineering", path: "/engineering/" }, { name: project.title, path: `/work/${project.slug}/` }] })}/>
    <PointerSurface className="chapter-hero case-hero journey-case-hero"><ContourField variant="circuit"/><ArtMotif world={project.motif} className="case-hero-motif" /><div className="container chapter-hero-inner"><Link href="/engineering/" className="back-link"><Arrow direction="left" />Engineering</Link><h1>{titleParts[0]}<em>{titleParts[1]}</em></h1><p className="chapter-subtitle">{project.summary}</p><div className="case-meta"><span>{project.role}</span><span>{project.stack.join(" · ")}</span></div></div></PointerSurface>
    {openingSections.map(section => <ProjectSection key={section.title} section={section} />)}
    <ScrollExhibit title="Under the hood." description="Follow the architecture, one connection at a time." name={`${project.title} / architecture`} steps={project.architecture}/>
    {remainingSections.map(section => <ProjectSection key={section.title} section={section} />)}
    <Reveal><section className="container section-block case-section"><div className="case-heading"><h2>What’s next</h2></div><div className="prose"><p className="future-context">Possible directions for further development.</p><p>{futureDirections[project.slug]}</p></div></section></Reveal>
    <Reveal variant="unfold"><section className="container section-block case-section source-section"><div className="case-heading"><h2>Explore the source</h2><ArtMotif world="engineering" /></div><div>{project.privateNote && <p>{project.privateNote}</p>}<div className="source-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-link">{link.label}<Arrow direction="external" /></a>)}{project.links.length === 0 && <a href="mailto:kevin.song.1@vanderbilt.edu?subject=SignLect%20walkthrough" className="text-link">Request a walkthrough<Arrow direction="external" /></a>}</div></div></section></Reveal>
    <ChapterNext kind="project" href={`/work/${next.slug}/`} label={next.title} previous={{ href: "/engineering/", label: "All engineering work" }} />
  </>;
}
