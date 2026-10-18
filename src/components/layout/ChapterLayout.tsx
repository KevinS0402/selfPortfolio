import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { PointerSurface } from "@/components/ui/HeroInteraction";
import { ChapterScenery } from "@/components/ui/ChapterScenery";
import { ContourField } from "@/components/ui/ContourField";

export function ChapterHero({title,subtitle,children,space=0,emphasis,label}:{title:string;subtitle:string;children?:ReactNode;space?:0|1|2;emphasis?:string;label?:string}) {
  return <PointerSurface className={`chapter-hero journey-chapter-hero journey-atmosphere-${space}`}><ContourField variant={space===0?"circuit":space===1?"community":"sound"}/><div className="container journey-chapter-grid"><div><Link href="/#explore" className="back-link"><Arrow direction="left"/>All chapters</Link>{label&&<p className="mono-label">{label}</p>}<h1>{title}{emphasis&&<em>{emphasis}</em>}</h1><p className="chapter-subtitle">{subtitle}</p>{children}</div><ChapterScenery space={space}/></div></PointerSurface>;
}
export function ChapterNext({href,label,previous,kind="chapter"}:{href:string;label:string;previous?:{href:string;label:string};kind?:"chapter"|"project"|"home"}) {
  return <Reveal><nav className="chapter-next container" aria-label="Continue exploring">{previous&&<Link href={previous.href} className="previous-chapter"><Arrow direction="left"/>{previous.label}</Link>}<Link href={href} className="next-chapter"><span>{kind==="home"?"Full circle":`Next ${kind}`}</span><strong>{label}</strong><Arrow/></Link></nav></Reveal>;
}
