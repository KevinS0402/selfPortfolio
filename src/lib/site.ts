/** Public identity shared by metadata, canonical URLs, and structured data. */
export const site = {
  url: "https://kevinsong.dev",
  name: "Kevin Song",
  title: "Kevin Song | Vanderbilt CS & Ingram Scholar",
  description: "Kevin Song is a Vanderbilt University computer science student, Ingram Scholar, and software engineering and product intern at Elysian.",
  personId: "https://kevinsong.dev/#kevin-song",
  websiteId: "https://kevinsong.dev/#website",
  profiles: ["https://github.com/KevinS0402", "https://www.linkedin.com/in/kevinsong0402/", "https://ksongfire.com/"],
} as const;

export const pageInfo = {
  engineering: { title: "Software Engineering & AI Projects", path: "/engineering/", description: "Explore Kevin Song’s software engineering and AI projects, including SongSearch, SignLect, and Canary.ai, plus product and engineering experience at Elysian." },
  impact: { title: "Ingram Scholar & Community Impact", path: "/impact/", description: "Kevin Song’s service as a Vanderbilt Ingram Scholar: DevelopIT STEM education, an MNPS / Save The Music initiative, and Vanderbilt Recording Studio leadership." },
  about: { title: "About – Vanderbilt & KSONG", path: "/about/", description: "Meet Kevin Song, a Vanderbilt computer science student and Ingram Scholar who builds software, creates opportunities, and makes bilingual music as KSONG." },
} as const;

export const absoluteUrl = (path: string) => new URL(path, site.url).href;

// Vercel provides this built-in value; no new user-managed keys are required.
// A local static production build remains indexable for Firebase or Vercel production.
export const isSearchIndexable = process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
