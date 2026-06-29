import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = "https://kevinsong.dev";
const seoTitle = "Kevin Song | Vanderbilt Computer Science Student, AI Builder";
const seoDescription =
  "Kevin Song is a Vanderbilt University Computer Science student, Ingram Scholar, software engineer, and AI builder sharing a portfolio of AI, accessibility, and product-focused software.";

const publicIdentityLinks = Array.from(
  new Set([
    profile.links.github,
    profile.links.linkedin,
    ...projects.flatMap((project) => project.links?.map((link) => link.href) ?? []),
  ]),
);

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#profile-page`,
    url: siteUrl,
    name: "Kevin Song Portfolio",
    description: seoDescription,
    mainEntity: {
      "@type": "Person",
      "@id": `${siteUrl}/#kevin-song`,
      name: profile.name,
      url: siteUrl,
      image: `${siteUrl}${profile.profileImage}`,
      description: seoDescription,
      jobTitle: "Software Engineer and AI Builder",
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: profile.university,
        url: "https://www.vanderbilt.edu/",
      },
      award: "Vanderbilt Ingram Scholar",
      knowsAbout: [
        "Computer Science",
        "Software Engineering",
        "Artificial Intelligence",
        "Accessibility Technology",
        "Product Management",
        "Vanderbilt Ingram Scholarship",
      ],
      sameAs: publicIdentityLinks,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Kevin Song Portfolio",
    description: seoDescription,
    publisher: {
      "@id": `${siteUrl}/#kevin-song`,
    },
  },
];

const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003c");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: "%s | Kevin Song",
  },
  description: seoDescription,
  keywords: [
    "Kevin Song",
    "Vanderbilt",
    "Vanderbilt University",
    "Vanderbilt Ingram Scholar",
    "computer science",
    "software engineer",
    "AI",
    "product",
    "accessibility technology",
    "portfolio",
  ],
  authors: [{ name: "Kevin Song", url: "https://kevinsong.dev" }],
  creator: "Kevin Song",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: siteUrl,
    siteName: "Kevin Song Portfolio",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 1600,
        alt: "Portrait of Kevin Song",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: ["/profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataJson }}
        />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
