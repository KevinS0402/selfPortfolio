import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kevinsong.dev"),
  title: {
    default: "Kevin Song | Software Engineer, AI Builder, Product Thinker",
    template: "%s | Kevin Song",
  },
  description:
    "Kevin Song is a Vanderbilt Computer Science student building AI products, accessibility technology, full-stack software, and user-centered tools.",
  keywords: [
    "Kevin Song",
    "Vanderbilt",
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
    title: "Kevin Song | Software Engineer, AI Builder, Product Thinker",
    description:
      "Vanderbilt Computer Science student building AI products, accessibility technology, full-stack software, and user-centered tools.",
    url: "https://kevinsong.dev",
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
    title: "Kevin Song | Software Engineer, AI Builder, Product Thinker",
    description:
      "Vanderbilt Computer Science student building AI products, accessibility technology, full-stack software, and user-centered tools.",
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
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
