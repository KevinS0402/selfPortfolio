import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { featuredProjects } from "@/data/journey";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/engineering/", "/impact/", "/about/", ...featuredProjects.map(project => `/work/${project.slug}/`)].map(path => ({ url: `${site.url}${path}` }));
}
