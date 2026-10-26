import { media } from "@/data/media";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";
import "./art.css";
import "./universe.css";
import "./arrival.css";
import "./pointer.css";
import "./worlds.css";
import "./contact.css";
import { PortfolioAnalytics } from "@/components/analytics/PortfolioAnalytics";
import "./journey.css";
import "./living.css";
import { SiteJourney } from "@/components/ui/SiteJourney";
import { SiteCursor } from "@/components/ui/SiteCursor";
import { StructuredData } from "@/components/ui/StructuredData";
import { siteStructuredData } from "@/lib/structuredData";
import { isSearchIndexable, site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const siteUrl = site.url;
const description = site.description;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), title: { default: site.title, template: "%s | Kevin Song" }, description,
  robots: { index: isSearchIndexable, follow: true },
  authors: [{ name: "Kevin Song", url: siteUrl }], creator: "Kevin Song", alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: media.faviconLight, type: "image/png" },
      { url: media.faviconLight, type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: media.faviconDark, type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
  },
  openGraph: { title: site.title, description, url: siteUrl, siteName: "Kevin Song", type: "website", locale: "en_US", images: [{ url: media.socialImage, width: media.socialWidth, height: media.socialHeight, alt: media.socialAlt }] },
  twitter: { card: "summary_large_image", title: site.title, description, images: [{ url: media.socialImage, alt: media.socialAlt }] },
};
export const viewport: Viewport = { themeColor: "#09090B" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body className={inter.variable}><StructuredData data={siteStructuredData} /><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main id="main-content" tabIndex={-1}><SiteJourney>{children}</SiteJourney></main><SiteFooter /><SiteCursor /><PortfolioAnalytics enabled={process.env.VERCEL_ENV === "production" || process.env.POSTHOG_LOCAL_TEST === "1"} environment={process.env.VERCEL_ENV === "production" ? "production" : "test"}/>{process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production" && <Analytics />}</body></html>;
}
