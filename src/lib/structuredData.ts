import { featuredProjects, impactInitiatives, type FeaturedProject } from "@/data/journey";
import { absoluteUrl, site } from "./site";

type Entity = Record<string, unknown>;
const person = { "@id": site.personId };

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person", "@id": site.personId, name: site.name,
      alternateName: ["KSONG", "宋凯文"], url: absoluteUrl("/"), image: absoluteUrl("/profile.jpg"),
      description: site.description,
      mainEntityOfPage: { "@id": absoluteUrl("/about/#webpage") },
      affiliation: { "@type": "CollegeOrUniversity", name: "Vanderbilt University", url: "https://www.vanderbilt.edu/" },
      memberOf: { "@type": "Organization", name: "Ingram Scholars Program", url: "https://www.vanderbilt.edu/ingram/" },
      award: "Vanderbilt Ingram Scholarship",
      worksFor: { "@type": "Organization", name: "Elysian" },
      sameAs: [...site.profiles],
    },
    { "@type": "WebSite", "@id": site.websiteId, url: absoluteUrl("/"), name: site.name, alternateName: "Kevin Song Portfolio", inLanguage: "en", publisher: person },
  ],
};

export function projectEntity(project: FeaturedProject): Entity {
  return { "@type": "CreativeWork", "@id": absoluteUrl(`/work/${project.slug}/#project`), name: project.title,
    description: project.summary, url: absoluteUrl(`/work/${project.slug}/`), contributor: person,
    about: project.stack, ...(project.links.length ? { citation: project.links.map(link => link.href) } : {}) };
}

export const engineeringList = {
  "@type": "ItemList", "@id": absoluteUrl("/engineering/#projects"), name: "Kevin Song’s engineering projects",
  itemListElement: featuredProjects.map((project, index) => ({ "@type": "ListItem", position: index + 1, item: projectEntity(project) })),
};
export const impactList = {
  "@type": "ItemList", "@id": absoluteUrl("/impact/#initiatives"), name: "Kevin Song’s community initiatives",
  itemListElement: impactInitiatives.map((initiative, index) => ({ "@type": "ListItem", position: index + 1,
    item: { "@type": "CreativeWork", name: initiative.title, description: initiative.summary, url: absoluteUrl(`/impact/#initiative-${index + 1}`), contributor: person } })),
};

export function pageStructuredData({ path, name, description, type = "WebPage", mainEntity = person, breadcrumbs = [], extraNodes = [] }: {
  path: string; name: string; description: string; type?: "WebPage" | "ProfilePage" | "CollectionPage";
  mainEntity?: Entity; breadcrumbs?: { name: string; path: string }[]; extraNodes?: Entity[];
}) {
  const url = absoluteUrl(path);
  const trail = [{ name: "Home", path: "/" }, ...breadcrumbs];
  return { "@context": "https://schema.org", "@graph": [
    { "@type": type, "@id": `${url}#webpage`, url, name, description, inLanguage: "en",
      isPartOf: { "@id": site.websiteId }, about: person, author: person, mainEntity,
      ...(breadcrumbs.length ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}) },
    ...(breadcrumbs.length ? [{ "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: trail.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: absoluteUrl(crumb.path) })) }] : []),
    ...extraNodes,
  ] };
}
