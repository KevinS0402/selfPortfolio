import { media } from "@/data/media";
import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} | ${site.name}`;
  const image = { url: absoluteUrl(media.socialImage), width: media.socialWidth, height: media.socialHeight, alt: media.socialAlt };
  return {
    title, description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: fullTitle, description, url: absoluteUrl(path), siteName: site.name, locale: "en_US", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}
